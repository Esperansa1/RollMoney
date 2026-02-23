import { DOMUtils } from '../utils/dom-utils.js';

export class SellItemVerification {
    constructor() {
        this.isRunning = false;
        this.currentStep = 'idle';
        this.collectedData = {};
        this.tradeLog = [];
        this.stepTimeouts = new Map();
        this._tradeConfirmInProgress = false;  // re-entry guard for step 4
        this._monitoringActive = false;        // re-entry guard for startStepMonitoring

        // Automation manager integration
        this.id = 'sell-item-verification';
        this.priority = 2;
        this.settings = {
            enabled: true,
            maxWaitTime: 30000, // 30 seconds max wait per step
            stepCheckInterval: 2000, // Check every 2000ms
            logTradeData: true
        };

        // Initialize cross-page state management
        this.initializeCrossPageState();
    }

    // Cross-page state management - ONLY for Steam pages
    initializeCrossPageState() {
        console.log('🔄 SellItemVerification: Initializing cross-page state...');
        console.log('🔄 Page hostname:', window.location.hostname);
        console.log('🔄 Is Steam page:', this.isSteamPage());
        console.log('🔄 Is CSGORoll page:', this.isCSGORollPage());

        // ONLY check for state on Steam pages - CSGORoll should never auto-restore
        if (!this.isSteamPage()) {
            console.log('🚫 Not on Steam page - skipping state restoration');
            return;
        }

        // Check for URL parameters (only on Steam pages)
        const urlState = this.decodeDataFromUrlParams();
        if (urlState) {
            console.log('✅ Found automation data in URL parameters on Steam page');
            console.log('   - Step:', urlState.currentStep);
            console.log('   - Item name:', urlState.collectedData?.itemName || 'MISSING');
            console.log('   - Inventory page:', urlState.collectedData?.inventoryPage || 'MISSING');
            console.log('   - Item position:', urlState.collectedData?.itemPosition || 'MISSING');

            // Validate Steam page data
            if (!urlState.collectedData || !urlState.collectedData.itemName) {
                console.log('⚠️ Warning: On Steam page but missing critical item data');
            } else {
                console.log('✅ Steam page has all required item data - restoring state');

                // Restore the automation state
                this.collectedData = urlState.collectedData;
                this.currentStep = urlState.currentStep || 'navigate_inventory';

                console.log('🔄 State restored from URL parameters:', {
                    currentStep: this.currentStep,
                    collectedData: this.collectedData
                });
            }
        } else {
            console.log('🔍 No URL parameters found on Steam page');
        }
    }

    // Removed saveState(), validateState(), and loadState() methods
    // Cross-domain state transfer now uses URL parameters exclusively

    // URL parameter utility methods for cross-domain data transfer
    encodeDataToUrlParams(data) {
        try {
            // Create a compact representation of the data
            const compactData = {
                n: data.itemName || '',           // name
                c: data.itemCategory || '',       // category
                v: data.itemValue || '',          // value
                p: data.inventoryPage || 1,       // page
                i: data.itemPosition || 1,        // item position
                s: 'navigate_inventory',           // step
                t: Date.now()                     // timestamp
            };

            // Encode as base64 to handle special characters
            const jsonString = JSON.stringify(compactData);
            const encoded = btoa(encodeURIComponent(jsonString));

            console.log('🔗 Encoded data for URL:', compactData);
            console.log('🔗 Base64 encoded:', encoded);

            return encoded;
        } catch (error) {
            console.error('❌ Failed to encode data for URL:', error);
            return null;
        }
    }

    decodeDataFromUrlParams() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedData = urlParams.get('automation_data');

            if (!encodedData) {
                console.log('🔍 No automation_data parameter found in URL');
                return null;
            }

            console.log('🔗 Found encoded data in URL:', encodedData);

            // Decode from base64
            const jsonString = decodeURIComponent(atob(encodedData));
            const compactData = JSON.parse(jsonString);

            console.log('🔗 Decoded compact data:', compactData);

