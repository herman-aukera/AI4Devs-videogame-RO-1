/**
 * Cross-Game Tournament System - Data Models and Validation
 *
 * This module defines the core data structures, validation logic, and storage
 * management for the tournament system. It follows the established patterns
 * from the existing game collection while maintaining TypeScript-style interfaces
 * through JSDoc annotations.
 */

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

/**
 * @typedef {Object} ITournament
 * @property {string} id - Unique tournament identifier
 * @property {string} name - Tournament display name
 * @property {string[]} games - Array of game IDs (e.g., ['snake-GG', 'tetris-GG'])
 * @property {'elimination'|'round-robin'} format - Tournament format
 * @property {IParticipant[]} participants - Registered participants
 * @property {'created'|'active'|'completed'} status - Tournament state
 * @property {string} startDate - Tournament start timestamp (ISO string)
 * @property {string} [endDate] - Tournament completion timestamp (ISO string)
 * @property {ITournamentSettings} settings - Configuration options
 * @property {number} version - Schema version for data migration
 */

/**
 * @typedef {Object} IParticipant
 * @property {string} id - Unique participant identifier
 * @property {string} name - Display name
 * @property {Object.<string, number>} scores - Game-specific scores
 * @property {Object.<string, number>} normalizedScores - Normalized scores for comparison
 * @property {number} totalScore - Aggregate tournament score
 * @property {number} rank - Current tournament ranking
 * @property {string[]} gamesCompleted - List of completed games
 */

/**
 * @typedef {Object} ITournamentSettings
 * @property {number} maxParticipants - Maximum allowed participants
 * @property {boolean} scoreNormalization - Enable score normalization
 * @property {boolean} autoAdvance - Auto-advance to next round
 * @property {number} [timeLimit] - Optional time limit per game (seconds)
 */

/**
 * @typedef {Object} ITournamentStorage
 * @property {Object.<string, ITournament>} tournaments - Tournament data by ID
 * @property {ITournamentGlobalSettings} settings - Global tournament settings
 * @property {ITournamentHistory} history - Tournament history metadata
 * @property {number} version - Storage schema version
 */

/**
 * @typedef {Object} ITournamentGlobalSettings
 * @property {'elimination'|'round-robin'} defaultFormat - Default tournament format
 * @property {boolean} scoreNormalization - Default score normalization setting
 * @property {number} maxParticipants - Default maximum participants
 * @property {boolean} autoAdvance - Default auto-advance setting
 * @property {number} retainHistory - Days to retain tournament history
 */

/**
 * @typedef {Object} ITournamentHistory
 * @property {string[]} completedTournaments - Array of completed tournament IDs
 * @property {number} totalTournaments - Total number of tournaments created
 * @property {number} totalParticipants - Total number of unique participants
 * @property {string} lastCleanup - Last cleanup timestamp (ISO string)
 */

// ============================================================================
// VALIDATION CONSTANTS AND RULES
// ============================================================================

const TOURNAMENT_CONSTANTS = {
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 16,
  MIN_GAMES: 1,
  MAX_GAMES: 10,
  MAX_NAME_LENGTH: 50,
  MAX_PARTICIPANT_NAME_LENGTH: 30,
  MIN_TIME_LIMIT: 30, // seconds
  MAX_TIME_LIMIT: 3600, // seconds
  CURRENT_SCHEMA_VERSION: 1,
  STORAGE_KEYS: {
    TOURNAMENTS: 'tournaments',
    SETTINGS: 'tournament-settings',
    HISTORY: 'tournament-history'
  }
};

const VALID_GAME_IDS = [
  'snake-GG',
  'breakout-GG',
  'fruit-catcher-GG',
  'asteroids-GG',
  'space-invaders-GG',
  'pacman-GG',
  'mspacman-GG',
  'tetris-GG',
  'pong-GG',
  'galaga-GG'
];

const VALID_FORMATS = ['elimination', 'round-robin'];
const VALID_STATUSES = ['created', 'active', 'completed'];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates tournament configuration data
 * @param {Object} config - Tournament configuration to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
