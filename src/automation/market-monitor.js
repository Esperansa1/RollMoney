export class MarketMonitor {
    constructor(dataScraper, itemFilter) {
        this.dataScraper = dataScraper;
        this.itemFilter = itemFilter;
        this.monitorInterval = null;
        this.isRunning = false;
        this.priceHistory = new Map();
        this.alerts = [];

        // Automation manager integration
        this.id = 'market-monitor';
        this.priority = 2; // Higher priority than withdrawal automation
        this.interval = 2000; // Check every 2 seconds
        this.settings = {
            priceThreshold: this.loadPriceThreshold(), // Load from localStorage
            trackDuration: 300000, // 5 minutes of price tracking
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

        console.log('Market monitoring started');
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        console.log('Market monitoring stopped');
    }

    monitorMarket() {
        try {
            const items = this.dataScraper.scrapeMarketItems();
            const filteredItems = this.itemFilter.filterItems(items);

            filteredItems.forEach(item => {
                this.trackItemPrice(item);
            });

            this.cleanOldPriceData();
        } catch (error) {
            console.error('Error monitoring market:', error);
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
            price: price,
            timestamp: currentTime,
            percentageChange: item.percentageChange
        });

        // Keep only recent data
        const cutoffTime = currentTime - this.settings.trackDuration;
        const recentHistory = history.filter(entry => entry.timestamp > cutoffTime);
        this.priceHistory.set(itemKey, recentHistory);

        // Check for significant price changes
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

            if ((isIncrease && this.settings.alertOnRise) ||
                (!isIncrease && this.settings.alertOnDrop)) {

                this.createAlert({
                    type: isIncrease ? 'price_increase' : 'price_drop',
                    item: item,
                    priceChange: priceChange,
                    timestamp: Date.now()
                });
            }
        }
    }

    createAlert(alert) {
        this.alerts.push(alert);

        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-50);
        }

        const changeType = alert.type === 'price_increase' ? 'increased' : 'dropped';
        const percentage = (Math.abs(alert.priceChange) * 100).toFixed(1);

        console.log(`ALERT: ${alert.item.name} price ${changeType} by ${percentage}%`);

        // You can emit events here for UI notifications
        if (window.MarketItemScraper && window.MarketItemScraper.automationManager) {
            window.MarketItemScraper.automationManager.emit('price-alert', alert);
        }
    }

    parsePrice(priceString) {
        // Remove currency symbols and convert to number
        const cleanPrice = priceString.replace(/[^0-9.,]/g, '');
        return parseFloat(cleanPrice.replace(',', '.')) || 0;
    }

    cleanOldPriceData() {
        const cutoffTime = Date.now() - this.settings.trackDuration;

        for (const [itemKey, history] of this.priceHistory.entries()) {
            const recentHistory = history.filter(entry => entry.timestamp > cutoffTime);

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
        const stored = localStorage.getItem('market-monitor-price-threshold');
        return stored ? parseFloat(stored) : 0.05; // Default to 5%
    }

    updatePriceThreshold(newThreshold) {
        this.settings.priceThreshold = newThreshold;
        localStorage.setItem('market-monitor-price-threshold', newThreshold.toString());
        console.log(`Price threshold updated to ${(newThreshold * 100).toFixed(1)}%`);
    }
}