# Feature Research

**Domain:** Browser userscript automation — bug fixes for existing market sniping / sales bot system
**Researched:** 2026-02-22
**Confidence:** HIGH — based on direct codebase analysis of all relevant source files

---

## Feature Landscape

This document covers the 5 bug fixes that constitute the active milestone. Each is treated as a discrete feature-fix unit with its own expected behavior, root cause analysis, complexity estimate, and inter-fix dependencies.

---

### Fix 1: Percentage Filter Inputs Don't Apply to Filtering

**Expected Correct Behavior:**
When the user changes the percentage filter value in the UI and clicks Apply (or any input control that invokes the filter path), the updated value must be passed into `ItemFilter.baseFilters.maxPercentageChange` and must take effect on the next scan cycle. Items whose `percentageChange` exceeds the new threshold must be excluded. Items that previously would have been excluded at the old threshold but pass the new threshold must be included.

In short: UI input value → `updateBaseFilters({ maxPercentageChange: value })` → `passesBaseFilter()` uses the new value on the next `filterItems()` call.

**Root Cause (specific to this codebase):**
The UI in `src/market-scraper.js` (`createSniperControls`) renders a threshold input (`sniper-price-threshold-input`) and an "Apply" button, but the Apply handler only calls `marketMonitor.updatePriceThreshold()` on the `MarketMonitor` — it does not call `itemFilter.updateBaseFilters()` on the `ItemFilter` instance. The `ItemFilter.baseFilters.maxPercentageChange` is hard-coded at construction time (`5.1`) and is never updated from any UI event. The `WithdrawalAutomation` uses the same `ItemFilter` instance (passed at construction) but `ItemFilter.updateBaseFilters()` is never called from any UI handler, only theoretically available via the public API.

The percentage filter inputs for the sniper exist in the UI but the value captured is routed only to `MarketMonitor` (for alerting), not to `ItemFilter` (for withdrawal gating). These are two separate codepaths that both need updating.

**Common Root Cause Pattern in Browser Automation Userscripts:**
- UI event handlers wired to one subsystem while another subsystem holds the authoritative state copy
- UI state and automation state held independently with no shared source of truth
- Filter config applied via `setCustomFilterConfig` (JSON-based custom filter path) but base filter numeric parameters (`maxPercentageChange`) have no corresponding UI setter wired up
- Partial wiring: one input field serves double duty in the developer's mental model but only one half of the wiring is implemented

**Complexity:** LOW
- No architectural changes needed
- Fix is: in the "Apply" button handler in `createSniperControls`, add `this.itemFilter.updateBaseFilters({ maxPercentageChange: parseFloat(thresholdInput.value) })` alongside the existing `marketMonitor.updatePriceThreshold()` call
- Single call to an already-existing public method on an already-accessible instance

**Files Involved:**
- `src/market-scraper.js` lines ~296-311 (the `applyBtn` click handler in `createSniperControls`)
- `src/filters/item-filter.js` (the `updateBaseFilters` method — already exists, no changes needed)

---

### Fix 2: Detection-to-Click Latency (Speed)

**Expected Correct Behavior:**
After a matching item is detected by `WithdrawalAutomation`, the time between detection and the first `.click()` on the item card must be minimized. The bot must reach the withdrawal button click as fast as the DOM allows without waiting on artificial delays or polling intervals longer than necessary. The target is sub-100ms from filter match to item card click, and sub-500ms from item card click to withdraw button click.

**Root Cause (specific to this codebase):**
Three sources of added latency exist in the current code:

1. **Scan interval overhead:** `startPeriodicScan` fires every 500ms via `setInterval`. Even if an item appears 1ms after the last scan, the bot waits up to 499ms before detecting it. This is the primary latency source.

2. **`waitForCondition` polling inside `attemptItemWithdrawalFast`:** After clicking the item card, the code calls `DOMObserver.waitForCondition()` with a polling approach to find the withdraw button (timeout: 3000ms, polling interval unknown but likely at `requestAnimationFrame` or a fixed interval in `dom-observer.js`). If the modal opens in 50ms but the observer polls at 100ms intervals, this adds up to 100ms per check.

3. **`waitForPageStability` in `handleWithdrawalResultFast`:** Calls `DOMObserver.waitForPageStability(50, 3000)` — waits 50ms of DOM quiet before proceeding. This is intentional debounce but adds fixed latency.

