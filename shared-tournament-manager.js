/**
 * Cross-Game Tournament System - Tournament Manager
 *
 * This module implements the TournamentManager class with full CRUD operations
 * for tournament management, following the design specification requirements.
 *
 * Features:
 * - Tournament creation with configuration validation
 * - Participant registration and management
 * - Tournament state transitions (created → active → completed)
 * - LocalStorage persistence with data integrity checks
 * - Integration with tournament models and validation
 */

// Import dependencies (will be loaded via script tags in browser)
// In Node.js environment, these would be proper imports

/**
 * Tournament Manager Class
 * Handles all tournament CRUD operations and state management
 */
class TournamentManager {
  constructor() {
    // Initialize storage manager
    this.storage = typeof tournamentStorage !== 'undefined'
      ? tournamentStorage
      : new TournamentStorageManager();

    // Initialize validation functions
    this.validateConfig = typeof validateTournamentConfig !== 'undefined'
      ? validateTournamentConfig
      : this.fallbackValidation;

    this.sanitizeConfig = typeof sanitizeTournamentConfig !== 'undefined'
      ? sanitizeTournamentConfig
      : this.fallbackSanitization;

    this.validateParticipant = typeof validateParticipant !== 'undefined'
      ? validateParticipant
      : this.fallbackParticipantValidation;

    // Tournament state cache
    this.tournamentCache = new Map();

    // Initialize
    this.initialize();
  }

  /**
   * Initialize the tournament manager
   */
  initialize() {
    try {
      // Load existing tournaments into cache
      this.loadTournamentsToCache();

      // Set up event listeners for storage changes
      this.setupStorageListeners();

      console.log('🏆 TournamentManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TournamentManager:', error);
      this.handleError('initialization', error);
    }
  }

  /**
   * Load tournaments from storage into cache
   */
  loadTournamentsToCache() {
    const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
    const tournaments = tournamentsData.tournaments || {};

    Object.entries(tournaments).forEach(([id, tournament]) => {
      this.tournamentCache.set(id, tournament);
    });

    console.log(`Loaded ${this.tournamentCache.size} tournaments into cache`);
  }

