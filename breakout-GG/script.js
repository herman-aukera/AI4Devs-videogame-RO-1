/* © GG, MIT License */

class BreakoutGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu';

    // Game objects
    this.paddle = {
      x: this.canvas.width / 2 - 50,
      y: this.canvas.height - 30,
      width: 100,
      height: 10,
      speed: 8
    };

    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 8,
      dx: 4,
      dy: -4,
      speed: 4
    };

    this.bricks = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;

    this.keys = {};
    this.lastFrameTime = 0;

    // Initialize shared systems
    this.initializeSharedSystems();

    this.initializeBricks();
    this.setupEventListeners();
    this.setupUI();

    this.gameLoop();
  }

  initializeSharedSystems() {
    // Universal Audio integration
    if (typeof UniversalAudio !== 'undefined') {
      this.audio = UniversalAudio;
      console.log('🔊 Universal Audio System connected');
    }

    // Tournament system integration
    if (typeof UniversalTournament !== 'undefined') {
      this.tournament = UniversalTournament;
      console.log('🏆 Tournament System connected');
    }

    // Achievement system integration
    if (typeof UniversalAchievements !== 'undefined') {
      this.achievements = UniversalAchievements;
      console.log('🏅 Achievement System connected');
    }
  }

  initializeBricks() {
    this.bricks = [];
    const rows = 5;
    const cols = 10;
    const brickWidth = 70;
    const brickHeight = 20;
    const padding = 5;
    const offsetTop = 60;
    const offsetLeft = (this.canvas.width - (cols * (brickWidth + padding) - padding)) / 2;

    const colors = ['#ff0040', '#ff8000', '#ffff00', '#00ff00', '#0080ff'];
    const points = [50, 40, 30, 20, 10];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          color: colors[r],
          points: points[r],
          visible: true
        });
      }
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }

      if (e.code === 'Enter') {
        e.preventDefault();
        this.restart();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch controls
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartX = e.touches[0].clientX;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX;
      this.paddle.x += deltaX * 0.5;
      this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
      touchStartX = touchX;
    });
  }

  setupUI() {
    document.getElementById('playButton').addEventListener('click', () => this.startGame());
    document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
    document.getElementById('restartButton').addEventListener('click', () => this.restart());
  }

  startGame() {
    this.gameState = 'playing';
    this.hideOverlay();
    this.canvas.focus();
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.showOverlay('PAUSA', 'Presiona ESPACIO para continuar');
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.hideOverlay();
    } else if (this.gameState === 'menu') {
      this.startGame();
    }
  }

  restart() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.paddle.x = this.canvas.width / 2 - 50;
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = 4;
    this.ball.dy = -4;
    this.initializeBricks();
    this.updateUI();
    this.startGame();
  }

  update() {
    if (this.gameState !== 'playing') return;

    // Paddle movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.paddle.x += this.paddle.speed;
    }

    // Keep paddle in bounds
    this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));

    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Ball collision with walls
    if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
      this.ball.dx = -this.ball.dx;
      this.playSound('bounce');
    }

    if (this.ball.y - this.ball.radius < 0) {
      this.ball.dy = -this.ball.dy;
      this.playSound('bounce');
    }

    // Ball collision with paddle
    if (this.ball.y + this.ball.radius > this.paddle.y &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width) {

      // Calculate hit position for angle
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
      const angle = (hitPos - 0.5) * Math.PI / 3;

      this.ball.dx = Math.sin(angle) * this.ball.speed;
      this.ball.dy = -Math.cos(angle) * this.ball.speed;
    }

    // Ball collision with bricks
    for (let brick of this.bricks) {
      if (brick.visible && this.ballBrickCollision(this.ball, brick)) {
        brick.visible = false;
        this.ball.dy = -this.ball.dy;
        this.score += brick.points;
        break;
      }
    }

    // Check for ball out of bounds
    if (this.ball.y > this.canvas.height) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }

    // Check for level complete
    if (this.bricks.every(brick => !brick.visible)) {
      this.nextLevel();
    }

    this.updateUI();
  }

  ballBrickCollision(ball, brick) {
    return ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height;
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = 4;
    this.ball.dy = -4;
  }

  playSound(soundType) {
    if (this.audio) {
      this.audio.playSound(soundType);
    }
  }

  trackAchievement(type, value) {
    if (this.achievements) {
      this.achievements.updateProgress({
        [type]: value,
        gamesPlayed: 1
      });
    }
  }

  submitScore(score) {
    if (this.tournament) {
      this.tournament.submitScore('breakout', score);
    }
  }

  nextLevel() {
    this.level++;
    this.playSound('levelup');
    this.trackAchievement('level', this.level);
    this.ball.speed += 0.5;
    this.initializeBricks();
    this.resetBall();
  }

  gameOver() {
    this.gameState = 'gameOver';
    this.playSound('gameover');
    this.submitScore(this.score);
    this.trackAchievement('bestScore', this.score);
    this.showOverlay('GAME OVER', `Puntuación: ${this.score}<br>Presiona ENTER para jugar de nuevo`);
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw paddle
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fill();
    this.ctx.closePath();

    // Draw bricks
    for (let brick of this.bricks) {
      if (brick.visible) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Brick border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    }
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('level').textContent = this.level;
  }

  showOverlay(title, message) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    document.getElementById('gameOverlay').classList.remove('hidden');

    // Show appropriate buttons
    document.getElementById('playButton').classList.toggle('hidden', this.gameState !== 'menu');
    document.getElementById('pauseButton').classList.toggle('hidden', this.gameState !== 'playing');
    document.getElementById('restartButton').classList.toggle('hidden', this.gameState === 'menu');
  }

  hideOverlay() {
    document.getElementById('gameOverlay').classList.add('hidden');
  }

  gameLoop() {
    const currentTime = performance.now();
    this.lastFrameTime = currentTime;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  // TDD Audit System
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new BreakoutGame();

    // Auto-run audit in development
    if (window.location?.hostname === 'localhost') {
      console.log('🔍 Running development audit...');
      window.runAudit = game.runAuditTasks.bind(game);
      setTimeout(() => game.runAuditTasks(), 1000);
    }

    console.log('✅ Breakout game loaded successfully');
  } catch (error) {
    console.error('❌ Error loading Breakout game:', error);
  }
});
