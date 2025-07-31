# 🏆 Tournament System API Documentation

## Overview

The AI4Devs Tournament System provides a comprehensive API for integrating games and managing tournaments. This document covers all interfaces, events, and integration patterns for developers.

## Architecture

### Core Components

```
Tournament System Architecture
├── TournamentManager (Core orchestration)
├── ScoreAggregator (Score normalization)
├── EventBus (Communication layer)
├── TournamentHistory (Data persistence)
├── TournamentAnalytics (Performance tracking)
└── TournamentUI (User interface)
```

### Event-Driven Design

The tournament system uses a non-invasive event-driven architecture that integrates with existing games without requiring code modifications.

## Core APIs

### TournamentManager

Central tournament orchestration and state management.

#### Methods

```javascript
class TournamentManager {
  // Tournament lifecycle
  createTournament(config: ITournamentConfig): ITournament
  joinTournament(tournamentId: string, playerId: string): boolean
  startTournament(tournamentId: string): boolean
  endTournament(tournamentId: string): ITournament

  // Tournament queries
  getTournament(tournamentId: string): ITournament | null
  getActiveTournament(): ITournament | null
  getTournamentStatus(tournamentId: string): TournamentStatus

  // Participant management
  addParticipant(tournamentId: string, participant: IParticipant): boolean
  removeParticipant(tournamentId: string, participantId: string): boolean
  getParticipants(tournamentId: string): IParticipant[]

  // Score management
  updateScore(tournamentId: string, gameId: string, playerId: string, score: number): boolean
  getLeaderboard(tournamentId: string): IParticipant[]

  // Event handling
  subscribe(event: string, callback: Function): void
  unsubscribe(event: string, callback: Function): void
}
```

#### Configuration Interface

```typescript
interface ITournamentConfig {
  name: string;                    // Tournament display name
  games: string[];                 // Array of game IDs
  format: 'round-robin' | 'elimination';
  maxParticipants: number;         // 2-16 participants
  settings: {
    scoreNormalization: boolean;   // Enable score normalization
    autoAdvance: boolean;          // Auto-advance rounds
    timeLimit?: number;            // Optional time limit per game
  };
}
```

### ScoreAggregator

Handles score normalization and ranking calculations.

#### Methods

```javascript
class ScoreAggregator {
  // Score normalization
  normalizeScore(gameId: string, rawScore: number): number
  calculateRanking(participants: IParticipant[]): IParticipant[]

  // Game-specific scoring
  registerGameScoring(gameId: string, config: IGameScoringConfig): void
  getGameScoringConfig(gameId: string): IGameScoringConfig

  // Statistics
  calculateStatistics(tournamentId: string): ITournamentStats
  getPerformanceMetrics(participantId: string): IPerformanceMetrics
}
```

#### Game Scoring Configuration

```typescript
interface IGameScoringConfig {
  gameId: string;                  // Unique game identifier
  scoringType: 'points' | 'time' | 'level' | 'survival';
  normalizeFunction: (score: number) => number;
  maxScore?: number;               // Maximum possible score
  minScore?: number;               // Minimum score threshold
  timeWeight?: number;             // Time factor for scoring
  difficultyMultiplier?: number;   // Difficulty adjustment
}
```

### EventBus

Communication layer for tournament events.

#### Methods

```javascript
class EventBus {
  // Event management
  subscribe(eventType: string, callback: Function): string
  unsubscribe(eventType: string, callbackId: string): boolean
  publish(eventType: string, data: any): void

  // Event validation
  validateEvent(event: ITournamentEvent): boolean

  // Error handling
  onError(callback: Function): void
}
```

## Event System

### Game Integration Events

Games communicate with the tournament system through CustomEvents:

#### Game Completion Event

