---
phase: 04-sales-bot-trade-fix
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/automation/sell-item-verification.js
autonomous: true
requirements:
  - SALES-01
must_haves:
  truths:
    - "The trade confirmation sequence fires steps 4a → 4b → 4c → 4d in order, each only starting after the previous step's element was found and clicked"
    - "Calling stop() while a trade confirmation is in progress cancels all pending intervals and timeouts — no further button clicks fire"
    - "Calling start() a second time (or resetForNextTrade()) does not spawn a second monitoring loop on top of the first"
    - "Every selector lookup emits a console.log so a miss is visible in the console without guesswork"
  artifacts:
    - path: "src/automation/sell-item-verification.js"
      provides: "_waitForAndClick helper + sequential chain + re-entry guard + _monitoringActive guard + fixed clearAllTimeouts"
      contains: "_tradeConfirmInProgress"
  key_links:
    - from: "step4_ConfirmTrade()"
      to: "_startSequentialTradeConfirm()"
      via: "_tradeConfirmInProgress guard then delegation"
      pattern: "_tradeConfirmInProgress"
    - from: "_waitForAndClick()"
      to: "this.stepTimeouts"
      via: "this.stepTimeouts.set(intervalId, intervalId)"
      pattern: "stepTimeouts\\.set"
    - from: "clearAllTimeouts()"
      to: "all live intervals"
      via: "clearInterval + clearTimeout on every entry in this.stepTimeouts"
      pattern: "clearInterval.*clearTimeout"
---

<objective>
Replace the parallel interval mess in checkTradeConfirmationSteps() with a sequential callback chain, fix Stop cancellation so all timers are actually tracked, and add a re-entry guard to startStepMonitoring() so a second start() call cannot spawn a parallel loop.

Purpose: Phase 4 success criteria — trade confirms without stalling, Stop cancels everything, second start is safe.
Output: Refactored src/automation/sell-item-verification.js with three bugs fixed and diagnostic logging at every selector lookup.
</objective>

