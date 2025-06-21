# 🎯 AI4Devs Retro Games - Technical Development Guide

## 📋 Resumen Técnico Completo

Esta guía técnica documenta todos los principios, patrones y estándares establecidos en la colección **AI4Devs Retro Web Games** para asegurar consistencia y calidad en futuros desarrollos.

**⚠️ IMPORTANTE**: Siempre ejecuta el checklist de QA antes de crear un Pull Request. Todas las verificaciones deben mostrar ✅ PASS.

---

## 🛡️ QA & Audit Guidelines - ALWAYS RUN BEFORE PR

### Pre-Development Setup
1. **Clone QA framework** from `.github/copilot-instructions.md`
2. **Implement `runAuditTasks()`** method in main game class
3. **Expose `window.runAudit()`** for console testing
4. **Auto-run audits** on localhost initialization

### Development Workflow
1. **Code**: Implement feature following architectural patterns
2. **Test**: Run `window.runAudit()` in browser console
3. **Fix**: Address any ❌ FAIL results before proceeding
4. **Verify**: Ensure all checks show ✅ PASS status
5. **Document**: Update prompts.md with changes

### Pre-PR Checklist
- [ ] All QA audit tasks return ✅ PASS
- [ ] No console errors during gameplay
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] MIT license headers present in all files
- [ ] Navigation links functional
- [ ] Performance targets met (60fps)

---

## 🏗️ General Guidelines

### 1. Estructura de Archivos Estándar

```
<nombre-juego>-GG/
├── index.html      # Punto de entrada HTML5 semántico
├── style.css       # Estilos retro con variables CSS
├── script.js       # Lógica del juego modular ES6+
├── prompts.md      # Documentación del proceso de desarrollo
├── README.md       # Descripción específica del juego
└── assets/         # Recursos multimedia (opcional)
    ├── images/     # Sprites, iconos, backgrounds
    ├── sounds/     # Efectos de sonido (opcional)
    └── fonts/      # Fuentes personalizadas (opcional)
```

### 2. Convenciones de Nomenclatura

- **Carpetas**: `nombre-juego-GG` (snake-GG, breakout-GG, fruit-catcher-GG)
- **Clases CSS**: `kebab-case` (.game-container, .neon-title)
- **Variables CSS**: `--kebab-case` (--primary-cyan, --bg-primary)
- **JavaScript**: `camelCase` para variables, `PascalCase` para clases
- **IDs HTML**: `camelCase` (gameCanvas, scoreDisplay)

---

## 🎨 Sistema de Diseño Visual

### Paleta de Colores Unificada

```css
:root {
  /* === Colores Principales === */
  --primary-cyan: #00ffff; /* Títulos, bordes, efectos neón */
  --primary-magenta: #ff00ff; /* Gradientes, acentos secundarios */
  --primary-yellow: #ffff00; /* Alertas, elementos de atención */

  /* === Colores Temáticos === */
  --accent-green: #00ff00; /* Snake theme, elementos de éxito */
  --accent-orange: #ff6600; /* Breakout theme, elementos de acción */
  --accent-red: #ff0040; /* Danger, game over, errores */

  /* === Backgrounds === */
  --bg-primary: #0a0a0f; /* Fondo principal oscuro */
  --bg-secondary: #1a1a2e; /* Fondo secundario para contraste */
  --bg-tertiary: #16213e; /* Fondo terciario para elementos */
  --bg-card: rgba(26, 26, 46, 0.8); /* Cards con transparencia */
  --bg-glass: rgba(0, 255, 255, 0.05); /* Efectos glassmorphism */

  /* === Gradientes === */
  --gradient-main: linear-gradient(
    135deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 100%
  );
  --gradient-neon: linear-gradient(
    45deg,
    var(--primary-cyan),
    var(--primary-magenta)
  );
  --gradient-snake: linear-gradient(
    135deg,
    var(--accent-green),
    var(--primary-cyan)
  );
  --gradient-breakout: linear-gradient(
    135deg,
    var(--accent-orange),
    var(--primary-magenta)
  );
  --gradient-fruit: linear-gradient(
    135deg,
    var(--primary-yellow),
    var(--accent-red)
  );
}
```

### Tipografía Retro

