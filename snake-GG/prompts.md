# Snake Game - Prompts de Desarrollo (GG)

## 📝 Prompt Inicial

```
Actúa como **desarrollador web y diseñador de minijuegos retro** experto en HTML5, CSS3 y JavaScript. Tus iniciales son **GG**.

## 📂 Contexto
- Repositorio base: `https://github.com/herman-aukera/AI4Devs-videogame-RO-1.git`
- Carpeta destino para tu Snake: `snake-GG`
- Referencia: `snake-EHS` (ejemplo ya existente)

## 🎯 Objetivos
1. **Estructura del proyecto**
   - Crear carpeta `snake-GG` en la raíz del repo.
   - Dentro, incluir:
     - `index.html` → estructura del juego Snake.
     - `style.css`   → estilos (grid o canvas responsivo).
     - `script.js`   → lógica de juego:
       - Captura de teclas (arriba, abajo, izquierda, derecha).
       - Bucle de actualización (move, grow, colisiones consigo mismo y bordes).
       - Dibujo en canvas o DIVs.
       - Control de velocidad y puntuación.
     - `prompts.md`  → registro de todos los prompts usados y notas de ajuste.
     - `assets/`     → sprites o imágenes opcionales (comida, fondo).

2. **Implementación del Snake clásico**
   - Tamaño de celda de 20×20 px, área de juego de 20×20 celdas.
   - La "comida" aparece aleatoriamente en celdas libres.
   - Al comer, la serpiente crece y la velocidad aumenta ligeramente.
   - Game Over si choca contra sí misma o bordes.

3. **Desarrollo paso a paso**
   - Estructura semántica en HTML.
   - Estilos CSS para centrar canvas y mostrar puntuación.
   - JavaScript modular:
     - Módulo de control de teclado.
     - Módulo de estado del juego.
     - Módulo de renderizado.
     - Módulo de lógica de colisiones.

4. **Documentación de prompts**
   - En `snake-GG/prompts.md` anota:
     - Prompt inicial para estructura básica.
     - Prompt concreto para lógica de movimiento.
     - Prompt para detección y manejo de colisiones.
     - Ajustes realizados y resultados obtenidos.

5. **Pruebas y compatibilidad**
   - Probar en Chrome, Firefox, Edge y Safari.
   - Documentar en README de `snake-GG` los ajustes por navegador.

6. **Pull Request**
   - Crear rama `solved-videogame-snake-GG`.
   - Commit y push de `snake-GG`.
   - Abrir PR contra `main` con título:
     > `GG: Añadir Snake retro en JavaScript`
   - Descripción del PR:
     - Instrucciones de juego ("flechas para mover…").
     - Capturas de pantalla (si es posible).

---

**Ahora, genera los archivos completos**:
- `snake-GG/index.html`
- `snake-GG/style.css`
- `snake-GG/script.js`
- `snake-GG/prompts.md`

Prueba que todo funcione de principio a fin. es mas empieza con las pruebas y copia este prompt como prompt inicial.
```

## 🔄 Proceso de Desarrollo

### ✅ Estructura Base

- [x] Crear carpeta `snake-GG` con subcarpeta `assets`
- [x] Documentar prompt inicial en `prompts.md`
- [x] Implementar HTML semántico
- [x] Crear estilos CSS responsivos
- [x] Desarrollar lógica JavaScript modular
- [x] Crear archivo README.md con documentación completa

### 🎮 Características Implementadas

- **Canvas**: 400x400px (20x20 celdas de 20px) - Responsive
- **Controles**: Flechas del teclado + Espacio para pausa
- **Mecánicas**: Crecimiento, velocidad, colisiones, niveles
- **UI**: Puntuación, nivel, velocidad, game over, reinicio
- **Efectos**: Animaciones CSS, efectos visuales, grid
- **Arquitectura**: Clase principal modular, configuración externa

### 🛠️ Ajustes y Mejoras Realizadas

#### Prompt 2: Estructura HTML Semántica

```
Crear estructura HTML5 semántica para el juego Snake con:
- Header con título y subtítulo
- Panel de información (score, level, speed)
- Canvas principal para el juego
- Pantallas de inicio y game over
- Controles visuales y footer
- Elementos accesibles y responsive
```

#### Prompt 3: Estilos CSS Retro Responsivos

```
Diseñar CSS3 con estética retro que incluya:
- Variables CSS para colores neón y tipografía monoespaciada
- Diseño responsive para móvil, tablet y desktop
- Animaciones (glow, pulse, hover effects)
- Grid de controles visual
- Gradientes y sombras brillantes
- Utilidades y estados (hidden, pulse)
```

#### Prompt 4: JavaScript Modular ES6+

```
Implementar lógica del juego Snake con arquitectura modular:
- Clase principal SnakeGame con métodos organizados
- Sistema de configuración externa
- Bucle de juego optimizado con requestAnimationFrame
- Módulos: input, colisiones, renderizado, UI
- Canvas API para dibujo suave
- Sistema de niveles y efectos visuales
- Responsive canvas adjustment
```

## 🧪 Pruebas de Compatibilidad

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 📋 Notas de Desarrollo

- Opción por Canvas HTML5 para mejor rendimiento
- Arquitectura modular para fácil mantenimiento
- Estilo retro con colores clásicos
