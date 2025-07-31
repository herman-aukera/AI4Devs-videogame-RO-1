/* © GG, MIT License */

/**
 * EventBus System for Cross-Game Tournament
 *
 * Provides reliable event communication between tournament components with:
 * - Type-safe event subscription and publishing
 * - Error handling and validation
 * - Event history and debugging
 * - Performance monitoring
 * - Memory leak prevention
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.debugMode = false;
    this.eventStats = new Map();

    // Bind methods to preserve context
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.publish = this.publish.bind(this);
    this.clear = this.clear.bind(this);

    this.log('EventBus initialized');
  }

  /**
   * Subscribe to an event type
   * @param {string} eventType - The event type to listen for
   * @param {Function} callback - The callback function to execute
   * @param {Object} options - Optional configuration
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, callback, options = {}) {
    // Validate inputs
    if (!this.validateEventType(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    if (!this.validateCallback(callback)) {
      throw new Error('Callback must be a function');
    }

    // Initialize listeners array for this event type
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    // Create listener object
    const listener = {
      id: this.generateListenerId(),
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null,
      created: Date.now()
    };

    // Add listener and sort by priority (higher priority first)
    const eventListeners = this.listeners.get(eventType);
    eventListeners.push(listener);
    eventListeners.sort((a, b) => b.priority - a.priority);

    this.log(`Subscribed to ${eventType}`, { listenerId: listener.id, priority: listener.priority });

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, listener.id);
  }

  /**
   * Unsubscribe from an event type
   * @param {string} eventType - The event type
   * @param {string} listenerId - The listener ID to remove
   * @returns {boolean} Success status
   */
  unsubscribe(eventType, listenerId) {
    if (!this.listeners.has(eventType)) {
      this.log(`No listeners found for event type: ${eventType}`, 'warn');
      return false;
    }

    const eventListeners = this.listeners.get(eventType);
    const initialLength = eventListeners.length;

    // Remove listener by ID
    const filteredListeners = eventListeners.filter(listener => listener.id !== listenerId);

    if (filteredListeners.length === initialLength) {
      this.log(`Listener not found: ${listenerId} for event ${eventType}`, 'warn');
      return false;
    }

    // Update listeners array
    this.listeners.set(eventType, filteredListeners);

    // Clean up empty event types
    if (filteredListeners.length === 0) {
      this.listeners.delete(eventType);
    }

    this.log(`Unsubscribed from ${eventType}`, { listenerId });
    return true;
  }

  /**
   * Publish an event to all subscribers
   * @param {string} eventType - The event type to publish
   * @param {*} data - The event data
   * @param {Object} options - Optional configuration
   * @returns {Object} Publication result
   */
  publish(eventType, data = null, options = {}) {
    const startTime = performance.now();

    // Validate event type
    if (!this.validateEventType(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    // Create event object
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      id: this.generateEventId(),
      source: options.source || 'unknown'
    };

    // Add to history
    this.addToHistory(event);

    // Update statistics
    this.updateEventStats(eventType);

    const result = {
      eventId: event.id,
      listenersNotified: 0,
      errors: [],
      executionTime: 0
    };

    // Get listeners for this event type
    const eventListeners = this.listeners.get(eventType) || [];

    if (eventListeners.length === 0) {
      this.log(`No listeners for event: ${eventType}`, 'info');
      result.executionTime = performance.now() - startTime;
      return result;
    }

    this.log(`Publishing ${eventType} to ${eventListeners.length} listeners`, { eventId: event.id });

    // Notify all listeners
    const listenersToRemove = [];

    for (const listener of eventListeners) {
      try {
        // Execute callback with proper context
        if (listener.context) {
          listener.callback.call(listener.context, event);
        } else {
          listener.callback(event);
        }

        result.listenersNotified++;

        // Mark for removal if it's a one-time listener
        if (listener.once) {
          listenersToRemove.push(listener.id);
        }

      } catch (error) {
        const errorInfo = {
          listenerId: listener.id,
          error: error.message,
          stack: error.stack
        };

        result.errors.push(errorInfo);
        this.log(`Error in listener ${listener.id} for event ${eventType}: ${error.message}`, 'error');

        // Continue with other listeners despite error
      }
    }

    // Remove one-time listeners
    if (listenersToRemove.length > 0) {
      listenersToRemove.forEach(listenerId => {
        this.unsubscribe(eventType, listenerId);
      });
    }

    result.executionTime = performance.now() - startTime;

    this.log(`Published ${eventType}`, {
      listenersNotified: result.listenersNotified,
      errors: result.errors.length,
      executionTime: result.executionTime
    });

    return result;
  }

  /**
   * Subscribe to an event only once
   * @param {string} eventType - The event type
   * @param {Function} callback - The callback function
   * @param {Object} options - Optional configuration
   * @returns {Function} Unsubscribe function
   */
  once(eventType, callback, options = {}) {
    return this.subscribe(eventType, callback, { ...options, once: true });
  }

  /**
   * Clear all listeners for an event type or all events
   * @param {string} eventType - Optional specific event type to clear
   */
  clear(eventType = null) {
    if (eventType) {
      if (this.listeners.has(eventType)) {
        const count = this.listeners.get(eventType).length;
        this.listeners.delete(eventType);
        this.log(`Cleared ${count} listeners for ${eventType}`);
      }
    } else {
      const totalListeners = Array.from(this.listeners.values())
        .reduce((sum, listeners) => sum + listeners.length, 0);
      this.listeners.clear();
      this.log(`Cleared all ${totalListeners} listeners`);
    }
  }

  /**
   * Get current event statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const listenerCounts = {};
    let totalListeners = 0;

    for (const [eventType, listeners] of this.listeners) {
      listenerCounts[eventType] = listeners.length;
      totalListeners += listeners.length;
    }

    return {
      totalListeners,
      eventTypes: this.listeners.size,
      listenerCounts,
      eventStats: Object.fromEntries(this.eventStats),
      historySize: this.eventHistory.length
    };
  }

  /**
   * Get event history
   * @param {number} limit - Maximum number of events to return
   * @returns {Array} Array of recent events
   */
  getHistory(limit = 10) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Debug mode status
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // ===== PRIVATE METHODS =====

  validateEventType(eventType) {
    return typeof eventType === 'string' && eventType.length > 0;
  }

  validateCallback(callback) {
    return typeof callback === 'function';
  }

  generateListenerId() {
    return `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addToHistory(event) {
    this.eventHistory.push({
      ...event,
      listeners: this.listeners.get(event.type)?.length || 0
    });

    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  updateEventStats(eventType) {
    const current = this.eventStats.get(eventType) || 0;
    this.eventStats.set(eventType, current + 1);
  }

  log(message, data = null, level = 'info') {
    if (!this.debugMode && level === 'info') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[EventBus ${timestamp}] ${message}`;

    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
}
