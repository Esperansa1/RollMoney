var RollMoney = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils/dom-utils.js
  var DOMUtils;
  var init_dom_utils = __esm({
    "src/utils/dom-utils.js"() {
      DOMUtils = class {
        static createElement(tag, styles = {}, attributes = {}) {
          const element = document.createElement(tag);
          Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
          });
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
          });
          return element;
        }
        static safeQuerySelector(parent, selector) {
          const element = parent.querySelector(selector);
          return element ? element.textContent.trim() : "N/A";
        }
        static findElementByText(elements, text, caseSensitive = false) {
          return Array.from(elements).find((element) => {
            const elementText = element.textContent.trim();
            return caseSensitive ? elementText === text : elementText.toLowerCase() === text.toLowerCase();
          });
        }
        static dispatchClickEvent(element, coordinates = null) {
          const clickEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
            ...coordinates && { clientX: coordinates.x, clientY: coordinates.y }
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
          element.style.position = "fixed";
          element.style.top = `${centerY}px`;
          element.style.left = `${centerX}px`;
          element.style.right = "auto";
          element.style.transform = "none";
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
      };
    }
  });

  // src/components/ui-components.js
  var UIComponents;
  var init_ui_components = __esm({
    "src/components/ui-components.js"() {
      init_dom_utils();
      UIComponents = class {
        static createOverlay() {
          return DOMUtils.createElement("div", {
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "white",
            border: "2px solid #333",
            borderRadius: "10px",
            padding: "15px",
            zIndex: "10000",
            width: "350px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            cursor: "move"
          }, {
            id: "market-scraper-overlay"
          });
        }
        static createDragHandle(overlay, callbacks = {}) {
          const dragHandle = DOMUtils.createElement("div", {
            backgroundColor: "#f1f1f1",
            color: "#333",
            padding: "5px",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            margin: "-15px -15px 15px -15px",
            textAlign: "center",
            fontWeight: "bold",
            userSelect: "none"
          });
          dragHandle.textContent = "Market Scraper";
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
            marginRight: "10px",
            padding: "5px 10px",
            cursor: "pointer"
          };
          const button = DOMUtils.createElement(
            "button",
            { ...defaultStyles, ...styles }
          );
          button.textContent = text;
          if (onClick) {
            button.addEventListener("click", onClick);
          }
          return button;
        }
        static createTextarea(styles = {}, attributes = {}) {
          const defaultStyles = {
            width: "100%",
            marginBottom: "10px",
            resize: "vertical"
          };
          return DOMUtils.createElement(
            "textarea",
            { ...defaultStyles, ...styles },
            attributes
          );
        }
        static createLabel(text, styles = {}) {
          const defaultStyles = {
            display: "block",
            marginBottom: "10px"
          };
          const label = DOMUtils.createElement(
            "label",
            { ...defaultStyles, ...styles }
          );
          label.textContent = text;
          return label;
        }
        static createInput(type = "text", styles = {}, attributes = {}) {
          return DOMUtils.createElement("input", styles, {
            type,
            ...attributes
          });
        }
        static createJsonConfigSection(onLoad) {
          const label = this.createLabel("Custom Filter JSON:");
          const textarea = this.createTextarea(
            { height: "150px" },
            {
              id: "custom-filter-json",
              placeholder: `Enter JSON like:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`
            }
          );
          const loadButton = this.createButton("Load Filter", {}, () => {
            try {
              const jsonInput = textarea.value.trim();
              const config = jsonInput ? JSON.parse(jsonInput) : [];
              if (onLoad) onLoad(config);
              alert("Filter configuration loaded!");
            } catch (error) {
              alert("Invalid JSON: " + error.message);
            }
          });
          return { label, textarea, loadButton };
        }
        static createResultsArea() {
          return this.createTextarea(
            { height: "200px" },
            { id: "market-scraper-results" }
          );
        }
        static createControlButtons(callbacks = {}) {
          const scrapeButton = this.createButton("Scrape Items", {}, callbacks.onScrape);
          const copyButton = this.createButton("Copy Results", {}, callbacks.onCopy);
          const clearButton = this.createButton("Clear Processed", {}, callbacks.onClear);
          const closeButton = this.createButton("Close", { float: "right" }, callbacks.onClose);
          return { scrapeButton, copyButton, clearButton, closeButton };
        }
        static createAutoWithdrawButtons(callbacks = {}) {
          const startButton = this.createButton("Start Auto-Withdraw", {}, callbacks.onStart);
          const stopButton = this.createButton("Stop Auto-Withdraw", {}, callbacks.onStop);
          return { startButton, stopButton };
        }
        static createTestRefreshButton(onTest) {
          return this.createButton("Test Refresh", {
            backgroundColor: "#ffcc00",
            fontWeight: "bold"
          }, onTest);
        }
        static createAutoClearControls() {
          const input = this.createInput("number", {
            width: "50px",
            marginRight: "5px"
          }, {
            min: "1",
            max: "60",
            value: "5"
          });
          const label = this.createLabel("Auto-clear (seconds):", {
            fontSize: "12px"
          });
          const container = DOMUtils.createElement("div", {
            marginTop: "10px"
          });
          container.appendChild(label);
          container.appendChild(input);
          return container;
        }
      };
    }
  });

  // src/scrapers/data-scraper.js
  var DataScraper;
  var init_data_scraper = __esm({
    "src/scrapers/data-scraper.js"() {
      init_dom_utils();
      DataScraper = class {
        constructor() {
          this.processedItems = /* @__PURE__ */ new Set();
        }
        scrapeMarketItems() {
          const itemCards = document.querySelectorAll(".item-card");
          const scrapedItems = [];
          itemCards.forEach((card, index) => {
            try {
              const item = this.extractItemData(card, index);
              console.log("Extracted Item:", item);
              scrapedItems.push(item);
            } catch (error) {
              console.error("Error processing item card:", error);
            }
          });
          return scrapedItems;
        }
        extractItemData(card, index) {
          const itemData = {
            index: index + 1,
            subcategory: this.safeExtract(card, 'span[data-test="item-subcategory"]'),
            name: this.safeExtract(card, 'label[data-test="item-name"]'),
            price: this.safeExtract(card, 'span[data-test="value"]'),
            percentageChange: this.extractPercentageChange(card),
            condition: this.extractCondition(card),
            hasCheckedIcon: !!card.querySelector('span[inlinesvg="assets/icons/checked.svg"]')
          };
          console.log(itemData);
          return itemData;
        }
        safeExtract(card, selector) {
          return DOMUtils.safeQuerySelector(card, selector);
        }
        extractPercentageChange(card) {
          const percentageSpan = card.querySelector("span.lh-16.fw-600.fs-10.ng-star-inserted");
          if (!percentageSpan) return "0%";
          const text = percentageSpan.textContent.trim();
          const percentageMatch = text.match(/^[+-]\d+\.?\d*%/);
          return percentageMatch ? percentageMatch[0] : "0%";
        }
        extractCondition(card) {
          const conditionSelectors = [
            "span.fn.ng-star-inserted",
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
          return "N/A";
        }
        findItemCardByName(itemName) {
          return Array.from(document.querySelectorAll(".item-card")).find((card) => {
            const nameElement = card.querySelector('label[data-test="item-name"]');
            return nameElement && nameElement.textContent.trim() === itemName;
          });
        }
        addProcessedItem(itemName) {
          this.processedItems.add(itemName);
        }
        isItemProcessed(itemName) {
          return this.processedItems.has(itemName);
        }
        clearProcessedItems() {
          const count = this.processedItems.size;
          this.processedItems.clear();
          return count;
        }
        getProcessedItemsCount() {
          return this.processedItems.size;
        }
        getNewItems(items) {
          return items.filter((item) => !this.processedItems.has(item.name));
        }
      };
    }
  });

  // src/filters/item-filter.js
  var ItemFilter;
  var init_item_filter = __esm({
    "src/filters/item-filter.js"() {
      ItemFilter = class {
        constructor() {
          this.customFilterConfig = [];
          this.baseFilters = {
            validConditions: ["FT", "MW", "FN"],
            maxPercentageChange: 5.1,
            excludeStatTrak: true
          };
        }
        setCustomFilterConfig(config) {
          this.customFilterConfig = Array.isArray(config) ? config : [];
        }
        getCustomFilterConfig() {
          return this.customFilterConfig;
        }
        updateBaseFilters(filters) {
          this.baseFilters = { ...this.baseFilters, ...filters };
        }
        filterItems(items) {
          return items.filter((item) => {
            const baseFilterPassed = this.passesBaseFilter(item);
            console.log("Base filter passed:", baseFilterPassed);
            if (this.customFilterConfig.length === 0) {
              return baseFilterPassed;
            }
            const customFilterPassed = this.passesCustomFilter(item);
            console.log("Custom filter passed:", customFilterPassed);
            return baseFilterPassed && customFilterPassed;
          });
        }
        passesBaseFilter(item) {
          const conditionCheck = this.baseFilters.validConditions.includes(item.condition);
          const statTrakCheck = this.baseFilters.excludeStatTrak ? !item.subcategory.includes("StatTrak") : true;
          const percentageCheck = this.parsePercentage(item.percentageChange) <= this.baseFilters.maxPercentageChange;
          return conditionCheck && statTrakCheck && percentageCheck;
        }
        passesCustomFilter(item) {
          if (this.customFilterConfig.length === 0) {
            return true;
          }
          return this.customFilterConfig.some((filter) => {
            const skinMatch = this.matchesFilterAttribute(item.subcategory, filter.skin);
            const typeMatch = this.matchesFilterAttribute(item.name, filter.type);
            return skinMatch && typeMatch;
          });
        }
        matchesFilterAttribute(itemValue, filterValue) {
          if (!filterValue) return true;
          if (Array.isArray(filterValue)) {
            return filterValue.some((value) => itemValue.includes(value));
          }
          return itemValue.includes(filterValue);
        }
        parsePercentage(percentageStr) {
          const cleanedStr = percentageStr.replace("%", "");
          const parsedFloat = parseFloat(cleanedStr);
          return Math.abs(parsedFloat);
        }
        validateFilterConfig(config) {
          try {
            if (!Array.isArray(config)) {
              throw new Error("Filter configuration must be an array");
            }
            for (let i = 0; i < config.length; i++) {
              const filter = config[i];
              if (typeof filter !== "object" || filter === null) {
                throw new Error(`Filter at index ${i} must be an object`);
              }
              if (filter.skin && typeof filter.skin !== "string" && !Array.isArray(filter.skin)) {
                throw new Error(`Filter at index ${i}: skin must be a string or array`);
              }
              if (filter.type && typeof filter.type !== "string" && !Array.isArray(filter.type)) {
                throw new Error(`Filter at index ${i}: type must be a string or array`);
              }
            }
            return { valid: true };
          } catch (error) {
            return { valid: false, error: error.message };
          }
        }
      };
    }
  });

  // src/automation/withdrawal-automation.js
  var WithdrawalAutomation;
  var init_withdrawal_automation = __esm({
    "src/automation/withdrawal-automation.js"() {
      init_dom_utils();
      WithdrawalAutomation = class {
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
              console.log("Filtered items:", filteredItems);
              if (filteredItems.length > 0) {
                this.autoWithdrawItems(filteredItems);
              }
            } catch (error) {
              console.error("Error during periodic scan:", error);
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
            document.querySelectorAll("button"),
            "withdraw"
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
          const pageText = document.body.innerText || "";
          const notJoinableError = pageText.toLowerCase().includes("this trade is not joinable");
          const refreshButton = document.querySelector('button[data-test="category-list-item"] img[src*="Knives.svg"]')?.closest("button");
          const maxButton = DOMUtils.findElementByText(document.querySelectorAll("button"), "Max");
          if (notJoinableError && refreshButton && retryCount < this.maxWithdrawRetries) {
            this.retryWithdrawal(item, index, retryCount, processItem, refreshButton);
          } else if (!notJoinableError && !withdrawButton.disabled) {
            this.closePopupAndContinue(maxButton, processedCount, index, processItem);
          } else {
            processItem(index + 1, 0);
          }
        }
        closePopupAndContinue(maxButton, processedCount, index, processItem) {
          const safeArea = document.querySelector(".header") || document.body;
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
          closeButtons.forEach((btn) => btn.click());
          processItem(index + 1, retryCount);
        }
        clickMaxButton() {
          const maxButton = document.querySelector('button[class*="mat-flat-button"][class*="text-capitalize"]');
          if (maxButton && maxButton.textContent.trim().includes("Max")) {
            console.log("Found Max button using alternative selector, clicking...");
            maxButton.click();
            return true;
          }
          return false;
        }
        testRefreshButtonFunctionality() {
          const refreshButton = document.querySelector('button[data-test="category-list-item"] img[src*="Knives.svg"]')?.closest("button");
          if (refreshButton) {
            refreshButton.click();
            setTimeout(() => {
              refreshButton.click();
              console.log("Refresh button test completed");
            }, 1e3);
          } else {
            console.log("Refresh button not found during test");
          }
        }
        startAutoClear(seconds) {
          if (this.autoClearInterval) {
            clearInterval(this.autoClearInterval);
          }
          const interval = seconds * 1e3;
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
      };
    }
  });

  // src/market-scraper.js
  var MarketItemScraper;
  var init_market_scraper = __esm({
    "src/market-scraper.js"() {
      init_dom_utils();
      init_ui_components();
      init_data_scraper();
      init_item_filter();
      init_withdrawal_automation();
      MarketItemScraper = class {
        constructor() {
          this.isScraperActive = false;
          this.dataScraper = new DataScraper();
          this.itemFilter = new ItemFilter();
          this.automation = new WithdrawalAutomation(this.dataScraper, this.itemFilter);
          this.overlay = null;
          this.resultsArea = null;
          this.initializeKeyboardShortcut();
        }
        initializeKeyboardShortcut() {
          document.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.shiftKey && event.code === "KeyS") {
              this.toggleScraper();
            }
          });
        }
        toggleScraper() {
          this.isScraperActive = !this.isScraperActive;
          if (this.isScraperActive) {
            this.createScraperOverlay();
          } else {
            this.closeOverlay();
          }
        }
        createScraperOverlay() {
          if (document.getElementById("market-scraper-overlay")) {
            return;
          }
          this.overlay = UIComponents.createOverlay();
          this.setupOverlayComponents();
          document.body.appendChild(this.overlay);
          DOMUtils.centerElementOnScreen(this.overlay);
        }
        setupOverlayComponents() {
          const dragHandle = UIComponents.createDragHandle(this.overlay, {
            onDragEnd: (x, y) => {
              console.log("Drag ended at:", x, y);
            },
            onPositionSave: (x, y) => {
              localStorage.setItem("scraperOverlayX", x);
              localStorage.setItem("scraperOverlayY", y);
            }
          });
          const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            this.itemFilter.setCustomFilterConfig(config);
          });
          this.resultsArea = UIComponents.createResultsArea();
          const controlButtons = UIComponents.createControlButtons({
            onScrape: () => this.handleScrapeItems(),
            onCopy: () => this.handleCopyResults(),
            onClear: () => this.handleClearProcessed(),
            onClose: () => this.closeOverlay()
          });
          const autoWithdrawButtons = UIComponents.createAutoWithdrawButtons({
            onStart: () => this.handleStartAutoWithdraw(),
            onStop: () => this.handleStopAutoWithdraw()
          });
          const testButton = UIComponents.createTestRefreshButton(() => {
            this.automation.testRefreshButtonFunctionality();
          });
          const autoClearControls = UIComponents.createAutoClearControls();
          this.appendComponentsToOverlay({
            dragHandle,
            jsonConfig,
            controlButtons,
            autoWithdrawButtons,
            testButton,
            autoClearControls
          });
        }
        appendComponentsToOverlay({ dragHandle, jsonConfig, controlButtons, autoWithdrawButtons, testButton, autoClearControls }) {
          this.overlay.insertBefore(dragHandle, this.overlay.firstChild);
          [
            jsonConfig.label,
            jsonConfig.textarea,
            jsonConfig.loadButton,
            this.resultsArea,
            controlButtons.scrapeButton,
            controlButtons.copyButton,
            controlButtons.clearButton,
            controlButtons.closeButton,
            document.createElement("br"),
            autoWithdrawButtons.startButton,
            autoWithdrawButtons.stopButton,
            testButton,
            autoClearControls
          ].forEach((component) => {
            this.overlay.appendChild(component);
          });
        }
        handleScrapeItems() {
          const scrapedItems = this.dataScraper.scrapeMarketItems();
          const filteredItems = this.itemFilter.filterItems(scrapedItems);
          this.resultsArea.value = JSON.stringify(filteredItems, null, 2);
        }
        handleCopyResults() {
          this.resultsArea.select();
          document.execCommand("copy");
          alert("Results copied to clipboard!");
        }
        handleClearProcessed() {
          const count = this.dataScraper.clearProcessedItems();
          console.log(`Cleared ${count} processed items`);
        }
        handleStartAutoWithdraw() {
          console.log("Starting periodic scan");
          const autoClearInput = this.overlay.querySelector('input[type="number"]');
          const seconds = parseInt(autoClearInput?.value) || 5;
          this.automation.startPeriodicScan();
          this.automation.startAutoClear(seconds);
        }
        handleStopAutoWithdraw() {
          this.automation.stopPeriodicScan();
        }
        closeOverlay() {
          DOMUtils.removeElementById("market-scraper-overlay");
          this.overlay = null;
          this.resultsArea = null;
          this.isScraperActive = false;
        }
        centerOverlay() {
          if (this.overlay) {
            DOMUtils.centerElementOnScreen(this.overlay);
            if (this.overlay.querySelector(".drag-handle")) {
              const dragHandle = this.overlay.querySelector(".drag-handle");
              if (dragHandle.xOffset !== void 0) {
                dragHandle.xOffset = 0;
                dragHandle.yOffset = 0;
              }
            }
            localStorage.removeItem("scraperOverlayX");
            localStorage.removeItem("scraperOverlayY");
          }
        }
        getFilterConfig() {
          return this.itemFilter.getCustomFilterConfig();
        }
        updateFilterConfig(config) {
          const validation = this.itemFilter.validateFilterConfig(config);
          if (validation.valid) {
            this.itemFilter.setCustomFilterConfig(config);
            return { success: true };
          } else {
            return { success: false, error: validation.error };
          }
        }
        getProcessedItemsCount() {
          return this.dataScraper.getProcessedItemsCount();
        }
        isAutomationRunning() {
          return this.automation.isAutomationRunning();
        }
      };
    }
  });

  // index.js
  var require_index = __commonJS({
    "index.js"() {
      init_market_scraper();
      (function() {
        "use strict";
        console.log(`
__       __   ______   __    __  ________  __      __        __       __   ______   __    __  ________  _______
|       /   /       |    |  |        |      /        |       /   /       |    /  |        |       | $$   /  $$|  $$$$$$| $$ | $$| $$$$$$$$ $$  /  $$      | $$   /  $$|  $$$$$$| $$ /  $$| $$$$$$$$| $$$$$$$| $$$ /  $$$| $$  | $$| $$$| $$| $$__      $$/  $$       | $$$ /  $$$| $$__| $$| $$/  $$ | $$__    | $$__| $$
| $$$$  $$$$| $$  | $$| $$$$ $$| $$        $$  $$        | $$$$  $$$$| $$    $$| $$  $$  | $$     | $$    $$
| $$$$ $$ $$| $$  | $$| $$$$ $$| $$$$$       $$$$         | $$$$ $$ $$| $$$$$$$$| $$$$$  | $$$$$   | $$$$$$$| $$ $$$| $$| $$__/ $$| $$ $$$$| $$_____     | $$          | $$ $$$| $$| $$  | $$| $$ $$ | $$_____ | $$  | $$
| $$  $ | $$ $$    $$| $$  $$$| $$         | $$          | $$  $ | $$| $$  | $$| $$  $$| $$     | $$  | $$
 $$      $$  $$$$$$  $$   $$ $$$$$$$$     $$           $$      $$ $$   $$ $$   $$ $$$$$$$$ $$   $$
`);
        window.MarketItemScraper = new MarketItemScraper();
      })();
    }
  });
  return require_index();
})();
