/* © GG, MIT License */
/**
 * ASTEROIDS GG - Vector Graphics Space Combat
 * Advanced physics engine with authentic vector graphics rendering
 * AI4Devs Students - Retro Games Collection
 */

/* ===================================================================
   GAME CONFIGURATION & CONSTANTS
================================================================== */

const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#000000'
  },
  ship: {
    size: 12,
    thrustPower: 200,
    rotationSpeed: 4,
    maxSpeed: 400,
    friction: 0.98,
    invulnerabilityTime: 3000,
    respawnTime: 2000
  },
  asteroid: {
    sizes: { large: 40, medium: 25, small: 15 },
    speeds: { large: 50, medium: 80, small: 120 },
    points: { large: 20, medium: 50, small: 100 },
    minDistance: 100 // Minimum spawn distance from ship
  },
  bullet: {
    speed: 500,
    lifetime: 1500,
    maxCount: 4
  },
  ufo: {
    size: 20,
    speed: 100,
    fireRate: 2000,
    points: 1000,
    spawnInterval: 30000
  },
  game: {
    lives: 3,
    hyperspaceRisk: 0.3,
    levelMultiplier: 1.2,
    baseAsteroidCount: 4
  },
  physics: {
    maxVelocity: 500,
    wraparound: true
  },
  colors: {
    ship: '#00FF00',
    asteroid: '#FFFFFF',
    bullet: '#FFFF00',
    ufo: '#FF0040',
    thrust: '#FFFF00',
    explosion: ['#FFFF00', '#FF6600', '#FF0040']
  }
};

/* ===================================================================
   PHYSICS & MATHEMATICS UTILITIES
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

  limit(max) {
    if (this.magnitude() > max) {
      this.normalize().multiply(max);
    }
    return this;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }
}

class PhysicsObject {
  constructor(x, y, vx = 0, vy = 0, rotation = 0, angularVelocity = 0) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(vx, vy);
    this.rotation = rotation;
    this.angularVelocity = angularVelocity;
    this.mass = 1;
    this.radius = 10;
    this.active = true;
  }

  update(deltaTime) {
    if (!this.active) return;

    // Apply physics
    this.position.add(new Vector2D(this.velocity.x, this.velocity.y).multiply(deltaTime));
    this.rotation += this.angularVelocity * deltaTime;

    // Wrap around screen boundaries
    if (GAME_CONFIG.physics.wraparound) {
      this.wrapAround();
    }

    // Apply friction if applicable
    if (this.friction) {
      this.velocity.multiply(this.friction);
    }
  }

  wrapAround() {
    const margin = this.radius;
    
    if (this.position.x < -margin) {
      this.position.x = GAME_CONFIG.canvas.width + margin;
    } else if (this.position.x > GAME_CONFIG.canvas.width + margin) {
      this.position.x = -margin;
    }
    
    if (this.position.y < -margin) {
      this.position.y = GAME_CONFIG.canvas.height + margin;
    } else if (this.position.y > GAME_CONFIG.canvas.height + margin) {
      this.position.y = -margin;
    }
  }

  distanceTo(other) {
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  collidesWith(other) {
    return this.distanceTo(other) < (this.radius + other.radius);
  }
}

/* ===================================================================
   VECTOR GRAPHICS RENDERER
================================================================== */

class VectorRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.setupCanvas();
  }

  setupCanvas() {
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
  }

  drawShip(ship, invulnerable = false) {
    this.ctx.save();
    this.ctx.translate(ship.position.x, ship.position.y);
    this.ctx.rotate(ship.rotation);

    // Set ship style
    this.ctx.strokeStyle = invulnerable && Math.floor(Date.now() / 100) % 2 ? 
      'rgba(0, 255, 0, 0.5)' : GAME_CONFIG.colors.ship;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Draw ship triangle
    this.ctx.beginPath();
    this.ctx.moveTo(GAME_CONFIG.ship.size, 0);
    this.ctx.lineTo(-GAME_CONFIG.ship.size * 0.7, -GAME_CONFIG.ship.size * 0.5);
    this.ctx.lineTo(-GAME_CONFIG.ship.size * 0.3, 0);
    this.ctx.lineTo(-GAME_CONFIG.ship.size * 0.7, GAME_CONFIG.ship.size * 0.5);
    this.ctx.closePath();
    this.ctx.stroke();

    // Draw thrust flame
    if (ship.thrusting) {
      this.ctx.strokeStyle = GAME_CONFIG.colors.thrust;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-GAME_CONFIG.ship.size * 0.7, -3);
      this.ctx.lineTo(-GAME_CONFIG.ship.size * 1.2 - Math.random() * 5, 0);
      this.ctx.lineTo(-GAME_CONFIG.ship.size * 0.7, 3);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawAsteroid(asteroid) {
    this.ctx.save();
    this.ctx.translate(asteroid.position.x, asteroid.position.y);
    this.ctx.rotate(asteroid.rotation);

    this.ctx.strokeStyle = GAME_CONFIG.colors.asteroid;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Draw irregular asteroid shape
    this.ctx.beginPath();
    const points = asteroid.shape;
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawBullet(bullet) {
    this.ctx.save();
    this.ctx.fillStyle = GAME_CONFIG.colors.bullet;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = GAME_CONFIG.colors.bullet;

    this.ctx.beginPath();
    this.ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawUFO(ufo) {
    this.ctx.save();
    this.ctx.translate(ufo.position.x, ufo.position.y);

    this.ctx.strokeStyle = GAME_CONFIG.colors.ufo;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    // Draw UFO body
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, GAME_CONFIG.ufo.size, GAME_CONFIG.ufo.size * 0.4, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw UFO dome
    this.ctx.beginPath();
    this.ctx.ellipse(0, -5, GAME_CONFIG.ufo.size * 0.6, GAME_CONFIG.ufo.size * 0.3, 0, 0, Math.PI, true);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawExplosion(explosion) {
    this.ctx.save();
    this.ctx.translate(explosion.position.x, explosion.position.y);

    const progress = (Date.now() - explosion.startTime) / explosion.duration;
    const alpha = 1 - progress;
    
    explosion.particles.forEach(particle => {
      this.ctx.strokeStyle = `rgba(255, ${255 - progress * 255}, 0, ${alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';

      const x = particle.x * progress * 20;
      const y = particle.y * progress * 20;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + particle.vx * 5, y + particle.vy * 5);
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  clear() {
    this.ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    this.ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
  }
}

/* ===================================================================
   GAME ENTITIES
================================================================== */

class Ship extends PhysicsObject {
  constructor(x, y) {
    super(x, y);
    this.radius = GAME_CONFIG.ship.size;
    this.thrusting = false;
    this.friction = GAME_CONFIG.ship.friction;
    this.thrustVector = new Vector2D(0, 0);
    this.invulnerable = false;
    this.invulnerabilityStart = 0;
  }

  update(deltaTime) {
    // Handle thrust
    if (this.thrusting) {
      this.thrustVector = Vector2D.fromAngle(this.rotation, GAME_CONFIG.ship.thrustPower * deltaTime);
      this.velocity.add(this.thrustVector);
    }

    // Limit maximum speed
    this.velocity.limit(GAME_CONFIG.ship.maxSpeed);

    super.update(deltaTime);

    // Handle invulnerability
    if (this.invulnerable) {
      if (Date.now() - this.invulnerabilityStart > GAME_CONFIG.ship.invulnerabilityTime) {
        this.invulnerable = false;
      }
    }
  }

  thrust(active) {
    this.thrusting = active;
  }

  rotate(direction) {
    this.angularVelocity = direction * GAME_CONFIG.ship.rotationSpeed;
  }

  makeInvulnerable() {
    this.invulnerable = true;
    this.invulnerabilityStart = Date.now();
  }

  hyperspace() {
    // Random teleportation with risk
    this.position.x = Math.random() * GAME_CONFIG.canvas.width;
    this.position.y = Math.random() * GAME_CONFIG.canvas.height;
    this.velocity.multiply(0.5); // Reduce velocity

    // Risk of destruction
    if (Math.random() < GAME_CONFIG.game.hyperspaceRisk) {
      this.active = false;
      return true; // Ship destroyed
    }
    
    this.makeInvulnerable();
    return false;
  }
}

class Asteroid extends PhysicsObject {
  constructor(x, y, size, velocity) {
    super(x, y, velocity.x, velocity.y);
    this.size = size;
    this.radius = GAME_CONFIG.asteroid.sizes[size];
    this.angularVelocity = (Math.random() - 0.5) * 3;
    this.shape = this.generateShape();
    this.points = GAME_CONFIG.asteroid.points[size];
  }

  generateShape() {
    const points = [];
    const vertices = 8 + Math.floor(Math.random() * 4);
    const radius = this.radius;

    for (let i = 0; i < vertices; i++) {
      const angle = (Math.PI * 2 * i) / vertices;
      const variation = 0.3 + Math.random() * 0.4;
      const x = Math.cos(angle) * radius * variation;
      const y = Math.sin(angle) * radius * variation;
      points.push(new Vector2D(x, y));
    }

    return points;
  }

  split() {
    if (this.size === 'small') return [];

    const newSize = this.size === 'large' ? 'medium' : 'small';
    const fragments = [];
    const count = 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = GAME_CONFIG.asteroid.speeds[newSize];
      const velocity = Vector2D.fromAngle(angle, speed);

      const fragment = new Asteroid(
        this.position.x + Math.cos(angle) * this.radius,
        this.position.y + Math.sin(angle) * this.radius,
        newSize,
        velocity
      );

      fragments.push(fragment);
    }

    return fragments;
  }
}

class Bullet extends PhysicsObject {
  constructor(x, y, angle) {
    const velocity = Vector2D.fromAngle(angle, GAME_CONFIG.bullet.speed);
    super(x, y, velocity.x, velocity.y);
    this.radius = 2;
    this.lifetime = GAME_CONFIG.bullet.lifetime;
    this.startTime = Date.now();
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Remove bullet after lifetime expires
    if (Date.now() - this.startTime > this.lifetime) {
      this.active = false;
    }
  }
}

class UFO extends PhysicsObject {
  constructor(x, y) {
    super(x, y);
    this.radius = GAME_CONFIG.ufo.size;
    this.velocity = new Vector2D(GAME_CONFIG.ufo.speed * (Math.random() > 0.5 ? 1 : -1), 0);
    this.lastShot = 0;
    this.target = null;
    this.points = GAME_CONFIG.ufo.points;
  }

  update(deltaTime, ship) {
    super.update(deltaTime);
    this.target = ship;

    // Change direction occasionally
    if (Math.random() < 0.02) {
      this.velocity.y = (Math.random() - 0.5) * GAME_CONFIG.ufo.speed;
    }

    // Stay within screen bounds (remove UFO if off screen for too long)
    if (this.position.x < -100 || this.position.x > GAME_CONFIG.canvas.width + 100) {
      this.active = false;
    }
  }

  canShoot() {
    return Date.now() - this.lastShot > GAME_CONFIG.ufo.fireRate;
  }

  shoot(ship) {
    if (!this.canShoot()) return null;

    this.lastShot = Date.now();

    // Calculate angle to ship with some inaccuracy
    const dx = ship.position.x - this.position.x;
    const dy = ship.position.y - this.position.y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;

    return new Bullet(this.position.x, this.position.y, angle);
  }
}

class Explosion {
  constructor(x, y, size = 1) {
    this.position = new Vector2D(x, y);
    this.startTime = Date.now();
    this.duration = 500 * size;
    this.particles = [];

    // Generate explosion particles
    for (let i = 0; i < 8 * size; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      });
    }
  }

  isFinished() {
    return Date.now() - this.startTime > this.duration;
  }
}

/* ===================================================================
   AUDIO SYSTEM
================================================================== */

class RetroAudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.enabled = true;
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported. Audio disabled.');
      this.enabled = false;
    }
  }

  createBeep(frequency = 440, duration = 0.1, type = 'square') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playShoot() {
    this.createBeep(800, 0.1, 'square');
  }

  playExplosion() {
    this.createBeep(150, 0.3, 'sawtooth');
    setTimeout(() => this.createBeep(100, 0.2, 'sawtooth'), 100);
  }

  playThrust() {
    this.createBeep(60, 0.1, 'sawtooth');
  }

  playUFO() {
    this.createBeep(200, 0.2, 'triangle');
    setTimeout(() => this.createBeep(250, 0.2, 'triangle'), 200);
  }

  playHyperspace() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createBeep(1000 - i * 100, 0.05, 'square');
      }, i * 50);
    }
  }
}

/* ===================================================================
   MAIN GAME ENGINE
================================================================== */

class AsteroidsGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.renderer = null;
    this.audioManager = new RetroAudioManager();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.level = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.highScore = this.loadHighScore();
    
    // Game objects
    this.ship = null;
    this.asteroids = [];
    this.bullets = [];
    this.ufos = [];
    this.explosions = [];
    
    // Input handling
    this.keys = new Set();
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    
    // Timers
    this.lastUFOSpawn = 0;
    this.shipRespawnTime = 0;
    
    // Mobile controls
    this.touchControls = {
      thrust: false,
      rotateLeft: false,
      rotateRight: false,
      fire: false
    };

    this.initialize();
  }

  async initialize() {
    try {
      this.setupCanvas();
      this.setupRenderer();
      this.setupEventListeners();
      this.setupMobileControls();
      this.updateUI();
      this.startGameLoop();

      // Initialize Universal Systems
      if (typeof window.globalAudioManager !== 'undefined') {
        window.globalAudioManager.init();
      }
      if (typeof window.globalTournamentManager !== 'undefined') {
        window.globalTournamentManager.init();
      }
      if (typeof window.globalAchievementSystem !== 'undefined') {
        window.globalAchievementSystem.init();
      }

      // Enhanced audit integration for development
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('🔍 Running ASTEROIDS development audit...');
        window.runAudit = this.runAuditTasks.bind(this);
        setTimeout(() => this.runAuditTasks(), 1000);
      }

      console.log('🚀 ASTEROIDS GG initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ASTEROIDS GG:', error);
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

    // Set canvas size
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
  }

  setupRenderer() {
    this.renderer = new VectorRenderer(this.ctx);
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // UI buttons
    document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
    document.getElementById('resumeButton')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('restartButton')?.addEventListener('click', () => this.restartGame());
    
    // Canvas focus for keyboard input
    this.canvas.addEventListener('click', () => this.canvas.focus());
    
    // Prevent scrolling with arrow keys
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  setupMobileControls() {
    const controls = {
      thrustBtn: () => this.touchControls.thrust = true,
      rotateLeft: () => this.touchControls.rotateLeft = true,
      rotateRight: () => this.touchControls.rotateRight = true,
      fireBtn: () => this.fireBullet(),
      hyperspaceBtn: () => this.hyperspace(),
      pauseBtn: () => this.togglePause()
    };

    Object.entries(controls).forEach(([id, action]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('touchstart', (e) => {
          e.preventDefault();
          action();
        });
        element.addEventListener('touchend', (e) => {
          e.preventDefault();
          if (id === 'thrustBtn') {
            this.touchControls.thrust = false;
          } else if (id === 'rotateLeft') {
            this.touchControls.rotateLeft = false;
          } else if (id === 'rotateRight') {
            this.touchControls.rotateRight = false;
          }
        });
      }
    });
  }

  handleKeyDown(e) {
    this.keys.add(e.code);
    
    // Handle immediate actions
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (this.gameState === 'playing') {
          this.fireBullet();
        } else if (this.gameState === 'paused') {
          this.resumeGame();
        }
        break;
      case 'Enter':
        if (this.gameState === 'menu') {
          this.startGame();
        } else if (this.gameState === 'gameOver') {
          this.restartGame();
        }
        break;
      case 'Escape':
      case 'KeyP':
        if (this.gameState === 'playing' || this.gameState === 'paused') {
          this.togglePause();
        }
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        if (this.gameState === 'playing') {
          this.hyperspace();
        }
        break;
    }
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.level = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.lastUFOSpawn = Date.now();
    
    this.createShip();
    this.spawnAsteroids();
    this.hideAllOverlays();
    this.updateUI();
    
    // Universal Systems Integration
    if (typeof UniversalAudio !== 'undefined') {
      window.globalAudioManager.playGameStart();
    }
    if (typeof Achievements !== 'undefined') {
      window.globalAchievementSystem.updatePlayerProgress('asteroids', this.score, this.level, { game: 'asteroids' });
    }
    
    console.log('🚀 Game started!');
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
      window.globalAudioManager.playGameOver();
    }
    if (typeof Tournament !== 'undefined') {
      window.globalTournamentManager.submitScore('asteroids', this.score, this.level, { level: this.level });
    }
    if (typeof Achievements !== 'undefined') {      window.globalAchievementSystem.updatePlayerProgress('asteroids', this.score, this.level, {
        game: 'asteroids',
        score: this.score,
        level: this.level
      });
    }
    
    // Check for high score
    let newHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      newHighScore = true;
      
      if (typeof Achievements !== 'undefined') {        // High score achievement already tracked in updatePlayerProgress
      }
    }
    
    // Update game over screen
    document.getElementById('finalScore').textContent = this.score.toLocaleString();
    document.getElementById('finalLevel').textContent = this.level;
    document.getElementById('newHighScore').style.display = newHighScore ? 'block' : 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    console.log('💥 Game Over! Final Score:', this.score);
  }

  createShip() {
    this.ship = new Ship(
      GAME_CONFIG.canvas.width / 2,
      GAME_CONFIG.canvas.height / 2
    );
    this.ship.makeInvulnerable();
    this.shipRespawnTime = 0;
  }

  spawnAsteroids() {
    this.asteroids = [];
    const count = GAME_CONFIG.game.baseAsteroidCount + Math.floor((this.level - 1) * 2);
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * GAME_CONFIG.canvas.width;
        y = Math.random() * GAME_CONFIG.canvas.height;
      } while (this.ship && this.ship.distanceTo({position: new Vector2D(x, y)}) < GAME_CONFIG.asteroid.minDistance);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = GAME_CONFIG.asteroid.speeds.large;
      const velocity = Vector2D.fromAngle(angle, speed);
      
      this.asteroids.push(new Asteroid(x, y, 'large', velocity));
    }
  }

  spawnUFO() {
    if (Date.now() - this.lastUFOSpawn < GAME_CONFIG.ufo.spawnInterval) return;
    if (this.ufos.length > 0) return; // Only one UFO at a time
    
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side > 0 ? -50 : GAME_CONFIG.canvas.width + 50;
    const y = Math.random() * GAME_CONFIG.canvas.height;
    
    this.ufos.push(new UFO(x, y));
    this.lastUFOSpawn = Date.now();
    this.audioManager.playUFO();
  }

  fireBullet() {
    if (!this.ship || !this.ship.active) return;
    if (this.bullets.length >= GAME_CONFIG.bullet.maxCount) return;
    
    const bullet = new Bullet(
      this.ship.position.x + Math.cos(this.ship.rotation) * this.ship.radius,
      this.ship.position.y + Math.sin(this.ship.rotation) * this.ship.radius,
      this.ship.rotation
    );
    
    this.bullets.push(bullet);
    this.audioManager.playShoot();
  }

  hyperspace() {
    if (!this.ship || !this.ship.active) return;
    
    const destroyed = this.ship.hyperspace();
    this.audioManager.playHyperspace();
    
    if (destroyed) {
      this.shipDestroyed();
    }
  }

  shipDestroyed() {
    if (this.ship) {
      this.explosions.push(new Explosion(this.ship.position.x, this.ship.position.y, 2));
      this.audioManager.playExplosion();
    }
    
    this.ship = null;
    this.lives--;
    this.shipRespawnTime = Date.now() + GAME_CONFIG.ship.respawnTime;
    
    if (this.lives <= 0) {
      setTimeout(() => this.gameOver(), 2000);
    }
    
    this.updateUI();
  }

  asteroidDestroyed(asteroid) {
    this.score += asteroid.points;
    this.explosions.push(new Explosion(asteroid.position.x, asteroid.position.y, 1));
    this.audioManager.playExplosion();
    
    // Universal Systems Integration
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.playPointScore();
    }
    if (typeof window.globalAchievementSystem !== 'undefined') {
      // Asteroid destruction tracked in game over
    }
    
    // Split asteroid
    const fragments = asteroid.split();
    this.asteroids.push(...fragments);
    
    // Remove original asteroid
    const index = this.asteroids.indexOf(asteroid);
    if (index > -1) {
      this.asteroids.splice(index, 1);
    }
    
    // Check for level completion
    if (this.asteroids.length === 0) {
      this.nextLevel();
    }
    
    this.updateUI();
  }

  nextLevel() {
    this.level++;
    setTimeout(() => {
      this.spawnAsteroids();
      this.clearBullets();
    }, 2000);
  }

  clearGameObjects() {
    this.asteroids = [];
    this.bullets = [];
    this.ufos = [];
    this.explosions = [];
    this.ship = null;
  }

  clearBullets() {
    this.bullets = [];
  }

  processInput() {
    if (!this.ship || !this.ship.active || this.gameState !== 'playing') return;
    
    // Rotation
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.touchControls.rotateLeft) {
      this.ship.rotate(-1);
    } else if (this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.touchControls.rotateRight) {
      this.ship.rotate(1);
    } else {
      this.ship.rotate(0);
    }
    
    // Thrust
    const thrusting = this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.touchControls.thrust;
    this.ship.thrust(thrusting);
    
    if (thrusting && Math.random() < 0.3) {
      this.audioManager.playThrust();
    }
  }

  update(currentTime) {
    if (this.gameState !== 'playing') return;
    
    // Handle first frame
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return;
    }
    
    this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016);
    this.lastFrameTime = currentTime;
    
    this.processInput();
    
    // Update ship
    if (this.ship) {
      this.ship.update(this.deltaTime);
    } else if (this.lives > 0 && Date.now() > this.shipRespawnTime) {
      this.createShip();
    }
    
    // Update asteroids
    this.asteroids.forEach(asteroid => asteroid.update(this.deltaTime));
    
    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.update(this.deltaTime);
      return bullet.active;
    });
    
    // Update UFOs
    this.ufos.forEach(ufo => {
      ufo.update(this.deltaTime, this.ship);
      
      // UFO shooting
      if (this.ship && ufo.canShoot()) {
        const bullet = ufo.shoot(this.ship);
        if (bullet) this.bullets.push(bullet);
      }
    });
    
    // Remove inactive UFOs
    this.ufos = this.ufos.filter(ufo => ufo.active);
    
    // Update explosions
    this.explosions = this.explosions.filter(explosion => !explosion.isFinished());
    
    // Spawn UFO occasionally
    if (Math.random() < 0.0001 * this.level) {
      this.spawnUFO();
    }
    
    this.checkCollisions();
  }

  checkCollisions() {
    if (!this.ship || !this.ship.active || this.ship.invulnerable) return;
    
    // Ship vs Asteroids
    this.asteroids.forEach(asteroid => {
      if (this.ship.collidesWith(asteroid)) {
        this.shipDestroyed();
      }
    });
    
    // Ship vs UFO bullets (UFO bullets are hostile to ship)
    this.bullets.forEach(bullet => {
      // Simple check: if bullet is too close to ship and moving toward it, it's hostile
      if (this.ship.collidesWith(bullet)) {
        const dx = bullet.velocity.x;
        const dy = bullet.velocity.y;
        const shipDx = this.ship.position.x - bullet.position.x;
        const shipDy = this.ship.position.y - bullet.position.y;
        
        // If bullet is moving toward ship, it's likely a UFO bullet
        if (dx * shipDx + dy * shipDy > 0) {
          this.shipDestroyed();
          bullet.active = false;
        }
      }
    });
    
    // Ship vs UFOs
    this.ufos.forEach(ufo => {
      if (this.ship.collidesWith(ufo)) {
        this.shipDestroyed();
      }
    });
    
    // Bullets vs Asteroids
    this.bullets.forEach(bullet => {
      this.asteroids.forEach(asteroid => {
        if (bullet.collidesWith(asteroid)) {
          this.asteroidDestroyed(asteroid);
          bullet.active = false;
        }
      });
    });
    
    // Bullets vs UFOs
    this.bullets.forEach(bullet => {
      this.ufos.forEach(ufo => {
        if (bullet.collidesWith(ufo)) {
          this.score += ufo.points;
          this.explosions.push(new Explosion(ufo.position.x, ufo.position.y, 1.5));
          this.audioManager.playExplosion();
          
          // Universal Systems Integration
          if (typeof window.globalAudioManager !== 'undefined') {
            window.globalAudioManager.playPointScore();
          }
          if (typeof window.globalAchievementSystem !== 'undefined') {
            // UFO destruction tracked in game over
          }
          
          ufo.active = false;
          bullet.active = false;
          this.updateUI();
        }
      });
    });
  }

  render() {
    this.renderer.clear();
    
    // Render explosions (behind everything)
    this.explosions.forEach(explosion => {
      this.renderer.drawExplosion(explosion);
    });
    
    // Render ship
    if (this.ship && this.ship.active) {
      this.renderer.drawShip(this.ship, this.ship.invulnerable);
    }
    
    // Render asteroids
    this.asteroids.forEach(asteroid => {
      this.renderer.drawAsteroid(asteroid);
    });
    
    // Render bullets
    this.bullets.forEach(bullet => {
      this.renderer.drawBullet(bullet);
    });
    
    // Render UFOs
    this.ufos.forEach(ufo => {
      this.renderer.drawUFO(ufo);
    });
  }

  startGameLoop() {
    const gameLoop = (currentTime) => {
      this.update(currentTime);
      this.render();
      requestAnimationFrame(gameLoop);
    };
    
    requestAnimationFrame(gameLoop);
  }

  updateUI() {
    document.getElementById('currentScore').textContent = this.score.toLocaleString();
    document.getElementById('currentLevel').textContent = this.level;
    document.getElementById('highScore').textContent = this.highScore.toLocaleString();
    
    // Update lives display
    const livesContainer = document.getElementById('livesContainer');
    livesContainer.innerHTML = '';
    for (let i = 0; i < this.lives; i++) {
      const lifeIcon = document.createElement('div');
      lifeIcon.className = 'life-icon';
      livesContainer.appendChild(lifeIcon);
    }
  }

  hideAllOverlays() {
    ['startScreen', 'pauseScreen', 'gameOverScreen'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  }

  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('asteroids-gg-highscore') || '0');
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('asteroids-gg-highscore', this.highScore.toString());
    } catch (e) {
      console.warn('Could not save high score to localStorage');
    }
  }

  // Enhanced TDD Audit System
  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    // Performance Tests
    const frameRateOK = this.lastFrameTime === 0 || (performance.now() - this.lastFrameTime) < 20;
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    // Vector Graphics Tests
    const hasVectorRenderer = this.renderer instanceof VectorRenderer;
    results.push({ name: 'Vector Renderer Active', pass: hasVectorRenderer, critical: true });
    
    const hasPhysicsObjects = typeof PhysicsObject !== 'undefined' && typeof Ship !== 'undefined';
    results.push({ name: 'Physics System Active', pass: hasPhysicsObjects, critical: true });
    
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
    
    // Game-Specific Tests
    const hasVectorColors = this.renderer && Object.values(GAME_CONFIG.colors).length > 0;
    results.push({ name: 'Vector Color Palette', pass: hasVectorColors, critical: false });
    
    const hasAudioSystem = this.audioManager instanceof RetroAudioManager;
    results.push({ name: 'Retro Audio System', pass: hasAudioSystem, critical: false });
    
    const hasWraparound = GAME_CONFIG.physics.wraparound === true;
    results.push({ name: 'Screen Wraparound Physics', pass: hasWraparound, critical: false });
    
    // Accessibility Tests
    const hasKeyboardNav = document.querySelector('[tabindex]') || document.querySelector('button');
    results.push({ name: 'Keyboard Navigation', pass: hasKeyboardNav, critical: false });
    
    const hasMobileControls = document.querySelector('.mobile-controls');
    results.push({ name: 'Mobile Touch Controls', pass: !!hasMobileControls, critical: false });
    
    // Log results
    console.log('🔍 ASTEROIDS GG - TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    if (criticalFails.length > 0) {
      console.error('❌ Critical failures:', criticalFails.map(f => f.name));
    }
    
    const passRate = (results.filter(r => r.pass).length / results.length * 100).toFixed(1);
    console.log(`📊 Overall pass rate: ${passRate}%`);
    
    return { allPassed: results.every(r => r.pass), criticalPassed: allCriticalPassed, results };
  }
}

/* ===================================================================
   INITIALIZATION
================================================================== */

// Create stars background
function createStars() {
  const starsContainer = document.querySelector('.stars-bg');
  if (!starsContainer) return;
  
  const starCount = 100;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (2 + Math.random() * 2) + 's';
    starsContainer.appendChild(star);
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  createStars();
  
  // Initialize game
  const game = new AsteroidsGame();
  
  // Make game accessible globally for debugging
  window.asteroidsGame = game;
  
  console.log('🚀 ASTEROIDS GG - Vector Space Combat initialized!');
});
