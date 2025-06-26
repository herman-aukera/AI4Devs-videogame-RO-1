<!-- © GG, MIT License -->
# 🟡 PAC-MAN GG - WORK IN PROGRESS

> **⚠️ STATUS: WIP - PARTIAL FUNCTIONALITY**  
> Currently only Blinky (red ghost) AI is working. Other ghosts remain stuck in ghost house.  
> **Experiencia arcade clásica con IA avanzada de fantasmas y tecnologías web modernas**

## 🎮 Descripción del Juego

PAC-MAN GG es una implementación completa y fiel del clásico juego arcade de 1980, desarrollada con HTML5 Canvas, JavaScript ES6+ y CSS3. Esta versión presenta gráficos pixelados auténticos, un sistema avanzado de IA para los fantasmas, controles responsive y una experiencia de juego optimizada para dispositivos modernos.

### ✨ Características Principales

- **🧠 IA Avanzada de Fantasmas**: Cada fantasma tiene una personalidad única y comportamiento específico
- **🎯 Laberinto Clásico**: Recreación exacta del mapa original 19x21
- **📱 Responsive Design**: Adaptado para desktop, tablet y móvil
- **🎵 Audio Procedural**: Sonidos generados con Web Audio API
- **🏆 Sistema de Puntuación**: Scoring clásico con multiplicadores
- **💾 Persistencia Local**: High scores guardados en localStorage
- **⌨️ Controles Múltiples**: Teclado, WASD y controles táctiles

## 🕹️ Controles del Juego

### Teclado
- **↑ ↓ ← →** o **W A S D**: Mover Pac-Man
- **SPACE** o **P**: Pausar/Reanudar juego
- **R**: Reiniciar juego

### Móvil/Táctil
- **Swipe gestures**: Deslizar en la dirección deseada
- **D-Pad virtual**: Controles direccionales en pantalla
- **Botones de acción**: Pausa y reinicio

## 👻 Sistema de Fantasmas

Cada fantasma implementa algoritmos de IA únicos basados en el juego original:

### 🔴 Blinky (Rojo) - "Shadow"
- **Comportamiento**: Persecución directa agresiva
- **Target**: Posición actual de Pac-Man
- **Personalidad**: El más rápido y directo

### 🩷 Pinky (Rosa) - "Speedy"
- **Comportamiento**: Emboscadas anticipadas
- **Target**: 4 celdas adelante de Pac-Man
- **Personalidad**: Estratega táctica

### 🩵 Inky (Cian) - "Bashful"
- **Comportamiento**: Complejo e impredecible
- **Target**: Calculado usando posición de Blinky y Pac-Man
- **Personalidad**: Indirecto y calculador

### 🟠 Clyde (Naranja) - "Pokey"
- **Comportamiento**: Errático según distancia
- **Target**: Pac-Man cuando está lejos, esquina cuando está cerca
- **Personalidad**: Tímido e inconsistente

## 🎯 Sistema de Puntuación

| Elemento | Puntos | Descripción |
|----------|--------|-------------|
| Pellet pequeño | 10 pts | Comida básica |
| Power Pellet | 50 pts | Activa modo vulnerable |
| 1er Fantasma | 200 pts | Primer fantasma en secuencia |
| 2do Fantasma | 400 pts | Multiplicador x2 |
| 3er Fantasma | 800 pts | Multiplicador x4 |
| 4to Fantasma | 1600 pts | Multiplicador x8 |

## 🛠️ Arquitectura Técnica

### Clases Principales

```javascript
// Gestión de vectores y posiciones
class Vector2D

// Administración del laberinto y colisiones
class MazeManager

// Lógica del jugador principal
class PacManPlayer

// Sistema de IA individual para cada fantasma
class GhostAI

// Motor principal del juego
class PacmanGame

// Loop de juego optimizado
class GameEngine

// Gestión de audio opcional
class AudioManager

// Entrada unificada (teclado + táctil)
class InputManager

// Interfaz de usuario y HUD
class GameUI
```

### Tecnologías Utilizadas

