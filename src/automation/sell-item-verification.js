import { DOMUtils } from '../utils/dom-utils.js';

export class SellItemVerification {
    constructor() {
        this.isRunning = false;
        this.currentStep = 'idle';
        this.collectedData = {};
        this.tradeLog = [];
        this.stepTimeouts = new Map();
        this.stateKey = 'sellItemVerificationState';

        // Automation manager integration
        this.id = 'sell-item-verification';
        this.priority = 2;
        this.interval = 1000;
        this.settings = {
            enabled: true,
            maxWaitTime: 30000, // 30 seconds max wait per step
            stepCheckInterval: 500, // Check every 500ms
            logTradeData: true
        };

        // Initialize cross-page state management
        this.initializeCrossPageState();
    }

    // Cross-page state management
    initializeCrossPageState() {
        console.log('🔄 SellItemVerification: Initializing cross-page state...');
        console.log('🔄 Current URL:', window.location.href);

        // Check if we're continuing from another page
        const savedState = this.loadState();
        console.log('🔄 Loaded state from localStorage:', savedState);

        if (savedState && savedState.isActive) {
            console.log('✅ Found saved state for cross-page continuation:', savedState);
            this.restoreState(savedState);

            // Mark that we have state but don't auto-start here
            // Let the MarketScraper checkAndContinueSellVerification handle the start
            this.hasRestorableState = true;
            console.log('✅ Set hasRestorableState = true');
        } else {
            console.log('❌ No active saved state found');
            this.hasRestorableState = false;
        }
    }

    saveState() {
        const state = {
            isActive: this.isRunning,
            currentStep: this.currentStep,
            collectedData: this.collectedData,
            tradeLog: this.tradeLog,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.stateKey, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save automation state:', error);
        }
    }

    loadState() {
        try {
            const stateJson = localStorage.getItem(this.stateKey);
            if (stateJson) {
                const state = JSON.parse(stateJson);
                // Check if state is not too old (max 10 minutes)
                if (Date.now() - state.timestamp < 10 * 60 * 1000) {
                    return state;
                }
            }
        } catch (error) {
            console.error('Failed to load automation state:', error);
        }
        return null;
    }

    restoreState(state) {
        this.currentStep = state.currentStep || 'idle';
        this.collectedData = state.collectedData || {};
        this.tradeLog = state.tradeLog || [];
        console.log('Restored automation state:', state);
    }

    clearState() {
        try {
            localStorage.removeItem(this.stateKey);
        } catch (error) {
            console.error('Failed to clear automation state:', error);
        }
    }

    isSteamPage() {
        return window.location.hostname.includes('steamcommunity.com');
    }

    isCSGORollPage() {
        return window.location.hostname.includes('csgoroll.com');
    }

    // Automation manager lifecycle methods
    start() {
        this.isRunning = true;
        this.currentStep = 'wait_for_continue'; // Keep for debugging - WE ARE STILL DEBUGGING DONT TOUCH
        this.saveState(); // Save state when starting
        this.startStepMonitoring();
        console.log('SellItemVerification automation started');
        console.log('Current automation state:', {
            currentStep: this.currentStep,
            isRunning: this.isRunning,
            hasCollectedData: Object.keys(this.collectedData).length > 0,
            collectedData: this.collectedData
        });
    }

    stop() {
        this.isRunning = false;
        this.currentStep = 'idle';
        this.clearAllTimeouts();
        this.clearState(); // Clear state when stopping
        console.log('SellItemVerification automation stopped');
    }

    pause() {
        this.isRunning = false;
        this.clearAllTimeouts();
    }

    resume() {
        this.isRunning = true;
        this.startStepMonitoring();
    }

    // Main monitoring loop
    startStepMonitoring() {
        if (!this.isRunning) return;

        const monitor = () => {
            if (!this.isRunning) return;

            try {
                this.executeCurrentStep();
            } catch (error) {
                console.error(`Error in step ${this.currentStep}:`, error);
                this.logError(error);
            }

            setTimeout(monitor, this.settings.stepCheckInterval);
        };

        monitor();
    }

