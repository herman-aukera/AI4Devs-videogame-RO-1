/* © GG, MIT License */

/* ===================================================================
   GAME CONFIGURATION
================================================================== */

const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },
  fps: 60,
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    background: '#0a0a0f'
  }
};

/* ===================================================================
   MAIN GAME ENGINE CLASS
================================================================== */

class GameTemplateEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu';
    this.lastFrameTime = 0;
    this.score = 0;
    
    // Game systems
    this.inputManager = new InputManager();
    this.entityManager = new EntityManager();
    
    this.setupCanvas();
    this.setupUI();
    this.initialize();
  }

  setupCanvas() {
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
    this.ctx.imageSmoothingEnabled = false;
    
    // Make canvas responsive
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = GAME_CONFIG.canvas.width / GAME_CONFIG.canvas.height;
    
    let width = containerRect.width;
    let height = width / aspectRatio;
    
    if (height > window.innerHeight * 0.7) {
      height = window.innerHeight * 0.7;
      width = height * aspectRatio;
    }
    
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  setupUI() {
    // Setup control buttons
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    
    // Update score display
    this.updateScore(0);
  }

  async initialize() {
    this.startGame();
    this.gameLoop();
    
    // Auto-run audit in development
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log('🔍 Running development audit...');
      window.runAudit = this.runAuditTasks.bind(this);
      setTimeout(() => this.runAuditTasks(), 1000);
    }
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    
    this.lastFrameTime = currentTime;
    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    // Handle input
    this.handleInput();
    
    // Update entities
    this.entityManager.update(deltaTime);
    
    // Game logic here
    this.updateGameLogic(deltaTime);
  }

  updateGameLogic(deltaTime) {
    // Override this method in specific games
    // Example game logic:
    // - Check collisions
    // - Update score
    // - Check win/lose conditions
    // deltaTime can be used for frame-independent movement
    console.log(`Game logic update: ${deltaTime}ms`);
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render entities
    this.entityManager.render(this.ctx);
    
    // Render UI elements
    this.renderUI();
    
    // Render game state specific elements
    this.renderGameState();
  }

  renderUI() {
    // Draw score or other UI elements on canvas if needed
    this.ctx.save();
    this.ctx.fillStyle = GAME_CONFIG.colors.primary;
    this.ctx.font = '24px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    this.ctx.restore();
  }

  renderGameState() {
    if (this.gameState === 'paused') {
      this.renderPauseScreen();
    } else if (this.gameState === 'gameOver') {
      this.renderGameOverScreen();
    }
  }

  renderPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = GAME_CONFIG.colors.primary;
    this.ctx.font = '48px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '24px Courier New';
    this.ctx.fillText('Presiona P para continuar', this.canvas.width / 2, this.canvas.height / 2 + 60);
    this.ctx.restore();
  }

  renderGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = GAME_CONFIG.colors.accent;
    this.ctx.font = '48px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.fillStyle = GAME_CONFIG.colors.primary;
    this.ctx.font = '24px Courier New';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText('Presiona R para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 60);
    this.ctx.restore();
  }

  handleInput() {
    // Handle keyboard input
    if (this.inputManager.isPressed('KeyP')) {
      this.togglePause();
      this.inputManager.keys['KeyP'] = false; // Prevent multiple triggers
    }
    
    if (this.inputManager.isPressed('KeyR') && this.gameState === 'gameOver') {
      this.restart();
      this.inputManager.keys['KeyR'] = false;
    }
    
    // Game-specific input handling
    this.handleGameInput();
  }

  handleGameInput() {
    // Override this method for game-specific input
    // Example:
    // if (this.inputManager.isPressed('ArrowUp')) { ... }
    // if (this.inputManager.isPressed('ArrowDown')) { ... }
    // if (this.inputManager.isPressed('ArrowLeft')) { ... }
    // if (this.inputManager.isPressed('ArrowRight')) { ... }
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.updateScore(0);
    
    // Initialize game entities
    this.initializeEntities();
  }

  initializeEntities() {
    // Override this method to create game-specific entities
    // Example:
    // this.player = this.entityManager.createEntity('Player', { x: 100, y: 100 });
    // this.enemies = [];
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
    }
  }

  restart() {
    this.entityManager.clear();
    this.startGame();
  }

  gameOver() {
    this.gameState = 'gameOver';
    
    // Save high score
    const highScore = localStorage.getItem('gameTemplate_highScore') || 0;
    if (this.score > highScore) {
      localStorage.setItem('gameTemplate_highScore', this.score);
    }
  }

  updateScore(points) {
    this.score += points;
    document.getElementById('scoreValue').textContent = this.score;
  }

  /* ===================================================================
     TDD AUDIT SYSTEM
  ================================================================== */

  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    // Performance Tests
    const frameRateOK = this.lastFrameTime && (performance.now() - this.lastFrameTime) < 20;
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    // UI/UX Tests
    const backLink = document.querySelector('a[href*="index.html"]');
    const hasInicioText = backLink && backLink.textContent.includes('INICIO');
    results.push({ name: 'Navigation "INICIO"', pass: hasInicioText, critical: false });
    
    const htmlLang = document.documentElement.lang;
    const isSpanish = htmlLang === 'es' && document.body.textContent.includes('INICIO');
    results.push({ name: 'Language Consistency', pass: isSpanish, critical: false });
    
    const hasInstructions = document.querySelector('details') && 
      document.body.textContent.includes('¿Cómo jugar?');
    results.push({ name: 'Instructions Section', pass: hasInstructions, critical: false });
    
    // Technical Tests
    const canvas = document.querySelector('canvas');
    const isResponsive = canvas && getComputedStyle(canvas).maxWidth === '100%';
    results.push({ name: 'Responsive Canvas', pass: isResponsive, critical: true });
    
    // Accessibility Tests
    const hasKeyboardNav = document.querySelector('[tabindex]') || document.querySelector('button');
    results.push({ name: 'Keyboard Navigation', pass: hasKeyboardNav, critical: false });
    
    // Log results
    console.log('🔍 TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    if (criticalFails.length > 0) {
      console.error('❌ Critical failures:', criticalFails.map(f => f.name));
    }
    
    return { allPassed: results.every(r => r.pass), criticalPassed: allCriticalPassed, results };
  }
}

