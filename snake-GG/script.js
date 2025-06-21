/* © GG, MIT License */
/**
 * SNAKE RETRO - EDICIÓN GG
 * Juego clásico de Snake desarrollado en JavaScript ES6+
 * Arquitectura modular para fácil mantenimiento y escalabilidad
 * 
 * @author GG
 * @version 1.0.0
 * @date 2025
 */

// ===== CONFIGURACIÓN DEL JUEGO =====
const GAME_CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    CELL_SIZE: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 0.95,
    POINTS_PER_FOOD: 10,
    POINTS_FOR_LEVEL: 50
};

// ===== CLASE PRINCIPAL DEL JUEGO =====
class SnakeGame {
    constructor() {
        // Referencias del DOM
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.speedElement = document.getElementById('speed');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');

        // Estado del juego
        this.gameState = {
            isRunning: false,
            isPaused: false,
            score: 0,
            level: 1,
            speed: GAME_CONFIG.INITIAL_SPEED
        };

        // Serpiente
        this.snake = {
            body: [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ],
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 }
        };

        // Comida
        this.food = { x: 15, y: 15 };

        // Control de tiempo
        this.lastRenderTime = 0;

        // Inicializar el juego
        this.init();
    }

    // ===== INICIALIZACIÓN =====
    init() {
        this.bindEvents();
        this.adjustCanvasSize();
        this.showStartScreen();
        
        // Ajustar canvas en dispositivos móviles
        window.addEventListener('resize', () => this.adjustCanvasSize());
    }

    adjustCanvasSize() {
        const container = this.canvas.parentElement;
        const maxSize = Math.min(container.clientWidth - 40, GAME_CONFIG.CANVAS_SIZE);
        
        if (window.innerWidth <= 480) {
            this.canvas.width = this.canvas.height = 280;
        } else if (window.innerWidth <= 768) {
            this.canvas.width = this.canvas.height = 320;
        } else {
            this.canvas.width = this.canvas.height = GAME_CONFIG.CANVAS_SIZE;
        }
    }

    // ===== EVENTOS =====
    bindEvents() {
        // Botones
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());

        // Teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Prevenir scroll con las flechas
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    handleKeyPress(event) {
        if (!this.gameState.isRunning || this.gameState.isPaused) {
            if (event.code === 'Space') {
                this.togglePause();
            }
            return;
        }

        const { direction, nextDirection } = this.snake;

        switch (event.code) {
            case 'ArrowUp':
                if (direction.y === 0) {
                    this.snake.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (direction.y === 0) {
                    this.snake.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (direction.x === 0) {
                    this.snake.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (direction.x === 0) {
                    this.snake.nextDirection = { x: 1, y: 0 };
                }
                break;
            case 'Space':
                this.togglePause();
                break;
        }
    }

    // ===== CONTROL DEL JUEGO =====
    startGame() {
        this.resetGame();
        this.hideStartScreen();
        this.showPauseButton();
        this.gameState.isRunning = true;
        this.gameState.isPaused = false;
        this.generateFood();
        this.updateUI();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    restartGame() {
        this.hideGameOverScreen();
        this.startGame();
    }

    togglePause() {
        if (!this.gameState.isRunning) return;

        this.gameState.isPaused = !this.gameState.isPaused;
        this.pauseBtn.textContent = this.gameState.isPaused ? '▶️ Reanudar' : '⏸️ Pausar';

        if (!this.gameState.isPaused) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    resetGame() {
        // Reiniciar estado del juego
        this.gameState.score = 0;
        this.gameState.level = 1;
        this.gameState.speed = GAME_CONFIG.INITIAL_SPEED;

        // Reiniciar serpiente
        this.snake.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.snake.direction = { x: 1, y: 0 };
        this.snake.nextDirection = { x: 1, y: 0 };

        // Reiniciar comida
        this.food = { x: 15, y: 15 };
    }

    gameOver() {
        this.gameState.isRunning = false;
        this.gameState.isPaused = false;
        this.hidePauseButton();
        this.showGameOverScreen();
        this.updateFinalScore();
    }

    // ===== BUCLE PRINCIPAL DEL JUEGO =====
    gameLoop(currentTime) {
        if (!this.gameState.isRunning || this.gameState.isPaused) return;

        const timeSinceLastRender = currentTime - this.lastRenderTime;

        if (timeSinceLastRender >= this.gameState.speed) {
            this.lastRenderTime = currentTime;
            this.update();
            this.render();
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // ===== LÓGICA DE ACTUALIZACIÓN =====
    update() {
        this.moveSnake();
        this.checkFoodCollision();
        this.checkCollisions();
        this.updateLevel();
    }

    moveSnake() {
        // Actualizar dirección
        this.snake.direction = { ...this.snake.nextDirection };

        // Calcular nueva posición de la cabeza
        const head = { ...this.snake.body[0] };
        head.x += this.snake.direction.x;
        head.y += this.snake.direction.y;

        // Añadir nueva cabeza
        this.snake.body.unshift(head);

        // Eliminar cola (se mantiene si comió comida)
        if (!this.ateFood) {
            this.snake.body.pop();
        }
        this.ateFood = false;
    }

    checkFoodCollision() {
        const head = this.snake.body[0];
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.ateFood = true;
            this.gameState.score += GAME_CONFIG.POINTS_PER_FOOD;
            this.updateUI();
            this.generateFood();
            
            // Efecto visual al comer
            this.showEatingEffect();
        }
    }

    checkCollisions() {
        const head = this.snake.body[0];
        const gridSize = this.canvas.width / GAME_CONFIG.CELL_SIZE;

        // Colisión con paredes
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            this.gameOver();
            return;
        }

        // Colisión con el cuerpo
        for (let i = 1; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
                this.gameOver();
                return;
            }
        }
    }

    updateLevel() {
        const newLevel = Math.floor(this.gameState.score / GAME_CONFIG.POINTS_FOR_LEVEL) + 1;
        
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.gameState.speed = Math.max(50, this.gameState.speed * GAME_CONFIG.SPEED_INCREMENT);
            this.updateUI();
            this.showLevelUpEffect();
        }
    }

    // ===== GENERACIÓN DE COMIDA =====
    generateFood() {
        const gridSize = this.canvas.width / GAME_CONFIG.CELL_SIZE;
        let newFood;
        let isOnSnake;

        do {
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };

            isOnSnake = this.snake.body.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        } while (isOnSnake);

        this.food = newFood;
    }

    // ===== RENDERIZADO =====
    render() {
        this.clearCanvas();
        this.drawFood();
        this.drawSnake();
        this.drawGrid();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const cellSize = this.canvas.width / (this.canvas.width / GAME_CONFIG.CELL_SIZE);
        
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= this.canvas.width; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= this.canvas.height; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        const cellSize = this.canvas.width / (this.canvas.width / GAME_CONFIG.CELL_SIZE);
        
        this.snake.body.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            if (index === 0) {
                // Cabeza de la serpiente
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                
                // Ojos de la serpiente
                this.ctx.fillStyle = '#000000';
                const eyeSize = cellSize / 6;
                const eyeOffset = cellSize / 4;
                
                if (this.snake.direction.x === 1) { // Derecha
                    this.ctx.fillRect(x + cellSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + cellSize - eyeOffset, y + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.snake.direction.x === -1) { // Izquierda
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.snake.direction.y === -1) { // Arriba
                    this.ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(x + cellSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.snake.direction.y === 1) { // Abajo
                    this.ctx.fillRect(x + eyeOffset, y + cellSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + cellSize - eyeOffset - eyeSize, y + cellSize - eyeOffset, eyeSize, eyeSize);
                }
            } else {
                // Cuerpo de la serpiente
                const intensity = Math.max(0.3, 1 - (index / this.snake.body.length));
                this.ctx.fillStyle = `rgba(0, 255, 0, ${intensity})`;
                this.ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            }
        });
    }

    drawFood() {
        const cellSize = this.canvas.width / (this.canvas.width / GAME_CONFIG.CELL_SIZE);
        const x = this.food.x * cellSize;
        const y = this.food.y * cellSize;

        // Comida principal
        this.ctx.fillStyle = '#ff0040';
        this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Brillo de la comida
        this.ctx.fillStyle = '#ff6080';
        this.ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);

        // Punto central brillante
        this.ctx.fillStyle = '#ffafbf';
        const centerSize = Math.max(2, cellSize / 4);
        const centerX = x + (cellSize - centerSize) / 2;
        const centerY = y + (cellSize - centerSize) / 2;
        this.ctx.fillRect(centerX, centerY, centerSize, centerSize);
    }

    // ===== EFECTOS VISUALES =====
    showEatingEffect() {
        // Efecto de parpadeo en la puntuación
        this.scoreElement.classList.add('pulse');
        setTimeout(() => {
            this.scoreElement.classList.remove('pulse');
        }, 500);
    }

    showLevelUpEffect() {
        // Efecto de parpadeo en el nivel
        this.levelElement.classList.add('pulse');
        setTimeout(() => {
            this.levelElement.classList.remove('pulse');
        }, 1000);
    }

    // ===== INTERFAZ DE USUARIO =====
    updateUI() {
        this.scoreElement.textContent = this.gameState.score;
        this.levelElement.textContent = this.gameState.level;
        this.speedElement.textContent = Math.round(this.gameState.speed);
    }

    updateFinalScore() {
        this.finalScoreElement.textContent = this.gameState.score;
        this.finalLevelElement.textContent = this.gameState.level;
    }

    // ===== CONTROL DE PANTALLAS =====
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    showGameOverScreen() {
        this.gameOverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }

    showPauseButton() {
        this.pauseBtn.classList.remove('hidden');
    }

    hidePauseButton() {
        this.pauseBtn.classList.add('hidden');
    }

    // ===== SISTEMA DE AUDITORÍA TDD =====
    runAuditTasks() {
        console.log('🔍 Ejecutando auditoría TDD de Snake Retro...');
        const results = [];
        
        // Task 1: Grid Alignment
        const gridAligned = this.snake.body.every(segment => {
            return Number.isInteger(segment.x) && Number.isInteger(segment.y);
        }) && Number.isInteger(this.food.x) && Number.isInteger(this.food.y);
        results.push({ name: 'Grid Alignment', pass: gridAligned, details: 'Snake segments and food on integer grid positions' });
        
        // Task 2: Canvas Size Validation
        const canvasValid = this.canvas.width === GAME_CONFIG.CANVAS_SIZE && 
                           this.canvas.height === GAME_CONFIG.CANVAS_SIZE;
        results.push({ name: 'Canvas Size', pass: canvasValid, details: `Canvas is ${this.canvas.width}x${this.canvas.height}` });
        
        // Task 3: Snake Integrity
        const snakeValid = this.snake.body.length >= 1 && 
                          this.snake.direction && 
                          this.snake.nextDirection;
        results.push({ name: 'Snake Integrity', pass: snakeValid, details: `Snake has ${this.snake.body.length} segments` });
        
        // Task 4: Food Spawning
        const foodValid = this.food && 
                         this.food.x >= 0 && 
                         this.food.x < (GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.CELL_SIZE) &&
                         this.food.y >= 0 && 
                         this.food.y < (GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.CELL_SIZE);
        results.push({ name: 'Food Position', pass: foodValid, details: `Food at (${this.food.x}, ${this.food.y})` });
        
        // Task 5: Navigation Link
        const backLink = document.querySelector('a[href*="../index.html"]');
        results.push({ name: 'Navigation Link', pass: !!backLink, details: 'Back to index navigation present' });
        
        // Task 6: License Header
        const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
        results.push({ name: 'License Header', pass: hasLicense, details: 'MIT license header in HTML' });
        
        // Task 7: Language Consistency  
        const htmlElement = document.documentElement;
        const isSpanish = htmlElement.getAttribute('lang') === 'es';
        results.push({ name: 'Language Consistency', pass: isSpanish, details: `HTML lang="${htmlElement.getAttribute('lang')}"` });
        
        // Task 7: Game State Validation
        const validStates = ['isRunning', 'isPaused', 'score', 'level', 'speed'];
        const stateValid = validStates.every(state => Object.prototype.hasOwnProperty.call(this.gameState, state));
        results.push({ name: 'Game State', pass: stateValid, details: 'All required game state properties present' });
        
        // Task 8: Event Listeners
        const listenerCheck = document.querySelector('#startBtn') && 
                             document.querySelector('#restartBtn') && 
                             document.querySelector('#pauseBtn');
        results.push({ name: 'UI Elements', pass: !!listenerCheck, details: 'All control buttons present' });
        
        // Display results
        console.table(results);
        
        const passCount = results.filter(r => r.pass).length;
        const totalTests = results.length;
        const auditPassed = passCount === totalTests;
        
        console.log(`🎯 Auditoría Snake: ${passCount}/${totalTests} tests PASSED`);
        
        if (auditPassed) {
            console.log('✅ Snake Retro - AUDITORÍA COMPLETA EXITOSA');
        } else {
            console.warn('⚠️ Snake Retro - AUDITORÍA FALLÓ - Revisar tests marcados como FAIL');
        }
        
        return { passed: auditPassed, results, score: `${passCount}/${totalTests}` };
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia del juego
    const game = new SnakeGame();
    
    // Hacer el juego accesible globalmente para debugging
    window.snakeGame = game;
    
    // Ejecutar auditoría en modo desarrollo
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.log('🔍 Modo desarrollo detectado - ejecutando auditoría...');
        window.runAudit = game.runAuditTasks.bind(game);
        setTimeout(() => game.runAuditTasks(), 1000);
    }
    
    console.log('🐍 Snake Retro - Edición GG cargado exitosamente!');
    console.log('Desarrollado por GG - 2025');
});

// ===== UTILIDADES ADICIONALES =====
class GameUtils {
    static getRandomColor() {
        const colors = ['#ff0040', '#00ff00', '#ffff00', '#ff8000', '#8000ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static calculateDistance(point1, point2) {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.y - point1.y, 2)
        );
    }

    static formatScore(score) {
        return score.toString().padStart(6, '0');
    }
}

// ===== SISTEMA DE ACHIEVEMENTS (OPCIONAL) =====
class AchievementSystem {
    constructor() {
        this.achievements = {
            firstFood: { name: 'Primera Comida', description: 'Come tu primera comida', unlocked: false },
            speedDemon: { name: 'Demonio de Velocidad', description: 'Alcanza el nivel 5', unlocked: false },
            centurion: { name: 'Centurión', description: 'Consigue 100 puntos', unlocked: false },
            snake50: { name: 'Serpiente Gigante', description: 'Alcanza una longitud de 50', unlocked: false }
        };
    }

    checkAchievements(/* gameState, snakeLength */) {
        // Implementar lógica de achievements aquí
        // Esta es una funcionalidad opcional para futuras mejoras
    }
}

// Exportar para uso en módulos (si es necesario)
/* global module */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeGame, GameUtils, AchievementSystem };
}