```css
:root {
  /* === Fuentes === */
  --font-main: 'Courier New', 'Monaco', 'Lucida Console', monospace;
  --font-weight-normal: 400;
  --font-weight-bold: 700;

  /* === Escalas de Tamaño === */
  --text-xs: 0.75rem; /* 12px - Texto pequeño, etiquetas */
  --text-sm: 0.875rem; /* 14px - Texto secundario */
  --text-base: 1rem; /* 16px - Texto base */
  --text-lg: 1.125rem; /* 18px - Subtítulos */
  --text-xl: 1.25rem; /* 20px - Títulos pequeños */
  --text-2xl: 1.5rem; /* 24px - Títulos medianos */
  --text-3xl: 1.875rem; /* 30px - Títulos grandes */
  --text-4xl: 2.25rem; /* 36px - Títulos principales */
  --text-5xl: 3rem; /* 48px - Títulos hero */
}
```

### Sistema de Espaciado

```css
:root {
  /* === Espaciado Consistente === */
  --space-1: 0.25rem; /* 4px - Espaciado mínimo */
  --space-2: 0.5rem; /* 8px - Espaciado pequeño */
  --space-3: 0.75rem; /* 12px - Espaciado medio */
  --space-4: 1rem; /* 16px - Espaciado base */
  --space-6: 1.5rem; /* 24px - Espaciado grande */
  --space-8: 2rem; /* 32px - Espaciado extra grande */
  --space-12: 3rem; /* 48px - Espaciado de sección */
  --space-16: 4rem; /* 64px - Espaciado de layout */
}
```

---

## 🔧 Patrones CSS Avanzados

### 1. Efectos Neón y Glow

```css
/* Texto con efecto neón */
.neon-text {
  color: var(--primary-cyan);
  text-shadow: 0 0 5px var(--primary-cyan), 0 0 10px var(--primary-cyan),
    0 0 15px var(--primary-cyan), 0 0 20px var(--primary-cyan);
  animation: neon-flicker 2s ease-in-out infinite alternate;
}

@keyframes neon-flicker {
  from {
    text-shadow: 0 0 5px var(--primary-cyan), 0 0 10px var(--primary-cyan);
  }
  to {
    text-shadow: 0 0 10px var(--primary-cyan), 0 0 20px var(--primary-cyan),
      0 0 30px var(--primary-cyan);
  }
}

/* Bordes con glow */
.glow-border {
  border: 2px solid var(--primary-cyan);
  box-shadow: 0 0 10px var(--primary-cyan), inset 0 0 10px rgba(0, 255, 255, 0.1);
}
```

### 2. Glassmorphism Cards

```css
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 3. Compatibilidad Cross-Browser

```css
/* Background con fallbacks para Safari */
body {
  /* Fallback sólido */
  background-color: #0a0a0f !important;
  /* Fallback gradiente básico */
  background: #0a0a0f;
  /* Prefijos para navegadores */
  background: -webkit-linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  background: -moz-linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  background: -o-linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  /* Estándar moderno */
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  /* Color scheme para mejor soporte */
  color-scheme: dark;
}

/* Texto gradiente con fallbacks */
.gradient-text {
  /* Fallback color */
  color: var(--primary-cyan);
  /* Gradiente */
  background: linear-gradient(
    45deg,
    var(--primary-cyan),
    var(--primary-magenta)
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-background-clip: text;
  -moz-text-fill-color: transparent;
}
```

---

## ⚙️ Arquitectura JavaScript

### 1. Estructura Modular Estándar

```javascript
/* ===================================================================
   CONFIGURACIÓN Y CONSTANTES GLOBALES
================================================================== */

const GAME_CONFIG = {
  // Canvas y dimensiones
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#0a0a0f',
  },

  // Rendimiento
  targetFPS: 60,
  deltaTimeThreshold: 1000 / 30, // Máximo 30ms entre frames

  // Controles
  controls: {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    pause: ['Space'],
    restart: ['KeyR', 'Enter'],
  },
};

/* ===================================================================
   CLASE PRINCIPAL DEL JUEGO
================================================================== */

