# Phase 1: UI Fixes - Research

**Researched:** 2026-02-22
**Domain:** Browser DOM event handling, UI state wiring in a vanilla JS userscript
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Valid range: 0–100% only (reject anything outside this range)
- Decimal values are allowed (e.g., 5.5%, 12.75%)
- Invalid input (negative, letters, out of range): show an error message, do not apply
- Empty field on Apply: block apply and show an error (do not revert silently)

### Claude's Discretion
- Apply button behavior (feedback, whether sniper needs restart) — handle sensibly
- Drag exclusion zones (buttons, inputs, tabs should not trigger drag) — standard approach
- Drag visual/cursor feedback — whatever is appropriate for the existing UI style
- Error message format and placement — match existing notification/alert patterns in the codebase

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FILT-01 | User can set a percentage value in the UI and have it immediately applied to item filtering (instead of the hardcoded 5.1% default) | Root cause identified: Apply button wires to `MarketMonitor.updatePriceThreshold()` only, never updates `ItemFilter.baseFilters.maxPercentageChange`. Fix is a one-line call to `itemFilter.updateBaseFilters()` inside the Apply handler. |
| DRAG-01 | User can grab and drag the overlay from any point on its surface (not just the title/handle area) | Root cause identified: `dragStart` guard `if (e.target === dragHandle)` blocks drag when the event target is a child element. Fix is to move drag listeners to the overlay element and filter out interactive targets. |
</phase_requirements>

---

## Summary

Both bugs are pure wiring failures — the UI controls exist, the backend logic exists, but they are not connected to each other.

**FILT-01:** The "Alert Threshold" input and its Apply button in `createSniperControls()` (`src/market-scraper.js:296`) call `marketMonitor.updatePriceThreshold(newThreshold)`. This updates `MarketMonitor.settings.priceThreshold` (used only for alert generation in `checkPriceAlerts`). It never touches `ItemFilter.baseFilters.maxPercentageChange` — the value that `passesBaseFilter()` actually checks when deciding whether an item passes. That property is hardcoded to `5.1` in `ItemFilter` constructor (`src/filters/item-filter.js:7`) and is only updatable via `itemFilter.updateBaseFilters()`. The fix is one additional call inside the Apply handler.

**DRAG-01:** Drag logic lives in `UIComponents.createDragHandle()` (`src/components/ui-components.js:102`). The `dragStart` handler fires on `mousedown` of the drag handle `div`, but only sets `isDragging = true` when `e.target === dragHandle`. When the user clicks a child element inside the handle (the title span, version span, etc.), `e.target` is that child — not `dragHandle` — so `isDragging` stays false. The wider requirement (drag from anywhere on the overlay surface, not just the title area) means the `mousedown` listener must move to the `overlay` element itself, while interactive child elements (buttons, inputs, selects, textareas, anchors) must be excluded.

**Primary recommendation:** Fix FILT-01 by adding one `itemFilter.updateBaseFilters()` call with validation in the Apply handler. Fix DRAG-01 by moving `mousedown` to the overlay and using a target allowlist/denylist to exclude interactive elements.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS DOM APIs | Browser built-in | Event handling, element manipulation | No dependencies in project; esbuild bundles ES6 modules only |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `localStorage` | Browser built-in | Persisting threshold value across sessions | Already used by `MarketMonitor.loadPriceThreshold()` / `updatePriceThreshold()` |
| `UIComponents.showNotification()` | Project internal | In-overlay toast messages | Already used for all user feedback — match this for validation errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Modifying existing Apply button handler | Adding a separate observer/event | Adding to existing handler is simpler; observer would add indirection with no benefit |
| Moving drag to overlay element | Cloning and re-emitting from child elements | Moving to overlay is the standard approach; re-emitting is fragile and verbose |

**Installation:** No new packages needed. This is vanilla JS only.

---

## Architecture Patterns

### Recommended Project Structure

No new files or folders needed. All changes are confined to existing files:

```
src/
├── filters/item-filter.js            # FILT-01: updateBaseFilters() already exists, just needs to be called
├── market-scraper.js                 # FILT-01: Apply button handler + input validation go here
└── components/ui-components.js       # DRAG-01: drag logic lives here
```

### Pattern 1: FILT-01 — Wiring the threshold input to ItemFilter

**What:** The Apply button handler must (a) validate the input, (b) call `itemFilter.updateBaseFilters({ maxPercentageChange: value })`, (c) also call `marketMonitor.updatePriceThreshold(value / 100)` to keep both systems in sync, (d) show a success or error notification.

