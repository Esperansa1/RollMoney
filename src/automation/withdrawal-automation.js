import { DOMUtils } from '../utils/dom-utils.js';
import { DOMObserver } from '../utils/dom-observer.js';

export class WithdrawalAutomation {
    constructor(dataScraper, itemFilter) {
        this.dataScraper = dataScraper;
        this.itemFilter = itemFilter;
        this.maxWithdrawRetries = 3;
        this.autoClearInterval = null;
        this.scanInterval = null;
        this.domObserver = null;
        this.isRunning = false;
        this.isRefreshing = false;

        // Automation manager integration
        this.id = 'withdrawal-automation';
        this.priority = 1;
        this.interval = 10000;
        this.settings = {
            scanInterval: 10000,
            autoClearSeconds: 5,
            enabled: true
        };
    }

    // Automation manager lifecycle methods
    start() {
        this.startObservedScan();
    }

    stop() {
        this.stopPeriodicScan();
    }

    pause() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
        }
        this.isRunning = false;
    }

    resume() {
        if (!this.isRunning) {
            this.start();
        }
    }

    startObservedScan() {
        // Start fallback heartbeat poll at 10s (catches mutations missed by the observer,
        // e.g. after Angular SPA navigation destroys and recreates the item list)
        this.startPeriodicScan(10000);

        // Primary: MutationObserver for near-zero detection latency
        this.domObserver = new MutationObserver((mutations) => {
            if (!this.isRunning) return;

            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;

                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;

                    // Handle both: node IS .item-card, or node CONTAINS .item-card children
                    // (Angular may add the host element rather than the .item-card directly)
                    const cards = node.classList?.contains('item-card')
                        ? [node]
                        : Array.from(node.querySelectorAll('.item-card'));

                    for (const card of cards) {
                        this._handleNewCard(card);
                    }
                }
            }
        });

        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true
            // No attributes:true — we only need childList to detect new item-card nodes
        });
    }

    _handleNewCard(card, retryCount = 0) {
        try {
            const itemData = this.dataScraper.extractItemData(card);

            // Skip incomplete Angular renders — name is not yet hydrated
            if (!itemData.name || itemData.name === 'N/A') return;

            // Dedup check: if already processed or in-flight, skip
            if (this.dataScraper.isItemProcessed(itemData.name)) return;

            // Skip if percentage span not rendered yet — retry up to 3 times (50ms apart)
            // so Angular has time to hydrate the card before we filter on percentage
            if (!card.querySelector('span.lh-16.fw-600.fs-10.ng-star-inserted')) {
                if (retryCount < 3) {
                    setTimeout(() => {
                        if (!this.isRunning) return;
                        if (this.dataScraper.isItemProcessed(itemData.name)) return;
                        this._handleNewCard(card, retryCount + 1);
                    }, 50);
                }
                return;
            }

            // Filter check: does this item pass the current filter config?
            const passes = this.itemFilter.filterItems([itemData]).length > 0;
            if (!passes) return;

            // Mark processed SYNCHRONOUSLY before any await to prevent duplicate processing
            // if the observer fires a second time for the same node before processItemFast resolves
            this.dataScraper.addProcessedItem(itemData.name);

            // Fire withdrawal attempt (fire-and-forget; processItemFast handles its own errors)
            this.processItemFast(itemData, 0).catch(err =>
                console.error(`Observer: error processing ${itemData.name}:`, err)
            );
        } catch (err) {
            console.error('Observer: _handleNewCard error:', err);
        }
    }

    startPeriodicScan(intervalMs = 500) {
        if (this.scanInterval) {
            this.stopPeriodicScan();
        }

        this.isRunning = true;
        this.scanInterval = setInterval(async () => {
            try {
                const scrapedItems = this.dataScraper.scrapeMarketItems();
                const filteredItems = this.itemFilter.filterItems(scrapedItems);
                console.log('Filtered items:', filteredItems);

                if (filteredItems.length > 0) {
                    await this.autoWithdrawItems(filteredItems);
                }
            } catch (error) {
                console.error('Error during periodic scan:', error);
            }
        }, intervalMs);

        this.startAutoClear(30);
    }

    stopPeriodicScan() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        // Disconnect MutationObserver so callbacks stop firing after bot is stopped
        if (this.domObserver) {
            this.domObserver.disconnect();
            this.domObserver = null;
        }
        this.isRunning = false;
        this.stopAutoClear();
    }

    isAutomationRunning() {
        return this.isRunning;
    }

    async autoWithdrawItems(filteredItems) {
        const newItems = this.dataScraper.getNewItems(filteredItems);
        console.log(`🚀 Processing ${newItems.length} new items with zero delays`);

        for (let index = 0; index < newItems.length; index++) {
            try {
                await this.processItemFast(newItems[index], index);
            } catch (error) {
                console.error(`❌ Error processing item ${newItems[index].name}:`, error);
                // Continue with next item even if one fails
                this.dataScraper.addProcessedItem(newItems[index].name);
            }
        }

        console.log(`✅ Completed processing ${newItems.length} items`);
    }

    async processItemFast(item, index) {
        // Find the item card
        const itemCard = this.dataScraper.findItemCardByName(item.name);
        if (!itemCard) {
            console.log(`❌ Item card not found: ${item.name}`);
            return;
        }

        // Re-validate item still meets filters
        const currentItemData = this.dataScraper.extractItemData(itemCard);
        const stillMeetsFilters = this.itemFilter.filterItems([currentItemData]).length > 0;

        if (!stillMeetsFilters) {
            console.log(`⚠️ Item no longer meets filters: ${item.name}`);
            this.dataScraper.addProcessedItem(item.name);
            return;
        }

        // Mark as processed to prevent duplicate processing
        this.dataScraper.addProcessedItem(item.name);

        // Click item card to open modal
        console.log(`🖱️ Clicking item: ${item.name}`);
        itemCard.click();

        try {
            // Wait for modal/dialog to appear and attempt withdrawal
            await this.attemptItemWithdrawalFast(item);
        } catch (error) {
            console.error(`❌ Withdrawal failed for ${item.name}:`, error);
            // Try to close any open modals and continue
            await this.closeAnyModals();
        }
    }

    async attemptItemWithdrawalFast(item) {
        console.log(`💰 Attempting fast withdrawal for: ${item.name}`);

        try {
            // Wait for withdraw button to appear
            const withdrawButton = await DOMObserver.waitForCondition(
                () => {
                    const buttons = document.querySelectorAll('button');
                    return Array.from(buttons).find(btn =>
                        btn.textContent.toLowerCase().includes('withdraw')
                    );
                },
                3000,
                'withdraw button to appear'
            ).then(() => {
                const buttons = document.querySelectorAll('button');
                return Array.from(buttons).find(btn =>
                    btn.textContent.toLowerCase().includes('withdraw')
                );
            });

            if (!withdrawButton) {
                throw new Error('Withdraw button not found');
            }

            console.log(`🔍 Found withdraw button for: ${item.name}`);

            // Click Max button immediately if available
            this.clickMaxButtonFast();

            // Wait for withdraw button to be enabled and click it
            await DOMObserver.waitForElementEnabled(withdrawButton, 2000);
            console.log(`🖱️ Clicking withdraw button for: ${item.name}`);
            withdrawButton.click();

            // Wait for withdrawal result
            await this.handleWithdrawalResultFast(item, withdrawButton);

        } catch (error) {
            console.error(`❌ Fast withdrawal failed for ${item.name}:`, error);
            throw error;
        }
    }

    async handleWithdrawalResultFast(item, withdrawButton) {
        console.log(`📋 Checking withdrawal result for: ${item.name}`);

        try {
            // Wait for page to stabilize after withdrawal attempt
            await DOMObserver.waitForPageStability(50, 3000);

            // Check for various success/error conditions
            const pageText = document.body.innerText || '';
            const notJoinableError = pageText.toLowerCase().includes('this trade is not joinable');

            if (notJoinableError) {
                console.log(`⚠️ Trade not joinable error for: ${item.name}`);
                await this.handleNotJoinableError(item);
                return;
            }

            // Check if withdrawal button is now disabled (success indicator)
            if (withdrawButton.disabled) {
                console.log(`✅ Withdrawal successful for: ${item.name}`);
                await this.closeModalSuccessfully();
                return;
            }

            // Check for success indicators in page text
            if (pageText.toLowerCase().includes('success') ||
                pageText.toLowerCase().includes('completed') ||
                pageText.toLowerCase().includes('withdrawn')) {
                console.log(`✅ Withdrawal success detected for: ${item.name}`);
                await this.closeModalSuccessfully();
                return;
            }

            // If no clear success/error, wait a bit more and recheck
            console.log(`🔄 Unclear result, waiting for confirmation: ${item.name}`);
            await DOMObserver.waitForCondition(
                () => {
                    const newText = document.body.innerText || '';
                    return newText.toLowerCase().includes('success') ||
                           newText.toLowerCase().includes('error') ||
                           withdrawButton.disabled;
                },
                2000,
                'withdrawal confirmation'
            );

            // Recheck after waiting
            if (withdrawButton.disabled) {
                console.log(`✅ Withdrawal confirmed successful for: ${item.name}`);
                await this.closeModalSuccessfully();
            } else {
                console.log(`❌ Withdrawal may have failed for: ${item.name}`);
                await this.closeAnyModals();
            }

        } catch (error) {
            console.error(`❌ Error handling withdrawal result for ${item.name}:`, error);
            await this.closeAnyModals();
        }
    }

    async handleNotJoinableError(item) {
        console.log(`Item sold to another user: ${item.name} — triggering page reload`);

        // Guard: if multiple items hit this path in the same scan cycle, only reload once
        if (this.isRefreshing) {
            console.log('Page reload already queued, skipping duplicate trigger');
            return;
        }
        this.isRefreshing = true;

        // Stop further scan cycles immediately so no more items are attempted
        this.stopPeriodicScan();

        // Signal that the sniper should auto-restart after the reload
        localStorage.setItem('sniper-auto-restart', '1');

        console.log('Reloading page to clear stale items...');
        location.reload();
    }

    async closeModalSuccessfully() {
        console.log(`✅ Closing modal after successful withdrawal`);

        try {
            // Click Max button if visible
            this.clickMaxButtonFast();

            // Close modal by clicking outside or close button
            await this.closeAnyModals();

        } catch (error) {
            console.error(`❌ Error closing modal:`, error);
        }
    }

    async closeAnyModals() {
        console.log(`🚪 Closing any open modals`);

        try {
            // Try multiple approaches to close modals
            const closeSelectors = [
                'button.close',
                '.modal-close',
                'button[aria-label="Close"]',
                'button[data-test*="close"]',
                '.overlay',
                '.backdrop'
            ];

            for (const selector of closeSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`🖱️ Clicking close element: ${selector}`);
                    elements.forEach(el => el.click());
                    break;
                }
            }

            // If no close buttons, click outside modal area
            const safeArea = document.querySelector('.header') || document.body;
            const rect = safeArea.getBoundingClientRect();
            const coordinates = {
                x: rect.left + 10,
                y: rect.top + 10
            };

            DOMUtils.dispatchClickEvent(safeArea, coordinates);

            // Wait for modal to close
            await DOMObserver.waitForElementToDisappear('.modal, .dialog, [role="dialog"]', 1000);

        } catch (error) {
            console.log(`⚠️ Could not detect modal closure, continuing...`);
        }
    }

    clickMaxButtonFast() {
        try {
            const maxSelectors = [
                'button[class*="mat-flat-button"][class*="text-capitalize"]',
                'button:contains("Max")',
                'button[data-test*="max"]',
                'button.max-button'
            ];

            for (const selector of maxSelectors) {
                const buttons = document.querySelectorAll(selector);
                for (const button of buttons) {
                    if (button.textContent.trim().toLowerCase().includes('max')) {
                        console.log('🔘 Clicking Max button');
                        button.click();
                        return true;
                    }
                }
            }

            console.log('⚠️ Max button not found');
            return false;
        } catch (error) {
            console.error('❌ Error clicking Max button:', error);
            return false;
        }
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