#!/usr/bin/env node

/**
 * Game Template Generator
 * Generates a complete game structure with boilerplate code
 * Usage: node scripts/generate-template.js <game-name>
 */

const fs = require('fs');
const path = require('path');

class GameTemplateGenerator {
  constructor(gameName) {
    this.gameName = gameName;
    this.gameNameCamelCase = this.toCamelCase(gameName);
    this.gameNamePascalCase = this.toPascalCase(gameName);
    this.gameFolder = `${gameName}-GG`;
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    return str.replace(/(^|-)([a-z])/g, (g) => g.slice(-1).toUpperCase());
  }

  generateHtmlTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.gameNamePascalCase} - GG Edition</title>
    <meta name="description" content="${this.gameNamePascalCase} retro arcade game - AI4Devs collection" />
    <meta name="keywords" content="game, retro, arcade, ${this.gameName}, html5, canvas" />
    <meta name="theme-color" content="#00FFFF" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${this.gameNamePascalCase} - GG Edition" />
    <meta property="og:description" content="${this.gameNamePascalCase} retro arcade game" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico" />
    
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- Navegación de retorno -->
    <nav class="game-navigation">
      <a href="../index.html" class="back-button">
        <span class="back-icon">⬅</span>
        <span class="back-text">VOLVER AL ÍNDICE</span>
      </a>
    </nav>

    <!-- Container principal del juego -->
    <main class="game-container">
      <header class="game-header">
        <h1 class="game-title">${this.gameNamePascalCase.toUpperCase()}</h1>
        <div class="game-subtitle">GG EDITION</div>
      </header>

      <!-- HUD del juego -->
      <section class="game-hud">
        <div class="hud-item">
          <span class="hud-label">SCORE</span>
          <span class="hud-value" id="score">0</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">LEVEL</span>
          <span class="hud-value" id="level">1</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">HIGH SCORE</span>
          <span class="hud-value" id="highScore">0</span>
        </div>
      </section>

      <!-- Canvas del juego -->
      <div class="game-canvas-container">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        
        <!-- Overlay para estados del juego -->
        <div class="game-overlay" id="gameOverlay">
          <div class="overlay-content">
            <h2 class="overlay-title" id="overlayTitle">GAME READY</h2>
            <p class="overlay-message" id="overlayMessage">Press SPACE to start</p>
            <button class="overlay-button" id="overlayButton">START GAME</button>
          </div>
        </div>
      </div>

      <!-- Controles móviles -->
      <section class="mobile-controls" id="mobileControls">
        <div class="control-dpad">
          <button class="dpad-btn dpad-up" data-direction="up">↑</button>
          <button class="dpad-btn dpad-left" data-direction="left">←</button>
          <button class="dpad-btn dpad-right" data-direction="right">→</button>
          <button class="dpad-btn dpad-down" data-direction="down">↓</button>
        </div>
        <div class="control-actions">
          <button class="action-btn action-pause">⏸</button>
          <button class="action-btn action-restart">↻</button>
        </div>
      </section>

      <!-- Instrucciones -->
      <section class="game-instructions">
        <h3>CONTROLS</h3>
        <div class="instructions-grid">
          <div class="instruction-item">
            <span class="instruction-key">ARROWS / WASD</span>
            <span class="instruction-desc">Move</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-key">SPACE</span>
            <span class="instruction-desc">Pause/Resume</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-key">R</span>
            <span class="instruction-desc">Restart</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Scripts -->
    <script src="script.js"></script>
  </body>
</html>`;
  }

  generateCssTemplate() {
    return `/* ==============================================
   ${this.gameNamePascalCase} - GG Edition
   Retro arcade styling with modern CSS3
   ============================================== */

