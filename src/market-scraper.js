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

        // Auto-start sell verification if continuing from saved state
        this.checkAndContinueSellVerification();

        // Debug: Log what's happening on page load
        console.log('MarketScraper initialized on:', window.location.hostname);
        console.log('Checking for saved automation state...');

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
            padding: Theme.spacing.md,
            height: '100%',
            overflow: 'auto'
        });

        // Filter Configuration Section
        const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            this.itemFilter.setCustomFilterConfig(config);
        });

        const configSection = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        configSection.appendChild(jsonConfig.label);
        configSection.appendChild(jsonConfig.textarea);
        configSection.appendChild(jsonConfig.loadButton);

        // Market Sniper Controls Section
        const controlsSection = this.createSniperControls();

        // Status Section
        const statusSection = this.createSniperStatus();

        container.appendChild(configSection);
        container.appendChild(controlsSection);
        container.appendChild(statusSection);

        return container;
    }

    createSniperControls() {
        const section = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Market Sniper Controls', {
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

        const startButton = UIComponents.createButton('Start Sniper', 'success', 'lg', () => {
            this.handleStartSniper();
        });

        const stopButton = UIComponents.createButton('Stop Sniper', 'error', 'lg', () => {
            this.handleStopSniper();
        });

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);

        section.appendChild(title);
        section.appendChild(buttonContainer);

        return section;
    }

    createSniperStatus() {
        const section = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Sniper Status', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const statusGrid = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: Theme.spacing.sm
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

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);
        buttonContainer.appendChild(manualTriggerButton);

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

    checkAndContinueSellVerification() {
        console.log('=== CHECKING SELL VERIFICATION STATE ===');
        console.log('hasRestorableState:', this.sellItemVerification.hasRestorableState);

        // Also check localStorage directly
        const savedState = localStorage.getItem('sellItemVerificationState');
        console.log('Raw localStorage state:', savedState);

        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                console.log('Parsed saved state:', parsedState);
            } catch (e) {
                console.error('Error parsing saved state:', e);
            }
        }

        // Check if automation has restorable state
        if (this.sellItemVerification.hasRestorableState) {
            console.log('✅ Found restorable sell verification state, auto-continuing automation');

            // Set appropriate step based on current page (only if not already set correctly)
            if (this.sellItemVerification.isSteamPage()) {
                console.log('✅ On Steam page - current step:', this.sellItemVerification.currentStep);
                // Only override if we're in the wrong step
                if (this.sellItemVerification.currentStep === 'wait_for_continue') {
                    console.log('Correcting step from wait_for_continue to navigate_inventory');
                    this.sellItemVerification.currentStep = 'navigate_inventory';
                }
            }

            // Automatically start the automation manager with sell verification
            setTimeout(() => {
                try {
                    console.log('🚀 Starting automation manager...');
                    this.automationManager.startAutomation('sell-item-verification');
                    console.log('✅ Auto-started sell item verification from saved state');
                } catch (error) {
                    console.error('❌ Failed to auto-start sell verification:', error);
                }
            }, 2000); // Increased delay to ensure page is fully loaded
        } else {
            console.log('❌ No restorable state found');
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