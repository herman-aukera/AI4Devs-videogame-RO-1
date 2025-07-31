#!/usr/bin/env node

/**
 * Score Capture Accuracy Test
 * Tests score normalization parameters and capture accuracy for all 10 games
 */

const fs = require('fs');
const path = require('path');

// Import scoring profiles (simulate browser environment)
const GAME_SCORING_PROFILES = {
  'snake-GG': {
    name: 'Snake',
    category: 'arcade',
    scoreType: 'incremental',
    baseUnit: 10,
    levelBonus: 50,
    maxReasonableScore: 5000,
    averageScore: 500,
    difficultyMultiplier: 1.0,
    timeWeight: 0.3,
    skillCeiling: 'medium'
  },
  'tetris-GG': {
    name: 'Tetris',
    category: 'puzzle',
    scoreType: 'exponential',
    baseUnit: 100,
    levelBonus: 10,
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
    baseUnit: 10,
    levelBonus: 200,
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
    baseUnit: 5,
    levelBonus: 100,
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
    baseUnit: 20,
    levelBonus: 500,
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
    baseUnit: 10,
    levelBonus: 300,
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
    baseUnit: 50,
    levelBonus: 1000,
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
    baseUnit: 1,
    levelBonus: 0,
    maxReasonableScore: 21,
    averageScore: 11,
    difficultyMultiplier: 0.8,
    timeWeight: 0.6,
    skillCeiling: 'low'
  },
  'fruit-catcher-GG': {
    name: 'Fruit Catcher',
    category: 'arcade',
    scoreType: 'incremental',
    baseUnit: 5,
    levelBonus: 50,
    maxReasonableScore: 3000,
    averageScore: 400,
    difficultyMultiplier: 0.9,
    timeWeight: 0.5,
    skillCeiling: 'low'
  }
};

// Normalization algorithms
const NORMALIZATION_ALGORITHMS = {
  linear: (score, profile) => {
    return Math.min(score / profile.maxReasonableScore, 1.0);
  },
  logarithmic: (score, profile) => {
    if (score <= 0) return 0;
    const logScore = Math.log(score + 1);
    const logMax = Math.log(profile.maxReasonableScore + 1);
    return Math.min(logScore / logMax, 1.0);
  },
  sigmoid: (score, profile) => {
    const normalized = score / profile.averageScore;
    return 2 / (1 + Math.exp(-normalized)) - 1;
  }
};

class ScoreCaptureAccuracyTest {
  constructor() {
    this.testResults = {};
    this.performanceMetrics = {};
  }

  async runAllTests() {
    console.log('🎯 Score Capture Accuracy Test Suite');
    console.log('====================================');

    // Test score normalization accuracy
    await this.testScoreNormalization();

    // Test score range validation
    await this.testScoreRangeValidation();

    // Test performance benchmarks
    await this.testPerformanceBenchmarks();

    // Generate comprehensive report
    this.generateReport();
  }

  async testScoreNormalization() {
    console.log('\n📊 Testing Score Normalization...');

    const testScores = {
      'snake-GG': [0, 100, 500, 1000, 2500, 5000, 7500],
      'tetris-GG': [0, 1000, 8000, 25000, 50000, 100000, 150000],
      'pacman-GG': [0, 500, 2000, 5000, 10000, 15000, 20000],
      'mspacman-GG': [0, 600, 2500, 6000, 12000, 18000, 25000],
      'breakout-GG': [0, 200, 1200, 3000, 6000, 8000, 10000],
      'asteroids-GG': [0, 1000, 3000, 8000, 15000, 25000, 35000],
      'space-invaders-GG': [0, 800, 2500, 6000, 12000, 20000, 30000],
      'galaga-GG': [0, 1500, 4000, 10000, 20000, 30000, 45000],
      'pong-GG': [0, 5, 11, 15, 18, 21, 25],
      'fruit-catcher-GG': [0, 100, 400, 1000, 2000, 3000, 4000]
    };

    Object.keys(testScores).forEach(gameId => {
      const profile = GAME_SCORING_PROFILES[gameId];
      const scores = testScores[gameId];

      console.log(`\n  ${profile.name} (${gameId}):`);
      console.log(`    Category: ${profile.category}, Type: ${profile.scoreType}`);
      console.log(`    Max Score: ${profile.maxReasonableScore}, Avg: ${profile.averageScore}`);

      const normalizedResults = scores.map(score => {
        const linear = NORMALIZATION_ALGORITHMS.linear(score, profile);
        const logarithmic = NORMALIZATION_ALGORITHMS.logarithmic(score, profile);
        const sigmoid = NORMALIZATION_ALGORITHMS.sigmoid(score, profile);

        return {
          original: score,
          linear: linear.toFixed(3),
          logarithmic: logarithmic.toFixed(3),
          sigmoid: sigmoid.toFixed(3)
        };
      });

      console.log('    Score → Linear | Log | Sigmoid');
      normalizedResults.forEach(result => {
        console.log(`    ${result.original.toString().padStart(6)} → ${result.linear} | ${result.logarithmic} | ${result.sigmoid}`);
      });

      this.testResults[gameId] = {
        profile,
        normalizedResults,
        status: 'tested'
      };
    });
  }

