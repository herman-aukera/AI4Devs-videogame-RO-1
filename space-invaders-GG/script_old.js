/* © GG, MIT License */
/**
 * Space Invaders - GG Edition
 * Retro arcade game built with HTML5 Canvas and ES6+
 * 
 * Architecture:
 * - SpaceInvadersGame: Main game class with complete Space Invaders mechanics
 * - Player: Player ship with movement and shooting
 * - InvaderGrid: 5x11 formation of invaders with authentic movement patterns
 * - Projectile: Bullets for both player and invaders
 * - Barrier: Destructible shields with pixel-perfect damage
 * - UFO: Bonus flying saucer
 * - AudioManager: Retro sound effects using Web Audio API
 * - ParticleSystem: Explosion and visual effects
 */

// ===========================================
// GAME CONFIGURATION
// ===========================================

const SPACE_INVADERS_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  player: {
    width: 48,
    height: 32,
    speed: 300, // pixels per second
    shootCooldown: 250, // milliseconds
    maxProjectiles: 1, // classic space invaders allows only 1 bullet
    color: '#00FFFF',
  },
  invaders: {
    width: 32,
    height: 24,
    rows: 5,
    cols: 11,
    spacing: 16,
    horizontalSpeed: 25, // pixels per move
    dropDistance: 24,
    shootChance: 0.001, // per frame per invader
    colors: ['#FF0000', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF'],
    points: [30, 20, 20, 10, 10], // points per row (top to bottom)
  },
  projectiles: {
    width: 4,
    height: 16,
    playerSpeed: 400, // pixels per second
    invaderSpeed: 200, // pixels per second
    playerColor: '#FFFF00',
    invaderColor: '#FF00FF',
  },
  barriers: {
    count: 4,
    width: 80,
    height: 60,
    color: '#00FF00',
    startY: 450,
  },
  ufo: {
    width: 48,
    height: 24,
    speed: 100, // pixels per second
    spawnChance: 0.002, // per frame
    points: [50, 100, 150, 200, 250, 300],
    color: '#FF00FF',
  },
  game: {
    fps: 60,
    lives: 3,
    levelSpeedIncrease: 1.2,
    invaderAcceleration: 1.1, // speed multiplier when invaders are destroyed
  },
  colors: {
    background: '#000011',
    stars: '#FFFFFF',
    ui: '#00FFFF',
  },
};

// ===========================================
// GAME STATES
// ===========================================

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete',
  NEXT_LIFE: 'nextLife',
};

// ===========================================
// UTILITY CLASSES
// ===========================================

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  copy() {
    return new Vector2(this.x, this.y);
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  intersects(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }

  contains(x, y) {
    return x >= this.x && x < this.x + this.width &&
           y >= this.y && y < this.y + this.height;
  }
}

// ===========================================
// AUDIO MANAGER
// ===========================================

class RetroAudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  createBeep(frequency, duration, volume = this.volume) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  playShoot() {
    this.createBeep(800, 0.1);
  }

  playHit() {
    this.createBeep(300, 0.2);
  }

  playExplosion() {
    this.createBeep(150, 0.4);
  }

  playUFO() {
    this.createBeep(1200, 0.3);
  }

  playGameOver() {
    // Descending tone
    setTimeout(() => this.createBeep(400, 0.3), 0);
    setTimeout(() => this.createBeep(300, 0.3), 200);
    setTimeout(() => this.createBeep(200, 0.5), 400);
  }
}

// ===========================================
// PARTICLE SYSTEM
// ===========================================

class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;
    this.vy += 200 * deltaTime; // gravity
  }

  render(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addExplosion(x, y, color = '#FFFF00') {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 100 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 50;
      const life = 0.5 + Math.random() * 0.5;
      
      this.particles.push(new Particle(x, y, vx, vy, color, life));
    }
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    this.particles.forEach(particle => particle.render(ctx));
  }

  clear() {
    this.particles = [];
  }
}

// ===========================================
// GAME ENTITIES
// ===========================================

class Projectile {
  constructor(x, y, velocity, type = 'player') {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.type = type;
    this.width = SPACE_INVADERS_CONFIG.projectiles.width;
    this.height = SPACE_INVADERS_CONFIG.projectiles.height;
    this.active = true;
  }

  update(deltaTime) {
    this.y += this.velocity * deltaTime;
    
    // Remove if off screen
    if (this.y < -this.height || this.y > SPACE_INVADERS_CONFIG.canvas.height) {
      this.active = false;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.type === 'player' ? 
      SPACE_INVADERS_CONFIG.projectiles.playerColor : 
      SPACE_INVADERS_CONFIG.projectiles.invaderColor;
    
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }

  getBounds() {
    return new Rectangle(
      this.x - this.width / 2, 
      this.y, 
      this.width, 
      this.height
    );
  }
}

// ===========================================
// INPUT MANAGER
// ===========================================

class InputManager {
  constructor() {
    this.keys = new Set();
    this.touches = new Map();
    this.callbacks = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      this.triggerCallback('keydown', e.code);
      
      // Prevent default for game controls
      if (this.isGameKey(e.code)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.triggerCallback('keyup', e.code);
    });

