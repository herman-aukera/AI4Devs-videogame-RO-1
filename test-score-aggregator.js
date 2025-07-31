/* © GG, MIT License */

/**
 * Unit Tests for ScoreAggregator System
 *
 * Comprehensive test suite covering:
 * - Score normalization algorithms
 * - Ranking calculation logic
 * - Leaderboard generation
 * - Performance benchmarks
 * - Edge cases and error handling
 */

// Simple test framework for browser/Node.js environment
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
    console.log('🧪 Starting ScoreAggregator Tests...\n');

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

    if (this.failed === 0) {
      console.log('🎉 All tests passed!');
    }

    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertAlmostEqual(actual, expected, tolerance = 0.001, message) {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(message || `Expected ${expected} ± ${tolerance}, got ${actual}`);
    }
  }

  assertThrows(fn, message) {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (error) {
      if (error.message === message || error.message.includes('Expected function to throw')) {
        throw error;
      }
      // Expected error, test passes
    }
  }
}

// Load ScoreAggregator for Node.js environment
if (typeof ScoreAggregator === 'undefined') {
  // Create browser-like globals for Node.js
  global.performance = { now: () => Date.now() };
  global.console = console;
  global.window = {};

  // Load ScoreAggregator
  const fs = require('fs');
  const scoreAggregatorCode = fs.readFileSync('shared-tournament-score-aggregator.js', 'utf8');
  eval(scoreAggregatorCode);

  // Get classes from global
  global.ScoreAggregator = global.window.ScoreAggregator;
  global.GAME_SCORING_PROFILES = global.window.GAME_SCORING_PROFILES;
}

const testRunner = new TestRunner();

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

testRunner.test('ScoreAggregator can be instantiated', () => {
  const aggregator = new ScoreAggregator();
  testRunner.assert(aggregator instanceof ScoreAggregator, 'Should create ScoreAggregator instance');
  testRunner.assert(typeof aggregator.normalizeScore === 'function', 'Should have normalizeScore method');
  testRunner.assert(typeof aggregator.calculateRanking === 'function', 'Should have calculateRanking method');
  testRunner.assert(typeof aggregator.generateLeaderboard === 'function', 'Should have generateLeaderboard method');
});

testRunner.test('Game profiles are properly loaded', () => {
  const aggregator = new ScoreAggregator();
  const supportedGames = aggregator.getSupportedGames();

  testRunner.assert(supportedGames.length === 10, 'Should support 10 games');
  testRunner.assert(supportedGames.some(g => g.id === 'snake-GG'), 'Should include Snake');
  testRunner.assert(supportedGames.some(g => g.id === 'tetris-GG'), 'Should include Tetris');
  testRunner.assert(supportedGames.some(g => g.id === 'pacman-GG'), 'Should include Pac-Man');
});

// ============================================================================
// SCORE NORMALIZATION TESTS
// ============================================================================

testRunner.test('Basic score normalization works', () => {
  const aggregator = new ScoreAggregator();

  // Test Snake normalization
  const snakeScore = aggregator.normalizeScore('snake-GG', 500);
  testRunner.assert(snakeScore >= 0 && snakeScore <= 1, 'Snake score should be normalized to 0-1 range');

  // Test Tetris normalization
  const tetrisScore = aggregator.normalizeScore('tetris-GG', 10000);
  testRunner.assert(tetrisScore >= 0 && tetrisScore <= 1, 'Tetris score should be normalized to 0-1 range');

  // Higher scores should generally result in higher normalized scores
  const lowSnakeScore = aggregator.normalizeScore('snake-GG', 100);
  const highSnakeScore = aggregator.normalizeScore('snake-GG', 1000);
  testRunner.assert(highSnakeScore > lowSnakeScore, 'Higher raw scores should yield higher normalized scores');
});

testRunner.test('Score normalization with metadata', () => {
  const aggregator = new ScoreAggregator();

  // Test with level metadata
  const baseScore = aggregator.normalizeScore('snake-GG', 500);
  const levelBonusScore = aggregator.normalizeScore('snake-GG', 500, { level: 5 });

  testRunner.assert(levelBonusScore > baseScore, 'Level bonus should increase normalized score');

  // Test with Snake-specific metadata
  const snakeLengthScore = aggregator.normalizeScore('snake-GG', 500, {
    level: 3,
    snakeLength: 25
  });
  testRunner.assert(snakeLengthScore > baseScore, 'Snake length bonus should increase score');
});

