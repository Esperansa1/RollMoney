var RollMoney = (() => {
  window.ROLLMONEY_VERSION = "6a877047";
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
        padding: Theme.spacing.md,
        zIndex: "99999",
        // Ensure always on top
        boxShadow: Theme.shadows.xl,
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.onSurface,
        width: "900px",
        height: "auto",
        maxHeight: "90vh",
        overflow: "visible",
        boxSizing: "border-box",
        pointerEvents: "auto"
        // Ensure interactivity
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
          const titleContainer = DOMUtils.createElement("div", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          });
          const titleSpan = DOMUtils.createElement("span", {
            fontSize: Theme.typography.fontSize.base,
            fontWeight: Theme.typography.fontWeight.bold
          });
          titleSpan.textContent = "Money Maker";
          const versionSpan = DOMUtils.createElement("span", {
            fontSize: Theme.typography.fontSize.xs,
            opacity: "0.8",
            marginTop: "2px"
          });
          const version = window.ROLLMONEY_VERSION || "dev";
          versionSpan.textContent = `v${version}`;
          titleContainer.appendChild(titleSpan);
          titleContainer.appendChild(versionSpan);
          const closeButton = DOMUtils.createElement("button", {
            position: "absolute",
            right: Theme.spacing.sm,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "transparent",
            border: "none",
            color: Theme.colors.onPrimary,
            fontSize: Theme.typography.fontSize.lg,
            cursor: "pointer",
            padding: "0",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            hover: {
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: Theme.borderRadius.sm
            }
          });
          closeButton.textContent = "\xD7";
          closeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (callbacks.onClose) callbacks.onClose();
          });
          dragHandle.style.position = "relative";
          dragHandle.appendChild(titleContainer);
          dragHandle.appendChild(closeButton);
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
          const label = this.createLabel("Custom Filter Configuration");
          const textarea = this.createTextarea(
            {
              height: "180px",
              maxHeight: "180px",
              overflow: "auto"
            },
            {
              id: "custom-filter-json",
              placeholder: `Enter JSON configuration:
[
  {"skin": "Bayonet", "type": ["Fade", "Marble Fade"]},
  {"type": "Bowie Knife", "skin": ["Fade", "Marble Fade"]}
]`
            }
          );
          const loadButton = this.createButton("Load Filter", "primary", "sm", () => {
            try {
              const jsonInput = textarea.value.trim();
              const config = jsonInput ? JSON.parse(jsonInput) : [];
              if (onLoad) onLoad(config);
              this.showNotification("Filter configuration loaded!", "success");
            } catch (error) {
              this.showNotification("Invalid JSON: " + error.message, "error");
            }
          });
          return { label, textarea, loadButton };
        }
        static createResultsArea() {
          const label = this.createLabel("Scraping Results");
          const textarea = this.createTextarea(
            {
              height: "250px",
              maxHeight: "250px",
              overflow: "auto"
            },
            {
              id: "market-scraper-results",
              placeholder: "Results will appear here after scraping..."
            }
          );
          return { label, textarea };
        }
        static createControlButtons(callbacks = {}) {
          const scrapeButton = this.createButton("Scrape Items", "primary", "md", callbacks.onScrape);
          const copyButton = this.createButton("Copy Results", "secondary", "md", callbacks.onCopy);
          const clearButton = this.createButton("Clear Processed", "secondary", "md", callbacks.onClear);
          const closeButton = this.createButton("Close", "secondary", "sm", callbacks.onClose);
          return { scrapeButton, copyButton, clearButton, closeButton };
        }
        static createAutoWithdrawButtons(callbacks = {}) {
          const startButton = this.createButton("Start Auto-Withdraw", "success", "md", callbacks.onStart);
          const stopButton = this.createButton("Stop Auto-Withdraw", "secondary", "md", callbacks.onStop);
          return { startButton, stopButton };
        }
        static createTestRefreshButton(onTest) {
          return this.createButton("Test Refresh", "secondary", "sm", onTest);
        }
        static createAutoClearControls() {
          const label = this.createLabel("Auto-clear interval:", {
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
          this.id = "withdrawal-automation";
          this.priority = 1;
          this.interval = 500;
          this.settings = {
            scanInterval: 500,
            autoClearSeconds: 5,
            enabled: true
          };
        }
        // Automation manager lifecycle methods
        start() {
          this.startPeriodicScan(this.settings.scanInterval);
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

  // src/automation/market-monitor.js
  var MarketMonitor;
  var init_market_monitor = __esm({
    "src/automation/market-monitor.js"() {
      MarketMonitor = class {
        constructor(dataScraper, itemFilter) {
          this.dataScraper = dataScraper;
          this.itemFilter = itemFilter;
          this.monitorInterval = null;
          this.isRunning = false;
          this.priceHistory = /* @__PURE__ */ new Map();
          this.alerts = [];
          this.id = "market-monitor";
          this.priority = 2;
          this.interval = 2e3;
          this.settings = {
            priceThreshold: 0.05,
            // 5% price change threshold
            trackDuration: 3e5,
            // 5 minutes of price tracking
            enabled: true,
            alertOnDrop: true,
            alertOnRise: false
          };
        }
        // Automation manager lifecycle methods
        start() {
          this.isRunning = true;
          this.startMonitoring();
        }
        stop() {
          this.isRunning = false;
          this.stopMonitoring();
        }
        pause() {
          this.isRunning = false;
          if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
          }
        }
        resume() {
          if (!this.isRunning) {
            this.start();
          }
        }
        startMonitoring() {
          if (this.monitorInterval) {
            this.stopMonitoring();
          }
          this.monitorInterval = setInterval(() => {
            this.monitorMarket();
          }, this.interval);
          console.log("Market monitoring started");
        }
        stopMonitoring() {
          if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
          }
          console.log("Market monitoring stopped");
        }
        monitorMarket() {
          try {
            const items = this.dataScraper.scrapeMarketItems();
            const filteredItems = this.itemFilter.filterItems(items);
            filteredItems.forEach((item) => {
              this.trackItemPrice(item);
            });
            this.cleanOldPriceData();
          } catch (error) {
            console.error("Error monitoring market:", error);
          }
        }
        trackItemPrice(item) {
          const itemKey = `${item.name}_${item.condition}`;
          const currentTime = Date.now();
          const price = this.parsePrice(item.price);
          if (!this.priceHistory.has(itemKey)) {
            this.priceHistory.set(itemKey, []);
          }
          const history = this.priceHistory.get(itemKey);
          history.push({
            price,
            timestamp: currentTime,
            percentageChange: item.percentageChange
          });
          const cutoffTime = currentTime - this.settings.trackDuration;
          const recentHistory = history.filter((entry) => entry.timestamp > cutoffTime);
          this.priceHistory.set(itemKey, recentHistory);
          if (recentHistory.length > 1) {
            this.checkPriceAlerts(item, recentHistory);
          }
        }
        checkPriceAlerts(item, history) {
          if (history.length < 2) return;
          const latest = history[history.length - 1];
          const oldest = history[0];
          const priceChange = (latest.price - oldest.price) / oldest.price;
          if (Math.abs(priceChange) >= this.settings.priceThreshold) {
            const isIncrease = priceChange > 0;
            if (isIncrease && this.settings.alertOnRise || !isIncrease && this.settings.alertOnDrop) {
              this.createAlert({
                type: isIncrease ? "price_increase" : "price_drop",
                item,
                priceChange,
                timestamp: Date.now()
              });
            }
          }
        }
        createAlert(alert) {
          this.alerts.push(alert);
          if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-50);
          }
          const changeType = alert.type === "price_increase" ? "increased" : "dropped";
          const percentage = (Math.abs(alert.priceChange) * 100).toFixed(1);
          console.log(`ALERT: ${alert.item.name} price ${changeType} by ${percentage}%`);
          if (window.MarketItemScraper && window.MarketItemScraper.automationManager) {
            window.MarketItemScraper.automationManager.emit("price-alert", alert);
          }
        }
        parsePrice(priceString) {
          const cleanPrice = priceString.replace(/[^0-9.,]/g, "");
          return parseFloat(cleanPrice.replace(",", ".")) || 0;
        }
        cleanOldPriceData() {
          const cutoffTime = Date.now() - this.settings.trackDuration;
          for (const [itemKey, history] of this.priceHistory.entries()) {
            const recentHistory = history.filter((entry) => entry.timestamp > cutoffTime);
            if (recentHistory.length === 0) {
              this.priceHistory.delete(itemKey);
            } else {
              this.priceHistory.set(itemKey, recentHistory);
            }
          }
        }
        getPriceHistory(itemName, condition) {
          const itemKey = `${itemName}_${condition}`;
          return this.priceHistory.get(itemKey) || [];
        }
        getRecentAlerts(limit = 10) {
          return this.alerts.slice(-limit);
        }
        getMonitoredItemsCount() {
          return this.priceHistory.size;
        }
        getStats() {
          return {
            monitoredItems: this.priceHistory.size,
            totalAlerts: this.alerts.length,
            isRunning: this.isRunning,
            settings: this.settings
          };
        }
      };
    }
  });

  // src/automation/sell-item-verification.js
  var SellItemVerification;
  var init_sell_item_verification = __esm({
    "src/automation/sell-item-verification.js"() {
      init_dom_utils();
      SellItemVerification = class {
        constructor() {
          this.isRunning = false;
          this.currentStep = "idle";
          this.collectedData = {};
          this.tradeLog = [];
          this.stepTimeouts = /* @__PURE__ */ new Map();
          this.stateKey = "sellItemVerificationState";
          this.id = "sell-item-verification";
          this.priority = 2;
          this.interval = 1e3;
          this.settings = {
            enabled: true,
            maxWaitTime: 3e4,
            // 30 seconds max wait per step
            stepCheckInterval: 500,
            // Check every 500ms
            logTradeData: true
          };
          this.initializeCrossPageState();
        }
        // Cross-page state management
        initializeCrossPageState() {
          console.log("\u{1F504} SellItemVerification: Initializing cross-page state...");
          console.log("\u{1F504} Current URL:", window.location.href);
          const savedState = this.loadState();
          console.log("\u{1F504} Loaded state from localStorage:", savedState);
          if (savedState && savedState.isActive) {
            console.log("\u2705 Found saved state for cross-page continuation:", savedState);
            this.restoreState(savedState);
            this.hasRestorableState = true;
            console.log("\u2705 Set hasRestorableState = true");
          } else {
            console.log("\u274C No active saved state found");
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
          const isValidState = this.validateState(state);
          if (!isValidState) {
            console.log("\u26A0\uFE0F State validation failed, not saving invalid state");
            return;
          }
          try {
            localStorage.setItem(this.stateKey, JSON.stringify(state));
            console.log("\u2705 State saved successfully:", state);
          } catch (error) {
            console.error("\u274C Failed to save automation state:", error);
          }
        }
        validateState(state) {
          if (!state.isActive) {
            console.log("State validation: isActive is false");
            return false;
          }
          if (state.currentStep === "idle" || state.currentStep === "wait_for_continue") {
            console.log("State validation: currentStep is not ready for cross-page");
            return false;
          }
          if (state.currentStep === "navigate_inventory") {
            if (!state.collectedData || Object.keys(state.collectedData).length === 0) {
              console.log("State validation: navigate_inventory step but no collected data");
              return false;
            }
            if (!state.collectedData.itemName || state.collectedData.itemName === "Unknown") {
              console.log("State validation: missing or invalid item name");
              return false;
            }
          }
          console.log("\u2705 State validation passed");
          return true;
        }
        loadState() {
          try {
            const stateJson = localStorage.getItem(this.stateKey);
            if (stateJson) {
              const state = JSON.parse(stateJson);
              if (Date.now() - state.timestamp < 10 * 60 * 1e3) {
                return state;
              }
            }
          } catch (error) {
            console.error("Failed to load automation state:", error);
          }
          return null;
        }
        restoreState(state) {
          this.currentStep = state.currentStep || "idle";
          this.collectedData = state.collectedData || {};
          this.tradeLog = state.tradeLog || [];
          console.log("Restored automation state:", state);
        }
        clearState() {
          try {
            localStorage.removeItem(this.stateKey);
          } catch (error) {
            console.error("Failed to clear automation state:", error);
          }
        }
        isSteamPage() {
          return window.location.hostname.includes("steamcommunity.com");
        }
        isCSGORollPage() {
          return window.location.hostname.includes("csgoroll.com");
        }
        // Automation manager lifecycle methods
        start() {
          this.isRunning = true;
          this.currentStep = "wait_for_continue";
          this.saveState();
          this.startStepMonitoring();
          console.log("SellItemVerification automation started");
          console.log("Current automation state:", {
            currentStep: this.currentStep,
            isRunning: this.isRunning,
            hasCollectedData: Object.keys(this.collectedData).length > 0,
            collectedData: this.collectedData
          });
        }
        stop() {
          this.isRunning = false;
          this.currentStep = "idle";
          this.clearAllTimeouts();
          this.clearState();
          console.log("SellItemVerification automation stopped");
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
          console.log(`\u{1F504} Executing step: ${this.currentStep} (${this.isSteamPage() ? "Steam" : "CSGORoll"} page)`);
          switch (this.currentStep) {
            // case 'waiting_for_trade_popup':
            //     this.step1_WaitForTradePopup();
            //     break;
            // case 'accept_trade_setup':
            //     this.step1_AcceptTradeSetup();
            //     break;
            case "wait_for_continue":
              if (this.isCSGORollPage()) {
                this.step1_WaitForContinue();
              } else {
                console.log("Skipping wait_for_continue on Steam page");
              }
              break;
            case "extract_item_data":
              if (this.isCSGORollPage()) {
                this.step2_ExtractItemData();
              } else {
                console.log("Skipping extract_item_data on Steam page");
              }
              break;
            case "send_items":
              if (this.isCSGORollPage()) {
                this.step2_SendItems();
              } else {
                console.log("Skipping send_items on Steam page");
              }
              break;
            case "waiting_for_steam_completion":
              if (this.isCSGORollPage()) {
                this.checkSteamCompletion();
              } else {
                console.log("On Steam page, changing from waiting_for_steam_completion to navigate_inventory");
                this.currentStep = "navigate_inventory";
              }
              break;
            case "navigate_inventory":
              if (this.isSteamPage()) {
                this.step3_NavigateInventory();
              } else {
                console.log("Skipping navigate_inventory on CSGORoll page");
              }
              break;
            case "select_item":
              if (this.isSteamPage()) {
                this.step3_SelectItem();
              } else {
                console.log("Skipping select_item on CSGORoll page");
              }
              break;
            case "confirm_trade":
              if (this.isSteamPage()) {
                this.step4_ConfirmTrade();
              } else {
                console.log("Skipping confirm_trade on CSGORoll page");
              }
              break;
            case "complete":
              this.completeVerification();
              break;
            default:
              console.log(`\u2753 Unknown step: ${this.currentStep}`);
          }
        }
        // Step 1: Accept Trade Setup
        step1_WaitForTradePopup() {
          const readyButton = this.findButtonByText("Yes, I'm ready");
          if (readyButton) {
            console.log(`Found "Yes, I'm ready" button`);
            readyButton.click();
            this.currentStep = "wait_for_continue";
            this.logStep(`Clicked "Yes, I'm ready" button`);
          }
        }
        step1_AcceptTradeSetup() {
          const readyButton = this.findButtonByText("Yes, I'm ready");
          if (readyButton) {
            readyButton.click();
            this.currentStep = "wait_for_continue";
            this.logStep(`Clicked "Yes, I'm ready" button`);
          }
        }
        step1_WaitForContinue() {
          const continueButton = this.findButtonByText("Continue");
          if (continueButton) {
            console.log('Found "Continue" button');
            continueButton.click();
            this.currentStep = "extract_item_data";
            this.logStep('Clicked "Continue" button');
          }
        }
        // Step 2: Item Dialog Extraction
        step2_ExtractItemData() {
          console.log("\u{1F50D} Step 2: Extracting item data from dialog");
          const modal = document.querySelector("mat-dialog-container");
          if (!modal) {
            console.log("\u274C No modal dialog found");
            return;
          }
          console.log("\u2705 Modal dialog found, extracting data...");
          try {
            const categoryElement = modal.querySelector('span[data-test="item-subcategory"]');
            const itemCategory = categoryElement ? categoryElement.textContent.trim() : "Unknown";
            console.log("Item category:", itemCategory);
            const labelElement = modal.querySelector("label[title]");
            const itemName = labelElement ? labelElement.getAttribute("title") : "Unknown";
            console.log("Item name:", itemName);
            const valueElement = modal.querySelector("span.currency-value");
            const itemValue = valueElement ? valueElement.textContent.trim() : "Unknown";
            console.log("Item value:", itemValue);
            const pageText = modal.textContent || "";
            const pageMatch = pageText.match(/On page (\d+) of your Steam inventory/i);
            const inventoryPage = pageMatch ? parseInt(pageMatch[1]) : 1;
            console.log("Inventory page:", inventoryPage);
            const itemPosition = this.calculateItemPosition(modal);
            console.log("Item position:", itemPosition);
            if (itemName === "Unknown" || itemCategory === "Unknown") {
              console.log("\u26A0\uFE0F Warning: Some item data is missing");
              console.log("Available elements in modal:");
              console.log("- Labels with title:", modal.querySelectorAll("label[title]"));
              console.log("- Category elements:", modal.querySelectorAll('span[data-test="item-subcategory"]'));
              console.log("- Value elements:", modal.querySelectorAll("span.currency-value"));
            }
            this.collectedData = {
              itemName,
              itemCategory,
              itemValue,
              inventoryPage,
              itemPosition,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            console.log("\u2705 Successfully extracted item data:", this.collectedData);
            this.logStep("Extracted item data", this.collectedData);
            this.currentStep = "send_items";
            this.saveState();
          } catch (error) {
            console.error("\u274C Error extracting item data:", error);
            this.logError(error);
          }
        }
        calculateItemPosition(modal) {
          try {
            const gridItems = modal.querySelectorAll('[class*="item"], [class*="grid"], .inventory-item');
            if (gridItems.length === 0) return 1;
            const selectedItem = modal.querySelector('.selected, .highlight, .active, [class*="selected"]');
            if (selectedItem) {
              const itemIndex = Array.from(gridItems).indexOf(selectedItem);
              return itemIndex >= 0 ? itemIndex + 1 : 1;
            }
            return 1;
          } catch (error) {
            console.error("Error calculating item position:", error);
            return 1;
          }
        }
        step2_SendItems() {
          const sendButton = this.findButtonByText("Send Items Now");
          if (sendButton) {
            console.log('Found "Send Items Now" button');
            this.currentStep = "navigate_inventory";
            this.isRunning = true;
            this.saveState();
            this.logStep('Clicked "Send Items Now" button - state saved for Steam page');
            console.log("Button element:", sendButton);
            console.log("Button href:", sendButton.href);
            console.log("Button target:", sendButton.target);
            sendButton.click();
            setTimeout(() => {
              if (this.isSteamPage()) {
                console.log("Successfully navigated to Steam page");
              } else {
                console.log("Still on CSGORoll page - button may have opened new tab");
                console.log("Current URL:", window.location.href);
                this.currentStep = "waiting_for_steam_completion";
                this.logStep("Waiting for Steam tab to complete the automation");
              }
            }, 3e3);
          }
        }
        // Step 3: Steam Inventory Navigation
        step3_NavigateInventory() {
          console.log("\u{1F6A2} Step 3: Steam Inventory Navigation - checking page elements");
          if (!this.isSteamPage()) {
            console.log("\u274C Not on Steam page, cannot navigate inventory");
            return;
          }
          if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
            console.log("\u274C No collected data available for inventory navigation");
            return;
          }
          console.log("\u{1F4E6} Looking for Steam inventory elements...");
          const pageControlCur = document.querySelector("#pagecontrol_cur");
          if (pageControlCur) {
            const currentPage = parseInt(pageControlCur.textContent) || 1;
            const targetPage = this.collectedData.inventoryPage || 1;
            console.log(`\u2705 Steam inventory page detected. Current: ${currentPage}, Target: ${targetPage}`);
            if (currentPage !== targetPage) {
              console.log(`\u{1F4C4} Need to navigate from page ${currentPage} to page ${targetPage}`);
              this.navigateToPage(currentPage, targetPage);
            } else {
              console.log(`\u2705 Already on correct page ${targetPage}, proceeding to item selection`);
              this.currentStep = "select_item";
              this.logStep(`Navigated to inventory page ${targetPage}`);
            }
          } else {
            console.log("\u23F3 Steam inventory page controls not found yet...");
            const inventoryArea = document.querySelector("#inventories");
            const tradeOfferPage = document.querySelector(".newmodal");
            if (inventoryArea) {
              console.log("\u2705 Found inventory area, but no page controls");
              this.currentStep = "select_item";
              this.logStep("Found inventory area, proceeding to item selection");
            } else if (tradeOfferPage) {
              console.log("\u2705 Detected trade offer page, looking for inventory");
            } else {
              console.log("\u2753 On Steam domain but specific page type unclear");
              console.log("URL:", window.location.href);
            }
          }
        }
        navigateToPage(currentPage, targetPage) {
          if (currentPage < targetPage) {
            const nextButton = document.querySelector("#pagebtn_next");
            if (nextButton && !nextButton.disabled) {
              nextButton.click();
              this.logStep(`Clicked next page button (${currentPage} -> ${targetPage})`);
            }
          } else if (currentPage > targetPage) {
            const prevButton = document.querySelector("#pagebtn_previous");
            if (prevButton && !prevButton.disabled) {
              prevButton.click();
              this.logStep(`Clicked previous page button (${currentPage} -> ${targetPage})`);
            }
          }
        }
        step3_SelectItem() {
          console.log("\u{1F3AF} Step 3: Selecting target item in Steam inventory");
          if (!this.collectedData || !this.collectedData.itemName) {
            console.log("\u274C No item data available for selection");
            return;
          }
          console.log(`\u{1F50D} Looking for item: ${this.collectedData.itemName}`);
          let inventoryItems = document.querySelectorAll('[id^="item730_"]');
          if (inventoryItems.length === 0) {
            inventoryItems = document.querySelectorAll('.item, .inventory_item, [class*="item"]');
            console.log(`\u{1F4E6} Found ${inventoryItems.length} items with broader selector`);
          } else {
            console.log(`\u{1F4E6} Found ${inventoryItems.length} CS:GO inventory items`);
          }
          if (inventoryItems.length === 0) {
            console.log("\u274C No inventory items found, waiting...");
            return;
          }
          const targetItem = this.findTargetItem(inventoryItems);
          if (targetItem) {
            console.log("\u2705 Found target item, double-clicking");
            console.log("Target item element:", targetItem);
            this.doubleClickElement(targetItem);
            this.currentStep = "confirm_trade";
            this.logStep("Double-clicked target item");
          } else {
            console.log("\u274C Target item not found on current page");
            console.log("Available items for debugging:");
            Array.from(inventoryItems).slice(0, 5).forEach((item, index) => {
              const title = item.getAttribute("title") || "";
              const alt = item.querySelector("img")?.getAttribute("alt") || "";
              console.log(`Item ${index + 1}: title="${title}", alt="${alt}"`);
            });
            this.logStep("Target item not found on current page");
          }
        }
        findTargetItem(inventoryItems) {
          const targetName = this.collectedData.itemName;
          const targetPosition = this.collectedData.itemPosition;
          for (let item of inventoryItems) {
            const title = item.getAttribute("title") || "";
            const alt = item.querySelector("img")?.getAttribute("alt") || "";
            if (title.includes(targetName) || alt.includes(targetName)) {
              return item;
            }
          }
          if (targetPosition && targetPosition <= inventoryItems.length) {
            return inventoryItems[targetPosition - 1];
          }
          return null;
        }
        doubleClickElement(element) {
          const event1 = new MouseEvent("click", { bubbles: true, cancelable: true });
          const event2 = new MouseEvent("click", { bubbles: true, cancelable: true });
          element.dispatchEvent(event1);
          setTimeout(() => element.dispatchEvent(event2), 100);
        }
        // Step 4: Trade Confirmation
        step4_ConfirmTrade() {
          console.log("\u{1F91D} Step 4: Steam Trade Confirmation - checking trade dialog");
          if (!this.isSteamPage()) {
            console.log("\u274C Not on Steam page, cannot confirm trade");
            return;
          }
          this.checkTradeConfirmationSteps();
        }
        checkTradeConfirmationSteps() {
          const confirmTradeElement = document.querySelector("div.content");
          if (confirmTradeElement && confirmTradeElement.textContent.includes("Click here to confirm trade contents")) {
            console.log("\u2705 Found trade contents confirmation");
            confirmTradeElement.click();
            this.logStep("Clicked trade confirmation");
            return;
          }
          const readyButton = this.findTradeReadyButton();
          if (readyButton) {
            console.log("\u2705 Found trade ready button");
            readyButton.click();
            this.logStep("Clicked trade ready button");
            return;
          }
          const giftButton = this.findGiftConfirmationButton();
          if (giftButton) {
            console.log("\u2705 Found gift confirmation button");
            giftButton.click();
            this.logStep("Confirmed gift trade");
            return;
          }
          const makeOfferButton = this.findMakeOfferButton();
          if (makeOfferButton) {
            console.log("\u2705 Found make offer button");
            makeOfferButton.click();
            this.logStep("Clicked Make Offer button");
            this.currentStep = "complete";
            return;
          }
          if (this.checkTradeCompletion()) {
            console.log("\u2705 Trade appears to be completed");
            this.currentStep = "complete";
            return;
          }
          this.checkForTradeErrors();
        }
        findTradeReadyButton() {
          const selectors = [
            'div[class*="ready"]',
            'button[class*="ready"]',
            "div.btn_green_steamui",
            'span:contains("Ready")',
            'div:contains("Ready to trade")'
          ];
          for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.toLowerCase().includes("ready")) {
              return element;
            }
          }
          return null;
        }
        findGiftConfirmationButton() {
          const giftButtons = document.querySelectorAll('div.btn_green_steamui span, button span, div[class*="button"] span');
          for (let button of giftButtons) {
            const text = button.textContent.toLowerCase();
            if (text.includes("yes") && (text.includes("gift") || text.includes("present"))) {
              return button.closest("div, button");
            }
          }
          return null;
        }
        findMakeOfferButton() {
          const selectors = [
            "#trade_confirmbtn",
            'button[id*="confirm"]',
            'div[id*="confirm"]',
            'button:contains("Make Offer")',
            'div:contains("Make Offer")',
            ".btn_green_steamui"
          ];
          for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              const text = element.textContent.toLowerCase();
              if (text.includes("make") && text.includes("offer") || text.includes("confirm") || text.includes("send")) {
                return element;
              }
            }
          }
          return null;
        }
        checkTradeCompletion() {
          const completionIndicators = [
            "Trade Offer Sent",
            "trade offer has been sent",
            "Your trade offer is being held",
            "Trade offer pending",
            "successfully sent"
          ];
          const pageText = document.body.textContent.toLowerCase();
          for (let indicator of completionIndicators) {
            if (pageText.includes(indicator.toLowerCase())) {
              this.logStep(`Trade completion detected: ${indicator}`);
              return true;
            }
          }
          const url = window.location.href;
          if (url.includes("tradeoffer") && url.includes("sent")) {
            this.logStep("Trade completion detected via URL");
            return true;
          }
          return false;
        }
        checkForTradeErrors() {
          const errorIndicators = [
            "error occurred",
            "something went wrong",
            "trade offer failed",
            "unable to send",
            "try again",
            "session expired"
          ];
          const pageText = document.body.textContent.toLowerCase();
          for (let error of errorIndicators) {
            if (pageText.includes(error)) {
              console.log(`\u26A0\uFE0F Trade error detected: ${error}`);
              this.logStep(`Trade error: ${error}`);
              this.handleTradeError(error);
              return true;
            }
          }
          return false;
        }
        handleTradeError(errorType) {
          console.log(`\u274C Handling trade error: ${errorType}`);
          this.currentStep = "complete";
          this.logStep(`Trade failed with error: ${errorType}`);
        }
        checkSteamCompletion() {
          const state = this.loadState();
          if (!state || !state.isActive) {
            console.log("Steam automation appears to be completed");
            this.currentStep = "complete";
          } else {
            console.log("Still waiting for Steam tab to complete...");
          }
        }
        completeVerification() {
          this.logTradeCompletion();
          this.currentStep = "idle";
          this.clearState();
          console.log("Trade verification completed successfully");
          setTimeout(() => {
            this.resetForNextTrade();
          }, 2e3);
        }
        // Utility methods
        findButtonByText(text) {
          const buttons = document.querySelectorAll("button, a[mat-flat-button]");
          return Array.from(buttons).find((button) => {
            const span = button.querySelector("span.mat-button-wrapper");
            if (span) {
              const buttonText = span.textContent.trim();
              return buttonText.toLowerCase() === text.toLowerCase();
            }
            return false;
          });
        }
        clearAllTimeouts() {
          this.stepTimeouts.forEach((timeout) => clearTimeout(timeout));
          this.stepTimeouts.clear();
        }
        resetForNextTrade() {
          this.collectedData = {};
          this.currentStep = "waiting_for_trade_popup";
          console.log("Reset for next trade verification");
        }
        // Logging methods
        logStep(action, data = null) {
          const logEntry = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            step: this.currentStep,
            action,
            data
          };
          this.tradeLog.push(logEntry);
          console.log(`[SellItemVerification] ${action}`, data || "");
        }
        logError(error) {
          const errorEntry = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            step: this.currentStep,
            error: error.message,
            stack: error.stack
          };
          this.tradeLog.push(errorEntry);
          console.error(`[SellItemVerification] Error in ${this.currentStep}:`, error);
        }
        logTradeCompletion() {
          const completionLog = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            action: "trade_completed",
            collectedData: this.collectedData,
            fullLog: this.tradeLog
          };
          console.log("Trade Verification Completed:", completionLog);
          if (this.settings.logTradeData) {
            this.saveTradeToStorage(completionLog);
          }
        }
        saveTradeToStorage(tradeData) {
          try {
            const existingTrades = JSON.parse(localStorage.getItem("sellItemVerificationLogs") || "[]");
            existingTrades.push(tradeData);
            if (existingTrades.length > 100) {
              existingTrades.splice(0, existingTrades.length - 100);
            }
            localStorage.setItem("sellItemVerificationLogs", JSON.stringify(existingTrades));
          } catch (error) {
            console.error("Error saving trade data to storage:", error);
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
          return this.isRunning && this.currentStep !== "idle";
        }
        manualTrigger() {
          if (!this.isRunning) {
            this.start();
          } else {
            console.log("Automation is already running");
          }
        }
      };
    }
  });

  // src/automation/automation-manager.js
  var AutomationManager;
  var init_automation_manager = __esm({
    "src/automation/automation-manager.js"() {
      AutomationManager = class {
        constructor() {
          this.automations = /* @__PURE__ */ new Map();
          this.isRunning = false;
          this.globalSettings = {
            maxConcurrentAutomations: 5,
            globalInterval: 500,
            errorRetryLimit: 3,
            autoRestart: true
          };
          this.eventHandlers = /* @__PURE__ */ new Map();
          this.stats = {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            startTime: null
          };
        }
        registerAutomation(id, automation) {
          if (this.automations.has(id)) {
            throw new Error(`Automation with ID '${id}' already exists`);
          }
          const automationWrapper = {
            id,
            instance: automation,
            status: "registered",
            // registered, running, stopped, error
            priority: automation.priority || 1,
            lastRun: null,
            errorCount: 0,
            successCount: 0,
            settings: {
              enabled: true,
              interval: automation.interval || this.globalSettings.globalInterval,
              maxRetries: automation.maxRetries || this.globalSettings.errorRetryLimit,
              ...automation.settings
            }
          };
          this.automations.set(id, automationWrapper);
          this.emit("automation-registered", { id, automation: automationWrapper });
          return automationWrapper;
        }
        unregisterAutomation(id) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          if (automation.status === "running") {
            this.stopAutomation(id);
          }
          this.automations.delete(id);
          this.emit("automation-unregistered", { id, automation });
        }
        startAutomation(id) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          if (automation.status === "running") {
            console.warn(`Automation '${id}' is already running`);
            return;
          }
          if (!this.isRunning) {
            this.isRunning = true;
            if (!this.stats.startTime) {
              this.stats.startTime = Date.now();
            }
          }
          automation.status = "running";
          automation.lastRun = Date.now();
          if (automation.instance.start) {
            try {
              automation.instance.start();
            } catch (error) {
              this.handleAutomationError(id, error);
              return;
            }
          }
          this.emit("automation-started", { id, automation });
          console.log(`Automation '${id}' started`);
        }
        stopAutomation(id) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          if (automation.status !== "running") {
            console.warn(`Automation '${id}' is not running`);
            return;
          }
          automation.status = "stopped";
          if (automation.instance.stop) {
            try {
              automation.instance.stop();
            } catch (error) {
              console.error(`Error stopping automation '${id}':`, error);
            }
          }
          this.emit("automation-stopped", { id, automation });
          console.log(`Automation '${id}' stopped`);
        }
        startAll() {
          if (this.isRunning) {
            console.warn("Automation manager is already running");
            return;
          }
          this.isRunning = true;
          if (!this.stats.startTime) {
            this.stats.startTime = Date.now();
          }
          const sortedAutomations = Array.from(this.automations.values()).filter((auto) => auto.settings.enabled).sort((a, b) => b.priority - a.priority);
          let started = 0;
          for (const automation of sortedAutomations) {
            if (started >= this.globalSettings.maxConcurrentAutomations) {
              break;
            }
            try {
              this.startAutomation(automation.id);
              started++;
            } catch (error) {
              console.error(`Failed to start automation '${automation.id}':`, error);
            }
          }
          this.emit("manager-started", { startedCount: started });
          console.log(`Automation manager started with ${started} automations`);
        }
        stopAll() {
          const runningAutomations = Array.from(this.automations.values()).filter((auto) => auto.status === "running");
          for (const automation of runningAutomations) {
            try {
              this.stopAutomation(automation.id);
            } catch (error) {
              console.error(`Failed to stop automation '${automation.id}':`, error);
            }
          }
          this.isRunning = false;
          this.emit("manager-stopped", { stoppedCount: runningAutomations.length });
          console.log(`Automation manager stopped, ${runningAutomations.length} automations stopped`);
        }
        pauseAutomation(id) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          if (automation.status === "running") {
            automation.status = "paused";
            if (automation.instance.pause) {
              automation.instance.pause();
            }
            this.emit("automation-paused", { id, automation });
          }
        }
        resumeAutomation(id) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          if (automation.status === "paused") {
            automation.status = "running";
            if (automation.instance.resume) {
              automation.instance.resume();
            }
            this.emit("automation-resumed", { id, automation });
          }
        }
        handleAutomationError(id, error) {
          const automation = this.automations.get(id);
          if (!automation) return;
          automation.errorCount++;
          automation.status = "error";
          this.stats.failedRuns++;
          this.emit("automation-error", { id, automation, error });
          if (automation.errorCount < automation.settings.maxRetries && this.globalSettings.autoRestart) {
            console.log(`Retrying automation '${id}' (attempt ${automation.errorCount + 1})`);
            setTimeout(() => {
              if (automation.status === "error") {
                automation.status = "registered";
                this.startAutomation(id);
              }
            }, 2e3 * automation.errorCount);
          } else {
            console.error(`Automation '${id}' failed after ${automation.errorCount} attempts:`, error);
          }
        }
        updateAutomationSettings(id, settings) {
          const automation = this.automations.get(id);
          if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
          }
          automation.settings = { ...automation.settings, ...settings };
          this.emit("automation-settings-updated", { id, automation, settings });
        }
        getAutomationStatus(id) {
          const automation = this.automations.get(id);
          return automation ? {
            id: automation.id,
            status: automation.status,
            priority: automation.priority,
            lastRun: automation.lastRun,
            errorCount: automation.errorCount,
            successCount: automation.successCount,
            settings: automation.settings
          } : null;
        }
        getAllAutomations() {
          return Array.from(this.automations.values()).map((auto) => ({
            id: auto.id,
            status: auto.status,
            priority: auto.priority,
            lastRun: auto.lastRun,
            errorCount: auto.errorCount,
            successCount: auto.successCount,
            settings: auto.settings
          }));
        }
        getStats() {
          const runningCount = Array.from(this.automations.values()).filter((auto) => auto.status === "running").length;
          return {
            ...this.stats,
            totalAutomations: this.automations.size,
            runningAutomations: runningCount,
            isManagerRunning: this.isRunning,
            uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
          };
        }
        on(event, handler) {
          if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
          }
          this.eventHandlers.get(event).push(handler);
        }
        off(event, handler) {
          const handlers = this.eventHandlers.get(event);
          if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
              handlers.splice(index, 1);
            }
          }
        }
        emit(event, data) {
          const handlers = this.eventHandlers.get(event);
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(data);
              } catch (error) {
                console.error(`Error in event handler for '${event}':`, error);
              }
            });
          }
        }
        // Coordination methods for inter-automation communication
        setSharedData(key, value) {
          if (!this.sharedData) {
            this.sharedData = /* @__PURE__ */ new Map();
          }
          this.sharedData.set(key, value);
          this.emit("shared-data-updated", { key, value });
        }
        getSharedData(key) {
          return this.sharedData ? this.sharedData.get(key) : void 0;
        }
        // Resource management for preventing conflicts
        acquireResource(resourceId, automationId) {
          if (!this.resources) {
            this.resources = /* @__PURE__ */ new Map();
          }
          if (this.resources.has(resourceId)) {
            return false;
          }
          this.resources.set(resourceId, automationId);
          this.emit("resource-acquired", { resourceId, automationId });
          return true;
        }
        releaseResource(resourceId, automationId) {
          if (!this.resources) return false;
          const currentOwner = this.resources.get(resourceId);
          if (currentOwner === automationId) {
            this.resources.delete(resourceId);
            this.emit("resource-released", { resourceId, automationId });
            return true;
          }
          return false;
        }
      };
    }
  });

  // src/components/tabbed-interface.js
  var TabbedInterface;
  var init_tabbed_interface = __esm({
    "src/components/tabbed-interface.js"() {
      init_dom_utils();
      init_ui_components();
      init_theme();
      TabbedInterface = class {
        constructor() {
          this.tabs = /* @__PURE__ */ new Map();
          this.activeTab = null;
          this.container = null;
          this.tabsContainer = null;
          this.contentContainer = null;
        }
        createInterface() {
          const mainContainer = DOMUtils.createElement("div", {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column"
          });
          this.tabsContainer = DOMUtils.createElement("div", {
            display: "flex",
            borderBottom: `2px solid ${Theme.colors.border}`,
            marginBottom: Theme.spacing.md,
            overflow: "auto",
            whiteSpace: "nowrap"
          });
          this.contentContainer = DOMUtils.createElement("div", {
            flex: "1",
            overflow: "auto",
            minHeight: "400px"
          });
          mainContainer.appendChild(this.tabsContainer);
          mainContainer.appendChild(this.contentContainer);
          this.container = mainContainer;
          return mainContainer;
        }
        addTab(id, title, content, options = {}) {
          if (this.tabs.has(id)) {
            console.warn(`Tab with ID '${id}' already exists`);
            return;
          }
          const tab = {
            id,
            title,
            content,
            isActive: false,
            badge: options.badge || null,
            icon: options.icon || null,
            closable: options.closable || false,
            button: null,
            contentElement: null
          };
          tab.button = this.createTabButton(tab);
          tab.contentElement = DOMUtils.createElement("div", {
            display: "none",
            width: "100%",
            height: "100%"
          });
          if (typeof content === "function") {
            tab.contentElement.appendChild(content());
          } else if (content instanceof HTMLElement) {
            tab.contentElement.appendChild(content);
          } else {
            tab.contentElement.innerHTML = content;
          }
          this.tabs.set(id, tab);
          this.tabsContainer.appendChild(tab.button);
          this.contentContainer.appendChild(tab.contentElement);
          if (this.tabs.size === 1) {
            this.switchToTab(id);
          }
          return tab;
        }
        createTabButton(tab) {
          const button = DOMUtils.createElement("button", {
            display: "flex",
            alignItems: "center",
            gap: Theme.spacing.xs,
            padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
            border: "none",
            backgroundColor: Theme.colors.surface,
            color: Theme.colors.onSurface,
            cursor: "pointer",
            borderTopLeftRadius: Theme.borderRadius.md,
            borderTopRightRadius: Theme.borderRadius.md,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.medium,
            fontFamily: Theme.typography.fontFamily,
            whiteSpace: "nowrap",
            transition: `all ${Theme.animation.duration.normal}`,
            hover: {
              backgroundColor: Theme.colors.hover
            }
          });
          if (tab.icon) {
            const icon = DOMUtils.createElement("span");
            icon.textContent = tab.icon;
            button.appendChild(icon);
          }
          const title = DOMUtils.createElement("span");
          title.textContent = tab.title;
          button.appendChild(title);
          if (tab.badge) {
            const badge = DOMUtils.createElement("span", {
              backgroundColor: Theme.colors.primary,
              color: Theme.colors.onPrimary,
              borderRadius: Theme.borderRadius.round,
              padding: `2px ${Theme.spacing.xs}`,
              fontSize: Theme.typography.fontSize.xs,
              fontWeight: Theme.typography.fontWeight.bold,
              minWidth: "18px",
              textAlign: "center"
            });
            badge.textContent = tab.badge;
            button.appendChild(badge);
          }
          if (tab.closable) {
            const closeBtn = DOMUtils.createElement("span", {
              marginLeft: Theme.spacing.xs,
              padding: "2px",
              borderRadius: Theme.borderRadius.sm,
              cursor: "pointer",
              hover: {
                backgroundColor: Theme.colors.error,
                color: Theme.colors.onPrimary
              }
            });
            closeBtn.textContent = "\xD7";
            closeBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              this.removeTab(tab.id);
            });
            button.appendChild(closeBtn);
          }
          button.addEventListener("click", () => {
            this.switchToTab(tab.id);
          });
          return button;
        }
        switchToTab(tabId) {
          const tab = this.tabs.get(tabId);
          if (!tab) {
            console.warn(`Tab with ID '${tabId}' not found`);
            return;
          }
          if (this.activeTab) {
            this.activeTab.isActive = false;
            this.activeTab.button.style.backgroundColor = Theme.colors.surface;
            this.activeTab.button.style.borderBottom = `2px solid ${Theme.colors.border}`;
            this.activeTab.contentElement.style.display = "none";
          }
          tab.isActive = true;
          tab.button.style.backgroundColor = Theme.colors.background;
          tab.button.style.borderBottom = `2px solid ${Theme.colors.primary}`;
          tab.contentElement.style.display = "block";
          this.activeTab = tab;
          this.onTabChange?.(tabId, tab);
        }
        removeTab(tabId) {
          const tab = this.tabs.get(tabId);
          if (!tab) {
            console.warn(`Tab with ID '${tabId}' not found`);
            return;
          }
          if (tab.button.parentNode) {
            tab.button.parentNode.removeChild(tab.button);
          }
          if (tab.contentElement.parentNode) {
            tab.contentElement.parentNode.removeChild(tab.contentElement);
          }
          if (tab.isActive) {
            const remainingTabs = Array.from(this.tabs.values()).filter((t) => t.id !== tabId);
            if (remainingTabs.length > 0) {
              this.switchToTab(remainingTabs[0].id);
            } else {
              this.activeTab = null;
            }
          }
          this.tabs.delete(tabId);
          this.onTabRemoved?.(tabId, tab);
        }
        updateTabBadge(tabId, badge) {
          const tab = this.tabs.get(tabId);
          if (!tab) return;
          tab.badge = badge;
          const badgeElement = tab.button.querySelector("span:last-child");
          if (badgeElement && tab.badge) {
            badgeElement.textContent = badge;
          } else if (tab.badge && !badgeElement) {
            const newBadge = DOMUtils.createElement("span", {
              backgroundColor: Theme.colors.primary,
              color: Theme.colors.onPrimary,
              borderRadius: Theme.borderRadius.round,
              padding: `2px ${Theme.spacing.xs}`,
              fontSize: Theme.typography.fontSize.xs,
              fontWeight: Theme.typography.fontWeight.bold,
              minWidth: "18px",
              textAlign: "center"
            });
            newBadge.textContent = badge;
            tab.button.appendChild(newBadge);
          }
        }
        updateTabTitle(tabId, title) {
          const tab = this.tabs.get(tabId);
          if (!tab) return;
          tab.title = title;
          const titleElement = tab.button.querySelector("span");
          if (titleElement) {
            titleElement.textContent = title;
          }
        }
        getActiveTab() {
          return this.activeTab;
        }
        getAllTabs() {
          return Array.from(this.tabs.values());
        }
        hasTab(tabId) {
          return this.tabs.has(tabId);
        }
        getTab(tabId) {
          return this.tabs.get(tabId);
        }
        // Event handlers (can be overridden)
        onTabChange(tabId, tab) {
        }
        onTabRemoved(tabId, tab) {
        }
        destroy() {
          this.tabs.clear();
          this.activeTab = null;
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
        }
      };
    }
  });

  // src/components/automation-tabs.js
  var AutomationTabs;
  var init_automation_tabs = __esm({
    "src/components/automation-tabs.js"() {
      init_dom_utils();
      init_ui_components();
      init_theme();
      AutomationTabs = class {
        constructor(automationManager) {
          this.automationManager = automationManager;
          this.refreshIntervals = /* @__PURE__ */ new Map();
        }
        createSummaryTab() {
          const container = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            height: "100%",
            overflow: "auto"
          });
          const statsSection = this.createStatsSection();
          const overviewSection = this.createOverviewSection();
          const activitySection = this.createActivitySection();
          container.appendChild(statsSection);
          container.appendChild(overviewSection);
          container.appendChild(activitySection);
          this.startRefreshTimer("summary", () => {
            this.updateSummaryContent(container);
          });
          return container;
        }
        createStatsSection() {
          const section = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("System Overview", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const statsGrid = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: Theme.spacing.md
          });
          statsGrid.id = "summary-stats-grid";
          section.appendChild(title);
          section.appendChild(statsGrid);
          return section;
        }
        createOverviewSection() {
          const section = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Market Sniper", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const sniperInfo = DOMUtils.createElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: Theme.spacing.sm
          });
          sniperInfo.id = "summary-sniper-info";
          section.appendChild(title);
          section.appendChild(sniperInfo);
          return section;
        }
        createActivitySection() {
          const section = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Recent Activity", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const activityLog = DOMUtils.createElement("div", {
            maxHeight: "200px",
            overflow: "auto",
            fontSize: Theme.typography.fontSize.xs,
            fontFamily: "monospace"
          });
          activityLog.id = "summary-activity-log";
          section.appendChild(title);
          section.appendChild(activityLog);
          return section;
        }
        createWithdrawalTab() {
          const container = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            height: "100%",
            overflow: "auto"
          });
          const controlPanel = this.createWithdrawalControls();
          const statusPanel = this.createWithdrawalStatus();
          const settingsPanel = this.createWithdrawalSettings();
          container.appendChild(controlPanel);
          container.appendChild(statusPanel);
          container.appendChild(settingsPanel);
          this.startRefreshTimer("withdrawal", () => {
            this.updateWithdrawalContent(container);
          });
          return container;
        }
        createWithdrawalControls() {
          const panel = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Withdrawal Controls", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const buttonGroup = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.sm,
            flexWrap: "wrap"
          });
          const automation = this.automationManager.getAutomationStatus("withdrawal");
          const startBtn = UIComponents.createButton("Start Withdrawal", "success", "md", () => {
            this.automationManager.startAutomation("withdrawal");
          });
          const stopBtn = UIComponents.createButton("Stop Withdrawal", "error", "md", () => {
            this.automationManager.stopAutomation("withdrawal");
          });
          const pauseBtn = UIComponents.createButton("Pause", "secondary", "md", () => {
            this.automationManager.pauseAutomation("withdrawal");
          });
          buttonGroup.appendChild(startBtn);
          buttonGroup.appendChild(stopBtn);
          buttonGroup.appendChild(pauseBtn);
          panel.appendChild(title);
          panel.appendChild(buttonGroup);
          return panel;
        }
        createWithdrawalStatus() {
          const panel = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Status & Statistics", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const statusGrid = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: Theme.spacing.sm
          });
          statusGrid.id = "withdrawal-status-grid";
          panel.appendChild(title);
          panel.appendChild(statusGrid);
          return panel;
        }
        createWithdrawalSettings() {
          const panel = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Settings", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const autoClearControls = UIComponents.createAutoClearControls();
          const retriesContainer = DOMUtils.createElement("div", {
            marginTop: Theme.spacing.md,
            display: "flex",
            alignItems: "center",
            gap: Theme.spacing.sm
          });
          const retriesLabel = UIComponents.createLabel("Max Retries:", {
            marginBottom: "0",
            fontSize: Theme.typography.fontSize.sm
          });
          const retriesInput = UIComponents.createInput("number", {
            width: "80px"
          }, {
            min: "1",
            max: "10",
            value: "3"
          });
          retriesContainer.appendChild(retriesLabel);
          retriesContainer.appendChild(retriesInput);
          panel.appendChild(title);
          panel.appendChild(autoClearControls);
          panel.appendChild(retriesContainer);
          return panel;
        }
        createMarketMonitorTab() {
          const container = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            height: "100%",
            overflow: "auto"
          });
          const controlPanel = this.createMonitorControls();
          const alertsPanel = this.createPriceAlerts();
          const itemsPanel = this.createMonitoredItems();
          container.appendChild(controlPanel);
          container.appendChild(alertsPanel);
          container.appendChild(itemsPanel);
          this.startRefreshTimer("market-monitor", () => {
            this.updateMarketMonitorContent(container);
          });
          return container;
        }
        createMonitorControls() {
          const panel = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Market Monitor Controls", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const buttonGroup = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.sm,
            flexWrap: "wrap"
          });
          const startBtn = UIComponents.createButton("Start Monitoring", "success", "md", () => {
            this.automationManager.startAutomation("market-monitor");
          });
          const stopBtn = UIComponents.createButton("Stop Monitoring", "error", "md", () => {
            this.automationManager.stopAutomation("market-monitor");
          });
          buttonGroup.appendChild(startBtn);
          buttonGroup.appendChild(stopBtn);
          panel.appendChild(title);
          panel.appendChild(buttonGroup);
          return panel;
        }
        createPriceAlerts() {
          const panel = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Recent Price Alerts", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const alertsList = DOMUtils.createElement("div", {
            maxHeight: "200px",
            overflow: "auto"
          });
          alertsList.id = "price-alerts-list";
          panel.appendChild(title);
          panel.appendChild(alertsList);
          return panel;
        }
        createMonitoredItems() {
          const panel = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Monitored Items", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const itemsList = DOMUtils.createElement("div", {
            maxHeight: "300px",
            overflow: "auto"
          });
          itemsList.id = "monitored-items-list";
          panel.appendChild(title);
          panel.appendChild(itemsList);
          return panel;
        }
        // Update methods
        updateSummaryContent(container) {
          const stats = this.automationManager.getStats();
          const statsGrid = container.querySelector("#summary-stats-grid");
          const sniperInfo = container.querySelector("#summary-sniper-info");
          if (statsGrid) {
            this.updateStatsGrid(statsGrid, stats);
          }
          if (sniperInfo) {
            this.updateSniperInfo(sniperInfo);
          }
        }
        updateStatsGrid(grid, stats) {
          grid.innerHTML = "";
          const version = window.ROLLMONEY_VERSION || "dev";
          const statsData = [
            { label: "Total Automations", value: stats.totalAutomations, color: Theme.colors.info },
            { label: "Running", value: stats.runningAutomations, color: Theme.colors.success },
            { label: "Success Rate", value: `${Math.round(stats.successfulRuns / (stats.successfulRuns + stats.failedRuns) * 100 || 0)}%`, color: Theme.colors.success },
            { label: "Uptime", value: this.formatUptime(stats.uptime), color: Theme.colors.primary },
            { label: "Version", value: `v${version}`, color: Theme.colors.info }
          ];
          statsData.forEach((stat) => {
            const statCard = DOMUtils.createElement("div", {
              textAlign: "center",
              padding: Theme.spacing.md,
              backgroundColor: Theme.colors.surface,
              borderRadius: Theme.borderRadius.md,
              border: `1px solid ${Theme.colors.border}`
            });
            const value = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.xxl,
              fontWeight: Theme.typography.fontWeight.bold,
              color: stat.color,
              marginBottom: Theme.spacing.xs
            });
            value.textContent = stat.value;
            const label = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.sm,
              color: Theme.colors.onSurface
            });
            label.textContent = stat.label;
            statCard.appendChild(value);
            statCard.appendChild(label);
            grid.appendChild(statCard);
          });
        }
        updateSniperInfo(container) {
          container.innerHTML = "";
          const stats = this.automationManager.getStats();
          const withdrawalStatus = this.automationManager.getAutomationStatus("withdrawal");
          const monitorStatus = this.automationManager.getAutomationStatus("market-monitor");
          const statusCard = DOMUtils.createElement("div", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`
          });
          const statusInfo = DOMUtils.createElement("div");
          const sniperName = DOMUtils.createElement("div", {
            fontWeight: Theme.typography.fontWeight.bold,
            fontSize: Theme.typography.fontSize.base,
            marginBottom: Theme.spacing.xs
          });
          sniperName.textContent = "\u{1F3AF} Market Sniper";
          const sniperStatus = DOMUtils.createElement("div", {
            fontSize: Theme.typography.fontSize.sm,
            color: this.getStatusColor(stats.runningAutomations > 0 ? "running" : "stopped")
          });
          sniperStatus.textContent = `Status: ${stats.runningAutomations > 0 ? "RUNNING" : "STOPPED"}`;
          const componentsStatus = DOMUtils.createElement("div", {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.onSurface,
            marginTop: "2px"
          });
          const withdrawalText = withdrawalStatus ? withdrawalStatus.status.toUpperCase() : "STOPPED";
          const monitorText = monitorStatus ? monitorStatus.status.toUpperCase() : "STOPPED";
          componentsStatus.textContent = `Withdrawal: ${withdrawalText} | Monitor: ${monitorText}`;
          statusInfo.appendChild(sniperName);
          statusInfo.appendChild(sniperStatus);
          statusInfo.appendChild(componentsStatus);
          const quickControls = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.xs
          });
          if (stats.runningAutomations > 0) {
            const stopBtn = UIComponents.createButton("Stop", "error", "sm", () => {
              this.automationManager.stopAll();
            });
            quickControls.appendChild(stopBtn);
          } else {
            const startBtn = UIComponents.createButton("Start", "success", "sm", () => {
              this.automationManager.startAutomation("withdrawal");
              this.automationManager.startAutomation("market-monitor");
            });
            quickControls.appendChild(startBtn);
          }
          statusCard.appendChild(statusInfo);
          statusCard.appendChild(quickControls);
          container.appendChild(statusCard);
        }
        getStatusColor(status) {
          const colors = {
            "running": Theme.colors.success,
            "stopped": Theme.colors.error,
            "paused": Theme.colors.warning,
            "error": Theme.colors.error,
            "registered": Theme.colors.info
          };
          return colors[status] || Theme.colors.onSurface;
        }
        formatUptime(milliseconds) {
          if (milliseconds === 0) return "0s";
          const seconds = Math.floor(milliseconds / 1e3);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          if (hours > 0) return `${hours}h ${minutes % 60}m`;
          if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
          return `${seconds}s`;
        }
        startRefreshTimer(tabId, updateFn) {
          if (this.refreshIntervals.has(tabId)) {
            clearInterval(this.refreshIntervals.get(tabId));
          }
          const interval = setInterval(updateFn, 2e3);
          this.refreshIntervals.set(tabId, interval);
        }
        stopRefreshTimer(tabId) {
          if (this.refreshIntervals.has(tabId)) {
            clearInterval(this.refreshIntervals.get(tabId));
            this.refreshIntervals.delete(tabId);
          }
        }
        stopAllRefreshTimers() {
          this.refreshIntervals.forEach((interval, tabId) => {
            clearInterval(interval);
          });
          this.refreshIntervals.clear();
        }
        destroy() {
          this.stopAllRefreshTimers();
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
      init_market_monitor();
      init_sell_item_verification();
      init_automation_manager();
      init_tabbed_interface();
      init_automation_tabs();
      init_theme();
      MarketItemScraper = class {
        constructor() {
          this.isScraperActive = false;
          this.dataScraper = new DataScraper();
          this.itemFilter = new ItemFilter();
          this.automationManager = new AutomationManager();
          this.withdrawalAutomation = new WithdrawalAutomation(this.dataScraper, this.itemFilter);
          this.marketMonitor = new MarketMonitor(this.dataScraper, this.itemFilter);
          this.sellItemVerification = new SellItemVerification();
          this.automationManager.registerAutomation("withdrawal", this.withdrawalAutomation);
          this.automationManager.registerAutomation("market-monitor", this.marketMonitor);
          this.automationManager.registerAutomation("sell-item-verification", this.sellItemVerification);
          this.checkAndContinueSellVerification();
          console.log("MarketScraper initialized on:", window.location.hostname);
          console.log("Checking for saved automation state...");
          this.overlay = null;
          this.resultsArea = null;
          this.tabbedInterface = null;
          this.automationTabs = null;
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
          this.overlay.style.position = "fixed";
          this.overlay.style.zIndex = "99999";
          this.overlay.style.pointerEvents = "auto";
          this.overlay.style.display = "block";
          this.overlay.style.visibility = "visible";
          this.overlay.style.left = "auto";
          this.overlay.style.right = "20px";
          this.overlay.style.top = "20px";
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
            },
            onClose: () => {
              this.closeOverlay();
            }
          });
          this.tabbedInterface = new TabbedInterface();
          this.automationTabs = new AutomationTabs(this.automationManager);
          const tabbedContainer = this.tabbedInterface.createInterface();
          const configTabContent = this.createConfigurationTab();
          this.tabbedInterface.addTab("summary", "Summary", () => this.automationTabs.createSummaryTab(), {
            icon: "\u{1F4CA}"
          });
          this.tabbedInterface.addTab("sniper", "Market Sniper", configTabContent, {
            icon: "\u{1F3AF}"
          });
          this.tabbedInterface.addTab("sell-verification", "Sell Verification", () => this.createSellVerificationTab(), {
            icon: "\u2705"
          });
          this.appendComponentsToOverlay({
            dragHandle,
            tabbedContainer
          });
        }
        createConfigurationTab() {
          const container = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            height: "100%",
            overflow: "auto"
          });
          const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            this.itemFilter.setCustomFilterConfig(config);
          });
          const configSection = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          configSection.appendChild(jsonConfig.label);
          configSection.appendChild(jsonConfig.textarea);
          configSection.appendChild(jsonConfig.loadButton);
          const controlsSection = this.createSniperControls();
          const statusSection = this.createSniperStatus();
          container.appendChild(configSection);
          container.appendChild(controlsSection);
          container.appendChild(statusSection);
          return container;
        }
        createSniperControls() {
          const section = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Market Sniper Controls", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const buttonContainer = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.md,
            justifyContent: "center",
            marginBottom: Theme.spacing.md
          });
          const startButton = UIComponents.createButton("Start Sniper", "success", "lg", () => {
            this.handleStartSniper();
          });
          const stopButton = UIComponents.createButton("Stop Sniper", "error", "lg", () => {
            this.handleStopSniper();
          });
          buttonContainer.appendChild(startButton);
          buttonContainer.appendChild(stopButton);
          section.appendChild(title);
          section.appendChild(buttonContainer);
          return section;
        }
        createSniperStatus() {
          const section = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Sniper Status", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const statusGrid = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: Theme.spacing.sm
          });
          statusGrid.id = "sniper-status-grid";
          section.appendChild(title);
          section.appendChild(statusGrid);
          setInterval(() => {
            this.updateSniperStatus();
          }, 1e3);
          return section;
        }
        appendComponentsToOverlay({ dragHandle, tabbedContainer }) {
          this.overlay.insertBefore(dragHandle, this.overlay.firstChild);
          this.overlay.appendChild(tabbedContainer);
        }
        handleStartSniper() {
          console.log("Starting Market Sniper");
          try {
            this.automationManager.startAutomation("withdrawal");
            this.automationManager.startAutomation("market-monitor");
            this.withdrawalAutomation.startAutoClear(5);
            UIComponents.showNotification("Market Sniper started successfully!", "success");
          } catch (error) {
            console.error("Failed to start Market Sniper:", error);
            UIComponents.showNotification("Failed to start Market Sniper", "error");
          }
        }
        handleStopSniper() {
          console.log("Stopping Market Sniper");
          try {
            this.automationManager.stopAll();
            UIComponents.showNotification("Market Sniper stopped successfully!", "success");
          } catch (error) {
            console.error("Failed to stop Market Sniper:", error);
            UIComponents.showNotification("Failed to stop Market Sniper", "error");
          }
        }
        updateSniperStatus() {
          const statusGrid = document.getElementById("sniper-status-grid");
          if (!statusGrid) return;
          const stats = this.automationManager.getStats();
          const withdrawalStatus = this.automationManager.getAutomationStatus("withdrawal");
          const monitorStatus = this.automationManager.getAutomationStatus("market-monitor");
          const statusData = [
            {
              label: "Status",
              value: stats.runningAutomations > 0 ? "RUNNING" : "STOPPED",
              color: stats.runningAutomations > 0 ? Theme.colors.success : Theme.colors.error
            },
            {
              label: "Items Processed",
              value: this.dataScraper.getProcessedItemsCount(),
              color: Theme.colors.info
            },
            {
              label: "Uptime",
              value: this.formatUptime(stats.uptime),
              color: Theme.colors.primary
            }
          ];
          statusGrid.innerHTML = "";
          statusData.forEach((stat) => {
            const statCard = DOMUtils.createElement("div", {
              textAlign: "center",
              padding: Theme.spacing.md,
              backgroundColor: Theme.colors.surfaceVariant,
              borderRadius: Theme.borderRadius.md,
              border: `1px solid ${Theme.colors.border}`
            });
            const value = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.xl,
              fontWeight: Theme.typography.fontWeight.bold,
              color: stat.color,
              marginBottom: Theme.spacing.xs
            });
            value.textContent = stat.value;
            const label = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.sm,
              color: Theme.colors.onSurface
            });
            label.textContent = stat.label;
            statCard.appendChild(value);
            statCard.appendChild(label);
            statusGrid.appendChild(statCard);
          });
        }
        formatUptime(milliseconds) {
          if (milliseconds === 0) return "0s";
          const seconds = Math.floor(milliseconds / 1e3);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          if (hours > 0) return `${hours}h ${minutes % 60}m`;
          if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
          return `${seconds}s`;
        }
        createSellVerificationTab() {
          const container = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            height: "100%",
            overflow: "auto"
          });
          const controlsSection = this.createSellVerificationControls();
          const statusSection = this.createSellVerificationStatus();
          const logsSection = this.createSellVerificationLogs();
          container.appendChild(controlsSection);
          container.appendChild(statusSection);
          container.appendChild(logsSection);
          setInterval(() => {
            this.updateSellVerificationStatus();
          }, 1e3);
          return container;
        }
        createSellVerificationControls() {
          const section = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Sell Item Verification Controls", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const buttonContainer = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.md,
            justifyContent: "center",
            marginBottom: Theme.spacing.md
          });
          const startButton = UIComponents.createButton("Start Verification", "success", "lg", () => {
            this.handleStartSellVerification();
          });
          const stopButton = UIComponents.createButton("Stop Verification", "error", "lg", () => {
            this.handleStopSellVerification();
          });
          const manualTriggerButton = UIComponents.createButton("Manual Trigger", "secondary", "md", () => {
            this.handleManualTrigger();
          });
          const emergencyStopButton = UIComponents.createButton("Emergency Stop", "error", "md", () => {
            this.handleEmergencyStop();
          });
          buttonContainer.appendChild(startButton);
          buttonContainer.appendChild(stopButton);
          buttonContainer.appendChild(manualTriggerButton);
          buttonContainer.appendChild(emergencyStopButton);
          const debugSection = this.createDebugStepControls();
          section.appendChild(debugSection);
          section.appendChild(title);
          section.appendChild(buttonContainer);
          return section;
        }
        createSellVerificationStatus() {
          const section = DOMUtils.createElement("div", {
            marginBottom: Theme.spacing.lg,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Current Status", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const statusGrid = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: Theme.spacing.sm
          });
          statusGrid.id = "sell-verification-status-grid";
          section.appendChild(title);
          section.appendChild(statusGrid);
          return section;
        }
        createSellVerificationLogs() {
          const section = DOMUtils.createElement("div", {
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Activity Log", {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.md
          });
          const logDisplay = DOMUtils.createElement("div", {
            backgroundColor: Theme.colors.surfaceVariant,
            padding: Theme.spacing.md,
            borderRadius: Theme.borderRadius.sm,
            fontSize: Theme.typography.fontSize.sm,
            fontFamily: "monospace",
            height: "150px",
            overflow: "auto",
            border: `1px solid ${Theme.colors.border}`
          });
          logDisplay.id = "sell-verification-log-display";
          const clearLogsButton = UIComponents.createButton("Clear Logs", "secondary", "sm", () => {
            logDisplay.innerHTML = "";
          });
          section.appendChild(title);
          section.appendChild(logDisplay);
          section.appendChild(clearLogsButton);
          return section;
        }
        handleStartSellVerification() {
          console.log("Starting Sell Item Verification");
          try {
            this.automationManager.startAutomation("sell-item-verification");
            UIComponents.showNotification("Sell Item Verification started successfully!", "success");
          } catch (error) {
            console.error("Failed to start Sell Item Verification:", error);
            UIComponents.showNotification("Failed to start Sell Item Verification", "error");
          }
        }
        handleStopSellVerification() {
          console.log("Stopping Sell Item Verification");
          try {
            this.automationManager.stopAutomation("sell-item-verification");
            UIComponents.showNotification("Sell Item Verification stopped successfully!", "success");
          } catch (error) {
            console.error("Failed to stop Sell Item Verification:", error);
            UIComponents.showNotification("Failed to stop Sell Item Verification", "error");
          }
        }
        handleManualTrigger() {
          console.log("Manual trigger for Sell Item Verification");
          try {
            this.sellItemVerification.manualTrigger();
            UIComponents.showNotification("Manual trigger activated!", "info");
          } catch (error) {
            console.error("Failed to trigger Sell Item Verification:", error);
            UIComponents.showNotification("Failed to trigger automation", "error");
          }
        }
        handleEmergencyStop() {
          console.log("\u{1F6D1} EMERGENCY STOP - Clearing all automation state");
          try {
            this.automationManager.stopAll();
            this.sellItemVerification.clearState();
            this.sellItemVerification.isRunning = false;
            this.sellItemVerification.currentStep = "idle";
            localStorage.removeItem("sellItemVerificationState");
            UIComponents.showNotification("Emergency stop completed - all automation cleared!", "success");
            console.log("\u{1F6D1} Emergency stop completed");
          } catch (error) {
            console.error("Error during emergency stop:", error);
            UIComponents.showNotification("Error during emergency stop", "error");
          }
        }
        createDebugStepControls() {
          const debugSection = DOMUtils.createElement("div", {
            marginTop: Theme.spacing.md,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const debugTitle = UIComponents.createLabel("Debug Step Controls", {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
          });
          const debugButtonContainer = DOMUtils.createElement("div", {
            display: "flex",
            flexWrap: "wrap",
            gap: Theme.spacing.sm
          });
          const extractDataBtn = UIComponents.createButton("Extract Data", "warning", "sm", () => {
            this.handleDebugExtractData();
          });
          const sendItemsBtn = UIComponents.createButton("Send Items", "warning", "sm", () => {
            this.handleDebugSendItems();
          });
          const navigateInventoryBtn = UIComponents.createButton("Navigate Inventory", "warning", "sm", () => {
            this.handleDebugNavigateInventory();
          });
          const viewStateBtn = UIComponents.createButton("View State", "info", "sm", () => {
            this.handleDebugViewState();
          });
          const injectTestDataBtn = UIComponents.createButton("Inject Test Data", "info", "sm", () => {
            this.handleDebugInjectTestData();
          });
          const fullSequenceBtn = UIComponents.createButton("Full CSGORoll Sequence", "primary", "sm", () => {
            this.handleDebugFullSequence();
          });
          debugButtonContainer.appendChild(extractDataBtn);
          debugButtonContainer.appendChild(sendItemsBtn);
          debugButtonContainer.appendChild(navigateInventoryBtn);
          debugButtonContainer.appendChild(viewStateBtn);
          debugButtonContainer.appendChild(injectTestDataBtn);
          debugButtonContainer.appendChild(fullSequenceBtn);
          debugSection.appendChild(debugTitle);
          debugSection.appendChild(debugButtonContainer);
          return debugSection;
        }
        handleDebugExtractData() {
          console.log("\u{1F527} DEBUG: Manually triggering data extraction");
          try {
            const modal = document.querySelector("mat-dialog-container");
            if (!modal) {
              console.log("\u26A0\uFE0F No modal found - you may need to open a trade dialog first");
              UIComponents.showNotification("No modal found - open trade dialog first", "warning");
              return;
            }
            this.sellItemVerification.step2_ExtractItemData();
            if (this.sellItemVerification.collectedData && Object.keys(this.sellItemVerification.collectedData).length > 0) {
              console.log("\u2705 Data extracted successfully:", this.sellItemVerification.collectedData);
              UIComponents.showNotification("Data extraction successful!", "success");
            } else {
              UIComponents.showNotification("Data extraction triggered but no data found", "warning");
            }
          } catch (error) {
            console.error("Debug extract data error:", error);
            UIComponents.showNotification("Error in data extraction", "error");
          }
        }
        handleDebugSendItems() {
          console.log("\u{1F527} DEBUG: Manually triggering send items");
          try {
            if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
              console.log("\u26A0\uFE0F No data collected yet - extract data first");
              UIComponents.showNotification("Extract data first before sending items", "warning");
              return;
            }
            const sendButton = this.sellItemVerification.findButtonByText("Send Items Now");
            if (!sendButton) {
              console.log('\u26A0\uFE0F "Send Items Now" button not found');
              UIComponents.showNotification("Send Items Now button not found", "warning");
              return;
            }
            this.sellItemVerification.step2_SendItems();
            UIComponents.showNotification("Send items triggered - check console for navigation details", "info");
          } catch (error) {
            console.error("Debug send items error:", error);
            UIComponents.showNotification("Error in send items", "error");
          }
        }
        handleDebugNavigateInventory() {
          console.log("\u{1F527} DEBUG: Manually triggering navigate inventory");
          try {
            if (!this.sellItemVerification.isSteamPage()) {
              console.log("\u26A0\uFE0F Not on Steam page - this step only works on Steam");
              UIComponents.showNotification("Navigate inventory only works on Steam page", "warning");
              return;
            }
            if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
              console.log('\u26A0\uFE0F No data collected - use "Inject Test Data" or extract data first');
              UIComponents.showNotification("No item data available - inject test data first", "warning");
              return;
            }
            this.sellItemVerification.step3_NavigateInventory();
            UIComponents.showNotification("Navigate inventory triggered", "info");
          } catch (error) {
            console.error("Debug navigate inventory error:", error);
            UIComponents.showNotification("Error in navigate inventory", "error");
          }
        }
        handleDebugViewState() {
          console.log("\u{1F527} DEBUG: Viewing current state");
          const state = {
            currentStep: this.sellItemVerification.currentStep,
            isRunning: this.sellItemVerification.isRunning,
            collectedData: this.sellItemVerification.collectedData,
            hasRestorableState: this.sellItemVerification.hasRestorableState
          };
          console.log("Current automation state:", state);
          const savedState = localStorage.getItem("sellItemVerificationState");
          console.log("Saved localStorage state:", savedState);
          UIComponents.showNotification("State logged to console", "info");
        }
        handleDebugInjectTestData() {
          console.log("\u{1F527} DEBUG: Injecting test data");
          const testData = {
            itemName: "AK-47 | Redline (Field-Tested)",
            itemCategory: "Rifle",
            itemValue: "45.50 TKN",
            inventoryPage: 1,
            itemPosition: 3,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.sellItemVerification.collectedData = testData;
          this.sellItemVerification.currentStep = "navigate_inventory";
          this.sellItemVerification.isRunning = true;
          this.sellItemVerification.saveState();
          console.log("Injected test data:", testData);
          UIComponents.showNotification("Test data injected and state saved", "success");
        }
        handleDebugFullSequence() {
          console.log("\u{1F527} DEBUG: Running full CSGORoll sequence");
          if (this.sellItemVerification.isSteamPage()) {
            UIComponents.showNotification("Full sequence is for CSGORoll page only", "warning");
            return;
          }
          const modal = document.querySelector("mat-dialog-container");
          if (!modal) {
            UIComponents.showNotification("Open a trade dialog first, then try again", "warning");
            return;
          }
          console.log("Step 1: Extracting data...");
          this.sellItemVerification.step2_ExtractItemData();
          if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
            UIComponents.showNotification("Data extraction failed - check console for details", "error");
            return;
          }
          setTimeout(() => {
            console.log("Step 2: Triggering send items...");
            const sendButton = this.sellItemVerification.findButtonByText("Send Items Now");
            if (!sendButton) {
              UIComponents.showNotification("Send Items Now button not found", "error");
              return;
            }
            this.sellItemVerification.step2_SendItems();
            UIComponents.showNotification("Full sequence complete - Steam page should now continue automatically", "success");
          }, 2e3);
          UIComponents.showNotification("Starting full sequence...", "info");
        }
        checkAndContinueSellVerification() {
          console.log("=== CHECKING SELL VERIFICATION STATE ===");
          console.log("hasRestorableState:", this.sellItemVerification.hasRestorableState);
          const savedState = localStorage.getItem("sellItemVerificationState");
          console.log("Raw localStorage state:", savedState);
          if (savedState) {
            try {
              const parsedState = JSON.parse(savedState);
              console.log("Parsed saved state:", parsedState);
            } catch (e) {
              console.error("Error parsing saved state:", e);
            }
          }
          if (this.sellItemVerification.hasRestorableState) {
            console.log("\u2705 Found restorable sell verification state, auto-continuing automation");
            if (this.sellItemVerification.isSteamPage()) {
              console.log("\u2705 On Steam page - current step:", this.sellItemVerification.currentStep);
              if (this.sellItemVerification.currentStep === "wait_for_continue") {
                console.log("Correcting step from wait_for_continue to navigate_inventory");
                this.sellItemVerification.currentStep = "navigate_inventory";
              }
            }
            setTimeout(() => {
              try {
                console.log("\u{1F680} Starting automation manager...");
                console.log("Current automation step before start:", this.sellItemVerification.currentStep);
                console.log("Automation isRunning before start:", this.sellItemVerification.isRunning);
                this.automationManager.startAutomation("sell-item-verification");
                console.log("\u2705 Auto-started sell item verification from saved state");
                console.log("Current automation step after start:", this.sellItemVerification.currentStep);
                console.log("Automation isRunning after start:", this.sellItemVerification.isRunning);
                console.log("Automation manager isRunning:", this.automationManager.isRunning);
              } catch (error) {
                console.error("\u274C Failed to auto-start sell verification:", error);
              }
            }, 2e3);
          } else {
            console.log("\u274C No restorable state found");
          }
        }
        updateSellVerificationStatus() {
          const statusGrid = document.getElementById("sell-verification-status-grid");
          const logDisplay = document.getElementById("sell-verification-log-display");
          if (!statusGrid) return;
          const automationStatus = this.automationManager.getAutomationStatus("sell-item-verification");
          const isActive = this.sellItemVerification.isActive();
          const currentStep = this.sellItemVerification.getCurrentStep();
          const statusData = [
            {
              label: "Status",
              value: automationStatus?.status === "running" ? "RUNNING" : "STOPPED",
              color: automationStatus?.status === "running" ? Theme.colors.success : Theme.colors.error
            },
            {
              label: "Current Step",
              value: currentStep || "idle",
              color: isActive ? Theme.colors.warning : Theme.colors.info
            },
            {
              label: "Active",
              value: isActive ? "YES" : "NO",
              color: isActive ? Theme.colors.success : Theme.colors.error
            }
          ];
          statusGrid.innerHTML = "";
          statusData.forEach((stat) => {
            const statCard = DOMUtils.createElement("div", {
              textAlign: "center",
              padding: Theme.spacing.md,
              backgroundColor: Theme.colors.surfaceVariant,
              borderRadius: Theme.borderRadius.md,
              border: `1px solid ${Theme.colors.border}`
            });
            const value = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.xl,
              fontWeight: Theme.typography.fontWeight.bold,
              color: stat.color,
              marginBottom: Theme.spacing.xs
            });
            value.textContent = stat.value;
            const label = DOMUtils.createElement("div", {
              fontSize: Theme.typography.fontSize.sm,
              color: Theme.colors.onSurface
            });
            label.textContent = stat.label;
            statCard.appendChild(value);
            statCard.appendChild(label);
            statusGrid.appendChild(statCard);
          });
          if (logDisplay) {
            const logs = this.sellItemVerification.getTradeLog();
            const recentLogs = logs.slice(-10);
            const logHtml = recentLogs.map((log) => {
              const time = new Date(log.timestamp).toLocaleTimeString();
              return `<div style="margin-bottom: 4px; color: ${Theme.colors.onSurface};">
                    [${time}] ${log.action || log.step} ${log.data ? "- " + JSON.stringify(log.data) : ""}
                </div>`;
            }).join("");
            logDisplay.innerHTML = logHtml || '<div style="color: #666;">No recent activity...</div>';
            logDisplay.scrollTop = logDisplay.scrollHeight;
          }
        }
        closeOverlay() {
          if (this.automationManager.isRunning) {
            this.automationManager.stopAll();
          }
          if (this.automationTabs) {
            this.automationTabs.destroy();
            this.automationTabs = null;
          }
          if (this.tabbedInterface) {
            this.tabbedInterface.destroy();
            this.tabbedInterface = null;
          }
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
          return this.automationManager.isRunning;
        }
        // Public API for accessing automation manager
        getAutomationManager() {
          return this.automationManager;
        }
        getAutomationStats() {
          return this.automationManager.getStats();
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
