export class AutomationManager {
    constructor() {
        this.automations = new Map();
        this.isRunning = false;
        this.globalSettings = {
            maxConcurrentAutomations: 5,
            globalInterval: 500,
            errorRetryLimit: 3,
            autoRestart: true
        };
        this.eventHandlers = new Map();
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
            status: 'registered', // registered, running, stopped, error
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
        this.emit('automation-registered', { id, automation: automationWrapper });
        return automationWrapper;
    }

    unregisterAutomation(id) {
        const automation = this.automations.get(id);
        if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
        }

        if (automation.status === 'running') {
            this.stopAutomation(id);
        }

        this.automations.delete(id);
        this.emit('automation-unregistered', { id, automation });
    }

    startAutomation(id) {
        const automation = this.automations.get(id);
        console.log("Starting automation with ID", id)
        if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
        }

        if (automation.status === 'running') {
            console.warn(`Automation '${id}' is already running`);
            return;
        }

        // Set manager as running and start timer if this is the first automation
        if (!this.isRunning) {
            this.isRunning = true;
            if (!this.stats.startTime) {
                this.stats.startTime = Date.now();
            }
        }

        automation.status = 'running';
        automation.lastRun = Date.now();

        if (automation.instance.start) {
            try {
                automation.instance.start();
            } catch (error) {
                this.handleAutomationError(id, error);
                return;
            }
        }

        this.emit('automation-started', { id, automation });
        console.log(`Automation '${id}' started`);
    }

    stopAutomation(id) {
        const automation = this.automations.get(id);
        if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
        }

        if (automation.status !== 'running') {
            console.warn(`Automation '${id}' is not running`);
            return;
        }

        automation.status = 'stopped';

        if (automation.instance.stop) {
            try {
                automation.instance.stop();
            } catch (error) {
                console.error(`Error stopping automation '${id}':`, error);
            }
        }

        this.emit('automation-stopped', { id, automation });
        console.log(`Automation '${id}' stopped`);
    }

    startAll() {
        if (this.isRunning) {
            console.warn('Automation manager is already running');
            return;
        }

        this.isRunning = true;
        if (!this.stats.startTime) {
            this.stats.startTime = Date.now();
        }

        // Start automations by priority (higher priority first)
        const sortedAutomations = Array.from(this.automations.values())
            .filter(auto => auto.settings.enabled)
            .sort((a, b) => b.priority - a.priority);

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

        this.emit('manager-started', { startedCount: started });
        console.log(`Automation manager started with ${started} automations`);
    }

    stopAll() {
        const runningAutomations = Array.from(this.automations.values())
            .filter(auto => auto.status === 'running');

        for (const automation of runningAutomations) {
            try {
                this.stopAutomation(automation.id);
            } catch (error) {
                console.error(`Failed to stop automation '${automation.id}':`, error);
            }
        }

        // Set manager as stopped
        this.isRunning = false;

        this.emit('manager-stopped', { stoppedCount: runningAutomations.length });
        console.log(`Automation manager stopped, ${runningAutomations.length} automations stopped`);
    }

    pauseAutomation(id) {
        const automation = this.automations.get(id);
        if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
        }

        if (automation.status === 'running') {
            automation.status = 'paused';
            if (automation.instance.pause) {
                automation.instance.pause();
            }
            this.emit('automation-paused', { id, automation });
        }
    }

    resumeAutomation(id) {
        const automation = this.automations.get(id);
        if (!automation) {
            throw new Error(`Automation with ID '${id}' not found`);
        }

        if (automation.status === 'paused') {
            automation.status = 'running';
            if (automation.instance.resume) {
                automation.instance.resume();
            }
            this.emit('automation-resumed', { id, automation });
        }
    }

    handleAutomationError(id, error) {
        const automation = this.automations.get(id);
        if (!automation) return;

        automation.errorCount++;
        automation.status = 'error';
        this.stats.failedRuns++;

        this.emit('automation-error', { id, automation, error });

        if (automation.errorCount < automation.settings.maxRetries && this.globalSettings.autoRestart) {
            console.log(`Retrying automation '${id}' (attempt ${automation.errorCount + 1})`);
            setTimeout(() => {
                if (automation.status === 'error') {
                    automation.status = 'registered';
                    this.startAutomation(id);
                }
            }, 2000 * automation.errorCount); // Exponential backoff
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
        this.emit('automation-settings-updated', { id, automation, settings });
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
        return Array.from(this.automations.values()).map(auto => ({
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
        const runningCount = Array.from(this.automations.values())
            .filter(auto => auto.status === 'running').length;

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
            handlers.forEach(handler => {
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
            this.sharedData = new Map();
        }
        this.sharedData.set(key, value);
        this.emit('shared-data-updated', { key, value });
    }

    getSharedData(key) {
        return this.sharedData ? this.sharedData.get(key) : undefined;
    }

    // Resource management for preventing conflicts
    acquireResource(resourceId, automationId) {
        if (!this.resources) {
            this.resources = new Map();
        }

        if (this.resources.has(resourceId)) {
            return false; // Resource already in use
        }

        this.resources.set(resourceId, automationId);
        this.emit('resource-acquired', { resourceId, automationId });
        return true;
    }

    releaseResource(resourceId, automationId) {
        if (!this.resources) return false;

        const currentOwner = this.resources.get(resourceId);
        if (currentOwner === automationId) {
            this.resources.delete(resourceId);
            this.emit('resource-released', { resourceId, automationId });
            return true;
        }
        return false;
    }
}