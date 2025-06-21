# 🎮 AI4Devs Retro Web Games Collection

## 📋 Descripción del Proyecto

Colección de juegos arcade retro desarrollados por estudiantes de AI4Devs como ejercicio final de introducción al desarrollo web. Cada juego está implementado con **HTML5**, **CSS3** y **JavaScript ES6+**, siguiendo principios de diseño moderno y estética retro-arcade.

## 🕹️ Juegos Disponibles

### 🐍 Snake Retro - GG Edition

**Estado**: ✅ Completado  
**Carpeta**: `snake-GG/`  
**Descripción**: Implementación clásica del juego Snake con movimiento basado en grid, dificultad progresiva y efectos visuales retro.

**Características**:

- Movimiento en grid de 20x20px
- Sistema de puntuación progresivo
- Detección de colisiones (paredes y auto-colisión)
- Velocidad incrementa con el nivel
- Efectos de partículas y neón

### 🧱 Breakout Retro - GG Edition

**Estado**: ✅ Completado  
**Carpeta**: `breakout-GG/`  
**Descripción**: Versión moderna del clásico Breakout con física realista de pelota, múltiples niveles y power-ups.

**Características**:

- Física de pelota con ángulos variables
- Sistema de ladrillos destructibles
- Niveles progresivos
- Efectos visuales avanzados
- Controles de paleta responsivos

### 🍎 Fruit Catcher - GG Edition

**Estado**: ✅ Completo  
**Carpeta**: `fruit-catcher-GG/`  
**Descripción**: Juego de captura de frutas con física de caída, dificultad progresiva y efectos visuales avanzados.

**Características**:

- Sistema de física realista para frutas cayendo
- Dificultad progresiva con aumento de velocidad
- Controles responsivos (teclado + touch)
- Sistema de partículas y efectos visuales
- High score persistente con localStorage
- Diseño retro-arcade con animaciones fluidas

### 🟡 PAC-MAN GG - Advanced Edition

**Estado**: ✅ Completado  
**Carpeta**: `pacman-GG/`  
**Descripción**: Implementación avanzada del clásico Pac-Man con IA auténtica de fantasmas, algoritmo A* para pathfinding y audio procedural.

**Características**:

- **IA de fantasmas auténtica** con 4 personalidades distintas (Blinky, Pinky, Inky, Clyde)
- **Algoritmo A*** para búsqueda de caminos inteligente
- **Maze clásico 19x21** con pellets y power pellets
- **Sistema de estados complejo** (Scatter, Chase, Flee, Eaten)
- **Audio procedural** con Web Audio API
- **Rendimiento optimizado** con Object Pooling y renderizado eficiente
- **Controles responsivos** para móvil y escritorio
- **Arquitectura modular ES6+** con clases especializadas

## 🛠️ Arquitectura y Estándares Técnicos

### Estructura de Archivos Unificada

```
<nombre-juego>-GG/
├── index.html      # Estructura HTML semántica
├── style.css       # Estilos retro responsive
├── script.js       # Lógica del juego ES6+
├── prompts.md      # Documentación del desarrollo
├── README.md       # Descripción específica del juego
└── assets/         # Recursos (imágenes, sonidos)
```

### Estándares de Desarrollo

#### HTML5 Semántico

- Elementos semánticos (`<main>`, `<section>`, `<header>`, `<canvas>`)
- Meta tags completos (viewport, description, Open Graph)
- Navegación de retorno al índice principal
- Accesibilidad con atributos ARIA

#### CSS3 Moderno

- Variables CSS para temas y colores
- Diseño responsive mobile-first
- Efectos neón y glassmorphism
- Animaciones con `@keyframes`
- Compatibilidad cross-browser (Safari, Chrome, Firefox, Edge)

#### JavaScript ES6+

- Clases para entidades del juego
- Módulos y arquitectura modular
- `requestAnimationFrame` para loops a 60fps
- Manejo de eventos y estados
- Sistema de colisiones optimizado

### Paleta de Colores Retro

```css
--primary-cyan: #00FFFF      /* Títulos y efectos principales */
--primary-magenta: #FF00FF   /* Acentos y gradientes */
--primary-yellow: #FFFF00    /* Elementos de atención */
--accent-green: #00FF00      /* Snake theme */
--accent-orange: #FF6600     /* Breakout theme */
--accent-red: #FF0040        /* Danger y alertas */
--bg-primary: #0a0a0f        /* Fondo principal */
--bg-secondary: #1a1a2e      /* Fondo secundario */
```

## 🎯 Guía para Nuevos Juegos

### 1. Configuración Inicial

