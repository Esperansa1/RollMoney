import { DOMUtils } from '../utils/dom-utils.js';

export class DataScraper {
    constructor() {
        this.processedItems = new Set();
    }

    scrapeMarketItems() {
        const itemCards = document.querySelectorAll('.item-card');
        const scrapedItems = [];

        itemCards.forEach((card, index) => {
            try {
                const item = this.extractItemData(card, index);
                console.log("Extracted Item:", item);
                scrapedItems.push(item);
            } catch (error) {
                console.error('Error processing item card:', error);
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
        const percentageSpan = card.querySelector('span.lh-16.fw-600.fs-10.ng-star-inserted');
        if (!percentageSpan) return '0%';

        const text = percentageSpan.textContent.trim();
        const percentageMatch = text.match(/^[+-]\d+\.?\d*%/);
        return percentageMatch ? percentageMatch[0] : '0%';
    }

    extractCondition(card) {
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
    }

    findItemCardByName(itemName) {
        return Array.from(document.querySelectorAll('.item-card'))
            .find(card => {
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
        return items.filter(item => !this.processedItems.has(item.name));
    }
}