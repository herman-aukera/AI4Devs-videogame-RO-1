/**
 * Cross-Game Tournament System - Tournament History and Analytics
 *
 * This module implements the tournament history system with data persistence,
 * searchable/filterable interface, export/import functionality, and data archiving
 * with storage quota management.
 *
 * Features:
 * - Tournament completion data persistence
 * - Searchable and filterable tournament history interface
 * - Tournament export/import functionality for data portability
 * - Data archiving with storage quota management
 * - Performance analytics and statistics
 */

/**
 * Tournament History Manager Class
 * Handles all tournament history operations and analytics
 */
class TournamentHistoryManager {
  constructor() {
    // Initialize storage manager
    this.storage = typeof tournamentStorage !== 'undefined'
      ? tournamentStorage
      : new TournamentStorageManager();

    // History cache for performance
    this.historyCache = new Map();
    this.analyticsCache = new Map();

    // Initialize
    this.initialize();
  }

  /**
   * Initialize the history manager
   */
  initialize() {
    try {
      // Load history data into cache
      this.loadHistoryToCache();

      // Set up event listeners for tournament completion
      this.setupEventListeners();

      console.log('🏆 TournamentHistoryManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TournamentHistoryManager:', error);
      this.handleError('initialization', error);
    }
  }

  /**
   * Load history data from storage into cache
   */
  loadHistoryToCache() {
    const historyData = this.storage.getItem('tournament-history', {
      completedTournaments: [],
      totalTournaments: 0,
      totalParticipants: 0,
      lastCleanup: new Date().toISOString()
    });

    // Load completed tournaments into cache
    historyData.completedTournaments.forEach(tournamentId => {
      const tournament = this.getTournamentFromStorage(tournamentId);
      if (tournament && tournament.status === 'completed') {
        this.historyCache.set(tournamentId, tournament);
      }
    });

    console.log(`Loaded ${this.historyCache.size} completed tournaments into history cache`);
  }

  /**
   * Set up event listeners for tournament events
   */
  setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('tournament:completed', (event) => {
        this.onTournamentCompleted(event.detail);
      });

