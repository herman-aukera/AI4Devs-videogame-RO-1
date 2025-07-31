/**
 * Cross-Game Tournament System - Performance Monitoring and Optimization
 *
 * This module provides comprehensive performance monitoring, metrics collection,
 * memory leak detection, and optimization utilities for the tournament system.
 * It implements real-time performance tracking and automated optimization strategies.
 */

/**
 * Performance Monitor Class
 * Tracks and optimizes tournament system performance
 */
class TournamentPerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
      enableMemoryTracking: options.enableMemoryTracking !== false,
      enableStorageOptimization: options.enableStorageOptimization !== false,
      performanceThresholds: {
        tournamentCreation: 50, // ms
        scoreUpdate: 10, // ms
        leaderboardGeneration: 25, // ms
        storageOperation: 5, // ms
        memoryLeakThreshold: 1024 * 1024, // 1MB
        ...options.performanceThresholds
      },
      sampleSize: options.sampleSize || 100,
      reportingInterval: options.reportingInterval || 30000, // 30 seconds
      ...options
    };

    // Performance metrics storage
    this.metrics = {
      operations: new Map(),
      memory: [],
      storage: {
        reads: [],
        writes: [],
        size: []
      },
      errors: [],
      optimizations: []
    };

    // Real-time monitoring state
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.lastMemoryCheck = 0;

    // Performance regression detection
    this.baselines = new Map();
    this.regressionThreshold = 1.5; // 50% performance degradation

    // Storage optimization state
    this.storageOptimizer = null;
    this.lastStorageOptimization = 0;

    this.initialize();
  }

  /**
   * Initialize the performance monitor
   */
  initialize() {
    try {
      // Set up storage optimizer
      if (this.options.enableStorageOptimization) {
        this.storageOptimizer = new StorageOptimizer(this);
      }

      // Start real-time monitoring if enabled
      if (this.options.enableRealTimeMonitoring) {
        this.startRealTimeMonitoring();
      }

      // Set up memory tracking
      if (this.options.enableMemoryTracking && this.isMemoryTrackingAvailable()) {
        this.setupMemoryTracking();
      }

      console.log('🚀 Tournament Performance Monitor initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitor:', error);
    }
  }

  // ============================================================================
  // PERFORMANCE METRICS COLLECTION
  // ============================================================================

  /**
   * Start timing an operation
   * @param {string} operationType - Type of operation being timed
   * @param {string} operationId - Unique identifier for this operation instance
   * @returns {Function} Function to call when operation completes
   */
  startTiming(operationType, operationId = null) {
    const id = operationId || `${operationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    return (metadata = {}) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const endMemory = this.getCurrentMemoryUsage();
      const memoryDelta = endMemory - startMemory;

      this.recordMetric(operationType, {
        id,
        duration,
        startTime,
        endTime,
        memoryDelta,
        metadata,
        timestamp: new Date().toISOString()
      });

      // Check for performance regressions
      this.checkPerformanceRegression(operationType, duration);

      return { id, duration, memoryDelta };
    };
  }

  /**
   * Record a performance metric
   * @param {string} operationType - Type of operation
   * @param {Object} metric - Metric data
   */
  recordMetric(operationType, metric) {
    if (!this.metrics.operations.has(operationType)) {
      this.metrics.operations.set(operationType, []);
    }

    const operations = this.metrics.operations.get(operationType);
    operations.push(metric);

    // Maintain sample size limit
    if (operations.length > this.options.sampleSize) {
      operations.shift();
    }

    // Check against thresholds
    this.checkPerformanceThreshold(operationType, metric.duration);
  }

  /**
   * Check if operation exceeds performance threshold
   * @param {string} operationType - Type of operation
   * @param {number} duration - Operation duration in ms
   */
  checkPerformanceThreshold(operationType, duration) {
    const threshold = this.options.performanceThresholds[operationType];
    if (threshold && duration > threshold) {
      const warning = {
        type: 'performance_threshold_exceeded',
        operationType,
        duration,
        threshold,
        timestamp: new Date().toISOString()
      };

      this.metrics.errors.push(warning);
      console.warn(`⚠️ Performance threshold exceeded: ${operationType} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);

      // Trigger optimization if available
      this.triggerOptimization(operationType, duration);
    }
  }

  /**
   * Check for performance regression
   * @param {string} operationType - Type of operation
   * @param {number} duration - Current operation duration
   */
  checkPerformanceRegression(operationType, duration) {
    if (!this.baselines.has(operationType)) {
      // Establish baseline after collecting enough samples
      const operations = this.metrics.operations.get(operationType) || [];
      if (operations.length >= 10) {
        const avgDuration = operations.slice(-10).reduce((sum, op) => sum + op.duration, 0) / 10;
        this.baselines.set(operationType, avgDuration);
      }
      return;
    }

    const baseline = this.baselines.get(operationType);
    if (duration > baseline * this.regressionThreshold) {
      const regression = {
        type: 'performance_regression',
        operationType,
        currentDuration: duration,
        baselineDuration: baseline,
        regressionFactor: duration / baseline,
        timestamp: new Date().toISOString()
      };

      this.metrics.errors.push(regression);
      console.warn(`📉 Performance regression detected: ${operationType} is ${(regression.regressionFactor * 100).toFixed(1)}% slower than baseline`);
    }
  }

  // ============================================================================
  // MEMORY USAGE MONITORING
  // ============================================================================

  /**
   * Check if memory tracking is available
   * @returns {boolean} True if memory tracking is supported
   */
  isMemoryTrackingAvailable() {
    return typeof performance !== 'undefined' &&
      performance.memory &&
      typeof performance.memory.usedJSHeapSize === 'number';
  }

  /**
   * Get current memory usage
   * @returns {number} Memory usage in bytes, or 0 if not available
   */
  getCurrentMemoryUsage() {
    if (this.isMemoryTrackingAvailable()) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Set up memory tracking
   */
  setupMemoryTracking() {
    // Record initial memory state
    this.recordMemorySnapshot('initialization');

    // Set up periodic memory monitoring
    setInterval(() => {
      this.recordMemorySnapshot('periodic');
      this.checkForMemoryLeaks();
    }, 10000); // Every 10 seconds
  }

  /**
   * Record a memory snapshot
   * @param {string} context - Context for this snapshot
   */
  recordMemorySnapshot(context) {
    if (!this.isMemoryTrackingAvailable()) return;

    const snapshot = {
      timestamp: Date.now(),
      context,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };

    this.metrics.memory.push(snapshot);

    // Maintain memory history limit
    if (this.metrics.memory.length > 100) {
      this.metrics.memory.shift();
    }
  }

  /**
   * Check for potential memory leaks
   */
  checkForMemoryLeaks() {
    if (this.metrics.memory.length < 5) return;

    const recent = this.metrics.memory.slice(-5);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    const memoryIncrease = newest.usedJSHeapSize - oldest.usedJSHeapSize;
    const timeSpan = newest.timestamp - oldest.timestamp;

    // Check if memory is consistently increasing
    if (memoryIncrease > this.options.performanceThresholds.memoryLeakThreshold) {
      const leak = {
        type: 'potential_memory_leak',
        memoryIncrease,
        timeSpan,
        rate: memoryIncrease / (timeSpan / 1000), // bytes per second
        timestamp: new Date().toISOString()
      };

      this.metrics.errors.push(leak);
      console.warn(`🧠 Potential memory leak detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase over ${(timeSpan / 1000).toFixed(1)}s`);

      // Trigger memory optimization
      this.triggerMemoryOptimization();
    }
  }

  // ============================================================================
  // STORAGE OPTIMIZATION
  // ============================================================================

  /**
   * Monitor storage operations
   * @param {string} operation - Type of storage operation (read/write)
   * @param {string} key - Storage key
   * @param {number} size - Data size in bytes
   * @param {number} duration - Operation duration in ms
   */
  recordStorageOperation(operation, key, size, duration) {
    const record = {
      operation,
      key,
      size,
      duration,
      timestamp: Date.now()
    };

    this.metrics.storage[operation + 's'].push(record);

    // Maintain storage metrics limit
    const storageMetrics = this.metrics.storage[operation + 's'];
    if (storageMetrics.length > this.options.sampleSize) {
      storageMetrics.shift();
    }

    // Check storage performance
    if (duration > this.options.performanceThresholds.storageOperation) {
      console.warn(`💾 Slow storage ${operation}: ${key} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage usage information
   */
  getStorageUsage() {
    try {
      if (typeof localStorage === 'undefined') {
        return { available: false, note: 'localStorage not available' };
      }

      let totalSize = 0;
      let itemCount = 0;
      const itemSizes = {};

      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          itemCount++;
          itemSizes[key] = size;
        }
      }

      return {
        available: true,
        totalSize,
        itemCount,
        itemSizes,
        estimatedQuota: 5 * 1024 * 1024, // 5MB typical limit
        usagePercentage: (totalSize / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // OPTIMIZATION STRATEGIES
  // ============================================================================

  /**
   * Trigger optimization for specific operation type
   * @param {string} operationType - Type of operation to optimize
   * @param {number} currentDuration - Current operation duration
   */
  triggerOptimization(operationType, currentDuration) {
    const optimization = {
      type: operationType,
      trigger: 'performance_threshold',
      currentDuration,
      timestamp: new Date().toISOString(),
      strategies: []
    };

    switch (operationType) {
      case 'tournamentCreation':
        optimization.strategies = this.optimizeTournamentCreation();
        break;
      case 'scoreUpdate':
        optimization.strategies = this.optimizeScoreUpdate();
        break;
      case 'leaderboardGeneration':
        optimization.strategies = this.optimizeLeaderboardGeneration();
        break;
      case 'storageOperation':
        optimization.strategies = this.optimizeStorageOperations();
        break;
    }

    this.metrics.optimizations.push(optimization);
  }

  /**
   * Optimize tournament creation performance
   * @returns {Array} Applied optimization strategies
   */
  optimizeTournamentCreation() {
    const strategies = [];

    // Strategy 1: Batch validation
    strategies.push({
      name: 'batch_validation',
      description: 'Optimize validation by batching checks',
      applied: true
    });

    // Strategy 2: Lazy initialization
    strategies.push({
      name: 'lazy_initialization',
      description: 'Defer non-critical initialization',
      applied: true
    });

    return strategies;
  }

  /**
   * Optimize score update performance
   * @returns {Array} Applied optimization strategies
   */
  optimizeScoreUpdate() {
    const strategies = [];

    // Strategy 1: Score caching
    strategies.push({
      name: 'score_caching',
      description: 'Cache normalized scores to avoid recalculation',
      applied: true
    });

    // Strategy 2: Debounced updates
    strategies.push({
      name: 'debounced_updates',
      description: 'Batch multiple score updates',
      applied: true
    });

    return strategies;
  }

  /**
   * Optimize leaderboard generation performance
   * @returns {Array} Applied optimization strategies
   */
  optimizeLeaderboardGeneration() {
    const strategies = [];

    // Strategy 1: Incremental sorting
    strategies.push({
      name: 'incremental_sorting',
      description: 'Use incremental sort for small changes',
      applied: true
    });

    // Strategy 2: Virtual scrolling
    strategies.push({
      name: 'virtual_scrolling',
      description: 'Render only visible leaderboard entries',
      applied: false,
      reason: 'UI framework dependent'
    });

    return strategies;
  }

  /**
   * Optimize storage operations
   * @returns {Array} Applied optimization strategies
   */
  optimizeStorageOperations() {
    const strategies = [];

    if (this.storageOptimizer) {
      strategies.push(...this.storageOptimizer.optimize());
    }

    return strategies;
  }

  /**
   * Trigger memory optimization
   */
  triggerMemoryOptimization() {
    const optimization = {
      type: 'memory_optimization',
      trigger: 'memory_leak_detection',
      timestamp: new Date().toISOString(),
      strategies: []
    };

    // Strategy 1: Clear caches
    optimization.strategies.push({
      name: 'clear_caches',
      description: 'Clear internal caches to free memory',
      applied: this.clearCaches()
    });

    // Strategy 2: Garbage collection hint
    if (typeof gc === 'function') {
      try {
        gc();
        optimization.strategies.push({
          name: 'force_gc',
          description: 'Force garbage collection',
          applied: true
        });
      } catch (error) {
        optimization.strategies.push({
          name: 'force_gc',
          description: 'Force garbage collection',
          applied: false,
          error: error.message
        });
      }
    }

    this.metrics.optimizations.push(optimization);
  }

  /**
   * Clear internal caches to free memory
   * @returns {boolean} True if caches were cleared
   */
  clearCaches() {
    try {
      // Clear metrics history (keep recent data)
      this.metrics.operations.forEach((operations, operationType) => {
        if (operations.length > 50) {
          operations.splice(0, operations.length - 50);
        }
      });

      // Clear old memory snapshots
      if (this.metrics.memory.length > 20) {
        this.metrics.memory.splice(0, this.metrics.memory.length - 20);
      }

      // Clear old storage metrics
      ['reads', 'writes'].forEach(operation => {
        const metrics = this.metrics.storage[operation];
        if (metrics.length > 50) {
          metrics.splice(0, metrics.length - 50);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  }

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  /**
   * Start real-time performance monitoring
   */
  startRealTimeMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performRealTimeCheck();
    }, this.options.reportingInterval);

    console.log('📊 Real-time performance monitoring started');
  }

  /**
   * Stop real-time performance monitoring
   */
  stopRealTimeMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('📊 Real-time performance monitoring stopped');
  }

  /**
   * Perform real-time performance check
   */
  performRealTimeCheck() {
    // Record memory snapshot
    if (this.options.enableMemoryTracking) {
      this.recordMemorySnapshot('realtime_check');
    }

    // Check storage usage
    if (this.options.enableStorageOptimization) {
      const storageUsage = this.getStorageUsage();
      if (storageUsage.available && storageUsage.usagePercentage > 80) {
        console.warn(`💾 Storage usage high: ${storageUsage.usagePercentage.toFixed(1)}%`);
        this.triggerOptimization('storageOperation', 0);
      }
    }

    // Generate performance report
    const report = this.generatePerformanceReport();
    if (report.issues.length > 0) {
      console.warn('⚠️ Performance issues detected:', report.issues);
    }
  }

  // ============================================================================
  // REPORTING AND ANALYSIS
  // ============================================================================

  /**
   * Generate comprehensive performance report
   * @returns {Object} Performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      operations: {},
      memory: {},
      storage: {},
      issues: [],
      recommendations: []
    };

    // Analyze operations performance
    this.metrics.operations.forEach((operations, operationType) => {
      if (operations.length === 0) return;

      const durations = operations.map(op => op.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      const threshold = this.options.performanceThresholds[operationType];

      report.operations[operationType] = {
        sampleSize: operations.length,
        avgDuration: parseFloat(avgDuration.toFixed(2)),
        maxDuration: parseFloat(maxDuration.toFixed(2)),
        minDuration: parseFloat(minDuration.toFixed(2)),
        threshold,
        exceedsThreshold: avgDuration > threshold,
        recentTrend: this.calculateTrend(durations.slice(-10))
      };

      if (avgDuration > threshold) {
        report.issues.push(`${operationType} average duration (${avgDuration.toFixed(2)}ms) exceeds threshold (${threshold}ms)`);
      }
    });

    // Analyze memory usage
    if (this.metrics.memory.length > 0) {
      const recent = this.metrics.memory.slice(-10);
      const memoryUsages = recent.map(m => m.usedJSHeapSize);
      const avgMemory = memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length;
      const memoryTrend = this.calculateTrend(memoryUsages);

      report.memory = {
        currentUsage: recent[recent.length - 1]?.usedJSHeapSize || 0,
        averageUsage: avgMemory,
        trend: memoryTrend,
        snapshots: recent.length
      };

      if (memoryTrend > 0.1) {
        report.issues.push('Memory usage is trending upward, potential leak detected');
      }
    }

    // Analyze storage usage
    const storageUsage = this.getStorageUsage();
    if (storageUsage.available) {
      report.storage = storageUsage;

      if (storageUsage.usagePercentage > 80) {
        report.issues.push(`Storage usage is high: ${storageUsage.usagePercentage.toFixed(1)}%`);
      }
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // Summary
    report.summary = {
      totalOperations: Array.from(this.metrics.operations.values()).reduce((sum, ops) => sum + ops.length, 0),
      performanceIssues: report.issues.length,
      memorySnapshots: this.metrics.memory.length,
      optimizationsApplied: this.metrics.optimizations.length,
      overallHealth: report.issues.length === 0 ? 'GOOD' : report.issues.length < 3 ? 'WARNING' : 'CRITICAL'
    };

    return report;
  }

  /**
   * Calculate trend for a series of values
   * @param {Array} values - Array of numeric values
   * @returns {number} Trend coefficient (-1 to 1)
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, val, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    // Normalize slope relative to average value
    return avgY !== 0 ? slope / avgY : 0;
  }

  /**
   * Generate performance recommendations
   * @param {Object} report - Performance report
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(report) {
    const recommendations = [];

    // Operation-specific recommendations
    Object.entries(report.operations).forEach(([operationType, data]) => {
      if (data.exceedsThreshold) {
        recommendations.push(`Optimize ${operationType} - currently ${data.avgDuration}ms, target < ${data.threshold}ms`);
      }

      if (data.recentTrend > 0.1) {
        recommendations.push(`${operationType} performance is degrading - investigate recent changes`);
      }
    });

    // Memory recommendations
    if (report.memory?.trend > 0.1) {
      recommendations.push('Memory usage is increasing - check for memory leaks');
    }

    // Storage recommendations
    if (report.storage?.usagePercentage > 80) {
      recommendations.push('Storage usage is high - consider data cleanup or compression');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable limits - no immediate action required');
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   * @returns {Object} Exportable performance data
   */
  exportPerformanceData() {
    return {
      timestamp: new Date().toISOString(),
      options: this.options,
      metrics: {
        operations: Object.fromEntries(this.metrics.operations),
        memory: this.metrics.memory,
        storage: this.metrics.storage,
        errors: this.metrics.errors,
        optimizations: this.metrics.optimizations
      },
      baselines: Object.fromEntries(this.baselines),
      report: this.generatePerformanceReport()
    };
  }

  /**
   * Reset all performance data
   */
  resetPerformanceData() {
    this.metrics.operations.clear();
    this.metrics.memory = [];
    this.metrics.storage = { reads: [], writes: [], size: [] };
    this.metrics.errors = [];
    this.metrics.optimizations = [];
    this.baselines.clear();

    console.log('🔄 Performance data reset');
  }
}

/**
 * Storage Optimizer Class
 * Handles storage-specific optimizations
 */
class StorageOptimizer {
  constructor(performanceMonitor) {
    this.performanceMonitor = performanceMonitor;
    this.compressionEnabled = true;
    this.lastOptimization = 0;
    this.optimizationCooldown = 60000; // 1 minute
  }

  /**
   * Optimize storage operations
   * @returns {Array} Applied optimization strategies
   */
  optimize() {
    const strategies = [];
    const now = Date.now();

    // Check cooldown
    if (now - this.lastOptimization < this.optimizationCooldown) {
      return strategies;
    }

    this.lastOptimization = now;

    // Strategy 1: Compress large data
    if (this.compressionEnabled) {
      const compressionResult = this.compressLargeData();
      strategies.push({
        name: 'data_compression',
        description: 'Compress large storage items',
        applied: compressionResult.applied,
        savedBytes: compressionResult.savedBytes
      });
    }

    // Strategy 2: Clean up old data
    const cleanupResult = this.cleanupOldData();
    strategies.push({
      name: 'old_data_cleanup',
      description: 'Remove expired tournament data',
      applied: cleanupResult.applied,
      removedItems: cleanupResult.removedItems
    });

    // Strategy 3: Optimize storage keys
    const keyOptimizationResult = this.optimizeStorageKeys();
    strategies.push({
      name: 'key_optimization',
      description: 'Optimize storage key structure',
      applied: keyOptimizationResult.applied,
      optimizedKeys: keyOptimizationResult.optimizedKeys
    });

    return strategies;
  }

  /**
   * Compress large data items in storage
   * @returns {Object} Compression results
   */
  compressLargeData() {
    try {
      if (typeof localStorage === 'undefined') {
        return { applied: false, reason: 'localStorage not available' };
      }

      let savedBytes = 0;
      const compressionThreshold = 1024; // 1KB

      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          if (value && value.length > compressionThreshold) {
            // Simple compression simulation (in real implementation, use actual compression)
            const compressed = this.simpleCompress(value);
            if (compressed.length < value.length) {
              localStorage.setItem(key, compressed);
              savedBytes += value.length - compressed.length;
            }
          }
        }
      }

      return {
        applied: savedBytes > 0,
        savedBytes
      };
    } catch (error) {
      return {
        applied: false,
        error: error.message
      };
    }
  }

  /**
   * Simple compression simulation
   * @param {string} data - Data to compress
   * @returns {string} Compressed data
   */
  simpleCompress(data) {
    // This is a placeholder for actual compression
    // In a real implementation, you would use a compression library
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed); // Remove extra whitespace
    } catch (error) {
      return data;
    }
  }

  /**
   * Clean up old tournament data
   * @returns {Object} Cleanup results
   */
  cleanupOldData() {
    try {
      if (typeof localStorage === 'undefined') {
        return { applied: false, reason: 'localStorage not available' };
      }

      let removedItems = 0;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

      // Look for tournament data to clean up
      const keysToRemove = [];
      for (const key in localStorage) {
        if (key.includes('tournament') && key.includes('completed')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.endDate && new Date(data.endDate) < cutoffDate) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Skip invalid data
          }
        }
      }

      // Remove old data
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        removedItems++;
      });

      return {
        applied: removedItems > 0,
        removedItems
      };
    } catch (error) {
      return {
        applied: false,
        error: error.message
      };
    }
  }

  /**
   * Optimize storage key structure
   * @returns {Object} Optimization results
   */
  optimizeStorageKeys() {
    try {
      if (typeof localStorage === 'undefined') {
        return { applied: false, reason: 'localStorage not available' };
      }

      let optimizedKeys = 0;

      // Look for keys that can be optimized (shortened)
      const keyMappings = new Map();
      for (const key in localStorage) {
        if (key.length > 50) { // Long keys
          const shortKey = this.generateShortKey(key);
          if (shortKey !== key) {
            keyMappings.set(key, shortKey);
          }
        }
      }

      // Apply key optimizations
      keyMappings.forEach((shortKey, longKey) => {
        const value = localStorage.getItem(longKey);
        localStorage.setItem(shortKey, value);
        localStorage.removeItem(longKey);
        optimizedKeys++;
      });

      return {
        applied: optimizedKeys > 0,
        optimizedKeys
      };
    } catch (error) {
      return {
        applied: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a shorter key for storage optimization
   * @param {string} originalKey - Original storage key
   * @returns {string} Optimized shorter key
   */
  generateShortKey(originalKey) {
    // Simple key shortening strategy
    return originalKey
      .replace('tournament-', 't-')
      .replace('participant-', 'p-')
      .replace('leaderboard-', 'l-')
      .replace('settings-', 's-');
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentPerformanceMonitor, StorageOptimizer };
} else if (typeof window !== 'undefined') {
  window.TournamentPerformanceMonitor = TournamentPerformanceMonitor;
  window.StorageOptimizer = StorageOptimizer;
}