function validateTournamentConfig(config) {
  const errors = [];

  // Basic structure validation
  if (!config || typeof config !== 'object') {
    errors.push('Tournament configuration must be an object');
    return { isValid: false, errors };
  }

  // Name validation
  if (typeof config.name !== 'string') {
    errors.push('Tournament name is required and must be a string');
  } else if (config.name.trim().length === 0) {
    errors.push('Tournament name cannot be empty');
  } else if (config.name.length > TOURNAMENT_CONSTANTS.MAX_NAME_LENGTH) {
    errors.push(`Tournament name must be ${TOURNAMENT_CONSTANTS.MAX_NAME_LENGTH} characters or less`);
  }

  // Games validation
  if (!Array.isArray(config.games)) {
    errors.push('Games must be an array');
  } else {
    if (config.games.length < TOURNAMENT_CONSTANTS.MIN_GAMES) {
      errors.push(`Tournament must include at least ${TOURNAMENT_CONSTANTS.MIN_GAMES} game`);
    }
    if (config.games.length > TOURNAMENT_CONSTANTS.MAX_GAMES) {
      errors.push(`Tournament cannot include more than ${TOURNAMENT_CONSTANTS.MAX_GAMES} games`);
    }

    const invalidGames = config.games.filter(game => !VALID_GAME_IDS.includes(game));
    if (invalidGames.length > 0) {
      errors.push(`Invalid game IDs: ${invalidGames.join(', ')}`);
    }

    const duplicateGames = config.games.filter((game, index) => config.games.indexOf(game) !== index);
    if (duplicateGames.length > 0) {
      errors.push(`Duplicate games not allowed: ${duplicateGames.join(', ')}`);
    }
  }

  // Format validation
  if (!config.format || !VALID_FORMATS.includes(config.format)) {
    errors.push(`Tournament format must be one of: ${VALID_FORMATS.join(', ')}`);
  }

  // Settings validation
  if (config.settings) {
    const settingsErrors = validateTournamentSettings(config.settings);
    errors.push(...settingsErrors);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates tournament settings
 * @param {ITournamentSettings} settings - Settings to validate
 * @returns {string[]} Array of validation errors
 */
function validateTournamentSettings(settings) {
  const errors = [];

  if (typeof settings !== 'object' || settings === null) {
    errors.push('Tournament settings must be an object');
    return errors;
  }

  // Max participants validation
  if (typeof settings.maxParticipants !== 'number') {
    errors.push('maxParticipants must be a number');
  } else if (settings.maxParticipants < TOURNAMENT_CONSTANTS.MIN_PARTICIPANTS) {
    errors.push(`maxParticipants must be at least ${TOURNAMENT_CONSTANTS.MIN_PARTICIPANTS}`);
  } else if (settings.maxParticipants > TOURNAMENT_CONSTANTS.MAX_PARTICIPANTS) {
    errors.push(`maxParticipants cannot exceed ${TOURNAMENT_CONSTANTS.MAX_PARTICIPANTS}`);
  }

  // Boolean validations
  if (typeof settings.scoreNormalization !== 'boolean') {
    errors.push('scoreNormalization must be a boolean');
  }
  if (typeof settings.autoAdvance !== 'boolean') {
    errors.push('autoAdvance must be a boolean');
  }

  // Time limit validation (optional)
  if (settings.timeLimit !== undefined) {
    if (typeof settings.timeLimit !== 'number') {
      errors.push('timeLimit must be a number');
    } else if (settings.timeLimit < TOURNAMENT_CONSTANTS.MIN_TIME_LIMIT) {
      errors.push(`timeLimit must be at least ${TOURNAMENT_CONSTANTS.MIN_TIME_LIMIT} seconds`);
    } else if (settings.timeLimit > TOURNAMENT_CONSTANTS.MAX_TIME_LIMIT) {
      errors.push(`timeLimit cannot exceed ${TOURNAMENT_CONSTANTS.MAX_TIME_LIMIT} seconds`);
    }
  }

  return errors;
}

/**
 * Validates participant data
 * @param {IParticipant} participant - Participant to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
function validateParticipant(participant) {
  const errors = [];

  if (!participant || typeof participant !== 'object') {
    errors.push('Participant must be an object');
    return { isValid: false, errors };
  }

  // ID validation
  if (!participant.id || typeof participant.id !== 'string') {
    errors.push('Participant ID is required and must be a string');
  }

  // Name validation
  if (!participant.name || typeof participant.name !== 'string') {
    errors.push('Participant name is required and must be a string');
  } else if (participant.name.length > TOURNAMENT_CONSTANTS.MAX_PARTICIPANT_NAME_LENGTH) {
    errors.push(`Participant name must be ${TOURNAMENT_CONSTANTS.MAX_PARTICIPANT_NAME_LENGTH} characters or less`);
  } else if (participant.name.trim().length === 0) {
    errors.push('Participant name cannot be empty');
  }

  // Scores validation
  if (participant.scores && typeof participant.scores !== 'object') {
    errors.push('Participant scores must be an object');
  }

  // Normalized scores validation
  if (participant.normalizedScores && typeof participant.normalizedScores !== 'object') {
    errors.push('Participant normalizedScores must be an object');
  }

  // Total score validation
  if (participant.totalScore !== undefined && typeof participant.totalScore !== 'number') {
    errors.push('Participant totalScore must be a number');
  }

  // Rank validation
  if (participant.rank !== undefined && (typeof participant.rank !== 'number' || participant.rank < 1)) {
    errors.push('Participant rank must be a positive number');
  }

  // Games completed validation
  if (participant.gamesCompleted && !Array.isArray(participant.gamesCompleted)) {
    errors.push('Participant gamesCompleted must be an array');
  }

  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// DATA SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitizes and normalizes tournament configuration
 * @param {Object} config - Raw tournament configuration
 * @returns {Object} Sanitized configuration
 */
function sanitizeTournamentConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid tournament configuration');
  }

  return {
    name: String(config.name || '').trim(),
    games: Array.isArray(config.games) ? [...new Set(config.games)] : [],
    format: VALID_FORMATS.includes(config.format) ? config.format : 'round-robin',
    settings: sanitizeTournamentSettings(config.settings || {})
  };
}

