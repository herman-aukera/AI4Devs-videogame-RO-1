/* © GG, MIT License */
/**
 * GALAGA GG - Formation Flying Space Shooter
 * Classic arcade space shooter with enemy formation patterns and challenging stages
 * AI4Devs Students - Retro Games Collection
 */

/* ===================================================================
   GAME CONFIGURATION & CONSTANTS
================================================================== */

const GALAGA_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#000011'
  },
  player: {
    width: 32,
    height: 24,
    speed: 4,
    fireRate: 300, // milliseconds between shots
    color: '#00FF00',
    capturedColor: '#FF6600'
  },
  bullet: {
    width: 3,
    height: 12,
    speed: 8,
    color: '#FFFF00',
    enemyColor: '#FF0040'
  },
  enemies: {
    bee: {
      width: 24,
      height: 20,
      points: 50,
      color: '#FFFF00',
      health: 1
    },
    butterfly: {
      width: 28,
      height: 24,
      points: 80,
      color: '#FF6600',
      health: 1
    },
    galaga: {
      width: 32,
      height: 28,
      points: 150,
      color: '#FF0040',
      health: 2,
      canCapture: true
    }
  },
  formation: {
    columns: 10,
    rows: 5,
    startX: 100,
    startY: 100,
    spacingX: 48,
    spacingY: 40,
    moveSpeed: 1,
    dropDistance: 20
  },
  game: {
    lives: 3,
    stages: 255,
    bonusStageFrequency: 3, // Every 3rd stage
    formationBonusMultiplier: 2,
    rescueBonusPoints: 1000
  },
  physics: {
    gravity: 0.2,
    maxFallSpeed: 6
  },
  colors: {
    background: '#000011',
    player: '#00FF00',
    playerCaptured: '#FF6600',
    bullet: '#FFFF00',
    enemyBullet: '#FF0040',
    hud: '#FFFFFF',
    stage: '#00FFFF'
  }
};

