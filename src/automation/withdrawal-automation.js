import { DOMUtils } from '../utils/dom-utils.js';

export class WithdrawalAutomation {
    constructor(dataScraper, itemFilter) {
        this.dataScraper = dataScraper;
        this.itemFilter = itemFilter;
        this.maxWithdrawRetries = 3;
        this.autoClearInterval = null;
        this.scanInterval = null;
        this.isRunning = false;
    }

    startPeriodicScan(intervalMs = 500) {
        if (this.scanInterval) {
            this.stopPeriodicScan();
        }

        this.isRunning = true;
        this.scanInterval = setInterval(() => {
            try {
                const scrapedItems = this.dataScraper.scrapeMarketItems();
                const filteredItems = this.itemFilter.filterItems(scrapedItems);
                console.log('Filtered items:', filteredItems);

                if (filteredItems.length > 0) {
                    this.autoWithdrawItems(filteredItems);
                }
            } catch (error) {
                console.error('Error during periodic scan:', error);
            }
        }, intervalMs);

        this.startAutoClear(5);
    }

    stopPeriodicScan() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.isRunning = false;
        this.stopAutoClear();
    }

    isAutomationRunning() {
        return this.isRunning;
    }

    autoWithdrawItems(filteredItems) {
        const newItems = this.dataScraper.getNewItems(filteredItems);
        let processedCount = 0;

        const processItem = (index, retryCount = 0) => {
            if (index >= newItems.length) {
                return;
            }

            const delay = Math.random() * 100 + 200;

            setTimeout(() => {
                try {
                    const itemCard = this.dataScraper.findItemCardByName(newItems[index].name);

                    if (itemCard) {
                        const item = this.dataScraper.extractItemData(itemCard);
                        const stillMeetsFilters = this.itemFilter.filterItems([item]).length > 0;

                        if (!stillMeetsFilters) {
                            this.dataScraper.addProcessedItem(newItems[index].name);
                            processItem(index + 1, 0);
                            return;
                        }

                        this.dataScraper.addProcessedItem(newItems[index].name);
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
    }

    attemptItemWithdrawal(item, index, retryCount, processItem, processedCount) {
        const withdrawButton = DOMUtils.findElementByText(
            document.querySelectorAll('button'),
            'withdraw'
        );

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
    }

    handleWithdrawalResult(item, index, retryCount, processItem, processedCount, withdrawButton) {
        const pageText = document.body.innerText || '';
        const notJoinableError = pageText.toLowerCase().includes('this trade is not joinable');
        const refreshButton = document.querySelector('button[data-test="category-list-item"] img[src*="Knives.svg"]')?.closest('button');
        const maxButton = DOMUtils.findElementByText(document.querySelectorAll('button'), 'Max');

        if (notJoinableError && refreshButton && retryCount < this.maxWithdrawRetries) {
            this.retryWithdrawal(item, index, retryCount, processItem, refreshButton);
        } else if (!notJoinableError && !withdrawButton.disabled) {
            this.closePopupAndContinue(maxButton, processedCount, index, processItem);
        } else {
            processItem(index + 1, 0);
        }
    }

    closePopupAndContinue(maxButton, processedCount, index, processItem) {
        const safeArea = document.querySelector('.header') || document.body;
        const rect = safeArea.getBoundingClientRect();
        const coordinates = {
            x: rect.left + 10,
            y: rect.top + 10
        };

        DOMUtils.dispatchClickEvent(safeArea, coordinates);

        setTimeout(() => {
            if (maxButton) maxButton.click();
            processedCount++;
            processItem(index + 1, 0);
        }, 400);
    }

    retryWithdrawal(item, index, retryCount, processItem, refreshButton) {
        refreshButton.click();

        setTimeout(() => {
            refreshButton.click();

            setTimeout(() => {
                this.closeModalAndMoveToNextItem(index, processItem, retryCount + 1);
            }, 300);
        }, 300);
    }

    closeModalAndMoveToNextItem(index, processItem, retryCount = 0) {
        const closeButtons = document.querySelectorAll('button.close, .modal-close, button[aria-label="Close"]');
        closeButtons.forEach(btn => btn.click());
        processItem(index + 1, retryCount);
    }

    clickMaxButton() {
        const maxButton = document.querySelector('button[class*="mat-flat-button"][class*="text-capitalize"]');
        if (maxButton && maxButton.textContent.trim().includes('Max')) {
            console.log('Found Max button using alternative selector, clicking...');
            maxButton.click();
            return true;
        }
        return false;
    }

    testRefreshButtonFunctionality() {
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
    }

    startAutoClear(seconds) {
        if (this.autoClearInterval) {
            clearInterval(this.autoClearInterval);
        }

        const interval = seconds * 1000;
        this.autoClearInterval = setInterval(() => {
            this.dataScraper.clearProcessedItems();
        }, interval);
    }

    stopAutoClear() {
        if (this.autoClearInterval) {
            clearInterval(this.autoClearInterval);
            this.autoClearInterval = null;
        }
    }
}