<execution_context>
@C:/Users/oresp/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/oresp/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-sales-bot-trade-fix/04-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add _waitForAndClick helper and replace checkTradeConfirmationSteps with sequential chain</name>
  <files>src/automation/sell-item-verification.js</files>
  <action>
    Make four targeted edits to sell-item-verification.js. Do NOT restructure any other methods.

    **Edit 1 — Add two new instance fields in the constructor** (after line 9, `this.stepTimeouts = new Map();`):

    ```javascript
    this._tradeConfirmInProgress = false;  // re-entry guard for step 4
    this._monitoringActive = false;        // re-entry guard for startStepMonitoring
    ```

    **Edit 2 — Replace startStepMonitoring() (lines 211–228):**

    Replace the entire method body with:

    ```javascript
    startStepMonitoring() {
        if (!this.isRunning) return;
        if (this._monitoringActive) {
            console.warn('[SellItemVerification] startStepMonitoring() called while already active — ignoring duplicate start');
            return;
        }
        this._monitoringActive = true;

        const monitor = () => {
            if (!this.isRunning) {
                this._monitoringActive = false;
                return;
            }

            try {
                this.executeCurrentStep();
            } catch (error) {
                console.error(`Error in step ${this.currentStep}:`, error);
                this.logError(error);
            }

            setTimeout(monitor, this.settings.stepCheckInterval);
        };

        monitor();
    }
    ```

    **Edit 3 — Replace step4_ConfirmTrade() and checkTradeConfirmationSteps() (lines 829–893):**

    Replace both methods with the following four methods. Insert them in place of the two removed methods:

    ```javascript
    // Step 4: Trade Confirmation — entry point called by executeCurrentStep every 2000ms
    step4_ConfirmTrade() {
        console.log('[step4_ConfirmTrade] called, isSteamPage:', this.isSteamPage(), '_tradeConfirmInProgress:', this._tradeConfirmInProgress);

        if (!this.isSteamPage()) {
            console.log('[step4_ConfirmTrade] Not on Steam page — skipping');
            return;
        }

        if (this._tradeConfirmInProgress) {
            console.log('[step4_ConfirmTrade] Trade confirm already in progress — skipping duplicate call');
            return;
        }

        this._tradeConfirmInProgress = true;
        console.log('[step4_ConfirmTrade] Starting sequential trade confirmation chain');
        this._startSequentialTradeConfirm();
    }

    // Launches the sequential step chain: 4a → 4b → 4c → 4d
    _startSequentialTradeConfirm() {
        // Step 4a: wait for ready-status element, then step 4b
        this._waitForAndClick('#you_notready', 'step-4a (#you_notready)', 2000, () => {
            // Step 4b: wait for green confirm button, then step 4c
            this._waitForAndClick('.btn_green_steamui.btn_medium', 'step-4b (.btn_green_steamui.btn_medium)', 1500, () => {
                // Step 4c: wait for Make Offer button, then step 4d
                this._waitForAndClick('#trade_confirmbtn', 'step-4c (#trade_confirmbtn)', 1000, () => {
                    // Step 4d: wait for OK span — use ID 'trade_area_error' as fallback, but span text is primary
                    this._waitForAndClickOkSpan('step-4d (OK span)', 500, () => {
                        console.log('[trade-confirm] All 4 steps complete — marking currentStep = complete');
                        this._tradeConfirmInProgress = false;
                        this.currentStep = 'complete';
                    });
                });
            });
        });
    }

    // Generic sequential step: poll for selector, store interval handle, click on find, call onComplete
    _waitForAndClick(selector, label, clickDelay, onComplete) {
        const maxAttempts = 30; // 30 × 300ms = 9 seconds max
        let attempts = 0;

        console.log(`[_waitForAndClick] Waiting for ${label} (max ${maxAttempts} attempts @ 300ms)`);

        const intervalId = setInterval(() => {
            attempts++;
            const el = document.querySelector(selector);
            console.log(`[_waitForAndClick] attempt ${attempts}/${maxAttempts} — selector "${selector}" found:`, !!el);

            if (el) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.log(`[_waitForAndClick] Found ${label} — clicking after ${clickDelay}ms delay`);
                const clickTimerId = setTimeout(() => {
                    el.click();
                    this.logStep(`Clicked ${label}`, el);
                    console.log(`[_waitForAndClick] Clicked ${label} — invoking onComplete`);
                    onComplete();
                }, clickDelay);
                this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.warn(`[_waitForAndClick] Timed out waiting for ${label} after ${attempts} attempts — trade chain halted`);
                this._tradeConfirmInProgress = false;
            }
        }, 300);

        this.stepTimeouts.set(intervalId, intervalId);
    }

    // Step 4d: find a <span> with exact text "OK" and click it (or its parent)
    _waitForAndClickOkSpan(label, clickDelay, onComplete) {
        const maxAttempts = 30;
        let attempts = 0;

        console.log(`[_waitForAndClickOkSpan] Waiting for ${label}`);

        const intervalId = setInterval(() => {
            attempts++;
            const okSpan = Array.from(document.querySelectorAll('span'))
                .find(el => el.textContent.trim() === 'OK');
            console.log(`[_waitForAndClickOkSpan] attempt ${attempts}/${maxAttempts} — OK span found:`, !!okSpan);

            if (okSpan) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.log(`[_waitForAndClickOkSpan] Found OK span — clicking after ${clickDelay}ms delay`);
                const clickTimerId = setTimeout(() => {
                    okSpan.click();
                    if (okSpan.parentElement) {
                        okSpan.parentElement.click();
                        console.log('[_waitForAndClickOkSpan] Also clicked parent of OK span');
                    }
                    this.logStep(`Clicked ${label}`, okSpan);
                    console.log(`[_waitForAndClickOkSpan] Clicked ${label} — invoking onComplete`);
                    onComplete();
                }, clickDelay);
                this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.warn(`[_waitForAndClickOkSpan] Timed out waiting for ${label} — trade chain halted`);
                this._tradeConfirmInProgress = false;
            }
        }, 300);

        this.stepTimeouts.set(intervalId, intervalId);
    }
    ```

    **Edit 4 — Replace clearAllTimeouts() (lines 960–963):**

    ```javascript
    clearAllTimeouts() {
        console.log(`[clearAllTimeouts] Cancelling ${this.stepTimeouts.size} tracked timers/intervals`);
        this.stepTimeouts.forEach((id) => {
            clearInterval(id);
            clearTimeout(id); // safe to call both — no-op if wrong type
        });
        this.stepTimeouts.clear();
        this._tradeConfirmInProgress = false; // reset re-entry guard
        this._monitoringActive = false;       // reset monitoring guard
    }
    ```

    After all edits, verify the file has no duplicate method names for startStepMonitoring, step4_ConfirmTrade, checkTradeConfirmationSteps, or clearAllTimeouts. The old checkTradeConfirmationSteps method must be gone — it is fully replaced by _startSequentialTradeConfirm, _waitForAndClick, and _waitForAndClickOkSpan.
  </action>
  <verify>
    Run `npm run build` from the project root. Build must complete with exit code 0 and produce dist/index.bundle.js.

    Then grep the output file to confirm key patterns are present:
    - `grep "_tradeConfirmInProgress" dist/index.bundle.js` — must return at least one match
    - `grep "_monitoringActive" dist/index.bundle.js` — must return at least one match
    - `grep "stepTimeouts.set" dist/index.bundle.js` — must return at least one match (intervals being stored)
    - `grep "checkTradeConfirmationSteps" dist/index.bundle.js` — must return ZERO matches (old method gone)

    Also confirm the source file has no syntax errors by checking that the build did not emit any parse errors.
  </verify>
  <done>
    Build passes. dist/index.bundle.js contains _tradeConfirmInProgress, _monitoringActive, and stepTimeouts.set. checkTradeConfirmationSteps is absent from the bundle. The three parallel waitAndClick calls from the original lines 864–871 are gone.
  </done>