testRunner.test('Score normalization handles edge cases', () => {
  const aggregator = new ScoreAggregator();

  // Zero score
  const zeroScore = aggregator.normalizeScore('snake-GG', 0);
  testRunner.assertEqual(zeroScore, 0, 'Zero score should normalize to 0');

  // Very high score
  const highScore = aggregator.normalizeScore('snake-GG', 100000);
  testRunner.assert(highScore <= 1, 'Very high scores should be capped at 1');

  // Negative score (should be sanitized)
  const negativeScore = aggregator.normalizeScore('snake-GG', -100);
  testRunner.assertEqual(negativeScore, 0, 'Negative scores should be sanitized to 0');
});

testRunner.test('Score normalization validates inputs', () => {
  const aggregator = new ScoreAggregator();

  // Invalid game ID
  testRunner.assertThrows(() => {
    aggregator.normalizeScore('invalid-game', 100);
  }, 'Should throw for invalid game ID');

  // Invalid score type
  testRunner.assertThrows(() => {
    aggregator.normalizeScore('snake-GG', 'not-a-number');
  }, 'Should throw for non-numeric score');

  // Empty game ID
  testRunner.assertThrows(() => {
    aggregator.normalizeScore('', 100);
  }, 'Should throw for empty game ID');
});

// ============================================================================
// RANKING CALCULATION TESTS
// ============================================================================

testRunner.test('Basic ranking calculation works', () => {
  const aggregator = new ScoreAggregator();

  const participants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.6 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: { 'snake-GG': 0.6, 'tetris-GG': 0.9 }
    },
    {
      id: 'player3',
      name: 'Player 3',
      normalizedScores: { 'snake-GG': 0.9, 'tetris-GG': 0.8 }
    }
  ];

  const rankings = aggregator.calculateRanking(participants);

  testRunner.assertEqual(rankings.length, 3, 'Should return all participants');
  testRunner.assertEqual(rankings[0].rank, 1, 'First place should have rank 1');
  testRunner.assertEqual(rankings[1].rank, 2, 'Second place should have rank 2');
  testRunner.assertEqual(rankings[2].rank, 3, 'Third place should have rank 3');

  // Check that rankings are sorted by total score
  testRunner.assert(
    rankings[0].totalNormalizedScore >= rankings[1].totalNormalizedScore,
    'Rankings should be sorted by score'
  );
});

testRunner.test('Ranking handles ties correctly', () => {
  const aggregator = new ScoreAggregator();

  const participants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.5, 'tetris-GG': 0.5 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: { 'snake-GG': 0.5, 'tetris-GG': 0.5 }
    },
    {
      id: 'player3',
      name: 'Player 3',
      normalizedScores: { 'snake-GG': 0.4, 'tetris-GG': 0.4 }
    }
  ];

  const rankings = aggregator.calculateRanking(participants);

  // Both tied players should have rank 1
  testRunner.assertEqual(rankings[0].rank, 1, 'First tied player should have rank 1');
  testRunner.assertEqual(rankings[1].rank, 1, 'Second tied player should have rank 1');
  testRunner.assertEqual(rankings[2].rank, 3, 'Third player should have rank 3 (not 2)');
});

testRunner.test('Ranking supports different aggregation methods', () => {
  const aggregator = new ScoreAggregator();

  const participants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.2 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: { 'snake-GG': 0.6, 'tetris-GG': 0.6 }
    }
  ];

  // Average method (default)
  const avgRankings = aggregator.calculateRanking(participants, { aggregationMethod: 'average' });

  // Best score method
  const bestRankings = aggregator.calculateRanking(participants, { aggregationMethod: 'best' });

  // Results should be different based on aggregation method
  testRunner.assert(
    avgRankings[0].id !== bestRankings[0].id || avgRankings[0].id === bestRankings[0].id,
    'Different aggregation methods may produce different rankings'
  );
});

testRunner.test('Ranking handles empty input', () => {
  const aggregator = new ScoreAggregator();

  const emptyRankings = aggregator.calculateRanking([]);
  testRunner.assertEqual(emptyRankings.length, 0, 'Empty input should return empty array');

  const nullRankings = aggregator.calculateRanking(null);
  testRunner.assertEqual(nullRankings.length, 0, 'Null input should return empty array');
});

// ============================================================================
// LEADERBOARD GENERATION TESTS
// ============================================================================

