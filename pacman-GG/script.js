/* © GG, MIT License */
/**
 * Pac-Man GG - Retro Arcade Game
 * Implementación completa con ES6+, Canvas HTML5 y IA avanzada para fantasmas
 * 
 * Arquitectura modular:
 * - MazeGenerator: Generación y gestión del laberinto clásico 19x21
 * - PacManPlayer: Lógica del jugador con controles fluidos
 * - GhostAI: Sistema de IA para 4 fantasmas únicos (Blinky, Pinky, Inky, Clyde)
 * - GameEngine: Motor principal con loop a 60fps optimizado
 * - AudioManager: Sistema de audio Web API con fallback Safari
 * - TouchManager: Controles táctiles para dispositivos móviles
 */

// ===========================================
// CONFIGURACIÓN DEL JUEGO
// ===========================================

const GAME_CONFIG = {
  maze: {
    width: 19,    // Celdas horizontales clásicas
    height: 21,   // Celdas verticales clásicas
    cellSize: 20, // Píxeles por celda
  },
  canvas: {
    width: 380,   // 19 * 20 pixels (matches CELL_SIZE)
    height: 420,  // 21 * 20 pixels (matches CELL_SIZE)
  },
  game: {
    fps: 60,
    speed: {
      pacman: 1,        // celdas por frame (grid-aligned movement)
      ghost: 1,         // celdas por frame (grid-aligned movement)
      pelletFlash: 8,   // frames por parpadeo de power pellet
    },
    scoring: {
      pellet: 10,
      powerPellet: 50,
      ghost: 200,       // base score for eating ghost
      fruit: 100,
      ghostMultiplier: 2, // multiplies for each ghost eaten in sequence
    },
    lives: 3,
    powerPelletDuration: 600, // frames (10 segundos a 60fps) - FLEE duration
    timing: {
      scatter: 420,   // 7 segundos a 60fps - SCATTER duration
      chase: 1200,    // 20 segundos a 60fps - CHASE duration
    },
  },
  controls: {
    keyboard: {
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'], 
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      start: ['Enter'],
      pause: ['Space', 'KeyP'],
      restart: ['KeyR'],
    },
  },
  colors: {
    maze: '#0000FF',      // Azul clásico del laberinto
    pellet: '#FFFF00',    // Amarillo para pellets
    powerPellet: '#FFFF00',
    pacman: '#FFFF00',    // Amarillo Pac-Man
    ghosts: {
      blinky: '#FF0000',  // Rojo
      pinky: '#FFB8FF',   // Rosa
      inky: '#00FFFF',    // Cian
      clyde: '#FFB852',   // Naranja
    },
    vulnerable: '#0000FF', // Azul cuando son vulnerables
    background: '#000000', // Negro
    ui: '#FFFF00',        // Amarillo para UI
  }
};

// Per-Ghost Spawn Delays (in milliseconds)
const GHOST_SPAWN_DELAYS = {
  'blinky': 0,       // Releases immediately
  'pinky': 5000,     // 5 seconds
  'inky': 10000,     // 10 seconds  
  'clyde': 15000     // 15 seconds
};

// ===========================================
// LABERINTO CLÁSICO DE PAC-MAN
// ===========================================

const CLASSIC_MAZE = [
  "XXXXXXXXXXXXXXXXXXX",
  "X........X........X",
  "X.XX.XXX.X.XXX.XX.X",
  "XO..O...O.O...O..OX",
  "X.XX.X.XXXXX.X.XX.X",
  "X....X...X...X....X",
  "XXXX.XXX.X.XXX.XXXX",
  "   X.X.......X.X   ",
  "XXXX.X.XX XX.X.XXXX",
  "X......X   X......X",
  "XXXX.X.XXXXX.X.XXXX",
  "   X.X.......X.X   ",
  "XXXX.XXX.X.XXX.XXXX",
  "X....X...X...X....X",
  "X.XX.X.XXXXX.X.XX.X",
  "XO.X.....P.....X.OX",
  "XX.X.X.XXXXX.X.X.XX",
  "X....X...X...X....X",
  "X.XXXXXX.X.XXXXXX.X",
  "X.................X",
  "XXXXXXXXXXXXXXXXXXX"
];

// Leyenda del mapa:
// X = Pared, . = Pellet, O = Power Pellet, P = Posición inicial Pac-Man
// G = Posición inicial fantasmas, espacio = Corredor libre

// Grid constants for pixel-perfect alignment
const CELL_SIZE = GAME_CONFIG.maze.cellSize;

/**
 * Vector2D - Clase utilitaria para posiciones y direcciones GRID-ALIGNED
 */
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  // Conversión a índice de grid (grid coordinates)
  toGridIndex() {
    return {
      col: Math.floor(this.x / CELL_SIZE),
      row: Math.floor(this.y / CELL_SIZE)
    };
  }

  // Conversión desde índice de grid (pixel coordinates, centered)
  static fromGrid(col, row) {
    return new Vector2D(
      col * CELL_SIZE + CELL_SIZE / 2,
      row * CELL_SIZE + CELL_SIZE / 2
    );
  }

  // Snap to grid alignment
  snapToGrid() {
    const gridCol = Math.round(this.x / CELL_SIZE);
    const gridRow = Math.round(this.y / CELL_SIZE);
    return Vector2D.fromGrid(gridCol, gridRow);
  }
}

/**
 * MazeManager - Gestión del laberinto y colisiones
 */
class MazeManager {
  constructor() {
    this.maze = CLASSIC_MAZE;
    this.height = CLASSIC_MAZE.length;
    this.width = CLASSIC_MAZE[0].length;
    this.cellSize = GAME_CONFIG.maze.cellSize;
    this.pellets = new Set();
    this.powerPellets = new Set();
    this.initializePellets();
  }

