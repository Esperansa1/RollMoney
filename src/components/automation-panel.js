import { DOMUtils } from '../utils/dom-utils.js';
import { UIComponents } from './ui-components.js';
import { Theme } from '../theme/theme.js';

export class AutomationPanel {
    constructor(automationManager) {
        this.automationManager = automationManager;
        this.container = null;
        this.automationRows = new Map();
        this.refreshInterval = null;

        // Bind event handlers
        this.automationManager.on('automation-registered', (data) => this.onAutomationRegistered(data));
        this.automationManager.on('automation-started', (data) => this.onAutomationStatusChange(data));
        this.automationManager.on('automation-stopped', (data) => this.onAutomationStatusChange(data));
        this.automationManager.on('automation-error', (data) => this.onAutomationError(data));
    }

    createPanel() {
        const panelContainer = DOMUtils.createElement('div', {
            marginTop: Theme.spacing.lg,
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.borderRadius.md,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant
        });

        const header = this.createHeader();
        const controls = this.createGlobalControls();
        const automationsList = this.createAutomationsList();
        const stats = this.createStatsSection();

        panelContainer.appendChild(header);
        panelContainer.appendChild(controls);
        panelContainer.appendChild(automationsList);
        panelContainer.appendChild(stats);

        this.container = panelContainer;
        this.startRefreshTimer();

        return panelContainer;
    }

    createHeader() {
        const header = DOMUtils.createElement('div', {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Theme.spacing.md,
            paddingBottom: Theme.spacing.sm,
            borderBottom: `1px solid ${Theme.colors.border}`
        });

        const title = UIComponents.createLabel('Automation Manager', {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: '0'
        });

        const statusIndicator = DOMUtils.createElement('span', {
            padding: `${Theme.spacing.xs} ${Theme.spacing.sm}`,
            borderRadius: Theme.borderRadius.sm,
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.medium,
            backgroundColor: this.automationManager.isRunning ? Theme.colors.success : Theme.colors.error,
            color: Theme.colors.onPrimary
        });
        statusIndicator.textContent = this.automationManager.isRunning ? 'RUNNING' : 'STOPPED';
        statusIndicator.id = 'automation-status-indicator';

        header.appendChild(title);
        header.appendChild(statusIndicator);

        return header;
    }

