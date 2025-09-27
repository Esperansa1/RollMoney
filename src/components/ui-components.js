import { DOMUtils } from '../utils/dom-utils.js';
import { Theme, getButtonStyles, getInputStyles, getOverlayStyles } from '../theme/theme.js';
import { CookieUtils } from '../utils/cookie-utils.js';

export class UIComponents {
    static createOverlay() {
        return DOMUtils.createElement('div', {
            ...getOverlayStyles(),
            top: '20px',
            right: '20px',
            cursor: 'move'
        }, {
            id: 'market-scraper-overlay'
        });
    }

    static createDragHandle(overlay, callbacks = {}) {
        const dragHandle = DOMUtils.createElement('div', {
            backgroundColor: Theme.colors.primary,
            color: Theme.colors.onPrimary,
            padding: Theme.spacing.md,
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            margin: `-${Theme.spacing.lg} -${Theme.spacing.lg} ${Theme.spacing.lg} -${Theme.spacing.lg}`,
            textAlign: 'center',
            fontWeight: Theme.typography.fontWeight.bold,
            fontSize: Theme.typography.fontSize.base,
            fontFamily: Theme.typography.fontFamily,
            userSelect: 'none',
            cursor: 'grab',
            boxShadow: Theme.shadows.sm,
            hover: {
                backgroundColor: '#cc0000',
                cursor: 'grabbing'
            }
        });

        const titleContainer = DOMUtils.createElement('div', {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        });

        const titleSpan = DOMUtils.createElement('span', {
            fontSize: Theme.typography.fontSize.base,
            fontWeight: Theme.typography.fontWeight.bold
        });
        titleSpan.textContent = 'Money Maker';

        const versionSpan = DOMUtils.createElement('span', {
            fontSize: Theme.typography.fontSize.xs,
            opacity: '0.8',
            marginTop: '2px'
        });

        // Get version from global variable
        const version = window.ROLLMONEY_VERSION || 'dev';
        versionSpan.textContent = `v${version}`;

        titleContainer.appendChild(titleSpan);
        titleContainer.appendChild(versionSpan);

        const closeButton = DOMUtils.createElement('button', {
            position: 'absolute',
            right: Theme.spacing.sm,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'transparent',
            border: 'none',
            color: Theme.colors.onPrimary,
            fontSize: Theme.typography.fontSize.lg,
            cursor: 'pointer',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            hover: {
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: Theme.borderRadius.sm
            }
        });
        closeButton.textContent = '×';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onClose) callbacks.onClose();
        });

        dragHandle.style.position = 'relative';
        dragHandle.appendChild(titleContainer);
        dragHandle.appendChild(closeButton);

        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0;
        let yOffset = 0;

        dragHandle.xOffset = xOffset;
        dragHandle.yOffset = yOffset;

        const dragStart = (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === dragHandle) {
                isDragging = true;
            }
        };

        const dragEnd = () => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            if (callbacks.onDragEnd) {
                callbacks.onDragEnd(xOffset, yOffset);
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                dragHandle.xOffset = xOffset;
                dragHandle.yOffset = yOffset;
                overlay.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        };

        DOMUtils.addEventListeners(dragHandle, { mousedown: dragStart });
        DOMUtils.addEventListeners(document, {
            mouseup: dragEnd,
            mousemove: drag
        });

        if (callbacks.onPositionSave) {
            DOMUtils.addEventListeners(overlay, {
                mouseup: () => callbacks.onPositionSave(xOffset, yOffset)
            });
        }

        return dragHandle;
    }

    static createButton(text, variant = 'primary', size = 'md', onClick = null) {
        const buttonStyles = {
            ...getButtonStyles(variant, size),
            marginRight: Theme.spacing.sm,
            hover: {
                transform: 'translateY(-1px)',
                boxShadow: Theme.shadows.md,
                backgroundColor: variant === 'primary' ? '#cc0000' : Theme.colors.hover
            }
        };

        const button = DOMUtils.createElement('button', buttonStyles);
        button.textContent = text;

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    static createTextarea(styles = {}, attributes = {}) {
        const textareaStyles = {
            ...getInputStyles(),
            marginBottom: Theme.spacing.md,
            resize: 'vertical',
            minHeight: '100px',
            focus: {
                borderColor: Theme.colors.primary,
                boxShadow: `0 0 0 2px ${Theme.colors.primary}20`
            },
            ...styles
        };

        return DOMUtils.createElement('textarea', textareaStyles, attributes);
    }

    static createLabel(text, styles = {}) {
        const labelStyles = {
            display: 'block',
            marginBottom: Theme.spacing.sm,
            fontFamily: Theme.typography.fontFamily,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            color: Theme.colors.onSurface,
            ...styles
        };

        const label = DOMUtils.createElement('label', labelStyles);
        label.textContent = text;
        return label;
    }

    static createInput(type = 'text', styles = {}, attributes = {}) {
        const inputStyles = {
            ...getInputStyles(),
            focus: {
                borderColor: Theme.colors.primary,
                boxShadow: `0 0 0 2px ${Theme.colors.primary}20`
            },
            ...styles
        };

        return DOMUtils.createElement('input', inputStyles, {
            type,
            ...attributes
        });
    }

    static createJsonConfigSection(onLoad) {
        const label = this.createLabel('Filter Configuration');

        // Current filter display (read-only)
        const currentLabel = this.createLabel('Current Active Filter:', {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs
        });

        const currentTextarea = this.createTextarea(
            {
                height: '80px',
                maxHeight: '80px',
                overflow: 'auto',
                fontSize: Theme.typography.fontSize.xs,
                lineHeight: '1.3',
                backgroundColor: Theme.colors.surfaceVariant,
                color: Theme.colors.onSurface,
                border: `1px solid ${Theme.colors.border}`,
                cursor: 'default'
            },
            {
                id: 'current-filter-display',
                placeholder: 'No filter currently active',
                readonly: true
            }
        );

        // New filter input
        const inputLabel = this.createLabel('New Filter JSON:', {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs,
            marginTop: Theme.spacing.sm
        });

        const inputTextarea = this.createTextarea(
            {
                height: '80px',
                maxHeight: '80px',
                overflow: 'auto',
                fontSize: Theme.typography.fontSize.xs,
                lineHeight: '1.3'
            },
            {
                id: 'new-filter-input',
                placeholder: `[{"skin": "Bayonet", "type": ["Fade", "Marble Fade"]}]`
            }
        );

        // Auto-load saved filter from cookies on initialization
        const savedFilter = CookieUtils.getJsonCookie('market-filter-config');
        console.log('Loading saved filter from cookies:', savedFilter);
        if (savedFilter) {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                currentTextarea.value = JSON.stringify(savedFilter, null, 2);
                console.log('Populated current filter display with:', savedFilter);
            }, 50);
        }

        // Auto-save on input changes (debounced) - only for new filter input
        let saveTimeout;
        inputTextarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                try {
                    const jsonInput = inputTextarea.value.trim();
                    if (jsonInput) {
                        const config = JSON.parse(jsonInput);
                        // Don't auto-save to cookies, only validate
                        console.log('Filter JSON validated successfully');
                    }
                } catch (error) {
                    console.log('Invalid JSON in input');
                }
            }, 500);
        });

        const loadButton = this.createButton('Apply Filter', 'primary', 'sm', () => {
            try {
                const jsonInput = inputTextarea.value.trim();
                const config = jsonInput ? JSON.parse(jsonInput) : [];

                console.log('Applying filter config:', config);

                // Update current filter display
                currentTextarea.value = jsonInput ? JSON.stringify(config, null, 2) : '';

                // Save to cookies when manually loaded
                if (jsonInput) {
                    const saveResult = CookieUtils.setJsonCookie('market-filter-config', config);
                    console.log('Cookie save result:', saveResult);
                    console.log('Saved config to cookies:', config);
                } else {
                    this.deleteFilterStorage('market-filter-config');
                    console.log('Deleted filter storage');
                }

                // Verify cookie was saved
                const savedConfig = CookieUtils.getJsonCookie('market-filter-config');
                console.log('Verified saved config:', savedConfig);

                if (onLoad) onLoad(config);
                this.showNotification('Filter applied successfully!', 'success');

                // Clear the input after applying
                inputTextarea.value = '';
            } catch (error) {
                console.error('Error applying filter:', error);
                this.showNotification('Invalid JSON: ' + error.message, 'error');
            }
        });

        // Add clear button
        const clearButton = this.createButton('Clear All', 'secondary', 'sm', () => {
            inputTextarea.value = '';
            currentTextarea.value = '';
            this.deleteFilterStorage('market-filter-config');
            if (onLoad) onLoad([]);
            this.showNotification('All filters cleared!', 'info');
        });

        // Auto-load the saved filter on page load
        if (savedFilter && onLoad) {
            setTimeout(() => {
                console.log('Auto-loading saved filter via onLoad callback:', savedFilter);
                onLoad(savedFilter);
                this.showNotification('Filter configuration loaded from cookies!', 'info');
            }, 200);
        }

        return {
            label,
            currentLabel,
            currentTextarea,
            inputLabel,
            inputTextarea,
            loadButton,
            clearButton
        };
    }

    static deleteFilterStorage(name) {
        // Delete from both localStorage and cookies
        try {
            localStorage.removeItem(name);
            console.log('Removed from localStorage:', name);
        } catch (error) {
            console.warn('Could not remove from localStorage:', error);
        }

        try {
            CookieUtils.deleteCookie(name);
            console.log('Removed from cookies:', name);
        } catch (error) {
            console.warn('Could not remove from cookies:', error);
        }
    }

    static createResultsArea() {
        const label = this.createLabel('Scraping Results');
        const textarea = this.createTextarea(
            {
                height: '250px',
                maxHeight: '250px',
                overflow: 'auto'
            },
            {
                id: 'market-scraper-results',
                placeholder: 'Results will appear here after scraping...'
            }
        );
        return { label, textarea };
    }

    static createControlButtons(callbacks = {}) {
        const scrapeButton = this.createButton('Scrape Items', 'primary', 'md', callbacks.onScrape);
        const copyButton = this.createButton('Copy Results', 'secondary', 'md', callbacks.onCopy);
        const clearButton = this.createButton('Clear Processed', 'secondary', 'md', callbacks.onClear);
        const closeButton = this.createButton('Close', 'secondary', 'sm', callbacks.onClose);

        return { scrapeButton, copyButton, clearButton, closeButton };
    }

    static createAutoWithdrawButtons(callbacks = {}) {
        const startButton = this.createButton('Start Auto-Withdraw', 'success', 'md', callbacks.onStart);
        const stopButton = this.createButton('Stop Auto-Withdraw', 'secondary', 'md', callbacks.onStop);

        return { startButton, stopButton };
    }

    static createTestRefreshButton(onTest) {
        return this.createButton('Test Refresh', 'secondary', 'sm', onTest);
    }

    static createAutoClearControls() {
        const label = this.createLabel('Auto-clear interval:', {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs
        });

        const input = this.createInput('number', {
            width: '80px',
            marginRight: Theme.spacing.sm,
            textAlign: 'center'
        }, {
            min: '1',
            max: '60',
            value: '5'
        });

        const unitLabel = DOMUtils.createElement('span', {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.onSurface,
            fontFamily: Theme.typography.fontFamily
        });
        unitLabel.textContent = 'seconds';

        const container = DOMUtils.createElement('div', {
            marginTop: Theme.spacing.md,
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.sm
        });

        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(unitLabel);

        return container;
    }

    static showNotification(message, type = 'info') {
        const colors = {
            success: Theme.colors.success,
            error: Theme.colors.error,
            warning: Theme.colors.warning,
            info: Theme.colors.info
        };

        const notification = DOMUtils.createElement('div', {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors[type] || Theme.colors.info,
            color: Theme.colors.onPrimary,
            padding: `${Theme.spacing.sm} ${Theme.spacing.lg}`,
            borderRadius: Theme.borderRadius.md,
            zIndex: Theme.zIndex.tooltip,
            fontFamily: Theme.typography.fontFamily,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            boxShadow: Theme.shadows.lg,
            opacity: '0',
            transition: `all ${Theme.animation.duration.normal} ${Theme.animation.easing.easeOut}`
        });

        notification.textContent = message;
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(10px)';
        });

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}