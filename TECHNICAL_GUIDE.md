# 🎯 AI4Devs Retro Games - Ultimate Technical Guide

## 📋 Overview

This comprehensive technical guide provides the foundation for creating professional-grade retro web games. It includes advanced patterns, performance optimization techniques, and complete implementation examples for building authentic arcade experiences.

**⚠️ CRITICAL**: All games must pass the comprehensive QA audit checklist before being marked as production-ready.

---

## 🛡️ Enhanced QA & Audit Framework (MANDATORY)

### TDD Implementation Checklist
- [ ] `runAuditTasks()` method implemented in main game class
- [ ] `window.runAudit()` exposed for console testing  
- [ ] Auto-audit execution on localhost initialization
- [ ] Critical vs non-critical test separation
- [ ] Performance monitoring integration
- [ ] Cross-browser compatibility validation
- [ ] Mobile responsiveness verification
- [ ] Accessibility compliance checking

### Universal Quality Gates
Every game must achieve:
```javascript
// Minimum quality thresholds
const QUALITY_GATES = {
  frameRate: 50,        // Minimum FPS
  loadTime: 3000,       // Maximum load time (ms)
  touchTargets: 44,     // Minimum touch target size (px)
  contrastRatio: 4.5,   // WCAG AA compliance
  errorCount: 0,        // Zero console errors in production
};
```

### Advanced Audit Implementation
```javascript
class AdvancedGameAudit {
  constructor(game) {
    this.game = game;
    this.performanceMonitor = new PerformanceMonitor();
    this.accessibilityChecker = new AccessibilityChecker();
  }
  
  async runComprehensiveAudit() {
    const results = {
      structure: this.auditStructure(),
      performance: await this.auditPerformance(),
      accessibility: this.auditAccessibility(),
      mobile: this.auditMobileSupport(),
      retro: this.auditRetroAuthenticity()
    };
    
    return this.generateReport(results);
  }
  
  auditPerformance() {
    return {
      frameRate: this.performanceMonitor.getAverageFrameRate(),
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
      renderTime: this.performanceMonitor.getAverageRenderTime(),
      inputLatency: this.performanceMonitor.getInputLatency()
    };
  }
  
  auditRetroAuthenticity() {
    return {
      pixelFonts: this.checkPixelFonts(),
      neonColors: this.checkNeonColors(),
      sharpMovement: this.checkPixelPerfectMovement(),
      audioStyle: this.check8BitAudio()
    };
  }
}
```

---

## 🏗️ Advanced Architecture Patterns

### 1. Modular Game Engine Architecture

```javascript
// Core engine with plugin system
class RetroGameEngine {
  constructor(config) {
    this.canvas = document.getElementById(config.canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.plugins = new Map();
    this.systems = new Map();
    
    this.initializeSystems();
    this.setupCanvas();
  }
  
  initializeSystems() {
    this.systems.set('input', new InputSystem(this));
    this.systems.set('audio', new AudioSystem(this));
    this.systems.set('collision', new CollisionSystem(this));
    this.systems.set('particles', new ParticleSystem(this));
    this.systems.set('state', new StateManager(this));
  }
  
  addPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    plugin.initialize(this);
  }
  
  update(deltaTime) {
    this.systems.forEach(system => system.update(deltaTime));
    this.plugins.forEach(plugin => plugin.update(deltaTime));
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.systems.forEach(system => system.render(this.ctx));
    this.plugins.forEach(plugin => plugin.render(this.ctx));
  }
}
```

### 2. Advanced State Management System

```javascript
class StateManager {
  constructor(engine) {
    this.engine = engine;
    this.states = new Map();
    this.currentState = null;
    this.stateStack = [];
  }
  
  addState(name, state) {
    this.states.set(name, state);
    state.setEngine(this.engine);
  }
  
  changeState(name, data = {}) {
    if (this.currentState) {
      this.currentState.exit();
    }
    
    this.currentState = this.states.get(name);
    if (this.currentState) {
      this.currentState.enter(data);
    }
  }
  
  pushState(name, data = {}) {
    if (this.currentState) {
      this.stateStack.push(this.currentState);
      this.currentState.pause();
    }
    
    this.currentState = this.states.get(name);
    if (this.currentState) {
      this.currentState.enter(data);
    }
  }
  
  popState() {
    if (this.currentState) {
      this.currentState.exit();
    }
    
    this.currentState = this.stateStack.pop();
    if (this.currentState) {
      this.currentState.resume();
    }
  }
}

// Base state class
class GameState {
  constructor() {
    this.engine = null;
  }
  
  setEngine(engine) {
    this.engine = engine;
  }
  
  enter(data) {}
  exit() {}
  pause() {}
  resume() {}
  update(deltaTime) {}
  render(ctx) {}
  handleInput(input) {}
}
```

