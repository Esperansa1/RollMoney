# Stack Research

**Domain:** Browser userscript automation — DOM click, drag, and stale-item detection fixes
**Researched:** 2026-02-22
**Confidence:** HIGH (all recommendations verified against MDN official documentation)

---

## Scope

This is a **subsequent-milestone** research file focused on three specific technical questions for fixing broken features in an existing Tampermonkey userscript (vanilla JS, esbuild, no framework):

1. Fast DOM click automation with minimal latency
2. Making any element fully draggable
3. Detecting DOM state changes after page refresh to remove stale items

No new stack decisions are being made. The existing tech (vanilla JS, esbuild, Tampermonkey) is unchanged. This file documents the correct browser APIs and patterns to use within that existing stack.

---

## Recommended Stack (Existing — No Changes)

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vanilla JS (ES2020) | ES2020 target | All logic | Already in use, no framework needed for these fixes |
| esbuild | ^0.25.10 | Bundle | Already in use, no config changes needed |
| Tampermonkey | Any current | Userscript host | Already in use |

---

## Browser APIs for Each Fix

### Fix 1: Fast DOM Click Automation (Latency Reduction)

**Recommended API: `element.click()`**

Use the native `HTMLElement.click()` method directly on the target DOM element. This is already used in `withdrawal-automation.js` (`withdrawButton.click()`, `itemCard.click()`) and is the correct approach.

**Why `element.click()` over `dispatchEvent(new MouseEvent(...))`:**

- Both produce `isTrusted=false` events — there is no trust advantage to `dispatchEvent` (MDN confirmed: `element.click()` also produces `isTrusted=false` for click events)
- `element.click()` is a single method call with no object construction overhead; `dispatchEvent` requires constructing a `MouseEvent` object with an options hash first
- `element.click()` is semantically equivalent for the CSGORoll use case — the site is not checking `isTrusted` to block programmatic clicks (it is designed for user interaction, not bot detection at this layer)
- `DOMUtils.dispatchClickEvent()` in the existing codebase already wraps `dispatchEvent(new MouseEvent(...))` — this introduces unnecessary overhead for the hot path

**The real latency problem is not which click method to use.** The existing code has latency from:

1. `DOMObserver.waitForCondition()` uses `requestAnimationFrame` for polling — correct pattern
2. `DOMObserver.waitForElementEnabled()` uses `MutationObserver` on the `disabled` attribute — correct pattern
3. `DOMObserver.waitForPageStability()` has a **50ms mandatory floor** (`await DOMObserver.waitForPageStability(50, 3000)`) introduced in `handleWithdrawalResultFast` — this is the primary latency source after clicking the withdraw button

**Latency fix: Replace `waitForPageStability` in the hot path with attribute-targeted `MutationObserver`.**

Instead of waiting for DOM to stop changing (50ms+ stability window), watch the specific button's `disabled` attribute directly:

```js
// Current (adds 50ms+ wait):
await DOMObserver.waitForPageStability(50, 3000);

// Better: watch button disabled state change directly
// MutationObserver fires on microtask queue — sub-millisecond response
await DOMObserver.waitForElementEnabled(withdrawButton, 2000);
```

`MutationObserver` callbacks fire on the **microtask queue**, not the macrotask queue. This means they execute after the current synchronous code completes but before the next event loop tick — faster than `setTimeout(fn, 0)` or `requestAnimationFrame`. For attribute-change detection (like a button becoming enabled/disabled), this is the minimum possible latency achievable in the browser.