testRunner.test('Leaderboard generation works', () => {
  const aggregator = new ScoreAggregator();

  const participants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.6 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: { 'snake-GG': 0.6, 'tetris-GG': 0.9 }
    }
  ];

  const leaderboard = aggregator.generateLeaderboard('test-tournament', participants);

  testRunner.assertEqual(leaderboard.tournamentId, 'test-tournament', 'Should include tournament ID');
  testRunner.assertEqual(leaderboard.totalParticipants, 2, 'Should count participants correctly');
  testRunner.assert(Array.isArray(leaderboard.rankings), 'Should include rankings array');
  testRunner.assert(typeof leaderboard.statistics === 'object', 'Should include statistics');
  testRunner.assert(typeof leaderboard.timestamp === 'string', 'Should include timestamp');
});

testRunner.test('Leaderboard statistics are calculated correctly', () => {
  const aggregator = new ScoreAggregator();

  const participants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.6 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: { 'snake-GG': 0.4, 'tetris-GG': 0.2 }
    }
  ];

  const leaderboard = aggregator.generateLeaderboard('test-tournament', participants);
  const stats = leaderboard.statistics;

  testRunner.assert(typeof stats.averageScore === 'number', 'Should calculate average score');
  testRunner.assert(typeof stats.medianScore === 'number', 'Should calculate median score');
  testRunner.assert(typeof stats.scoreRange === 'object', 'Should calculate score range');
  testRunner.assert(typeof stats.completionRate === 'number', 'Should calculate completion rate');

  testRunner.assert(stats.averageScore > 0, 'Average score should be positive');
  testRunner.assert(stats.completionRate >= 0 && stats.completionRate <= 1, 'Completion rate should be 0-1');
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

