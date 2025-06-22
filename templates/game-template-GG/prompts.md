# Game Template Development Prompts

This file contains the development context and prompts used to create this professional game template.

## 🎯 Template Purpose

Create a comprehensive, production-ready template for retro arcade games that ensures:
- Consistent visual identity across all games
- Standardized technical architecture
- Built-in TDD audit system
- Mobile-first responsive design
- Authentic retro arcade aesthetics

## 🛠️ Development Context

### Template Requirements
- **Framework**: Vanilla JavaScript ES6+, HTML5 Canvas
- **Styling**: CSS3 with neon retro theme
- **Performance**: 60fps target, optimized rendering
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Touch controls, responsive design
- **Quality**: TDD with automated audit system

### Visual Identity Standards
- **Colors**: Cyan (#00ffff), Magenta (#ff00ff), Yellow (#ffff00), Green (#00ff00)
- **Typography**: Monospace/pixel fonts only
- **Effects**: CRT-style, sharp pixels, no gradients
- **UI**: Spanish language ("INICIO", "¿Cómo jugar?")

### Technical Architecture
- **Class Structure**: Main game class with standardized methods
- **State Management**: menu, playing, paused, gameOver states
- **Input System**: Unified keyboard and touch handling
- **Audio System**: Web Audio API integration
- **Storage**: LocalStorage for persistence

## 📝 Original Development Prompts

### Initial Template Creation
> Create a professional game template for the AI4Devs Retro Web Games collection. The template should include:
> - Complete HTML5 game structure with Spanish UI
> - ES6+ JavaScript game engine class
> - Retro neon CSS styling with responsive design
> - TDD audit system integration
> - Mobile touch controls
> - Performance optimization for 60fps
> - Accessibility features (WCAG 2.1 AA)

### TDD Audit Integration
> Implement a comprehensive TDD audit system that validates:
> - MIT license headers
> - Performance (50fps+)
> - UI consistency (Spanish navigation)
> - Responsive design
> - Accessibility features
> - Code quality standards

### Mobile Optimization
> Ensure the template works perfectly on mobile devices:
> - Touch gesture controls
> - Responsive canvas scaling
> - Minimum 44px touch targets
> - Swipe navigation support
> - Portrait/landscape orientation

### Audio System Integration
> Add Web Audio API integration for retro sound effects:
> - Beep/blip sound generation
> - Volume controls
> - Audio context management
> - Browser compatibility handling

## 🔄 Iteration History

### Version 1.0.0 (June 2025)
- Initial template creation
- TDD audit system implementation
- Mobile touch controls
- Retro neon styling
- Performance optimization
- Accessibility features

### Validation Fixes
- HTML validation errors resolved
- JavaScript linting clean
- CSS structure optimization
- Performance benchmarking passed

## 🎮 Usage Examples

### Creating a New Game
```bash
# Copy template
cp -r templates/game-template-GG new-game-GG/

# Customize for your game
cd new-game-GG/
# Edit index.html, script.js, style.css
# Update README.md and prompts.md
```

### Testing Template
```bash
# Validation
npm run lint:html
npm run lint:js
npm run lint:css

# Performance
npm run perf:games

# Manual testing
open index.html
# Run runAudit() in browser console
```

## 🎨 Customization Guidelines

When adapting this template for specific games:

1. **Game Logic**: Override `updateGameLogic()`, `renderGameState()`, `handleGameInput()`
2. **Visual Style**: Maintain neon color scheme, add game-specific assets
3. **Audio**: Use provided `RetroAudioManager` for sound effects
4. **UI**: Keep Spanish language, maintain "INICIO" navigation
5. **Performance**: Ensure 60fps with game-specific optimizations

## 📊 Quality Standards

All games created from this template must pass:
- **TDD Audit**: All critical tests pass
- **HTML Validation**: No errors or warnings
- **JavaScript Linting**: ESLint clean
- **Performance**: 50fps+ sustained
- **Accessibility**: Keyboard navigation working
- **Mobile**: Touch controls responsive

## 🔗 Related Files

- `index.html` - Game HTML structure
- `script.js` - Complete game engine
- `style.css` - Retro neon styling
- `README.md` - Template documentation
- `../../../.github/copilot-instructions.md` - Repository standards
- `../../../TECHNICAL_GUIDE.md` - Advanced technical patterns

---

**Prompt File Version**: 1.0.0  
**Last Updated**: June 2025  
**Template License**: MIT © GG
