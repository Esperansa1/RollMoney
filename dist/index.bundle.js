var RollMoney = (() => {
  window.ROLLMONEY_VERSION = "c2215819";
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

  // src/utils/cookie-utils.js
  var CookieUtils;
  var init_cookie_utils = __esm({
    "src/utils/cookie-utils.js"() {
      CookieUtils = class {
        static setCookie(name, value, days = 365) {
          let expires = "";
          if (days) {
            const date = /* @__PURE__ */ new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
            expires = "; expires=" + date.toUTCString();
          }
          const cookieString = name + "=" + encodeURIComponent(value) + expires;
          document.cookie = cookieString;
          console.log("Setting cookie:", cookieString);
        }
        static getCookie(name) {
          const nameEQ = name + "=";
          const ca = document.cookie.split(";");
          console.log("Getting cookie:", name, "from document.cookie:", document.cookie);
          for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
              const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
              console.log("Found cookie value:", value);
              return value;
            }
          }
          console.log("Cookie not found:", name);
          return null;
        }
        static deleteCookie(name) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        static setJsonCookie(name, value, days = 365) {
          try {
            const jsonString = JSON.stringify(value);
            try {
              localStorage.setItem(name, jsonString);
              console.log("Saved to localStorage:", name, jsonString);
              return true;
            } catch (localStorageError) {
              console.warn("localStorage failed, trying cookies:", localStorageError);
              this.setCookie(name, jsonString, days);
              return true;
            }
          } catch (error) {
            console.error("Error setting JSON data:", error);
            return false;
          }
        }
        static getJsonCookie(name) {
          try {
            try {
              const localValue = localStorage.getItem(name);
              if (localValue) {
                console.log("Retrieved from localStorage:", name, localValue);
                return JSON.parse(localValue);
              }
            } catch (localStorageError) {
              console.warn("localStorage failed, trying cookies:", localStorageError);
            }
            const cookieValue = this.getCookie(name);
            if (cookieValue) {
              console.log("Retrieved from cookies:", name, cookieValue);
              return JSON.parse(cookieValue);
            }
            return null;
          } catch (error) {
            console.error("Error parsing JSON data:", error);
            return null;
          }
        }
        static hasCookie(name) {
          return this.getCookie(name) !== null;
        }
        static listCookies() {
          const cookies = {};
          const ca = document.cookie.split(";");
          for (let i = 0; i < ca.length; i++) {
            const c = ca[i].trim();
            if (c) {
              const eqPos = c.indexOf("=");
              if (eqPos > 0) {
                const name = c.substring(0, eqPos);
                const value = decodeURIComponent(c.substring(eqPos + 1));
                cookies[name] = value;
              }
            }
          }
          return cookies;
        }
      };
    }
  });

  // src/components/ui-components.js
  var UIComponents;
  var init_ui_components = __esm({
    "src/components/ui-components.js"() {
      init_dom_utils();
      init_theme();
      init_cookie_utils();
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
          const DRAG_EXCLUDED_TAGS = /* @__PURE__ */ new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);
          const dragStart = (e) => {
            if (DRAG_EXCLUDED_TAGS.has(e.target.tagName)) return;
            if (e.target.closest("button, input, textarea, select, a")) return;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
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
          DOMUtils.addEventListeners(overlay, { mousedown: dragStart });
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
          const label = this.createLabel("Filter Configuration");
          const currentLabel = this.createLabel("Current Active Filter:", {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs
          });
          const currentTextarea = this.createTextarea(
            {
              height: "80px",
              maxHeight: "80px",
              overflow: "auto",
              fontSize: Theme.typography.fontSize.xs,
              lineHeight: "1.3",
              backgroundColor: Theme.colors.surfaceVariant,
              color: Theme.colors.onSurface,
              border: `1px solid ${Theme.colors.border}`,
              cursor: "default"
            },
            {
              id: "current-filter-display",
              placeholder: "No filter currently active",
              readonly: true
            }
          );
          const inputLabel = this.createLabel("New Filter JSON:", {
            fontSize: Theme.typography.fontSize.xs,
            marginBottom: Theme.spacing.xs,
            marginTop: Theme.spacing.sm
          });
          const inputTextarea = this.createTextarea(
            {
              height: "80px",
              maxHeight: "80px",
              overflow: "auto",
              fontSize: Theme.typography.fontSize.xs,
              lineHeight: "1.3"
            },
            {
              id: "new-filter-input",
              placeholder: `[{"skin": "Bayonet", "type": ["Fade", "Marble Fade"]}]`
            }
          );
          const savedFilter = CookieUtils.getJsonCookie("market-filter-config");
          console.log("Loading saved filter from cookies:", savedFilter);
          if (savedFilter) {
            setTimeout(() => {
              currentTextarea.value = JSON.stringify(savedFilter, null, 2);
              console.log("Populated current filter display with:", savedFilter);
            }, 50);
          }
          let saveTimeout;
          inputTextarea.addEventListener("input", () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
              try {
                const jsonInput = inputTextarea.value.trim();
                if (jsonInput) {
                  const config = JSON.parse(jsonInput);
                  console.log("Filter JSON validated successfully");
                }
              } catch (error) {
                console.log("Invalid JSON in input");
              }
            }, 500);
          });
          const loadButton = this.createButton("Apply Filter", "primary", "sm", () => {
            try {
              const jsonInput = inputTextarea.value.trim();
              const config = jsonInput ? JSON.parse(jsonInput) : [];
              console.log("Applying filter config:", config);
              currentTextarea.value = jsonInput ? JSON.stringify(config, null, 2) : "";
              if (jsonInput) {
                const saveResult = CookieUtils.setJsonCookie("market-filter-config", config);
                console.log("Cookie save result:", saveResult);
                console.log("Saved config to cookies:", config);
              } else {
                this.deleteFilterStorage("market-filter-config");
                console.log("Deleted filter storage");
              }
              const savedConfig = CookieUtils.getJsonCookie("market-filter-config");
              console.log("Verified saved config:", savedConfig);
              if (onLoad) onLoad(config);
              this.showNotification("Filter applied successfully!", "success");
              inputTextarea.value = "";
            } catch (error) {
              console.error("Error applying filter:", error);
              this.showNotification("Invalid JSON: " + error.message, "error");
            }
          });
          const clearButton = this.createButton("Clear All", "secondary", "sm", () => {
            inputTextarea.value = "";
            currentTextarea.value = "";
            this.deleteFilterStorage("market-filter-config");
            if (onLoad) onLoad([]);
            this.showNotification("All filters cleared!", "info");
          });
          if (savedFilter && onLoad) {
            setTimeout(() => {
              console.log("Auto-loading saved filter via onLoad callback:", savedFilter);
              onLoad(savedFilter);
              this.showNotification("Filter configuration loaded from cookies!", "info");
            }, 200);
          }
          return {
            label,
            currentLabel,
            currentTextarea,
            inputLabel,
            inputTextarea,
            loadButton,
            clearButton
          };
        }
        static deleteFilterStorage(name) {
          try {
            localStorage.removeItem(name);
            console.log("Removed from localStorage:", name);
          } catch (error) {
            console.warn("Could not remove from localStorage:", error);
          }
          try {
            CookieUtils.deleteCookie(name);
            console.log("Removed from cookies:", name);
          } catch (error) {
            console.warn("Could not remove from cookies:", error);
          }
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

  // src/utils/dom-observer.js
  var DOMObserver;
  var init_dom_observer = __esm({
    "src/utils/dom-observer.js"() {
      DOMObserver = class {
        /**
         * Wait for an element to appear in the DOM
         * @param {string} selector - CSS selector to wait for
         * @param {number} timeout - Timeout in milliseconds (default: 5000)
         * @param {Element} root - Root element to observe (default: document.body)
         * @returns {Promise<Element>} - Resolves with the found element
         */
        static waitForElement(selector, timeout = 5e3, root = document.body) {
          return new Promise((resolve, reject) => {
            const existing = (root === document.body ? document : root).querySelector(selector);
            if (existing) {
              console.log(`\u2705 Element found immediately: ${selector}`);
              return resolve(existing);
            }
            console.log(`\u{1F50D} Waiting for element: ${selector}`);
            const observer = new MutationObserver((mutations) => {
              const element = (root === document.body ? document : root).querySelector(selector);
              if (element) {
                console.log(`\u2705 Element appeared: ${selector}`);
                observer.disconnect();
                resolve(element);
              }
            });
            observer.observe(root, {
              childList: true,
              subtree: true,
              attributes: true
            });
            const timeoutId = setTimeout(() => {
              observer.disconnect();
              console.log(`\u274C Element timeout: ${selector}`);
              reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
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
        static waitForElements(selectors, timeout = 5e3) {
          return Promise.all(selectors.map(
            (selector) => this.waitForElement(selector, timeout)
          ));
        }
        /**
         * Wait for a condition to become true using fast polling
         * @param {Function} conditionFn - Function that returns true when condition is met
         * @param {number} timeout - Timeout in milliseconds (default: 5000)
         * @param {string} description - Description for logging
         * @returns {Promise<void>} - Resolves when condition is met
         */
        static waitForCondition(conditionFn, timeout = 5e3, description = "condition") {
          return new Promise((resolve, reject) => {
            console.log(`\u{1F50D} Waiting for condition: ${description}`);
            const check = () => {
              try {
                if (conditionFn()) {
                  console.log(`\u2705 Condition met: ${description}`);
                  resolve();
                } else {
                  requestAnimationFrame(check);
                }
              } catch (error) {
                reject(error);
              }
            };
            check();
            setTimeout(() => {
              console.log(`\u274C Condition timeout: ${description}`);
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
        static waitForElementEnabled(elementOrSelector, timeout = 5e3) {
          return new Promise(async (resolve, reject) => {
            let element;
            if (typeof elementOrSelector === "string") {
              try {
                element = await this.waitForElement(elementOrSelector, timeout);
              } catch (error) {
                return reject(error);
              }
            } else {
              element = elementOrSelector;
            }
            if (!element.disabled) {
              console.log(`\u2705 Element already enabled`);
              return resolve(element);
            }
            console.log(`\u{1F50D} Waiting for element to be enabled`);
            const observer = new MutationObserver(() => {
              if (!element.disabled) {
                console.log(`\u2705 Element became enabled`);
                observer.disconnect();
                resolve(element);
              }
            });
            observer.observe(element, {
              attributes: true,
              attributeFilter: ["disabled"]
            });
            setTimeout(() => {
              observer.disconnect();
              console.log(`\u274C Element enable timeout`);
              reject(new Error("Element did not become enabled within timeout"));
            }, timeout);
          });
        }
        /**
         * Wait for an element to disappear from the DOM
         * @param {string} selector - CSS selector to wait for disappearance
         * @param {number} timeout - Timeout in milliseconds
         * @returns {Promise<void>} - Resolves when element disappears
         */
        static waitForElementToDisappear(selector, timeout = 5e3) {
          return new Promise((resolve, reject) => {
            if (!document.querySelector(selector)) {
              console.log(`\u2705 Element already absent: ${selector}`);
              return resolve();
            }
            console.log(`\u{1F50D} Waiting for element to disappear: ${selector}`);
            const observer = new MutationObserver(() => {
              if (!document.querySelector(selector)) {
                console.log(`\u2705 Element disappeared: ${selector}`);
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
              console.log(`\u274C Element disappear timeout: ${selector}`);
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
        static waitForTextChange(elementOrSelector, expectedText = null, timeout = 5e3) {
          return new Promise(async (resolve, reject) => {
            let element;
            if (typeof elementOrSelector === "string") {
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
              console.log(`\u2705 Text already matches: "${expectedText}"`);
              return resolve(initialText);
            }
            console.log(`\u{1F50D} Waiting for text change from: "${initialText}"`);
            const observer = new MutationObserver(() => {
              const newText = element.textContent.trim();
              if (newText !== initialText && (!expectedText || newText === expectedText)) {
                console.log(`\u2705 Text changed to: "${newText}"`);
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
              console.log(`\u274C Text change timeout`);
              reject(new Error("Text did not change within timeout"));
            }, timeout);
          });
        }
        /**
         * Wait for page to finish loading/changing after an action
         * @param {number} stabilityTime - Time in ms to wait for stability (default: 100)
         * @param {number} timeout - Maximum timeout
         * @returns {Promise<void>}
         */
        static waitForPageStability(stabilityTime = 100, timeout = 5e3) {
          return new Promise((resolve, reject) => {
            let lastMutation = Date.now();
            let stabilityTimer;
            console.log(`\u{1F50D} Waiting for page stability (${stabilityTime}ms)`);
            const observer = new MutationObserver(() => {
              lastMutation = Date.now();
              clearTimeout(stabilityTimer);
              stabilityTimer = setTimeout(() => {
                console.log(`\u2705 Page stable for ${stabilityTime}ms`);
                observer.disconnect();
                resolve();
              }, stabilityTime);
            });
            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true
            });
            stabilityTimer = setTimeout(() => {
              console.log(`\u2705 Page stable for ${stabilityTime}ms`);
              observer.disconnect();
              resolve();
            }, stabilityTime);
            setTimeout(() => {
              observer.disconnect();
              clearTimeout(stabilityTimer);
              console.log(`\u274C Page stability timeout`);
              reject(new Error("Page did not stabilize within timeout"));
            }, timeout);
          });
        }
      };
    }
  });

  // src/automation/withdrawal-automation.js
  var WithdrawalAutomation;
  var init_withdrawal_automation = __esm({
    "src/automation/withdrawal-automation.js"() {
      init_dom_utils();
      init_dom_observer();
      WithdrawalAutomation = class {
        constructor(dataScraper, itemFilter) {
          this.dataScraper = dataScraper;
          this.itemFilter = itemFilter;
          this.maxWithdrawRetries = 3;
          this.autoClearInterval = null;
          this.scanInterval = null;
          this.domObserver = null;
          this.isRunning = false;
          this.isRefreshing = false;
          this.id = "withdrawal-automation";
          this.priority = 1;
          this.interval = 1e4;
          this.settings = {
            scanInterval: 1e4,
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
          this.startPeriodicScan(1e4);
          this.domObserver = new MutationObserver((mutations) => {
            if (!this.isRunning) return;
            for (const mutation of mutations) {
              if (mutation.type !== "childList") continue;
              for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                const cards = node.classList?.contains("item-card") ? [node] : Array.from(node.querySelectorAll(".item-card"));
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
            if (!itemData.name || itemData.name === "N/A") return;
            if (this.dataScraper.isItemProcessed(itemData.name)) return;
            if (!card.querySelector("span.lh-16.fw-600.fs-10.ng-star-inserted")) {
              if (retryCount < 3) {
                setTimeout(() => {
                  if (!this.isRunning) return;
                  if (this.dataScraper.isItemProcessed(itemData.name)) return;
                  this._handleNewCard(card, retryCount + 1);
                }, 50);
              }
              return;
            }
            const passes = this.itemFilter.filterItems([itemData]).length > 0;
            if (!passes) return;
            this.dataScraper.addProcessedItem(itemData.name);
            this.processItemFast(itemData, 0).catch(
              (err) => console.error(`Observer: error processing ${itemData.name}:`, err)
            );
          } catch (err) {
            console.error("Observer: _handleNewCard error:", err);
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
              console.log("Filtered items:", filteredItems);
              if (filteredItems.length > 0) {
                await this.autoWithdrawItems(filteredItems);
              }
            } catch (error) {
              console.error("Error during periodic scan:", error);
            }
          }, intervalMs);
          this.startAutoClear(30);
        }
        stopPeriodicScan() {
          if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
          }
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
          console.log(`\u{1F680} Processing ${newItems.length} new items with zero delays`);
          for (let index = 0; index < newItems.length; index++) {
            try {
              await this.processItemFast(newItems[index], index);
            } catch (error) {
              console.error(`\u274C Error processing item ${newItems[index].name}:`, error);
              this.dataScraper.addProcessedItem(newItems[index].name);
            }
          }
          console.log(`\u2705 Completed processing ${newItems.length} items`);
        }
        async processItemFast(item, index) {
          const itemCard = this.dataScraper.findItemCardByName(item.name);
          if (!itemCard) {
            console.log(`\u274C Item card not found: ${item.name}`);
            return;
          }
          const currentItemData = this.dataScraper.extractItemData(itemCard);
          const stillMeetsFilters = this.itemFilter.filterItems([currentItemData]).length > 0;
          if (!stillMeetsFilters) {
            console.log(`\u26A0\uFE0F Item no longer meets filters: ${item.name}`);
            this.dataScraper.addProcessedItem(item.name);
            return;
          }
          this.dataScraper.addProcessedItem(item.name);
          console.log(`\u{1F5B1}\uFE0F Clicking item: ${item.name}`);
          itemCard.click();
          try {
            await this.attemptItemWithdrawalFast(item);
          } catch (error) {
            console.error(`\u274C Withdrawal failed for ${item.name}:`, error);
            await this.closeAnyModals();
          }
        }
        async attemptItemWithdrawalFast(item) {
          console.log(`\u{1F4B0} Attempting fast withdrawal for: ${item.name}`);
          try {
            const withdrawButton = await DOMObserver.waitForCondition(
              () => {
                const buttons = document.querySelectorAll("button");
                return Array.from(buttons).find(
                  (btn) => btn.textContent.toLowerCase().includes("withdraw")
                );
              },
              3e3,
              "withdraw button to appear"
            ).then(() => {
              const buttons = document.querySelectorAll("button");
              return Array.from(buttons).find(
                (btn) => btn.textContent.toLowerCase().includes("withdraw")
              );
            });
            if (!withdrawButton) {
              throw new Error("Withdraw button not found");
            }
            console.log(`\u{1F50D} Found withdraw button for: ${item.name}`);
            this.clickMaxButtonFast();
            await DOMObserver.waitForElementEnabled(withdrawButton, 2e3);
            console.log(`\u{1F5B1}\uFE0F Clicking withdraw button for: ${item.name}`);
            withdrawButton.click();
            await this.handleWithdrawalResultFast(item, withdrawButton);
          } catch (error) {
            console.error(`\u274C Fast withdrawal failed for ${item.name}:`, error);
            throw error;
          }
        }
        async handleWithdrawalResultFast(item, withdrawButton) {
          console.log(`\u{1F4CB} Checking withdrawal result for: ${item.name}`);
          try {
            await DOMObserver.waitForPageStability(50, 3e3);
            const pageText = document.body.innerText || "";
            const notJoinableError = pageText.toLowerCase().includes("this trade is not joinable");
            if (notJoinableError) {
              console.log(`\u26A0\uFE0F Trade not joinable error for: ${item.name}`);
              await this.handleNotJoinableError(item);
              return;
            }
            if (withdrawButton.disabled) {
              console.log(`\u2705 Withdrawal successful for: ${item.name}`);
              await this.closeModalSuccessfully();
              return;
            }
            if (pageText.toLowerCase().includes("success") || pageText.toLowerCase().includes("completed") || pageText.toLowerCase().includes("withdrawn")) {
              console.log(`\u2705 Withdrawal success detected for: ${item.name}`);
              await this.closeModalSuccessfully();
              return;
            }
            console.log(`\u{1F504} Unclear result, waiting for confirmation: ${item.name}`);
            await DOMObserver.waitForCondition(
              () => {
                const newText = document.body.innerText || "";
                return newText.toLowerCase().includes("success") || newText.toLowerCase().includes("error") || withdrawButton.disabled;
              },
              2e3,
              "withdrawal confirmation"
            );
            if (withdrawButton.disabled) {
              console.log(`\u2705 Withdrawal confirmed successful for: ${item.name}`);
              await this.closeModalSuccessfully();
            } else {
              console.log(`\u274C Withdrawal may have failed for: ${item.name}`);
              await this.closeAnyModals();
            }
          } catch (error) {
            console.error(`\u274C Error handling withdrawal result for ${item.name}:`, error);
            await this.closeAnyModals();
          }
        }
        async handleNotJoinableError(item) {
          console.log(`Item sold to another user: ${item.name} \u2014 triggering page reload`);
          if (this.isRefreshing) {
            console.log("Page reload already queued, skipping duplicate trigger");
            return;
          }
          this.isRefreshing = true;
          this.stopPeriodicScan();
          localStorage.setItem("sniper-auto-restart", "1");
          console.log("Reloading page to clear stale items...");
          location.reload();
        }
        async closeModalSuccessfully() {
          console.log(`\u2705 Closing modal after successful withdrawal`);
          try {
            this.clickMaxButtonFast();
            await this.closeAnyModals();
          } catch (error) {
            console.error(`\u274C Error closing modal:`, error);
          }
        }
        async closeAnyModals() {
          console.log(`\u{1F6AA} Closing any open modals`);
          try {
            const closeSelectors = [
              "button.close",
              ".modal-close",
              'button[aria-label="Close"]',
              'button[data-test*="close"]',
              ".overlay",
              ".backdrop"
            ];
            for (const selector of closeSelectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                console.log(`\u{1F5B1}\uFE0F Clicking close element: ${selector}`);
                elements.forEach((el) => el.click());
                break;
              }
            }
            const safeArea = document.querySelector(".header") || document.body;
            const rect = safeArea.getBoundingClientRect();
            const coordinates = {
              x: rect.left + 10,
              y: rect.top + 10
            };
            DOMUtils.dispatchClickEvent(safeArea, coordinates);
            await DOMObserver.waitForElementToDisappear('.modal, .dialog, [role="dialog"]', 1e3);
          } catch (error) {
            console.log(`\u26A0\uFE0F Could not detect modal closure, continuing...`);
          }
        }
        clickMaxButtonFast() {
          try {
            const maxSelectors = [
              'button[class*="mat-flat-button"][class*="text-capitalize"]',
              'button:contains("Max")',
              'button[data-test*="max"]',
              "button.max-button"
            ];
            for (const selector of maxSelectors) {
              const buttons = document.querySelectorAll(selector);
              for (const button of buttons) {
                if (button.textContent.trim().toLowerCase().includes("max")) {
                  console.log("\u{1F518} Clicking Max button");
                  button.click();
                  return true;
                }
              }
            }
            console.log("\u26A0\uFE0F Max button not found");
            return false;
          } catch (error) {
            console.error("\u274C Error clicking Max button:", error);
            return false;
          }
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
            priceThreshold: this.loadPriceThreshold(),
            // Load from localStorage
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
        loadPriceThreshold() {
          const stored = localStorage.getItem("market-monitor-price-threshold");
          return stored ? parseFloat(stored) : 0.05;
        }
        updatePriceThreshold(newThreshold) {
          this.settings.priceThreshold = newThreshold;
          localStorage.setItem("market-monitor-price-threshold", newThreshold.toString());
          console.log(`Price threshold updated to ${(newThreshold * 100).toFixed(1)}%`);
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
          this._tradeConfirmInProgress = false;
          this._monitoringActive = false;
          this.id = "sell-item-verification";
          this.priority = 2;
          this.settings = {
            enabled: true,
            maxWaitTime: 3e4,
            // 30 seconds max wait per step
            stepCheckInterval: 2e3,
            // Check every 2000ms
            logTradeData: true
          };
          this.initializeCrossPageState();
        }
        // Cross-page state management - ONLY for Steam pages
        initializeCrossPageState() {
          console.log("\u{1F504} SellItemVerification: Initializing cross-page state...");
          console.log("\u{1F504} Page hostname:", window.location.hostname);
          console.log("\u{1F504} Is Steam page:", this.isSteamPage());
          console.log("\u{1F504} Is CSGORoll page:", this.isCSGORollPage());
          if (!this.isSteamPage()) {
            console.log("\u{1F6AB} Not on Steam page - skipping state restoration");
            return;
          }
          const urlState = this.decodeDataFromUrlParams();
          if (urlState) {
            console.log("\u2705 Found automation data in URL parameters on Steam page");
            console.log("   - Step:", urlState.currentStep);
            console.log("   - Item name:", urlState.collectedData?.itemName || "MISSING");
            console.log("   - Inventory page:", urlState.collectedData?.inventoryPage || "MISSING");
            console.log("   - Item position:", urlState.collectedData?.itemPosition || "MISSING");
            if (!urlState.collectedData || !urlState.collectedData.itemName) {
              console.log("\u26A0\uFE0F Warning: On Steam page but missing critical item data");
            } else {
              console.log("\u2705 Steam page has all required item data - restoring state");
              this.collectedData = urlState.collectedData;
              this.currentStep = urlState.currentStep || "navigate_inventory";
              console.log("\u{1F504} State restored from URL parameters:", {
                currentStep: this.currentStep,
                collectedData: this.collectedData
              });
            }
          } else {
            console.log("\u{1F50D} No URL parameters found on Steam page");
          }
        }
        // Removed saveState(), validateState(), and loadState() methods
        // Cross-domain state transfer now uses URL parameters exclusively
        // URL parameter utility methods for cross-domain data transfer
        encodeDataToUrlParams(data) {
          try {
            const compactData = {
              n: data.itemName || "",
              // name
              c: data.itemCategory || "",
              // category
              v: data.itemValue || "",
              // value
              p: data.inventoryPage || 1,
              // page
              i: data.itemPosition || 1,
              // item position
              s: "navigate_inventory",
              // step
              t: Date.now()
              // timestamp
            };
            const jsonString = JSON.stringify(compactData);
            const encoded = btoa(encodeURIComponent(jsonString));
            console.log("\u{1F517} Encoded data for URL:", compactData);
            console.log("\u{1F517} Base64 encoded:", encoded);
            return encoded;
          } catch (error) {
            console.error("\u274C Failed to encode data for URL:", error);
            return null;
          }
        }
        decodeDataFromUrlParams() {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedData = urlParams.get("automation_data");
            if (!encodedData) {
              console.log("\u{1F50D} No automation_data parameter found in URL");
              return null;
            }
            console.log("\u{1F517} Found encoded data in URL:", encodedData);
            const jsonString = decodeURIComponent(atob(encodedData));
            const compactData = JSON.parse(jsonString);
            console.log("\u{1F517} Decoded compact data:", compactData);
            const fullData = {
              itemName: compactData.n || "Unknown",
              itemCategory: compactData.c || "Unknown",
              itemValue: compactData.v || "Unknown",
              inventoryPage: compactData.p || 1,
              itemPosition: compactData.i || 1,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            const ageMinutes = (Date.now() - compactData.t) / (1e3 * 60);
            if (ageMinutes > 10) {
              console.log("\u274C URL data is too old:", ageMinutes.toFixed(1), "minutes");
              return null;
            }
            console.log("\u2705 Successfully decoded automation data from URL:", fullData);
            return {
              collectedData: fullData,
              currentStep: compactData.s || "navigate_inventory",
              isActive: true,
              timestamp: compactData.t
            };
          } catch (error) {
            console.error("\u274C Failed to decode data from URL:", error);
            return null;
          }
        }
        // Removed clearState() method - no longer using localStorage
        isSteamPage() {
          return window.location.hostname.includes("steamcommunity.com");
        }
        isCSGORollPage() {
          return window.location.hostname.includes("csgoroll.com");
        }
        // Automation manager lifecycle methods
        start() {
          console.log("\u{1F680} Starting SellItemVerification automation...");
          this.isRunning = true;
          if (this.isCSGORollPage()) {
            this.currentStep = "waiting_for_trade_popup";
            console.log("\u{1F504} Starting fresh automation from Yes Im ready");
          } else if (this.isSteamPage()) {
            if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
              this.currentStep = "navigate_inventory";
              console.log("\u{1F504} Starting fresh on Steam - Navigating Inventory");
            } else {
              console.log("\u{1F504} Using restored state - Current step:", this.currentStep);
              console.log("\u{1F504} Restored data:", this.collectedData);
            }
          }
          this.startStepMonitoring();
          console.log("\u2705 SellItemVerification automation started");
          console.log("\u{1F4CB} Current automation state:", {
            currentStep: this.currentStep,
            isRunning: this.isRunning,
            hasCollectedData: Object.keys(this.collectedData).length > 0
          });
        }
        stop() {
          console.log("\u{1F6D1} Stopping SellItemVerification automation...");
          this.isRunning = false;
          this.currentStep = "idle";
          this.clearAllTimeouts();
          this.collectedData = {};
          this.tradeLog = [];
          console.log("\u2705 SellItemVerification automation stopped and reset");
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
            console.warn("[SellItemVerification] startStepMonitoring() called while already active \u2014 ignoring duplicate start");
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
          if (!this.isRunning) {
            console.log(`\u23F8\uFE0F Automation stopped, skipping step: ${this.currentStep}`);
            return;
          }
          console.log(`\u{1F504} Executing step: ${this.currentStep} (${this.isSteamPage() ? "Steam" : "CSGORoll"} page)`);
          switch (this.currentStep) {
            case "waiting_for_trade_popup":
              if (this.isCSGORollPage()) {
                this.step1_WaitForTradePopup();
              } else {
                console.log("Skipping wait_for_continue on Steam page");
              }
              break;
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
              document.querySelector("button[mat-dialog-close]")?.click();
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
        step1_WaitForContinue() {
          const continueButton = this.findButtonByText("Continue");
          if (continueButton) {
            console.log('Found "Continue" button');
            continueButton.click();
            this.currentStep = "extract_item_data";
            this.logStep('Clicked "Continue" button');
          }
        }
        // Step 2: Item Dialog Extraction with retry logic
        step2_ExtractItemData() {
          console.log("\u{1F50D} Step 2: Extracting item data from dialog");
          if (!this.extractionAttempts) {
            this.extractionAttempts = 0;
            this.maxExtractionAttempts = 5;
            this.extractionDelay = 2e3;
          }
          this.extractionAttempts++;
          console.log(`\u{1F4CB} Extraction attempt ${this.extractionAttempts}/${this.maxExtractionAttempts}`);
          const modal = document.querySelector("mat-dialog-container");
          if (!modal) {
            console.log("\u274C No modal dialog found");
            this.retryExtraction("No modal dialog found");
            return;
          }
          console.log("\u2705 Modal dialog found, waiting for content to load...");
          setTimeout(() => {
            this.performDataExtraction(modal);
          }, 1e3);
        }
        performDataExtraction(modal) {
          console.log("\u{1F50D} Performing data extraction...");
          console.log("\u{1F4CB} Modal HTML preview:", modal.outerHTML.substring(0, 500) + "...");
          try {
            const categoryElement = modal.querySelector('span[data-test="item-subcategory"]');
            const itemCategory = categoryElement ? categoryElement.textContent.trim() : "Unknown";
            console.log("\u{1F4C2} Item category:", itemCategory);
            const labelElement = modal.querySelector("label[title]");
            const itemName = labelElement ? labelElement.getAttribute("title") : "Unknown";
            console.log("\u{1F3F7}\uFE0F Item name:", itemName);
            const valueElement = modal.querySelector("span.currency-value");
            const itemValue = valueElement ? valueElement.textContent.trim() : "Unknown";
            console.log("\u{1F4B0} Item value:", itemValue);
            const pageText = modal.textContent || "";
            const pageMatch = pageText.match(/On page (\d+) of your Steam inventory/i);
            const inventoryPage = pageMatch ? parseInt(pageMatch[1]) : 1;
            console.log("\u{1F4C4} Inventory page:", inventoryPage);
            const itemPosition = this.calculateItemPosition(modal);
            console.log("\u{1F4CD} Item position:", itemPosition);
            const extractedData = {
              itemName,
              itemCategory,
              itemValue,
              inventoryPage,
              itemPosition,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (this.validateExtractedData(extractedData, modal)) {
              this.collectedData = extractedData;
              console.log("\u2705 Successfully extracted complete item data:", this.collectedData);
              this.logStep("Extracted item data", this.collectedData);
              this.currentStep = "send_items";
              this.extractionAttempts = 0;
            } else {
              console.log("\u26A0\uFE0F Extracted data is incomplete or invalid");
              this.retryExtraction("Data validation failed");
            }
          } catch (error) {
            console.error("\u274C Error extracting item data:", error);
            this.logError(error);
            this.retryExtraction(`Extraction error: ${error.message}`);
          }
        }
        validateExtractedData(data, modal) {
          const issues = [];
          if (!data.itemName || data.itemName === "Unknown" || data.itemName.length < 3) {
            issues.push("Invalid or missing item name");
          }
          if (!data.itemCategory || data.itemCategory === "Unknown") {
            issues.push("Invalid or missing item category");
          }
          if (!data.itemValue || data.itemValue === "Unknown") {
            issues.push("Invalid or missing item value");
          }
          if (data.itemPosition < 0) {
            console.log("\u274C item position fetch failed");
            console.log("Got value: ", data.itemPosition);
            issues.push("Invalid Item Position fetched");
          }
          if (issues.length > 0) {
            console.log("\u274C Data validation failed:", issues);
            console.log("\u{1F4CB} Current extracted data:", data);
            return false;
          }
          console.log("\u2705 Data validation passed");
          return true;
        }
        retryExtraction(reason) {
          if (this.extractionAttempts < this.maxExtractionAttempts) {
            console.log(`\u{1F504} Retrying extraction in ${this.extractionDelay / 1e3} seconds (Reason: ${reason})`);
            setTimeout(() => {
              this.step2_ExtractItemData();
            }, this.extractionDelay);
          } else {
            console.error("\u274C Maximum extraction attempts reached. Extraction failed.");
            this.logStep(`Extraction failed after ${this.maxExtractionAttempts} attempts: ${reason}`);
            this.extractionAttempts = 0;
            console.log("\u23F8\uFE0F Staying in extract_item_data step due to failed extraction");
          }
        }
        calculateItemPosition(modal) {
          try {
            const gridItems = document.querySelectorAll(".item");
            console.log("Got grid items: ", gridItems);
            if (gridItems.length === 0) return -1;
            const selectedItem = modal.querySelector(".item.selected");
            console.log("Selected item, ", selectedItem);
            if (selectedItem) {
              const itemIndex = Array.from(gridItems).indexOf(selectedItem);
              return itemIndex >= 0 ? itemIndex + 1 : 1;
            }
            return -2;
          } catch (error) {
            console.error("Error calculating item position:", error);
            return -3;
          }
        }
        step2_SendItems() {
          const sendButton = this.findButtonByText("Send Items Now");
          if (sendButton) {
            console.log('\u{1F50D} Found "Send Items Now" button');
            if (!this.collectedData || Object.keys(this.collectedData).length === 0) {
              console.error("\u274C No collected data available - cannot transfer to Steam page");
              this.logStep("Send Items failed: No collected data");
              return;
            }
            console.log("\u{1F4CB} Current collected data before transfer:", this.collectedData);
            console.log("\u{1F517} Encoding data for cross-domain transfer...");
            const encodedData = this.encodeDataToUrlParams(this.collectedData);
            if (!encodedData) {
              console.error("\u274C Failed to encode data for URL transfer");
              this.logStep("Send Items failed: Data encoding failed");
              return;
            }
            console.log("\u{1F517} Button element details:", {
              tagName: sendButton.tagName,
              href: sendButton.href,
              onclick: sendButton.onclick,
              hasHref: !!sendButton.href
            });
            if (sendButton.href) {
              console.log("\u{1F4CE} Button is a link - modifying href");
              const originalHref = sendButton.href;
              const separator = originalHref.includes("?") ? "&" : "?";
              const newHref = `${originalHref}${separator}automation_data=${encodedData}`;
              console.log("\u{1F517} Original URL:", originalHref);
              console.log("\u{1F517} Modified URL:", newHref);
              sendButton.href = newHref;
              sendButton.click();
            } else {
              console.log("\u{1F6AB} Button is not a link - need to intercept Steam URL generation");
              window.PENDING_AUTOMATION_DATA = encodedData;
              console.log("\u{1F4BE} Stored automation data temporarily");
              const originalWindowOpen = window.open;
              window.open = function(url, target, features) {
                console.log("\u{1F310} Intercepted window.open:", url);
                if (url && url.includes("steamcommunity.com")) {
                  const separator = url.includes("?") ? "&" : "?";
                  const modifiedUrl = `${url}${separator}automation_data=${window.PENDING_AUTOMATION_DATA}`;
                  console.log("\u2705 Modified Steam URL:", modifiedUrl);
                  delete window.PENDING_AUTOMATION_DATA;
                  window.open = originalWindowOpen;
                  return originalWindowOpen.call(this, modifiedUrl, target, features);
                }
                return originalWindowOpen.call(this, url, target, features);
              };
              sendButton.click();
              setTimeout(() => {
                if (window.PENDING_AUTOMATION_DATA) {
                  console.log("\u26A0\uFE0F Timeout - restoring window.open");
                  window.open = originalWindowOpen;
                  delete window.PENDING_AUTOMATION_DATA;
                }
              }, 5e3);
            }
            console.log("\u2705 Button click initiated with data encoding");
            this.logStep("Data encoded and button clicked - Steam page should receive data");
            this.currentStep = "waiting_for_steam_completion";
          } else {
            console.log('\u274C "Send Items Now" button not found');
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
          console.log(`\u{1F4CD} Target position: ${this.collectedData.itemPosition}`);
          console.log(`\u{1F4C4} Current page URL: ${window.location.href}`);
          console.log("\u{1F50D} Searching for inventory items...");
          let inventoryItems = document.querySelectorAll(".item");
          console.log(`\u{1F3AE} CS:GO items found: ${inventoryItems.length}`);
          console.log("\u{1F3D7}\uFE0F Page structure analysis:");
          console.log("- Inventory containers:", document.querySelectorAll('[class*="inventory"], [id*="inventory"]').length);
          console.log("- Item containers:", document.querySelectorAll('[class*="item"], [id*="item"]').length);
          console.log("- Trade elements:", document.querySelectorAll('[class*="trade"], [id*="trade"]').length);
          if (inventoryItems.length === 0) {
            console.log("\u274C No inventory items found, waiting...");
            return;
          }
          const targetItem = this.findTargetItem(inventoryItems);
          if (targetItem) {
            console.log("\u2705 Found target item, double-clicking");
            console.log("\u{1F3AF} Target item details:", {
              element: targetItem,
              title: targetItem.getAttribute("title") || "",
              alt: targetItem.querySelector("img")?.getAttribute("alt") || "",
              className: targetItem.className,
              position: Array.from(inventoryItems).indexOf(targetItem) + 1
            });
            targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
              console.log("\u{1F5B1}\uFE0F Executing double-click on target item...");
              this.doubleClickElement(targetItem);
              this.logStep("Double-clicked target item");
            }, 500);
            this.currentStep = "confirm_trade";
          } else {
            console.log("\u274C Target item not found on current page");
            console.log(`\u{1F3AF} Looking for: "${this.collectedData.itemName}" at position ${this.collectedData.itemPosition}`);
            this.logStep("Target item not found on current page");
          }
        }
        findTargetItem(inventoryItems) {
          const targetName = this.collectedData.itemName;
          const targetPage = this.collectedData.inventoryPage;
          const targetPosition = this.collectedData.itemPosition;
          const absoloutePosition = (targetPage - 1) * 16 + targetPosition;
          console.log(this.collectedData);
          console.log(targetName, targetPage, targetPosition, absoloutePosition);
          console.log(`\u{1F3AF} Searching for target item: "${targetName}" at position ${targetPosition}`);
          console.log(`\u{1F4CA} Total inventory items to search: ${inventoryItems.length}`);
          console.log(`\u{1F50D} Method 2: Searching by position ${targetPosition}...`);
          console.log(absoloutePosition, inventoryItems.length, absoloutePosition <= inventoryItems.length && absoloutePosition > 0);
          if (absoloutePosition <= inventoryItems.length && absoloutePosition > 0) {
            console.log("Target position is valid.");
            const item = inventoryItems[absoloutePosition - 1];
            const title = item.getAttribute("title") || "";
            const alt = item.querySelector("img")?.getAttribute("alt") || "";
            console.log(`\u{1F4CD} Found item at position ${targetPosition}, absolute position ${absoloutePosition}:`, {
              title,
              alt,
              element: item
            });
            return item;
          }
          console.log("\u274C Target item not found by position or name");
          return null;
        }
        doubleClickElement(element) {
          console.log("\u{1F5B1}\uFE0F Starting double-click sequence...");
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
          try {
            const dblClickEvent = new MouseEvent("dblclick", mouseEventOptions);
            element.dispatchEvent(dblClickEvent);
            console.log("\u2705 Dispatched dblclick event");
            setTimeout(() => {
              const clickEvent1 = new MouseEvent("click", mouseEventOptions);
              element.dispatchEvent(clickEvent1);
              console.log("\u2705 Dispatched first click event");
              setTimeout(() => {
                const clickEvent2 = new MouseEvent("click", mouseEventOptions);
                element.dispatchEvent(clickEvent2);
                console.log("\u2705 Dispatched second click event");
              }, 50);
            }, 100);
            if (typeof element.click === "function") {
              setTimeout(() => {
                element.click();
                console.log("\u2705 Called element.click()");
              }, 200);
            }
          } catch (error) {
            console.error("\u274C Error during double-click:", error);
          }
        }
        // Step 4: Trade Confirmation — entry point called by executeCurrentStep every 2000ms
        step4_ConfirmTrade() {
          console.log("[step4_ConfirmTrade] called, isSteamPage:", this.isSteamPage(), "_tradeConfirmInProgress:", this._tradeConfirmInProgress);
          if (!this.isSteamPage()) {
            console.log("[step4_ConfirmTrade] Not on Steam page \u2014 skipping");
            return;
          }
          if (this._tradeConfirmInProgress) {
            console.log("[step4_ConfirmTrade] Trade confirm already in progress \u2014 skipping duplicate call");
            return;
          }
          this._tradeConfirmInProgress = true;
          console.log("[step4_ConfirmTrade] Starting sequential trade confirmation chain");
          this._startSequentialTradeConfirm();
        }
        // Launches the sequential step chain: 4a → 4b → 4c → 4d
        _startSequentialTradeConfirm() {
          this._waitForAndClick("#you_notready", "step-4a (#you_notready)", 2e3, () => {
            this._waitForAndClick(".btn_green_steamui.btn_medium", "step-4b (.btn_green_steamui.btn_medium)", 1500, () => {
              this._waitForAndClick("#trade_confirmbtn", "step-4c (#trade_confirmbtn)", 1e3, () => {
                this._waitForAndClickOkSpan("step-4d (OK span)", 500, () => {
                  console.log("[trade-confirm] All 4 steps complete \u2014 marking currentStep = complete");
                  this._tradeConfirmInProgress = false;
                  this.currentStep = "complete";
                });
              });
            });
          });
        }
        // Generic sequential step: poll for selector, store interval handle, click on find, call onComplete
        _waitForAndClick(selector, label, clickDelay, onComplete) {
          const maxAttempts = 30;
          let attempts = 0;
          console.log(`[_waitForAndClick] Waiting for ${label} (max ${maxAttempts} attempts @ 300ms)`);
          const intervalId = setInterval(() => {
            attempts++;
            const el = document.querySelector(selector);
            console.log(`[_waitForAndClick] attempt ${attempts}/${maxAttempts} \u2014 selector "${selector}" found:`, !!el);
            if (el) {
              clearInterval(intervalId);
              this.stepTimeouts.delete(intervalId);
              console.log(`[_waitForAndClick] Found ${label} \u2014 clicking after ${clickDelay}ms delay`);
              const clickTimerId = setTimeout(() => {
                el.click();
                this.logStep(`Clicked ${label}`, el);
                console.log(`[_waitForAndClick] Clicked ${label} \u2014 invoking onComplete`);
                onComplete();
              }, clickDelay);
              this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              this.stepTimeouts.delete(intervalId);
              console.warn(`[_waitForAndClick] Timed out waiting for ${label} after ${attempts} attempts \u2014 trade chain halted`);
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
            const okSpan = Array.from(document.querySelectorAll("span")).find((el) => el.textContent.trim() === "OK");
            console.log(`[_waitForAndClickOkSpan] attempt ${attempts}/${maxAttempts} \u2014 OK span found:`, !!okSpan);
            if (okSpan) {
              clearInterval(intervalId);
              this.stepTimeouts.delete(intervalId);
              console.log(`[_waitForAndClickOkSpan] Found OK span \u2014 clicking after ${clickDelay}ms delay`);
              const clickTimerId = setTimeout(() => {
                okSpan.click();
                if (okSpan.parentElement) {
                  okSpan.parentElement.click();
                  console.log("[_waitForAndClickOkSpan] Also clicked parent of OK span");
                }
                this.logStep(`Clicked ${label}`, okSpan);
                console.log(`[_waitForAndClickOkSpan] Clicked ${label} \u2014 invoking onComplete`);
                onComplete();
              }, clickDelay);
              this.stepTimeouts.set(clickTimerId, clickTimerId);
            } else if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              this.stepTimeouts.delete(intervalId);
              console.warn(`[_waitForAndClickOkSpan] Timed out waiting for ${label} \u2014 trade chain halted`);
              this._tradeConfirmInProgress = false;
            }
          }, 300);
          this.stepTimeouts.set(intervalId, intervalId);
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
          console.log("Steam automation completion check - assuming completed (no localStorage)");
          this.currentStep = "complete";
        }
        completeVerification() {
          this.logTradeCompletion();
          this.resetForNextTrade();
          console.log("Trade verification completed successfully");
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
          console.log(`[clearAllTimeouts] Cancelling ${this.stepTimeouts.size} tracked timers/intervals`);
          this.stepTimeouts.forEach((id) => {
            clearInterval(id);
            clearTimeout(id);
          });
          this.stepTimeouts.clear();
          this._tradeConfirmInProgress = false;
          this._monitoringActive = false;
        }
        resetForNextTrade() {
          this.stop();
          this.start();
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
          console.log("Starting automation with ID", id);
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
        getAutomation(id) {
          const automation = this.automations.get(id);
          return automation ? automation.instance : null;
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
            flexWrap: "wrap",
            marginBottom: Theme.spacing.md
          });
          const startBtn = UIComponents.createButton("Start Monitoring", "success", "md", () => {
            this.automationManager.startAutomation("market-monitor");
          });
          const stopBtn = UIComponents.createButton("Stop Monitoring", "error", "md", () => {
            this.automationManager.stopAutomation("market-monitor");
          });
          buttonGroup.appendChild(startBtn);
          buttonGroup.appendChild(stopBtn);
          const settingsContainer = DOMUtils.createElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: Theme.spacing.sm,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`
          });
          const settingsTitle = UIComponents.createLabel("Settings", {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.xs
          });
          const thresholdContainer = DOMUtils.createElement("div", {
            display: "flex",
            alignItems: "center",
            gap: Theme.spacing.sm
          });
          const thresholdLabel = UIComponents.createLabel("Price Threshold:", {
            marginBottom: "0",
            fontSize: Theme.typography.fontSize.sm,
            minWidth: "100px"
          });
          const thresholdInput = UIComponents.createInput("number", {
            width: "80px"
          }, {
            min: "0.01",
            max: "1.0",
            step: "0.01",
            value: "0.05",
            id: "price-threshold-input"
          });
          const thresholdPercent = UIComponents.createLabel("%", {
            marginBottom: "0",
            fontSize: Theme.typography.fontSize.sm
          });
          const applyBtn = UIComponents.createButton("Apply", "primary", "sm", () => {
            const newThreshold = parseFloat(thresholdInput.value) / 100;
            const marketMonitor = this.automationManager.getAutomation("market-monitor");
            if (marketMonitor && marketMonitor.updatePriceThreshold) {
              marketMonitor.updatePriceThreshold(newThreshold);
              const originalText = applyBtn.textContent;
              applyBtn.textContent = "\u2713 Applied";
              applyBtn.style.backgroundColor = Theme.colors.success;
              setTimeout(() => {
                applyBtn.textContent = originalText;
                applyBtn.style.backgroundColor = "";
              }, 1500);
            }
          });
          thresholdContainer.appendChild(thresholdLabel);
          thresholdContainer.appendChild(thresholdInput);
          thresholdContainer.appendChild(thresholdPercent);
          thresholdContainer.appendChild(applyBtn);
          settingsContainer.appendChild(settingsTitle);
          settingsContainer.appendChild(thresholdContainer);
          panel.appendChild(title);
          panel.appendChild(buttonGroup);
          panel.appendChild(settingsContainer);
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
        updateMarketMonitorContent(container) {
          const thresholdInput = container.querySelector("#price-threshold-input");
          if (thresholdInput && document.activeElement !== thresholdInput) {
            const marketMonitor = this.automationManager.getAutomation("market-monitor");
            if (marketMonitor) {
              const currentThreshold = (marketMonitor.settings.priceThreshold * 100).toFixed(1);
              if (thresholdInput.value !== currentThreshold) {
                thresholdInput.value = currentThreshold;
              }
            }
          }
          const alertsList = container.querySelector("#price-alerts-list");
          if (alertsList) {
            this.updatePriceAlerts(alertsList);
          }
          const itemsList = container.querySelector("#monitored-items-list");
          if (itemsList) {
            this.updateMonitoredItems(itemsList);
          }
        }
        updatePriceAlerts(container) {
          const marketMonitor = this.automationManager.getAutomation("market-monitor");
          if (!marketMonitor) {
            container.innerHTML = '<div style="text-align: center; color: #666;">Market Monitor not available</div>';
            return;
          }
          const alerts = marketMonitor.getRecentAlerts(10);
          container.innerHTML = "";
          if (alerts.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666;">No recent alerts</div>';
            return;
          }
          alerts.reverse().forEach((alert) => {
            const alertItem = DOMUtils.createElement("div", {
              padding: Theme.spacing.sm,
              marginBottom: Theme.spacing.xs,
              backgroundColor: alert.type === "price_increase" ? "#e8f5e8" : "#ffeee8",
              borderLeft: `3px solid ${alert.type === "price_increase" ? Theme.colors.success : Theme.colors.warning}`,
              borderRadius: Theme.borderRadius.sm,
              fontSize: Theme.typography.fontSize.sm
            });
            const timeStr = new Date(alert.timestamp).toLocaleTimeString();
            const changePercent = (Math.abs(alert.priceChange) * 100).toFixed(1);
            const direction = alert.type === "price_increase" ? "\u2197\uFE0F" : "\u2198\uFE0F";
            alertItem.innerHTML = `
                <div style="font-weight: bold;">${direction} ${alert.item.name}</div>
                <div>${changePercent}% price change at ${timeStr}</div>
            `;
            container.appendChild(alertItem);
          });
        }
        updateMonitoredItems(container) {
          const marketMonitor = this.automationManager.getAutomation("market-monitor");
          if (!marketMonitor) {
            container.innerHTML = '<div style="text-align: center; color: #666;">Market Monitor not available</div>';
            return;
          }
          const stats = marketMonitor.getStats();
          container.innerHTML = "";
          const statsInfo = DOMUtils.createElement("div", {
            textAlign: "center",
            padding: Theme.spacing.md,
            color: Theme.colors.onSurface
          });
          statsInfo.innerHTML = `
            <div style="font-size: ${Theme.typography.fontSize.xl}; font-weight: bold; margin-bottom: ${Theme.spacing.xs};">
                ${stats.monitoredItems}
            </div>
            <div>Items being monitored</div>
        `;
          container.appendChild(statsInfo);
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
          this.checkForSteamPageAutomation();
          if (localStorage.getItem("sniper-auto-restart") === "1") {
            localStorage.removeItem("sniper-auto-restart");
            console.log("Auto-restart: sniper was running before reload \u2014 restarting in 2s...");
            setTimeout(() => {
              try {
                this.handleStartSniper();
              } catch (error) {
                console.error("Auto-restart failed:", error);
              }
            }, 2e3);
          }
          console.log("MarketScraper initialized on:", window.location.hostname);
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
            padding: Theme.spacing.sm,
            height: "100%",
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: Theme.spacing.md,
            gridTemplateRows: "auto auto auto"
          });
          const configSection = DOMUtils.createElement("div", {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`,
            gridColumn: "1 / 3"
          });
          const jsonConfig = UIComponents.createJsonConfigSection((config) => {
            console.log("Market scraper received filter config:", config);
            this.itemFilter.setCustomFilterConfig(config);
            this.updateCurrentFilterDisplay(config);
            console.log("Filter applied to itemFilter and display updated");
          });
          const filterHeader = DOMUtils.createElement("div", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: Theme.spacing.xs
          });
          const compactLabel = UIComponents.createLabel("Filter Configuration", {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: "0"
          });
          const buttonContainer = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.xs
          });
          buttonContainer.appendChild(jsonConfig.loadButton);
          buttonContainer.appendChild(jsonConfig.clearButton);
          filterHeader.appendChild(compactLabel);
          filterHeader.appendChild(buttonContainer);
          const textboxContainer = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: Theme.spacing.sm,
            marginTop: Theme.spacing.xs
          });
          const currentFilterColumn = DOMUtils.createElement("div");
          currentFilterColumn.appendChild(jsonConfig.currentLabel);
          currentFilterColumn.appendChild(jsonConfig.currentTextarea);
          const inputFilterColumn = DOMUtils.createElement("div");
          inputFilterColumn.appendChild(jsonConfig.inputLabel);
          inputFilterColumn.appendChild(jsonConfig.inputTextarea);
          textboxContainer.appendChild(currentFilterColumn);
          textboxContainer.appendChild(inputFilterColumn);
          configSection.appendChild(filterHeader);
          configSection.appendChild(textboxContainer);
          const controlsSection = this.createSniperControls();
          controlsSection.style.gridColumn = "1";
          const statusSection = this.createSniperStatus();
          statusSection.style.gridColumn = "2";
          container.appendChild(configSection);
          container.appendChild(controlsSection);
          container.appendChild(statusSection);
          return container;
        }
        createSniperControls() {
          const section = DOMUtils.createElement("div", {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Sniper Controls", {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
          });
          const buttonContainer = DOMUtils.createElement("div", {
            display: "flex",
            gap: Theme.spacing.sm,
            justifyContent: "center",
            marginBottom: Theme.spacing.sm
          });
          const startButton = UIComponents.createButton("Start Sniper", "success", "md", () => {
            this.handleStartSniper();
          });
          const stopButton = UIComponents.createButton("Stop Sniper", "error", "md", () => {
            this.handleStopSniper();
          });
          buttonContainer.appendChild(startButton);
          buttonContainer.appendChild(stopButton);
          const settingsContainer = DOMUtils.createElement("div", {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surfaceVariant,
            borderRadius: Theme.borderRadius.sm,
            border: `1px solid ${Theme.colors.border}`,
            marginTop: Theme.spacing.sm
          });
          const settingsTitle = UIComponents.createLabel("Monitor Settings", {
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.xs
          });
          const thresholdContainer = DOMUtils.createElement("div", {
            display: "flex",
            alignItems: "center",
            gap: Theme.spacing.sm
          });
          const thresholdLabel = UIComponents.createLabel("Alert Threshold:", {
            marginBottom: "0",
            fontSize: Theme.typography.fontSize.xs,
            minWidth: "90px"
          });
          const thresholdInput = UIComponents.createInput("number", {
            width: "60px",
            fontSize: Theme.typography.fontSize.xs
          }, {
            min: "0",
            max: "100",
            step: "0.1",
            value: "5.0",
            id: "sniper-price-threshold-input"
          });
          thresholdInput.value = String(this.itemFilter.baseFilters.maxPercentageChange ?? 5.1);
          const thresholdPercent = UIComponents.createLabel("%", {
            marginBottom: "0",
            fontSize: Theme.typography.fontSize.sm
          });
          const applyBtn = UIComponents.createButton("Apply", "primary", "sm", () => {
            const rawValue = thresholdInput.value.trim();
            if (rawValue === "") {
              UIComponents.showNotification("Threshold cannot be empty", "error");
              return;
            }
            const parsed = Number(rawValue);
            if (isNaN(parsed)) {
              UIComponents.showNotification("Invalid threshold: must be a number", "error");
              return;
            }
            if (parsed < 0 || parsed > 100) {
              UIComponents.showNotification("Threshold must be between 0 and 100", "error");
              return;
            }
            this.itemFilter.updateBaseFilters({ maxPercentageChange: parsed });
            const marketMonitor = this.automationManager.getAutomation("market-monitor");
            if (marketMonitor && marketMonitor.updatePriceThreshold) {
              marketMonitor.updatePriceThreshold(parsed / 100);
            }
            UIComponents.showNotification(`Threshold set to ${parsed}%`, "success");
            const originalText = applyBtn.textContent;
            applyBtn.textContent = "\u2713 Applied";
            applyBtn.style.backgroundColor = Theme.colors.success;
            setTimeout(() => {
              applyBtn.textContent = originalText;
              applyBtn.style.backgroundColor = "";
            }, 1500);
          });
          thresholdContainer.appendChild(thresholdLabel);
          thresholdContainer.appendChild(thresholdInput);
          thresholdContainer.appendChild(thresholdPercent);
          thresholdContainer.appendChild(applyBtn);
          settingsContainer.appendChild(settingsTitle);
          settingsContainer.appendChild(thresholdContainer);
          section.appendChild(title);
          section.appendChild(buttonContainer);
          section.appendChild(settingsContainer);
          return section;
        }
        createSniperStatus() {
          const section = DOMUtils.createElement("div", {
            padding: Theme.spacing.sm,
            backgroundColor: Theme.colors.surface,
            borderRadius: Theme.borderRadius.md,
            border: `1px solid ${Theme.colors.border}`
          });
          const title = UIComponents.createLabel("Status", {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: Theme.typography.fontWeight.bold,
            marginBottom: Theme.spacing.sm
          });
          const statusGrid = DOMUtils.createElement("div", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: Theme.spacing.xs
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
          const thresholdInput = document.getElementById("sniper-price-threshold-input");
          if (thresholdInput && document.activeElement !== thresholdInput) {
            const marketMonitor = this.automationManager.getAutomation("market-monitor");
            if (marketMonitor) {
              const currentThreshold = (marketMonitor.settings.priceThreshold * 100).toFixed(1);
              if (thresholdInput.value !== currentThreshold) {
                thresholdInput.value = currentThreshold;
              }
            }
          }
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
        updateCurrentFilterDisplay(config) {
          const currentDisplay = document.getElementById("current-filter-display");
          if (currentDisplay) {
            if (config && config.length > 0) {
              currentDisplay.value = JSON.stringify(config, null, 2);
            } else {
              currentDisplay.value = "";
              currentDisplay.placeholder = "No filter currently active";
            }
          }
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
            this.sellItemVerification.isRunning = false;
            this.sellItemVerification.currentStep = "idle";
            this.sellItemVerification.collectedData = {};
            this.sellItemVerification.tradeLog = [];
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
          debugButtonContainer.appendChild(extractDataBtn);
          debugButtonContainer.appendChild(sendItemsBtn);
          debugButtonContainer.appendChild(navigateInventoryBtn);
          debugButtonContainer.appendChild(viewStateBtn);
          debugButtonContainer.appendChild(injectTestDataBtn);
          debugSection.appendChild(debugTitle);
          debugSection.appendChild(debugButtonContainer);
          return debugSection;
        }
        handleDebugExtractData() {
          console.log("\u{1F527} DEBUG: Manually triggering data extraction with retry logic");
          try {
            const modal = document.querySelector("mat-dialog-container");
            if (!modal) {
              console.log("\u26A0\uFE0F No modal found - you may need to open a trade dialog first");
              UIComponents.showNotification("No modal found - open trade dialog first", "warning");
              return;
            }
            this.sellItemVerification.extractionAttempts = 0;
            this.sellItemVerification.step2_ExtractItemData();
            UIComponents.showNotification("Data extraction started with retry logic", "info");
            console.log("\u{1F504} Data extraction will retry automatically if data is incomplete");
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
            console.log("\u{1F517} Attempting to load data from URL parameters...");
            const urlState = this.sellItemVerification.decodeDataFromUrlParams();
            if (urlState && urlState.collectedData) {
              console.log("\u2705 Found data in URL parameters:", urlState.collectedData);
              this.sellItemVerification.collectedData = urlState.collectedData;
              this.sellItemVerification.currentStep = "navigate_inventory";
              UIComponents.showNotification("Loaded data from URL parameters", "success");
            } else if (!this.sellItemVerification.collectedData || Object.keys(this.sellItemVerification.collectedData).length === 0) {
              console.log("\u26A0\uFE0F No data found in URL or stored - cannot navigate inventory");
              UIComponents.showNotification("No item data available - open Steam page from CSGORoll or inject test data", "warning");
              return;
            }
            console.log("\u{1F4CB} Using collected data:", this.sellItemVerification.collectedData);
            this.sellItemVerification.step3_NavigateInventory();
            UIComponents.showNotification("Navigate inventory triggered with data", "info");
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
            collectedData: this.sellItemVerification.collectedData
          };
          console.log("Current automation state:", state);
          console.log("Note: localStorage no longer used - state is URL-based only");
          UIComponents.showNotification("State logged to console", "info");
        }
        handleDebugInjectTestData() {
          console.log("\u{1F527} DEBUG: Injecting test data");
          const testData = {
            itemName: "Candy Apple",
            itemCategory: "Glock-18",
            itemValue: "25.75 TKN",
            inventoryPage: 3,
            itemPosition: 12,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.sellItemVerification.collectedData = testData;
          this.sellItemVerification.currentStep = "navigate_inventory";
          this.sellItemVerification.isRunning = true;
          const encodedData = this.sellItemVerification.encodeDataToUrlParams(testData);
          console.log("\u{1F517} Test URL encoding:", encodedData);
          if (encodedData) {
            const testUrl = `https://steamcommunity.com/tradeoffer/new/?partner=123&token=abc&automation_data=${encodedData}`;
            console.log("\u{1F517} Test URL with data:", testUrl);
          }
          console.log("Injected test data:", testData);
          UIComponents.showNotification("Test data injected and URL encoding tested", "success");
        }
        // Removed handleDebugFullSequence() - use individual debug buttons instead
        checkForSteamPageAutomation() {
          console.log("=== CHECKING FOR STEAM PAGE AUTOMATION ===");
          console.log("\u{1F50D} Is Steam page:", this.sellItemVerification.isSteamPage());
          if (this.sellItemVerification.isSteamPage()) {
            console.log("\u2705 Steam page with URL data found - auto-starting automation");
            if (this.sellItemVerification.currentStep !== "navigate_inventory") {
              console.log("\u{1F527} Setting step to navigate_inventory for Steam page");
              this.sellItemVerification.currentStep = "navigate_inventory";
            }
            setTimeout(() => {
              try {
                console.log("\u{1F680} Auto-starting sell verification on Steam page...");
                this.automationManager.startAutomation("sell-item-verification");
                console.log("\u2705 Auto-started sell item verification from URL data");
              } catch (error) {
                console.error("\u274C Failed to auto-start sell verification:", error);
              }
            }, 2e3);
          } else {
            console.log("\u{1F6AB} Not auto-starting - either not Steam page or no URL data");
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
