import { DOMUtils } from './utils/dom-utils.js';
import { UIComponents } from './components/ui-components.js';
import { DataScraper } from './scrapers/data-scraper.js';
import { ItemFilter } from './filters/item-filter.js';
import { WithdrawalAutomation } from './automation/withdrawal-automation.js';
import { MarketMonitor } from './automation/market-monitor.js';
import { SellItemVerification } from './automation/sell-item-verification.js';
import { AutomationManager } from './automation/automation-manager.js';
import { TabbedInterface } from './components/tabbed-interface.js';
import { AutomationTabs } from './components/automation-tabs.js';
import { Theme } from './theme/theme.js';

export class MarketItemScraper {
    constructor() {
        this.isScraperActive = false;
        this.dataScraper = new DataScraper();
        this.itemFilter = new ItemFilter();

        // Initialize automation manager and automations
        this.automationManager = new AutomationManager();
        this.withdrawalAutomation = new WithdrawalAutomation(this.dataScraper, this.itemFilter);
        this.marketMonitor = new MarketMonitor(this.dataScraper, this.itemFilter);
        this.sellItemVerification = new SellItemVerification();

        // Register automations
        this.automationManager.registerAutomation('withdrawal', this.withdrawalAutomation);
        this.automationManager.registerAutomation('market-monitor', this.marketMonitor);
        this.automationManager.registerAutomation('sell-item-verification', this.sellItemVerification);

        // Auto-start sell verification only if on Steam page with URL data
        this.checkForSteamPageAutomation();

        // Auto-restart sniper if a page reload was triggered by a "not joinable" error
        if (localStorage.getItem('sniper-auto-restart') === '1') {
            localStorage.removeItem('sniper-auto-restart');
            console.log('Auto-restart: sniper was running before reload — restarting in 2s...');
            setTimeout(() => {
                try {
                    this.handleStartSniper();
                } catch (error) {
                    console.error('Auto-restart failed:', error);
                }
            }, 2000);
        }

        // Debug: Log what's happening on page load
        console.log('MarketScraper initialized on:', window.location.hostname);

        this.overlay = null;
        this.resultsArea = null;
        this.tabbedInterface = null;
        this.automationTabs = null;

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

        // Ensure overlay is always appended to document.body and positioned absolutely
        // This prevents it from being contained within any sidebar or container
        document.body.appendChild(this.overlay);

        // Force absolute positioning to ensure it's above all content
        // This prevents the overlay from being hidden in sidebars or containers
        this.overlay.style.position = 'fixed';
        this.overlay.style.zIndex = '99999'; // Higher than any possible sidebar z-index
        this.overlay.style.pointerEvents = 'auto'; // Ensure it's interactive
        this.overlay.style.display = 'block'; // Force visibility
        this.overlay.style.visibility = 'visible'; // Ensure not hidden
        this.overlay.style.left = 'auto'; // Reset any inherited left positioning
        this.overlay.style.right = '20px'; // Set right positioning
        this.overlay.style.top = '20px'; // Set top positioning

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
            },
            onClose: () => {
                this.closeOverlay();
            }
        });

        // Create tabbed interface
        this.tabbedInterface = new TabbedInterface();
        this.automationTabs = new AutomationTabs(this.automationManager);

        const tabbedContainer = this.tabbedInterface.createInterface();

        // Create configuration tab content
        const configTabContent = this.createConfigurationTab();

        // Add tabs
        this.tabbedInterface.addTab('summary', 'Summary', () => this.automationTabs.createSummaryTab(), {
            icon: '📊'
        });

        this.tabbedInterface.addTab('sniper', 'Market Sniper', configTabContent, {
            icon: '🎯'
        });

        this.tabbedInterface.addTab('sell-verification', 'Sell Verification', () => this.createSellVerificationTab(), {
            icon: '✅'
        });

        this.appendComponentsToOverlay({
            dragHandle,
            tabbedContainer
        });
    }

    createConfigurationTab() {
        const container = DOMUtils.createElement('div', {
            padding: Theme.spacing.sm,
            height: '100%',
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: Theme.spacing.md,
            gridTemplateRows: 'auto auto auto'
        });

        // Filter Configuration Section - more compact
        const configSection = DOMUtils.createElement('div', {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`,
            gridColumn: '1 / 3'
        });

        const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            console.log('Market scraper received filter config:', config);
            this.itemFilter.setCustomFilterConfig(config);
            this.updateCurrentFilterDisplay(config);
            console.log('Filter applied to itemFilter and display updated');
        });

        // Compact filter layout with dual textboxes
        const filterHeader = DOMUtils.createElement('div', {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Theme.spacing.xs
        });

        const compactLabel = UIComponents.createLabel('Filter Configuration', {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: '0'
        });

        const buttonContainer = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.xs
        });

        buttonContainer.appendChild(jsonConfig.loadButton);
        buttonContainer.appendChild(jsonConfig.clearButton);

        filterHeader.appendChild(compactLabel);
        filterHeader.appendChild(buttonContainer);

        // Create a grid layout for the two textboxes
        const textboxContainer = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: Theme.spacing.sm,
            marginTop: Theme.spacing.xs
        });

        // Left column - Current filter
        const currentFilterColumn = DOMUtils.createElement('div');
        currentFilterColumn.appendChild(jsonConfig.currentLabel);
        currentFilterColumn.appendChild(jsonConfig.currentTextarea);

        // Right column - New filter input
        const inputFilterColumn = DOMUtils.createElement('div');
        inputFilterColumn.appendChild(jsonConfig.inputLabel);
        inputFilterColumn.appendChild(jsonConfig.inputTextarea);

        textboxContainer.appendChild(currentFilterColumn);
        textboxContainer.appendChild(inputFilterColumn);

        configSection.appendChild(filterHeader);
        configSection.appendChild(textboxContainer);

        // Market Sniper Controls Section - left column
        const controlsSection = this.createSniperControls();
        controlsSection.style.gridColumn = '1';

        // Status Section - right column
        const statusSection = this.createSniperStatus();
        statusSection.style.gridColumn = '2';

        container.appendChild(configSection);
        container.appendChild(controlsSection);
        container.appendChild(statusSection);

        return container;
    }

    createSniperControls() {
        const section = DOMUtils.createElement('div', {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Sniper Controls', {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
        });

        const buttonContainer = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.sm,
            justifyContent: 'center',
            marginBottom: Theme.spacing.sm
        });

        const startButton = UIComponents.createButton('Start Sniper', 'success', 'md', () => {
            this.handleStartSniper();
        });

        const stopButton = UIComponents.createButton('Stop Sniper', 'error', 'md', () => {
            this.handleStopSniper();
        });

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);

        // Price threshold setting
        const settingsContainer = DOMUtils.createElement('div', {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`,
            marginTop: Theme.spacing.sm
        });

        const settingsTitle = UIComponents.createLabel('Monitor Settings', {
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.xs
        });

        const thresholdContainer = DOMUtils.createElement('div', {
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.sm
        });

        const thresholdLabel = UIComponents.createLabel('Alert Threshold:', {
            marginBottom: '0',
            fontSize: Theme.typography.fontSize.xs,
            minWidth: '90px'
        });

        const thresholdInput = UIComponents.createInput('number', {
            width: '60px',
            fontSize: Theme.typography.fontSize.xs
        }, {
            min: '0',
            max: '100',
            step: '0.1',
            value: '5.0',
            id: 'sniper-price-threshold-input'
        });

        // Initialize input from live ItemFilter value (source of truth)
        thresholdInput.value = String(this.itemFilter.baseFilters.maxPercentageChange ?? 5.1);

        const thresholdPercent = UIComponents.createLabel('%', {
            marginBottom: '0',
            fontSize: Theme.typography.fontSize.sm
        });

        const applyBtn = UIComponents.createButton('Apply', 'primary', 'sm', () => {
            const rawValue = thresholdInput.value.trim();

            // Validation: empty field
            if (rawValue === '') {
                UIComponents.showNotification('Threshold cannot be empty', 'error');
                return;
            }

            // Validation: use Number() (stricter than parseFloat — rejects '5abc')
            const parsed = Number(rawValue);
            if (isNaN(parsed)) {
                UIComponents.showNotification('Invalid threshold: must be a number', 'error');
                return;
            }

            // Validation: range 0–100
            if (parsed < 0 || parsed > 100) {
                UIComponents.showNotification('Threshold must be between 0 and 100', 'error');
                return;
            }

            // Apply to ItemFilter — maxPercentageChange is in % (e.g., 5.1, not 0.051)
            this.itemFilter.updateBaseFilters({ maxPercentageChange: parsed });

            // Keep MarketMonitor in sync — its priceThreshold is a fraction (e.g., 0.051)
            const marketMonitor = this.automationManager.getAutomation('market-monitor');
            if (marketMonitor && marketMonitor.updatePriceThreshold) {
                marketMonitor.updatePriceThreshold(parsed / 100);
            }

            // Visual feedback
            UIComponents.showNotification(`Threshold set to ${parsed}%`, 'success');
            const originalText = applyBtn.textContent;
            applyBtn.textContent = '✓ Applied';
            applyBtn.style.backgroundColor = Theme.colors.success;
            setTimeout(() => {
                applyBtn.textContent = originalText;
                applyBtn.style.backgroundColor = '';
            }, 1500);
        });

        thresholdContainer.appendChild(thresholdLabel);
        thresholdContainer.appendChild(thresholdInput);
        thresholdContainer.appendChild(thresholdPercent);
        thresholdContainer.appendChild(applyBtn);

        settingsContainer.appendChild(settingsTitle);
        settingsContainer.appendChild(thresholdContainer);

        section.appendChild(title);
        section.appendChild(buttonContainer);
        section.appendChild(settingsContainer);

        return section;
    }

    createSniperStatus() {
        const section = DOMUtils.createElement('div', {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Status', {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
        });

        const statusGrid = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: Theme.spacing.xs
        });
        statusGrid.id = 'sniper-status-grid';

        section.appendChild(title);
        section.appendChild(statusGrid);

        // Start refresh timer for status updates
        setInterval(() => {
            this.updateSniperStatus();
        }, 1000);

        return section;
    }

    appendComponentsToOverlay({ dragHandle, tabbedContainer }) {
        this.overlay.insertBefore(dragHandle, this.overlay.firstChild);
        this.overlay.appendChild(tabbedContainer);
    }

    handleStartSniper() {
        console.log("Starting Market Sniper");

        try {
            // Start both withdrawal automation and market monitor
            this.automationManager.startAutomation('withdrawal');
            this.automationManager.startAutomation('market-monitor');

            // Start auto-clear with 5 second default
            this.withdrawalAutomation.startAutoClear(5);

            UIComponents.showNotification('Market Sniper started successfully!', 'success');
        } catch (error) {
            console.error('Failed to start Market Sniper:', error);
            UIComponents.showNotification('Failed to start Market Sniper', 'error');
        }
    }

    handleStopSniper() {
        console.log("Stopping Market Sniper");

        try {
            // Stop all automations
            this.automationManager.stopAll();
            UIComponents.showNotification('Market Sniper stopped successfully!', 'success');
        } catch (error) {
            console.error('Failed to stop Market Sniper:', error);
            UIComponents.showNotification('Failed to stop Market Sniper', 'error');
        }
    }

    updateSniperStatus() {
        const statusGrid = document.getElementById('sniper-status-grid');
        if (!statusGrid) return;

        // Update price threshold input to reflect current setting
        const thresholdInput = document.getElementById('sniper-price-threshold-input');
        if (thresholdInput) {
            const marketMonitor = this.automationManager.getAutomation('market-monitor');
            if (marketMonitor) {
                const currentThreshold = (marketMonitor.settings.priceThreshold * 100).toFixed(1);
                if (thresholdInput.value !== currentThreshold) {
                    thresholdInput.value = currentThreshold;
                }
            }
        }

        const stats = this.automationManager.getStats();
        const withdrawalStatus = this.automationManager.getAutomationStatus('withdrawal');
        const monitorStatus = this.automationManager.getAutomationStatus('market-monitor');

        const statusData = [
            {
                label: 'Status',
                value: stats.runningAutomations > 0 ? 'RUNNING' : 'STOPPED',
                color: stats.runningAutomations > 0 ? Theme.colors.success : Theme.colors.error
            },
            {
                label: 'Items Processed',
                value: this.dataScraper.getProcessedItemsCount(),
                color: Theme.colors.info
            },
            {
                label: 'Uptime',
                value: this.formatUptime(stats.uptime),
                color: Theme.colors.primary
            }
        ];

        statusGrid.innerHTML = '';

        statusData.forEach(stat => {
            const statCard = DOMUtils.createElement('div', {
                textAlign: 'center',
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.surfaceVariant,
                borderRadius: Theme.borderRadius.md,
                border: `1px solid ${Theme.colors.border}`
            });

            const value = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.xl,
                fontWeight: Theme.typography.fontWeight.bold,
                color: stat.color,
                marginBottom: Theme.spacing.xs
            });
            value.textContent = stat.value;

            const label = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.sm,
                color: Theme.colors.onSurface
            });
            label.textContent = stat.label;

            statCard.appendChild(value);
            statCard.appendChild(label);
            statusGrid.appendChild(statCard);
        });
    }

    formatUptime(milliseconds) {
        if (milliseconds === 0) return '0s';

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    updateCurrentFilterDisplay(config) {
        const currentDisplay = document.getElementById('current-filter-display');
        if (currentDisplay) {
            if (config && config.length > 0) {
                currentDisplay.value = JSON.stringify(config, null, 2);
            } else {
                currentDisplay.value = '';
                currentDisplay.placeholder = 'No filter currently active';
            }
        }
    }

    createSellVerificationTab() {
        const container = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            height: '100%',
            overflow: 'auto'
        });

        // Control section
        const controlsSection = this.createSellVerificationControls();

        // Status section
        const statusSection = this.createSellVerificationStatus();

        // Logs section
        const logsSection = this.createSellVerificationLogs();

        container.appendChild(controlsSection);
        container.appendChild(statusSection);
        container.appendChild(logsSection);

        // Start refresh timer for status updates
        setInterval(() => {
            this.updateSellVerificationStatus();
        }, 1000);

        return container;
    }

    createSellVerificationControls() {
        const section = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Sell Item Verification Controls', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const buttonContainer = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.md,
            justifyContent: 'center',
            marginBottom: Theme.spacing.md
        });

        const startButton = UIComponents.createButton('Start Verification', 'success', 'lg', () => {
            this.handleStartSellVerification();
        });

        const stopButton = UIComponents.createButton('Stop Verification', 'error', 'lg', () => {
            this.handleStopSellVerification();
        });

        const manualTriggerButton = UIComponents.createButton('Manual Trigger', 'secondary', 'md', () => {
            this.handleManualTrigger();
        });

        const emergencyStopButton = UIComponents.createButton('Emergency Stop', 'error', 'md', () => {
            this.handleEmergencyStop();
        });

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);
        buttonContainer.appendChild(manualTriggerButton);
        buttonContainer.appendChild(emergencyStopButton);

        // Debug step controls
        const debugSection = this.createDebugStepControls();
        section.appendChild(debugSection);

        section.appendChild(title);
        section.appendChild(buttonContainer);

        return section;
    }

    createSellVerificationStatus() {
        const section = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Current Status', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const statusGrid = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: Theme.spacing.sm
        });
        statusGrid.id = 'sell-verification-status-grid';

        section.appendChild(title);
        section.appendChild(statusGrid);

        return section;
    }


    createSellVerificationLogs() {
        const section = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Activity Log', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const logDisplay = DOMUtils.createElement('div', {
            backgroundColor: Theme.colors.surfaceVariant,
            padding: Theme.spacing.md,
            borderRadius: Theme.borderRadius.sm,
            fontSize: Theme.typography.fontSize.sm,
            fontFamily: 'monospace',
            height: '150px',
            overflow: 'auto',
            border: `1px solid ${Theme.colors.border}`
        });
        logDisplay.id = 'sell-verification-log-display';

        const clearLogsButton = UIComponents.createButton('Clear Logs', 'secondary', 'sm', () => {
            logDisplay.innerHTML = '';
        });

        section.appendChild(title);
        section.appendChild(logDisplay);
        section.appendChild(clearLogsButton);

        return section;
    }

    handleStartSellVerification() {
        console.log("Starting Sell Item Verification");

        try {
            this.automationManager.startAutomation('sell-item-verification');
            UIComponents.showNotification('Sell Item Verification started successfully!', 'success');
        } catch (error) {
            console.error('Failed to start Sell Item Verification:', error);
            UIComponents.showNotification('Failed to start Sell Item Verification', 'error');
        }
    }

    handleStopSellVerification() {
        console.log("Stopping Sell Item Verification");

        try {
            this.automationManager.stopAutomation('sell-item-verification');
            UIComponents.showNotification('Sell Item Verification stopped successfully!', 'success');
        } catch (error) {
            console.error('Failed to stop Sell Item Verification:', error);
            UIComponents.showNotification('Failed to stop Sell Item Verification', 'error');
        }
    }

    handleManualTrigger() {
        console.log("Manual trigger for Sell Item Verification");

        try {
            this.sellItemVerification.manualTrigger();
            UIComponents.showNotification('Manual trigger activated!', 'info');
        } catch (error) {
            console.error('Failed to trigger Sell Item Verification:', error);
            UIComponents.showNotification('Failed to trigger automation', 'error');
        }
    }

    handleEmergencyStop() {
        console.log("🛑 EMERGENCY STOP - Clearing all automation state");

        try {
            // Stop all automations
            this.automationManager.stopAll();

            // Reset sell verification state
            this.sellItemVerification.isRunning = false;
            this.sellItemVerification.currentStep = 'idle';
            this.sellItemVerification.collectedData = {};
            this.sellItemVerification.tradeLog = [];

            // localStorage no longer used - state is URL-based only

            UIComponents.showNotification('Emergency stop completed - all automation cleared!', 'success');
            console.log("🛑 Emergency stop completed");
        } catch (error) {
            console.error('Error during emergency stop:', error);
            UIComponents.showNotification('Error during emergency stop', 'error');
        }
    }

    createDebugStepControls() {
        const debugSection = DOMUtils.createElement('div', {
            marginTop: Theme.spacing.md,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const debugTitle = UIComponents.createLabel('Debug Step Controls', {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
        });

        const debugButtonContainer = DOMUtils.createElement('div', {
            display: 'flex',
            flexWrap: 'wrap',
            gap: Theme.spacing.sm
        });

        const extractDataBtn = UIComponents.createButton('Extract Data', 'warning', 'sm', () => {
            this.handleDebugExtractData();
        });

        const sendItemsBtn = UIComponents.createButton('Send Items', 'warning', 'sm', () => {
            this.handleDebugSendItems();
        });

        const navigateInventoryBtn = UIComponents.createButton('Navigate Inventory', 'warning', 'sm', () => {
            this.handleDebugNavigateInventory();
        });

        const viewStateBtn = UIComponents.createButton('View State', 'info', 'sm', () => {
            this.handleDebugViewState();
        });

        const injectTestDataBtn = UIComponents.createButton('Inject Test Data', 'info', 'sm', () => {
            this.handleDebugInjectTestData();
        });

        debugButtonContainer.appendChild(extractDataBtn);
        debugButtonContainer.appendChild(sendItemsBtn);
        debugButtonContainer.appendChild(navigateInventoryBtn);
        debugButtonContainer.appendChild(viewStateBtn);
        debugButtonContainer.appendChild(injectTestDataBtn);

        debugSection.appendChild(debugTitle);
        debugSection.appendChild(debugButtonContainer);

        return debugSection;
    }

    handleDebugExtractData() {
        console.log("🔧 DEBUG: Manually triggering data extraction with retry logic");
        try {
            // First check if we're in the right state and have a modal
            const modal = document.querySelector('mat-dialog-container');
            if (!modal) {
                console.log('⚠️ No modal found - you may need to open a trade dialog first');
                UIComponents.showNotification('No modal found - open trade dialog first', 'warning');
                return;
            }

            // Reset retry counter for fresh extraction
            this.sellItemVerification.extractionAttempts = 0;

            // Trigger extraction with retry logic
            this.sellItemVerification.step2_ExtractItemData();

            UIComponents.showNotification('Data extraction started with retry logic', 'info');
            console.log('🔄 Data extraction will retry automatically if data is incomplete');

        } catch (error) {
            console.error('Debug extract data error:', error);
            UIComponents.showNotification('Error in data extraction', 'error');
        }
    }

    handleDebugSendItems() {
        console.log("🔧 DEBUG: Manually triggering send items");
        try {
            // Check if we have collected data first
            if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
                console.log('⚠️ No data collected yet - extract data first');
                UIComponents.showNotification('Extract data first before sending items', 'warning');
                return;
            }

            // Check if "Send Items Now" button exists
            const sendButton = this.sellItemVerification.findButtonByText('Send Items Now');
            if (!sendButton) {
                console.log('⚠️ "Send Items Now" button not found');
                UIComponents.showNotification('Send Items Now button not found', 'warning');
                return;
            }

            this.sellItemVerification.step2_SendItems();
            UIComponents.showNotification('Send items triggered - check console for navigation details', 'info');
        } catch (error) {
            console.error('Debug send items error:', error);
            UIComponents.showNotification('Error in send items', 'error');
        }
    }

    handleDebugNavigateInventory() {
        console.log("🔧 DEBUG: Manually triggering navigate inventory");
        try {
            // Check if we're on Steam page
            if (!this.sellItemVerification.isSteamPage()) {
                console.log('⚠️ Not on Steam page - this step only works on Steam');
                UIComponents.showNotification('Navigate inventory only works on Steam page', 'warning');
                return;
            }

            // Try to load data from URL parameters first
            console.log('🔗 Attempting to load data from URL parameters...');
            const urlState = this.sellItemVerification.decodeDataFromUrlParams();

            if (urlState && urlState.collectedData) {
                console.log('✅ Found data in URL parameters:', urlState.collectedData);
                this.sellItemVerification.collectedData = urlState.collectedData;
                this.sellItemVerification.currentStep = 'navigate_inventory';
                UIComponents.showNotification('Loaded data from URL parameters', 'success');
            } else if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
                console.log('⚠️ No data found in URL or stored - cannot navigate inventory');
                UIComponents.showNotification('No item data available - open Steam page from CSGORoll or inject test data', 'warning');
                return;
            }

            console.log('📋 Using collected data:', this.sellItemVerification.collectedData);
            this.sellItemVerification.step3_NavigateInventory();
            UIComponents.showNotification('Navigate inventory triggered with data', 'info');
        } catch (error) {
            console.error('Debug navigate inventory error:', error);
            UIComponents.showNotification('Error in navigate inventory', 'error');
        }
    }

    handleDebugViewState() {
        console.log("🔧 DEBUG: Viewing current state");
        const state = {
            currentStep: this.sellItemVerification.currentStep,
            isRunning: this.sellItemVerification.isRunning,
            collectedData: this.sellItemVerification.collectedData,
        };

        console.log("Current automation state:", state);

        console.log("Note: localStorage no longer used - state is URL-based only");

        UIComponents.showNotification('State logged to console', 'info');
    }

    handleDebugInjectTestData() {
        console.log("🔧 DEBUG: Injecting test data");

        const testData = {
            itemName: "Candy Apple",
            itemCategory: "Glock-18",
            itemValue: "25.75 TKN",
            inventoryPage: 3,
            itemPosition: 12,
            timestamp: new Date().toISOString()
        };

        this.sellItemVerification.collectedData = testData;
        this.sellItemVerification.currentStep = 'navigate_inventory';
        this.sellItemVerification.isRunning = true;

        // Test URL encoding functionality
        const encodedData = this.sellItemVerification.encodeDataToUrlParams(testData);
        console.log("🔗 Test URL encoding:", encodedData);

        // Test decoding (simulate what happens on Steam page)
        if (encodedData) {
            // Temporarily add to URL for testing
            const testUrl = `https://steamcommunity.com/tradeoffer/new/?partner=123&token=abc&automation_data=${encodedData}`;
            console.log("🔗 Test URL with data:", testUrl);
        }

        console.log("Injected test data:", testData);
        UIComponents.showNotification('Test data injected and URL encoding tested', 'success');
    }

    // Removed handleDebugFullSequence() - use individual debug buttons instead

    checkForSteamPageAutomation() {
        console.log('=== CHECKING FOR STEAM PAGE AUTOMATION ===');
        console.log('🔍 Is Steam page:', this.sellItemVerification.isSteamPage());

        // ONLY auto-start on Steam pages with URL data
        if (this.sellItemVerification.isSteamPage()) {
            console.log('✅ Steam page with URL data found - auto-starting automation');

            // Ensure we're on the correct step for Steam page
            if (this.sellItemVerification.currentStep !== 'navigate_inventory') {
                console.log('🔧 Setting step to navigate_inventory for Steam page');
                this.sellItemVerification.currentStep = 'navigate_inventory';
            }

            // Automatically start the automation
            setTimeout(() => {
                try {
                    console.log('🚀 Auto-starting sell verification on Steam page...');
                    this.automationManager.startAutomation('sell-item-verification');
                    console.log('✅ Auto-started sell item verification from URL data');
                } catch (error) {
                    console.error('❌ Failed to auto-start sell verification:', error);
                }
            }, 2000);
        } else {
            console.log('🚫 Not auto-starting - either not Steam page or no URL data');
        }
    }

    updateSellVerificationStatus() {
        const statusGrid = document.getElementById('sell-verification-status-grid');
        const logDisplay = document.getElementById('sell-verification-log-display');

        if (!statusGrid) return;

        const automationStatus = this.automationManager.getAutomationStatus('sell-item-verification');
        const isActive = this.sellItemVerification.isActive();
        const currentStep = this.sellItemVerification.getCurrentStep();

        // Update status grid
        const statusData = [
            {
                label: 'Status',
                value: automationStatus?.status === 'running' ? 'RUNNING' : 'STOPPED',
                color: automationStatus?.status === 'running' ? Theme.colors.success : Theme.colors.error
            },
            {
                label: 'Current Step',
                value: currentStep || 'idle',
                color: isActive ? Theme.colors.warning : Theme.colors.info
            },
            {
                label: 'Active',
                value: isActive ? 'YES' : 'NO',
                color: isActive ? Theme.colors.success : Theme.colors.error
            }
        ];

        statusGrid.innerHTML = '';

        statusData.forEach(stat => {
            const statCard = DOMUtils.createElement('div', {
                textAlign: 'center',
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.surfaceVariant,
                borderRadius: Theme.borderRadius.md,
                border: `1px solid ${Theme.colors.border}`
            });

            const value = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.xl,
                fontWeight: Theme.typography.fontWeight.bold,
                color: stat.color,
                marginBottom: Theme.spacing.xs
            });
            value.textContent = stat.value;

            const label = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.sm,
                color: Theme.colors.onSurface
            });
            label.textContent = stat.label;

            statCard.appendChild(value);
            statCard.appendChild(label);
            statusGrid.appendChild(statCard);
        });

        // Update log display (show last few entries)
        if (logDisplay) {
            const logs = this.sellItemVerification.getTradeLog();
            const recentLogs = logs.slice(-10); // Last 10 entries

            const logHtml = recentLogs.map(log => {
                const time = new Date(log.timestamp).toLocaleTimeString();
                return `<div style="margin-bottom: 4px; color: ${Theme.colors.onSurface};">
                    [${time}] ${log.action || log.step} ${log.data ? '- ' + JSON.stringify(log.data) : ''}
                </div>`;
            }).join('');

            logDisplay.innerHTML = logHtml || '<div style="color: #666;">No recent activity...</div>';
            logDisplay.scrollTop = logDisplay.scrollHeight;
        }
    }

    closeOverlay() {
        // Stop all automations when closing
        if (this.automationManager.isRunning) {
            this.automationManager.stopAll();
        }

        // Clean up tabbed interface and automation tabs
        if (this.automationTabs) {
            this.automationTabs.destroy();
            this.automationTabs = null;
        }

        if (this.tabbedInterface) {
            this.tabbedInterface.destroy();
            this.tabbedInterface = null;
        }

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
        return this.automationManager.isRunning;
    }

    // Public API for accessing automation manager
    getAutomationManager() {
        return this.automationManager;
    }

    getAutomationStats() {
        return this.automationManager.getStats();
    }
}