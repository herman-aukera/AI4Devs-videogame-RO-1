<!--
Fruit Catcher - Retro Arcade Game
Copyright (c) 2025 GG
Licensed under the MIT License
-->

# 🍎 Fruit Catcher - Juego de Atrapar Frutas

Un emocionante juego retro-arcade donde debes atrapar las frutas que caen del cielo con tu cesta. ¡Desarrolla tus reflejos y alcanza la puntuación más alta!

## 🎮 Descripción del Juego

**Fruit Catcher** es un juego de habilidad y reflejos donde controlas una cesta que debe atrapar las frutas que caen desde la parte superior de la pantalla. El juego aumenta progresivamente su dificultad, haciendo que las frutas caigan más rápido conforme avanza el tiempo.

### Características Principales

- 🎯 **Gameplay Adictivo**: Mecánica simple pero desafiante
- 📱 **Responsive Design**: Funciona perfectamente en móvil, tablet y escritorio
- 🎨 **Estética Retro**: Diseño arcade clásico con efectos modernos
- ⚡ **Rendimiento Optimizado**: 60fps fluidos en todos los dispositivos
- 🏆 **Sistema de Puntuación**: High score persistente con localStorage
- 🎵 **Efectos Visuales**: Partículas, screen shake y animaciones suaves

## 🕹️ Controles

### Teclado (Desktop)

- **Flechas Izquierda/Derecha** o **A/D**: Mover la cesta
- **Spacebar**: Pausar/Reanudar juego
- **Enter**: Iniciar nuevo juego

### Touch (Móvil/Tablet)

- **Tocar lado izquierdo**: Mover cesta a la izquierda
- **Tocar lado derecho**: Mover cesta a la derecha
- **Tocar botón pausa**: Pausar/Reanudar
- **Tocar "Nuevo Juego"**: Reiniciar partida

## 🎯 Cómo Jugar

1. **Objetivo**: Atrapa tantas frutas como puedas con tu cesta
2. **Movimiento**: Usa los controles para mover la cesta horizontalmente
3. **Puntuación**: Cada fruta atrapada suma puntos a tu score
4. **Dificultad**: El juego se vuelve más rápido con el tiempo
5. **Game Over**: El juego termina cuando dejas caer muchas frutas
6. **High Score**: Tu mejor puntuación se guarda automáticamente

## 🏗️ Arquitectura Técnica

### Tecnologías Utilizadas

- **HTML5**: Estructura semántica con Canvas API
- **CSS3**: Diseño responsivo con variables CSS y animaciones
- **JavaScript ES6+**: Programación orientada a objetos moderna
- **Canvas 2D**: Renderizado eficiente del juego
- **LocalStorage**: Persistencia de datos del usuario

### Estructura de Clases

```javascript
// Clase principal del juego
class FruitCatcherGame {
    constructor(canvas)
    init()
    gameLoop()
    update(deltaTime)
    render()
}

// Entidad del jugador
class Player {
    constructor(x, y, width, height)
    update(input, deltaTime)
    render(ctx)
}

// Frutas que caen
class Fruit {
    constructor(x, y, type)
    update(deltaTime)
    render(ctx)
}

// Sistema de manejo de input
class InputHandler {
    constructor()
    handleKeyDown(event)
    handleTouch(event)
}
```

### Performance y Optimización

- **60fps consistentes** con `requestAnimationFrame`
- **Gestión eficiente de memoria** con object pooling
- **Algoritmos optimizados** para detección de colisiones
- **Renderizado selectivo** para minimizar redraws
- **Event delegation** para controles táctiles

## 📱 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Dispositivos Testados

- ✅ iPhone (iOS 13+)
- ✅ Android (Chrome Mobile)
- ✅ iPad/Tablets
- ✅ Desktop (Windows/Mac/Linux)

## 🚀 Instalación y Desarrollo

### Instalación Local

1. **Clonar el repositorio:**

   ```bash
   git clone [repository-url]
   cd AI4Devs-videogame-RO-1/fruit-catcher-GG
   ```

2. **Servir localmente:**

   ```bash
   # Con Python
   python -m http.server 8000

   # Con Node.js
   npx serve .

   # Con VS Code Live Server
   # Abrir index.html y usar la extensión Live Server
   ```

3. **Abrir en navegador:**
   ```
   http://localhost:8000
   ```

### Estructura del Proyecto

```
fruit-catcher-GG/
├── index.html          # Punto de entrada del juego
├── style.css           # Estilos y diseño responsivo
├── script.js           # Lógica completa del juego
├── prompts.md          # Historial de desarrollo
├── README.md           # Esta documentación
└── assets/             # Recursos del juego
    ├── images/         # Sprites y gráficos
    ├── sounds/         # Efectos de sonido
    └── fonts/          # Tipografías personalizadas
```

## 🎨 Diseño y UX

### Paleta de Colores

- **Primario**: `#00ff88` (Verde neón)
- **Secundario**: `#ff6b6b` (Rojo coral)
- **Acento**: `#4ecdc4` (Turquesa)
- **Fondo**: Gradiente oscuro espacial
- **Texto**: `#ffffff` con opacidades variables

### Tipografía

- **Título**: 'Orbitron' (Futurista/Sci-fi)
- **UI**: 'Rajdhani' (Limpia y legible)
- **Monospace**: Fallback para compatibilidad

### Efectos Visuales

- **Partículas**: Sistema de partículas para feedback
- **Screen Shake**: Impacto visual en eventos importantes
- **Gradientes**: Fondos dinámicos y atmosféricos
- **Animaciones**: Transiciones suaves con easing

## 📈 Roadmap Futuro

### Versión 1.1 - Mejoras de Audio

- [ ] Integración de Web Audio API
- [ ] Efectos de sonido retro
- [ ] Música de fondo atmosférica
- [ ] Control de volumen

### Versión 1.2 - Gameplay Extendido

- [ ] Power-ups y bonificaciones
- [ ] Múltiples tipos de frutas
- [ ] Sistema de vidas/health
- [ ] Niveles con temáticas únicas

### Versión 1.3 - Características Sociales

- [ ] Leaderboard online
- [ ] Sharing en redes sociales
- [ ] Sistema de achievements
- [ ] Modo multijugador cooperativo

## 🤝 Contribución

Este proyecto forma parte de la colección **AI4Devs Retro Web Games**. Las contribuciones son bienvenidas siguiendo las guías de desarrollo establecidas.

### Guías de Contribución

1. Seguir el [Technical Guide](../TECHNICAL_GUIDE.md)
2. Mantener compatibilidad cross-browser
3. Documentar cambios en `prompts.md`
4. Usar ES6+ y mejores prácticas modernas
5. Priorizar rendimiento y accesibilidad

## 📄 Licencia

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](../LICENSE) en la raíz del repositorio para más detalles.

**Copyright (c) 2025 GG**

---

**¡Disfruta jugando Fruit Catcher y bate tu propio récord!** 🏆

[🏠 Volver al Índice Principal](../index.html)
