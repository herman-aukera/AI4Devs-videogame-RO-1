/* © GG, MIT License */

/**
 * Game Integration Event Listeners for Cross-Game Tournament System
 *
 * This module provides non-invasive integration with existing games through:
 * - CustomEvent listeners for game completion events
 * - Automatic score capture from game completion
 * - Fallback mechanisms for manual score entry
 * - Game state monitoring and tournament mode detection
 * - Integration testing with all supported games
 */

// ============================================================================
// GAME INTEGRATION CONSTANTS AND CONFIGURATION
// ============================================================================

const GAME_INTEGRATION_CONFIG = {
  // Event types that games can dispatch
  eventTypes: {
    GAME_COMPLETE: 'game:complete',
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    SCORE_UPDATE: 'game:scoreUpdate'
  },

  // Game-specific integration settings
  gameSettings: {
    'snake-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'game-over-screen',
      gameOverVisibleCheck: 'not-hidden', // Check if 'hidden' class is removed
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'tetris-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      linesSelector: '#lines',
      gameOverSelector: '.game-over',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'pacman-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      livesSelector: '#lives',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'show',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'mspacman-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      livesSelector: '#lives',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'show',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'breakout-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'asteroids-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'show',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'space-invaders-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverlay',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'galaga-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'pong-GG': {
      scoreSelector: '#playerScore',
      gameOverSelector: '#gameOverScreen',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    },
    'fruit-catcher-GG': {
      scoreSelector: '#score',
      levelSelector: '#level',
      gameOverSelector: '#gameOverModal',
      gameOverClass: 'active',
      scoreProperty: 'textContent',
      fallbackMethod: 'domObserver'
    }
  },

  // Polling intervals for fallback mechanisms
  polling: {
    domObserver: 500,     // DOM mutation observer check interval
    scoreCheck: 1000,     // Score element polling interval
    gameStateCheck: 2000  // Game state polling interval
  },

  // Timeout settings
  timeouts: {
    gameDetection: 5000,  // Time to wait for game detection
    scoreCapture: 3000,   // Time to wait for score capture after game over
    eventResponse: 1000   // Time to wait for event response
  }
};

// ============================================================================
// GAME INTEGRATION EVENT LISTENER CLASS
// ============================================================================

class GameIntegrationEventListener {
  constructor(eventBus, options = {}) {
    this.eventBus = eventBus;
    this.options = { ...options };
    this.debugMode = options.debugMode || false;

    // Integration state
    this.activeIntegrations = new Map(); // gameId -> integration state
    this.tournamentMode = false;
    this.currentTournament = null;
    this.currentParticipant = null;

    // Event listeners and observers
    this.eventListeners = new Map();
    this.domObservers = new Map();
    this.pollingIntervals = new Map();

    // Score capture state
    this.lastCapturedScores = new Map(); // gameId -> last score
    this.pendingCaptures = new Map();    // gameId -> capture promise

    // Performance tracking
    this.performanceMetrics = {
      eventCaptureTime: [],
      scoreExtractionTime: [],
      integrationSetupTime: []
    };

    this.log('GameIntegrationEventListener initialized');
    this.setupGlobalEventListeners();
  }

  // ============================================================================
  // TOURNAMENT MODE MANAGEMENT
  // ============================================================================

  /**
   * Enable tournament mode for a specific tournament
   * @param {string} tournamentId - Tournament identifier
   * @param {string} participantId - Current participant identifier
   */
  enableTournamentMode(tournamentId, participantId) {
    this.tournamentMode = true;
    this.currentTournament = tournamentId;
    this.currentParticipant = participantId;

    this.log(`Tournament mode enabled for tournament ${tournamentId}, participant ${participantId}`);

    // Set up integrations for all games in the tournament
    this.setupTournamentIntegrations();

    // Dispatch tournament mode event
    this.eventBus.publish('tournament:modeEnabled', {
      tournamentId,
      participantId,
      timestamp: Date.now()
    });
  }

  /**
   * Disable tournament mode
   */
  disableTournamentMode() {
    const previousTournament = this.currentTournament;

    this.tournamentMode = false;
    this.currentTournament = null;
    this.currentParticipant = null;

    this.log('Tournament mode disabled');

    // Clean up tournament-specific integrations
    this.cleanupTournamentIntegrations();

    // Dispatch tournament mode event
    this.eventBus.publish('tournament:modeDisabled', {
      previousTournament,
      timestamp: Date.now()
    });
  }

  /**
   * Check if tournament mode is active
   * @returns {boolean} Tournament mode status
   */
  isTournamentMode() {
    return this.tournamentMode;
  }

  // ============================================================================
  // GAME INTEGRATION SETUP
  // ============================================================================

  /**
   * Set up integrations for all games in the current tournament
   */
  setupTournamentIntegrations() {
    if (!this.tournamentMode) {
      this.log('Cannot setup tournament integrations: tournament mode not enabled', 'warn');
      return;
    }

    // Get tournament games from tournament manager (would be injected in real implementation)
    const tournamentGames = this.getTournamentGames();

    tournamentGames.forEach(gameId => {
      this.setupGameIntegration(gameId);
    });
  }

