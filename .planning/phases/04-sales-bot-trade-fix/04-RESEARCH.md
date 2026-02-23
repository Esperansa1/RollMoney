# Phase 4: Sales Bot Trade Fix - Research

**Researched:** 2026-02-23
**Domain:** Browser userscript — Steam trade confirmation state machine, interval/timer management
**Confidence:** HIGH (all findings sourced directly from the codebase)

---

## Summary

The sales bot trade flow lives entirely in `src/automation/sell-item-verification.js` (`SellItemVerification` class). The Steam-side confirmation is handled by `step4_ConfirmTrade()` which immediately delegates to `checkTradeConfirmationSteps()`. That function launches THREE independent `setInterval` loops simultaneously — one for each DOM selector (`#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn`) — plus a fourth `setTimeout` for an "OK" span. All four timers start at the same moment regardless of whether earlier steps have completed. This is the primary cause of stalling: the bot may click the "Make Offer" button before the trade is in a ready state, and the click lands on nothing, so the trade never sends.

The `stop()` handler does exist and sets `isRunning = false` and calls `clearAllTimeouts()`, but `clearAllTimeouts()` only clears entries in `this.stepTimeouts` (a `Map`). The intervals created inside `checkTradeConfirmationSteps()` are raw local variables inside the `waitAndClick` closure — they are NEVER stored in `this.stepTimeouts` or any instance variable. Calling `stop()` cannot cancel them. They will keep firing until their `maxAttempts` is exhausted (~6 seconds each) or until the element appears and is clicked.

The parallel-loops-on-second-start bug arises because `startStepMonitoring()` has no guard beyond `if (!this.isRunning) return` at entry. If `start()` is called twice without an intervening `stop()`, two recursive-`setTimeout` polling loops run simultaneously. `AutomationManager.startAutomation()` does guard against double-start for the wrapper status, but if the automation is in `'stopped'` state (after `stop()` was called), a second `start()` is allowed immediately without checking whether the prior `checkTradeConfirmationSteps()` intervals are still alive.

**Primary recommendation:** Replace the three simultaneous `setInterval` loops in `checkTradeConfirmationSteps()` with a sequential async chain where each step only begins after the previous step's DOM condition is satisfied and clicked. Store every interval handle in `this.stepTimeouts` so `clearAllTimeouts()` actually cancels them on `stop()`.

---

## File and Function Map

### Primary file
**`src/automation/sell-item-verification.js`** — the entire sales bot / trade confirmation code.

| Method | Line range (approx.) | Role |
|--------|----------------------|------|
| `constructor()` | 4–23 | Creates `this.stepTimeouts = new Map()` — the cleanup store |
| `start()` | 158–185 | Sets `isRunning`, calls `startStepMonitoring()` |
| `stop()` | 187–198 | Sets `isRunning = false`, calls `clearAllTimeouts()` — INCOMPLETE |
| `startStepMonitoring()` | 211–228 | Recursive `setTimeout` polling loop — BUG SITE 3 |
| `executeCurrentStep()` | 230–311 | Dispatches to per-step methods |
| `step4_ConfirmTrade()` | 829–839 | Entry point on Steam page — calls `checkTradeConfirmationSteps()` immediately |
| `checkTradeConfirmationSteps()` | 841–893 | **ROOT CAUSE — launches all 3 intervals + 1 timeout in parallel** |
| `clearAllTimeouts()` | 960–963 | Only clears `this.stepTimeouts` Map — does NOT clear trade intervals |
| `resetForNextTrade()` | 965–969 | Calls `this.stop(); this.start();` — restarts polling loop |

### Secondary file
**`src/market-scraper.js`** — wires UI Start/Stop buttons to `AutomationManager`.

| Method | Role |
|--------|------|
| `handleStartSellVerification()` | Calls `this.automationManager.startAutomation('sell-item-verification')` |
| `handleStopSellVerification()` | Calls `this.automationManager.stopAutomation('sell-item-verification')` |
| `checkForSteamPageAutomation()` | Auto-starts automation on Steam pages after 2-second delay |

---

## Root Cause Analysis

### Bug 1: Trade gets stuck (never completes)

