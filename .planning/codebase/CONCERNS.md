# Codebase Concerns

**Analysis Date:** 2026-02-22

## Tech Debt

**Global setInterval Without Cleanup in Market Scraper:**
- Issue: Multiple setInterval instances created for status updates without teardown on certain conditions
- Files: `src/market-scraper.js` lines 353-355, 510-512
- Impact: Status update intervals continue running after overlay close in some code paths, causing memory leaks and unnecessary DOM updates
- Fix approach: Store interval references and clear them explicitly in closeOverlay() method before removing DOM elements

**Event Listener Accumulation Without Removal:**
- Issue: Keyboard shortcut listener added in initializeKeyboardShortcut() is never removed
- Files: `src/market-scraper.js` lines 44-50
- Impact: When overlay is reopened, additional listeners stack up, causing duplicate event firing and memory overhead
- Fix approach: Store listener reference and implement removeEventListener() in destroy/cleanup handler

**Untracked setTimeout References in Sell Item Verification:**
- Issue: Multiple setTimeout calls throughout step execution without registration in stepTimeouts Map
- Files: `src/automation/sell-item-verification.js` lines 358, 897, and multiple other locations
- Impact: Emergency stop may not clear all pending timers, leading to orphaned async operations
- Fix approach: Wrap all setTimeout in a helper that registers to stepTimeouts Map; ensure clearAllTimeouts() called comprehensively

**MutationObserver Not Cleanup in Failure Paths:**
- Issue: DOM Observer in waitForElement() and similar methods may not disconnect on promise rejection in some edge cases
- Files: `src/utils/dom-observer.js` lines 26-46, 130-148, 167-178
- Impact: If element search is abandoned early, MutationObserver may remain attached to DOM tree
- Fix approach: Ensure all observer.disconnect() calls are guaranteed via try-finally or explicit cleanup in all code paths

## Known Bugs

**setInterval Does Not Respect Pause State:**
- Symptoms: When sell verification automation is paused, status update intervals in market-scraper continue polling and updating UI
- Files: `src/market-scraper.js` lines 353-355, 510-512
- Trigger: Start overlay, start sell verification, pause it, check for continuing updates
- Workaround: Close overlay to force cleanup, reopen to start fresh

**State Restoration Race Condition:**
- Symptoms: On Steam page with URL parameters, automation may start before collectedData is fully validated
- Files: `src/automation/sell-item-verification.js` lines 26-65, 882-909
- Trigger: Navigate to Steam page from CSGORoll with malformed URL parameters
- Workaround: Click "Stop" then manually start from inventory navigation step if state looks incomplete

**Interval Overlap in Automation Tabs:**
- Symptoms: When switching between tabs rapidly, multiple refresh intervals accumulate causing performance lag
- Files: `src/components/automation-tabs.js` lines 701-722
- Trigger: Repeatedly click different tabs while they're still mounting
- Workaround: Wait for tab to fully render before switching; avoid rapid tab switching

**ZIndex Positioning Conflicts:**
- Symptoms: Overlay may be hidden behind other page elements despite z-index: 99999
- Files: `src/market-scraper.js` lines 62-86
- Trigger: On pages with stacking context elements or custom z-index hierarchies
- Workaround: Manually call centerOverlay() or reopen overlay with Ctrl+Shift+S

## Security Considerations

**URL Parameter Encoding/Decoding:**
- Risk: Base64-encoded data in URL parameters could be intercepted or manipulated by user scripts
- Files: `src/automation/sell-item-verification.js` lines 71-145
- Current mitigation: Data age validation (10 minute expiry), no authentication on parameters themselves
- Recommendations: Add HMAC validation, consider compression to minimize data exposure, implement rate limiting on Steam page loads

**Cross-Domain Data Transfer:**
- Risk: Sensitive item data (prices, inventory positions) transmitted via URL between CSGORoll and Steam domains
- Files: `src/automation/sell-item-verification.js` lines 70-145
- Current mitigation: 10-minute expiry on encoded data
- Recommendations: Implement server-side session matching, add domain validation, consider storing state server-side instead of URL-based

**No Input Validation on Filter JSON:**
- Risk: User can paste arbitrary JSON in filter configuration without type or injection checks
- Files: `src/market-scraper.js` lines 150-154, `src/components/ui-components.js` filter section
- Current mitigation: Basic try-catch on JSON.parse
- Recommendations: Implement strict JSON schema validation, whitelist allowed filter properties, sanitize before use in DOM queries