/* Variables CSS retro */
:root {
  /* Colores principales */
  --primary-cyan: #00ffff;
  --primary-magenta: #ff00ff;
  --primary-yellow: #ffff00;
  --accent-green: #00ff00;
  --accent-orange: #ff6600;
  --accent-red: #ff0040;
  
  /* Fondos */
  --bg-primary: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;
  
  /* Efectos */
  --glow-primary: 0 0 10px var(--primary-cyan);
  --glow-secondary: 0 0 15px var(--primary-magenta);
  --shadow-depth: 0 4px 15px rgba(0, 255, 255, 0.3);
  
  /* Tipografía */
  --font-main: 'Courier New', 'Lucida Console', monospace;
  --font-size-xl: 2.5rem;
  --font-size-lg: 1.8rem;
  --font-size-md: 1.2rem;
  --font-size-sm: 0.9rem;
  
  /* Espaciado */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Transiciones */
  --transition-fast: 0.15s ease-out;
  --transition-medium: 0.3s ease-out;
  --transition-slow: 0.5s ease-out;
}

/* Reset y base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-main);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  color: var(--primary-cyan);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.4;
}

/* Navegación superior */
.game-navigation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: var(--spacing-sm);
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--primary-cyan);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--primary-cyan);
  text-decoration: none;
  font-weight: bold;
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all var(--transition-medium);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-button:hover {
  border-color: var(--primary-cyan);
  box-shadow: var(--glow-primary);
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.2em;
  transition: transform var(--transition-fast);
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

/* Container principal */
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 80px var(--spacing-sm) var(--spacing-lg);
  gap: var(--spacing-md);
}

/* Header del juego */
.game-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.game-title {
  font-size: var(--font-size-xl);
  color: var(--primary-cyan);
  text-shadow: var(--glow-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.2em;
  animation: titlePulse 2s ease-in-out infinite alternate;
}

.game-subtitle {
  font-size: var(--font-size-md);
  color: var(--primary-magenta);
  text-shadow: var(--glow-secondary);
  letter-spacing: 0.15em;
  opacity: 0.8;
}

@keyframes titlePulse {
  from { text-shadow: var(--glow-primary); }
  to { text-shadow: 0 0 20px var(--primary-cyan), 0 0 30px var(--primary-cyan); }
}

/* HUD del juego */
.game-hud {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid var(--primary-cyan);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.hud-label {
  font-size: var(--font-size-sm);
  color: var(--primary-yellow);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 1px;
}

.hud-value {
  font-size: var(--font-size-lg);
  color: var(--primary-cyan);
  font-weight: bold;
  text-shadow: var(--glow-primary);
}

/* Canvas y contenedor */
.game-canvas-container {
  position: relative;
  display: inline-block;
  border: 3px solid var(--primary-cyan);
  border-radius: 12px;
  box-shadow: var(--shadow-depth);
  background: var(--bg-primary);
  overflow: hidden;
}

#gameCanvas {
  display: block;
  background: linear-gradient(45deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

/* Overlay para estados del juego */
.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 15, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-medium);
  z-index: 10;
}

.game-overlay.active {
  opacity: 1;
  visibility: visible;
}

.overlay-content {
  text-align: center;
  padding: var(--spacing-xl);
  border: 2px solid var(--primary-cyan);
  border-radius: 12px;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
}

.overlay-title {
  font-size: var(--font-size-xl);
  color: var(--primary-cyan);
  text-shadow: var(--glow-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: 0.1em;
}

.overlay-message {
  font-size: var(--font-size-md);
  color: var(--primary-yellow);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.overlay-button {
  font-family: var(--font-main);
  font-size: var(--font-size-md);
  color: var(--bg-primary);
  background: linear-gradient(45deg, var(--primary-cyan), var(--primary-magenta));
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all var(--transition-medium);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.overlay-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
}

/* Controles móviles */
.mobile-controls {
  display: none;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid var(--primary-cyan);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.control-dpad {
  position: relative;
  width: 120px;
  height: 120px;
}

.dpad-btn {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, var(--primary-cyan), var(--primary-magenta));
  border: none;
  border-radius: 8px;
  color: var(--bg-primary);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all var(--transition-fast);
  touch-action: manipulation;
}

.dpad-btn:active {
  transform: scale(0.95);
  box-shadow: 0 0 15px var(--primary-cyan);
}

.dpad-up { top: 0; left: 50%; transform: translateX(-50%); }
.dpad-down { bottom: 0; left: 50%; transform: translateX(-50%); }
.dpad-left { left: 0; top: 50%; transform: translateY(-50%); }
.dpad-right { right: 0; top: 50%; transform: translateY(-50%); }

.control-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-red));
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  touch-action: manipulation;
}