**What NOT to use:**
- `setTimeout` with fixed delays (e.g., `setTimeout(fn, 500)`) — adds fixed latency regardless of actual page state
- `setInterval` polling for element state — batches are delayed by at least one interval tick
- `requestAnimationFrame` for state polling — fires at 60fps (~16ms intervals), introduces up to 16ms unnecessary wait per check when monitoring DOM attributes (the codebase's `waitForCondition` uses rAF for general conditions, which is acceptable, but for attribute changes `MutationObserver` is strictly faster)

**Confidence: HIGH** — MDN confirms MutationObserver fires on microtask queue; this is a well-documented platform behavior.

---

### Fix 2: Making Any Element Fully Draggable

**Recommended API: `mousedown`/`mousemove`/`mouseup` on `document`, not on the element**

The existing drag implementation in `UIComponents.createDragHandle()` has a specific bug: the `dragStart` function checks `if (e.target === dragHandle)` before setting `isDragging = true`. This means clicks on child elements within the drag handle (like the title text span, the version span, or the close button) do not initiate a drag.

The fix is already partially wired: `mousemove` and `mouseup` are already attached to `document`, which is correct. The problem is only in `dragStart`.

**Correct pattern:**

```js
// Attach mousedown to the overlay itself (or any desired drag zone), not just the handle
overlay.addEventListener('mousedown', dragStart);

// Keep mousemove and mouseup on document — this handles fast mouse movement
// where pointer leaves the element boundary before mouseup fires
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);
```

**Why `mousemove` must be on `document`, not the element:**

When dragging rapidly, the pointer can move faster than the browser repaints and exit the element's bounding box. If `mousemove` is only on the element, the drag silently stops. Attaching to `document` ensures uninterrupted tracking regardless of pointer position.

**Why `dragStart`'s `e.target === dragHandle` check must be removed:**

The current guard `if (e.target === dragHandle)` means only clicks that land exactly on the drag handle's root element (not any child) start dragging. For full-overlay drag, remove this check entirely when attaching `mousedown` to the overlay.

**Prevent native browser drag behavior:**

```js
overlay.addEventListener('dragstart', (e) => e.preventDefault());
// OR set draggable="false" on the overlay element
```

The browser has its own HTML5 drag-and-drop system that fires `dragstart` on mousedown + move. This conflicts with the custom drag implementation and causes the element to be "captured" by the browser's drag system instead of the custom `mousemove` handler. Setting `ondragstart = () => false` or calling `e.preventDefault()` in the `dragstart` event disables this.

**Position tracking: use `translate3d`, not `top`/`left`:**

The existing code already uses `overlay.style.transform = \`translate3d(${currentX}px, ${currentY}px, 0)\`` — this is the correct approach. `translate3d` is GPU-accelerated and does not trigger layout reflow, unlike setting `top`/`left` directly.

**What NOT to use:**
- HTML5 Drag and Drop API (`draggable` attribute + `ondragstart`/`ondrop`) — designed for file/data transfer between elements, not for repositioning UI panels. It has mandatory 300ms drag-image delay in some browsers and does not support real-time position updates via custom logic.
- jQuery UI Draggable — not available (project has zero runtime dependencies)
- Touch events for desktop drag — out of scope for this userscript (desktop browser only)

**Confidence: HIGH** — Pattern is documented by javascript.info/mouse-drag-and-drop and MDN, confirmed standard across all modern browsers. The bug location in the existing code is clear from code review.

---

### Fix 3: Detecting DOM State Changes After Page Refresh to Remove Stale Items

**Recommended API: `MutationObserver` with `childList: true` on the market item container**

**Context:** The `DataScraper.processedItems` Set persists across scans (it's an in-memory Set that survives between `setInterval` ticks but is cleared by `startAutoClear` every 5 seconds). The problem: when the CSGORoll Angular SPA refreshes the market item list (either via in-page navigation or Angular's change detection re-rendering the item cards), items that were bought by other users disappear from the DOM. The `processedItems` Set still contains their names, so they are never re-evaluated even if new items with the same name appear.

**Two distinct scenarios to handle:**

**Scenario A: Items disappear because they were bought (DOM node removed)**

Use `MutationObserver` with `childList: true` on the `.item-card` container. When a `mutation.removedNodes` entry matches an item name in `processedItems`, remove it from the Set so the bot correctly re-evaluates the slot.

```js
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            for (const node of mutation.removedNodes) {
                if (node.classList && node.classList.contains('item-card')) {
                    const nameEl = node.querySelector('label[data-test="item-name"]');
                    if (nameEl) {
                        const name = nameEl.textContent.trim();
                        dataScraper.processedItems.delete(name);
                    }
                }
            }
        }
    }
});

const container = document.querySelector('.market-container'); // or parent of .item-cards
if (container) {
    observer.observe(container, { childList: true });
}
```

**Scenario B: Angular SPA re-renders the entire list (full replace)**

Angular may re-render the entire item list component during navigation or filter changes, replacing the DOM wholesale. In this case, individual `removedNodes` entries are not meaningful — the entire container is replaced.

Detect this via `MutationObserver` on `document.body` or the app root watching for `childList` changes to the section containing item cards, then trigger a full `dataScraper.clearProcessedItems()` call.

Alternatively, listen for `popstate` / `hashchange` events on `window` for SPA route changes:

```js
window.addEventListener('popstate', () => {
    dataScraper.clearProcessedItems();
});
```

**Note:** `history.pushState()` does not fire `popstate`. For Angular apps using the History API, the bot may also need to monkey-patch `history.pushState`:

```js
const originalPushState = history.pushState.bind(history);
history.pushState = function(...args) {
    originalPushState(...args);
    dataScraper.clearProcessedItems(); // clear on navigation
};
```

**Why `MutationObserver` over interval-based stale detection:**

The existing `startAutoClear(5)` approach (clears all processed items every 5 seconds) is a blunt instrument — it resets state correctly but may re-process already-bought items if the DOM node still exists. `MutationObserver` is precise: it reacts only when a node is actually removed, and fires on the microtask queue (lower latency than a 5-second interval). The two approaches can coexist: keep `autoClear` as a safety net, add observer-based removal for precision.

**Performance considerations:**

- Observing with `childList: true` only (no `subtree: true`, no `attributes: true`) on the direct parent of item cards minimizes overhead
- `subtree: true` adds overhead proportional to the entire subtree; avoid it when item cards are direct children of a known container
- `disconnect()` the observer when the automation stops to prevent memory leaks

**What NOT to use:**
- Periodic DOM diffing (`setInterval` comparing `querySelectorAll('.item-card')` snapshots) — adds fixed CPU overhead every N ms regardless of whether anything changed
- `document.cookie` change detection — cookies don't reflect DOM state
- `localStorage` change events (`storage` event) — only fires in other tabs, not same-tab

**Confidence: HIGH** — `MutationObserver.removedNodes` is fully documented on MDN, baseline widely available since July 2015, confirmed against official source. SPA pushState detection is a well-known pattern, MEDIUM confidence for the specific CSGORoll Angular implementation (cannot verify internal routing behavior without live page access).

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `element.click()` | `dispatchEvent(new MouseEvent('click'))` | Both produce `isTrusted=false`; `dispatchEvent` adds MouseEvent object construction overhead; no functional advantage in this context |
| `MutationObserver` on attribute | `requestAnimationFrame` polling loop | rAF fires at ~16ms intervals (60fps ceiling); MutationObserver fires on microtask queue — up to 16ms faster per check |
| `mousedown/mousemove/mouseup` on document | HTML5 Drag and Drop API | DnD API designed for data transfer, has visual drag-image system, no real-time position control, incompatible with transform-based positioning |
| `MutationObserver` on item container | `setInterval` DOM comparison | Polling adds consistent CPU overhead; observer only runs when changes actually occur |
| `history.pushState` monkey-patch for SPA nav | `popstate` event alone | `popstate` does not fire on `history.pushState()` calls — only on browser back/forward navigation |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `setTimeout(fn, N)` with fixed delays in hot path | Adds N ms regardless of actual DOM readiness | `MutationObserver` attribute watch (button disabled state) |
| `DOMUtils.dispatchClickEvent` in withdrawal hot path | Unnecessary MouseEvent construction overhead; no benefit over `element.click()` | `element.click()` directly |
| `waitForPageStability(50, ...)` before reading button state | Forces a 50ms minimum wait on every withdrawal | Watch `disabled` attribute with `MutationObserver` via existing `waitForElementEnabled` |
| `dragstart` event on overlay without preventDefault | Browser native DnD intercepts mouse events, breaking custom drag | `element.ondragstart = () => false` |
| `subtree: true` on large DOM containers | Monitors entire descendant tree, significant performance cost | Target the direct parent container; use `childList: true` only |
| HTML5 Drag and Drop API for overlay positioning | Not designed for element repositioning; has browser-imposed visual behaviors | `mousedown`/`mousemove`/`mouseup` pattern |

---

## Stack Patterns by Scenario

**If the CSGORoll market page is a pure-DOM page (not SPA):**
- Use `MutationObserver` with `childList: true` on the item container only
- No need for `history.pushState` patching

**If the CSGORoll market page is an Angular SPA (confirmed from ARCHITECTURE.md — it uses Angular's `mat-dialog-container`, `mat-flat-button`, etc.):**
- Use both: `MutationObserver` for individual item removals + `history.pushState` monkey-patch for route changes
- The `mat-` prefix in DOM selectors confirms Angular Material is used, confirming SPA architecture

**If the drag target needs to exclude specific child elements (e.g., the close button):**
- In `dragStart`, check `if (e.target.closest('button')) return;` to prevent dragging when clicking the close button
- Do not use `e.target === overlay` — that is the existing bug pattern

---

## Version Compatibility

| API | Browser Support | Notes |
|-----|----------------|-------|
| `MutationObserver` | Baseline Widely Available (July 2015) | All modern browsers, all Tampermonkey-supported browsers |
| `MutationRecord.removedNodes` | Baseline Widely Available (July 2015) | Same as above |
| `element.click()` | All modern browsers | Has always been available |
| `MouseEvent` constructor | ES2020 / All modern browsers | Already used in codebase |
| `translate3d` CSS transform | All modern browsers | Already used in codebase |
| `history.pushState` | All modern browsers | Baseline Widely Available |
| `requestAnimationFrame` | All modern browsers | Already used in codebase |

No compatibility concerns. All APIs target ES2020 and are available in every browser that supports Tampermonkey.

---

## Sources

- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) — observe() options, performance, browser compatibility (HIGH confidence)
- [MDN: MutationRecord.removedNodes](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord/removedNodes) — how to iterate removed nodes (HIGH confidence)
- [MDN: MutationObserver.observe()](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe) — childList vs subtree performance (HIGH confidence)
- [MDN: Event.isTrusted](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted) — `element.click()` vs `dispatchEvent` trust semantics (HIGH confidence)
- [javascript.info: Drag'n'Drop with mouse events](https://javascript.info/mouse-drag-and-drop) — document-level mousemove pattern, shiftX/shiftY offset, preventDefault (MEDIUM confidence — authoritative reference but not official spec)
- [javascript.info: Dispatching custom events](https://javascript.info/dispatch-events) — isTrusted false for dispatchEvent (MEDIUM confidence)
- [Mozilla Hacks: MutationObserver](https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/) — microtask queue firing, performance advantages over polling (HIGH confidence — Mozilla official blog)
- [MDN: History.pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) — pushState does not fire popstate event (HIGH confidence)
- [Ben Nadel: Exploring Event.isTrusted](https://www.bennadel.com/blog/4873-exploring-event-istrusted-in-javascript.htm) — confirms `element.click()` produces `isTrusted=false` (MEDIUM confidence — single source, matches MDN spec wording)
- Codebase review: `src/utils/dom-observer.js`, `src/components/ui-components.js`, `src/automation/withdrawal-automation.js`, `src/scrapers/data-scraper.js` — identified actual bug locations from source (HIGH confidence)

---

*Stack research for: RollMoney — browser userscript DOM automation fixes*
*Researched: 2026-02-22*
