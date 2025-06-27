/* © GG, MIT License */
/* ==============================================
   PONG GG - Professional Retro Paddle Game
   Physics Foundation with TDD Quality Assurance
   ============================================== */

'use strict';

// ===== GAME CONFIGURATION =====
const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#000000'
  },
  paddle: {
    width: 12,
    height: 80,
    speed: 6,
    acceleration: 0.8,
    maxSpeed: 12,
    color: '#00ffff',
    glow: true
  },
  ball: {
    size: 12,
    baseSpeed: 4,
    maxSpeed: 12,
    speedIncrement: 0.3,
    color: '#ffffff',
    trail: true,
    trailLength: 8
  },
  ai: {
    difficulty: 'medium',
    reactionTime: 16,
    predictionDistance: 100,
    errorMargin: 15,
    learningRate: 0.1
  },
  game: {
    winningScore: 11,
    resetDelay: 1500,
    pauseOnFocusLoss: true,
    showFPS: false
  },
  audio: {
    enabled: true,
    volume: 0.3,
    frequencies: {
      paddleHit: 220,
      wallBounce: 440,
      score: 330,
      gameOver: 165
    }
  }
};

// ===== REUSABLE PHYSICS ENGINE =====
class PhysicsEngine {
  static checkAABB(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
  
  static checkCircleRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius);
  }
  
  static reflectVelocity(velocity, normal) {
    const dot = velocity.x * normal.x + velocity.y * normal.y;
    return {
      x: velocity.x - 2 * dot * normal.x,
      y: velocity.y - 2 * dot * normal.y
    };
  }
  
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  static distance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  static normalize(vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }
}

// ===== AUDIO SYSTEM =====
class PongAudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = GAME_CONFIG.audio.enabled;
    this.volume = GAME_CONFIG.audio.volume;
    this.initializeAudio();
  }
  
  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume context on user interaction if needed
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          this.audioContext.resume();
        }, { once: true });
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }
  
  createTone(frequency, duration = 0.1, type = 'square') {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
  
  playPaddleHit(intensity = 1) {
    const freq = GAME_CONFIG.audio.frequencies.paddleHit * (0.8 + intensity * 0.4);
    this.createTone(freq, 0.08, 'square');
  }
  
  playWallBounce() {
    this.createTone(GAME_CONFIG.audio.frequencies.wallBounce, 0.06, 'sine');
  }
  
  playScore() {
    this.createTone(GAME_CONFIG.audio.frequencies.score, 0.2, 'triangle');
  }
  
  playGameOver() {
    this.createTone(GAME_CONFIG.audio.frequencies.gameOver, 0.5, 'sawtooth');
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  setVolume(volume) {
    this.volume = PhysicsEngine.clamp(volume, 0, 1);
  }
}

// ===== BALL ENTITY =====
class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.ball.size / 2;
    this.velocity = { x: 0, y: 0 };
    this.speed = GAME_CONFIG.ball.baseSpeed;
    this.trail = [];
    this.lastHitPaddle = null;
    
    this.reset();
  }
  
  reset() {
    this.x = GAME_CONFIG.canvas.width / 2;
    this.y = GAME_CONFIG.canvas.height / 2;
    this.speed = GAME_CONFIG.ball.baseSpeed;
    this.trail = [];
    
    // Random serve direction
    const angle = (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 6 + Math.random() * Math.PI / 3);
    this.velocity = {
      x: Math.cos(angle) * this.speed,
      y: Math.sin(angle) * this.speed
    };
  }
  
  update(deltaTime) {
    // Store previous position for trail
    if (GAME_CONFIG.ball.trail) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > GAME_CONFIG.ball.trailLength) {
        this.trail.shift();
      }
    }
    
    // Update position
    this.x += this.velocity.x * deltaTime * 60;
    this.y += this.velocity.y * deltaTime * 60;
    
    // Wall collision (top/bottom)
    if (this.y - this.radius <= 0 || this.y + this.radius >= GAME_CONFIG.canvas.height) {
      this.velocity.y = -this.velocity.y;
      this.y = PhysicsEngine.clamp(
        this.y, 
        this.radius, 
        GAME_CONFIG.canvas.height - this.radius
      );
      return 'wall';
    }
    
    return null;
  }
  
  hitPaddle(paddle, side) {
    // Calculate hit position relative to paddle center (-1 to 1)
    const relativeHitY = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    const bounceAngle = relativeHitY * Math.PI / 3; // Max 60 degrees
    
    // Increase speed slightly
    this.speed = Math.min(this.speed + GAME_CONFIG.ball.speedIncrement, GAME_CONFIG.ball.maxSpeed);
    
    // Calculate new velocity
    const direction = side === 'left' ? 1 : -1;
    this.velocity = {
      x: Math.cos(bounceAngle) * this.speed * direction,
      y: Math.sin(bounceAngle) * this.speed
    };
    
    // Ensure minimum horizontal speed
    const minHorizontalSpeed = this.speed * 0.5;
    if (Math.abs(this.velocity.x) < minHorizontalSpeed) {
      this.velocity.x = minHorizontalSpeed * direction;
    }
    
    // Position ball outside paddle
    if (side === 'left') {
      this.x = paddle.x + paddle.width + this.radius + 1;
    } else {
      this.x = paddle.x - this.radius - 1;
    }
    
    this.lastHitPaddle = side;
    return Math.abs(relativeHitY); // Return hit intensity for audio
  }
  
  isOffScreen() {
    return this.x + this.radius < 0 || this.x - this.radius > GAME_CONFIG.canvas.width;
  }
  
  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}

