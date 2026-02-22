# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**No external HTTP APIs:**
- Application performs no HTTP requests (fetch/XMLHttpRequest/axios)
- All interactions are DOM-based scraping and browser automation
- No backend API calls or third-party service integrations

**Target Websites (DOM-based):**
- CSGORoll.com - Market data scraping via DOM queries
  - Selectors: `.item-card`, `label[data-test="item-name"]`, `span[data-test="value"]`
  - No API authentication required
- Steam Community (steamcommunity.com) - Trade offer automation
  - Trade offer pages (`/tradeoffer/new/`)
  - URL parameter based data passing (`automation_data` query parameter)

## Data Storage

**Databases:**
- None - No database connections

**Local Client Storage:**

**localStorage:**
- `scraperOverlayX` - Overlay window X position (persistent)
- `scraperOverlayY` - Overlay window Y position (persistent)
- `market-filter-config` - JSON filter configuration for market sniping
- `market-monitor-price-threshold` - Price alert threshold (stored as string)
- `sellItemVerificationLogs` - Trade activity logs (JSON array, max 100 entries)

**Cookies:**
- Fallback storage for `market-filter-config` if localStorage fails
- Cookie-based storage implementation in `src/utils/cookie-utils.js`
- Used as secondary option when localStorage unavailable in userscript context

**URL Parameters:**
- `automation_data` - URL-encoded state for cross-tab data passing
  - Used to pass item data from CSGORoll to Steam trade page
  - Encoding: JSON → Base64 → URL parameter
  - Used in `src/automation/sell-item-verification.js` for cross-domain data flow

**File Storage:**
- Local filesystem only - No cloud storage
- No file upload/download functionality

**Caching:**
- In-memory caching of processed items via `Set` in `DataScraper`
- Runtime cache of scraped market items (not persisted)

## Authentication & Identity

**Auth Provider:**
- None - Custom authentication not required
- Leverages existing user login on CSGORoll.com and Steam
- No API keys or tokens managed by the application
- Authentication implicit via DOM access on authenticated pages

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service

**Logs:**
- Browser console only (`console.log`, `console.error`, `console.warn`)
- No log aggregation or external logging service
- In-app activity log for sell verification (stored in localStorage)
  - Accessible via `src/automation/sell-item-verification.js` - `getTradeLog()` method

**Debug Output:**
- Console-based debug logging with emoji prefixes (e.g., `🚀`, `❌`, `✅`)
- Activity displayed in overlay UI status panels

## CI/CD & Deployment

**Hosting:**
- Deployed as userscript/Tampermonkey script
- Distributed via npm package or direct script injection
- No cloud infrastructure required

**CI Pipeline:**
- None - Manual build and deployment
- Local development with `npm run build`

**Build Command:**
```bash
npm run build  # Bundles to dist/index.bundle.js with version hash
```

## Environment Configuration

**Required Environment:**
- No environment variables used
- No `.env` file dependencies
- Browser JavaScript global scope only

**Configuration Methods:**

1. **UI Configuration** (Runtime):
   - JSON filter config editor in "Market Sniper" tab
   - Price threshold input field
   - All settings applied immediately via UI buttons

2. **Persistent Configuration** (localStorage/cookies):
   - Market filter rules stored in `market-filter-config`
   - Price threshold in `market-monitor-price-threshold`
   - Overlay position in `scraperOverlayX`/`scraperOverlayY`

**Config Format:**
- JSON for filter configuration (editable in textarea)
- String/number primitives for simple settings

## Webhooks & Callbacks

**Incoming Webhooks:**
- None - Application does not expose any webhook endpoints

**Outgoing Webhooks:**
- None - No webhooks triggered to external services

**Cross-Tab Communication:**
- URL parameter passing: `automation_data` query param
- localStorage sync: Trade logs stored but not cross-tab synced
- No Shared Worker or Service Worker usage

## DOM Target Integration Points

**CSGORoll Market Page:**
- Monitored CSS selectors:
  - `.item-card` - Individual item containers
  - `label[data-test="item-name"]` - Item names
  - `span[data-test="value"]` - Price values
  - `span[data-test="item-subcategory"]` - Item categories
  - `span.lh-16.fw-600.fs-10.ng-star-inserted` - Percentage change
  - `div[data-test="item-card-float-range"]` - Condition indicators
  - `span[inlinesvg="assets/icons/checked.svg"]` - Checked status icon

**Withdrawal Process:**
- Button targeting:
  - `button[class*="mat-flat-button"][class*="text-capitalize"]` - Material Design buttons
  - Button text matching: "Max", "Withdraw", "Send Items Now"
  - `mat-dialog-container` - Modal detection

**Steam Trade Pages:**
- URL detection: `window.location.hostname.includes('steamcommunity.com')`
- Trade offer path: `/tradeoffer/new/`
- Inventory navigation via direct DOM clicks and navigation

## Data Format Standards

**JSON Configuration:**
- Array of filter rule objects with property matchers
- Example stored in cookies/localStorage:
  ```json
  [
    { "name": "pattern", "condition": "contains" },
    { "price": "5.0", "condition": ">=" }
  ]
  ```

**URL Encoded State:**
- Automation data encoded as Base64 in URL parameters
- Decoded on Steam pages via `decodeDataFromUrlParams()` method

---

*Integration audit: 2026-02-22*