  initializePellets() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.maze[row][col];
        if (cell === '.') {
          this.pellets.add(`${col},${row}`);
        } else if (cell === 'O') {
          this.powerPellets.add(`${col},${row}`);
        }
      }
    }
  }

  getCell(col, row) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return 'X'; // Fuera de límites = pared
    }
    return this.maze[row][col];
  }

  isWall(col, row) {
    return this.getCell(col, row) === 'X';
  }

  isWalkable(col, row) {
    const cell = this.getCell(col, row);
    return cell !== 'X' && cell !== ' ';
  }

  // Get center tile for Pac-Man starting position
  getCenterTile() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.maze[row][col] === 'P') {
          return { x: col, y: row };
        }
      }
    }
    // Fallback to center of maze
    return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
  }

  // Teleportación en túneles laterales
  handleTeleport(position) {
    const grid = position.toGridIndex(this.cellSize);
    
    // Túnel izquierdo -> derecho
    if (grid.col < 0) {
      return Vector2D.fromGrid(this.width - 1, grid.row, this.cellSize);
    }
    
    // Túnel derecho -> izquierdo
    if (grid.col >= this.width) {
      return Vector2D.fromGrid(0, grid.row, this.cellSize);
    }
    
    return position;
  }

  consumePellet(position) {
    const grid = position.toGridIndex(this.cellSize);
    const key = `${grid.col},${grid.row}`;
    
    if (this.pellets.has(key)) {
      this.pellets.delete(key);
      return { type: 'pellet', points: GAME_CONFIG.game.scoring.pellet };
    }
    
    if (this.powerPellets.has(key)) {
      this.powerPellets.delete(key);
      return { type: 'powerPellet', points: GAME_CONFIG.game.scoring.powerPellet };
    }
    
    return null;
  }

  getAllPelletsCollected() {
    return this.pellets.size === 0 && this.powerPellets.size === 0;
  }

  render(ctx) {
    // Renderizar paredes del laberinto
    ctx.fillStyle = GAME_CONFIG.colors.maze;
    ctx.lineWidth = 2;

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.getCell(col, row);
        const x = col * this.cellSize;
        const y = row * this.cellSize;

        if (cell === 'X') {
          ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
      }
    }

    // Renderizar pellets normales
    ctx.fillStyle = GAME_CONFIG.colors.pellet;
    this.pellets.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      const x = col * this.cellSize + this.cellSize / 2;
      const y = row * this.cellSize + this.cellSize / 2;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Renderizar power pellets (parpadeando)
    const shouldShow = Math.floor(Date.now() / 200) % 2 === 0;
    if (shouldShow) {
      ctx.fillStyle = GAME_CONFIG.colors.powerPellet;
      this.powerPellets.forEach(key => {
        const [col, row] = key.split(',').map(Number);
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
}

/**
 * PacManPlayer - Jugador principal con controles fluidos GRID-ALIGNED
 */
class PacManPlayer {
  constructor(startCol, startRow) {
    this.position = Vector2D.fromGrid(startCol, startRow);
    this.gridPosition = { col: startCol, row: startRow };
    this.direction = new Vector2D(0, 0); // Inicial: sin movimiento
    this.nextDirection = new Vector2D(0, 0); // Dirección deseada
    this.moving = false;
    this.moveTimer = 0;
    this.moveSpeed = 8; // frames per move (slower = easier to control)
    this.animationFrame = 0;
    this.mouthOpen = true;
  }

  // Utility method to convert direction to grid offset
  directionToOffset(direction) {
    let col = 0;
    let row = 0;
    
    if (direction.x > 0) col = 1;
    else if (direction.x < 0) col = -1;
    
    if (direction.y > 0) row = 1;
    else if (direction.y < 0) row = -1;
    
    return { col, row };
  }

  update(maze) {
    // Increment animation frame
    this.animationFrame++;
    if (this.animationFrame % 8 === 0) {
      this.mouthOpen = !this.mouthOpen;
    }

    // Handle grid-based movement
    if (!this.moving) {
      // Check if we can start moving in the desired direction
      if (!this.nextDirection.equals(new Vector2D(0, 0))) {
        const nextOffset = this.directionToOffset(this.nextDirection);
        const nextCol = this.gridPosition.col + nextOffset.col;
        const nextRow = this.gridPosition.row + nextOffset.row;
        
        if (maze.isWalkable(nextCol, nextRow)) {
          this.direction = this.nextDirection.clone();
          this.nextDirection = new Vector2D(0, 0);
          this.startMoving();
        }
      }
      
      // Continue in current direction if possible
      if (!this.direction.equals(new Vector2D(0, 0))) {
        const currentOffset = this.directionToOffset(this.direction);
        const nextCol = this.gridPosition.col + currentOffset.col;
        const nextRow = this.gridPosition.row + currentOffset.row;
        
        if (maze.isWalkable(nextCol, nextRow)) {
          this.startMoving();
        } else {
          this.direction = new Vector2D(0, 0); // Stop if can't continue
        }
      }
    } else {
      // Continue moving
      this.moveTimer++;
      
      if (this.moveTimer >= this.moveSpeed) {
        // Complete the move
        const moveOffset = this.directionToOffset(this.direction);
        this.gridPosition.col += moveOffset.col;
        this.gridPosition.row += moveOffset.row;
        
        // Handle teleportation
        if (this.gridPosition.col < 0) {
          this.gridPosition.col = maze.width - 1;
        } else if (this.gridPosition.col >= maze.width) {
          this.gridPosition.col = 0;
        }
        
        this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
        this.moving = false;
        this.moveTimer = 0;
      } else {
        // Interpolate position during movement - FIX: Corrected interpolation logic
        const progress = this.moveTimer / this.moveSpeed;
        const currentGridPos = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
        const targetOffset = this.directionToOffset(this.direction);
        const targetCol = this.gridPosition.col + targetOffset.col;
        const targetRow = this.gridPosition.row + targetOffset.row;
        const targetGridPos = Vector2D.fromGrid(targetCol, targetRow);
        
        this.position.x = currentGridPos.x + (targetGridPos.x - currentGridPos.x) * progress;
        this.position.y = currentGridPos.y + (targetGridPos.y - currentGridPos.y) * progress;
      }
    }
  }

  startMoving() {
    this.moving = true;
    this.moveTimer = 0;
  }

  setDirection(direction) {
    // Convert pixel direction to grid direction
    const gridOffset = this.directionToOffset(direction);
    const gridDir = new Vector2D(gridOffset.col, gridOffset.row);
    this.nextDirection = gridDir;
  }

  getGridPosition() {
    return this.gridPosition;
  }

  render(ctx) {
    const x = this.position.x;
    const y = this.position.y;
    const radius = GAME_CONFIG.maze.cellSize / 2 - 2;

    ctx.fillStyle = GAME_CONFIG.colors.pacman;
    ctx.beginPath();

    if (this.mouthOpen) {
      // Pac-Man con boca abierta
      let startAngle = 0;
      let endAngle = Math.PI * 2;

      // Determinar ángulo de la boca según dirección
      if (this.direction.x > 0) { // Derecha
        startAngle = Math.PI / 6;
        endAngle = -Math.PI / 6;
      } else if (this.direction.x < 0) { // Izquierda
        startAngle = Math.PI + Math.PI / 6;
        endAngle = Math.PI - Math.PI / 6;
      } else if (this.direction.y > 0) { // Abajo
        startAngle = Math.PI / 2 + Math.PI / 6;
        endAngle = Math.PI / 2 - Math.PI / 6;
      } else if (this.direction.y < 0) { // Arriba
        startAngle = -Math.PI / 2 + Math.PI / 6;
        endAngle = -Math.PI / 2 - Math.PI / 6;
      }

      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.lineTo(x, y);
    } else {
      // Pac-Man cerrado (círculo completo)
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.fill();
  }
}

/**
 * FruitBonus - Basic fruit system for Pac-Man
 */
class FruitBonus {
  constructor(maze) {
    this.maze = maze;
    this.active = false;
    this.position = null;
    this.fruitType = 'cherry';
    this.points = 100;
    this.spawnTimer = 0;
    this.lifetime = 600; // 10 seconds at 60fps
    this.spawnDelay = 1800; // 30 seconds between spawns
  }

  update() {
    if (!this.active) {
      this.spawnTimer++;
      if (this.spawnTimer >= this.spawnDelay) {
        this.spawnFruit();
      }
    } else {
      this.lifetime--;
      if (this.lifetime <= 0) {
        this.despawn();
      }
    }
  }

  spawnFruit() {
    // Spawn in the center of the maze
    this.position = { col: 9, row: 12 };
    this.active = true;
    this.lifetime = 600;
    this.fruitType = this.getRandomFruit();
    console.log(`🍎 Fruit spawned: ${this.fruitType} (${this.points} points)`);
  }

  despawn() {
    this.active = false;
    this.position = null;
    this.spawnTimer = 0;
  }

  getRandomFruit() {
    const fruits = ['cherry', 'strawberry', 'orange', 'apple', 'melon'];
    const values = [100, 300, 500, 700, 1000];
    const index = Math.floor(Math.random() * fruits.length);
    this.points = values[index];
    return fruits[index];
  }

  checkCollision(pacmanPosition) {
    if (!this.active || !this.position) return null;
    
    const pacmanGrid = pacmanPosition.toGridIndex();
    const distance = Math.abs(pacmanGrid.col - this.position.col) + 
                    Math.abs(pacmanGrid.row - this.position.row);
    
    if (distance < 1) {
      const points = this.points;
      this.despawn();
      return { type: 'fruit', points, fruitType: this.fruitType };
    }
    
    return null;
  }

  render(ctx) {
    if (!this.active || !this.position) return;
    
    const x = this.position.col * GAME_CONFIG.maze.cellSize + GAME_CONFIG.maze.cellSize / 2;
    const y = this.position.row * GAME_CONFIG.maze.cellSize + GAME_CONFIG.maze.cellSize / 2;
    
    // Flash when lifetime is low
    const shouldRender = this.lifetime > 120 || Math.floor(this.lifetime / 10) % 2 === 0;
    
    if (shouldRender) {
      ctx.fillStyle = this.getFruitColor();
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Simple fruit icon
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.getFruitIcon(), x, y + 4);
      ctx.textAlign = 'left';
    }
  }

  getFruitColor() {
    const colors = {
      cherry: '#FF0000',
      strawberry: '#FF69B4',
      orange: '#FFA500',
      apple: '#00FF00',
      melon: '#FFFF00'
    };
    return colors[this.fruitType] || '#FFFF00';
  }

  getFruitIcon() {
    const icons = {
      cherry: '🍒',
      strawberry: '🍓',
      orange: '🍊',
      apple: '🍎',
      melon: '🍈'
    };
    return icons[this.fruitType] || '🍎';
  }
}

/**
 * AudioManager - Sistema de audio con Web Audio API y fallback Safari
 */
class AudioManager {
  constructor() {
    this.webAudioSupported = false;
    this.context = null;
    this.sounds = new Map();
    this.masterVolume = 0.5;
    this.fallbackAudio = new Map(); // Para Safari < 14
    
    this.initializeAudio();
  }

  initializeAudio() {
    // Detectar soporte Web Audio API
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.context = new AudioContext();
        this.webAudioSupported = true;
        console.log('Web Audio API detectado y habilitado');
      }
    } catch (e) {
      console.log('Web Audio API no disponible, usando fallback HTML5 Audio');
      this.webAudioSupported = false;
    }

    // Safari fallback - crear elementos <audio> preloaded
    if (!this.webAudioSupported) {
      this.createFallbackAudio();
    }
  }

  createFallbackAudio() {
    const audioFiles = {
      'pellet': this.createBeepAudio(800, 0.1),
      'powerPellet': this.createBeepAudio(200, 0.3),
      'eatGhost': this.createBeepAudio(400, 0.5),
      'death': this.createBeepAudio(150, 1.0),
      'extraLife': this.createBeepAudio(1000, 0.8),
      'fruit': this.createBeepAudio(660, 0.4),
    };

    Object.entries(audioFiles).forEach(([name, audioElement]) => {
      this.fallbackAudio.set(name, audioElement);
    });
  }

  createBeepAudio(frequency, duration) {
    // Crear audio procedural simple para fallback
    const audio = new Audio();
    
    // Generar un tono simple como data URL
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const wave = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      wave[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }
    
    // Convertir a WAV data URL (simplified)
    try {
      const dataUri = this.createWavDataUri(wave, sampleRate);
      audio.src = dataUri;
      audio.preload = 'auto';
      audio.volume = this.masterVolume;
    } catch (e) {
      console.log('Error creating fallback audio:', e);
    }
    
    return audio;
  }

  createWavDataUri(samples, sampleRate) {
    const length = samples.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert samples to 16-bit PCM
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async loadSound(name, frequency, type = 'sine', duration = 0.1) {
    if (this.webAudioSupported) {
      // Generar sonidos proceduralmente para Web Audio API
      this.sounds.set(name, { frequency, type, duration });
    }
    // Fallback audio ya está creado en constructor
  }

  playSound(name, volume = 1) {
    if (this.webAudioSupported && this.sounds.has(name)) {
      this.playWebAudio(name, volume);
    } else if (this.fallbackAudio.has(name)) {
      this.playFallbackAudio(name, volume);
    }
  }

  playWebAudio(name, volume) {
    try {
      const sound = this.sounds.get(name);
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency, this.context.currentTime);
      
      gainNode.gain.setValueAtTime(volume * this.masterVolume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + sound.duration);
    } catch (e) {
      console.log('Error playing Web Audio:', e);
    }
  }

  playFallbackAudio(name, volume) {
    try {
      const audio = this.fallbackAudio.get(name);
      if (audio) {
        // Clone audio for multiple simultaneous plays
        const audioClone = audio.cloneNode();
        audioClone.volume = volume * this.masterVolume;
        audioClone.currentTime = 0;
        audioClone.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (e) {
      console.log('Error playing fallback audio:', e);
    }
  }

  async initialize() {
    // Cargar sonidos del juego
    await this.loadSound('pellet', 800, 'square', 0.1);
    await this.loadSound('powerPellet', 200, 'sawtooth', 0.3);
    await this.loadSound('eatGhost', 400, 'triangle', 0.5);
    await this.loadSound('death', 150, 'sawtooth', 1.0);
    await this.loadSound('extraLife', 1000, 'sine', 0.8);
    await this.loadSound('fruit', 660, 'sine', 0.4); // Add fruit sound
    
    console.log(`Audio initialized: ${this.webAudioSupported ? 'Web Audio API' : 'HTML5 Audio fallback'}`);
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// ===========================================
// INPUT MANAGER
// ===========================================

/**
 * InputManager - Gestión unificada de entrada (teclado + táctil)
 */
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.touchStartPos = null;
    this.swipeThreshold = 50;
    this.lastDirection = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
      console.log(`Key pressed: ${e.code} (${e.key})`);
      
      // Direct R key test for debugging
      if (e.code === 'KeyR') {
        console.log('R KEY DETECTED - Direct test!');
      }
      
      this.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Eventos táctiles
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!this.touchStartPos) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.lastDirection = deltaX > 0 ? 'right' : 'left';
        } else {
          this.lastDirection = deltaY > 0 ? 'down' : 'up';
        }
      }

      this.touchStartPos = null;
    });
  }

  getDirection() {
    // Priorizar entrada táctil
    if (this.lastDirection) {
      const direction = this.lastDirection;
      this.lastDirection = null;
      return this.getDirectionVector(direction);
    }

    // Entrada de teclado
    for (const key of this.keys) {
      if (GAME_CONFIG.controls.keyboard.up.includes(key)) {
        return new Vector2D(0, -GAME_CONFIG.game.speed.pacman);
      }
      if (GAME_CONFIG.controls.keyboard.down.includes(key)) {
        return new Vector2D(0, GAME_CONFIG.game.speed.pacman);
      }
      if (GAME_CONFIG.controls.keyboard.left.includes(key)) {
        return new Vector2D(-GAME_CONFIG.game.speed.pacman, 0);
      }
      if (GAME_CONFIG.controls.keyboard.right.includes(key)) {
        return new Vector2D(GAME_CONFIG.game.speed.pacman, 0);
      }
    }

    return null;
  }

  getDirectionVector(direction) {
    switch (direction) {
      case 'up': return new Vector2D(0, -1);
      case 'down': return new Vector2D(0, 1);
      case 'left': return new Vector2D(-1, 0);
      case 'right': return new Vector2D(1, 0);
      default: return null;
    }
  }

  isPausePressed() {
    return Array.from(this.keys).some(key => 
      GAME_CONFIG.controls.keyboard.pause.includes(key)
    );
  }

  isStartPressed() {
    const isPressed = Array.from(this.keys).some(key => 
      GAME_CONFIG.controls.keyboard.start.includes(key)
    );
    if (isPressed) {
      console.log('Start key detected: Enter');
    }
    return isPressed;
  }

  isRestartPressed() {
    const isPressed = Array.from(this.keys).some(key => 
      GAME_CONFIG.controls.keyboard.restart.includes(key)
    );
    if (isPressed) {
      console.log('Restart key detected: R');
    }
    return isPressed;
  }
}

