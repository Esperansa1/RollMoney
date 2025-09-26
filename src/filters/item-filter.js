export class ItemFilter {
    constructor() {
        this.customFilterConfig = [];
        this.baseFilters = {
            validConditions: ['FT', 'MW', 'FN'],
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
        return items.filter(item => {
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
        const statTrakCheck = this.baseFilters.excludeStatTrak
            ? !item.subcategory.includes('StatTrak')
            : true;
        const percentageCheck = this.parsePercentage(item.percentageChange) <= this.baseFilters.maxPercentageChange;

        return conditionCheck && statTrakCheck && percentageCheck;
    }

    passesCustomFilter(item) {
        if (this.customFilterConfig.length === 0) {
            return true;
        }

        return this.customFilterConfig.some(filter => {
            const skinMatch = this.matchesFilterAttribute(item.subcategory, filter.skin);
            const typeMatch = this.matchesFilterAttribute(item.name, filter.type);
            return skinMatch && typeMatch;
        });
    }

    matchesFilterAttribute(itemValue, filterValue) {
        if (!filterValue) return true;

        if (Array.isArray(filterValue)) {
            return filterValue.some(value => itemValue.includes(value));
        }

        return itemValue.includes(filterValue);
    }

    parsePercentage(percentageStr) {
        const cleanedStr = percentageStr.replace('%', '');
        const parsedFloat = parseFloat(cleanedStr);
        return Math.abs(parsedFloat);
    }

    validateFilterConfig(config) {
        try {
            if (!Array.isArray(config)) {
                throw new Error('Filter configuration must be an array');
            }

            for (let i = 0; i < config.length; i++) {
                const filter = config[i];
                if (typeof filter !== 'object' || filter === null) {
                    throw new Error(`Filter at index ${i} must be an object`);
                }

                if (filter.skin && typeof filter.skin !== 'string' && !Array.isArray(filter.skin)) {
                    throw new Error(`Filter at index ${i}: skin must be a string or array`);
                }

                if (filter.type && typeof filter.type !== 'string' && !Array.isArray(filter.type)) {
                    throw new Error(`Filter at index ${i}: type must be a string or array`);
                }
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}