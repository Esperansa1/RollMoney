# Pitfalls Research

**Domain:** Browser userscript DOM/UI/timing bug fixes — Tampermonkey automation on CSGORoll.com
**Researched:** 2026-02-22
**Confidence:** HIGH (codebase-derived) / MEDIUM (general userscript patterns)

---

## Critical Pitfalls

### Pitfall 1: Stale Closure Over Filter State in Input Event Handlers

**What goes wrong:**
A percentage filter input (e.g., `thresholdInput` in `createSniperControls`) captures `this.itemFilter` or `this.baseFilters` at construction time via an event handler closure. When the Apply button is clicked, the closure calls the old object reference or writes to a property that the filter's `filterItems()` method does not read at query time. The value appears to be "applied" (feedback shown, no error thrown) but the running scan cycle at `WithdrawalAutomation.startPeriodicScan` continues using the previous threshold because `ItemFilter.baseFilters.maxPercentageChange` was never updated.

**Why it happens:**
The UI is built inside `createSniperControls()` which runs once at overlay creation. The `applyBtn` click handler closes over `this.automationManager` and calls `marketMonitor.updatePriceThreshold()`, but no equivalent path exists for `itemFilter.updateBaseFilters({ maxPercentageChange: value })`. The two concerns — market monitor alert threshold and the withdrawal filter threshold — use separate objects (`MarketMonitor` vs `ItemFilter`) but share the same UI input. Developers assume wiring one object wires both.

**How to avoid:**
- Trace the data path end-to-end before touching any event handler: UI input → callback → which object property → which method reads that property at runtime.
- For `maxPercentageChange`: the Apply button must call `this.itemFilter.updateBaseFilters({ maxPercentageChange: parsedValue })` in addition to (or instead of) the monitor call.
- Never use a single numeric input for two different objects without explicitly writing to both.
- After applying, add a read-back assertion: log `this.itemFilter.baseFilters.maxPercentageChange` immediately after the update to confirm the property was written.

**Warning signs:**
- Apply button shows visual confirmation but the scan log still filters items at the old threshold.
- `console.log("Base filter passed:", baseFilterPassed)` in `ItemFilter.passesBaseFilter` shows unchanged pass/fail ratios after applying a new value.
- `marketMonitor.updatePriceThreshold` is called but `itemFilter.updateBaseFilters` is never called anywhere in the Apply handler.

**Fix applies to:** Fix 1 — Percentage filter inputs don't apply.

---

### Pitfall 2: Reducing Delays Eliminates the Only Reliable Synchronization Point

**What goes wrong:**
To reduce detection-to-click latency, a developer removes or shortens `setTimeout`/`waitForPageStability` calls in `attemptItemWithdrawalFast`. The item card click fires, but the modal DOM does not yet exist when `DOMObserver.waitForCondition` is invoked. Because `waitForCondition` uses `requestAnimationFrame` polling with no debounce, it spins at 60fps inside the interval callback, consuming the main thread. The modal appears, but by the time the button query runs, the item has already been purchased by another user, causing a "not joinable" error loop.

**Why it happens:**
The actual bottleneck in detection-to-click latency is the 500ms scan interval and the time between scrape start and item card `.click()`, not the post-click delays. Developers optimise the wrong part: they reduce delays after the click, which are there to wait for asynchronous Angular/React DOM rendering. The CSGORoll market page uses Angular (`ng-star-inserted` class, `mat-flat-button`); Angular renders modals asynchronously after a click event and the modal is not present in the next synchronous frame.

**How to avoid:**
- Profile first: measure elapsed time from `scrapeMarketItems()` start to `itemCard.click()` call. That is the true latency to reduce.
- Never remove post-click waits entirely; replace `setTimeout` delays with `DOMObserver.waitForElement` on the specific modal selector instead — event-driven waiting is faster than fixed delays but still waits for actual DOM readiness.
- The `waitForCondition` using `requestAnimationFrame` at line 87 of `dom-observer.js` has no cancellation token; if the outer `3000ms` timeout fires first, the rAF loop continues running as a zombie. Ensure every `waitForCondition` caller handles the rejection and does not leave the rAF loop alive.
- Keep at least one `waitForElement` on the modal container after `itemCard.click()` before querying child buttons.

**Warning signs:**
- After reducing delays, the withdrawal failure rate increases and "not joinable" errors appear more frequently.
- CPU usage spikes during scan cycles (rAF polling + setInterval overlap).
- `waitForCondition` rejection is caught but the rAF loop `check` function continues executing in the console log after the rejection.

**Fix applies to:** Fix 2 — Detection-to-click latency.

---

### Pitfall 3: Attaching Drag to the Wrong Element or Breaking the Drag Condition Check