**Root cause:** `checkTradeConfirmationSteps()` (lines 841–893) starts three independent `setInterval` loops and one `setTimeout` simultaneously:

```javascript
// All four fire at the same moment — no sequencing:
waitAndClick('#you_notready',           'trade confirmation', 2000);  // interval 1
waitAndClick('.btn_green_steamui.btn_medium', 'trade ready button', 6000);  // interval 2
waitAndClick('#trade_confirmbtn',       'Make Offer button', 10000); // interval 3
setTimeout(() => { /* find OK span */ }, 14000);                     // timer 4
```

Each `waitAndClick` call creates a `setInterval` that polls for its selector every 300ms. The delay argument (2000 / 6000 / 10000ms) is only the click delay after the element is found — not the start delay. All three intervals start immediately.

Consequence: if step 4b's button (`.btn_green_steamui.btn_medium`) has not been clicked yet when step 4d's interval finds `#trade_confirmbtn`, clicking the confirm button while the trade is not in a ready state causes Steam to ignore or reject it. The bot has no way to detect this; it logs "Clicked Make Offer button" and moves on, but the trade was never actually sent.

Additionally, `step4_ConfirmTrade()` is called by `executeCurrentStep()` on every polling tick (every 2000ms). Each call to `step4_ConfirmTrade()` calls `checkTradeConfirmationSteps()`, spawning a fresh set of three intervals. If the `confirm_trade` step is visited more than once by the 2-second polling loop before `currentStep` advances (which it never does — there is no state advance inside `checkTradeConfirmationSteps()`), intervals multiply.

**The `currentStep` is never advanced out of `confirm_trade` by `checkTradeConfirmationSteps()`.** The step remains `'confirm_trade'` forever, meaning the 2-second outer polling loop continues calling `checkTradeConfirmationSteps()` indefinitely.

### Bug 2: Stop doesn't cancel trade timers

**Root cause:** `clearAllTimeouts()` only iterates `this.stepTimeouts`:

```javascript
clearAllTimeouts() {
    this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
    this.stepTimeouts.clear();
}
```

The intervals created in `checkTradeConfirmationSteps()` are local variables inside the `waitAndClick` closure. They are never registered in `this.stepTimeouts`. After `stop()` is called, `this.isRunning` becomes false and the outer `startStepMonitoring` loop stops, but the three `setInterval` handles continue firing until they hit `maxAttempts` (20 × 300ms = 6 seconds each).

Furthermore, the `setTimeout` for the "OK" span (14000ms delay) is also a bare local variable — not stored, not cancellable.

### Bug 3: Second start spawns parallel loops

**Root cause:** `startStepMonitoring()` uses a recursive `setTimeout` pattern:

```javascript
startStepMonitoring() {
    if (!this.isRunning) return;  // Only guard is isRunning flag

    const monitor = () => {
        if (!this.isRunning) return;
        this.executeCurrentStep();
        setTimeout(monitor, this.settings.stepCheckInterval);  // re-queues itself
    };

    monitor();
}
```

If `start()` is called a second time (e.g., user clicks Start twice, or `resetForNextTrade()` calls `stop(); start()`), a second `monitor` closure is launched. Both closures share `this.isRunning = true`, so both pass the guard and both call `executeCurrentStep()` concurrently, doubling all interval spawning.

`AutomationManager.startAutomation()` does guard with `if (automation.status === 'running') return`, which prevents the outer manager from double-starting if status is tracked correctly. However, `stop()` sets `automation.status` to `'stopped'` in the wrapper, so a subsequent `start()` is allowed — even if trade intervals from the previous run are still alive.

---

## Interval and Timer Inventory

Everything that needs to be cancellable on `stop()`:

| Handle | Location | Stored? | Cancellable by stop()? |
|--------|----------|---------|------------------------|
| `monitor` recursive `setTimeout` | `startStepMonitoring()` | No (local closure) | YES — guarded by `if (!this.isRunning) return` |
| `interval` for `#you_notready` | `checkTradeConfirmationSteps()` / `waitAndClick` | **No** | **NO** |
| `interval` for `.btn_green_steamui.btn_medium` | `checkTradeConfirmationSteps()` / `waitAndClick` | **No** | **NO** |
| `interval` for `#trade_confirmbtn` | `checkTradeConfirmationSteps()` / `waitAndClick` | **No** | **NO** |
| `setTimeout` for OK span | `checkTradeConfirmationSteps()` | **No** | **NO** |
| `setTimeout` in `step2_ExtractItemData()` (1000ms) | `step2_ExtractItemData()` | No | NO |
| `setTimeout` in `retryExtraction()` (2000ms) | `retryExtraction()` | No | NO |
| `setTimeout` in `step3_SelectItem()` (500ms) | `step3_SelectItem()` | No | NO |
| `setTimeout` in `doubleClickElement()` (100/200ms) | `doubleClickElement()` | No | NO |
| `setTimeout` in `step2_SendItems()` (5000ms) | `step2_SendItems()` | No | NO |

The `this.stepTimeouts` Map exists but is never written to anywhere in the file. It is populated only by `clearAllTimeouts()` (reading), never by any setter. It is always empty.

**All intervals and timeouts created during a trade run are orphaned.**

---

## Architecture Patterns

### Current (broken) pattern — parallel polling

```javascript
// checkTradeConfirmationSteps() — current code
checkTradeConfirmationSteps() {
    const waitAndClick = (selector, label, delay = 1000) => {
        let attempts = 0;
        const interval = setInterval(() => {       // NOT STORED
            const el = document.querySelector(selector);
            attempts++;
            if (el) {
                clearInterval(interval);
                setTimeout(() => el.click(), delay); // click delay, NOT start delay
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 300);
    };

    waitAndClick('#you_notready',                 'step 4a', 2000);  // starts now
    waitAndClick('.btn_green_steamui.btn_medium', 'step 4b', 6000);  // starts now
    waitAndClick('#trade_confirmbtn',             'step 4d', 10000); // starts now
    setTimeout(() => { /* OK span */ }, 14000);                      // starts now
    // currentStep is NEVER advanced — stays 'confirm_trade'
}
```

### Correct pattern — sequential with condition-gating

Each step should only begin after the previous step's DOM condition is satisfied AND the click has been delivered. The outer polling loop should be used to re-check progress rather than spawning new intervals. State must be advanced so `executeCurrentStep()` doesn't spawn more intervals on subsequent ticks.

```javascript
// Recommended replacement pattern (pseudocode)
step4_ConfirmTrade() {
    if (!this.isSteamPage()) return;
    if (this._tradeConfirmInProgress) return;  // guard against re-entry

    this._tradeConfirmInProgress = true;
    this._startSequentialTradeConfirm();
}

_startSequentialTradeConfirm() {
    // Step 4a: wait for #you_notready, then click
    this._waitForAndClick('#you_notready', 'ready checkbox', 2000, () => {
        // Step 4b: only after 4a clicked, wait for green button
        this._waitForAndClick('.btn_green_steamui.btn_medium', 'confirm button', 1500, () => {
            // Step 4c: only after 4b clicked, wait for make offer
            this._waitForAndClick('#trade_confirmbtn', 'make offer button', 1000, () => {
                // Step 4d: only after 4c clicked, look for OK
                this._waitForAndClick(/* OK span */, 'ok button', 500, () => {
                    this._tradeConfirmInProgress = false;
                    this.currentStep = 'complete';
                });
            });
        });
    });
}

_waitForAndClick(selector, label, clickDelay, onComplete) {
    const maxAttempts = 30;
    let attempts = 0;
    const intervalId = setInterval(() => {
        attempts++;
        const el = document.querySelector(selector);
        if (el) {
            clearInterval(intervalId);
            this._removeActiveInterval(intervalId);  // remove from tracking
            setTimeout(() => {
                el.click();
                this.logStep(`Clicked ${label}`);
                onComplete();
            }, clickDelay);
        } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            this._removeActiveInterval(intervalId);
            console.log(`Timed out waiting for ${label}`);
            this._tradeConfirmInProgress = false;
        }
    }, 300);
    this._registerActiveInterval(intervalId);  // store for cleanup
}

_registerActiveInterval(id) {
    this.stepTimeouts.set(id, id);  // reuse existing Map
}

_removeActiveInterval(id) {
    this.stepTimeouts.delete(id);
}

clearAllTimeouts() {
    this.stepTimeouts.forEach((id) => {
        clearInterval(id);
        clearTimeout(id);  // safe to call both
    });
    this.stepTimeouts.clear();
    this._tradeConfirmInProgress = false;  // reset re-entry guard on stop
}
```