/* ===================================================================
   UTILITY CLASSES & FUNCTIONS
================================================================== */

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static fromAngle(angle, magnitude = 1) {
    return new Vector2D(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  distance(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  copy() {
    return new Vector2D(this.x, this.y);
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
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  contains(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  center() {
    return new Vector2D(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}

/* ===================================================================
   GAME ENTITIES
================================================================== */

class Bullet {
  constructor(x, y, velocity, type = 'player', owner = null) {
    this.position = new Vector2D(x, y);
    this.velocity = velocity.copy();
    this.type = type;
    this.owner = owner;
    this.active = true;
    this.width = GALAGA_CONFIG.bullet.width;
    this.height = GALAGA_CONFIG.bullet.height;
  }

  update() {
    this.position.add(this.velocity);
    
    // Remove bullets that go off screen
    if (this.position.y < -this.height || 
        this.position.y > GALAGA_CONFIG.canvas.height + this.height ||
        this.position.x < -this.width || 
        this.position.x > GALAGA_CONFIG.canvas.width + this.width) {
      this.active = false;
    }
  }

  getBounds() {
    return new Rectangle(this.position.x, this.position.y, this.width, this.height);
  }

  render(ctx) {
    const color = this.type === 'player' ? 
      GALAGA_CONFIG.colors.bullet : 
      GALAGA_CONFIG.colors.enemyBullet;
    
    ctx.fillStyle = color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Add glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

class Player {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.width = GALAGA_CONFIG.player.width;
    this.height = GALAGA_CONFIG.player.height;
    this.speed = GALAGA_CONFIG.player.speed;
    this.color = GALAGA_CONFIG.colors.player;
    this.active = true;
    this.captured = false;
    this.capturer = null;
    this.lastFireTime = 0;
    this.invulnerable = false;
    this.invulnerabilityTime = 0;
  }

  update(deltaTime) {
    // Handle invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false;
      }
    }

    // Update position
    this.position.add(this.velocity);
    
    // Keep player within screen bounds
    this.position.x = Math.max(0, Math.min(this.position.x, 
      GALAGA_CONFIG.canvas.width - this.width));
  }

  moveLeft() {
    this.velocity.x = -this.speed;
  }

  moveRight() {
    this.velocity.x = this.speed;
  }

  stopMoving() {
    this.velocity.x = 0;
  }

  canFire() {
    return Date.now() - this.lastFireTime > GALAGA_CONFIG.player.fireRate;
  }

  fire() {
    if (!this.canFire() || this.captured) return null;
    
    this.lastFireTime = Date.now();
    const bulletX = this.position.x + this.width / 2 - GALAGA_CONFIG.bullet.width / 2;
    const bulletY = this.position.y;
    const velocity = new Vector2D(0, -GALAGA_CONFIG.bullet.speed);
    
    return new Bullet(bulletX, bulletY, velocity, 'player', this);
  }

  capture(capturer) {
    this.captured = true;
    this.capturer = capturer;
    this.color = GALAGA_CONFIG.colors.playerCaptured;
  }

  rescue() {
    this.captured = false;
    this.capturer = null;
    this.color = GALAGA_CONFIG.colors.player;
    this.makeInvulnerable(3000); // 3 seconds of invulnerability
  }

  makeInvulnerable(duration) {
    this.invulnerable = true;
    this.invulnerabilityTime = duration;
  }

  getBounds() {
    return new Rectangle(this.position.x, this.position.y, this.width, this.height);
  }

  render(ctx) {
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
      return; // Flashing effect during invulnerability
    }

    ctx.fillStyle = this.color;
    
    // Simple ship shape
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.width / 2, this.position.y);
    ctx.lineTo(this.position.x, this.position.y + this.height);
    ctx.lineTo(this.position.x + this.width / 4, this.position.y + this.height * 0.8);
    ctx.lineTo(this.position.x + this.width * 0.75, this.position.y + this.height * 0.8);
    ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Add glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Enemy {
  constructor(x, y, type, formationX, formationY) {
    this.position = new Vector2D(x, y);
    this.formationPosition = new Vector2D(formationX, formationY);
    this.velocity = new Vector2D(0, 0);
    this.type = type;
    this.config = GALAGA_CONFIG.enemies[type];
    this.width = this.config.width;
    this.height = this.config.height;
    this.color = this.config.color;
    this.points = this.config.points;
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.active = true;
    this.inFormation = true;
    this.attacking = false;
    this.captured = null; // Reference to captured player
    this.lastFireTime = 0;
    this.fireRate = 2000 + Math.random() * 3000; // Random fire rate
    this.attackPath = [];
    this.attackPathIndex = 0;
    this.animationFrame = 0;
  }

  update(deltaTime, formationOffset) {
    this.animationFrame += deltaTime * 0.01;
    
    if (this.inFormation) {
      // Move with formation
      this.position.x = this.formationPosition.x + formationOffset.x;
      this.position.y = this.formationPosition.y + formationOffset.y;
    } else if (this.attacking) {
      // Follow attack path
      if (this.attackPath.length > 0 && this.attackPathIndex < this.attackPath.length) {
        const target = this.attackPath[this.attackPathIndex];
        const direction = new Vector2D(
          target.x - this.position.x,
          target.y - this.position.y
        );
        
        if (direction.magnitude() < 5) {
          this.attackPathIndex++;
        } else {
          direction.normalize().multiply(3);
          this.velocity = direction;
        }
      }
      
      this.position.add(this.velocity);
      
      // Return to formation if off screen
      if (this.position.y > GALAGA_CONFIG.canvas.height + 50) {
        this.returnToFormation();
      }
    }
    
    // Handle captured player
    if (this.captured) {
      this.captured.position.x = this.position.x + this.width / 2 - this.captured.width / 2;
      this.captured.position.y = this.position.y + this.height;
    }
  }

  startAttack() {
    if (this.attacking) return;
    
    this.inFormation = false;
    this.attacking = true;
    this.generateAttackPath();
  }

  generateAttackPath() {
    this.attackPath = [];
    this.attackPathIndex = 0;
    
    // Generate curved attack path
    const startX = this.position.x;
    const startY = this.position.y;
    const endX = Math.random() * (GALAGA_CONFIG.canvas.width - this.width);
    const endY = GALAGA_CONFIG.canvas.height + 50;
    
    // Create bezier curve points
    const controlX1 = startX + (Math.random() - 0.5) * 200;
    const controlY1 = startY + 100;
    const controlX2 = endX + (Math.random() - 0.5) * 200;
    const controlY2 = endY - 100;
    
    for (let t = 0; t <= 1; t += 0.02) {
      const x = Math.pow(1 - t, 3) * startX + 
                3 * Math.pow(1 - t, 2) * t * controlX1 + 
                3 * (1 - t) * Math.pow(t, 2) * controlX2 + 
                Math.pow(t, 3) * endX;
      const y = Math.pow(1 - t, 3) * startY + 
                3 * Math.pow(1 - t, 2) * t * controlY1 + 
                3 * (1 - t) * Math.pow(t, 2) * controlY2 + 
                Math.pow(t, 3) * endY;
      
      this.attackPath.push(new Vector2D(x, y));
    }
  }

  returnToFormation() {
    this.attacking = false;
    this.inFormation = true;
    this.attackPath = [];
    this.attackPathIndex = 0;
    this.velocity = new Vector2D(0, 0);
  }

  canFire() {
    return Date.now() - this.lastFireTime > this.fireRate;
  }

  fire() {
    if (!this.canFire() || !this.active) return null;
    
    this.lastFireTime = Date.now();
    const bulletX = this.position.x + this.width / 2 - GALAGA_CONFIG.bullet.width / 2;
    const bulletY = this.position.y + this.height;
    const velocity = new Vector2D(0, GALAGA_CONFIG.bullet.speed * 0.7);
    
    return new Bullet(bulletX, bulletY, velocity, 'enemy', this);
  }

  canCapture() {
    return this.type === 'galaga' && this.config.canCapture && !this.captured;
  }

  capturePlayer(player) {
    if (!this.canCapture()) return false;
    
    this.captured = player;
    player.capture(this);
    return true;
  }

  releasePlayer() {
    if (this.captured) {
      this.captured.rescue();
      this.captured = null;
    }
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.active = false;
      this.releasePlayer();
      return true; // Enemy destroyed
    }
    return false;
  }

  getBounds() {
    return new Rectangle(this.position.x, this.position.y, this.width, this.height);
  }

  render(ctx) {
    if (!this.active) return;
    
    ctx.fillStyle = this.color;
    
    // Render based on enemy type
    switch (this.type) {
      case 'bee':
        this.renderBee(ctx);
        break;
      case 'butterfly':
        this.renderButterfly(ctx);
        break;
      case 'galaga':
        this.renderGalaga(ctx);
        break;
    }
    
    // Add glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }

  renderBee(ctx) {
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    const wingOffset = Math.sin(this.animationFrame) * 2;
    
    // Body
    ctx.fillRect(centerX - 3, this.position.y + 5, 6, this.height - 10);
    
    // Wings
    ctx.fillRect(this.position.x + wingOffset, centerY - 3, 8, 6);
    ctx.fillRect(this.position.x + this.width - 8 - wingOffset, centerY - 3, 8, 6);
  }

  renderButterfly(ctx) {
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    const wingOffset = Math.sin(this.animationFrame) * 3;
    
    // Body
    ctx.fillRect(centerX - 2, this.position.y + 2, 4, this.height - 4);
    
    // Large wings
    ctx.fillRect(this.position.x + wingOffset, this.position.y + 2, 10, 8);
    ctx.fillRect(this.position.x + this.width - 10 - wingOffset, this.position.y + 2, 10, 8);
    ctx.fillRect(this.position.x + wingOffset, centerY, 8, 6);
    ctx.fillRect(this.position.x + this.width - 8 - wingOffset, centerY, 8, 6);
  }

  renderGalaga(ctx) {
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    
    // Main body
    ctx.fillRect(centerX - 4, this.position.y + 3, 8, this.height - 6);
    
    // Side extensions
    ctx.fillRect(this.position.x + 2, centerY - 2, 6, 4);
    ctx.fillRect(this.position.x + this.width - 8, centerY - 2, 6, 4);
    
    // Top extension
    ctx.fillRect(centerX - 6, this.position.y, 12, 6);
    
    // Tractor beam if capturing
    if (this.captured) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 5, this.position.y + this.height);
      ctx.lineTo(this.captured.position.x, this.captured.position.y);
      ctx.moveTo(centerX + 5, this.position.y + this.height);
      ctx.lineTo(this.captured.position.x + this.captured.width, this.captured.position.y);
      ctx.stroke();
    }
  }
}

class Formation {
  constructor() {
    this.enemies = [];
    this.position = new Vector2D(GALAGA_CONFIG.formation.startX, GALAGA_CONFIG.formation.startY);
    this.velocity = new Vector2D(GALAGA_CONFIG.formation.moveSpeed, 0);
    this.direction = 1; // 1 for right, -1 for left
    this.dropTimer = 0;
    this.attackCooldown = 0;
  }

  initialize() {
    this.enemies = [];
    const config = GALAGA_CONFIG.formation;
    
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const x = col * config.spacingX;
        const y = row * config.spacingY;
        let type;
        
        // Define formation layout
        if (row === 0) {
          type = 'galaga';
        } else if (row === 1 || row === 2) {
          type = 'butterfly';
        } else {
          type = 'bee';
        }
        
        const enemy = new Enemy(
          this.position.x + x,
          this.position.y + y,
          type,
          x,
          y
        );
        
        this.enemies.push(enemy);
      }
    }
  }

  update(deltaTime) {
    this.attackCooldown -= deltaTime;
    
    // Move formation
    this.position.add(this.velocity);
    
    // Check boundaries and reverse direction
    const formationWidth = GALAGA_CONFIG.formation.columns * GALAGA_CONFIG.formation.spacingX;
    if (this.position.x <= 0 || this.position.x + formationWidth >= GALAGA_CONFIG.canvas.width) {
      this.direction *= -1;
      this.velocity.x = GALAGA_CONFIG.formation.moveSpeed * this.direction;
      this.position.y += GALAGA_CONFIG.formation.dropDistance;
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(deltaTime, this.position);
      }
    });
    
    // Randomly select enemies to attack
    if (this.attackCooldown <= 0 && this.getActiveEnemies().length > 0) {
      this.selectAttacker();
      this.attackCooldown = 2000 + Math.random() * 3000;
    }
    
    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);
  }

  selectAttacker() {
    const availableEnemies = this.enemies.filter(enemy => 
      enemy.active && enemy.inFormation && !enemy.captured
    );
    
    if (availableEnemies.length === 0) return;
    
    const attacker = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    attacker.startAttack();
  }

  getActiveEnemies() {
    return this.enemies.filter(enemy => enemy.active);
  }

  getAllEnemies() {
    return this.enemies;
  }

  isEmpty() {
    return this.getActiveEnemies().length === 0;
  }

  render(ctx) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }
}

