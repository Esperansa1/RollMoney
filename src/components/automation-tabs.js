import { DOMUtils } from '../utils/dom-utils.js';
import { UIComponents } from './ui-components.js';
import { Theme } from '../theme/theme.js';

export class AutomationTabs {
    constructor(automationManager) {
        this.automationManager = automationManager;
        this.refreshIntervals = new Map();
    }

    createSummaryTab() {
        const container = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            height: '100%',
            overflow: 'auto'
        });

        // Overall stats section
        const statsSection = this.createStatsSection();

        // Active automations overview
        const overviewSection = this.createOverviewSection();

        // Recent activity log
        const activitySection = this.createActivitySection();

        container.appendChild(statsSection);
        container.appendChild(overviewSection);
        container.appendChild(activitySection);

        // Start refresh timer for summary
        this.startRefreshTimer('summary', () => {
            this.updateSummaryContent(container);
        });

        return container;
    }

    createStatsSection() {
        const section = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('System Overview', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const statsGrid = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: Theme.spacing.md
        });
        statsGrid.id = 'summary-stats-grid';

        section.appendChild(title);
        section.appendChild(statsGrid);

        return section;
    }

    createOverviewSection() {
        const section = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Market Sniper', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const sniperInfo = DOMUtils.createElement('div', {
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.sm
        });
        sniperInfo.id = 'summary-sniper-info';

        section.appendChild(title);
        section.appendChild(sniperInfo);

        return section;
    }

    createActivitySection() {
        const section = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Recent Activity', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const activityLog = DOMUtils.createElement('div', {
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: Theme.typography.fontSize.xs,
            fontFamily: 'monospace'
        });
        activityLog.id = 'summary-activity-log';

        section.appendChild(title);
        section.appendChild(activityLog);

        return section;
    }

    createWithdrawalTab() {
        const container = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            height: '100%',
            overflow: 'auto'
        });

        // Control panel
        const controlPanel = this.createWithdrawalControls();

        // Status and stats
        const statusPanel = this.createWithdrawalStatus();

        // Settings
        const settingsPanel = this.createWithdrawalSettings();

        container.appendChild(controlPanel);
        container.appendChild(statusPanel);
        container.appendChild(settingsPanel);

        // Start refresh timer
        this.startRefreshTimer('withdrawal', () => {
            this.updateWithdrawalContent(container);
        });

        return container;
    }

    createWithdrawalControls() {
        const panel = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Withdrawal Controls', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const buttonGroup = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.sm,
            flexWrap: 'wrap'
        });

        const automation = this.automationManager.getAutomationStatus('withdrawal');

        const startBtn = UIComponents.createButton('Start Withdrawal', 'success', 'md', () => {
            this.automationManager.startAutomation('withdrawal');
        });

        const stopBtn = UIComponents.createButton('Stop Withdrawal', 'error', 'md', () => {
            this.automationManager.stopAutomation('withdrawal');
        });

        const pauseBtn = UIComponents.createButton('Pause', 'secondary', 'md', () => {
            this.automationManager.pauseAutomation('withdrawal');
        });

        buttonGroup.appendChild(startBtn);
        buttonGroup.appendChild(stopBtn);
        buttonGroup.appendChild(pauseBtn);

        panel.appendChild(title);
        panel.appendChild(buttonGroup);

        return panel;
    }

    createWithdrawalStatus() {
        const panel = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Status & Statistics', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const statusGrid = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: Theme.spacing.sm
        });
        statusGrid.id = 'withdrawal-status-grid';

        panel.appendChild(title);
        panel.appendChild(statusGrid);

        return panel;
    }

    createWithdrawalSettings() {
        const panel = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Settings', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        // Auto-clear interval setting
        const autoClearControls = UIComponents.createAutoClearControls();

        // Max retries setting
        const retriesContainer = DOMUtils.createElement('div', {
            marginTop: Theme.spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.sm
        });

        const retriesLabel = UIComponents.createLabel('Max Retries:', {
            marginBottom: '0',
            fontSize: Theme.typography.fontSize.sm
        });

        const retriesInput = UIComponents.createInput('number', {
            width: '80px'
        }, {
            min: '1',
            max: '10',
            value: '3'
        });

        retriesContainer.appendChild(retriesLabel);
        retriesContainer.appendChild(retriesInput);

        panel.appendChild(title);
        panel.appendChild(autoClearControls);
        panel.appendChild(retriesContainer);

        return panel;
    }

    createMarketMonitorTab() {
        const container = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            height: '100%',
            overflow: 'auto'
        });

        // Monitor controls
        const controlPanel = this.createMonitorControls();

        // Price alerts
        const alertsPanel = this.createPriceAlerts();

        // Monitored items
        const itemsPanel = this.createMonitoredItems();

        container.appendChild(controlPanel);
        container.appendChild(alertsPanel);
        container.appendChild(itemsPanel);

        // Start refresh timer
        this.startRefreshTimer('market-monitor', () => {
            this.updateMarketMonitorContent(container);
        });

        return container;
    }

    createMonitorControls() {
        const panel = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Market Monitor Controls', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const buttonGroup = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.sm,
            flexWrap: 'wrap',
            marginBottom: Theme.spacing.md
        });

        const startBtn = UIComponents.createButton('Start Monitoring', 'success', 'md', () => {
            this.automationManager.startAutomation('market-monitor');
        });

        const stopBtn = UIComponents.createButton('Stop Monitoring', 'error', 'md', () => {
            this.automationManager.stopAutomation('market-monitor');
        });

        buttonGroup.appendChild(startBtn);
        buttonGroup.appendChild(stopBtn);

        // Price threshold setting
        const settingsContainer = DOMUtils.createElement('div', {
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`
        });

        const settingsTitle = UIComponents.createLabel('Settings', {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.xs
        });

        const thresholdContainer = DOMUtils.createElement('div', {
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.sm
        });

        const thresholdLabel = UIComponents.createLabel('Price Threshold:', {
            marginBottom: '0',
            fontSize: Theme.typography.fontSize.sm,
            minWidth: '100px'
        });

        const thresholdInput = UIComponents.createInput('number', {
            width: '80px'
        }, {
            min: '0.01',
            max: '1.0',
            step: '0.01',
            value: '0.05',
            id: 'price-threshold-input'
        });

        const thresholdPercent = UIComponents.createLabel('%', {
            marginBottom: '0',
            fontSize: Theme.typography.fontSize.sm
        });

        const applyBtn = UIComponents.createButton('Apply', 'primary', 'sm', () => {
            const newThreshold = parseFloat(thresholdInput.value) / 100;
            const marketMonitor = this.automationManager.getAutomation('market-monitor');
            if (marketMonitor && marketMonitor.updatePriceThreshold) {
                marketMonitor.updatePriceThreshold(newThreshold);

                // Show confirmation
                const originalText = applyBtn.textContent;
                applyBtn.textContent = '✓ Applied';
                applyBtn.style.backgroundColor = Theme.colors.success;
                setTimeout(() => {
                    applyBtn.textContent = originalText;
                    applyBtn.style.backgroundColor = '';
                }, 1500);
            }
        });

        thresholdContainer.appendChild(thresholdLabel);
        thresholdContainer.appendChild(thresholdInput);
        thresholdContainer.appendChild(thresholdPercent);
        thresholdContainer.appendChild(applyBtn);

        settingsContainer.appendChild(settingsTitle);
        settingsContainer.appendChild(thresholdContainer);

        panel.appendChild(title);
        panel.appendChild(buttonGroup);
        panel.appendChild(settingsContainer);

        return panel;
    }

    createPriceAlerts() {
        const panel = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Recent Price Alerts', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const alertsList = DOMUtils.createElement('div', {
            maxHeight: '200px',
            overflow: 'auto'
        });
        alertsList.id = 'price-alerts-list';

        panel.appendChild(title);
        panel.appendChild(alertsList);

        return panel;
    }

    createMonitoredItems() {
        const panel = DOMUtils.createElement('div', {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Monitored Items', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
        });

        const itemsList = DOMUtils.createElement('div', {
            maxHeight: '300px',
            overflow: 'auto'
        });
        itemsList.id = 'monitored-items-list';

        panel.appendChild(title);
        panel.appendChild(itemsList);

        return panel;
    }

    // Update methods
    updateSummaryContent(container) {
        const stats = this.automationManager.getStats();
        const statsGrid = container.querySelector('#summary-stats-grid');
        const sniperInfo = container.querySelector('#summary-sniper-info');

        if (statsGrid) {
            this.updateStatsGrid(statsGrid, stats);
        }

        if (sniperInfo) {
            this.updateSniperInfo(sniperInfo);
        }
    }

    updateStatsGrid(grid, stats) {
        grid.innerHTML = '';

        const version = window.ROLLMONEY_VERSION || 'dev';
        const statsData = [
            { label: 'Total Automations', value: stats.totalAutomations, color: Theme.colors.info },
            { label: 'Running', value: stats.runningAutomations, color: Theme.colors.success },
            { label: 'Success Rate', value: `${Math.round((stats.successfulRuns / (stats.successfulRuns + stats.failedRuns) * 100) || 0)}%`, color: Theme.colors.success },
            { label: 'Uptime', value: this.formatUptime(stats.uptime), color: Theme.colors.primary },
            { label: 'Version', value: `v${version}`, color: Theme.colors.info }
        ];

        statsData.forEach(stat => {
            const statCard = DOMUtils.createElement('div', {
                textAlign: 'center',
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.surface,
                borderRadius: Theme.borderRadius.md,
                border: `1px solid ${Theme.colors.border}`
            });

            const value = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.xxl,
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
            grid.appendChild(statCard);
        });
    }

    updateSniperInfo(container) {
        container.innerHTML = '';

        const stats = this.automationManager.getStats();
        const withdrawalStatus = this.automationManager.getAutomationStatus('withdrawal');
        const monitorStatus = this.automationManager.getAutomationStatus('market-monitor');

        // Sniper Status Card
        const statusCard = DOMUtils.createElement('div', {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`
        });

        const statusInfo = DOMUtils.createElement('div');

        const sniperName = DOMUtils.createElement('div', {
            fontWeight: Theme.typography.fontWeight.bold,
            fontSize: Theme.typography.fontSize.base,
            marginBottom: Theme.spacing.xs
        });
        sniperName.textContent = '🎯 Market Sniper';

        const sniperStatus = DOMUtils.createElement('div', {
            fontSize: Theme.typography.fontSize.sm,
            color: this.getStatusColor(stats.runningAutomations > 0 ? 'running' : 'stopped')
        });
        sniperStatus.textContent = `Status: ${stats.runningAutomations > 0 ? 'RUNNING' : 'STOPPED'}`;

        const componentsStatus = DOMUtils.createElement('div', {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.onSurface,
            marginTop: '2px'
        });

        const withdrawalText = withdrawalStatus ? withdrawalStatus.status.toUpperCase() : 'STOPPED';
        const monitorText = monitorStatus ? monitorStatus.status.toUpperCase() : 'STOPPED';
        componentsStatus.textContent = `Withdrawal: ${withdrawalText} | Monitor: ${monitorText}`;

        statusInfo.appendChild(sniperName);
        statusInfo.appendChild(sniperStatus);
        statusInfo.appendChild(componentsStatus);

        const quickControls = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.xs
        });

        if (stats.runningAutomations > 0) {
            const stopBtn = UIComponents.createButton('Stop', 'error', 'sm', () => {
                this.automationManager.stopAll();
            });
            quickControls.appendChild(stopBtn);
        } else {
            const startBtn = UIComponents.createButton('Start', 'success', 'sm', () => {
                this.automationManager.startAutomation('withdrawal');
                this.automationManager.startAutomation('market-monitor');
            });
            quickControls.appendChild(startBtn);
        }

        statusCard.appendChild(statusInfo);
        statusCard.appendChild(quickControls);
        container.appendChild(statusCard);
    }

    updateMarketMonitorContent(container) {
        // Update the price threshold input to reflect current setting
        const thresholdInput = container.querySelector('#price-threshold-input');
        if (thresholdInput) {
            const marketMonitor = this.automationManager.getAutomation('market-monitor');
            if (marketMonitor) {
                const currentThreshold = (marketMonitor.settings.priceThreshold * 100).toFixed(1);
                if (thresholdInput.value !== currentThreshold) {
                    thresholdInput.value = currentThreshold;
                }
            }
        }

        // Update price alerts
        const alertsList = container.querySelector('#price-alerts-list');
        if (alertsList) {
            this.updatePriceAlerts(alertsList);
        }

        // Update monitored items
        const itemsList = container.querySelector('#monitored-items-list');
        if (itemsList) {
            this.updateMonitoredItems(itemsList);
        }
    }

    updatePriceAlerts(container) {
        const marketMonitor = this.automationManager.getAutomation('market-monitor');
        if (!marketMonitor) {
            container.innerHTML = '<div style="text-align: center; color: #666;">Market Monitor not available</div>';
            return;
        }

        const alerts = marketMonitor.getRecentAlerts(10);
        container.innerHTML = '';

        if (alerts.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666;">No recent alerts</div>';
            return;
        }

        alerts.reverse().forEach(alert => {
            const alertItem = DOMUtils.createElement('div', {
                padding: Theme.spacing.sm,
                marginBottom: Theme.spacing.xs,
                backgroundColor: alert.type === 'price_increase' ? '#e8f5e8' : '#ffeee8',
                borderLeft: `3px solid ${alert.type === 'price_increase' ? Theme.colors.success : Theme.colors.warning}`,
                borderRadius: Theme.borderRadius.sm,
                fontSize: Theme.typography.fontSize.sm
            });

            const timeStr = new Date(alert.timestamp).toLocaleTimeString();
            const changePercent = (Math.abs(alert.priceChange) * 100).toFixed(1);
            const direction = alert.type === 'price_increase' ? '↗️' : '↘️';

            alertItem.innerHTML = `
                <div style="font-weight: bold;">${direction} ${alert.item.name}</div>
                <div>${changePercent}% price change at ${timeStr}</div>
            `;

            container.appendChild(alertItem);
        });
    }

    updateMonitoredItems(container) {
        const marketMonitor = this.automationManager.getAutomation('market-monitor');
        if (!marketMonitor) {
            container.innerHTML = '<div style="text-align: center; color: #666;">Market Monitor not available</div>';
            return;
        }

        const stats = marketMonitor.getStats();
        container.innerHTML = '';

        const statsInfo = DOMUtils.createElement('div', {
            textAlign: 'center',
            padding: Theme.spacing.md,
            color: Theme.colors.onSurface
        });

        statsInfo.innerHTML = `
            <div style="font-size: ${Theme.typography.fontSize.xl}; font-weight: bold; margin-bottom: ${Theme.spacing.xs};">
                ${stats.monitoredItems}
            </div>
            <div>Items being monitored</div>
        `;

        container.appendChild(statsInfo);
    }

    getStatusColor(status) {
        const colors = {
            'running': Theme.colors.success,
            'stopped': Theme.colors.error,
            'paused': Theme.colors.warning,
            'error': Theme.colors.error,
            'registered': Theme.colors.info
        };
        return colors[status] || Theme.colors.onSurface;
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

    startRefreshTimer(tabId, updateFn) {
        if (this.refreshIntervals.has(tabId)) {
            clearInterval(this.refreshIntervals.get(tabId));
        }

        const interval = setInterval(updateFn, 2000);
        this.refreshIntervals.set(tabId, interval);
    }

    stopRefreshTimer(tabId) {
        if (this.refreshIntervals.has(tabId)) {
            clearInterval(this.refreshIntervals.get(tabId));
            this.refreshIntervals.delete(tabId);
        }
    }

    stopAllRefreshTimers() {
        this.refreshIntervals.forEach((interval, tabId) => {
            clearInterval(interval);
        });
        this.refreshIntervals.clear();
    }

    destroy() {
        this.stopAllRefreshTimers();
    }
}