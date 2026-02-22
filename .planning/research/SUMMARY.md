# Project Research Summary

**Project:** RollMoney (TamirMakeMoney)
**Domain:** Browser userscript automation — DOM click, drag, timing, and state-management bug fixes
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

RollMoney is a Tampermonkey userscript that automates market sniping on CSGORoll.com and item selling via the Steam trade interface. The project is already built and running; this milestone is a focused bug-fix effort covering 5 discrete broken features. No stack changes are needed — the existing vanilla JS + esbuild + Tampermonkey setup is the correct and final approach. All 5 bugs have known root causes derived from direct source-code analysis, and all fixes are confined to existing files with existing patterns. No new infrastructure, dependencies, or architectural components are required.

The recommended fix sequence follows a dependency chain: stale-item filtering (Fix 5) must precede latency reduction (Fix 2) because faster scanning without stale-item pruning causes the bot to attempt withdrawals on already-sold items at higher frequency. The percentage filter wiring (Fix 1) and overlay drag (Fix 3) are fully independent and low-complexity, making them ideal first targets. The Steam trade confirmation state machine (Fix 4) is the most complex fix and the most isolated — it touches a separate component and should be addressed last when the simpler fixes have built confidence in the codebase.

The primary risk across all fixes is the existing pattern of spawning timers and intervals without storing their IDs, which makes cleanup unreliable and causes interval accumulation on overlay reopen. Every fix that touches timing code must register interval/timeout IDs in the existing `stepTimeouts` Map and validate cleanup via the "Looks Done But Isn't" checklist in PITFALLS.md. The secondary risk is optimizing the wrong part of the latency path — the dominant latency source is the 500ms scan interval, not the post-click waits, and those post-click waits exist for a reason (Angular renders modals asynchronously).

## Key Findings

### Recommended Stack

The stack is unchanged. No new technologies, libraries, or APIs are introduced. All three technical questions — fast DOM clicks, full overlay drag, and stale-item detection — are solved with browser APIs already available in the project's ES2020 target environment.

**Core technologies:**
- Vanilla JS (ES2020): All logic — no framework needed, already in use
- esbuild (^0.25.10): Bundling — no config changes needed
- Tampermonkey (any current): Userscript host — already in use
- `MutationObserver` (browser built-in): Event-driven DOM change detection — replaces polling loops and fixed delays; fires on microtask queue (lower latency than `setInterval` or `requestAnimationFrame`)
- `mousedown`/`mousemove`/`mouseup` on `document`: Correct drag pattern — already partially implemented, needs guard fix and listener relocation

**Critical API guidance:**
- Use `element.click()` directly, not `DOMUtils.dispatchClickEvent()` — both produce `isTrusted=false`; the dispatch wrapper adds unnecessary `MouseEvent` construction overhead
- Replace `waitForPageStability(50, ...)` in hot paths with `MutationObserver` attribute watch on the specific button's `disabled` state
- For Angular SPA navigation detection, monkey-patch `history.pushState` — `popstate` alone does not fire on programmatic navigation

### Expected Features

This milestone has no new features — it is exclusively bug fixes. All 5 fixes restore behavior that users already expect to work.

**Must have (table stakes — currently broken):**
- Fix 1: Percentage filter inputs apply to withdrawal gating — UI control has no effect on the bot's core decision today; hard-coded at 5.1 permanently
- Fix 3: Overlay draggable from any point on the panel — overlay placed off-screen is inaccessible; current drag handle guard blocks all child-element drag starts
- Fix 5: Stale skins cleared when sold — bot re-attempts already-sold items on every scan after the 5-second `processedItems` clear
- Fix 4: Sales bot trade confirmation completes without stalling — trade bot is non-functional end-to-end without this; parallel timer pattern causes stuck state and uncleared intervals

**Should have (core value proposition):**
- Fix 2: Sub-100ms detection-to-click latency — the primary competitive advantage of the bot; currently limited by 500ms scan interval and redundant post-click delays

