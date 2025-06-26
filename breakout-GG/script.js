/* © GG, MIT License */
/* ===================================================================
   🧱 BREAKOUT RETRO - GG EDITION
   ===================================================================
   
   Archivo: script.js
   Desarrollador: GG
   Proyecto: AI4Devs Video Game Project
   
   Descripción:
   Implementación completa del juego Breakout usando JavaScript ES6+.
   Arquitectura modular con clases especializadas, sistema de colisiones
   optimizado, efectos de partículas, y mecánicas de juego progresivas.
   
   Estructura del código:
   1. Configuración y constantes globales
   2. Clase principal BreakoutGame
   3. Clases de entidades (Paddle, Ball, Brick)
   4. Sistemas auxiliares (Input, Particles, Audio)
   5. Utilidades y funciones helper
   6. Inicialización y event listeners
   
================================================================== */

/* ===================================================================
   1. CONFIGURACIÓN Y CONSTANTES GLOBALES
================================================================== */

// Configuración principal del juego
const GAME_CONFIG = {
    // Canvas y dimensiones
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Paleta del jugador
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 20,
    PADDLE_SPEED: 8,
    PADDLE_Y_OFFSET: 50, // Distancia desde el fondo
    
    // Pelota
    BALL_RADIUS: 8,
    BALL_SPEED: 4,
    BALL_SPEED_INCREMENT: 0.2,
    BALL_MAX_SPEED: 12,
    
    // Ladrillos
    BRICK_ROWS: 8,
    BRICK_COLS: 10,
    BRICK_WIDTH: 75,
    BRICK_HEIGHT: 25,
    BRICK_PADDING: 3,
    BRICK_OFFSET_TOP: 80,
    BRICK_OFFSET_LEFT: 35,
    
    // Gameplay
    INITIAL_LIVES: 3,
    POINTS_PER_BRICK: [50, 40, 30, 20, 10], // Por fila (superior a inferior)
    PARTICLE_COUNT: 8,
    
    // Física
    GRAVITY: 0.02,
    FRICTION: 0.99,
    BOUNCE_DAMPING: 0.95
};

// Estados posibles del juego
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete',
    VICTORY: 'victory'
};

