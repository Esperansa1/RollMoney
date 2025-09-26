import { DOMUtils } from './utils/dom-utils.js';
import { UIComponents } from './components/ui-components.js';
import { DataScraper } from './scrapers/data-scraper.js';
import { ItemFilter } from './filters/item-filter.js';
import { WithdrawalAutomation } from './automation/withdrawal-automation.js';
import { Theme } from './theme/theme.js';

export class MarketItemScraper {
    constructor() {
        this.isScraperActive = false;
        this.dataScraper = new DataScraper();
        this.itemFilter = new ItemFilter();
        this.automation = new WithdrawalAutomation(this.dataScraper, this.itemFilter);
        this.overlay = null;
        this.resultsArea = null;

        this.initializeKeyboardShortcut();
    }

    initializeKeyboardShortcut() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
                this.toggleScraper();
            }
        });
    }

    toggleScraper() {
        this.isScraperActive = !this.isScraperActive;

        if (this.isScraperActive) {
            this.createScraperOverlay();
        } else {
            this.closeOverlay();
        }
    }

    createScraperOverlay() {
        if (document.getElementById('market-scraper-overlay')) {
            return;
        }

        this.overlay = UIComponents.createOverlay();
        this.setupOverlayComponents();
        document.body.appendChild(this.overlay);
        DOMUtils.centerElementOnScreen(this.overlay);
    }

    setupOverlayComponents() {
        const dragHandle = UIComponents.createDragHandle(this.overlay, {
            onDragEnd: (x, y) => {
                console.log('Drag ended at:', x, y);
            },
            onPositionSave: (x, y) => {
                localStorage.setItem('scraperOverlayX', x);
                localStorage.setItem('scraperOverlayY', y);
            }
        });

        const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            this.itemFilter.setCustomFilterConfig(config);
        });

        const resultsSection = UIComponents.createResultsArea();
        this.resultsArea = resultsSection.textarea;

        const controlButtons = UIComponents.createControlButtons({
            onScrape: () => this.handleScrapeItems(),
            onCopy: () => this.handleCopyResults(),
            onClear: () => this.handleClearProcessed(),
            onClose: () => this.closeOverlay()
        });

        const autoWithdrawButtons = UIComponents.createAutoWithdrawButtons({
            onStart: () => this.handleStartAutoWithdraw(),
            onStop: () => this.handleStopAutoWithdraw()
        });

        const testButton = UIComponents.createTestRefreshButton(() => {
            this.automation.testRefreshButtonFunctionality();
        });

        const autoClearControls = UIComponents.createAutoClearControls();

        this.appendComponentsToOverlay({
            dragHandle,
            jsonConfig,
            resultsSection,
            controlButtons,
            autoWithdrawButtons,
            testButton,
            autoClearControls
        });
    }

    appendComponentsToOverlay({ dragHandle, jsonConfig, resultsSection, controlButtons, autoWithdrawButtons, testButton, autoClearControls }) {
        this.overlay.insertBefore(dragHandle, this.overlay.firstChild);

        // Create section dividers for better organization
        const createSectionDivider = () => {
            return DOMUtils.createElement('div', {
                height: '1px',
                backgroundColor: Theme.colors.border,
                margin: `${Theme.spacing.md} 0`,
                width: '100%'
            });
        };

        const buttonGroup = DOMUtils.createElement('div', {
            display: 'flex',
            flexWrap: 'wrap',
            gap: Theme.spacing.sm,
            marginBottom: Theme.spacing.md
        });

        [controlButtons.scrapeButton, controlButtons.copyButton, controlButtons.clearButton].forEach(btn => {
            buttonGroup.appendChild(btn);
        });

        const automationGroup = DOMUtils.createElement('div', {
            display: 'flex',
            flexWrap: 'wrap',
            gap: Theme.spacing.sm,
            marginBottom: Theme.spacing.md
        });

        [autoWithdrawButtons.startButton, autoWithdrawButtons.stopButton, testButton].forEach(btn => {
            automationGroup.appendChild(btn);
        });

        const closeButtonContainer = DOMUtils.createElement('div', {
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: Theme.spacing.md
        });
        closeButtonContainer.appendChild(controlButtons.closeButton);

        [
            jsonConfig.label,
            jsonConfig.textarea,
            jsonConfig.loadButton,
            createSectionDivider(),
            resultsSection.label,
            resultsSection.textarea,
            createSectionDivider(),
            buttonGroup,
            automationGroup,
            autoClearControls,
            closeButtonContainer
        ].forEach(component => {
            this.overlay.appendChild(component);
        });
    }

    handleScrapeItems() {
        const scrapedItems = this.dataScraper.scrapeMarketItems();
        const filteredItems = this.itemFilter.filterItems(scrapedItems);
        this.resultsArea.value = JSON.stringify(filteredItems, null, 2);
    }

    handleCopyResults() {
        this.resultsArea.select();
        document.execCommand('copy');
        UIComponents.showNotification('📋 Results copied to clipboard!', 'success');
    }

    handleClearProcessed() {
        const count = this.dataScraper.clearProcessedItems();
        console.log(`Cleared ${count} processed items`);
    }

    handleStartAutoWithdraw() {
        console.log("Starting periodic scan");

        const autoClearInput = this.overlay.querySelector('input[type="number"]');
        const seconds = parseInt(autoClearInput?.value) || 5;

        this.automation.startPeriodicScan();
        this.automation.startAutoClear(seconds);
    }

    handleStopAutoWithdraw() {
        this.automation.stopPeriodicScan();
    }

    closeOverlay() {
        DOMUtils.removeElementById('market-scraper-overlay');
        this.overlay = null;
        this.resultsArea = null;
        this.isScraperActive = false;
    }

    centerOverlay() {
        if (this.overlay) {
            DOMUtils.centerElementOnScreen(this.overlay);

            if (this.overlay.querySelector('.drag-handle')) {
                const dragHandle = this.overlay.querySelector('.drag-handle');
                if (dragHandle.xOffset !== undefined) {
                    dragHandle.xOffset = 0;
                    dragHandle.yOffset = 0;
                }
            }

            localStorage.removeItem('scraperOverlayX');
            localStorage.removeItem('scraperOverlayY');
        }
    }

    getFilterConfig() {
        return this.itemFilter.getCustomFilterConfig();
    }

    updateFilterConfig(config) {
        const validation = this.itemFilter.validateFilterConfig(config);
        if (validation.valid) {
            this.itemFilter.setCustomFilterConfig(config);
            return { success: true };
        } else {
            return { success: false, error: validation.error };
        }
    }

    getProcessedItemsCount() {
        return this.dataScraper.getProcessedItemsCount();
    }

    isAutomationRunning() {
        return this.automation.isAutomationRunning();
    }
}