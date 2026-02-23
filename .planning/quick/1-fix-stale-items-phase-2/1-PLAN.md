---
phase: 02-data-layer-correctness
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/automation/withdrawal-automation.js
  - src/market-scraper.js
autonomous: true
requirements: [STALE-01]
must_haves:
  truths:
    - "When a 'not joinable' error fires, the page reloads automatically (no manual intervention needed)"
    - "After reload, the sniper auto-restarts within ~2 seconds without user pressing any button"
    - "If multiple items hit 'not joinable' in the same scan cycle, only one reload fires"
    - "Own successful withdrawals continue to work — the fix does not touch that path"
  artifacts:
    - path: "src/automation/withdrawal-automation.js"
      provides: "handleNotJoinableError() replacement — stops scan, sets localStorage flag, calls location.reload()"
      contains: "isRefreshing"
    - path: "src/market-scraper.js"
      provides: "Auto-restart check in constructor — reads sniper-auto-restart flag, calls handleStartSniper() after 2s"
      contains: "sniper-auto-restart"
  key_links:
    - from: "src/automation/withdrawal-automation.js"
      to: "localStorage"
      via: "localStorage.setItem('sniper-auto-restart', '1') before location.reload()"
      pattern: "sniper-auto-restart"
    - from: "src/market-scraper.js"
      to: "this.handleStartSniper()"
      via: "constructor reads localStorage flag, calls handleStartSniper after 2s setTimeout"
      pattern: "sniper-auto-restart"
---

<objective>
Fix the bot's "not joinable" error loop so it stops retrying sold items.

Purpose: When CSGORoll sells an item to another user, the bot's withdrawal attempt returns "this trade is not joinable". The current handler incorrectly looks for a non-existent "Knives.svg" refresh button and then retries the same sold item — producing endless errors on every scan cycle. The correct response is: detect error → stop scanning → reload page → auto-restart bot from clean DOM.

Output: Two modified files. WithdrawalAutomation gets a correct handleNotJoinableError() that reloads the page. MarketItemScraper constructor gets an auto-restart check that resumes the sniper after reload.
</objective>

<execution_context>
@C:/Users/oresp/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/oresp/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-data-layer-correctness/02-CONTEXT.md
@.planning/phases/02-data-layer-correctness/02-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace handleNotJoinableError() with page-reload handler</name>
  <files>src/automation/withdrawal-automation.js</files>
  <action>
Two edits to this file:

**Edit 1 — Add `isRefreshing` guard to the constructor** (after line 11, `this.isRunning = false;`):
```javascript
this.isRefreshing = false;
```

**Edit 2 — Replace the entire body of `handleNotJoinableError()` (lines 239–267).**

Replace the current method (which looks for a Knives.svg button and retries the withdrawal) with:

```javascript
async handleNotJoinableError(item) {
    console.log(`Item sold to another user: ${item.name} — triggering page reload`);

    // Guard: if multiple items hit this path in the same scan cycle, only reload once
    if (this.isRefreshing) {
        console.log('Page reload already queued, skipping duplicate trigger');
        return;
    }
    this.isRefreshing = true;

    // Stop further scan cycles immediately so no more items are attempted
    this.stopPeriodicScan();

    // Signal that the sniper should auto-restart after the reload
    localStorage.setItem('sniper-auto-restart', '1');

    console.log('Reloading page to clear stale items...');
    location.reload();
}
```

Do NOT leave any part of the old implementation (the DOMObserver.waitForElement Knives.svg lookup, the refreshButton.click(), the attemptItemWithdrawalFast retry, or the surrounding try/catch). Replace the entire method body.
  </action>
  <verify>
Run `npm run build` — should produce no errors.

Then manually inspect the compiled output:
```bash
grep -n "isRefreshing" dist/index.bundle.js
grep -n "sniper-auto-restart" dist/index.bundle.js
grep -n "Knives.svg" dist/index.bundle.js
```

Expected: `isRefreshing` and `sniper-auto-restart` appear. `Knives.svg` does NOT appear (old code fully replaced).
  </verify>
  <done>
`handleNotJoinableError()` body contains only the isRefreshing guard, stopPeriodicScan(), localStorage.setItem, and location.reload(). No retry logic remains. `this.isRefreshing = false` is present in the constructor.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add auto-restart check to MarketItemScraper constructor</name>
  <files>src/market-scraper.js</files>
  <action>
In the `MarketItemScraper` constructor (currently ends at line 42 with `this.initializeKeyboardShortcut()`), add the auto-restart check **after `this.checkForSteamPageAutomation()` (line 31) and before `this.overlay = null` (line 36)**.

Insert this block immediately after the `checkForSteamPageAutomation()` call:

```javascript
// Auto-restart sniper if a page reload was triggered by a "not joinable" error
if (localStorage.getItem('sniper-auto-restart') === '1') {
    localStorage.removeItem('sniper-auto-restart');
    console.log('Auto-restart: sniper was running before reload — restarting in 2s...');
    setTimeout(() => {
        try {
            this.handleStartSniper();
        } catch (error) {
            console.error('Auto-restart failed:', error);
        }
    }, 2000);
}
```

Placement rationale:
- After `checkForSteamPageAutomation()` so both auto-start paths are grouped together
- The 2-second setTimeout matches the delay used by `checkForSteamPageAutomation()` (line 925) to let the DOM settle before starting automations
- The flag is cleared immediately (before setTimeout fires) so a manual page refresh never triggers an unexpected auto-start
- `handleStartSniper()` starts only `withdrawal` and `market-monitor` automations — NOT `sell-item-verification` (which must only start on Steam pages)
  </action>
  <verify>
Run `npm run build` — should produce no errors.

Then confirm both keys appear in the build:
```bash
grep -n "sniper-auto-restart" dist/index.bundle.js
grep -n "handleStartSniper" dist/index.bundle.js
```

Expected: `sniper-auto-restart` appears in both the withdrawal-automation section (write) and market-scraper section (read + removeItem). `handleStartSniper` appears called inside a setTimeout.
  </verify>
  <done>
Constructor reads `sniper-auto-restart` from localStorage, clears it immediately, and calls `this.handleStartSniper()` inside a 2-second setTimeout. The try/catch prevents auto-restart failure from crashing the constructor.
  </done>
</task>

</tasks>

<verification>
After both tasks, run the full build and spot-check the compiled output:

```bash
npm run build
```

Build must succeed with no errors.

Verify the three correctness invariants in dist/index.bundle.js:
1. `grep "Knives.svg" dist/index.bundle.js` — returns nothing (old retry code gone)
2. `grep "sniper-auto-restart" dist/index.bundle.js` — appears twice (setItem in withdrawal-automation, removeItem in market-scraper)
3. `grep "isRefreshing" dist/index.bundle.js` — appears in constructor init and in handleNotJoinableError guard
</verification>

<success_criteria>
- `handleNotJoinableError()` no longer contains retry logic or Knives.svg lookup
- "Not joinable" error path: sets isRefreshing guard → stops scan → writes localStorage flag → reloads page
- After page reload: constructor reads flag, clears it, calls handleStartSniper() after 2s delay
- Build passes: `npm run build` exits 0
- Old retry code (`Knives.svg`, `attemptItemWithdrawalFast` call inside handleNotJoinableError) is completely absent from dist/index.bundle.js
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-stale-items-phase-2/1-SUMMARY.md` using the summary template.
</output>