- **HTML5 Canvas**: Renderizado de gráficos 2D
- **JavaScript ES6+**: Classes, arrow functions, async/await
- **CSS3**: Grid, Flexbox, custom properties, animations
- **Web Audio API**: Sonidos procedurales (opcional)
- **LocalStorage**: Persistencia de puntuaciones
- **RequestAnimationFrame**: Loop de juego a 60fps

## 🚀 Instalación y Uso

### Requisitos
- Navegador moderno con soporte ES6+
- Resolución mínima: 320px de ancho

### Instalación Local
```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd pacman-GG

# Servir archivos (cualquier servidor HTTP)
python3 -m http.server 8000
# o
npx http-server
# o
live-server
```

### Uso Directo
Abrir `index.html` directamente en el navegador (funcionalidad limitada debido a CORS)

## � Mecánicas de Juego

### Objetivos
1. **Primario**: Comer todos los pellets del laberinto
2. **Secundario**: Evitar colisiones con fantasmas
3. **Bonus**: Maximizar puntuación comiendo fantasmas vulnerables

### Estados del Juego
- **Normal**: Fantasmas en modo persecución/scatter
- **Power Mode**: Fantasmas vulnerables (azules) por tiempo limitado
- **Paused**: Juego pausado por el usuario
- **Game Over**: Sin vidas restantes

### Progresión
- **Nivel 1-∞**: Aumenta velocidad de fantasmas gradualmente
- **Vidas**: 3 vidas iniciales
- **Continuidad**: Reinicio automático de posiciones tras muerte

## 📊 Rendimiento

### Optimizaciones Implementadas
- **Collision Detection**: Algoritmos eficientes de colisión
- **Canvas Rendering**: Minimización de redraws
- **Memory Management**: Gestión cuidadosa de objetos
- **60fps Target**: RequestAnimationFrame con delta time

### Métricas Objetivo
- **FPS**: 60fps constantes
- **Latencia Input**: < 16ms
- **Memoria**: < 50MB uso estable
- **Carga Inicial**: < 2 segundos

## 🔧 Configuración Avanzada

### Variables CSS Personalizables
```css
:root {
  --pacman-yellow: #FFFF00;
  --ghost-red: #FF0000;
  --maze-blue: #2121DE;
  --game-speed: 4px; /* píxeles por frame */
}
```

### Configuración JavaScript
```javascript
const GAME_CONFIG = {
  maze: { width: 19, height: 21, cellSize: 20 },
  speed: { pacman: 4, ghost: 3 },
  scoring: { pellet: 10, powerPellet: 50, ghost: 200 }
};
```

## 🐛 Debugging y Desarrollo

### Debug Mode
```javascript
// Activar en consola
window.DEBUG = true;
```

Muestra información adicional:
- FPS counter
- Estado de fantasmas
- Posiciones de entidades
- Collision boxes

### Logging
```javascript
// Niveles de log disponibles
console.log('Game state:', game.gameState);
console.log('Ghost modes:', ghosts.map(g => g.mode));
```

### Desarrollo

#### QA Audit System (Modo Desarrollo)
El juego incluye un sistema de auditoría automática que se ejecuta cuando está en modo desarrollo (localhost). Proporciona verificaciones pixel-perfect y validaciones de integridad.

**Acceso a Herramientas de Debug:**
```javascript
// En consola del navegador (localhost solamente)
runAudit()                    // Ejecutar auditoría completa 
game.runAuditTasks()         // Método alternativo de auditoría
game.pacman.position         // Verificar posición de Pac-Man
game.entities.length         // Contar entidades (debe ser 5)
game.gameState              // Estado actual del juego
```

**Verificaciones Automáticas:**
- ✅ Alineación pixel-perfect en grid 20x20px
- ✅ Conteo de entidades (1 Pac-Man + 4 fantasmas)
- ✅ Validación de dimensiones de canvas
- ✅ Verificación de IA de fantasmas activa  
- ✅ Headers de licencia MIT presentes
- ✅ Navegación de retorno funcional

