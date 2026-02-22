# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
RollMoney/
├── index.js                    # Entry point: creates global MarketItemScraper instance
├── build.js                    # esbuild bundler configuration
├── package.json                # Project metadata and dependencies
├── dist/
│   └── index.bundle.js         # Bundled output (IIFE, global name "RollMoney")
└── src/
    ├── market-scraper.js       # Main controller orchestrating all functionality
    ├── automation/             # Automation implementations
    │   ├── automation-manager.js    # Plugin lifecycle and coordination
    │   ├── withdrawal-automation.js # Market item processing
    │   ├── market-monitor.js        # Price tracking and alerts
    │   └── sell-item-verification.js # Cross-domain item selling workflow
    ├── components/             # UI component implementations
    │   ├── ui-components.js         # Factory methods for themed UI elements
    │   ├── tabbed-interface.js      # Tab management system
    │   ├── automation-tabs.js       # Automation-specific tab content
    │   └── automation-panel.js      # Automation control panels
    ├── scrapers/               # Data extraction from DOM
    │   └── data-scraper.js         # Market item DOM scraping
    ├── filters/                # Data filtering and validation
    │   └── item-filter.js          # Base + custom item filtering logic
    ├── theme/                  # Design system
    │   └── theme.js                # Design tokens, button/input/overlay styles
    └── utils/                  # Utility functions
        ├── dom-utils.js            # DOM manipulation utilities
        ├── dom-observer.js         # DOM mutation observation
        └── cookie-utils.js         # Cookie read/write operations