**What goes wrong:**
In `UIComponents.createDragHandle`, the `dragStart` function checks `if (e.target === dragHandle)` at line 105. This exact-target guard means drag only works when the mouse is pressed directly on the `dragHandle` div, not on any of its children (`titleContainer`, `titleSpan`, `versionSpan`, `closeButton`). When a developer tries to make the entire overlay draggable from any point by attaching `mousedown` to `overlay` instead of `dragHandle`, two problems emerge: (1) the close button click is now also treated as a drag start because the event bubbles from `closeButton` up to `overlay`; (2) `e.stopPropagation()` on the close button prevents its own drag start but not the overlay's, causing the overlay to jump unexpectedly on close.

**Why it happens:**
The drag implementation uses `e.target === dragHandle` as a guard — a correct but brittle equality check. When making the overlay draggable, developers change the `mousedown` listener target to `overlay` but forget to update the guard to `overlay.contains(e.target) && e.target !== closeButton`. Text selection within overlay children also interferes: without `user-select: none` on the overlay itself (it is currently only on `dragHandle`), users can accidentally select text while dragging, which causes the browser's default text-drag behaviour to fire instead of the position-translate logic.

**How to avoid:**
- Change the drag guard from exact-target equality (`e.target === dragHandle`) to containment (`dragHandle.contains(e.target)`) to allow clicking child elements within the handle to start a drag.
- To allow dragging from anywhere on the overlay body, listen on `overlay` with the guard `!closeButton.contains(e.target)` to exclude the close button.
- Add `userSelect: 'none'` to `overlay` styles (not just `dragHandle`) to prevent text selection conflicts.
- Do not remove `e.stopPropagation()` from the close button's click handler — it is required to prevent the overlay's own event listeners from misfiring.
- Test drag start from: (a) the title text, (b) the version span, (c) empty space in the overlay body, (d) a button — each must behave correctly.

**Warning signs:**
- Drag works when clicking on the background of the drag handle but not on its text.
- Clicking the close button causes a brief drag displacement before the overlay closes.
- Text gets selected inside the overlay when attempting to drag.
- `overlay.style.transform` is set to a large value on a single click of a button.

**Fix applies to:** Fix 3 — Overlay drag from any point.

---

### Pitfall 4: setInterval-Based Step Polling Does Not Wait for Async DOM Operations to Complete

**What goes wrong:**
`SellItemVerification.startStepMonitoring` uses a `setTimeout(monitor, 2000)` recursive loop. Each iteration calls `executeCurrentStep()` which dispatches synchronous step functions (`step4_ConfirmTrade`, `checkTradeConfirmationSteps`). Inside `checkTradeConfirmationSteps`, multiple independent `setInterval` loops are created for each button (`#you_notready`, `.btn_green_steamui`, `#trade_confirmbtn`) with hard-coded delays (2000ms, 6000ms, 10000ms). These intervals all start simultaneously at the moment `checkTradeConfirmationSteps` is called. If `executeCurrentStep` is called a second time (on the next 2000ms loop tick) before the previous `checkTradeConfirmationSteps` has completed, a second set of identical intervals is created, causing double-clicks and race conditions on the Steam trade flow.

**Why it happens:**
The step function is not guarded against re-entry. `currentStep` is set to `'confirm_trade'` but never changed to a transitional state (e.g., `'confirming_trade_in_progress'`) before the async operations begin. The 2000ms outer monitor fires again while the inner intervals are still running, and `executeCurrentStep` sees `currentStep === 'confirm_trade'` and calls `checkTradeConfirmationSteps` again.

**How to avoid:**
- Immediately update `this.currentStep` to a transitional/locked value (`'confirm_trade_pending'`) at the very start of `step4_ConfirmTrade()`, before any async operation. Only transition out of this state when the final action completes or times out.
- Use `DOMObserver.waitForElement` (Promise-based) for each button in sequence rather than parallel `setInterval` chains. Wait for button A, click it, then wait for button B, click it. This eliminates the re-entry problem entirely.
- The untracked `setInterval` calls inside `checkTradeConfirmationSteps` are flagged in CONCERNS.md as a known issue. Store every interval/timeout reference and clear them in the `stop()` / `clearAllTimeouts()` path.
- Add a re-entry guard at the top of every step function: `if (this.currentStep !== 'expected_step') return;`.

**Warning signs:**
- Console log shows "Step 4" executing multiple times in rapid succession.
- Trade confirmation buttons are clicked twice or more (resulting in Steam "duplicate offer" errors).
- `clearAllTimeouts()` is called but some intervals still fire afterward (because they were not registered in `stepTimeouts`).
- After calling Stop, the bot still clicks buttons on the Steam page.

**Fix applies to:** Fix 4 — Sales bot stuck on trade window.