The scan interval is the dominant source. Switching from `setInterval` polling to `MutationObserver`-based detection on the market item container would reduce detection latency from up to 499ms to near-zero.

**Common Root Cause Pattern in Browser Automation Userscripts:**
- Fixed-interval polling instead of event-driven DOM observation — the classic latency trap
- `setInterval` polling is easy to implement but blind to DOM changes between ticks
- `MutationObserver` on a scoped container (not `document.body`) is the standard fast-detection pattern in Tampermonkey scripts for market automation
- Secondary latency from condition-polling inside action handlers — `waitForCondition` should use `MutationObserver` internally, not a `setInterval` or `requestAnimationFrame` loop

**Complexity:** MEDIUM
- Replacing the scan interval with a `MutationObserver` on the market items container requires identifying the correct container selector on CSGORoll and wiring the observer correctly with a fallback interval
- The `DOMObserver.waitForCondition` utility would benefit from a `MutationObserver`-backed implementation path, but this is internal to `dom-observer.js`
- Risk: `MutationObserver` scope must be correct — too broad (document.body) causes performance degradation (already flagged in CONCERNS.md); too narrow may miss items
- The `waitForPageStability` delay of 50ms is already at the lower bound and is likely necessary for the modal to be interactive

**Files Involved:**
- `src/automation/withdrawal-automation.js` — `startPeriodicScan` method (lines 46-67), `attemptItemWithdrawalFast` (lines 134-176)
- `src/utils/dom-observer.js` — `waitForCondition` implementation

---

### Fix 3: Overlay Draggable from Any Point (Not Just Handle)

**Expected Correct Behavior:**
The overlay must be draggable by clicking and dragging from any visible part of the overlay panel — not only from the `dragHandle` element at the top. Clicking on tab content area, status displays, or any non-interactive area of the overlay must initiate drag. Interactive elements (buttons, inputs, textareas) must not initiate drag — they must still receive their normal click/focus events. The close button in the drag handle must also not initiate drag.

**Root Cause (specific to this codebase):**
In `src/components/ui-components.js`, `createDragHandle` attaches the `mousedown` listener only to the `dragHandle` element itself (`DOMUtils.addEventListeners(dragHandle, { mousedown: dragStart })`). The `dragStart` function also has an additional guard: `if (e.target === dragHandle)` — meaning drag only starts if the mouse-down event target is exactly the `dragHandle` div, not any of its children (including the title span, version span, or the close button).

The overlay element itself (`UIComponents.createOverlay()`) has `cursor: 'move'` set but no mousedown listener attached to it. The `CLAUDE.md` and CONCERNS notes confirm: "Drag support exists in UIComponents but is only partially wired to overlay element."

The fix requires moving (or duplicating) the mousedown listener from `dragHandle` to the `overlay` element, with exclusion logic for interactive child elements (buttons, inputs, textareas, select elements).

**Common Root Cause Pattern in Browser Automation Userscripts:**
- Drag implementation narrowly scoped to a header element, never extended to full panel — the "handle-only" anti-pattern
- `e.target === dragHandle` exact-match guard blocks all child element drag initiation (too restrictive)
- Drag listeners on element vs. drag listeners on overlay: a two-place implementation where only one place was wired
- Missing exclusion list for interactive children: a correct overlay-wide drag implementation must call `e.target.closest('button, input, textarea, select, a')` and skip drag if matched

**Complexity:** LOW-MEDIUM
- The drag math (translate3d, xOffset/yOffset tracking) already works correctly
- The fix is: attach `mousedown` to the overlay element (not just `dragHandle`), update the `dragStart` guard to check `!e.target.closest('button, input, textarea, select, a, [contenteditable]')` instead of `e.target === dragHandle`
- Medium complexity only because the guard logic must be thorough to avoid breaking button/input usability

**Files Involved:**
- `src/components/ui-components.js` — `createDragHandle` method (lines 17-145), specifically the `dragStart` function (lines 102-108) and the `addEventListeners` call (line 132)

---

### Fix 4: Sales Bot Gets Stuck on Trade Window (Doesn't Send)

**Expected Correct Behavior:**
After the Steam trade offer window opens and the inventory item is selected, the bot must automatically click through the Steam trade confirmation sequence to completion:
1. Click `#you_notready` (trade contents confirmation checkbox/button)
2. Click `.btn_green_steamui.btn_medium` ("Ready to Trade" / confirmation button)
3. Click `#trade_confirmbtn` ("Make Offer" button)
4. Click the "OK" dialog that follows

