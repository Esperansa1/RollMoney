# Requirements: RollMoney (TamirMakeMoney)

**Defined:** 2026-02-22
**Core Value:** React to good market listings faster than a human can click — every millisecond saved between item detection and purchase matters.

## v1 Requirements

Requirements for this bug-fix milestone. Each maps to roadmap phases.

### Filter

- [ ] **FILT-01**: User can set a percentage value in the UI and have it immediately applied to item filtering (instead of the hardcoded 5.1% default)

### Drag

- [ ] **DRAG-01**: User can grab and drag the overlay from any point on its surface (not just the title/handle area)

### Stale Items

- [ ] **STALE-01**: After any user buys a skin, or after a page refresh, that skin disappears from the bot's active list and is not re-attempted for withdrawal

### Performance

- [ ] **SPEED-01**: Time between a matching item appearing and the bot clicking to withdraw is minimized (scan triggers on DOM mutation, not on a fixed 500ms polling interval)

### Sales Bot

- [ ] **SALES-01**: When the sales bot opens the Steam trade window, it completes and sends the trade (sequential confirmation steps, no re-entrant or stuck timer loops)

## v2 Requirements

*(None identified — all fixes are scoped for this milestone)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| New automation features | This milestone is bug-fix only |
| Markets other than CSGORoll.com | Out of current scope |
| Server-side components | Userscript is fully client-side |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILT-01 | Phase 1 - UI Fixes | Pending |
| DRAG-01 | Phase 1 - UI Fixes | Pending |
| STALE-01 | Phase 2 - Data Layer Correctness | Pending |
| SPEED-01 | Phase 3 - Latency Reduction | Pending |
| SALES-01 | Phase 4 - Sales Bot Trade Fix | Pending |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after roadmap creation*
