# 🎮 AI4Devs Retro Games - Development Guide

## Quick Start

```bash
git clone <repo>
cd AI4Devs-videogame-RO-1
python3 -m http.server 8000  # or any local server
open http://localhost:8000
```

## Game Standards

### Structure
Each game in `<name>-GG/` folder:
- `index.html` - Spanish UI with INICIO nav
- `style.css` - Neon colors (#00ffff, #ff00ff, #ffff00, #00ff00)  
- `script.js` - ES6+ classes with `runAuditTasks()` method
- `README.md` - Game docs
- `prompts.md` - Development log

### Code Requirements
- **Performance**: 60fps with requestAnimationFrame
- **Mobile**: Touch controls + responsive design
- **Audio**: Web Audio API with fallback
- **TDD**: `runAuditTasks()` method in main class
- **License**: MIT headers in all files

### Testing
```javascript
// In browser console
window.runAudit()  // Check game standards
```

## Long-term Roadmap

### Phase 1: Core System Enhancements
1. **Audio System** - Unified Web Audio API across all games
2. **Tournament Mode** - Cross-game high score competitions
3. **Achievement System** - Unlock mechanics spanning games

### Phase 2: New Games
- **Galaga** - Formation flying space shooter
- **Centipede** - Multi-segment creature shooter
- **Defender** - Side-scrolling rescue mission

## Development Workflow

1. **Plan** - Define game mechanics
2. **Code** - Follow ES6+ patterns
3. **Test** - Run `window.runAudit()` 
4. **Integrate** - Add to main index
5. **Commit** - Clean commit messages

That's it. No overengineering, just working games.