// Colores para diferentes elementos
const COLORS = {
    paddle: '#00FFFF',
    ball: '#FFFFFF',
    ballTrail: '#00FFFF',
    bricks: ['#FF0040', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF'],
    particles: ['#FF0040', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF'],
    background: '#0a0a0f',
    grid: 'rgba(0, 255, 255, 0.1)'
};

// Teclas de control
const KEYS = {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
    PAUSE: ['Space', 'Escape'],
    START: ['Enter'],
    RESTART: ['r', 'R']
};

/* ===================================================================
   2. CLASE PRINCIPAL - BREAKOUT GAME
================================================================== */

class BreakoutGame {
    constructor() {
        // Referencias DOM
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        
        // UI Elements
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.levelDisplay = document.getElementById('levelDisplay');
        
        // Estado del juego
        this.gameState = GAME_STATES.MENU;
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.level = 1;
        this.lastTime = 0;
        this.gameSpeed = 1;
        
        // Entidades del juego
        this.paddle = null;
        this.ball = null;
        this.bricks = [];
        this.particles = [];
        
        // Sistemas auxiliares
        this.inputHandler = new InputHandler();
        this.particleSystem = new ParticleSystem();
        this.audioSystem = new AudioSystem();
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        this.fpsTime = 0;
        
        this.init();
    }
    
    /**
     * Inicialización del juego
     */
    init() {
        console.log('🎮 Inicializando Breakout Retro GG...');
        
        // Configurar canvas
        this.setupCanvas();
        
        // Crear entidades iniciales
        this.createEntities();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Mostrar pantalla de inicio
        this.showMenu();
        
        // Iniciar bucle de juego
        this.gameLoop();
        
        console.log('✅ Juego inicializado correctamente');
    }
    
    /**
     * Configuración del canvas
     */
    setupCanvas() {
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Configurar contexto para mejor renderizado
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    /**
     * Crear todas las entidades del juego
     */
    createEntities() {
        // Crear paleta
        this.paddle = new Paddle(
            GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET,
            GAME_CONFIG.PADDLE_WIDTH,
            GAME_CONFIG.PADDLE_HEIGHT
        );
        
        // Crear pelota
        this.ball = new Ball(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET - GAME_CONFIG.PADDLE_HEIGHT - GAME_CONFIG.BALL_RADIUS * 2,
            GAME_CONFIG.BALL_RADIUS
        );
        
        // Crear ladrillos
        this.createBricks();
    }
    
    /**
     * Crear la matriz de ladrillos
     */
    createBricks() {
        this.bricks = [];
        
        for (let row = 0; row < GAME_CONFIG.BRICK_ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.BRICK_COLS; col++) {
                const x = GAME_CONFIG.BRICK_OFFSET_LEFT + col * (GAME_CONFIG.BRICK_WIDTH + GAME_CONFIG.BRICK_PADDING);
                const y = GAME_CONFIG.BRICK_OFFSET_TOP + row * (GAME_CONFIG.BRICK_HEIGHT + GAME_CONFIG.BRICK_PADDING);
                
                // Color basado en la fila
                const colorIndex = Math.floor(row / 2) % COLORS.bricks.length;
                const color = COLORS.bricks[colorIndex];
                
                // Puntuación basada en la fila (filas superiores dan más puntos)
                const points = GAME_CONFIG.POINTS_PER_BRICK[Math.min(colorIndex, GAME_CONFIG.POINTS_PER_BRICK.length - 1)];
                
                this.bricks.push(new Brick(x, y, GAME_CONFIG.BRICK_WIDTH, GAME_CONFIG.BRICK_HEIGHT, color, points));
            }
        }
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Input del teclado
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch controls for mobile
        this.setupTouchControls();
        
        // Prevenir scroll con teclas de flecha
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Focus en el canvas para capturar input
        this.canvas.addEventListener('click', () => this.canvas.focus());
        this.canvas.tabIndex = 0;
    }

    /**
     * Setup touch controls for mobile devices
     */
    setupTouchControls() {
        let touchStartX = 0;
        let isTracking = false;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            isTracking = true;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isTracking || this.gameState !== GAME_STATES.PLAYING) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const deltaX = touchX - touchStartX;

            // Simulate left/right key presses based on touch movement
            if (deltaX < -10) {
                this.inputHandler.handleKeyDown('ArrowLeft');
                this.inputHandler.handleKeyUp('ArrowRight');
            } else if (deltaX > 10) {
                this.inputHandler.handleKeyDown('ArrowRight');
                this.inputHandler.handleKeyUp('ArrowLeft');
            } else {
                // Stop movement when touch is centered
                this.inputHandler.handleKeyUp('ArrowLeft');
                this.inputHandler.handleKeyUp('ArrowRight');
            }

            touchStartX = touchX;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isTracking = false;
            // Stop all movement
            this.inputHandler.handleKeyUp('ArrowLeft');
            this.inputHandler.handleKeyUp('ArrowRight');
        });
    }
    
    /**
     * Manejo de teclas presionadas
     */
    handleKeyDown(e) {
        const key = e.key;
        
        // Control según el estado del juego
        switch (this.gameState) {
            case GAME_STATES.MENU:
                if (KEYS.START.includes(key)) {
                    this.startGame();
                }
                break;
                
            case GAME_STATES.PLAYING:
                if (KEYS.PAUSE.includes(key)) {
                    this.pauseGame();
                } else {
                    this.inputHandler.handleKeyDown(key);
                }
                break;
                
            case GAME_STATES.PAUSED:
                if (KEYS.PAUSE.includes(key)) {
                    this.resumeGame();
                }
                break;
                
            case GAME_STATES.GAME_OVER:
            case GAME_STATES.LEVEL_COMPLETE:
                if (KEYS.START.includes(key)) {
                    this.restartGame();
                }
                break;
        }
    }
    
    /**
     * Manejo de teclas liberadas
     */
    handleKeyUp(e) {
        this.inputHandler.handleKeyUp(e.key);
    }
    
    /**
     * Bucle principal del juego
     */
    gameLoop(currentTime = 0) {
        // Calcular delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Actualizar FPS
        this.updateFPS(deltaTime);
        
        // Actualizar y renderizar solo si el juego está activo
        if (this.gameState === GAME_STATES.PLAYING) {
            this.update(deltaTime);
        }
        
        this.render();
        
        // Continuar el bucle
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Actualizar FPS counter
     */
    updateFPS(deltaTime) {
        this.frameCount++;
        this.fpsTime += deltaTime;
        
        if (this.fpsTime >= 1000) { // Cada segundo
            this.fps = Math.round((this.frameCount * 1000) / this.fpsTime);
            this.frameCount = 0;
            this.fpsTime = 0;
        }
    }
    
    /**
     * Actualizar lógica del juego
     */
    update(deltaTime) {
        // Actualizar input
        this.inputHandler.update();
        
        // Actualizar paleta
        this.paddle.update(this.inputHandler, deltaTime);
        
        // Actualizar pelota
        this.ball.update(deltaTime);
        
        // Actualizar partículas
        this.particleSystem.update(deltaTime);
        
        // Verificar colisiones
        this.handleCollisions();
        
        // Verificar condiciones de fin de nivel/juego
        this.checkGameConditions();
        
        // Mantener entidades dentro de los límites
        this.constrainEntities();
    }
    
    /**
     * Sistema de colisiones
     */
    handleCollisions() {
        // Colisión pelota - paleta
        if (this.ball.isActive && this.checkCollision(this.ball, this.paddle)) {
            this.handleBallPaddleCollision();
        }
        
        // Colisión pelota - ladrillos
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (brick.isActive && this.checkCollision(this.ball, brick)) {
                this.handleBallBrickCollision(brick, i);
            }
        }
        
        // Colisión pelota - paredes
        this.handleBallWallCollisions();
    }
    
    /**
     * Verificar colisión entre dos entidades rectangulares
     */
    checkCollision(ball, rect) {
        return ball.x - ball.radius < rect.x + rect.width &&
               ball.x + ball.radius > rect.x &&
               ball.y - ball.radius < rect.y + rect.height &&
               ball.y + ball.radius > rect.y;
    }
    
    /**
     * Manejo de colisión pelota - paleta
     */
    handleBallPaddleCollision() {
        const paddle = this.paddle;
        const ball = this.ball;
        
        // Calcular punto de impacto relativo (-1 a 1)
        const relativeIntersectX = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        
        // Calcular nuevo ángulo basado en el punto de impacto
        const bounceAngle = relativeIntersectX * Math.PI / 3; // Max 60 grados
        
        // Aplicar nueva velocidad
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = speed * Math.sin(bounceAngle);
        ball.vy = -Math.abs(speed * Math.cos(bounceAngle)); // Siempre hacia arriba
        
        // Posicionar pelota arriba de la paleta
        ball.y = paddle.y - ball.radius;
        
        // Efectos visuales y sonoros
        this.particleSystem.createImpactParticles(ball.x, ball.y, COLORS.paddle);
        this.audioSystem.playPaddleHit();
        
        // Incrementar velocidad ligeramente
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed < GAME_CONFIG.BALL_MAX_SPEED) {
            const speedMultiplier = 1 + GAME_CONFIG.BALL_SPEED_INCREMENT / 10;
            ball.vx *= speedMultiplier;
            ball.vy *= speedMultiplier;
        }
    }
    
    /**
     * Manejo de colisión pelota - ladrillo
     */
    handleBallBrickCollision(brick, index) {
        const ball = this.ball;
        
        // Determinar lado de colisión
        const overlapLeft = (ball.x + ball.radius) - brick.x;
        const overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);
        const overlapTop = (ball.y + ball.radius) - brick.y;
        const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);
        
        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);
        
        // Rebote basado en el lado de menor penetración
        if (minOverlapX < minOverlapY) {
            ball.vx = -ball.vx; // Rebote horizontal
        } else {
            ball.vy = -ball.vy; // Rebote vertical
        }
        
        // Destruir ladrillo
        brick.destroy();
        this.bricks.splice(index, 1);
        
        // Actualizar puntuación
        this.addScore(brick.points);
        
        // Efectos visuales
        this.particleSystem.createExplosion(
            brick.x + brick.width / 2,
            brick.y + brick.height / 2,
            brick.color
        );
        
        // Sonido
        this.audioSystem.playBrickBreak();
        
        console.log(`🧱 Ladrillo destruido! +${brick.points} puntos. Ladrillos restantes: ${this.bricks.length}`);
    }
    
    /**
     * Manejo de colisiones pelota - paredes
     */
    handleBallWallCollisions() {
        const ball = this.ball;
        
        // Pared izquierda
        if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
            this.particleSystem.createWallImpact(ball.x, ball.y);
            this.audioSystem.playWallHit();
        }
        
        // Pared derecha
        if (ball.x + ball.radius >= GAME_CONFIG.CANVAS_WIDTH) {
            ball.x = GAME_CONFIG.CANVAS_WIDTH - ball.radius;
            ball.vx = -Math.abs(ball.vx);
            this.particleSystem.createWallImpact(ball.x, ball.y);
            this.audioSystem.playWallHit();
        }
        
        // Pared superior
        if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
            this.particleSystem.createWallImpact(ball.x, ball.y);
            this.audioSystem.playWallHit();
        }
        
        // Pared inferior (pérdida de vida)
        if (ball.y - ball.radius >= GAME_CONFIG.CANVAS_HEIGHT) {
            this.loseLife();
        }
    }
    
    /**
     * Mantener entidades dentro de los límites
     */
    constrainEntities() {
        // Paleta dentro del canvas
        this.paddle.x = Math.max(0, Math.min(this.paddle.x, GAME_CONFIG.CANVAS_WIDTH - this.paddle.width));
    }
    
    /**
     * Verificar condiciones de fin de juego
     */
    checkGameConditions() {
        // Victoria - todos los ladrillos destruidos
        if (this.bricks.length === 0) {
            this.completeLevel();
        }
        
        // Game Over - sin vidas
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * Perder una vida
     */
    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        console.log(`💔 Vida perdida! Vidas restantes: ${this.lives}`);
        
        // Efectos
        this.particleSystem.createExplosion(this.ball.x, GAME_CONFIG.CANVAS_HEIGHT, '#FF0040');
        this.audioSystem.playLifeLost();
        
        if (this.lives > 0) {
            // Resetear posición de pelota y paleta
            this.resetBallAndPaddle();
            this.pauseGame();
            this.showMessage('VIDA PERDIDA', `Vidas restantes: ${this.lives}\nPresiona ENTER para continuar`);
        } else {
            this.gameOver();
        }
    }
    
    /**
     * Resetear posiciones de pelota y paleta
     */
    resetBallAndPaddle() {
        this.paddle.x = GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2;
        
        this.ball.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        this.ball.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET - GAME_CONFIG.PADDLE_HEIGHT - GAME_CONFIG.BALL_RADIUS * 2;
        this.ball.vx = (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED;
        this.ball.vy = -GAME_CONFIG.BALL_SPEED;
        this.ball.isActive = true;
    }
    
    /**
     * Añadir puntuación
     */
    addScore(points) {
        this.score += points * this.level; // Multiplicador de nivel
        this.updateDisplay();
    }
    
    /**
     * Actualizar displays de UI
     */
    updateDisplay() {
        this.scoreDisplay.textContent = this.score.toLocaleString();
        this.livesDisplay.textContent = this.lives;
        this.levelDisplay.textContent = this.level;
    }
    
    /**
     * Completar nivel
     */
    completeLevel() {
        this.level++;
        this.gameState = GAME_STATES.LEVEL_COMPLETE;
        
        console.log(`🎉 ¡Nivel ${this.level - 1} completado!`);
        
        // Bonus por completar nivel
        const levelBonus = 1000 * this.level;
        this.addScore(levelBonus);
        
        // Efectos
        this.audioSystem.playLevelComplete();
        this.particleSystem.createCelebration();
        
        // Mostrar mensaje
        this.showMessage(
            `¡NIVEL ${this.level - 1} COMPLETADO!`,
            `Bonus: ${levelBonus.toLocaleString()} puntos\nPresiona ENTER para el siguiente nivel`
        );
    }
    
    /**
     * Iniciar siguiente nivel
     */
    nextLevel() {
        // Incrementar dificultad
        this.gameSpeed += 0.1;
        
        // Recrear ladrillos
        this.createBricks();
        
        // Resetear posiciones
        this.resetBallAndPaddle();
        
        // Incrementar velocidad de pelota
        const speedIncrease = 1 + (this.level * 0.1);
        this.ball.vx *= speedIncrease;
        this.ball.vy *= speedIncrease;
        
        this.startGame();
    }
    
    /**
     * Game Over
     */
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        
        console.log(`💀 Game Over! Puntuación final: ${this.score}`);
        
        this.audioSystem.playGameOver();
        
        this.showMessage(
            '¡GAME OVER!',
            `Puntuación Final: ${this.score.toLocaleString()}\nNivel alcanzado: ${this.level}\nPresiona ENTER para reiniciar`
        );
    }
    
    /**
     * Estados del juego
     */
    showMenu() {
        this.gameState = GAME_STATES.MENU;
        this.showMessage(
            'BREAKOUT RETRO',
            'Presiona ENTER para comenzar\nUsa ← → para mover la paleta'
        );
    }
    
    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.hideOverlay();
        this.ball.isActive = true;
        console.log('🚀 ¡Juego iniciado!');
    }
    
    pauseGame() {
        this.gameState = GAME_STATES.PAUSED;
        this.showMessage(
            'JUEGO PAUSADO',
            'Presiona ESPACIO para continuar'
        );
    }
    
    resumeGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.hideOverlay();
    }
    
    restartGame() {
        // Resetear estado del juego
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Recrear entidades
        this.createEntities();
        
        // Actualizar displays
        this.updateDisplay();
        
        // Iniciar
        this.startGame();
        
        console.log('🔄 Juego reiniciado');
    }
    
    /**
     * Mostrar mensaje en overlay
     */
    showMessage(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.innerHTML = message.replace(/\n/g, '<br>');
        this.overlay.classList.remove('hidden');
    }
    
    /**
     * Ocultar overlay
     */
    hideOverlay() {
        this.overlay.classList.add('hidden');
    }
    
    /**
     * Renderizado principal
     */
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        
        // Dibujar grid de fondo
        this.drawGrid();
        
        // Dibujar entidades
        this.paddle.render(this.ctx);
        this.ball.render(this.ctx);
        
        // Dibujar ladrillos
        this.bricks.forEach(brick => brick.render(this.ctx));
        
        // Dibujar partículas
        this.particleSystem.render(this.ctx);
        
        // Dibujar información de debug (en desarrollo)
        if (window.DEBUG_MODE) {
            this.drawDebugInfo();
        }
    }
    
    /**
     * Dibujar grid de fondo
     */
    drawGrid() {
        this.ctx.strokeStyle = COLORS.grid;
        this.ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 50; x < GAME_CONFIG.CANVAS_WIDTH; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 50; y < GAME_CONFIG.CANVAS_HEIGHT; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Información de debug
     */
    drawDebugInfo() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        this.ctx.fillText(`Ladrillos: ${this.bricks.length}`, 10, 35);
        this.ctx.fillText(`Partículas: ${this.particleSystem.particles.length}`, 10, 50);
        this.ctx.fillText(`Velocidad pelota: ${Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2).toFixed(2)}`, 10, 65);
    }

    /**
     * Sistema de auditoría TDD
     */
    runAuditTasks() {
        console.log('🔍 Ejecutando auditoría TDD de Breakout Retro...');
        const results = [];
        
        // Task 1: Canvas Size Validation
        const canvasValid = this.canvas.width === GAME_CONFIG.CANVAS_WIDTH && 
                           this.canvas.height === GAME_CONFIG.CANVAS_HEIGHT;
        results.push({ name: 'Canvas Size', pass: canvasValid, details: `Canvas is ${this.canvas.width}x${this.canvas.height}` });
        
        // Task 2: Paddle Properties
        const paddleValid = this.paddle && 
                           this.paddle.width === GAME_CONFIG.PADDLE_WIDTH &&
                           this.paddle.height === GAME_CONFIG.PADDLE_HEIGHT;
        results.push({ name: 'Paddle Properties', pass: paddleValid, details: `Paddle ${this.paddle.width}x${this.paddle.height}` });
        
        // Task 3: Ball Properties
        const ballValid = this.ball && 
                         this.ball.radius === GAME_CONFIG.BALL_RADIUS;
        results.push({ name: 'Ball Properties', pass: ballValid, details: `Ball radius: ${this.ball.radius}` });
        
        // Task 4: Bricks Count and Grid
        const expectedBricks = GAME_CONFIG.BRICK_ROWS * GAME_CONFIG.BRICK_COLS;
        const bricksValid = this.bricks && this.bricks.length === expectedBricks;
        results.push({ name: 'Bricks Grid', pass: bricksValid, details: `${this.bricks.length}/${expectedBricks} bricks` });
        
        // Task 5: Game States Validation
        const validStates = Object.values(GAME_STATES);
        const stateValid = validStates.includes(this.gameState);
        results.push({ name: 'Game State', pass: stateValid, details: `Current state: ${this.gameState}` });
        
        // Task 6: Ball Physics
        const ballPhysicsValid = this.ball && 
                                typeof this.ball.vx === 'number' && 
                                typeof this.ball.vy === 'number';
        results.push({ name: 'Ball Physics', pass: ballPhysicsValid, details: `Ball velocity: (${this.ball.vx}, ${this.ball.vy})` });
        
        // Task 7: Navigation Link
        const backLink = document.querySelector('a[href*="../index.html"]');
        results.push({ name: 'Navigation Link', pass: !!backLink, details: 'Back to index navigation present' });
        
        // Task 8: License Header
        const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
        results.push({ name: 'License Header', pass: hasLicense, details: 'MIT license header in HTML' });
        
        // Task 9: Audio System
        const audioValid = this.audioSystem && typeof this.audioSystem.playSound === 'function';
        results.push({ name: 'Audio System', pass: audioValid, details: 'Audio system initialized' });
        
        // Task 10: Particle System
        const particlesValid = this.particleSystem && Array.isArray(this.particleSystem.particles);
        results.push({ name: 'Particle System', pass: particlesValid, details: `${this.particleSystem.particles.length} particles` });
        
        // Display results
        console.table(results);
        
        const passCount = results.filter(r => r.pass).length;
        const totalTests = results.length;
        const auditPassed = passCount === totalTests;
        
        console.log(`🎯 Auditoría Breakout: ${passCount}/${totalTests} tests PASSED`);
        
        if (auditPassed) {
            console.log('✅ Breakout Retro - AUDITORÍA COMPLETA EXITOSA');
        } else {
            console.warn('⚠️ Breakout Retro - AUDITORÍA FALLÓ - Revisar tests marcados como FAIL');
        }
        
        return { passed: auditPassed, results, score: `${passCount}/${totalTests}` };
    }
}

