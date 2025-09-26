import { DOMUtils } from '../utils/dom-utils.js';
import { UIComponents } from './ui-components.js';
import { Theme } from '../theme/theme.js';

export class TabbedInterface {
    constructor() {
        this.tabs = new Map();
        this.activeTab = null;
        this.container = null;
        this.tabsContainer = null;
        this.contentContainer = null;
    }

    createInterface() {
        const mainContainer = DOMUtils.createElement('div', {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        });

        // Create tabs navigation
        this.tabsContainer = DOMUtils.createElement('div', {
            display: 'flex',
            borderBottom: `2px solid ${Theme.colors.border}`,
            marginBottom: Theme.spacing.md,
            overflow: 'auto',
            whiteSpace: 'nowrap'
        });

        // Create content area
        this.contentContainer = DOMUtils.createElement('div', {
            flex: '1',
            overflow: 'auto',
            minHeight: '400px'
        });

        mainContainer.appendChild(this.tabsContainer);
        mainContainer.appendChild(this.contentContainer);

        this.container = mainContainer;
        return mainContainer;
    }

    addTab(id, title, content, options = {}) {
        if (this.tabs.has(id)) {
            console.warn(`Tab with ID '${id}' already exists`);
            return;
        }

        const tab = {
            id,
            title,
            content,
            isActive: false,
            badge: options.badge || null,
            icon: options.icon || null,
            closable: options.closable || false,
            button: null,
            contentElement: null
        };

        // Create tab button
        tab.button = this.createTabButton(tab);

        // Create content wrapper
        tab.contentElement = DOMUtils.createElement('div', {
            display: 'none',
            width: '100%',
            height: '100%'
        });

        if (typeof content === 'function') {
            tab.contentElement.appendChild(content());
        } else if (content instanceof HTMLElement) {
            tab.contentElement.appendChild(content);
        } else {
            tab.contentElement.innerHTML = content;
        }

        this.tabs.set(id, tab);
        this.tabsContainer.appendChild(tab.button);
        this.contentContainer.appendChild(tab.contentElement);

        // If this is the first tab, make it active
        if (this.tabs.size === 1) {
            this.switchToTab(id);
        }

        return tab;
    }

    createTabButton(tab) {
        const button = DOMUtils.createElement('button', {
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.xs,
            padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
            border: 'none',
            backgroundColor: Theme.colors.surface,
            color: Theme.colors.onSurface,
            cursor: 'pointer',
            borderTopLeftRadius: Theme.borderRadius.md,
            borderTopRightRadius: Theme.borderRadius.md,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            fontFamily: Theme.typography.fontFamily,
            whiteSpace: 'nowrap',
            transition: `all ${Theme.animation.duration.normal}`,
            hover: {
                backgroundColor: Theme.colors.hover
            }
        });

        // Add icon if provided
        if (tab.icon) {
            const icon = DOMUtils.createElement('span');
            icon.textContent = tab.icon;
            button.appendChild(icon);
        }

        // Add title
        const title = DOMUtils.createElement('span');
        title.textContent = tab.title;
        button.appendChild(title);

        // Add badge if provided
        if (tab.badge) {
            const badge = DOMUtils.createElement('span', {
                backgroundColor: Theme.colors.primary,
                color: Theme.colors.onPrimary,
                borderRadius: Theme.borderRadius.round,
                padding: `2px ${Theme.spacing.xs}`,
                fontSize: Theme.typography.fontSize.xs,
                fontWeight: Theme.typography.fontWeight.bold,
                minWidth: '18px',
                textAlign: 'center'
            });
            badge.textContent = tab.badge;
            button.appendChild(badge);
        }

        // Add close button if closable
        if (tab.closable) {
            const closeBtn = DOMUtils.createElement('span', {
                marginLeft: Theme.spacing.xs,
                padding: '2px',
                borderRadius: Theme.borderRadius.sm,
                cursor: 'pointer',
                hover: {
                    backgroundColor: Theme.colors.error,
                    color: Theme.colors.onPrimary
                }
            });
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTab(tab.id);
            });
            button.appendChild(closeBtn);
        }

        button.addEventListener('click', () => {
            this.switchToTab(tab.id);
        });

        return button;
    }

    switchToTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`Tab with ID '${tabId}' not found`);
            return;
        }

        // Deactivate current tab
        if (this.activeTab) {
            this.activeTab.isActive = false;
            this.activeTab.button.style.backgroundColor = Theme.colors.surface;
            this.activeTab.button.style.borderBottom = `2px solid ${Theme.colors.border}`;
            this.activeTab.contentElement.style.display = 'none';
        }

        // Activate new tab
        tab.isActive = true;
        tab.button.style.backgroundColor = Theme.colors.background;
        tab.button.style.borderBottom = `2px solid ${Theme.colors.primary}`;
        tab.contentElement.style.display = 'block';

        this.activeTab = tab;

        // Emit tab change event
        this.onTabChange?.(tabId, tab);
    }

    removeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`Tab with ID '${tabId}' not found`);
            return;
        }

        // Remove DOM elements
        if (tab.button.parentNode) {
            tab.button.parentNode.removeChild(tab.button);
        }
        if (tab.contentElement.parentNode) {
            tab.contentElement.parentNode.removeChild(tab.contentElement);
        }

        // If removing active tab, switch to another tab
        if (tab.isActive) {
            const remainingTabs = Array.from(this.tabs.values()).filter(t => t.id !== tabId);
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0].id);
            } else {
                this.activeTab = null;
            }
        }

        this.tabs.delete(tabId);

        // Emit tab removed event
        this.onTabRemoved?.(tabId, tab);
    }

    updateTabBadge(tabId, badge) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        tab.badge = badge;

        // Find and update badge element
        const badgeElement = tab.button.querySelector('span:last-child');
        if (badgeElement && tab.badge) {
            badgeElement.textContent = badge;
        } else if (tab.badge && !badgeElement) {
            // Create new badge
            const newBadge = DOMUtils.createElement('span', {
                backgroundColor: Theme.colors.primary,
                color: Theme.colors.onPrimary,
                borderRadius: Theme.borderRadius.round,
                padding: `2px ${Theme.spacing.xs}`,
                fontSize: Theme.typography.fontSize.xs,
                fontWeight: Theme.typography.fontWeight.bold,
                minWidth: '18px',
                textAlign: 'center'
            });
            newBadge.textContent = badge;
            tab.button.appendChild(newBadge);
        }
    }

    updateTabTitle(tabId, title) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        tab.title = title;
        const titleElement = tab.button.querySelector('span');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    getActiveTab() {
        return this.activeTab;
    }

    getAllTabs() {
        return Array.from(this.tabs.values());
    }

    hasTab(tabId) {
        return this.tabs.has(tabId);
    }

    getTab(tabId) {
        return this.tabs.get(tabId);
    }

    // Event handlers (can be overridden)
    onTabChange(tabId, tab) {
        // Override this method to handle tab changes
    }

    onTabRemoved(tabId, tab) {
        // Override this method to handle tab removal
    }

    destroy() {
        this.tabs.clear();
        this.activeTab = null;
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}