  /**
   * Set up storage event listeners
   */
  setupStorageListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('tournament-storage-error', (event) => {
        console.error('Storage error detected:', event.detail);
        this.handleStorageError(event.detail);
      });
    }
  }

  // ============================================================================
  // TOURNAMENT CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new tournament
   * @param {Object} config - Tournament configuration
   * @returns {ITournament|null} Created tournament or null if failed
   */
  createTournament(config) {
    try {
      // Validate configuration
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        throw new Error(`Invalid tournament configuration: ${validation.errors.join(', ')}`);
      }

      // Sanitize configuration
      const sanitizedConfig = this.sanitizeConfig(config);

      // Generate unique tournament ID
      const tournamentId = this.generateTournamentId();

      // Create tournament object
      const tournament = {
        id: tournamentId,
        name: sanitizedConfig.name,
        games: sanitizedConfig.games,
        format: sanitizedConfig.format,
        participants: [],
        status: 'created',
        startDate: new Date().toISOString(),
        endDate: null,
        settings: sanitizedConfig.settings,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to storage
      if (this.saveTournament(tournament)) {
        // Add to cache
        this.tournamentCache.set(tournamentId, tournament);

        // Dispatch creation event
        this.dispatchTournamentEvent('tournament:created', tournament);

        console.log(`✅ Tournament created: ${tournament.name} (${tournamentId})`);
        return tournament;
      } else {
        throw new Error('Failed to save tournament to storage');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      this.handleError('createTournament', error);
      return null;
    }
  }

  /**
   * Get tournament by ID
   * @param {string} tournamentId - Tournament identifier
   * @returns {ITournament|null} Tournament object or null if not found
   */
  getTournament(tournamentId) {
    try {
      // Check cache first
      if (this.tournamentCache.has(tournamentId)) {
        return this.tournamentCache.get(tournamentId);
      }

      // Load from storage
      const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
      const tournament = tournamentsData.tournaments[tournamentId];

      if (tournament) {
        // Add to cache
        this.tournamentCache.set(tournamentId, tournament);
        return tournament;
      }

      return null;
    } catch (error) {
      console.error(`Error getting tournament ${tournamentId}:`, error);
      this.handleError('getTournament', error);
      return null;
    }
  }

  /**
   * Update tournament
   * @param {string} tournamentId - Tournament identifier
   * @param {Object} updates - Fields to update
   * @returns {ITournament|null} Updated tournament or null if failed
   */
  updateTournament(tournamentId, updates) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        throw new Error(`Tournament not found: ${tournamentId}`);
      }

      // Create updated tournament object
      const updatedTournament = {
        ...tournament,
        ...updates,
        id: tournamentId, // Ensure ID cannot be changed
        updatedAt: new Date().toISOString()
      };

      // Validate updated tournament
      if (updates.name || updates.games || updates.format || updates.settings) {
        const validation = this.validateConfig({
          name: updatedTournament.name,
          games: updatedTournament.games,
          format: updatedTournament.format,
          settings: updatedTournament.settings
        });

        if (!validation.isValid) {
          throw new Error(`Invalid tournament update: ${validation.errors.join(', ')}`);
        }
      }

      // Save to storage
      if (this.saveTournament(updatedTournament)) {
        // Update cache
        this.tournamentCache.set(tournamentId, updatedTournament);

        // Dispatch update event
        this.dispatchTournamentEvent('tournament:updated', updatedTournament);

        console.log(`✅ Tournament updated: ${tournamentId}`);
        return updatedTournament;
      } else {
        throw new Error('Failed to save tournament update');
      }
    } catch (error) {
      console.error(`Error updating tournament ${tournamentId}:`, error);
      this.handleError('updateTournament', error);
      return null;
    }
  }

  /**
   * Delete tournament
   * @param {string} tournamentId - Tournament identifier
   * @returns {boolean} True if deleted successfully
   */
  deleteTournament(tournamentId) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        console.warn(`Tournament not found for deletion: ${tournamentId}`);
        return false;
      }

      // Remove from storage
      const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
      delete tournamentsData.tournaments[tournamentId];

      if (this.storage.setItem('tournaments', tournamentsData)) {
        // Remove from cache
        this.tournamentCache.delete(tournamentId);

        // Dispatch deletion event
        this.dispatchTournamentEvent('tournament:deleted', { id: tournamentId, tournament });

        console.log(`✅ Tournament deleted: ${tournamentId}`);
        return true;
      } else {
        throw new Error('Failed to save tournament deletion');
      }
    } catch (error) {
      console.error(`Error deleting tournament ${tournamentId}:`, error);
      this.handleError('deleteTournament', error);
      return false;
    }
  }

  /**
   * Get all tournaments
   * @param {Object} filters - Optional filters (status, format, etc.)
   * @returns {ITournament[]} Array of tournaments
   */
  getAllTournaments(filters = {}) {
    try {
      const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
      let tournaments = Object.values(tournamentsData.tournaments || {});

      // Apply filters
      if (filters.status) {
        tournaments = tournaments.filter(t => t.status === filters.status);
      }
      if (filters.format) {
        tournaments = tournaments.filter(t => t.format === filters.format);
      }
      if (filters.gameId) {
        tournaments = tournaments.filter(t => t.games.includes(filters.gameId));
      }

      // Sort by creation date (newest first)
      tournaments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return tournaments;
    } catch (error) {
      console.error('Error getting all tournaments:', error);
      this.handleError('getAllTournaments', error);
      return [];
    }
  }

  // ============================================================================
  // PARTICIPANT MANAGEMENT
  // ============================================================================

  /**
   * Join tournament as participant
   * @param {string} tournamentId - Tournament identifier
   * @param {string} playerId - Player identifier
   * @param {string} playerName - Player display name
   * @returns {boolean} True if joined successfully
   */
  joinTournament(tournamentId, playerId, playerName) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        throw new Error(`Tournament not found: ${tournamentId}`);
      }

      // Check tournament status
      if (tournament.status !== 'created') {
        throw new Error(`Cannot join tournament in status: ${tournament.status}`);
      }

      // Check if already joined
      const existingParticipant = tournament.participants.find(p => p.id === playerId);
      if (existingParticipant) {
        console.warn(`Player ${playerId} already in tournament ${tournamentId}`);
        return true;
      }

      // Check participant limit
      if (tournament.participants.length >= tournament.settings.maxParticipants) {
        throw new Error(`Tournament is full (${tournament.settings.maxParticipants} participants)`);
      }

      // Create participant object
      const participant = {
        id: playerId,
        name: playerName.trim(),
        scores: {},
        normalizedScores: {},
        totalScore: 0,
        rank: tournament.participants.length + 1,
        gamesCompleted: [],
        joinedAt: new Date().toISOString()
      };

      // Validate participant
      const validation = this.validateParticipant(participant);
      if (!validation.isValid) {
        throw new Error(`Invalid participant data: ${validation.errors.join(', ')}`);
      }

      // Add participant to tournament
      tournament.participants.push(participant);
      tournament.updatedAt = new Date().toISOString();

      // Save tournament
      if (this.saveTournament(tournament)) {
        // Update cache
        this.tournamentCache.set(tournamentId, tournament);

        // Dispatch join event
        this.dispatchTournamentEvent('tournament:participant-joined', {
          tournament,
          participant
        });

        console.log(`✅ Player ${playerId} joined tournament ${tournamentId}`);
        return true;
      } else {
        throw new Error('Failed to save participant join');
      }
    } catch (error) {
      console.error(`Error joining tournament ${tournamentId}:`, error);
      this.handleError('joinTournament', error);
      return false;
    }
  }

  /**
   * Remove participant from tournament
   * @param {string} tournamentId - Tournament identifier
   * @param {string} playerId - Player identifier
   * @returns {boolean} True if removed successfully
   */
  leaveTournament(tournamentId, playerId) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        throw new Error(`Tournament not found: ${tournamentId}`);
      }

      // Check tournament status
      if (tournament.status === 'completed') {
        throw new Error('Cannot leave completed tournament');
      }

      // Find and remove participant
      const participantIndex = tournament.participants.findIndex(p => p.id === playerId);
      if (participantIndex === -1) {
        console.warn(`Player ${playerId} not found in tournament ${tournamentId}`);
        return false;
      }

      const removedParticipant = tournament.participants.splice(participantIndex, 1)[0];
      tournament.updatedAt = new Date().toISOString();

      // Recalculate ranks
      this.recalculateRanks(tournament);

      // Save tournament
      if (this.saveTournament(tournament)) {
        // Update cache
        this.tournamentCache.set(tournamentId, tournament);

        // Dispatch leave event
        this.dispatchTournamentEvent('tournament:participant-left', {
          tournament,
          participant: removedParticipant
        });

        console.log(`✅ Player ${playerId} left tournament ${tournamentId}`);
        return true;
      } else {
        throw new Error('Failed to save participant removal');
      }
    } catch (error) {
      console.error(`Error leaving tournament ${tournamentId}:`, error);
      this.handleError('leaveTournament', error);
      return false;
    }
  }

  // ============================================================================
  // TOURNAMENT STATE MANAGEMENT
  // ============================================================================

  /**
   * Start tournament (transition from created to active)
   * @param {string} tournamentId - Tournament identifier
   * @returns {boolean} True if started successfully
   */
  startTournament(tournamentId) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        throw new Error(`Tournament not found: ${tournamentId}`);
      }

      if (tournament.status !== 'created') {
        throw new Error(`Cannot start tournament in status: ${tournament.status}`);
      }

      if (tournament.participants.length < 2) {
        throw new Error('Tournament needs at least 2 participants to start');
      }

      // Update tournament status
      const updatedTournament = {
        ...tournament,
        status: 'active',
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save tournament
      if (this.saveTournament(updatedTournament)) {
        // Update cache
        this.tournamentCache.set(tournamentId, updatedTournament);

        // Dispatch start event
        this.dispatchTournamentEvent('tournament:started', updatedTournament);

        console.log(`✅ Tournament started: ${tournamentId}`);
        return true;
      } else {
        throw new Error('Failed to save tournament start');
      }
    } catch (error) {
      console.error(`Error starting tournament ${tournamentId}:`, error);
      this.handleError('startTournament', error);
      return false;
    }
  }

  /**
   * Complete tournament (transition from active to completed)
   * @param {string} tournamentId - Tournament identifier
   * @returns {boolean} True if completed successfully
   */
  completeTournament(tournamentId) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        throw new Error(`Tournament not found: ${tournamentId}`);
      }

      if (tournament.status !== 'active') {
        throw new Error(`Cannot complete tournament in status: ${tournament.status}`);
      }

      // Update tournament status
      const updatedTournament = {
        ...tournament,
        status: 'completed',
        endDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Final rank calculation
      this.recalculateRanks(updatedTournament);

      // Save tournament
      if (this.saveTournament(updatedTournament)) {
        // Update cache
        this.tournamentCache.set(tournamentId, updatedTournament);

        // Update history
        this.updateTournamentHistory(tournamentId);

        // Dispatch completion event
        this.dispatchTournamentEvent('tournament:completed', updatedTournament);

        console.log(`✅ Tournament completed: ${tournamentId}`);
        return true;
      } else {
        throw new Error('Failed to save tournament completion');
      }
    } catch (error) {
      console.error(`Error completing tournament ${tournamentId}:`, error);
      this.handleError('completeTournament', error);
      return false;
    }
  }

  /**
   * Get tournament status with additional computed data
   * @param {string} tournamentId - Tournament identifier
   * @returns {Object|null} Tournament status object or null if not found
   */
  getTournamentStatus(tournamentId) {
    try {
      const tournament = this.getTournament(tournamentId);
      if (!tournament) {
        return null;
      }

      // Calculate additional status information
      const now = new Date();
      const startDate = new Date(tournament.startDate);
      const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

      const status = {
        ...tournament,
        isActive: tournament.status === 'active',
        isCompleted: tournament.status === 'completed',
        participantCount: tournament.participants.length,
        gamesCount: tournament.games.length,
        completedGamesCount: this.getCompletedGamesCount(tournament),
        leaderboard: this.getLeaderboard(tournament),
        timeElapsed: now - startDate,
        timeRemaining: endDate ? Math.max(0, endDate - now) : null,
        progress: this.calculateTournamentProgress(tournament)
      };

      return status;
    } catch (error) {
      console.error(`Error getting tournament status ${tournamentId}:`, error);
      this.handleError('getTournamentStatus', error);
      return null;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique tournament ID
   * @returns {string} Unique tournament identifier
   */
  generateTournamentId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `tournament-${timestamp}-${random}`;
  }

  /**
   * Save tournament to storage
   * @param {ITournament} tournament - Tournament to save
   * @returns {boolean} True if saved successfully
   */
  saveTournament(tournament) {
    try {
      const tournamentsData = this.storage.getItem('tournaments', { tournaments: {} });
      tournamentsData.tournaments[tournament.id] = tournament;
      return this.storage.setItem('tournaments', tournamentsData);
    } catch (error) {
      console.error('Error saving tournament:', error);
      return false;
    }
  }

  /**
   * Recalculate participant ranks based on total scores
   * @param {ITournament} tournament - Tournament to recalculate
   */
  recalculateRanks(tournament) {
    // Sort participants by total score (descending)
    tournament.participants.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    tournament.participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });
  }

  /**
   * Get leaderboard for tournament
   * @param {ITournament} tournament - Tournament object
   * @returns {Array} Sorted leaderboard
   */
  getLeaderboard(tournament) {
    return [...tournament.participants]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((participant, index) => ({
        ...participant,
        position: index + 1
      }));
  }

  /**
   * Calculate tournament progress (0-1)
   * @param {ITournament} tournament - Tournament object
   * @returns {number} Progress value between 0 and 1
   */
  calculateTournamentProgress(tournament) {
    if (tournament.status === 'completed') return 1;
    if (tournament.status === 'created') return 0;

    const totalGames = tournament.games.length * tournament.participants.length;
    const completedGames = tournament.participants.reduce((total, participant) => {
      return total + participant.gamesCompleted.length;
    }, 0);

    return totalGames > 0 ? completedGames / totalGames : 0;
  }

  /**
   * Get count of completed games across all participants
   * @param {ITournament} tournament - Tournament object
   * @returns {number} Number of completed games
   */
  getCompletedGamesCount(tournament) {
    return tournament.participants.reduce((total, participant) => {
      return total + participant.gamesCompleted.length;
    }, 0);
  }

  /**
   * Update tournament history
   * @param {string} tournamentId - Tournament identifier
   */
  updateTournamentHistory(tournamentId) {
    try {
      const history = this.storage.getItem('tournament-history', {
        completedTournaments: [],
        totalTournaments: 0,
        totalParticipants: 0,
        lastCleanup: new Date().toISOString()
      });

      if (!history.completedTournaments.includes(tournamentId)) {
        history.completedTournaments.push(tournamentId);
        history.totalTournaments++;

        const tournament = this.getTournament(tournamentId);
        if (tournament) {
          history.totalParticipants += tournament.participants.length;
        }
      }

      this.storage.setItem('tournament-history', history);
    } catch (error) {
      console.error('Error updating tournament history:', error);
    }
  }

  /**
   * Dispatch tournament event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  dispatchTournamentEvent(eventType, data) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent(eventType, {
        detail: data,
        bubbles: true
      });
      window.dispatchEvent(event);
    }
  }

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

    console.error('TournamentManager error:', errorInfo);

    // Dispatch error event for UI handling
    this.dispatchTournamentEvent('tournament:error', errorInfo);
  }

  /**
   * Handle storage errors
   * @param {Object} errorDetail - Error detail from storage event
   */
  handleStorageError(errorDetail) {
    console.warn('Storage error in TournamentManager:', errorDetail);

    // Could implement recovery strategies here
    if (errorDetail.operation === 'write') {
      // Maybe try to clear cache and retry
      console.log('Attempting to clear cache and retry...');
    }
  }

  // ============================================================================
  // FALLBACK METHODS (for environments without tournament models)
  // ============================================================================

  /**
   * Fallback validation when tournament models are not available
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  fallbackValidation(config) {
    const errors = [];

    if (!config.name || typeof config.name !== 'string') {
      errors.push('Tournament name is required');
    }

    if (!Array.isArray(config.games) || config.games.length === 0) {
      errors.push('At least one game is required');
    }

    if (!config.format || !['elimination', 'round-robin'].includes(config.format)) {
      errors.push('Valid tournament format is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Fallback sanitization when tournament models are not available
   * @param {Object} config - Configuration to sanitize
   * @returns {Object} Sanitized configuration
   */
  fallbackSanitization(config) {
    return {
      name: String(config.name || '').trim(),
      games: Array.isArray(config.games) ? config.games : [],
      format: ['elimination', 'round-robin'].includes(config.format) ? config.format : 'round-robin',
      settings: {
        maxParticipants: parseInt(config.settings?.maxParticipants) || 8,
        scoreNormalization: Boolean(config.settings?.scoreNormalization),
        autoAdvance: Boolean(config.settings?.autoAdvance)
      }
    };
  }

  /**
   * Fallback participant validation
   * @param {Object} participant - Participant to validate
   * @returns {Object} Validation result
   */
  fallbackParticipantValidation(participant) {
    const errors = [];

    if (!participant.id || typeof participant.id !== 'string') {
      errors.push('Participant ID is required');
    }

    if (!participant.name || typeof participant.name !== 'string') {
      errors.push('Participant name is required');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentManager };
} else if (typeof window !== 'undefined') {
  window.TournamentManager = TournamentManager;
}
