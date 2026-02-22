# RollMoney (TamirMakeMoney)

## What This Is

A browser userscript for CSGORoll.com that automates market sniping, item withdrawal, and selling workflows. It runs in Tampermonkey and provides an overlay UI (Ctrl+Shift+S) to configure filters, control automations, and monitor the market in real time.

## Core Value

React to good market listings faster than a human can click — every millisecond saved between item detection and purchase matters.

## Requirements

### Validated

- ✓ Market sniper bot that periodically scans and auto-withdraws matching items — existing
- ✓ JSON-based item filter configuration (custom filters via UI textarea) — existing
- ✓ Draggable overlay UI with tabbed interface (Summary + Market Sniper tabs) — existing
- ✓ Market monitor that tracks prices and generates alerts — existing
- ✓ Sales bot (SellItemVerification) with cross-domain Steam trade flow — existing
- ✓ Automation lifecycle management (start/stop/pause/resume) via AutomationManager — existing
- ✓ Configurable scan interval (default 500ms), price threshold alerts — existing
- ✓ Cookie-based filtering state persistence — existing

### Active

- [ ] Fix percentage filter inputs — changing values in the UI must actually apply to item filtering
- [ ] Reduce detection-to-click latency — minimize time between item match and withdrawal action
- [ ] Fix overlay drag — overlay should be grabbable and draggable from any point, not just specific handle areas
- [ ] Fix sales bot trade completion — when trade window opens, bot must complete and send the trade instead of getting stuck
- [ ] Fix stale skin persistence — after page refresh, skins already bought by anyone (not just the user) must disappear from the bot's list

### Out of Scope

- Mobile app — web userscript only
- Server-side components — fully client-side, no backend
- Support for markets other than CSGORoll.com — out of current scope

## Context

- Browser userscript (Tampermonkey), bundled with esbuild into `dist/index.bundle.js`
- Zero external runtime dependencies — pure vanilla JS
- Targets CSGORoll.com market pages and Steam Community trade pages
- Existing codebase scan interval: 500ms (WithdrawalAutomation) and 2000ms (MarketMonitor)
- Drag support exists in UIComponents but is only partially wired to overlay element
- The sales bot uses a cross-domain URL-encoded state approach (base64 JSON) between CSGORoll and Steam
- Codebase map available at `.planning/codebase/`

## Constraints

- **Tech Stack**: Vanilla JS + esbuild — no framework additions
- **Runtime**: Must work as a Tampermonkey userscript in a modern browser
- **Bundling**: All changes must survive `npm run build` (esbuild IIFE bundle)
- **Domains**: CSGORoll.com and Steam Community pages only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix bugs before new features | User reported 5 broken/degraded features in the existing system | — Pending |
| Keep architecture unchanged | All fixes target existing components, no new modules needed | — Pending |

---
*Last updated: 2026-02-22 after initialization*