</task>

</tasks>

<verification>
After task completes:
1. `npm run build` exits 0
2. `grep -c "_tradeConfirmInProgress" dist/index.bundle.js` returns > 0
3. `grep -c "checkTradeConfirmationSteps" dist/index.bundle.js` returns 0
4. `grep -c "stepTimeouts.set" dist/index.bundle.js` returns > 0

Manual smoke-test checklist (done on next live Steam trade session):
- Open browser console before starting trade
- Confirm "[_waitForAndClick] Waiting for step-4a" appears (not three simultaneous "Waiting for" lines)
- Confirm step-4b log only appears after step-4a click log
- Click Stop during trade — confirm no further "[_waitForAndClick]" log lines appear
</verification>

<success_criteria>
SALES-01 addressed:
1. Sequential — step 4b only starts in the onComplete callback of step 4a; step 4c only starts after 4b; step 4d only after 4c. No parallel setInterval loops.
2. Stop works — clearAllTimeouts() now iterates a populated stepTimeouts Map and cancels every live interval and timeout. _tradeConfirmInProgress resets to false.
3. Re-entry safe — _tradeConfirmInProgress guard prevents step4_ConfirmTrade() re-entry from the 2000ms outer loop. _monitoringActive guard prevents startStepMonitoring() parallel loops.
4. Diagnostic logging — every selector lookup emits console.log with found:true/false so selector misses are immediately visible.
</success_criteria>

<output>
After completion, create `.planning/quick/2-phase-4-sales-bot-trade-fix/2-SUMMARY.md` with:
- What was changed (4 edits to sell-item-verification.js)
- New methods added (_startSequentialTradeConfirm, _waitForAndClick, _waitForAndClickOkSpan)
- Guards added (_tradeConfirmInProgress, _monitoringActive)
- Build verification result
</output>
