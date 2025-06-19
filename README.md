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

**Estado**: 🚧 Próximamente  
**Carpeta**: `fruit-catcher-GG/` (pendiente)  
**Descripción**: Juego de captura de frutas con física de caída y desafío de tiempo.

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

🎮 **¡Disfruta creando y jugando estos increíbles juegos retro!** 🕹️