            // Expand back to full format
            const fullData = {
                itemName: compactData.n || 'Unknown',
                itemCategory: compactData.c || 'Unknown',
                itemValue: compactData.v || 'Unknown',
                inventoryPage: compactData.p || 1,
                itemPosition: compactData.i || 1,
                timestamp: new Date().toISOString()
            };

            // Validate data age (max 10 minutes)
            const ageMinutes = (Date.now() - compactData.t) / (1000 * 60);
            if (ageMinutes > 10) {
                console.log('❌ URL data is too old:', ageMinutes.toFixed(1), 'minutes');
                return null;
            }

            console.log('✅ Successfully decoded automation data from URL:', fullData);
            return {
                collectedData: fullData,
                currentStep: compactData.s || 'navigate_inventory',
                isActive: true,
                timestamp: compactData.t
            };

        } catch (error) {
            console.error('❌ Failed to decode data from URL:', error);
            return null;
        }
    }

    // Removed clearState() method - no longer using localStorage

    isSteamPage() {
        return window.location.hostname.includes('steamcommunity.com');
    }

    isCSGORollPage() {
        return window.location.hostname.includes('csgoroll.com');
    }

    // Automation manager lifecycle methods
    start() {
        console.log('🚀 Starting SellItemVerification automation...');
        this.isRunning = true;

        // Set appropriate starting step based on context
        if(this.isCSGORollPage()){
            this.currentStep = 'waiting_for_trade_popup';
            console.log('🔄 Starting fresh automation from Yes Im ready');
        }
        else if(this.isSteamPage()){
            // If we don't have collected data, start from navigation
            if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
                this.currentStep = 'navigate_inventory';
                console.log('🔄 Starting fresh on Steam - Navigating Inventory');
            } else {
                console.log('🔄 Using restored state - Current step:', this.currentStep);
                console.log('🔄 Restored data:', this.collectedData);
            }
        }

        this.startStepMonitoring();
        console.log('✅ SellItemVerification automation started');
        console.log('📋 Current automation state:', {
            currentStep: this.currentStep,
            isRunning: this.isRunning,
            hasCollectedData: Object.keys(this.collectedData).length > 0
        });
    }

    stop() {
        console.log('🛑 Stopping SellItemVerification automation...');
        this.isRunning = false;
        this.currentStep = 'idle';
        this.clearAllTimeouts();

        // Reset collected data and state
        this.collectedData = {};
        this.tradeLog = [];

        console.log('✅ SellItemVerification automation stopped and reset');
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
        if (this._monitoringActive) {
            console.warn('[SellItemVerification] startStepMonitoring() called while already active — ignoring duplicate start');
            return;
        }
        this._monitoringActive = true;

        const monitor = () => {
            if (!this.isRunning) {
                this._monitoringActive = false;
                return;
            }

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
        // Check if automation is still running
        if (!this.isRunning) {
            console.log(`⏸️ Automation stopped, skipping step: ${this.currentStep}`);
            return;
        }

        console.log(`🔄 Executing step: ${this.currentStep} (${this.isSteamPage() ? 'Steam' : 'CSGORoll'} page)`);

        switch (this.currentStep) {
            case 'waiting_for_trade_popup':
                if (this.isCSGORollPage()) {
                    this.step1_WaitForTradePopup();
                } else {
                    console.log('Skipping wait_for_continue on Steam page');
                }
                break;
            case 'wait_for_continue':
                // Only execute this on CSGORoll page
                if (this.isCSGORollPage()) {
                    this.step1_WaitForContinue();
                } else {
                    console.log('Skipping wait_for_continue on Steam page');
                }
                break;
            case 'extract_item_data':
                // Only execute this on CSGORoll page
                if (this.isCSGORollPage()) {
                    this.step2_ExtractItemData();
                } else {
                    console.log('Skipping extract_item_data on Steam page');
                }
                break;
            case 'send_items':
                // Only execute this on CSGORoll page
                if (this.isCSGORollPage()) {
                    this.step2_SendItems();
                } else {
                    console.log('Skipping send_items on Steam page');
                }
                break;
            case 'waiting_for_steam_completion':
                // Only execute this on CSGORoll page
                if (this.isCSGORollPage()) {
                    this.checkSteamCompletion();
                } else {
                    console.log('On Steam page, changing from waiting_for_steam_completion to navigate_inventory');
                    this.currentStep = 'navigate_inventory';
                }
                break;
            case 'navigate_inventory':
                // Only execute this on Steam page
                if (this.isSteamPage()) {
                    this.step3_NavigateInventory();
                } else {
                    console.log('Skipping navigate_inventory on CSGORoll page');
                }
                break;
            case 'select_item':
                // Only execute this on Steam page
                if (this.isSteamPage()) {
                    this.step3_SelectItem();
                } else {
                    console.log('Skipping select_item on CSGORoll page');
                }
                break;
            case 'confirm_trade':
                // Only execute this on Steam page
                if (this.isSteamPage()) {
                    this.step4_ConfirmTrade();
                } else {
                    console.log('Skipping confirm_trade on CSGORoll page');
                }
                break;
            case 'complete':
                document.querySelector('button[mat-dialog-close]')?.click();
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

    step1_WaitForContinue() {
        const continueButton = this.findButtonByText('Continue');
        if (continueButton) {
            console.log('Found "Continue" button');
            continueButton.click();
            this.currentStep = 'extract_item_data';
            this.logStep('Clicked "Continue" button');
        }
    }

    // Step 2: Item Dialog Extraction with retry logic
    step2_ExtractItemData() {
        console.log('🔍 Step 2: Extracting item data from dialog');

        // Initialize retry tracking if not exists
        if (!this.extractionAttempts) {
            this.extractionAttempts = 0;
            this.maxExtractionAttempts = 5;
            this.extractionDelay = 2000; // 2 seconds between attempts
        }

        this.extractionAttempts++;
        console.log(`📋 Extraction attempt ${this.extractionAttempts}/${this.maxExtractionAttempts}`);

        const modal = document.querySelector('mat-dialog-container');
        if (!modal) {
            console.log('❌ No modal dialog found');
            this.retryExtraction('No modal dialog found');
            return;
        }

        console.log('✅ Modal dialog found, waiting for content to load...');

        // Wait a moment for content to fully load
        setTimeout(() => {
            this.performDataExtraction(modal);
        }, 1000);
    }

    performDataExtraction(modal) {
        console.log('🔍 Performing data extraction...');
        console.log('📋 Modal HTML preview:', modal.outerHTML.substring(0, 500) + '...');

        try {
            // Extract item category
            const categoryElement = modal.querySelector('span[data-test="item-subcategory"]');
            const itemCategory = categoryElement ? categoryElement.textContent.trim() : 'Unknown';
            console.log('📂 Item category:', itemCategory);

            // Extract item name from label title
            const labelElement = modal.querySelector('label[title]');
            const itemName = labelElement ? labelElement.getAttribute('title') : 'Unknown';
            console.log('🏷️ Item name:', itemName);

            // Extract item value
            const valueElement = modal.querySelector('span.currency-value');
            const itemValue = valueElement ? valueElement.textContent.trim() : 'Unknown';
            console.log('💰 Item value:', itemValue);

            // Extract inventory page number
            const pageText = modal.textContent || '';
            const pageMatch = pageText.match(/On page (\d+) of your Steam inventory/i);
            const inventoryPage = pageMatch ? parseInt(pageMatch[1]) : 1;
            console.log('📄 Inventory page:', inventoryPage);

            // Calculate item position in 4x4 grid
            const itemPosition = this.calculateItemPosition(modal);
            console.log('📍 Item position:', itemPosition);

            // Validate extracted data quality
            const extractedData = {
                itemName,
                itemCategory,
                itemValue,
                inventoryPage,
                itemPosition,
                timestamp: new Date().toISOString()
            };

            if (this.validateExtractedData(extractedData, modal)) {
                // Successful extraction
                this.collectedData = extractedData;
                console.log('✅ Successfully extracted complete item data:', this.collectedData);
                this.logStep('Extracted item data', this.collectedData);
                this.currentStep = 'send_items';

                // Reset retry tracking
                this.extractionAttempts = 0;
            } else {
                // Invalid data - retry
                console.log('⚠️ Extracted data is incomplete or invalid');
                this.retryExtraction('Data validation failed');
            }

        } catch (error) {
            console.error('❌ Error extracting item data:', error);
            this.logError(error);
            this.retryExtraction(`Extraction error: ${error.message}`);
        }
    }

    validateExtractedData(data, modal) {
        const issues = [];

        // Check for critical missing data
        if (!data.itemName || data.itemName === 'Unknown' || data.itemName.length < 3) {
            issues.push('Invalid or missing item name');
        }

        if (!data.itemCategory || data.itemCategory === 'Unknown') {
            issues.push('Invalid or missing item category');
        }

        if (!data.itemValue || data.itemValue === 'Unknown') {
            issues.push('Invalid or missing item value');
        }

        if(data.itemPosition < 0){
            console.log('❌ item position fetch failed');
            console.log('Got value: ', data.itemPosition);
            issues.push('Invalid Item Position fetched');
        }

        if (issues.length > 0) {
            console.log('❌ Data validation failed:', issues);
            console.log('📋 Current extracted data:', data);
            return false;
        }

        console.log('✅ Data validation passed');
        return true;
    }

    retryExtraction(reason) {
        if (this.extractionAttempts < this.maxExtractionAttempts) {
            console.log(`🔄 Retrying extraction in ${this.extractionDelay/1000} seconds (Reason: ${reason})`);

            setTimeout(() => {
                this.step2_ExtractItemData();
            }, this.extractionDelay);
        } else {
            console.error('❌ Maximum extraction attempts reached. Extraction failed.');
            this.logStep(`Extraction failed after ${this.maxExtractionAttempts} attempts: ${reason}`);

            // Reset for next time
            this.extractionAttempts = 0;

            // Stay in current step - don't proceed with incomplete data
            console.log('⏸️ Staying in extract_item_data step due to failed extraction');
        }
    }

    calculateItemPosition(modal) {
        try {
            // Look for item grid containers (assuming 4x4 layout)
            const gridItems = document.querySelectorAll('.item');
            console.log("Got grid items: ", gridItems);

            // If we can't find a clear grid structure, return position 1 as default
            if (gridItems.length === 0) return -1;

            // Find the highlighted/selected item
            const selectedItem = modal.querySelector('.item.selected');
            console.log("Selected item, ", selectedItem);

            if (selectedItem) {
                const itemIndex = Array.from(gridItems).indexOf(selectedItem);
                return itemIndex >= 0 ? itemIndex + 1 : 1; // Convert to 1-based index
            }

            return -2; // Default position
        } catch (error) {
            console.error('Error calculating item position:', error);
            return -3;
        }
    }

    step2_SendItems() {
        const sendButton = this.findButtonByText('Send Items Now');
        if (sendButton) {
            console.log('🔍 Found "Send Items Now" button');

            // Check if we have collected data before proceeding
            if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
                console.error('❌ No collected data available - cannot transfer to Steam page');
                this.logStep('Send Items failed: No collected data');
                return;
            }

            console.log('📋 Current collected data before transfer:', this.collectedData);

            // Encode data for URL transfer to Steam domain
            console.log('🔗 Encoding data for cross-domain transfer...');
            const encodedData = this.encodeDataToUrlParams(this.collectedData);

            if (!encodedData) {
                console.error('❌ Failed to encode data for URL transfer');
                this.logStep('Send Items failed: Data encoding failed');
                return;
            }

            console.log('🔗 Button element details:', {
                tagName: sendButton.tagName,
                href: sendButton.href,
                onclick: sendButton.onclick,
                hasHref: !!sendButton.href
            });

            // Check if button has href (is a link)
            if (sendButton.href) {
                console.log('📎 Button is a link - modifying href');
                const originalHref = sendButton.href;
                const separator = originalHref.includes('?') ? '&' : '?';
                const newHref = `${originalHref}${separator}automation_data=${encodedData}`;

                console.log('🔗 Original URL:', originalHref);
                console.log('🔗 Modified URL:', newHref);

                sendButton.href = newHref;
                sendButton.click();
            } else {
                console.log('🚫 Button is not a link - need to intercept Steam URL generation');

                // Store data temporarily for the intercepted navigation
                window.PENDING_AUTOMATION_DATA = encodedData;
                console.log('💾 Stored automation data temporarily');

                // Override window.open to intercept Steam URL
                const originalWindowOpen = window.open;
                window.open = function(url, target, features) {
                    console.log('🌐 Intercepted window.open:', url);

                    if (url && url.includes('steamcommunity.com')) {
                        const separator = url.includes('?') ? '&' : '?';
                        const modifiedUrl = `${url}${separator}automation_data=${window.PENDING_AUTOMATION_DATA}`;
                        console.log('✅ Modified Steam URL:', modifiedUrl);

                        // Clean up temporary data
                        delete window.PENDING_AUTOMATION_DATA;

                        // Restore original window.open
                        window.open = originalWindowOpen;

                        // Open the modified URL
                        return originalWindowOpen.call(this, modifiedUrl, target, features);
                    }

                    // For non-Steam URLs, use original function
                    return originalWindowOpen.call(this, url, target, features);
                };

                // Click the button to trigger the navigation
                sendButton.click();

                // Restore window.open after a short delay if not triggered
                setTimeout(() => {
                    if (window.PENDING_AUTOMATION_DATA) {
                        console.log('⚠️ Timeout - restoring window.open');
                        window.open = originalWindowOpen;
                        delete window.PENDING_AUTOMATION_DATA;
                    }
                }, 5000);
            }

            console.log('✅ Button click initiated with data encoding');
            this.logStep('Data encoded and button clicked - Steam page should receive data');
            this.currentStep = 'waiting_for_steam_completion';
        } else {
            console.log('❌ "Send Items Now" button not found');
        }
    }

    // Step 3: Steam Inventory Navigation
    step3_NavigateInventory() {
        console.log('🚢 Step 3: Steam Inventory Navigation - checking page elements');

        if (!this.isSteamPage()) {
            console.log('❌ Not on Steam page, cannot navigate inventory');
            return;
        }

        // Check if we have collected data
        if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
            console.log('❌ No collected data available for inventory navigation');
            return;
        }

        console.log('📦 Looking for Steam inventory elements...');

        // Wait for new tab/page to load and check if we're on Steam inventory
        const pageControlCur = document.querySelector('#pagecontrol_cur');

        if (pageControlCur) {
            const currentPage = parseInt(pageControlCur.textContent) || 1;
            const targetPage = this.collectedData.inventoryPage || 1;

            console.log(`✅ Steam inventory page detected. Current: ${currentPage}, Target: ${targetPage}`);

            if (currentPage !== targetPage) {
                console.log(`📄 Need to navigate from page ${currentPage} to page ${targetPage}`);
                this.navigateToPage(currentPage, targetPage);
            } else {
                console.log(`✅ Already on correct page ${targetPage}, proceeding to item selection`);
                this.currentStep = 'select_item';
                this.logStep(`Navigated to inventory page ${targetPage}`);
            }
        } else {
            console.log('⏳ Steam inventory page controls not found yet...');

            // Check for other Steam page indicators
            const inventoryArea = document.querySelector('#inventories');
            const tradeOfferPage = document.querySelector('.newmodal');

            if (inventoryArea) {
                console.log('✅ Found inventory area, but no page controls');
                // Assume we're on the right page and proceed
                this.currentStep = 'select_item';
                this.logStep('Found inventory area, proceeding to item selection');
            } else if (tradeOfferPage) {
                console.log('✅ Detected trade offer page, looking for inventory');
                // We might be on a trade offer page, continue waiting
            } else {
                console.log('❓ On Steam domain but specific page type unclear');
                console.log('URL:', window.location.href);
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
        console.log('🎯 Step 3: Selecting target item in Steam inventory');

        if (!this.collectedData || !this.collectedData.itemName) {
            console.log('❌ No item data available for selection');
            return;
        }

        console.log(`🔍 Looking for item: ${this.collectedData.itemName}`);
        console.log(`📍 Target position: ${this.collectedData.itemPosition}`);
        console.log(`📄 Current page URL: ${window.location.href}`);

        // Look for Steam inventory items with multiple selectors
        console.log('🔍 Searching for inventory items...');
        let inventoryItems = document.querySelectorAll('.item');
        console.log(`🎮 CS:GO items found: ${inventoryItems.length}`);

        // Log page structure for debugging
        console.log('🏗️ Page structure analysis:');
        console.log('- Inventory containers:', document.querySelectorAll('[class*="inventory"], [id*="inventory"]').length);
        console.log('- Item containers:', document.querySelectorAll('[class*="item"], [id*="item"]').length);
        console.log('- Trade elements:', document.querySelectorAll('[class*="trade"], [id*="trade"]').length);

        if (inventoryItems.length === 0) {
            console.log('❌ No inventory items found, waiting...');
            return;
        }

        const targetItem = this.findTargetItem(inventoryItems);

        if (targetItem) {
            console.log('✅ Found target item, double-clicking');
            console.log('🎯 Target item details:', {
                element: targetItem,
                title: targetItem.getAttribute('title') || '',
                alt: targetItem.querySelector('img')?.getAttribute('alt') || '',
                className: targetItem.className,
                position: Array.from(inventoryItems).indexOf(targetItem) + 1
            });

            // Scroll item into view first
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Wait a moment for scroll, then double-click
            setTimeout(() => {
                console.log('🖱️ Executing double-click on target item...');
                this.doubleClickElement(targetItem);
                this.logStep('Double-clicked target item');
            }, 500);

            this.currentStep = 'confirm_trade';
        } else {
            console.log('❌ Target item not found on current page');
            console.log(`🎯 Looking for: "${this.collectedData.itemName}" at position ${this.collectedData.itemPosition}`);
            this.logStep('Target item not found on current page');
        }
    }

    findTargetItem(inventoryItems) {
        const targetName = this.collectedData.itemName;
        const targetPage = this.collectedData.inventoryPage;
        const targetPosition = this.collectedData.itemPosition;
        const absoloutePosition = (targetPage - 1) * 16 + targetPosition;
        console.log(this.collectedData);
        console.log(targetName, targetPage, targetPosition, absoloutePosition)

        console.log(`🎯 Searching for target item: "${targetName}" at position ${targetPosition}`);
        console.log(`📊 Total inventory items to search: ${inventoryItems.length}`);

        // Method 1: Try to match by name/title
        // console.log('🔍 Method 1: Searching by name/title...');
        // for (let i = 0; i < inventoryItems.length; i++) {
        //     const item = inventoryItems[i];
        //     const title = item.getAttribute('title') || '';
        //     const alt = item.querySelector('img')?.getAttribute('alt') || '';
        //     const dataname = item.getAttribute('data-name') || '';

        //     if (i < 5) { // Log first 5 items for debugging
        //         console.log(`Item ${i + 1}: title="${title}", alt="${alt}", data-name="${dataname}"`);
        //     }

        //     if (title.includes(targetName) || alt.includes(targetName) || dataname.includes(targetName)) {
        //         console.log(`✅ Found target item by name at position ${i + 1}:`, {
        //             title, alt, dataname, element: item
        //         });
        //         return item;
        //     }
        // }

        // console.log('❌ Target item not found by name, trying position-based search...');

        // Method 2: Try to match by grid position
        console.log(`🔍 Method 2: Searching by position ${targetPosition}...`);
        console.log(absoloutePosition, inventoryItems.length, absoloutePosition <= inventoryItems.length && absoloutePosition > 0)
        if (absoloutePosition <= inventoryItems.length && absoloutePosition > 0) {
            console.log("Target position is valid.");
            const item = inventoryItems[absoloutePosition - 1]; // Convert to 0-based index
            const title = item.getAttribute('title') || '';
            const alt = item.querySelector('img')?.getAttribute('alt') || '';
            console.log(`📍 Found item at position ${targetPosition}, absolute position ${absoloutePosition}:`, {
                title, alt, element: item
            });
            return item;
        }

        console.log('❌ Target item not found by position or name');
        return null;
    }

    doubleClickElement(element) {
        console.log('🖱️ Starting double-click sequence...');

        // Create more comprehensive mouse events
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const mouseEventOptions = {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            button: 0,
            buttons: 1
        };

        // Try multiple event approaches for maximum compatibility
        try {
            // Method 1: Traditional double-click event
            const dblClickEvent = new MouseEvent('dblclick', mouseEventOptions);
            element.dispatchEvent(dblClickEvent);
            console.log('✅ Dispatched dblclick event');

            // Method 2: Two click events with proper timing
            setTimeout(() => {
                const clickEvent1 = new MouseEvent('click', mouseEventOptions);
                element.dispatchEvent(clickEvent1);
                console.log('✅ Dispatched first click event');

                setTimeout(() => {
                    const clickEvent2 = new MouseEvent('click', mouseEventOptions);
                    element.dispatchEvent(clickEvent2);
                    console.log('✅ Dispatched second click event');
                }, 50);
            }, 100);

            // Method 3: Direct click() if it's available
            if (typeof element.click === 'function') {
                setTimeout(() => {
                    element.click();
                    console.log('✅ Called element.click()');
                }, 200);
            }
        } catch (error) {
            console.error('❌ Error during double-click:', error);
        }
    }

    // Step 4: Trade Confirmation — entry point called by executeCurrentStep every 2000ms
    step4_ConfirmTrade() {
        console.log('[step4_ConfirmTrade] called, isSteamPage:', this.isSteamPage(), '_tradeConfirmInProgress:', this._tradeConfirmInProgress);

        if (!this.isSteamPage()) {
            console.log('[step4_ConfirmTrade] Not on Steam page — skipping');
            return;
        }

        if (this._tradeConfirmInProgress) {
            console.log('[step4_ConfirmTrade] Trade confirm already in progress — skipping duplicate call');
            return;
        }

        this._tradeConfirmInProgress = true;
        console.log('[step4_ConfirmTrade] Starting sequential trade confirmation chain');
        this._startSequentialTradeConfirm();
    }

    // Launches the sequential step chain: 4a → 4b → 4c → 4d
    _startSequentialTradeConfirm() {
        // Step 4a: wait for ready-status element, then step 4b
        this._waitForAndClick('#you_notready', 'step-4a (#you_notready)', 2000, () => {
            // Step 4b: wait for green confirm button, then step 4c
            this._waitForAndClick('.btn_green_steamui.btn_medium', 'step-4b (.btn_green_steamui.btn_medium)', 1500, () => {
                // Step 4c: wait for Make Offer button, then step 4d
                this._waitForAndClick('#trade_confirmbtn', 'step-4c (#trade_confirmbtn)', 1000, () => {
                    // Step 4d: wait for OK span — use ID 'trade_area_error' as fallback, but span text is primary
                    this._waitForAndClickOkSpan('step-4d (OK span)', 500, () => {
                        console.log('[trade-confirm] All 4 steps complete — marking currentStep = complete');
                        this._tradeConfirmInProgress = false;
                        this.currentStep = 'complete';
                    });
                });
            });
        });
    }

    // Generic sequential step: poll for selector, store interval handle, click on find, call onComplete
    _waitForAndClick(selector, label, clickDelay, onComplete) {
        const maxAttempts = 30; // 30 × 300ms = 9 seconds max
        let attempts = 0;

        console.log(`[_waitForAndClick] Waiting for ${label} (max ${maxAttempts} attempts @ 300ms)`);

        const intervalId = setInterval(() => {
            attempts++;
            const el = document.querySelector(selector);
            console.log(`[_waitForAndClick] attempt ${attempts}/${maxAttempts} — selector "${selector}" found:`, !!el);

            if (el) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.log(`[_waitForAndClick] Found ${label} — clicking after ${clickDelay}ms delay`);
                const clickTimerId = setTimeout(() => {
                    el.click();
                    this.logStep(`Clicked ${label}`, el);
                    console.log(`[_waitForAndClick] Clicked ${label} — invoking onComplete`);
                    onComplete();
                }, clickDelay);
                this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.warn(`[_waitForAndClick] Timed out waiting for ${label} after ${attempts} attempts — trade chain halted`);
                this._tradeConfirmInProgress = false;
            }
        }, 300);

        this.stepTimeouts.set(intervalId, intervalId);
    }

    // Step 4d: find a <span> with exact text "OK" and click it (or its parent)
    _waitForAndClickOkSpan(label, clickDelay, onComplete) {
        const maxAttempts = 30;
        let attempts = 0;

        console.log(`[_waitForAndClickOkSpan] Waiting for ${label}`);

        const intervalId = setInterval(() => {
            attempts++;
            const okSpan = Array.from(document.querySelectorAll('span'))
                .find(el => el.textContent.trim() === 'OK');
            console.log(`[_waitForAndClickOkSpan] attempt ${attempts}/${maxAttempts} — OK span found:`, !!okSpan);

            if (okSpan) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.log(`[_waitForAndClickOkSpan] Found OK span — clicking after ${clickDelay}ms delay`);
                const clickTimerId = setTimeout(() => {
                    okSpan.click();
                    if (okSpan.parentElement) {
                        okSpan.parentElement.click();
                        console.log('[_waitForAndClickOkSpan] Also clicked parent of OK span');
                    }
                    this.logStep(`Clicked ${label}`, okSpan);
                    console.log(`[_waitForAndClickOkSpan] Clicked ${label} — invoking onComplete`);
                    onComplete();
                }, clickDelay);
                this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                this.stepTimeouts.delete(intervalId);
                console.warn(`[_waitForAndClickOkSpan] Timed out waiting for ${label} — trade chain halted`);
                this._tradeConfirmInProgress = false;
            }
        }, 300);

        this.stepTimeouts.set(intervalId, intervalId);
    }

    checkForTradeErrors() {
        // Check for common error messages
        const errorIndicators = [
            'error occurred',
            'something went wrong',
            'trade offer failed',
            'unable to send',
            'try again',
            'session expired'
        ];

        const pageText = document.body.textContent.toLowerCase();

        for (let error of errorIndicators) {
            if (pageText.includes(error)) {
                console.log(`⚠️ Trade error detected: ${error}`);
                this.logStep(`Trade error: ${error}`);

                // Optionally retry or mark as failed
                this.handleTradeError(error);
                return true;
            }
        }

        return false;
    }

    handleTradeError(errorType) {
        console.log(`❌ Handling trade error: ${errorType}`);

        // For now, mark as complete with error status
        // Could be enhanced to retry logic in the future
        this.currentStep = 'complete';
        this.logStep(`Trade failed with error: ${errorType}`);
    }

    checkSteamCompletion() {
        // Check if the Steam tab has completed the automation
        // Note: Since we no longer use localStorage, this method assumes completion
        console.log('Steam automation completion check - assuming completed (no localStorage)');
        this.currentStep = 'complete';
    }

    completeVerification() {
        this.logTradeCompletion();
        this.resetForNextTrade();
        console.log('Trade verification completed successfully');

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
        console.log(`[clearAllTimeouts] Cancelling ${this.stepTimeouts.size} tracked timers/intervals`);
        this.stepTimeouts.forEach((id) => {
            clearInterval(id);
            clearTimeout(id); // safe to call both — no-op if wrong type
        });
        this.stepTimeouts.clear();
        this._tradeConfirmInProgress = false; // reset re-entry guard
        this._monitoringActive = false;       // reset monitoring guard
    }

    resetForNextTrade() {
        this.stop();
        this.start();
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