### 3. Performance-Optimized Entity System

```javascript
class EntityManager {
  constructor() {
    this.entities = [];
    this.entityPool = new Map();
    this.components = new Map();
    this.systems = [];
  }
  
  createEntity(type, data = {}) {
    let entity = this.getFromPool(type);
    if (!entity) {
      entity = new (this.getEntityClass(type))();
    }
    
    entity.initialize(data);
    this.entities.push(entity);
    return entity;
  }
  
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      this.returnToPool(entity);
    }
  }
  
  getFromPool(type) {
    const pool = this.entityPool.get(type);
    return pool && pool.length > 0 ? pool.pop() : null;
  }
  
  returnToPool(entity) {
    const type = entity.constructor.name;
    if (!this.entityPool.has(type)) {
      this.entityPool.set(type, []);
    }
    
    entity.reset();
    this.entityPool.get(type).push(entity);
  }
}
```

---

## 🎨 Advanced Retro Visual Effects

### 1. CRT Screen Effects

```javascript
class CRTEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scanlineOpacity = 0.1;
    this.pixelDensity = 2;
  }
  
  applyScanlines() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      for (let x = 0; x < this.canvas.width; x++) {
        const index = (y * this.canvas.width + x) * 4;
        data[index] *= (1 - this.scanlineOpacity);     // Red
        data[index + 1] *= (1 - this.scanlineOpacity); // Green  
        data[index + 2] *= (1 - this.scanlineOpacity); // Blue
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  applyPhosphorGlow() {
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.filter = 'blur(1px)';
    this.ctx.globalAlpha = 0.3;
    
    // Redraw with glow effect
    this.ctx.drawImage(this.canvas, 0, 0);
    
    // Reset composite mode
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.filter = 'none';
    this.ctx.globalAlpha = 1;
  }
}
```

### 2. Neon Text Effects

```javascript
class NeonTextRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  drawNeonText(text, x, y, options = {}) {
    const {
      fontSize = 24,
      color = '#00ffff',
      glowColor = '#00ffff',
      glowSize = 10,
      font = 'Courier New'
    } = options;
    
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${font}`;
    this.ctx.textAlign = 'center';
    
    // Outer glow
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = glowSize;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    
    // Inner glow
    this.ctx.shadowBlur = glowSize / 2;
    this.ctx.fillText(text, x, y);
    
    // Core text
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, x, y);
    
    this.ctx.restore();
  }
  
  drawGlitchText(text, x, y, intensity = 0.1) {
    const offsets = [
      { x: Math.random() * intensity * 4 - 2, y: 0, color: '#ff0040' },
      { x: Math.random() * intensity * 4 - 2, y: 0, color: '#00ffff' },
      { x: 0, y: 0, color: '#ffffff' }
    ];
    
    offsets.forEach((offset, i) => {
      this.ctx.fillStyle = offset.color;
      this.ctx.globalAlpha = i === 2 ? 1 : 0.7;
      this.ctx.fillText(text, x + offset.x, y + offset.y);
    });
    
    this.ctx.globalAlpha = 1;
  }
}
```

---

## 🔊 Advanced Audio System

### 1. Procedural 8-bit Sound Generation

```javascript
class ChiptuneSynthesizer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
  }
  
  playTone(frequency, duration, waveform = 'square') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // ADSR envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1); // Decay
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration); // Release
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  playArpeggio(notes, tempo = 120) {
    const noteDuration = 60 / tempo / 4; // 16th notes
    
    notes.forEach((note, index) => {
      const startTime = this.audioContext.currentTime + (index * noteDuration);
      this.playToneAtTime(note.frequency, noteDuration, startTime, note.waveform);
    });
  }
  
  createNoiseBuffer(duration, type = 'white') {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'white') {
        output[i] = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        output[i] = (Math.random() * 2 - 1) * Math.pow(0.5, i / bufferSize);
      }
    }
    
    return buffer;
  }
}
```

### 2. Dynamic Music System

```javascript
class DynamicMusicManager {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.tracks = new Map();
    this.currentTrack = null;
    this.crossfadeDuration = 2.0;
  }
  
  addTrack(name, config) {
    this.tracks.set(name, {
      bpm: config.bpm || 120,
      patterns: config.patterns || [],
      instruments: config.instruments || [],
      intensity: config.intensity || 1
    });
  }
  
  playTrack(name, fadeIn = true) {
    const track = this.tracks.get(name);
    if (!track) return;
    
    if (this.currentTrack && fadeIn) {
      this.crossfade(this.currentTrack, track);
    } else {
      this.startTrack(track);
    }
    
    this.currentTrack = track;
  }
  
  adaptToGameState(gameState) {
    const intensityMap = {
      'menu': 0.3,
      'playing': 1.0,
      'danger': 1.5,
      'gameOver': 0.5
    };
    
    const targetIntensity = intensityMap[gameState] || 1.0;
    this.adjustIntensity(targetIntensity);
  }
}
```

---

## 📱 Advanced Mobile Optimization

### 1. Responsive Canvas System

```javascript
class ResponsiveCanvas {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.baseWidth = options.baseWidth || 800;
    this.baseHeight = options.baseHeight || 600;
    this.maintainAspectRatio = options.maintainAspectRatio !== false;
    