/**
 * Sanitizes tournament settings
 * @param {Object} settings - Raw settings object
 * @returns {ITournamentSettings} Sanitized settings
 */
function sanitizeTournamentSettings(settings) {
  const sanitized = {
    maxParticipants: Math.min(Math.max(parseInt(settings.maxParticipants) || 8, TOURNAMENT_CONSTANTS.MIN_PARTICIPANTS), TOURNAMENT_CONSTANTS.MAX_PARTICIPANTS),
    scoreNormalization: settings.scoreNormalization === 'false' || settings.scoreNormalization === false ? false : Boolean(settings.scoreNormalization !== false),
    autoAdvance: settings.autoAdvance === 'false' || settings.autoAdvance === false || settings.autoAdvance === 0 ? false : Boolean(settings.autoAdvance !== false)
  };

  if (settings.timeLimit !== undefined) {
    const timeLimit = parseInt(settings.timeLimit);
    if (!isNaN(timeLimit)) {
      sanitized.timeLimit = Math.min(Math.max(timeLimit, TOURNAMENT_CONSTANTS.MIN_TIME_LIMIT), TOURNAMENT_CONSTANTS.MAX_TIME_LIMIT);
    }
  }

  return sanitized;
}

/**
 * Sanitizes participant data
 * @param {Object} participant - Raw participant data
 * @returns {IParticipant} Sanitized participant
 */