/* ===================================================================
   GAME ENGINE
================================================================== */

class GalagaGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = 'menu'; // menu, playing, paused, gameOver, stageTransition
    this.score = 0;
    this.stage = 1;
    this.lives = GALAGA_CONFIG.game.lives;
    this.highScore = this.loadHighScore();
    
    // Game objects
    this.player = null;
    this.capturedPlayer = null; // For when player is captured
    this.formation = null;
    this.bullets = [];
    this.particles = [];
    
    // Input handling
    this.keys = new Set();
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    
    // Game progression
    this.stageTransitionTimer = 0;
    this.stageCompleteBonus = 0;
    
    // Mobile controls
    this.touchControls = {
      left: false,
      right: false,
      fire: false
    };

    this.initialize();
  }

  async initialize() {
    try {
      this.setupCanvas();
      this.setupEventListeners();
      this.setupMobileControls();
      this.updateUI();
      this.startGameLoop();

      // Initialize Universal Systems
      if (typeof UniversalAudio !== 'undefined') {
        UniversalAudio.init();
      }
      if (typeof Tournament !== 'undefined') {
        Tournament.init();
      }
      if (typeof Achievements !== 'undefined') {
        Achievements.init();
      }

      // Enhanced audit integration for development
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('🔍 Running GALAGA development audit...');
        window.runAudit = this.runAuditTasks.bind(this);
        setTimeout(() => this.runAuditTasks(), 1000);
      }

      console.log('🚀 GALAGA GG initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GALAGA GG:', error);
    }
  }

  setupCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Unable to get 2D context');
    }
    
    this.canvas.width = GALAGA_CONFIG.canvas.width;
    this.canvas.height = GALAGA_CONFIG.canvas.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // UI button events
    document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
    document.getElementById('resumeButton')?.addEventListener('click', () => this.togglePause());
    document.getElementById('restartButton')?.addEventListener('click', () => this.restartGame());
    
    // Canvas focus for keyboard input
    this.canvas.addEventListener('click', () => this.canvas.focus());
  }

  setupMobileControls() {
    const moveLeftBtn = document.getElementById('moveLeft');
    const moveRightBtn = document.getElementById('moveRight');
    const fireBtn = document.getElementById('fireBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    if (moveLeftBtn) {
      moveLeftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchControls.left = true;
      });
      moveLeftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchControls.left = false;
      });
    }

    if (moveRightBtn) {
      moveRightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchControls.right = true;
      });
      moveRightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchControls.right = false;
      });
    }

    if (fireBtn) {
      fireBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchControls.fire = true;
      });
      fireBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchControls.fire = false;
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.togglePause();
      });
    }
  }

  handleKeyDown(e) {
    this.keys.add(e.code);
    
    // Game state controls
    if (e.code === 'Enter') {
      if (this.gameState === 'menu') {
        this.startGame();
      } else if (this.gameState === 'gameOver') {
        this.restartGame();
      }
    }
    
    if (e.code === 'KeyP' && this.gameState === 'playing') {
      this.togglePause();
    }

    // Universal Systems shortcuts
    if (e.code === 'KeyM') {
      if (typeof UniversalAudio !== 'undefined') {
        UniversalAudio.toggle();
      }
    }
    if (e.code === 'KeyT') {
      if (typeof Tournament !== 'undefined') {
        Tournament.toggleOverlay();
      }
    }
    if (e.code === 'KeyA') {
      if (typeof Achievements !== 'undefined') {
        Achievements.toggleBrowser();
      }
    }
    
    e.preventDefault();
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.stage = 1;
    this.lives = GALAGA_CONFIG.game.lives;
    
    this.initializeStage();
    this.hideAllOverlays();
    this.updateUI();
    
    // Universal Systems Integration
    if (typeof UniversalAudio !== 'undefined') {
      UniversalAudio.playGameStart();
    }
    if (typeof Achievements !== 'undefined') {
      Achievements.trackEvent('game_start', { game: 'galaga' });
    }
    
    console.log('🚀 Galaga started!');
  }

  initializeStage() {
    // Create player
    this.player = new Player(
      GALAGA_CONFIG.canvas.width / 2 - GALAGA_CONFIG.player.width / 2,
      GALAGA_CONFIG.canvas.height - GALAGA_CONFIG.player.height - 20
    );
    
    // Create formation
    this.formation = new Formation();
    this.formation.initialize();
    
    // Clear bullets and particles
    this.bullets = [];
    this.particles = [];
    this.capturedPlayer = null;
  }

  restartGame() {
    this.clearGameObjects();
    this.startGame();
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      document.getElementById('pauseScreen').style.display = 'flex';
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.gameState = 'playing';
    document.getElementById('pauseScreen').style.display = 'none';
  }

  gameOver() {
    this.gameState = 'gameOver';
    
    // Universal Systems Integration
    if (typeof UniversalAudio !== 'undefined') {
      UniversalAudio.playGameOver();
    }
    if (typeof Tournament !== 'undefined') {
      Tournament.submitScore('galaga', this.score, { stage: this.stage });
    }
    if (typeof Achievements !== 'undefined') {
      Achievements.trackEvent('game_over', { 
        game: 'galaga', 
        score: this.score, 
        stage: this.stage 
      });
    }
    
    // Check for high score
    let newHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      newHighScore = true;
      
      if (typeof Achievements !== 'undefined') {
        Achievements.trackEvent('high_score', { 
          game: 'galaga', 
          score: this.score 
        });
      }
    }
    
    // Update game over screen
    document.getElementById('finalScore').textContent = this.score.toLocaleString();
    document.getElementById('finalStage').textContent = this.stage;
    document.getElementById('newHighScore').style.display = newHighScore ? 'block' : 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    console.log('💥 Game Over! Final Score:', this.score);
  }

  nextStage() {
    this.stage++;
    this.gameState = 'stageTransition';
    this.stageTransitionTimer = 3000; // 3 seconds
    
    // Calculate stage completion bonus
    this.stageCompleteBonus = this.lives * 100;
    this.score += this.stageCompleteBonus;
    
    if (typeof Achievements !== 'undefined') {
      Achievements.trackEvent('stage_complete', { 
        game: 'galaga', 
        stage: this.stage - 1,
        score: this.score
      });
    }
  }

  update() {
    if (this.gameState !== 'playing' && this.gameState !== 'stageTransition') return;
    
    const currentTime = performance.now();
    this.deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    if (this.gameState === 'stageTransition') {
      this.stageTransitionTimer -= this.deltaTime;
      if (this.stageTransitionTimer <= 0) {
        this.initializeStage();
        this.gameState = 'playing';
      }
      return;
    }
    
    this.handleInput();
    this.updatePlayer();
    this.updateFormation();
    this.updateBullets();
    this.checkCollisions();
    this.updateUI();
    
    // Check win condition
    if (this.formation.isEmpty()) {
      this.nextStage();
    }
  }

  handleInput() {
    if (!this.player || !this.player.active || this.player.captured) return;
    
    // Movement
    if (this.keys.has('ArrowLeft') || this.touchControls.left) {
      this.player.moveLeft();
    } else if (this.keys.has('ArrowRight') || this.touchControls.right) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }
    
    // Firing
    if (this.keys.has('Space') || this.touchControls.fire) {
      const bullet = this.player.fire();
      if (bullet) {
        this.bullets.push(bullet);
      }
    }
  }

  updatePlayer() {
    if (this.player && this.player.active) {
      this.player.update(this.deltaTime);
    }
  }

  updateFormation() {
    if (this.formation) {
      this.formation.update(this.deltaTime);
      
      // Handle enemy firing
      this.formation.getAllEnemies().forEach(enemy => {
        if (enemy.active && Math.random() < 0.001) { // Random firing chance
          const bullet = enemy.fire();
          if (bullet) {
            this.bullets.push(bullet);
          }
        }
      });
    }
  }

  updateBullets() {
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(bullet => bullet.active);
  }

  checkCollisions() {
    // Player bullets vs enemies
    this.bullets.forEach(bullet => {
      if (bullet.type !== 'player') return;
      
      this.formation.getAllEnemies().forEach(enemy => {
        if (!enemy.active) return;
        
        if (bullet.getBounds().intersects(enemy.getBounds())) {
          bullet.active = false;
          
          if (enemy.takeDamage()) {
            // Enemy destroyed
            this.score += enemy.points;
            
            // Universal Systems Integration
            if (typeof UniversalAudio !== 'undefined') {
              UniversalAudio.playPointScore();
            }
            if (typeof Achievements !== 'undefined') {
              Achievements.trackEvent('enemy_destroyed', { 
                game: 'galaga', 
                enemyType: enemy.type,
                points: enemy.points,
                score: this.score
              });
            }
            
            // Handle captured player rescue
            if (enemy.captured) {
              this.score += GALAGA_CONFIG.game.rescueBonusPoints;
              
              if (typeof Achievements !== 'undefined') {
                Achievements.trackEvent('player_rescued', { 
                  game: 'galaga', 
                  bonus: GALAGA_CONFIG.game.rescueBonusPoints,
                  score: this.score
                });
              }
            }
          }
        }
      });
    });
    
    // Enemy bullets vs player
    this.bullets.forEach(bullet => {
      if (bullet.type !== 'enemy' || !this.player || !this.player.active || this.player.invulnerable) return;
      
      if (bullet.getBounds().intersects(this.player.getBounds())) {
        bullet.active = false;
        this.playerHit();
      }
    });
    
    // Enemies vs player (collision/capture)
    if (this.player && this.player.active && !this.player.invulnerable) {
      this.formation.getAllEnemies().forEach(enemy => {
        if (!enemy.active) return;
        
        if (enemy.getBounds().intersects(this.player.getBounds())) {
          if (enemy.canCapture() && Math.random() < 0.3) { // 30% chance of capture
            enemy.capturePlayer(this.player);
            
            if (typeof Achievements !== 'undefined') {
              Achievements.trackEvent('player_captured', { 
                game: 'galaga'
              });
            }
          } else {
            this.playerHit();
          }
        }
      });
    }
  }

  playerHit() {
    if (!this.player || this.player.captured) return;
    
    this.lives--;
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.player.makeInvulnerable(3000);
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = GALAGA_CONFIG.canvas.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.gameState === 'stageTransition') {
      this.renderStageTransition();
      return;
    }
    
    // Render game objects
    if (this.formation) {
      this.formation.render(this.ctx);
    }
    
    if (this.player && this.player.active) {
      this.player.render(this.ctx);
    }
    
    this.bullets.forEach(bullet => bullet.render(this.ctx));
    
    // Render particles (if any)
    this.particles.forEach(particle => particle.render(this.ctx));
  }

  renderStageTransition() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`STAGE ${this.stage}`, this.canvas.width / 2, this.canvas.height / 2);
    
    if (this.stageCompleteBonus > 0) {
      this.ctx.font = '24px monospace';
      this.ctx.fillText(`Bonus: ${this.stageCompleteBonus}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      this.update();
      this.render();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  updateUI() {
    document.getElementById('score').textContent = this.score.toLocaleString();
    document.getElementById('highScore').textContent = this.highScore.toLocaleString();
    document.getElementById('stage').textContent = this.stage;
    
    // Update lives display
    const livesDisplay = document.getElementById('lives');
    if (livesDisplay) {
      livesDisplay.innerHTML = '';
      for (let i = 0; i < this.lives; i++) {
        const shipIcon = document.createElement('span');
        shipIcon.className = 'ship-icon';
        shipIcon.textContent = '🚀';
        livesDisplay.appendChild(shipIcon);
      }
    }
  }

  hideAllOverlays() {
    const overlays = ['startScreen', 'pauseScreen', 'gameOverScreen'];
    overlays.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });
  }

  clearGameObjects() {
    this.bullets = [];
    this.particles = [];
    this.formation = null;
    this.player = null;
    this.capturedPlayer = null;
  }

  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('galaga_highScore')) || 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('galaga_highScore', this.highScore.toString());
    } catch (e) {
      console.warn('Could not save high score to localStorage');
    }
  }

  /**
   * Enhanced TDD Audit System - AI4Devs Standards Compliance
   */
  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver', 'stageTransition'];
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
    
    // Galaga-specific Tests
    const hasFormation = this.formation && this.formation.enemies.length > 0;
    results.push({ name: 'Formation System', pass: hasFormation, critical: true });
    
    const hasPlayer = this.player !== null;
    results.push({ name: 'Player System', pass: hasPlayer, critical: true });
    
    // Universal Systems Tests
    const hasUniversalAudio = typeof UniversalAudio !== 'undefined';
    results.push({ name: 'Universal Audio System', pass: hasUniversalAudio, critical: false });
    
    const hasTournament = typeof Tournament !== 'undefined';
    results.push({ name: 'Tournament System', pass: hasTournament, critical: false });
    
    const hasAchievements = typeof Achievements !== 'undefined';
    results.push({ name: 'Achievement System', pass: hasAchievements, critical: false });
    
    // Log results
    console.log('🔍 GALAGA TDD Audit Results:');
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
   GAME INITIALIZATION
================================================================== */

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.game = new GalagaGame();
    console.log('🚀 GALAGA GG loaded successfully');
  } catch (error) {
    console.error('Failed to initialize GALAGA GG:', error);
    
    // Show error message to user
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading game', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Check console for details', canvas.width / 2, canvas.height / 2 + 30);
    }
  }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GalagaGame;
}