**Unprotected Console Access:**
- Risk: All debugging info logged to console including item names, values, inventory positions
- Files: Throughout codebase (100+ console.log calls)
- Current mitigation: None - all data is visible
- Recommendations: Implement debug flag to disable verbose logging, never log sensitive item data in production

**localStorage Usage for Overlay Position:**
- Risk: Sensitive position data stored in localStorage accessible to other scripts
- Files: `src/market-scraper.js` lines 93-95, 1022-1023
- Current mitigation: Only stores positional coordinates, not sensitive data
- Recommendations: Continue to avoid storing actual item/price data in localStorage; current implementation acceptable

## Performance Bottlenecks

**Market Data Scraping Loop Without Debounce:**
- Problem: WithdrawalAutomation scans market items every 500ms regardless of data change frequency
- Files: `src/automation/withdrawal-automation.js` lines 46-67
- Cause: Fixed interval polling with no adaptive throttling or change detection
- Improvement path: Implement mutation detection on market DOM, adjust interval based on change frequency, cache DOM queries

**Full DOM Query on Every Status Update:**
- Problem: updateSniperStatus() and updateSellVerificationStatus() query DOM and rebuild entire grid every 1000ms
- Files: `src/market-scraper.js` lines 353-462, 911-985
- Cause: No DOM caching, rebuilds from scratch on every update
- Improvement path: Implement incremental updates, cache DOM elements, update only changed values

**MutationObserver on Entire document.body:**
- Problem: Multiple observers watching entire document.body subtree for element searches
- Files: `src/utils/dom-observer.js` lines 35-39, 175-178, 265-269
- Cause: Broad observation scope with subtree: true triggers on all mutations
- Improvement path: Narrow observation scope to specific containers, use requestAnimationFrame for polling fallback, implement observer pooling

**No Debouncing on Status Updates:**
- Problem: 4 separate setInterval instances (1000ms each) causing synchronous DOM updates
- Files: `src/market-scraper.js` lines 353, 510
- Cause: Multiple components independently refreshing UI at fixed intervals
- Improvement path: Consolidate to single refresh loop with selective component updates

**Item Processing Sequential Instead of Batched:**
- Problem: autoWithdrawItems() processes filtered items one-by-one with full click+modal wait per item
- Files: `src/automation/withdrawal-automation.js` lines 82-97
- Cause: No batching or request queuing mechanism
- Improvement path: Implement queue system, batch DOM operations, parallelize non-blocking operations

## Fragile Areas

**Sell Item Verification State Machine:**
- Files: `src/automation/sell-item-verification.js` lines 210-310
- Why fragile: Complex multi-step state machine with cross-domain navigation (CSGORoll → Steam → CSGORoll) relies on proper step sequencing and URL parameter passing. Missing single timeout or failed element detection breaks entire workflow
- Safe modification: Add comprehensive timeout handling on every step transition, validate state before each step execution, add rollback/retry logic with exponential backoff
- Test coverage: Manual testing only; no unit tests for state transitions, no integration tests for cross-domain flow

**DOM Observer Utility:**
- Files: `src/utils/dom-observer.js` lines 14-285
- Why fragile: Relies on MutationObserver which can miss DOM changes if mutations occur faster than processing, uses requestAnimationFrame without timeout safety in waitForCondition()
- Safe modification: Add change debouncing, implement counter for observer triggers, ensure all code paths disconnect observers, add explicit cleanup methods
- Test coverage: None; relies on implicit behavior correctness

**Automation Manager Lifecycle:**
- Files: `src/automation/automation-manager.js` lines 20-225
- Why fragile: No transactional guarantees when starting/stopping multiple automations, error in one automation.start() could leave manager in inconsistent state, no rollback on partial start failure
- Safe modification: Implement rollback mechanism in startAll(), validate all automations before changing manager state, queue state changes
- Test coverage: None; no lifecycle tests

**Filter Configuration Application:**
- Files: `src/filters/item-filter.js`, `src/market-scraper.js` lines 150-154
- Why fragile: Filter configuration changes applied immediately without validation of current filtered item set, no validation that filter shape matches expected properties
- Safe modification: Implement pre-flight validation of filter JSON against schema, add dry-run capability, validate item data shape before filtering
- Test coverage: None; no validation tests

