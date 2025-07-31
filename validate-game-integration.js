#!/usr/bin/env node

/**
 * Game Integration Validation Script
 * Validates tournament system integration with all 10 games
 */

const fs = require('fs');
const path = require('path');

// All 10 games to validate
const ALL_GAMES = [
  'snake-GG',
  'tetris-GG',
  'pacman-GG',
  'mspacman-GG',
  'breakout-GG',
  'asteroids-GG',
  'space-invaders-GG',
  'galaga-GG',
  'pong-GG',
  'fruit-catcher-GG'
];

class GameIntegrationValidator {
  constructor() {
    this.results = {
      gamesFound: [],
      gamesMissing: [],
      integrationConfig: {},
      scoringProfiles: {},
      errors: []
    };
  }

  async validateAll() {
    console.log('🎮 Validating Game Integration for Cross-Game Tournament System');
    console.log('================================================================');

    // Check if all game directories exist
    this.validateGameDirectories();

    // Check integration configuration
    this.validateIntegrationConfig();

    // Check scoring profiles
    this.validateScoringProfiles();

    // Generate report
    this.generateReport();
  }

  validateGameDirectories() {
    console.log('\n📁 Checking Game Directories...');

    ALL_GAMES.forEach(gameId => {
      const gamePath = path.join(__dirname, gameId);
      if (fs.existsSync(gamePath)) {
        this.results.gamesFound.push(gameId);
        console.log(`  ✅ ${gameId} - Directory found`);

        // Check for key files
        const indexPath = path.join(gamePath, 'index.html');
        const scriptPath = path.join(gamePath, 'script.js');

        if (!fs.existsSync(indexPath)) {
          this.results.errors.push(`${gameId}: Missing index.html`);
        }
        if (!fs.existsSync(scriptPath)) {
          this.results.errors.push(`${gameId}: Missing script.js`);
        }
      } else {
        this.results.gamesMissing.push(gameId);
        console.log(`  ❌ ${gameId} - Directory not found`);
      }
    });
  }

  validateIntegrationConfig() {
    console.log('\n🔧 Checking Integration Configuration...');

    try {
      const integrationPath = path.join(__dirname, 'shared-tournament-game-integration.js');
      if (!fs.existsSync(integrationPath)) {
        this.results.errors.push('Integration file not found: shared-tournament-game-integration.js');
        return;
      }

      const integrationContent = fs.readFileSync(integrationPath, 'utf8');

      // Check if each game has configuration
      ALL_GAMES.forEach(gameId => {
        if (integrationContent.includes(`'${gameId}':`)) {
          this.results.integrationConfig[gameId] = 'configured';
          console.log(`  ✅ ${gameId} - Integration config found`);
        } else {
          this.results.integrationConfig[gameId] = 'missing';
          console.log(`  ❌ ${gameId} - Integration config missing`);
          this.results.errors.push(`${gameId}: Missing integration configuration`);
        }
      });
    } catch (error) {
      this.results.errors.push(`Integration config validation failed: ${error.message}`);
    }
  }

  validateScoringProfiles() {
    console.log('\n📊 Checking Scoring Profiles...');

    try {
      const scoringPath = path.join(__dirname, 'shared-tournament-score-aggregator.js');
      if (!fs.existsSync(scoringPath)) {
        this.results.errors.push('Scoring file not found: shared-tournament-score-aggregator.js');
        return;
      }

      const scoringContent = fs.readFileSync(scoringPath, 'utf8');

      // Check if each game has scoring profile
      ALL_GAMES.forEach(gameId => {
        if (scoringContent.includes(`'${gameId}':`)) {
          this.results.scoringProfiles[gameId] = 'configured';
          console.log(`  ✅ ${gameId} - Scoring profile found`);
        } else {
          this.results.scoringProfiles[gameId] = 'missing';
          console.log(`  ❌ ${gameId} - Scoring profile missing`);
          this.results.errors.push(`${gameId}: Missing scoring profile`);
        }
      });
    } catch (error) {
      this.results.errors.push(`Scoring profile validation failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📋 VALIDATION REPORT');
    console.log('====================');

    console.log(`\nGame Directories:`);
    console.log(`  Found: ${this.results.gamesFound.length}/${ALL_GAMES.length}`);
    console.log(`  Missing: ${this.results.gamesMissing.length}`);

    if (this.results.gamesMissing.length > 0) {
      console.log(`  Missing games: ${this.results.gamesMissing.join(', ')}`);
    }

    console.log(`\nIntegration Configuration:`);
    const configuredIntegration = Object.values(this.results.integrationConfig).filter(v => v === 'configured').length;
    console.log(`  Configured: ${configuredIntegration}/${ALL_GAMES.length}`);

    console.log(`\nScoring Profiles:`);
    const configuredScoring = Object.values(this.results.scoringProfiles).filter(v => v === 'configured').length;
    console.log(`  Configured: ${configuredScoring}/${ALL_GAMES.length}`);

    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS FOUND:`);
      this.results.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    const allConfigured = configuredIntegration === ALL_GAMES.length &&
      configuredScoring === ALL_GAMES.length &&
      this.results.errors.length === 0;

    console.log(`\n${allConfigured ? '✅ ALL GAMES READY FOR TOURNAMENT INTEGRATION' : '❌ INTEGRATION INCOMPLETE'}`);

    return allConfigured;
  }
}

// Run validation
const validator = new GameIntegrationValidator();
validator.validateAll().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