### Guard against `startStepMonitoring` double-call

```javascript
startStepMonitoring() {
    if (!this.isRunning) return;
    if (this._monitoringActive) return;  // ADD THIS GUARD
    this._monitoringActive = true;

    const monitor = () => {
        if (!this.isRunning) {
            this._monitoringActive = false;  // reset when stopped
            return;
        }
        this.executeCurrentStep();
        setTimeout(monitor, this.settings.stepCheckInterval);
    };
    monitor();
}
```

---

## DOM Selectors

Confidence levels based on Steam trade offer page structure (cannot be live-verified from codebase alone):

| Selector | Purpose | Confidence | Notes |
|----------|---------|------------|-------|
| `#you_notready` | "I'm ready" checkbox status div | LOW | Steam regularly updates trade UI; this is flagged as highest-risk unknown in STATE.md |
| `.btn_green_steamui.btn_medium` | Green "Confirm trade contents" button | LOW | Class-based Steam styling — may change with UI updates |
| `#trade_confirmbtn` | "Make Trade Offer" submit button | LOW | ID-based — more stable than class selectors, but Steam has changed these before |
| `span[text="OK"]` (find via `querySelectorAll('span')`) | Post-trade success OK button | LOW | Text-search approach is fragile; Steam may wrap in different structure |

**All four DOM selectors require live verification against a current Steam trade offer page before implementation.** This is the highest-risk area of the phase. The selectors appear to come from Steam's trade offer page (`steamcommunity.com/tradeoffer/new/`).

**Verification approach:** Open a real Steam trade offer page and run in the browser console:
```javascript
console.log('you_notready:', !!document.querySelector('#you_notready'));
console.log('green btn:', !!document.querySelector('.btn_green_steamui.btn_medium'));
console.log('confirm btn:', !!document.querySelector('#trade_confirmbtn'));
```

---

## Common Pitfalls

### Pitfall 1: Re-entry from outer polling loop multiplies intervals

**What goes wrong:** `step4_ConfirmTrade()` is called every 2000ms by the outer `startStepMonitoring()` loop. Each call creates new intervals. After 10 seconds, 5 sets of 3 intervals each = 15 live intervals all trying to click the same buttons.

**How to avoid:** Set a boolean flag (`this._tradeConfirmInProgress`) at entry of `step4_ConfirmTrade()` and return immediately if it is already true. Clear the flag on completion or timeout. Also advance `currentStep` away from `'confirm_trade'` once the sequence starts.

### Pitfall 2: `stepTimeouts` Map is never written to

**What goes wrong:** The Map exists and `clearAllTimeouts()` iterates it, but no code ever writes interval/timeout IDs to it. It is always empty. `clearAllTimeouts()` does nothing useful.

**How to avoid:** Every `setInterval` and `setTimeout` call must store its handle via a helper method before returning. Use `this.stepTimeouts.set(id, id)` consistently.

### Pitfall 3: `stop(); start()` in `resetForNextTrade()` does not fully reset

**What goes wrong:** `resetForNextTrade()` is called from `completeVerification()` (which is reached from the `'complete'` step). It calls `this.stop()` then `this.start()`. Since orphaned intervals from the prior trade run may still be alive, the new run starts on top of them.

**How to avoid:** Ensure `stop()` actually cancels all timers before `start()` is called. The sequential pattern with stored handles makes this safe.

### Pitfall 4: `step4_ConfirmTrade()` never advances `currentStep`

**What goes wrong:** `checkTradeConfirmationSteps()` does not set `this.currentStep = 'complete'` or any other value. The step stays `'confirm_trade'` indefinitely. The outer polling loop keeps calling `step4_ConfirmTrade()` every 2000ms forever.

**How to avoid:** The sequential chain must set `this.currentStep = 'complete'` in the final `onComplete` callback after all buttons have been clicked.

---

## Code Examples

### Exact lines of interest in `sell-item-verification.js`