.action-btn:active {
  transform: scale(0.95);
  box-shadow: 0 0 15px var(--accent-orange);
}

/* Instrucciones */
.game-instructions {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(26, 26, 46, 0.6);
  border: 2px solid var(--primary-magenta);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  max-width: 600px;
}

.game-instructions h3 {
  color: var(--primary-magenta);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
  letter-spacing: 0.1em;
  text-shadow: var(--glow-secondary);
}

.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-sm);
}

.instruction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.instruction-key {
  font-size: var(--font-size-sm);
  color: var(--primary-yellow);
  font-weight: bold;
  padding: var(--spacing-xs);
  background: rgba(255, 255, 0, 0.1);
  border: 1px solid var(--primary-yellow);
  border-radius: 4px;
  letter-spacing: 1px;
}

.instruction-desc {
  font-size: var(--font-size-sm);
  color: var(--primary-cyan);
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  :root {
    --font-size-xl: 2rem;
    --font-size-lg: 1.5rem;
    --font-size-md: 1rem;
    --font-size-sm: 0.8rem;
  }

  .game-container {
    padding: 60px var(--spacing-xs) var(--spacing-md);
  }

  .game-hud {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .hud-item {
    min-width: 60px;
  }

  #gameCanvas {
    width: 100%;
    max-width: 100vw;
    height: auto;
  }

  .mobile-controls {
    display: flex;
  }

  .instructions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .game-container {
    padding: 60px 0.5rem var(--spacing-sm);
  }

  .game-canvas-container {
    border-radius: 8px;
    margin: 0 0.5rem;
  }

  .overlay-content {
    padding: var(--spacing-lg);
    margin: 0 var(--spacing-sm);
  }
}

/* Efectos adicionales */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 5px var(--primary-cyan); }
  50% { box-shadow: 0 0 20px var(--primary-cyan), 0 0 30px var(--primary-cyan); }
}

.glow-animation {
  animation: glowPulse 2s ease-in-out infinite;
}

/* Estados especiales */
.game-paused .game-canvas-container {
  opacity: 0.5;
  filter: blur(2px);
}

.game-over .overlay-title {
  color: var(--accent-red);
  text-shadow: 0 0 10px var(--accent-red);
}

.game-win .overlay-title {
  color: var(--accent-green);
  text-shadow: 0 0 10px var(--accent-green);
}`;
  }

  generateJsTemplate() {
    return `/**
 * ${this.gameNamePascalCase} - GG Edition
 * Retro arcade game built with HTML5 Canvas and ES6+
 * 
 * Architecture:
 * - GameEngine: Main game loop and state management
 * - ${this.gameNamePascalCase}Game: Core game logic and mechanics
 * - InputManager: Unified input handling (keyboard + touch)
 * - AudioManager: Sound effects and music (optional)
 * - PerformanceMonitor: FPS and performance tracking
 */

// ===========================================
// GAME CONFIGURATION
// ===========================================

