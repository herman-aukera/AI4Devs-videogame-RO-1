/* © GG, MIT License */

/**
 * Score Aggregation and Normalization System for Cross-Game Tournament
 *
 * This module provides comprehensive score normalization, ranking calculation,
 * and leaderboard management for tournaments spanning multiple game types.
 * Each game has unique scoring mechanics that need to be normalized for fair
 * comparison across different game genres.
 */

// ============================================================================
// GAME SCORING PROFILES AND NORMALIZATION CONSTANTS
// ============================================================================

/**
 * Game scoring profiles define the characteristics of each game's scoring system
 * These profiles are used to normalize scores across different game types
 */
const GAME_SCORING_PROFILES = {
  'snake-GG': {
    name: 'Snake',
    category: 'arcade',
    scoreType: 'incremental',
    baseUnit: 10,           // Points per food
    levelBonus: 50,         // Points per level
    maxReasonableScore: 5000,
    averageScore: 500,
    difficultyMultiplier: 1.0,
    timeWeight: 0.3,        // Time factor in scoring
    skillCeiling: 'medium'
  },

  'tetris-GG': {
    name: 'Tetris',
    category: 'puzzle',
    scoreType: 'exponential',
    baseUnit: 100,          // Single line clear
    levelBonus: 10,         // Lines per level
    maxReasonableScore: 100000,
    averageScore: 8000,
    difficultyMultiplier: 1.2,
    timeWeight: 0.2,
    skillCeiling: 'high'
  },

  'pacman-GG': {
    name: 'Pac-Man',
    category: 'maze',
    scoreType: 'incremental',
    baseUnit: 10,           // Points per dot
    levelBonus: 200,        // Bonus per level
    maxReasonableScore: 15000,
    averageScore: 2000,
    difficultyMultiplier: 1.2,
    timeWeight: 0.4,
    skillCeiling: 'medium'
  },

  'mspacman-GG': {
    name: 'Ms. Pac-Man',
    category: 'maze',
    scoreType: 'incremental',
    baseUnit: 10,
    levelBonus: 200,
    maxReasonableScore: 18000,
    averageScore: 2500,
    difficultyMultiplier: 1.3,
    timeWeight: 0.4,
    skillCeiling: 'medium'
  },

  'breakout-GG': {
    name: 'Breakout',
    category: 'action',
    scoreType: 'incremental',
    baseUnit: 5,            // Points per brick
    levelBonus: 100,        // Bonus per level
    maxReasonableScore: 8000,
    averageScore: 1200,
    difficultyMultiplier: 1.1,
    timeWeight: 0.3,
    skillCeiling: 'medium'
  },

  'asteroids-GG': {
    name: 'Asteroids',
    category: 'space',
    scoreType: 'incremental',
    baseUnit: 20,           // Points per asteroid
    levelBonus: 500,        // Wave completion bonus
    maxReasonableScore: 25000,
    averageScore: 3000,
    difficultyMultiplier: 1.4,
    timeWeight: 0.5,
    skillCeiling: 'high'
  },

  'space-invaders-GG': {
    name: 'Space Invaders',
    category: 'space',
    scoreType: 'incremental',
    baseUnit: 10,           // Points per invader
    levelBonus: 300,        // Wave completion bonus
    maxReasonableScore: 20000,
    averageScore: 2500,
    difficultyMultiplier: 1.3,
    timeWeight: 0.4,
    skillCeiling: 'medium'
  },

  'galaga-GG': {
    name: 'Galaga',
    category: 'space',
    scoreType: 'incremental',
    baseUnit: 50,           // Points per enemy
    levelBonus: 1000,       // Stage completion bonus
    maxReasonableScore: 30000,
    averageScore: 4000,
    difficultyMultiplier: 1.4,
    timeWeight: 0.4,
    skillCeiling: 'high'
  },

  'pong-GG': {
    name: 'Pong',
    category: 'sports',
    scoreType: 'match',
    baseUnit: 1,            // Points per rally won
    levelBonus: 0,          // No levels in Pong
    maxReasonableScore: 21,  // First to 21 wins
    averageScore: 11,
    difficultyMultiplier: 0.8,
    timeWeight: 0.6,
    skillCeiling: 'low'
  },

  'fruit-catcher-GG': {
    name: 'Fruit Catcher',
    category: 'arcade',
    scoreType: 'incremental',
    baseUnit: 5,            // Points per fruit
    levelBonus: 50,         // Speed increase bonus
    maxReasonableScore: 3000,
    averageScore: 400,
    difficultyMultiplier: 0.9,
    timeWeight: 0.5,
    skillCeiling: 'low'
  }
};