/* ===================================================================
   3. CLASES DE ENTIDADES
================================================================== */

/**
 * Clase Paddle - Paleta del jugador
 */
class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = GAME_CONFIG.PADDLE_SPEED;
        this.color = COLORS.paddle;
        
        // Estado de movimiento
        this.movingLeft = false;
        this.movingRight = false;
    }
    
    update(inputHandler, deltaTime) {
        // Actualizar movimiento basado en input
        if (inputHandler.isPressed('left')) {
            this.x -= this.speed;
        }
        if (inputHandler.isPressed('right')) {
            this.x += this.speed;
        }
        
        // Mantener dentro de los límites
        this.x = Math.max(0, Math.min(this.x, GAME_CONFIG.CANVAS_WIDTH - this.width));
    }
    
    render(ctx) {
        // Sombra
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        // Gradiente de la paleta
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, '#FFFFFF');
        gradient.addColorStop(1, this.color);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Borde
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
    }
}

/**
 * Clase Ball - Pelota del juego
 */
class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED;
        this.vy = -GAME_CONFIG.BALL_SPEED;
        this.color = COLORS.ball;
        this.trailColor = COLORS.ballTrail;
        this.isActive = false;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 8;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        
        // Actualizar trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    render(ctx) {
        // Dibujar trail
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = i / this.trail.length;
                const point = this.trail[i];
                
                ctx.globalAlpha = alpha * 0.5;
                ctx.fillStyle = this.trailColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.radius * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        
        // Sombra brillante
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Gradiente radial para la pelota
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Resetear sombra
        ctx.shadowBlur = 0;
    }
}

