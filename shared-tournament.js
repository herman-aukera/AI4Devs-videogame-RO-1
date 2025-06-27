/* © GG, MIT License */

/**
 * Tournament Mode System for AI4Devs Retro Games
 * 
 * Cross-game competition system featuring:
 * - Global leaderboards across all games
 * - Tournament scheduling and scoring
 * - Achievement tracking
 * - Player progression system
 * - Real-time competition status
 */

class TournamentManager {
  constructor() {
    this.storageKey = 'ai4devs-tournament-data';
    this.currentTournament = null;
    this.playerStats = this.loadPlayerStats();
    this.leaderboards = this.loadLeaderboards();
    
    // Game registry with scoring weights
    this.gameRegistry = {
      'snake': { name: '🐍 Snake', weight: 1.0, category: 'classic' },
      'breakout': { name: '🧱 Breakout', weight: 1.2, category: 'action' },
      'tetris': { name: '🧩 Tetris', weight: 1.5, category: 'puzzle' },
      'pacman': { name: '🟡 Pac-Man', weight: 1.3, category: 'maze' },
      'asteroids': { name: '🚀 Asteroids', weight: 1.4, category: 'space' },
      'space-invaders': { name: '👾 Space Invaders', weight: 1.3, category: 'space' },
      'pong': { name: '🏓 Pong', weight: 0.8, category: 'sports' },
      'fruit-catcher': { name: '🍎 Fruit Catcher', weight: 1.1, category: 'action' },
      'mspacman': { name: '🟣 Ms. Pac-Man', weight: 1.3, category: 'maze' }
    };
    
    this.initializeTournament();
  }
  
  initializeTournament() {
    // Check for active tournament
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      this.currentTournament = data.currentTournament;
      this.playerStats = data.playerStats || {};
      this.leaderboards = data.leaderboards || {};
    }
    
    // Auto-start weekly tournament if none active
    if (!this.currentTournament || this.isTournamentExpired()) {
      this.startWeeklyTournament();
    }
    