/**
 * Normalization algorithms for different score types
 */
const NORMALIZATION_ALGORITHMS = {
  /**
   * Linear normalization - for games with consistent scoring rates
   */
  linear: (score, profile) => {
    return Math.min(score / profile.maxReasonableScore, 1.0);
  },

  /**
   * Logarithmic normalization - for games with exponential scoring
   */
  logarithmic: (score, profile) => {
    if (score <= 0) return 0;
    const logScore = Math.log(score + 1);
    const logMax = Math.log(profile.maxReasonableScore + 1);
    return Math.min(logScore / logMax, 1.0);
  },

  /**
   * Sigmoid normalization - for games with skill ceiling effects
   */
  sigmoid: (score, profile) => {
    const normalized = score / profile.averageScore;
    return 2 / (1 + Math.exp(-normalized)) - 1;
  },

  /**
   * Percentile normalization - based on historical performance
   */
  percentile: (score, profile, historicalScores = []) => {
    if (historicalScores.length === 0) {
      return NORMALIZATION_ALGORITHMS.linear(score, profile);
    }

    const sortedScores = [...historicalScores].sort((a, b) => a - b);
    const rank = sortedScores.filter(s => s <= score).length;
    return rank / sortedScores.length;
  }
};

// ============================================================================
// SCORE AGGREGATOR CLASS
// ============================================================================

class ScoreAggregator {
  constructor(options = {}) {
    this.gameProfiles = { ...GAME_SCORING_PROFILES };
    this.algorithms = { ...NORMALIZATION_ALGORITHMS };
    this.historicalData = new Map(); // gameId -> scores array
    this.debugMode = options.debugMode || false;

    // Performance tracking
    this.performanceMetrics = {
      normalizationTime: [],
      rankingTime: [],
      leaderboardTime: []
    };

    this.log('ScoreAggregator initialized');
  }

  // ============================================================================
  // SCORE NORMALIZATION METHODS
  // ============================================================================

