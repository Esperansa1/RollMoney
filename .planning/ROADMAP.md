# Roadmap: RollMoney (TamirMakeMoney)

## Overview

This milestone fixes 5 discrete broken features in an existing, running userscript. Phases are ordered by dependency: independent low-complexity fixes first, then data-layer correctness (required before safe performance work), then performance optimization, then the isolated Steam trade state machine refactor. All fixes stay within existing files and existing architectural patterns — no new modules, no new dependencies.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: UI Fixes** - Wire percentage filter inputs and fix overlay drag from any point
- [ ] **Phase 2: Data Layer Correctness** - Remove stale/sold skins from the bot's active list
- [ ] **Phase 3: Latency Reduction** - Minimize detection-to-click time now that data layer is correct
- [ ] **Phase 4: Sales Bot Trade Fix** - Refactor Steam trade confirmation to sequential, non-stuck flow

## Phase Details

### Phase 1: UI Fixes
**Goal**: UI controls that the user changes are immediately respected by the bot
**Depends on**: Nothing (first phase)
**Requirements**: FILT-01, DRAG-01
**Success Criteria** (what must be TRUE):
  1. User changes the percentage value in the UI, clicks Apply, and the bot immediately uses the new threshold — the old 5.1% hardcoded value is never used again
  2. User can click and drag the overlay from any location on its surface (including labels, content areas, and empty space) and it moves with the cursor
  3. After dragging, the overlay stays at its new position across subsequent interactions
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Fix FILT-01 (threshold wiring + validation) and DRAG-01 (full-surface drag)

### Phase 2: Data Layer Correctness
**Goal**: The bot's active item list contains only items that are genuinely available for withdrawal
**Depends on**: Phase 1
**Requirements**: STALE-01
**Success Criteria** (what must be TRUE):
  1. When another user buys a skin (CSGORoll marks it with a sold/checked icon), the bot stops attempting to withdraw it on the next scan
  2. After a page refresh, items that were already purchased by anyone are not in the bot's attempt queue
  3. The bot does not produce "not joinable" errors caused by repeatedly clicking already-sold items
**Plans**: TBD

### Phase 3: Latency Reduction
**Goal**: The time between a matching item appearing and the bot clicking withdraw is as short as possible
**Depends on**: Phase 2
**Requirements**: SPEED-01
**Success Criteria** (what must be TRUE):
  1. A matching item appearing in the DOM triggers a withdrawal attempt in under 100ms (replacing the 500ms polling interval as the primary detection path)
  2. Post-click wait times are as tight as the Angular modal render allows — no unnecessary fixed delays remain in the hot path
  3. The bot correctly handles items that appear and are sold before the click fires (no increase in error rate compared to Phase 2 baseline)
**Plans**: TBD

### Phase 4: Sales Bot Trade Fix
**Goal**: When the sales bot opens a Steam trade window, it completes and sends the trade without getting stuck
**Depends on**: Phase 3
**Requirements**: SALES-01
**Success Criteria** (what must be TRUE):
  1. The sales bot navigates the Steam trade confirmation sequence (ready status, confirm button, send trade) to completion without stalling
  2. If the user clicks Stop, all trade-related timers and intervals are actually cancelled — no further button clicks fire
  3. Opening the trade flow a second time does not spawn a second set of parallel interval loops on top of the first
  4. Each confirmation step executes only after the previous step's DOM condition is satisfied (sequential, not parallel)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. UI Fixes | 1/1 | Complete | 2026-02-22 |
| 2. Data Layer Correctness | 0/TBD | Not started | - |
| 3. Latency Reduction | 0/TBD | Not started | - |
| 4. Sales Bot Trade Fix | 0/TBD | Not started | - |
