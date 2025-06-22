# Game Template - AI4Devs Retro Games

> Professional template for creating retro arcade games

## 🎮 About This Template

This template provides a complete foundation for creating retro-style HTML5 arcade games following the AI4Devs standards. It includes:

- **ES6+ Game Engine** with standardized methods
- **Retro Neon Aesthetic** with authentic 8-bit styling
- **Mobile-First Responsive Design** with touch controls
- **TDD Audit System** for automated quality assurance
- **Performance Optimization** targeting 60fps
- **Accessibility Features** (WCAG 2.1 AA compliant)

## 🚀 Quick Start

1. **Copy Template**:
   ```bash
   cp -r templates/game-template-GG your-game-GG/
   cd your-game-GG/
   ```

2. **Customize Game**:
   - Update `index.html` title and meta tags
   - Modify `script.js` game logic in `updateGameLogic()` method
   - Customize styling in `style.css`
   - Update this README with your game details

3. **Test & Validate**:
   ```bash
   # Open in browser
   open index.html
   
   # Run TDD audit in browser console
   runAudit()
   ```

## 🛠️ Template Structure

### Core Files
- `index.html` - Game HTML structure with Spanish UI
- `script.js` - Complete game engine with TDD audit
- `style.css` - Retro neon styling with responsive design
- `README.md` - This documentation file
- `prompts.md` - Development prompts and context

### Key Features Included

#### Game Engine (`GameTemplate` class)
- **State Management**: menu, playing, paused, gameOver
- **Input Handling**: Keyboard and touch controls
- **Performance**: 60fps game loop with deltaTime
- **Audio**: Web Audio API integration ready
- **Storage**: LocalStorage for scores and settings

#### TDD Audit System
- **MIT License**: Header validation
- **Performance**: Frame rate monitoring (50fps+)
- **UI/UX**: Spanish navigation, responsive design
- **Accessibility**: Keyboard navigation, ARIA labels

#### Responsive Design
- **Mobile Touch**: Swipe and tap controls
- **Canvas Scaling**: Responsive across all devices
- **Media Queries**: Optimized for mobile, tablet, desktop

## 🎨 Customization Guide

### Game Logic
Override these methods in the `GameTemplate` class:

```javascript
updateGameLogic(deltaTime) {
  // Your game-specific update logic
}

renderGameState() {
  // Your game-specific rendering
}

handleGameInput() {
  // Your game-specific input handling
}
```

### Visual Styling
Use these predefined neon colors:
- **Primary**: `#00ffff` (cyan)
- **Secondary**: `#ff00ff` (magenta)
- **Accent**: `#ffff00` (yellow)
- **Success**: `#00ff00` (green)

### Audio Integration
```javascript
// Add to initialize() method
this.audioManager = new RetroAudioManager();

// Use in game events
this.audioManager.createBeep(440, 0.1); // Beep sound
```

## 📋 Development Checklist

- [ ] Update game title and description
- [ ] Implement core game mechanics
- [ ] Test on mobile devices
- [ ] Run TDD audit (all critical tests pass)
- [ ] Validate HTML/CSS/JS (no errors)
- [ ] Performance test (50fps+ target)
- [ ] Accessibility check (keyboard navigation)
- [ ] Update README with game-specific details

## 🔧 Technical Requirements

- **ES6+ JavaScript** (classes, modules, arrow functions)
- **Canvas API** for game rendering
- **Web Audio API** for sound effects
- **LocalStorage** for persistence
- **Responsive Design** (mobile-first)
- **60fps Performance** using requestAnimationFrame
- **MIT License** header required

## 📝 Notes

- Maintain Spanish UI language (`lang="es"`)
- Use "INICIO" for navigation back to main menu
- Include "¿Cómo jugar?" expandable instructions
- Follow retro arcade authenticity (no gradients, sharp pixels)
- Ensure keyboard navigation with proper focus states

---

**Template Version**: 1.0.0  
**Last Updated**: June 2025  
**License**: MIT © GG