**Existing infrastructure:**
- `ItemFilter.updateBaseFilters(filters)` at `src/filters/item-filter.js:19` — merges provided keys into `this.baseFilters`. Already handles partial updates.
- `MarketMonitor.updatePriceThreshold(newThreshold)` at `src/automation/market-monitor.js:199` — stores as fraction (0–1), persists to localStorage.
- `UIComponents.showNotification(message, type)` — existing toast system.
- `this.itemFilter` is available in `market-scraper.js` scope where the Apply handler is defined.

**Where the handler is defined:**
```
src/market-scraper.js, createSniperControls(), lines 296-311
```

**Current broken handler (lines 296-311):**
```js
const applyBtn = UIComponents.createButton('Apply', 'primary', 'sm', () => {
    const newThreshold = parseFloat(thresholdInput.value) / 100;
    const marketMonitor = this.automationManager.getAutomation('market-monitor');
    if (marketMonitor && marketMonitor.updatePriceThreshold) {
        marketMonitor.updatePriceThreshold(newThreshold);
        // ... visual feedback ...
    }
    // BUG: ItemFilter.baseFilters.maxPercentageChange is never updated
});
```

**Fixed handler pattern:**
```js
const applyBtn = UIComponents.createButton('Apply', 'primary', 'sm', () => {
    const rawValue = thresholdInput.value.trim();

    // Validation: empty
    if (rawValue === '') {
        UIComponents.showNotification('Threshold cannot be empty', 'error');
        return;
    }

    const parsed = parseFloat(rawValue);

    // Validation: not a number
    if (isNaN(parsed)) {
        UIComponents.showNotification('Invalid threshold: must be a number', 'error');
        return;
    }

    // Validation: range 0–100
    if (parsed < 0 || parsed > 100) {
        UIComponents.showNotification('Threshold must be between 0 and 100', 'error');
        return;
    }

    // Apply to ItemFilter (the actual item filter — maxPercentageChange is in %)
    this.itemFilter.updateBaseFilters({ maxPercentageChange: parsed });

    // Keep MarketMonitor in sync (its priceThreshold is stored as a fraction)
    const marketMonitor = this.automationManager.getAutomation('market-monitor');
    if (marketMonitor && marketMonitor.updatePriceThreshold) {
        marketMonitor.updatePriceThreshold(parsed / 100);
    }

    // Visual feedback
    UIComponents.showNotification(`Threshold set to ${parsed}%`, 'success');
    const originalText = applyBtn.textContent;
    applyBtn.textContent = '✓ Applied';
    applyBtn.style.backgroundColor = Theme.colors.success;
    setTimeout(() => {
        applyBtn.textContent = originalText;
        applyBtn.style.backgroundColor = '';
    }, 1500);
});
```

**Units clarification (confirmed from source):**
- `ItemFilter.baseFilters.maxPercentageChange` is compared via `parsePercentage()` which returns an absolute percentage number (e.g., 5.1, not 0.051). The UI input is already in % units. Pass directly.
- `MarketMonitor.settings.priceThreshold` is stored as a fraction (0.05 = 5%). Divide by 100.

### Pattern 2: DRAG-01 — Full-surface drag with exclusion zones

**What:** Move the `mousedown` event listener from the drag handle child `div` to the overlay `div` itself. In the `dragStart` handler, check whether the click target is an interactive element — if so, skip dragging.

**Existing infrastructure:**
- The `overlay` element is available as the first argument to `createDragHandle()`.
- The drag state variables (`isDragging`, `xOffset`, `yOffset`, `initialX`, `initialY`, `currentX`, `currentY`) are already scoped in the closure.
- `document` listeners for `mousemove` and `mouseup` are already set up correctly — they do not need to change.
- The `dragHandle` title bar element can remain as-is for visual styling (the "grab" cursor on the header is fine). The functional drag just needs to extend to the whole overlay.

**Root cause (confirmed from source, ui-components.js:105):**
```js
const dragStart = (e) => {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === dragHandle) {   // <-- BUG: only sets isDragging when exact target is dragHandle
        isDragging = true;
    }
};
DOMUtils.addEventListeners(dragHandle, { mousedown: dragStart });
// dragHandle is the title bar div — child spans never match e.target === dragHandle
```

**Standard exclusion approach:**
Use a `closest()` check to skip interactive elements that should handle their own click events:

```js
const DRAG_EXCLUDED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A']);

const dragStart = (e) => {
    // Do not start drag when clicking interactive elements
    if (DRAG_EXCLUDED_TAGS.has(e.target.tagName)) return;
    if (e.target.closest('button, input, textarea, select, a')) return;

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
};

// Move listener from dragHandle to overlay
DOMUtils.addEventListeners(overlay, { mousedown: dragStart });
```

