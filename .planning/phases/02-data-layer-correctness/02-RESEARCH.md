# Phase 2: Data Layer Correctness - Research

**Researched:** 2026-02-23
**Domain:** Browser userscript — withdrawal error handling, page refresh, auto-restart via localStorage
**Confidence:** HIGH (all findings from direct source code inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- There is NO reliable visual/DOM indicator for sold items within a page session — CSGORoll does not mark them visually or remove them from the DOM
- The only reliable staleness signal is the "not joinable" API error that fires when the bot attempts to withdraw an already-sold item (accompanied by visible UI feedback on screen)
- After a page refresh, sold items are gone — the page returns to a clean state with only available items
- Approach is **reactive**: detect staleness via the "not joinable" error at withdrawal attempt time (not proactively before clicking)
- When "not joinable" fires → bot triggers an automatic page refresh
- After page refresh, bot auto-restarts from clean state (sold items absent from DOM)
- Own-withdrawal tracking already works correctly and is not affected
- Fix applies only to the "not joinable" error path — own successful withdrawals are handled correctly already
- No in-memory blacklist needed — page refresh + auto-restart is the intended mechanism

### Claude's Discretion
- Exact error identification logic (how to distinguish "not joinable" from other API errors)
- Timing and debounce for page refresh trigger (e.g., don't refresh on every single error if multiple fire at once)
- How auto-restart is achieved after refresh (config persistence, localStorage flag, or existing startup logic)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STALE-01 | After any user buys a skin, or after a page refresh, that skin disappears from the bot's active list and is not re-attempted for withdrawal | Error detection path traced (handleWithdrawalResultFast → handleNotJoinableError); page refresh via location.reload(); auto-restart via localStorage flag read at MarketItemScraper construction time |
</phase_requirements>

---

## Summary

The withdrawal flow is a clean, linear async chain. When the bot clicks an item card, it calls `processItemFast()` which calls `attemptItemWithdrawalFast()` which calls `handleWithdrawalResultFast()`. That final function already detects the "not joinable" error via a string check on `document.body.innerText` and dispatches to `handleNotJoinableError()`. However, the current `handleNotJoinableError()` implementation tries to find and click an in-page "refresh button" (looking for a Knives.svg icon), which is incorrect. The fix replaces that handler body with `location.reload()`.

The bot does NOT currently auto-start on page load. The only automatic startup is `checkForSteamPageAutomation()` which auto-starts the sell-item-verification when on a Steam URL. There is no equivalent for the withdrawal sniper. Auto-restart after `location.reload()` requires storing a "was running" flag in localStorage before refreshing, then reading it at construction time in `MarketItemScraper`.

localStorage is already used in this codebase: overlay position (`scraperOverlayX`, `scraperOverlayY`), price threshold (`market-monitor-price-threshold`), and trade logs (`sellItemVerificationLogs`). The `CookieUtils.setJsonCookie/getJsonCookie` utility does localStorage-first persistence and is available for use.

**Primary recommendation:** Replace `handleNotJoinableError()` body with a debounced `location.reload()`, preceded by a `localStorage.setItem('sniper-auto-restart', '1')` write. Read that flag at MarketItemScraper construction and call `handleStartSniper()` if found, then clear the flag.

---

## Standard Stack

### Core (no new libraries needed)
| API | Version | Purpose | Why Standard |
|-----|---------|---------|--------------|
| `localStorage` | Browser built-in | Persist auto-restart flag across page reload | Already used in this codebase for overlay position and price threshold |
| `location.reload()` | Browser built-in | Trigger a full page refresh | Simplest mechanism; guaranteed clean DOM after reload |
| `CookieUtils` | Project utility (`src/utils/cookie-utils.js`) | localStorage-first persistence helper | Already exists; abstracts localStorage vs cookie fallback |

No npm packages need to be installed. This phase is pure vanilla JS.

---

## Architecture Patterns

### Existing Project Structure (relevant files)
```
src/
├── automation/
│   ├── withdrawal-automation.js  — TARGET: handleNotJoinableError() method
│   └── automation-manager.js     — no changes needed
├── market-scraper.js             — TARGET: constructor() for auto-restart read
└── utils/
    └── cookie-utils.js           — available localStorage helper
```

### Pattern 1: "Not Joinable" Detection (already implemented correctly)
**What:** `handleWithdrawalResultFast()` checks `document.body.innerText` for the string `'this trade is not joinable'` (case-insensitive) and routes to `handleNotJoinableError()`.
**Location:** `withdrawal-automation.js` lines 186–193
**Status:** Detection logic is correct. The handler body is what needs replacement.

```javascript
// Source: src/automation/withdrawal-automation.js (lines 186-192)
const pageText = document.body.innerText || '';
const notJoinableError = pageText.toLowerCase().includes('this trade is not joinable');

if (notJoinableError) {
    console.log(`⚠️ Trade not joinable error for: ${item.name}`);
    await this.handleNotJoinableError(item);
    return;
}
```

### Pattern 2: Auto-Restart via localStorage Flag
**What:** Write flag before reload; read and clear flag at startup.
**When to use:** Any scenario where you need post-reload behavior without URL parameter pollution.
**Pattern used by:** This codebase already uses localStorage for price threshold persistence (`market-monitor-price-threshold`). The sell-item-verification uses URL params for cross-domain state (Steam page). For same-domain refresh, localStorage is the right tool.

```javascript
// WRITE (in handleNotJoinableError, before location.reload()):
localStorage.setItem('sniper-auto-restart', '1');
location.reload();

// READ (in MarketItemScraper constructor, after object setup):
if (localStorage.getItem('sniper-auto-restart') === '1') {
    localStorage.removeItem('sniper-auto-restart');
    // Delay to let DOM settle before starting automations
    setTimeout(() => {
        this.handleStartSniper();
    }, 2000);
}
```

### Pattern 3: Debounce for Multiple Simultaneous Errors
**What:** Guard variable prevents multiple concurrent "not joinable" errors from all triggering `location.reload()` before the first one fires.
**Why needed:** The scan processes items in a for-loop. If multiple items in the same scan batch are stale, each could hit `handleNotJoinableError()` before the page reloads.

```javascript
// Add to WithdrawalAutomation constructor:
this.isRefreshing = false;

// In handleNotJoinableError():
if (this.isRefreshing) {
    console.log('Already refreshing, skipping duplicate trigger');
    return;
}
this.isRefreshing = true;
localStorage.setItem('sniper-auto-restart', '1');
location.reload();
```

### Pattern 4: handleStartSniper() is the correct auto-start entry point
**What:** `handleStartSniper()` in `market-scraper.js` (lines 393–409) calls `automationManager.startAutomation('withdrawal')` and `automationManager.startAutomation('market-monitor')`.
**Status:** This is exactly the right method to call for auto-restart. It already handles error notifications and the auto-clear interval.

```javascript
// Source: src/market-scraper.js (lines 393-409)
handleStartSniper() {
    try {
        this.automationManager.startAutomation('withdrawal');
        this.automationManager.startAutomation('market-monitor');
        this.withdrawalAutomation.startAutoClear(5);
        UIComponents.showNotification('Market Sniper started successfully!', 'success');
    } catch (error) { ... }
}
```

**Timing note:** The `MarketItemScraper` constructor runs synchronously when the userscript loads. The DOM may not be fully ready for automation at that instant. Use `setTimeout(() => this.handleStartSniper(), 2000)` to mirror the same 2-second delay used by `checkForSteamPageAutomation()` (line 925).

### Anti-Patterns to Avoid
- **Calling `automationManager.startAll()`:** This starts all registered automations including `sell-item-verification`, which should only start on Steam pages. Use `handleStartSniper()` which targets only `withdrawal` and `market-monitor`.
- **Retry loop instead of reload:** The current `handleNotJoinableError()` attempts to find and click a "Knives.svg refresh button" and then retry the withdrawal. This is wrong — the item is sold and will never become available again. Don't call `attemptItemWithdrawalFast()` again after this error.
- **Reloading without the flag:** If `location.reload()` fires without setting the localStorage flag first, the page reloads but the bot stays stopped. The user would have to click "Start Sniper" manually.
- **Not debouncing:** Multiple simultaneous errors in one scan cycle without a guard flag will call `location.reload()` multiple times in rapid succession (benign but wasteful and potentially jarring).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-reload state persistence | Custom serialization, URL params, cookies | `localStorage.setItem/getItem` | Already used in codebase; same-origin, synchronous, reliable for same-domain reload |
| Error string matching | Regex or complex parser | `.toLowerCase().includes('this trade is not joinable')` | Already in place at line 187; don't add another detection layer |
| Debounce utility | lodash debounce, custom timer class | Simple boolean guard `this.isRefreshing` | The only debounce needed is "don't trigger twice per page life"; a boolean is sufficient |

**Key insight:** The detection infrastructure already exists. The problem is the response: `handleNotJoinableError()` does the wrong thing (looks for a UI button). The fix is replacing 25 lines of incorrect handler logic with 3 lines: set flag, set guard, reload.

---

## Common Pitfalls

### Pitfall 1: AutomationManager "already running" guard
**What goes wrong:** `automationManager.startAutomation()` throws `"Automation 'withdrawal' is already running"` if called when status is `'running'`.
**Why it happens:** The `automationManager` checks `automation.status === 'running'` and warns/returns early (line 67-69 of automation-manager.js). On a fresh page load this is fine — status is `'registered'`. But if any code paths started it before the auto-restart check runs, the guard fires.
**How to avoid:** The localStorage flag is read in the constructor before any user interaction. At that point automations are freshly registered with `status: 'registered'`. The 2-second delay provides additional safety margin.
**Warning signs:** Console shows "Automation 'withdrawal' is already running" — check if auto-start is firing twice.

### Pitfall 2: `handleNotJoinableError()` currently retries the withdrawal
**What goes wrong:** The existing implementation (lines 239–266) calls `attemptItemWithdrawalFast(item)` again after a fake refresh. This means after the fix, if the old retry call is left in, the bot will attempt the same sold item again immediately before the page reloads.
**How to avoid:** Replace the ENTIRE body of `handleNotJoinableError()` — do not just add code before the existing retry logic.

### Pitfall 3: `closeOverlay()` calls `stopAll()` — bot stops when overlay closes
**What goes wrong:** `closeOverlay()` (line 1017) stops all automations when the UI overlay is closed. If the user closes the overlay after the bot is running, the bot stops.
**Why it matters for this phase:** After auto-restart, the overlay is not open (no user pressed Ctrl+Shift+S). The bot starts via `handleStartSniper()` without the overlay being present. This is fine — the automations run independently of the overlay. BUT: `closeOverlay()` must not be called during auto-restart.
**How to avoid:** The auto-restart path never opens or closes the overlay, so this is not a risk in practice.

### Pitfall 4: `UIComponents.showNotification()` may fail if overlay is not open
**What goes wrong:** `handleStartSniper()` calls `UIComponents.showNotification(...)`. If this creates a DOM element that requires the overlay container to exist, it may fail silently or throw when called from auto-restart (overlay not open).
**How to avoid:** Verify whether `showNotification` appends to `document.body` (safe) or to the overlay container (unsafe). If unsafe, skip the notification call in the auto-restart path, or wrap in a try/catch.
**Warning signs:** Console error about `null` element when appending notification.

### Pitfall 5: Multiple scans firing while refresh is pending
**What goes wrong:** The scan interval is 500ms. Between the moment `handleNotJoinableError()` fires and the moment `location.reload()` actually executes, another scan cycle may start and find the same stale item again, calling `handleNotJoinableError()` a second time.
**How to avoid:** The `this.isRefreshing = true` guard (Pitfall pattern above) stops the second call. Also, `stopPeriodicScan()` can be called immediately before `location.reload()` to prevent any further scan cycles from starting.

---

## Code Examples

### Complete replacement for `handleNotJoinableError()` (target: `withdrawal-automation.js`)
```javascript
// Source: verified against withdrawal-automation.js structure (lines 239-266)
async handleNotJoinableError(item) {
    console.log(`⚠️ "Not joinable" error for: ${item.name} — item sold to another user`);

    // Guard: only trigger refresh once even if multiple items hit this path
    if (this.isRefreshing) {
        console.log('Page refresh already queued, skipping duplicate');
        return;
    }
    this.isRefreshing = true;

    // Stop further scans immediately
    this.stopPeriodicScan();

    // Signal that bot should auto-restart after reload
    localStorage.setItem('sniper-auto-restart', '1');

    console.log('Reloading page to clear stale items...');
    location.reload();
}
```

### Auto-restart check (target: `MarketItemScraper` constructor, `market-scraper.js`)
```javascript
// Add to constructor after all setup is complete, after registerAutomation calls
// Source: mirrors pattern from checkForSteamPageAutomation() (line 925)
if (localStorage.getItem('sniper-auto-restart') === '1') {
    localStorage.removeItem('sniper-auto-restart');
    console.log('Auto-restart: sniper was running before reload — restarting...');
    setTimeout(() => {
        this.handleStartSniper();
    }, 2000); // Match the 2s delay used by checkForSteamPageAutomation
}
```

### Add `isRefreshing` guard to constructor (target: `withdrawal-automation.js`)
```javascript
// Add to WithdrawalAutomation constructor
this.isRefreshing = false;
```

---

## Existing localStorage Keys (full inventory)

| Key | Owner | Value | Persist across reload? |
|-----|-------|-------|------------------------|
| `scraperOverlayX` | market-scraper.js | number (pixels) | Yes |
| `scraperOverlayY` | market-scraper.js | number (pixels) | Yes |
| `market-monitor-price-threshold` | market-monitor.js | number (fraction e.g. 0.051) | Yes |
| `sellItemVerificationLogs` | sell-item-verification.js | JSON array of trade logs | Yes |

**New key to add:**

| Key | Owner | Value | Persist across reload? |
|-----|-------|-------|------------------------|
| `sniper-auto-restart` | withdrawal-automation.js (write) / market-scraper.js (read) | `'1'` | Yes — but cleared immediately on next load |

---

## Open Questions

1. **Does `UIComponents.showNotification()` require the overlay to be open?**
   - What we know: `handleStartSniper()` calls it; on auto-restart the overlay is not open
   - What's unclear: Whether the notification appends to document.body or to the overlay DOM node
   - Recommendation: Read `UIComponents.showNotification` implementation before calling it in auto-restart path; wrap in try/catch or skip notification when overlay is absent

2. **Is `document.body.innerText` the source of "not joinable" text, or does CSGORoll show it in a toast/modal that may not always be in body.innerText?**
   - What we know: The check at line 187 uses `document.body.innerText` which covers all visible text
   - What's unclear: CSGORoll may show the error in a non-rendered element (e.g. hidden element, aria-hidden) that wouldn't appear in innerText
   - Recommendation: The existing code has not been reported as missing the error — treat detection as working. If the fix is deployed and errors still appear, add a more targeted selector check.

3. **Is `location.reload()` the right reload mechanism, or does CSGORoll's SPA router require a different approach?**
   - What we know: CSGORoll is an Angular SPA. `location.reload()` triggers a full browser reload which Tampermonkey re-injects the script into.
   - What's unclear: Whether an Angular router navigation would be cleaner (no full reload) — but user's decision is explicit: page refresh is the intended mechanism.
   - Recommendation: Use `location.reload()`. This is locked by user decision.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/automation/withdrawal-automation.js` — full file read, error handling path traced end-to-end
- Direct code inspection: `src/market-scraper.js` — constructor, handleStartSniper, checkForSteamPageAutomation, closeOverlay all read
- Direct code inspection: `src/scrapers/data-scraper.js` — processedItems Set behavior confirmed
- Direct code inspection: `src/automation/automation-manager.js` — startAutomation guard logic confirmed
- Direct code inspection: `src/utils/cookie-utils.js` — localStorage helper pattern confirmed
- Direct code inspection: `src/utils/dom-observer.js` — no changes needed here

### Secondary (MEDIUM confidence)
- None required — all findings from direct source inspection

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Error detection path: HIGH — directly read withdrawal-automation.js, confirmed `handleWithdrawalResultFast` → `handleNotJoinableError` flow
- Error string identifier: HIGH — `'this trade is not joinable'` at line 187, direct code read
- Auto-restart mechanism: HIGH — localStorage pattern already used in codebase; constructor pattern mirrors `checkForSteamPageAutomation`
- Debounce approach: HIGH — `isRefreshing` boolean is sufficient given single-page lifecycle
- Edge cases (UIComponents notification): MEDIUM — `showNotification` implementation not read; flagged as open question

**Research date:** 2026-02-23
**Valid until:** Stable — no external dependencies; valid until codebase changes