**Defer (v2+):**
- `MutationObserver`-based scan loop replacement (fully converting from `setInterval` to event-driven detection) — the FEATURES.md recommends this as the ideal end state but flags it as MEDIUM complexity; the simpler timeout-tightening in Fix 2 delivers measurable improvement without the full refactor risk
- Per-listing deduplication keyed on listing ID rather than item name — name-only deduplication causes false-positive blocking when multiple copies of the same skin name exist simultaneously

### Architecture Approach

The codebase uses a layered plugin architecture: `MarketItemScraper` orchestrates everything, `AutomationManager` registers and controls automation plugins via a lifecycle contract (`start`/`stop`/`pause`/`resume`), and each automation (`WithdrawalAutomation`, `MarketMonitor`, `SellItemVerification`) is self-contained. UI is created by a static factory (`UIComponents`) with all wiring concentrated in `market-scraper.js` via callbacks. All 5 fixes stay within this architecture — no new layers, no new patterns.

**Major components and fix-to-component mapping:**
1. `src/market-scraper.js` — UI wiring orchestrator; Fix 1 target (add `updateBaseFilters` call in Apply handler)
2. `src/components/ui-components.js` — Static UI factory; Fix 3 target (relocate `mousedown` listener to overlay, update guard)
3. `src/automation/withdrawal-automation.js` — Market scan loop; Fix 2 and Fix 5 target (timeout tightening, `startAutoClear` deduplication)
4. `src/scrapers/data-scraper.js` — DOM extraction and `processedItems` Set; Fix 5 target (add sold-state pruning)
5. `src/filters/item-filter.js` — Filter logic; Fix 5 target (add `hasCheckedIcon` rejection in `passesBaseFilter`)
6. `src/automation/sell-item-verification.js` — Steam cross-domain state machine; Fix 4 target (refactor `checkTradeConfirmationSteps` to sequential, register all IDs)
7. `src/utils/dom-observer.js` — DOM polling utilities; Fix 2 target (verify polling interval in `waitForCondition`)

### Critical Pitfalls

1. **Stale closure over filter state** — The Apply button handler closes over `this.itemFilter` at construction and today only calls `marketMonitor.updatePriceThreshold()`. After Fix 1, verify with a read-back log: `console.log(this.itemFilter.baseFilters.maxPercentageChange)` immediately after Apply must show the new value, not `5.1`.

2. **Optimizing the wrong latency path** — Post-click delays (`waitForPageStability(50)`) exist because Angular renders modals asynchronously. Removing them causes the `waitForCondition` rAF loop to spin against a DOM that does not yet have the modal, increasing the "not joinable" error rate. Measure from `scrapeMarketItems()` start to `itemCard.click()` — that 500ms interval is the real target.

3. **Re-entrant step execution in the trade flow** — `startStepMonitoring` fires every 2000ms and calls `executeCurrentStep()`. If `currentStep` is still `'confirm_trade'` when the next tick fires, a second set of `setInterval` loops is spawned inside `checkTradeConfirmationSteps`. Guard with a transitional state (`'confirm_trade_pending'`) set at the very start of `step4_ConfirmTrade()` before any async work begins.

4. **Untracked interval references** — The existing `stepTimeouts` Map and `clearAllTimeouts()` method are the correct pattern for cleanup, but `checkTradeConfirmationSteps` does not use them. Every `setInterval` call in Fix 4's refactor must store its ID in `this.stepTimeouts`. Verify by calling Stop and confirming no further button clicks fire.

5. **Sold items re-scraped after `processedItems` clear** — CSGORoll marks sold items with a CSS class change, not DOM removal. `scrapeMarketItems()` currently returns all `.item-card` elements including sold ones. After the 5-second auto-clear, those sold items reappear in the filter pipeline. The fix is to reject items where `hasCheckedIcon === true` in `passesBaseFilter()` — this field is already extracted in `extractItemData()`, it just is not consumed by the filter.

## Implications for Roadmap

