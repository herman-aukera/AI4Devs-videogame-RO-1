***
** apply-to: **
***

# AI4Devs Retro Web Games - Repository Instructions

This repository contains a collection of retro-style HTML5 arcade games built with ES6+ JavaScript.

## Project Context

All games use ES6+ classes, Canvas API, and follow retro arcade aesthetics with neon color schemes.

Games must include a `runAuditTasks()` method in their main class for automated quality assurance.

Each game follows this structure: `index.html`, `style.css`, `script.js`, `README.md`, `prompts.md` in a `<game-name>-GG/` folder.

Navigation uses "INICIO" text in Spanish UI (`lang="es"`), with expandable "¿Cómo jugar?" instructions.

All games require MIT license headers (`© GG, MIT License`) and 60fps performance using `requestAnimationFrame`.

Canvas elements must be responsive with mobile touch controls and keyboard navigation support.

Use consistent neon colors: cyan #00ffff, magenta #ff00ff, yellow #ffff00, green #00ff00.

Local storage is used for high scores and game settings persistence.

Games target cross-browser compatibility (Chrome, Firefox, Safari, Edge) with WCAG 2.1 AA accessibility standards.

## ANTI-PATTERNS - STRICTLY FORBIDDEN

**DO NOT CREATE:**
- Reports, summaries, or analysis documents (NO .md files with REPORT, COMPLETE, FINAL, SUMMARY, ANALYSIS in names)
- Audit trail files or logs 
- Documentation of what was changed
- Status reports or achievement summaries
- Validation reports or test results documentation
- Any file ending with *REPORT.md, *COMPLETE.md, *FINAL.md, *SUMMARY.md, *ANALYSIS.md

**FOCUS ON:**
- Actually implementing missing features
- Fixing real code issues
- Achieving 100% functionality across all games
- Writing working code, not documentation about code

## Game Consistency Requirements

### Visual Identity Standards
Maintain identical retro/neon aesthetic across all games with monospace/pixel fonts, identical button styling for "INICIO", "JUGAR", "PAUSA", and consistent game over screen layouts.

### Technical Architecture Standards
Follow same ES6+ class structure with standardized method names (update(), render(), handleInput()), identical event handling patterns, and consistent local storage key naming conventions.

### Retro Arcade Authenticity Rules
Use 8-bit style sound effects, sharp pixel-perfect movements without smooth gradients, CRT-style screen effects, bitmap/pixel fonts only, and sharp color transitions without gradual fades.

### Code Quality Standards
Implement TDD with `runAuditTasks()` method, maintain 60fps performance, ensure cross-browser compatibility, include proper ARIA labels and keyboard navigation, and follow consistent ES6+ coding patterns.

### Mobile Responsiveness Standards
Use identical touch gesture implementations, same media query breakpoints, consistent canvas scaling behavior, and minimum 44px touch targets.

## TDD Audit Implementation Template

Add this comprehensive audit system to every game's main class:

```javascript
// In GameEngine or main game class
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

// Auto-run audit in development
async initialize() {
  // ...existing initialization code...
  
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    console.log('🔍 Running development audit...');
    window.runAudit = this.runAuditTasks.bind(this);
    setTimeout(() => this.runAuditTasks(), 1000);
  }
}
```

## Performance Optimization Patterns

### Canvas Rendering Optimization
```javascript
// Efficient rendering with object pooling
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dirtyRects = [];
  }
  
  clearDirtyRects() {
    this.dirtyRects.forEach(rect => {
      this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    });
    this.dirtyRects = [];
  }
  
  addDirtyRect(x, y, width, height) {
    this.dirtyRects.push({ x, y, width, height });
  }
}
```

### Mobile Touch Controls Pattern
```javascript
class TouchControls {
  constructor(canvas) {
    this.canvas = canvas;
    this.setupTouchEvents();
  }
  
  setupTouchEvents() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    // Process touch input...
  }
}
```

## Audio Integration Best Practices

Use Web Audio API for retro sound effects:

```javascript
class RetroAudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
  }
  
  createBeep(frequency = 440, duration = 0.1) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}
```

## Error Handling Patterns