The bot must not stall after item selection. The sequence must complete without manual intervention.

**Root Cause (specific to this codebase):**
The `checkTradeConfirmationSteps` method in `sell-item-verification.js` (lines 841-893) uses a `waitAndClick` helper that creates independent `setInterval` loops for each button. The problem is timing: all four `waitAndClick` calls are fired simultaneously with hardcoded `delay` parameters (2000ms, 6000ms, 10000ms, 14000ms). This means:

1. All intervals start at the same time — if the page is slow to load, a later step's interval may expire before the element exists
2. Steps are not sequentially gated on previous step completion — they overlap on parallel polling intervals
3. The `setInterval` instances created inside `waitAndClick` are not registered in `this.stepTimeouts` Map, so `clearAllTimeouts()` during an emergency stop cannot cancel them (confirmed in CONCERNS.md: "Untracked setTimeout References")
4. After `step3_SelectItem` double-clicks the item, `currentStep` is set to `'confirm_trade'` immediately (line 720), but then `startStepMonitoring` calls `executeCurrentStep()` on a 2000ms loop — so `step4_ConfirmTrade` is called every 2000ms, spawning new parallel polling interval sets on each call

The practical result: multiple overlapping interval sets compete to click the same buttons, the state machine keeps re-entering `confirm_trade` every 2000ms spawning new timer sets, and the untracked timers survive emergency stop.

**Common Root Cause Pattern in Browser Automation Userscripts:**
- Multi-step sequential UI automation implemented as parallel timers instead of a promise chain or properly gated state machine — the "fire and hope" pattern
- `setInterval` used for one-shot "wait for element" logic instead of `MutationObserver` + promise
- No re-entrancy guard: a monitoring loop re-invokes a step function that itself launches new async work, causing exponential timer accumulation
- Steam trade confirmation is particularly sensitive to timing because each button is only visible after the previous action completes — parallel polling cannot reliably handle this
- Untracked timer references are the standard amnesia bug: cleanup code cannot cancel what it cannot reference

**Complexity:** MEDIUM-HIGH
- The `waitAndClick` parallel pattern must be replaced with a sequential async chain (promise-based or callback chain)
- Each step must gate on the previous step's completion before starting the next wait
- Re-entrancy guard needed: `step4_ConfirmTrade` must set a flag on first call and return early on subsequent calls from the monitoring loop
- All timer/interval IDs must be registered in `this.stepTimeouts` for proper cleanup
- The Steam UI selectors (`#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn`) need verification against the live Steam trade offer DOM — these may have changed and are the most fragile part

**Files Involved:**
- `src/automation/sell-item-verification.js` — `step4_ConfirmTrade` (line 829), `checkTradeConfirmationSteps` (lines 841-893), `startStepMonitoring` (lines 211-228)

---

### Fix 5: Stale Skins Persist After Page Refresh (Bought by Anyone)

**Expected Correct Behavior:**
After a page refresh (navigation reload of the CSGORoll market page), any item that is no longer present in the live DOM must be removed from the bot's `processedItems` set. Specifically: if a skin was purchased by another user and disappears from the market page, it must not remain in `processedItems` as a "seen" item. If the same item later relists (same name, different listing), it must be treated as a new item and processed normally.

The `processedItems` set is the source of deduplication. On page load, it should be empty (or cleared). After a page refresh, stale entries from the previous session should not block processing of new listings.

**Root Cause (specific to this codebase):**
`DataScraper.processedItems` is a `Set` instance stored on the `DataScraper` object. The `MarketItemScraper` class creates a single `DataScraper` instance at construction time (`this.dataScraper = new DataScraper()`). When the user triggers a page refresh (browser reload), the entire script re-initializes from `index.js`, which creates a fresh `MarketItemScraper` and thus a fresh `DataScraper` with an empty `processedItems` set.

However, the `autoClearInterval` in `WithdrawalAutomation.startAutoClear()` calls `dataScraper.clearProcessedItems()` on a 5-second cycle. If the auto-clear interval is running correctly, stale items should be cleared every 5 seconds. The reported bug — stale skins persisting after refresh — points to one of two scenarios:

