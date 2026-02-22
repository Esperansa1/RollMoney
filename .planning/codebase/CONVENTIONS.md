# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**
- PascalCase for class files: `MarketItemScraper.js`, `AutomationManager.js`, `WithdrawalAutomation.js`
- kebab-case for utility/component files: `data-scraper.js`, `dom-utils.js`, `tabbed-interface.js`
- File names typically describe the class they export

**Functions:**
- camelCase for all functions: `createScraperOverlay()`, `handleStartSniper()`, `scrapeMarketItems()`
- Private helper methods follow same camelCase convention (no underscore prefix)
- Event handlers use `handle` prefix: `handleStartSniper()`, `handleStopSniper()`, `handleEmergencyStop()`
- Getter/setter style methods: `getAutomationManager()`, `setCustomFilterConfig()`, `updateBaseFilters()`

**Variables:**
- camelCase for all variables: `isScraperActive`, `dataScraper`, `automationManager`
- Constants use camelCase (not UPPER_CASE): `maxWithdrawRetries`, `maxConcurrentAutomations`
- Boolean variables prefixed with is/has: `isRunning`, `hasCheckedIcon`, `isActive`
- Private instance variables use underscores (minimal usage, mostly camelCase throughout)

**Types/Classes:**
- PascalCase for all class names: `MarketItemScraper`, `AutomationManager`, `ItemFilter`, `UIComponents`
- Class methods are instance methods (no static, except utility classes like `UIComponents` and `DOMUtils`)
- Utility classes use static methods: `DOMUtils.createElement()`, `UIComponents.createButton()`

**CSS/DOM-related:**
- kebab-case for CSS classes and IDs: `market-scraper-overlay`, `sniper-status-grid`, `sell-verification-log-display`
- data-test attributes use kebab-case: `data-test="item-subcategory"`

## Code Style

**Formatting:**
- No formal linter configured (no ESLint, Prettier, or Biome)
- Indentation: 4 spaces (inferred from codebase)
- No semicolons enforced (inconsistently used)
- Max line length: No enforced limit (lines up to 100+ characters observed)
- Consistent spacing around operators and keywords

**Linting:**
- Not detected - no formal linting rules applied
- Code is human-reviewed for consistency

**Import/Export Patterns:**
- ES6 modules throughout: `import { ClassName } from './path/file.js'`
- Default exports for classes (one class per file)
- Named exports for utility functions: `export const Theme = {...}`, `export const getButtonStyles = (...) => {...}`
- All imports use file extensions: `import { X } from './file.js'` (not `'./file'`)

## Import Organization

**Order:**
1. Utility/DOM imports: `import { DOMUtils } from './utils/dom-utils.js'`
2. Theme imports: `import { Theme, getButtonStyles } from '../theme/theme.js'`
3. Component imports: `import { UIComponents } from './components/ui-components.js'`
4. Scraper/Filter imports: `import { DataScraper } from './scrapers/data-scraper.js'`
5. Automation imports: `import { AutomationManager } from './automation/automation-manager.js'`

**Path Aliases:**
- No path aliases configured
- Relative paths with explicit extensions required: `'./utils/dom-utils.js'`, `'../theme/theme.js'`

## Error Handling

**Patterns:**
- Try-catch blocks used extensively (90 occurrences across codebase)
- Catch blocks log errors: `console.error('Error message:', error)`
- Automation system has error tracking: `automation.errorCount++`, `this.stats.failedRuns++`
- Errors trigger exponential backoff retry logic: `setTimeout(() => {...}, 2000 * automation.errorCount)`
- Safe extraction methods return fallback values: `return 'N/A'` in `safeQuerySelector()`, `return '0%'` in `extractPercentageChange()`

**Example patterns from `src/scrapers/data-scraper.js`:**
```javascript
try {
    const item = this.extractItemData(card, index);
    scrapedItems.push(item);
} catch (error) {
    console.error('Error processing item card:', error);
}
```

**Validation pattern from `src/filters/item-filter.js`:**
```javascript
validateFilterConfig(config) {
    try {
        if (!Array.isArray(config)) {
            throw new Error('Filter configuration must be an array');
        }
        // ... validation checks
        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}
```

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- 311 console calls across codebase (47 per file average)
- Logging levels used:
  - `console.log()` for info/debug: 175+ occurrences
  - `console.error()` for errors: 90+ occurrences
  - `console.warn()` for warnings: 40+ occurrences
- Emoji prefixes for clarity: `🚀`, `✅`, `❌`, `🔧`, `⚠️`, `🔗`
- Verbose logging in automation flows: Each step logs status

**Usage in `src/market-scraper.js`:**
```javascript
console.log(`MM    MM  OOOOO...`); // ASCII art on init
console.log("Starting Market Sniper");
console.error('Failed to start Market Sniper:', error);
```

**Usage in `src/automation/automation-manager.js`:**
```javascript
console.log("Starting automation with ID", id)
console.warn(`Automation '${id}' is already running`);
console.error(`Error in event handler for '${event}':`, error);
```

## Comments

**When to Comment:**
- Inline comments minimal - self-documenting code preferred
- Comments for complex logic or workarounds observed
- Debug comments explaining data structures: `// Reset retry counter for fresh extraction`
- Comments explaining state transitions: `// Stop all automations when closing`

**JSDoc/TSDoc:**
- Not detected - no formal documentation comments
- Code relies on clear naming and structure

**Example from `src/market-scraper.js`:**
```javascript
// Auto-start sell verification only if on Steam page with URL data
this.checkForSteamPageAutomation();

// Debug: Log what's happening on page load
console.log('MarketScraper initialized on:', window.location.hostname);
```

## Function Design

**Size:**
- Typical functions: 10-50 lines
- Controller methods (like `createScraperOverlay()`) up to 100+ lines
- No strict size limits observed
- Helper methods extracted when logic becomes complex

**Parameters:**
- Positional parameters for required args
- Optional parameters with defaults: `scrapeMarketItems(intervalMs = 500)`
- Config objects for UI creation: `UIComponents.createButton('text', 'success', 'md', () => {...})`
- Callback functions passed directly: `createDragHandle(overlay, callbacks = {})`

**Return Values:**
- Most functions return created objects: `createElement()` returns DOM element
- Validation functions return result objects: `{ valid: true }`, `{ valid: false, error: message }`
- Query methods return single items or null
- Collection methods return arrays

**Example from `src/filters/item-filter.js`:**
```javascript
filterItems(items) {
    return items.filter(item => {
        const baseFilterPassed = this.passesBaseFilter(item);
        if (this.customFilterConfig.length === 0) {
            return baseFilterPassed;
        }
        const customFilterPassed = this.passesCustomFilter(item);
        return baseFilterPassed && customFilterPassed;
    });
}
```

## Module Design

**Exports:**
- One primary class per file (ES6 class export)
- Utility functions exported as named exports
- Theme system exports constants and factory functions: `export const Theme`, `export const getButtonStyles()`

**Barrel Files:**
- Not used - imports directly from specific module files

**Module Structure:**
- Each module has single responsibility
- Classes in `src/` focus on specific domains:
  - `src/automation/` - Lifecycle-based automation classes
  - `src/components/` - UI creation and management
  - `src/scrapers/` - DOM parsing and data extraction
  - `src/filters/` - Data filtering logic
  - `src/utils/` - Shared utilities (DOM, cookies, observers)
  - `src/theme/` - Styling constants and factory functions

---

*Convention analysis: 2026-02-22*