    createGlobalControls() {
        const controlsContainer = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.sm,
            marginBottom: Theme.spacing.md,
            flexWrap: 'wrap'
        });

        const startAllBtn = UIComponents.createButton('Start All', 'success', 'sm', () => {
            this.automationManager.startAll();
            this.updateUI();
        });

        const stopAllBtn = UIComponents.createButton('Stop All', 'error', 'sm', () => {
            this.automationManager.stopAll();
            this.updateUI();
        });

        const refreshBtn = UIComponents.createButton('Refresh', 'secondary', 'sm', () => {
            this.updateAutomationsList();
        });

        controlsContainer.appendChild(startAllBtn);
        controlsContainer.appendChild(stopAllBtn);
        controlsContainer.appendChild(refreshBtn);

        return controlsContainer;
    }

    createAutomationsList() {
        const listContainer = DOMUtils.createElement('div', {
            marginBottom: Theme.spacing.md
        });

        const listHeader = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.primary,
            color: Theme.colors.onPrimary,
            borderRadius: `${Theme.borderRadius.sm} ${Theme.borderRadius.sm} 0 0`,
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.bold
        });

        ['Name', 'Status', 'Priority', 'Errors', 'Actions'].forEach(text => {
            const headerCell = DOMUtils.createElement('div');
            headerCell.textContent = text;
            listHeader.appendChild(headerCell);
        });

        const listBody = DOMUtils.createElement('div', {
            border: `1px solid ${Theme.colors.border}`,
            borderTop: 'none',
            borderRadius: `0 0 ${Theme.borderRadius.sm} ${Theme.borderRadius.sm}`,
            maxHeight: '200px',
            overflow: 'auto'
        });
        listBody.id = 'automations-list-body';

        listContainer.appendChild(listHeader);
        listContainer.appendChild(listBody);

        this.updateAutomationsList();

        return listContainer;
    }

    updateAutomationsList() {
        const listBody = document.getElementById('automations-list-body');
        if (!listBody) return;

        listBody.innerHTML = '';
        this.automationRows.clear();

        const automations = this.automationManager.getAllAutomations();

        if (automations.length === 0) {
            const emptyRow = DOMUtils.createElement('div', {
                padding: Theme.spacing.md,
                textAlign: 'center',
                color: Theme.colors.onSurface,
                fontStyle: 'italic'
            });
            emptyRow.textContent = 'No automations registered';
            listBody.appendChild(emptyRow);
            return;
        }

        automations.forEach(automation => {
            const row = this.createAutomationRow(automation);
            listBody.appendChild(row);
            this.automationRows.set(automation.id, row);
        });
    }

    createAutomationRow(automation) {
        const row = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.sm,
            borderBottom: `1px solid ${Theme.colors.border}`,
            alignItems: 'center',
            fontSize: Theme.typography.fontSize.xs
        });

        // Name
        const nameCell = DOMUtils.createElement('div', {
            fontWeight: Theme.typography.fontWeight.medium
        });
        nameCell.textContent = automation.id;

        // Status
        const statusCell = DOMUtils.createElement('div');
        const statusBadge = this.createStatusBadge(automation.status);
        statusCell.appendChild(statusBadge);

        // Priority
        const priorityCell = DOMUtils.createElement('div');
        priorityCell.textContent = automation.priority.toString();

        // Errors
        const errorsCell = DOMUtils.createElement('div', {
            color: automation.errorCount > 0 ? Theme.colors.error : Theme.colors.onSurface
        });
        errorsCell.textContent = automation.errorCount.toString();

        // Actions
        const actionsCell = DOMUtils.createElement('div', {
            display: 'flex',
            gap: Theme.spacing.xs
        });

        if (automation.status === 'running') {
            const stopBtn = UIComponents.createButton('Stop', 'secondary', 'sm', () => {
                this.automationManager.stopAutomation(automation.id);
            });
            const pauseBtn = UIComponents.createButton('Pause', 'secondary', 'sm', () => {
                this.automationManager.pauseAutomation(automation.id);
            });
            actionsCell.appendChild(stopBtn);
            actionsCell.appendChild(pauseBtn);
        } else if (automation.status === 'paused') {
            const resumeBtn = UIComponents.createButton('Resume', 'success', 'sm', () => {
                this.automationManager.resumeAutomation(automation.id);
            });
            actionsCell.appendChild(resumeBtn);
        } else {
            const startBtn = UIComponents.createButton('Start', 'success', 'sm', () => {
                this.automationManager.startAutomation(automation.id);
            });
            actionsCell.appendChild(startBtn);
        }

        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(priorityCell);
        row.appendChild(errorsCell);
        row.appendChild(actionsCell);

        return row;
    }

    createStatusBadge(status) {
        const colors = {
            'registered': Theme.colors.info,
            'running': Theme.colors.success,
            'stopped': Theme.colors.error,
            'paused': Theme.colors.warning,
            'error': Theme.colors.error
        };

        const badge = DOMUtils.createElement('span', {
            padding: `2px ${Theme.spacing.xs}`,
            borderRadius: Theme.borderRadius.sm,
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.medium,
            backgroundColor: colors[status] || Theme.colors.info,
            color: Theme.colors.onPrimary,
            textTransform: 'uppercase'
        });

        badge.textContent = status;
        return badge;
    }

    createStatsSection() {
        const statsContainer = DOMUtils.createElement('div', {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`
        });
        statsContainer.id = 'automation-stats';

        this.updateStats();
        return statsContainer;
    }

    updateStats() {
        const statsContainer = document.getElementById('automation-stats');
        if (!statsContainer) return;

        const stats = this.automationManager.getStats();

        const statsData = [
            { label: 'Total', value: stats.totalAutomations },
            { label: 'Running', value: stats.runningAutomations },
            { label: 'Success', value: stats.successfulRuns },
            { label: 'Failed', value: stats.failedRuns },
            { label: 'Uptime', value: this.formatUptime(stats.uptime) }
        ];

        statsContainer.innerHTML = '';

        statsData.forEach(stat => {
            const statItem = DOMUtils.createElement('div', {
                textAlign: 'center',
                padding: Theme.spacing.xs
            });

            const value = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.lg,
                fontWeight: Theme.typography.fontWeight.bold,
                color: Theme.colors.primary
            });
            value.textContent = stat.value;

            const label = DOMUtils.createElement('div', {
                fontSize: Theme.typography.fontSize.xs,
                color: Theme.colors.onSurface
            });
            label.textContent = stat.label;

            statItem.appendChild(value);
            statItem.appendChild(label);
            statsContainer.appendChild(statItem);
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

    updateUI() {
        this.updateAutomationsList();
        this.updateStats();

        // Update status indicator
        const statusIndicator = document.getElementById('automation-status-indicator');
        if (statusIndicator) {
            const isRunning = this.automationManager.isRunning;
            statusIndicator.textContent = isRunning ? 'RUNNING' : 'STOPPED';
            statusIndicator.style.backgroundColor = isRunning ? Theme.colors.success : Theme.colors.error;
        }
    }

    startRefreshTimer() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            this.updateUI();
        }, 2000);
    }

    stopRefreshTimer() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    onAutomationRegistered(data) {
        this.updateAutomationsList();
    }

    onAutomationStatusChange(data) {
        this.updateUI();
    }

    onAutomationError(data) {
        this.updateUI();
        UIComponents.showNotification(`Automation '${data.id}' encountered an error`, 'error');
    }

    destroy() {
        this.stopRefreshTimer();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}