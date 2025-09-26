// ==UserScript==
// @name         CSGORoll Market Item Scraper
// @namespace    http://tampermonkey.net/
// @version      2025-03-05
// @description  Automated market item scraper and withdrawal tool for CSGORoll
// @author       You
// @match        https://www.csgoroll.com/
// @include      *csgoroll.com*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.MarketItemScraper = {
        isScraperActive: false,
        customFilterConfig: [],
        processedItems: new Set(),
        maxWithdrawRetries: 3,
        autoClearInterval: null,
        scanInterval: null,

        toggleScraper: function() {
            this.isScraperActive = !this.isScraperActive;

            if (this.isScraperActive) {
                this.createScraperOverlay();
            } else {
                const overlay = document.getElementById('market-scraper-overlay');
                if (overlay) {
                    document.body.removeChild(overlay);
                }
            }
        },

        createScraperOverlay: function() {
            if (document.getElementById('market-scraper-overlay')) {
                return;
            }

            const overlay = this.createOverlayContainer();
            const dragHandle = this.createDragHandle(overlay);
            overlay.insertBefore(dragHandle, overlay.firstChild);

            const jsonConfig = this.createJsonConfigSection();
            const resultsArea = this.createResultsArea();
            const controlButtons = this.createControlButtons(resultsArea);
            const autoWithdrawButtons = this.createAutoWithdrawButtons();
            const testButton = this.createTestRefreshButton();
            const autoClearControls = this.createAutoClearControls();

            overlay.appendChild(jsonConfig.label);
            overlay.appendChild(jsonConfig.textarea);
            overlay.appendChild(jsonConfig.loadButton);
            overlay.appendChild(resultsArea);
            overlay.appendChild(controlButtons.scrapeButton);
            overlay.appendChild(controlButtons.copyButton);
            overlay.appendChild(controlButtons.clearButton);
            overlay.appendChild(controlButtons.closeButton);
            overlay.appendChild(document.createElement('br'));
            overlay.appendChild(autoWithdrawButtons.startButton);
            overlay.appendChild(autoWithdrawButtons.stopButton);
            overlay.appendChild(testButton);
            overlay.appendChild(autoClearControls);

            document.body.appendChild(overlay);

            // Center the overlay on the screen when first opened
            this.centerOverlay(overlay);
        },

        centerOverlay: function(overlay) {
            // Reset any existing transform or position offsets
            overlay.style.transform = 'none';

            // Get window dimensions
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Get overlay dimensions
            const overlayRect = overlay.getBoundingClientRect();
            const overlayWidth = overlayRect.width;
            const overlayHeight = overlayRect.height;

            // Calculate center position
            const centerX = (windowWidth - overlayWidth) / 2;
            const centerY = (windowHeight - overlayHeight) / 2;

            // Set the position
            overlay.style.top = `${centerY}px`;
            overlay.style.right = 'auto';
            overlay.style.left = `${centerX}px`;

            // Reset the stored offset values to represent centered position
            if (this.dragHandle) {
                this.dragHandle.xOffset = 0;
                this.dragHandle.yOffset = 0;
            }

            // Clear any saved position
            localStorage.removeItem('scraperOverlayX');
            localStorage.removeItem('scraperOverlayY');
        },

        createTestRefreshButton: function() {
            const testRefreshButton = document.createElement('button');
            testRefreshButton.textContent = 'Test Refresh';
            testRefreshButton.style.marginRight = '10px';
            testRefreshButton.style.backgroundColor = '#ffcc00';
            testRefreshButton.style.fontWeight = 'bold';
            testRefreshButton.addEventListener('click', () => {
                this.testRefreshButtonFunctionality();
            });
            return testRefreshButton;
        },

        testRefreshButtonFunctionality: function() {
            const refreshButton = document.querySelector('button[data-test="category-list-item"] img[src*="Knives.svg"]')?.closest('button');

            if (refreshButton) {
                refreshButton.click();

                setTimeout(() => {
                    refreshButton.click();
                    console.log('Refresh button test completed');
                }, 1000);
            } else {
                console.log('Refresh button not found during test');
            }
        },

        createOverlayContainer: function() {
            const overlay = document.createElement('div');
            overlay.id = 'market-scraper-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: white;
                border: 2px solid #333;
                border-radius: 10px;
                padding: 15px;
                z-index: 10000;
                width: 350px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                cursor: move;
            `;
            return overlay;
        },

        createJsonConfigSection: function() {
            const jsonLabel = document.createElement('label');
            jsonLabel.textContent = 'Custom Filter JSON:';
            jsonLabel.style.display = 'block';
            jsonLabel.style.marginBottom = '10px';

            const jsonTextarea = document.createElement('textarea');
            jsonTextarea.id = 'custom-filter-json';
            jsonTextarea.style.cssText = `
                width: 100%;
                height: 150px;
                margin-bottom: 10px;
                resize: vertical;
            `;
            jsonTextarea.placeholder = `Enter JSON like:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`;

            const loadJsonButton = document.createElement('button');
            loadJsonButton.textContent = 'Load Filter';
            loadJsonButton.style.marginRight = '10px';
            loadJsonButton.addEventListener('click', () => {
                try {
                    const jsonInput = jsonTextarea.value.trim();
                    this.customFilterConfig = jsonInput ? JSON.parse(jsonInput) : [];
                    alert('Filter configuration loaded!');
                } catch (error) {
                    alert('Invalid JSON: ' + error.message);
                }
            });

            return { label: jsonLabel, textarea: jsonTextarea, loadButton: loadJsonButton };
        },

        createResultsArea: function() {
            const resultsArea = document.createElement('textarea');
            resultsArea.id = 'market-scraper-results';
            resultsArea.style.cssText = `
                width: 100%;
                height: 200px;
                margin-bottom: 10px;
                resize: vertical;
            `;
            return resultsArea;
        },

        createControlButtons: function(resultsArea) {
            const scrapeButton = document.createElement('button');
            scrapeButton.textContent = 'Scrape Items';
            scrapeButton.style.marginRight = '10px';
            scrapeButton.addEventListener('click', () => {
                const items = this.scrapeMarketItems();
                resultsArea.value = JSON.stringify(items, null, 2);
            });

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy Results';
            copyButton.addEventListener('click', () => {
                resultsArea.select();
                document.execCommand('copy');
                alert('Results copied to clipboard!');
            });

            const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear Processed';
            clearButton.style.marginRight = '10px';
            clearButton.addEventListener('click', () => {
                this.clearProcessedItems();
            });

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.float = 'right';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(document.getElementById('market-scraper-overlay'));
            });

            return {
                scrapeButton: scrapeButton,
                copyButton: copyButton,
                clearButton: clearButton,
                closeButton: closeButton
            };
        },

        createAutoWithdrawButtons: function() {
            const startScanButton = document.createElement('button');
            startScanButton.textContent = 'Start Auto-Withdraw';
            startScanButton.style.marginRight = '10px';
            startScanButton.addEventListener('click', () => {
                console.log("starting periodic scan")
                this.startPeriodicScan();
                const seconds = parseInt(document.querySelector('input[type="number"]').value) || 5;
                this.startAutoClear(seconds);
            });

            const stopScanButton = document.createElement('button');
            stopScanButton.textContent = 'Stop Auto-Withdraw';
            stopScanButton.style.marginRight = '10px';
            stopScanButton.addEventListener('click', () => {
                this.stopPeriodicScan();
            });

            return { startButton: startScanButton, stopButton: stopScanButton };
        },

        createAutoClearControls: function() {
            const autoClearInput = document.createElement('input');
            autoClearInput.type = 'number';
            autoClearInput.min = '1';
            autoClearInput.max = '60';
            autoClearInput.value = '5';
            autoClearInput.style.width = '50px';
            autoClearInput.style.marginRight = '5px';

            const autoClearLabel = document.createElement('label');
            autoClearLabel.textContent = 'Auto-clear (seconds):';
            autoClearLabel.style.fontSize = '12px';

            const autoClearContainer = document.createElement('div');
            autoClearContainer.style.marginTop = '10px';
            autoClearContainer.appendChild(autoClearLabel);
            autoClearContainer.appendChild(autoClearInput);

            return autoClearContainer;
        },

        createDragHandle: function(overlay) {
            const dragHandle = document.createElement('div');
            dragHandle.style.cssText = `
                background-color: #f1f1f1;
                color: #333;
                padding: 5px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                margin: -15px -15px 15px -15px;
                text-align: center;
                font-weight: bold;
                user-select: none;
            `;
            dragHandle.textContent = 'Market Scraper';
            this.dragHandle = dragHandle;

            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            // Store these on the dragHandle object for access in centerOverlay
            dragHandle.xOffset = xOffset;
            dragHandle.yOffset = yOffset;

            dragHandle.addEventListener('mousedown', dragStart);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', drag);

            function dragStart(e) {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === dragHandle) {
                    isDragging = true;
                }
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    // Update the values on the dragHandle object
                    dragHandle.xOffset = xOffset;
                    dragHandle.yOffset = yOffset;

                    setTranslate(currentX, currentY, overlay);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function savePosition() {
                localStorage.setItem('scraperOverlayX', xOffset);
                localStorage.setItem('scraperOverlayY', yOffset);
            }

            // Don't load saved position when initially created
            // We want to center it for the first appearance

            overlay.addEventListener('mouseup', savePosition);

            return dragHandle;
        },

        scrapeMarketItems: function() {
            const itemCards = document.querySelectorAll('.item-card');
            const scrapedItems = [];

            itemCards.forEach((card, index) => {
                try {
                    const item = this.extractItemData(card, index);
                    console.log("Extracted Item: " +item);
                    scrapedItems.push(item);
                } catch (error) {
                    console.error('Error processing item card:', error);
                }
            });

            return this.filterItems(scrapedItems);
        },

        extractItemData: function(card, index) {
            console.log({
                index: index + 1,
                subcategory: this.safeExtract(card, 'span[data-test="item-subcategory"]'),
                name: this.safeExtract(card, 'label[data-test="item-name"]'),
                price: this.safeExtract(card, 'span[data-test="value"]'),
                percentageChange: this.extractPercentageChange(card),
                condition: this.extractCondition(card),
                hasCheckedIcon: !!card.querySelector('span[inlinesvg="assets/icons/checked.svg"]')
            });

            return {
                index: index + 1,
                subcategory: this.safeExtract(card, 'span[data-test="item-subcategory"]'),
                name: this.safeExtract(card, 'label[data-test="item-name"]'),
                price: this.safeExtract(card, 'span[data-test="value"]'),
                percentageChange: this.extractPercentageChange(card),
                condition: this.extractCondition(card),
                hasCheckedIcon: !!card.querySelector('span[inlinesvg="assets/icons/checked.svg"]')
            };
        },

        safeExtract: function(card, selector) {
            const element = card.querySelector(selector);
            return element ? element.textContent.trim() : 'N/A';
        },

        extractPercentageChange: function(card) {
            const percentageSpan = card.querySelector('span.lh-16.fw-600.fs-10.ng-star-inserted');
            if (!percentageSpan) return '0%';

            const text = percentageSpan.textContent.trim();
            const percentageMatch = text.match(/^[+-]\d+\.?\d*%/);
            return percentageMatch ? percentageMatch[0] : '0%';
        },

        extractCondition: function(card) {
            const conditionSelectors = [
                'span.fn.ng-star-inserted',
                'div[data-test="item-card-float-range"] span.ng-star-inserted'
            ];

            for (let selector of conditionSelectors) {
                const conditionSpan = card.querySelector(selector);
                if (conditionSpan) {
                    const text = conditionSpan.textContent.trim();
                    const conditionMatch = text.match(/^(BS|WW|FT|MW|FN)\b/);
                    if (conditionMatch) {
                        return conditionMatch[1];
                    }
                }
            }
            return 'N/A';
        },

        parsePercentage: function(percentageStr) {
            const cleanedStr = percentageStr.replace('%', '');
            const parsedFloat = parseFloat(cleanedStr);
            return Math.abs(parsedFloat);
        },

        filterItems: function(items) {
            return items.filter(item => {
                const baseFilterPassed = this.passesBaseFilter(item);
                console.log("Base filter passed: " +baseFilterPassed);

                if (this.customFilterConfig.length === 0) {
                    return baseFilterPassed;
                }

                const customFilterPassed = this.passesCustomFilter(item);
                console.log("Custom filter passed: " +baseFilterPassed);
                return baseFilterPassed && customFilterPassed;
            });
        },

        passesBaseFilter: function(item) {
            const validConditions = ['FT', 'MW', 'FN'];
            const conditionCheck = validConditions.includes(item.condition);
            const statTrakCheck = !item.subcategory.includes('StatTrak');
            const percentageCheck = this.parsePercentage(item.percentageChange) <= 5.1
            .1;

            return conditionCheck && statTrakCheck && percentageCheck;
        },

        passesCustomFilter: function(item) {
            return this.customFilterConfig.some(filter => {
                const skinMatch = this.matchesFilterAttribute(item.subcategory, filter.skin);
                const typeMatch = this.matchesFilterAttribute(item.name, filter.type);
                return skinMatch && typeMatch;
            });
        },

        matchesFilterAttribute: function(itemValue, filterValue) {
            if (!filterValue) return true;

            if (Array.isArray(filterValue)) {
                return filterValue.some(value => itemValue.includes(value));
            }

            return itemValue.includes(filterValue);
        },

        autoWithdrawItems: function(filteredItems) {
            let processedCount = 0;
            const newItems = filteredItems.filter(item => !this.processedItems.has(item.name));

            const processItem = (index, retryCount = 0) => {
                if (index >= newItems.length) {
                    return;
                }

                const delay = Math.random() * 100 + 200;

                setTimeout(() => {
                    try {
                        const itemCard = this.findItemCardByName(newItems[index].name);

                        if (itemCard) {
                            const item = this.extractItemData(itemCard);
                            const stillMeetsFilters = this.filterItems([item]).length > 0;

                            if (!stillMeetsFilters) {
                                this.processedItems.add(newItems[index].name);
                                processItem(index + 1, 0);
                                return;
                            }

                            this.processedItems.add(newItems[index].name);
                            itemCard.click();

                            setTimeout(() => {
                                this.attemptItemWithdrawal(newItems[index], index, retryCount, processItem, processedCount);
                            }, 200);
                            this.clickMaxButton();
                        } else {
                            processItem(index + 1, 0);
                        }
                    } catch (error) {
                        console.error(`Error processing item ${newItems[index].name}:`, error);
                        processItem(index + 1, 0);
                    }
                }, delay);
            };

            processItem(0);
        },

        findItemCardByName: function(itemName) {
            return Array.from(document.querySelectorAll('.item-card'))
                .find(card => {
                    const nameElement = card.querySelector('label[data-test="item-name"]');
                    return nameElement && nameElement.textContent.trim() === itemName;
                });
        },

        attemptItemWithdrawal: function(item, index, retryCount, processItem, processedCount) {
            const withdrawButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.trim().toLowerCase() === 'withdraw');

            if (withdrawButton) {
                let clicks = 0;
                const clickInterval = setInterval(() => {
                    withdrawButton.click();
                    clicks++;

                    if (clicks >= 5) {
                        clearInterval(clickInterval);

                        setTimeout(() => {
                            this.handleWithdrawalResult(item, index, retryCount, processItem, processedCount, withdrawButton);
                        }, 500);
                        this.clickMaxButton();
                    }
                }, 200);
            } else {
                this.closeModalAndMoveToNextItem(index, processItem);
            }
        },

        handleWithdrawalResult: function(item, index, retryCount, processItem, processedCount, withdrawButton) {
            const pageText = document.body.innerText || '';
            const notJoinableError = pageText.toLowerCase().includes('this trade is not joinable');
            const refreshButton = document.querySelector('button[data-test="category-list-item"] img[src*="Knives.svg"]')?.closest('button');
            const maxButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.trim() === 'Max');

            if (notJoinableError && refreshButton && retryCount < this.maxWithdrawRetries) {
                this.retryWithdrawal(item, index, retryCount, processItem, refreshButton);
            } else if (!notJoinableError && !withdrawButton.disabled) {
                // Click somewhere on the page (not in the middle) to close popup
                const safeArea = document.querySelector('.header') || document.body;
                const rect = safeArea.getBoundingClientRect();
                const clickX = rect.left + 10;
                const clickY = rect.top + 10;

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: clickX,
                    clientY: clickY
                });
                safeArea.dispatchEvent(clickEvent);

                // Give time for popup to close before clicking Max
                setTimeout(() => {
                    if (maxButton) maxButton.click();
                    processedCount++;
                    processItem(index + 1, 0);
                }, 400);
            } else {
                processItem(index + 1, 0);
            }
        },

        retryWithdrawal: function(item, index, retryCount, processItem, refreshButton) {
            refreshButton.click();

            setTimeout(() => {
                refreshButton.click();

                setTimeout(() => {
                    this.closeModalAndMoveToNextItem(index, processItem, retryCount + 1);
                }, 300);
            }, 300);
        },

        closeModalAndMoveToNextItem: function(index, processItem, retryCount = 0) {
            const closeButtons = document.querySelectorAll('button.close, .modal-close, button[aria-label="Close"]');
            closeButtons.forEach(btn => btn.click());
            processItem(index + 1, retryCount);
        },

        clickMaxButton: function() {
            const maxButton = document.querySelector('button[class*="mat-flat-button"][class*="text-capitalize"]');
            if (maxButton && maxButton.textContent.trim().includes('Max')) {
                console.log('Found Max button using alternative selector, clicking...');
                maxButton.click();
                return true;
            }
            return false;
        },

        startPeriodicScan: function() {
            if (this.scanInterval) {
                clearInterval(this.scanInterval);
            }

            this.scanInterval = setInterval(() => {
                try {
                    const filteredItems = this.scrapeMarketItems();
                    console.log(filteredItems);
                    if (filteredItems.length > 0) {
                        this.autoWithdrawItems(filteredItems);
                    }
                } catch (error) {
                    console.error('Error during periodic scan:', error);
                }
            }, 500);

            this.startAutoClear(5);
        },

        stopPeriodicScan: function() {
            if (this.scanInterval) {
                clearInterval(this.scanInterval);
                this.scanInterval = null;
            }
            this.stopAutoClear();
        },

        clearProcessedItems: function() {
            const count = this.processedItems.size;
            this.processedItems.clear();
        },

        startAutoClear: function(seconds) {
            if (this.autoClearInterval) {
                clearInterval(this.autoClearInterval);
            }

            const interval = seconds * 1000;
            this.autoClearInterval = setInterval(() => {
                this.clearProcessedItems();
            }, interval);
        },

        stopAutoClear: function() {
            if (this.autoClearInterval) {
                clearInterval(this.autoClearInterval);
                this.autoClearInterval = null;
            }
        }
    };

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
            window.MarketItemScraper.toggleScraper();
        }
    });
})();