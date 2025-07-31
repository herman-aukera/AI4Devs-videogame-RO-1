/* © GG, MIT License */

/**
 * Achievement System for AI4Devs Retro Games
 *
 * Cross-game achievement tracking featuring:
 * - Progressive unlocks across all games
 * - Skill-based achievements
 * - Collection achievements
 * - Social achievements
 * - Special event achievements
 */

class AchievementSystem {
  constructor() {
    this.storageKey = 'ai4devs-achievements';
    this.playerAchievements = this.loadAchievements();
    this.achievementDefinitions = this.initializeAchievements();
    this.notificationQueue = [];

    console.log('🏅 Achievement System initialized');
  }

  initializeAchievements() {
    return {
      // ===== SCORE ACHIEVEMENTS =====
      'first-steps': {
        id: 'first-steps',
        name: '🎮 First Steps',
        description: 'Play your first game',
        category: 'milestone',
        condition: (data) => data.gamesPlayed >= 1,
        points: 10
      },

      'score-hunter': {
        id: 'score-hunter',
        name: '🎯 Score Hunter',
        description: 'Reach 1,000 points in any game',
        category: 'score',
        condition: (data) => data.bestScore >= 1000,
        points: 25
      },

      'high-roller': {
        id: 'high-roller',
        name: '💎 High Roller',
        description: 'Reach 5,000 points in any game',
        category: 'score',
        condition: (data) => data.bestScore >= 5000,
        points: 50
      },

      'legendary': {
        id: 'legendary',
        name: '👑 Legendary',
        description: 'Reach 10,000 points in any game',
        category: 'score',
        condition: (data) => data.bestScore >= 10000,
        points: 100
      },

      // ===== GAME-SPECIFIC ACHIEVEMENTS =====
      'snake-master': {
        id: 'snake-master',
        name: '🐍 Snake Master',
        description: 'Reach level 10 in Snake',
        category: 'mastery',
        gameSpecific: 'snake',
        condition: (data) => data.gameStats?.snake?.bestLevel >= 10,
        points: 30
      },

      'brick-breaker': {
        id: 'brick-breaker',
        name: '🧱 Brick Breaker',
        description: 'Complete 5 levels in Breakout',
        category: 'mastery',
        gameSpecific: 'breakout',
        condition: (data) => data.gameStats?.breakout?.bestLevel >= 5,
        points: 30
      },

      'ghost-hunter': {
        id: 'ghost-hunter',
        name: '👻 Ghost Hunter',
        description: 'Score 2,000 points in Pac-Man',
        category: 'mastery',
        gameSpecific: 'pacman',
        condition: (data) => data.gameStats?.pacman?.bestScore >= 2000,
        points: 40
      },

      'space-ace': {
        id: 'space-ace',
        name: '🚀 Space Ace',
        description: 'Score 3,000 points in Asteroids or Space Invaders',
        category: 'mastery',
        gameSpecific: ['asteroids', 'space-invaders'],
        condition: (data) => {
          const asteroids = data.gameStats?.asteroids?.bestScore || 0;
          const spaceInvaders = data.gameStats?.['space-invaders']?.bestScore || 0;
          return Math.max(asteroids, spaceInvaders) >= 3000;
        },
        points: 35
      },

      'puzzle-solver': {
        id: 'puzzle-solver',
        name: '🧩 Puzzle Solver',
        description: 'Clear 100 lines in Tetris',
        category: 'mastery',
        gameSpecific: 'tetris',
        condition: (data) => data.gameStats?.tetris?.linesCleared >= 100,
        points: 40
      },

      // ===== COLLECTION ACHIEVEMENTS =====
      'game-explorer': {
        id: 'game-explorer',
        name: '🗺️ Game Explorer',
        description: 'Play at least 3 different games',
        category: 'collection',
        condition: (data) => {
          const gamesPlayed = Object.keys(data.gameStats || {}).length;
          return gamesPlayed >= 3;
        },
        points: 20
      },

      'completionist': {
        id: 'completionist',
        name: '🎖️ Completionist',
        description: 'Play all available games',
        category: 'collection',
        condition: (data) => {
          const gamesPlayed = Object.keys(data.gameStats || {}).length;
          return gamesPlayed >= 8; // Update based on total games
        },
        points: 75
      },

      'arcade-veteran': {
        id: 'arcade-veteran',
        name: '🕹️ Arcade Veteran',
        description: 'Play 50 total games',
        category: 'dedication',
        condition: (data) => data.totalGames >= 50,
        points: 50
      },

      'gaming-marathon': {
        id: 'gaming-marathon',
        name: '⏰ Gaming Marathon',
        description: 'Play 100 total games',
        category: 'dedication',
        condition: (data) => data.totalGames >= 100,
        points: 100
      },

      // ===== SKILL ACHIEVEMENTS =====
      'multitasker': {
        id: 'multitasker',
        name: '🤹 Multitasker',
        description: 'Score over 1,000 points in 3 different games',
        category: 'skill',
        condition: (data) => {
          const gameStats = data.gameStats || {};
          const goodScores = Object.values(gameStats).filter(stats => stats.bestScore >= 1000);
          return goodScores.length >= 3;
        },
        points: 60
      },

      'consistent-player': {
        id: 'consistent-player',
        name: '📈 Consistent Player',
        description: 'Play for 7 consecutive days',
        category: 'dedication',
        condition: (data) => data.playStreak >= 7,
        points: 40
      },

      'perfectionist': {
        id: 'perfectionist',
        name: '✨ Perfectionist',
        description: 'Achieve personal best in 5 different games',
        category: 'skill',
        condition: (data) => {
          const gameStats = data.gameStats || {};
          return Object.keys(gameStats).length >= 5;
        },
        points: 80
      },

      // ===== SPECIAL ACHIEVEMENTS =====
      'early-adopter': {
        id: 'early-adopter',
        name: '🌟 Early Adopter',
        description: 'One of the first 100 players',
        category: 'special',
        condition: (data) => data.playerId && parseInt(data.playerId.split('-')[1]) < Date.now() - 30 * 24 * 60 * 60 * 1000,
        points: 25
      },

      'tournament-participant': {
        id: 'tournament-participant',
        name: '🏆 Tournament Participant',
        description: 'Participate in a tournament',
        category: 'tournament',
        condition: (data) => data.tournamentsJoined >= 1,
        points: 30
      },

      'tournament-winner': {
        id: 'tournament-winner',
        name: '🥇 Tournament Champion',
        description: 'Win a tournament',
        category: 'tournament',
        condition: (data) => data.tournamentsWon >= 1,
        points: 150
      }
    };
  }

