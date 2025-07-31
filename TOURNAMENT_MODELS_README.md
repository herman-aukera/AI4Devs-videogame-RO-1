# Tournament Data Models and Validation System

## Overview

This implementation provides a comprehensive data modeling and validation system for the cross-game tournament feature. It includes TypeScript-style interfaces, robust validation, data sanitization, LocalStorage management, and schema migration utilities.

## 📁 Files

- **`shared-tournament-models.js`** - Core data models, validation, and storage management
- **`test-tournament-models.js`** - Comprehensive test suite (21 tests)
- **`test-tournament-models.html`** - Interactive browser test interface
- **`test-browser-simple.html`** - Simplified browser test page
- **`test-browser-compatibility.js`** - Basic compatibility tests
- **`debug-test-runner.html`** - Debug interface for troubleshooting

## 🏗️ Core Components

### Data Models (TypeScript-style JSDoc interfaces)

#### ITournament
```javascript
{
  id: string,                    // Unique tournament identifier
  name: string,                  // Tournament display name
  games: string[],               // Array of game IDs
  format: 'elimination'|'round-robin',
  participants: IParticipant[],  // Registered participants
  status: 'created'|'active'|'completed',
  startDate: string,             // ISO timestamp
  endDate?: string,              // ISO timestamp (optional)
  settings: ITournamentSettings,
  version: number                // Schema version
}
```

#### IParticipant
```javascript
{
  id: string,                    // Unique participant identifier
  name: string,                  // Display name
  scores: Object<string, number>, // Game-specific scores
  normalizedScores: Object<string, number>, // Normalized scores
  totalScore: number,            // Aggregate tournament score
  rank: number,                  // Current tournament ranking
  gamesCompleted: string[]       // List of completed games
}
```

#### ITournamentSettings
```javascript
{
  maxParticipants: number,       // Maximum allowed participants (2-16)
  scoreNormalization: boolean,   // Enable score normalization
  autoAdvance: boolean,          // Auto-advance to next round
  timeLimit?: number             // Optional time limit per game (30-3600 seconds)
}
```

### Validation Functions

#### `validateTournamentConfig(config)`
Validates complete tournament configuration including:
- Name validation (required, max 50 characters, non-empty)
- Games validation (valid game IDs, no duplicates, 1-10 games)
- Format validation (elimination or round-robin)
- Settings validation (delegates to validateTournamentSettings)

**Returns:** `{isValid: boolean, errors: string[]}`

#### `validateTournamentSettings(settings)`
Validates tournament settings:
- maxParticipants: 2-16 participants
- scoreNormalization: boolean
- autoAdvance: boolean
- timeLimit: 30-3600 seconds (optional)

**Returns:** `string[]` (array of error messages)

#### `validateParticipant(participant)`
Validates participant data:
- ID and name required (strings)
- Name max 30 characters, non-empty
- Scores and normalizedScores (objects, optional)
- totalScore (number, optional)
- rank (positive number, optional)
- gamesCompleted (array, optional)

**Returns:** `{isValid: boolean, errors: string[]}`

### Sanitization Functions

#### `sanitizeTournamentConfig(config)`
Cleans and normalizes tournament configuration:
- Trims whitespace from name
- Removes duplicate games
- Sets default format if invalid
- Sanitizes settings

#### `sanitizeTournamentSettings(settings)`
Sanitizes tournament settings:
- Converts string numbers to integers
- Handles string booleans ('false' → false)
- Enforces min/max constraints
- Sets reasonable defaults

#### `sanitizeParticipant(participant)`
Sanitizes participant data:
- Trims whitespace from strings
- Converts string numbers to integers
- Ensures valid rank (minimum 1)
- Provides default values for missing fields

### Storage Management

#### `TournamentStorageManager`
Comprehensive LocalStorage management with:

**Features:**
- Mock localStorage for Node.js testing
- Automatic schema initialization
- Error handling with fallback strategies
- Quota exceeded handling with automatic cleanup
- Data export/import for backups
- Schema migration system

