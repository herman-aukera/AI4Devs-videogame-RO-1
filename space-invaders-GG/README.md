# SpaceInvaders - GG Edition

## 🎮 Descripción del Juego

SpaceInvaders es una implementación moderna del clásico juego arcade, desarrollado como parte de la colección AI4Devs Retro Web Games. Combina la nostalgia de los juegos retro con tecnologías web modernas y un diseño responsivo.

## 🕹️ Características

- **Gráficos Retro**: Estética neon arcade de los años 80-90
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Controles Unificados**: Teclado (WASD/Arrows) + controles táctiles
- **Sistema de Puntuación**: Puntuación progresiva con high score persistente
- **Efectos Visuales**: Animaciones fluidas y efectos de partículas
- **Audio Opcional**: Soporte para efectos de sonido y música
- **Performance**: 60fps estables en dispositivos de gama media

## 🎯 Cómo Jugar

### Controles de Teclado
- **↑↓←→ / WASD**: Movimiento/Dirección
- **ESPACIO**: Pausar/Reanudar o Acción principal
- **R**: Reiniciar juego
- **ESC**: Menú principal

### Controles Móviles
- **D-Pad Virtual**: Movimiento en pantallas táctiles
- **Botones de Acción**: Pausa y reinicio
- **Swipe Gestures**: Gestos de deslizamiento (opcional)

### Mecánicas del Juego
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
space-invaders-GG/
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

# Navegar a http://localhost:8000/space-invaders-GG/
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
- **SpaceInvadersGame**: Lógica específica del juego
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
2. Crear rama: `git checkout -b feature/mejora-space-invaders`
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
- **Última Actualización**: 22/6/2025

## 🔗 Enlaces

- [🏠 Índice Principal](../index.html)
- [📖 Guía Técnica](../TECHNICAL_GUIDE.md)
- [🎮 Otros Juegos](../)
- [📝 Documentación del Desarrollo](./prompts.md)

---

🎮 **¡Disfruta jugando SpaceInvaders!** 🕹️