Based on research, the dependency structure drives a clear 3-phase fix order:

### Phase 1: Independent Low-Complexity Fixes
**Rationale:** Fix 1 and Fix 3 are fully independent, touch different files, and have LOW to LOW-MEDIUM complexity. Starting here builds confidence, delivers immediate visible wins, and creates no interference with the more complex fixes that follow.
**Delivers:** Working percentage filter UI control; fully draggable overlay from any panel point
**Addresses:** Fix 1 (percentage filter inputs), Fix 3 (overlay drag)
**Avoids:** Pitfall 1 (stale closure — read-back log verification required after Fix 1), Pitfall 3 (wrong drag guard — use `!e.target.closest('button, input, textarea, select, a')` not `e.target === dragHandle`)
**Research flag:** No additional research needed — fixes are precisely located in source; patterns are standard.

### Phase 2: Data Layer Correctness (Prerequisite for Speed)
**Rationale:** Fix 5 must precede Fix 2. The FEATURES.md dependency graph is explicit: "faster detection without stale dedup = same item clicked twice." Increasing scan responsiveness before sold-item filtering is in place increases the "not joinable" error rate proportionally. Fix 5 is LOW-MEDIUM complexity and unblocks safe latency work.
**Delivers:** Sold items rejected from the filter pipeline via `hasCheckedIcon` check; `processedItems` pruned of names no longer in the current DOM scan; duplicate `startAutoClear` caller consolidated to one
**Addresses:** Fix 5 (stale skin persistence)
**Avoids:** Pitfall 5 (sold items re-scraped after auto-clear), the interval-accumulation technical debt from duplicate `startAutoClear` calls
**Research flag:** No additional research needed — `hasCheckedIcon` is already extracted; the filter method already exists; the fix is connecting existing data to existing logic.

### Phase 3: Performance Optimization
**Rationale:** Now that sold items are correctly filtered (Phase 2), faster scanning is safe. Fix 2 is MEDIUM complexity — the lowest-risk improvement is tightening timeout arguments in `attemptItemWithdrawalFast` and `handleWithdrawalResultFast`, and verifying the polling interval in `waitForCondition`. The full `MutationObserver` scan loop replacement is deferred to v2+.
**Delivers:** Reduced detection-to-click latency; tighter post-click waits; confirmed rAF loop cancellation in `waitForCondition`
**Addresses:** Fix 2 (detection-to-click latency)
**Avoids:** Pitfall 2 (removing wrong delays — measure before optimizing; keep at least one `waitForElement` on modal container after `itemCard.click()`)
**Research flag:** No additional research needed — the timing bottlenecks are identified and quantified in both STACK.md and FEATURES.md.

### Phase 4: Steam Trade State Machine Refactor
**Rationale:** Fix 4 is the most complex fix (MEDIUM-HIGH) and the most isolated — it touches only `sell-item-verification.js` and has no cross-dependency on Fixes 1-3. Placing it last means the developer has full familiarity with the codebase's timer and state patterns (reinforced by Phases 1-3) before touching the most fragile component. The Steam UI selectors are also the most likely to be stale and need live verification.
**Delivers:** Sequential trade confirmation flow (not parallel timers); all interval IDs registered in `stepTimeouts`; re-entry guard on `step4_ConfirmTrade`; emergency stop that actually stops
**Addresses:** Fix 4 (sales bot stuck on trade window)
**Avoids:** Pitfall 4 (re-entrant step execution — transition to `'confirm_trade_pending'` immediately); untracked interval references (store every ID in `stepTimeouts`)
**Research flag:** Steam DOM selectors (`#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn`) need live verification against the current Steam trade offer page before implementation — these selectors are the most likely to have drifted.

### Phase Ordering Rationale

- **Phases 1 before 2:** Independent fixes first; no risk of interference; builds familiarity with the codebase's patterns before touching the data pipeline
- **Phase 2 before 3:** Data correctness is a prerequisite for safe performance work; this is the only hard dependency in the fix set
- **Phase 4 last:** Highest complexity, most isolated, most fragile external dependency (Steam DOM); benefits from developer confidence built in earlier phases
- **No parallelism recommended:** The fix set is small enough that serial execution is faster than context-switching; each phase's learnings inform the next

