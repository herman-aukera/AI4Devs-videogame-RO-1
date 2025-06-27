/**
 * Fruit Catcher - Retro Arcade Game
 * Copyright (c) 2025 GG
 * Licensed under the MIT License
 *
 * ==========================================================================
 * FRUIT CATCHER - RETRO ARCADE GAME
 * Archivo: script.js
 * Descripción: Lógica completa del juego Fruit Catcher
 * Arquitectura: ES6+ con clases modulares y sistemas componentizados
 * ==========================================================================
 */

'use strict';

// Configuración global del juego
const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  player: {
    width: 80,
    height: 20,
    speed: 350, // píxeles por segundo
    color: '#00ff88',
  },
  fruit: {
    width: 30,
    height: 30,
    minSpeed: 100,
    maxSpeed: 300,
    spawnRate: 1.5, // segundos entre spawns
    colors: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#ff9f43'],
  },
  physics: {
    gravity: 200, // píxeles por segundo²
  },
  scoring: {
    pointsPerFruit: 10,
    levelUpScore: 100,
    speedIncrease: 1.1,
  },
  effects: {
    particleCount: 15,
    shakeIntensity: 5,
    shakeDuration: 300,
  },
};

/**
 * Clase principal del juego - Maneja el loop principal y coordinación
 */
class FruitCatcherGame {
  constructor(canvasId) {
    // Inicialización del canvas y contexto
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Estados del juego
    this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
    this.score = 0;
    this.level = 1;
    this.lives = 3; // Sistema de vidas
    this.missedFruits = 0;
    this.highScore = this.loadHighScore();

    // Sistemas del juego
    this.player = new Player(
      GAME_CONFIG.canvas.width / 2 - GAME_CONFIG.player.width / 2,
      GAME_CONFIG.canvas.height - GAME_CONFIG.player.height - 20
    );
    this.fruits = [];
    this.particles = [];
    this.inputHandler = new InputHandler();
    this.audioManager = new AudioManager();
    this.effectsManager = new EffectsManager();

    // Timing y spawning
    this.lastTime = 0;
    this.fruitSpawnTimer = 0;
    this.gameSpeed = 1;

    // Referencias a elementos DOM
    this.initializeElements();
    this.bindEventListeners();

    // Configurar canvas para responsividad
    this.setupCanvas();

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

    console.log('🍎 Fruit Catcher inicializado correctamente');
  }