**The broken `checkTradeConfirmationSteps()` (lines 841–893):**
```javascript
checkTradeConfirmationSteps() {
    const waitAndClick = (selector, label, delay = 1000) => {
        const checkInterval = 300;
        let attempts = 0;
        const maxAttempts = 20;

        const interval = setInterval(() => {    // <-- local variable, never stored
            const el = document.querySelector(selector);
            attempts++;
            if (el) {
                clearInterval(interval);
                setTimeout(() => {
                    el.click();
                    this.logStep(`Clicked ${label}`, el);
                }, delay);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.log(`Timed out waiting for ${label}`);
            }
        }, checkInterval);
    };

    // All three start simultaneously:
    waitAndClick('#you_notready', 'trade confirmation', 2000);
    waitAndClick('.btn_green_steamui.btn_medium', 'trade ready button', 6000);
    waitAndClick('#trade_confirmbtn', 'Make Offer button', 10000);

    // Fourth timer also starts immediately:
    setTimeout(() => {
        const okSpan = Array.from(document.querySelectorAll('span'))
            .find(el => el.textContent.trim() === 'OK');
        if (okSpan) { okSpan.click(); }
    }, 14000);

    // currentStep is NEVER set here — stays 'confirm_trade'
    this.checkForTradeErrors();
}
```

**The empty `clearAllTimeouts()` (lines 960–963):**
```javascript
clearAllTimeouts() {
    this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
    this.stepTimeouts.clear();
    // stepTimeouts is always empty — nothing is ever stored in it
}
```

**`resetForNextTrade()` — safe only if stop() works correctly (lines 965–969):**
```javascript
resetForNextTrade() {
    this.stop();
    this.start();
    console.log('Reset for next trade verification');
}
```

---

## Open Questions

1. **Are the DOM selectors still valid on the current Steam trade offer page?**
   - What we know: Selectors are `#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn`
   - What's unclear: Steam last updated their trade UI at an unknown date; no live verification is possible from static code analysis
   - Recommendation: Implementer must verify selectors against a live Steam trade page before writing the sequential chain. If selectors are wrong, the sequential chain will time out at step 4a and never reach later steps — which is at least a clean failure rather than the current silent stuck state.

2. **Should `checkForSteamPageAutomation()` auto-start be guarded more carefully?**
   - What we know: It auto-starts `sell-item-verification` on any Steam page 2 seconds after load, regardless of whether URL automation data is present
   - What's unclear: The current code does this even without URL data (the URL data check for `urlState` happens in `initializeCrossPageState()` but `checkForSteamPageAutomation()` just checks `isSteamPage()`)
   - Recommendation: Out of scope for this phase but worth noting; if fixed it would prevent unexpected auto-starts

3. **Is there a race between `stopAutomation` wrapper status and live intervals?**
   - What we know: `AutomationManager.stopAutomation()` sets `automation.status = 'stopped'` then calls `automation.instance.stop()`. A subsequent `startAutomation()` call is allowed immediately.
   - What's unclear: If the prior trade's intervals are still alive when the new start fires, they will coexist with the new run
   - Recommendation: Ensure `stop()` truly cancels all intervals (the fix for Bug 2) before any `start()` is allowed

---

## Sources

### Primary (HIGH confidence)
- `src/automation/sell-item-verification.js` — full code read, all bug analysis from source
- `src/automation/automation-manager.js` — full code read, stop/start lifecycle analysis
- `src/market-scraper.js` — grep analysis, UI wiring confirmed

### Tertiary (LOW confidence)
- DOM selectors `#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn` — present in source code but not verifiable against live Steam UI without a browser session on Steam

---

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — all three bugs identified from direct code reading with clear evidence
- Fix pattern (sequential chain): HIGH — standard JavaScript async pattern, no external dependencies
- DOM selectors: LOW — cannot be verified without live Steam trade page; flagged as highest-risk in STATE.md
- `stepTimeouts` Map being unused: HIGH — grepped all writes to `stepTimeouts`; only reads exist in `clearAllTimeouts()`

**Research date:** 2026-02-23
**Valid until:** Stable until Steam updates their trade UI (DOM selectors) — code structure findings valid until files change