```javascript
// Published by games when a game session ends
const gameCompleteEvent = new CustomEvent('tournament:game:complete', {
  detail: {
    gameId: 'snake-GG',           // Game identifier
    playerId: 'player_001',       // Participant identifier
    score: 1500,                  // Final game score
    duration: 120000,             // Game duration in milliseconds
    timestamp: new Date(),        // Completion timestamp
    metadata: {                   // Optional game-specific data
      level: 5,
      lives: 2,
      powerUps: 3
    }
  }
});

window.dispatchEvent(gameCompleteEvent);
```

#### Tournament State Events

```javascript
// Tournament status changes
const tournamentUpdateEvent = new CustomEvent('tournament:update', {
  detail: {
    tournamentId: 'tournament_001',
    type: 'leaderboard_update',
    data: {
      leaderboard: [...],         // Updated participant rankings
      nextGame: 'tetris-GG',      // Next scheduled game
      roundComplete: false        // Round completion status
    }
  }
});

// Tournament lifecycle events
const tournamentStateEvent = new CustomEvent('tournament:state:change', {
  detail: {
    tournamentId: 'tournament_001',
    oldState: 'active',
    newState: 'completed',
    timestamp: new Date()
  }
});
```

### Event Listeners

Games can listen for tournament events to provide enhanced integration:

```javascript
// Listen for tournament start
window.addEventListener('tournament:start', (event) => {
  const { tournamentId, gameId } = event.detail;
  if (gameId === 'your-game-id') {
    // Initialize tournament mode
    enableTournamentMode(tournamentId);
  }
});

// Listen for tournament updates
window.addEventListener('tournament:update', (event) => {
  const { leaderboard, nextGame } = event.detail.data;
  // Update game UI with tournament info
  updateTournamentDisplay(leaderboard, nextGame);
});
```

## Data Models

### Tournament Interface

```typescript
interface ITournament {
  id: string;                      // Unique tournament identifier
  name: string;                    // Tournament display name
  games: string[];                 // Array of game IDs
  format: 'round-robin' | 'elimination';
  participants: IParticipant[];    // Registered participants
  status: 'created' | 'active' | 'completed';
  startDate: Date;                 // Tournament start timestamp
  endDate?: Date;                  // Tournament completion timestamp
  settings: ITournamentSettings;   // Configuration options
  currentRound?: number;           // Current round (elimination format)
  rounds?: IRound[];               // Round data (elimination format)
}
```

### Participant Interface

```typescript
interface IParticipant {
  id: string;                      // Unique participant identifier
  name: string;                    // Display name
  scores: Map<string, number>;     // Game-specific raw scores
  normalizedScores: Map<string, number>; // Normalized scores
  totalScore: number;              // Aggregate tournament score
  rank: number;                    // Current tournament ranking
  gamesCompleted: string[];        // List of completed games
  gamesRemaining: string[];        // List of remaining games
  statistics: IParticipantStats;   // Performance statistics
}
```

### Tournament Settings Interface

```typescript
interface ITournamentSettings {
  maxParticipants: number;         // Maximum allowed participants
  scoreNormalization: boolean;     // Enable score normalization
  autoAdvance: boolean;            // Auto-advance to next round
  timeLimit?: number;              // Optional time limit per game
  allowSpectators?: boolean;       // Allow non-participants to view
  publicLeaderboard?: boolean;     // Make leaderboard publicly visible
}
```

## Game Integration Guide

### Step 1: Game Identification

Each game must have a unique identifier:

```javascript
const GAME_ID = 'your-game-GG';  // Follow naming convention
```

### Step 2: Score Reporting

Implement score reporting when games end:

```javascript
function reportTournamentScore(finalScore) {
  const event = new CustomEvent('tournament:game:complete', {
    detail: {
      gameId: GAME_ID,
      playerId: getCurrentPlayerId(), // Get from tournament system
      score: finalScore,
      duration: getGameDuration(),
      timestamp: new Date(),
      metadata: {
        // Add game-specific data
        level: currentLevel,
        difficulty: currentDifficulty
      }
    }
  });

  window.dispatchEvent(event);
}
```