    this.setupResponsiveness();
    this.setupHighDPI();
  }
  
  setupResponsiveness() {
    const resizeHandler = () => {
      const container = this.canvas.parentElement;
      const containerRect = container.getBoundingClientRect();
      
      let width = containerRect.width;
      let height = containerRect.height;
      
      if (this.maintainAspectRatio) {
        const aspectRatio = this.baseWidth / this.baseHeight;
        
        if (width / height > aspectRatio) {
          width = height * aspectRatio;
        } else {
          height = width / aspectRatio;
        }
      }
      
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      
      this.updateCanvasSize();
    };
    
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeHandler, 100);
    });
    
    resizeHandler();
  }
  
  setupHighDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
  }
  
  getScale() {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: this.canvas.width / rect.width,
      y: this.canvas.height / rect.height
    };
  }
}
```

### 2. Advanced Touch Controls

```javascript
class AdvancedTouchControls {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.touches = new Map();
    this.gestures = new GestureRecognizer();
    
    this.setupTouchEvents();
    this.setupVirtualControls();
  }
  
  setupTouchEvents() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const pos = this.getTouchPosition(touch);
      this.touches.set(touch.identifier, {
        startPos: pos,
        currentPos: pos,
        startTime: performance.now()
      });
      
      this.detectVirtualControlTouch(pos);
    });
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (touchData) {
        touchData.currentPos = this.getTouchPosition(touch);
        this.detectSwipeGesture(touchData);
      }
    });
  }
  
  detectSwipeGesture(touchData) {
    const dx = touchData.currentPos.x - touchData.startPos.x;
    const dy = touchData.currentPos.y - touchData.startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const time = performance.now() - touchData.startTime;
    
    if (distance > 50 && time < 300) {
      const angle = Math.atan2(dy, dx);
      const direction = this.getSwipeDirection(angle);
      this.game.handleSwipe(direction);
    }
  }
  
  setupVirtualControls() {
    if (this.isMobileDevice()) {
      this.createVirtualDPad();
      this.createActionButtons();
    }
  }
  
  createVirtualDPad() {
    const dpad = document.createElement('div');
    dpad.className = 'virtual-dpad';
    dpad.innerHTML = `
      <button class="dpad-up" data-direction="up">↑</button>
      <button class="dpad-down" data-direction="down">↓</button>
      <button class="dpad-left" data-direction="left">←</button>
      <button class="dpad-right" data-direction="right">→</button>
    `;
    
    document.body.appendChild(dpad);
    
    dpad.addEventListener('touchstart', (e) => {
      const direction = e.target.dataset.direction;
      if (direction) {
        this.game.handleInput(direction, true);
      }
    });
  }
}
```

---

## ♿ Accessibility Implementation

### 1. Screen Reader Support

```javascript
class AccessibilityManager {
  constructor(game) {
    this.game = game;
    this.announcer = this.createAnnouncer();
    this.setupKeyboardNavigation();
    this.setupGameStateAnnouncements();
  }
  
  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcer);
    return announcer;
  }
  
  announce(message, priority = 'polite') {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivation(e);
      }
    });
  }
  
  announceGameState(state, details = {}) {
    const messages = {
      'gameStart': 'Game started. Use arrow keys to play.',
      'score': `Score: ${details.score}`,
      'levelUp': `Level ${details.level} reached!`,
      'gameOver': `Game over. Final score: ${details.finalScore}`,
      'paused': 'Game paused. Press spacebar to resume.',
      'resumed': 'Game resumed.'
    };
    
    const message = messages[state];
    if (message) {
      this.announce(message);
    }
  }
}
```

### 2. High Contrast Mode

```javascript
class HighContrastMode {
  constructor() {
    this.isEnabled = this.detectHighContrastPreference();
    this.setupToggle();
  }
  