      window.addEventListener('tournament:deleted', (event) => {
        this.onTournamentDeleted(event.detail);
      });
    }
  }

  // ============================================================================
  // TOURNAMENT COMPLETION HANDLING
  // ============================================================================

  /**
   * Handle tournament completion event
   * @param {ITournament} tournament - Completed tournament
   */
  onTournamentCompleted(tournament) {
    try {
      // Add to history cache
      this.historyCache.set(tournament.id, tournament);

      // Update history metadata
      this.updateHistoryMetadata(tournament);

      // Clear analytics cache to force recalculation
      this.analyticsCache.clear();

      console.log(`✅ Tournament ${tournament.id} added to history`);
    } catch (error) {
      console.error('Error handling tournament completion:', error);
      this.handleError('onTournamentCompleted', error);
    }
  }

  /**
   * Handle tournament deletion event
   * @param {Object} eventData - Deletion event data
   */
  onTournamentDeleted(eventData) {
    try {
      const tournamentId = eventData.id;

      // Remove from history cache
      this.historyCache.delete(tournamentId);

      // Update history metadata
      const historyData = this.storage.getItem('tournament-history', {
        completedTournaments: [],
        totalTournaments: 0,
        totalParticipants: 0,
        lastCleanup: new Date().toISOString()
      });

      // Remove from completed tournaments list
      historyData.completedTournaments = historyData.completedTournaments.filter(
        id => id !== tournamentId
      );

      // Update counts
      if (eventData.tournament && eventData.tournament.status === 'completed') {
        historyData.totalTournaments = Math.max(0, historyData.totalTournaments - 1);
        historyData.totalParticipants = Math.max(0,
          historyData.totalParticipants - eventData.tournament.participants.length
        );
      }

      this.storage.setItem('tournament-history', historyData);

      // Clear analytics cache
      this.analyticsCache.clear();

      console.log(`✅ Tournament ${tournamentId} removed from history`);
    } catch (error) {
      console.error('Error handling tournament deletion:', error);
      this.handleError('onTournamentDeleted', error);
    }
  }

  /**
   * Update history metadata after tournament completion
   * @param {ITournament} tournament - Completed tournament
   */
  updateHistoryMetadata(tournament) {
    const historyData = this.storage.getItem('tournament-history', {
      completedTournaments: [],
      totalTournaments: 0,
      totalParticipants: 0,
      lastCleanup: new Date().toISOString()
    });

    // Add to completed tournaments if not already present
    if (!historyData.completedTournaments.includes(tournament.id)) {
      historyData.completedTournaments.push(tournament.id);
      historyData.totalTournaments++;
      historyData.totalParticipants += tournament.participants.length;
    }

    this.storage.setItem('tournament-history', historyData);
  }

  // ============================================================================
  // HISTORY RETRIEVAL AND FILTERING
  // ============================================================================

  /**
   * Get tournament history with filtering and search
   * @param {Object} options - Filter and search options
   * @returns {ITournament[]} Filtered tournament history
   */
  getTournamentHistory(options = {}) {
    try {
      let tournaments = Array.from(this.historyCache.values());

      // Apply filters
      tournaments = this.applyFilters(tournaments, options);

      // Apply search
      if (options.search) {
        tournaments = this.applySearch(tournaments, options.search);
      }

      // Apply sorting
      tournaments = this.applySorting(tournaments, options.sortBy, options.sortOrder);

      // Apply pagination
      if (options.page && options.pageSize) {
        const start = (options.page - 1) * options.pageSize;
        const end = start + options.pageSize;
        tournaments = tournaments.slice(start, end);
      }

      return tournaments;
    } catch (error) {
      console.error('Error getting tournament history:', error);
      this.handleError('getTournamentHistory', error);
      return [];
    }
  }

  /**
   * Apply filters to tournament list
   * @param {ITournament[]} tournaments - Tournament list
   * @param {Object} filters - Filter options
   * @returns {ITournament[]} Filtered tournaments
   */
  applyFilters(tournaments, filters) {
    let filtered = [...tournaments];

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(t => new Date(t.startDate) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(t => new Date(t.endDate || t.startDate) <= endDate);
    }

    // Format filter
    if (filters.format) {
      filtered = filtered.filter(t => t.format === filters.format);
    }

    // Game filter
    if (filters.gameId) {
      filtered = filtered.filter(t => t.games.includes(filters.gameId));
    }

    // Participant count filter
    if (filters.minParticipants) {
      filtered = filtered.filter(t => t.participants.length >= filters.minParticipants);
    }
    if (filters.maxParticipants) {
      filtered = filtered.filter(t => t.participants.length <= filters.maxParticipants);
    }

    // Duration filter (in minutes)
    if (filters.minDuration || filters.maxDuration) {
      filtered = filtered.filter(t => {
        if (!t.endDate) return false;
        const duration = (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60);
        if (filters.minDuration && duration < filters.minDuration) return false;
        if (filters.maxDuration && duration > filters.maxDuration) return false;
        return true;
      });
    }

    return filtered;
  }

  /**
   * Apply search to tournament list
   * @param {ITournament[]} tournaments - Tournament list
   * @param {string} searchTerm - Search term
   * @returns {ITournament[]} Filtered tournaments
   */
  applySearch(tournaments, searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return tournaments;
    }

    const term = searchTerm.toLowerCase().trim();
    if (!term) return tournaments;

    return tournaments.filter(tournament => {
      // Search in tournament name
      if (tournament.name.toLowerCase().includes(term)) {
        return true;
      }

      // Search in participant names
      if (tournament.participants.some(p => p.name.toLowerCase().includes(term))) {
        return true;
      }

      // Search in game names
      if (tournament.games.some(game => game.toLowerCase().includes(term))) {
        return true;
      }

      return false;
    });
  }

  /**
   * Apply sorting to tournament list
   * @param {ITournament[]} tournaments - Tournament list
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order ('asc' or 'desc')
   * @returns {ITournament[]} Sorted tournaments
   */
  applySorting(tournaments, sortBy = 'endDate', sortOrder = 'desc') {
    const sorted = [...tournaments];

    sorted.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'startDate':
          valueA = new Date(a.startDate);
          valueB = new Date(b.startDate);
          break;
        case 'endDate':
          valueA = new Date(a.endDate || a.startDate);
          valueB = new Date(b.endDate || b.startDate);
          break;
        case 'participants':
          valueA = a.participants.length;
          valueB = b.participants.length;
          break;
        case 'games':
          valueA = a.games.length;
          valueB = b.games.length;
          break;
        case 'duration':
          valueA = a.endDate ? new Date(a.endDate) - new Date(a.startDate) : 0;
          valueB = b.endDate ? new Date(b.endDate) - new Date(b.startDate) : 0;
          break;
        default:
          valueA = a.endDate || a.startDate;
          valueB = b.endDate || b.startDate;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Get tournament by ID from history
   * @param {string} tournamentId - Tournament identifier
   * @returns {ITournament|null} Tournament or null if not found
   */
  getTournamentFromHistory(tournamentId) {
    return this.historyCache.get(tournamentId) || null;
  }

  /**
   * Get tournament from storage (fallback)
   * @param {string} tournamentId - Tournament identifier
   * @returns {ITournament|null} Tournament or null if not found
   */
  getTournamentFromStorage(tournamentId) {
    try {
      const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
      return tournamentsData.tournaments[tournamentId] || null;
    } catch (error) {
      console.error(`Error getting tournament ${tournamentId} from storage:`, error);
      return null;
    }
  }

  // ============================================================================
  // EXPORT/IMPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export tournament history data
   * @param {Object} options - Export options
   * @returns {Object} Export data
   */
  exportTournamentHistory(options = {}) {
    try {
      const tournaments = this.getTournamentHistory(options);
      const historyData = this.storage.getItem('tournament-history', {});

      const exportData = {
        tournaments,
        metadata: {
          totalTournaments: historyData.totalTournaments || tournaments.length,
          totalParticipants: historyData.totalParticipants || 0,
          exportDate: new Date().toISOString(),
          exportOptions: options,
          version: 1
        },
        analytics: this.getAnalyticsSummary()
      };

      console.log(`✅ Exported ${tournaments.length} tournaments`);
      return exportData;
    } catch (error) {
      console.error('Error exporting tournament history:', error);
      this.handleError('exportTournamentHistory', error);
      return null;
    }
  }

  /**
   * Import tournament history data
   * @param {Object} importData - Data to import
   * @returns {boolean} True if successful
   */
  importTournamentHistory(importData) {
    try {
      if (!importData || !importData.tournaments || !Array.isArray(importData.tournaments)) {
        throw new Error('Invalid import data format');
      }

      let importedCount = 0;
      const historyData = this.storage.getItem('tournament-history', {
        completedTournaments: [],
        totalTournaments: 0,
        totalParticipants: 0,
        lastCleanup: new Date().toISOString()
      });

      // Import tournaments
      importData.tournaments.forEach(tournament => {
        if (tournament.status === 'completed' && tournament.id) {
          // Add to cache
          this.historyCache.set(tournament.id, tournament);

          // Add to history metadata if not already present
          if (!historyData.completedTournaments.includes(tournament.id)) {
            historyData.completedTournaments.push(tournament.id);
            historyData.totalTournaments++;
            historyData.totalParticipants += tournament.participants.length;
          }

          importedCount++;
        }
      });

      // Update history metadata
      this.storage.setItem('tournament-history', historyData);

      // Clear analytics cache
      this.analyticsCache.clear();

      console.log(`✅ Imported ${importedCount} tournaments to history`);
      return true;
    } catch (error) {
      console.error('Error importing tournament history:', error);
      this.handleError('importTournamentHistory', error);
      return false;
    }
  }

  /**
   * Export tournament history as downloadable file
   * @param {Object} options - Export options
   * @returns {string} Download URL
   */
  exportToFile(options = {}) {
    try {
      const exportData = this.exportTournamentHistory(options);
      if (!exportData) {
        throw new Error('Failed to generate export data');
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `tournament-history-${timestamp}.json`;

      // Create download link
      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      }

      return url;
    } catch (error) {
      console.error('Error exporting to file:', error);
      this.handleError('exportToFile', error);
      return null;
    }
  }

  /**
   * Import tournament history from file
   * @param {File} file - File to import
   * @returns {Promise<boolean>} True if successful
   */
  async importFromFile(file) {
    try {
      if (!file || file.type !== 'application/json') {
        throw new Error('Invalid file type. Please select a JSON file.');
      }

      const text = await file.text();
      const importData = JSON.parse(text);

      return this.importTournamentHistory(importData);
    } catch (error) {
      console.error('Error importing from file:', error);
      this.handleError('importFromFile', error);
      return false;
    }
  }

  // ============================================================================
  // DATA ARCHIVING AND CLEANUP
  // ============================================================================

  /**
   * Archive old tournament data
   * @param {number} retainDays - Days to retain data
   * @returns {Object} Archiving results
   */
  archiveOldData(retainDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retainDays);

      let archivedCount = 0;
      let freedBytes = 0;
      const archivedTournaments = [];

      // Find tournaments to archive
      this.historyCache.forEach((tournament, tournamentId) => {
        if (tournament.endDate) {
          const endDate = new Date(tournament.endDate);
          if (endDate < cutoffDate) {
            // Calculate size before archiving
            const tournamentSize = JSON.stringify(tournament).length;
            freedBytes += tournamentSize;

            // Store tournament data for potential export
            archivedTournaments.push(tournament);

            // Remove from cache
            this.historyCache.delete(tournamentId);
            archivedCount++;
          }
        }
      });

      // Update history metadata
      if (archivedCount > 0) {
        const historyData = this.storage.getItem('tournament-history', {});
        historyData.completedTournaments = historyData.completedTournaments.filter(
          id => this.historyCache.has(id)
        );
        historyData.lastCleanup = new Date().toISOString();
        this.storage.setItem('tournament-history', historyData);

        // Clear analytics cache
        this.analyticsCache.clear();
      }

      const results = {
        archivedCount,
        freedBytes,
        cutoffDate: cutoffDate.toISOString(),
        archivedTournaments: archivedTournaments.map(t => ({
          id: t.id,
          name: t.name,
          endDate: t.endDate,
          participants: t.participants.length
        }))
      };

      console.log(`✅ Archived ${archivedCount} tournaments, freed ${freedBytes} bytes`);
      return results;
    } catch (error) {
      console.error('Error archiving old data:', error);
      this.handleError('archiveOldData', error);
      return { archivedCount: 0, freedBytes: 0, error: error.message };
    }
  }

  /**
   * Get storage quota information
   * @returns {Object} Storage quota info
   */
  getStorageQuotaInfo() {
    try {
      const storageInfo = this.storage.getStorageInfo();
      const historySize = JSON.stringify(Array.from(this.historyCache.values())).length;

      return {
        ...storageInfo,
        historySize,
        historyCount: this.historyCache.size,
        quotaUsagePercent: this.calculateQuotaUsage()
      };
    } catch (error) {
      console.error('Error getting storage quota info:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate storage quota usage percentage
   * @returns {number} Usage percentage (0-100)
   */
  calculateQuotaUsage() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        // Modern browsers with Storage API
        navigator.storage.estimate().then(estimate => {
          const usage = (estimate.usage / estimate.quota) * 100;
          return Math.round(usage);
        });
      }

      // Fallback estimation based on localStorage
      const totalSize = this.storage.getStorageInfo().estimatedSizeBytes;
      const estimatedQuota = 5 * 1024 * 1024; // 5MB typical localStorage limit
      return Math.round((totalSize / estimatedQuota) * 100);
    } catch (error) {
      console.error('Error calculating quota usage:', error);
      return 0;
    }
  }

  // ============================================================================
  // ANALYTICS SUMMARY
  // ============================================================================

  /**
   * Get analytics summary for export
   * @returns {Object} Analytics summary
   */
  getAnalyticsSummary() {
    try {
      const tournaments = Array.from(this.historyCache.values());

      if (tournaments.length === 0) {
        return { totalTournaments: 0, message: 'No tournament history available' };
      }

      const summary = {
        totalTournaments: tournaments.length,
        totalParticipants: tournaments.reduce((sum, t) => sum + t.participants.length, 0),
        averageParticipants: tournaments.reduce((sum, t) => sum + t.participants.length, 0) / tournaments.length,
        formatDistribution: this.getFormatDistribution(tournaments),
        gamePopularity: this.getGamePopularity(tournaments),
        averageDuration: this.getAverageDuration(tournaments),
        timeRange: this.getTimeRange(tournaments)
      };

      return summary;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return { error: error.message };
    }
  }

  /**
   * Get format distribution
   * @param {ITournament[]} tournaments - Tournament list
   * @returns {Object} Format distribution
   */
  getFormatDistribution(tournaments) {
    const distribution = {};
    tournaments.forEach(tournament => {
      distribution[tournament.format] = (distribution[tournament.format] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get game popularity
   * @param {ITournament[]} tournaments - Tournament list
   * @returns {Object} Game popularity
   */
  getGamePopularity(tournaments) {
    const popularity = {};
    tournaments.forEach(tournament => {
      tournament.games.forEach(game => {
        popularity[game] = (popularity[game] || 0) + 1;
      });
    });
    return popularity;
  }

  /**
   * Get average tournament duration
   * @param {ITournament[]} tournaments - Tournament list
   * @returns {number} Average duration in minutes
   */
  getAverageDuration(tournaments) {
    const durations = tournaments
      .filter(t => t.endDate)
      .map(t => (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60));

    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
  }

  /**
   * Get time range of tournaments
   * @param {ITournament[]} tournaments - Tournament list
   * @returns {Object} Time range
   */
  getTimeRange(tournaments) {
    if (tournaments.length === 0) return null;

    const dates = tournaments.map(t => new Date(t.startDate));
    return {
      earliest: new Date(Math.min(...dates)).toISOString(),
      latest: new Date(Math.max(...dates)).toISOString()
    };
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Handle errors with appropriate logging and recovery
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error object
   */
  handleError(operation, error) {
    const errorInfo = {
      operation,
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    console.error('TournamentHistoryManager error:', errorInfo);

    // Dispatch error event for UI handling
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('tournament-history:error', {
        detail: errorInfo,
        bubbles: true
      });
      window.dispatchEvent(event);
    }
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentHistoryManager };
} else if (typeof window !== 'undefined') {
  window.TournamentHistoryManager = TournamentHistoryManager;
}