    executeCurrentStep() {
        console.log(`🔄 Executing step: ${this.currentStep}`);

        switch (this.currentStep) {
            // case 'waiting_for_trade_popup':
            //     this.step1_WaitForTradePopup();
            //     break;
            // case 'accept_trade_setup':
            //     this.step1_AcceptTradeSetup();
            //     break;
            case 'wait_for_continue':
                this.step1_WaitForContinue();
                break;
            case 'extract_item_data':
                this.step2_ExtractItemData();
                break;
            case 'send_items':
                this.step2_SendItems();
                break;
            case 'waiting_for_steam_completion':
                // Wait for Steam tab to complete, monitor for completion via localStorage
                this.checkSteamCompletion();
                break;
            case 'navigate_inventory':
                this.step3_NavigateInventory();
                break;
            case 'select_item':
                this.step3_SelectItem();
                break;
            case 'confirm_trade':
                this.step4_ConfirmTrade();
                break;
            case 'complete':
                this.completeVerification();
                break;
            default:
                console.log(`❓ Unknown step: ${this.currentStep}`);
        }
    }

    // Step 1: Accept Trade Setup
    step1_WaitForTradePopup() {
        const readyButton = this.findButtonByText('Yes, I\'m ready');
        if (readyButton) {
            console.log('Found "Yes, I\'m ready" button');
            readyButton.click();
            this.currentStep = 'wait_for_continue';
            this.logStep('Clicked "Yes, I\'m ready" button');
        }
    }

    step1_AcceptTradeSetup() {
        const readyButton = this.findButtonByText('Yes, I\'m ready');
        if (readyButton) {
            readyButton.click();
            this.currentStep = 'wait_for_continue';
            this.logStep('Clicked "Yes, I\'m ready" button');
        }
    }

    step1_WaitForContinue() {
        const continueButton = this.findButtonByText('Continue');
        if (continueButton) {
            console.log('Found "Continue" button');
            continueButton.click();
            this.currentStep = 'extract_item_data';
            this.logStep('Clicked "Continue" button');
        }
    }

    // Step 2: Item Dialog Extraction
    step2_ExtractItemData() {
        const modal = document.querySelector('mat-dialog-container');
        if (!modal) return;

        try {
            // Extract item category
            const categoryElement = modal.querySelector('span[data-test="item-subcategory"]');
            const itemCategory = categoryElement ? categoryElement.textContent.trim() : 'Unknown';

            // Extract item name from label title
            const labelElement = modal.querySelector('label[title]');
            const itemName = labelElement ? labelElement.getAttribute('title') : 'Unknown';

            // Extract item value
            const valueElement = modal.querySelector('span.currency-value');
            const itemValue = valueElement ? valueElement.textContent.trim() : 'Unknown';

            // Extract inventory page number
            const pageText = modal.textContent || '';
            const pageMatch = pageText.match(/On page (\d+) of your Steam inventory/i);
            const inventoryPage = pageMatch ? parseInt(pageMatch[1]) : 1;

            // Calculate item position in 4x4 grid
            const itemPosition = this.calculateItemPosition(modal);

            // Store collected data
            this.collectedData = {
                itemName,
                itemCategory,
                itemValue,
                inventoryPage,
                itemPosition,
                timestamp: new Date().toISOString()
            };

            console.log('Extracted item data:', this.collectedData);
            this.logStep('Extracted item data', this.collectedData);
            this.currentStep = 'send_items';
            this.saveState(); // Save state after data extraction

        } catch (error) {
            console.error('Error extracting item data:', error);
            this.logError(error);
        }
    }

    calculateItemPosition(modal) {
        try {
            // Look for item grid containers (assuming 4x4 layout)
            const gridItems = modal.querySelectorAll('[class*="item"], [class*="grid"], .inventory-item');

            // If we can't find a clear grid structure, return position 1 as default
            if (gridItems.length === 0) return 1;

            // Find the highlighted/selected item
            const selectedItem = modal.querySelector('.selected, .highlight, .active, [class*="selected"]');

            if (selectedItem) {
                const itemIndex = Array.from(gridItems).indexOf(selectedItem);
                return itemIndex >= 0 ? itemIndex + 1 : 1; // Convert to 1-based index
            }

            return 1; // Default position
        } catch (error) {
            console.error('Error calculating item position:', error);
            return 1;
        }
    }