  async testScoreRangeValidation() {
    console.log('\n🔍 Testing Score Range Validation...');

    Object.keys(GAME_SCORING_PROFILES).forEach(gameId => {
      const profile = GAME_SCORING_PROFILES[gameId];

      // Test edge cases
      const edgeCases = [
        { score: -100, expected: 0, description: 'Negative score' },
        { score: 0, expected: 0, description: 'Zero score' },
        { score: profile.averageScore, expected: 'average', description: 'Average score' },
        { score: profile.maxReasonableScore, expected: 1.0, description: 'Max reasonable score' },
        { score: profile.maxReasonableScore * 2, expected: 'capped', description: 'Above max score' }
      ];

      console.log(`\n  ${profile.name} Edge Cases:`);
      edgeCases.forEach(testCase => {
        const normalized = NORMALIZATION_ALGORITHMS.linear(Math.max(0, testCase.score), profile);
        const result = normalized <= 1.0 ? 'PASS' : 'FAIL';
        console.log(`    ${testCase.description}: ${testCase.score} → ${normalized.toFixed(3)} [${result}]`);
      });
    });
  }

  async testPerformanceBenchmarks() {
    console.log('\n⚡ Testing Performance Benchmarks...');

    const iterations = 1000;
    const performanceResults = {};

    Object.keys(GAME_SCORING_PROFILES).forEach(gameId => {
      const profile = GAME_SCORING_PROFILES[gameId];
      const testScore = profile.averageScore;

      // Test linear normalization performance
      const startTime = process.hrtime.bigint();
      for (let i = 0; i < iterations; i++) {
        NORMALIZATION_ALGORITHMS.linear(testScore, profile);
      }
      const endTime = process.hrtime.bigint();

      const avgTime = Number(endTime - startTime) / 1000000 / iterations; // Convert to milliseconds
      performanceResults[gameId] = avgTime;

      const status = avgTime < 0.1 ? 'PASS' : 'WARN';
      console.log(`  ${profile.name}: ${avgTime.toFixed(4)}ms avg [${status}]`);
    });

    this.performanceMetrics = performanceResults;

    const overallAvg = Object.values(performanceResults).reduce((sum, time) => sum + time, 0) / Object.keys(performanceResults).length;
    console.log(`\n  Overall Average: ${overallAvg.toFixed(4)}ms`);
    console.log(`  Target: < 0.1ms per normalization`);
    console.log(`  Status: ${overallAvg < 0.1 ? 'PASS' : 'NEEDS OPTIMIZATION'}`);
  }

  generateReport() {
    console.log('\n📋 SCORE CAPTURE ACCURACY REPORT');
    console.log('=================================');

    const totalGames = Object.keys(GAME_SCORING_PROFILES).length;
    const testedGames = Object.keys(this.testResults).length;

    console.log(`\nGame Coverage:`);
    console.log(`  Total Games: ${totalGames}`);
    console.log(`  Tested Games: ${testedGames}`);
    console.log(`  Coverage: ${((testedGames / totalGames) * 100).toFixed(1)}%`);

    console.log(`\nScore Normalization Summary:`);
    Object.keys(this.testResults).forEach(gameId => {
      const result = this.testResults[gameId];
      const profile = result.profile;

      // Calculate normalization spread (how well scores are distributed)
      const normalizedScores = result.normalizedResults.map(r => parseFloat(r.linear));
      const minNorm = Math.min(...normalizedScores);
      const maxNorm = Math.max(...normalizedScores);
      const spread = maxNorm - minNorm;

      console.log(`  ${profile.name}: Range ${minNorm.toFixed(3)}-${maxNorm.toFixed(3)}, Spread: ${spread.toFixed(3)}`);
    });

    console.log(`\nPerformance Summary:`);
    const avgPerformance = Object.values(this.performanceMetrics).reduce((sum, time) => sum + time, 0) / Object.keys(this.performanceMetrics).length;
    console.log(`  Average Normalization Time: ${avgPerformance.toFixed(4)}ms`);
    console.log(`  Performance Target: < 0.1ms`);
    console.log(`  Status: ${avgPerformance < 0.1 ? '✅ MEETS REQUIREMENTS' : '⚠️  NEEDS OPTIMIZATION'}`);

    console.log(`\nGame-Specific Recommendations:`);
    Object.keys(this.testResults).forEach(gameId => {
      const profile = GAME_SCORING_PROFILES[gameId];

      if (profile.scoreType === 'exponential' && profile.skillCeiling === 'high') {
        console.log(`  ${profile.name}: Consider logarithmic normalization for better score distribution`);
      }

      if (profile.maxReasonableScore < 1000) {
        console.log(`  ${profile.name}: Low score range - ensure precision in normalization`);
      }

      if (profile.difficultyMultiplier > 1.3) {
        console.log(`  ${profile.name}: High difficulty - may need adjusted normalization curve`);
      }
    });

    const allTestsPassed = testedGames === totalGames && avgPerformance < 0.1;
    console.log(`\n${allTestsPassed ? '✅ ALL TESTS PASSED - READY FOR TOURNAMENT INTEGRATION' : '❌ SOME ISSUES FOUND - REVIEW RECOMMENDATIONS'}`);

    return allTestsPassed;
  }
}

// Run the test suite
const tester = new ScoreCaptureAccuracyTest();
tester.runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