// ===========================================
// GAME UI
// ===========================================

/**
 * GameUI - Interfaz de usuario y HUD
 */
class GameUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(gameState) {
    const { score, lives, level, gameOver, paused, highScore } = gameState;
    const uiY = GAME_CONFIG.maze.height * GAME_CONFIG.maze.cellSize + 20;

    this.ctx.fillStyle = GAME_CONFIG.colors.ui;
    this.ctx.font = '16px monospace';

    // Score
    this.ctx.fillText(`SCORE: ${score.toLocaleString()}`, 10, uiY);
    
    // High Score
    this.ctx.fillText(`HIGH: ${highScore.toLocaleString()}`, 180, uiY);
    
    // Level
    this.ctx.fillText(`LEVEL: ${level}`, 320, uiY);

    // Lives
    this.ctx.fillText(`LIVES: `, 10, uiY + 25);
    for (let i = 0; i < lives; i++) {
      this.renderLifeIcon(70 + i * 25, uiY + 15);
    }

    // Mensajes de estado
    if (gameOver) {
      this.renderCenteredMessage('GAME OVER', 'Press R to restart');
    } else if (paused) {
      this.renderCenteredMessage('PAUSED', 'Press SPACE to continue');
    }
  }

  renderLifeIcon(x, y) {
    const ctx = this.ctx;
    const radius = 8;
    
    ctx.fillStyle = GAME_CONFIG.colors.pacman;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI / 6, -Math.PI / 6);
    ctx.lineTo(x, y);
    ctx.fill();
  }

  renderCenteredMessage(title, subtitle) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Fondo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Título
    ctx.fillStyle = GAME_CONFIG.colors.ui;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, centerY - 20);

    // Subtítulo
    ctx.font = '16px monospace';
    ctx.fillText(subtitle, centerX, centerY + 20);
    
    ctx.textAlign = 'left'; // Reset alignment
  }
}

