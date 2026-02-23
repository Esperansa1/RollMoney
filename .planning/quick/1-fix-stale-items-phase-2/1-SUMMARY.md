---
phase: quick
plan: "1-fix-stale-items-phase-2"
subsystem: automation
tags: [bugfix, withdrawal-automation, stale-items, page-reload, auto-restart]
dependency_graph:
  requires: []
  provides: [not-joinable-error-recovery]
  affects: [withdrawal-automation, market-scraper]
tech_stack:
  added: []
  patterns: [localStorage-flag-pattern, guard-flag-pattern]
key_files:
  created: []
  modified:
    - src/automation/withdrawal-automation.js
    - src/market-scraper.js
decisions:
  - "Use page reload as the recovery mechanism for not-joinable errors rather than DOM retry — sold items never become available again so retry is always wrong"
  - "Clear the sniper-auto-restart flag immediately (synchronously) before the setTimeout fires to prevent spurious restarts from manual page refreshes"
  - "isRefreshing guard placed in constructor to prevent multiple scan-cycle items from each triggering a redundant reload"
metrics:
  duration: "~2 minutes"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
  completed_date: "2026-02-23"
requirements: [STALE-01]
---

# Quick Task 1: Fix Stale Items Phase 2 Summary

**One-liner:** Page-reload recovery for not-joinable errors with localStorage auto-restart flag and isRefreshing duplicate guard.

## What Was Built

Fixed the "not joinable" error loop in WithdrawalAutomation. When CSGORoll sells an item to another user between scan detection and withdrawal attempt, the bot now correctly: stops scanning, sets a localStorage flag, reloads the page, and auto-restarts the sniper after 2 seconds — rather than entering an infinite retry loop chasing a non-existent Knives.svg refresh button.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace handleNotJoinableError() with page-reload handler | db467f2 | src/automation/withdrawal-automation.js, dist/index.bundle.js |
| 2 | Add auto-restart check to MarketItemScraper constructor | 04e920e | src/market-scraper.js, dist/index.bundle.js |

## Changes Made

### src/automation/withdrawal-automation.js

**Constructor:** Added `this.isRefreshing = false;` after `this.isRunning = false;`

**handleNotJoinableError():** Replaced entire body. Old implementation looked for a `Knives.svg` button (which does not exist on the CSGORoll DOM) and then retried the same sold item — creating an infinite error loop on every scan cycle. New implementation:
1. Logs which item triggered the error
2. Checks `isRefreshing` guard — if already reloading, returns immediately (prevents duplicate reloads when multiple items hit this path in the same 500ms scan cycle)
3. Sets `isRefreshing = true`
4. Calls `stopPeriodicScan()` to halt further attempts
5. Writes `localStorage.setItem('sniper-auto-restart', '1')`
6. Calls `location.reload()`

### src/market-scraper.js

**Constructor:** Inserted auto-restart block after `checkForSteamPageAutomation()`, before the debug console.log:
- Reads `sniper-auto-restart` flag from localStorage
- If present: clears it immediately (synchronous, before setTimeout fires)
- Schedules `handleStartSniper()` via `setTimeout(..., 2000)` wrapped in try/catch
- 2-second delay matches the delay used by `checkForSteamPageAutomation()` to let the DOM settle

## Verification Results

Build: PASSED (npm run build, version hash 694c9094)

Invariants checked in dist/index.bundle.js:
- `isRefreshing` — appears at lines 1265 (constructor init), 1435 (guard check), 1439 (set true)
- `sniper-auto-restart` — appears at line 1441 (setItem in withdrawal-automation), lines 3654-3655 (getItem + removeItem in market-scraper)
- `Knives.svg` — NOT present in handleNotJoinableError context (only remains in unrelated `testRefreshButtonFunctionality()` debug utility)
- `handleStartSniper` — called inside setTimeout at line 3659

## Deviations from Plan

None — plan executed exactly as written. The `Knives.svg` reference remaining in `testRefreshButtonFunctionality()` is correct and expected; the plan's done criteria only required its removal from `handleNotJoinableError()`.

## Self-Check

Files exist:
- src/automation/withdrawal-automation.js — FOUND
- src/market-scraper.js — FOUND
- dist/index.bundle.js — FOUND

Commits exist:
- db467f2 — FOUND
- 04e920e — FOUND
