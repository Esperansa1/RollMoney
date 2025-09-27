import { DOMUtils } from '../utils/dom-utils.js';
import { Theme, getButtonStyles, getInputStyles, getOverlayStyles } from '../theme/theme.js';

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
        const label = this.createLabel('Custom Filter Configuration');

        const textarea = this.createTextarea(
            {
                height: '180px',
                maxHeight: '180px',
                overflow: 'auto'
            },
            {
                id: 'custom-filter-json',
                placeholder: `Enter JSON configuration:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`
            }
        );

        const loadButton = this.createButton('Load Filter', 'primary', 'sm', () => {
            try {
                const jsonInput = textarea.value.trim();
                const config = jsonInput ? JSON.parse(jsonInput) : [];
                if (onLoad) onLoad(config);
                this.showNotification('Filter configuration loaded!', 'success');
            } catch (error) {
                this.showNotification('Invalid JSON: ' + error.message, 'error');
            }
        });

        return { label, textarea, loadButton };
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