### Step 3: Tournament Mode Detection

Check if game is part of active tournament:

```javascript
function checkTournamentMode() {
  const activeTournament = window.tournamentManager?.getActiveTournament();
  if (activeTournament && activeTournament.games.includes(GAME_ID)) {
    enableTournamentFeatures();
    return true;
  }
  return false;
}
```

### Step 4: UI Integration

Add tournament navigation to game interface:

```html
<!-- Add to game navigation -->
<nav class="game-navigation">
  <a href="../index.html" class="back-button">
    <span class="back-icon">⬅</span>
    <span class="back-text">INICIO</span>
  </a>
  <div class="tournament-links">
    <a href="../tournament-dashboard.html" class="tournament-button">
      <span class="tournament-icon">🏆</span>
      <span class="tournament-text">TORNEO</span>
    </a>
  </div>
</nav>
```

### Step 5: Score Normalization Configuration

Register game-specific scoring configuration:

```javascript
// Register scoring configuration
window.tournamentScoreAggregator?.registerGameScoring(GAME_ID, {
  gameId: GAME_ID,
  scoringType: 'points',
  normalizeFunction: (score) => Math.min(score / 10000, 1.0),
  maxScore: 10000,
  minScore: 0,
  difficultyMultiplier: 1.0
});
```

## Storage API

### LocalStorage Schema

Tournament data is stored in LocalStorage with the following structure:

```javascript
// Key: 'tournaments'
{
  "tournament_001": { /* ITournament */ },
  "tournament_002": { /* ITournament */ }
}

// Key: 'tournament-settings'
{
  defaultFormat: "round-robin",
  scoreNormalization: true,
  maxParticipants: 8,
  autoAdvance: true
}

// Key: 'tournament-history'
{
  completedTournaments: ["tournament_001"],
  totalTournaments: 15,
  totalParticipants: 45,
  lastCleanup: "2025-07-19T00:00:00Z"
}
```

### Storage Management

```javascript
class TournamentStorage {
  // Data persistence
  saveTournament(tournament: ITournament): boolean
  loadTournament(tournamentId: string): ITournament | null
  deleteTournament(tournamentId: string): boolean

  // History management
  archiveTournament(tournamentId: string): boolean
  getArchivedTournaments(): ITournament[]
  cleanupOldData(daysToKeep: number): number

  // Storage monitoring
  getStorageUsage(): IStorageUsage
  checkStorageQuota(): boolean
  compressData(): boolean
}
```

## Performance Monitoring

### Performance Metrics

```typescript
interface IPerformanceMetrics {
  tournamentCreation: number;      // Tournament creation time (ms)
  scoreUpdates: number;            // Average score update time (ms)
  leaderboardCalculation: number;  // Leaderboard calculation time (ms)
  uiUpdates: number;               // UI update frequency (fps)
  memoryUsage: number;             // Memory usage (MB)
  storageUsage: number;            // LocalStorage usage (MB)
}
```

### Performance Monitoring API

```javascript
class TournamentPerformanceMonitor {
  // Metrics collection
  startMetric(name: string): string
  endMetric(metricId: string): number
  recordMetric(name: string, value: number): void

  // Performance analysis
  getMetrics(): IPerformanceMetrics
  getPerformanceReport(): IPerformanceReport

  // Optimization recommendations
  getOptimizationSuggestions(): string[]

  // Memory monitoring
  checkMemoryUsage(): number
  detectMemoryLeaks(): boolean
}
```

## Testing API

### Audit System

Following the established pattern from existing games:

```javascript
class TournamentSystem {
  runAuditTasks(): IAuditResults {
    const results = {
      timestamp: new Date(),
      tests: [],
      passed: 0,
      failed: 0,
      performance: {},
      integration: {}
    };

    // Core functionality tests
    results.tests.push(this.testTournamentCreation());
    results.tests.push(this.testScoreIntegration());
    results.tests.push(this.testLeaderboardCalculation());
    results.tests.push(this.testEventBusReliability());
    results.tests.push(this.testStoragePersistence());

    // Performance benchmarks
    results.performance = this.runPerformanceTests();

    // Integration tests with existing games
    results.integration = this.testGameIntegration();

    return results;
  }
}
```

