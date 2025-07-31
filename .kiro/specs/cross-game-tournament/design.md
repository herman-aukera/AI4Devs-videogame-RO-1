# Cross-Game Tournament System - Design Document

## Overview

The Cross-Game Tournament System is an event-driven architecture that seamlessly integrates with all 10 existing AI4Devs retro games without requiring code modifications. The system uses a pub/sub pattern to capture game completion events and manages tournament state through LocalStorage, maintaining the established "no overengineering" principle from DEVELOPMENT.md.

### Design Principles

1. **Non-Invasive Integration**: Zero modifications to existing game code
2. **Event-Driven Architecture**: Loose coupling through CustomEvents
3. **Performance First**: Sub-100ms operations, 60fps UI updates
4. **Retro Aesthetic Consistency**: Neon colors and monospace fonts
5. **Mobile-First Responsive**: Touch-optimized with 44px minimum targets

## Architecture

### System Architecture Pattern: Event-Driven Modular System

```
┌─────────────────────────────────────────────────────────────┐
│                    Tournament System                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Tournament      │  │ Score           │  │ UI           │ │
│  │ Manager         │  │ Aggregator      │  │ Controller   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Event Bus Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ Snake   │ │Breakout │ │ Tetris  │ │ Pac-Man │ │  ...   │ │
│  │   GG    │ │   GG    │ │   GG    │ │   GG    │ │  6 more│ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. TournamentManager Class

**Responsibility**: Central tournament orchestration and state management

**Key Methods**:

- `createTournament(config)`: Initialize new tournament with validation
- `joinTournament(tournamentId, playerId)`: Register participant
- `updateScore(tournamentId, gameId, score)`: Process game completion
- `getTournamentStatus(tournamentId)`: Retrieve current standings

#### 2. ScoreAggregator Class

**Responsibility**: Score normalization and ranking calculations

**Key Methods**:

- `normalizeScore(gameType, rawScore)`: Convert game-specific scores to comparable values
- `calculateRanking(scores)`: Generate leaderboard from normalized scores
- `getLeaderboard(tournamentId)`: Return sorted participant rankings

#### 3. EventBus Class

**Responsibility**: Event communication between games and tournament system

**Key Methods**:

- `subscribe(event, callback)`: Register event listeners
- `publish(event, data)`: Broadcast events to subscribers
- `unsubscribe(event, callback)`: Remove event listeners

## Components and Interfaces

### Tournament Data Model

```javascript
interface ITournament {
    id: string;                    // Unique tournament identifier
    name: string;                  // Tournament display name
    games: string[];               // Array of game IDs (e.g., ['snake-GG', 'tetris-GG'])
    format: 'elimination' | 'round-robin';  // Tournament format
    participants: IParticipant[];  // Registered participants
    status: 'created' | 'active' | 'completed';  // Tournament state
    startDate: Date;               // Tournament start timestamp
    endDate?: Date;                // Tournament completion timestamp
    settings: ITournamentSettings; // Configuration options
}

interface IParticipant {
    id: string;                    // Unique participant identifier
    name: string;                  // Display name
    scores: Map<string, number>;   // Game-specific scores
    normalizedScores: Map<string, number>;  // Normalized scores for comparison
    totalScore: number;            // Aggregate tournament score
    rank: number;                  // Current tournament ranking
    gamesCompleted: string[];      // List of completed games
}

interface ITournamentSettings {
    maxParticipants: number;       // Maximum allowed participants
    scoreNormalization: boolean;   // Enable score normalization
    autoAdvance: boolean;          // Auto-advance to next round
    timeLimit?: number;            // Optional time limit per game (seconds)
}
```

### Event Contracts

```javascript
// Game completion event - published by games
{
    type: 'game:complete',
    data: {
        gameId: string,           // Game identifier (e.g., 'snake-GG')
        playerId: string,         // Participant identifier
        score: number,            // Final game score
        duration: number,         // Game duration in milliseconds
        timestamp: Date,          // Completion timestamp
        metadata?: any            // Game-specific additional data
    }
}

// Tournament update event - published by tournament system
{
    type: 'tournament:update',
    data: {
        tournamentId: string,     // Tournament identifier
        leaderboard: IParticipant[], // Updated rankings
        nextGame?: string,        // Next scheduled game
        roundComplete?: boolean   // Round completion status
    }
}

