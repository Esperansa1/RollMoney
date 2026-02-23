# Phase 3: Latency Reduction - Research

**Researched:** 2026-02-23
**Domain:** Browser userscript — MutationObserver-driven item detection replacing setInterval polling
**Confidence:** HIGH (all findings from direct source code inspection)

---

## Summary

The bot currently detects matching market items by polling the DOM every 500ms with `setInterval`. The entire detection-to-withdrawal hot path is in `withdrawal-automation.js` → `startPeriodicScan()`. The polling approach means that on average a matching item waits 250ms before the bot even notices it, with a worst case of 500ms. Phase 3 replaces this with a `MutationObserver` that fires synchronously when any `.item-card` element is added to the DOM, triggering the existing processing chain immediately.

The bot already uses `MutationObserver` for two things: waiting for the withdraw button to appear after clicking an item card (`DOMObserver.waitForElement`), and waiting for elements to become enabled (`DOMObserver.waitForElementEnabled`). The pattern is proven in the codebase. Phase 3 applies the same technique to the primary detection path, not just the secondary wait-for-element paths.

The hot path after item detection contains one necessary wait: `DOMObserver.waitForCondition` (using `requestAnimationFrame`) for the withdraw button to appear after clicking the item card. This is driven by Angular modal render time and is correctly event-driven already. However, `handleWithdrawalResultFast` calls `DOMObserver.waitForPageStability(50, 3000)` with a 50ms debounce — this adds a minimum 50ms wait after withdrawal click before checking the result. This is a legitimate target for reduction. The remaining waits are timeout-bounded condition loops (not fixed sleeps), so they are not "unnecessary delays" in the strict sense.

**Primary recommendation:** Add a `MutationObserver` on the market item list container in `startPeriodicScan()` (or a new `startObservedScan()` method). Keep the 500ms poll as a fallback heartbeat reduced to 10,000ms (10s) to catch cases where the observer misses mutations. Deduplicate via the existing `processedItems` Set, adding a per-item dedup guard immediately in the observer callback before any async work.

---

## Polling Interval: Exact Location

**File:** `src/automation/withdrawal-automation.js`

**Primary interval declaration:**
- Line 17: `this.interval = 500;` (AutomationManager integration field)
- Line 19: `scanInterval: 500,` (inside `this.settings` object)

**Primary interval usage (the live timer):**
- Line 47: `startPeriodicScan(intervalMs = 500)` — method signature default
- Line 27: `start()` calls `this.startPeriodicScan(this.settings.scanInterval)` — passes 500ms
- Lines 53–65: `this.scanInterval = setInterval(async () => { ... }, intervalMs)` — the actual timer

**The full scan loop (lines 53–65):**
```javascript
this.scanInterval = setInterval(async () => {
    try {
        const scrapedItems = this.dataScraper.scrapeMarketItems();
        const filteredItems = this.itemFilter.filterItems(scrapedItems);
        console.log('Filtered items:', filteredItems);

        if (filteredItems.length > 0) {
            await this.autoWithdrawItems(filteredItems);
        }
    } catch (error) {
        console.error('Error during periodic scan:', error);
    }
}, intervalMs);
```

**Secondary interval (market monitor — separate concern, not in hot path):**
- `src/automation/market-monitor.js` line 13: `this.interval = 2000;` — runs every 2 seconds for price tracking alerts only, does not trigger withdrawals.

---

## DOM Scan Target: What the Bot Currently Looks At

**File:** `src/scrapers/data-scraper.js`

**Selector used to find all items:** Line 9: `document.querySelectorAll('.item-card')`

**Per-item data extracted from each `.item-card` element:**
| Field | Selector |
|-------|----------|
| `subcategory` | `span[data-test="item-subcategory"]` |
| `name` | `label[data-test="item-name"]` |
| `price` | `span[data-test="value"]` |
| `percentageChange` | `span.lh-16.fw-600.fs-10.ng-star-inserted` |
| `condition` | `span.fn.ng-star-inserted` or `div[data-test="item-card-float-range"] span.ng-star-inserted` |
| `hasCheckedIcon` | `span[inlinesvg="assets/icons/checked.svg"]` |