// ===========================================
// GHOST AI CLASS
// ===========================================

/**
 * GhostAI - Sistema de inteligencia artificial para fantasmas GRID-ALIGNED
 */
class GhostAI {
  constructor(name, startCol, startRow, color) {
    this.name = name;
    this.position = Vector2D.fromGrid(startCol, startRow);
    this.gridPosition = { col: startCol, row: startRow };
    this.direction = new Vector2D(0, -1); // Inicia hacia arriba
    this.moving = false;
    this.moveTimer = 0;
    this.moveSpeed = 10; // frames per move (slower than Pac-Man)
    this.color = color;
    this.mode = 'SCATTER'; // SCATTER, CHASE, FLEE, EATEN
    this.modeTimer = 0;
    this.scatterDuration = GAME_CONFIG.game.timing.scatter; // 7 segundos a 60fps
    this.chaseDuration = GAME_CONFIG.game.timing.chase; // 20 segundos a 60fps
    this.vulnerable = false;
    this.vulnerableTimer = 0;
    this.eaten = false;
    this.inHouse = true; // Individual per-ghost flag
    this.spawnDelay = GHOST_SPAWN_DELAYS[this.name]; // Individual spawn delay in ms
    this.spawnTimer = 0; // Tracks time since game start
    this.homePosition = { col: startCol, row: startRow };
    this.frameCount = 0;
    this.gameStartTime = null; // Track when game started
  }