### Test Utilities

```javascript
class TournamentTestUtils {
  // Mock data generation
  createMockTournament(): ITournament
  createMockParticipants(count: number): IParticipant[]
  generateTestScores(gameId: string, count: number): number[]

  // Test assertions
  assertTournamentValid(tournament: ITournament): boolean
  assertScoresNormalized(scores: number[]): boolean
  assertLeaderboardSorted(leaderboard: IParticipant[]): boolean

  // Performance testing
  benchmarkTournamentCreation(): number
  benchmarkScoreUpdates(): number
  benchmarkLeaderboardCalculation(): number
}
```

## Error Handling

### Error Types

```typescript
enum TournamentErrorCode {
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_001',
  DATA_CORRUPTION = 'STORAGE_002',
  GAME_INTEGRATION_FAILED = 'INTEGRATION_001',
  INVALID_TOURNAMENT_CONFIG = 'VALIDATION_001',
  SCORE_NORMALIZATION_FAILED = 'SCORING_001',
  PARTICIPANT_LIMIT_EXCEEDED = 'PARTICIPANT_001',
  TOURNAMENT_NOT_FOUND = 'TOURNAMENT_001'
}

class TournamentError extends Error {
  constructor(message: string, code: TournamentErrorCode, context?: any) {
    super(message);
    this.name = 'TournamentError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}
```

### Error Recovery

```javascript
class TournamentErrorHandler {
  // Error recovery strategies
  handleStorageError(error: TournamentError): boolean
  handleIntegrationError(error: TournamentError): boolean
  handleValidationError(error: TournamentError): boolean

  // Graceful degradation
  enableFallbackMode(): void
  disableAdvancedFeatures(): void

  // Error reporting
  reportError(error: TournamentError): void
  getErrorLog(): TournamentError[]
}
```

## Deployment Checklist

### Pre-Deployment Verification

- [ ] All tournament files properly linked
- [ ] Navigation between all tournament pages working
- [ ] Game integration tested with all 10 games
- [ ] Score normalization algorithms validated
- [ ] LocalStorage persistence working correctly
- [ ] Mobile responsive design verified
- [ ] Accessibility compliance tested (WCAG 2.1 AA)
- [ ] Performance benchmarks met (<50ms creation, <10ms updates)
- [ ] Cross-browser compatibility verified
- [ ] Error handling and recovery tested

### File Dependencies

```
Tournament System Files:
├── tournament-creation.html
├── tournament-creation.css
├── tournament-creation.js
├── tournament-dashboard.html
├── tournament-dashboard.css
├── tournament-dashboard.js
├── tournament-history.html
├── tournament-history.css
├── tournament-history.js
├── shared-tournament-models.js
├── shared-tournament-eventbus.js
├── shared-tournament-manager.js
├── shared-tournament-score-aggregator.js
├── shared-tournament-game-integration.js
├── shared-tournament-history.js
├── shared-tournament-analytics.js
├── shared-tournament-performance-monitor.js
├── shared-tournament-audit-system.js
└── shared-tournament.js
```

### Integration Points

- Main `index.html` tournament section
- Game navigation in all 10 games
- Shared CSS tokens and styling
- Event system integration
- LocalStorage schema

## Version History

- **v1.0.0**: Initial tournament system implementation
- **v1.1.0**: Added tournament history and analytics
- **v1.2.0**: Enhanced mobile responsive design
- **v1.3.0**: Accessibility compliance improvements
- **v1.4.0**: Performance optimization and monitoring

---

**For Implementation Examples**: See existing tournament files and the [User Guide](TOURNAMENT_USER_GUIDE.md) for practical usage examples.
