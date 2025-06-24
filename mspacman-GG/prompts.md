# Ms. Pac-Man GG - Development Prompts & Documentation

## 🚀 Initial Creation Prompt

### Primary Request
Create a complete Ms. Pac-Man game implementation with enhanced features, following the AI4Devs Retro Web Games collection standards.

### Core Requirements
- **Multiple Maze System**: Implement 4 unique mazes with distinct layouts and color themes
- **Moving Fruit System**: Fruits that bounce around the maze with physics
- **Enhanced Ghost AI**: Unpredictable AI behavior while maintaining classic patterns
- **Modern Web Standards**: ES6+ classes, Canvas API, 60fps performance
- **Mobile Responsive**: Touch controls and responsive design
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
- **TDD Compliance**: Comprehensive audit system for quality assurance

### Technical Specifications
- **Architecture**: Modular ES6+ class system with clear separation of concerns
- **Performance**: 60fps target with requestAnimationFrame optimization
- **Compatibility**: Cross-browser support (Chrome, Firefox, Safari, Edge)
- **Audio**: Web Audio API with fallback support
- **Storage**: Local storage for high scores and settings

## 🏗️ Architecture Design Prompts

### Maze Management System
```
Implement a MazeManager class that handles:
- 4 unique maze layouts in 19x21 grid format
- Progressive difficulty scaling
- Color-coded maze themes (Pink, Cyan, Yellow, Green)
- Efficient maze rendering and collision detection
- Tunnel and portal management
```

### Enhanced Player System
```
Create MsPacManPlayer class extending base player functionality:
- Bow sprite rendering for Ms. Pac-Man character
- Smooth grid-aligned movement with direction queuing
- Power pellet state management
- Score multiplier tracking
- Life system with proper collision handling
```

### Moving Fruit System
```
Develop MovingFruit class with:
- Physics-based bouncing movement
- Smart spawn location selection
- Progressive fruit values by level
- Collision detection with maze walls
- Visual feedback and scoring animations
```

### Advanced Ghost AI
```
Design EnhancedGhostAI system featuring:
- Base ghost behaviors (Scatter, Chase, Flee, Eaten)
- Randomization elements for unpredictability
- Smart pathfinding with tunnel awareness
- Individual ghost personality traits
- Performance-optimized pathfinding algorithms
```

## 🎮 Feature Implementation Prompts

### Multi-Maze Progression
```
Implement maze progression system:
1. Start with Pink maze (classic layout)
2. Progress through Cyan, Yellow, Green mazes
3. Increase ghost speed and aggression
4. Reduce power pellet duration
5. Add bonus scoring for perfect maze completion
```

### Audio Enhancement
```
Create MsPacManAudioManager with:
- Distinct sound effects for Ms. Pac-Man
- Dynamic audio mixing for moving fruit
- Context-sensitive background music
- Audio sprite management for efficiency
- Volume controls and accessibility options
```

### Mobile Touch Controls
```
Implement responsive touch interface:
- Swipe gesture recognition for movement
- Touch-friendly pause/resume controls
- Visual feedback for touch interactions
- Haptic feedback support where available
- Orientation change handling
```

## 🧪 Quality Assurance Prompts

### TDD Audit System
```
Implement comprehensive runAuditTasks() method checking:
- Game architecture compliance
- Performance benchmarks (60fps)
- Accessibility standards (WCAG 2.1 AA)
- Mobile responsiveness
- Cross-browser compatibility
- Code quality metrics
- Retro authenticity validation
```

### Performance Optimization
```
Optimize for 60fps performance:
- Object pooling for fruit and particles
- Efficient collision detection algorithms
- Canvas rendering optimization
- Memory leak prevention
- Battery-efficient mobile performance
```

### Accessibility Compliance
```
Ensure WCAG 2.1 AA compliance:
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Alternative text for visual elements
- Focus management and indicators
```

## 🎨 Visual Design Prompts

### Retro Aesthetic
```
Maintain authentic retro aesthetic with:
- Neon color palette (#00ffff, #ff00ff, #ffff00, #00ff00, #ff69b4)
- Pixel-perfect sprite rendering
- CRT-style screen effects
- Sharp color transitions without gradients
- Monospace/pixel fonts only
```

### Responsive UI Design
```
Create responsive interface:
- Scalable canvas maintaining aspect ratio
- Touch-optimized button sizes (minimum 44px)
- Adaptive layout for different screen sizes
- Consistent UI across desktop and mobile
- Loading states and progress indicators
```

## 📱 Mobile Optimization Prompts

### Touch Interface
```
Implement intuitive touch controls:
- Natural swipe gesture recognition
- Visual feedback for touch interactions
- Thumb-friendly control placement
- Prevent accidental touches
- Support for both portrait and landscape modes
```

### Performance Optimization
```
Optimize for mobile devices:
- Efficient memory usage patterns
- Battery-conscious rendering
- Network-efficient asset loading
- Offline gameplay capability
- Progressive loading for slower connections
```

## 🔧 Integration Prompts

### Collection Integration
```
Integrate with AI4Devs Retro Web Games collection:
- Consistent navigation with "INICIO" links
- Matching visual theme and styling
- Shared CSS patterns and components
- Unified high score management
- Cross-game consistency in UI/UX
```

### Shared Code Architecture
```
Prepare for code sharing with Pac-Man GG:
- Extract common base classes
- Shared utility functions
- Common audio management
- Unified input handling
- Modular architecture for reusability
```

## 🚀 Enhancement Prompts

### Advanced Features
```
Add enhanced gameplay features:
- Level progression with increasing difficulty
- Bonus rounds and mini-games
- Achievement system
- Speed run mode with time tracking
- Spectator mode with AI demonstration
```

### Analytics & Metrics
```
Implement game analytics:
- Performance metrics collection
- User behavior tracking
- Error logging and reporting
- A/B testing framework
- Usage statistics dashboard
```

## 📚 Documentation Prompts

### Technical Documentation
```
Create comprehensive documentation:
- API reference for all classes
- Architecture decision records
- Performance benchmarking results
- Accessibility audit reports
- Cross-browser testing results
```

### User Documentation
```
Develop user-friendly guides:
- Getting started tutorial
- Advanced gameplay strategies
- Troubleshooting guide
- FAQ section
- Accessibility features guide
```

## 🎯 Testing Prompts

### Automated Testing
```
Implement comprehensive test suite:
- Unit tests for all game classes
- Integration tests for game flow
- Performance benchmarks
- Accessibility automated testing
- Cross-browser compatibility tests
```

### Manual Testing Scenarios
```
Test key gameplay scenarios:
- Complete maze progression (all 4 mazes)
- Ghost AI behavior in different states
- Moving fruit collision and scoring
- Touch controls on various devices
- Accessibility with keyboard navigation
- Performance under different conditions
```

---

*These prompts guided the development of Ms. Pac-Man GG, ensuring comprehensive feature coverage, quality assurance, and alignment with the AI4Devs Retro Web Games collection standards.*
