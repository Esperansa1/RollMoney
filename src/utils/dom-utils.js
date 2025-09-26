export class DOMUtils {
    static createElement(tag, styles = {}, attributes = {}) {
        const element = document.createElement(tag);

        this.applyStyles(element, styles);

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;
    }

    static applyStyles(element, styles) {
        Object.entries(styles).forEach(([key, value]) => {
            if (key === 'hover' && typeof value === 'object') {
                this.addHoverEffect(element, value);
            } else if (key === 'focus' && typeof value === 'object') {
                this.addFocusEffect(element, value);
            } else {
                element.style[key] = value;
            }
        });
    }

    static addHoverEffect(element, hoverStyles) {
        const originalStyles = {};

        element.addEventListener('mouseenter', () => {
            Object.entries(hoverStyles).forEach(([key, value]) => {
                originalStyles[key] = element.style[key];
                element.style[key] = value;
            });
        });

        element.addEventListener('mouseleave', () => {
            Object.entries(originalStyles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        });
    }

    static addFocusEffect(element, focusStyles) {
        const originalStyles = {};

        element.addEventListener('focus', () => {
            Object.entries(focusStyles).forEach(([key, value]) => {
                originalStyles[key] = element.style[key];
                element.style[key] = value;
            });
        });

        element.addEventListener('blur', () => {
            Object.entries(originalStyles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        });
    }

    static safeQuerySelector(parent, selector) {
        const element = parent.querySelector(selector);
        return element ? element.textContent.trim() : 'N/A';
    }

    static findElementByText(elements, text, caseSensitive = false) {
        return Array.from(elements).find(element => {
            const elementText = element.textContent.trim();
            return caseSensitive
                ? elementText === text
                : elementText.toLowerCase() === text.toLowerCase();
        });
    }

    static dispatchClickEvent(element, coordinates = null) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            ...(coordinates && { clientX: coordinates.x, clientY: coordinates.y })
        });
        element.dispatchEvent(clickEvent);
    }

    static getElementBounds(element) {
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
        };
    }

    static centerElementOnScreen(element) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const bounds = this.getElementBounds(element);

        const centerX = (windowWidth - bounds.width) / 2;
        const centerY = (windowHeight - bounds.height) / 2;

        element.style.position = 'fixed';
        element.style.top = `${centerY}px`;
        element.style.left = `${centerX}px`;
        element.style.right = 'auto';
        element.style.transform = 'none';

        return { x: centerX, y: centerY };
    }

    static addEventListeners(element, events) {
        Object.entries(events).forEach(([eventType, handler]) => {
            element.addEventListener(eventType, handler);
        });
    }

    static removeElementById(id) {
        const element = document.getElementById(id);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}