    step2_SendItems() {
        const sendButton = this.findButtonByText('Send Items Now');
        if (sendButton) {
            console.log('Found "Send Items Now" button');

            // IMPORTANT: Set the step for Steam page BEFORE saving state
            this.currentStep = 'navigate_inventory';
            this.isRunning = true; // Ensure it stays active
            this.saveState(); // This will save navigate_inventory step
            this.logStep('Clicked "Send Items Now" button - state saved for Steam page');

            // Check if button opens in new tab by checking target attribute
            console.log('Button element:', sendButton);
            console.log('Button href:', sendButton.href);
            console.log('Button target:', sendButton.target);

            // Click button (this will navigate to Steam page and create new script instance)
            sendButton.click();

            // Monitor for new tab/window opening
            setTimeout(() => {
                if (this.isSteamPage()) {
                    console.log('Successfully navigated to Steam page');
                } else {
                    console.log('Still on CSGORoll page - button may have opened new tab');
                    console.log('Current URL:', window.location.href);

                    // The Steam page should pick up the saved state automatically
                    // Keep the current page automation in a waiting state
                    this.currentStep = 'waiting_for_steam_completion';
                    this.logStep('Waiting for Steam tab to complete the automation');
                }
            }, 3000);
        }
    }

    // Step 3: Steam Inventory Navigation
    step3_NavigateInventory() {
        console.log('Step 3: Steam Inventory Navigation - checking page elements');

        // Wait for new tab/page to load and check if we're on Steam inventory
        const pageControlCur = document.querySelector('#pagecontrol_cur');

        if (pageControlCur) {
            const currentPage = parseInt(pageControlCur.textContent) || 1;
            const targetPage = this.collectedData.inventoryPage || 1;

            console.log(`Steam inventory page detected. Current: ${currentPage}, Target: ${targetPage}`);

            if (currentPage !== targetPage) {
                this.navigateToPage(currentPage, targetPage);
            } else {
                console.log(`Already on correct page ${targetPage}`);
                this.currentStep = 'select_item';
                this.logStep(`Navigated to inventory page ${targetPage}`);
            }
        } else {
            console.log('Steam inventory page control not found yet, waiting...');
            // Check if we're on the right Steam domain but page hasn't loaded yet
            if (this.isSteamPage()) {
                console.log('On Steam domain but inventory not loaded yet');
            }
        }
    }