```

## Directory Purposes

**Root:**
- Purpose: Build configuration and entry point
- Files: `index.js` (entry), `build.js` (esbuild config), `package.json` (metadata), `CLAUDE.md` (instructions)

**`src/`:**
- Purpose: All TypeScript/JavaScript source code
- Contains: Main controller, automation plugins, UI components, utilities
- Key files: `market-scraper.js` orchestrates everything

**`src/automation/`:**
- Purpose: Automation plugins that run specific market tasks
- Contains: AutomationManager (coordinator), WithdrawalAutomation, MarketMonitor, SellItemVerification
- Key files:
  - `automation-manager.js`: Registry, lifecycle, event emission
  - `withdrawal-automation.js`: Periodic market scanning and item withdrawal
  - `market-monitor.js`: Real-time price tracking with alerts
  - `sell-item-verification.js`: Multi-step item selling with cross-domain state

**`src/components/`:**
- Purpose: UI component implementations
- Contains: Overlay creation, tab systems, buttons, inputs, styled elements
- Key files:
  - `ui-components.js`: Static factory methods (createButton, createInput, createLabel, createOverlay, createDragHandle)
  - `tabbed-interface.js`: Tab container with switch logic
  - `automation-tabs.js`: Summary tab and automation status displays
  - `automation-panel.js`: Control panels for individual automations

**`src/scrapers/`:**
- Purpose: DOM parsing for market data extraction
- Contains: Item card parsing, data extraction
- Key files: `data-scraper.js` (querySelectorAll + element traversal)

**`src/filters/`:**
- Purpose: Business logic for filtering items
- Contains: Base filter rules, custom JSON filter application, validation
- Key files: `item-filter.js` (condition checks, percentage parsing, custom matching)

**`src/theme/`:**
- Purpose: Centralized design tokens and styled component helpers
- Contains: Colors, spacing, typography, shadows, animation durations
- Key files: `theme.js` (Theme export object, helper functions getButtonStyles/getInputStyles/getOverlayStyles)

**`src/utils/`:**
- Purpose: Reusable utilities
- Contains: DOM helpers, event dispatch, cookie management, DOM observation
- Key files:
  - `dom-utils.js` (createElement, applyStyles, safeQuerySelector, findElementByText, dispatchClickEvent)
  - `cookie-utils.js` (readCookie, writeCookie, deleteCookie)
  - `dom-observer.js` (MutationObserver utilities for dynamic content)

**`dist/`:**
- Purpose: Compiled output for distribution
- Contains: `index.bundle.js` (esbuild IIFE bundle)
- Generated: Yes (from `npm run build`)
- Committed: Yes (checked into git)

## Key File Locations

**Entry Points:**
- `index.js`: Main userscript entry point, creates window.MarketItemScraper
- `src/market-scraper.js`: Primary application controller

**Configuration:**
- `package.json`: Project dependencies (esbuild), name, version
- `build.js`: Build script specifying entry/output/bundle format
- `.claude/`: Claude-specific instructions (if present)

**Core Logic:**
- `src/automation/automation-manager.js`: Orchestration of all automations
- `src/automation/withdrawal-automation.js`: Market item scanning and processing
- `src/automation/market-monitor.js`: Price tracking with configurable threshold
- `src/automation/sell-item-verification.js`: Multi-step Steam trading workflow
- `src/scrapers/data-scraper.js`: DOM data extraction (item cards, prices)
- `src/filters/item-filter.js`: Filtering logic (conditions, stat trak, percentage change)

**UI Logic:**
- `src/market-scraper.js`: Overlay creation, tab management, status updates
- `src/components/ui-components.js`: UI element factory
- `src/components/tabbed-interface.js`: Tab switching and layout
- `src/components/automation-tabs.js`: Summary and automation-specific tabs

**Styling & Theme:**
- `src/theme/theme.js`: Design tokens and styled component functions

**Utilities:**
- `src/utils/dom-utils.js`: DOM creation, styling, querying
- `src/utils/cookie-utils.js`: Cookie persistence
- `src/utils/dom-observer.js`: DOM mutation watching

**Testing:**
- Not present (no test framework configured)

## Naming Conventions

**Files:**
- kebab-case for filenames: `market-scraper.js`, `automation-manager.js`, `data-scraper.js`
- Directories: lowercase hyphenated: `src/automation/`, `src/components/`, `src/utils/`
- Exception: React-style CamelCase only inside files (class names)

**Classes:**
- PascalCase: `MarketItemScraper`, `AutomationManager`, `WithdrawalAutomation`, `DataScraper`, `ItemFilter`

**Methods:**
- camelCase: `startAutomation()`, `stopAutomation()`, `scrapeMarketItems()`, `filterItems()`, `createOverlay()`
- Prefixes indicate scope: `handle*` (event handlers), `create*` (factory methods), `get*` (accessors), `set*` (mutators)

**Properties:**
- camelCase: `isRunning`, `automationManager`, `dataScraper`, `itemFilter`, `currentStep`
- Private/internal prefixed with underscore: `_intervalId` (rare in codebase)

**Constants:**
- UPPERCASE: `MAX_RETRIES = 3`, or inline: Theme object members (colors, spacing)

**Event Names:**
- kebab-case: `automation-started`, `automation-stopped`, `automation-error`, `shared-data-updated`, `resource-acquired`

**HTML IDs/Classes:**
- kebab-case: `market-scraper-overlay`, `sniper-status-grid`, `sell-verification-status-grid`, `summary-stats-grid`

## Where to Add New Code

**New Feature (e.g., new automation type):**
- Primary code: `src/automation/[feature-name]-automation.js`
  - Must implement: `start()`, `stop()`, `pause()`, `resume()` methods
  - Must have: `id`, `priority`, `interval`, `settings` properties
  - Register in `src/market-scraper.js` constructor: `automationManager.registerAutomation(id, instance)`
- Tests: No test framework (add if needed)
- UI Controls: If manual control needed, add to `src/market-scraper.js` (createSniperControls pattern)
- Tabs: If custom view needed, add to `src/components/automation-tabs.js`

**New Component/UI Module:**
- Implementation: `src/components/[component-name].js`
  - Use DOMUtils for creation: `DOMUtils.createElement(tag, styles, attributes)`
  - Apply Theme for styling: `Theme.colors.*`, `Theme.spacing.*`
  - Return HTMLElement or accept container as parameter
- Integration: Import in `src/market-scraper.js` and call in appropriate overlay setup method
- Example pattern: See `src/components/ui-components.js` static methods

**Utilities/Helpers:**
- Shared DOM helpers: `src/utils/dom-utils.js`
  - Add static methods following existing pattern
  - Method names start with verb: `createElement`, `applyStyles`, `findElementByText`
- Cookie operations: `src/utils/cookie-utils.js`
- DOM observation: `src/utils/dom-observer.js`

**New Filter Rules:**
- Logic: `src/filters/item-filter.js`
  - Add property check in `passesBaseFilter()` or `passesCustomFilter()`
  - Add JSON schema validation in `validateFilterConfig()` if custom schema

**Scrapers/Data Extraction:**
- Logic: `src/scrapers/data-scraper.js`
  - Add method following extractItemData pattern
  - Selectors target [data-test] attributes and class names
  - Use safeExtract for optional fields

**Styling & Theme:**
- Update: `src/theme/theme.js` for new colors, spacing, or shadows
- No separate CSS files; all styles inline via DOMUtils.applyStyles()

## Special Directories

**`dist/`:**
- Purpose: Production bundle output
- Generated: Yes (via `npm run build` → esbuild)
- Committed: Yes (checked into git for distribution)
- Content: Single `index.bundle.js` in IIFE format with global variable name "RollMoney"

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by gsd:map-codebase)
- Committed: Yes (reference documents for planning)
- Content: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**`.git/`:**
- Purpose: Version control history
- Committed: Yes (git repository)

## Build and Deployment

**Build command:** `npm run build`

**Build process:**
1. Runs `node build.js` (esbuild script)
2. Entry point: `index.js`
3. Output: `dist/index.bundle.js`
4. Format: IIFE (self-executing function)
5. Global name: `RollMoney`
6. Target: ES2020
7. Options: No minification, no source maps

**Distribution:** Bundle as userscript with @require pointing to dist/index.bundle.js

---

*Structure analysis: 2026-02-22*