// ===== PADDLE ENTITY =====
class Paddle {
  constructor(x, side) {
    this.x = x;
    this.y = GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2;
    this.width = GAME_CONFIG.paddle.width;
    this.height = GAME_CONFIG.paddle.height;
    this.velocity = 0;
    this.targetY = this.y;
    this.side = side;
    this.isPlayer = side === 'left';
  }
  
  update(deltaTime, input = null) {
    if (this.isPlayer && input) {
      this.handlePlayerInput(input, deltaTime);
    }
    
    // Apply velocity with acceleration
    const acceleration = GAME_CONFIG.paddle.acceleration;
    const targetVelocity = (this.targetY - this.y) * acceleration;
    this.velocity = PhysicsEngine.clamp(targetVelocity, -GAME_CONFIG.paddle.maxSpeed, GAME_CONFIG.paddle.maxSpeed);
    
    // Update position
    this.y += this.velocity * deltaTime * 60;
    
    // Keep paddle within bounds
    this.y = PhysicsEngine.clamp(this.y, 0, GAME_CONFIG.canvas.height - this.height);
    this.targetY = PhysicsEngine.clamp(this.targetY, 0, GAME_CONFIG.canvas.height - this.height);
  }
  
  handlePlayerInput(input, deltaTime) {
    const speed = GAME_CONFIG.paddle.speed;
    
    if (input.mouse.active) {
      this.targetY = input.mouse.y - this.height / 2;
    } else {
      if (input.keys.up) {
        this.targetY -= speed * deltaTime * 60;
      }
      if (input.keys.down) {
        this.targetY += speed * deltaTime * 60;
      }
    }
  }
  
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  getCenterY() {
    return this.y + this.height / 2;
  }
}

// ===== AI CONTROLLER =====
class PongAI {
  constructor(paddle) {
    this.paddle = paddle;
    this.difficulty = GAME_CONFIG.ai.difficulty;
    this.reactionTime = GAME_CONFIG.ai.reactionTime;
    this.predictionDistance = GAME_CONFIG.ai.predictionDistance;
    this.errorMargin = GAME_CONFIG.ai.errorMargin;
    this.learningRate = GAME_CONFIG.ai.learningRate;
    
    this.lastBallY = 0;
    this.predictedY = 0;
    this.reactionDelay = 0;
    this.playerPatterns = [];
    
    this.setDifficulty(this.difficulty);
  }
  
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    
    const settings = {
      easy: { reactionTime: 32, errorMargin: 30, predictionDistance: 50 },
      medium: { reactionTime: 16, errorMargin: 15, predictionDistance: 100 },
      hard: { reactionTime: 8, errorMargin: 8, predictionDistance: 150 },
      expert: { reactionTime: 4, errorMargin: 4, predictionDistance: 200 }
    };
    
