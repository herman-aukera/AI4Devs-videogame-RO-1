/* © GG, MIT License */
/**
 * Shared Base Classes for Pac-Man and Ms. Pac-Man Games
 * Common functionality to avoid code duplication
 */

/**
 * Vector2D - Utility class for grid-aligned positions and directions
 */
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  // Convert to grid index (grid coordinates)
  toGridIndex() {
    return {
      col: Math.floor(this.x / CELL_SIZE),
      row: Math.floor(this.y / CELL_SIZE)
    };
  }

  // Convert from grid index (pixel coordinates, centered)
  static fromGrid(col, row) {
    return new Vector2D(
      col * CELL_SIZE + CELL_SIZE / 2,
      row * CELL_SIZE + CELL_SIZE / 2
    );
  }

  // Snap to grid alignment
  snapToGrid() {
    const gridCol = Math.round(this.x / CELL_SIZE);
    const gridRow = Math.round(this.y / CELL_SIZE);
    return Vector2D.fromGrid(gridCol, gridRow);
  }
}

/**
 * BaseAudioManager - Shared audio functionality
 */
class BaseAudioManager {
  constructor() {
    this.webAudioSupported = false;
    this.context = null;
    this.sounds = new Map();
    this.masterVolume = 0.5;
    this.fallbackAudio = new Map();
    
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.context = new AudioContext();
        this.webAudioSupported = true;
        console.log('Web Audio API detected and enabled');
      }
    } catch (e) {
      console.log('Web Audio API not available, using HTML5 Audio fallback');
      this.webAudioSupported = false;
    }

    if (!this.webAudioSupported) {
      this.createFallbackAudio();
    }
  }

  createFallbackAudio() {
    // Override in specific game implementations
  }

  async loadSound(name, frequency, type = 'sine', duration = 0.1) {
    if (this.webAudioSupported) {
      this.sounds.set(name, { frequency, type, duration });
    }
  }

  playSound(name, volume = 1) {
    if (this.webAudioSupported && this.sounds.has(name)) {
      this.playWebAudio(name, volume);
    } else if (this.fallbackAudio.has(name)) {
      this.playFallbackAudio(name, volume);
    }
  }

  playWebAudio(name, volume) {
    try {
      const sound = this.sounds.get(name);
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency, this.context.currentTime);
      
      gainNode.gain.setValueAtTime(volume * this.masterVolume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + sound.duration);
    } catch (e) {
      console.log('Error playing Web Audio:', e);
    }
  }

  playFallbackAudio(name, volume) {
    try {
      const audio = this.fallbackAudio.get(name);
      if (audio) {
        const audioClone = audio.cloneNode();
        audioClone.volume = volume * this.masterVolume;
        audioClone.currentTime = 0;
        audioClone.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (e) {
      console.log('Error playing fallback audio:', e);
    }
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * BaseInputManager - Shared input handling
 */
class BaseInputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.touchStartPos = null;
    this.swipeThreshold = 50;
    this.lastDirection = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!this.touchStartPos) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.lastDirection = deltaX > 0 ? 'right' : 'left';
        } else {
          this.lastDirection = deltaY > 0 ? 'down' : 'up';
        }
      }

      this.touchStartPos = null;
    });
  }

  getDirection() {
    // Prioritize touch input
    if (this.lastDirection) {
      const direction = this.lastDirection;
      this.lastDirection = null;
      return this.getDirectionVector(direction);
    }

    // Keyboard input
    for (const key of this.keys) {
      if (['ArrowUp', 'KeyW'].includes(key)) {
        return new Vector2D(0, -1);
      }
      if (['ArrowDown', 'KeyS'].includes(key)) {
        return new Vector2D(0, 1);
      }
      if (['ArrowLeft', 'KeyA'].includes(key)) {
        return new Vector2D(-1, 0);
      }
      if (['ArrowRight', 'KeyD'].includes(key)) {
        return new Vector2D(1, 0);
      }
    }

    return null;
  }

  getDirectionVector(direction) {
    switch (direction) {
      case 'up': return new Vector2D(0, -1);
      case 'down': return new Vector2D(0, 1);
      case 'left': return new Vector2D(-1, 0);
      case 'right': return new Vector2D(1, 0);
      default: return null;
    }
  }

  isPausePressed() {
    return Array.from(this.keys).some(key => 
      ['Space', 'KeyP'].includes(key)
    );
  }

  isStartPressed() {
    return Array.from(this.keys).some(key => 
      ['Enter'].includes(key)
    );
  }

  isRestartPressed() {
    return Array.from(this.keys).some(key => 
      ['KeyR'].includes(key)
    );
  }
}

/**
 * BaseGameEngine - Shared game engine functionality
 */
class BaseGameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = 'MENU';
    this.paused = false;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.highScore = 0;
    this.lastFrameTime = 0;
    this.frameCounter = 0;
  }

  async initialize() {
    // Override in specific implementations
  }

  gameLoop() {
    const now = performance.now();
    this.frameCounter++;

    if (this.gameState === 'MENU') {
      if (this.input.isStartPressed()) {
        this.startGame();
      }
      this.renderMenu();
    } else if (this.gameState === 'GAME_OVER') {
      if (this.input.isRestartPressed() || this.input.isStartPressed()) {
        this.resetGame();
        return;
      }
      this.render();
    } else {
      if (this.input.isPausePressed() && !this.pauseDebounce) {
        this.togglePause();
        this.pauseDebounce = true;
        setTimeout(() => this.pauseDebounce = false, 200);
      }

      this.update();
      this.render();
    }

    this.lastFrameTime = now;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    // Override in specific implementations
  }

  render() {
    // Override in specific implementations
  }

  renderMenu() {
    // Override in specific implementations
  }

  startGame() {
    this.gameState = 'PLAYING';
    this.gameStartTime = Date.now();
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      this.paused = true;
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      this.paused = false;
    }
  }

  resetGame() {
    // Override in specific implementations
  }

  /**
   * Base TDD Audit implementation - extend in specific games
   */
  runAuditTasks() {
    const results = [];
    
    // Core structure tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['MENU', 'PLAYING', 'PAUSED', 'GAME_OVER'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    // Performance test
    const frameRateOK = this.lastFrameTime && (performance.now() - this.lastFrameTime) < 20;
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    // Navigation test
    const backLink = document.querySelector('a[href*="index.html"]');
    const hasInicioText = backLink && backLink.textContent.includes('INICIO');
    results.push({ name: 'Navigation "INICIO"', pass: hasInicioText, critical: false });
    
    // Canvas test
    const canvas = document.querySelector('canvas');
    const isResponsive = canvas && getComputedStyle(canvas).maxWidth === '100%';
    results.push({ name: 'Responsive Canvas', pass: isResponsive, critical: true });
    
    console.log('🔍 Base TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    
    return { allPassed: results.every(r => r.pass), criticalPassed: allCriticalPassed, results };
  }
}

// Export classes if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Vector2D, BaseAudioManager, BaseInputManager, BaseGameEngine };
}
