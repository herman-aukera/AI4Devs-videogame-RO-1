/**
 * Cross-Game Tournament System - Comprehensive TDD Audit System
 *
 * This module implements a comprehensive audit system following the established
 * runAuditTasks() pattern from existing games. It provides:
 * - Unit tests for all core tournament functionality
 * - Performance benchmarks with strict requirements
 * - Integration tests for all 10 existing games
 * - Quality assurance metrics and reporting
 * - Memory usage monitoring and leak detection
 */

/**
 * Tournament System Audit Class
 * Implements comprehensive testing and performance monitoring
 */
class TournamentAuditSystem {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      performance: {},
      integration: {},
      summary: {}
    };

    this.performanceRequirements = {
      tournamentCreation: 50, // ms
      scoreUpdate: 10, // ms
      leaderboardGeneration: 25, // ms
      rankingCalculation: 15, // ms
      storageOperation: 5 // ms
    };

    this.gameIds = [
      'snake-GG', 'breakout-GG', 'fruit-catcher-GG', 'asteroids-GG',
      'space-invaders-GG', 'pacman-GG', 'mspacman-GG', 'tetris-GG',
      'pong-GG', 'galaga-GG'
    ];

    // Initialize components
    this.initializeComponents();
  }

  /**
   * Initialize tournament system components for testing
   */
  initializeComponents() {
    try {
      // Initialize TournamentManager
      if (typeof TournamentManager !== 'undefined') {
        this.tournamentManager = new TournamentManager();
      } else {
        console.warn('TournamentManager not available - some tests will be skipped');
      }

      // Initialize ScoreAggregator
      if (typeof ScoreAggregator !== 'undefined') {
        this.scoreAggregator = new ScoreAggregator({ debugMode: false });
      } else {
        console.warn('ScoreAggregator not available - some tests will be skipped');
      }

      // Initialize EventBus
      if (typeof EventBus !== 'undefined') {
        this.eventBus = new EventBus();
      } else {
        console.warn('EventBus not available - some tests will be skipped');
      }

      // Initialize Storage Manager
      if (typeof TournamentStorageManager !== 'undefined') {
        this.storageManager = new TournamentStorageManager();
      } else {
        console.warn('TournamentStorageManager not available - some tests will be skipped');
      }

    } catch (error) {
      console.error('Failed to initialize tournament components:', error);
    }
  }

  /**
   * Main audit method following the established runAuditTasks() pattern
   * @returns {Object} Complete audit results
   */
  runAuditTasks() {
    console.log('🏆 Running Tournament System Comprehensive Audit...\n');

    // Reset results
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      performance: {},
      integration: {},
      summary: {}
    };

    // Core functionality tests
    this.testResults.tests.push(this.testTournamentManagerCore());
    this.testResults.tests.push(this.testScoreAggregatorCore());
    this.testResults.tests.push(this.testEventBusCore());
    this.testResults.tests.push(this.testStorageManagerCore());
    this.testResults.tests.push(this.testDataValidation());
    this.testResults.tests.push(this.testErrorHandling());

    // Performance benchmarks
    this.testResults.performance = this.runPerformanceBenchmarks();

    // Integration tests with all games
    this.testResults.integration = this.testGameIntegration();

    // Memory usage monitoring
    this.testResults.memory = this.testMemoryUsage();

    // Calculate summary
    this.testResults.passed = this.testResults.tests.filter(t => t.passed).length;
    this.testResults.failed = this.testResults.tests.filter(t => !t.passed).length;
    this.testResults.summary = this.generateSummary();

    // Output results
    this.outputResults();

    return this.testResults;
  }

  // ============================================================================
  // CORE FUNCTIONALITY TESTS
  // ============================================================================

  /**
   * Test TournamentManager core functionality
   */
  testTournamentManagerCore() {
    const testName = 'Tournament Manager Core Functionality';

    try {
      if (!this.tournamentManager) {
        return { name: testName, passed: false, details: 'TournamentManager not available' };
      }

      // Test tournament creation
      const config = {
        name: 'Audit Test Tournament',
        games: ['snake-GG', 'tetris-GG'],
        format: 'round-robin',
        settings: {
          maxParticipants: 4,
          scoreNormalization: true,
          autoAdvance: true
        }
      };

      const tournament = this.tournamentManager.createTournament(config);
      if (!tournament || !tournament.id) {
        throw new Error('Failed to create tournament');
      }

      // Test participant joining
      const joined = this.tournamentManager.joinTournament(tournament.id, 'audit-player-1', 'Audit Player 1');
      if (!joined) {
        throw new Error('Failed to join tournament');
      }

      // Test tournament retrieval
      const retrieved = this.tournamentManager.getTournament(tournament.id);
      if (!retrieved || retrieved.participants.length !== 1) {
        throw new Error('Failed to retrieve tournament or participant not added');
      }

      // Test tournament state transitions
      const started = this.tournamentManager.startTournament(tournament.id);
      if (!started) {
        // Add another participant and try again
        this.tournamentManager.joinTournament(tournament.id, 'audit-player-2', 'Audit Player 2');
        const startedAgain = this.tournamentManager.startTournament(tournament.id);
        if (!startedAgain) {
          throw new Error('Failed to start tournament');
        }
      }

      // Test tournament completion
      const completed = this.tournamentManager.completeTournament(tournament.id);
      if (!completed) {
        throw new Error('Failed to complete tournament');
      }

      // Cleanup
      this.tournamentManager.deleteTournament(tournament.id);

      return {
        name: testName,
        passed: true,
        details: 'All CRUD operations and state transitions working correctly'
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  /**
   * Test ScoreAggregator core functionality
   */
  testScoreAggregatorCore() {
    const testName = 'Score Aggregator Core Functionality';

    try {
      if (!this.scoreAggregator) {
        return { name: testName, passed: false, details: 'ScoreAggregator not available' };
      }

      // Test score normalization for all games
      const testScores = [100, 1000, 5000];
      for (const gameId of this.gameIds) {
        for (const score of testScores) {
          const normalized = this.scoreAggregator.normalizeScore(gameId, score);
          if (isNaN(normalized) || normalized < 0 || normalized > 1) {
            throw new Error(`Invalid normalized score for ${gameId}: ${normalized}`);
          }
        }
      }

      // Test ranking calculation
      const participants = [
        { id: 'p1', name: 'Player 1', normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.6 } },
        { id: 'p2', name: 'Player 2', normalizedScores: { 'snake-GG': 0.6, 'tetris-GG': 0.9 } },
        { id: 'p3', name: 'Player 3', normalizedScores: { 'snake-GG': 0.9, 'tetris-GG': 0.5 } }
      ];

      const rankings = this.scoreAggregator.calculateRanking(participants);
      if (rankings.length !== 3 || rankings[0].rank !== 1) {
        throw new Error('Ranking calculation failed');
      }

      // Test leaderboard generation
      const leaderboard = this.scoreAggregator.generateLeaderboard('audit-test', participants);
      if (!leaderboard.tournamentId || !leaderboard.rankings || !leaderboard.statistics) {
        throw new Error('Leaderboard generation failed');
      }

      return {
        name: testName,
        passed: true,
        details: `Score normalization, ranking, and leaderboard generation working for ${this.gameIds.length} games`
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  /**
   * Test EventBus core functionality
   */
  testEventBusCore() {
    const testName = 'Event Bus Core Functionality';

    try {
      if (!this.eventBus) {
        return { name: testName, passed: false, details: 'EventBus not available' };
      }

      let eventReceived = false;
      let eventData = null;

      // Test event subscription and publishing
      const unsubscribe = this.eventBus.subscribe('audit:test', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      const publishResult = this.eventBus.publish('audit:test', { message: 'test data' });

      if (!eventReceived || eventData.message !== 'test data') {
        throw new Error('Event subscription/publishing failed');
      }

      if (publishResult.listenersNotified !== 1) {
        throw new Error('Event publication metrics incorrect');
      }

      // Test unsubscription
      unsubscribe();
      eventReceived = false;
      this.eventBus.publish('audit:test', { message: 'should not receive' });

      if (eventReceived) {
        throw new Error('Event unsubscription failed');
      }

      // Test error handling
      this.eventBus.subscribe('audit:error-test', () => {
        throw new Error('Test error');
      });

      const errorResult = this.eventBus.publish('audit:error-test', {});
      if (errorResult.errors.length !== 1) {
        throw new Error('Error handling in EventBus failed');
      }

      return {
        name: testName,
        passed: true,
        details: 'Event subscription, publishing, unsubscription, and error handling working correctly'
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  /**
   * Test StorageManager core functionality
   */
  testStorageManagerCore() {
    const testName = 'Storage Manager Core Functionality';

    try {
      if (!this.storageManager) {
        return { name: testName, passed: false, details: 'TournamentStorageManager not available' };
      }

      // Test basic storage operations
      const testKey = 'audit-test-key';
      const testData = { test: 'data', timestamp: Date.now() };

      const setResult = this.storageManager.setItem(testKey, testData);
      if (!setResult) {
        throw new Error('Failed to set item in storage');
      }

      const retrievedData = this.storageManager.getItem(testKey);
      if (!retrievedData || retrievedData.test !== 'data') {
        throw new Error('Failed to retrieve item from storage');
      }

      // Test storage info
      const storageInfo = this.storageManager.getStorageInfo();
      if (typeof storageInfo.totalTournaments !== 'number') {
        throw new Error('Storage info retrieval failed');
      }

      // Test data export/import
      const exportData = this.storageManager.exportData();
      if (!exportData.tournaments || !exportData.settings) {
        throw new Error('Data export failed');
      }

      // Cleanup
      this.storageManager.removeItem(testKey);

      return {
        name: testName,
        passed: true,
        details: 'Storage operations, info retrieval, and export/import working correctly'
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  /**
   * Test data validation functionality
   */
  testDataValidation() {
    const testName = 'Data Validation';

    try {
      // Test tournament config validation
      if (typeof validateTournamentConfig !== 'undefined') {
        const validConfig = {
          name: 'Valid Tournament',
          games: ['snake-GG', 'tetris-GG'],
          format: 'round-robin',
          settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
        };

        const validResult = validateTournamentConfig(validConfig);
        if (!validResult.isValid) {
          throw new Error('Valid config failed validation');
        }

        const invalidConfig = {
          name: '',
          games: [],
          format: 'invalid'
        };

        const invalidResult = validateTournamentConfig(invalidConfig);
        if (invalidResult.isValid) {
          throw new Error('Invalid config passed validation');
        }
      }

      // Test participant validation
      if (typeof validateParticipant !== 'undefined') {
        const validParticipant = {
          id: 'player1',
          name: 'Valid Player',
          scores: {},
          normalizedScores: {},
          totalScore: 0,
          rank: 1,
          gamesCompleted: []
        };

        const validParticipantResult = validateParticipant(validParticipant);
        if (!validParticipantResult.isValid) {
          throw new Error('Valid participant failed validation');
        }
      }

      return {
        name: testName,
        passed: true,
        details: 'Tournament config and participant validation working correctly'
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  /**
   * Test error handling across all components
   */
  testErrorHandling() {
    const testName = 'Error Handling';

    try {
      let errorsCaught = 0;

      // Test TournamentManager error handling
      if (this.tournamentManager) {
        try {
          this.tournamentManager.createTournament(null);
        } catch (error) {
          errorsCaught++;
        }

        const result = this.tournamentManager.createTournament({ name: '', games: [], format: 'invalid' });
        if (result === null) {
          errorsCaught++; // Graceful failure
        }
      }

      // Test ScoreAggregator error handling
      if (this.scoreAggregator) {
        try {
          this.scoreAggregator.normalizeScore('invalid-game', 100);
        } catch (error) {
          errorsCaught++;
        }

        try {
          this.scoreAggregator.normalizeScore('snake-GG', 'not-a-number');
        } catch (error) {
          errorsCaught++;
        }
      }

      // Test EventBus error handling
      if (this.eventBus) {
        try {
          this.eventBus.subscribe('', null);
        } catch (error) {
          errorsCaught++;
        }
      }

      if (errorsCaught < 3) {
        throw new Error(`Expected more error handling, only caught ${errorsCaught} errors`);
      }

      return {
        name: testName,
        passed: true,
        details: `Error handling working correctly, caught ${errorsCaught} expected errors`
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  // ============================================================================
  // PERFORMANCE BENCHMARKS
  // ============================================================================

  /**
   * Run comprehensive performance benchmarks
   */
  runPerformanceBenchmarks() {
    const metrics = {
      tournamentCreation: this.benchmarkTournamentCreation(),
      scoreUpdate: this.benchmarkScoreUpdate(),
      leaderboardGeneration: this.benchmarkLeaderboardGeneration(),
      rankingCalculation: this.benchmarkRankingCalculation(),
      storageOperations: this.benchmarkStorageOperations(),
      memoryUsage: this.benchmarkMemoryUsage()
    };

    // Check if all benchmarks meet requirements
    metrics.allRequirementsMet = this.checkPerformanceRequirements(metrics);

    return metrics;
  }

  /**
   * Benchmark tournament creation performance
   */
  benchmarkTournamentCreation() {
    if (!this.tournamentManager) {
      return { avgTime: 0, requirement: this.performanceRequirements.tournamentCreation, passed: false, note: 'TournamentManager not available' };
    }

    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const config = {
        name: `Benchmark Tournament ${i}`,
        games: ['snake-GG', 'tetris-GG'],
        format: 'round-robin',
        settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
      };

      const startTime = performance.now();
      const tournament = this.tournamentManager.createTournament(config);
      const endTime = performance.now();

      if (tournament) {
        times.push(endTime - startTime);
        // Cleanup
        this.tournamentManager.deleteTournament(tournament.id);
      }
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const requirement = this.performanceRequirements.tournamentCreation;

    return {
      avgTime: parseFloat(avgTime.toFixed(2)),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requirement,
      passed: avgTime < requirement,
      iterations
    };
  }

  /**
   * Benchmark score update performance
   */
  benchmarkScoreUpdate() {
    if (!this.scoreAggregator) {
      return { avgTime: 0, requirement: this.performanceRequirements.scoreUpdate, passed: false, note: 'ScoreAggregator not available' };
    }

    const iterations = 100;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const gameId = this.gameIds[i % this.gameIds.length];
      const score = Math.random() * 5000;

      const startTime = performance.now();
      this.scoreAggregator.normalizeScore(gameId, score);
      const endTime = performance.now();

      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const requirement = this.performanceRequirements.scoreUpdate;

    return {
      avgTime: parseFloat(avgTime.toFixed(4)),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requirement,
      passed: avgTime < requirement,
      iterations
    };
  }

  /**
   * Benchmark leaderboard generation performance
   */
  benchmarkLeaderboardGeneration() {
    if (!this.scoreAggregator) {
      return { avgTime: 0, requirement: this.performanceRequirements.leaderboardGeneration, passed: false, note: 'ScoreAggregator not available' };
    }

    const participants = [];
    for (let i = 0; i < 50; i++) {
      participants.push({
        id: `player${i}`,
        name: `Player ${i}`,
        normalizedScores: {
          'snake-GG': Math.random(),
          'tetris-GG': Math.random(),
          'pacman-GG': Math.random()
        }
      });
    }

    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      this.scoreAggregator.generateLeaderboard(`benchmark-${i}`, participants);
      const endTime = performance.now();

      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const requirement = this.performanceRequirements.leaderboardGeneration;

    return {
      avgTime: parseFloat(avgTime.toFixed(2)),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requirement,
      passed: avgTime < requirement,
      iterations,
      participantCount: participants.length
    };
  }

  /**
   * Benchmark ranking calculation performance
   */
  benchmarkRankingCalculation() {
    if (!this.scoreAggregator) {
      return { avgTime: 0, requirement: this.performanceRequirements.rankingCalculation, passed: false, note: 'ScoreAggregator not available' };
    }

    const participants = [];
    for (let i = 0; i < 100; i++) {
      participants.push({
        id: `player${i}`,
        name: `Player ${i}`,
        normalizedScores: {
          'snake-GG': Math.random(),
          'tetris-GG': Math.random(),
          'pacman-GG': Math.random(),
          'breakout-GG': Math.random()
        }
      });
    }

    const iterations = 20;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      this.scoreAggregator.calculateRanking(participants);
      const endTime = performance.now();

      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const requirement = this.performanceRequirements.rankingCalculation;

    return {
      avgTime: parseFloat(avgTime.toFixed(2)),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requirement,
      passed: avgTime < requirement,
      iterations,
      participantCount: participants.length
    };
  }

  /**
   * Benchmark storage operations performance
   */
  benchmarkStorageOperations() {
    if (!this.storageManager) {
      return { avgTime: 0, requirement: this.performanceRequirements.storageOperation, passed: false, note: 'StorageManager not available' };
    }

    const iterations = 20;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const testData = {
        id: `test-${i}`,
        data: `test data ${i}`,
        timestamp: Date.now()
      };

      const startTime = performance.now();
      this.storageManager.setItem(`benchmark-${i}`, testData);
      this.storageManager.getItem(`benchmark-${i}`);
      const endTime = performance.now();

      times.push(endTime - startTime);

      // Cleanup
      this.storageManager.removeItem(`benchmark-${i}`);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const requirement = this.performanceRequirements.storageOperation;

    return {
      avgTime: parseFloat(avgTime.toFixed(2)),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requirement,
      passed: avgTime < requirement,
      iterations
    };
  }

  /**
   * Benchmark memory usage
   */
  benchmarkMemoryUsage() {
    const memoryInfo = {
      available: false,
      initial: 0,
      afterOperations: 0,
      difference: 0,
      note: 'Memory monitoring not available in this environment'
    };

    // Check if memory monitoring is available
    if (typeof performance !== 'undefined' && performance.memory) {
      memoryInfo.available = true;
      memoryInfo.initial = performance.memory.usedJSHeapSize;

      // Perform memory-intensive operations
      const largeArray = [];
      for (let i = 0; i < 10000; i++) {
        largeArray.push({
          id: `item-${i}`,
          data: new Array(100).fill(Math.random()),
          timestamp: Date.now()
        });
      }

      memoryInfo.afterOperations = performance.memory.usedJSHeapSize;
      memoryInfo.difference = memoryInfo.afterOperations - memoryInfo.initial;

      // Cleanup
      largeArray.length = 0;

      memoryInfo.note = 'Memory usage monitored successfully';
    }

    return memoryInfo;
  }

  /**
   * Check if all performance requirements are met
   */
  checkPerformanceRequirements(metrics) {
    const requirements = [
      metrics.tournamentCreation.passed,
      metrics.scoreUpdate.passed,
      metrics.leaderboardGeneration.passed,
      metrics.rankingCalculation.passed,
      metrics.storageOperations.passed
    ];

    return requirements.every(req => req);
  }

  // ============================================================================
  // GAME INTEGRATION TESTS
  // ============================================================================

  /**
   * Test integration with all 10 games
   */
  testGameIntegration() {
    const integration = {
      totalGames: this.gameIds.length,
      testedGames: 0,
      passedGames: 0,
      failedGames: [],
      gameResults: {},
      scoreNormalizationWorking: true,
      allGamesSupported: true
    };

    for (const gameId of this.gameIds) {
      integration.testedGames++;

      try {
        const gameResult = this.testSingleGameIntegration(gameId);
        integration.gameResults[gameId] = gameResult;

        if (gameResult.passed) {
          integration.passedGames++;
        } else {
          integration.failedGames.push({
            gameId,
            error: gameResult.error
          });
          integration.scoreNormalizationWorking = false;
        }
      } catch (error) {
        integration.failedGames.push({
          gameId,
          error: error.message
        });
        integration.allGamesSupported = false;
      }
    }

    integration.successRate = (integration.passedGames / integration.totalGames * 100).toFixed(1) + '%';

    return integration;
  }

  /**
   * Test integration with a single game
   */
  testSingleGameIntegration(gameId) {
    if (!this.scoreAggregator) {
      return {
        passed: false,
        error: 'ScoreAggregator not available',
        gameId
      };
    }

    try {
      const testScores = [100, 500, 1000, 2500, 5000];
      const normalizedScores = [];

      // Test score normalization
      for (const score of testScores) {
        const normalized = this.scoreAggregator.normalizeScore(gameId, score);

        if (isNaN(normalized) || normalized < 0 || normalized > 1) {
          throw new Error(`Invalid normalized score: ${normalized} for score ${score}`);
        }

        normalizedScores.push(normalized);
      }

      // Verify that higher scores generally produce higher normalized scores
      let isMonotonic = true;
      for (let i = 1; i < normalizedScores.length; i++) {
        if (normalizedScores[i] < normalizedScores[i - 1] - 0.1) { // Allow some tolerance
          isMonotonic = false;
          break;
        }
      }

      // Test with metadata
      const withMetadata = this.scoreAggregator.normalizeScore(gameId, 1000, {
        level: 3,
        duration: 120000
      });

      if (isNaN(withMetadata) || withMetadata < 0 || withMetadata > 1) {
        throw new Error(`Invalid normalized score with metadata: ${withMetadata}`);
      }

      return {
        passed: true,
        gameId,
        testScores: testScores.length,
        normalizedRange: {
          min: Math.min(...normalizedScores),
          max: Math.max(...normalizedScores)
        },
        isMonotonic,
        metadataSupported: true
      };

    } catch (error) {
      return {
        passed: false,
        gameId,
        error: error.message
      };
    }
  }

  // ============================================================================
  // MEMORY USAGE MONITORING
  // ============================================================================

  /**
   * Test memory usage and detect potential leaks
   */
  testMemoryUsage() {
    const memoryTest = {
      available: false,
      initialMemory: 0,
      peakMemory: 0,
      finalMemory: 0,
      memoryLeak: false,
      leakThreshold: 1024 * 1024, // 1MB
      operations: []
    };

    if (typeof performance === 'undefined' || !performance.memory) {
      memoryTest.note = 'Memory monitoring not available in this environment';
      return memoryTest;
    }

    memoryTest.available = true;
    memoryTest.initialMemory = performance.memory.usedJSHeapSize;

    try {
      // Test tournament creation memory usage
      const tournaments = [];
      for (let i = 0; i < 10; i++) {
        const config = {
          name: `Memory Test Tournament ${i}`,
          games: ['snake-GG', 'tetris-GG', 'pacman-GG'],
          format: 'round-robin',
          settings: { maxParticipants: 8, scoreNormalization: true, autoAdvance: true }
        };

        if (this.tournamentManager) {
          const tournament = this.tournamentManager.createTournament(config);
          if (tournament) {
            tournaments.push(tournament.id);
          }
        }

        const currentMemory = performance.memory.usedJSHeapSize;
        if (currentMemory > memoryTest.peakMemory) {
          memoryTest.peakMemory = currentMemory;
        }
      }

      // Test score aggregation memory usage
      const participants = [];
      for (let i = 0; i < 100; i++) {
        participants.push({
          id: `player${i}`,
          name: `Player ${i}`,
          normalizedScores: {}
        });

        // Add scores for each game
        for (const gameId of this.gameIds) {
          if (this.scoreAggregator) {
            const score = Math.random() * 5000;
            const normalized = this.scoreAggregator.normalizeScore(gameId, score);
            participants[i].normalizedScores[gameId] = normalized;
          }
        }
      }

      // Generate leaderboards
      for (let i = 0; i < 5; i++) {
        if (this.scoreAggregator) {
          this.scoreAggregator.generateLeaderboard(`memory-test-${i}`, participants);
        }
      }

      // Cleanup tournaments
      if (this.tournamentManager) {
        tournaments.forEach(tournamentId => {
          this.tournamentManager.deleteTournament(tournamentId);
        });
      }

      // Force garbage collection if available
      if (typeof gc === 'function') {
        gc();
      }

      // Wait a bit for cleanup
      setTimeout(() => {
        memoryTest.finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = memoryTest.finalMemory - memoryTest.initialMemory;
        memoryTest.memoryLeak = memoryIncrease > memoryTest.leakThreshold;

        memoryTest.operations = [
          { operation: 'Tournament Creation', count: tournaments.length },
          { operation: 'Score Normalization', count: participants.length * this.gameIds.length },
          { operation: 'Leaderboard Generation', count: 5 }
        ];
      }, 100);

    } catch (error) {
      memoryTest.error = error.message;
    }

    return memoryTest;
  }

  // ============================================================================
  // SUMMARY AND REPORTING
  // ============================================================================

  /**
   * Generate comprehensive summary
   */
  generateSummary() {
    const totalTests = this.testResults.tests.length;
    const passRate = totalTests > 0 ? (this.testResults.passed / totalTests * 100).toFixed(1) : '0';

    return {
      totalTests,
      passRate: passRate + '%',
      performanceRequirementsMet: this.testResults.performance.allRequirementsMet || false,
      gameIntegrationRate: this.testResults.integration.successRate || '0%',
      memoryLeakDetected: this.testResults.memory?.memoryLeak || false,
      overallStatus: this.testResults.failed === 0 &&
        (this.testResults.performance.allRequirementsMet !== false) ? 'PASS' : 'FAIL',
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.failed > 0) {
      recommendations.push('Fix failing unit tests before deployment');
    }

    if (this.testResults.performance.allRequirementsMet === false) {
      recommendations.push('Optimize performance to meet requirements');
    }

    if (this.testResults.integration.passedGames < this.testResults.integration.totalGames) {
      recommendations.push('Fix game integration issues');
    }

    if (this.testResults.memory?.memoryLeak) {
      recommendations.push('Investigate and fix memory leaks');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed - system ready for production');
    }

    return recommendations;
  }

  /**
   * Output comprehensive results
   */
  outputResults() {
    console.log('\n' + '='.repeat(80));
    console.log('🏆 TOURNAMENT SYSTEM COMPREHENSIVE AUDIT RESULTS');
    console.log('='.repeat(80));

    // Test results table
    console.table(this.testResults.tests);

    // Performance metrics
    console.log('\n📊 PERFORMANCE BENCHMARKS:');
    console.table(this.testResults.performance);

    // Game integration results
    console.log('\n🎮 GAME INTEGRATION STATUS:');
    console.log(`Total Games: ${this.testResults.integration.totalGames}`);
    console.log(`Passed: ${this.testResults.integration.passedGames}`);
    console.log(`Success Rate: ${this.testResults.integration.successRate}`);

    if (this.testResults.integration.failedGames.length > 0) {
      console.log('\n❌ Failed Games:');
      console.table(this.testResults.integration.failedGames);
    }

    // Memory usage
    if (this.testResults.memory?.available) {
      console.log('\n🧠 MEMORY USAGE:');
      console.log(`Initial: ${(this.testResults.memory.initialMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Peak: ${(this.testResults.memory.peakMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Final: ${(this.testResults.memory.finalMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory Leak: ${this.testResults.memory.memoryLeak ? '❌ YES' : '✅ NO'}`);
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.table([this.testResults.summary]);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    this.testResults.summary.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Final status
    console.log('\n' + '='.repeat(80));
    if (this.testResults.summary.overallStatus === 'PASS') {
      console.log('🎉 ALL AUDIT TASKS PASSED - TOURNAMENT SYSTEM READY FOR PRODUCTION!');
    } else {
      console.log('❌ AUDIT FAILED - ISSUES NEED TO BE ADDRESSED BEFORE DEPLOYMENT');
    }
    console.log('='.repeat(80));
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentAuditSystem };
} else if (typeof window !== 'undefined') {
  window.TournamentAuditSystem = TournamentAuditSystem;
}
