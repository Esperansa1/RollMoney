import { DOMUtils } from '../utils/dom-utils.js';

export class UIComponents {
    static createOverlay() {
        return DOMUtils.createElement('div', {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'white',
            border: '2px solid #333',
            borderRadius: '10px',
            padding: '15px',
            zIndex: '10000',
            width: '350px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'move'
        }, {
            id: 'market-scraper-overlay'
        });
    }

    static createDragHandle(overlay, callbacks = {}) {
        const dragHandle = DOMUtils.createElement('div', {
            backgroundColor: '#f1f1f1',
            color: '#333',
            padding: '5px',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            margin: '-15px -15px 15px -15px',
            textAlign: 'center',
            fontWeight: 'bold',
            userSelect: 'none'
        });

        dragHandle.textContent = 'Market Scraper';

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

    static createButton(text, styles = {}, onClick = null) {
        const defaultStyles = {
            marginRight: '10px',
            padding: '5px 10px',
            cursor: 'pointer'
        };

        const button = DOMUtils.createElement('button',
            { ...defaultStyles, ...styles }
        );

        button.textContent = text;

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    static createTextarea(styles = {}, attributes = {}) {
        const defaultStyles = {
            width: '100%',
            marginBottom: '10px',
            resize: 'vertical'
        };

        return DOMUtils.createElement('textarea',
            { ...defaultStyles, ...styles },
            attributes
        );
    }

    static createLabel(text, styles = {}) {
        const defaultStyles = {
            display: 'block',
            marginBottom: '10px'
        };

        const label = DOMUtils.createElement('label',
            { ...defaultStyles, ...styles }
        );

        label.textContent = text;
        return label;
    }

    static createInput(type = 'text', styles = {}, attributes = {}) {
        return DOMUtils.createElement('input', styles, {
            type,
            ...attributes
        });
    }

    static createJsonConfigSection(onLoad) {
        const label = this.createLabel('Custom Filter JSON:');

        const textarea = this.createTextarea(
            { height: '150px' },
            {
                id: 'custom-filter-json',
                placeholder: `Enter JSON like:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`
            }
        );

        const loadButton = this.createButton('Load Filter', {}, () => {
            try {
                const jsonInput = textarea.value.trim();
                const config = jsonInput ? JSON.parse(jsonInput) : [];
                if (onLoad) onLoad(config);
                alert('Filter configuration loaded!');
            } catch (error) {
                alert('Invalid JSON: ' + error.message);
            }
        });

        return { label, textarea, loadButton };
    }

    static createResultsArea() {
        return this.createTextarea(
            { height: '200px' },
            { id: 'market-scraper-results' }
        );
    }

    static createControlButtons(callbacks = {}) {
        const scrapeButton = this.createButton('Scrape Items', {}, callbacks.onScrape);
        const copyButton = this.createButton('Copy Results', {}, callbacks.onCopy);
        const clearButton = this.createButton('Clear Processed', {}, callbacks.onClear);
        const closeButton = this.createButton('Close', { float: 'right' }, callbacks.onClose);

        return { scrapeButton, copyButton, clearButton, closeButton };
    }

    static createAutoWithdrawButtons(callbacks = {}) {
        const startButton = this.createButton('Start Auto-Withdraw', {}, callbacks.onStart);
        const stopButton = this.createButton('Stop Auto-Withdraw', {}, callbacks.onStop);

        return { startButton, stopButton };
    }

    static createTestRefreshButton(onTest) {
        return this.createButton('Test Refresh', {
            backgroundColor: '#ffcc00',
            fontWeight: 'bold'
        }, onTest);
    }

    static createAutoClearControls() {
        const input = this.createInput('number', {
            width: '50px',
            marginRight: '5px'
        }, {
            min: '1',
            max: '60',
            value: '5'
        });

        const label = this.createLabel('Auto-clear (seconds):', {
            fontSize: '12px'
        });

        const container = DOMUtils.createElement('div', {
            marginTop: '10px'
        });

        container.appendChild(label);
        container.appendChild(input);

        return container;
    }
}