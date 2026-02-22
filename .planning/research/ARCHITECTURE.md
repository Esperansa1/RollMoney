# Architecture Research

**Domain:** Browser userscript automation (CSGORoll.com market sniping + Steam trade bot)
**Researched:** 2026-02-22
**Confidence:** HIGH — based on direct source reading of all affected files

---

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    UI / Presentation Layer                      │
│  src/market-scraper.js  │  src/components/  │  src/theme/      │
│  (overlay, tabs, forms) │  (ui-components,  │  (design tokens) │
│                         │   tabbed-interface│                   │
├─────────────────────────┴───────────────────┴───────────────────┤
│                    Coordination Layer                            │
│              src/automation/automation-manager.js               │
│     (register/start/stop/pause/resume/event-emit/stats)        │
├──────────────────────────────────────────────────────────────────┤
│                    Automation Layer                              │
│  withdrawal-automation.js │ market-monitor.js │ sell-item-     │
│  (scan loop + withdraw)   │ (price tracking)  │ verification.js│
├──────────────────────────────────────────────────────────────────┤
│                  Data Processing Layer                           │
│        src/scrapers/data-scraper.js                             │
│        src/filters/item-filter.js                               │
├──────────────────────────────────────────────────────────────────┤
│                    Utility Layer                                 │
│  src/utils/dom-utils.js  │  cookie-utils.js  │ dom-observer.js │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `MarketItemScraper` | Top-level orchestrator; creates overlay, wires all components together | ES6 class, no framework |
| `AutomationManager` | Plugin registry — register/start/stop all automations, event bus | Registry pattern, Map-based |
| `WithdrawalAutomation` | Periodic market scan (500ms interval), click-to-withdraw flow | setInterval + DOM clicks |
| `MarketMonitor` | Price tracking with threshold alerts (2000ms interval) | setInterval + history Map |
| `SellItemVerification` | Multi-step CSGORoll→Steam trade flow; cross-domain state via URL params | State machine, setTimeout |
| `DataScraper` | Scrapes `.item-card` DOM elements; tracks processed items in a Set | querySelectorAll + Set |
| `ItemFilter` | Base filters (condition, StatTrak, percentageChange) + JSON custom filters | Pure function, no side effects |
| `UIComponents` | Static factory: creates overlay, drag handle, buttons, inputs, textareas | Static methods only |

---

## Recommended Project Structure

```
src/
├── automation/                 # Automation plugins (each must impl start/stop/pause/resume)
│   ├── automation-manager.js   # Central registry and lifecycle coordinator
│   ├── withdrawal-automation.js
│   ├── market-monitor.js
│   └── sell-item-verification.js
├── components/
│   ├── ui-components.js        # Static factory for themed elements; drag logic lives here
│   ├── tabbed-interface.js
│   ├── automation-tabs.js
│   └── automation-panel.js
├── scrapers/
│   └── data-scraper.js         # DOM extraction + processedItems Set management
├── filters/
│   └── item-filter.js          # baseFilters object + customFilterConfig array
├── theme/
│   └── theme.js
└── utils/
    ├── dom-utils.js
    ├── dom-observer.js
    └── cookie-utils.js
```

### Structure Rationale

- **automation/:** Each file is one self-contained plugin with the same lifecycle interface; AutomationManager owns nothing about what they do internally.
- **components/:** UIComponents is the single source of truth for all DOM element creation. All UI wiring (callbacks) happens at the `market-scraper.js` level where the instances exist.
- **filters/:** ItemFilter is stateful (holds `baseFilters` and `customFilterConfig`) — changes to either field persist for the lifetime of the page. This is why UI input must call `itemFilter.updateBaseFilters()` or `itemFilter.setCustomFilterConfig()` to have any effect.

---

## Fix-by-Fix Integration Analysis

This section covers each of the 5 broken features: the exact files touched, data flow changes required, and how each fix fits into the existing architecture without introducing new patterns.

---

### Fix 1: Percentage Filter Inputs Don't Apply to Filtering

**Root cause:** The UI renders percentage inputs (e.g., alert threshold in `createSniperControls()`) but there is no code path that calls `itemFilter.updateBaseFilters({ maxPercentageChange: value })` when a user changes those inputs. `ItemFilter.baseFilters.maxPercentageChange` is hard-coded to `5.1` at construction and is never mutated by UI interaction.

**Files touched:**

| File | Change |
|------|--------|
| `src/market-scraper.js` | Add `onChange` listener to the percentage input inside `createSniperControls()`; call `this.itemFilter.updateBaseFilters({ maxPercentageChange: parsedValue })` |
| `src/filters/item-filter.js` | No logic change needed — `updateBaseFilters()` already exists and merges correctly |

**Data flow change:**

```
User edits input in createSniperControls()
    ↓  (missing link today)
itemFilter.updateBaseFilters({ maxPercentageChange: value })
    ↓  (already correct)
passesBaseFilter() reads this.baseFilters.maxPercentageChange
    ↓
filterItems() uses updated threshold on next 500ms scan tick
```

**Architecture fit:** Pure wiring fix. No new methods, no new files. Follows the existing `applyBtn` pattern already used for the price threshold (`marketMonitor.updatePriceThreshold()`).

---

### Fix 2: Detection-to-Click Latency (WithdrawalAutomation Scan Loop Speed)

**Root cause:** `startPeriodicScan()` uses a fixed 500ms `setInterval`. Between detection and the actual `itemCard.click()`, there are several `await`-based waits: `DOMObserver.waitForCondition()` (3000ms timeout), `DOMObserver.waitForElementEnabled()` (2000ms timeout), `DOMObserver.waitForPageStability(50, 3000)`. These timeouts are generous worst-case values, not optimistic best-case values. The scan loop itself cannot start processing the next item until the previous `await` chain resolves.

**Files touched:**

| File | Change |
|------|--------|
| `src/automation/withdrawal-automation.js` | Reduce timeout arguments in `attemptItemWithdrawalFast()`, `handleWithdrawalResultFast()`, and `handleNotJoinableError()`; reduce `waitForPageStability` stability window |
| `src/utils/dom-observer.js` | Verify polling interval inside `waitForCondition` — if it polls at 100ms+, tighten it |

**Data flow change:**

```
setInterval(500ms) fires
    ↓
scrapeMarketItems() → filterItems()
    ↓
autoWithdrawItems() → processItemFast() → attemptItemWithdrawalFast()
    ↓
waitForCondition(3000) ← shorten timeout + polling interval
waitForElementEnabled(2000) ← shorten timeout
waitForPageStability(50, 3000) ← shorten stability window
    ↓
withdrawButton.click()
```

**Architecture fit:** Contained entirely within `WithdrawalAutomation` and `DOMObserver`. No interface changes. The automation plugin contract (start/stop/pause/resume) is unaffected.

---

### Fix 3: Overlay Draggable From Any Point

**Root cause:** `createDragHandle()` in `UIComponents` registers `mousedown` only on the `dragHandle` element (the title bar strip). The `dragStart` function additionally gates dragging with `if (e.target === dragHandle)` — so clicks on the title text, the version span, or the close button all fail the identity check and dragging never starts.

```javascript
// Current gating — only the bare dragHandle div qualifies
const dragStart = (e) => {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === dragHandle) {   // <-- excludes child elements
        isDragging = true;
    }
};
```

To make the entire overlay draggable (not just the handle strip), the listener should be placed on the overlay element itself rather than only the dragHandle, and the `e.target === dragHandle` guard should be replaced with a check that excludes interactive children (the close button).

**Files touched:**

| File | Change |
|------|--------|
| `src/components/ui-components.js` | In `createDragHandle()`: move `mousedown` listener to `overlay` (not just `dragHandle`); replace `e.target === dragHandle` with `!e.target.closest('button, input, textarea, select, a')` |

**Data flow change:**

```
User mousedown anywhere on overlay (not interactive child)
    ↓
dragStart() sets isDragging = true, records initial coords
    ↓
document mousemove → drag() → overlay.style.transform updated
    ↓
document mouseup → dragEnd() → callbacks.onDragEnd / onPositionSave
```

**Architecture fit:** Single method fix inside `UIComponents.createDragHandle()`. No callers change. The `onDragEnd` and `onPositionSave` callbacks wired in `market-scraper.js:setupOverlayComponents()` continue to work unchanged.

---

### Fix 4: Sales Bot Gets Stuck on Trade Window (SellItemVerification step3 / step4)

**Root cause:** `step3_NavigateInventory()` and `step3_SelectItem()` look for `.item` DOM elements on the Steam trade offer page. The `step4_ConfirmTrade()` / `checkTradeConfirmationSteps()` method creates multiple independent `setInterval` loops (one per `waitAndClick` call) with hardcoded absolute delays (2000ms, 6000ms, 10000ms, 14000ms). These intervals are never cleared after the step transitions away from `confirm_trade`, so they keep firing and clicking even after the step completes or the automation stops.

Additionally, `checkTradeConfirmationSteps()` fires all four intervals simultaneously at the moment `step4_ConfirmTrade()` is called. If any prior step reruns (the outer `startStepMonitoring()` loop fires every 2000ms), new sets of overlapping intervals are spawned.

**Files touched:**

| File | Change |
|------|--------|
| `src/automation/sell-item-verification.js` | Refactor `checkTradeConfirmationSteps()`: store each interval ID in `this.stepTimeouts` Map so they are cancelled by the existing `clearAllTimeouts()` on `stop()` / `pause()`; replace absolute staggered delays with sequential step transitions (`currentStep` state machine) so each button click only runs after the previous one succeeds |

**Data flow change (current, broken):**

```
confirm_trade step fires every 2000ms
    ↓
checkTradeConfirmationSteps() starts 4 independent setIntervals
    ↓ (intervals are never cleared)
Clicks fire at t+2s, t+6s, t+10s, t+14s even after step changes
    ↓
Bot is stuck because intervals interfere with subsequent state transitions
```

**Data flow change (after fix):**

```
confirm_trade step fires
    ↓
waitAndClick('#you_notready', ...) — stores interval in stepTimeouts
    → on success: currentStep = 'confirm_trade_ready'
    ↓
waitAndClick('.btn_green_steamui', ...) — new step, new interval
    → on success: currentStep = 'confirm_trade_offer'
    ↓
waitAndClick('#trade_confirmbtn', ...) — new step
    → on success: currentStep = 'confirm_trade_ok'
    ↓
OK button click → currentStep = 'complete'
    ↓
stop() → clearAllTimeouts() clears any pending intervals
```

**Architecture fit:** The `stepTimeouts` Map and `clearAllTimeouts()` method already exist for exactly this purpose. The fix extends the state machine with additional sub-steps rather than adding new infrastructure. Follows the same `switch(this.currentStep)` pattern in `executeCurrentStep()`.

---

### Fix 5: Stale Skins Persist After Page Refresh (DataScraper Sold Detection)

**Root cause:** `DataScraper.processedItems` is an in-memory `Set`. On page refresh, the Set is reconstructed empty. However, the bug described is the inverse: items that are already sold (bought by another user) remain visible in the DOM briefly after page refresh, or the `processedItems` Set retains names across the auto-clear interval, causing re-purchased items to appear as already processed.

The `scrapeMarketItems()` method queries `.item-card` elements but has no mechanism to detect whether a card has a "sold" / "unavailable" state (e.g., a CSS class like `.sold`, `.disabled`, a checked icon via `hasCheckedIcon`, or a DOM attribute). Cards with `hasCheckedIcon: true` are already extracted but `passesBaseFilter()` does not check `hasCheckedIcon`.

`startAutoClear()` clears `processedItems` every 5 seconds — this means items processed in the previous window re-enter the filter pool after clearing. If the DOM still shows those cards (stale CSGORoll rendering), they get re-processed.

**Files touched:**

| File | Change |
|------|--------|
| `src/scrapers/data-scraper.js` | In `scrapeMarketItems()`: skip cards that are detected as sold/unavailable — check for `hasCheckedIcon` flag or any `.sold`/`[disabled]` DOM state; only return cards that are still purchasable |
| `src/filters/item-filter.js` | In `passesBaseFilter()`: add `hasCheckedIcon` rejection: if `item.hasCheckedIcon === true`, return `false` |

**Data flow change:**

```
scrapeMarketItems() iterates .item-card elements
    ↓
extractItemData() extracts hasCheckedIcon (already extracted today)
    ↓  (missing filter today)
passesBaseFilter() should reject item when hasCheckedIcon === true
    ↓
filterItems() returns only genuinely available items
    ↓
autoWithdrawItems() never processes stale/sold cards
```

**Architecture fit:** `hasCheckedIcon` is already extracted in `DataScraper.extractItemData()`. It just needs to be consumed by `ItemFilter.passesBaseFilter()`. No new data fields, no new files.

---

## Architectural Patterns

### Pattern 1: Automation Plugin Contract

**What:** Every automation implements `start()`, `stop()`, `pause()`, `resume()`, and exposes `id`, `priority`, `interval`, `settings`.
**When to use:** Any new market operation that needs lifecycle management.
**Trade-offs:** Clear separation, but the monitoring loop (`startStepMonitoring`) in `SellItemVerification` creates its own recursive `setTimeout` chain rather than delegating to `AutomationManager`'s tick — this creates a second parallel control loop that can conflict with the outer manager.

**Example (existing):**
```javascript
// Each automation must satisfy this contract
start() { this.startPeriodicScan(this.settings.scanInterval); }
stop()  { this.stopPeriodicScan(); }
pause() { clearInterval(this.scanInterval); this.isRunning = false; }
resume() { if (!this.isRunning) this.start(); }
```

### Pattern 2: Static Factory UI

**What:** `UIComponents` is a purely static class. All elements are created via factory methods that apply theme tokens. No DOM element is created outside this class.
**When to use:** Any new UI element must go through `UIComponents` or `DOMUtils.createElement()` directly.
**Trade-offs:** Consistent styling; drag logic being embedded in `createDragHandle()` means the drag target is tightly coupled to the handle concept — extending drag to the full overlay requires modifying this factory method.

### Pattern 3: Callback-Based UI Wiring

**What:** UI factory methods accept `callbacks` objects. The actual business logic lives in `MarketItemScraper`, not inside the UI components.
**When to use:** When a UI element needs to trigger automation actions.
**Trade-offs:** Keeps UI components dumb; means `market-scraper.js` becomes large (1057 lines) as all wiring concentrates there.

**Example (existing):**
```javascript
// market-scraper.js — wiring happens at orchestration level
const dragHandle = UIComponents.createDragHandle(this.overlay, {
    onDragEnd: (x, y) => { console.log('Drag ended at:', x, y); },
    onPositionSave: (x, y) => {
        localStorage.setItem('scraperOverlayX', x);
        localStorage.setItem('scraperOverlayY', y);
    },
    onClose: () => { this.closeOverlay(); }
});
```

---

## Data Flow

### Request Flow: Market Sniper (Withdrawal)

```
setInterval(500ms) in WithdrawalAutomation
    ↓
dataScraper.scrapeMarketItems()        → querySelectorAll('.item-card')
    ↓
itemFilter.filterItems(scrapedItems)   → passesBaseFilter() + passesCustomFilter()
    ↓
autoWithdrawItems(filteredItems)
    ↓
dataScraper.getNewItems(filteredItems) → Set membership check
    ↓
processItemFast(item) → itemCard.click()
    ↓
attemptItemWithdrawalFast() → waitForCondition → withdrawButton.click()
```

### Request Flow: Filter Config (UI → ItemFilter)

```
User edits JSON in inputTextarea
    → "Apply Filter" button click
    → onLoad callback in createJsonConfigSection()
    → itemFilter.setCustomFilterConfig(config)    [current]
    → itemFilter.updateBaseFilters({ maxPercentageChange }) [MISSING for fix 1]
    ↓
Next scan tick: filterItems() reads updated config
```

### Request Flow: Sell Item Verification (Cross-Domain)

```
CSGORoll page: step1_WaitForTradePopup() → click "Yes, I'm ready"
    ↓
step1_WaitForContinue() → click "Continue"
    ↓
step2_ExtractItemData() → modal DOM extraction → collectedData
    ↓
step2_SendItems() → encodeDataToUrlParams(collectedData) → modify "Send Items Now" href
    ↓
Browser navigates to Steam URL with ?automation_data=<base64>
    ↓
Steam page: SellItemVerification constructor → initializeCrossPageState() → decodeDataFromUrlParams()
    ↓
step3_NavigateInventory() → step3_SelectItem() → step4_ConfirmTrade()
    ↓
completeVerification() → resetForNextTrade()
```

### State Management

```
AutomationManager (Map)
    ↓ (automation status, error counts, priority)
WithdrawalAutomation.isRunning (boolean)
    ↓ (controls setInterval lifecycle)
DataScraper.processedItems (Set — in-memory, cleared every 5s)
    ↓ (prevents duplicate withdrawal attempts)
ItemFilter.baseFilters + customFilterConfig (plain objects, mutated via updateBaseFilters/setCustomFilterConfig)
    ↓ (read on every scan tick)
SellItemVerification.currentStep (string state machine — only cross-domain state is URL params)
```

---

## Fix Order and Dependencies

### Recommended sequence

```
Fix 5 (DataScraper stale skins)
    → no dependencies, isolated to data layer
    ↓
Fix 1 (percentage filter inputs)
    → depends on understanding how ItemFilter.baseFilters is read (informed by Fix 5 reading)
    ↓
Fix 2 (detection-to-click latency)
    → isolated to WithdrawalAutomation + DOMObserver, no cross-dependencies
    ↓ (can be done in parallel with Fix 3)
Fix 3 (overlay drag)
    → isolated to UIComponents.createDragHandle(), no automation dependencies
    ↓
Fix 4 (sales bot trade window)
    → most complex; depends on understanding SellItemVerification state machine fully
```

**Rationale for this order:**

- Fix 5 and Fix 1 both touch `item-filter.js` / `data-scraper.js`. Doing 5 first means the `hasCheckedIcon` rejection in `passesBaseFilter()` is in place before testing Fix 1's percentage filter — avoids false positives where stale sold items confused percentage filter testing.
- Fix 2 and Fix 3 are fully independent. They can be developed in parallel by different sessions.
- Fix 4 is last because the `SellItemVerification` state machine is the most complex component. Doing it after the simpler fixes means the tester's understanding of the plugin architecture is solid before diving into the multi-domain flow.

---

## Anti-Patterns

### Anti-Pattern 1: Spawning Intervals Without Clearing References

**What people do:** Call `setInterval(fn, delay)` inside a method that may be called multiple times (e.g., each time `executeCurrentStep()` runs).
**Why it's wrong:** Multiple concurrent interval loops fire the same click sequence, causing race conditions and phantom state transitions.
**Do this instead:** Store every interval/timeout ID in `this.stepTimeouts` and call `clearAllTimeouts()` before spawning new ones. This pattern already exists in `SellItemVerification` — it just is not used consistently in `checkTradeConfirmationSteps()`.

### Anti-Pattern 2: UI Elements Reading State Directly From DOM

**What people do:** `updateSniperStatus()` re-queries `document.getElementById('sniper-status-grid')` every 1000ms and rebuilds it with `innerHTML = ''`.
**Why it's wrong:** Causes flicker and loses DOM event listeners if any are attached to child elements.
**Do this instead:** For the current bug scope, this pattern is acceptable since the status grid has no interactive children. Avoid adding interactive elements inside elements rebuilt via `innerHTML`.

### Anti-Pattern 3: Bypassing ItemFilter for Per-Scan Re-validation

**What people do:** `processItemFast()` calls `this.itemFilter.filterItems([currentItemData])` directly after already filtering once.
**Why it's wrong:** Not technically wrong, but if `baseFilters` are stale due to Fix 1 not being applied, this re-validation also uses stale values. After Fix 1, both passes will use the same current filter state.
**Do this instead:** No change needed; document that both passes share the same `ItemFilter` instance and therefore both benefit from Fix 1 automatically.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `MarketItemScraper` ↔ `AutomationManager` | Direct method calls (`startAutomation`, `stopAutomation`, `getStats`) | AutomationManager is owned by MarketItemScraper |
| `AutomationManager` ↔ automation plugins | Lifecycle calls (`start`, `stop`, `pause`, `resume`) + event emission | Plugins are registered by ID; manager holds references |
| `WithdrawalAutomation` ↔ `ItemFilter` | Direct reference passed at construction | `itemFilter.filterItems()` called each tick |
| `WithdrawalAutomation` ↔ `DataScraper` | Direct reference passed at construction | `dataScraper.scrapeMarketItems()` called each tick |
| UI (`createJsonConfigSection`) ↔ `ItemFilter` | Callback `onLoad(config)` → `itemFilter.setCustomFilterConfig()` in `market-scraper.js` | The wiring is in `createConfigurationTab()` |
| `SellItemVerification` ↔ Steam page | URL parameters (`automation_data` query param, base64 JSON) | No localStorage; state is ephemeral within URL |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| CSGORoll.com DOM | querySelectorAll + event dispatch | Selectors target `data-test` attributes and Angular class names (`ng-star-inserted`, `mat-dialog-container`) |
| Steam Community DOM | querySelectorAll for `#pagecontrol_cur`, `#pagebtn_next`, `.item`, `#trade_confirmbtn` | Steam DOM is static HTML; Angular selectors do not apply |

---

## Scalability Considerations

This is a single-user browser automation tool; traditional scalability concerns do not apply. The relevant "scale" dimension is number of market items per scan and scan frequency.

| Concern | Current State | After Fixes |
|---------|---------------|-------------|
| Items per scan | `scrapeMarketItems()` processes all `.item-card` elements every 500ms | Fix 5 skips sold items early, reducing the set passed to `filterItems()` |
| Filter evaluation cost | O(n * m) where n = items, m = custom filter rules | No change — acceptable for expected sizes |
| Interval drift | `setInterval` can drift under CPU load | No change; acceptable for 500ms intervals |

---

## Sources

- Direct source reading: `src/filters/item-filter.js` (lines 1–102)
- Direct source reading: `src/components/ui-components.js` (lines 1–495)
- Direct source reading: `src/market-scraper.js` (lines 1–1057)
- Direct source reading: `src/automation/withdrawal-automation.js` (lines 1–385)
- Direct source reading: `src/automation/sell-item-verification.js` (lines 1–1052)
- Direct source reading: `src/scrapers/data-scraper.js` (lines 1–101)
- `.planning/codebase/ARCHITECTURE.md` — system architecture analysis
- `.planning/codebase/STRUCTURE.md` — directory layout and naming conventions
- `.planning/codebase/CONVENTIONS.md` — code style and error handling patterns
- `.planning/PROJECT.md` — requirements and constraints

---

*Architecture research for: RollMoney (TamirMakeMoney) bug fixes*
*Researched: 2026-02-22*
