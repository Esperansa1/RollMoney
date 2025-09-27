/**
 * DOM Observer utilities for fast, event-driven element waiting
 * Eliminates the need for setTimeout delays and polling
 */
export class DOMObserver {

    /**
     * Wait for an element to appear in the DOM
     * @param {string} selector - CSS selector to wait for
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @param {Element} root - Root element to observe (default: document.body)
     * @returns {Promise<Element>} - Resolves with the found element
     */
    static waitForElement(selector, timeout = 5000, root = document.body) {
        return new Promise((resolve, reject) => {
            // Check if element already exists
            const existing = (root === document.body ? document : root).querySelector(selector);
            if (existing) {
                console.log(`✅ Element found immediately: ${selector}`);
                return resolve(existing);
            }

            console.log(`🔍 Waiting for element: ${selector}`);

            // Set up observer for new elements
            const observer = new MutationObserver((mutations) => {
                const element = (root === document.body ? document : root).querySelector(selector);
                if (element) {
                    console.log(`✅ Element appeared: ${selector}`);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(root, {
                childList: true,
                subtree: true,
                attributes: true
            });

            // Timeout fallback
            const timeoutId = setTimeout(() => {
                observer.disconnect();
                console.log(`❌ Element timeout: ${selector}`);
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);

            // Clean up timeout if resolved early
            const originalResolve = resolve;
            resolve = (element) => {
                clearTimeout(timeoutId);
                originalResolve(element);
            };
        });
    }

    /**
     * Wait for multiple elements to appear
     * @param {string[]} selectors - Array of CSS selectors
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element[]>} - Resolves with array of found elements
     */
    static waitForElements(selectors, timeout = 5000) {
        return Promise.all(selectors.map(selector =>
            this.waitForElement(selector, timeout)
        ));
    }

    /**
     * Wait for a condition to become true using fast polling
     * @param {Function} conditionFn - Function that returns true when condition is met
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @param {string} description - Description for logging
     * @returns {Promise<void>} - Resolves when condition is met
     */
    static waitForCondition(conditionFn, timeout = 5000, description = 'condition') {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Waiting for condition: ${description}`);

            const check = () => {
                try {
                    if (conditionFn()) {
                        console.log(`✅ Condition met: ${description}`);
                        resolve();
                    } else {
                        // Use requestAnimationFrame for fastest possible polling
                        requestAnimationFrame(check);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            check();

            setTimeout(() => {
                console.log(`❌ Condition timeout: ${description}`);
                reject(new Error(`Condition "${description}" not met within ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Wait for an element to become enabled (not disabled)
     * @param {Element|string} elementOrSelector - Element or selector
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element>} - Resolves with the enabled element
     */
    static waitForElementEnabled(elementOrSelector, timeout = 5000) {
        return new Promise(async (resolve, reject) => {
            let element;

            if (typeof elementOrSelector === 'string') {
                try {
                    element = await this.waitForElement(elementOrSelector, timeout);
                } catch (error) {
                    return reject(error);
                }
            } else {
                element = elementOrSelector;
            }

            if (!element.disabled) {
                console.log(`✅ Element already enabled`);
                return resolve(element);
            }

            console.log(`🔍 Waiting for element to be enabled`);

            const observer = new MutationObserver(() => {
                if (!element.disabled) {
                    console.log(`✅ Element became enabled`);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(element, {
                attributes: true,
                attributeFilter: ['disabled']
            });

            setTimeout(() => {
                observer.disconnect();
                console.log(`❌ Element enable timeout`);
                reject(new Error('Element did not become enabled within timeout'));
            }, timeout);
        });
    }

    /**
     * Wait for an element to disappear from the DOM
     * @param {string} selector - CSS selector to wait for disappearance
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<void>} - Resolves when element disappears
     */
    static waitForElementToDisappear(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            // Check if element already doesn't exist
            if (!document.querySelector(selector)) {
                console.log(`✅ Element already absent: ${selector}`);
                return resolve();
            }

            console.log(`🔍 Waiting for element to disappear: ${selector}`);

            const observer = new MutationObserver(() => {
                if (!document.querySelector(selector)) {
                    console.log(`✅ Element disappeared: ${selector}`);
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                console.log(`❌ Element disappear timeout: ${selector}`);
                reject(new Error(`Element ${selector} did not disappear within ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Wait for text content to change in an element
     * @param {Element|string} elementOrSelector - Element or selector
     * @param {string} expectedText - Text to wait for (optional)
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<string>} - Resolves with the new text content
     */
    static waitForTextChange(elementOrSelector, expectedText = null, timeout = 5000) {
        return new Promise(async (resolve, reject) => {
            let element;

            if (typeof elementOrSelector === 'string') {
                try {
                    element = await this.waitForElement(elementOrSelector, timeout);
                } catch (error) {
                    return reject(error);
                }
            } else {
                element = elementOrSelector;
            }

            const initialText = element.textContent.trim();

            if (expectedText && initialText === expectedText) {
                console.log(`✅ Text already matches: "${expectedText}"`);
                return resolve(initialText);
            }

            console.log(`🔍 Waiting for text change from: "${initialText}"`);

            const observer = new MutationObserver(() => {
                const newText = element.textContent.trim();
                if (newText !== initialText && (!expectedText || newText === expectedText)) {
                    console.log(`✅ Text changed to: "${newText}"`);
                    observer.disconnect();
                    resolve(newText);
                }
            });

            observer.observe(element, {
                childList: true,
                subtree: true,
                characterData: true
            });

            setTimeout(() => {
                observer.disconnect();
                console.log(`❌ Text change timeout`);
                reject(new Error('Text did not change within timeout'));
            }, timeout);
        });
    }

    /**
     * Wait for page to finish loading/changing after an action
     * @param {number} stabilityTime - Time in ms to wait for stability (default: 100)
     * @param {number} timeout - Maximum timeout
     * @returns {Promise<void>}
     */
    static waitForPageStability(stabilityTime = 100, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let lastMutation = Date.now();
            let stabilityTimer;

            console.log(`🔍 Waiting for page stability (${stabilityTime}ms)`);

            const observer = new MutationObserver(() => {
                lastMutation = Date.now();
                clearTimeout(stabilityTimer);

                stabilityTimer = setTimeout(() => {
                    console.log(`✅ Page stable for ${stabilityTime}ms`);
                    observer.disconnect();
                    resolve();
                }, stabilityTime);
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });

            // Initial stability check
            stabilityTimer = setTimeout(() => {
                console.log(`✅ Page stable for ${stabilityTime}ms`);
                observer.disconnect();
                resolve();
            }, stabilityTime);

            setTimeout(() => {
                observer.disconnect();
                clearTimeout(stabilityTimer);
                console.log(`❌ Page stability timeout`);
                reject(new Error('Page did not stabilize within timeout'));
            }, timeout);
        });
    }
}