### Team
```markdown
## 🔮 Futuras Mejoras

### Versión 2.0 (Planificada)
- [ ] **Múltiples niveles**: Laberintos adicionales
- [ ] **Power-ups**: Elementos especiales
- [ ] **Multijugador**: Modo cooperativo local
- [ ] **Themes**: Temas visuales alternativos
- [ ] **Leaderboards**: Puntuaciones online
- [ ] **PWA**: Aplicación web progresiva
- [ ] **WebGL**: Renderizado acelerado

### Mejoras de Accesibilidad
- [ ] **Screen Reader**: Soporte para lectores de pantalla
- [ ] **High Contrast**: Modo de alto contraste
- [ ] **Keyboard Navigation**: Navegación completa por teclado
- [ ] **Audio Cues**: Indicadores auditivos opcionales

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Créditos

### Inspiración Original
- **Namco**: Pac-Man original (1980)
- **Toru Iwatani**: Creador original del concepto

### Desarrollo
- **AI4Devs Team**: Implementación y adaptación moderna
- **Community**: Testing y feedback

---

## 🎮 ¡A Jugar!

**¿Listo para la nostalgia arcade?** Abre el juego y demuestra tus habilidades esquivando fantasmas mientras comes todos los pellets. ¡Que comience la diversión retro!

```
🟡 ← → → ↑ ↓ → 👻👻👻👻
WAKKA WAKKA WAKKA!
```
<!-- TODO: Describe las mecánicas específicas de tu juego -->
1. [Describe la mecánica principal]
2. [Sistema de puntuación]
3. [Condiciones de victoria/derrota]
4. [Power-ups o elementos especiales]

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y Canvas API
- **CSS3**: Variables, Grid, Flexbox, animaciones
- **JavaScript ES6+**: Classes, modules, async/await
- **Canvas 2D**: Rendering de gráficos del juego
- **Local Storage**: Persistencia de high scores
- **Web Audio API**: Efectos de sonido (opcional)

## 📋 Estructura del Proyecto

```
pacman-GG/
├── index.html      # Estructura principal del juego
├── style.css       # Estilos retro responsivos
├── script.js       # Lógica del juego y engine
├── prompts.md      # Registro de desarrollo
├── README.md       # Este archivo
└── assets/         # Recursos del juego
    ├── images/     # Sprites e imágenes
    ├── sounds/     # Efectos de sonido
    └── fonts/      # Fuentes personalizadas
```

## 🚀 Instalación y Ejecución

### Ejecución Local
```bash
# Clonar el repositorio principal
git clone [url-repositorio]
cd AI4Devs-videogame-RO-1

# Iniciar servidor local
python3 -m http.server 8000

