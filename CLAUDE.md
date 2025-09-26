# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- **Build**: `npm run build` - Uses esbuild to bundle the project into `dist/index.bundle.js`
- **Test**: No test framework configured (outputs error message)

## Project Architecture

This is a browser userscript/tampermonkey application called "TamirMakeMoney" that appears to be a market automation tool for game items. The project uses ES6 modules and is bundled with esbuild.

### Core Architecture

**Entry Point**: `index.js` creates a global `MarketItemScraper` instance that serves as the main application controller.

**Main Components**:
- `MarketItemScraper` (`src/market-scraper.js`) - Central controller that orchestrates all functionality
- `AutomationManager` (`src/automation/automation-manager.js`) - Manages multiple automation instances with lifecycle control, error handling, and resource coordination
- UI system with tabbed interface and overlay components
- Market data scraping and filtering system
- Automated withdrawal and monitoring system

### Key Architectural Patterns

1. **Automation System**: The project uses a plugin-based automation architecture where:
   - `AutomationManager` handles registration, lifecycle, and coordination of multiple automations
   - Individual automations implement start/stop/pause/resume lifecycle methods
   - Automations are prioritized and can share resources through the manager

2. **Component-Based UI**: UI is built from reusable components in `src/components/`:
   - `UIComponents` - Base UI elements (buttons, inputs, overlays)
   - `TabbedInterface` - Tab management system
   - `AutomationTabs` - Automation-specific UI components
   - Theme system provides consistent styling

3. **Data Processing Pipeline**:
   - `DataScraper` extracts market data
   - `ItemFilter` applies filtering logic based on JSON configuration
   - Automation components process filtered data

### Module Structure

```
src/
├── automation/          # Automation implementations
│   ├── automation-manager.js    # Central automation coordinator
│   ├── withdrawal-automation.js # Automated withdrawal logic
│   └── market-monitor.js        # Market monitoring automation
├── components/          # UI components
├── utils/              # Utility functions
├── scrapers/           # Data scraping logic
├── filters/            # Item filtering logic
└── theme/              # Theming system
```

### Build System

The project uses esbuild for bundling:
- Entry: `index.js`
- Output: `dist/index.bundle.js` (IIFE format with global name "RollMoney")
- Target: ES2020
- No minification, no source maps

### User Interface

The application creates an overlay interface triggered by Ctrl+Shift+S that provides:
- Tabbed interface with Summary and Market Sniper tabs
- JSON configuration for item filtering
- Automation controls (start/stop sniper)
- Real-time status monitoring
- Draggable overlay with position persistence

### Development Notes

- Uses ES6 modules throughout
- No external dependencies beyond esbuild
- Browser-based application (no Node.js runtime dependencies)
- Keyboard shortcut activation (Ctrl+Shift+S)
- Local storage for configuration persistence