  /**
   * Inicializa las referencias a elementos DOM
   */
  initializeElements() {
    this.elements = {
      currentScore: document.getElementById('current-score'),
      highScore: document.getElementById('high-score'),
      currentLevel: document.getElementById('current-level'),
      currentLives: document.getElementById('current-lives'),
      playPauseBtn: document.getElementById('playPauseBtn'),
      restartBtn: document.getElementById('restartBtn'),
      gameOverModal: document.getElementById('gameOverModal'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      finalScore: document.getElementById('finalScore'),
      modalHighScore: document.getElementById('modalHighScore'),
      finalLevel: document.getElementById('finalLevel'),
      playAgainBtn: document.getElementById('playAgainBtn'),
      shareScoreBtn: document.getElementById('shareScoreBtn'),
      touchLeft: document.getElementById('touchLeft'),
      touchRight: document.getElementById('touchRight'),
    };

    // Actualizar elementos iniciales
    this.updateUI();
  }

  /**
   * Configura el canvas para dispositivos de alta densidad
   */
  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Configurar tamaño del canvas
    this.canvas.width = GAME_CONFIG.canvas.width * dpr;
    this.canvas.height = GAME_CONFIG.canvas.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    // Escalar el contexto
    this.ctx.scale(dpr, dpr);

    // Configuraciones de renderizado
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  /**
   * Vincula todos los event listeners del juego
   */
  bindEventListeners() {
    // Controles del juego
    this.elements.playPauseBtn.addEventListener('click', () =>
      this.togglePlayPause()
    );
    this.elements.restartBtn.addEventListener('click', () =>
      this.restartGame()
    );
    this.elements.playAgainBtn.addEventListener('click', () =>
      this.restartGame()
    );
    this.elements.shareScoreBtn.addEventListener('click', () =>
      this.shareScore()
    );

    // Controles táctiles
    this.elements.touchLeft.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.inputHandler.setKey('ArrowLeft', true);
    });
    this.elements.touchLeft.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.inputHandler.setKey('ArrowLeft', false);
    });

    this.elements.touchRight.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.inputHandler.setKey('ArrowRight', true);
    });
    this.elements.touchRight.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.inputHandler.setKey('ArrowRight', false);
    });

    // Prevenir scroll en controles táctiles
    [this.elements.touchLeft, this.elements.touchRight].forEach((btn) => {
      btn.addEventListener('touchmove', (e) => e.preventDefault());
    });

    // Eventos de teclado
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('resize', () => this.handleResize());

    // Eventos de visibilidad para pausar automáticamente
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameState === 'playing') {
        this.pauseGame();
      }
    });
  }

  /**
   * Maneja eventos de teclado
   */
  handleKeyDown(event) {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.gameState === 'menu' || this.gameState === 'gameOver') {
          this.startGame();
        }
        break;
      case 'Escape':
        if (this.gameState === 'playing') {
          this.pauseGame();
        }
        break;
    }
  }

  /**
   * Maneja el redimensionamiento de ventana
   */
  handleResize() {
    this.setupCanvas();
  }

  /**
   * Alterna entre play y pausa
   */
  togglePlayPause() {
    if (this.gameState === 'menu' || this.gameState === 'gameOver') {
      this.startGame();
    } else if (this.gameState === 'playing') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  /**
   * Inicia una nueva partida
   */
  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.missedFruits = 0;
    this.gameSpeed = 1;
    this.fruits = [];
    this.particles = [];
    this.fruitSpawnTimer = 0;

    // Resetear posición del jugador
    this.player.reset();

    // Universal Systems Integration
    if (typeof UniversalAudio !== 'undefined') {
      UniversalAudio.playGameStart();
    }
    if (typeof Achievements !== 'undefined') {
      Achievements.trackEvent('game_start', { game: 'fruit_catcher' });
    }

    // Actualizar UI
    this.updateUI();
    this.updatePlayPauseButton();
    this.hideModal();
    this.hidePauseOverlay();

    // Iniciar el loop del juego
    if (!this.gameLoopRunning) {
      this.gameLoop();
    }

    console.log('🎮 Juego iniciado');
  }

  /**
   * Pausa el juego
   */
  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.updatePlayPauseButton();
      this.showPauseOverlay();
      console.log('⏸️ Juego pausado');
    }
  }

  /**
   * Reanuda el juego
   */
  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.updatePlayPauseButton();
      this.hidePauseOverlay();
      console.log('▶️ Juego reanudado');
    }
  }

  /**
   * Reinicia el juego completamente
   */
  restartGame() {
    this.startGame();
  }

  /**
   * Termina el juego
   */
  endGame() {
    this.gameState = 'gameOver';

    // Universal Systems Integration
    if (typeof UniversalAudio !== 'undefined') {
      UniversalAudio.playGameOver();
    }
    if (typeof Tournament !== 'undefined') {
      Tournament.submitScore('fruit_catcher', this.score, { level: this.level });
    }
    if (typeof Achievements !== 'undefined') {
      Achievements.trackEvent('game_over', { 
        game: 'fruit_catcher', 
        score: this.score, 
        level: this.level 
      });
    }

    // Verificar y guardar high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.effectsManager.createCelebration();
      
      if (typeof Achievements !== 'undefined') {
        Achievements.trackEvent('high_score', { 
          game: 'fruit_catcher', 
          score: this.score 
        });
      }
    }

    // Mostrar modal de game over
    this.showGameOverModal();
    this.updatePlayPauseButton();

    // Efecto de screen shake
    this.effectsManager.screenShake();

    console.log(`💀 Game Over - Score: ${this.score}, Level: ${this.level}`);
  }

  /**
   * Loop principal del juego
   */
  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convertir a segundos
    this.lastTime = currentTime;

    // Solo actualizar y renderizar si el juego está activo
    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }

    this.render();

    // Continuar el loop
    this.gameLoopRunning = true;
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * Actualiza la lógica del juego
   */
  update(deltaTime) {
    // Actualizar jugador
    this.player.update(this.inputHandler, deltaTime);

    // Actualizar spawning de frutas
    this.updateFruitSpawning(deltaTime);

    // Actualizar frutas
    this.updateFruits(deltaTime);

    // Actualizar partículas
    this.updateParticles(deltaTime);

    // Verificar colisiones
    this.checkCollisions();

    // Actualizar nivel basado en score
    this.updateLevel();
  }

  /**
   * Controla el spawning de frutas
   */
  updateFruitSpawning(deltaTime) {
    this.fruitSpawnTimer += deltaTime;

    const spawnRate = GAME_CONFIG.fruit.spawnRate / this.gameSpeed;

    if (this.fruitSpawnTimer >= spawnRate) {
      this.spawnFruit();
      this.fruitSpawnTimer = 0;
    }
  }

  /**
   * Crea una nueva fruta
   */
  spawnFruit() {
    const x =
      Math.random() * (GAME_CONFIG.canvas.width - GAME_CONFIG.fruit.width);
    const fruit = new Fruit(x, -GAME_CONFIG.fruit.height);
    fruit.speed *= this.gameSpeed;
    this.fruits.push(fruit);
  }

  /**
   * Actualiza todas las frutas
   */
  updateFruits(deltaTime) {
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      fruit.update(deltaTime);

      // Eliminar frutas que salieron de pantalla y quitar vida
      if (fruit.y > GAME_CONFIG.canvas.height) {
        this.fruits.splice(i, 1);
        this.missedFruits++;
        this.lives--;

        // Verificar game over
        if (this.lives <= 0) {
          this.endGame();
          return;
        }

        // Efecto visual al perder vida
        this.effectsManager.screenShake();
      }
    }
  }

  /**
   * Actualiza sistema de partículas
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      if (particle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Verifica colisiones entre jugador y frutas
   */
  checkCollisions() {
    const playerBounds = this.player.getBounds();

    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      const fruitBounds = fruit.getBounds();

      if (this.isColliding(playerBounds, fruitBounds)) {
        // Colisión detectada
        this.collectFruit(fruit, i);
      }
    }
  }

  /**
   * Detecta colisión entre dos rectángulos
   */
  isColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Maneja la recolección de una fruta
   */
  collectFruit(fruit, index) {
    // Remover fruta
    this.fruits.splice(index, 1);

    // Incrementar score
    this.score += GAME_CONFIG.scoring.pointsPerFruit;

    // Crear efectos visuales
    this.createCollectionEffects(
      fruit.x + fruit.width / 2,
      fruit.y + fruit.height / 2
    );

    // Reproducir sonido (si está disponible)
    this.audioManager.playCollectSound();

    // Actualizar UI
    this.updateUI();

    console.log(`🍎 Fruta recolectada! Score: ${this.score}`);
  }

  /**
   * Crea efectos visuales al recolectar fruta
   */
  createCollectionEffects(x, y) {
    // Crear partículas
    for (let i = 0; i < GAME_CONFIG.effects.particleCount; i++) {
      const particle = new Particle(x, y);
      this.particles.push(particle);
    }
  }

  /**
   * Actualiza el nivel del juego
   */
  updateLevel() {
    const newLevel =
      Math.floor(this.score / GAME_CONFIG.scoring.levelUpScore) + 1;

    if (newLevel > this.level) {
      this.level = newLevel;
      this.gameSpeed *= GAME_CONFIG.scoring.speedIncrease;

      // Efectos de level up
      this.effectsManager.levelUpEffect();

      console.log(
        `📈 ¡Level Up! Nivel ${this.level}, Velocidad: ${this.gameSpeed.toFixed(
          2
        )}x`
      );
    }
  }

  /**
   * Renderiza todo el juego
   */
  render() {
    // Limpiar canvas
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.canvas.width,
      GAME_CONFIG.canvas.height
    );

    // Renderizar estrellas de fondo
    this.renderBackground();

    if (this.gameState === 'playing' || this.gameState === 'paused') {
      // Renderizar jugador
      this.player.render(this.ctx);

      // Renderizar frutas
      this.fruits.forEach((fruit) => fruit.render(this.ctx));

      // Renderizar partículas
      this.particles.forEach((particle) => particle.render(this.ctx));
    }

    // Renderizar overlay de estado si es necesario
    this.renderStateOverlay();
  }

  /**
   * Renderiza el fondo estrellado
   */
  renderBackground() {
    this.ctx.fillStyle = '#00ff88';

    // Estrellas estáticas simples
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % GAME_CONFIG.canvas.width;
      const y = (i * 23) % GAME_CONFIG.canvas.height;
      const size = Math.random() * 2 + 1;

      this.ctx.globalAlpha = Math.random() * 0.8 + 0.2;
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * Renderiza overlays de estado
   */
  renderStateOverlay() {
    if (this.gameState === 'menu') {
      this.renderMenuOverlay();
    }
  }

  /**
   * Renderiza overlay del menú principal
   */
  renderMenuOverlay() {
    // Fondo semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.canvas.width,
      GAME_CONFIG.canvas.height
    );

    // Título
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 48px Orbitron, monospace';
    this.ctx.fillText('FRUIT CATCHER', GAME_CONFIG.canvas.width / 2, 200);

    // Subtítulo
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Rajdhani, sans-serif';
    this.ctx.fillText(
      '¡Atrapa las frutas que caen!',
      GAME_CONFIG.canvas.width / 2,
      250
    );

    // Instrucciones
    this.ctx.font = '18px Rajdhani, sans-serif';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText(
      'Presiona JUGAR para comenzar',
      GAME_CONFIG.canvas.width / 2,
      350
    );
    this.ctx.fillText(
      '← → o A/D para mover',
      GAME_CONFIG.canvas.width / 2,
      380
    );
    this.ctx.fillText('SPACE para pausar', GAME_CONFIG.canvas.width / 2, 410);

    // High Score
    if (this.highScore > 0) {
      this.ctx.fillStyle = '#ffd93d';
      this.ctx.font = 'bold 20px Rajdhani, sans-serif';
      this.ctx.fillText(
        `Mejor Score: ${this.highScore}`,
        GAME_CONFIG.canvas.width / 2,
        500
      );
    }
  }

  /**
   * Actualiza elementos de la UI
   */
  updateUI() {
    this.elements.currentScore.textContent = this.score;
    this.elements.highScore.textContent = this.highScore;
    this.elements.currentLevel.textContent = this.level;
    this.elements.currentLives.textContent = this.lives;
  }

  /**
   * Actualiza el botón de play/pausa
   */
  updatePlayPauseButton() {
    const btn = this.elements.playPauseBtn;
    const icon = btn.querySelector('.btn-icon');
    const text = btn.querySelector('.btn-text');

    if (this.gameState === 'playing') {
      icon.textContent = '⏸️';
      text.textContent = 'Pausa';
    } else {
      icon.textContent = '▶️';
      text.textContent = this.gameState === 'paused' ? 'Continuar' : 'Jugar';
    }
  }

  /**
   * Muestra el modal de game over
   */
  showGameOverModal() {
    this.elements.finalScore.textContent = this.score;
    this.elements.modalHighScore.textContent = this.highScore;
    this.elements.finalLevel.textContent = this.level;
    this.elements.gameOverModal.classList.remove('hidden');
    this.elements.gameOverModal.setAttribute('aria-hidden', 'false');
  }

  /**
   * Oculta el modal de game over
   */
  hideModal() {
    this.elements.gameOverModal.classList.add('hidden');
    this.elements.gameOverModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Muestra el overlay de pausa
   */
  showPauseOverlay() {
    this.elements.pauseOverlay.classList.remove('hidden');
  }

  /**
   * Oculta el overlay de pausa
   */
  hidePauseOverlay() {
    this.elements.pauseOverlay.classList.add('hidden');
  }

  /**
   * Comparte la puntuación
   */
  shareScore() {
    const text = `¡Acabo de conseguir ${this.score} puntos en Fruit Catcher! ¿Puedes superarme?`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Fruit Catcher - Mi puntuación',
          text: text,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback para navegadores sin soporte de Web Share API
      navigator.clipboard
        .writeText(text + ' ' + window.location.href)
        .then(() => alert('¡Puntuación copiada al portapapeles!'))
        .catch(() => alert(`Mi puntuación: ${text}`));
    }
  }

  /**
   * Carga el high score desde localStorage
   */
  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('fruitCatcher_highScore')) || 0;
    } catch (error) {
      console.warn('No se pudo cargar el high score:', error);
      return 0;
    }
  }

  /**
   * Guarda el high score en localStorage
   */
  saveHighScore() {
    try {
      localStorage.setItem('fruitCatcher_highScore', this.highScore.toString());
    } catch (error) {
      console.warn('No se pudo guardar el high score:', error);
    }
  }

  /**
   * Sistema de auditoría TDD
   */
  runAuditTasks() {
    console.log('🔍 Ejecutando auditoría TDD de Fruit Catcher...');
    const results = [];
    
    // Task 1: Canvas Size Validation
    const canvasValid = this.canvas.width === GAME_CONFIG.canvas.width && 
                       this.canvas.height === GAME_CONFIG.canvas.height;
    results.push({ name: 'Canvas Size', pass: canvasValid, details: `Canvas is ${this.canvas.width}x${this.canvas.height}` });
    
    // Task 2: Player Properties
    const playerValid = this.player && 
                       this.player.width === GAME_CONFIG.player.width &&
                       this.player.height === GAME_CONFIG.player.height;
    results.push({ name: 'Player Properties', pass: playerValid, details: `Player ${this.player?.width}x${this.player?.height}` });
    
    // Task 3: Fruits Array
    const fruitsValid = Array.isArray(this.fruits);
    results.push({ name: 'Fruits Array', pass: fruitsValid, details: `${this.fruits.length} fruits active` });
    
    // Task 4: Game State Validation
    const validStates = ['menu', 'playing', 'paused', 'gameOver'];
    const stateValid = validStates.includes(this.gameState);
    results.push({ name: 'Game State', pass: stateValid, details: `Current state: ${this.gameState}` });
    
    // Task 5: Score System
    const scoreValid = typeof this.score === 'number' && typeof this.highScore === 'number';
    results.push({ name: 'Score System', pass: scoreValid, details: `Score: ${this.score}, High: ${this.highScore}` });
    
    // Task 6: Level Progression
    const levelValid = typeof this.level === 'number' && this.level >= 1;
    results.push({ name: 'Level System', pass: levelValid, details: `Current level: ${this.level}` });
    
    // Task 7: Particle System
    const particlesValid = Array.isArray(this.particles);
    results.push({ name: 'Particle System', pass: particlesValid, details: `${this.particles.length} particles active` });
    
    // Task 8: Navigation Link
    const backLink = document.querySelector('a[href*="../index.html"]');
    results.push({ name: 'Navigation Link', pass: !!backLink, details: 'Back to index navigation present' });
    
    // Task 9: License Header
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'License Header', pass: hasLicense, details: 'MIT license header in HTML' });
    
    // Task 10: Frame Rate Control
    const frameRateValid = typeof this.lastTime === 'number';
    results.push({ name: 'Frame Rate Control', pass: frameRateValid, details: 'Delta time tracking active' });
    
    // Display results
    console.table(results);
    
    const passCount = results.filter(r => r.pass).length;
    const totalTests = results.length;
    const auditPassed = passCount === totalTests;
    
    console.log(`🎯 Auditoría Fruit Catcher: ${passCount}/${totalTests} tests PASSED`);
    
    if (auditPassed) {
      console.log('✅ Fruit Catcher - AUDITORÍA COMPLETA EXITOSA');
    } else {
      console.warn('⚠️ Fruit Catcher - AUDITORÍA FALLÓ - Revisar tests marcados como FAIL');
    }
    
    return { passed: auditPassed, results, score: `${passCount}/${totalTests}` };
  }
}