# Navegar a http://localhost:8000/pacman-GG/
```

### Live Server (Recomendado para desarrollo)
```bash
# Con Live Server extension en VS Code
# Click derecho en index.html > "Open with Live Server"
```

## 🎨 Personalización

### Colores y Tema
Modifica las variables CSS en `style.css`:
```css
:root {
  --primary-cyan: #00ffff;
  --primary-magenta: #ff00ff;
  --accent-color: #your-color;
}
```

### Configuración del Juego
Ajusta parámetros en `script.js`:
```javascript
const GAME_CONFIG = {
  game: {
    speed: { initial: 100, increment: 5 },
    scoring: { base: 10, multiplier: 1.5 },
  }
};
```

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos Móviles
- ✅ iOS 14+ (Safari, Chrome)
- ✅ Android 8+ (Chrome, Firefox)
- ✅ Tablets (iPad, Android tablets)

### Resoluciones Testadas
- 📱 Mobile: 375x667px (iPhone SE)
- 📱 Mobile: 414x896px (iPhone 11)
- 📱 Tablet: 768x1024px (iPad)
- 💻 Desktop: 1920x1080px
- 💻 Desktop: 2560x1440px

## 🔧 Desarrollo

### Arquitectura del Código
- **GameEngine**: Loop principal y gestión de estados
- **PacmanGame**: Lógica específica del juego
- **InputManager**: Manejo unificado de controles
- **PerformanceMonitor**: Monitoreo de FPS y rendimiento
- **AudioManager**: Sistema de audio (opcional)

### Patrones de Diseño Utilizados
- **State Machine**: Gestión de estados del juego
- **Observer Pattern**: Sistema de eventos de input
- **Object Pool**: Optimización de objetos (si aplica)
- **Component System**: Entidades modulares (si aplica)

### Debugging
```javascript
// Activar modo debug (localhost automático)
// F12 > Console para ver logs de desarrollo
console.log(window.gameEngine); // Acceso al engine principal
```

### QA Audit System (Modo Desarrollo)
El juego incluye un sistema de auditoría automática que se ejecuta cuando está en modo desarrollo (localhost). Proporciona verificaciones pixel-perfect y validaciones de integridad.

**Acceso a Herramientas de Debug:**
```javascript
// En consola del navegador (localhost solamente)
runAudit()                    // Ejecutar auditoría completa 
game.runAuditTasks()         // Método alternativo de auditoría
game.pacman.position         // Verificar posición de Pac-Man
game.entities.length         // Contar entidades (debe ser 5)
game.gameState              // Estado actual del juego
```

**Verificaciones Automáticas:**
- ✅ Alineación pixel-perfect en grid 20x20px
- ✅ Conteo de entidades (1 Pac-Man + 4 fantasmas)
- ✅ Validación de dimensiones de canvas
- ✅ Verificación de IA de fantasmas activa  
- ✅ Headers de licencia MIT presentes
- ✅ Navegación de retorno funcional

## 📊 Métricas de Performance

### Objetivos de Rendimiento
- **FPS**: 60fps estables en dispositivos de gama media
- **Memoria**: < 50MB uso pico
- **Carga**: < 3 segundos en conexión 3G
- **Batería**: Impacto mínimo en dispositivos móviles

### Optimizaciones Implementadas
- Pooling de objetos para entidades frecuentes
- RequestAnimationFrame para loops eficientes
- Canvas optimizations (dirty rectangles si aplica)
- Throttling de eventos de input
- Lazy loading de assets

## 🐛 Solución de Problemas

### Problemas Comunes

**El juego no carga**
- Verificar que se ejecuta desde un servidor HTTP
- Comprobar errores en consola del navegador
- Verificar compatibilidad del navegador

**Lag o FPS bajos**
- Cerrar otras pestañas del navegador
- Verificar que no hay aplicaciones pesadas ejecutándose
- Reducir resolución de pantalla si es necesario

**Controles no responden**
- Verificar que el canvas tiene focus
- Comprobar que JavaScript está habilitado
- En móvil, verificar que el touch funciona

**Audio no funciona**
- Verificar que el volumen está activado
- Algunos navegadores requieren interacción del usuario para audio
- Click en el juego antes de que inicie el audio

## 🤝 Contribuciones

### Para Contribuir
1. Fork del repositorio principal
2. Crear rama: `git checkout -b feature/mejora-pacman`
3. Implementar cambios siguiendo los estándares
4. Testing en múltiples navegadores
5. Commit con mensajes descriptivos
6. Push y crear Pull Request

### Estándares de Código
- JavaScript ES6+ con JSDoc comments
- CSS con variables y mobile-first
- HTML5 semántico con accesibilidad
- Commits en español, código en inglés
- Performance: mantener 60fps

## 📄 Licencia y Créditos

- **Proyecto**: AI4Devs Students - Retro Game Collection
- **Licencia**: MIT License
- **Autor**: [Tu Nombre]
- **Versión**: 1.0.0
- **Última Actualización**: 21/6/2025

## 🔗 Enlaces

- [🏠 Índice Principal](../index.html)
- [📖 Guía Técnica](../TECHNICAL_GUIDE.md)
- [🎮 Otros Juegos](../)
- [📝 Documentación del Desarrollo](./prompts.md)

---

## 📄 Licencia

MIT License © GG

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

🎮 **¡Disfruta jugando Pacman!** 🕹️