const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  game: {
    fps: 60,
    speed: {
      initial: 100, // miliseconds per move
      increment: 5,  // speed increase per level
      minimum: 50,   // fastest possible speed
    },
    scoring: {
      base: 10,      // base points per action
      multiplier: 1.5, // score multiplier per level
    },
  },
  controls: {
    keyboard: {
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'], 
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      action: ['Space'],
      pause: ['Space', 'KeyP'],
      restart: ['KeyR'],
    },
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
  LOADING: 'loading',
};

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
      console.warn(\`Could not load sound: \${name}\`, error);
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

class ${this.gameNamePascalCase}Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.state = GAME_STATES.MENU;
    
    // Game state
    this.score = 0;
    this.level = 1;
    this.highScore = parseInt(localStorage.getItem('${this.gameName}_highScore')) || 0;
    
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
    this.ctx.fillText(\`Final Score: \${this.score}\`, this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  renderDebugInfo() {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '12px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(\`FPS: \${window.gameEngine?.performanceMonitor?.getCurrentFPS() || 0}\`, 10, 20);
    this.ctx.fillText(\`State: \${this.state}\`, 10, 35);
    this.ctx.fillText(\`Speed: \${this.gameSpeed}ms\`, 10, 50);
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
      localStorage.setItem('${this.gameName}_highScore', this.highScore.toString());
      this.updateHUD();
    }
    
    this.showOverlay('GAME OVER', \`Final Score: \${this.score}\`, 'RESTART');
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
    console.log(\`Direction pressed: \${direction}\`);
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
    this.game = new ${this.gameNamePascalCase}Game(this.canvas, this.ctx);
    this.setupInputHandlers();
    this.setupUI();
    this.gameLoop();
    
    console.log('${this.gameNamePascalCase} Game Engine initialized');
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Responsive canvas sizing
    if (window.innerWidth <= 768) {
      const scale = Math.min(containerWidth / GAME_CONFIG.canvas.width, 0.9);
      this.canvas.style.width = \`\${GAME_CONFIG.canvas.width * scale}px\`;
      this.canvas.style.height = \`\${GAME_CONFIG.canvas.height * scale}px\`;
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
});`;
  }

  generateReadmeTemplate() {
    return `# ${this.gameNamePascalCase} - GG Edition

## 🎮 Descripción del Juego

${this.gameNamePascalCase} es una implementación moderna del clásico juego arcade, desarrollado como parte de la colección AI4Devs Retro Web Games. Combina la nostalgia de los juegos retro con tecnologías web modernas y un diseño responsivo.

## 🕹️ Características

- **Gráficos Retro**: Estética neon arcade de los años 80-90
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Controles Unificados**: Teclado (WASD/Arrows) + controles táctiles
- **Sistema de Puntuación**: Puntuación progresiva con high score persistente
- **Efectos Visuales**: Animaciones fluidas y efectos de partículas
- **Audio Opcional**: Soporte para efectos de sonido y música
- **Performance**: 60fps estables en dispositivos de gama media

## 🎯 Cómo Jugar

### Controles de Teclado
- **↑↓←→ / WASD**: Movimiento/Dirección
- **ESPACIO**: Pausar/Reanudar o Acción principal
- **R**: Reiniciar juego
- **ESC**: Menú principal

### Controles Móviles
- **D-Pad Virtual**: Movimiento en pantallas táctiles
- **Botones de Acción**: Pausa y reinicio
- **Swipe Gestures**: Gestos de deslizamiento (opcional)

### Mecánicas del Juego
<!-- TODO: Describe las mecánicas específicas de tu juego -->
1. [Describe la mecánica principal]
2. [Sistema de puntuación]
3. [Condiciones de victoria/derrota]
4. [Power-ups o elementos especiales]

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y Canvas API
- **CSS3**: Variables, Grid, Flexbox, animaciones
- **JavaScript ES6+**: Classes, modules, async/await
- **Canvas 2D**: Rendering de gráficos del juego
- **Local Storage**: Persistencia de high scores
- **Web Audio API**: Efectos de sonido (opcional)

## 📋 Estructura del Proyecto

\`\`\`
${this.gameFolder}/
├── index.html      # Estructura principal del juego
├── style.css       # Estilos retro responsivos
├── script.js       # Lógica del juego y engine
├── prompts.md      # Registro de desarrollo
├── README.md       # Este archivo
└── assets/         # Recursos del juego
    ├── images/     # Sprites e imágenes
    ├── sounds/     # Efectos de sonido
    └── fonts/      # Fuentes personalizadas
\`\`\`

## 🚀 Instalación y Ejecución

### Ejecución Local
\`\`\`bash
# Clonar el repositorio principal
git clone [url-repositorio]
cd AI4Devs-videogame-RO-1

# Iniciar servidor local
python3 -m http.server 8000

# Navegar a http://localhost:8000/${this.gameFolder}/
\`\`\`

### Live Server (Recomendado para desarrollo)
\`\`\`bash
# Con Live Server extension en VS Code
# Click derecho en index.html > "Open with Live Server"
\`\`\`

## 🎨 Personalización

### Colores y Tema
Modifica las variables CSS en \`style.css\`:
\`\`\`css
:root {
  --primary-cyan: #00ffff;
  --primary-magenta: #ff00ff;
  --accent-color: #your-color;
}
\`\`\`

### Configuración del Juego
Ajusta parámetros en \`script.js\`:
\`\`\`javascript
const GAME_CONFIG = {
  game: {
    speed: { initial: 100, increment: 5 },
    scoring: { base: 10, multiplier: 1.5 },
  }
};
\`\`\`

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos Móviles
- ✅ iOS 14+ (Safari, Chrome)
- ✅ Android 8+ (Chrome, Firefox)
- ✅ Tablets (iPad, Android tablets)

### Resoluciones Testadas
- 📱 Mobile: 375x667px (iPhone SE)
- 📱 Mobile: 414x896px (iPhone 11)
- 📱 Tablet: 768x1024px (iPad)
- 💻 Desktop: 1920x1080px
- 💻 Desktop: 2560x1440px

## 🔧 Desarrollo

### Arquitectura del Código
- **GameEngine**: Loop principal y gestión de estados
- **${this.gameNamePascalCase}Game**: Lógica específica del juego
- **InputManager**: Manejo unificado de controles
- **PerformanceMonitor**: Monitoreo de FPS y rendimiento
- **AudioManager**: Sistema de audio (opcional)

### Patrones de Diseño Utilizados
- **State Machine**: Gestión de estados del juego
- **Observer Pattern**: Sistema de eventos de input
- **Object Pool**: Optimización de objetos (si aplica)
- **Component System**: Entidades modulares (si aplica)

### Debugging
\`\`\`javascript
// Activar modo debug (localhost automático)
// F12 > Console para ver logs de desarrollo
console.log(window.gameEngine); // Acceso al engine principal
\`\`\`

## 📊 Métricas de Performance

### Objetivos de Rendimiento
- **FPS**: 60fps estables en dispositivos de gama media
- **Memoria**: < 50MB uso pico
- **Carga**: < 3 segundos en conexión 3G
- **Batería**: Impacto mínimo en dispositivos móviles

### Optimizaciones Implementadas
- Pooling de objetos para entidades frecuentes
- RequestAnimationFrame para loops eficientes
- Canvas optimizations (dirty rectangles si aplica)
- Throttling de eventos de input
- Lazy loading de assets

## 🐛 Solución de Problemas

### Problemas Comunes

**El juego no carga**
- Verificar que se ejecuta desde un servidor HTTP
- Comprobar errores en consola del navegador
- Verificar compatibilidad del navegador

**Lag o FPS bajos**
- Cerrar otras pestañas del navegador
- Verificar que no hay aplicaciones pesadas ejecutándose
- Reducir resolución de pantalla si es necesario

**Controles no responden**
- Verificar que el canvas tiene focus
- Comprobar que JavaScript está habilitado
- En móvil, verificar que el touch funciona

**Audio no funciona**
- Verificar que el volumen está activado
- Algunos navegadores requieren interacción del usuario para audio
- Click en el juego antes de que inicie el audio

## 🤝 Contribuciones

### Para Contribuir
1. Fork del repositorio principal
2. Crear rama: \`git checkout -b feature/mejora-${this.gameName}\`
3. Implementar cambios siguiendo los estándares
4. Testing en múltiples navegadores
5. Commit con mensajes descriptivos
6. Push y crear Pull Request

### Estándares de Código
- JavaScript ES6+ con JSDoc comments
- CSS con variables y mobile-first
- HTML5 semántico con accesibilidad
- Commits en español, código en inglés
- Performance: mantener 60fps

## 📄 Licencia y Créditos

- **Proyecto**: AI4Devs Students - Retro Game Collection
- **Licencia**: MIT License
- **Autor**: [Tu Nombre]
- **Versión**: 1.0.0
- **Última Actualización**: ${new Date().toLocaleDateString('es-ES')}

## 🔗 Enlaces

- [🏠 Índice Principal](../index.html)
- [📖 Guía Técnica](../TECHNICAL_GUIDE.md)
- [🎮 Otros Juegos](../)
- [📝 Documentación del Desarrollo](./prompts.md)

---

🎮 **¡Disfruta jugando ${this.gameNamePascalCase}!** 🕹️`;
  }

  generatePromptsTemplate() {
    return `# Prompts de Desarrollo - ${this.gameNamePascalCase} GG

## 📝 Registro de Desarrollo

Este archivo documenta todos los prompts utilizados durante el desarrollo del juego ${this.gameNamePascalCase}, así como las decisiones de diseño, desafíos encontrados y soluciones implementadas.

---

## 🎯 Prompt Inicial - [${new Date().toLocaleDateString('es-ES')}]

### Solicitud Original
\`\`\`
[Aquí va el prompt inicial utilizado para crear este juego]
\`\`\`

### Respuesta y Análisis
- **Concepto Elegido**: ${this.gameNamePascalCase} arcade clásico
- **Tecnologías**: HTML5 Canvas + ES6+ JavaScript
- **Estilo Visual**: Retro neon con efectos modernos
- **Arquitectura**: Modular con GameEngine principal

### Decisiones de Diseño
1. **Canvas vs DOM**: Se eligió Canvas para mejor control de rendering
2. **Responsive**: Mobile-first approach con controles táctiles
3. **Modular**: Separación clara entre engine, game logic, input, etc.

---

## 🏗️ Iteración 1: Estructura Base

### Prompt Utilizado
\`\`\`
[Prompt para crear la estructura HTML/CSS base]
\`\`\`

### Cambios Implementados
- [x] Estructura HTML semántica
- [x] CSS Grid/Flexbox responsive
- [x] Variables CSS para theming
- [x] Navegación de retorno

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## 🎮 Iteración 2: Game Engine

### Prompt Utilizado
\`\`\`
[Prompt para implementar el motor del juego]
\`\`\`

### Cambios Implementados
- [x] GameEngine class con loop principal
- [x] Sistema de estados (MENU, PLAYING, PAUSED, GAME_OVER)
- [x] InputManager para controles unificados
- [x] PerformanceMonitor para FPS

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## 🎯 Iteración 3: Mecánicas del Juego

### Prompt Utilizado
\`\`\`
[Prompt para implementar la lógica específica del juego]
\`\`\`

### Cambios Implementados
- [ ] [Mecánica 1]
- [ ] [Mecánica 2]
- [ ] [Sistema de colisiones]
- [ ] [Sistema de puntuación]

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## 📱 Iteración 4: Optimización Móvil

### Prompt Utilizado
\`\`\`
[Prompt para mejorar la experiencia móvil]
\`\`\`

### Cambios Implementados
- [ ] Controles táctiles optimizados
- [ ] Responsive canvas sizing
- [ ] Touch gestures
- [ ] Performance móvil

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## 🎨 Iteración 5: Efectos Visuales

### Prompt Utilizado
\`\`\`
[Prompt para añadir efectos visuales y polish]
\`\`\`

### Cambios Implementados
- [ ] Sistema de partículas
- [ ] Efectos de glow/neon
- [ ] Animaciones CSS
- [ ] Screen shake
- [ ] Transiciones suaves

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## 🔊 Iteración 6: Audio (Opcional)

### Prompt Utilizado
\`\`\`
[Prompt para implementar sistema de audio]
\`\`\`

### Cambios Implementados
- [ ] AudioManager class
- [ ] Sound effects
- [ ] Background music
- [ ] Volume controls

### Desafíos Encontrados
- **Problema**: [Descripción del problema]
- **Solución**: [Cómo se resolvió]

---

## ⚡ Iteración 7: Optimización de Performance

### Prompt Utilizado
\`\`\`
[Prompt para optimizar rendimiento]
\`\`\`

### Cambios Implementados
- [ ] Object pooling
- [ ] Efficient collision detection
- [ ] Canvas optimizations
- [ ] Memory management

### Métricas Finales
- **FPS Promedio**: [X] fps
- **Uso de Memoria**: [X] MB
- **Tiempo de Carga**: [X] segundos

---

## 🧪 Testing y Debugging

### Browsers Testados
- [ ] Chrome Desktop
- [ ] Firefox Desktop  
- [ ] Safari Desktop
- [ ] Edge Desktop
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Android

### Problemas Encontrados y Solucionados
1. **[Navegador]**: [Problema] → [Solución]
2. **[Navegador]**: [Problema] → [Solución]

---

## 📋 Lista de Características Final

### ✅ Implementado
- [x] [Característica 1]
- [x] [Característica 2]

### ⏳ En Progreso
- [ ] [Característica en desarrollo]

### 🔮 Ideas Futuras
- [ ] [Idea para futura implementación]
- [ ] [Mejora posible]

---

## 💡 Lecciones Aprendidas

### Técnicas Exitosas
1. **[Técnica]**: [Por qué funcionó bien]
2. **[Técnica]**: [Beneficios obtenidos]

### Desafíos Principales
1. **[Desafío]**: [Cómo se abordó]
2. **[Desafío]**: [Aprendizaje obtenido]

### Mejoras para Futuros Proyectos
1. **[Mejora]**: [Implementación sugerida]
2. **[Mejora]**: [Beneficio esperado]

---

## 🔗 Referencias y Recursos

### Documentación Consultada
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [HTML5 Game Development](https://developer.mozilla.org/en-US/docs/Games)
- [Web Performance](https://web.dev/performance/)

### Inspiración y Ejemplos
- [Referencia 1]: [URL y descripción]
- [Referencia 2]: [URL y descripción]

### Herramientas Utilizadas
- **Editor**: VS Code con extensiones
- **Testing**: Live Server, Chrome DevTools
- **Assets**: [Herramientas para crear assets]

---

*📝 Nota: Este documento debe actualizarse con cada iteración del desarrollo para mantener un registro completo del proceso.*`;
  }

  async createGameStructure() {
    const gameDir = path.join(process.cwd(), this.gameFolder);
    
    try {
      // Create game directory
      if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir);
        console.log(`✅ Created directory: ${this.gameFolder}`);
      } else {
        console.log(`⚠️  Directory already exists: ${this.gameFolder}`);
      }

      // Create assets subdirectories
      const assetsDir = path.join(gameDir, 'assets');
      fs.mkdirSync(assetsDir, { recursive: true });
      fs.mkdirSync(path.join(assetsDir, 'images'), { recursive: true });
      fs.mkdirSync(path.join(assetsDir, 'sounds'), { recursive: true });
      fs.mkdirSync(path.join(assetsDir, 'fonts'), { recursive: true });

      // Create files
      const files = {
        'index.html': this.generateHtmlTemplate(),
        'style.css': this.generateCssTemplate(),
        'script.js': this.generateJsTemplate(),
        'README.md': this.generateReadmeTemplate(),
        'prompts.md': this.generatePromptsTemplate(),
      };

      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(gameDir, filename);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Created file: ${filename}`);
      }

      console.log(`\n🎮 Game "${this.gameNamePascalCase}" structure created successfully!`);
      console.log(`📁 Location: ${gameDir}`);
      console.log(`🌐 Open: http://localhost:8000/${this.gameFolder}/`);
      console.log(`\n📝 Next steps:`);
      console.log(`   1. cd ${this.gameFolder}`);
      console.log(`   2. Implement your game logic in script.js`);
      console.log(`   3. Update prompts.md with your development process`);
      console.log(`   4. Test across different browsers and devices`);

    } catch (error) {
      console.error(`❌ Error creating game structure: ${error.message}`);
      process.exit(1);
    }
  }
}

// Command line usage
if (require.main === module) {
  const gameName = process.argv[2];
  
  if (!gameName) {
    console.error('❌ Usage: node generate-template.js <game-name>');
    console.error('📖 Example: node generate-template.js pacman');
    process.exit(1);
  }

  const generator = new GameTemplateGenerator(gameName);
  generator.createGameStructure();
}

module.exports = GameTemplateGenerator;