  update(pacman, ghosts, maze, deltaTime, gameStartTime) {
    this.frameCount++;
    
    // Set game start time reference
    if (!this.gameStartTime && gameStartTime) {
      this.gameStartTime = gameStartTime;
    }
    
    // Calculate elapsed time since game start
    const elapsedTime = gameStartTime ? (Date.now() - gameStartTime) : 0;
    
    // Handle individual ghost spawn timing - FIX: Proper release logic
    if (this.inHouse) {
      if (elapsedTime >= this.spawnDelay) {
        this.inHouse = false;
        this.mode = 'SCATTER'; // Start in SCATTER mode
        this.modeTimer = 0;
        console.log(`🚪 ${this.name} RELEASED from house after ${this.spawnDelay}ms delay`);
      } else {
        // Debug spawn timing every 60 frames but keep minimal logging
        if (this.frameCount % 60 === 0 && this.name === 'blinky') {
          console.log(`Ghost release status - elapsed: ${elapsedTime}ms`);
        }
        return; // Don't move or update AI while in house
      }
    }

    // Update AI state machine (individual per ghost)
    this.updateState(deltaTime);
    
    // Update vulnerability state
    this.updateVulnerability(deltaTime);

    // Handle grid-based movement only if not in house
    if (!this.moving) {
      // Get target based on current mode and personality
      const target = this.getTarget(pacman, ghosts, maze);
      
      // Find best direction toward target
      const bestDirection = this.findBestDirection(target, maze);
      
      if (bestDirection) {
        this.direction = bestDirection;
        this.startMoving();
      } else {
        // If no best direction found, pick random valid direction to avoid freezing
        const randomDirection = this.getRandomValidDirection(maze);
        if (randomDirection) {
          this.direction = randomDirection;
          this.startMoving();
        }
      }
    } else {
      // Continue moving
      this.moveTimer++;
      
      if (this.moveTimer >= this.moveSpeed) {
        // Complete the move
        this.gridPosition.col += this.direction.x;
        this.gridPosition.row += this.direction.y;
        
        // Handle teleportation
        if (this.gridPosition.col < 0) {
          this.gridPosition.col = maze.width - 1;
        } else if (this.gridPosition.col >= maze.width) {
          this.gridPosition.col = 0;
        }
        
        this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
        this.moving = false;
        this.moveTimer = 0;
        
        // If ghost reached home after being eaten
        if (this.eaten && this.getDistance(this.gridPosition, this.homePosition) < 1) {
          this.respawn();
        }
      } else {
        // Interpolate position during movement
        const progress = this.moveTimer / this.moveSpeed;
        const currentGridPos = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
        const targetCol = this.gridPosition.col + this.direction.x;
        const targetRow = this.gridPosition.row + this.direction.y;
        const targetGridPos = Vector2D.fromGrid(targetCol, targetRow);
        
        this.position.x = currentGridPos.x + (targetGridPos.x - currentGridPos.x) * progress;
        this.position.y = currentGridPos.y + (targetGridPos.y - currentGridPos.y) * progress;
      }
    }
  }

  startMoving() {
    this.moving = true;
    this.moveTimer = 0;
  }

  updateState(deltaTime) {
    if (this.eaten) {
      this.mode = 'EATEN';
      return;
    }

    if (this.vulnerable) {
      this.mode = 'FLEE';
      return;
    }

    // Independent SCATTER ↔ CHASE cycle for each ghost
    this.modeTimer += deltaTime;
    
    if (this.mode === 'SCATTER' && this.modeTimer >= this.scatterDuration) {
      this.mode = 'CHASE';
      this.modeTimer = 0;
      console.log(`${this.name}: SCATTER → CHASE transition`);
    } else if (this.mode === 'CHASE' && this.modeTimer >= this.chaseDuration) {
      this.mode = 'SCATTER';
      this.modeTimer = 0;
      console.log(`${this.name}: CHASE → SCATTER transition`);
    }
  }

  updateVulnerability(deltaTime) {
    if (this.vulnerable) {
      this.vulnerableTimer -= deltaTime;
      
      if (this.vulnerableTimer <= 0) {
        this.vulnerable = false;
        this.mode = 'CHASE'; // Return to CHASE after FLEE ends
        this.modeTimer = 0; // Reset mode timing
        console.log(`${this.name}: FLEE → CHASE (vulnerability ended)`);
      }
    }
  }

  makeVulnerable() {
    if (!this.eaten && !this.inHouse) {
      this.vulnerable = true;
      this.mode = 'FLEE';
      this.vulnerableTimer = GAME_CONFIG.game.powerPelletDuration * (1000 / 60); // Convert frames to ms
      // Reverse direction when becoming vulnerable
      this.direction = new Vector2D(-this.direction.x, -this.direction.y);
      console.log(`${this.name}: Power pellet → FLEE mode for ${this.vulnerableTimer}ms`);
    }
  }

  getEaten() {
    this.eaten = true;
    this.vulnerable = false;
    this.mode = 'EATEN';
    console.log(`${this.name}: Got eaten, returning to house`);
  }

  respawn() {
    this.position = Vector2D.fromGrid(this.homePosition.col, this.homePosition.row);
    this.gridPosition = { col: this.homePosition.col, row: this.homePosition.row };
    this.eaten = false;
    this.vulnerable = false;
    this.mode = 'SCATTER'; // Start in SCATTER after respawn
    this.modeTimer = 0;
    this.inHouse = true;
    this.spawnTimer = 0; // Reset spawn timer for next release
    console.log(`${this.name} respawned in house with delay: ${this.spawnDelay}ms`);
  }

  getRandomValidDirection(maze) {
    const directions = [
      new Vector2D(0, -1), // up
      new Vector2D(1, 0),  // right
      new Vector2D(0, 1),  // down
      new Vector2D(-1, 0)  // left
    ];

    const validDirections = directions.filter(dir => {
      const newCol = this.gridPosition.col + dir.x;
      const newRow = this.gridPosition.row + dir.y;
      return maze.isWalkable(newCol, newRow);
    });

    if (validDirections.length > 0) {
      const randomIndex = Math.floor(Math.random() * validDirections.length);
      return validDirections[randomIndex];
    }

    return null;
  }

  getTarget(pacman, ghosts, maze) {
    const pacmanGrid = pacman.getGridPosition();
    
    switch (this.mode) {
      case 'SCATTER':
        return this.getScatterTarget();
      
      case 'CHASE':
        return this.getChaseTarget(pacmanGrid, pacman.direction, ghosts);
      
      case 'FLEE':
        return this.getFleeTarget(pacmanGrid, maze);
      
      case 'EATEN':
        return { col: this.homePosition.col, row: this.homePosition.row };
      
      default:
        return pacmanGrid;
    }
  }