function sanitizeParticipant(participant) {
  if (!participant || typeof participant !== 'object') {
    throw new Error('Invalid participant data');
  }

  return {
    id: String(participant.id || '').trim(),
    name: String(participant.name || '').trim(),
    scores: participant.scores && typeof participant.scores === 'object' ? { ...participant.scores } : {},
    normalizedScores: participant.normalizedScores && typeof participant.normalizedScores === 'object' ? { ...participant.normalizedScores } : {},
    totalScore: typeof participant.totalScore === 'number' ? participant.totalScore : (parseInt(participant.totalScore) || 0),
    rank: typeof participant.rank === 'number' && participant.rank > 0 ? participant.rank : Math.max(parseInt(participant.rank) || 1, 1),
    gamesCompleted: Array.isArray(participant.gamesCompleted) ? [...participant.gamesCompleted] : []
  };
}

// Export placeholder - will be completed at the end of the file
const moduleExports = {
  TOURNAMENT_CONSTANTS,
  VALID_GAME_IDS,
  VALID_FORMATS,
  VALID_STATUSES,
  validateTournamentConfig,
  validateTournamentSettings,
  validateParticipant,
  sanitizeTournamentConfig,
  sanitizeTournamentSettings,
  sanitizeParticipant
};

// ============================================================================
// LOCALSTORAGE SCHEMA AND ERROR HANDLING
// ============================================================================

/**
 * Tournament LocalStorage Manager
 * Handles all tournament data persistence with proper error handling and schema management
 */
/**
 * Mock localStorage for Node.js environment
 */
class MockLocalStorage {
  constructor() {
    this.data = {};
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, value) {
    this.data[key] = value;
  }

  removeItem(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }
}

class TournamentStorageManager {
  constructor() {
    this.storageKeys = TOURNAMENT_CONSTANTS.STORAGE_KEYS;
    this.currentVersion = TOURNAMENT_CONSTANTS.CURRENT_SCHEMA_VERSION;

    // Use mock localStorage in Node.js environment
    if (typeof localStorage === 'undefined') {
      this.localStorage = new MockLocalStorage();
    } else {
      this.localStorage = localStorage;
    }

    this.initializeStorage();
  }

  /**
   * Initialize storage with default structure if not present
   */
  initializeStorage() {
    try {
      // Initialize tournaments storage
      if (!this.hasKey(this.storageKeys.TOURNAMENTS)) {
        this.setItem(this.storageKeys.TOURNAMENTS, {
          tournaments: {},
          version: this.currentVersion
        });
      }

      // Initialize settings storage
      if (!this.hasKey(this.storageKeys.SETTINGS)) {
        this.setItem(this.storageKeys.SETTINGS, this.getDefaultGlobalSettings());
      }

      // Initialize history storage
      if (!this.hasKey(this.storageKeys.HISTORY)) {
        this.setItem(this.storageKeys.HISTORY, {
          completedTournaments: [],
          totalTournaments: 0,
          totalParticipants: 0,
          lastCleanup: new Date().toISOString(),
          version: this.currentVersion
        });
      }

      // Check for schema migrations
      this.checkAndMigrateSchema();
    } catch (error) {
      console.error('Failed to initialize tournament storage:', error);
      this.handleStorageError('initialization', error);
    }
  }

  /**
   * Get default global settings
   * @returns {ITournamentGlobalSettings} Default settings
   */
  getDefaultGlobalSettings() {
    return {
      defaultFormat: 'round-robin',
      scoreNormalization: true,
      maxParticipants: 8,
      autoAdvance: true,
      retainHistory: 30,
      version: this.currentVersion
    };
  }