// Tournament state change event
{
    type: 'tournament:stateChange',
    data: {
        tournamentId: string,
        oldStatus: string,
        newStatus: string,
        timestamp: Date
    }
}
```

## Data Models

### LocalStorage Schema

The tournament system uses LocalStorage for persistence with the following structure:

```javascript
// Key: 'tournaments'
{
    "tournament_001": {
        id: "tournament_001",
        name: "Weekend Warriors Championship",
        games: ["snake-GG", "tetris-GG", "pacman-GG", "breakout-GG"],
        format: "round-robin",
        participants: [
            {
                id: "player_001",
                name: "Player 1",
                scores: {
                    "snake-GG": 1500,
                    "tetris-GG": 25000,
                    "pacman-GG": 8750,
                    "breakout-GG": 12000
                },
                normalizedScores: {
                    "snake-GG": 0.75,
                    "tetris-GG": 0.83,
                    "pacman-GG": 0.71,
                    "breakout-GG": 0.80
                },
                totalScore: 3.09,
                rank: 1,
                gamesCompleted: ["snake-GG", "tetris-GG", "pacman-GG", "breakout-GG"]
            }
        ],
        status: "completed",
        startDate: "2025-07-19T10:00:00Z",
        endDate: "2025-07-19T14:30:00Z",
        settings: {
            maxParticipants: 8,
            scoreNormalization: true,
            autoAdvance: true
        }
    }
}

// Key: 'tournament-settings'
{
    defaultFormat: "round-robin",
    scoreNormalization: true,
    maxParticipants: 8,
    autoAdvance: true,
    retainHistory: 30  // Days to retain tournament history
}

// Key: 'tournament-history'
{
    completedTournaments: ["tournament_001", "tournament_002"],
    totalTournaments: 15,
    totalParticipants: 45,
    lastCleanup: "2025-07-19T00:00:00Z"
}
```

## Error Handling

### Error Categories and Strategies

#### 1. Storage Errors

- **LocalStorage Quota Exceeded**: Implement data compression and cleanup
- **Data Corruption**: Validate data integrity on load, fallback to defaults
- **Concurrent Access**: Use atomic operations and conflict resolution

```javascript
class TournamentError extends Error {
    constructor(message, code, context) {
        super(message);
        this.name = 'TournamentError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
    }
}

// Error codes
const ERROR_CODES = {
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_001',
    DATA_CORRUPTION: 'STORAGE_002',
    GAME_INTEGRATION_FAILED: 'INTEGRATION_001',
    INVALID_TOURNAMENT_CONFIG: 'VALIDATION_001',
    SCORE_NORMALIZATION_FAILED: 'SCORING_001'
};
```

#### 2. Integration Errors

- **Game Event Failures**: Graceful degradation with manual score entry
- **Score Validation**: Sanitize and validate all incoming scores
- **Missing Game Support**: Log unsupported games, continue with supported ones

#### 3. UI Errors

- **Rendering Failures**: Fallback to basic HTML rendering
- **Touch Event Issues**: Provide keyboard alternatives
- **Responsive Layout Problems**: Ensure minimum viable mobile experience

### Error Recovery Patterns

```javascript
// Graceful degradation example
try {
    const normalizedScore = this.scoreAggregator.normalizeScore(gameType, rawScore);
    tournament.updateScore(gameId, normalizedScore);
} catch (error) {
    if (error instanceof TournamentError) {
        // Log error and use raw score as fallback
        console.warn(`Score normalization failed for ${gameType}:`, error);
        tournament.updateScore(gameId, rawScore, { normalized: false });
    } else {
        // Unknown error - log and continue
        console.error('Unexpected error in score processing:', error);
        this.notifyUser('Score processing error - please try again');
    }
}
```

## Testing Strategy

### TDD Implementation with runAuditTasks()

Following the established pattern from existing games, the tournament system implements comprehensive testing through the `runAuditTasks()` method:

```javascript
class TournamentSystem {
    runAuditTasks() {
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

        // Accessibility compliance
        results.tests.push(this.testAccessibilityCompliance());

        // Calculate summary
        results.passed = results.tests.filter(t => t.passed).length;
        results.failed = results.tests.filter(t => !t.passed).length;

        // Output results in console table format
        console.table(results.tests);
        console.log('Performance Metrics:', results.performance);
        console.log('Integration Status:', results.integration);

        return results;
    }

    testTournamentCreation() {
        try {
            const config = {
                name: 'Test Tournament',
                games: ['snake-GG', 'tetris-GG'],
                format: 'round-robin'
            };
            const tournament = this.tournamentManager.createTournament(config);

            return {
                name: 'Tournament Creation',
                passed: tournament && tournament.id && tournament.status === 'created',
                details: tournament ? 'Tournament created successfully' : 'Failed to create tournament'
            };
        } catch (error) {
            return {
                name: 'Tournament Creation',
                passed: false,
                details: `Error: ${error.message}`
            };
        }
    }

    runPerformanceTests() {
        const metrics = {};

        // Tournament creation benchmark
        const createStart = performance.now();
        this.createTestTournament();
        metrics.tournamentCreation = performance.now() - createStart;

        // Score update benchmark
        const updateStart = performance.now();
        for (let i = 0; i < 100; i++) {
            this.updateTestScore();
        }
        metrics.scoreUpdates = (performance.now() - updateStart) / 100;

        // Leaderboard calculation benchmark
        const leaderboardStart = performance.now();
        this.calculateTestLeaderboard();
        metrics.leaderboardCalculation = performance.now() - leaderboardStart;

        return metrics;
    }
}
```