/**
 * Clase Brick - Ladrillo destructible
 */
class Brick {
    constructor(x, y, width, height, color, points) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.points = points;
        this.isActive = true;
        
        // Efectos visuales
        this.brightness = 1;
        this.scale = 1;
    }
    
    destroy() {
        this.isActive = false;
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        // Sombra
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        // Gradiente del ladrillo
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.lightenColor(this.color, 0.3));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Borde brillante
        ctx.strokeStyle = this.lightenColor(this.color, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Highlight interior
        ctx.strokeStyle = this.lightenColor(this.color, 0.8);
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
    }
    
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
}

/* ===================================================================
   4. SISTEMAS AUXILIARES
================================================================== */

/**
 * Sistema de manejo de input
 */
class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            pause: false,
            start: false
        };
    }
    
    handleKeyDown(key) {
        if (KEYS.LEFT.includes(key)) {
            this.keys.left = true;
        }
        if (KEYS.RIGHT.includes(key)) {
            this.keys.right = true;
        }
        if (KEYS.PAUSE.includes(key)) {
            this.keys.pause = true;
        }
        if (KEYS.START.includes(key)) {
            this.keys.start = true;
        }
    }
    
    handleKeyUp(key) {
        if (KEYS.LEFT.includes(key)) {
            this.keys.left = false;
        }
        if (KEYS.RIGHT.includes(key)) {
            this.keys.right = false;
        }
        if (KEYS.PAUSE.includes(key)) {
            this.keys.pause = false;
        }
        if (KEYS.START.includes(key)) {
            this.keys.start = false;
        }
    }
    
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    update() {
        // Lógica adicional de input si es necesaria
    }
}