  detectHighContrastPreference() {
    return window.matchMedia('(prefers-contrast: high)').matches ||
           localStorage.getItem('highContrast') === 'true';
  }
  
  enable() {
    document.body.classList.add('high-contrast');
    localStorage.setItem('highContrast', 'true');
    this.isEnabled = true;
  }
  
  disable() {
    document.body.classList.remove('high-contrast');
    localStorage.setItem('highContrast', 'false');
    this.isEnabled = false;
  }
  
  getColors() {
    if (this.isEnabled) {
      return {
        background: '#000000',
        foreground: '#ffffff',
        accent: '#ffff00',
        danger: '#ff0000'
      };
    }
    
    return {
      background: '#0a0a0f',
      foreground: '#00ffff',
      accent: '#ff00ff',
      danger: '#ff0040'
    };
  }
}
```

---

## 🚀 Performance Monitoring & Optimization

### 1. Advanced Performance Monitor

```javascript
class PerformanceMonitor {
  constructor() {
    this.frameRates = [];
    this.renderTimes = [];
    this.memoryUsage = [];
    this.maxSamples = 60;
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    let lastTime = performance.now();
    
    const monitor = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      const fps = 1000 / deltaTime;
      
      this.recordFrameRate(fps);
      this.recordMemoryUsage();
      
      lastTime = currentTime;
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  recordFrameRate(fps) {
    this.frameRates.push(fps);
    if (this.frameRates.length > this.maxSamples) {
      this.frameRates.shift();
    }
  }
  
  getAverageFrameRate() {
    return this.frameRates.reduce((a, b) => a + b, 0) / this.frameRates.length;
  }
  
  getPerformanceReport() {
    return {
      averageFPS: this.getAverageFrameRate(),
      minFPS: Math.min(...this.frameRates),
      maxFPS: Math.max(...this.frameRates),
      memoryUsage: this.getAverageMemoryUsage(),
      renderTime: this.getAverageRenderTime()
    };
  }
  
  detectPerformanceIssues() {
    const avgFPS = this.getAverageFrameRate();
    const issues = [];
    
    if (avgFPS < 30) {
      issues.push('Low frame rate detected. Consider optimizing rendering.');
    }
    
    if (this.getAverageMemoryUsage() > 50 * 1024 * 1024) { // 50MB
      issues.push('High memory usage detected. Check for memory leaks.');
    }
    
    return issues;
  }
}
```

---

This enhanced technical guide provides the foundation for creating world-class retro web games with modern development practices, comprehensive testing, and professional-grade architecture patterns.

---

## 🛡️ QA & Audit Framework (MANDATORY)

### Pre-Development Setup
1. **Implement `runAuditTasks()`** method in main game class
2. **Expose `window.runAudit()`** for console testing
3. **Auto-run audits** on localhost initialization
4. **Follow TDD principles** - test early and often

### Universal Audit Checklist
Every game must pass these checks:
- [ ] MIT license headers in all files (`© GG, MIT License`)
- [ ] Single render call per frame (no duplicate draws)
- [ ] Grid-aligned movement (pixel-perfect positioning)
- [ ] Responsive canvas dimensions
- [ ] Navigation link to `/index.html` present
- [ ] No console errors during gameplay
- [ ] Game state transitions handled properly
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Language consistency (`lang` attribute matches UI text)
- [ ] Mobile-responsive touch controls

### Development Workflow
1. **Plan**: Define game mechanics and architecture
2. **Code**: Implement following ES6+ patterns
3. **Test**: Run `window.runAudit()` frequently
4. **Fix**: Address ❌ FAIL results immediately
5. **Document**: Update prompts.md with changes
6. **Verify**: Ensure ✅ PASS on all checks

---

## 🏗️ Standard File Structure

```
<game-name>-GG/
├── index.html              # Main game entry point
├── style.css               # Game-specific styling
├── script.js               # Complete game logic
├── prompts.md              # Development chronology
├── README.md               # Game documentation
├── TECHNICAL_GUIDE_<game>.md # Game-specific implementation details
└── assets/                 # Multimedia resources (optional)
    ├── images/             # Sprites, icons, backgrounds
    ├── sounds/             # Audio effects
    └── fonts/              # Custom typography
```

## 💻 JavaScript ES6+ Architecture Standards

### Core Game Class Pattern
```javascript
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
    this.score = 0;
    this.lastFrameTime = 0;
    