**Cursor feedback:** The overlay already has `cursor: 'move'` applied in `createOverlay()` (`ui-components.js:11`). The drag handle has `cursor: 'grab'`. These remain correct. When excluding interactive child elements, the cursor on those elements will override naturally (browsers show the element's own cursor on hover). No extra cursor logic needed.

**Position persistence:** Already works via the existing `onPositionSave` callback and `onDragEnd` callback passed from `setupOverlayComponents()` in `market-scraper.js`. No change needed.

### Anti-Patterns to Avoid

- **Listening on `document` for `mousedown`:** Would intercept clicks everywhere on the page, not just the overlay. Use `overlay` as the listener target.
- **Using `e.stopPropagation()` on child elements:** Fragile — requires modifying every child. The exclusion check at the `dragStart` level is the correct approach.
- **Calling `updateBaseFilters` without validation:** The `updateBaseFilters` method on `ItemFilter` does a simple merge — it does not validate. Validation must happen in the Apply handler before calling it.
- **Silent revert on invalid input:** Locked decision says empty field must block apply and show error, not revert silently. Do not reset the input value on error.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast/notification display | Custom notification component | `UIComponents.showNotification(msg, type)` | Already exists, already styled, already used for all user feedback |
| DOM element styling | Inline style attributes | `DOMUtils.createElement(tag, styles, attrs)` | Already used everywhere; maintains consistency |
| localStorage persistence | Custom serialization | Direct `localStorage.setItem/getItem` | Already the pattern in `MarketMonitor` |

**Key insight:** Both fixes are wiring problems, not missing infrastructure. No new utilities are needed.

---

## Common Pitfalls

### Pitfall 1: Units Mismatch Between ItemFilter and MarketMonitor
**What goes wrong:** Developer passes the UI value (e.g., 5.1) directly to `updatePriceThreshold()` which expects a fraction (0.051). Result: MarketMonitor threshold is set to 510%, effectively disabling all alerts.
**Why it happens:** The two systems use different units. `ItemFilter.passesBaseFilter()` uses raw % numbers directly. `MarketMonitor.checkPriceAlerts()` uses fractions from `priceHistory` calculations.
**How to avoid:** Always divide by 100 before passing to `updatePriceThreshold`. Pass the raw parsed value to `updateBaseFilters`.
**Warning signs:** Check `MarketMonitor.loadPriceThreshold()` default — it returns `0.05` (fraction). UI input shows `5.0` (percent). These are the same conceptual value in different units.

### Pitfall 2: dragStart Listener Remaining on dragHandle
**What goes wrong:** If the listener is added to overlay but the old listener on `dragHandle` is not removed, both fire — causing double-tracking of drag position.
**Why it happens:** It's easy to add to overlay without removing from dragHandle.
**How to avoid:** Remove `DOMUtils.addEventListeners(dragHandle, { mousedown: dragStart })` and replace with `DOMUtils.addEventListeners(overlay, { mousedown: dragStart })`. The two calls are adjacent at `ui-components.js:132-136`.
**Warning signs:** Overlay moves twice as fast as the cursor when dragging.

### Pitfall 3: Apply Handler Closure Captures Stale `itemFilter` Reference
**What goes wrong:** `this.itemFilter` in the Apply button closure refers to the correct `MarketItemScraper` instance only if the handler is defined as an arrow function inside a method (which it is). If ever refactored to a standalone function, `this` would be wrong.
**Why it happens:** JavaScript closure scoping.
**How to avoid:** No change needed for the current code — the Apply handler is defined inside `createSniperControls()` which is called as a method of `MarketItemScraper`, and the button callback uses `() =>` which captures `this` correctly.

### Pitfall 4: Validation Firing on MarketMonitor Before Checking if it Exists
**What goes wrong:** If `market-monitor` automation hasn't been registered or has been stopped and cleaned up, `getAutomation('market-monitor')` returns null. Calling `.updatePriceThreshold()` on null throws.
**Why it happens:** The current code has a null check (`if (marketMonitor && marketMonitor.updatePriceThreshold)`) which is correct. The fix must preserve this guard.
**How to avoid:** Keep the null guard. `updateBaseFilters` on `this.itemFilter` has no such risk since `itemFilter` is always set in the constructor.

### Pitfall 5: `parseFloat` Accepts Partial Strings
**What goes wrong:** `parseFloat('5abc')` returns `5` without error. An input value of `'5abc'` would pass `isNaN()` check and be applied.
**Why it happens:** `parseFloat` is lenient about trailing non-numeric characters.
**How to avoid:** After parsing, verify the string representation matches the number: use `String(parsed) === rawValue` or check that `rawValue` matches a numeric pattern. Alternatively, use `Number(rawValue)` which is stricter — `Number('5abc')` returns `NaN`. The input already has `type="number"` which helps, but JavaScript validation should not rely solely on the browser's UI constraint.

---

## Code Examples

Verified patterns from the existing codebase:

### Existing updateBaseFilters call signature (item-filter.js:19-21)
```js
updateBaseFilters(filters) {
    this.baseFilters = { ...this.baseFilters, ...filters };
}
```
Called as: `this.itemFilter.updateBaseFilters({ maxPercentageChange: 5.1 })`

### Existing notification call pattern (market-scraper.js:376)
```js
UIComponents.showNotification('Market Sniper started successfully!', 'success');
// Types: 'success', 'error', 'warning', 'info'
```

### Existing drag handler location (ui-components.js:132-136)
```js
DOMUtils.addEventListeners(dragHandle, { mousedown: dragStart });   // line 132 — CHANGE to overlay
DOMUtils.addEventListeners(document, {
    mouseup: dragEnd,
    mousemove: drag
});
```

### Existing overlay creation (ui-components.js:6-15)
```js
static createOverlay() {
    return DOMUtils.createElement('div', {
        ...getOverlayStyles(),
        top: '20px',
        right: '20px',
        cursor: 'move'       // cursor already set on overlay
    }, {
        id: 'market-scraper-overlay'
    });
}
```

### Existing input element for threshold (market-scraper.js:280-289)
```js
const thresholdInput = UIComponents.createInput('number', {
    width: '60px',
    fontSize: Theme.typography.fontSize.xs
}, {
    min: '0.1',
    max: '100',
    step: '0.1',
    value: '5.0',
    id: 'sniper-price-threshold-input'
});
```
Note: `min` is `'0.1'` but the user decision allows `0`. This attribute should be updated to `'0'` to allow `0%`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drag only from title bar handle | Drag from entire overlay surface | Phase 1 fix | Users can drag from anywhere |
| Hardcoded 5.1% filter threshold | User-configurable via UI input | Phase 1 fix | Threshold actually respected |

**Deprecated/outdated:**
- The `xOffset`/`yOffset` on `dragHandle.xOffset` / `dragHandle.yOffset` properties: These are stored as properties directly on the DOM element. After moving drag to overlay, these can move to the overlay element or remain in the closure (closure is cleaner).

---

## Open Questions

1. **Should the threshold input also initialize from `ItemFilter.baseFilters.maxPercentageChange`?**
   - What we know: Currently the input initializes to `'5.0'` (hardcoded in the attribute). `ItemFilter` defaults to `5.1`. `MarketMonitor` loads from localStorage (defaulting to `0.05` fraction = `5%`). Three different default values exist.
   - What's unclear: Which value should be the "source of truth" on page load?
   - Recommendation: On overlay creation, read from `this.itemFilter.baseFilters.maxPercentageChange` and set `thresholdInput.value` to that value. This makes the display consistent with the actual active filter.

2. **Should the fixed `min` attribute on the threshold input be changed to `'0'`?**
   - What we know: User decision allows `0–100%`. The input currently has `min: '0.1'`.
   - What's unclear: Is 0% a useful threshold? (It would match all items.)
   - Recommendation: Change `min` to `'0'` to honor the locked decision of 0–100 range.

---

## Sources

### Primary (HIGH confidence)
- Direct source read: `src/filters/item-filter.js` — confirmed `maxPercentageChange: 5.1` hardcoded in constructor, `updateBaseFilters()` available
- Direct source read: `src/market-scraper.js` — confirmed Apply button handler calls only `marketMonitor.updatePriceThreshold()`, never `itemFilter.updateBaseFilters()`
- Direct source read: `src/components/ui-components.js` — confirmed `dragStart` guard `if (e.target === dragHandle)` is root cause of DRAG-01
- Direct source read: `src/automation/market-monitor.js` — confirmed `priceThreshold` stored as fraction; `updatePriceThreshold()` persists to localStorage

### Secondary (MEDIUM confidence)
- Standard browser DOM pattern: `e.target.closest('button, input, ...')` for drag exclusion zones — widely documented pattern, no library needed

---

## Metadata

**Confidence breakdown:**
- Root causes: HIGH — both confirmed by direct source read
- Fix patterns: HIGH — based on existing code patterns in the project
- Pitfalls: HIGH — derived from direct inspection of actual code and data flows

**Research date:** 2026-02-22
**Valid until:** Stable indefinitely (no external dependencies, pure internal wiring fix)