    const config = settings[difficulty] || settings.medium;
    this.reactionTime = config.reactionTime;
    this.errorMargin = config.errorMargin;
    this.predictionDistance = config.predictionDistance;
  }
  
  update(ball, deltaTime) {
    this.reactionDelay -= deltaTime * 1000;
    
    if (this.reactionDelay <= 0) {
      this.calculatePrediction(ball);
      this.reactionDelay = this.reactionTime;
    }
    
    // Add some error to make AI more human-like
    const error = (Math.random() - 0.5) * this.errorMargin;
    const targetY = this.predictedY + error - this.paddle.height / 2;
    
    this.paddle.targetY = targetY;
  }
  
  calculatePrediction(ball) {
    // Only react when ball is moving towards AI paddle
    if (ball.velocity.x <= 0) {
      this.predictedY = ball.y;
      return;
    }
    
    // Calculate where ball will be when it reaches paddle
    const timeToReach = (this.paddle.x - ball.x) / ball.velocity.x;
    let predictedBallY = ball.y + ball.velocity.y * timeToReach;
    
    // Account for wall bounces
    const wallBounces = Math.floor(Math.abs(predictedBallY) / GAME_CONFIG.canvas.height);
    if (wallBounces > 0) {
      predictedBallY = predictedBallY % GAME_CONFIG.canvas.height;
      if (wallBounces % 2 === 1) {
        predictedBallY = GAME_CONFIG.canvas.height - predictedBallY;
      }
    }
    
    this.predictedY = Math.abs(predictedBallY);
  }
  
  learnFromPlayer(playerPaddle) {
    // Simple pattern recognition (for future enhancements)
    this.playerPatterns.push({
      paddleY: playerPaddle.y,
      velocity: playerPaddle.velocity,
      timestamp: Date.now()
    });
    
    // Keep only recent patterns
    const cutoff = Date.now() - 5000; // 5 seconds
    this.playerPatterns = this.playerPatterns.filter(p => p.timestamp > cutoff);
  }
}

// ===== INPUT MANAGER =====
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {
      up: false,
      down: false,
      space: false,
      enter: false,
      escape: false,
      r: false
    };
    this.mouse = {
      x: 0,
      y: 0,
      active: false,
      lastMoveTime: 0
    };
    this.touch = {
      active: false,
      startY: 0,
      currentY: 0
    };
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseenter', () => { this.mouse.active = true; });
    this.canvas.addEventListener('mouseleave', () => { this.mouse.active = false; });
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    
    // Focus events
    window.addEventListener('blur', () => this.handleFocusLoss());
    window.addEventListener('focus', () => this.handleFocusGain());
  }
  
  handleKeyDown(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = true;
        this.mouse.active = false;
        e.preventDefault();
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = true;
        this.mouse.active = false;
        e.preventDefault();
        break;
      case 'Space':
        this.keys.space = true;
        e.preventDefault();
        break;
      case 'Enter':
        this.keys.enter = true;
        e.preventDefault();
        break;
      case 'Escape':
        this.keys.escape = true;
        e.preventDefault();
        break;
      case 'KeyR':
        this.keys.r = true;
        e.preventDefault();
        break;
      case 'KeyM':
        this.keys.m = true;
        e.preventDefault();
        break;
    }
  }
  
  handleKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = false;
        break;
      case 'Space':
        this.keys.space = false;
        break;
      case 'Enter':
        this.keys.enter = false;
        break;
      case 'Escape':
        this.keys.escape = false;
        break;
      case 'KeyR':
        this.keys.r = false;
        break;
      case 'KeyM':
        this.keys.m = false;
        break;
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleY = this.canvas.height / rect.height;
    
    this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    this.mouse.y = (e.clientY - rect.top) * scaleY;
    this.mouse.active = true;
    this.mouse.lastMoveTime = Date.now();
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    
    this.touch.active = true;
    this.touch.startY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.touch.currentY = this.touch.startY;
    
    // Convert touch to mouse for paddle control
    this.mouse.y = this.touch.currentY;
    this.mouse.active = true;
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    if (!this.touch.active) return;
    
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    
    this.touch.currentY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.mouse.y = this.touch.currentY;
  }
  
  handleTouchEnd(e) {
    e.preventDefault();
    this.touch.active = false;
    
    // Keep mouse active briefly for smooth transition
    setTimeout(() => {
      if (!this.touch.active) {
        this.mouse.active = false;
      }
    }, 100);
  }
  
  handleFocusLoss() {
    // Clear all inputs when window loses focus
    this.keys = { up: false, down: false, space: false, enter: false, escape: false, r: false, m: false };
    this.mouse.active = false;
    this.touch.active = false;
  }
  
  handleFocusGain() {
    // Resume input tracking
  }
  
  // Check if mouse hasn't moved recently (auto-switch to keyboard)
  updateMouseActivity() {
    if (this.mouse.active && Date.now() - this.mouse.lastMoveTime > 1000) {
      this.mouse.active = false;
    }
  }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTime = 0;
    this.fps = 60;
    this.fpsHistory = [];
    this.enabled = GAME_CONFIG.game.showFPS;
  }
  
  update() {
    const now = performance.now();
    this.frameTime = now - this.lastTime;
    this.lastTime = now;
    
    this.frameCount++;
    
    // Calculate FPS every 30 frames
    if (this.frameCount % 30 === 0) {
      this.fps = Math.round(1000 / this.frameTime);
      this.fpsHistory.push(this.fps);
      
      // Keep only recent history
      if (this.fpsHistory.length > 100) {
        this.fpsHistory.shift();
      }
    }
    
    this.updateDisplay();
  }
  
  updateDisplay() {
    if (!this.enabled) return;
    
    const fpsElement = document.getElementById('fpsCounter');
    const frameTimeElement = document.getElementById('frameTime');
    
    if (fpsElement) {
      fpsElement.textContent = this.fps;
    }
    
    if (frameTimeElement) {
      frameTimeElement.textContent = `${this.frameTime.toFixed(2)}ms`;
    }
  }
  
  getAverageFrameRate() {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }
  
  isPerformanceGood() {
    return this.getAverageFrameRate() >= 50;
  }
  
  enable() {
    this.enabled = true;
    const perfInfo = document.getElementById('performanceInfo');
    if (perfInfo) perfInfo.style.display = 'block';
  }
  
  disable() {
    this.enabled = false;
    const perfInfo = document.getElementById('performanceInfo');
    if (perfInfo) perfInfo.style.display = 'none';
  }
}