## Scaling Limits

**Memory Usage with Long-Running Automations:**
- Current capacity: Can run ~8 hours before noticeable memory growth (estimated)
- Limit: Processed items set grows unbounded, priceHistory Map in MarketMonitor grows unbounded
- Scaling path: Implement circular buffer for processedItems (keep last N items), add age-based cleanup for priceHistory, implement garbage collection hints

**DOM Observer Capacity:**
- Current capacity: ~5-10 concurrent observers before performance degrades
- Limit: Each observer watches full document.body subtree; large pages with frequent mutations slow dramatically
- Scaling path: Implement observer pooling, use delegation pattern, batch observation of similar selectors

**Market Item Processing Throughput:**
- Current capacity: ~50-100 items per scan cycle at 500ms interval
- Limit: Sequential processing with modal waits limits to ~1 item per 500-1000ms
- Scaling path: Implement queue-based processing with configurable concurrency, cache modal operations

**Event Handler Accumulation:**
- Current capacity: No explicit limit tracked; estimated 100-200 handlers before noticeable lag
- Limit: Each new overlay toggle adds more listeners without removal
- Scaling path: Implement WeakMap-based listener tracking, add automatic cleanup on element removal

## Dependencies at Risk

**esbuild Build System:**
- Risk: No minification, no source maps, no tree-shaking; bundle size grows linearly with code
- Impact: Final dist/index.bundle.js may become very large (current unknown size)
- Migration plan: Consider adding minification step, implement lazy loading for UI components, evaluate webpack/vite alternatives

**No Runtime Dependencies:**
- Risk: All DOM manipulation is manual with no abstraction layer; jQuery dependency removed but no replacement for DOM utilities
- Impact: DOM utilities in dom-utils.js must handle all cross-browser issues manually
- Migration plan: Current approach acceptable; if cross-browser issues arise, consider lightweight DOM library

## Missing Critical Features

**No Error Recovery Mechanism:**
- Problem: If automation fails mid-step, no automatic recovery or user notification of specific failure reason
- Blocks: Cannot resume failed operations, user must manually stop/start

**No Logging Framework:**
- Problem: All logging is via console.log with emoji prefixes; no structured logging, no log levels, no persistent logs
- Blocks: Difficult to diagnose issues after fact, console history lost on page reload

**No Configuration Persistence:**
- Problem: Only filter config and overlay position saved to localStorage; automation settings reset on reload
- Blocks: Cannot save preferred price thresholds, automation intervals, or other settings

**No User-Facing Error Dialogs:**
- Problem: Errors logged to console but user may not notice; only success notifications are shown
- Blocks: Users unaware of automation failures or invalid configurations

**No Rate Limiting:**
- Problem: No throttling of withdrawal attempts or market queries; could trigger bot detection
- Blocks: Risk of account suspension from automated activity detection

## Test Coverage Gaps

**Automation State Transitions:**
- What's not tested: Start/stop/pause/resume cycles, error handling during transitions, cleanup after failures
- Files: `src/automation/automation-manager.js`, `src/automation/sell-item-verification.js`, `src/automation/withdrawal-automation.js`
- Risk: State machine corruption could go undetected until production
- Priority: High

**Cross-Domain Navigation:**
- What's not tested: URL parameter encoding/decoding round-trip, Steam page navigation flow, data corruption edge cases
- Files: `src/automation/sell-item-verification.js` lines 70-145, 882-909
- Risk: Broken navigation could strand users with no recovery path
- Priority: High

**Filter Configuration Validation:**
- What's not tested: Invalid JSON handling, malformed filter structures, filter property validation
- Files: `src/filters/item-filter.js`, `src/market-scraper.js`
- Risk: Invalid filters silently fail or crash automation
- Priority: Medium

**DOM Observer Cleanup:**
- What's not tested: Observer disconnect in all code paths, timeout vs success cleanup, memory leaks on repeated operations
- Files: `src/utils/dom-observer.js`
- Risk: Memory leaks accumulate over long sessions
- Priority: Medium

**Memory Leak Detection:**
- What's not tested: Long-running automation sessions (8+ hours), setInterval/setTimeout cleanup, event listener accumulation
- Files: Entire automation system
- Risk: Undetected memory leaks cause browser slowdown/crash
- Priority: High

---

*Concerns audit: 2026-02-22*
