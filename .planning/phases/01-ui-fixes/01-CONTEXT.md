# Phase 1: UI Fixes - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the percentage filter UI input to the ItemFilter engine so changes take effect immediately on Apply. Fix overlay drag so the user can grab it from any point on the surface, not just the title handle. No new capabilities — these are pure bug fixes to two existing UI interactions.

</domain>

<decisions>
## Implementation Decisions

### Percentage Input Validation
- Valid range: 0–100% only (reject anything outside this range)
- Decimal values are allowed (e.g., 5.5%, 12.75%)
- Invalid input (negative, letters, out of range): show an error message, do not apply
- Empty field on Apply: block apply and show an error (do not revert silently)

### Claude's Discretion
- Apply button behavior (feedback, whether sniper needs restart) — handle sensibly
- Drag exclusion zones (buttons, inputs, tabs should not trigger drag) — standard approach
- Drag visual/cursor feedback — whatever is appropriate for the existing UI style
- Error message format and placement — match existing notification/alert patterns in the codebase

</decisions>

<specifics>
## Specific Ideas

- No specific UI references provided — match existing overlay style
- Error messages should be visible, not silent failures

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-ui-fixes*
*Context gathered: 2026-02-22*
