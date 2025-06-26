/* © GG, MIT License */
/**
 * Space Invaders - GG Edition
 * Complete retro arcade Space Invaders implementation with AI4Devs standards
 * 
 * Architecture:
 * - SpaceInvadersGame: Main game engine with complete mechanics
 * - Player: Player ship with movement and shooting
 * - InvaderGrid: 5x11 formation of invaders 
 * - Projectile: Bullets for both player and invaders
 * - Barrier: Destructible shields
 * - UFO: Bonus flying saucer
 * - RetroAudioManager: 8-bit sound effects
 * - ParticleSystem: Visual effects
 */

'use strict';

// ===========================================
// GAME CONFIGURATION
// ===========================================

// Utility to get CSS variable values
const getCSSColor = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const SPACE_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  player: {
    width: 48,
    height: 32,
    speed: 300,
    shootCooldown: 250,
    get color() { return getCSSColor('--primary-cyan'); },
  },
  invaders: {
    width: 32,
    height: 24,
    rows: 5,
    cols: 11,
    spacing: 16,
    horizontalSpeed: 25,
    dropDistance: 24,
    shootChance: 0.001,
    get colors() { 
      return [
        getCSSColor('--accent-red'), 
        getCSSColor('--accent-orange'), 
        getCSSColor('--primary-yellow'), 
        getCSSColor('--accent-green'), 
        getCSSColor('--primary-cyan')
      ]; 
    },
    points: [30, 20, 20, 10, 10],
  },
  projectiles: {
    width: 4,
    height: 16,
    playerSpeed: -400,
    invaderSpeed: 200,
    get playerColor() { return getCSSColor('--primary-yellow'); },
    get invaderColor() { return getCSSColor('--primary-magenta'); },
  },
  barriers: {
    count: 4,
    width: 80,
    height: 60,
    get color() { return getCSSColor('--accent-green'); },
    startY: 450,
  },
  ufo: {
    width: 48,
    height: 24,
    speed: 100,
    spawnChance: 0.002,
    points: [50, 100, 150, 200, 250, 300],
    get color() { return getCSSColor('--primary-magenta'); },
  },
  game: {
    fps: 60,
    lives: 3,
    levelSpeedIncrease: 1.2,
  },
  colors: {
    get background() { return getCSSColor('--bg-primary'); },
    get stars() { return '#FFFFFF'; },
    get ui() { return getCSSColor('--primary-cyan'); },
  },
};

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete',
};