/**
 * Sistema de partículas para efectos visuales
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createImpactParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, color, 'impact'));
        }
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
            this.particles.push(new Particle(x, y, color, 'explosion'));
        }
    }
    
    createWallImpact(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push(new Particle(x, y, COLORS.ballTrail, 'spark'));
        }
    }
    
    createCelebration() {
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
            const y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
            const color = COLORS.particles[Math.floor(Math.random() * COLORS.particles.length)];
            this.particles.push(new Particle(x, y, color, 'celebration'));
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
}

/**
 * Clase Particle - Partícula individual
 */
class Particle {
    constructor(x, y, color, type = 'default') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        
        // Configurar propiedades según el tipo
        switch (type) {
            case 'explosion':
                this.vx = (Math.random() - 0.5) * 10;
                this.vy = (Math.random() - 0.5) * 10;
                this.life = 1.0;
                this.decay = 0.02;
                this.size = Math.random() * 4 + 2;
                break;
                
            case 'impact':
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = Math.random() * -5 - 2;
                this.life = 0.8;
                this.decay = 0.03;
                this.size = Math.random() * 3 + 1;
                break;
                
            case 'spark':
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = (Math.random() - 0.5) * 6;
                this.life = 0.5;
                this.decay = 0.05;
                this.size = Math.random() * 2 + 1;
                break;
                
            case 'celebration':
                this.vx = (Math.random() - 0.5) * 8;
                this.vy = Math.random() * -8 - 2;
                this.life = 2.0;
                this.decay = 0.01;
                this.size = Math.random() * 5 + 3;
                break;
        }
        
