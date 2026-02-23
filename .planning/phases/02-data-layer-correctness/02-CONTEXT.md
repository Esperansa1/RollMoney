# Phase 2: Data Layer Correctness - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the bot so it stops repeatedly attempting to withdraw items that have already been sold to other users. The bot's active scan list must only contain items genuinely available for withdrawal. No new capabilities — purely fixing incorrect retry behavior on sold items.

</domain>

<decisions>
## Implementation Decisions

### Staleness signal
- There is NO reliable visual/DOM indicator for sold items within a page session — CSGORoll does not mark them visually or remove them from the DOM
- The only reliable staleness signal is the "not joinable" API error that fires when the bot attempts to withdraw an already-sold item (accompanied by visible UI feedback on screen)
- After a page refresh, sold items are gone — the page returns to a clean state with only available items

### Detection timing
- Approach is **reactive**: detect staleness via the "not joinable" error at withdrawal attempt time (not proactively before clicking)
- When "not joinable" fires → bot triggers an automatic page refresh
- After page refresh, bot auto-restarts from clean state (sold items absent from DOM)
- Own-withdrawal tracking already works correctly and is not affected

### Scope of fix
- Fix applies only to the "not joinable" error path — own successful withdrawals are handled correctly already
- No in-memory blacklist needed — page refresh + auto-restart is the intended mechanism

### Claude's Discretion
- Exact error identification logic (how to distinguish "not joinable" from other API errors)
- Timing and debounce for page refresh trigger (e.g., don't refresh on every single error if multiple fire at once)
- How auto-restart is achieved after refresh (config persistence, localStorage flag, or existing startup logic)

</decisions>

<specifics>
## Specific Ideas

- "We just want to refresh the page so it goes away" — the user's mental model is clean: error → refresh → clean start. Keep it simple, don't over-engineer a blacklist system.
- Bot already handles its own successful withdrawals correctly — don't break that path

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-data-layer-correctness*
*Context gathered: 2026-02-23*