---

### Pitfall 5: MutationObserver Fires on Attribute Changes, Not Just Node Removal — Stale Items Are Detected Incorrectly

**What goes wrong:**
When checking whether market items have been purchased (and should disappear from the bot's working list), a MutationObserver watching `document.body` with `{ childList: true, subtree: true, attributes: true }` triggers on every attribute change across the entire page. The handler runs `document.querySelectorAll('.item-card')` and rebuilds the item list — but items that are "sold" on CSGORoll are not removed from the DOM immediately. Instead, they receive a CSS class change (e.g., a "sold" or "disabled" overlay class is added). The current `DataScraper.scrapeMarketItems()` queries `.item-card` without filtering out sold-state elements, so sold items reappear in the next scan cycle and are re-attempted, hitting the "not joinable" error.

**Why it happens:**
The `processedItems` Set in `DataScraper` is cleared every 5 seconds by `startAutoClear`. After clearance, sold items are re-scraped. The scraper does not check for any sold/purchased state indicator on the card, so they pass into `filterItems`. Since the DOM element still exists (the site uses CSS classes to indicate sold state, not DOM removal), `waitForElementToDisappear` on `.item-card` will never resolve for sold items.

**How to avoid:**
- Before adding any scraped item to the result set in `scrapeMarketItems()`, check for sold-state indicators. On CSGORoll the sold state is typically indicated by: a class on the card, `hasCheckedIcon: true` (already extracted in `extractItemData`), or a disabled attribute on the card's withdraw button. Exclude items where `hasCheckedIcon === true` or where the card has a sold/purchased CSS class.
- In `filterItems`, add a pre-filter step that discards items with `hasCheckedIcon === true` before applying any other filter logic.
- Do not rely on DOM removal as the signal for "item gone." Query the item's current state on every scan cycle.
- Narrow the MutationObserver scope in `waitForElement` and `waitForPageStability` to the specific market list container selector rather than `document.body`, to reduce noise from unrelated attribute changes.
- After a page refresh, `processedItems` is a new empty Set (the constructor runs fresh). This is correct. The problem is not the Set being stale — it is that sold DOM items are scraped as valid items after the Set clears.

**Warning signs:**
- After a page refresh, the bot immediately tries to withdraw items that were already sold before the refresh.
- `console.log('Filtered items:', filteredItems)` shows items with `hasCheckedIcon: true` passing through.
- `attemptItemWithdrawalFast` is called and immediately hits the "not joinable" path for those items.
- The MutationObserver callback fires hundreds of times per second during normal page activity (sign of too-broad observation scope on `document.body`).

**Fix applies to:** Fix 5 — Stale skins after page refresh.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `setInterval` status updates without interval ID storage | Simple to write | Intervals accumulate on overlay reopen; no clean stop path | Never — always store the ID |
| `document.body` as MutationObserver root with `subtree: true` | Catches all mutations | Fires on every DOM attribute change sitewide, causing observer callbacks to run hundreds of times per second | Only during initial prototyping |
| Hard-coded timeout delays in `checkTradeConfirmationSteps` | Easy sequencing | Race condition when step runs more than once; timers stack if step re-entered | Never for multi-step flows |
| Clearing `processedItems` Set on a fixed 5s interval | Prevents infinite "seen" list | Re-processes sold items that are still in DOM | Acceptable only if sold-state filtering is in place |
| Closing over `this.itemFilter` in UI callbacks | Simple wiring | Callback references can become stale if `itemFilter` is replaced; hard to trace which object is actually being written to | Acceptable if `itemFilter` is never replaced after construction |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| CSGORoll Angular DOM | Querying for elements immediately after `itemCard.click()` in the same synchronous tick | Wait for element via `DOMObserver.waitForElement` — Angular rendering is async |
| Steam Trade Page | Dispatching `dblclick` + two `click` events + `element.click()` within 200ms | Pick one method; multiple redundant events on Steam can cause double-add to trade |
| Steam Trade Confirmation flow | Assuming `#you_notready` → `.btn_green_steamui` → `#trade_confirmbtn` are always present in that order | Each step may not exist on every trade type; guard with null-check before clicking |
| Cookie-based filter persistence | Reading saved filter in `createJsonConfigSection` and calling `onLoad` via `setTimeout(200)` but `itemFilter` may not be initialized yet | Ensure `onLoad` callback path traces to a fully constructed `ItemFilter` instance before calling |
| Cross-domain URL state (CSGORoll → Steam) | Assuming `decodeDataFromUrlParams` always returns valid data; proceeding without field validation | Validate every required field (`itemName`, `inventoryPage`, `itemPosition`) before executing any step |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `requestAnimationFrame` polling loop in `waitForCondition` with no cancellation | CPU pegged at high usage during automation; rAF continues after promise rejection | Store a `cancelled` flag; check it at the start of every `check()` invocation | Immediately, at scale of 2+ concurrent `waitForCondition` calls |
| Four independent `setInterval` instances at 1000ms for status updates | UI lag when switching tabs; status grid rebuilt completely every second | Consolidate to single interval; update only changed DOM nodes | After ~30 minutes of continuous use |
| `setInterval` inside `createTradeVerificationTabContent` (line 510) that is never cleared | Interval fires even when overlay is closed | Store reference; clear in `closeOverlay()` | On second overlay open — two identical intervals now run |
| `MutationObserver` with `attributes: true` on `document.body` | Observer callback fires hundreds of times per second on a dynamic SPA page | Narrow scope to specific container; remove `attributes: true` if not needed | On any CSGORoll page with frequent Angular change detection cycles |

---

## "Looks Done But Isn't" Checklist

- [ ] **Percentage filter apply:** Verify `this.itemFilter.baseFilters.maxPercentageChange` is logged immediately after clicking Apply — value must reflect the input field value, not the initial `5.1`.
- [ ] **Drag from overlay body:** Test clicking and dragging from: (a) title text, (b) empty space in tabs area, (c) near but not on the close button — all must move the overlay.
- [ ] **Sales bot trade completion:** Verify `currentStep` is never `'confirm_trade'` when `checkTradeConfirmationSteps` is about to create a second set of intervals — check console log for duplicate "Step 4" messages.
- [ ] **Stale skin filtering:** After a page refresh, add a sold item (with `hasCheckedIcon: true`) to the market and confirm it does not appear in `filteredItems` in the console.
- [ ] **Latency fix:** Confirm that `itemCard.click()` to `withdrawButton.click()` elapsed time is measured before and after the fix — the fix must show measurable improvement at the click-path level, not just at the scan interval level.
- [ ] **Interval cleanup:** After closing and reopening the overlay (Ctrl+Shift+S twice), verify only one `updateSniperStatus` interval and one `updateSellVerificationStatus` interval are running (check via `setInterval` count or console log frequency).

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Stale closure breaks percentage filter | LOW | Re-wire Apply button handler to call `itemFilter.updateBaseFilters`; no architectural change needed |
| rAF loop zombie after failed `waitForCondition` | MEDIUM | Add `cancelled` flag to all `waitForCondition` callers; audit all call sites |
| Re-entrant `checkTradeConfirmationSteps` causing double-click | MEDIUM | Add re-entry guard at top of `step4_ConfirmTrade`; transition `currentStep` to transitional state before async ops |
| Sold items re-scraped after `processedItems` clear | LOW | Add sold-state check in `scrapeMarketItems` or as pre-filter in `filterItems` |
| Drag broken by wrong target guard | LOW | Change `e.target === dragHandle` to `dragHandle.contains(e.target)` in `dragStart` |
| Interval accumulation on overlay reopen | MEDIUM | Store all interval IDs at creation; call `clearInterval` on all stored IDs in `closeOverlay()` |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Percentage filter input not connected to `ItemFilter` | Fix 1 — Filter input binding | Log `itemFilter.baseFilters.maxPercentageChange` after Apply; confirm value changed |
| Over-optimizing wrong latency path | Fix 2 — Detection-to-click | Measure `scrapeMarketItems()` to `itemCard.click()` before and after; confirm net improvement |
| Drag handle target guard too narrow | Fix 3 — Overlay drag | Manual test dragging from 5 different points on overlay including children of drag handle |
| Re-entrant step execution in trade flow | Fix 4 — Sales bot | Confirm no duplicate "Step 4" log lines; confirm step transitions to non-re-entrant state immediately |
| Sold items passing through scraper | Fix 5 — Stale skin persistence | Confirm `hasCheckedIcon: true` items are excluded from `filteredItems` in console log |
| Interval accumulation on overlay reopen | Applies to Fix 2 and Fix 4 | After two open/close cycles verify only one instance of each status interval is running |

---

## Sources

- Codebase analysis: `src/filters/item-filter.js`, `src/automation/withdrawal-automation.js`, `src/automation/sell-item-verification.js`, `src/components/ui-components.js`, `src/utils/dom-observer.js`, `src/market-scraper.js`
- Known issues: `.planning/codebase/CONCERNS.md` (2026-02-22 audit)
- Project requirements: `.planning/PROJECT.md`
- General patterns: Tampermonkey userscript community knowledge (MEDIUM confidence), MDN MutationObserver documentation (HIGH confidence)

---
*Pitfalls research for: Browser userscript DOM/UI/timing bug fixes — RollMoney (TamirMakeMoney)*
*Researched: 2026-02-22*