/**
 * Clase del jugador (cesta)
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.player.width;
    this.height = GAME_CONFIG.player.height;
    this.speed = GAME_CONFIG.player.speed;
    this.originalX = x;
  }

  /**
   * Actualiza la posición del jugador
   */
  update(inputHandler, deltaTime) {
    let dx = 0;

    // Movimiento con teclado
    if (
      inputHandler.isKeyPressed('ArrowLeft') ||
      inputHandler.isKeyPressed('KeyA')
    ) {
      dx -= this.speed * deltaTime;
    }
    if (
      inputHandler.isKeyPressed('ArrowRight') ||
      inputHandler.isKeyPressed('KeyD')
    ) {
      dx += this.speed * deltaTime;
    }

    // Aplicar movimiento con límites de pantalla
    this.x += dx;
    this.x = Math.max(
      0,
      Math.min(this.x, GAME_CONFIG.canvas.width - this.width)
    );
  }

  /**
   * Renderiza el jugador
   */
  render(ctx) {
    // Cesta principal
    ctx.fillStyle = GAME_CONFIG.player.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Borde de la cesta
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Detalles de la cesta
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      const lineX = this.x + (this.width / 4) * (i + 1);
      ctx.fillRect(lineX, this.y, 2, this.height);
    }
  }

  /**
   * Obtiene los límites del jugador para colisiones
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Resetea la posición del jugador
   */
  reset() {
    this.x = this.originalX;
  }
}