class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Estados del juego
    this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
    this.score = 0;
    this.level = 1;
    this.lives = 3;

    // Control de tiempo
    this.lastTime = 0;
    this.deltaTime = 0;

    // Entidades del juego
    this.entities = [];
    this.particles = [];

    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindEvents();
    this.createEntities();
    this.gameLoop(0);
  }

  setupCanvas() {
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
    this.canvas.style.border = '2px solid var(--primary-cyan)';
  }

  bindEvents() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Touch events para móvil
    this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e));

    // Prevenir scroll en móvil
    document.addEventListener('touchmove', (e) => e.preventDefault(), {
      passive: false,
    });
  }

  gameLoop(currentTime) {
    // Calcular deltaTime
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Limitar deltaTime para evitar saltos grandes
    if (this.deltaTime > GAME_CONFIG.deltaTimeThreshold) {
      this.deltaTime = GAME_CONFIG.deltaTimeThreshold;
    }

    // Actualizar y renderizar
    if (this.gameState === 'PLAYING') {
      this.update(this.deltaTime);
    }
    this.render();

    // Continuar el loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // Actualizar entidades
    this.entities.forEach((entity) => {
      if (entity.update) entity.update(deltaTime);
    });

    // Actualizar partículas
    this.updateParticles(deltaTime);

    // Verificar colisiones
    this.checkCollisions();

    // Verificar condiciones de victoria/derrota
    this.checkGameConditions();
  }

  render() {
    // Limpiar canvas
    this.ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Renderizar según estado
    switch (this.gameState) {
      case 'MENU':
        this.renderMenu();
        break;
      case 'PLAYING':
      case 'PAUSED':
        this.renderGame();
        if (this.gameState === 'PAUSED') this.renderPauseOverlay();
        break;
      case 'GAME_OVER':
        this.renderGameOver();
        break;
    }
  }
}

/* ===================================================================
   CLASES DE ENTIDADES BASE
================================================================== */

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = { x: 0, y: 0 };
    this.color = '#FFFFFF';
    this.alive = true;
  }

  update(deltaTime) {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
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
      bottom: this.y + this.height,
    };
  }

  collidesWith(other) {
    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();

    return (
      bounds1.left < bounds2.right &&
      bounds1.right > bounds2.left &&
      bounds1.top < bounds2.bottom &&
      bounds1.bottom > bounds2.top
    );
  }
}