  /**
   * Check if a key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  hasKey(key) {
    try {
      return this.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking storage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or error occurs
   * @returns {*} Parsed value or default
   */
  getItem(key, defaultValue = null) {
    try {
      const item = this.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      this.handleStorageError('read', error, key);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} True if successful
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      this.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      this.handleStorageError('write', error, key);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  removeItem(key) {
    try {
      this.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
      this.handleStorageError('delete', error, key);
      return false;
    }
  }

  /**
   * Handle storage errors with appropriate fallback strategies
   * @param {string} operation - Type of operation that failed
   * @param {Error} error - The error that occurred
   * @param {string} [key] - Storage key involved
   */
  handleStorageError(operation, error, key = '') {
    const errorInfo = {
      operation,
      key,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    // Log error for debugging
    console.error('Tournament storage error:', errorInfo);

    // Dispatch error event for UI handling
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const errorEvent = new CustomEvent('tournament-storage-error', {
        detail: errorInfo
      });
      window.dispatchEvent(errorEvent);
    }

    // Attempt recovery strategies based on error type
    if (error.name === 'QuotaExceededError') {
      this.handleQuotaExceeded();
    } else if (error.name === 'SecurityError') {
      this.handleSecurityError();
    }
  }

  /**
   * Handle localStorage quota exceeded error
   */
  handleQuotaExceeded() {
    console.warn('LocalStorage quota exceeded, attempting cleanup...');
    try {
      // Clean up old tournament history
      this.cleanupOldData();
    } catch (cleanupError) {
      console.error('Failed to cleanup storage:', cleanupError);
    }
  }

  /**
   * Handle security errors (e.g., private browsing mode)
   */
  handleSecurityError() {
    console.warn('LocalStorage access denied, tournament data will not persist');
    // Could implement in-memory fallback here
  }

  /**
   * Clean up old tournament data to free space
   */
  cleanupOldData() {
    try {
      const history = this.getItem(this.storageKeys.HISTORY, {});
      const settings = this.getItem(this.storageKeys.SETTINGS, this.getDefaultGlobalSettings());
      const retainDays = settings.retainHistory || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retainDays);

      const tournaments = this.getItem(this.storageKeys.TOURNAMENTS, { tournaments: {} });
      let cleanedCount = 0;

      // Remove old completed tournaments
      Object.keys(tournaments.tournaments).forEach(tournamentId => {
        const tournament = tournaments.tournaments[tournamentId];
        if (tournament.status === 'completed' && tournament.endDate) {
          const endDate = new Date(tournament.endDate);
          if (endDate < cutoffDate) {
            delete tournaments.tournaments[tournamentId];
            cleanedCount++;
          }
        }
      });

      if (cleanedCount > 0) {
        this.setItem(this.storageKeys.TOURNAMENTS, tournaments);
        console.log(`Cleaned up ${cleanedCount} old tournaments`);
      }

      // Update cleanup timestamp
      history.lastCleanup = new Date().toISOString();
      this.setItem(this.storageKeys.HISTORY, history);

    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    try {
      const tournaments = this.getItem(this.storageKeys.TOURNAMENTS, { tournaments: {} });
      const settings = this.getItem(this.storageKeys.SETTINGS, {});
      const history = this.getItem(this.storageKeys.HISTORY, {});

      const tournamentCount = Object.keys(tournaments.tournaments || {}).length;
      const activeCount = Object.values(tournaments.tournaments || {})
        .filter(t => t.status === 'active').length;
      const completedCount = Object.values(tournaments.tournaments || {})
        .filter(t => t.status === 'completed').length;

      // Estimate storage usage
      const dataSize = JSON.stringify(tournaments).length +
        JSON.stringify(settings).length +
        JSON.stringify(history).length;

      return {
        totalTournaments: tournamentCount,
        activeTournaments: activeCount,
        completedTournaments: completedCount,
        estimatedSizeBytes: dataSize,
        lastCleanup: history.lastCleanup,
        version: tournaments.version || 1
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalTournaments: 0,
        activeTournaments: 0,
        completedTournaments: 0,
        estimatedSizeBytes: 0,
        lastCleanup: null,
        version: 1,
        error: error.message
      };
    }
  }

  /**
   * Check and perform schema migrations if needed
   */
  checkAndMigrateSchema() {
    try {
      const tournaments = this.getItem(this.storageKeys.TOURNAMENTS, { tournaments: {}, version: 1 });
      const currentVersion = tournaments.version || 1;

      if (currentVersion < this.currentVersion) {
        console.log(`Migrating tournament data from version ${currentVersion} to ${this.currentVersion}`);
        this.migrateSchema(currentVersion, this.currentVersion);
      }
    } catch (error) {
      console.error('Error during schema migration:', error);
      this.handleStorageError('migration', error);
    }
  }

  /**
   * Perform schema migration
   * @param {number} fromVersion - Current schema version
   * @param {number} toVersion - Target schema version
   */
  migrateSchema(fromVersion, toVersion) {
    // Currently only version 1 exists, but this structure allows for future migrations
    const migrations = {
      1: () => {
        // Migration from version 1 to future versions would go here
        console.log('No migration needed for version 1');
      }
    };

    try {
      for (let version = fromVersion; version < toVersion; version++) {
        if (migrations[version]) {
          migrations[version]();
        }
      }

      // Update version numbers
      const tournaments = this.getItem(this.storageKeys.TOURNAMENTS, { tournaments: {} });
      tournaments.version = toVersion;
      this.setItem(this.storageKeys.TOURNAMENTS, tournaments);

      const settings = this.getItem(this.storageKeys.SETTINGS, this.getDefaultGlobalSettings());
      settings.version = toVersion;
      this.setItem(this.storageKeys.SETTINGS, settings);

      const history = this.getItem(this.storageKeys.HISTORY, {});
      history.version = toVersion;
      this.setItem(this.storageKeys.HISTORY, history);

      console.log(`Schema migration completed to version ${toVersion}`);
    } catch (error) {
      console.error('Schema migration failed:', error);
      throw error;
    }
  }

  /**
   * Export all tournament data for backup
   * @returns {Object} Complete tournament data export
   */
  exportData() {
    try {
      return {
        tournaments: this.getItem(this.storageKeys.TOURNAMENTS, { tournaments: {} }),
        settings: this.getItem(this.storageKeys.SETTINGS, this.getDefaultGlobalSettings()),
        history: this.getItem(this.storageKeys.HISTORY, {}),
        exportDate: new Date().toISOString(),
        version: this.currentVersion
      };
    } catch (error) {
      console.error('Error exporting tournament data:', error);
      throw error;
    }
  }

  /**
   * Import tournament data from backup
   * @param {Object} data - Tournament data to import
   * @returns {boolean} True if successful
   */
  importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Validate import data structure
      if (data.tournaments) {
        this.setItem(this.storageKeys.TOURNAMENTS, data.tournaments);
      }
      if (data.settings) {
        this.setItem(this.storageKeys.SETTINGS, data.settings);
      }
      if (data.history) {
        this.setItem(this.storageKeys.HISTORY, data.history);
      }

      // Check for schema migration after import
      this.checkAndMigrateSchema();

      console.log('Tournament data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing tournament data:', error);
      this.handleStorageError('import', error);
      return false;
    }
  }

  /**
   * Reset all tournament data (for testing or cleanup)
   * @returns {boolean} True if successful
   */
  resetAllData() {
    try {
      this.removeItem(this.storageKeys.TOURNAMENTS);
      this.removeItem(this.storageKeys.SETTINGS);
      this.removeItem(this.storageKeys.HISTORY);
      this.initializeStorage();
      console.log('All tournament data reset');
      return true;
    } catch (error) {
      console.error('Error resetting tournament data:', error);
      return false;
    }
  }
}

// Create singleton instance
const tournamentStorage = new TournamentStorageManager();

// Export all functions and classes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...moduleExports,
    TournamentStorageManager,
    tournamentStorage
  };
} else if (typeof window !== 'undefined') {
  // Browser environment - expose to global scope
  window.TOURNAMENT_CONSTANTS = TOURNAMENT_CONSTANTS;
  window.VALID_GAME_IDS = VALID_GAME_IDS;
  window.VALID_FORMATS = VALID_FORMATS;
  window.VALID_STATUSES = VALID_STATUSES;
  window.validateTournamentConfig = validateTournamentConfig;
  window.validateTournamentSettings = validateTournamentSettings;
  window.validateParticipant = validateParticipant;
  window.sanitizeTournamentConfig = sanitizeTournamentConfig;
  window.sanitizeTournamentSettings = sanitizeTournamentSettings;
  window.sanitizeParticipant = sanitizeParticipant;
  window.TournamentStorageManager = TournamentStorageManager;
  window.tournamentStorage = tournamentStorage;
}
