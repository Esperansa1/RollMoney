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
          this.applyStyles(element, styles);
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
          });
          return element;
        }
        static applyStyles(element, styles) {
          Object.entries(styles).forEach(([key, value]) => {
            if (key === "hover" && typeof value === "object") {
              this.addHoverEffect(element, value);
            } else if (key === "focus" && typeof value === "object") {
              this.addFocusEffect(element, value);
            } else {
              element.style[key] = value;
            }
          });
        }
        static addHoverEffect(element, hoverStyles) {
          const originalStyles = {};
          element.addEventListener("mouseenter", () => {
            Object.entries(hoverStyles).forEach(([key, value]) => {
              originalStyles[key] = element.style[key];
              element.style[key] = value;
            });
          });
          element.addEventListener("mouseleave", () => {
            Object.entries(originalStyles).forEach(([key, value]) => {
              element.style[key] = value;
            });
          });
        }
        static addFocusEffect(element, focusStyles) {
          const originalStyles = {};
          element.addEventListener("focus", () => {
            Object.entries(focusStyles).forEach(([key, value]) => {
              originalStyles[key] = element.style[key];
              element.style[key] = value;
            });
          });
          element.addEventListener("blur", () => {
            Object.entries(originalStyles).forEach(([key, value]) => {
              element.style[key] = value;
            });
          });
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

  // src/theme/theme.js
  var Theme, getButtonStyles, getInputStyles, getOverlayStyles;
  var init_theme = __esm({
    "src/theme/theme.js"() {
      Theme = {
        colors: {
          primary: "#ff0000",
          secondary: "#ffffff",
          background: "#f8f9fa",
          surface: "#ffffff",
          surfaceVariant: "#f1f3f4",
          onPrimary: "#ffffff",
          onSecondary: "#000000",
          onBackground: "#1a1a1a",
          onSurface: "#1a1a1a",
          border: "#e0e0e0",
          shadow: "rgba(0, 0, 0, 0.1)",
          hover: "#f5f5f5",
          success: "#28a745",
          warning: "#ffc107",
          error: "#dc3545",
          info: "#17a2b8"
        },
        spacing: {
          xs: "4px",
          sm: "8px",
          md: "16px",
          lg: "24px",
          xl: "32px",
          xxl: "48px"
        },
        borderRadius: {
          sm: "4px",
          md: "8px",
          lg: "12px",
          xl: "16px",
          round: "50%"
        },
        shadows: {
          sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
          md: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
          lg: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
          xl: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)"
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: {
            xs: "12px",
            sm: "14px",
            base: "16px",
            lg: "18px",
            xl: "20px",
            xxl: "24px"
          },
          fontWeight: {
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700"
          },
          lineHeight: {
            tight: "1.25",
            normal: "1.5",
            relaxed: "1.75"
          }
        },
        animation: {
          duration: {
            fast: "150ms",
            normal: "250ms",
            slow: "400ms"
          },
          easing: {
            ease: "ease",
            easeIn: "ease-in",
            easeOut: "ease-out",
            easeInOut: "ease-in-out"
          }
        },
        zIndex: {
          dropdown: 1e3,
          modal: 2e3,
          overlay: 1e4,
          tooltip: 2e4
        }
      };
      getButtonStyles = (variant = "primary", size = "md") => {
        const baseStyles = {
          fontFamily: Theme.typography.fontFamily,
          fontSize: Theme.typography.fontSize.sm,
          fontWeight: Theme.typography.fontWeight.medium,
          lineHeight: Theme.typography.lineHeight.normal,
          borderRadius: Theme.borderRadius.md,
          border: "none",
          cursor: "pointer",
          transition: `all ${Theme.animation.duration.normal} ${Theme.animation.easing.easeInOut}`,
          outline: "none",
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          whiteSpace: "nowrap"
        };
        const sizeStyles = {
          sm: {
            padding: `${Theme.spacing.xs} ${Theme.spacing.sm}`,
            fontSize: Theme.typography.fontSize.xs
          },
          md: {
            padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
            fontSize: Theme.typography.fontSize.sm
          },
          lg: {
            padding: `${Theme.spacing.md} ${Theme.spacing.lg}`,
            fontSize: Theme.typography.fontSize.base
          }
        };
        const variantStyles = {
          primary: {
            backgroundColor: Theme.colors.primary,
            color: Theme.colors.onPrimary,
            boxShadow: Theme.shadows.sm
          },
          secondary: {
            backgroundColor: Theme.colors.secondary,
            color: Theme.colors.onSecondary,
            border: `1px solid ${Theme.colors.border}`,
            boxShadow: Theme.shadows.sm
          },
          success: {
            backgroundColor: Theme.colors.success,
            color: Theme.colors.onPrimary
          },
          warning: {
            backgroundColor: Theme.colors.warning,
            color: Theme.colors.onSecondary
          },
          error: {
            backgroundColor: Theme.colors.error,
            color: Theme.colors.onPrimary
          }
        };
        return {
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant]
        };
      };
      getInputStyles = () => ({
        fontFamily: Theme.typography.fontFamily,
        fontSize: Theme.typography.fontSize.sm,
        lineHeight: Theme.typography.lineHeight.normal,
        padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
        border: `1px solid ${Theme.colors.border}`,
        borderRadius: Theme.borderRadius.md,
        backgroundColor: Theme.colors.surface,
        color: Theme.colors.onSurface,
        outline: "none",
        transition: `border-color ${Theme.animation.duration.normal} ${Theme.animation.easing.easeInOut}`,
        width: "100%",
        boxSizing: "border-box"
      });
      getOverlayStyles = () => ({
        position: "fixed",
        backgroundColor: Theme.colors.surface,
        border: `2px solid ${Theme.colors.primary}`,
        borderRadius: Theme.borderRadius.xl,
        padding: Theme.spacing.lg,
        zIndex: Theme.zIndex.overlay,
        boxShadow: Theme.shadows.xl,
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.onSurface,
        minWidth: "350px",
        maxWidth: "500px"
      });
    }
  });

  // src/components/ui-components.js
  var UIComponents;
  var init_ui_components = __esm({
    "src/components/ui-components.js"() {
      init_dom_utils();
      init_theme();
      UIComponents = class {
        static createOverlay() {
          return DOMUtils.createElement("div", {
            ...getOverlayStyles(),
            top: "20px",
            right: "20px",
            cursor: "move"
          }, {
            id: "market-scraper-overlay"
          });
        }
        static createDragHandle(overlay, callbacks = {}) {
          const dragHandle = DOMUtils.createElement("div", {
            backgroundColor: Theme.colors.primary,
            color: Theme.colors.onPrimary,
            padding: Theme.spacing.md,
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            margin: `-${Theme.spacing.lg} -${Theme.spacing.lg} ${Theme.spacing.lg} -${Theme.spacing.lg}`,
            textAlign: "center",
            fontWeight: Theme.typography.fontWeight.bold,
            fontSize: Theme.typography.fontSize.base,
            fontFamily: Theme.typography.fontFamily,
            userSelect: "none",
            cursor: "grab",
            boxShadow: Theme.shadows.sm,
            hover: {
              backgroundColor: "#cc0000",
              cursor: "grabbing"
            }
          });
          dragHandle.textContent = "\u{1F525} Money Maker";
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
        static createButton(text, variant = "primary", size = "md", onClick = null) {
          const buttonStyles = {
            ...getButtonStyles(variant, size),
            marginRight: Theme.spacing.sm,
            hover: {
              transform: "translateY(-1px)",
              boxShadow: Theme.shadows.md,
              backgroundColor: variant === "primary" ? "#cc0000" : Theme.colors.hover
            }
          };
          const button = DOMUtils.createElement("button", buttonStyles);
          button.textContent = text;
          if (onClick) {
            button.addEventListener("click", onClick);
          }
          return button;
        }
        static createTextarea(styles = {}, attributes = {}) {
          const textareaStyles = {
            ...getInputStyles(),
            marginBottom: Theme.spacing.md,
            resize: "vertical",
            minHeight: "100px",
            focus: {
              borderColor: Theme.colors.primary,
              boxShadow: `0 0 0 2px ${Theme.colors.primary}20`
            },
            ...styles
          };
          return DOMUtils.createElement("textarea", textareaStyles, attributes);
        }
        static createLabel(text, styles = {}) {
          const labelStyles = {
            display: "block",
            marginBottom: Theme.spacing.sm,
            fontFamily: Theme.typography.fontFamily,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            color: Theme.colors.onSurface,
            ...styles
          };
          const label = DOMUtils.createElement("label", labelStyles);
          label.textContent = text;
          return label;
        }
        static createInput(type = "text", styles = {}, attributes = {}) {
          const inputStyles = {
            ...getInputStyles(),
            focus: {
              borderColor: Theme.colors.primary,
              boxShadow: `0 0 0 2px ${Theme.colors.primary}20`
            },
            ...styles
          };
          return DOMUtils.createElement("input", inputStyles, {
            type,
            ...attributes
          });
        }
        static createJsonConfigSection(onLoad) {
          const label = this.createLabel("\u{1F3AF} Custom Filter Configuration");
          const textarea = this.createTextarea(
            { height: "150px" },
            {
              id: "custom-filter-json",
              placeholder: `Enter JSON configuration:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`
            }
          );
          const loadButton = this.createButton("\u{1F504} Load Filter", "primary", "sm", () => {
            try {
              const jsonInput = textarea.value.trim();
              const config = jsonInput ? JSON.parse(jsonInput) : [];
              if (onLoad) onLoad(config);
              this.showNotification("\u2705 Filter configuration loaded!", "success");
            } catch (error) {
              this.showNotification("\u274C Invalid JSON: " + error.message, "error");
            }
          });
          return { label, textarea, loadButton };
        }
        static createResultsArea() {
          const label = this.createLabel("\u{1F4CA} Scraping Results");
          const textarea = this.createTextarea(
            { height: "200px" },
            {
              id: "market-scraper-results",
              placeholder: "Results will appear here after scraping..."
            }
          );
          return { label, textarea };
        }
        static createControlButtons(callbacks = {}) {
          const scrapeButton = this.createButton("\u{1F50D} Scrape Items", "primary", "md", callbacks.onScrape);
          const copyButton = this.createButton("\u{1F4CB} Copy Results", "secondary", "md", callbacks.onCopy);
          const clearButton = this.createButton("\u{1F5D1}\uFE0F Clear Processed", "secondary", "md", callbacks.onClear);
          const closeButton = this.createButton("\u274C Close", "error", "sm", callbacks.onClose);
          return { scrapeButton, copyButton, clearButton, closeButton };
        }
        static createAutoWithdrawButtons(callbacks = {}) {
          const startButton = this.createButton("\u25B6\uFE0F Start Auto-Withdraw", "success", "md", callbacks.onStart);
          const stopButton = this.createButton("\u23F9\uFE0F Stop Auto-Withdraw", "error", "md", callbacks.onStop);
          return { startButton, stopButton };
        }
        static createTestRefreshButton(onTest) {
          return this.createButton("\u{1F9EA} Test Refresh", "warning", "sm", onTest);
        }
        static createAutoClearControls() {
          const label = this.createLabel("\u23F0 Auto-clear interval:", {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs
          });
          const input = this.createInput("number", {
            width: "80px",
            marginRight: Theme.spacing.sm,
            textAlign: "center"
          }, {
            min: "1",
            max: "60",
            value: "5"
          });
          const unitLabel = DOMUtils.createElement("span", {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.onSurface,
            fontFamily: Theme.typography.fontFamily
          });
          unitLabel.textContent = "seconds";
          const container = DOMUtils.createElement("div", {
            marginTop: Theme.spacing.md,
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            display: "flex",
            alignItems: "center",
            gap: Theme.spacing.sm
          });
          container.appendChild(label);
          container.appendChild(input);
          container.appendChild(unitLabel);
          return container;
        }
        static showNotification(message, type = "info") {
          const colors = {
            success: Theme.colors.success,
            error: Theme.colors.error,
            warning: Theme.colors.warning,
            info: Theme.colors.info
          };
          const notification = DOMUtils.createElement("div", {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: colors[type] || Theme.colors.info,
            color: Theme.colors.onPrimary,
            padding: `${Theme.spacing.sm} ${Theme.spacing.lg}`,
            borderRadius: Theme.borderRadius.md,
            zIndex: Theme.zIndex.tooltip,
            fontFamily: Theme.typography.fontFamily,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            boxShadow: Theme.shadows.lg,
            opacity: "0",
            transition: `all ${Theme.animation.duration.normal} ${Theme.animation.easing.easeOut}`
          });
          notification.textContent = message;
          document.body.appendChild(notification);
          requestAnimationFrame(() => {
            notification.style.opacity = "1";
            notification.style.transform = "translateX(-50%) translateY(10px)";
          });
          setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateX(-50%) translateY(-10px)";
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 300);
          }, 3e3);
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
      init_theme();
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
          const resultsSection = UIComponents.createResultsArea();
          this.resultsArea = resultsSection.textarea;
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
            resultsSection,
            controlButtons,
            autoWithdrawButtons,
            testButton,
            autoClearControls
          });
        }
        appendComponentsToOverlay({ dragHandle, jsonConfig, resultsSection, controlButtons, autoWithdrawButtons, testButton, autoClearControls }) {
          this.overlay.insertBefore(dragHandle, this.overlay.firstChild);
          const createSectionDivider = () => {
            return DOMUtils.createElement("div", {
              height: "1px",
              backgroundColor: Theme.colors.border,
              margin: `${Theme.spacing.md} 0`,
              width: "100%"
            });
          };
          const buttonGroup = DOMUtils.createElement("div", {
            display: "flex",
            flexWrap: "wrap",
            gap: Theme.spacing.sm,
            marginBottom: Theme.spacing.md
          });
          [controlButtons.scrapeButton, controlButtons.copyButton, controlButtons.clearButton].forEach((btn) => {
            buttonGroup.appendChild(btn);
          });
          const automationGroup = DOMUtils.createElement("div", {
            display: "flex",
            flexWrap: "wrap",
            gap: Theme.spacing.sm,
            marginBottom: Theme.spacing.md
          });
          [autoWithdrawButtons.startButton, autoWithdrawButtons.stopButton, testButton].forEach((btn) => {
            automationGroup.appendChild(btn);
          });
          const closeButtonContainer = DOMUtils.createElement("div", {
            display: "flex",
            justifyContent: "flex-end",
            marginTop: Theme.spacing.md
          });
          closeButtonContainer.appendChild(controlButtons.closeButton);
          [
            jsonConfig.label,
            jsonConfig.textarea,
            jsonConfig.loadButton,
            createSectionDivider(),
            resultsSection.label,
            resultsSection.textarea,
            createSectionDivider(),
            buttonGroup,
            automationGroup,
            autoClearControls,
            closeButtonContainer
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
          UIComponents.showNotification("\u{1F4CB} Results copied to clipboard!", "success");
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
MM    MM  OOOOO  NN   NN EEEEEEE YY   YY 
MMM  MMM OO   OO NNN  NN EE      YY   YY 
MM MM MM OO   OO NN N NN EEEEE    YYYYY  
MM    MM OO   OO NN  NNN EE        YYY   
MM    MM  OOOO0  NN   NN EEEEEEE   YYY   
                                         
MM    MM   AAA   KK  KK EEEEEEE RRRRRR   
MMM  MMM  AAAAA  KK KK  EE      RR   RR  
MM MM MM AA   AA KKKK   EEEEE   RRRRRR   
MM    MM AAAAAAA KK KK  EE      RR  RR   
MM    MM AA   AA KK  KK EEEEEEE RR   RR  
                                         
`);
        window.MarketItemScraper = new MarketItemScraper();
      })();
    }
  });
  return require_index();
})();