// ===== MAIN GAME ENGINE =====
class PongGameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = 'menu';
    this.lastFrameTime = 0;
    this.animationFrame = null;
    
    // Game entities
    this.ball = null;
    this.playerPaddle = null;
    this.aiPaddle = null;
    this.ai = null;
    
    // Game systems
    this.input = null;
    this.audio = null;
    this.performance = null;
    
    // Game state
    this.score = { player: 0, cpu: 0 };
    this.gameSettings = {
      difficulty: 'medium',
      sound: true,
      speed: 'normal'
    };
    
    // Initialize game
    this.initialize();
  }
  
  async initialize() {
    try {
      this.setupCanvas();
      this.setupSystems();
      this.setupEventListeners();
      this.loadSettings();
      this.updateUI();
      
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
      
      // Ensure menu screen is visible on startup
      this.showScreen('menuScreen');
      
      // Start render loop
      this.gameLoop(0);
      
      // Run development audit
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔍 Running development audit...');
        window.runAudit = this.runAuditTasks.bind(this);
        setTimeout(() => this.runAuditTasks(), 1000);
      }
      
      console.log('✅ Pong GG initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Pong GG:', error);
      this.handleInitializationError(error);
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
    
    // Setup pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }
  
  setupSystems() {
    this.input = new InputManager(this.canvas);
    this.audio = new PongAudioManager();
    this.performance = new PerformanceMonitor();
    
    // Create game entities
    this.ball = new Ball(GAME_CONFIG.canvas.width / 2, GAME_CONFIG.canvas.height / 2);
    this.playerPaddle = new Paddle(30, 'left');
    this.aiPaddle = new Paddle(GAME_CONFIG.canvas.width - 30 - GAME_CONFIG.paddle.width, 'right');
    this.ai = new PongAI(this.aiPaddle);
  }
  
  setupEventListeners() {
    // UI button events
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        console.log('Play button clicked!');
        this.startGame();
      });
    } else {
      console.error('Play button not found!');
    }
    
    document.getElementById('optionsBtn')?.addEventListener('click', () => this.showOptions());
    document.getElementById('backBtn')?.addEventListener('click', () => this.showMenu());
    document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('menuBtn')?.addEventListener('click', () => this.returnToMenu());
    document.getElementById('playAgainBtn')?.addEventListener('click', () => this.startGame());
    document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.returnToMenu());
    
    // Settings events
    document.getElementById('difficultySelect')?.addEventListener('change', (e) => {
      this.gameSettings.difficulty = e.target.value;
      this.ai.setDifficulty(e.target.value);
      this.saveSettings();
    });
    
    document.getElementById('soundToggle')?.addEventListener('change', (e) => {
      this.gameSettings.sound = e.target.checked;
      this.audio.setEnabled(e.target.checked);
      this.saveSettings();
    });
    
    document.getElementById('speedSelect')?.addEventListener('change', (e) => {
      this.gameSettings.speed = e.target.value;
      this.applySpeedSetting();
      this.saveSettings();
    });
    
    // Canvas focus for keyboard input
    this.canvas.addEventListener('click', () => this.canvas.focus());
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('pongGG_settings');
      if (saved) {
        this.gameSettings = { ...this.gameSettings, ...JSON.parse(saved) };
      }
      
      // Apply loaded settings
      this.ai.setDifficulty(this.gameSettings.difficulty);
      this.audio.setEnabled(this.gameSettings.sound);
      this.applySpeedSetting();
      
      // Update UI elements
      document.getElementById('difficultySelect').value = this.gameSettings.difficulty;
      document.getElementById('soundToggle').checked = this.gameSettings.sound;
      document.getElementById('speedSelect').value = this.gameSettings.speed;
      
      // Load high score
      const highScore = localStorage.getItem('pongGG_highScore');
      if (highScore) {
        document.getElementById('highScore').textContent = highScore;
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }
  
  saveSettings() {
    try {
      localStorage.setItem('pongGG_settings', JSON.stringify(this.gameSettings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }
  
  applySpeedSetting() {
    const speedMultipliers = { slow: 0.8, normal: 1.0, fast: 1.2 };
    const multiplier = speedMultipliers[this.gameSettings.speed] || 1.0;
    
    GAME_CONFIG.ball.baseSpeed = 4 * multiplier;
    GAME_CONFIG.paddle.speed = 6 * multiplier;
    
    if (this.ball) {
      this.ball.speed = GAME_CONFIG.ball.baseSpeed;
    }
  }
  
  gameLoop(timestamp) {
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    
    this.update(deltaTime);
    this.render();
    this.performance.update();
    
    this.animationFrame = requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  update(deltaTime) {
    // Handle input for state transitions
    this.handleGlobalInput();
    
    // Update mouse activity
    this.input.updateMouseActivity();
    
    // Update based on game state
    switch (this.gameState) {
      case 'playing':
        this.updateGameplay(deltaTime);
        break;
      case 'serving':
        this.updateServing(deltaTime);
        break;
    }
  }
  
  handleGlobalInput() {
    // Start game with Enter when in menu
    if (this.input.keys.enter) {
      if (this.gameState === 'menu') {
        this.startGame();
      } else if (this.gameState === 'gameOver') {
        this.startGame();
      }
      this.input.keys.enter = false;
    }
    
    // Pause/resume with space or escape
    if (this.input.keys.space || this.input.keys.escape) {
      if (this.gameState === 'playing') {
        this.pauseGame();
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      }
      
      // Reset key state to prevent multiple triggers
      this.input.keys.space = false;
      this.input.keys.escape = false;
    }
    
    // Restart with R key
    if (this.input.keys.r) {
      if (this.gameState === 'playing' || this.gameState === 'paused') {
        this.startGame();
      }
      this.input.keys.r = false;
    }
  }
  
  updateGameplay(deltaTime) {
    // Update paddles
    this.playerPaddle.update(deltaTime, this.input);
    this.aiPaddle.update(deltaTime);
    
    // Update AI
    this.ai.update(this.ball, deltaTime);
    this.ai.learnFromPlayer(this.playerPaddle);
    
    // Update ball
    const collision = this.ball.update(deltaTime);
    
    if (collision === 'wall') {
      this.audio.playWallBounce();
    }
    
    // Check paddle collisions
    this.checkPaddleCollisions();
    
    // Check scoring
    this.checkScoring();
  }
  
  updateServing(deltaTime) {
    // Auto-serve after delay
    if (this.serveTimer) {
      this.serveTimer -= deltaTime;
      if (this.serveTimer <= 0) {
        this.gameState = 'playing';
        this.serveTimer = null;
      }
    }
  }
  
  checkPaddleCollisions() {
    // Player paddle collision
    if (this.ball.velocity.x < 0 && PhysicsEngine.checkCircleRect(this.ball, this.playerPaddle.getBounds())) {
      const intensity = this.ball.hitPaddle(this.playerPaddle, 'left');
      this.audio.playPaddleHit(intensity);
    }
    
    // AI paddle collision
    if (this.ball.velocity.x > 0 && PhysicsEngine.checkCircleRect(this.ball, this.aiPaddle.getBounds())) {
      const intensity = this.ball.hitPaddle(this.aiPaddle, 'right');
      this.audio.playPaddleHit(intensity);
    }
  }
  
  checkScoring() {
    if (this.ball.isOffScreen()) {
      if (this.ball.x < 0) {
        // CPU scores
        this.score.cpu++;
        this.announceScore('CPU scored!');
      } else {
        // Player scores
        this.score.player++;
        this.announceScore('Player scored!');
      }
      
      // Sound effects for scoring
      this.audio.playScore();
      if (typeof window.globalAudioManager !== 'undefined') {
        window.globalAudioManager.playPointScore();
      }
      
      this.updateScoreDisplay();
      
      // Check for game over
      if (this.score.player >= GAME_CONFIG.game.winningScore || this.score.cpu >= GAME_CONFIG.game.winningScore) {
        this.endGame();
      } else {
        this.serveNewBall();
      }
    }
  }
  
  serveNewBall() {
    this.ball.reset();
    this.gameState = 'serving';
    this.serveTimer = 1.0; // 1 second delay
  }
  
  endGame() {
    this.gameState = 'gameOver';
    this.audio.playGameOver();
    
    const playerWon = this.score.player >= GAME_CONFIG.game.winningScore;
    const winnerText = playerWon ? '¡Ganaste!' : 'CPU Ganó';
    const finalScore = `${this.score.player}-${this.score.cpu}`;
    
    document.getElementById('winnerText').textContent = winnerText;
    document.getElementById('finalScoreValue').textContent = finalScore;
    
    // Universal Systems Integration - Game Over
    const gameScore = this.score.player * 100; // Convert to meaningful score
    
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.playGameOver();
    }
    
    if (typeof window.globalTournamentManager !== 'undefined') {
      window.globalTournamentManager.submitScore('pong', gameScore, 1, { 
        playerScore: this.score.player,
        cpuScore: this.score.cpu,
        won: playerWon
      });
    }
    
    if (typeof window.globalAchievementSystem !== 'undefined') {
      window.globalAchievementSystem.updatePlayerProgress('pong', gameScore, 1, {
        playerScore: this.score.player,
        cpuScore: this.score.cpu,
        won: playerWon
      });
    }
    
    // Save high score (sum of both scores)
    const totalScore = this.score.player + this.score.cpu;
    const currentHigh = parseInt(localStorage.getItem('pongGG_highScore') || '0');
    if (totalScore > currentHigh) {
      localStorage.setItem('pongGG_highScore', totalScore.toString());
      document.getElementById('highScore').textContent = totalScore;
    }
    
    this.showScreen('gameOverScreen');
    this.announceScore(`Game Over! ${winnerText} Final score: ${finalScore}`);
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    this.ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
    
    // Render game elements
    this.renderCourt();
    this.renderPaddles();
    this.renderBall();
    
    // Render game state specific elements
    if (this.gameState === 'serving') {
      this.renderServingIndicator();
    }
  }
  
  renderCourt() {
    this.ctx.strokeStyle = GAME_CONFIG.court?.lineColor || '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    // Center line
    this.ctx.beginPath();
    this.ctx.moveTo(GAME_CONFIG.canvas.width / 2, 0);
    this.ctx.lineTo(GAME_CONFIG.canvas.width / 2, GAME_CONFIG.canvas.height);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }
  
  renderPaddles() {
    this.ctx.fillStyle = GAME_CONFIG.paddle.color;
    
    // Add glow effect
    if (GAME_CONFIG.paddle.glow) {
      this.ctx.shadowColor = GAME_CONFIG.paddle.color;
      this.ctx.shadowBlur = 10;
    }
    
    // Player paddle
    this.ctx.fillRect(
      this.playerPaddle.x,
      this.playerPaddle.y,
      this.playerPaddle.width,
      this.playerPaddle.height
    );
    
    // AI paddle
    this.ctx.fillRect(
      this.aiPaddle.x,
      this.aiPaddle.y,
      this.aiPaddle.width,
      this.aiPaddle.height
    );
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }
  
  renderBall() {
    // Render trail
    if (GAME_CONFIG.ball.trail && this.ball.trail.length > 0) {
      this.ctx.strokeStyle = GAME_CONFIG.ball.color;
      this.ctx.lineWidth = 2;
      
      for (let i = 0; i < this.ball.trail.length - 1; i++) {
        const alpha = (i + 1) / this.ball.trail.length * 0.5;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.trail[i].x, this.ball.trail[i].y);
        this.ctx.lineTo(this.ball.trail[i + 1].x, this.ball.trail[i + 1].y);
        this.ctx.stroke();
      }
      
      this.ctx.globalAlpha = 1;
    }
    
    // Render ball
    this.ctx.fillStyle = GAME_CONFIG.ball.color;
    this.ctx.shadowColor = GAME_CONFIG.ball.color;
    this.ctx.shadowBlur = 8;
    
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }
  
  renderServingIndicator() {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Get Ready...',
      GAME_CONFIG.canvas.width / 2,
      GAME_CONFIG.canvas.height / 2 + 60
    );
  }
  
  // ===== GAME STATE MANAGEMENT =====
  
  startGame() {
    console.log('Starting game...');
    this.score = { player: 0, cpu: 0 };
    this.updateScoreDisplay();
    this.ball.reset();
    this.gameState = 'serving';
    this.serveTimer = 1.0;
    this.showScreen('gameHUD');
    this.announceScore('Game started!');
    
    // Universal Systems Integration - Game Start
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.playGameStart();
    }
    
    console.log('Game state:', this.gameState);
  }
  
  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.showScreen('pauseScreen');
      this.announceScore('Game paused');
    }
  }
  
  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.showScreen('gameHUD');
      this.announceScore('Game resumed');
    }
  }
  
  togglePause() {
    if (this.gameState === 'playing') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }
  
  returnToMenu() {
    this.gameState = 'menu';
    this.showScreen('menuScreen');
    this.announceScore('Returned to main menu');
  }
  
  showMenu() {
    this.showScreen('menuScreen');
  }
  
  showOptions() {
    this.showScreen('optionsScreen');
  }
  
  // ===== UI MANAGEMENT =====
  
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }
  }
  
  updateUI() {
    this.updateScoreDisplay();
  }
  
  updateScoreDisplay() {
    document.getElementById('playerScore').textContent = this.score.player;
    document.getElementById('cpuScore').textContent = this.score.cpu;
  }
  
  announceScore(message) {
    const announcer = document.getElementById('gameAnnouncements');
    if (announcer) {
      announcer.textContent = message;
    }
  }
  
  handleInitializationError(error) {
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px; color: #ff0000;">
        <h1>Error Loading Pong GG</h1>
        <p>Sorry, there was a problem initializing the game:</p>
        <p><code>${error.message}</code></p>
        <p>Please refresh the page or check your browser compatibility.</p>
      </div>
    `;
  }
  
  // ===== TDD AUDIT SYSTEM =====
  
  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver', 'serving'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    const hasPhysicsEngine = typeof PhysicsEngine !== 'undefined';
    results.push({ name: 'Physics Engine Available', pass: hasPhysicsEngine, critical: true });
    
    const hasAudioSystem = this.audio instanceof PongAudioManager;
    results.push({ name: 'Audio System Initialized', pass: hasAudioSystem, critical: true });
    
    // Performance Tests
    const frameRateOK = this.performance.isPerformanceGood();
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    const memoryOK = performance.memory ? performance.memory.usedJSHeapSize < 50000000 : true;
    results.push({ name: 'Memory Usage OK', pass: memoryOK, critical: true });
    
    // UI/UX Tests
    const backLink = document.querySelector('a[href*="index.html"]');
    const hasInicioText = backLink && backLink.textContent.includes('INICIO');
    results.push({ name: 'Navigation "INICIO"', pass: hasInicioText, critical: false });
    
    const htmlLang = document.documentElement.lang;
    const isSpanish = htmlLang === 'es' && document.body.textContent.includes('JUGAR');
    results.push({ name: 'Spanish Language Support', pass: isSpanish, critical: false });
    
    const hasInstructions = document.querySelector('details') && 
      document.body.textContent.includes('¿Cómo jugar?');
    results.push({ name: 'Instructions Section', pass: hasInstructions, critical: false });
    
    // Technical Tests
    const canvas = document.querySelector('canvas');
    const isResponsive = canvas && getComputedStyle(canvas).maxWidth === '100%';
    results.push({ name: 'Responsive Canvas', pass: isResponsive, critical: true });
    
    const hasPixelPerfect = this.ctx && !this.ctx.imageSmoothingEnabled;
    results.push({ name: 'Pixel Perfect Rendering', pass: hasPixelPerfect, critical: false });
    
    // Accessibility Tests
    const hasKeyboardNav = document.querySelector('[tabindex]') || document.querySelector('button');
    results.push({ name: 'Keyboard Navigation', pass: hasKeyboardNav, critical: false });
    
    const hasAriaLabels = document.querySelector('[aria-label]') !== null;
    results.push({ name: 'ARIA Labels Present', pass: hasAriaLabels, critical: false });
    
    const hasScreenReader = document.getElementById('gameAnnouncements') !== null;
    results.push({ name: 'Screen Reader Support', pass: hasScreenReader, critical: false });
    
    // Game Logic Tests
    const ballExists = this.ball instanceof Ball;
    results.push({ name: 'Ball Entity Initialized', pass: ballExists, critical: true });
    
    const paddlesExist = this.playerPaddle instanceof Paddle && this.aiPaddle instanceof Paddle;
    results.push({ name: 'Paddle Entities Initialized', pass: paddlesExist, critical: true });
    
    const aiExists = this.ai instanceof PongAI;
    results.push({ name: 'AI Controller Initialized', pass: aiExists, critical: true });
    
    const inputWorks = this.input instanceof InputManager;
    results.push({ name: 'Input Manager Working', pass: inputWorks, critical: true });
    
    // Storage Tests
    const localStorageWorks = (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })();
    results.push({ name: 'Local Storage Available', pass: localStorageWorks, critical: false });
    
    // Log results
    console.log('🔍 Pong GG TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    const allPassed = results.every(r => r.pass);
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    console.log(`📊 Overall: ${results.filter(r => r.pass).length}/${results.length} tests passed`);
    
    if (criticalFails.length > 0) {
      console.error('❌ Critical failures:', criticalFails.map(f => f.name));
    }
    
    const nonCriticalFails = results.filter(r => !r.pass && !r.critical);
    if (nonCriticalFails.length > 0) {
      console.warn('⚠️ Non-critical issues:', nonCriticalFails.map(f => f.name));
    }
    
    return { 
      allPassed, 
      criticalPassed: allCriticalPassed, 
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.pass).length,
        critical: criticalFails.length,
        warnings: nonCriticalFails.length
      }
    };
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  window.pongGame = new PongGameEngine();
  
  // Development helpers
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.togglePerformance = () => {
      if (window.pongGame.performance.enabled) {
        window.pongGame.performance.disable();
      } else {
        window.pongGame.performance.enable();
      }
    };
    
    console.log('🎮 Pong GG - Development mode active');
    console.log('📊 Type "window.runAudit()" to run quality audit');
    console.log('⚡ Type "window.togglePerformance()" to toggle performance monitor');
  }
});

// Export classes for potential reuse
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PhysicsEngine,
    PongAudioManager,
    Ball,
    Paddle,
    PongAI,
    InputManager,
    PerformanceMonitor,
    PongGameEngine
  };
}
