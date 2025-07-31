/**
 * Tournament Manager Test Suite
 *
 * Comprehensive tests for the TournamentManager class to verify
 * all CRUD operations and state management functionality.
 */

// Mock localStorage for Node.js environment
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
  };
}

// Load dependencies
let TournamentManager;
if (typeof require !== 'undefined') {
  // Node.js environment
  const { TournamentStorageManager, validateTournamentConfig, sanitizeTournamentConfig, validateParticipant } = require('./shared-tournament-models.js');
  const tournamentManagerModule = require('./shared-tournament-manager.js');
  TournamentManager = tournamentManagerModule.TournamentManager;

  // Make available globally for the manager
  global.TournamentStorageManager = TournamentStorageManager;
  global.validateTournamentConfig = validateTournamentConfig;
  global.sanitizeTournamentConfig = sanitizeTournamentConfig;
  global.validateParticipant = validateParticipant;
  global.tournamentStorage = new TournamentStorageManager();
} else {
  // Browser environment
  TournamentManager = window.TournamentManager;
}

/**
 * Test Suite Class
 */
class TournamentManagerTestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.manager = null;
  }

  /**
   * Run all tests
   */
  runTests() {
    console.log('🧪 Starting TournamentManager Test Suite...\n');

    // Initialize fresh manager for each test run
    this.setupTestEnvironment();

    // Core CRUD operations
    this.testTournamentCreation();
    this.testTournamentRetrieval();
    this.testTournamentUpdate();
    this.testTournamentDeletion();
    this.testGetAllTournaments();

    // Participant management
    this.testParticipantJoin();
    this.testParticipantLeave();
    this.testParticipantValidation();

    // State management
    this.testTournamentStateTransitions();
    this.testTournamentStatus();

    // Error handling
    this.testErrorHandling();
    this.testValidationErrors();

    // Edge cases
    this.testEdgeCases();

    // Performance tests
    this.testPerformance();

    this.printResults();
    return this.getResults();
  }

  /**
   * Set up test environment
   */
  setupTestEnvironment() {
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Create fresh manager instance
    this.manager = new TournamentManager();
  }

  /**
   * Test tournament creation
   */
  testTournamentCreation() {
    this.test('Tournament Creation - Valid Configuration', () => {
      const config = {
        name: 'Test Tournament',
        games: ['snake-GG', 'tetris-GG'],
        format: 'round-robin',
        settings: {
          maxParticipants: 8,
          scoreNormalization: true,
          autoAdvance: true
        }
      };

      const tournament = this.manager.createTournament(config);

      return tournament !== null &&
        tournament.id &&
        tournament.name === 'Test Tournament' &&
        tournament.status === 'created' &&
        tournament.games.length === 2 &&
        tournament.participants.length === 0;
    });

    this.test('Tournament Creation - Invalid Configuration', () => {
      const invalidConfig = {
        name: '', // Empty name
        games: [], // No games
        format: 'invalid-format'
      };

      const tournament = this.manager.createTournament(invalidConfig);
      return tournament === null;
    });

    this.test('Tournament Creation - Auto-generated ID', () => {
      const config = {
        name: 'ID Test Tournament',
        games: ['snake-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: false }
      };

      const tournament1 = this.manager.createTournament(config);
      const tournament2 = this.manager.createTournament(config);

      return tournament1 && tournament2 && tournament1.id !== tournament2.id;
    });
  }

  /**
   * Test tournament retrieval
   */
  testTournamentRetrieval() {
    this.test('Tournament Retrieval - Existing Tournament', () => {
      const config = {
        name: 'Retrieval Test',
        games: ['pacman-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 6, scoreNormalization: true, autoAdvance: true }
      };

      const created = this.manager.createTournament(config);
      const retrieved = this.manager.getTournament(created.id);

      return retrieved !== null &&
        retrieved.id === created.id &&
        retrieved.name === created.name;
    });

    this.test('Tournament Retrieval - Non-existent Tournament', () => {
      const retrieved = this.manager.getTournament('non-existent-id');
      return retrieved === null;
    });

    this.test('Tournament Retrieval - Cache Functionality', () => {
      const config = {
        name: 'Cache Test',
        games: ['breakout-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: true }
      };

      const created = this.manager.createTournament(config);

      // First retrieval (from storage)
      const retrieved1 = this.manager.getTournament(created.id);

      // Second retrieval (should be from cache)
      const retrieved2 = this.manager.getTournament(created.id);

      return retrieved1 && retrieved2 &&
        retrieved1.id === retrieved2.id &&
        this.manager.tournamentCache.has(created.id);
    });
  }

  /**
   * Test tournament updates
   */
  testTournamentUpdate() {
    this.test('Tournament Update - Valid Updates', () => {
      const config = {
        name: 'Update Test',
        games: ['snake-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
      };

      const created = this.manager.createTournament(config);
      const updates = {
        name: 'Updated Tournament Name',
        games: ['snake-GG', 'tetris-GG']
      };

      const updated = this.manager.updateTournament(created.id, updates);

      return updated !== null &&
        updated.name === 'Updated Tournament Name' &&
        updated.games.length === 2 &&
        updated.updatedAt !== created.updatedAt;
    });

    this.test('Tournament Update - Non-existent Tournament', () => {
      const updated = this.manager.updateTournament('non-existent', { name: 'Test' });
      return updated === null;
    });

    this.test('Tournament Update - Invalid Updates', () => {
      const config = {
        name: 'Invalid Update Test',
        games: ['pong-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: false }
      };

      const created = this.manager.createTournament(config);
      const invalidUpdates = {
        name: '', // Empty name
        games: [] // No games
      };

      const updated = this.manager.updateTournament(created.id, invalidUpdates);
      return updated === null;
    });
  }

  /**
   * Test tournament deletion
   */
  testTournamentDeletion() {
    this.test('Tournament Deletion - Existing Tournament', () => {
      const config = {
        name: 'Delete Test',
        games: ['asteroids-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 6, scoreNormalization: true, autoAdvance: true }
      };

      const created = this.manager.createTournament(config);
      const deleted = this.manager.deleteTournament(created.id);
      const retrieved = this.manager.getTournament(created.id);

      return deleted === true &&
        retrieved === null &&
        !this.manager.tournamentCache.has(created.id);
    });

    this.test('Tournament Deletion - Non-existent Tournament', () => {
      const deleted = this.manager.deleteTournament('non-existent-id');
      return deleted === false;
    });
  }

  /**
   * Test getting all tournaments
   */
  testGetAllTournaments() {
    this.test('Get All Tournaments - Multiple Tournaments', () => {
      // Create multiple tournaments
      const configs = [
        { name: 'Tournament 1', games: ['snake-GG'], format: 'round-robin', settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true } },
        { name: 'Tournament 2', games: ['tetris-GG'], format: 'elimination', settings: { maxParticipants: 8, scoreNormalization: false, autoAdvance: false } },
        { name: 'Tournament 3', games: ['pacman-GG'], format: 'round-robin', settings: { maxParticipants: 6, scoreNormalization: true, autoAdvance: true } }
      ];

      configs.forEach(config => this.manager.createTournament(config));

      const allTournaments = this.manager.getAllTournaments();
      return allTournaments.length >= 3;
    });

    this.test('Get All Tournaments - With Filters', () => {
      // Create tournaments with different formats
      const roundRobinConfig = {
        name: 'Round Robin Test',
        games: ['pong-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const eliminationConfig = {
        name: 'Elimination Test',
        games: ['breakout-GG'],
        format: 'elimination',
        settings: { maxParticipants: 8, scoreNormalization: false, autoAdvance: false }
      };

      this.manager.createTournament(roundRobinConfig);
      this.manager.createTournament(eliminationConfig);

      const roundRobinTournaments = this.manager.getAllTournaments({ format: 'round-robin' });
      const eliminationTournaments = this.manager.getAllTournaments({ format: 'elimination' });

      return roundRobinTournaments.length > 0 &&
        eliminationTournaments.length > 0 &&
        roundRobinTournaments.every(t => t.format === 'round-robin') &&
        eliminationTournaments.every(t => t.format === 'elimination');
    });
  }

  /**
   * Test participant joining
   */
  testParticipantJoin() {
    this.test('Participant Join - Valid Join', () => {
      const config = {
        name: 'Join Test',
        games: ['galaga-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      const joined = this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      const updated = this.manager.getTournament(tournament.id);

      return joined === true &&
        updated.participants.length === 1 &&
        updated.participants[0].id === 'player1' &&
        updated.participants[0].name === 'Player One';
    });

    this.test('Participant Join - Duplicate Join', () => {
      const config = {
        name: 'Duplicate Join Test',
        games: ['space-invaders-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      const joined1 = this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      const joined2 = this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      const updated = this.manager.getTournament(tournament.id);

      return joined1 === true &&
        joined2 === true &&
        updated.participants.length === 1;
    });

    this.test('Participant Join - Tournament Full', () => {
      const config = {
        name: 'Full Tournament Test',
        games: ['fruit-catcher-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 2, scoreNormalization: true, autoAdvance: false }
      };

      const tournament = this.manager.createTournament(config);

      // Fill tournament to capacity
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      this.manager.joinTournament(tournament.id, 'player2', 'Player Two');

      // Try to add one more
      const joinedExtra = this.manager.joinTournament(tournament.id, 'player3', 'Player Three');
      const updated = this.manager.getTournament(tournament.id);

      return joinedExtra === false &&
        updated.participants.length === 2;
    });
  }

  /**
   * Test participant leaving
   */
  testParticipantLeave() {
    this.test('Participant Leave - Valid Leave', () => {
      const config = {
        name: 'Leave Test',
        games: ['mspacman-GG'],
        format: 'elimination',
        settings: { maxParticipants: 6, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      this.manager.joinTournament(tournament.id, 'player2', 'Player Two');

      const left = this.manager.leaveTournament(tournament.id, 'player1');
      const updated = this.manager.getTournament(tournament.id);

      return left === true &&
        updated.participants.length === 1 &&
        updated.participants[0].id === 'player2';
    });

    this.test('Participant Leave - Non-existent Participant', () => {
      const config = {
        name: 'Leave Non-existent Test',
        games: ['snake-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: false }
      };

      const tournament = this.manager.createTournament(config);
      const left = this.manager.leaveTournament(tournament.id, 'non-existent-player');

      return left === false;
    });
  }

  /**
   * Test participant validation
   */
  testParticipantValidation() {
    this.test('Participant Validation - Invalid Name', () => {
      const config = {
        name: 'Validation Test',
        games: ['tetris-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      const joined = this.manager.joinTournament(tournament.id, 'player1', ''); // Empty name

      return joined === false;
    });

    this.test('Participant Validation - Long Name', () => {
      const config = {
        name: 'Long Name Test',
        games: ['pong-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      const longName = 'A'.repeat(50); // Very long name
      const joined = this.manager.joinTournament(tournament.id, 'player1', longName);

      return joined === false;
    });
  }

  /**
   * Test tournament state transitions
   */
  testTournamentStateTransitions() {
    this.test('State Transition - Start Tournament', () => {
      const config = {
        name: 'State Test',
        games: ['asteroids-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      this.manager.joinTournament(tournament.id, 'player2', 'Player Two');

      const started = this.manager.startTournament(tournament.id);
      const updated = this.manager.getTournament(tournament.id);

      return started === true &&
        updated.status === 'active';
    });

    this.test('State Transition - Start Without Enough Participants', () => {
      const config = {
        name: 'Insufficient Participants Test',
        games: ['breakout-GG'],
        format: 'elimination',
        settings: { maxParticipants: 4, scoreNormalization: false, autoAdvance: false }
      };

      const tournament = this.manager.createTournament(config);
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');

      const started = this.manager.startTournament(tournament.id);
      const updated = this.manager.getTournament(tournament.id);

      return started === false &&
        updated.status === 'created';
    });

    this.test('State Transition - Complete Tournament', () => {
      const config = {
        name: 'Complete Test',
        games: ['galaga-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      this.manager.joinTournament(tournament.id, 'player2', 'Player Two');
      this.manager.startTournament(tournament.id);

      const completed = this.manager.completeTournament(tournament.id);
      const updated = this.manager.getTournament(tournament.id);

      return completed === true &&
        updated.status === 'completed' &&
        updated.endDate !== null;
    });
  }

  /**
   * Test tournament status
   */
  testTournamentStatus() {
    this.test('Tournament Status - Comprehensive Status', () => {
      const config = {
        name: 'Status Test',
        games: ['space-invaders-GG', 'pacman-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      this.manager.joinTournament(tournament.id, 'player1', 'Player One');
      this.manager.joinTournament(tournament.id, 'player2', 'Player Two');

      const status = this.manager.getTournamentStatus(tournament.id);

      return status !== null &&
        status.id === tournament.id &&
        status.participantCount === 2 &&
        status.gamesCount === 2 &&
        status.isActive === false &&
        status.isCompleted === false &&
        typeof status.progress === 'number' &&
        Array.isArray(status.leaderboard);
    });

    this.test('Tournament Status - Non-existent Tournament', () => {
      const status = this.manager.getTournamentStatus('non-existent-id');
      return status === null;
    });
  }

  /**
   * Test error handling
   */
  testErrorHandling() {
    this.test('Error Handling - Invalid Tournament ID Format', () => {
      const retrieved = this.manager.getTournament(null);
      return retrieved === null;
    });

    this.test('Error Handling - Malformed Configuration', () => {
      const tournament = this.manager.createTournament(null);
      return tournament === null;
    });
  }

  /**
   * Test validation errors
   */
  testValidationErrors() {
    this.test('Validation Error - Empty Tournament Name', () => {
      const config = {
        name: '',
        games: ['snake-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      return tournament === null;
    });

    this.test('Validation Error - Invalid Game IDs', () => {
      const config = {
        name: 'Invalid Games Test',
        games: ['invalid-game-id'],
        format: 'round-robin',
        settings: { maxParticipants: 4, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      return tournament === null;
    });
  }

  /**
   * Test edge cases
   */
  testEdgeCases() {
    this.test('Edge Case - Maximum Participants', () => {
      const config = {
        name: 'Max Participants Test',
        games: ['fruit-catcher-GG'],
        format: 'elimination',
        settings: { maxParticipants: 16, scoreNormalization: false, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);

      // Add maximum participants
      let joinedCount = 0;
      for (let i = 1; i <= 16; i++) {
        if (this.manager.joinTournament(tournament.id, `player${i}`, `Player ${i}`)) {
          joinedCount++;
        }
      }

      // Try to add one more
      const extraJoined = this.manager.joinTournament(tournament.id, 'player17', 'Player 17');

      return joinedCount === 16 && extraJoined === false;
    });

    this.test('Edge Case - All Games Selected', () => {
      const allGames = ['snake-GG', 'breakout-GG', 'fruit-catcher-GG', 'asteroids-GG',
        'space-invaders-GG', 'pacman-GG', 'mspacman-GG', 'tetris-GG',
        'pong-GG', 'galaga-GG'];

      const config = {
        name: 'All Games Test',
        games: allGames,
        format: 'round-robin',
        settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);
      return tournament !== null && tournament.games.length === 10;
    });
  }

  /**
   * Test performance
   */
  testPerformance() {
    this.test('Performance - Tournament Creation Speed', () => {
      const config = {
        name: 'Performance Test',
        games: ['snake-GG', 'tetris-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
      };

      const startTime = performance.now();
      const tournament = this.manager.createTournament(config);
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`  Tournament creation took ${duration.toFixed(2)}ms`);

      return tournament !== null && duration < 50; // Should be under 50ms
    });

    this.test('Performance - Multiple Operations', () => {
      const startTime = performance.now();

      // Create tournament
      const config = {
        name: 'Bulk Operations Test',
        games: ['pacman-GG', 'breakout-GG'],
        format: 'elimination',
        settings: { maxParticipants: 8, scoreNormalization: false, autoAdvance: true }
      };

      const tournament = this.manager.createTournament(config);

      // Add participants
      for (let i = 1; i <= 5; i++) {
        this.manager.joinTournament(tournament.id, `player${i}`, `Player ${i}`);
      }

      // Update tournament
      this.manager.updateTournament(tournament.id, { name: 'Updated Bulk Test' });

      // Get status
      this.manager.getTournamentStatus(tournament.id);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Bulk operations took ${duration.toFixed(2)}ms`);

      return duration < 100; // Should be under 100ms
    });
  }

  /**
   * Helper method to run individual test
   */
  test(name, testFunction) {
    try {
      const result = testFunction();
      if (result) {
        this.tests.push({ name, status: 'PASS', error: null });
        this.passed++;
        console.log(`✅ ${name}`);
      } else {
        this.tests.push({ name, status: 'FAIL', error: 'Test returned false' });
        this.failed++;
        console.log(`❌ ${name} - Test returned false`);
      }
    } catch (error) {
      this.tests.push({ name, status: 'ERROR', error: error.message });
      this.failed++;
      console.log(`💥 ${name} - Error: ${error.message}`);
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🏆 TOURNAMENT MANAGER TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.tests.length}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.tests.filter(t => t.status !== 'PASS').forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }

    console.log('='.repeat(60));
  }

  /**
   * Get test results object
   */
  getResults() {
    return {
      total: this.tests.length,
      passed: this.passed,
      failed: this.failed,
      successRate: (this.passed / this.tests.length) * 100,
      tests: this.tests
    };
  }
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const testSuite = new TournamentManagerTestSuite();
  const results = testSuite.runTests();

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.TournamentManagerTestSuite = TournamentManagerTestSuite;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentManagerTestSuite };
}
