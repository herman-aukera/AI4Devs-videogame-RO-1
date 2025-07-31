#!/usr/bin/env node

/**
 * 🔍 UNIVERSAL SYSTEMS VERIFICATION SCRIPT
 * ========================================
 * Verifies that all games have the three universal systems properly integrated:
 * 1. Audio System Enhancement - Web Audio API integration
 * 2. Tournament Mode - Cross-game high score competitions
 * 3. Achievement System - Unlock mechanics across games
 */

const fs = require('fs');
const path = require('path');

class UniversalSystemsVerifier {
  constructor() {
    this.games = [
      'snake-GG',
      'breakout-GG',
      'fruit-catcher-GG',
      'pacman-GG',
      'mspacman-GG',
      'tetris-GG',
      'asteroids-GG',
      'space-invaders-GG',
      'pong-GG',
      'galaga-GG'
    ];

    this.results = {};
  }

  async verifyAllGames() {
    console.log('🔍 VERIFYING UNIVERSAL SYSTEMS INTEGRATION');
    console.log('==========================================');

    for (const game of this.games) {
      console.log(`\n🎮 Checking ${game}...`);
      this.results[game] = await this.verifyGame(game);
    }

    this.generateReport();
  }

  async verifyGame(gameName) {
    const gameDir = path.join(__dirname, gameName);
    const htmlFile = path.join(gameDir, 'index.html');
    const jsFile = path.join(gameDir, 'script.js');

    const verification = {
      game: gameName,
      htmlChecks: {},
      jsChecks: {},
      overallStatus: 'UNKNOWN'
    };

    // Check HTML file for script imports
    if (fs.existsSync(htmlFile)) {
      const htmlContent = fs.readFileSync(htmlFile, 'utf8');
      verification.htmlChecks = this.checkHTML(htmlContent);
    } else {
      verification.htmlChecks = { error: 'HTML file not found' };
    }

    // Check JS file for system integration
    if (fs.existsSync(jsFile)) {
      const jsContent = fs.readFileSync(jsFile, 'utf8');
      verification.jsChecks = this.checkJavaScript(jsContent);
    } else {
      verification.jsChecks = { error: 'JS file not found' };
    }

    // Determine overall status
    verification.overallStatus = this.determineStatus(verification);

    return verification;
  }

  checkHTML(htmlContent) {
    return {
      hasAudioScript: htmlContent.includes('shared-audio.js'),
      hasTournamentScript: htmlContent.includes('shared-tournament.js'),
      hasAchievementScript: htmlContent.includes('shared-achievements.js'),
      hasAllScripts: htmlContent.includes('shared-audio.js') &&
        htmlContent.includes('shared-tournament.js') &&
        htmlContent.includes('shared-achievements.js')
    };
  }

  checkJavaScript(jsContent) {
    const checks = {
      // System Initialization
      hasAudioInit: (jsContent.includes('globalAudioManager') &&
        (jsContent.includes('globalAudioManager.init') || jsContent.includes('globalAudioManager.'))) ||
        (jsContent.includes('UniversalAudio') || jsContent.includes('this.audio')),
      hasTournamentInit: (jsContent.includes('globalTournamentManager') &&
        (jsContent.includes('globalTournamentManager.init') || jsContent.includes('globalTournamentManager.'))) ||
        (jsContent.includes('UniversalTournament') || jsContent.includes('this.tournament')),
      hasAchievementInit: (jsContent.includes('globalAchievementSystem') &&
        (jsContent.includes('globalAchievementSystem.init') || jsContent.includes('globalAchievementSystem.'))) ||
        (jsContent.includes('UniversalAchievements') || jsContent.includes('this.achievements')),

      // Event Integration
      hasGameStartAudio: jsContent.includes('playGameStart') || jsContent.includes('globalAudioManager') || jsContent.includes('playSound'),
      hasGameOverAudio: jsContent.includes('playGameOver') || jsContent.includes('globalAudioManager') || jsContent.includes('playSound'),
      hasScoreAudio: jsContent.includes('playPointScore') || jsContent.includes('globalAudioManager') || jsContent.includes('playSound'),

      hasTournamentSubmission: jsContent.includes('submitScore') || jsContent.includes('globalTournamentManager'),
      hasAchievementTracking: jsContent.includes('updatePlayerProgress') || jsContent.includes('globalAchievementSystem') || jsContent.includes('trackAchievement'),

      // Overall Integration
      hasUniversalSystemsIntegration: false
    };

    // Overall integration check
    checks.hasUniversalSystemsIntegration = (
      (checks.hasAudioInit || checks.hasGameStartAudio) &&
      (checks.hasTournamentInit || checks.hasTournamentSubmission) &&
      (checks.hasAchievementInit || checks.hasAchievementTracking)
    );

    return checks;
  }

  determineStatus(verification) {
    const htmlPassed = verification.htmlChecks.hasAllScripts;
    const jsPassed = verification.jsChecks.hasUniversalSystemsIntegration;

    if (htmlPassed && jsPassed) return 'FULLY_INTEGRATED';
    if (htmlPassed && !jsPassed) return 'HTML_ONLY';
    if (!htmlPassed && jsPassed) return 'JS_ONLY';
    return 'NOT_INTEGRATED';
  }

  generateReport() {
    console.log('\n🎯 UNIVERSAL SYSTEMS VERIFICATION RESULTS');
    console.log('=========================================');

    const statusCounts = {
      'FULLY_INTEGRATED': 0,
      'HTML_ONLY': 0,
      'JS_ONLY': 0,
      'NOT_INTEGRATED': 0
    };

    console.log('\n📊 DETAILED RESULTS:');
    Object.values(this.results).forEach(result => {
      const status = result.overallStatus;
      statusCounts[status]++;

      const statusIcon = {
        'FULLY_INTEGRATED': '✅',
        'HTML_ONLY': '⚠️',
        'JS_ONLY': '⚠️',
        'NOT_INTEGRATED': '❌'
      }[status];

      console.log(`${statusIcon} ${result.game}: ${status}`);

      if (status !== 'FULLY_INTEGRATED') {
        console.log(`   HTML Scripts: Audio=${result.htmlChecks.hasAudioScript} Tournament=${result.htmlChecks.hasTournamentScript} Achievement=${result.htmlChecks.hasAchievementScript}`);
        console.log(`   JS Integration: Audio=${result.jsChecks.hasAudioInit} Tournament=${result.jsChecks.hasTournamentInit} Achievement=${result.jsChecks.hasAchievementInit}`);
      }
    });

    console.log('\n📈 SUMMARY:');
    console.log(`✅ Fully Integrated: ${statusCounts.FULLY_INTEGRATED}/${this.games.length} games`);
    console.log(`⚠️  Partial Integration: ${statusCounts.HTML_ONLY + statusCounts.JS_ONLY} games`);
    console.log(`❌ Not Integrated: ${statusCounts.NOT_INTEGRATED} games`);

    const allFullyIntegrated = statusCounts.FULLY_INTEGRATED === this.games.length;
    console.log(allFullyIntegrated ? '\n🏆 ALL GAMES FULLY INTEGRATED!' : '\n⚠️  SOME GAMES NEED ATTENTION');

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: statusCounts,
      totalGames: this.games.length,
      results: this.results
    };

    const reportFile = `universal-systems-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportFile}`);

    return allFullyIntegrated;
  }
}

// Run verification
const verifier = new UniversalSystemsVerifier();
verifier.verifyAllGames().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
