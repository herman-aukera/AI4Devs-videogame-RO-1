# GitHub Copilot Instructions - AI4Devs Retro Web Games

## ⚙️ QA & Audit Framework (Universal)

Every game in this collection must include automated QA checks and pass all audit criteria before release.

### 🛠️ Implementation Requirements
- **Audit System**: Add `runAuditTasks()` method to main game class
- **Console Access**: Expose `window.runAudit()` in development mode
- **Auto-Execution**: Run audit automatically on localhost
- **Pass Criteria**: All checks must return ✅ PASS status

### 📋 Universal Audit Checklist
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

---

## 🎯 Project Context

You are working on the **AI4Devs Retro Web Games** - a collection of lightweight HTML5/CSS3/JavaScript ES6+ game titles. Each game follows retro-arcade aesthetics with modern web development standards and cross-browser compatibility.

## 📋 General Coding Standards

### JavaScript ES6+ Requirements

- **Classes & Modules**: Use ES6+ classes, arrow functions, async/await, destructuring
- **Modular Architecture**: Separate concerns (Game, Player, Input, Renderer, Audio)
- **Modern Syntax**: Template literals, const/let, spread operator, optional chaining
- **Error Handling**: Try-catch blocks, input validation, graceful degradation
- **Performance**: requestAnimationFrame for 60fps loops, efficient algorithms

### HTML5 Semantic Structure

- **Semantic Elements**: `<main>`, `<section>`, `<header>`, `<nav>`, `<canvas>`
- **Accessibility**: `lang` attributes, ARIA labels, keyboard navigation support
- **Meta Tags**: Viewport, description, keywords, Open Graph for social sharing
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

### CSS3 Responsive Design

- **Mobile-First**: Start with mobile styles, scale up with media queries
- **Modern Layout**: CSS Grid and Flexbox for complex responsive layouts
- **Custom Properties**: CSS variables for theming and maintainability
- **Smooth Animations**: CSS transitions and transforms for "juice" effects
- **Retro Aesthetic**: Neon color palettes, pixel fonts, glitch effects, arcade styling

### Documentation & Comments

- **Bilingual Support**: Code comments can be Spanish or English
- **Educational Focus**: Explain concepts clearly for learning purposes
- **UI Flexibility**: Game interface may be Spanish or English (but be consistent)
- **README Completeness**: Installation, controls, gameplay, compatibility

## 📁 Folder & File Layout

Each game must follow this exact structure:

```
<game-name>-GG/
├── index.html      # Main game entry point
├── style.css       # All styling and responsive design
├── script.js       # Complete game logic and classes
├── prompts.md      # Development prompt chronology
├── README.md       # Game description & instructions
└── assets/         # Optional: images, sounds, fonts
```

## 🔄 Development Workflow

### 1. Documentation First

- **Always start in prompts.md** - record every AI prompt and iteration
- Document challenges, solutions, and architectural decisions
- Track version changes and feature additions chronologically

### 2. Incremental Development

- **Skeleton First**: Basic HTML structure and CSS layout
- **Core Features**: Game loop, basic mechanics, input handling
- **Polish Phase**: Visual effects, sound, performance optimization
- **Testing & QA**: Cross-browser compatibility and mobile testing

### 3. Quality Assurance

- **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge compatibility
- **Device Testing**: Desktop, tablet, mobile responsive behavior
- **Performance Validation**: 60fps gameplay, memory efficiency
- **Accessibility Check**: Keyboard controls, screen reader compatibility

## ⚡ Performance & UX Standards

### Canvas Optimization

- **Efficient Rendering**: Minimize canvas redraws, batch drawing operations
- **Frame Rate**: Maintain consistent 60fps with requestAnimationFrame
- **Memory Management**: Clean up event listeners, avoid memory leaks
- **Asset Loading**: Preload resources, handle loading states gracefully

### User Experience

- **Responsive Controls**: Keyboard (arrows/WASD) + touch controls for mobile
- **Visual Feedback**: Smooth animations, particle effects, screen shake
- **Audio Integration**: Optional sound effects and background music
- **State Management**: Pause/resume, game over, restart functionality

## 🎮 Common Game Patterns

### Core Functionality

- **Pause/Resume**: Spacebar or dedicated button for game control
- **High Score**: localStorage persistence across browser sessions
- **Game States**: Menu, Playing, Paused, Game Over with smooth transitions
- **Restart Mechanism**: Quick restart without page reload

### Enhanced Features

- **Touch Controls**: Mobile-friendly touch/swipe gestures
- **Visual Effects**: Particle systems, screen shake, color flashes
- **Sound Integration**: Web Audio API for effects and music (optional)
- **Settings Panel**: Volume control, difficulty selection, control remapping

## 🚫 Development Restrictions

### Protected Areas

- **Never modify**: The `.git/` folder or any version control files
- **Preserve structure**: Don't alter the established folder naming convention
- **Maintain compatibility**: Don't break existing game functionality

### Best Practices

- **Single File Capable**: Games should work as standalone HTML files if needed
- **Progressive Enhancement**: Core functionality works without advanced features
- **Graceful Degradation**: Handle missing features (audio, touch, etc.) elegantly
- **Clean Code**: Follow consistent formatting, naming conventions, and organization

## 🛡️ QA & Audit Implementation Template

Add this audit system to every game's main class:

```javascript
// In GameEngine or main game class
runAuditTasks() {
  const results = [];
  
  // Task 1: License compliance
  const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
  results.push({ name: 'License Header', pass: hasLicense });
  
  // Task 2: Game state validation
  const validStates = ['menu', 'playing', 'paused', 'gameOver'];
  results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState) });
  
  // Task 3: Navigation link present
  const backLink = document.querySelector('a[href*="../index.html"], a[href*="index.html"]');
  results.push({ name: 'Back Navigation', pass: !!backLink });
  
  // Task 4: Language consistency
  const htmlLang = document.documentElement.lang;
  const hasSpanishText = document.body.textContent.includes('VOLVER AL ÍNDICE');
  const languageConsistent = (htmlLang === 'es' && hasSpanishText) || (htmlLang === 'en' && !hasSpanishText);
  results.push({ name: 'Language Consistency', pass: languageConsistent });
  
  // Task 5: Frame rate validation
  const frameRateOK = this.lastFrameTime && (performance.now() - this.lastFrameTime) < 20; // 50fps minimum
  results.push({ name: 'Frame Rate', pass: frameRateOK });
  
  console.table(results);
  return results.every(r => r.pass);
}

// Call during initialization in development
async initialize() {
  // ... other initialization code ...
  
  // Run audit tasks in development mode
  if (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')) {
    console.log('🔍 Running development audit...');
    window.runAudit = this.runAuditTasks.bind(this);
    setTimeout(() => this.runAuditTasks(), 1000);
  }
}
```

---

Remember: Create engaging, educational, and well-documented games that showcase modern web development skills while maintaining authentic retro-arcade gaming experiences. All games should pass the universal audit checklist before being marked as production-ready.
