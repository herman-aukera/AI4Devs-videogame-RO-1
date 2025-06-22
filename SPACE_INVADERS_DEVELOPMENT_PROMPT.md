# 🚀 **AI4Devs Space Invaders - Development Prompt**

## 🎯 **GAME SPECIFICATION**

**Game Name**: `space-invaders-GG`  
**Genre**: Classic Space Shooter  
**Target**: Complete the iconic Space Invaders arcade experience with modern AI4Devs standards

---

## 👤 **ROLE & CONTEXT**

You are **GitHub Copilot**, acting as a **Senior Game Developer** for the **AI4Devs Retro Web Games** collection. You must create a production-ready Space Invaders game that seamlessly integrates with the existing collection while maintaining the highest quality standards.

### **🎮 Collection Context**
- **Existing Games**: snake-GG, breakout-GG, fruit-catcher-GG, pacman-GG, tetris-GG
- **Missing Genre**: Space Shooter (this fills the gap)
- **Standards**: Enhanced Audit Framework with 100% compliance required
- **Framework**: Proven template system and automated quality assurance

---

## 🚀 **GAME REQUIREMENTS**

### **Core Gameplay Mechanics**
- **Player Ship**: Bottom-center, left/right movement, shooting
- **Invader Formation**: 5x11 grid of aliens in formation
- **Movement Pattern**: Invaders move side-to-side, drop down when hitting edges
- **Shooting**: Player projectiles, invader projectiles (random)
- **Collision**: Ship vs invaders, projectiles vs targets
- **Barriers**: 4 destructible shields between player and invaders
- **UFO Bonus**: Occasional bonus UFO crossing top of screen
- **Lives System**: 3 lives, extra life at 1500 points
- **Progressive Difficulty**: Faster movement as invaders are destroyed