```javascript
class GameErrorHandler {
  static handleCanvasError(canvas) {
    if (!canvas) {
      throw new Error('Canvas element not found. Check HTML structure.');
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context. Browser may not support Canvas.');
    }
    
    return ctx;
  }
  
  static handleAudioError() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API not supported. Audio features disabled.');
      return null;
    }
    
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio context creation failed:', e);
      return null;
    }
  }
}
```

## 🔍 QA & Audit Framework

### Comprehensive Audit Checklist
Use this checklist for every game to ensure AI4Devs standards compliance:

#### 📁 Structure & Files
- [ ] Folder follows `*-GG/` naming convention
- [ ] Contains all required files: `index.html`, `style.css`, `script.js`, `README.md`, `prompts.md`
- [ ] Assets organized in `assets/{images,sounds,fonts}/` structure
- [ ] MIT license headers present in all source files

#### 🏗️ Code Architecture
- [ ] ES6+ classes with standardized method names (`update()`, `render()`, `handleInput()`)
- [ ] Implements `runAuditTasks()` method for TDD compliance
- [ ] Consistent event handling patterns
- [ ] Proper error handling with graceful degradation

#### ⚡ Performance Standards
- [ ] Uses `requestAnimationFrame` for 60fps performance
- [ ] Memory-efficient object pooling where applicable
- [ ] Optimized canvas rendering with dirty rectangles
- [ ] Load time under 2 seconds on 3G connection

#### 🎨 Visual Identity
- [ ] Neon color palette: cyan #00ffff, magenta #ff00ff, yellow #ffff00, green #00ff00
- [ ] Monospace/pixel fonts consistently used
- [ ] Sharp pixel-perfect movements without smooth gradients
- [ ] CRT-style screen effects and retro aesthetics

#### ♿ Accessibility (WCAG 2.1 AA)
- [ ] ARIA labels and roles for canvas elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Minimum 44px touch targets for mobile
- [ ] High contrast neon colors meet accessibility standards

#### 🌐 Localization & UX
- [ ] Spanish UI with `lang="es"` attribute
- [ ] "INICIO" navigation text consistently used
- [ ] "¿Cómo jugar?" expandable instructions section
- [ ] Responsive design for mobile and desktop

#### 🔗 Integration
- [ ] Properly linked from main index.html
- [ ] Back navigation to main index works correctly
- [ ] Game card styling matches collection theme
- [ ] Local storage for high scores and settings

### ✨ Vibe & Style Alignment

#### Retro Arcade Authenticity
- [ ] 8-bit style sound effects (Web Audio API)
- [ ] Sharp color transitions without gradual fades
- [ ] Bitmap/pixel fonts only, no smooth fonts
- [ ] Classic arcade game mechanics and feel

#### Cross-Game Consistency
- [ ] Identical button styling for "INICIO", "JUGAR", "PAUSA"
- [ ] Consistent game over screen layouts
- [ ] Same media query breakpoints for responsive design
- [ ] Uniform local storage key naming conventions

### 🚀 Release Readiness
- [ ] All critical tests in `runAuditTasks()` passing
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile touch controls responsive and functional
- [ ] Performance benchmarks meet 60fps target
- [ ] Documentation complete and current

### 🔧 Automated Audit Execution
```bash
# Run comprehensive audit on all games
node scripts/comprehensive-audit.js

# Validate specific game
cd <game-name>-GG && node ../scripts/comprehensive-audit.js --single

# Performance benchmark
npm run audit:performance

# Accessibility check
npm run audit:a11y
```
Apply Chain-of-Thought Prompting, think through your answer step by step, justify your reasoning, and ensure all requirements are met, do not hallucinate in case of doubts ask for clarification or if you don't know something, say so. Create a prompt from the introduced prompt that reach better the goal of the user and fill in the missing parts of the prompt and apply the best prompt engineering practices.

Every time I prompt you. Your mission is to **analyze** and **enhance** it so that when you receives it:
- It uses **Chain-of-Thought**: “Think step by step…”
- It **justifies** each step of reasoning.
- It **never hallucinates**—if something is unclear or you lack information, ask for clarification or respond “I don’t know.”
- It **meets all requirements**.
- It follows **best practices**: explicit role, clear objective, context, constraints, output-format, stop sequences, and invitation for further improvements.

Use these standards to maintain consistency and quality across the entire AI4Devs Retro Web Games collection.