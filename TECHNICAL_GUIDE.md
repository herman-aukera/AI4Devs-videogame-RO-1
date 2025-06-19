# 🎯 AI4Devs Retro Games - Technical Development Guide

## 📋 Resumen Técnico Completo

Esta guía técnica documenta todos los principios, patrones y estándares establecidos en la colección **AI4Devs Retro Web Games** para asegurar consistencia y calidad en futuros desarrollos.

---

## 🏗️ Arquitectura de Código

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

## 📱 Diseño Responsive y Móvil

### 1. Canvas Responsive

```javascript
class ResponsiveCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.originalWidth = canvas.width;
    this.originalHeight = canvas.height;
    this.scale = 1;

    this.setupResponsive();
    window.addEventListener('resize', () => this.resize());
  }

  setupResponsive() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    const scaleX = rect.width / this.originalWidth;
    const scaleY = rect.height / this.originalHeight;
    this.scale = Math.min(scaleX, scaleY, 1);

    this.canvas.style.width = this.originalWidth * this.scale + 'px';
    this.canvas.style.height = this.originalHeight * this.scale + 'px';
  }

  resize() {
    this.setupResponsive();
  }

  getMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / this.scale,
      y: (event.clientY - rect.top) / this.scale,
    };
  }
}
```

### 2. Media Queries CSS

```css
/* ===================================================================
   RESPONSIVE DESIGN
================================================================== */

/* Tablet */
@media (max-width: 1024px) {
  .game-container {
    padding: var(--space-4);
  }

  .neon-title {
    font-size: var(--text-3xl);
  }

  canvas {
    max-width: 90vw;
    height: auto;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .game-container {
    padding: var(--space-2);
  }

  .game-header h1 {
    font-size: var(--text-2xl);
  }

  .game-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* Controles táctiles */
  .touch-controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
    padding: var(--space-4);
  }

  .touch-button {
    background: var(--bg-card);
    border: 2px solid var(--primary-cyan);
    color: var(--primary-cyan);
    padding: var(--space-3);
    border-radius: 8px;
    font-size: var(--text-lg);
    touch-action: manipulation;
  }
}

/* Mobile Small */
@media (max-width: 480px) {
  .game-arcade {
    padding: var(--space-2) var(--space-1);
  }

  canvas {
    max-width: 95vw;
  }

  .back-button {
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
  }
}
```

---

## 🔧 Herramientas de Desarrollo

### 1. Configuración VS Code

```json
{
  "github.copilot.enable": {
    "*": true,
    "html": true,
    "css": true,
    "javascript": true,
    "markdown": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "liveServer.settings.port": 5500,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### 2. Debugging y Testing

```javascript
// Utilidades de debugging
class Debug {
  static enabled = true;

  static log(message, category = 'INFO') {
    if (this.enabled) {
      console.log(`[${category}] ${message}`);
    }
  }

  static drawBounds(ctx, entity) {
    if (this.enabled) {
      ctx.strokeStyle = '#FF0000';
      ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
    }
  }

  static showFPS(ctx, fps) {
    if (this.enabled) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px monospace';
      ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 30);
    }
  }
}

// Performance monitoring
class Performance {
  constructor() {
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.fps = 0;
  }

  update(currentTime) {
    this.frameCount++;

    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
    }
  }

  getFPS() {
    return this.fps;
  }
}
```

---

## 📋 Checklist de Calidad

### ✅ HTML5

- [ ] DOCTYPE correcto
- [ ] Meta tags completos (viewport, description, theme-color)
- [ ] Elementos semánticos (main, section, nav, header)
- [ ] Navegación de retorno al índice
- [ ] Canvas con ID único
- [ ] Atributos de accesibilidad

### ✅ CSS3

- [ ] Variables CSS definidas
- [ ] Fallbacks para Safari
- [ ] Media queries responsive
- [ ] Efectos neón implementados
- [ ] Glassmorphism en cards
- [ ] Animaciones smooth
- [ ] Prefijos de navegador

### ✅ JavaScript ES6+

- [ ] Clases para entidades
- [ ] requestAnimationFrame para game loop
- [ ] Sistema de colisiones
- [ ] Manejo de input unificado
- [ ] Estados del juego
- [ ] Control de performance
- [ ] Comentarios en español

### ✅ Experiencia de Usuario

- [ ] Controles responsivos
- [ ] Feedback visual inmediato
- [ ] Efectos de partículas
- [ ] Sistema de puntuación
- [ ] Pause/resume funcional
- [ ] Game over y restart
- [ ] Compatible móvil

### ✅ Documentación

- [ ] prompts.md completo
- [ ] README.md específico
- [ ] Comentarios en código
- [ ] Instrucciones de juego
- [ ] Controles documentados

### ✅ Testing Cross-Browser

- [ ] Chrome (desktop/mobile)
- [ ] Firefox (desktop/mobile)
- [ ] Safari (desktop/mobile)
- [ ] Edge (desktop)
- [ ] Performance en dispositivos low-end

---

## 🚀 Proceso de Desarrollo Recomendado

### Fase 1: Planificación (30 min)

1. Definir mecánicas core del juego
2. Crear wireframes básicos
3. Establecer sistema de puntuación
4. Planificar estados del juego

### Fase 2: Estructura Base (45 min)

1. Crear archivo HTML semántico
2. Configurar CSS con variables
3. Implementar clase GameEngine básica
4. Configurar canvas responsive

### Fase 3: Mecánicas Core (90 min)

1. Implementar entidades principales
2. Sistema de colisiones
3. Manejo de input
4. Game loop básico

### Fase 4: Polish y Efectos (60 min)

1. Efectos visuales y partículas
2. Sonidos (opcional)
3. Animaciones smooth
4. Feedback visual

### Fase 5: Testing y Documentación (45 min)

1. Testing cross-browser
2. Optimización de performance
3. Documentación completa
4. Preparación para PR

---

## 🎯 Siguientes Pasos para Fruit Catcher

Aplicando todos estos principios, el próximo juego **Fruit Catcher** debería incluir:

1. **Mecánicas específicas**:

   - Frutas cayendo con física realista
   - Cesta del jugador con movimiento horizontal
   - Sistema de puntuación por tipo de fruta
   - Power-ups especiales
   - Incremento de dificultad temporal

2. **Implementación técnica**:

   - Clase `FruitCatcher` extendiendo `GameEngine`
   - Clase `Fruit` con diferentes tipos y valores
   - Clase `Basket` para el jugador
   - Sistema de spawning aleatorio
   - Detección de colisiones cesta-fruta

3. **Estética visual**:
   - Tema amarillo/rojo (--gradient-fruit)
   - Efectos de captura con partículas
   - Animaciones de caída suaves
   - UI de tiempo y puntuación

Este documento asegura que todos los futuros juegos mantengan la misma calidad, consistencia visual y arquitectura técnica establecida en la colección AI4Devs Retro Games. 🎮✨
