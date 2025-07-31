/**
 * Test Suite for Tournament Data Models and Validation
 *
 * This test file validates all the tournament data models, validation functions,
 * and storage management functionality.
 */

// Import the tournament models
let tournamentModels;
try {
  tournamentModels = require('./shared-tournament-models.js');
} catch (error) {
  console.error('Failed to import tournament models:', error.message);
  process.exit(1);
}

// Extract the functions and constants from the module
const {
  TOURNAMENT_CONSTANTS,
  VALID_GAME_IDS,
  VALID_FORMATS,
  VALID_STATUSES,
  validateTournamentConfig,
  validateTournamentSettings,
  validateParticipant,
  sanitizeTournamentConfig,
  sanitizeTournamentSettings,
  sanitizeParticipant,
  TournamentStorageManager,
  tournamentStorage
} = tournamentModels;

/**
 * Simple test framework for validation
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🏆 Running Tournament Models Test Suite...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  assertArrayEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
}

const runner = new TestRunner();

// Export test runner immediately for browser use
if (typeof window !== 'undefined') {
  console.log('Exporting test runner to browser globals...');
  window.TournamentModelTests = runner;
  window.testRunner = runner;
  window.TestRunner = TestRunner;
  console.log('Test runner exported to window globals');
}

// ============================================================================
// VALIDATION TESTS
// ============================================================================

runner.test('Tournament Config Validation - Valid Config', () => {
  const validConfig = {
    name: 'Test Tournament',
    games: ['snake-GG', 'tetris-GG'],
    format: 'round-robin',
    settings: {
      maxParticipants: 8,
      scoreNormalization: true,
      autoAdvance: true
    }
  };

  const result = validateTournamentConfig(validConfig);
  runner.assert(result.isValid, 'Valid config should pass validation');
  runner.assertEqual(result.errors.length, 0, 'Valid config should have no errors');
});

runner.test('Tournament Config Validation - Invalid Name', () => {
  const invalidConfig = {
    name: '', // Empty name
    games: ['snake-GG'],
    format: 'round-robin'
  };

  const result = validateTournamentConfig(invalidConfig);
  runner.assert(!result.isValid, 'Config with empty name should fail');
  // Debug: log the actual errors
  if (!result.errors.some(e => e.includes('name cannot be empty'))) {
    console.log('Actual errors:', result.errors);
  }
  runner.assert(result.errors.some(e => e.includes('name cannot be empty')), 'Should have name error');
});

runner.test('Tournament Config Validation - Invalid Games', () => {
  const invalidConfig = {
    name: 'Test',
    games: ['invalid-game', 'snake-GG'],
    format: 'round-robin'
  };

  const result = validateTournamentConfig(invalidConfig);
  runner.assert(!result.isValid, 'Config with invalid games should fail');
  runner.assert(result.errors.some(e => e.includes('Invalid game IDs')), 'Should have invalid game error');
});

runner.test('Tournament Config Validation - Duplicate Games', () => {
  const invalidConfig = {
    name: 'Test',
    games: ['snake-GG', 'snake-GG'],
    format: 'round-robin'
  };

  const result = validateTournamentConfig(invalidConfig);
  runner.assert(!result.isValid, 'Config with duplicate games should fail');
  runner.assert(result.errors.some(e => e.includes('Duplicate games')), 'Should have duplicate game error');
});

runner.test('Tournament Settings Validation - Valid Settings', () => {
  const validSettings = {
    maxParticipants: 8,
    scoreNormalization: true,
    autoAdvance: false,
    timeLimit: 300
  };

  const errors = validateTournamentSettings(validSettings);
  runner.assertEqual(errors.length, 0, 'Valid settings should have no errors');
});

runner.test('Tournament Settings Validation - Invalid Max Participants', () => {
  const invalidSettings = {
    maxParticipants: 1, // Too low
    scoreNormalization: true,
    autoAdvance: true
  };

  const errors = validateTournamentSettings(invalidSettings);
  runner.assert(errors.length > 0, 'Invalid max participants should produce errors');
  runner.assert(errors.some(e => e.includes('maxParticipants must be at least')), 'Should have max participants error');
});

runner.test('Participant Validation - Valid Participant', () => {
  const validParticipant = {
    id: 'player1',
    name: 'Test Player',
    scores: { 'snake-GG': 1000 },
    normalizedScores: { 'snake-GG': 0.8 },
    totalScore: 1000,
    rank: 1,
    gamesCompleted: ['snake-GG']
  };

  const result = validateParticipant(validParticipant);
  runner.assert(result.isValid, 'Valid participant should pass validation');
  runner.assertEqual(result.errors.length, 0, 'Valid participant should have no errors');
});

runner.test('Participant Validation - Missing Required Fields', () => {
  const invalidParticipant = {
    // Missing id and name
    scores: {}
  };

  const result = validateParticipant(invalidParticipant);
  runner.assert(!result.isValid, 'Participant missing required fields should fail');
  runner.assert(result.errors.some(e => e.includes('ID is required')), 'Should have ID error');
  runner.assert(result.errors.some(e => e.includes('name is required')), 'Should have name error');
});

// ============================================================================
// SANITIZATION TESTS
// ============================================================================

runner.test('Tournament Config Sanitization', () => {
  const dirtyConfig = {
    name: '  Test Tournament  ',
    games: ['snake-GG', 'snake-GG', 'tetris-GG'], // Has duplicate
    format: 'invalid-format',
    settings: {
      maxParticipants: '8', // String instead of number
      scoreNormalization: 'true' // String instead of boolean
    }
  };

  const sanitized = sanitizeTournamentConfig(dirtyConfig);
  runner.assertEqual(sanitized.name, 'Test Tournament', 'Name should be trimmed');
  runner.assertEqual(sanitized.games.length, 2, 'Duplicates should be removed');
  runner.assertEqual(sanitized.format, 'round-robin', 'Invalid format should default to round-robin');
  runner.assertEqual(sanitized.settings.maxParticipants, 8, 'String number should be converted');
});

runner.test('Tournament Settings Sanitization', () => {
  const dirtySettings = {
    maxParticipants: '12',
    scoreNormalization: 'false',
    autoAdvance: 0,
    timeLimit: '600'
  };

  const sanitized = sanitizeTournamentSettings(dirtySettings);
  runner.assertEqual(sanitized.maxParticipants, 12, 'String should be converted to number');
  runner.assertEqual(sanitized.scoreNormalization, false, 'String false should be converted to boolean');
  runner.assertEqual(sanitized.autoAdvance, false, 'Falsy value should be converted to boolean');
  runner.assertEqual(sanitized.timeLimit, 600, 'String time limit should be converted');
});

runner.test('Participant Sanitization', () => {
  const dirtyParticipant = {
    id: '  player1  ',
    name: '  Test Player  ',
    scores: { 'snake-GG': '1000' },
    totalScore: '1500',
    rank: '2'
  };

  const sanitized = sanitizeParticipant(dirtyParticipant);
  runner.assertEqual(sanitized.id, 'player1', 'ID should be trimmed');
  runner.assertEqual(sanitized.name, 'Test Player', 'Name should be trimmed');
  runner.assertEqual(sanitized.totalScore, 1500, 'String score should be converted');
  runner.assertEqual(sanitized.rank, 2, 'String rank should be converted');
});

// ============================================================================
// STORAGE MANAGER TESTS
// ============================================================================

runner.test('Storage Manager Initialization', () => {
  // Create a new storage manager instance for testing
  const storage = new TournamentStorageManager();

  runner.assert(storage.storageKeys, 'Storage keys should be defined');
  runner.assert(storage.currentVersion, 'Current version should be defined');

  // Test default settings
  const defaultSettings = storage.getDefaultGlobalSettings();
  runner.assert(defaultSettings.defaultFormat, 'Default format should be set');
  runner.assert(typeof defaultSettings.scoreNormalization === 'boolean', 'Score normalization should be boolean');
});

runner.test('Storage Error Handling', () => {
  const storage = new TournamentStorageManager();

  // Test getting non-existent key with default
  const result = storage.getItem('non-existent-key', 'default-value');
  runner.assertEqual(result, 'default-value', 'Should return default value for non-existent key');
});

runner.test('Storage Info Retrieval', () => {
  const storage = new TournamentStorageManager();
  const info = storage.getStorageInfo();

  runner.assert(typeof info.totalTournaments === 'number', 'Total tournaments should be a number');
  runner.assert(typeof info.activeTournaments === 'number', 'Active tournaments should be a number');
  runner.assert(typeof info.estimatedSizeBytes === 'number', 'Size should be a number');
});

runner.test('Data Export/Import', () => {
  const storage = new TournamentStorageManager();

  // Test export
  const exportData = storage.exportData();
  runner.assert(exportData.tournaments, 'Export should include tournaments');
  runner.assert(exportData.settings, 'Export should include settings');
  runner.assert(exportData.exportDate, 'Export should include date');
  runner.assert(exportData.version, 'Export should include version');
});

// ============================================================================
// CONSTANTS AND VALIDATION RULES TESTS
// ============================================================================

runner.test('Tournament Constants', () => {
  runner.assert(TOURNAMENT_CONSTANTS.MIN_PARTICIPANTS >= 2, 'Minimum participants should be at least 2');
  runner.assert(TOURNAMENT_CONSTANTS.MAX_PARTICIPANTS <= 16, 'Maximum participants should be reasonable');
  runner.assert(TOURNAMENT_CONSTANTS.CURRENT_SCHEMA_VERSION >= 1, 'Schema version should be at least 1');
});

runner.test('Valid Game IDs', () => {
  runner.assert(Array.isArray(VALID_GAME_IDS), 'Valid game IDs should be an array');
  runner.assert(VALID_GAME_IDS.length > 0, 'Should have at least one valid game');
  runner.assert(VALID_GAME_IDS.includes('snake-GG'), 'Should include snake game');
  runner.assert(VALID_GAME_IDS.includes('tetris-GG'), 'Should include tetris game');
});

runner.test('Valid Formats and Statuses', () => {
  runner.assert(VALID_FORMATS.includes('round-robin'), 'Should include round-robin format');
  runner.assert(VALID_FORMATS.includes('elimination'), 'Should include elimination format');
  runner.assert(VALID_STATUSES.includes('created'), 'Should include created status');
  runner.assert(VALID_STATUSES.includes('active'), 'Should include active status');
  runner.assert(VALID_STATUSES.includes('completed'), 'Should include completed status');
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

runner.test('Edge Case - Null/Undefined Inputs', () => {
  const nullResult = validateTournamentConfig(null);
  runner.assert(!nullResult.isValid, 'Null config should fail validation');

  const undefinedResult = validateTournamentConfig(undefined);
  runner.assert(!undefinedResult.isValid, 'Undefined config should fail validation');
});

runner.test('Edge Case - Empty Objects', () => {
  const emptyResult = validateTournamentConfig({});
  runner.assert(!emptyResult.isValid, 'Empty config should fail validation');
  runner.assert(emptyResult.errors.length > 0, 'Empty config should have errors');
});

runner.test('Edge Case - Maximum Length Names', () => {
  const longName = 'a'.repeat(TOURNAMENT_CONSTANTS.MAX_NAME_LENGTH + 1);
  const configWithLongName = {
    name: longName,
    games: ['snake-GG'],
    format: 'round-robin'
  };

  const result = validateTournamentConfig(configWithLongName);
  runner.assert(!result.isValid, 'Config with too long name should fail');
  runner.assert(result.errors.some(e => e.includes('characters or less')), 'Should have length error');
});

// ============================================================================
// RUN TESTS
// ============================================================================

// Export test runner for use in HTML or other contexts
if (typeof window !== 'undefined') {
  console.log('Exporting test runner to browser globals...');
  console.log('- runner type:', typeof runner);
  console.log('- TestRunner type:', typeof TestRunner);

  window.TournamentModelTests = runner;
  window.testRunner = runner;
  window.TestRunner = TestRunner;

  console.log('Test runner exported successfully');
  console.log('- window.TournamentModelTests:', typeof window.TournamentModelTests);
  console.log('- window.testRunner:', typeof window.testRunner);
  console.log('- window.TestRunner:', typeof window.TestRunner);

  // Dispatch ready event
  setTimeout(() => {
    if (typeof window.dispatchEvent === 'function') {
      const event = new CustomEvent('testRunnerReady', {
        detail: { testRunner: runner }
      });
      window.dispatchEvent(event);
      console.log('Dispatched testRunnerReady event');
    }
  }, 0);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = runner;
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}