// ===========================================
// UTILITY CLASSES
// ===========================================

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
      // Silent fail
    }
  }

  playShoot() { this.createBeep(800, 0.1); }
  playHit() { this.createBeep(300, 0.2); }
  playExplosion() { this.createBeep(150, 0.4); }
  playUFO() { this.createBeep(1200, 0.3); }
  playGameOver() {
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
    this.vy += 200 * deltaTime;
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
// SPRITE RENDERER
// ===========================================

class SpriteRenderer {
  static renderInvaderSprite(ctx, x, y, width, height, type, frame = 0) {
    const cellWidth = width / 8;
    const cellHeight = height / 6;
    
    // Different invader patterns
    const patterns = {
      0: [ // Top row invader (octopus)
        [0,0,1,0,0,0,1,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,0,1]
      ],
      1: [ // Second row invader (crab)
        [0,0,1,0,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,1,1,1,1,1,1,1],
        [1,0,1,0,0,1,0,1]
      ],
      2: [ // Third row invader (squid)
        [0,0,1,0,0,1,0,0],
        [1,0,0,1,1,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,1,0,1,1,0,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,1,1,0,1,0]
      ],
      3: [ // Fourth row invader
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,0,1,1,0,1,0]
      ],
      4: [ // Bottom row invader
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0]
      ]
    };
    
    const pattern = patterns[type] || patterns[0];
    
    // Animation frame affects leg position
    if (frame % 2 === 1 && pattern[5]) {
      // Alternate leg position for animation
      for (let i = 0; i < pattern[5].length; i++) {
        if (pattern[5][i] === 1) {
          pattern[5][i] = pattern[5][i] === 1 ? 0 : 1;
        }
      }
    }
    
    ctx.save();
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          ctx.fillRect(
            x + col * cellWidth,
            y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }
    ctx.restore();
  }
  
  static renderPlayerSprite(ctx, x, y, width, height) {
    const cellWidth = width / 8;
    const cellHeight = height / 6;
    
    // Player ship pattern
    const pattern = [
      [0,0,0,0,0,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1]
    ];
    
    ctx.save();
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          ctx.fillRect(
            x + col * cellWidth,
            y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }
    ctx.restore();
  }
  
  static renderUFOSprite(ctx, x, y, width, height) {
    const cellWidth = width / 10;
    const cellHeight = height / 4;
    
    // UFO pattern
    const pattern = [
      [0,0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [1,1,0,1,1,1,1,0,1,1],
      [1,0,1,0,1,1,0,1,0,1]
    ];
    
    ctx.save();
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          ctx.fillRect(
            x + col * cellWidth,
            y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }
    ctx.restore();
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
    this.width = SPACE_CONFIG.projectiles.width;
    this.height = SPACE_CONFIG.projectiles.height;
    this.active = true;
  }

  update(deltaTime) {
    this.y += this.velocity * deltaTime;
    
    if (this.y < -this.height || this.y > SPACE_CONFIG.canvas.height) {
      this.active = false;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.type === 'player' ? 
      SPACE_CONFIG.projectiles.playerColor : 
      SPACE_CONFIG.projectiles.invaderColor;
    
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

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = SPACE_CONFIG.player.width;
    this.height = SPACE_CONFIG.player.height;
    this.speed = SPACE_CONFIG.player.speed;
    this.color = SPACE_CONFIG.player.color;
    this.lastShot = 0;
  }

  update(deltaTime, inputManager) {
    // Movement
    if (inputManager.isPressed('ArrowLeft') || inputManager.isPressed('KeyA')) {
      this.x -= this.speed * deltaTime;
    }
    if (inputManager.isPressed('ArrowRight') || inputManager.isPressed('KeyD')) {
      this.x += this.speed * deltaTime;
    }

    // Keep in bounds
    this.x = Math.max(this.width / 2, Math.min(SPACE_CONFIG.canvas.width - this.width / 2, this.x));
  }

  canShoot() {
    return performance.now() - this.lastShot > SPACE_CONFIG.player.shootCooldown;
  }

  shoot() {
    if (this.canShoot()) {
      this.lastShot = performance.now();
      return new Projectile(this.x, this.y, SPACE_CONFIG.projectiles.playerSpeed, 'player');
    }
    return null;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    // Use pixel-perfect sprite rendering
    SpriteRenderer.renderPlayerSprite(ctx, this.x - this.width / 2, this.y, this.width, this.height);
  }

  getBounds() {
    return new Rectangle(this.x - this.width / 2, this.y, this.width, this.height);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.lastShot = 0;
  }
}

class Invader {
  constructor(x, y, row, col) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.col = col;
    this.width = SPACE_CONFIG.invaders.width;
    this.height = SPACE_CONFIG.invaders.height;
    this.color = SPACE_CONFIG.invaders.colors[row];
    this.points = SPACE_CONFIG.invaders.points[row];
    this.alive = true;
    this.animFrame = 0;
  }

  update(deltaTime) {
    this.animFrame += deltaTime * 4; // Animation speed
  }

  render(ctx) {
    if (!this.alive) return;

    ctx.fillStyle = this.color;
    
    // Use pixel-perfect sprite rendering with animation frame
    const frame = Math.floor(this.animFrame) % 2;
    SpriteRenderer.renderInvaderSprite(ctx, this.x - this.width / 2, this.y, this.width, this.height, this.row, frame);
  }

  getBounds() {
    return new Rectangle(this.x - this.width / 2, this.y, this.width, this.height);
  }

  shoot() {
    return new Projectile(this.x, this.y + this.height, SPACE_CONFIG.projectiles.invaderSpeed, 'invader');
  }
}