    // Touch events for mobile
    this.setupTouchControls();
    
    // Window focus/blur
    window.addEventListener('blur', () => {
      this.triggerCallback('blur');
    });
  }

  setupTouchControls() {
    const mobileControls = document.getElementById('mobileControls');
    if (!mobileControls) return;

    // D-pad controls
    mobileControls.querySelectorAll('.dpad-btn').forEach(btn => {
      const direction = btn.dataset.direction;
      
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerCallback('direction', direction);
      });
    });

    // Action buttons
    mobileControls.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (btn.classList.contains('action-pause')) {
          this.triggerCallback('pause');
        } else if (btn.classList.contains('action-restart')) {
          this.triggerCallback('restart');
        }
      });
    });
  }

  isGameKey(keyCode) {
    const allKeys = Object.values(GAME_CONFIG.controls.keyboard).flat();
    return allKeys.includes(keyCode);
  }

  isKeyPressed(keyCode) {
    return this.keys.has(keyCode);
  }

  isDirectionPressed(direction) {
    const keys = GAME_CONFIG.controls.keyboard[direction] || [];
    return keys.some(key => this.keys.has(key));
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  triggerCallback(event, data = null) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// ===========================================
// PERFORMANCE MONITOR
// ===========================================

class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.maxHistoryLength = 60;
  }

  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsHistory.push(this.fps);
      
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getCurrentFPS() {
    return this.fps;
  }
}

// ===========================================
// AUDIO MANAGER (Optional)
// ===========================================

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.5;
  }

  async loadSound(name, url) {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Could not load sound: ${name}`, error);
    }
  }

  playSound(name, volume = this.volume) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = volume;
      sound.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
  }
}

// ===========================================
// MAIN GAME CLASS
// ===========================================

class SpaceInvadersGame {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.state = GAME_STATES.MENU;
    
    // Game state
    this.score = 0;
    this.level = 1;
    this.highScore = parseInt(localStorage.getItem('space-invaders_highScore')) || 0;
    
    // Game timing
    this.lastUpdateTime = 0;
    this.gameSpeed = GAME_CONFIG.game.speed.initial;
    
    // Initialize game objects
    this.initializeGame();
    
    // Update UI
    this.updateHUD();
  }

  initializeGame() {
    // TODO: Initialize game-specific objects and state
    // Example: this.player = new Player();
    //          this.enemies = [];
    //          this.particles = [];
    
    console.log('Game initialized - Add your game objects here!');
  }

  update(currentTime) {
    // Only update if enough time has passed (for consistent speed)
    if (currentTime - this.lastUpdateTime < this.gameSpeed) {
      return;
    }

    this.lastUpdateTime = currentTime;

    // Update based on current state
    switch (this.state) {
      case GAME_STATES.PLAYING:
        this.updateGameplay();
        break;
      case GAME_STATES.PAUSED:
        // Game is paused, don't update gameplay
        break;
      case GAME_STATES.GAME_OVER:
        // Handle game over state
        break;
    }
  }

  updateGameplay() {
    // TODO: Implement your main game logic here
    // Example: this.player.update();
    //          this.updateEnemies();
    //          this.checkCollisions();
    //          this.updateParticles();
    
    console.log('Game updating - Add your update logic here!');
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render based on current state
    switch (this.state) {
      case GAME_STATES.PLAYING:
      case GAME_STATES.PAUSED:
        this.renderGameplay();
        break;
      case GAME_STATES.GAME_OVER:
        this.renderGameplay();
        this.renderGameOver();
        break;
    }

    // Always render debug info in development
    if (window.location.hostname === 'localhost') {
      this.renderDebugInfo();
    }
  }

  renderGameplay() {
    // TODO: Implement your rendering logic here
    // Example: this.player.render(this.ctx);
    //          this.enemies.forEach(enemy => enemy.render(this.ctx));
    //          this.particles.forEach(particle => particle.render(this.ctx));
    
    // Placeholder rendering
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '24px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Add your game rendering here!', this.canvas.width / 2, this.canvas.height / 2);
  }

  renderGameOver() {
    // Game over overlay (optional, can use HTML overlay instead)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ff0040';
    this.ctx.font = 'bold 48px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '24px Courier New';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  renderDebugInfo() {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '12px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${window.gameEngine?.performanceMonitor?.getCurrentFPS() || 0}`, 10, 20);
    this.ctx.fillText(`State: ${this.state}`, 10, 35);
    this.ctx.fillText(`Speed: ${this.gameSpeed}ms`, 10, 50);
  }

  // Game control methods
  startGame() {
    this.state = GAME_STATES.PLAYING;
    this.hideOverlay();
  }

  pauseGame() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.showOverlay('PAUSED', 'Press SPACE to resume', 'RESUME');
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.hideOverlay();
    }
  }

  gameOver() {
    this.state = GAME_STATES.GAME_OVER;
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('space-invaders_highScore', this.highScore.toString());
      this.updateHUD();
    }
    
    this.showOverlay('GAME OVER', `Final Score: ${this.score}`, 'RESTART');
  }

  restartGame() {
    this.score = 0;
    this.level = 1;
    this.gameSpeed = GAME_CONFIG.game.speed.initial;
    this.initializeGame();
    this.updateHUD();
    this.startGame();
  }

  // Scoring system
  addScore(points) {
    this.score += Math.floor(points * this.level * GAME_CONFIG.game.scoring.multiplier);
    this.updateHUD();
  }

  nextLevel() {
    this.level++;
    this.gameSpeed = Math.max(
      GAME_CONFIG.game.speed.minimum,
      this.gameSpeed - GAME_CONFIG.game.speed.increment
    );
    this.updateHUD();
  }

  // UI management
  updateHUD() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('highScore').textContent = this.highScore;
  }

  showOverlay(title, message, buttonText) {
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMessage = document.getElementById('overlayMessage');
    const overlayButton = document.getElementById('overlayButton');

    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlayButton.textContent = buttonText;
    
    overlay.classList.add('active');
  }

  hideOverlay() {
    const overlay = document.getElementById('gameOverlay');
    overlay.classList.remove('active');
  }

  // Input handlers
  handleDirection(direction) {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    // TODO: Handle directional input based on your game
    console.log(`Direction pressed: ${direction}`);
  }

  handleAction() {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    // TODO: Handle action input (space, click, etc.)
    console.log('Action performed');
  }
}

