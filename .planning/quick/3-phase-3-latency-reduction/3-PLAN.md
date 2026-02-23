---
phase: 03-latency-reduction
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/automation/withdrawal-automation.js
autonomous: true
requirements:
  - SPEED-01
must_haves:
  truths:
    - "A matching item appearing in the DOM triggers a withdrawal attempt in under 100ms (MutationObserver fires synchronously on childList mutation, not after a 500ms poll tick)"
    - "The fallback 10s poll catches any items the observer missed — bot never goes fully blind"
    - "Stopping the bot disconnects the observer — no callbacks fire after Stop Sniper is clicked"
    - "Items that appear while already-processed are silently skipped — no duplicate withdrawal attempts at observer speed"
    - "Partial Angular renders (name === 'N/A') are skipped — no 'N/A processed' noise in the dedup set"
  artifacts:
    - path: "src/automation/withdrawal-automation.js"
      provides: "Observer-driven detection with 10s fallback poll"
      contains: "startObservedScan"
  key_links:
    - from: "MutationObserver callback"
      to: "_handleNewCard(card)"
      via: "addedNodes iteration with .item-card check"
      pattern: "_handleNewCard"
    - from: "_handleNewCard"
      to: "dataScraper.addProcessedItem"
      via: "synchronous call before processItemFast await"
      pattern: "addProcessedItem.*name"
    - from: "stopPeriodicScan"
      to: "this.domObserver.disconnect()"
      via: "null-safe disconnect call"
      pattern: "domObserver.*disconnect"
---

<objective>
Replace the 500ms polling interval with a MutationObserver as the primary item detection path, demoting the poll to a 10s fallback heartbeat.

Purpose: Time between a matching item appearing in the DOM and the bot clicking withdraw drops from up to 500ms to near-zero. The observer fires synchronously when Angular inserts a new `.item-card` element.
Output: Modified `src/automation/withdrawal-automation.js` with `startObservedScan()`, `_handleNewCard()`, updated `stopPeriodicScan()`, and extended autoClear (30s).
</objective>

<execution_context>
@C:/Users/oresp/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/oresp/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-latency-reduction/03-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add MutationObserver primary detection path and extend autoClear to 30s</name>
  <files>src/automation/withdrawal-automation.js</files>
  <action>
Make the following changes to `src/automation/withdrawal-automation.js`:

**1. Constructor: add `this.domObserver = null` field**

After the existing `this.scanInterval = null;` line (line 10), add:
```javascript
this.domObserver = null;
```

Also change `this.interval = 500` (line 17) to `this.interval = 10000` and `scanInterval: 500` (line 19) to `scanInterval: 10000` so the AutomationManager integration field stays consistent.

**2. `start()`: call `startObservedScan()` instead of `startPeriodicScan(500)`**

Replace:
```javascript
start() {
    this.startPeriodicScan(this.settings.scanInterval);
}
```
With:
```javascript
start() {
    this.startObservedScan();
}
```

**3. Add new method `startObservedScan()` directly above `startPeriodicScan()`**

```javascript
startObservedScan() {
    // Start fallback heartbeat poll at 10s (catches mutations missed by the observer,
    // e.g. after Angular SPA navigation destroys and recreates the item list)
    this.startPeriodicScan(10000);

    // Primary: MutationObserver for near-zero detection latency
    this.domObserver = new MutationObserver((mutations) => {
        if (!this.isRunning) return;

        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;

            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                // Handle both: node IS .item-card, or node CONTAINS .item-card children
                // (Angular may add the host element rather than the .item-card directly)
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
        // No attributes:true — we only need childList to detect new item-card nodes
    });
}
```

**4. Add new method `_handleNewCard(card)` directly after `startObservedScan()`**

```javascript
_handleNewCard(card) {
    try {
        const itemData = this.dataScraper.extractItemData(card);

        // Skip incomplete Angular renders — name is not yet hydrated
        if (!itemData.name || itemData.name === 'N/A') return;

        // Dedup check: if already processed or in-flight, skip
        if (this.dataScraper.isItemProcessed(itemData.name)) return;

        // Filter check: does this item pass the current filter config?
        const passes = this.itemFilter.filterItems([itemData]).length > 0;
        if (!passes) return;

        // Mark processed SYNCHRONOUSLY before any await to prevent duplicate processing
        // if the observer fires a second time for the same node before processItemFast resolves
        this.dataScraper.addProcessedItem(itemData.name);

        // Fire withdrawal attempt (fire-and-forget; processItemFast handles its own errors)
        this.processItemFast(itemData, 0).catch(err =>
            console.error(`Observer: error processing ${itemData.name}:`, err)
        );
    } catch (err) {
        console.error('Observer: _handleNewCard error:', err);
    }
}
```

**5. `stopPeriodicScan()`: disconnect the observer**

After `this.scanInterval = null;`, add observer disconnect:

```javascript
stopPeriodicScan() {
    if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
    }
    // Disconnect MutationObserver so callbacks stop firing after bot is stopped
    if (this.domObserver) {
        this.domObserver.disconnect();
        this.domObserver = null;
    }
    this.isRunning = false;
    this.stopAutoClear();
}
```

**6. `startPeriodicScan()`: extend autoClear from 5s to 30s**

Change the `this.startAutoClear(5)` call at line 67 to:
```javascript
this.startAutoClear(30);
```

Rationale: the full async processing chain (click → modal render → waitForCondition → waitForElementEnabled → click) can take up to ~3s. A 5s clear window is dangerously close to in-flight items. 30s gives a safe buffer while still eventually freeing memory.
  </action>
  <verify>
Run `npm run build` — must exit 0 with no errors.

Visually inspect the built output to confirm the new methods are present:
- `grep -n "startObservedScan\|_handleNewCard\|domObserver" dist/index.bundle.js` should return matches for all three identifiers.
  </verify>
  <done>
`npm run build` exits 0. `dist/index.bundle.js` contains `startObservedScan`, `_handleNewCard`, and `domObserver`. The bot's `start()` now calls `startObservedScan()`. The fallback poll runs at 10000ms. `stopPeriodicScan()` disconnects the observer. autoClear runs at 30s.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` exits 0 — no syntax or import errors.
2. `grep -n "startObservedScan\|_handleNewCard\|domObserver" dist/index.bundle.js` returns hits for all three.
3. `grep -n "startAutoClear(30)" dist/index.bundle.js` returns a match (not 5).
4. `grep -n "startObservedScan" dist/index.bundle.js` confirms `start()` calls it directly.
5. `grep -n "scanInterval.*10000\|10000.*scanInterval\|startPeriodicScan(10000)" dist/index.bundle.js` confirms the 10s fallback.
</verification>

<success_criteria>
Phase 3 SPEED-01 is satisfied when:
- A matching `.item-card` added to the DOM triggers `_handleNewCard()` synchronously via MutationObserver — detection latency drops from up to 500ms to near-zero
- The 10s fallback poll catches any items the observer missed (SPA navigation, zone.js edge cases)
- `stop()` disconnects the observer — no callbacks fire after the bot is stopped
- Duplicate items (same name, rapid re-render) are suppressed by the synchronous `addProcessedItem()` guard before any `await`
- Partial Angular renders (`name === 'N/A'`) are silently skipped
</success_criteria>

<output>
After completion, create `.planning/quick/3-phase-3-latency-reduction/3-SUMMARY.md` using the summary template at `@C:/Users/oresp/.claude/get-shit-done/templates/summary.md`.
</output>