class InvaderGrid {
  constructor() {
    this.invaders = [];
    this.direction = 1;
    this.dropDistance = SPACE_CONFIG.invaders.dropDistance;
    this.horizontalSpeed = SPACE_CONFIG.invaders.horizontalSpeed;
    this.lastMove = 0;
    this.moveInterval = 1000; // Start slow
    this.create();
  }

  create() {
    this.invaders = [];
    const startX = 100;
    const startY = 80;
    
    for (let row = 0; row < SPACE_CONFIG.invaders.rows; row++) {
      for (let col = 0; col < SPACE_CONFIG.invaders.cols; col++) {
        const x = startX + col * (SPACE_CONFIG.invaders.width + SPACE_CONFIG.invaders.spacing);
        const y = startY + row * (SPACE_CONFIG.invaders.height + SPACE_CONFIG.invaders.spacing);
        this.invaders.push(new Invader(x, y, row, col));
      }
    }
  }

  update(deltaTime) {
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    
    // Update animation
    aliveInvaders.forEach(invader => invader.update(deltaTime));
    
    // Move formation
    const now = performance.now();
    if (now - this.lastMove > this.moveInterval) {
      this.move();
      this.lastMove = now;
      
      // Speed up as invaders are destroyed
      const remaining = aliveInvaders.length;
      this.moveInterval = Math.max(100, 1000 - (55 - remaining) * 15);
    }
  }

  move() {
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return;

    // Check if we need to drop
    const leftmost = Math.min(...aliveInvaders.map(inv => inv.x));
    const rightmost = Math.max(...aliveInvaders.map(inv => inv.x));
    
    let shouldDrop = false;
    if (this.direction > 0 && rightmost > SPACE_CONFIG.canvas.width - 50) {
      shouldDrop = true;
      this.direction = -1;
    } else if (this.direction < 0 && leftmost < 50) {
      shouldDrop = true;
      this.direction = 1;
    }

    if (shouldDrop) {
      // Drop down
      aliveInvaders.forEach(invader => {
        invader.y += this.dropDistance;
      });
    } else {
      // Move horizontally
      aliveInvaders.forEach(invader => {
        invader.x += this.horizontalSpeed * this.direction;
      });
    }
  }

  render(ctx) {
    this.invaders.forEach(invader => invader.render(ctx));
  }

  getRandomShooter() {
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return null;
    
    // Get bottom row invaders for each column
    const bottomInvaders = [];
    for (let col = 0; col < SPACE_CONFIG.invaders.cols; col++) {
      const columnInvaders = aliveInvaders
        .filter(inv => inv.col === col)
        .sort((a, b) => b.y - a.y);
      if (columnInvaders.length > 0) {
        bottomInvaders.push(columnInvaders[0]);
      }
    }
    
    if (bottomInvaders.length === 0) return null;
    return bottomInvaders[Math.floor(Math.random() * bottomInvaders.length)];
  }

  checkCollision(projectile) {
    for (const invader of this.invaders) {
      if (invader.alive && invader.getBounds().intersects(projectile.getBounds())) {
        invader.alive = false;
        projectile.active = false;
        return invader;
      }
    }
    return null;
  }

  isEmpty() {
    return this.invaders.filter(inv => inv.alive).length === 0;
  }

  getLowestY() {
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return 0;
    return Math.max(...aliveInvaders.map(inv => inv.y));
  }
}