### **Visual & Audio Design**
- **Neon Aesthetic**: Green invaders (#00ff00), cyan ship (#00ffff), magenta projectiles (#ff00ff)
- **Pixel Perfect**: Sharp, blocky retro graphics with CRT scan line effects
- **Sound Effects**: 8-bit style beeps and explosions using Web Audio API
- **Background**: Starfield with subtle parallax scrolling
- **UI**: Score, lives, high score display in neon styling

### **Technical Architecture**
```javascript
// Required ES6+ Class Structure
class SpaceInvadersGame {
  constructor() {
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.player = new Player();
    this.invaderGrid = new InvaderGrid();
    this.projectiles = new ProjectileManager();
    this.barriers = new BarrierManager();
    this.audio = new RetroAudioManager();
    this.score = 0;
    this.lives = 3;
    this.level = 1;
  }

  // Mandatory TDD audit implementation
  runAuditTasks() {
    // Implementation required per AI4Devs standards
  }

  update(deltaTime) { /* Game logic */ }
  render(ctx) { /* Rendering */ }
  handleInput(input) { /* Input processing */ }
}
```

---

## 📋 **AI4DEVS STANDARDS COMPLIANCE**

### **📁 File Structure** (MANDATORY)
```
space-invaders-GG/
├── index.html          # Spanish UI, lang="es", MIT license
├── style.css           # Neon colors, responsive design
├── script.js           # ES6+ classes, runAuditTasks()
├── README.md           # Spanish documentation
├── prompts.md          # Development history
└── assets/
    ├── images/         # Pixel art sprites
    ├── sounds/         # 8-bit audio files  
    └── fonts/          # Retro monospace fonts
```

### **🎨 Visual Identity Standards**
- **Colors**: Cyan #00ffff, Magenta #ff00ff, Yellow #ffff00, Green #00ff00
- **Typography**: Monospace/pixel fonts only
- **Effects**: CRT scan lines, phosphor glow effects
- **Animation**: Sharp pixel movements, no smooth gradients
- **Background**: Space theme with neon star field

### **⚡ Performance Requirements**
- **Frame Rate**: Stable 60fps using requestAnimationFrame
- **Memory**: Efficient object pooling for projectiles
- **Load Time**: <2 seconds on 3G connection
- **Responsive**: Canvas scaling for mobile/desktop

### **♿ Accessibility (WCAG 2.1 AA)**
- **ARIA Labels**: Canvas properly labeled
- **Keyboard**: Arrow keys + spacebar controls
- **Screen Reader**: Game state announcements
- **Touch**: Mobile-friendly controls (44px minimum)

### **🌐 Localization**
- **Language**: Spanish UI (`lang="es"`)
- **Navigation**: "← INICIO" back button
- **Instructions**: "¿Cómo jugar?" expandable section
- **Text**: "JUGAR", "PAUSA", "PUNTUACIÓN", "VIDAS"

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core Game Engine** ⚡
- [ ] Set up ES6+ class structure with proper inheritance
- [ ] Implement game state management (menu/playing/paused/gameOver)
- [ ] Create canvas rendering system with dirty rectangles
- [ ] Set up input handling for keyboard and touch
- [ ] Implement game loop with requestAnimationFrame

### **Phase 2: Game Objects** 🎮
- [ ] **Player Class**: Movement, shooting, collision detection
- [ ] **Invader Class**: Formation movement, shooting AI, scoring
- [ ] **InvaderGrid Class**: Grid management, movement patterns
- [ ] **Projectile Class**: Physics, collision, object pooling
- [ ] **Barrier Class**: Destructible shields with pixel-level damage
- [ ] **UFO Class**: Bonus target with random appearances

### **Phase 3: Game Logic** 🧠
- [ ] Collision detection system (AABB + pixel-perfect)
- [ ] Scoring system with progressive bonuses
- [ ] Lives and game over conditions
- [ ] Level progression and difficulty scaling
- [ ] High score persistence (localStorage)

### **Phase 4: Audio & Visual Polish** 🎨
- [ ] Web Audio API implementation for retro sounds
- [ ] Particle effects for explosions
- [ ] CRT-style visual effects and scan lines
- [ ] Neon glow effects for all game objects
- [ ] Responsive UI scaling

### **Phase 5: AI4Devs Integration** 🔗
- [ ] TDD audit system implementation
- [ ] Spanish UI and instructions
- [ ] Main index integration with neon game card
- [ ] Mobile touch controls
- [ ] Accessibility features
- [ ] MIT license headers

---

## 🧪 **TDD AUDIT IMPLEMENTATION**

```javascript
// Mandatory audit system for AI4Devs compliance
runAuditTasks() {
  const results = [];
  
  // Game-specific tests
  results.push({ 
    name: 'Invader Formation', 
    pass: this.invaderGrid.hasValidFormation(), 
    critical: true 
  });
  
  results.push({ 
    name: 'Collision Detection', 
    pass: this.testCollisionAccuracy(), 
    critical: true 
  });
  
  results.push({ 
    name: 'Audio System', 
    pass: this.audio.isInitialized(), 
    critical: false 
  });
  
  // Standard AI4Devs tests
  results.push({ 
    name: '60fps Performance', 
    pass: this.lastFrameTime < 16.67, 
    critical: true 
  });
  
  results.push({ 
    name: 'Neon Color Compliance', 
    pass: this.validateNeonPalette(), 
    critical: false 
  });
  
  return this.generateAuditReport(results);
}
```

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements** ✅
- [ ] Complete Space Invaders gameplay with all classic mechanics
- [ ] Progressive difficulty with 10+ levels
- [ ] High score system with persistence
- [ ] Mobile and desktop compatibility
- [ ] Smooth 60fps performance

### **AI4Devs Standards** ✅
- [ ] Passes 100% of automated audit tests
- [ ] Integrates seamlessly with existing collection
- [ ] Maintains authentic retro aesthetic
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Spanish UI with proper navigation

### **Quality Gates** ✅
- [ ] Zero critical audit failures
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile touch controls functional
- [ ] Load time under 2 seconds
- [ ] Memory usage optimized

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **Step 1: Initialize Game Structure**
```bash
# Generate template with AI4Devs standards
node scripts/generate-template.js space-invaders

# Verify structure
npm run audit
```

### **Step 2: Iterative Development**
```bash
# Development with auto-audit
npm run dev

# Continuous validation
npm run validate

# Quality gate verification
npm run quality
```

### **Step 3: Production Deployment**
```bash
# Final validation
npm run release

# Deploy to collection
npm run deploy
```

---

## 🎮 **GAME DESIGN SPECIFICS**

### **Invader Types & Scoring**
- **Top Row (UFO)**: 50-300 points (random)
- **Second Row**: 30 points each
- **Middle Rows**: 20 points each  
- **Bottom Rows**: 10 points each
- **Barriers**: No points, destructible cover

### **Difficulty Progression**
- **Level 1**: Normal speed, 48 invaders
- **Level 2+**: +10% speed per level
- **Wave Clear**: New formation with faster base speed
- **UFO Frequency**: Increases with level

### **Control Scheme**
- **Desktop**: Arrow keys (left/right), Spacebar (shoot), P (pause)
- **Mobile**: Touch zones for movement, tap for shoot
- **Accessibility**: Tab navigation, Enter for actions

---

## 📱 **MOBILE OPTIMIZATION**

### **Touch Controls**
- **Movement Zone**: Left/right touch areas (bottom 20% of screen)
- **Shoot Button**: Center tap zone or touch anywhere above movement area
- **Pause**: Top-right corner touch zone
- **Menu**: Touch game title area

### **Responsive Design**
- **Portrait Mode**: Optimized UI layout
- **Landscape Mode**: Traditional arcade aspect ratio
- **Scaling**: Maintain pixel-perfect scaling at all sizes
- **Performance**: 60fps on mid-range mobile devices

---

## 🏆 **DELIVERABLES**

1. **Complete Game Implementation**: Fully functional Space Invaders with all mechanics
2. **AI4Devs Integration**: Seamless addition to existing collection
3. **Documentation**: Spanish README with gameplay instructions
4. **Quality Assurance**: 100% audit compliance
5. **Mobile Compatibility**: Touch controls and responsive design
6. **Performance Optimization**: 60fps stable frame rate
7. **Accessibility Features**: WCAG 2.1 AA compliance

---

**🎯 EXECUTION COMMAND:**
```bash
# Start development
node scripts/generate-template.js space-invaders && cd space-invaders-GG

# Validate during development  
npm run validate

# Deploy when complete
npm run deploy
```

This prompt ensures the new Space Invaders game will be a perfect addition to the AI4Devs collection, maintaining all quality standards while delivering an authentic retro arcade experience. 🚀✨