  // ===== ACHIEVEMENT CHECKING =====

  checkAchievements(playerData) {
    const newAchievements = [];

    Object.values(this.achievementDefinitions).forEach(achievement => {
      // Skip if already unlocked
      if (this.playerAchievements.includes(achievement.id)) return;

      // Check condition
      if (achievement.condition(playerData)) {
        this.unlockAchievement(achievement.id);
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  unlockAchievement(achievementId) {
    if (this.playerAchievements.includes(achievementId)) return;

    this.playerAchievements.push(achievementId);
    this.saveAchievements();

    const achievement = this.achievementDefinitions[achievementId];
    if (achievement) {
      this.showAchievementNotification(achievement);
      console.log('🏅 Achievement unlocked:', achievement.name);
    }
  }

  // ===== PLAYER DATA INTEGRATION =====

  updatePlayerProgress(gameId, score, level, additionalData = {}) {
    // Get current player data
    const playerId = this.getPlayerId();
    const playerData = this.getPlayerData(playerId);

    // Update game statistics
    if (!playerData.gameStats) playerData.gameStats = {};
    if (!playerData.gameStats[gameId]) {
      playerData.gameStats[gameId] = {
        played: 0,
        bestScore: 0,
        bestLevel: 0,
        totalScore: 0
      };
    }

    const gameStats = playerData.gameStats[gameId];
    gameStats.played++;
    gameStats.bestScore = Math.max(gameStats.bestScore, score);
    gameStats.bestLevel = Math.max(gameStats.bestLevel, level);
    gameStats.totalScore += score;

    // Update global statistics
    playerData.totalGames = (playerData.totalGames || 0) + 1;
    playerData.bestScore = Math.max(playerData.bestScore || 0, score);
    playerData.lastPlayed = new Date().toISOString();

    // Add additional data
    Object.assign(gameStats, additionalData);

    // Update play streak
    this.updatePlayStreak(playerData);

    // Save updated data
    this.savePlayerData(playerId, playerData);

    // Check for new achievements
    const newAchievements = this.checkAchievements(playerData);

    return newAchievements;
  }

  updatePlayStreak(playerData) {
    const today = new Date().toDateString();
    const lastPlayed = playerData.lastPlayed ? new Date(playerData.lastPlayed).toDateString() : null;

    if (lastPlayed !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (lastPlayed === yesterday) {
        playerData.playStreak = (playerData.playStreak || 0) + 1;
      } else {
        playerData.playStreak = 1;
      }
    }
  }

  // ===== ACHIEVEMENT DISPLAY =====

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #000;
      padding: 15px 20px;
      border-radius: 10px;
      font-family: monospace;
      font-weight: bold;
      z-index: 10001;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      animation: achievementSlide 4s ease-in-out;
      max-width: 300px;
    `;

    notification.innerHTML = `
      <div style="font-size: 1.2em; margin-bottom: 5px;">
        🏅 Achievement Unlocked!
      </div>
      <div style="font-size: 1.1em; margin-bottom: 3px;">
        ${achievement.name}
      </div>
      <div style="font-size: 0.9em; opacity: 0.8;">
        ${achievement.description}
      </div>
      <div style="font-size: 0.8em; margin-top: 5px;">
        +${achievement.points} points
      </div>
    `;

    // Add animation if not present
    if (!document.querySelector('#achievement-notification-style')) {
      const style = document.createElement('style');
      style.id = 'achievement-notification-style';
      style.textContent = `
        @keyframes achievementSlide {
          0% { opacity: 0; transform: translateX(100%); }
          10%, 90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-100%); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);

    // Play achievement sound
    if (window.globalAudioManager) {
      window.globalAudioManager.playPowerUp();
    }
  }

  // ===== ACHIEVEMENT BROWSER =====

  createAchievementBrowser() {
    const browser = document.createElement('div');
    browser.id = 'achievement-browser';
    browser.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid var(--primary-cyan, #00ffff);
      border-radius: 15px;
      padding: 20px;
      color: white;
      font-family: monospace;
      z-index: 10000;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const totalPoints = this.getTotalAchievementPoints();
    const unlockedCount = this.playerAchievements.length;
    const totalCount = Object.keys(this.achievementDefinitions).length;

    browser.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>🏅 Achievement Gallery</h2>
        <p>${unlockedCount}/${totalCount} Unlocked • ${totalPoints} Points</p>
      </div>
      <div style="display: grid; gap: 15px;">
        ${this.renderAchievementList()}
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="document.body.removeChild(this.parentElement)"
                style="background: var(--primary-cyan, #00ffff); color: black; border: none; padding: 10px 20px; border-radius: 5px; font-family: monospace; cursor: pointer;">
          Close
        </button>
      </div>
    `;

    return browser;
  }

  renderAchievementList() {
    const categories = ['milestone', 'score', 'mastery', 'collection', 'skill', 'dedication', 'tournament', 'special'];

    return categories.map(category => {
      const categoryAchievements = Object.values(this.achievementDefinitions)
        .filter(a => a.category === category);

      if (categoryAchievements.length === 0) return '';

      return `
        <div style="margin-bottom: 15px;">
          <h3 style="color: var(--primary-cyan, #00ffff); margin-bottom: 10px;">
            ${category.charAt(0).toUpperCase() + category.slice(1)} Achievements
          </h3>
          ${categoryAchievements.map(achievement => this.renderAchievement(achievement)).join('')}
        </div>
      `;
    }).join('');
  }

  renderAchievement(achievement) {
    const isUnlocked = this.playerAchievements.includes(achievement.id);
    const opacity = isUnlocked ? '1' : '0.3';
    const lockIcon = isUnlocked ? '🔓' : '🔒';

    return `
      <div style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; opacity: ${opacity};">
        <div style="font-size: 1.5em; margin-right: 15px;">${lockIcon}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 3px;">${achievement.name}</div>
          <div style="font-size: 0.9em; opacity: 0.8;">${achievement.description}</div>
          <div style="font-size: 0.8em; color: var(--primary-yellow, #ffff00);">+${achievement.points} points</div>
        </div>
      </div>
    `;
  }

  showAchievementBrowser() {
    // Remove existing browser
    const existing = document.getElementById('achievement-browser');
    if (existing) {
      document.body.removeChild(existing);
      return;
    }

    const browser = this.createAchievementBrowser();
    document.body.appendChild(browser);
  }

  // ===== UTILITY METHODS =====

  getTotalAchievementPoints() {
    return this.playerAchievements.reduce((total, achievementId) => {
      const achievement = this.achievementDefinitions[achievementId];
      return total + (achievement ? achievement.points : 0);
    }, 0);
  }

  getPlayerData(playerId) {
    const key = `ai4devs-player-data-${playerId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { playerId };
  }

  savePlayerData(playerId, data) {
    const key = `ai4devs-player-data-${playerId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getPlayerId() {
    let playerId = localStorage.getItem('ai4devs-player-id');
    if (!playerId) {
      playerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('ai4devs-player-id', playerId);
    }
    return playerId;
  }

  loadAchievements() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  saveAchievements() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.playerAchievements));
  }

  // ===== PUBLIC API =====

  getPlayerAchievements() {
    return this.playerAchievements.map(id => this.achievementDefinitions[id]).filter(Boolean);
  }

  getAchievementProgress() {
    const unlocked = this.playerAchievements.length;
    const total = Object.keys(this.achievementDefinitions).length;
    const points = this.getTotalAchievementPoints();

    return { unlocked, total, points, percentage: Math.round((unlocked / total) * 100) };
  }
}

// Create global instance
if (typeof window !== 'undefined' && !window.globalAchievementSystem) {
  window.globalAchievementSystem = new AchievementSystem();

  // Add achievement browser toggle (A key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'A' || e.key === 'a') {
      window.globalAchievementSystem.showAchievementBrowser();
      e.preventDefault();
    }
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AchievementSystem;
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.UniversalAchievements = new AchievementSystem();
}