/**
 * Clase de fruta
 */
class Fruit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.fruit.width;
    this.height = GAME_CONFIG.fruit.height;
    this.speed =
      Math.random() *
        (GAME_CONFIG.fruit.maxSpeed - GAME_CONFIG.fruit.minSpeed) +
      GAME_CONFIG.fruit.minSpeed;
    this.color =
      GAME_CONFIG.fruit.colors[
        Math.floor(Math.random() * GAME_CONFIG.fruit.colors.length)
      ];
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 4;
  }

  /**
   * Actualiza la fruta
   */
  update(deltaTime) {
    this.y += this.speed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Renderiza la fruta
   */
  render(ctx) {
    ctx.save();

    // Transformaciones para rotación
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Cuerpo de la fruta
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Borde
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Detalle simple (punto brillante)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      -this.width / 4,
      -this.height / 4,
      this.width / 3,
      this.height / 3
    );

    ctx.restore();
  }

  /**
   * Obtiene los límites de la fruta para colisiones
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

/**
 * Clase de partícula para efectos visuales
 */
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 200;
    this.vy = (Math.random() - 0.5) * 200 - 100;
    this.life = 1.0;
    this.decay = Math.random() * 2 + 1;
    this.size = Math.random() * 4 + 2;
    this.color =
      GAME_CONFIG.fruit.colors[
        Math.floor(Math.random() * GAME_CONFIG.fruit.colors.length)
      ];
  }

  /**
   * Actualiza la partícula
   */
  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= this.decay * deltaTime;
  }

  /**
   * Renderiza la partícula
   */
  render(ctx) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    ctx.restore();
  }

  /**
   * Verifica si la partícula debe ser eliminada
   */
  isDead() {
    return this.life <= 0;
  }
}