  /**
   * Set up integration for a specific game
   * @param {string} gameId - Game identifier (e.g., 'snake-GG')
   * @returns {Promise<boolean>} Success status
   */
  async setupGameIntegration(gameId) {
    const startTime = performance.now();

    try {
      if (this.activeIntegrations.has(gameId)) {
        this.log(`Integration already active for ${gameId}`, 'warn');
        return true;
      }

      const gameConfig = GAME_INTEGRATION_CONFIG.gameSettings[gameId];
      if (!gameConfig) {
        throw new Error(`No integration configuration found for game: ${gameId}`);
      }

      // Create integration state
      const integrationState = {
        gameId,
        config: gameConfig,
        isActive: false,
        lastScore: null,
        lastLevel: null,
        gameStartTime: null,
        eventListeners: [],
        observers: [],
        intervals: []
      };

      // Set up primary event listeners
      await this.setupPrimaryEventListeners(integrationState);

      // Set up fallback mechanisms
      await this.setupFallbackMechanisms(integrationState);

      // Inject enhanced event dispatching for better integration
      this.injectEventDispatching(gameId);

      // Mark integration as active
      integrationState.isActive = true;
      this.activeIntegrations.set(gameId, integrationState);

      // Track performance
      const setupTime = performance.now() - startTime;
      this.performanceMetrics.integrationSetupTime.push(setupTime);

      this.log(`Integration setup completed for ${gameId}`, {
        setupTime: setupTime.toFixed(2) + 'ms',
        fallbackMethod: gameConfig.fallbackMethod
      });

      return true;

    } catch (error) {
      this.log(`Failed to setup integration for ${gameId}: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Set up primary CustomEvent listeners for a game
   * @param {Object} integrationState - Integration state object
   */
  async setupPrimaryEventListeners(integrationState) {
    const { gameId } = integrationState;

    // Listen for game completion events
    const gameCompleteListener = (event) => {
      this.handleGameCompleteEvent(gameId, event);
    };

    // Listen for score update events
    const scoreUpdateListener = (event) => {
      this.handleScoreUpdateEvent(gameId, event);
    };

    // Listen for game start events
    const gameStartListener = (event) => {
      this.handleGameStartEvent(gameId, event);
    };

    // Add event listeners
    window.addEventListener(GAME_INTEGRATION_CONFIG.eventTypes.GAME_COMPLETE, gameCompleteListener);
    window.addEventListener(GAME_INTEGRATION_CONFIG.eventTypes.SCORE_UPDATE, scoreUpdateListener);
    window.addEventListener(GAME_INTEGRATION_CONFIG.eventTypes.GAME_START, gameStartListener);

    // Store listeners for cleanup
    integrationState.eventListeners.push(
      { type: GAME_INTEGRATION_CONFIG.eventTypes.GAME_COMPLETE, listener: gameCompleteListener },
      { type: GAME_INTEGRATION_CONFIG.eventTypes.SCORE_UPDATE, listener: scoreUpdateListener },
      { type: GAME_INTEGRATION_CONFIG.eventTypes.GAME_START, listener: gameStartListener }
    );

    this.log(`Primary event listeners setup for ${gameId}`);
  }

  /**
   * Set up fallback mechanisms for score capture
   * @param {Object} integrationState - Integration state object
   */
  async setupFallbackMechanisms(integrationState) {
    const { gameId, config } = integrationState;

    switch (config.fallbackMethod) {
      case 'domObserver':
        await this.setupDOMObserver(integrationState);
        break;
      case 'polling':
        await this.setupPolling(integrationState);
        break;
      case 'hybrid':
        await this.setupDOMObserver(integrationState);
        await this.setupPolling(integrationState);
        break;
      default:
        this.log(`Unknown fallback method: ${config.fallbackMethod}`, 'warn');
    }
  }

  /**
   * Set up DOM mutation observer for game state changes
   * @param {Object} integrationState - Integration state object
   */
  async setupDOMObserver(integrationState) {
    const { gameId, config } = integrationState;

    // Wait for game elements to be available
    const gameOverElement = await this.waitForElement(config.gameOverSelector);
    if (!gameOverElement) {
      this.log(`Game over element not found for ${gameId}: ${config.gameOverSelector}`, 'warn');
      // Set up polling as fallback if DOM observer can't be established
      await this.setupPolling(integrationState);
      return;
    }

    // Create mutation observer for game over state
    const gameOverObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.handleGameOverStateChange(gameId, mutation.target);
        }
        // Also observe style changes (some games use display: block/none)
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          this.handleGameOverStyleChange(gameId, mutation.target);
        }
      });
    });

    // Observe both class and style changes on game over element
    gameOverObserver.observe(gameOverElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Store observer for cleanup
    integrationState.observers.push(gameOverObserver);

    // Also observe score changes for real-time updates
    const scoreElement = await this.waitForElement(config.scoreSelector);
    if (scoreElement) {
      const scoreObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            this.handleScoreChange(gameId, mutation.target);
          }
        });
      });

      scoreObserver.observe(scoreElement, {
        childList: true,
        subtree: true,
        characterData: true
      });

      integrationState.observers.push(scoreObserver);
      this.log(`Score observer setup for ${gameId} on element: ${config.scoreSelector}`);
    }

    this.log(`DOM observer setup for ${gameId} on element: ${config.gameOverSelector}`);
  }

  /**
   * Set up polling mechanism for score capture
   * @param {Object} integrationState - Integration state object
   */
  async setupPolling(integrationState) {
    const { gameId, config } = integrationState;

    // Set up score polling with adaptive frequency
    const scoreInterval = setInterval(() => {
      this.pollGameScore(gameId);
    }, GAME_INTEGRATION_CONFIG.polling.scoreCheck);

    // Set up game state polling
    const stateInterval = setInterval(() => {
      this.pollGameState(gameId);
    }, GAME_INTEGRATION_CONFIG.polling.gameStateCheck);

    // Set up game start detection polling (look for score reset to 0)
    const startDetectionInterval = setInterval(() => {
      this.pollGameStart(gameId);
    }, GAME_INTEGRATION_CONFIG.polling.scoreCheck);

    // Store intervals for cleanup
    integrationState.intervals.push(scoreInterval, stateInterval, startDetectionInterval);

    this.log(`Enhanced polling setup for ${gameId} (score: ${GAME_INTEGRATION_CONFIG.polling.scoreCheck}ms, state: ${GAME_INTEGRATION_CONFIG.polling.gameStateCheck}ms)`);
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle game completion CustomEvent
   * @param {string} gameId - Game identifier
   * @param {CustomEvent} event - Game completion event
   */
  handleGameCompleteEvent(gameId, event) {
    const startTime = performance.now();

    try {
      // Validate event data
      if (!event.detail || !event.detail.gameId || event.detail.gameId !== gameId) {
        this.log(`Invalid game complete event for ${gameId}`, 'warn');
        return;
      }

      const eventData = event.detail;

      this.log(`Game complete event received for ${gameId}`, eventData);

      // Extract score and metadata
      const scoreData = this.extractScoreFromEvent(eventData);

      // Capture and process the score
      this.captureGameScore(gameId, scoreData);

      // Track performance
      const processingTime = performance.now() - startTime;
      this.performanceMetrics.eventCaptureTime.push(processingTime);

    } catch (error) {
      this.log(`Error handling game complete event for ${gameId}: ${error.message}`, 'error');
    }
  }

  /**
   * Handle score update CustomEvent
   * @param {string} gameId - Game identifier
   * @param {CustomEvent} event - Score update event
   */
  handleScoreUpdateEvent(gameId, event) {
    if (!this.tournamentMode) return;

    try {
      const eventData = event.detail;
      if (eventData.gameId === gameId) {
        // Update last known score
        const integration = this.activeIntegrations.get(gameId);
        if (integration) {
          integration.lastScore = eventData.score;
          integration.lastLevel = eventData.level;
        }

        this.log(`Score update for ${gameId}: ${eventData.score}`);
      }
    } catch (error) {
      this.log(`Error handling score update for ${gameId}: ${error.message}`, 'error');
    }
  }

  /**
   * Handle game start CustomEvent
   * @param {string} gameId - Game identifier
   * @param {CustomEvent} event - Game start event
   */
  handleGameStartEvent(gameId, event) {
    if (!this.tournamentMode) return;

    try {
      const integration = this.activeIntegrations.get(gameId);
      if (integration) {
        integration.gameStartTime = Date.now();
        integration.lastScore = 0;
        integration.lastLevel = 1;
      }

      this.log(`Game started for ${gameId}`);

      // Notify tournament system
      this.eventBus.publish('tournament:gameStarted', {
        gameId,
        participantId: this.currentParticipant,
        tournamentId: this.currentTournament,
        timestamp: Date.now()
      });

    } catch (error) {
      this.log(`Error handling game start for ${gameId}: ${error.message}`, 'error');
    }
  }

  /**
   * Handle game over state change from DOM observer
   * @param {string} gameId - Game identifier
   * @param {Element} element - Game over element
   */
  handleGameOverStateChange(gameId, element) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    const config = integration.config;
    const isGameOver = this.isGameOverState(element, config);

    if (isGameOver && this.tournamentMode) {
      this.log(`Game over detected via DOM observer for ${gameId}`);

      // Delay score capture to allow UI updates
      setTimeout(() => {
        this.captureScoreFromDOM(gameId);
      }, 500);
    }
  }

  /**
   * Handle game over style change from DOM observer
   * @param {string} gameId - Game identifier
   * @param {Element} element - Game over element
   */
  handleGameOverStyleChange(gameId, element) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration || !this.tournamentMode) return;

    // Check if element became visible (display: block, visibility: visible, etc.)
    const computedStyle = window.getComputedStyle(element);
    const isVisible = computedStyle.display !== 'none' &&
      computedStyle.visibility !== 'hidden' &&
      computedStyle.opacity !== '0';

    if (isVisible) {
      this.log(`Game over detected via style change for ${gameId}`);

      // Delay score capture to allow UI updates
      setTimeout(() => {
        this.captureScoreFromDOM(gameId);
      }, 500);
    }
  }

  /**
   * Handle score change from DOM observer
   * @param {string} gameId - Game identifier
   * @param {Element} element - Score element
   */
  handleScoreChange(gameId, element) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration || !this.tournamentMode) return;

    try {
      const config = integration.config;
      const currentScore = this.extractNumberFromElement(element, config.scoreProperty);

      if (currentScore !== integration.lastScore && currentScore > 0) {
        integration.lastScore = currentScore;

        // Dispatch score update event for real-time tracking
        this.eventBus.publish('tournament:scoreUpdate', {
          gameId,
          participantId: this.currentParticipant,
          score: currentScore,
          timestamp: Date.now()
        });

        this.log(`Score update detected for ${gameId}: ${currentScore}`);
      }
    } catch (error) {
      this.log(`Error handling score change for ${gameId}: ${error.message}`, 'error');
    }
  }

  // ============================================================================
  // SCORE CAPTURE METHODS
  // ============================================================================

  /**
   * Capture game score from various sources
   * @param {string} gameId - Game identifier
   * @param {Object} scoreData - Score data object
   */
  async captureGameScore(gameId, scoreData) {
    if (!this.tournamentMode) {
      this.log(`Score capture skipped for ${gameId}: tournament mode not active`);
      return;
    }

    const startTime = performance.now();

    try {
      // Prevent duplicate captures
      if (this.pendingCaptures.has(gameId)) {
        this.log(`Score capture already pending for ${gameId}`, 'warn');
        return;
      }

      // Mark capture as pending
      this.pendingCaptures.set(gameId, true);

      // Validate and sanitize score data
      const validatedScore = this.validateScoreData(gameId, scoreData);

      // Create tournament score event
      const tournamentScoreEvent = {
        gameId,
        participantId: this.currentParticipant,
        tournamentId: this.currentTournament,
        score: validatedScore.score,
        level: validatedScore.level,
        duration: validatedScore.duration,
        timestamp: Date.now(),
        metadata: validatedScore.metadata || {}
      };

      // Publish to tournament system
      this.eventBus.publish('tournament:scoreCapture', tournamentScoreEvent);

      // Update last captured score
      this.lastCapturedScores.set(gameId, validatedScore.score);

      // Track performance
      const captureTime = performance.now() - startTime;
      this.performanceMetrics.scoreExtractionTime.push(captureTime);

      this.log(`Score captured for ${gameId}`, {
        score: validatedScore.score,
        level: validatedScore.level,
        duration: validatedScore.duration,
        captureTime: captureTime.toFixed(2) + 'ms'
      });

    } catch (error) {
      this.log(`Failed to capture score for ${gameId}: ${error.message}`, 'error');

      // Attempt fallback score capture
      this.attemptFallbackScoreCapture(gameId);

    } finally {
      // Clear pending capture
      this.pendingCaptures.delete(gameId);
    }
  }

  /**
   * Capture score from DOM elements (fallback method)
   * @param {string} gameId - Game identifier
   */
  async captureScoreFromDOM(gameId) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    const config = integration.config;

    try {
      // Extract score from DOM
      const scoreElement = document.querySelector(config.scoreSelector);
      const levelElement = document.querySelector(config.levelSelector);

      if (!scoreElement) {
        throw new Error(`Score element not found: ${config.scoreSelector}`);
      }

      const score = this.extractNumberFromElement(scoreElement, config.scoreProperty);
      const level = levelElement ? this.extractNumberFromElement(levelElement, config.scoreProperty) : 1;

      // Calculate duration if game start time is available
      const duration = integration.gameStartTime ? Date.now() - integration.gameStartTime : null;

      // Create score data object
      const scoreData = {
        score,
        level,
        duration,
        source: 'dom',
        metadata: {
          captureMethod: 'fallback',
          domSelector: config.scoreSelector
        }
      };

      // Capture the score
      await this.captureGameScore(gameId, scoreData);

    } catch (error) {
      this.log(`DOM score capture failed for ${gameId}: ${error.message}`, 'error');

      // Show manual score entry as last resort
      this.showManualScoreEntry(gameId);
    }
  }

  /**
   * Attempt fallback score capture methods
   * @param {string} gameId - Game identifier
   */
  async attemptFallbackScoreCapture(gameId) {
    this.log(`Attempting fallback score capture for ${gameId}`);

    try {
      // Try DOM capture first
      await this.captureScoreFromDOM(gameId);
    } catch (error) {
      this.log(`Fallback DOM capture failed for ${gameId}: ${error.message}`, 'error');

      // Try polling the last known score
      const integration = this.activeIntegrations.get(gameId);
      if (integration && integration.lastScore !== null) {
        const scoreData = {
          score: integration.lastScore,
          level: integration.lastLevel || 1,
          duration: integration.gameStartTime ? Date.now() - integration.gameStartTime : null,
          source: 'lastKnown',
          metadata: { captureMethod: 'lastKnown' }
        };

        await this.captureGameScore(gameId, scoreData);
      } else {
        // Final fallback: manual entry
        this.showManualScoreEntry(gameId);
      }
    }
  }

  /**
   * Show manual score entry interface
   * @param {string} gameId - Game identifier
   */
  showManualScoreEntry(gameId) {
    this.log(`Showing manual score entry for ${gameId}`);

    // Dispatch event for UI to show manual entry
    this.eventBus.publish('tournament:manualScoreEntry', {
      gameId,
      participantId: this.currentParticipant,
      tournamentId: this.currentTournament,
      timestamp: Date.now()
    });
  }

  /**
   * Handle manual score entry submission
   * @param {string} gameId - Game identifier
   * @param {number} score - Manually entered score
   * @param {Object} metadata - Additional metadata
   */
  async handleManualScoreEntry(gameId, score, metadata = {}) {
    const scoreData = {
      score: parseInt(score) || 0,
      level: metadata.level || 1,
      duration: metadata.duration || null,
      source: 'manual',
      metadata: {
        captureMethod: 'manual',
        entryTime: Date.now(),
        ...metadata
      }
    };

    await this.captureGameScore(gameId, scoreData);
  }

  // ============================================================================
  // POLLING METHODS
  // ============================================================================

  /**
   * Poll game score for changes
   * @param {string} gameId - Game identifier
   */
  pollGameScore(gameId) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    try {
      const config = integration.config;
      const scoreElement = document.querySelector(config.scoreSelector);

      if (scoreElement) {
        const currentScore = this.extractNumberFromElement(scoreElement, config.scoreProperty);

        if (currentScore !== integration.lastScore) {
          integration.lastScore = currentScore;

          // Dispatch score update event
          this.eventBus.publish('tournament:scoreUpdate', {
            gameId,
            score: currentScore,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      this.log(`Score polling error for ${gameId}: ${error.message}`, 'error');
    }
  }

  /**
   * Poll game state for game over condition
   * @param {string} gameId - Game identifier
   */
  pollGameState(gameId) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    try {
      const config = integration.config;
      const gameOverElement = document.querySelector(config.gameOverSelector);

      if (gameOverElement) {
        const isGameOver = this.isGameOverState(gameOverElement, config);

        if (isGameOver) {
          this.handleGameOverStateChange(gameId, gameOverElement);
        }
      }
    } catch (error) {
      this.log(`Game state polling error for ${gameId}: ${error.message}`, 'error');
    }
  }

  /**
   * Poll for game start detection (score reset to 0)
   * @param {string} gameId - Game identifier
   */
  pollGameStart(gameId) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration || !this.tournamentMode) return;

    try {
      const config = integration.config;
      const scoreElement = document.querySelector(config.scoreSelector);

      if (scoreElement) {
        const currentScore = this.extractNumberFromElement(scoreElement, config.scoreProperty);

        // Detect game start when score resets to 0 from a higher value
        if (currentScore === 0 && integration.lastScore > 0) {
          integration.gameStartTime = Date.now();
          integration.lastScore = 0;

          // Notify tournament system of game start
          this.eventBus.publish('tournament:gameStarted', {
            gameId,
            participantId: this.currentParticipant,
            tournamentId: this.currentTournament,
            timestamp: Date.now()
          });

          this.log(`Game start detected for ${gameId} (score reset to 0)`);
        }
      }
    } catch (error) {
      this.log(`Game start polling error for ${gameId}: ${error.message}`, 'error');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Extract score data from CustomEvent
   * @param {Object} eventData - Event detail data
   * @returns {Object} Extracted score data
   */
  extractScoreFromEvent(eventData) {
    return {
      score: eventData.score || 0,
      level: eventData.level || 1,
      duration: eventData.duration || null,
      source: 'event',
      metadata: eventData.metadata || {}
    };
  }

  /**
   * Validate and sanitize score data
   * @param {string} gameId - Game identifier
   * @param {Object} scoreData - Raw score data
   * @returns {Object} Validated score data
   */
  validateScoreData(gameId, scoreData) {
    const validated = {
      score: Math.max(0, parseInt(scoreData.score) || 0),
      level: Math.max(1, parseInt(scoreData.level) || 1),
      duration: scoreData.duration && scoreData.duration > 0 ? scoreData.duration : null,
      source: scoreData.source || 'unknown',
      metadata: scoreData.metadata || {}
    };

    // Add game-specific validation
    const gameProfile = this.getGameProfile(gameId);
    if (gameProfile && validated.score > gameProfile.maxReasonableScore * 2) {
      this.log(`Unusually high score for ${gameId}: ${validated.score}`, 'warn');
      validated.metadata.highScoreWarning = true;
    }

    return validated;
  }

  /**
   * Extract numeric value from DOM element
   * @param {Element} element - DOM element
   * @param {string} property - Property to extract from
   * @returns {number} Extracted number
   */
  extractNumberFromElement(element, property) {
    const text = element[property] || element.textContent || '0';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Wait for DOM element to be available
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element|null>} Element or null if timeout
   */
  waitForElement(selector, timeout = GAME_INTEGRATION_CONFIG.timeouts.gameDetection) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Get game profile from score aggregator (would be injected in real implementation)
   * @param {string} gameId - Game identifier
   * @returns {Object|null} Game profile
   */
  getGameProfile(gameId) {
    // This would be injected from the ScoreAggregator in real implementation
    // For now, return null to avoid dependency
    return null;
  }

  /**
   * Get tournament games (would be injected in real implementation)
   * @returns {string[]} Array of game IDs
   */
  getTournamentGames() {
    // This would be injected from the TournamentManager in real implementation
    // For testing, return the initially supported games
    return ['snake-GG', 'tetris-GG', 'pacman-GG'];
  }

  /**
   * Inject event dispatching into existing games (non-invasive enhancement)
   * This method adds tournament event dispatching to games without modifying their core logic
   * @param {string} gameId - Game identifier
   * @returns {boolean} Success status
   */
  injectEventDispatching(gameId) {
    try {
      const config = GAME_INTEGRATION_CONFIG.gameSettings[gameId];
      if (!config) {
        this.log(`No configuration found for ${gameId}`, 'warn');
        return false;
      }

      // Create a wrapper for the game's existing functions
      this.wrapGameFunctions(gameId, config);

      this.log(`Event dispatching injected for ${gameId}`);
      return true;

    } catch (error) {
      this.log(`Failed to inject event dispatching for ${gameId}: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Wrap game functions to add event dispatching
   * @param {string} gameId - Game identifier
   * @param {Object} config - Game configuration
   */
  wrapGameFunctions(gameId, config) {
    // This is a non-invasive approach that monitors DOM changes and game state
    // without modifying the original game code

    // Set up enhanced monitoring for this game
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    // Monitor for rapid score changes that indicate game completion
    const lastScoreCheckTime = Date.now();
    let scoreStableCount = 0;

    const enhancedScoreMonitor = setInterval(() => {
      const scoreElement = document.querySelector(config.scoreSelector);
      const gameOverElement = document.querySelector(config.gameOverSelector);

      if (scoreElement && gameOverElement) {
        const currentScore = this.extractNumberFromElement(scoreElement, config.scoreProperty);
        const isGameOver = this.isGameOverState(gameOverElement, config);

        // Detect game completion by stable score + game over state
        if (isGameOver && currentScore > 0) {
          if (integration.lastScore === currentScore) {
            scoreStableCount++;

            // If score has been stable for 3 checks and game is over, capture it
            if (scoreStableCount >= 3) {
              this.dispatchGameCompleteEvent(gameId, currentScore, integration);
              scoreStableCount = 0;
            }
          } else {
            scoreStableCount = 0;
            integration.lastScore = currentScore;
          }
        } else {
          scoreStableCount = 0;
        }
      }
    }, 500); // Check every 500ms

    integration.intervals.push(enhancedScoreMonitor);
  }

  /**
   * Check if game is in game over state
   * @param {Element} gameOverElement - Game over element
   * @param {Object} config - Game configuration
   * @returns {boolean} True if game is over
   */
  isGameOverState(gameOverElement, config) {
    // Check for "not-hidden" pattern (game over when 'hidden' class is removed)
    if (config.gameOverVisibleCheck === 'not-hidden') {
      return !gameOverElement.classList.contains('hidden');
    }

    // Check class-based game over (positive class)
    if (config.gameOverClass && gameOverElement.classList.contains(config.gameOverClass)) {
      return true;
    }

    // Check style-based game over
    const computedStyle = window.getComputedStyle(gameOverElement);
    return computedStyle.display !== 'none' &&
      computedStyle.visibility !== 'hidden' &&
      computedStyle.opacity !== '0';
  }

  /**
   * Dispatch a synthetic game complete event
   * @param {string} gameId - Game identifier
   * @param {number} score - Final score
   * @param {Object} integration - Integration state
   */
  dispatchGameCompleteEvent(gameId, score, integration) {
    const config = integration.config;

    // Extract additional game data
    const levelElement = document.querySelector(config.levelSelector);
    const level = levelElement ? this.extractNumberFromElement(levelElement, config.scoreProperty) : 1;

    const duration = integration.gameStartTime ? Date.now() - integration.gameStartTime : null;

    // Create and dispatch synthetic game complete event
    const gameCompleteEvent = new CustomEvent('game:complete', {
      detail: {
        gameId,
        score,
        level,
        duration,
        timestamp: Date.now(),
        metadata: {
          source: 'injected',
          captureMethod: 'enhanced-monitoring'
        }
      }
    });

    window.dispatchEvent(gameCompleteEvent);
    this.log(`Dispatched synthetic game complete event for ${gameId}`, { score, level, duration });
  }

  // ============================================================================
  // CLEANUP METHODS
  // ============================================================================

  /**
   * Clean up tournament-specific integrations
   */
  cleanupTournamentIntegrations() {
    this.activeIntegrations.forEach((integration, gameId) => {
      this.cleanupGameIntegration(gameId);
    });

    this.activeIntegrations.clear();
    this.log('Tournament integrations cleaned up');
  }

  /**
   * Clean up integration for a specific game
   * @param {string} gameId - Game identifier
   */
  cleanupGameIntegration(gameId) {
    const integration = this.activeIntegrations.get(gameId);
    if (!integration) return;

    // Remove event listeners
    integration.eventListeners.forEach(({ type, listener }) => {
      window.removeEventListener(type, listener);
    });

    // Disconnect observers
    integration.observers.forEach(observer => {
      observer.disconnect();
    });

    // Clear intervals
    integration.intervals.forEach(interval => {
      clearInterval(interval);
    });

    // Remove from active integrations
    this.activeIntegrations.delete(gameId);

    this.log(`Integration cleaned up for ${gameId}`);
  }

  /**
   * Set up global event listeners for system events
   */
  setupGlobalEventListeners() {
    // Listen for manual score entry events
    this.eventBus.subscribe('tournament:manualScoreSubmit', (event) => {
      const { gameId, score, metadata } = event.data;
      this.handleManualScoreEntry(gameId, score, metadata);
    });

    // Listen for tournament mode changes
    this.eventBus.subscribe('tournament:modeChange', (event) => {
      const { enabled, tournamentId, participantId } = event.data;
      if (enabled) {
        this.enableTournamentMode(tournamentId, participantId);
      } else {
        this.disableTournamentMode();
      }
    });
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
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
      eventCapture: calculateStats(this.performanceMetrics.eventCaptureTime),
      scoreExtraction: calculateStats(this.performanceMetrics.scoreExtractionTime),
      integrationSetup: calculateStats(this.performanceMetrics.integrationSetupTime),
      activeIntegrations: this.activeIntegrations.size,
      tournamentMode: this.tournamentMode
    };
  }

  /**
   * Get integration status for all games
   * @returns {Object} Integration status
   */
  getIntegrationStatus() {
    const status = {};

    Object.keys(GAME_INTEGRATION_CONFIG.gameSettings).forEach(gameId => {
      const integration = this.activeIntegrations.get(gameId);
      status[gameId] = {
        isActive: integration ? integration.isActive : false,
        lastScore: integration ? integration.lastScore : null,
        hasEventListeners: integration ? integration.eventListeners.length > 0 : false,
        hasObservers: integration ? integration.observers.length > 0 : false,
        hasPolling: integration ? integration.intervals.length > 0 : false
      };
    });

    return status;
  }

  /**
   * Logging utility
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} level - Log level
   */
  log(message, data = null, level = 'info') {
    if (!this.debugMode && level === 'info') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[GameIntegration ${timestamp}] ${message}`;

    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }

  // ============================================================================
  // TESTING AND AUDIT METHODS
  // ============================================================================

  /**
   * Test integration with specific games
   * @param {string[]} gameIds - Array of game IDs to test
   * @returns {Object} Test results
   */
  async testGameIntegration(gameIds = ['snake-GG', 'tetris-GG', 'pacman-GG']) {
    const results = {
      timestamp: new Date().toISOString(),
      totalGames: gameIds.length,
      successful: 0,
      failed: 0,
      details: {}
    };

    for (const gameId of gameIds) {
      try {
        const success = await this.setupGameIntegration(gameId);
        const elements = await this.checkGameElements(gameId);

        // Test fallback mechanisms
        const fallbackTest = await this.testFallbackCapture(gameId);

        results.details[gameId] = {
          success,
          hasConfig: !!GAME_INTEGRATION_CONFIG.gameSettings[gameId],
          elementsFound: elements,
          integrationActive: this.activeIntegrations.has(gameId),
          fallbackWorking: fallbackTest.success,
          fallbackDetails: fallbackTest.details
        };

        if (success && fallbackTest.success) {
          results.successful++;
        } else {
          results.failed++;
        }

        // Clean up test integration
        this.cleanupGameIntegration(gameId);

      } catch (error) {
        results.failed++;
        results.details[gameId] = {
          success: false,
          error: error.message
        };
      }
    }

    this.log('Game integration test completed', results);
    return results;
  }

  /**
   * Test fallback score capture mechanism for a game
   * @param {string} gameId - Game identifier
   * @returns {Object} Test result
   */
  async testFallbackCapture(gameId) {
    try {
      const config = GAME_INTEGRATION_CONFIG.gameSettings[gameId];
      if (!config) {
        return { success: false, details: 'No configuration found' };
      }

      // Check if score element exists and can be read
      const scoreElement = document.querySelector(config.scoreSelector);
      if (!scoreElement) {
        return { success: false, details: `Score element not found: ${config.scoreSelector}` };
      }

      const score = this.extractNumberFromElement(scoreElement, config.scoreProperty);

      // Check if game over element exists
      const gameOverElement = document.querySelector(config.gameOverSelector);
      if (!gameOverElement) {
        return { success: false, details: `Game over element not found: ${config.gameOverSelector}` };
      }

      return {
        success: true,
        details: {
          scoreExtracted: score,
          scoreElement: config.scoreSelector,
          gameOverElement: config.gameOverSelector,
          fallbackMethod: config.fallbackMethod
        }
      };

    } catch (error) {
      return {
        success: false,
        details: `Error testing fallback: ${error.message}`
      };
    }
  }

  /**
   * Check if game elements are available in DOM
   * @param {string} gameId - Game identifier
   * @returns {Object} Element availability status
   */
  async checkGameElements(gameId) {
    const config = GAME_INTEGRATION_CONFIG.gameSettings[gameId];
    if (!config) return { error: 'No config found' };

    const elements = {
      score: !!document.querySelector(config.scoreSelector),
      gameOver: !!document.querySelector(config.gameOverSelector)
    };

    if (config.levelSelector) {
      elements.level = !!document.querySelector(config.levelSelector);
    }

    return elements;
  }

  /**
   * Run comprehensive audit of the integration system
   * @returns {Object} Audit results
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

    console.log('🧪 Running Game Integration Audit Tasks...\n');

    // Core functionality tests
    results.tests.push(this.testEventBusIntegration());
    results.tests.push(this.testConfigurationIntegrity());
    results.tests.push(this.testScoreValidation());
    results.tests.push(this.testFallbackMechanisms());

    // Performance tests
    results.performance = this.getPerformanceMetrics();

    // Integration status
    results.integration = this.getIntegrationStatus();

    // Calculate summary
    results.passed = results.tests.filter(t => t.passed).length;
    results.failed = results.tests.filter(t => !t.passed).length;
    results.summary = {
      totalTests: results.tests.length,
      passRate: (results.passed / results.tests.length * 100).toFixed(1) + '%',
      supportedGames: Object.keys(GAME_INTEGRATION_CONFIG.gameSettings).length,
      tournamentMode: this.tournamentMode
    };

    // Output results
    console.table(results.tests);
    console.log('\n📊 Performance Metrics:', results.performance);
    console.log('🎮 Integration Status:', results.integration);
    console.log('📋 Summary:', results.summary);

    if (results.failed === 0) {
      console.log('\n🎉 All Game Integration audit tasks passed!');
    } else {
      console.log(`\n❌ ${results.failed} audit tasks failed`);
    }

    return results;
  }

  testEventBusIntegration() {
    try {
      if (!this.eventBus || typeof this.eventBus.publish !== 'function') {
        throw new Error('EventBus not properly initialized');
      }

      // Test event publishing
      this.eventBus.publish('test:integration', { test: true });

      return {
        name: 'EventBus Integration',
        passed: true,
        details: 'EventBus properly connected and functional'
      };
    } catch (error) {
      return {
        name: 'EventBus Integration',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testConfigurationIntegrity() {
    try {
      const supportedGames = Object.keys(GAME_INTEGRATION_CONFIG.gameSettings);
      const requiredProperties = ['scoreSelector', 'gameOverSelector', 'gameOverClass'];

      for (const gameId of supportedGames) {
        const config = GAME_INTEGRATION_CONFIG.gameSettings[gameId];
        for (const prop of requiredProperties) {
          if (!config[prop]) {
            throw new Error(`Game ${gameId} missing required property: ${prop}`);
          }
        }
      }

      return {
        name: 'Configuration Integrity',
        passed: true,
        details: `Validated ${supportedGames.length} game configurations`
      };
    } catch (error) {
      return {
        name: 'Configuration Integrity',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testScoreValidation() {
    try {
      const testScores = [
        { score: 1000, level: 5, expected: { score: 1000, level: 5 } },
        { score: -100, level: 0, expected: { score: 0, level: 1 } },
        { score: 'invalid', level: 'invalid', expected: { score: 0, level: 1 } }
      ];

      for (const test of testScores) {
        const validated = this.validateScoreData('snake-GG', test);
        if (validated.score !== test.expected.score || validated.level !== test.expected.level) {
          throw new Error(`Score validation failed for input: ${JSON.stringify(test)}`);
        }
      }

      return {
        name: 'Score Validation',
        passed: true,
        details: `Validated ${testScores.length} score scenarios`
      };
    } catch (error) {
      return {
        name: 'Score Validation',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }

  testFallbackMechanisms() {
    try {
      const supportedMethods = ['domObserver', 'polling', 'hybrid'];
      const gameConfigs = Object.values(GAME_INTEGRATION_CONFIG.gameSettings);

      for (const config of gameConfigs) {
        if (!supportedMethods.includes(config.fallbackMethod)) {
          throw new Error(`Unsupported fallback method: ${config.fallbackMethod}`);
        }
      }

      return {
        name: 'Fallback Mechanisms',
        passed: true,
        details: `Validated fallback methods for ${gameConfigs.length} games`
      };
    } catch (error) {
      return {
        name: 'Fallback Mechanisms',
        passed: false,
        details: `Error: ${error.message}`
      };
    }
  }
}

// ============================================================================
// EXPORTS AND INITIALIZATION
// ============================================================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GameIntegrationEventListener,
    GAME_INTEGRATION_CONFIG
  };
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.GameIntegrationEventListener = GameIntegrationEventListener;
  window.GAME_INTEGRATION_CONFIG = GAME_INTEGRATION_CONFIG;
}