        this.gravity = 0.2;
        this.alpha = 1;
    }
    
    update(deltaTime) {
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        
        // Aplicar gravedad
        this.vy += this.gravity;
        
        // Reducir vida
        this.life -= this.decay;
        this.alpha = Math.max(0, this.life);
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Efecto de brillo
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 2;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * Sistema de audio (simulado - futuras mejoras)
 */
class AudioSystem {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
    }
    
    playPaddleHit() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Paddle Hit');
        // Implementar Web Audio API en futuras versiones
    }
    
    playBrickBreak() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Brick Break');
    }
    
    playWallHit() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Wall Hit');
    }
    
    playLifeLost() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Life Lost');
    }
    
    playLevelComplete() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Level Complete');
    }
    
    playGameOver() {
        if (!this.enabled) return;
        console.log('🔊 Sonido: Game Over');
    }
}

/* ===================================================================
   5. UTILIDADES Y FUNCIONES HELPER
================================================================== */

/**
 * Utilidad para calcular distancia entre dos puntos
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Utilidad para interpolar entre dos valores
 */
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Utilidad para generar números aleatorios en rango
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Utilidad para limitar un valor entre min y max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/* ===================================================================
   6. INICIALIZACIÓN Y EJECUCIÓN
================================================================== */

// Variable global para la instancia del juego
let game;

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOM cargado, inicializando Breakout Retro GG...');
    
    // Verificar soporte de Canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas || !canvas.getContext) {
        console.error('❌ Canvas no soportado en este navegador');
        alert('Tu navegador no soporta Canvas HTML5. Por favor, actualiza a una versión más reciente.');
        return;
    }
    
    // Crear instancia del juego
    try {
        game = new BreakoutGame();
        console.log('✅ Breakout Retro GG inicializado correctamente');
        
        // Exponer al scope global para debugging
        window.game = game;
        
        // Ejecutar auditoría en modo desarrollo
        if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
            console.log('🔍 Modo desarrollo detectado - ejecutando auditoría...');
            window.runAudit = game.runAuditTasks.bind(game);
            setTimeout(() => game.runAuditTasks(), 1000);
        }
        
    } catch (error) {
        console.error('❌ Error al inicializar el juego:', error);
        alert('Error al cargar el juego. Por favor, recarga la página.');
    }
});