/* ===================================================================
   SISTEMA DE PARTÍCULAS
================================================================== */

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.velocity = options.velocity || { x: 0, y: 0 };
    this.life = options.life || 1.0;
    this.maxLife = this.life;
    this.color = options.color || '#FFFFFF';
    this.size = options.size || 2;
  }

  update(deltaTime) {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    this.life -= deltaTime / 1000; // Reducir vida

    return this.life > 0; // Retorna si la partícula sigue viva
  }

  render(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

/* ===================================================================
   INICIALIZACIÓN DEL JUEGO
================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine('gameCanvas');

  // Exponer game globalmente para debugging
  window.game = game;
});
```

### 2. Patrones de Manejo de Estado

```javascript
// Estado del juego con máquina de estados
class GameStateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
  }

  addState(name, state) {
    this.states.set(name, state);
  }

  changeState(stateName, ...args) {
    if (this.currentState) {
      this.currentState.exit();
      this.previousState = this.currentState;
    }

    this.currentState = this.states.get(stateName);
    if (this.currentState) {
      this.currentState.enter(...args);
    }
  }

  update(deltaTime) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(deltaTime);
    }
  }

  render(ctx) {
    if (this.currentState && this.currentState.render) {
      this.currentState.render(ctx);
    }
  }
}

// Ejemplo de estado
class MenuState {
  enter() {
    console.log('Entering menu state');
  }

  update(deltaTime) {
    // Lógica del menú
  }

  render(ctx) {
    // Renderizado del menú
  }

  exit() {
    console.log('Exiting menu state');
  }
}
```

---

## 🎮 Patrones de Juego Específicos

### 1. Sistema de Colisiones

```javascript
class CollisionSystem {
  static checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  static checkCircle(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }

  static getCollisionDirection(rect1, rect2) {
    const centerX1 = rect1.x + rect1.width / 2;
    const centerY1 = rect1.y + rect1.height / 2;
    const centerX2 = rect2.x + rect2.width / 2;
    const centerY2 = rect2.y + rect2.height / 2;

    const dx = centerX2 - centerX1;
    const dy = centerY2 - centerY1;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
}
```

### 2. Sistema de Input Unificado

```javascript
class InputManager {
  constructor() {
    this.keys = new Map();
    this.previousKeys = new Map();
    this.touches = new Map();

    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
    });

    document.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });

    // Touch events
    document.addEventListener('touchstart', (e) => this.handleTouch(e));
    document.addEventListener('touchend', (e) => this.handleTouch(e));
  }

  isKeyPressed(keyCode) {
    return this.keys.get(keyCode) || false;
  }

  isKeyJustPressed(keyCode) {
    return this.isKeyPressed(keyCode) && !this.previousKeys.get(keyCode);
  }

  update() {
    // Actualizar estado previo de teclas
    this.keys.forEach((value, key) => {
      this.previousKeys.set(key, value);
    });
  }

  // Mapeo de controles según configuración
  getAction(action) {
    const keys = GAME_CONFIG.controls[action] || [];
    return keys.some((key) => this.isKeyPressed(key));
  }

  getActionJustPressed(action) {
    const keys = GAME_CONFIG.controls[action] || [];
    return keys.some((key) => this.isKeyJustPressed(key));
  }
}
```

---

## � PAC-MAN: Implementación Avanzada de IA y Arquitectura

### Introducción

El juego Pac-Man representa la implementación más compleja del proyecto AI4Devs Retro Games, incluyendo:
- **IA de fantasmas auténtica** con 4 personalidades distintas
- **Algoritmo de búsqueda de caminos** A* para navegación inteligente
- **Sistema de estados** complejo con múltiples modos de juego
- **Optimización de rendimiento** para mantener 60fps constantes
- **Audio procedural** con Web Audio API

### 1. Arquitectura de Clases Principal

```javascript
// Clase principal del motor de juego
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.maze = new MazeManager();
    this.player = new PacManPlayer(9, 15); // Posición inicial
    this.ghosts = this.initializeGhosts();
    this.audio = new AudioManager();
    this.input = new InputManager();
    this.ui = new GameUI();
    this.gameState = 'MENU';
  }
}

// Sistema de vectores 2D para posicionamiento preciso
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  add(other) { return new Vector2D(this.x + other.x, this.y + other.y); }
  multiply(scalar) { return new Vector2D(this.x * scalar, this.y * scalar); }
  distance(other) { 
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2); 
  }
}
```

### 2. Sistema de IA de Fantasmas

#### Personalidades Únicas

```javascript
class GhostAI {
  constructor(type, startPosition, maze) {
    this.type = type; // 'BLINKY', 'PINKY', 'INKY', 'CLYDE'
    this.position = startPosition;
    this.mode = 'SCATTER'; // SCATTER, CHASE, FLEE, EATEN
    this.pathfinder = new Pathfinder(maze);
    this.modeTimer = 0;
    this.cornerTarget = this.getCornerTarget(type);
  }

  // Cada fantasma tiene comportamiento único
  calculateTarget(pacman, blinky = null) {
    switch (this.type) {
      case 'BLINKY': // Persecución directa
        return this.mode === 'CHASE' ? pacman.position : this.cornerTarget;
        
      case 'PINKY': // Emboscada: 4 casillas adelante
        const direction = pacman.direction;
        const offset = direction.multiply(4);
        return this.mode === 'CHASE' ? 
          pacman.position.add(offset) : this.cornerTarget;
          
      case 'INKY': // Comportamiento complejo basado en Blinky
        if (this.mode === 'CHASE' && blinky) {
          const pacmanAhead = pacman.position.add(pacman.direction.multiply(2));
          const vector = pacmanAhead.subtract(blinky.position);
          return blinky.position.add(vector.multiply(2));
        }
        return this.cornerTarget;
        
      case 'CLYDE': // Patrullo/huida según distancia
        const distance = this.position.distance(pacman.position);
        return (this.mode === 'CHASE' && distance > 8) ? 
          pacman.position : this.cornerTarget;
    }
  }
}
```

#### Algoritmo de Búsqueda de Caminos (A*)

```javascript
class Pathfinder {
  static findPath(start, goal, maze) {
    const openSet = [start];
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    gScore.set(start.toString(), 0);
    fScore.set(start.toString(), this.heuristic(start, goal));

    while (openSet.length > 0) {
      // Nodo con menor fScore
      const current = openSet.reduce((a, b) => 
        fScore.get(a.toString()) < fScore.get(b.toString()) ? a : b
      );

      if (current.equals(goal)) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.splice(openSet.indexOf(current), 1);
      closedSet.add(current.toString());

      // Procesar vecinos válidos
      for (const neighbor of this.getValidNeighbors(current, maze)) {
        if (closedSet.has(neighbor.toString())) continue;

        const tentativeGScore = gScore.get(current.toString()) + 1;

        if (!openSet.some(node => node.equals(neighbor))) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= gScore.get(neighbor.toString())) {
          continue;
        }

        cameFrom.set(neighbor.toString(), current);
        gScore.set(neighbor.toString(), tentativeGScore);
        fScore.set(neighbor.toString(), 
          tentativeGScore + this.heuristic(neighbor, goal));
      }
    }

    return []; // No se encontró camino
  }

  // Distancia Manhattan como heurística
  static heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
}
```

### 3. Sistema de Audio Procedural

```javascript
class AudioManager {
  constructor() {
    this.audioContext = new (AudioContext || webkitAudioContext)();
    this.masterVolume = 1.0;
    this.sounds = new Map();
    this.activeLoops = new Map();
  }

  // Generación procedural de sonidos retro
  createRetroTone(frequency, duration, type = 'square') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, 
      this.audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return oscillator;
  }

  // Efectos específicos del juego
  playPelletSound() {
    this.createRetroTone(800, 0.1, 'sine');
  }

  playPowerPelletSound() {
    this.createRetroTone(400, 0.2, 'sawtooth');
  }

  playGhostEatenSound() {
    this.createRetroTone(1000, 0.3, 'square');
  }
}
```

### 4. Optimización de Rendimiento

#### Object Pooling para Pellets

```javascript
class PelletPool {
  constructor(size = 100) {
    this.pool = [];
    this.active = [];
    
    // Pre-poblar el pool
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createPellet());
    }
  }

  acquire(x, y, isPowerPellet = false) {
    const pellet = this.pool.pop() || this.createPellet();
    pellet.reset(x, y, isPowerPellet);
    this.active.push(pellet);
    return pellet;
  }

  release(pellet) {
    const index = this.active.indexOf(pellet);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(pellet);
    }
  }
}
```

#### Renderizado Optimizado

```javascript
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dirtyRegions = [];
    
    // Canvas off-screen para maze estático
    this.staticCanvas = document.createElement('canvas');
    this.staticCtx = this.staticCanvas.getContext('2d');
    this.mazeRendered = false;
  }

  // Solo renderizar regiones que cambiaron
  render(gameState) {
    if (!this.mazeRendered) {
      this.renderStaticMaze();
      this.mazeRendered = true;
    }

    // Limpiar solo regiones sucias
    this.dirtyRegions.forEach(region => {
      this.ctx.clearRect(region.x, region.y, region.width, region.height);
      this.ctx.drawImage(this.staticCanvas, 
        region.x, region.y, region.width, region.height,
        region.x, region.y, region.width, region.height);
    });

    this.renderDynamicElements(gameState);
    this.dirtyRegions = [];
  }
}
```

---

## 🛡️ Always run the QA checklist before PR

Antes de crear un Pull Request, ejecuta siempre el checklist de QA descrito en `/.github/copilot-instructions.md`. Todas las verificaciones deben mostrar ✅ PASS para garantizar la calidad y consistencia del proyecto.

### Quick Audit Command
```javascript
// In browser console on localhost
window.runAudit()
```

## 🎮 Game-Specific Guidelines

Esta sección contiene notas técnicas, patrones y decisiones de arquitectura específicas para cada juego.

### Pac-Man GG
- **IA de Fantasmas**: La IA se basa en un sistema de estados (SCATTER, CHASE, FLEE) con objetivos dinámicos. Blinky persigue directamente, Pinky anticipa el movimiento, Inky usa una lógica vectorial compleja y Clyde alterna entre perseguir y huir.
- **Pathfinding**: El movimiento de los fantasmas se basa en una heurística de distancia simple en cada intersección para determinar la mejor ruta hacia su objetivo, evitando retroceder. No utiliza un algoritmo A* completo para mantener la lógica clásica.
- **Renderizado**: El juego utiliza un único bucle `requestAnimationFrame` que llama a `game.update()` y `game.render()`. No hay llamadas de renderizado duplicadas, garantizando un rendimiento óptimo.
- **Auditoría**: Ejecuta `window.runAudit()` en la consola para verificar el estado del juego en tiempo real.
- **AI Timing**: SCATTER mode dura 7 segundos (420 frames), CHASE mode dura 20 segundos (1200 frames)
- **Ghost Release**: Blinky sale inmediatamente (0s), Pinky (2s), Inky (4s), Clyde (6s)
- **Start Control**: Solo ENTER inicia el juego, SPACE es únicamente para pausar/reanudar

### Snake GG
- **Movimiento**: Basado en una grid estricta de 20x20px. La serpiente siempre se alinea a la grid.
- **Dificultad**: La velocidad aumenta progresivamente según la puntuación, haciendo el juego más desafiante.

### Breakout GG
- **Física**: La pelota tiene una física de rebote simple pero efectiva. El ángulo de rebote en la paleta depende del punto de impacto.

### Fruit Catcher GG
- **Persistencia**: El high score se guarda en `localStorage` para persistir entre sesiones de juego.
