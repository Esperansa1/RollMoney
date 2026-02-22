# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Plugin-based automation system with layered component architecture

**Key Characteristics:**
- Plugin-based lifecycle management for multiple concurrent automations
- Separation of concerns: UI layer, automation layer, data processing layer
- Event-driven communication between automation instances
- Cross-domain state transfer for multi-page workflows
- Real-time market data scraping and filtering
- Theme-driven responsive UI

## Layers

**UI/Presentation Layer:**
- Purpose: Display interface, handle user interactions, show real-time status
- Location: `src/components/`, `src/theme/`
- Contains: Tabbed interfaces, overlays, buttons, input fields, status displays
- Depends on: Theme system, DOM utilities
- Used by: MarketItemScraper for displaying configuration and control panels

**Automation Layer:**
- Purpose: Execute market operations and monitor activities
- Location: `src/automation/`
- Contains: WithdrawalAutomation, MarketMonitor, SellItemVerification, AutomationManager
- Depends on: DataScraper, ItemFilter, DOMUtils
- Used by: MarketItemScraper orchestrates all automations through AutomationManager

**Data Processing Layer:**
- Purpose: Extract market data, apply filtering rules
- Location: `src/scrapers/`, `src/filters/`
- Contains: DataScraper (extracts DOM data), ItemFilter (applies business rules)
- Depends on: DOMUtils
- Used by: Automation instances for decision-making

**Utility Layer:**
- Purpose: Reusable DOM manipulation, cookie management, DOM observation
- Location: `src/utils/`
- Contains: DOMUtils, CookieUtils, DOMObserver
- Depends on: Native browser APIs
- Used by: All other layers

**Coordination Layer:**
- Purpose: Manage automation lifecycle, communication, resource conflicts
- Location: `src/automation/automation-manager.js`
- Contains: Plugin registration, start/stop/pause/resume, event emission, shared data
- Depends on: None
- Used by: MarketItemScraper, UI components for control

## Data Flow

**Market Sniper Flow (Withdrawal + Monitoring):**

1. User activates Market Sniper via UI button in `src/market-scraper.js` (handleStartSniper)
2. MarketItemScraper calls `automationManager.startAutomation('withdrawal')` and `automationManager.startAutomation('market-monitor')`
3. WithdrawalAutomation (`src/automation/withdrawal-automation.js`):
   - Periodic scan via `startPeriodicScan()` interval (500ms)
   - Calls `dataScraper.scrapeMarketItems()` → extracts DOM data via `DataScraper` in `src/scrapers/data-scraper.js`
   - Calls `itemFilter.filterItems()` → applies base + custom filters via `ItemFilter` in `src/filters/item-filter.js`
   - For matching items, calls `autoWithdrawItems()` to process withdrawal
4. MarketMonitor (`src/automation/market-monitor.js`):
   - Parallel monitoring interval (2000ms)
   - Scrapes same market data, tracks price history
   - Generates alerts on price threshold breaches
5. UI polls `automationManager.getStats()` for status display every 1000ms in `src/market-scraper.js` (updateSniperStatus)

**Sell Item Verification Flow (Cross-Domain):**

1. User extracts item data from CSGORoll page in modal dialog
2. SellItemVerification (`src/automation/sell-item-verification.js`):
   - Step 1: Extract data from modal via `step2_ExtractItemData()`
   - Encodes data to URL params via `encodeDataToUrlParams()` (base64 JSON)
   - Step 2: User navigates to Steam page with encoded data in URL
   - On Steam page, `initializeCrossPageState()` decodes URL params
   - Step 3: Automation navigates inventory and processes items via `step3_NavigateInventory()`

**Filter Configuration Flow:**

1. User inputs JSON filter config in UI textarea in `src/market-scraper.js` (createConfigurationTab)
2. UI calls `itemFilter.setCustomFilterConfig(config)`
3. Filter validator checks structure via `validateFilterConfig()` in `src/filters/item-filter.js`
4. Next market scan applies both base filters and custom filters via `filterItems()`
5. UI displays current active filter in read-only textarea

**State Management:**

- AutomationManager tracks all automation state via Map with status, priority, error count, success count
- Each automation exposes settings via `settings` object (interval, enabled, etc.)
- MarketItemScraper maintains UI state (overlay visibility, tab state)
- SellItemVerification uses URL parameters exclusively for cross-domain state (no localStorage)
- MarketMonitor loads priceThreshold from localStorage on init, but new values via `updatePriceThreshold()`

## Key Abstractions