    this.initialize();
  }

  async initialize() {
    await this.loadAssets();
    this.setupEventListeners();
    
    // QA Audit Setup
    if (window.location.hostname === 'localhost') {
      window.runAudit = this.runAuditTasks.bind(this);
      setTimeout(() => this.runAuditTasks(), 1000);
    }
    
    this.gameLoop();
  }

  gameLoop() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    this.update(deltaTime);
    this.render();
    
    this.lastFrameTime = now;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    if (this.gameState !== 'PLAYING') return;
    // Game logic updates
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Rendering logic - SINGLE render call per frame
  }

  runAuditTasks() {
    // Implement QA checklist validation
    // Return true if all checks pass
  }
}
```

### Modular Architecture
- **Separation of Concerns**: Game logic, rendering, input, audio in separate classes
- **State Management**: Clear game state transitions
- **Performance**: 60fps target with efficient algorithms
- **Error Handling**: Graceful degradation and input validation

## 🎨 CSS3 Design System

### Color Palette (CSS Variables)
```css
:root {
  --primary-cyan: #00ffff;
  --primary-magenta: #ff00ff;
  --primary-yellow: #ffff00;
  --accent-green: #00ff00;
  --accent-red: #ff0040;
  --accent-orange: #ff6600;
  
  --bg-primary: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;
}
```

### Responsive Design Principles
- **Mobile-First**: Start with mobile, scale up
- **CSS Grid/Flexbox**: Modern layout techniques
- **Touch-Friendly**: 44px minimum touch targets
- **Performance**: Hardware-accelerated animations

## 📱 HTML5 Standards

### Semantic Structure
```html
<!DOCTYPE html>
<html lang="es"> <!-- or "en" - be consistent -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Title - AI4Devs Retro Games</title>
  <!-- Required meta tags for SEO and social sharing -->
</head>
<body>
  <main class="game-container">
    <nav class="back-navigation">
      <a href="../index.html">← Volver al índice</a>
    </nav>
    
    <section class="game-area">
      <canvas id="gameCanvas"></canvas>
    </section>
    
    <aside class="game-ui">
      <!-- Score, lives, controls -->
    </aside>
  </main>
</body>
</html>
```

## 🎮 Common Game Patterns

### Input Management
```javascript
class InputManager {
  constructor() {
    this.keys = new Set();
    this.touchStart = null;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.keys.add(e.code));
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
  }
}
```

### Collision Detection
```javascript
class CollisionSystem {
  static rectRect(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  static circleRect(circle, rect) {
    // Implementation for circle-rectangle collision
  }
}
```

## 🚀 Performance Optimization

### Canvas Best Practices
- **Single render call** per frame
- **Batch drawing operations** to minimize state changes
- **Use requestAnimationFrame** for smooth 60fps
- **Clear only necessary areas** when possible

### Memory Management
- **Clean up event listeners** on game destruction
- **Reuse objects** instead of creating new ones each frame
- **Optimize asset loading** and caching

## 🌐 Cross-Browser Compatibility

### Supported Browsers
- Chrome 51+ (ES6 support)
- Firefox 54+
- Safari 10+
- Edge 15+

### Feature Detection
```javascript
// Example: Web Audio API with fallback
const audioSupported = !!(window.AudioContext || window.webkitAudioContext);
if (audioSupported) {
  // Use Web Audio API
} else {
  // Fallback to HTML5 Audio
}
```

## 📝 Documentation Standards

### Code Comments
- **Function documentation**: JSDoc format for complex functions
- **Inline comments**: Explain complex algorithms or game-specific logic
- **Language**: Spanish or English, but be consistent within each file

### File Headers
All source files must include:
```javascript
/* © GG, MIT License */
/**
 * Game Title - Brief Description
 * Implementation details and architecture notes
 * 
 * @author GG
 * @version 1.0.0
 * @date 2025
 */
```

---

## 🔮 Future Game Development

This technical foundation supports adding new games like:
- **Tetris**: Block-based puzzle with rotation mechanics
- **Asteroids**: Vector-based space shooter with physics
- **Bomberman**: Grid-based strategy with destructible terrain
- **Pong**: Simple physics-based paddle game
- **Frogger**: Obstacle avoidance with timed movement

Each new game should follow these patterns while implementing game-specific mechanics in their dedicated technical guide.

---

**For game-specific implementation details, see:**
- `snake-GG/TECHNICAL_GUIDE_snake.md`
- `breakout-GG/TECHNICAL_GUIDE_breakout.md` 
- `fruit-catcher-GG/TECHNICAL_GUIDE_fruit-catcher.md`
- `pacman-GG/TECHNICAL_GUIDE_pacman.md`
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