1. The auto-clear interval is not starting reliably. `startPeriodicScan` calls `startAutoClear(5)` at the end (line 66), but `handleStartSniper` in `market-scraper.js` also calls `this.withdrawalAutomation.startAutoClear(5)` separately (line 374). If `startPeriodicScan` is what actually runs (via the automation manager's `start()` → `startPeriodicScan()`), the second call in `handleStartSniper` creates a duplicate interval. If neither runs reliably, items accumulate.

2. More likely: the `processedItems` set persists items from the **current page session** when the market DOM updates (infinite scroll, Angular route navigation within CSGORoll's SPA) without a full browser reload. CSGORoll uses Angular — market list updates may be in-page navigation rather than full reloads. In this case, `DataScraper` is never re-constructed, and `processedItems` retains names of items that have been removed from the DOM. A skin bought by someone else disappears from the DOM but remains in `processedItems`, so if it relists it is skipped.

The `getNewItems` filter (`items.filter(item => !this.processedItems.has(item.name))`) uses item name as the deduplication key. If two different listings have the same name (common for CS:GO skins — multiple copies of "AK-47 | Redline (FT)" may exist), all are blocked after the first is processed.

**Common Root Cause Pattern in Browser Automation Userscripts:**
- SPA-unaware deduplication: `processedItems` designed for full-page-reload lifecycle but deployed in a single-page app context where DOM updates happen via Angular change detection, not browser reload
- Name-only deduplication key is insufficient when multiple listings for the same item name exist simultaneously
- Auto-clear interval designed as the mitigation but its start/stop lifecycle is entangled with two separate callers (creating duplicate intervals and making cleanup unreliable)
- No DOM-presence validation before deduplication: a correct implementation checks whether a previously-seen item name still exists in the current DOM before keeping it in the processed set

**Complexity:** LOW-MEDIUM
- The immediate fix: on each scan cycle, before calling `getNewItems`, call a new method `dataScraper.pruneProcessedItems(scrapedItems)` that removes from `processedItems` any name not present in the current scan results
- This ensures that items removed from the DOM (bought by anyone) are automatically evicted from the processed set on the next scan tick
- Alternatively: reduce or eliminate the name-only deduplication in favor of a per-scan-cycle approach where `processedItems` is cleared at the start of each scan (relying on the in-flight processing guard to prevent double-clicks within a single async operation)
- The duplicate `startAutoClear` call should be consolidated to one caller

**Files Involved:**
- `src/scrapers/data-scraper.js` — `getNewItems` method (line 98-100), `clearProcessedItems` (lines 88-92)
- `src/automation/withdrawal-automation.js` — `startPeriodicScan` (line 66), `autoWithdrawItems` (lines 82-97)
- `src/market-scraper.js` — `handleStartSniper` (line 374, duplicate `startAutoClear` call)

---

## Feature Dependencies

```
Fix 1 (percentage filter) ──independent──> no dependencies on other fixes

Fix 2 (latency/speed)
    └──assumes──> Fix 5 is resolved
                  (faster detection without stale dedup = same item clicked twice)

Fix 3 (overlay drag) ──independent──> no dependencies on other fixes

Fix 4 (sales bot trade send)
    └──assumes──> Fix 5 provides clean item state on CSGORoll side
    └──independent of Fix 1, Fix 2, Fix 3

Fix 5 (stale skins)
    └──enables──> Fix 2 (faster scanning is safe only when stale items are cleared promptly)
```

### Dependency Notes

- **Fix 5 should be implemented before Fix 2:** If scan frequency is increased (Fix 2) while stale items persist (Fix 5 unresolved), the bot will attempt to withdraw already-sold items at higher frequency, increasing error rate and modal noise.
- **Fix 1 is fully independent:** The percentage filter wiring is self-contained in `createSniperControls` and `ItemFilter.updateBaseFilters`. No other fix affects it.
- **Fix 3 is fully independent:** Drag behavior is confined to `UIComponents.createDragHandle` and does not interact with automation state.
- **Fix 4 is largely independent:** The Steam trade flow (`SellItemVerification`) is a separate automation from the market sniper (`WithdrawalAutomation`). Fix 4 does not depend on Fixes 1, 2, or 3. Fix 5 affects the CSGORoll-side item state but the trade confirmation issue in Fix 4 is purely on the Steam-side state machine.

---

## Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Percentage filter applies to withdrawal gating | User sets a number, expects it to work | LOW | Wire `updateBaseFilters` in Apply handler |
| Overlay draggable from body | Standard draggable panel UX | LOW-MEDIUM | Extend mousedown to overlay, add interactive-element exclusion guard |
| Sales bot completes trade without stalling | Automation that requires manual intervention is not automation | MEDIUM-HIGH | Replace parallel timer pattern with sequential async chain |
| Stale items cleared on page update | Bot should respond to live DOM state, not cached state | LOW-MEDIUM | Add DOM-presence-based pruning of processedItems |

## Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Sub-100ms detection latency | React to listings faster than competing bots | MEDIUM | MutationObserver replacement for setInterval scan |

## Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Persist processedItems across page loads (localStorage) | "Remember what I've already bought" | Items re-list; same name = new item; leads to silent misses | Use DOM-presence pruning — evict from set when no longer in DOM |
| Global document.body MutationObserver for market detection | Simple to implement | Performance degradation on large pages (already flagged in CONCERNS.md) | Scope observer to the market items container element |
| Parallel waitAndClick chains for trade confirmation | "Handles any step order" | Creates overlapping timer sets, cannot be stopped reliably, causes re-entrancy | Sequential promise/callback chain gated on prior step completion |

---

## MVP Definition

### These 5 fixes constitute the complete MVP for this milestone

- [x] Fix 1: Percentage filter inputs apply to `ItemFilter.baseFilters.maxPercentageChange` — why essential: current state means UI controls have no effect on the bot's core withdrawal decision
- [x] Fix 5: Stale skin pruning on each scan cycle — why essential: prerequisite for safe latency improvements and correct deduplication in SPA context
- [x] Fix 3: Overlay drag from any point — why essential: UX regression; overlay placed off-screen is inaccessible
- [x] Fix 2: Detection-to-click latency reduction — why essential: core value proposition of the product is speed
- [x] Fix 4: Trade confirmation sequence completes without stalling — why essential: the sales bot is non-functional without this

### Recommended Implementation Order

1. Fix 1 (LOW complexity, independent, high-value)
2. Fix 3 (LOW-MEDIUM complexity, independent)
3. Fix 5 (LOW-MEDIUM complexity, unblocks Fix 2)
4. Fix 2 (MEDIUM complexity, depends on Fix 5 being safe)
5. Fix 4 (MEDIUM-HIGH complexity, most isolated, highest risk)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Fix 1: Percentage filter wiring | HIGH | LOW | P1 |
| Fix 3: Full overlay drag | MEDIUM | LOW-MEDIUM | P1 |
| Fix 5: Stale skin pruning | HIGH | LOW-MEDIUM | P1 |
| Fix 2: Detection latency | HIGH | MEDIUM | P2 |
| Fix 4: Trade confirmation sequence | HIGH | MEDIUM-HIGH | P2 |

**Priority key:**
- P1: Must have — directly broken, low-risk fix
- P2: Must have — directly broken, higher complexity/risk fix

---

## Sources

- Direct codebase analysis:
  - `src/filters/item-filter.js` — `updateBaseFilters`, `passesBaseFilter`, `maxPercentageChange` hard-coding
  - `src/market-scraper.js` — `createSniperControls` Apply button handler wiring (lines 296-311), `handleStartSniper` duplicate `startAutoClear` call (line 374)
  - `src/components/ui-components.js` — `createDragHandle` mousedown listener scope and `e.target === dragHandle` guard (lines 94-136)
  - `src/automation/withdrawal-automation.js` — `startPeriodicScan` setInterval pattern (lines 46-67), `startAutoClear` dual-caller issue (line 66 vs market-scraper.js line 374)
  - `src/automation/sell-item-verification.js` — `checkTradeConfirmationSteps` parallel timer pattern (lines 841-893), `startStepMonitoring` re-entrancy (lines 211-228), `step3_SelectItem` sets `currentStep` before async completion (line 720)
  - `src/scrapers/data-scraper.js` — `getNewItems` name-only deduplication (lines 98-100), `processedItems` Set lifecycle
- `.planning/codebase/CONCERNS.md` — confirmed: untracked setTimeout, fragile sell-item-verification state machine, filter configuration fragility, interval overlap

---

*Feature research for: RollMoney — 5 browser userscript bug fixes*
*Researched: 2026-02-22*