    navigateToPage(currentPage, targetPage) {
        if (currentPage < targetPage) {
            const nextButton = document.querySelector('#pagebtn_next');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                this.logStep(`Clicked next page button (${currentPage} -> ${targetPage})`);
                // Stay in same step to continue navigation
            }
        } else if (currentPage > targetPage) {
            const prevButton = document.querySelector('#pagebtn_previous');
            if (prevButton && !prevButton.disabled) {
                prevButton.click();
                this.logStep(`Clicked previous page button (${currentPage} -> ${targetPage})`);
                // Stay in same step to continue navigation
            }
        }
    }

    step3_SelectItem() {
        // Look for Steam inventory items
        const inventoryItems = document.querySelectorAll('[id^="item730_"]');

        if (inventoryItems.length === 0) {
            console.log('No inventory items found, waiting...');
            return;
        }

        const targetItem = this.findTargetItem(inventoryItems);

        if (targetItem) {
            console.log('Found target item, double-clicking');
            this.doubleClickElement(targetItem);
            this.currentStep = 'confirm_trade';
            this.logStep('Double-clicked target item');
        } else {
            console.log('Target item not found on current page');
            this.logStep('Target item not found on current page');
        }
    }

    findTargetItem(inventoryItems) {
        const targetName = this.collectedData.itemName;
        const targetPosition = this.collectedData.itemPosition;

        // Method 1: Try to match by name/title
        for (let item of inventoryItems) {
            const title = item.getAttribute('title') || '';
            const alt = item.querySelector('img')?.getAttribute('alt') || '';

            if (title.includes(targetName) || alt.includes(targetName)) {
                return item;
            }
        }

        // Method 2: Try to match by grid position
        if (targetPosition && targetPosition <= inventoryItems.length) {
            return inventoryItems[targetPosition - 1]; // Convert to 0-based index
        }

        return null;
    }

    doubleClickElement(element) {
        // Create double-click event
        const event1 = new MouseEvent('click', { bubbles: true, cancelable: true });
        const event2 = new MouseEvent('click', { bubbles: true, cancelable: true });

        element.dispatchEvent(event1);
        setTimeout(() => element.dispatchEvent(event2), 100);
    }

    // Step 4: Trade Confirmation
    step4_ConfirmTrade() {
        // Look for trade confirmation popup
        const confirmTradeElement = document.querySelector('div.content');
        if (confirmTradeElement && confirmTradeElement.textContent.includes('Click here to confirm trade contents')) {
            confirmTradeElement.click();
            this.logStep('Clicked trade confirmation');

            // Wait for gift confirmation
            setTimeout(() => {
                this.confirmGiftTrade();
            }, 1000);
        }
    }

    confirmGiftTrade() {
        const giftButton = document.querySelector('div.btn_green_steamui span');
        if (giftButton && giftButton.textContent.includes('Yes, this is a gift')) {
            giftButton.parentElement.click();
            this.logStep('Confirmed gift trade');

            // Wait for final make offer button
            setTimeout(() => {
                this.makeOffer();
            }, 1000);
        }
    }

    makeOffer() {
        const makeOfferButton = document.querySelector('#trade_confirmbtn');
        if (makeOfferButton) {
            makeOfferButton.click();
            this.logStep('Clicked Make Offer button');
            this.currentStep = 'complete';
        }
    }

    checkSteamCompletion() {
        // Check if the Steam tab has completed the automation
        const state = this.loadState();
        if (!state || !state.isActive) {
            console.log('Steam automation appears to be completed');
            this.currentStep = 'complete';
        } else {
            console.log('Still waiting for Steam tab to complete...');
        }
    }

    completeVerification() {
        this.logTradeCompletion();
        this.currentStep = 'idle';
        this.clearState(); // Clear state when trade is complete
        console.log('Trade verification completed successfully');

        // Reset for next trade
        setTimeout(() => {
            this.resetForNextTrade();
        }, 2000);
    }

    // Utility methods
    findButtonByText(text) {
        // Look for both button elements and anchor elements with mat-flat-button attribute
        const buttons = document.querySelectorAll('button, a[mat-flat-button]');
        return Array.from(buttons).find(button => {
            const span = button.querySelector('span.mat-button-wrapper');
            if (span) {
                const buttonText = span.textContent.trim();
                // Case-insensitive comparison
                return buttonText.toLowerCase() === text.toLowerCase();
            }
            return false;
        });
    }

    clearAllTimeouts() {
        this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
        this.stepTimeouts.clear();
    }

    resetForNextTrade() {
        this.collectedData = {};
        this.currentStep = 'waiting_for_trade_popup';
        console.log('Reset for next trade verification');
    }

    // Logging methods
    logStep(action, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            step: this.currentStep,
            action,
            data
        };

        this.tradeLog.push(logEntry);
        console.log(`[SellItemVerification] ${action}`, data || '');
    }

    logError(error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            step: this.currentStep,
            error: error.message,
            stack: error.stack
        };

        this.tradeLog.push(errorEntry);
        console.error(`[SellItemVerification] Error in ${this.currentStep}:`, error);
    }

    logTradeCompletion() {
        const completionLog = {
            timestamp: new Date().toISOString(),
            action: 'trade_completed',
            collectedData: this.collectedData,
            fullLog: this.tradeLog
        };

        console.log('Trade Verification Completed:', completionLog);

        // Store in local storage for persistence
        if (this.settings.logTradeData) {
            this.saveTradeToStorage(completionLog);
        }
    }

    saveTradeToStorage(tradeData) {
        try {
            const existingTrades = JSON.parse(localStorage.getItem('sellItemVerificationLogs') || '[]');
            existingTrades.push(tradeData);

            // Keep only last 100 trades to prevent storage overflow
            if (existingTrades.length > 100) {
                existingTrades.splice(0, existingTrades.length - 100);
            }

            localStorage.setItem('sellItemVerificationLogs', JSON.stringify(existingTrades));
        } catch (error) {
            console.error('Error saving trade data to storage:', error);
        }
    }

    // Public API methods
    getCurrentStep() {
        return this.currentStep;
    }

    getCollectedData() {
        return { ...this.collectedData };
    }

    getTradeLog() {
        return [...this.tradeLog];
    }

    isActive() {
        return this.isRunning && this.currentStep !== 'idle';
    }

    manualTrigger() {
        if (!this.isRunning) {
            this.start();
        } else {
            console.log('Automation is already running');
        }
    }
}