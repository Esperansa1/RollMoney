# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Runner:**
- Not detected - no test framework configured
- `package.json` test script returns error: `"test": "echo \"Error: no test specified\" && exit 1"`

**Assertion Library:**
- Not applicable - no tests present

**Run Commands:**
```bash
npm test          # Error: no test specified
npm run build     # Build bundle with esbuild
```

## Test File Organization

**Location:**
- No test files found in codebase
- No `.test.js`, `.spec.js`, or dedicated test directories

**Naming:**
- Not applicable - no test files exist

**Structure:**
- Not applicable - no test files exist

## Test Structure

**Suite Organization:**
- Not applicable - no tests exist

**Patterns:**
- No setup/teardown patterns observed
- No test fixtures or factories
- No test utilities or helpers

## Mocking

**Framework:**
- Not detected - no mocking library configured

**Patterns:**
- No mocking detected in codebase
- Manual DOM manipulation for testing (debug buttons): `handleDebugInjectTestData()`, `handleDebugExtractData()`

**What to Mock (if testing added):**
- `document.querySelector()` and related DOM APIs
- `localStorage` for persistence testing
- `setInterval()` for automation timing tests
- `fetch()` or network calls (if added in future)

**What NOT to Mock (if testing added):**
- Core business logic (filter logic, data extraction)
- Class instantiation and initialization
- Event handling and state management

## Fixtures and Factories

**Test Data:**
- No formal test fixtures
- Debug utilities create test data manually:

From `src/market-scraper.js`:
```javascript
handleDebugInjectTestData() {
    const testData = {
        itemName: "Candy Apple",
        itemCategory: "Glock-18",
        itemValue: "25.75 TKN",
        inventoryPage: 3,
        itemPosition: 12,
        timestamp: new Date().toISOString()
    };
    this.sellItemVerification.collectedData = testData;
}
```

**Location:**
- Debug test data hardcoded in `src/market-scraper.js` (lines 849-878)
- Test data injected via UI buttons:
  - "Inject Test Data" button in debug section
  - "Extract Data", "Send Items", "Navigate Inventory" manual triggers

## Coverage

**Requirements:**
- Not enforced - no test framework or coverage tools configured

**View Coverage:**
- Not applicable - no coverage reporting available

## Test Types

**Unit Tests:**
- Not present
- Would target individual classes: `ItemFilter`, `DataScraper`, `DOMUtils`
- Would test filter logic (`passesBaseFilter()`, `passesCustomFilter()`)
- Would test data extraction (`extractItemData()`, `safeExtract()`)

**Integration Tests:**
- Not present
- Would test automation lifecycle: start/stop/pause/resume
- Would test automation manager coordination
- Would test UI component creation and event handling

**E2E Tests:**
- Not applicable - userscript runs in browser context
- Manual testing via debug UI buttons serves as E2E verification

## Common Patterns

**Manual Testing Strategy:**
The codebase includes extensive debug UI controls in place of automated tests. From `src/market-scraper.js`:

```javascript
createDebugStepControls() {
    // Multiple debug buttons for manual step-by-step testing:
    // - Extract Data
    // - Send Items
    // - Navigate Inventory
    // - View State
    // - Inject Test Data

    const extractDataBtn = UIComponents.createButton('Extract Data', 'warning', 'sm', () => {
        this.handleDebugExtractData();
    });
    // ... more debug controls
}
```

**Error Handling in Code (serves testing function):**

From `src/scrapers/data-scraper.js`:
```javascript
scrapeMarketItems() {
    const itemCards = document.querySelectorAll('.item-card');
    const scrapedItems = [];

    itemCards.forEach((card, index) => {
        try {
            const item = this.extractItemData(card, index);
            console.log("Extracted Item:", item);  // Visible in console during testing
            scrapedItems.push(item);
        } catch (error) {
            console.error('Error processing item card:', error);  // Catch errors during manual testing
        }
    });

    return scrapedItems;
}
```

**Validation Pattern (defensive programming):**

From `src/filters/item-filter.js`:
```javascript
validateFilterConfig(config) {
    try {
        if (!Array.isArray(config)) {
            throw new Error('Filter configuration must be an array');
        }

        for (let i = 0; i < config.length; i++) {
            const filter = config[i];
            if (typeof filter !== 'object' || filter === null) {
                throw new Error(`Filter at index ${i} must be an object`);
            }
            // ... more validation
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}
```

## Automation Testing Approach

Instead of unit tests, the codebase uses:

1. **Debug UI Controls** - Manual trigger points for each step
2. **Console Logging** - Detailed logs with emoji indicators for status tracking
3. **State Inspection** - "View State" button to inspect current automation state
4. **Data Injection** - "Inject Test Data" for offline testing scenarios
5. **Notification System** - User feedback for success/failure states (from `UIComponents.showNotification()`)

**Example test flow (manual):**
```
1. Open UI (Ctrl+Shift+S)
2. Click "Inject Test Data" button
3. Check console logs for "Injected test data: ..."
4. Click "Extract Data" button
5. Verify console shows "Extracted Item: {...}"
6. Click "Navigate Inventory" button
7. Check console for navigation steps
```

---

*Testing analysis: 2026-02-22*