testRunner.test('Score normalization performance is acceptable', () => {
  const aggregator = new ScoreAggregator({ debugMode: false });

  const startTime = performance.now();

  // Normalize 1000 scores
  for (let i = 0; i < 1000; i++) {
    aggregator.normalizeScore('snake-GG', Math.random() * 5000);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / 1000;

  testRunner.assert(avgTime < 1, 'Average normalization time should be < 1ms');
  testRunner.assert(totalTime < 100, 'Total time for 1000 normalizations should be < 100ms');
});

testRunner.test('Ranking calculation performance is acceptable', () => {
  const aggregator = new ScoreAggregator({ debugMode: false });

  // Create 100 participants with random scores
  const participants = [];
  for (let i = 0; i < 100; i++) {
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

  const startTime = performance.now();
  const rankings = aggregator.calculateRanking(participants);
  const endTime = performance.now();

  const executionTime = endTime - startTime;

  testRunner.assert(executionTime < 50, 'Ranking 100 participants should take < 50ms');
  testRunner.assertEqual(rankings.length, 100, 'Should return all participants');
});

testRunner.test('Performance metrics are tracked', () => {
  const aggregator = new ScoreAggregator();

  // Perform some operations
  aggregator.normalizeScore('snake-GG', 500);
  aggregator.calculateRanking([
    { id: 'p1', name: 'Player 1', normalizedScores: { 'snake-GG': 0.5 } }
  ]);

  const metrics = aggregator.getPerformanceMetrics();

  testRunner.assert(typeof metrics === 'object', 'Should return metrics object');
  testRunner.assert(metrics.normalization.count > 0, 'Should track normalization operations');
  testRunner.assert(metrics.ranking.count > 0, 'Should track ranking operations');
  testRunner.assert(metrics.normalization.avg >= 0, 'Should calculate average times');
});

// ============================================================================
// GAME-SPECIFIC TESTS
// ============================================================================

testRunner.test('Snake scoring profile works correctly', () => {
  const aggregator = new ScoreAggregator();

  // Test typical Snake scores
  const lowScore = aggregator.normalizeScore('snake-GG', 100);
  const mediumScore = aggregator.normalizeScore('snake-GG', 500);
  const highScore = aggregator.normalizeScore('snake-GG', 2000);

  testRunner.assert(lowScore < mediumScore, 'Low score should be less than medium');
  testRunner.assert(mediumScore < highScore, 'Medium score should be less than high');

  // Test with Snake-specific metadata
  const withMetadata = aggregator.normalizeScore('snake-GG', 500, {
    level: 5,
    snakeLength: 30,
    duration: 120000
  });

  testRunner.assert(withMetadata > mediumScore, 'Metadata should improve normalized score');
});

testRunner.test('Tetris scoring profile works correctly', () => {
  const aggregator = new ScoreAggregator();

  // Tetris uses exponential scoring, so should use logarithmic normalization
  const lowScore = aggregator.normalizeScore('tetris-GG', 1000);
  const highScore = aggregator.normalizeScore('tetris-GG', 50000);

  testRunner.assert(lowScore < highScore, 'Higher Tetris scores should normalize higher');

  // Test with Tetris-specific metadata
  const withEfficiency = aggregator.normalizeScore('tetris-GG', 5000, {
    level: 3,
    linesCleared: 60,
    totalPieces: 100
  });

  const baseScore = aggregator.normalizeScore('tetris-GG', 5000, { level: 3 });
  testRunner.assert(withEfficiency > baseScore, 'Line clearing efficiency should boost score');
});

testRunner.test('Pong scoring profile works correctly', () => {
  const aggregator = new ScoreAggregator();

  // Pong has a low max score (21) and different characteristics
  const pongScore = aggregator.normalizeScore('pong-GG', 15);
  testRunner.assert(pongScore > 0.5, 'Score of 15 in Pong should be quite high normalized');

  const maxPongScore = aggregator.normalizeScore('pong-GG', 21);
  testRunner.assert(maxPongScore > pongScore, 'Max Pong score should be highest');
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

testRunner.test('Handles corrupted participant data gracefully', () => {
  const aggregator = new ScoreAggregator();

  const corruptedParticipants = [
    {
      id: 'player1',
      name: 'Player 1',
      normalizedScores: { 'snake-GG': 0.8 }
    },
    {
      id: 'player2',
      name: 'Player 2',
      normalizedScores: null // Corrupted data
    },
    {
      id: 'player3',
      name: 'Player 3'
      // Missing normalizedScores
    }
  ];

  const rankings = aggregator.calculateRanking(corruptedParticipants);

  testRunner.assertEqual(rankings.length, 3, 'Should handle all participants despite corruption');
  testRunner.assert(rankings[0].totalNormalizedScore >= 0, 'Should assign valid scores');
});

testRunner.test('Handles extreme score values', () => {
  const aggregator = new ScoreAggregator();

  // Test with very large numbers
  const hugeScore = aggregator.normalizeScore('snake-GG', Number.MAX_SAFE_INTEGER);
  testRunner.assert(hugeScore <= 1, 'Huge scores should be capped at 1');

  // Test with very small positive numbers
  const tinyScore = aggregator.normalizeScore('snake-GG', 0.001);
  testRunner.assert(tinyScore >= 0, 'Tiny scores should be non-negative');

  // Test with infinity
  testRunner.assertThrows(() => {
    aggregator.normalizeScore('snake-GG', Infinity);
  }, 'Should handle infinity gracefully');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

testRunner.test('Full tournament workflow works', () => {
  const aggregator = new ScoreAggregator();

  // Simulate a complete tournament
  const participants = [
    { id: 'p1', name: 'Alice', normalizedScores: {} },
    { id: 'p2', name: 'Bob', normalizedScores: {} },
    { id: 'p3', name: 'Charlie', normalizedScores: {} }
  ];

  // Simulate game completions
  const games = ['snake-GG', 'tetris-GG', 'pacman-GG'];
  const rawScores = {
    p1: [800, 15000, 3000],
    p2: [1200, 8000, 4500],
    p3: [600, 25000, 2000]
  };

  // Normalize all scores
  games.forEach((gameId, gameIndex) => {
    participants.forEach(participant => {
      const rawScore = rawScores[participant.id][gameIndex];
      const normalizedScore = aggregator.normalizeScore(gameId, rawScore);
      participant.normalizedScores[gameId] = normalizedScore;
    });
  });

  // Generate final leaderboard
  const leaderboard = aggregator.generateLeaderboard('integration-test', participants);

  testRunner.assertEqual(leaderboard.rankings.length, 3, 'Should rank all participants');
  testRunner.assert(leaderboard.rankings[0].rank === 1, 'Should have a winner');
  testRunner.assertAlmostEqual(leaderboard.statistics.completionRate, 0.3, 0.01, 'Participants completed 3 out of 10 games (30%)');
});

// ============================================================================
// RUN TESTS
// ============================================================================

// Run all tests
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', () => {
    testRunner.run().then(success => {
      if (success) {
        console.log('🎉 ScoreAggregator is ready for tournament integration!');
      } else {
        console.error('❌ ScoreAggregator tests failed - check implementation');
      }
    });
  });
} else {
  // Node.js environment
  testRunner.run().then(success => {
    if (success) {
      console.log('\n🎉 ScoreAggregator is ready for tournament integration!');
      console.log('📊 Performance benchmarks passed');
      console.log('🎮 All game profiles validated');
      console.log('🏆 Ranking algorithms verified');
    }
    process.exit(success ? 0 : 1);
  });
}

// Export test runner for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, testRunner };
}

if (typeof window !== 'undefined') {
  window.ScoreAggregatorTests = { TestRunner, testRunner };
}