**Key insight:** `hasCheckedIcon` is already extracted per item but the filter (`ItemFilter.passesBaseFilter`) does not currently check it. This was the Phase 2 research finding that the stale detection path is "not joinable" error reactive, not DOM-icon proactive. This remains unchanged in Phase 3.

**Item lookup by name (for click):** Line 72–78: `findItemCardByName()` — iterates `document.querySelectorAll('.item-card')` and matches `label[data-test="item-name"]` text.

---

## MutationObserver Target: What Element to Observe

**The item list container is NOT directly identified by name in the codebase.** The scraper queries globally via `document.querySelectorAll('.item-card')`, meaning it does not scope to a specific parent container. To identify the parent, we must reason from the Angular app structure on CSGORoll.

**What we know from the code:**
- Items are `.item-card` elements
- The withdrawal modal contains `button` elements with text "withdraw"
- Angular dialogs use `mat-dialog-container` (confirmed used in `market-scraper.js` line 793: `document.querySelector('mat-dialog-container')`)
- The market page is an Angular SPA

**Correct MutationObserver target — two options (HIGH confidence for option 1):**

**Option 1 (recommended):** Observe `document.body` with `childList: true, subtree: true`, filtered to only act when new `.item-card` elements appear as added nodes.

This is the safest choice because:
- We don't know the exact parent container selector without live page inspection
- `document.body` with `subtree: true` is already the pattern used by `DOMObserver.waitForElement` and `DOMObserver.waitForElementToDisappear` in the existing codebase
- Angular updates the item list by adding/removing child nodes inside a container; the observer will fire on any such childList mutation

**Option 2 (more targeted, if the container selector can be confirmed via live inspection):** A container like `[class*="item-list"]`, `.market-items`, or an Angular-specific element wrapping `.item-card` elements. This would reduce observer callback frequency.

**Mutation signal — what indicates "new item added":**
A `childList` mutation on the item list container will have `mutation.addedNodes` containing the new `.item-card` element (or its parent wrapper). The observer callback should:
1. Iterate `mutation.addedNodes`
2. For each added node, check if it is or contains `.item-card` elements
3. For each found card, extract data and run the filter immediately

**Angular-specific concern:** Angular adds items using structural directives (`*ngFor`). When the Angular change detection cycle runs, it may add several item cards in rapid succession as part of a single change detection batch. This means multiple `addedNodes` may appear in a single `MutationObserver` callback. The implementation must handle the case where `mutation.addedNodes` contains multiple items.

---

## Hot-Path Delay Inventory

The hot path runs from "observer fires" to "withdraw button clicked". These are the delays in that path:

### Step 1: Observer callback → `processItemFast()` call
- **Delay:** Near-zero. The observer callback executes synchronously on the microtask queue when the DOM mutation is committed. No explicit delay.
- **Action needed:** None.

### Step 2: `processItemFast()` — item re-validation before click
- **Lines 102–116:** `findItemCardByName()` + `extractItemData()` + `filterItems()` re-check
- **Delay:** Synchronous DOM query + pure JS — sub-millisecond.
- **Action needed:** None. This is a correct pre-click validation (prevents clicking an already-sold item).

### Step 3: `itemCard.click()` → modal renders (Angular)
- **Lines 122–123:** `itemCard.click()` is synchronous.
- **Delay:** Angular must render the modal. This is driven by Angular change detection and cannot be shortened. The existing `DOMObserver.waitForElement` + `DOMObserver.waitForCondition` (using `requestAnimationFrame`) approach is already the fastest possible wait for this.
- **Action needed:** None. Already event-driven.

### Step 4: `attemptItemWithdrawalFast()` — waiting for withdraw button
- **Lines 140–154:** `DOMObserver.waitForCondition()` polls via `requestAnimationFrame` until a button with text "withdraw" appears.
- **Delay:** requestAnimationFrame-based (16ms per frame) — event-driven, not a fixed delay.
- **Action needed:** None. This is already optimal.