    console.log('🏆 Tournament Mode initialized');
  }
  
  // ===== TOURNAMENT MANAGEMENT =====
  
  startWeeklyTournament() {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    this.currentTournament = {
      id: `tournament-${Date.now()}`,
      name: 'Weekly Championship',
      type: 'weekly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      participants: {},
      gameRotation: this.generateGameRotation(),
      prizes: {
        first: '🥇 Grand Champion',
        second: '🥈 Master Player', 
        third: '🥉 Elite Gamer'
      }
    };
    
    this.saveTournamentData();
    this.showTournamentNotification('🏆 New Weekly Tournament Started!');
  }
  
  generateGameRotation() {
    // Select 5 games for weekly rotation
    const games = Object.keys(this.gameRegistry);
    const rotation = [];
    
    // Ensure variety by including one from each category
    const categories = ['classic', 'action', 'puzzle', 'maze', 'space'];
    categories.forEach(category => {
      const categoryGames = games.filter(g => this.gameRegistry[g].category === category);
      if (categoryGames.length > 0) {
        rotation.push(categoryGames[Math.floor(Math.random() * categoryGames.length)]);
      }
    });
    
    // Fill remaining slots randomly
    while (rotation.length < 5) {
      const randomGame = games[Math.floor(Math.random() * games.length)];
      if (!rotation.includes(randomGame)) {
        rotation.push(randomGame);
      }
    }
    
    return rotation;
  }
  
  isTournamentExpired() {
    if (!this.currentTournament) return true;
    return new Date() > new Date(this.currentTournament.endDate);
  }
  
  // ===== SCORE SUBMISSION =====
  
  submitScore(gameId, score, level = 1, additionalData = {}) {
    if (!this.currentTournament || this.isTournamentExpired()) {
      console.warn('🏆 No active tournament for score submission');
      return false;
    }
    
    const playerId = this.getPlayerId();
    const gameConfig = this.gameRegistry[gameId];
    
    if (!gameConfig) {
      console.error('🏆 Unknown game:', gameId);
      return false;
    }
    
    // Calculate tournament points
    const tournamentPoints = this.calculateTournamentPoints(score, level, gameConfig.weight);
    
    // Update tournament participation
    if (!this.currentTournament.participants[playerId]) {
      this.currentTournament.participants[playerId] = {
        totalPoints: 0,
        gamesPlayed: {},
        joinDate: new Date().toISOString()
      };
    }
    
    const participant = this.currentTournament.participants[playerId];
    
    // Update best score for this game
    if (!participant.gamesPlayed[gameId] || tournamentPoints > participant.gamesPlayed[gameId].points) {
      const oldPoints = participant.gamesPlayed[gameId]?.points || 0;
      participant.gamesPlayed[gameId] = {
        score,
        level,
        points: tournamentPoints,
        timestamp: new Date().toISOString(),
        ...additionalData
      };
      
      // Update total points
      participant.totalPoints += (tournamentPoints - oldPoints);
    }
    
    // Update global leaderboards
    this.updateLeaderboards(gameId, playerId, score, level);
    
    // Update player statistics
    this.updatePlayerStats(playerId, gameId, score, level);
    
    this.saveTournamentData();
    
    // Show achievement if significant
    this.checkAchievements(playerId, gameId, score, level);
    
    return true;
  }
  
  calculateTournamentPoints(score, level, weight) {
    // Base points = score + (level bonus)
    const levelBonus = Math.pow(level, 1.5) * 100;
    const basePoints = score + levelBonus;
    
    // Apply game weight
    return Math.round(basePoints * weight);
  }
  
  // ===== LEADERBOARDS =====
  
  updateLeaderboards(gameId, playerId, score, level) {
    if (!this.leaderboards[gameId]) {
      this.leaderboards[gameId] = {
        allTime: [],
        weekly: [],
        monthly: []
      };
    }
    
    const entry = {
      playerId,
      score,
      level,
      timestamp: new Date().toISOString()
    };
    
    // Update all-time leaderboard
    this.insertLeaderboardEntry(this.leaderboards[gameId].allTime, entry);
    
    // Update weekly leaderboard (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.leaderboards[gameId].weekly = this.leaderboards[gameId].weekly
      .filter(e => new Date(e.timestamp) > weekAgo);
    this.insertLeaderboardEntry(this.leaderboards[gameId].weekly, entry);
    
    // Update monthly leaderboard (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.leaderboards[gameId].monthly = this.leaderboards[gameId].monthly
      .filter(e => new Date(e.timestamp) > monthAgo);
    this.insertLeaderboardEntry(this.leaderboards[gameId].monthly, entry);
  }
  
  insertLeaderboardEntry(leaderboard, entry) {
    // Remove existing entry from same player
    const existingIndex = leaderboard.findIndex(e => e.playerId === entry.playerId);
    if (existingIndex >= 0 && leaderboard[existingIndex].score < entry.score) {
      leaderboard.splice(existingIndex, 1);
    } else if (existingIndex >= 0) {
      return; // Existing score is better
    }
    
    // Insert new entry in correct position
    let inserted = false;
    for (let i = 0; i < leaderboard.length; i++) {
      if (entry.score > leaderboard[i].score) {
        leaderboard.splice(i, 0, entry);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      leaderboard.push(entry);
    }
    
    // Keep only top 10
    if (leaderboard.length > 10) {
      leaderboard.splice(10);
    }
  }
  
  // ===== TOURNAMENT DISPLAY =====
  
  getTournamentStatus() {
    if (!this.currentTournament) return null;
    
    const timeLeft = new Date(this.currentTournament.endDate) - new Date();
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
    
    return {
      ...this.currentTournament,
      timeLeft: timeLeft > 0 ? timeLeft : 0,
      daysLeft: Math.max(0, daysLeft),
      topPlayers: this.getTournamentLeaderboard()
    };
  }
  
  getTournamentLeaderboard() {
    if (!this.currentTournament) return [];
    
    return Object.entries(this.currentTournament.participants)
      .map(([playerId, data]) => ({
        playerId,
        totalPoints: data.totalPoints,
        gamesPlayed: Object.keys(data.gamesPlayed).length
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }
  
  showTournamentNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, var(--primary-cyan, #00ffff), var(--primary-magenta, #ff00ff));
      color: var(--bg-primary, #000);
      padding: 20px 30px;
      border-radius: 10px;
      font-family: monospace;
      font-weight: bold;
      font-size: 1.2em;
      z-index: 10000;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      animation: tournamentPulse 3s ease-in-out;
    `;
    
    // Add animation if not present
    if (!document.querySelector('#tournament-notification-style')) {
      const style = document.createElement('style');
      style.id = 'tournament-notification-style';
      style.textContent = `
        @keyframes tournamentPulse {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
  
  // ===== UTILITY METHODS =====
  
  getPlayerId() {
    let playerId = localStorage.getItem('ai4devs-player-id');
    if (!playerId) {
      playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ai4devs-player-id', playerId);
    }
    return playerId;
  }
  
  updatePlayerStats(playerId, gameId, score, level) {
    if (!this.playerStats[playerId]) {
      this.playerStats[playerId] = {
        totalGames: 0,
        totalScore: 0,
        favoriteGame: null,
        achievements: [],
        joinDate: new Date().toISOString()
      };
    }
    
    const stats = this.playerStats[playerId];
    stats.totalGames++;
    stats.totalScore += score;
    
    // Track game-specific stats
    if (!stats[gameId]) {
      stats[gameId] = { played: 0, bestScore: 0, bestLevel: 0 };
    }
    
    stats[gameId].played++;
    stats[gameId].bestScore = Math.max(stats[gameId].bestScore, score);
    stats[gameId].bestLevel = Math.max(stats[gameId].bestLevel, level);
    
    // Update favorite game
    const gameStats = Object.keys(this.gameRegistry).map(id => ({
      id,
      played: stats[id]?.played || 0
    }));
    stats.favoriteGame = gameStats.reduce((prev, curr) => 
      prev.played > curr.played ? prev : curr
    ).id;
  }
  
  checkAchievements(playerId, gameId, score, level) {
    // Achievement system (simplified)
    const achievements = [];
    
    if (score >= 1000) achievements.push('🏆 High Scorer');
    if (level >= 10) achievements.push('🎯 Level Master');
    if (this.playerStats[playerId]?.totalGames >= 50) achievements.push('🎮 Game Veteran');
    
    // Add new achievements
    achievements.forEach(achievement => {
      if (!this.playerStats[playerId].achievements.includes(achievement)) {
        this.playerStats[playerId].achievements.push(achievement);
        this.showAchievementNotification(achievement);
      }
    });
  }
  
  showAchievementNotification(achievement) {
    console.log('🏆 Achievement unlocked:', achievement);
    // Visual notification implementation similar to tournament notifications
  }
  
  loadPlayerStats() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved).playerStats || {} : {};
  }
  
  loadLeaderboards() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved).leaderboards || {} : {};
  }
  
  saveTournamentData() {
    const data = {
      currentTournament: this.currentTournament,
      playerStats: this.playerStats,
      leaderboards: this.leaderboards,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  // ===== PUBLIC API =====
  
  getGameLeaderboard(gameId, period = 'allTime') {
    return this.leaderboards[gameId]?.[period] || [];
  }
  
  getPlayerRank(playerId, gameId, period = 'allTime') {
    const leaderboard = this.getGameLeaderboard(gameId, period);
    const index = leaderboard.findIndex(entry => entry.playerId === playerId);
    return index >= 0 ? index + 1 : null;
  }
  
  getPlayerStats(playerId = null) {
    const id = playerId || this.getPlayerId();
    return this.playerStats[id] || null;
  }
}

// ===== TOURNAMENT UI COMPONENT =====

class TournamentUI {
  constructor(tournamentManager) {
    this.tournament = tournamentManager;
    this.isVisible = false;
  }
  
  createTournamentDisplay() {
    const status = this.tournament.getTournamentStatus();
    if (!status) return null;
    
    const container = document.createElement('div');
    container.id = 'tournament-display';
    container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid var(--primary-cyan, #00ffff);
      border-radius: 10px;
      padding: 15px;
      color: white;
      font-family: monospace;
      font-size: 0.9em;
      z-index: 1000;
      min-width: 250px;
      max-width: 300px;
    `;
    
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 10px;">
        <strong>🏆 ${status.name}</strong>
      </div>
      <div style="margin-bottom: 10px;">
        ⏰ ${status.daysLeft} days left
      </div>
      <div style="margin-bottom: 10px;">
        <strong>🎮 Featured Games:</strong><br>
        ${status.gameRotation.map(id => this.tournament.gameRegistry[id].name).join('<br>')}
      </div>
      <div>
        <strong>🥇 Top Players:</strong><br>
        ${status.topPlayers.slice(0, 3).map((player, i) => 
          `${['🥇', '🥈', '🥉'][i]} ${player.totalPoints} pts`
        ).join('<br>')}
      </div>
    `;
    
    return container;
  }
  
  showTournamentOverlay() {
    if (this.isVisible) return;
    
    const display = this.createTournamentDisplay();
    if (display) {
      document.body.appendChild(display);
      this.isVisible = true;
      
      // Auto-hide after 10 seconds
      setTimeout(() => this.hideTournamentOverlay(), 10000);
    }
  }
  
  hideTournamentOverlay() {
    const display = document.getElementById('tournament-display');
    if (display) {
      document.body.removeChild(display);
      this.isVisible = false;
    }
  }
  
  toggleTournamentOverlay() {
    if (this.isVisible) {
      this.hideTournamentOverlay();
    } else {
      this.showTournamentOverlay();
    }
  }
}

// Create global instances
if (typeof window !== 'undefined' && !window.globalTournamentManager) {
  window.globalTournamentManager = new TournamentManager();
  window.globalTournamentUI = new TournamentUI(window.globalTournamentManager);
  
  // Add tournament toggle (T key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'T' || e.key === 't') {
      window.globalTournamentUI.toggleTournamentOverlay();
      e.preventDefault();
    }
  });
  
  // Show tournament notification on page load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.globalTournamentManager.currentTournament) {
        window.globalTournamentUI.showTournamentOverlay();
      }
    }, 2000);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentManager, TournamentUI };
}
