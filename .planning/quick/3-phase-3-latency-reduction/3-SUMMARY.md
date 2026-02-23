---
phase: 03-latency-reduction
plan: 01
subsystem: automation
tags: [MutationObserver, DOM, performance, latency, polling]

# Dependency graph
requires:
  - phase: quick-task-1
    provides: stale-item dedup (clearProcessedItems / isItemProcessed on DataScraper)
provides:
  - Observer-driven item detection in WithdrawalAutomation (startObservedScan + _handleNewCard)
  - 10s fallback heartbeat poll replacing 500ms poll
  - Synchronous pre-await dedup guard in _handleNewCard
  - Observer disconnect on bot stop
affects: [03-latency-reduction, withdrawal-automation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MutationObserver as primary detection + periodic poll as fallback heartbeat"
    - "Synchronous addProcessedItem() before first await to block concurrent duplicates"
    - "Fire-and-forget async call from synchronous observer callback with .catch() logging"

key-files:
  created: []
  modified:
    - src/automation/withdrawal-automation.js

key-decisions:
  - "MutationObserver observes document.body with childList+subtree; avoids attributes:true to reduce noise"
  - "Angular may insert host element rather than .item-card directly — handler checks both node.classList.contains and querySelectorAll fallback"
  - "autoClear extended from 5s to 30s: async chain (click + modal + waitForCondition + waitForElementEnabled + click) can reach ~3s; 5s was dangerously close"
  - "Fallback poll retained at 10s to recover from SPA navigation that destroys/recreates the item list"

patterns-established:
  - "Observer primary + timed fallback: all future DOM-reactive automations should follow this dual-path pattern"

requirements-completed: [SPEED-01]

# Metrics
duration: 8min
completed: 2026-02-23
---

# Phase 3 Quick Task: Latency Reduction Summary

**MutationObserver primary detection path replaces 500ms poll — item detection drops from up to 500ms latency to near-zero, with 10s fallback poll and synchronous dedup guard**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-23T00:00:00Z
- **Completed:** 2026-02-23T00:08:00Z
- **Tasks:** 1 of 1
- **Files modified:** 2 (source + built bundle)

## Accomplishments

- `startObservedScan()` wires a `MutationObserver` on `document.body` as the primary detection path — fires synchronously when Angular inserts `.item-card` nodes
- `_handleNewCard()` implements the fast path: N/A guard + dedup check + filter check + synchronous `addProcessedItem()` before `processItemFast` fire-and-forget
- Fallback heartbeat poll demoted from 500ms to 10s — catches items missed due to SPA navigation or zone.js edge cases
- `stopPeriodicScan()` disconnects the observer cleanly — no callbacks fire after Stop Sniper is clicked
- `startAutoClear` extended from 5s to 30s to safely buffer the full async withdrawal chain

## Task Commits

Each task was committed atomically:

1. **Task 1: Add MutationObserver primary detection path and extend autoClear to 30s** - `2bb1c95` (feat)

## Files Created/Modified

- `src/automation/withdrawal-automation.js` - Added `domObserver` field, `startObservedScan()`, `_handleNewCard()`, updated `start()`, `stopPeriodicScan()`, `startAutoClear` timing

## Decisions Made

- Used `childList: true, subtree: true` with no `attributes: true` — avoids observer firing on every attribute change (Angular sets many attributes on render)
- Angular host element vs `.item-card` duality handled with `classList.contains` check + `querySelectorAll` fallback
- `addProcessedItem()` called synchronously before the first `await` in `_handleNewCard` — prevents a second observer callback for the same node (rapid re-render) from queuing a second `processItemFast` before the first resolves
- Retained `startPeriodicScan` as the fallback mechanism rather than a separate poll — reuses the existing scraped-items path which handles its own dedup via `getNewItems`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SPEED-01 satisfied: detection latency drops from up to 500ms (poll tick) to near-zero (synchronous MutationObserver callback)
- Phase 3 latency reduction goal achieved
- Remaining risk: live verification against the Angular market page needed to confirm `.item-card` selector matches production DOM and that `extractItemData` works on the raw card element passed from the observer

---
*Phase: 03-latency-reduction*
*Completed: 2026-02-23*
