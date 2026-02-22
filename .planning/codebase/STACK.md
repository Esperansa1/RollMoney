# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- JavaScript (ES6+ with ES modules) - Core application logic throughout `src/`
- HTML/CSS - UI overlay and component styling

## Runtime

**Environment:**
- Browser (Userscript/Tampermonkey context)
- DOM-based (runs in browser window context with `document` and `window` access)

**Execution Context:**
- Injected as IIFE global variable named `RollMoney`
- Keyboard-activated (Ctrl+Shift+S)

## Frameworks

**Core:**
- None - Pure vanilla JavaScript (no external framework dependencies)

**Build/Dev:**
- esbuild ^0.25.10 - Module bundling and compilation
  - Entry point: `index.js`
  - Output: `dist/index.bundle.js` (IIFE format, global `RollMoney`)
  - Target: ES2020
  - Features: No minification, no source maps, custom version hash injection

## Key Dependencies

**Runtime:**
- Zero external runtime dependencies
- Only development dependency: esbuild

**Browser APIs Used:**
- `document.*` - DOM manipulation and queries
- `localStorage` - Client-side persistent storage
- `document.cookie` - Cookie read/write
- `window.location` - URL/page detection
- `requestAnimationFrame()` - Animation timing
- Events API - Custom event dispatching and listening

## Build Configuration

**Build Process:**
- `npm run build` - Executes `build.js`
  - Bundles with esbuild
  - Generates SHA256 hash of bundle
  - Injects version hash into global `window.ROLLMONEY_VERSION`

**Build Output:**
- `dist/index.bundle.js` - Single bundled file (IIFE)
- Global variable: `window.RollMoney` (MarketItemScraper instance)

## Project Configuration

**Module System:**
- Type: `commonjs` in `package.json` (for Node build script)
- Source code: ES6 modules (`import`/`export`)
- No TypeScript, no build-time type checking

**Package Management:**
- npm (Node Package Manager)
- Lockfile: `package-lock.json` present
- Version management: package.json v1.0.0

## Platform Requirements

**Development:**
- Node.js >= 18 (required by esbuild)
- npm (any recent version)

**Runtime:**
- Modern browser (ES2020 support)
- Tampermonkey or similar userscript manager
- No server-side components required

**Browser APIs Required:**
- DOM APIs (querySelectorAll, querySelector, addEventListener, etc.)
- localStorage API
- Cookie access via document.cookie
- requestAnimationFrame
- Custom DOM events

## Target Domains

**CSGORoll.com:**
- Market pages (scraping item cards)
- Trade verification flows

**Steam Community:**
- Trade offer pages (inventory automation)
- Asset identification

## Key Build Artifacts

- `dist/index.bundle.js` - Distributed userscript bundle

---

*Stack analysis: 2026-02-22*