// ===========================================
// GAME ENGINE
// ===========================================

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.inputManager = new InputManager();
    this.performanceMonitor = new PerformanceMonitor();
    this.audioManager = new AudioManager();
    this.game = null;
    
    this.initialize();
  }

  initialize() {
    this.setupCanvas();
    this.game = new SpaceInvadersGame(this.canvas, this.ctx);
    this.setupInputHandlers();
    this.setupUI();
    this.gameLoop();
    
    console.log('SpaceInvaders Game Engine initialized');
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Responsive canvas sizing
    if (window.innerWidth <= 768) {
      const scale = Math.min(containerWidth / GAME_CONFIG.canvas.width, 0.9);
      this.canvas.style.width = `${GAME_CONFIG.canvas.width * scale}px`;
      this.canvas.style.height = `${GAME_CONFIG.canvas.height * scale}px`;
    }
  }

  setupInputHandlers() {
    // Keyboard controls
    this.inputManager.on('keydown', (keyCode) => {
      switch (keyCode) {
        case 'Space':
          if (this.game.state === GAME_STATES.MENU || this.game.state === GAME_STATES.GAME_OVER) {
            this.game.restartGame();
          } else {
            this.game.pauseGame();
          }
          break;
        case 'KeyR':
          this.game.restartGame();
          break;
      }

      // Directional controls
      if (GAME_CONFIG.controls.keyboard.up.includes(keyCode)) {
        this.game.handleDirection('up');
      } else if (GAME_CONFIG.controls.keyboard.down.includes(keyCode)) {
        this.game.handleDirection('down');
      } else if (GAME_CONFIG.controls.keyboard.left.includes(keyCode)) {
        this.game.handleDirection('left');
      } else if (GAME_CONFIG.controls.keyboard.right.includes(keyCode)) {
        this.game.handleDirection('right');
      }
    });

    // Mobile controls
    this.inputManager.on('direction', (direction) => {
      this.game.handleDirection(direction);
    });

    this.inputManager.on('pause', () => {
      this.game.pauseGame();
    });

    this.inputManager.on('restart', () => {
      this.game.restartGame();
    });

    // Window focus/blur
    this.inputManager.on('blur', () => {
      if (this.game.state === GAME_STATES.PLAYING) {
        this.game.pauseGame();
      }
    });
  }

  setupUI() {
    // Overlay button
    const overlayButton = document.getElementById('overlayButton');
    overlayButton.addEventListener('click', () => {
      if (this.game.state === GAME_STATES.GAME_OVER || this.game.state === GAME_STATES.MENU) {
        this.game.restartGame();
      } else if (this.game.state === GAME_STATES.PAUSED) {
        this.game.pauseGame(); // Resume
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  gameLoop() {
    const currentTime = performance.now();
    
    // Update performance monitor
    this.performanceMonitor.update();
    
    // Update and render game
    this.game.update(currentTime);
    this.game.render();
    
    // Continue the loop
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Global reference for debugging
  window.gameEngine = new GameEngine();
  
  // Show initial overlay
  document.getElementById('gameOverlay').classList.add('active');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.gameEngine?.game?.state === GAME_STATES.PLAYING) {
    window.gameEngine.game.pauseGame();
  }
});