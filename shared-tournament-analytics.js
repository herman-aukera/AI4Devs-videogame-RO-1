/**
 * Cross-Game Tournament System - Performance Analytics and Statistics
 *
 * This module implements comprehensive analytics and statistics for tournament data,
 * including win rates, average scores, improvement trends, visual charts with retro
 * aesthetic, comparative analytics across games, and performance insights.
 *
 * Features:
 * - Calculate win rates, average scores, and improvement trends
 * - Create visual charts and graphs with retro aesthetic
 * - Implement comparative analytics across different games
 * - Add tournament performance insights and recommendations
 */

/**
 * Tournament Analytics Manager Class
 * Handles all analytics calculations and visualizations
 */
class TournamentAnalyticsManager {
  constructor(historyManager) {
    this.historyManager = historyManager;

    // Analytics cache for performance
    this.analyticsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Chart configuration
    this.chartConfig = {
      colors: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        success: '#00ff00',
        warning: '#ffff00',
        danger: '#ff0000'
      },
      fonts: {
        family: 'Courier New, monospace',
        size: 12
      }
    };

    console.log('📊 TournamentAnalyticsManager initialized');
  }

  // ============================================================================
  // PLAYER PERFORMANCE ANALYTICS
  // ============================================================================

  /**
   * Calculate comprehensive player statistics
   * @param {string} playerId - Player identifier
   * @returns {Object} Player statistics
   */
  calculatePlayerStats(playerId) {
    const cacheKey = `player-stats-${playerId}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const tournaments = this.historyManager.getTournamentHistory();
      const playerTournaments = tournaments.filter(t =>
        t.participants.some(p => p.id === playerId)
      );

      if (playerTournaments.length === 0) {
        return { error: 'No tournament data found for player' };
      }

      const stats = {
        playerId,
        totalTournaments: playerTournaments.length,
        wins: 0,
        podiumFinishes: 0, // Top 3 finishes
        averageRank: 0,
        averageScore: 0,
        bestRank: Infinity,
        worstRank: 0,
        winRate: 0,
        podiumRate: 0,
        gameStats: {},
        improvementTrend: this.calculateImprovementTrend(playerId, playerTournaments),
        recentPerformance: this.calculateRecentPerformance(playerId, playerTournaments),
        strongestGames: [],
        weakestGames: [],
        recommendations: []
      };

      let totalRank = 0;
      let totalScore = 0;
      const gamePerformance = {};

      playerTournaments.forEach(tournament => {
        const participant = tournament.participants.find(p => p.id === playerId);
        if (!participant) return;

        // Basic stats
        if (participant.rank === 1) stats.wins++;
        if (participant.rank <= 3) stats.podiumFinishes++;

        totalRank += participant.rank;
        totalScore += participant.totalScore;

        stats.bestRank = Math.min(stats.bestRank, participant.rank);
        stats.worstRank = Math.max(stats.worstRank, participant.rank);

        // Game-specific performance
        tournament.games.forEach(gameId => {
          if (!gamePerformance[gameId]) {
            gamePerformance[gameId] = {
              tournaments: 0,
              totalScore: 0,
              totalRank: 0,
              wins: 0,
              podiums: 0
            };
          }

          gamePerformance[gameId].tournaments++;
          gamePerformance[gameId].totalScore += participant.scores[gameId] || 0;
          gamePerformance[gameId].totalRank += participant.rank;

          if (participant.rank === 1) gamePerformance[gameId].wins++;
          if (participant.rank <= 3) gamePerformance[gameId].podiums++;
        });
      });

      // Calculate averages and rates
      stats.averageRank = totalRank / playerTournaments.length;
      stats.averageScore = totalScore / playerTournaments.length;
      stats.winRate = (stats.wins / playerTournaments.length) * 100;
      stats.podiumRate = (stats.podiumFinishes / playerTournaments.length) * 100;

      // Process game statistics
      Object.entries(gamePerformance).forEach(([gameId, perf]) => {
        stats.gameStats[gameId] = {
          tournaments: perf.tournaments,
          averageScore: perf.totalScore / perf.tournaments,
          averageRank: perf.totalRank / perf.tournaments,
          winRate: (perf.wins / perf.tournaments) * 100,
          podiumRate: (perf.podiums / perf.tournaments) * 100
        };
      });

      // Identify strongest and weakest games
      const gameRankings = Object.entries(stats.gameStats)
        .map(([gameId, stats]) => ({ gameId, ...stats }))
        .sort((a, b) => a.averageRank - b.averageRank);

      stats.strongestGames = gameRankings.slice(0, 3);
      stats.weakestGames = gameRankings.slice(-3).reverse();

      // Generate recommendations
      stats.recommendations = this.generatePlayerRecommendations(stats);

      this.setCachedResult(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('Error calculating player stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate improvement trend for a player
   * @param {string} playerId - Player identifier
   * @param {Array} tournaments - Player's tournaments
   * @returns {Object} Improvement trend data
   */
  calculateImprovementTrend(playerId, tournaments) {
    if (tournaments.length < 2) {
      return { trend: 'insufficient-data', message: 'Need at least 2 tournaments for trend analysis' };
    }

    // Sort tournaments by date
    const sortedTournaments = tournaments
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map(t => {
        const participant = t.participants.find(p => p.id === playerId);
        return {
          date: t.startDate,
          rank: participant.rank,
          score: participant.totalScore,
          tournamentName: t.name
        };
      });

    // Calculate trend using linear regression on ranks (lower is better)
    const n = sortedTournaments.length;
    const xSum = sortedTournaments.reduce((sum, _, i) => sum + i, 0);
    const ySum = sortedTournaments.reduce((sum, t) => sum + t.rank, 0);
    const xySum = sortedTournaments.reduce((sum, t, i) => sum + (i * t.rank), 0);
    const x2Sum = sortedTournaments.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);

    let trend, trendStrength;
    if (slope < -0.1) {
      trend = 'improving';
      trendStrength = Math.abs(slope);
    } else if (slope > 0.1) {
      trend = 'declining';
      trendStrength = slope;
    } else {
      trend = 'stable';
      trendStrength = 0;
    }

    return {
      trend,
      trendStrength,
      slope,
      dataPoints: sortedTournaments,
      recentImprovement: this.calculateRecentImprovement(sortedTournaments)
    };
  }

  /**
   * Calculate recent performance (last 5 tournaments)
   * @param {string} playerId - Player identifier
   * @param {Array} tournaments - Player's tournaments
   * @returns {Object} Recent performance data
   */
  calculateRecentPerformance(playerId, tournaments) {
    const recentTournaments = tournaments
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5);

    if (recentTournaments.length === 0) {
      return { error: 'No recent tournaments found' };
    }

    const recentStats = {
      tournaments: recentTournaments.length,
      averageRank: 0,
      averageScore: 0,
      wins: 0,
      podiums: 0,
      winRate: 0,
      podiumRate: 0,
      bestPerformance: null,
      worstPerformance: null
    };

    let totalRank = 0;
    let totalScore = 0;
    let bestRank = Infinity;
    let worstRank = 0;

    recentTournaments.forEach(tournament => {
      const participant = tournament.participants.find(p => p.id === playerId);
      if (!participant) return;

      totalRank += participant.rank;
      totalScore += participant.totalScore;

      if (participant.rank === 1) recentStats.wins++;
      if (participant.rank <= 3) recentStats.podiums++;

      if (participant.rank < bestRank) {
        bestRank = participant.rank;
        recentStats.bestPerformance = {
          tournament: tournament.name,
          rank: participant.rank,
          score: participant.totalScore,
          date: tournament.startDate
        };
      }

      if (participant.rank > worstRank) {
        worstRank = participant.rank;
        recentStats.worstPerformance = {
          tournament: tournament.name,
          rank: participant.rank,
          score: participant.totalScore,
          date: tournament.startDate
        };
      }
    });

    recentStats.averageRank = totalRank / recentTournaments.length;
    recentStats.averageScore = totalScore / recentTournaments.length;
    recentStats.winRate = (recentStats.wins / recentTournaments.length) * 100;
    recentStats.podiumRate = (recentStats.podiums / recentTournaments.length) * 100;

    return recentStats;
  }

  /**
   * Calculate recent improvement based on last few tournaments
   * @param {Array} sortedTournaments - Tournaments sorted by date
   * @returns {Object} Recent improvement data
   */
  calculateRecentImprovement(sortedTournaments) {
    if (sortedTournaments.length < 3) {
      return { improvement: 'insufficient-data' };
    }

    const recent = sortedTournaments.slice(-3);
    const earlier = sortedTournaments.slice(0, -3);

    const recentAvgRank = recent.reduce((sum, t) => sum + t.rank, 0) / recent.length;
    const earlierAvgRank = earlier.length > 0
      ? earlier.reduce((sum, t) => sum + t.rank, 0) / earlier.length
      : recentAvgRank;

    const improvement = earlierAvgRank - recentAvgRank; // Positive means improvement (lower rank)

    return {
      improvement: improvement > 0.5 ? 'improving' : improvement < -0.5 ? 'declining' : 'stable',
      improvementValue: improvement,
      recentAverage: recentAvgRank,
      previousAverage: earlierAvgRank
    };
  }

  // ============================================================================
  // GAME ANALYTICS
  // ============================================================================

  /**
   * Calculate game-specific analytics
   * @param {string} gameId - Game identifier
   * @returns {Object} Game analytics
   */
  calculateGameAnalytics(gameId) {
    const cacheKey = `game-analytics-${gameId}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const tournaments = this.historyManager.getTournamentHistory();
      const gameTournaments = tournaments.filter(t => t.games.includes(gameId));

      if (gameTournaments.length === 0) {
        return { error: 'No tournament data found for game' };
      }

      const analytics = {
        gameId,
        totalTournaments: gameTournaments.length,
        totalPlayers: new Set(),
        averageScore: 0,
        highestScore: 0,
        lowestScore: Infinity,
        scoreDistribution: {},
        topPlayers: [],
        difficultyRating: 0,
        popularityRank: 0,
        competitiveBalance: 0
      };

      let totalScore = 0;
      let scoreCount = 0;
      const playerScores = {};

      gameTournaments.forEach(tournament => {
        tournament.participants.forEach(participant => {
          analytics.totalPlayers.add(participant.id);

          const score = participant.scores[gameId];
          if (score !== undefined) {
            totalScore += score;
            scoreCount++;

            analytics.highestScore = Math.max(analytics.highestScore, score);
            analytics.lowestScore = Math.min(analytics.lowestScore, score);

            // Track player scores for top players calculation
            if (!playerScores[participant.id]) {
              playerScores[participant.id] = {
                playerId: participant.id,
                playerName: participant.name,
                scores: [],
                averageScore: 0,
                bestScore: 0,
                tournaments: 0
              };
            }

            playerScores[participant.id].scores.push(score);
            playerScores[participant.id].bestScore = Math.max(playerScores[participant.id].bestScore, score);
            playerScores[participant.id].tournaments++;
          }
        });
      });

      analytics.totalPlayers = analytics.totalPlayers.size;
      analytics.averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

      // Calculate player averages and find top players
      Object.values(playerScores).forEach(player => {
        player.averageScore = player.scores.reduce((sum, score) => sum + score, 0) / player.scores.length;
      });

      analytics.topPlayers = Object.values(playerScores)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 10)
        .map((player, index) => ({
          rank: index + 1,
          playerId: player.playerId,
          playerName: player.playerName,
          averageScore: Math.round(player.averageScore),
          bestScore: player.bestScore,
          tournaments: player.tournaments
        }));

      // Calculate difficulty rating (based on score variance)
      const scores = Object.values(playerScores).flatMap(p => p.scores);
      const variance = this.calculateVariance(scores);
      analytics.difficultyRating = this.calculateDifficultyFromVariance(variance, analytics.averageScore);

      // Calculate competitive balance (how evenly distributed the wins are)
      analytics.competitiveBalance = this.calculateCompetitiveBalance(gameTournaments, gameId);

      // Calculate score distribution
      analytics.scoreDistribution = this.calculateScoreDistribution(scores);

      this.setCachedResult(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Error calculating game analytics:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate comparative analytics across all games
   * @returns {Object} Comparative game analytics
   */
  calculateComparativeGameAnalytics() {
    const cacheKey = 'comparative-game-analytics';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const tournaments = this.historyManager.getTournamentHistory();
      const gameStats = {};
      const gamePopularity = {};

      // Collect data for all games
      tournaments.forEach(tournament => {
        tournament.games.forEach(gameId => {
          gamePopularity[gameId] = (gamePopularity[gameId] || 0) + 1;

          if (!gameStats[gameId]) {
            gameStats[gameId] = {
              gameId,
              tournaments: 0,
              totalPlayers: new Set(),
              scores: [],
              winners: []
            };
          }

          gameStats[gameId].tournaments++;

          tournament.participants.forEach(participant => {
            gameStats[gameId].totalPlayers.add(participant.id);

            const score = participant.scores[gameId];
            if (score !== undefined) {
              gameStats[gameId].scores.push(score);
            }

            // Track winners for this game in this tournament
            if (participant.rank === 1) {
              gameStats[gameId].winners.push(participant.id);
            }
          });
        });
      });

      // Process comparative metrics
      const comparative = {
        totalGames: Object.keys(gameStats).length,
        gameRankings: {
          byPopularity: [],
          byAverageScore: [],
          byCompetitiveness: [],
          byDifficulty: []
        },
        insights: []
      };

      // Calculate metrics for each game
      const gameMetrics = Object.values(gameStats).map(game => {
        const totalPlayers = game.totalPlayers.size;
        const averageScore = game.scores.length > 0
          ? game.scores.reduce((sum, score) => sum + score, 0) / game.scores.length
          : 0;
        const scoreVariance = this.calculateVariance(game.scores);
        const winnerDiversity = new Set(game.winners).size;
        const competitiveness = winnerDiversity / Math.max(1, game.tournaments);

        return {
          gameId: game.gameId,
          popularity: gamePopularity[game.gameId] || 0,
          tournaments: game.tournaments,
          totalPlayers,
          averageScore: Math.round(averageScore),
          scoreVariance: Math.round(scoreVariance),
          competitiveness: Math.round(competitiveness * 100) / 100,
          difficulty: this.calculateDifficultyFromVariance(scoreVariance, averageScore)
        };
      });

      // Create rankings
      comparative.gameRankings.byPopularity = [...gameMetrics]
        .sort((a, b) => b.popularity - a.popularity)
        .map((game, index) => ({ ...game, rank: index + 1 }));

      comparative.gameRankings.byAverageScore = [...gameMetrics]
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((game, index) => ({ ...game, rank: index + 1 }));

      comparative.gameRankings.byCompetitiveness = [...gameMetrics]
        .sort((a, b) => b.competitiveness - a.competitiveness)
        .map((game, index) => ({ ...game, rank: index + 1 }));

      comparative.gameRankings.byDifficulty = [...gameMetrics]
        .sort((a, b) => b.difficulty - a.difficulty)
        .map((game, index) => ({ ...game, rank: index + 1 }));

      // Generate insights
      comparative.insights = this.generateComparativeInsights(comparative.gameRankings);

      this.setCachedResult(cacheKey, comparative);
      return comparative;

    } catch (error) {
      console.error('Error calculating comparative game analytics:', error);
      return { error: error.message };
    }
  }

  // ============================================================================
  // TOURNAMENT ANALYTICS
  // ============================================================================

  /**
   * Calculate tournament-specific analytics
   * @param {string} tournamentId - Tournament identifier
   * @returns {Object} Tournament analytics
   */
  calculateTournamentAnalytics(tournamentId) {
    try {
      const tournament = this.historyManager.getTournamentFromHistory(tournamentId);
      if (!tournament) {
        return { error: 'Tournament not found' };
      }

      const analytics = {
        tournamentId,
        name: tournament.name,
        format: tournament.format,
        duration: this.calculateTournamentDuration(tournament),
        participantAnalytics: this.analyzeTournamentParticipants(tournament),
        gameAnalytics: this.analyzeTournamentGames(tournament),
        competitiveBalance: this.calculateTournamentCompetitiveBalance(tournament),
        insights: []
      };

      analytics.insights = this.generateTournamentInsights(analytics);
      return analytics;

    } catch (error) {
      console.error('Error calculating tournament analytics:', error);
      return { error: error.message };
    }
  }

  // ============================================================================
  // VISUALIZATION HELPERS
  // ============================================================================

  /**
   * Generate chart data for player performance over time
   * @param {string} playerId - Player identifier
   * @returns {Object} Chart data
   */
  generatePlayerPerformanceChart(playerId) {
    const playerStats = this.calculatePlayerStats(playerId);
    if (playerStats.error) return playerStats;

    const chartData = {
      type: 'line',
      title: `Performance Trend - ${playerId}`,
      data: {
        labels: [],
        datasets: [{
          label: 'Tournament Rank',
          data: [],
          borderColor: this.chartConfig.colors.primary,
          backgroundColor: 'transparent',
          tension: 0.1
        }, {
          label: 'Score',
          data: [],
          borderColor: this.chartConfig.colors.secondary,
          backgroundColor: 'transparent',
          tension: 0.1,
          yAxisID: 'y1'
        }]
      },
      options: this.getRetroChartOptions()
    };

    if (playerStats.improvementTrend.dataPoints) {
      playerStats.improvementTrend.dataPoints.forEach(point => {
        chartData.data.labels.push(new Date(point.date).toLocaleDateString());
        chartData.data.datasets[0].data.push(point.rank);
        chartData.data.datasets[1].data.push(point.score);
      });
    }

    return chartData;
  }

  /**
   * Generate chart data for game popularity comparison
   * @returns {Object} Chart data
   */
  generateGamePopularityChart() {
    const comparative = this.calculateComparativeGameAnalytics();
    if (comparative.error) return comparative;

    const chartData = {
      type: 'bar',
      title: 'Game Popularity',
      data: {
        labels: comparative.gameRankings.byPopularity.map(g => this.getGameDisplayName(g.gameId)),
        datasets: [{
          label: 'Tournaments',
          data: comparative.gameRankings.byPopularity.map(g => g.popularity),
          backgroundColor: this.chartConfig.colors.primary,
          borderColor: this.chartConfig.colors.primary,
          borderWidth: 2
        }]
      },
      options: this.getRetroChartOptions()
    };

    return chartData;
  }

  /**
   * Get retro-styled chart options
   * @returns {Object} Chart options
   */
  getRetroChartOptions() {
    return {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: this.chartConfig.colors.primary,
            font: {
              family: this.chartConfig.fonts.family,
              size: this.chartConfig.fonts.size
            }
          }
        },
        title: {
          color: this.chartConfig.colors.primary,
          font: {
            family: this.chartConfig.fonts.family,
            size: this.chartConfig.fonts.size + 2
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: this.chartConfig.colors.primary,
            font: {
              family: this.chartConfig.fonts.family,
              size: this.chartConfig.fonts.size
            }
          },
          grid: {
            color: 'rgba(0, 255, 255, 0.2)'
          }
        },
        y: {
          ticks: {
            color: this.chartConfig.colors.primary,
            font: {
              family: this.chartConfig.fonts.family,
              size: this.chartConfig.fonts.size
            }
          },
          grid: {
            color: 'rgba(0, 255, 255, 0.2)'
          }
        }
      }
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate variance of an array of numbers
   * @param {number[]} values - Array of numbers
   * @returns {number} Variance
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Calculate difficulty rating from score variance
   * @param {number} variance - Score variance
   * @param {number} averageScore - Average score
   * @returns {number} Difficulty rating (0-10)
   */
  calculateDifficultyFromVariance(variance, averageScore) {
    if (averageScore === 0) return 5; // Default medium difficulty

    const coefficientOfVariation = Math.sqrt(variance) / averageScore;
    return Math.min(10, Math.max(0, coefficientOfVariation * 10));
  }

  /**
   * Calculate competitive balance for a game
   * @param {Array} tournaments - Tournaments featuring the game
   * @param {string} gameId - Game identifier
   * @returns {number} Competitive balance score (0-1)
   */
  calculateCompetitiveBalance(tournaments, gameId) {
    const winners = [];

    tournaments.forEach(tournament => {
      const winner = tournament.participants.find(p => p.rank === 1);
      if (winner) {
        winners.push(winner.id);
      }
    });

    if (winners.length === 0) return 0;

    const uniqueWinners = new Set(winners).size;
    return uniqueWinners / winners.length;
  }

  /**
   * Calculate score distribution
   * @param {number[]} scores - Array of scores
   * @returns {Object} Score distribution
   */
  calculateScoreDistribution(scores) {
    if (scores.length === 0) return {};

    const sorted = [...scores].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    if (range === 0) return { [min]: scores.length };

    const buckets = 10;
    const bucketSize = range / buckets;
    const distribution = {};

    for (let i = 0; i < buckets; i++) {
      const bucketMin = min + (i * bucketSize);
      const bucketMax = min + ((i + 1) * bucketSize);
      const bucketLabel = `${Math.round(bucketMin)}-${Math.round(bucketMax)}`;
      distribution[bucketLabel] = 0;
    }

    scores.forEach(score => {
      const bucketIndex = Math.min(Math.floor((score - min) / bucketSize), buckets - 1);
      const bucketMin = min + (bucketIndex * bucketSize);
      const bucketMax = min + ((bucketIndex + 1) * bucketSize);
      const bucketLabel = `${Math.round(bucketMin)}-${Math.round(bucketMax)}`;
      distribution[bucketLabel]++;
    });

    return distribution;
  }

  /**
   * Generate player recommendations based on statistics
   * @param {Object} stats - Player statistics
   * @returns {Array} Array of recommendations
   */
  generatePlayerRecommendations(stats) {
    const recommendations = [];

    // Win rate recommendations
    if (stats.winRate < 10) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        message: 'Focus on consistent performance across all games to improve win rate'
      });
    }

    // Game-specific recommendations
    if (stats.weakestGames.length > 0) {
      const weakestGame = stats.weakestGames[0];
      recommendations.push({
        type: 'practice',
        priority: 'medium',
        message: `Consider practicing ${this.getGameDisplayName(weakestGame.gameId)} to improve overall tournament performance`
      });
    }

    // Trend-based recommendations
    if (stats.improvementTrend.trend === 'declining') {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        message: 'Recent performance shows a declining trend. Consider reviewing strategies for your strongest games'
      });
    } else if (stats.improvementTrend.trend === 'improving') {
      recommendations.push({
        type: 'encouragement',
        priority: 'low',
        message: 'Great improvement trend! Keep up the consistent practice'
      });
    }

    return recommendations;
  }

  /**
   * Generate comparative insights
   * @param {Object} gameRankings - Game rankings data
   * @returns {Array} Array of insights
   */
  generateComparativeInsights(gameRankings) {
    const insights = [];

    // Most popular game
    if (gameRankings.byPopularity.length > 0) {
      const mostPopular = gameRankings.byPopularity[0];
      insights.push({
        type: 'popularity',
        message: `${this.getGameDisplayName(mostPopular.gameId)} is the most popular game with ${mostPopular.popularity} tournament appearances`
      });
    }

    // Most competitive game
    if (gameRankings.byCompetitiveness.length > 0) {
      const mostCompetitive = gameRankings.byCompetitiveness[0];
      insights.push({
        type: 'competitiveness',
        message: `${this.getGameDisplayName(mostCompetitive.gameId)} shows the highest competitive balance with ${Math.round(mostCompetitive.competitiveness * 100)}% winner diversity`
      });
    }

    return insights;
  }

  /**
   * Get display name for game ID
   * @param {string} gameId - Game identifier
   * @returns {string} Display name
   */
  getGameDisplayName(gameId) {
    const gameNames = {
      'snake-GG': 'Snake',
      'tetris-GG': 'Tetris',
      'pacman-GG': 'Pac-Man',
      'breakout-GG': 'Breakout',
      'space-invaders-GG': 'Space Invaders',
      'asteroids-GG': 'Asteroids',
      'pong-GG': 'Pong',
      'galaga-GG': 'Galaga',
      'mspacman-GG': 'Ms. Pac-Man',
      'fruit-catcher-GG': 'Fruit Catcher'
    };

    return gameNames[gameId] || gameId;
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get cached result if still valid
   * @param {string} key - Cache key
   * @returns {*} Cached result or null
   */
  getCachedResult(key) {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached result
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  setCachedResult(key, data) {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear analytics cache
   */
  clearCache() {
    this.analyticsCache.clear();
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentAnalyticsManager };
} else if (typeof window !== 'undefined') {
  window.TournamentAnalyticsManager = TournamentAnalyticsManager;
}