/* ===================================================================
   INPUT MANAGER CLASS
================================================================== */

class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, clicked: false };
    this.touches = new Map();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      e.preventDefault();
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      e.preventDefault();
    });
    
    // Touch events for mobile
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }
  }

  isPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  handleTouchStart(e) {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(touch => {
      const pos = this.getTouchPosition(touch);
      this.touches.set(touch.identifier, pos);
      this.processTouchInput(pos);
    });
  }

  handleTouchEnd(e) {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(touch => {
      this.touches.delete(touch.identifier);
    });
  }

  getTouchPosition(touch) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  processTouchInput(pos) {
    // Convert touch to directional input
    const canvas = document.getElementById('gameCanvas');
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    
    if (Math.abs(pos.x - centerX) > Math.abs(pos.y - centerY)) {
      // Horizontal swipe
      this.keys[pos.x > centerX ? 'ArrowRight' : 'ArrowLeft'] = true;
    } else {
      // Vertical swipe
      this.keys[pos.y > centerY ? 'ArrowDown' : 'ArrowUp'] = true;
    }
  }
}

/* ===================================================================
   ENTITY MANAGER CLASS
================================================================== */

class EntityManager {
  constructor() {
    this.entities = [];
    this.entityPool = new Map();
  }

  createEntity(type, data = {}) {
    // This is a simple factory pattern
    // Override or extend for specific entity types
    const entity = new GameEntity(data.x || 0, data.y || 0, data.width || 32, data.height || 32);
    this.entities.push(entity);
    return entity;
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  update(deltaTime) {
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
    
    // Remove inactive entities
    this.entities = this.entities.filter(entity => entity.active);
  }

  render(ctx) {
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.render(ctx);
      }
    });
  }

  clear() {
    this.entities = [];
  }
}

/* ===================================================================
   BASE ENTITY CLASS
================================================================== */

class GameEntity {
  constructor(x = 0, y = 0, width = 32, height = 32) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.active = true;
    this.color = GAME_CONFIG.colors.primary;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime / 1000;
    this.y += this.vy * deltaTime / 1000;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  intersects(other) {
    const a = this.getBounds();
    const b = other.getBounds();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  reset() {
    this.active = false;
    this.vx = 0;
    this.vy = 0;
  }
}

/* ===================================================================
   INITIALIZATION
================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const game = new GameTemplateEngine();
  window.game = game;
  
  console.log('🎮 Game Template initialized successfully!');
  console.log('🔧 This is a development template. Customize the GameTemplateEngine class for your specific game.');
});