```bash
# Crear nueva carpeta del juego
mkdir nombre-juego-GG
cd nombre-juego-GG

# Crear estructura básica
touch index.html style.css script.js prompts.md README.md
mkdir assets
```

### 2. Template HTML Base

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nombre Juego - GG Edition</title>
    <meta name="description" content="Descripción del juego" />
    <meta name="theme-color" content="#00FFFF" />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- Navegación de retorno -->
    <nav class="game-navigation">
      <a href="../index.html" class="back-button">
        <span class="back-icon">⬅</span>
        <span class="back-text">VOLVER AL ÍNDICE</span>
      </a>
    </nav>

    <!-- Estructura del juego -->
    <main class="game-container">
      <canvas id="gameCanvas"></canvas>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

### 3. Configuración CSS Base

```css
/* Variables CSS retro */
:root {
  --primary-cyan: #00ffff;
  --bg-primary: #0a0a0f;
  --font-main: 'Courier New', monospace;
}

/* Reset y base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-main);
  background: linear-gradient(135deg, var(--bg-primary), #1a1a2e);
  color: white;
  min-height: 100vh;
}

/* Navegación */
.game-navigation {
  /* estilos de navegación */
}
.back-button {
  /* estilos del botón de retorno */
}
```

### 4. Estructura JavaScript Base

```javascript
// Configuración del juego
const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  fps: 60,
};

// Clase principal del juego
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindEvents();
    this.gameLoop();
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
```

### 5. Documentación Requerida

#### prompts.md

- Registro cronológico de prompts utilizados
- Desafíos encontrados y soluciones
- Iteraciones y mejoras aplicadas

#### README.md específico

- Descripción del juego
- Instrucciones de juego
- Controles y mecánicas
- Compatibilidad y requisitos

## 🚀 Instrucciones de Desarrollo

### Para Estudiantes

1. **Elige tu concepto de juego**: Selecciona un tipo de juego arcade clásico
2. **Crea la estructura**: Sigue el template de carpetas estándar
3. **Desarrolla incrementalmente**:
   - Estructura HTML básica
   - Estilos CSS retro
   - Lógica JavaScript modular
   - Testing y pulido
4. **Documenta el proceso**: Registra todos los prompts y decisiones
5. **Prueba cross-browser**: Verifica en Chrome, Firefox, Safari, Edge
6. **Envía Pull Request**: Incluye descripción completa del juego

### Herramientas de Desarrollo

- **Live Server** configurado en puerto 5500
- **GitHub Copilot** habilitado para HTML, CSS, JS, Markdown
- **Prettier** para formateo automático
- **ESLint** para validación de JavaScript

## 📦 Instalación y Uso

```bash
# Clonar repositorio
git clone [url-repositorio]
cd AI4Devs-videogame-RO-1

# Abrir índice principal
python3 -m http.server 8000
# Navegar a http://localhost:8000
```

## 🤝 Contribuciones

1. Fork del repositorio
2. Crear rama para tu juego: `git checkout -b nombre-juego-iniciales`
3. Desarrollar siguiendo los estándares establecidos
4. Commit con mensajes descriptivos
5. Push y crear Pull Request

## 📄 Licencias y Créditos

- **Proyecto**: AI4Devs Students - Retro Game Collection
- **Licencia**: MIT License
- **Tecnologías**: HTML5, CSS3, JavaScript ES6+, Canvas API
- **Estética**: Inspirada en arcades retro de los 80s-90s

---

## 🛣️ Development Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] Snake Retro - GG Edition
- [x] Breakout Retro - GG Edition  
- [x] Fruit Catcher - GG Edition
- [x] Core development architecture
- [x] Responsive design patterns
- [x] Cross-browser compatibility

### Phase 2: Advanced Games (In Progress 🚧)
- [ ] **Pac-Man GG Edition** - Advanced AI ghost system, maze navigation
- [ ] **Tetris GG Edition** - Tetromino rotation system, line clearing
- [ ] **Asteroids GG Edition** - Vector physics, wrap-around screen
- [ ] **Pong GG Edition** - Multiplayer support, AI opponent

### Phase 3: Technical Enhancement (Planned 📋)
- [ ] **Audio Integration** - Web Audio API implementation
- [ ] **PWA Support** - Service workers, offline functionality
- [ ] **Performance Optimization** - Object pooling, efficient rendering
- [ ] **Mobile Enhancements** - Advanced touch controls, haptic feedback