/**
 * Manejo de errores globales
 */
window.addEventListener('error', (event) => {
    console.error('💥 Error global capturado:', event.error);
});

/**
 * Manejo de pérdida de foco (pausar automáticamente)
 */
window.addEventListener('blur', () => {
    if (game && game.gameState === GAME_STATES.PLAYING) {
        game.pauseGame();
    }
});

/**
 * Funciones de desarrollo y debug
 */
if (typeof window !== 'undefined') {
    // Habilitar modo debug desde la consola
    window.enableDebug = () => {
        window.DEBUG_MODE = true;
        console.log('🐛 Modo debug habilitado');
    };
    
    // Función para ajustar configuración desde consola
    window.setGameConfig = (config) => {
        Object.assign(GAME_CONFIG, config);
        console.log('⚙️ Configuración actualizada:', config);
    };
    
    // Información del juego
    console.log(`
    🧱 BREAKOUT RETRO - GG EDITION
    ===============================
    
    Comandos de debug:
    - window.enableDebug() - Habilitar información de debug
    - window.setGameConfig({}) - Modificar configuración
    - window.game - Acceso a la instancia del juego
    
    Desarrollado por: GG
    Proyecto: AI4Devs Video Game Project
    Tecnologías: HTML5 Canvas, CSS3, JavaScript ES6+
    `);
}

/* ===================================================================
   FIN DEL ARCHIVO - BREAKOUT RETRO GG
================================================================== */