  getScatterTarget() {
    // Cada fantasma tiene su esquina preferida para scatter mode
    const corners = {
      'blinky': { col: 18, row: 0 },   // Esquina superior derecha
      'pinky': { col: 0, row: 0 },     // Esquina superior izquierda
      'inky': { col: 18, row: 20 },    // Esquina inferior derecha
      'clyde': { col: 0, row: 20 }     // Esquina inferior izquierda
    };
    return corners[this.name] || { col: 9, row: 9 };
  }

  getChaseTarget(pacmanPos, pacmanDir, ghosts) {
    switch (this.name) {
      case 'blinky':
        // Blinky: chase Pac-Man's tile directly
        return pacmanPos;
      
      case 'pinky': {
        // Pinky: target 4 tiles ahead of Pac-Man
        const dirX = pacmanDir.x > 0 ? 1 : pacmanDir.x < 0 ? -1 : 0;
        const dirY = pacmanDir.y > 0 ? 1 : pacmanDir.y < 0 ? -1 : 0;
        return {
          col: pacmanPos.col + dirX * 4,
          row: pacmanPos.row + dirY * 4
        };
      }
      
      case 'inky': {
        // Inky: vector between Blinky & Pac-Man (complex behavior)
        const blinky = ghosts.find(g => g.name === 'blinky');
        if (blinky) {
          const blinkyGrid = blinky.gridPosition;
          const dirX = pacmanDir.x > 0 ? 1 : pacmanDir.x < 0 ? -1 : 0;
          const dirY = pacmanDir.y > 0 ? 1 : pacmanDir.y < 0 ? -1 : 0;
          const pivotCol = pacmanPos.col + dirX * 2;
          const pivotRow = pacmanPos.row + dirY * 2;
          return {
            col: pivotCol + (pivotCol - blinkyGrid.col),
            row: pivotRow + (pivotRow - blinkyGrid.row)
          };
        }
        return pacmanPos;
      }
      
      case 'clyde': {
        // Clyde: chase when >8 tiles away, scatter when closer
        const distance = Math.sqrt(
          Math.pow(pacmanPos.col - this.gridPosition.col, 2) + 
          Math.pow(pacmanPos.row - this.gridPosition.row, 2)
        );
        if (distance > 8) {
          return pacmanPos; // Chase when far
        } else {
          return this.getScatterTarget(); // Scatter when close
        }
      }
      
      default:
        return pacmanPos;
    }
  }

  getFleeTarget(pacmanPos, maze) {
    // Buscar la celda más lejana de Pac-Man que sea accesible
    let bestTarget = null;
    let maxDistance = -1;

    for (let row = 0; row < maze.height; row++) {
      for (let col = 0; col < maze.width; col++) {
        if (maze.isWalkable(col, row)) {
          const distance = this.getDistance({ col, row }, pacmanPos);
          if (distance > maxDistance) {
            maxDistance = distance;
            bestTarget = { col, row };
          }
        }
      }
    }

    return bestTarget || this.getScatterTarget();
  }

  getDistance(pos1, pos2) {
    const dx = pos1.col - pos2.col;
    const dy = pos1.row - pos2.row;
    return Math.sqrt(dx * dx + dy * dy);
  }

  findBestDirection(target, maze) {
    const currentGrid = this.gridPosition;
    const directions = [
      { dir: new Vector2D(0, -1), name: 'up' },
      { dir: new Vector2D(1, 0), name: 'right' },
      { dir: new Vector2D(0, 1), name: 'down' },
      { dir: new Vector2D(-1, 0), name: 'left' }
    ];

    let bestDirection = null;
    let bestDistance = Infinity;

    for (const directionInfo of directions) {
      const newCol = currentGrid.col + directionInfo.dir.x;
      const newRow = currentGrid.row + directionInfo.dir.y;

      // No retroceder (excepto cuando es vulnerable)
      const isReverse = directionInfo.dir.x === -this.direction.x && 
                       directionInfo.dir.y === -this.direction.y;
      
      if (!this.vulnerable && isReverse && (this.direction.x !== 0 || this.direction.y !== 0)) {
        continue;
      }

      if (maze.isWalkable(newCol, newRow)) {
        const distance = this.getDistance({ col: newCol, row: newRow }, target);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestDirection = directionInfo.dir;
        }
      }
    }