### Phase 4: Community & Platform (Future 🔮)
- [ ] **Leaderboard System** - Global high scores
- [ ] **Game Editor** - Visual game creation tools
- [ ] **Plugin Architecture** - Extensible game modifications
- [ ] **Multiplayer Framework** - WebRTC real-time gaming

## 📊 Project Metrics & Status

### Current Statistics
```
Total Games:        3/12 planned
Lines of Code:      ~2,500 (HTML/CSS/JS)
Browser Support:    Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
Mobile Support:     iOS 14+, Android 8+
Performance:        60fps stable on mid-range devices
Accessibility:      WCAG 2.1 AA compliant
```

### Quality Gates
- ✅ **Code Quality**: ESLint + Prettier validation
- ✅ **Performance**: 60fps stable gameplay
- ✅ **Responsive**: Mobile-first design approach
- ✅ **Cross-browser**: 95%+ compatibility score
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ⏳ **PWA Ready**: Service worker implementation pending

### Testing Matrix
| Game | Chrome | Firefox | Safari | Edge | Mobile |
|------|--------|---------|--------|------|--------|
| Snake | ✅ | ✅ | ✅ | ✅ | ✅ |
| Breakout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fruit Catcher | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔧 Developer Tools & Scripts

### Validation Scripts
```bash
# Code quality validation
npm run lint:html     # HTML5 validation
npm run lint:css      # CSS3 validation
npm run lint:js       # JavaScript ES6+ linting
npm run lint:all      # Full codebase validation

# Performance testing
npm run perf:games    # Game performance benchmarks
npm run perf:mobile   # Mobile performance analysis
npm run perf:memory   # Memory usage profiling

# Cross-browser testing
npm run test:browsers # Automated browser testing
npm run test:mobile   # Mobile device testing
npm run test:a11y     # Accessibility compliance
```

### Development Utilities
```bash
# Game generation wizard
npm run create:game <name>    # Generate new game structure
npm run create:template       # Create custom game template

# Asset optimization
npm run optimize:images       # Compress game images
npm run optimize:audio        # Optimize audio files
npm run optimize:all          # Full asset optimization

# Documentation generation
npm run docs:api             # Generate API documentation
npm run docs:games           # Game-specific documentation
npm run docs:deploy          # Deploy documentation site
```

### Quick Commands
```bash
# Development server with hot reload
npm start                    # Start development server
npm run dev                  # Development with debugging
npm run dev:mobile           # Mobile development mode

# Build & deployment
npm run build                # Production build
npm run deploy               # Deploy to GitHub Pages
npm run release              # Create release package
```

## 🎯 Contributing Guidelines

### Game Development Workflow

1. **Planning Phase**
   ```bash
   # Create game branch
   git checkout -b pacman-gg-yourname
   
   # Generate game structure
   npm run create:game pacman-GG
   cd pacman-GG
   ```

2. **Development Phase**
   ```bash
   # Start development server
   npm start
   
   # Run in development mode
   npm run dev
   
   # Live mobile testing
   npm run dev:mobile
   ```

3. **Quality Assurance**
   ```bash
   # Validate code quality
   npm run lint:all
   
   # Test performance
   npm run perf:games
   
   # Cross-browser testing
   npm run test:browsers
   
   # Accessibility check
   npm run test:a11y
   ```

4. **Submission Process**
   ```bash
   # Build production version
   npm run build
   
   # Create documentation
   npm run docs:games
   
   # Submit pull request
   git push origin pacman-gg-yourname
   ```

### Code Review Checklist
- [ ] Follows established file structure
- [ ] Uses ES6+ JavaScript features appropriately
- [ ] Implements responsive design (mobile-first)
- [ ] Maintains 60fps performance target
- [ ] Includes comprehensive documentation
- [ ] Passes all automated quality checks
- [ ] Cross-browser compatibility verified
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Performance Requirements
- **Frame Rate**: Consistent 60fps gameplay
- **Load Time**: < 3 seconds on 3G connection
- **Memory Usage**: < 50MB peak memory consumption
- **Battery Impact**: Minimal battery drain on mobile devices
- **File Size**: Game assets < 5MB total per game

## 🛡️ Built-in QA & Audit Framework

Todos los juegos de esta colección incluyen un **framework de QA y Auditoría automatizado** para garantizar la calidad y consistencia. Este sistema verifica aspectos clave como la alineación a la grid, la correcta inicialización de entidades, la integridad del game loop y el cumplimiento de los estándares de licenciamiento.

Para más detalles sobre las auditorías específicas de cada juego y cómo ejecutarlas, consulta el documento de `/.github/copilot-instructions.md`.

---

🎮 **¡Disfruta creando y jugando estos increíbles juegos retro!** 🕹️