### Step 5: `DOMObserver.waitForElementEnabled(withdrawButton, 2000)`
- **Line 166:** Waits for withdraw button's `disabled` attribute to clear.
- **Delay:** Driven by `MutationObserver` on the button's `disabled` attribute — event-driven.
- **Action needed:** None. Already optimal.

### Step 6: `withdrawButton.click()` → result check
- **Line 168:** Synchronous click.
- **Delay:** None.

### Step 7: `handleWithdrawalResultFast()` — `waitForPageStability(50, 3000)`
- **Line 184:** `DOMObserver.waitForPageStability(50, 3000)` — waits for DOM to be stable for 50ms before checking result text.
- **Delay:** Minimum 50ms ALWAYS, even if the result is immediately visible. This is a fixed minimum delay in the hot path.
- **Assessment:** This 50ms wait is after the withdrawal click and before the result check. It does NOT delay detection → click; it delays click → result-read. Whether this matters depends on what you're optimizing. If the goal is time-to-click (not time-to-result-confirm), this is outside the primary hot path. If the goal includes result confirmation speed, reducing from 50ms to 0ms or 10ms is possible.
- **Risk:** Reducing the stability wait may cause the result check to read stale DOM content (the page hasn't updated yet). 50ms is already a reasonable floor. Do not remove this delay entirely.
- **Action needed:** Leave at 50ms. This is not an "unnecessary fixed delay" — it serves a functional purpose (waiting for Angular to render the post-click state before reading it).

### Summary: Delays to Remove vs. Keep
| Delay | Location | Ms | Decision |
|-------|----------|----|----------|
| 500ms poll interval | `startPeriodicScan` | 0–500ms avg 250ms | REMOVE as primary path — add MutationObserver |
| requestAnimationFrame condition check | `waitForCondition` withdraw button | 16ms/frame | KEEP — already optimal |
| MutationObserver wait for disabled clear | `waitForElementEnabled` | ~0ms | KEEP — already optimal |
| 50ms stability wait after click | `waitForPageStability(50, ...)` | 50ms | KEEP — functional purpose |
| 2000ms condition timeout for result | `waitForCondition` result check | max 2000ms | KEEP — this is a timeout ceiling, not a fixed wait |

---

## Deduplication Strategy

**Problem:** A MutationObserver callback fires for every DOM mutation that adds an `.item-card`. If the observer fires twice for the same item (e.g., Angular re-renders the node), the bot will attempt to withdraw the same item twice before the first attempt marks it processed.

**Existing mechanism:** `dataScraper.processedItems` (a `Set`) and `dataScraper.getNewItems()` already filter out items whose names are in the processed set. `addProcessedItem(item.name)` is called at line 119 in `processItemFast()`, before the card is clicked.

**Race condition window:** The observer callback is synchronous but `processItemFast()` is `async`. Between when the observer fires and when `addProcessedItem()` is called (line 119, inside `processItemFast()`), another observer callback could fire for the same item and queue a second processing attempt.

**Required dedup guard in observer callback:**
```javascript
// In observer callback, BEFORE queuing processItemFast():
const itemName = card.querySelector('label[data-test="item-name"]')?.textContent.trim();
if (!itemName || this.dataScraper.isItemProcessed(itemName)) {
    return; // Already in flight or processed
}
// Mark immediately (synchronously) before awaiting anything
this.dataScraper.addProcessedItem(itemName);
// Now queue the withdrawal
this.processItemFast(item, 0).catch(err => console.error(err));
```

This synchronous mark-before-await pattern closes the race condition window. The existing `processItemFast()` also calls `addProcessedItem()` again (line 119) — that second call is a no-op (Set.add is idempotent) and can remain.

---

## Fallback Polling Decision

**Recommendation: Keep poll as fallback, reduce interval to 10,000ms (10 seconds).**

Rationale:
- MutationObserver can miss mutations in edge cases: observer disconnect/reconnect during SPA navigation, Angular zone.js intercepting DOM operations, or browser tab backgrounding
- A 10s fallback poll catches any items that slipped through without adding meaningful latency to the primary path
- The fallback runs the same `scrapeMarketItems()` + `filterItems()` logic; any items already in `processedItems` are skipped by `getNewItems()`

**What NOT to do:** Fully remove the poll. If the observer silently stops working (Angular SPA navigation resets the DOM tree, disconnecting the observer from its target), the bot would miss all future items silently.

**Implementation:** Change `startPeriodicScan()` default from 500ms to accept two parameters: observer mode (primary) and fallback interval. Or simpler: create a new `startObservedScan()` method that sets up the observer and calls `startPeriodicScan(10000)` for the heartbeat.

---

## Angular-Specific Concerns

**CSGORoll is an Angular SPA.** Relevant implications for MutationObserver:

1. **Angular zone.js:** Angular patches DOM APIs including `MutationObserver` to run change detection. Observer callbacks will fire within Angular's zone, which is fine — no special handling needed.

2. **SPA navigation (route changes):** When the user navigates to a different page within CSGORoll (Angular router navigation), the item list DOM tree may be destroyed and recreated. If the observer was attached to a specific child container that gets destroyed, it will silently stop firing. Solution: observe `document.body` (not a specific container), or re-attach the observer on DOM changes that indicate the item list has been replaced.

3. **Change detection batching:** Angular batches DOM updates within a single change detection cycle. A single `scrapeMarketItems()` call showing 10 items may result in 10 separate `addedNodes` entries across multiple MutationObserver callbacks, or all 10 in one callback's `addedNodes`. Both must be handled. Iterate all `mutation.addedNodes` in each callback.

4. **`*ngFor` rendering:** Angular's `*ngFor` adds items as sibling elements inside a container. The `addedNodes` will be the `.item-card` elements themselves (or their host custom elements). Check `node.classList.contains('item-card')` or `node.querySelectorAll('.item-card')` for nested cases.

5. **Observer disconnect on stop:** When `stopPeriodicScan()` is called, the observer must be explicitly disconnected via `this.domObserver.disconnect()`. If not disconnected, it continues firing after the bot is stopped.

---

## Architecture Patterns

### Recommended Implementation Structure

```
WithdrawalAutomation class additions:
├── this.domObserver = null          (new field in constructor)
├── startObservedScan()             (new method — primary entry point)
│   ├── sets up MutationObserver on document.body
│   ├── calls startPeriodicScan(10000) for fallback heartbeat
│   └── stores observer in this.domObserver
├── stopPeriodicScan() modification
│   └── also calls this.domObserver?.disconnect()
└── start() modification
    └── calls startObservedScan() instead of startPeriodicScan(500)
```

### Pattern: MutationObserver for New Item Detection

```javascript
// Source: Pattern derived from DOMObserver.waitForElement (src/utils/dom-observer.js lines 26-39)
// Adapted for persistent, non-one-shot observation

startObservedScan() {
    // Start fallback heartbeat poll at 10s (catches missed mutations)
    this.startPeriodicScan(10000);

    // Primary: MutationObserver for instant detection
    this.domObserver = new MutationObserver((mutations) => {
        if (!this.isRunning) return;

        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;

            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                // Check if the added node is an item-card
                const cards = node.classList?.contains('item-card')
                    ? [node]
                    : Array.from(node.querySelectorAll('.item-card'));

                for (const card of cards) {
                    this._handleNewCard(card);
                }
            }
        }
    });

    this.domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

_handleNewCard(card) {
    try {
        const itemData = this.dataScraper.extractItemData(card);

        // Dedup check — synchronous, before any await
        if (this.dataScraper.isItemProcessed(itemData.name)) return;

        // Filter check
        const passes = this.itemFilter.filterItems([itemData]).length > 0;
        if (!passes) return;

        // Mark processed synchronously to prevent double-processing
        this.dataScraper.addProcessedItem(itemData.name);

        // Queue withdrawal (fire-and-forget, errors caught internally)
        this.processItemFast(itemData, 0).catch(err => {
            console.error(`Observer: error processing ${itemData.name}:`, err);
        });
    } catch (err) {
        console.error('Observer: error in _handleNewCard:', err);
    }
}
```

### Anti-Patterns to Avoid

- **Observing a specific container selector that may not exist yet:** The item list container may not be in the DOM when the bot starts (SPA navigation). Observe `document.body` to be safe.
- **Calling `autoWithdrawItems(filteredItems)` from the observer:** `autoWithdrawItems` calls `getNewItems()` to filter processed items, but it does not atomically mark-then-process. Use `_handleNewCard()` pattern with immediate `addProcessedItem` before any `await`.
- **Removing the fallback poll entirely:** If the observer silently disconnects (SPA navigation), all items are missed. Keep a 10s heartbeat.
- **Calling `scrapeMarketItems()` inside the observer callback:** This queries all `.item-card` elements globally — expensive and unnecessary. The observer already delivers the specific new card. Process only the new card.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MutationObserver wrapper | Custom observer class | Native `MutationObserver` browser API | Already used in `DOMObserver.waitForElement`; battle-tested in this codebase |
| Dedup Set | Custom Map with timestamps | Existing `dataScraper.processedItems` Set | Already cleared every 5s by `autoClearInterval`; reuse directly |
| Item data extraction in observer | Second extraction implementation | Existing `dataScraper.extractItemData(card)` | Already correct and handles all fields |
| Filter application in observer | Inline filter logic | Existing `itemFilter.filterItems([itemData])` | Correct single-item call pattern |

---

## Common Pitfalls

### Pitfall 1: Observer fires for the bot's own UI overlay mutations
**What goes wrong:** The overlay (`#market-scraper-overlay`) is inside `document.body`. Any DOM mutation inside the overlay (status updates, label changes) will trigger the observer callback.
**Why it happens:** `subtree: true` observes all descendants of `document.body`.
**How to avoid:** In the callback, check `node.classList?.contains('item-card')` before processing. The overlay does not contain `.item-card` elements, so false positives will be filtered by the `.item-card` check. The overhead of running the selector check on overlay mutations is negligible.
**Warning signs:** Console logs showing `Observer: error in _handleNewCard` for unexpected elements.

### Pitfall 2: Race condition — two callbacks for the same item before processedItems is set
**What goes wrong:** Observer fires twice rapidly for the same node (Angular re-render). First callback calls `processItemFast()` (async). Before `addProcessedItem()` runs inside `processItemFast()`, the second callback also passes the `isItemProcessed()` check and queues a second `processItemFast()`.
**How to avoid:** Call `addProcessedItem()` synchronously in `_handleNewCard()` BEFORE awaiting `processItemFast()`. (See dedup pattern above.)
**Warning signs:** Console shows same item being attempted twice; "already processed" logs appear after items finish.

### Pitfall 3: Observer not disconnected on stop
**What goes wrong:** `stopPeriodicScan()` clears `this.scanInterval` but does not disconnect the MutationObserver. The observer continues firing and calling `_handleNewCard()` even after the bot is stopped. The `if (!this.isRunning) return` guard prevents actual withdrawals, but CPU cycles are wasted and console fills up.
**How to avoid:** Add `this.domObserver?.disconnect(); this.domObserver = null;` to `stopPeriodicScan()`.
**Warning signs:** Console logs continuing after Stop Sniper is clicked.

### Pitfall 4: Observer target destroyed by SPA navigation
**What goes wrong:** User navigates within CSGORoll (Angular router). The item list container is destroyed and a new one is created. If the observer was attached to the old container, it silently stops working.
**How to avoid:** Observe `document.body` (not a child container). `document.body` persists across SPA navigations in Angular apps. The 10s fallback poll also provides a safety net.
**Warning signs:** Bot stops detecting items after navigating away and back to the market page.

### Pitfall 5: `extractItemData()` throws on partial card renders
**What goes wrong:** Angular may add a `.item-card` element to the DOM before fully populating its children (e.g., the `label[data-test="item-name"]` is empty during initial render). `extractItemData()` returns `name: 'N/A'` for such cards. The bot then marks `'N/A'` as processed, and when the real item renders, the name-based dedup check passes (different name) but the card may be a different element.
**Why it happens:** Angular's incremental rendering may add the card shell before the inner content is hydrated.
**How to avoid:** After extracting `itemData`, check `if (!itemData.name || itemData.name === 'N/A') return;` before proceeding. Skip incomplete cards.
**Warning signs:** Console shows `Item card not found: N/A` or filter passing items with `name: 'N/A'`.

### Pitfall 6: `autoClearInterval` clears processedItems while observer is in flight
**What goes wrong:** The 5-second auto-clear (`startAutoClear(5)`) calls `dataScraper.clearProcessedItems()`. If an item is being processed (inside the async `processItemFast()` call) when the clear fires, the dedup guard is reset. A second observer callback for the same item now passes `isItemProcessed()` and queues a duplicate.
**Why it happens:** 5-second clear interval runs concurrently with async processing.
**How to avoid:** This race existed before Phase 3 and is mitigated by the synchronous `addProcessedItem()` call in `_handleNewCard()` before any `await`. After the sync mark, even if the 5s clear fires and resets the set, the in-flight `processItemFast()` has already committed to completing. A second observer callback would re-add the same item name. The second `processItemFast()` call would then re-validate at line 110 (`filterItems([currentItemData])`) and at `findItemCardByName()`. If the item was already clicked and the modal is open, `findItemCardByName()` will still find the card (it's in the DOM). This is a real risk at the 5s boundary. Mitigation: consider extending autoClear to 30s, or adding an in-flight lock separate from processedItems.
**Warning signs:** "not joinable" errors increasing exactly every 5 seconds.

---

## Code Examples

### MutationObserver setup (adapted from existing DOMObserver pattern)
```javascript
// Source: Pattern from src/utils/dom-observer.js lines 26-39 (DOMObserver.waitForElement)
// This is the persistent (non-one-shot) version for item detection

this.domObserver = new MutationObserver((mutations) => {
    if (!this.isRunning) return;
    for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const cards = node.classList?.contains('item-card')
                ? [node]
                : Array.from(node.querySelectorAll('.item-card'));
            for (const card of cards) {
                this._handleNewCard(card);
            }
        }
    }
});

this.domObserver.observe(document.body, {
    childList: true,
    subtree: true
    // No 'attributes: true' — only childList mutations needed for item detection
    // Adding attributes:true would fire on every DOM attribute change (very noisy)
});
```

### Synchronous dedup guard before async work
```javascript
// Source: pattern required to close race condition in async processItemFast
_handleNewCard(card) {
    try {
        const itemData = this.dataScraper.extractItemData(card);
        if (!itemData.name || itemData.name === 'N/A') return;  // Skip incomplete renders
        if (this.dataScraper.isItemProcessed(itemData.name)) return; // Dedup
        const passes = this.itemFilter.filterItems([itemData]).length > 0;
        if (!passes) return;
        this.dataScraper.addProcessedItem(itemData.name); // Synchronous mark BEFORE await
        this.processItemFast(itemData, 0).catch(err =>
            console.error(`Observer: error processing ${itemData.name}:`, err)
        );
    } catch (err) {
        console.error('Observer: _handleNewCard error:', err);
    }
}
```

### Modified `stopPeriodicScan()` to also disconnect observer
```javascript
// Source: existing src/automation/withdrawal-automation.js lines 70-77
// Modification: add observer disconnect
stopPeriodicScan() {
    if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
    }
    // NEW: disconnect MutationObserver
    if (this.domObserver) {
        this.domObserver.disconnect();
        this.domObserver = null;
    }
    this.isRunning = false;
    this.stopAutoClear();
}
```

### Modified `start()` to use observer-driven scan
```javascript
// Source: existing src/automation/withdrawal-automation.js lines 26-28
// Modification: call startObservedScan() instead of startPeriodicScan(500)
start() {
    this.startObservedScan(); // NEW: observer primary + 10s fallback
    // Previously: this.startPeriodicScan(this.settings.scanInterval);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 500ms setInterval polling | 500ms setInterval polling (still current) | Not yet changed | Phase 3 changes this |
| No MutationObserver for item detection | MutationObserver used only for wait-for-element helpers | - | Phase 3 promotes to primary detection |

**What is already correct (do not change):**
- `DOMObserver.waitForCondition` using `requestAnimationFrame` for withdraw button detection — already optimal
- `DOMObserver.waitForElementEnabled` using MutationObserver on `disabled` attribute — already optimal
- `DOMObserver.waitForPageStability(50, 3000)` for post-click result check — 50ms is justified, do not remove

---

## Open Questions

1. **What is the exact parent container selector for `.item-card` elements?**
   - What we know: Items are `.item-card`; the scraper queries globally with `document.querySelectorAll('.item-card')`
   - What's unclear: The parent container's class/ID on live CSGORoll DOM
   - Recommendation: Observe `document.body` (safe fallback). If performance is a concern after deployment, inspect the live DOM and add a scoped container selector. This is a post-deploy optimization.

2. **Does Angular add `.item-card` elements directly or wrapped in a host element?**
   - What we know: Angular components render as custom HTML elements that may or may not have the host class on the custom element vs. its inner element
   - What's unclear: Whether `mutation.addedNodes` contains the `.item-card` element directly or a parent wrapper
   - Recommendation: Handle both cases in `_handleNewCard`: check `node.classList?.contains('item-card')` AND `node.querySelectorAll('.item-card')`. This is already in the pattern above.

3. **Is the 5s autoClear interval safe with observer-driven processing?**
   - What we know: `startAutoClear(5)` clears `processedItems` every 5s; observer adds items to processedItems synchronously before `await`
   - What's unclear: Whether the 5s boundary creates a real double-withdrawal risk in practice
   - Recommendation: Extend autoClear to 30s or add an in-flight lock (`this.inFlight = new Set()`) as a second dedup layer. Flag for planner to decide.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/automation/withdrawal-automation.js` — full file read; all line numbers verified
- Direct code inspection: `src/scrapers/data-scraper.js` — full file read; all selectors confirmed
- Direct code inspection: `src/filters/item-filter.js` — full file read; filter logic confirmed
- Direct code inspection: `src/utils/dom-observer.js` — full file read; existing MutationObserver patterns confirmed
- Direct code inspection: `src/automation/automation-manager.js` — full file read; lifecycle methods confirmed
- Direct code inspection: `src/automation/market-monitor.js` — full file read; secondary 2s interval confirmed
- Direct code inspection: `src/market-scraper.js` — full file read; start/stop wiring confirmed
- Prior research: `.planning/phases/02-data-layer-correctness/02-RESEARCH.md` — Phase 2 findings used as baseline

### Secondary (MEDIUM confidence)
- None required — all findings from direct source inspection

### Tertiary (LOW confidence)
- Angular SPA MutationObserver behavior (points 1-5 in Angular concerns section): based on general Angular knowledge about zone.js and `*ngFor` rendering patterns. The exact `.item-card` parent container selector requires live DOM inspection.

---

## Metadata

**Confidence breakdown:**
- 500ms interval location: HIGH — lines 17, 19, 47, 53 confirmed by direct file read
- DOM scan target (`.item-card`): HIGH — line 9 of data-scraper.js confirmed
- MutationObserver target (`document.body`): HIGH for safety rationale; MEDIUM for "ideal scoped target" (requires live inspection)
- Hot-path delays: HIGH — all paths traced; 50ms stability wait is the only post-click minimum delay
- Dedup strategy: HIGH — race condition analysis complete; synchronous mark-before-await pattern sound
- Fallback poll decision (10s): HIGH — rationale based on SPA navigation risk
- Angular concerns: MEDIUM — general Angular knowledge; live verification recommended

**Research date:** 2026-02-23
**Valid until:** Stable — no external dependencies. Valid until CSGORoll redesigns its DOM structure (`.item-card` selector changes).