**Key Methods:**
- `getItem(key, defaultValue)` - Safe data retrieval
- `setItem(key, value)` - Safe data storage
- `getStorageInfo()` - Usage statistics
- `exportData()` - Complete data backup
- `importData(data)` - Data restoration
- `resetAllData()` - Complete reset

**Error Handling:**
- QuotaExceededError → Automatic cleanup of old tournaments
- SecurityError → Graceful degradation (private browsing)
- Custom events for UI error handling

## 🧪 Testing

### Node.js Testing
```bash
node test-tournament-models.js
```
**Results:** 21/21 tests passing ✅

### Browser Testing
Open any of these HTML files in a browser:
- `test-browser-simple.html` - Recommended for general testing
- `test-tournament-models.html` - Full interactive test suite
- `debug-test-runner.html` - For troubleshooting

### Test Coverage
- ✅ Tournament configuration validation (valid/invalid cases)
- ✅ Tournament settings validation (boundary conditions)
- ✅ Participant validation (required fields, constraints)
- ✅ Data sanitization (string conversion, trimming, defaults)
- ✅ Storage manager initialization and error handling
- ✅ Constants and validation rules
- ✅ Edge cases (null/undefined inputs, empty objects, max lengths)

## 🎮 Supported Games

The system supports all games in the collection:
- `snake-GG`
- `breakout-GG`
- `fruit-catcher-GG`
- `asteroids-GG`
- `space-invaders-GG`
- `pacman-GG`
- `mspacman-GG`
- `tetris-GG`
- `pong-GG`
- `galaga-GG`

## 📊 Constants and Limits

```javascript
TOURNAMENT_CONSTANTS = {
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 16,
  MIN_GAMES: 1,
  MAX_GAMES: 10,
  MAX_NAME_LENGTH: 50,
  MAX_PARTICIPANT_NAME_LENGTH: 30,
  MIN_TIME_LIMIT: 30,        // seconds
  MAX_TIME_LIMIT: 3600,      // seconds
  CURRENT_SCHEMA_VERSION: 1
}
```

## 🔧 Usage Examples

### Basic Validation
```javascript
const config = {
  name: 'My Tournament',
  games: ['snake-GG', 'tetris-GG'],
  format: 'round-robin',
  settings: {
    maxParticipants: 8,
    scoreNormalization: true,
    autoAdvance: true
  }
};

const result = validateTournamentConfig(config);
if (result.isValid) {
  console.log('✅ Configuration is valid');
} else {
  console.log('❌ Errors:', result.errors);
}
```

### Data Sanitization
```javascript
const dirtyConfig = {
  name: '  My Tournament  ',
  games: ['snake-GG', 'snake-GG', 'tetris-GG'],
  format: 'invalid-format',
  settings: {
    maxParticipants: '8',
    scoreNormalization: 'true'
  }
};

const clean = sanitizeTournamentConfig(dirtyConfig);
// Result: clean name, no duplicates, valid format, proper types
```

### Storage Management
```javascript
const storage = new TournamentStorageManager();

// Get storage information
const info = storage.getStorageInfo();
console.log(`Total tournaments: ${info.totalTournaments}`);

// Export data for backup
const backup = storage.exportData();

// Reset all data (for testing)
storage.resetAllData();
```

## 🚀 Integration

The tournament models are designed to integrate seamlessly with:
- Existing game collection architecture
- Event bus system (shared-tournament-eventbus.js)
- Achievement system (shared-achievements.js)
- Audio system (shared-audio.js)

## 🔄 Schema Migration

The system includes a migration framework for future schema updates:
- Automatic version detection
- Incremental migration support
- Data integrity preservation
- Rollback capabilities

## 🛡️ Error Handling

Comprehensive error handling includes:
- Input validation with detailed error messages
- Storage operation error recovery
- Graceful degradation for unsupported environments
- Custom event dispatching for UI integration

## 📈 Performance

- Efficient validation with early returns
- Minimal memory footprint
- Lazy initialization of storage
- Automatic cleanup of old data
- Optimized for both Node.js and browser environments

---

**Status:** ✅ Implementation Complete
**Tests:** 21/21 Passing
**Browser Compatibility:** Chrome, Firefox, Safari, Edge
**Node.js Compatibility:** v14+