    return bestDirection;
  }

  checkCollisionWithPacman(pacman) {
    const distance = this.getDistance(
      this.gridPosition,
      pacman.getGridPosition()
    );
    
    return distance < 1; // Colisión si están en la misma celda
  }

  render(ctx) {
    const x = this.position.x;
    const y = this.position.y;
    const size = GAME_CONFIG.maze.cellSize;

    let color = this.color;
    if (this.vulnerable) {
      // Parpadeo cuando el tiempo de vulnerabilidad está por terminar
      const flash = this.vulnerableTimer < 180 && Math.floor(this.vulnerableTimer / 15) % 2 === 0;
      color = flash ? '#FFFFFF' : GAME_CONFIG.colors.vulnerable;
    }
    
    if (this.eaten) {
      // Renderizar solo ojos cuando es comido
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.arc(x + size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = color;
    
    // Cuerpo del fantasma
    ctx.beginPath();
    ctx.arc(x, y, size / 2, Math.PI, 0);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x + size / 2 - size / 4, y + size / 2 - size / 4);
    ctx.lineTo(x, y + size / 2);
    ctx.lineTo(x - size / 4, y + size / 2 - size / 4);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.closePath();
    ctx.fill();

    // Ojos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - size / 4, y - size / 8, size / 6, 0, Math.PI * 2);
    ctx.arc(x + size / 4, y - size / 8, size / 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - size / 4, y - size / 8, size / 12, 0, Math.PI * 2);
    ctx.arc(x + size / 4, y - size / 8, size / 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===========================================
// GAME ENGINE
// ===========================================

/**
 * GameEngine - Motor principal del juego y gestión de estados
 */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('gameOverlay');
    this.input = new InputManager(this.canvas);
    this.audio = new AudioManager();
    this.ui = new GameUI(this.canvas);
    
    this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
    this.paused = false;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.highScore = localStorage.getItem('pacmanHighScore') || 0;
    
    this.maze = null;
    this.pacman = null;
    this.ghosts = [];
    
    this.lastFrameTime = 0;
    this.pauseDebounce = false;

    this.initialize();
  }

  async initialize() {
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
    
    await this.audio.initialize();
    this.resetGame();
    
    // Run audit tasks in development mode
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('🔍 Running development audit...');
      // Expose to window for manual runs
      window.runAudit = this.runAuditTasks.bind(this);
      // Run automatically after a short delay to allow game to setup
      setTimeout(() => this.runAuditTasks(), 2000);
    }

    this.gameLoop();
  }

  resetGame() {
    this.maze = new MazeManager();
    this.fruitBonus = new FruitBonus(this.maze);
    this.createEntities();
    this.score = 0;
    this.level = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.gameState = 'MENU';
    this.gameOver = false;
    this.paused = false;
    this.gameStartTime = null; // Reset game start time
    this.lastFrameTime = performance.now(); // Initialize frame timing
    this.ghostEatenCount = 0; // Initialize ghost eaten counter
    this.updateUI();
  }

  createEntities() {
    const pacmanStart = this.maze.getCenterTile();
    this.pacman = new PacManPlayer(pacmanStart.x, pacmanStart.y);

    this.ghosts = [
      new GhostAI('blinky', 9, 7, GAME_CONFIG.colors.ghosts.blinky),
      new GhostAI('pinky', 9, 9, GAME_CONFIG.colors.ghosts.pinky),
      new GhostAI('inky', 8, 9, GAME_CONFIG.colors.ghosts.inky),
      new GhostAI('clyde', 10, 9, GAME_CONFIG.colors.ghosts.clyde)
    ];

    console.log('🎯 Ghosts created with individual spawn delays:');
    this.ghosts.forEach(ghost => {
      console.log(`  ${ghost.name}: ${ghost.spawnDelay}ms delay`);
    });
  }

  startGame() {
    console.log('=== STARTING GAME ===');
    this.gameState = 'PLAYING';
    this.gameStartTime = Date.now(); // Track when game actually started
    this.overlay.style.display = 'none';
    console.log(`Game started at ${this.gameStartTime} with ${this.ghosts.length} ghosts`);
  }

  gameLoop() {
    const now = performance.now();
    
    // DEBUG: Log game loop status every 60 frames (1 second)
    if (!this.frameCounter) this.frameCounter = 0;
    this.frameCounter++;
    
    if (this.frameCounter % 60 === 0) {
      console.log(`Game loop running - Frame ${this.frameCounter}, State: ${this.gameState}, Paused: ${this.paused}, GameOver: ${this.gameOver}`);
    }

    // Note: deltaTime calculation removed as we use frame-based timing

    // FIX: Game start only on Enter, restart lock during play
    if (this.gameState === 'MENU') {
      if (this.input.isStartPressed()) {
        this.startGame();
      }
      this.renderMenu();
    } else if (this.gameState === 'GAME_OVER') {
      // Only allow restart with R key or Enter after game over
      if (this.input.isRestartPressed() || this.input.isStartPressed()) {
        console.log('Restarting game from GAME_OVER state...');
        this.resetGame();
        return;
      }
      this.render(); // Still render the game over screen
    } else {
      // During gameplay (PLAYING/PAUSED)
      if (this.input.isPausePressed() && !this.pauseDebounce) {
        this.togglePause();
        this.pauseDebounce = true;
        setTimeout(() => this.pauseDebounce = false, 200);
      }
      
      // FIX: Block restart during active gameplay
      if (this.input.isRestartPressed() && this.gameState === 'PLAYING') {
        console.log('Restart blocked during active gameplay - only allowed after GAME_OVER');
        // Do nothing - restart is locked during play
      }

      this.update();
      this.render(); // Single render call per frame
    }

    this.lastFrameTime = now;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    if (this.paused || this.gameOver) return;

    const direction = this.input.getDirection();
    if (direction) {
      this.pacman.setDirection(direction);
    }

    // Calculate deltaTime for smooth timing
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.pacman.update(this.maze);
    this.fruitBonus.update(); // Update fruit bonus system
    
    // Update all ghosts with deltaTime and gameStartTime
    this.ghosts.forEach(ghost => {
      ghost.update(this.pacman, this.ghosts, this.maze, deltaTime, this.gameStartTime);
    });

    this.checkCollisions();
    this.checkWinCondition();
    this.updateUI();
  }

  render() {
    // FIX: Clear canvas once at start of render cycle
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // FIX: Single render pass - maze, pellets, fruit, pacman, ghosts
    this.maze.render(this.ctx);
    this.fruitBonus.render(this.ctx); // Render fruit bonus
    this.pacman.render(this.ctx);
    
    // Render all ghosts in a single pass
    this.ghosts.forEach(ghost => ghost.render(this.ctx));
    
    this.ui.render({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused,
      gameState: this.gameState
    });
  }
  
  renderMenu() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.maze.render(this.ctx);
    
    this.overlay.style.display = 'flex';
    document.getElementById('overlayTitle').textContent = 'PAC-MAN GG';
    document.getElementById('overlayMessage').textContent = 'Press ENTER to Start';
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      this.paused = true;
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      this.paused = false;
    }
    this.overlay.style.display = this.paused ? 'flex' : 'none';
    if(this.paused) {
        document.getElementById('overlayTitle').textContent = 'PAUSED';
        document.getElementById('overlayMessage').textContent = 'Press SPACE to Resume';
    }
  }

  checkCollisions() {
    // Pellets
    const consumed = this.maze.consumePellet(this.pacman.position);
    if (consumed) {
      this.score += consumed.points;
      this.audio.playSound('pellet');
      if (consumed.type === 'powerPellet') {
        this.activatePowerPellet();
      }
    }

    // Fruit bonus
    const fruitConsumed = this.fruitBonus.checkCollision(this.pacman.position);
    if (fruitConsumed) {
      this.score += fruitConsumed.points;
      this.audio.playSound('fruit');
      console.log(`🍎 Fruit eaten: ${fruitConsumed.fruitType} (+${fruitConsumed.points} points)`);
    }

    // Ghosts
    this.ghosts.forEach(ghost => {
      if (!ghost.eaten && ghost.checkCollisionWithPacman(this.pacman)) {
        if (ghost.vulnerable) {
          this.eatGhost(ghost);
        } else {
          this.playerDeath();
        }
      }
    });
  }
  
  activatePowerPellet() {
    this.audio.playSound('powerPellet');
    this.ghostEatenCount = 0; // Reset ghost eaten counter for scoring multiplier
    
    this.ghosts.forEach(ghost => {
      if (!ghost.inHouse && !ghost.eaten) {
        ghost.makeVulnerable();
      }
    });
    
    console.log('Power pellet activated - all active ghosts are now vulnerable');
  }

  eatGhost(ghost) {
    this.ghostEatenCount = (this.ghostEatenCount || 0) + 1;
    const points = GAME_CONFIG.game.scoring.ghost * Math.pow(2, this.ghostEatenCount - 1);
    this.score += points;
    
    this.audio.playSound('eatGhost');
    ghost.getEaten();
    
    console.log(`Ghost eaten! Points: ${points} (${this.ghostEatenCount} in sequence)`);
  }

  playerDeath() {
    console.log(`Player death! Lives remaining: ${this.lives - 1}`);
    this.lives--;
    this.audio.playSound('death');
    if (this.lives <= 0) {
      console.log('Game Over!');
      this.gameState = 'GAME_OVER';
      this.gameOver = true;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pacmanHighScore', this.highScore);
      }
       this.overlay.style.display = 'flex';
       document.getElementById('overlayTitle').textContent = 'GAME OVER';
       document.getElementById('overlayMessage').textContent = `Final Score: ${this.score}`;

    } else {
      console.log('Resetting positions for next life');
      // Reset positions only, don't recreate entities
      const pacmanStart = this.maze.getCenterTile();
      
      this.pacman.position = Vector2D.fromGrid(pacmanStart.x, pacmanStart.y);
      this.pacman.gridPosition = { col: pacmanStart.x, row: pacmanStart.y };
      this.pacman.direction = new Vector2D(0, 0);
      this.pacman.nextDirection = new Vector2D(0, 0);
      this.pacman.moving = false;
      this.pacman.moveTimer = 0;
      
      // Reset ghosts to their home positions with fresh spawn timers
      this.ghosts.forEach(ghost => {
        ghost.position = Vector2D.fromGrid(ghost.homePosition.col, ghost.homePosition.row);
        ghost.gridPosition = { col: ghost.homePosition.col, row: ghost.homePosition.row };
        ghost.direction = new Vector2D(0, -1);
        ghost.moving = false;
        ghost.moveTimer = 0;
        ghost.inHouse = true;
        ghost.spawnTimer = 0;
        ghost.eaten = false;
        ghost.vulnerable = false;
        ghost.mode = 'SCATTER';
        ghost.modeTimer = 0;
        ghost.gameStartTime = this.gameStartTime; // Reset timing reference
      });
    }
  }

  checkWinCondition() {
    if (this.maze.getAllPelletsCollected()) {
      this.level++;
      this.gameState = 'LEVEL_COMPLETE';
      // For now, just restart the level
      setTimeout(() => {
        this.maze.initializePellets();
        this.createEntities();
        this.gameState = 'PLAYING';
      }, 2000);
    }
  }
  
  updateUI() {
      document.getElementById('score').textContent = this.score;
      document.getElementById('highScore').textContent = this.highScore;
      document.getElementById('level').textContent = this.level;
  }

  /**
   * QA & Audit Task Runner
   * This method runs a series of checks to ensure game integrity.
   * It's automatically invoked on localhost and can be run manually via `window.runAudit()`
   */
  runAuditTasks() {
    const results = [];
    const CELL_SIZE = GAME_CONFIG.maze.cellSize;
    
    console.log('--- 🕹️ Pac-Man QA & Audit Report ---');

    // Task 1: Grid alignment
    const allEntities = [this.pacman, ...this.ghosts].filter(e => e);
    const gridAligned = allEntities.every(entity => {
      if (!entity || !entity.position) return false;
      const pos = entity.position;
      const gridCol = Math.round(pos.x / CELL_SIZE);
      const gridRow = Math.round(pos.y / CELL_SIZE);
      // Check if entity is reasonably close to its grid center
      return Math.abs(pos.x - (gridCol * CELL_SIZE + CELL_SIZE / 2)) < CELL_SIZE / 2 && 
             Math.abs(pos.y - (gridRow * CELL_SIZE + CELL_SIZE / 2)) < CELL_SIZE / 2;
    });
    results.push({ name: 'Grid Alignment', pass: gridAligned, details: 'All entities align to grid' });
    
    // Task 2: Entity counts
    const playerCount = this.pacman ? 1 : 0;
    results.push({ name: 'Player Count', pass: playerCount === 1, details: `Found ${playerCount} player` });
    const ghostCount = this.ghosts.length;
    results.push({ name: 'Ghost Count', pass: ghostCount === 4, details: `Found ${ghostCount} ghosts` });

    // Task 3: Game state validation
    const validStates = ['MENU', 'PLAYING', 'PAUSED', 'GAME_OVER', 'LEVEL_COMPLETE'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), details: `State: ${this.gameState}` });
    
    // Task 4: Navigation link present
    const backLink = document.querySelector('a[href*="../index.html"]');
    results.push({ name: 'Back Navigation', pass: !!backLink, details: 'Link to ../index.html exists' });
    
    // Task 5: License headers (HTML)
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'License Header', pass: hasLicense, details: 'MIT license in HTML' });

    // Task 6: Canvas dimensions (380×420 = 19×21 tiles × 20px)
    const canvasSizeCorrect = this.canvas.width === 380 && this.canvas.height === 420;
    results.push({ name: 'Canvas Dimensions', pass: canvasSizeCorrect, details: `${this.canvas.width}×${this.canvas.height}` });

    // Task 7: Start key binding (ENTER only, not Space)
    const startKeyCorrect = GAME_CONFIG.controls.keyboard.start.includes('Enter') && 
                           !GAME_CONFIG.controls.keyboard.start.includes('Space');
    results.push({ name: 'Start Key (ENTER)', pass: startKeyCorrect, details: 'Game starts on Enter only' });

    // Task 8: Pac-Man wall collision
    if (this.pacman) {
      const pacmanGridPos = this.pacman.getGridPosition();
      const wallCollision = !this.maze.isWall(pacmanGridPos.col, pacmanGridPos.row);
      results.push({ name: 'Pac-Man Position Valid', pass: wallCollision, details: `At col:${pacmanGridPos.col}, row:${pacmanGridPos.row}` });
    }

    // Task 9: Ghost release system - Check Blinky releases first
    const blinky = this.ghosts.find(g => g.name === 'blinky');
    const ghostReleaseOK = blinky && blinky.spawnDelay === 0; // Blinky should have 0ms delay
    results.push({ name: 'Ghost Release System', pass: ghostReleaseOK, details: `Blinky delay: ${blinky ? blinky.spawnDelay : 'N/A'}ms` });

    // Task 10: AI mode timing - Check proper SCATTER/CHASE durations
    const ghostModesValid = this.ghosts.every(ghost => {
      return ghost.scatterDuration === 420 && ghost.chaseDuration === 1200;
    });
    results.push({ name: 'AI Mode Timing', pass: ghostModesValid, details: 'SCATTER 7s → CHASE 20s cycle' });

    console.table(results.map(r => ({'Check': r.name, 'Status': r.pass ? '✅ PASS' : '❌ FAIL', 'Details': r.details })));
    
    const allPassed = results.every(r => r.pass);
    console.log(`--- Audit Result: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'} ---`);

    return allPassed;
  }
}

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  window.game = game; // Exponer para depuración
});