**AutomationManager:**
- Purpose: Plugin registry and lifecycle controller for all automations
- Examples: `src/automation/automation-manager.js` instantiated in MarketItemScraper
- Pattern: Registry pattern with event emission, resource management for conflicts
- Responsibilities: Register/unregister automations, start/stop/pause/resume, emit events, track stats

**Automation Interface:**
- Purpose: Contract that all automation plugins must follow
- Examples: WithdrawalAutomation, MarketMonitor, SellItemVerification
- Pattern: Lifecycle methods (start, stop, pause, resume) with settings object
- Required properties: id, priority, interval, settings, plus lifecycle methods

**UIComponents Static Factory:**
- Purpose: Centralized UI element creation with theme integration
- Examples: `src/components/ui-components.js` static methods (createButton, createInput, createOverlay)
- Pattern: Static factory methods with consistent theming
- Responsibilities: Create themed buttons, inputs, overlays with drag/drop support

**DOMUtils Static Utilities:**
- Purpose: Reusable DOM manipulation without jQuery
- Examples: `src/utils/dom-utils.js` (createElement, applyStyles, findElementByText, dispatchClickEvent)
- Pattern: Utility class with static methods
- Responsibilities: Element creation, style application, event dispatching, element finding

**TabbedInterface:**
- Purpose: Switchable tab system for multi-view UI
- Examples: `src/components/tabbed-interface.js` used in `src/market-scraper.js`
- Pattern: Container component managing multiple content panes
- Responsibilities: Add tabs, switch content, emit tab events

**Theme System:**
- Purpose: Centralized design tokens for consistent UI
- Examples: `src/theme/theme.js` exports Theme object with colors, spacing, typography
- Pattern: Object-based design tokens
- Responsibilities: Define colors, spacing values, shadows, animations, z-index layers

## Entry Points

**Global Script Entry:**
- Location: `index.js` (root)
- Triggers: Browser loads userscript
- Responsibilities: Create global window.MarketItemScraper instance, output ASCII banner

**Keyboard Shortcut:**
- Location: `src/market-scraper.js` (initializeKeyboardShortcut method)
- Triggers: User presses Ctrl+Shift+S
- Responsibilities: Toggle scraper overlay visibility

**Auto-Start Steam Page:**
- Location: `src/market-scraper.js` (checkForSteamPageAutomation method)
- Triggers: On page load if Steam community page with URL automation_data param
- Responsibilities: Auto-start SellItemVerification if valid data in URL

**Automation Manager Event Hooks:**
- Location: All automation instances via `automationManager.on()` in `src/automation/automation-manager.js`
- Triggers: 'automation-started', 'automation-stopped', 'automation-error', 'automation-paused', 'automation-resumed'
- Responsibilities: Allow UI and other automations to react to automation state changes

## Error Handling

**Strategy:** Try-catch with logging and graceful degradation

**Patterns:**

- **Automation Errors:** AutomationManager catches errors in start/stop, emits 'automation-error' event, retries with exponential backoff (2000ms * attempt count) up to maxRetries
- **Data Extraction:** WithdrawalAutomation wraps scraping/filtering in try-catch, logs error, skips iteration on failure
- **UI Operations:** UIComponents.showNotification() displays error alerts to user (e.g., when starting automation fails)
- **Modal Operations:** SellItemVerification has extraction retry logic with max attempts counter (up to 10 retries for incomplete data)
- **Filter Validation:** ItemFilter.validateFilterConfig() returns {valid: boolean, error: string} for validation errors
- **DOM Queries:** DOMUtils.safeQuerySelector() returns 'N/A' if element not found instead of throwing
- **Cross-Domain State:** SellItemVerification catches URL decode errors, returns null on failure instead of throwing

## Cross-Cutting Concerns

**Logging:** Native console.log/console.error throughout codebase, emoji prefixes for categorization (🔧, ✅, ❌, 🛑, 🔗)

**Validation:**
- ItemFilter.validateFilterConfig() for JSON input validation
- SellItemVerification validates Steam/CSGORoll page detection via hostname checks
- MarketMonitor validates item data before tracking prices

**Authentication:** None (userscript has implicit user auth)

**Performance Optimization:**
- WithdrawalAutomation: Configurable scan interval (default 500ms)
- MarketMonitor: Configurable monitoring interval (default 2000ms)
- Price history auto-cleanup: Removes entries older than trackDuration (5 minutes)
- DOM queries cached: DataScraper reuses querySelector selectors
- UI refresh throttled: Status updates every 1000ms, not every change

**Concurrency Control:**
- AutomationManager limits concurrent automations via maxConcurrentAutomations (default 5)
- Resource acquisition via acquireResource/releaseResource prevents conflicts
- Individual automations can pause/resume without stopping others

---

*Architecture analysis: 2026-02-22*