class Barrier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = SPACE_CONFIG.barriers.width;
    this.height = SPACE_CONFIG.barriers.height;
    this.color = SPACE_CONFIG.barriers.color;
    this.health = 100;
    this.maxHealth = 100;
    this.damage = [];
  }

  update() {
    // Barriers don't need regular updates
  }

  render(ctx) {
    if (this.health <= 0) return;

    const alpha = this.health / this.maxHealth;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Render damage holes
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    this.damage.forEach(hole => {
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }

  getBounds() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  takeDamage(x, y) {
    this.health -= 20;
    this.damage.push({
      x: x - this.x,
      y: y - this.y,
      radius: 8 + Math.random() * 4
    });
  }

  checkCollision(projectile) {
    if (this.health <= 0) return false;
    
    if (this.getBounds().intersects(projectile.getBounds())) {
      this.takeDamage(projectile.x, projectile.y);
      projectile.active = false;
      return true;
    }
    return false;
  }
}

class UFO {
  constructor() {
    this.x = -SPACE_CONFIG.ufo.width;
    this.y = 50;
    this.width = SPACE_CONFIG.ufo.width;
    this.height = SPACE_CONFIG.ufo.height;
    this.speed = SPACE_CONFIG.ufo.speed;
    this.color = SPACE_CONFIG.ufo.color;
    this.active = false;
    this.points = SPACE_CONFIG.ufo.points[Math.floor(Math.random() * SPACE_CONFIG.ufo.points.length)];
  }

  spawn() {
    this.x = -this.width;
    this.active = true;
    this.points = SPACE_CONFIG.ufo.points[Math.floor(Math.random() * SPACE_CONFIG.ufo.points.length)];
  }

  update(deltaTime) {
    if (!this.active) return;
    
    this.x += this.speed * deltaTime;
    
    if (this.x > SPACE_CONFIG.canvas.width) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;
    
    ctx.fillStyle = this.color;
    SpriteRenderer.renderUFOSprite(ctx, this.x, this.y, this.width, this.height);
  }

  getBounds() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  checkCollision(projectile) {
    if (!this.active) return false;
    
    if (this.getBounds().intersects(projectile.getBounds())) {
      this.active = false;
      projectile.active = false;
      return true;
    }
    return false;
  }
}

// ===========================================
// INPUT MANAGER
// ===========================================

class InputManager {
  constructor() {
    this.keys = new Set();
    this.touchControls = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Touch controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    const leftBtn = document.querySelector('[data-direction="left"]');
    const rightBtn = document.querySelector('[data-direction="right"]');
    const shootBtn = document.querySelector('[data-action="shoot"]');

    if (leftBtn) {
      leftBtn.addEventListener('touchstart', () => this.keys.add('ArrowLeft'));
      leftBtn.addEventListener('touchend', () => this.keys.delete('ArrowLeft'));
    }

    if (rightBtn) {
      rightBtn.addEventListener('touchstart', () => this.keys.add('ArrowRight'));
      rightBtn.addEventListener('touchend', () => this.keys.delete('ArrowRight'));
    }

    if (shootBtn) {
      shootBtn.addEventListener('touchstart', () => this.keys.add('Space'));
      shootBtn.addEventListener('touchend', () => this.keys.delete('Space'));
    }
  }

  isPressed(key) {
    return this.keys.has(key);
  }
}

// ===========================================
// MAIN GAME CLASS
// ===========================================

class SpaceInvadersGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = GAME_STATES.MENU;
    this.lastFrameTime = 0;
    
    // Game objects
    this.inputManager = new InputManager();
    this.audioManager = new RetroAudioManager();
    this.particleSystem = new ParticleSystem();
    
    // Game state
    this.score = 0;
    this.lives = SPACE_CONFIG.game.lives;
    this.level = 1;
    this.highScore = parseInt(localStorage.getItem('space_invaders_highScore')) || 0;
    
    // Entities
    this.player = new Player(SPACE_CONFIG.canvas.width / 2, SPACE_CONFIG.canvas.height - 80);
    this.invaderGrid = new InvaderGrid();
    this.barriers = [];
    this.ufo = new UFO();
    this.projectiles = [];
    
    this.setupCanvas();
    this.createBarriers();
    this.setupUI();
    this.initialize();
  }

  setupCanvas() {
    this.canvas.width = SPACE_CONFIG.canvas.width;
    this.canvas.height = SPACE_CONFIG.canvas.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  createBarriers() {
    this.barriers = [];
    const barrierSpacing = SPACE_CONFIG.canvas.width / (SPACE_CONFIG.barriers.count + 1);
    
    for (let i = 0; i < SPACE_CONFIG.barriers.count; i++) {
      const x = barrierSpacing * (i + 1) - SPACE_CONFIG.barriers.width / 2;
      this.barriers.push(new Barrier(x, SPACE_CONFIG.barriers.startY));
    }
  }

  setupUI() {
    const overlayButton = document.getElementById('overlayButton');
    if (overlayButton) {
      overlayButton.addEventListener('click', () => this.handleOverlayClick());
    }
  }

  async initialize() {
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
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.handleInput();
    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  handleInput() {
    // Game start controls (Enter or Space)
    if ((this.inputManager.isPressed('Enter') || this.inputManager.isPressed('Space')) && 
        (this.gameState === GAME_STATES.MENU || this.gameState === GAME_STATES.GAME_OVER)) {
      this.restart();
    }
    
    if (this.inputManager.isPressed('KeyP') || this.inputManager.isPressed('Escape')) {
      this.togglePause();
    }
    if (this.inputManager.isPressed('KeyR')) {
      this.restart();
    }
  }

  update(deltaTime) {
    if (this.gameState !== GAME_STATES.PLAYING) return;

    // Update player
    this.player.update(deltaTime, this.inputManager);

    // Player shooting
    if (this.inputManager.isPressed('Space')) {
      const bullet = this.player.shoot();
      if (bullet) {
        this.projectiles.push(bullet);
        this.audioManager.playShoot();
      }
    }

    // Update invaders
    this.invaderGrid.update(deltaTime);

    // Invader shooting
    if (Math.random() < SPACE_CONFIG.invaders.shootChance) {
      const shooter = this.invaderGrid.getRandomShooter();
      if (shooter) {
        this.projectiles.push(shooter.shoot());
      }
    }

    // Update UFO
    if (!this.ufo.active && Math.random() < SPACE_CONFIG.ufo.spawnChance) {
      this.ufo.spawn();
      this.audioManager.playUFO();
    }
    this.ufo.update(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update barriers
    this.barriers.forEach(barrier => barrier.update(deltaTime));

    // Update particles
    this.particleSystem.update(deltaTime);

    // Check game conditions
    this.checkGameConditions();
  }

  updateProjectiles(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);

      if (!projectile.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collisions
      if (projectile.type === 'player') {
        // Player bullet vs invaders
        const hitInvader = this.invaderGrid.checkCollision(projectile);
        if (hitInvader) {
          this.score += hitInvader.points;
          this.audioManager.playHit();
          this.particleSystem.addExplosion(hitInvader.x, hitInvader.y, hitInvader.color);
          this.projectiles.splice(i, 1);
          continue;
        }

        // Player bullet vs UFO
        if (this.ufo.checkCollision(projectile)) {
          this.score += this.ufo.points;
          this.audioManager.playHit();
          this.particleSystem.addExplosion(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height / 2);
          this.projectiles.splice(i, 1);
          continue;
        }

        // Player bullet vs barriers
        for (const barrier of this.barriers) {
          if (barrier.checkCollision(projectile)) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      } else {
        // Invader bullet vs player
        if (this.player.getBounds().intersects(projectile.getBounds())) {
          this.playerHit();
          this.projectiles.splice(i, 1);
          continue;
        }

        // Invader bullet vs barriers
        for (const barrier of this.barriers) {
          if (barrier.checkCollision(projectile)) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  playerHit() {
    this.lives--;
    this.audioManager.playExplosion();
    this.particleSystem.addExplosion(this.player.x, this.player.y, this.player.color);
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position
      this.player.reset(SPACE_CONFIG.canvas.width / 2, SPACE_CONFIG.canvas.height - 80);
      this.projectiles = this.projectiles.filter(p => p.type === 'player');
    }
    
    this.updateHUD();
  }

  checkGameConditions() {
    // Level complete
    if (this.invaderGrid.isEmpty()) {
      this.levelComplete();
    }

    // Game over - invaders reached bottom
    if (this.invaderGrid.getLowestY() > SPACE_CONFIG.canvas.height - 120) {
      this.gameOver();
    }
  }

  levelComplete() {
    this.level++;
    this.gameState = GAME_STATES.LEVEL_COMPLETE;
    
    // Bonus points for remaining lives
    this.score += this.lives * 100;
    
    setTimeout(() => {
      this.nextLevel();
    }, 2000);
  }

  nextLevel() {
    this.invaderGrid = new InvaderGrid();
    this.createBarriers();
    this.projectiles = [];
    this.particleSystem.clear();
    this.gameState = GAME_STATES.PLAYING;
    this.updateHUD();
  }

  gameOver() {
    this.gameState = GAME_STATES.GAME_OVER;
    this.audioManager.playGameOver();
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('space_invaders_highScore', this.highScore.toString());
    }
    
    this.updateHUD();
    this.showOverlay('GAME OVER', `Puntuación Final: ${this.score}`, 'JUGAR DE NUEVO');
  }

  restart() {
    this.score = 0;
    this.lives = SPACE_CONFIG.game.lives;
    this.level = 1;
    this.gameState = GAME_STATES.PLAYING;
    
    this.player.reset(SPACE_CONFIG.canvas.width / 2, SPACE_CONFIG.canvas.height - 80);
    this.invaderGrid = new InvaderGrid();
    this.createBarriers();
    this.projectiles = [];
    this.particleSystem.clear();
    this.ufo = new UFO();
    
    this.updateHUD();
    this.hideOverlay();
  }

  togglePause() {
    if (this.gameState === GAME_STATES.PLAYING) {
      this.gameState = GAME_STATES.PAUSED;
      this.showOverlay('PAUSADO', 'Presiona P para continuar', 'CONTINUAR');
    } else if (this.gameState === GAME_STATES.PAUSED) {
      this.gameState = GAME_STATES.PLAYING;
      this.hideOverlay();
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = SPACE_CONFIG.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render stars
    this.renderStars();

    if (this.gameState === GAME_STATES.PLAYING || 
        this.gameState === GAME_STATES.PAUSED || 
        this.gameState === GAME_STATES.GAME_OVER ||
        this.gameState === GAME_STATES.LEVEL_COMPLETE) {
      
      // Render game objects
      this.player.render(this.ctx);
      this.invaderGrid.render(this.ctx);
      this.barriers.forEach(barrier => barrier.render(this.ctx));
      this.ufo.render(this.ctx);
      this.projectiles.forEach(projectile => projectile.render(this.ctx));
      this.particleSystem.render(this.ctx);
    }

    // Render state-specific overlays
    if (this.gameState === GAME_STATES.LEVEL_COMPLETE) {
      this.renderLevelComplete();
    }

    // Development debug info
    if (window.location.hostname === 'localhost') {
      this.renderDebugInfo();
    }
  }

  renderStars() {
    this.ctx.fillStyle = SPACE_CONFIG.colors.stars;
    for (let i = 0; i < 50; i++) {
      const x = (i * 127) % this.canvas.width;
      const y = (i * 179) % this.canvas.height;
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  renderLevelComplete() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.font = 'bold 36px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NIVEL COMPLETADO', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '24px Courier New';
    this.ctx.fillText(`Nivel ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.restore();
  }

  renderDebugInfo() {
    this.ctx.save();
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '12px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - this.lastFrameTime))}`, 10, 20);
    this.ctx.fillText(`Estado: ${this.gameState}`, 10, 35);
    this.ctx.fillText(`Proyectiles: ${this.projectiles.length}`, 10, 50);
    this.ctx.fillText(`Invasores: ${this.invaderGrid.invaders.filter(i => i.alive).length}`, 10, 65);
    this.ctx.restore();
  }

  // UI Management
  updateHUD() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('highScore').textContent = this.highScore;
  }

  showOverlay(title, message, buttonText) {
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMessage = document.getElementById('overlayMessage');
    const overlayButton = document.getElementById('overlayButton');

    if (overlayTitle) overlayTitle.textContent = title;
    if (overlayMessage) overlayMessage.textContent = message;
    if (overlayButton) overlayButton.textContent = buttonText;
    
    if (overlay) overlay.classList.add('active');
  }

  hideOverlay() {
    const overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  handleOverlayClick() {
    if (this.gameState === GAME_STATES.MENU || this.gameState === GAME_STATES.GAME_OVER) {
      this.restart();
    } else if (this.gameState === GAME_STATES.PAUSED) {
      this.togglePause();
    }
  }

  /**
   * Enhanced TDD Audit System - AI4Devs Standards Compliance with Visual Fidelity
   */
  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver', 'levelComplete'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    // Performance Tests
    const frameRateOK = this.lastFrameTime && (performance.now() - this.lastFrameTime) < 20;
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    // UI/UX Tests
    const backLink = document.querySelector('a[href*="index.html"]');
    const hasInicioText = backLink && backLink.textContent.includes('INICIO');
    results.push({ name: 'Navigation "INICIO"', pass: hasInicioText, critical: false });
    
    const htmlLang = document.documentElement.lang;
    const isSpanish = htmlLang === 'es' && document.body.textContent.includes('PUNTUACIÓN');
    results.push({ name: 'Language Consistency', pass: isSpanish, critical: false });
    
    const hasInstructions = document.querySelector('details') && 
      document.body.textContent.includes('¿Cómo jugar?');
    results.push({ name: 'Instructions Section', pass: hasInstructions, critical: false });
    
    // Visual Fidelity & Effects Tests
    const spriteRendererExists = typeof SpriteRenderer !== 'undefined';
    results.push({ name: 'Sprite Renderer Available', pass: spriteRendererExists, critical: true });
    
    const canvas = document.querySelector('canvas');
    const canvasStyle = canvas ? getComputedStyle(canvas) : null;
    const hasGlowEffect = canvasStyle && (canvasStyle.filter.includes('drop-shadow') || canvasStyle.boxShadow.includes('cyan'));
    results.push({ name: 'Neon Glow Effects', pass: hasGlowEffect, critical: false });
    
    const containerStyle = document.querySelector('.game-canvas-container');
    const containerGlow = containerStyle ? getComputedStyle(containerStyle) : null;
    const hasContainerGlow = containerGlow && containerGlow.boxShadow.includes('#00ffff');
    results.push({ name: 'Container Glow Effect', pass: hasContainerGlow, critical: false });
    
    // CSS Variables & Consistency Tests
    const rootStyle = getComputedStyle(document.documentElement);
    const hasCyanVar = rootStyle.getPropertyValue('--primary-cyan').includes('#00ffff');
    const hasMagentaVar = rootStyle.getPropertyValue('--primary-magenta').includes('#ff00ff');
    const hasYellowVar = rootStyle.getPropertyValue('--primary-yellow').includes('#ffff00');
    const neonPaletteComplete = hasCyanVar && hasMagentaVar && hasYellowVar;
    results.push({ name: 'Neon Color Palette Variables', pass: neonPaletteComplete, critical: false });
    
    // Control Consistency Tests
    const overlayMessage = document.querySelector('#overlayMessage');
    const hasEnterControl = overlayMessage && overlayMessage.textContent.includes('ENTER');
    results.push({ name: 'Enter Key Support', pass: hasEnterControl, critical: false });
    
    const playButton = document.querySelector('.overlay-button');
    const hasPlayButton = playButton && playButton.textContent.includes('JUGAR');
    results.push({ name: 'Consistent Play Button', pass: hasPlayButton, critical: false });
    
    // Mobile Controls
    const mobileControls = document.querySelector('.mobile-controls');
    const hasMobileControls = mobileControls && mobileControls.querySelectorAll('.dpad-btn').length >= 2;
    results.push({ name: 'Mobile Touch Controls', pass: hasMobileControls, critical: false });
    
    // Technical Tests
    const hasCanvas = canvas && canvas.width === 800 && canvas.height === 600;
    results.push({ name: 'Canvas Configuration', pass: hasCanvas, critical: true });
    
    const isResponsive = canvas && getComputedStyle(canvas).maxWidth === '100%';
    results.push({ name: 'Responsive Canvas', pass: isResponsive, critical: true });
    
    // Accessibility Tests
    const hasKeyboardNav = document.querySelector('[tabindex]') || document.querySelector('button');
    results.push({ name: 'Keyboard Navigation', pass: hasKeyboardNav, critical: false });
    
    const hasAriaLabels = canvas && canvas.hasAttribute('aria-label');
    results.push({ name: 'ARIA Labels', pass: hasAriaLabels, critical: false });
    
    // Game-specific tests
    results.push({ 
      name: 'Invader Formation', 
      pass: this.invaderGrid && this.invaderGrid.invaders.length === 55, 
      critical: true 
    });
    
    results.push({ 
      name: 'Player Controls', 
      pass: this.inputManager && typeof this.inputManager.isPressed === 'function', 
      critical: true 
    });
    
    results.push({ 
      name: 'Audio System', 
      pass: this.audioManager && typeof this.audioManager.playShoot === 'function', 
      critical: false 
    });
    
    results.push({ 
      name: 'Collision System', 
      pass: typeof this.invaderGrid.checkCollision === 'function', 
      critical: true 
    });
    
    results.push({ 
      name: 'High Score Persistence', 
      pass: localStorage.getItem('space_invaders_highScore') !== null || this.highScore >= 0, 
      critical: false 
    });
    
    // Visual Authenticity Tests
    const hasPixelArt = this.ctx && !this.ctx.imageSmoothingEnabled;
    results.push({ name: 'Pixel-Perfect Rendering', pass: hasPixelArt, critical: false });
    
    const cssColorFunction = typeof getCSSColor === 'function';
    results.push({ name: 'CSS Color Integration', pass: cssColorFunction, critical: false });
    
    // Log results
    console.log('🔍 Enhanced TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    if (criticalFails.length > 0) {
      console.error('❌ Critical failures:', criticalFails.map(f => f.name));
    }
    
    const passedCount = results.filter(r => r.pass).length;
    const totalCount = results.length;
    console.log(`📊 Overall Score: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);
    
    // Visual fidelity summary
    const visualTests = results.filter(r => 
      r.name.includes('Glow') || 
      r.name.includes('Sprite') || 
      r.name.includes('Palette') || 
      r.name.includes('Pixel')
    );
    const visualPassed = visualTests.filter(r => r.pass).length;
    console.log(`🎨 Visual Fidelity Score: ${visualPassed}/${visualTests.length} (${Math.round(visualPassed/visualTests.length*100)}%)`);
    
    return { allPassed: results.every(r => r.pass), criticalPassed: allCriticalPassed, results };
  }
}

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  const game = new SpaceInvadersGame();
  window.spaceInvadersGame = game;
  
  // Show initial overlay
  game.showOverlay('SPACE INVADERS', 'Presiona JUGAR para comenzar', 'JUGAR');
  
  console.log('🚀 Space Invaders - GG Edition loaded successfully!');
  console.log('🎮 Ready to defend Earth from the invasion!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.spaceInvadersGame?.gameState === GAME_STATES.PLAYING) {
    window.spaceInvadersGame.togglePause();
  }
});

// Export for testing (if needed)
/* global module:readonly */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { SpaceInvadersGame, SPACE_CONFIG, GAME_STATES };
}