  /**
   * Normalize a raw score from a specific game to a 0-1 scale
   * @param {string} gameId - Game identifier (e.g., 'snake-GG')
   * @param {number} rawScore - Raw score from the game
   * @param {Object} metadata - Additional game metadata (level, time, etc.)
   * @returns {number} Normalized score between 0 and 1
   */
  normalizeScore(gameId, rawScore, metadata = {}) {
    const startTime = performance.now();

    try {
      // Validate inputs
      if (!this.validateScoreInput(gameId, rawScore)) {
        throw new Error(`Invalid score input: gameId=${gameId}, score=${rawScore}`);
      }

      const profile = this.gameProfiles[gameId];
      if (!profile) {
        throw new Error(`Unknown game profile: ${gameId}`);
      }

      // Sanitize raw score
      const sanitizedScore = this.sanitizeScore(rawScore);

      // Apply base normalization algorithm based on game type
      let normalizedScore = this.applyBaseNormalization(sanitizedScore, profile);

      // Apply difficulty multiplier
      normalizedScore *= profile.difficultyMultiplier;

      // Apply metadata adjustments (level, time, etc.)
      normalizedScore = this.applyMetadataAdjustments(normalizedScore, metadata, profile);

      // Ensure score is within bounds
      normalizedScore = Math.max(0, Math.min(1, normalizedScore));

      // Track performance
      const executionTime = performance.now() - startTime;
      this.performanceMetrics.normalizationTime.push(executionTime);

      this.log(`Normalized ${gameId} score: ${rawScore} -> ${normalizedScore.toFixed(4)}`, {
        executionTime: executionTime.toFixed(2) + 'ms',
        metadata
      });

      return normalizedScore;

    } catch (error) {
      this.log(`Score normalization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Apply base normalization algorithm based on game scoring type
   */
  applyBaseNormalization(score, profile) {
    switch (profile.scoreType) {
      case 'exponential':
        return this.algorithms.logarithmic(score, profile);
      case 'match':
        return this.algorithms.linear(score, profile);
      case 'incremental':
      default:
        return profile.skillCeiling === 'high'
          ? this.algorithms.sigmoid(score, profile)
          : this.algorithms.linear(score, profile);
    }
  }

  /**
   * Apply adjustments based on game metadata (level, time, etc.)
   */
  applyMetadataAdjustments(baseScore, metadata, profile) {
    let adjustedScore = baseScore;

    // Level bonus adjustment
    if (metadata.level && metadata.level > 1) {
      const levelBonus = (metadata.level - 1) * 0.1; // 10% bonus per level above 1
      adjustedScore += levelBonus * 0.2; // Cap level bonus impact at 20%
    }

    // Time efficiency adjustment (for time-sensitive games)
    if (metadata.duration && profile.timeWeight > 0) {
      const timeEfficiency = this.calculateTimeEfficiency(metadata.duration, profile);
      adjustedScore += timeEfficiency * profile.timeWeight * 0.1;
    }

    // Game-specific adjustments
    adjustedScore = this.applyGameSpecificAdjustments(adjustedScore, metadata, profile);

    return adjustedScore;
  }

  /**
   * Calculate time efficiency bonus/penalty
   */
  calculateTimeEfficiency(duration, profile) {
    // Shorter games get slight bonus, longer games get slight penalty
    const averageDuration = 180000; // 3 minutes in milliseconds
    const efficiency = averageDuration / Math.max(duration, 30000); // Minimum 30 seconds
    return Math.min(Math.max(efficiency - 1, -0.2), 0.2); // Cap at ±20%
  }

  /**
   * Apply game-specific scoring adjustments
   */
  applyGameSpecificAdjustments(score, metadata, profile) {
    switch (profile.name) {
      case 'Snake':
        // Bonus for longer snake length
        if (metadata.snakeLength) {
          const lengthBonus = Math.min(metadata.snakeLength / 50, 0.1); // Max 10% bonus
          score += lengthBonus;
        }
        break;

      case 'Tetris':
        // Bonus for line clearing efficiency
        if (metadata.linesCleared && metadata.totalPieces) {
          const efficiency = metadata.linesCleared / metadata.totalPieces;
          if (efficiency > 0.3) { // Only give bonus for good efficiency
            const efficiencyBonus = Math.min((efficiency - 0.3) * 0.3, 0.1); // Max 10% bonus
            score += efficiencyBonus;
          }
        }
        break;

      case 'Pac-Man':
      case 'Ms. Pac-Man':
        // Bonus for ghost eating and fruit collection
        if (metadata.ghostsEaten) {
          const ghostBonus = Math.min(metadata.ghostsEaten / 20, 0.1); // Max 10% bonus
          score += ghostBonus;
        }
        break;

      case 'Asteroids':
      case 'Space Invaders':
      case 'Galaga':
        // Bonus for accuracy
        if (metadata.accuracy && metadata.accuracy > 0) {
          const accuracyBonus = Math.min((metadata.accuracy - 0.5) * 0.2, 0.1); // Max 10% bonus
          score += accuracyBonus;
        }
        break;
    }

    return score;
  }

  // ============================================================================
  // RANKING AND LEADERBOARD METHODS
  // ============================================================================

  /**
   * Calculate tournament rankings from normalized scores
   * @param {Array} participants - Array of participant objects with scores
   * @param {Object} options - Ranking options
   * @returns {Array} Sorted array of participants with rankings
   */
  calculateRanking(participants, options = {}) {
    const startTime = performance.now();

    try {
      if (!Array.isArray(participants) || participants.length === 0) {
        return [];
      }

      // Calculate total normalized scores for each participant
      const rankedParticipants = participants.map(participant => {
        const totalScore = this.calculateTotalScore(participant, options);
        return {
          ...participant,
          totalNormalizedScore: totalScore,
          rank: 0 // Will be set after sorting
        };
      });

      // Sort by total normalized score (descending)
      rankedParticipants.sort((a, b) => {
        if (Math.abs(a.totalNormalizedScore - b.totalNormalizedScore) < 0.0001) {
          // Tie-breaking rules
          return this.resolveTie(a, b, options);
        }
        return b.totalNormalizedScore - a.totalNormalizedScore;
      });

      // Assign ranks (handle ties)
      this.assignRanks(rankedParticipants);

      // Track performance
      const executionTime = performance.now() - startTime;
      this.performanceMetrics.rankingTime.push(executionTime);

      this.log(`Calculated rankings for ${participants.length} participants`, {
        executionTime: executionTime.toFixed(2) + 'ms'
      });

      return rankedParticipants;

    } catch (error) {
      this.log(`Ranking calculation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Calculate total normalized score for a participant
   */
  calculateTotalScore(participant, options) {
    if (!participant.normalizedScores || Object.keys(participant.normalizedScores).length === 0) {
      return 0;
    }

    const scores = Object.values(participant.normalizedScores);

    switch (options.aggregationMethod || 'average') {
      case 'sum':
        return scores.reduce((sum, score) => sum + score, 0);
      case 'weighted':
        return this.calculateWeightedScore(participant.normalizedScores);
      case 'best':
        return Math.max(...scores);
      case 'average':
      default:
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  }

  /**
   * Calculate weighted score based on game difficulty
   */
  calculateWeightedScore(normalizedScores) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(normalizedScores).forEach(([gameId, score]) => {
      const profile = this.gameProfiles[gameId];
      if (profile) {
        const weight = profile.difficultyMultiplier;
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Resolve ties between participants with equal scores
   */
  resolveTie(participantA, participantB, options) {
    // Tie-breaking rules in order of priority:

    // 1. Most games completed
    const gamesA = Object.keys(participantA.normalizedScores || {}).length;
    const gamesB = Object.keys(participantB.normalizedScores || {}).length;
    if (gamesA !== gamesB) {
      return gamesB - gamesA; // More games = better rank
    }

    // 2. Highest individual game score
    const maxScoreA = Math.max(...Object.values(participantA.normalizedScores || {}));
    const maxScoreB = Math.max(...Object.values(participantB.normalizedScores || {}));
    if (Math.abs(maxScoreA - maxScoreB) > 0.0001) {
      return maxScoreB - maxScoreA;
    }

    // 3. Alphabetical by name (consistent tie-breaking)
    return participantA.name.localeCompare(participantB.name);
  }

  /**
   * Assign ranks to sorted participants (handle ties)
   */
  assignRanks(sortedParticipants) {
    let currentRank = 1;

    for (let i = 0; i < sortedParticipants.length; i++) {
      if (i > 0) {
        const current = sortedParticipants[i];
        const previous = sortedParticipants[i - 1];

        // Check if scores are tied
        if (Math.abs(current.totalNormalizedScore - previous.totalNormalizedScore) > 0.0001) {
          currentRank = i + 1;
        }
      }

      sortedParticipants[i].rank = currentRank;
    }
  }

  /**
   * Generate leaderboard with additional statistics
   * @param {string} tournamentId - Tournament identifier
   * @param {Array} participants - Tournament participants
   * @param {Object} options - Leaderboard options
   * @returns {Object} Complete leaderboard data
   */
  generateLeaderboard(tournamentId, participants, options = {}) {
    const startTime = performance.now();

    try {
      const rankedParticipants = this.calculateRanking(participants, options);

      const leaderboard = {
        tournamentId,
        timestamp: new Date().toISOString(),
        totalParticipants: participants.length,
        rankings: rankedParticipants,
        statistics: this.calculateLeaderboardStatistics(rankedParticipants),
        metadata: {
          aggregationMethod: options.aggregationMethod || 'average',
          generationTime: performance.now() - startTime
        }
      };

      // Track performance
      const executionTime = performance.now() - startTime;
      this.performanceMetrics.leaderboardTime.push(executionTime);

      this.log(`Generated leaderboard for tournament ${tournamentId}`, {
        participants: participants.length,
        executionTime: executionTime.toFixed(2) + 'ms'
      });

      return leaderboard;

    } catch (error) {
      this.log(`Leaderboard generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Calculate leaderboard statistics
   */
  calculateLeaderboardStatistics(rankedParticipants) {
    if (rankedParticipants.length === 0) {
      return {
        averageScore: 0,
        medianScore: 0,
        scoreRange: { min: 0, max: 0 },
        completionRate: 0
      };
    }

    const scores = rankedParticipants.map(p => p.totalNormalizedScore);
    const sortedScores = [...scores].sort((a, b) => a - b);

    return {
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      medianScore: sortedScores[Math.floor(sortedScores.length / 2)],
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores)
      },
      completionRate: this.calculateCompletionRate(rankedParticipants)
    };
  }

  /**
   * Calculate average completion rate across all participants
   */
  calculateCompletionRate(participants) {
    if (participants.length === 0) return 0;

    const totalGames = Object.keys(this.gameProfiles).length;
    const completionRates = participants.map(p => {
      const completedGames = Object.keys(p.normalizedScores || {}).length;
      return completedGames / totalGames;
    });

    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  // ============================================================================
  // VALIDATION AND UTILITY METHODS
  // ============================================================================

  /**
   * Validate score input parameters
   */
  validateScoreInput(gameId, score) {
    if (typeof gameId !== 'string' || gameId.length === 0) {
      return false;
    }

    if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize raw score input
   */
  sanitizeScore(rawScore) {
    // Convert to number and ensure it's positive
    const score = Number(rawScore);
    return Math.max(0, isNaN(score) ? 0 : score);
  }

  /**
   * Add historical score data for percentile normalization
   */
  addHistoricalScore(gameId, score) {
    if (!this.historicalData.has(gameId)) {
      this.historicalData.set(gameId, []);
    }

    const scores = this.historicalData.get(gameId);
    scores.push(score);

    // Keep only recent scores (last 1000)
    if (scores.length > 1000) {
      scores.shift();
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const calculateStats = (times) => {
      if (times.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };

      return {
        avg: times.reduce((sum, time) => sum + time, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
    };

    return {
      normalization: calculateStats(this.performanceMetrics.normalizationTime),
      ranking: calculateStats(this.performanceMetrics.rankingTime),
      leaderboard: calculateStats(this.performanceMetrics.leaderboardTime)
    };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      normalizationTime: [],
      rankingTime: [],
      leaderboardTime: []
    };
  }

  /**
   * Get supported games list
   */
  getSupportedGames() {
    return Object.keys(this.gameProfiles).map(gameId => ({
      id: gameId,
      name: this.gameProfiles[gameId].name,
      category: this.gameProfiles[gameId].category
    }));
  }

  /**
   * Update game profile (for testing or configuration)
   */
  updateGameProfile(gameId, profileUpdates) {
    if (this.gameProfiles[gameId]) {
      this.gameProfiles[gameId] = {
        ...this.gameProfiles[gameId],
        ...profileUpdates
      };
      this.log(`Updated profile for ${gameId}`);
    } else {
      throw new Error(`Game profile not found: ${gameId}`);
    }
  }

  /**
   * Logging utility
   */
  log(message, data = null, level = 'info') {
    if (!this.debugMode && level === 'info') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[ScoreAggregator ${timestamp}] ${message}`;

    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }

  /**
   * Run comprehensive audit tasks for the ScoreAggregator system
   * Following the established pattern from existing games
   */
  runAuditTasks() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      performance: {},
      integration: {},
      summary: {}
    };

    console.log('🧪 Running ScoreAggregator Audit Tasks...\n');

    // Core functionality tests
    results.tests.push(this.testScoreNormalization());
    results.tests.push(this.testRankingCalculation());
    results.tests.push(this.testLeaderboardGeneration());
    results.tests.push(this.testScoreValidation());
    results.tests.push(this.testGameProfileIntegrity());

    // Performance benchmarks
    results.performance = this.runPerformanceBenchmarks();

    // Integration tests with all supported games
    results.integration = this.testAllGameIntegration();

    // Calculate summary
    results.passed = results.tests.filter(t => t.passed).length;
    results.failed = results.tests.filter(t => !t.passed).length;
    results.summary = {
      totalTests: results.tests.length,
      passRate: (results.passed / results.tests.length * 100).toFixed(1) + '%',
      avgNormalizationTime: results.performance.avgNormalizationTime,
      avgRankingTime: results.performance.avgRankingTime,
      supportedGames: Object.keys(this.gameProfiles).length
    };

    // Output results in console table format
    console.table(results.tests);
    console.log('\n📊 Performance Metrics:', results.performance);
    console.log('🎮 Integration Status:', results.integration);
    console.log('📋 Summary:', results.summary);

    if (results.failed === 0) {
      console.log('\n🎉 All ScoreAggregator audit tasks passed!');
      console.log('✅ Ready for tournament integration');
    } else {
      console.log(`\n❌ ${results.failed} audit tasks failed`);
    }

    return results;
  }

  testScoreNormalization() {
    try {
      const testScores = [100, 1000, 5000];
      const games = ['snake-GG', 'tetris-GG', 'pacman-GG'];

      for (const gameId of games) {
        for (const score of testScores) {
          const normalized = this.normalizeScore(gameId, score);
          if (normalized < 0 || normalized > 1 || isNaN(normalized)) {
            throw new Error(`Invalid normalized score for ${gameId}: ${normalized}`);
          }
        }
      }

      return {
        name: 'Score Normalization',
        passed: true,
        details: `Tested ${games.length} games with ${testScores.length} score values each`
      };
    } catch (error) {
      return {
        name: 'Score Normalization',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testRankingCalculation() {
    try {
      const participants = [
        { id: 'p1', name: 'Player 1', normalizedScores: { 'snake-GG': 0.8, 'tetris-GG': 0.6 } },
        { id: 'p2', name: 'Player 2', normalizedScores: { 'snake-GG': 0.6, 'tetris-GG': 0.9 } },
        { id: 'p3', name: 'Player 3', normalizedScores: { 'snake-GG': 0.9, 'tetris-GG': 0.5 } }
      ];

      const rankings = this.calculateRanking(participants);

      if (rankings.length !== 3) {
        throw new Error('Ranking should return all participants');
      }

      if (rankings[0].rank !== 1) {
        throw new Error('First place should have rank 1');
      }

      // Check that rankings are properly sorted by score
      if (rankings[0].totalNormalizedScore < rankings[1].totalNormalizedScore) {
        throw new Error('Rankings not sorted correctly by score');
      }

      return {
        name: 'Ranking Calculation',
        passed: true,
        details: `Successfully ranked ${participants.length} participants`
      };
    } catch (error) {
      return {
        name: 'Ranking Calculation',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testLeaderboardGeneration() {
    try {
      const participants = [
        { id: 'p1', name: 'Player 1', normalizedScores: { 'snake-GG': 0.7 } },
        { id: 'p2', name: 'Player 2', normalizedScores: { 'snake-GG': 0.5 } }
      ];

      const leaderboard = this.generateLeaderboard('audit-test', participants);

      if (!leaderboard.tournamentId || !leaderboard.rankings || !leaderboard.statistics) {
        throw new Error('Leaderboard missing required properties');
      }

      if (leaderboard.rankings.length !== 2) {
        throw new Error('Leaderboard should include all participants');
      }

      return {
        name: 'Leaderboard Generation',
        passed: true,
        details: `Generated leaderboard with statistics for ${participants.length} participants`
      };
    } catch (error) {
      return {
        name: 'Leaderboard Generation',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testScoreValidation() {
    try {
      // Test valid inputs
      this.normalizeScore('snake-GG', 1000);

      // Test sanitization of negative scores
      const negativeResult = this.normalizeScore('snake-GG', -100);
      if (negativeResult !== 0) {
        throw new Error('Negative scores should be sanitized to 0');
      }

      // Test invalid game ID
      try {
        this.normalizeScore('invalid-game', 100);
        throw new Error('Should have thrown for invalid game ID');
      } catch (error) {
        if (!error.message.includes('Unknown game profile')) {
          throw new Error('Wrong error message for invalid game ID');
        }
      }

      return {
        name: 'Score Validation',
        passed: true,
        details: 'Input validation and sanitization working correctly'
      };
    } catch (error) {
      return {
        name: 'Score Validation',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testGameProfileIntegrity() {
    try {
      const requiredProperties = ['name', 'category', 'scoreType', 'maxReasonableScore', 'averageScore'];
      const supportedGames = Object.keys(this.gameProfiles);

      if (supportedGames.length !== 10) {
        throw new Error(`Expected 10 supported games, found ${supportedGames.length}`);
      }

      for (const gameId of supportedGames) {
        const profile = this.gameProfiles[gameId];
        for (const prop of requiredProperties) {
          if (!(prop in profile)) {
            throw new Error(`Game ${gameId} missing required property: ${prop}`);
          }
        }
      }

      return {
        name: 'Game Profile Integrity',
        passed: true,
        details: `Validated ${supportedGames.length} game profiles`
      };
    } catch (error) {
      return {
        name: 'Game Profile Integrity',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  runPerformanceBenchmarks() {
    const metrics = {};

    // Score normalization benchmark
    const normalizationStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      this.normalizeScore('snake-GG', Math.random() * 5000);
    }
    metrics.avgNormalizationTime = ((performance.now() - normalizationStart) / 1000).toFixed(4) + 'ms';

    // Ranking benchmark
    const participants = [];
    for (let i = 0; i < 100; i++) {
      participants.push({
        id: `player${i}`,
        name: `Player ${i}`,
        normalizedScores: { 'snake-GG': Math.random(), 'tetris-GG': Math.random() }
      });
    }

    const rankingStart = performance.now();
    this.calculateRanking(participants);
    metrics.avgRankingTime = (performance.now() - rankingStart).toFixed(2) + 'ms';

    // Leaderboard benchmark
    const leaderboardStart = performance.now();
    this.generateLeaderboard('perf-test', participants);
    metrics.avgLeaderboardTime = (performance.now() - leaderboardStart).toFixed(2) + 'ms';

    return metrics;
  }

  testAllGameIntegration() {
    const integration = {
      supportedGames: 0,
      testedGames: 0,
      failedGames: [],
      successfulGames: []
    };

    const testScores = [100, 1000, 5000];

    Object.keys(this.gameProfiles).forEach(gameId => {
      integration.supportedGames++;

      try {
        testScores.forEach(score => {
          const normalized = this.normalizeScore(gameId, score);
          if (isNaN(normalized) || normalized < 0 || normalized > 1) {
            throw new Error(`Invalid normalization result: ${normalized}`);
          }
        });

        integration.testedGames++;
        integration.successfulGames.push(gameId);
      } catch (error) {
        integration.failedGames.push({ gameId, error: error.message });
      }
    });

    return integration;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ScoreAggregator,
    GAME_SCORING_PROFILES,
    NORMALIZATION_ALGORITHMS
  };
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.ScoreAggregator = ScoreAggregator;
  window.GAME_SCORING_PROFILES = GAME_SCORING_PROFILES;
  window.NORMALIZATION_ALGORITHMS = NORMALIZATION_ALGORITHMS;
}