### Research Flags

Phases needing additional research before or during implementation:
- **Phase 4 (Steam trade selectors):** Verify `#you_notready`, `.btn_green_steamui.btn_medium`, `#trade_confirmbtn`, and the post-offer "OK" dialog selector against a live Steam trade offer page. These are the only external DOM dependencies in the entire fix set and cannot be verified from the codebase alone.

Phases with standard patterns (no research needed):
- **Phase 1:** Pure in-codebase wiring; all methods exist; selectors are internal
- **Phase 2:** `hasCheckedIcon` already extracted; `passesBaseFilter` already exists; no external dependencies
- **Phase 3:** Timeout values are internal; `waitForCondition` implementation is readable from source; no external APIs involved

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All API recommendations verified against MDN official documentation; no new dependencies introduced |
| Features | HIGH | Root causes derived from direct source-code reading of all affected files with line numbers confirmed |
| Architecture | HIGH | All component boundaries, data flows, and fix integration points verified from full source reads |
| Pitfalls | HIGH (codebase) / MEDIUM (general patterns) | Codebase-specific pitfalls are HIGH confidence from source; general userscript timing patterns are MEDIUM from community knowledge |

**Overall confidence:** HIGH

### Gaps to Address

- **Steam DOM selectors (Phase 4):** The trade confirmation button selectors in `checkTradeConfirmationSteps` cannot be verified without a live Steam trade offer page. These are the highest-risk unknown in the entire milestone. Before implementing Fix 4, open a Steam trade offer and confirm each selector is present and matches. If any selector has changed, the sequential promise chain in Fix 4 still applies — only the selector strings need updating.

- **CSGORoll sold-state class name (Phase 2):** The research confirms `hasCheckedIcon: true` as the sold-state signal (already extracted by `extractItemData`). If CSGORoll has added additional sold-state indicators (e.g., a `.sold` CSS class not covered by `hasCheckedIcon`), these would need to be discovered via live page inspection. The `hasCheckedIcon` fix alone is the minimum viable correction — additional class-based checks are low-priority validation.

- **Angular route change detection (Phase 3 / SPA context):** The STACK.md recommends monkey-patching `history.pushState` for Angular SPA navigation. This is MEDIUM confidence — the specific routing behavior of CSGORoll's Angular app cannot be confirmed without live page access. If in-page navigation does not trigger `pushState`, the `popstate` + `MutationObserver` combination is the fallback. The existing 5-second `autoClear` interval remains a safety net regardless.

## Sources

### Primary (HIGH confidence)
- MDN: MutationObserver, MutationRecord.removedNodes, Event.isTrusted, History.pushState — browser API behavior and compatibility
- Direct codebase analysis: `src/filters/item-filter.js`, `src/components/ui-components.js`, `src/market-scraper.js`, `src/automation/withdrawal-automation.js`, `src/automation/sell-item-verification.js`, `src/scrapers/data-scraper.js`, `src/utils/dom-observer.js`
- `.planning/codebase/CONCERNS.md` — known issues audit confirming untracked setTimeout references, filter configuration fragility, interval overlap

### Secondary (MEDIUM confidence)
- javascript.info: Mouse Drag and Drop — `document`-level `mousemove` pattern, `shiftX`/`shiftY` offset, `preventDefault` on drag
- Mozilla Hacks: MutationObserver — microtask queue firing and performance advantages over polling
- Tampermonkey userscript community knowledge — `setInterval` vs `MutationObserver` scan patterns, SPA-awareness requirements

### Tertiary (LOW confidence)
- CSGORoll Angular routing behavior — inferred from presence of `ng-star-inserted`, `mat-dialog-container`, `mat-flat-button` class names in DOM selectors; actual route change mechanism not verified against live page

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