/**
 * Clase para manejar input del usuario
 */
class InputHandler {
  constructor() {
    this.keys = {};
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  /**
   * Verifica si una tecla está presionada
   */
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  /**
   * Establece manualmente el estado de una tecla (para controles táctiles)
   */
  setKey(keyCode, isPressed) {
    this.keys[keyCode] = isPressed;
  }
}

/**
 * Clase para manejar audio (stub para futuras implementaciones)
 */
class AudioManager {
  constructor() {
    this.enabled = false; // Por ahora deshabilitado
  }

  playCollectSound() {
    if (!this.enabled) return;
    // Implementación futura con Web Audio API
  }

  playBackgroundMusic() {
    if (!this.enabled) return;
    // Implementación futura
  }
}

/**
 * Clase para efectos visuales especiales
 */
class EffectsManager {
  constructor() {
    this.particleSystem = document.getElementById('particleSystem');
  }

  /**
   * Crea efecto de celebración
   */
  createCelebration() {
    // Crear partículas HTML para celebración
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.createHTMLParticle();
      }, i * 50);
    }
  }

  /**
   * Crea una partícula HTML
   */
  createHTMLParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    particle.style.backgroundColor =
      GAME_CONFIG.fruit.colors[
        Math.floor(Math.random() * GAME_CONFIG.fruit.colors.length)
      ];
    particle.style.width = Math.random() * 8 + 4 + 'px';
    particle.style.height = particle.style.width;

    this.particleSystem.appendChild(particle);

    // Remover después de la animación
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 2000);
  }

  /**
   * Efecto de screen shake
   */
  screenShake() {
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, GAME_CONFIG.effects.shakeDuration);
  }

  /**
   * Efecto de level up
   */
  levelUpEffect() {
    this.createCelebration();
    this.screenShake();
  }
}

// Inicialización del juego cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Crear instancia del juego
    const game = new FruitCatcherGame('gameCanvas');

    // Exponer el juego globalmente para debugging
    window.fruitCatcherGame = game;

    // Ejecutar auditoría en modo desarrollo
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log('🔍 Modo desarrollo detectado - ejecutando auditoría...');
      window.runAudit = game.runAuditTasks.bind(game);
      setTimeout(() => game.runAuditTasks(), 1000);
    }

    console.log('🚀 Fruit Catcher cargado exitosamente');
  } catch (error) {
    console.error('❌ Error al inicializar Fruit Catcher:', error);

    // Mostrar mensaje de error al usuario
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Error al cargar el juego',
        canvas.width / 2,
        canvas.height / 2
      );
      ctx.font = '16px Arial';
      ctx.fillText(
        'Por favor, recarga la página',
        canvas.width / 2,
        canvas.height / 2 + 40
      );
    }
  }
});

// Manejo de errores no capturados
window.addEventListener('error', (event) => {
  console.error('Error no capturado en Fruit Catcher:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error(
    'Promesa rechazada no manejada en Fruit Catcher:',
    event.reason
  );
});
