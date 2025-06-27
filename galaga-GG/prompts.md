# GALAGA Game Development Prompts

## Primary Development Prompt

Create a classic Galaga-style space shooter game with the following specifications:

### Core Game Mechanics
- Player controls a spaceship at the bottom of the screen
- Enemy ships fly in formation patterns at the top
- Enemies periodically dive down in attack patterns
- Player can shoot bullets to destroy enemies
- Multiple waves of increasing difficulty
- Score system with different point values per enemy type

### Enemy Types & Behaviors
- **Bee**: Basic enemy, 50 points, simple movement
- **Butterfly**: Medium enemy, 80 points, more complex flight patterns  
- **Galaga Boss**: Advanced enemy, 150 points, can capture player ship
- Formation flying behavior with synchronized movements
- Dive-bomb attack patterns in curved trajectories

### Special Features
- **Ship Capture Mechanic**: Galaga Boss can capture player ship with tractor beam
- **Rescue Mechanic**: Destroy capturing Boss to get double ships
- **Bonus Stages**: Periodic challenge stages for extra points
- **Formation Bonuses**: Extra points for destroying complete formations

### Technical Requirements
- ES6+ JavaScript with class-based architecture
- HTML5 Canvas for rendering
- 60fps performance with requestAnimationFrame
- Responsive design for desktop and mobile
- Web Audio API for retro sound effects
- Local storage for high scores

### Visual Design
- Retro neon color scheme (green, yellow, orange, red)
- Pixel-perfect sprite-style graphics
- CRT-style visual effects and glow
- Smooth animations and particle effects
- Classic arcade aesthetic

### Audio Integration
- Retro 8-bit style sound effects
- Different sounds for: shooting, enemy destruction, power-ups, game over
- Web Audio API implementation
- Global audio toggle functionality

### Controls
- Arrow keys for movement
- Spacebar for shooting
- P for pause
- M for audio toggle
- Touch controls for mobile

### Universal Systems Integration
- Audio system with global toggle
- Tournament mode with leaderboards
- Achievement system for milestones
- Cross-game compatibility

## Development History

### Phase 1: Core Architecture
- Set up ES6 class structure
- Implement Canvas rendering system
- Create player movement and shooting mechanics
- Basic enemy spawning and movement

### Phase 2: Enemy Systems  
- Formation flying patterns
- Attack dive behaviors
- Different enemy types with unique properties
- Collision detection between bullets and enemies

### Phase 3: Advanced Features
- Ship capture/rescue mechanics
- Bonus stage implementation
- Score multipliers and bonuses
- Wave progression system

### Phase 4: Polish & Integration
- Universal systems integration (audio, tournament, achievements)
- Mobile touch controls
- Performance optimization
- Cross-browser testing

### Phase 5: QA & Testing
- Comprehensive game testing
- TDD audit compliance
- Accessibility validation
- Final bug fixes and polish

## Code Architecture

### Main Classes
- `GalagaGame`: Main game engine and state management
- `Player`: Player ship with movement, shooting, capture states
- `Enemy`: Base enemy class with AI and behaviors
- `Formation`: Enemy formation management and patterns
- `Bullet`: Projectile physics and collision
- `Vector2D`: 2D vector math utilities
- `Rectangle`: Collision detection helpers

### Key Systems
- Input handling for keyboard and touch
- Canvas rendering with pixel-perfect graphics
- Audio management with Web Audio API
- Game state management (menu, playing, paused, game over)
- Score and progression tracking
- Local storage for persistence

### Performance Optimizations
- Object pooling for bullets and particles
- Efficient collision detection
- Optimized rendering with dirty rectangles
- Memory management for long gameplay sessions

---

*AI4Devs Students - Retro Games Collection*  
*© GG, MIT License*
