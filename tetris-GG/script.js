/* © GG, MIT License */
/**
 * Tetris GG - Professional Retro Arcade Game
 * Advanced ES6+ architecture with modular design, authentic game mechanics, and optimized performance
 * 
 * Architecture:
 * - TetrisGame: Main game controller with state management
 * - Tetromino: Individual piece class with rotation and collision logic  
 * - GameBoard: Grid management and line clearing algorithms
 * - AudioManager: Web Audio API integration for retro sound effects
 * - TouchManager: Mobile gesture controls and responsive input
 * - TDD Quality Assurance: Comprehensive audit system
 */

// ===== GAME CONFIGURATION SYSTEM =====
const TETRIS_CONFIG = {
  board: {
    width: 10,        // Standard Tetris board width
    height: 20,       // Standard Tetris board height  
    cellSize: 30,     // Pixel size per cell
    hiddenRows: 2,    // Hidden spawn area above visible board
  },
  canvas: {
    width: 300,       // 10 * 30px
    height: 600,      // 20 * 30px
    nextSize: 120,    // Next piece preview canvas
  },
  game: {
    fps: 60,
    startLevel: 1,
    linesPerLevel: 10,
    maxLevel: 20,
    startLives: 1,    // Tetris is single-life game
    gravity: {
      // Drop speeds in milliseconds (authentic Tetris timing)
      1: 1000, 2: 900, 3: 800, 4: 700, 5: 600,
      6: 500, 7: 400, 8: 300, 9: 200, 10: 100,
      11: 90, 12: 80, 13: 70, 14: 60, 15: 50,
      16: 40, 17: 30, 18: 20, 19: 10, 20: 10
    },
    lockDelay: 500,   // Lock delay in ms (time before piece locks)
    softDropSpeed: 50, // Soft drop speed multiplier
  },
  scoring: {
    // Classic Tetris scoring system
    single: 100,      // 1 line cleared
    double: 300,      // 2 lines cleared  
    triple: 500,      // 3 lines cleared
    tetris: 800,      // 4 lines cleared (TETRIS!)
    softDrop: 1,      // Points per cell soft dropped
    hardDrop: 2,      // Points per cell hard dropped
  },
  controls: {
    keyboard: {
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      down: ['ArrowDown', 'KeyS'],        // Soft drop
      rotate: ['ArrowUp', 'KeyW'],        // Rotate clockwise
      hardDrop: ['Space'],                // Hard drop (instant)
      hold: ['KeyC'],                     // Hold piece (optional)
      pause: ['KeyP', 'Escape'],
      restart: ['KeyR'],
    },
  },
  colors: {
    // Authentic Tetris piece colors with neon effects
    I: '#00FFFF',  // Cyan - I-piece (line)
    O: '#FFFF00',  // Yellow - O-piece (square)  
    T: '#FF00FF',  // Magenta - T-piece
    S: '#00FF00',  // Green - S-piece
    Z: '#FF0000',  // Red - Z-piece
    J: '#0000FF',  // Blue - J-piece
    L: '#FFA500',  // Orange - L-piece
    
    // UI and effects
    grid: '#333366',
    background: '#000011',
    ghost: 'rgba(255, 255, 255, 0.3)',  // Ghost piece overlay
    cleared: '#FFFFFF',                  // Line clear flash
  },
  audio: {
    enabled: true,
    volume: 0.3,
    frequencies: {
      move: 220,      // Move piece sound
      rotate: 330,    // Rotate piece sound
      drop: 110,      // Piece lock sound
      line: 440,      // Line clear sound
      tetris: 880,    // Tetris (4-line) sound
      levelUp: 660,   // Level up sound
      gameOver: 55,   // Game over sound
    },
  },
};

// ===== TETROMINO DEFINITIONS =====
const TETROMINO_SHAPES = {
  I: {
    shape: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    color: TETRIS_CONFIG.colors.I,
    rotationStates: 2, // I-piece has 2 distinct rotation states
  },
  O: {
    shape: [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0]
    ],
    color: TETRIS_CONFIG.colors.O,
    rotationStates: 1, // O-piece doesn't rotate
  },
  T: {
    shape: [
      [0,1,0],
      [1,1,1],
      [0,0,0]
    ],
    color: TETRIS_CONFIG.colors.T,
    rotationStates: 4,
  },
  S: {
    shape: [
      [0,1,1],
      [1,1,0],
      [0,0,0]
    ],
    color: TETRIS_CONFIG.colors.S,
    rotationStates: 2,
  },
  Z: {
    shape: [
      [1,1,0],
      [0,1,1],
      [0,0,0]
    ],
    color: TETRIS_CONFIG.colors.Z,
    rotationStates: 2,
  },
  J: {
    shape: [
      [1,0,0],
      [1,1,1],
      [0,0,0]
    ],
    color: TETRIS_CONFIG.colors.J,
    rotationStates: 4,
  },
  L: {
    shape: [
      [0,0,1],
      [1,1,1],
      [0,0,0]
    ],
    color: TETRIS_CONFIG.colors.L,
    rotationStates: 4,
  },
};

// ===== TETROMINO CLASS =====
class Tetromino {
  constructor(type, x = 3, y = 0) {
    this.type = type;
    this.shape = TETROMINO_SHAPES[type].shape;
    this.color = TETROMINO_SHAPES[type].color;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.rotationStates = TETROMINO_SHAPES[type].rotationStates;
    this.lockTimer = 0;
    this.landed = false;
  }

  // Rotate piece clockwise with bounds checking
  rotate(board) {
    const originalRotation = this.rotation;
    this.rotation = (this.rotation + 1) % 4;
    
    const rotatedShape = this.getRotatedShape();
    
    // Check if rotation is valid
    if (!this.isValidPosition(board, rotatedShape)) {
      // Try wall kicks (SRS - Super Rotation System)
      const wallKicks = this.getWallKicks(originalRotation, this.rotation);
      
      for (const kick of wallKicks) {
        this.x += kick.x;
        this.y += kick.y;
        
        if (this.isValidPosition(board, rotatedShape)) {
          return true; // Successful rotation with wall kick
        }
        
        // Revert kick if it didn't work
        this.x -= kick.x;
        this.y -= kick.y;
      }
      
      // If no wall kick worked, revert rotation
      this.rotation = originalRotation;
      return false;
    }
    
    return true; // Successful rotation
  }

  // Get rotated shape matrix
  getRotatedShape() {
    const shape = this.shape;
    const size = shape.length;
    const rotated = Array(size).fill().map(() => Array(size).fill(0));
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        switch (this.rotation) {
          case 0: // 0 degrees
            rotated[y][x] = shape[y][x];
            break;
          case 1: // 90 degrees clockwise
            rotated[y][x] = shape[size - 1 - x][y];
            break;
          case 2: // 180 degrees
            rotated[y][x] = shape[size - 1 - y][size - 1 - x];
            break;
          case 3: // 270 degrees clockwise
            rotated[y][x] = shape[x][size - 1 - y];
            break;
        }
      }
    }
    
    return rotated;
  }

  // Check if position is valid (no collision)
  isValidPosition(board, shape = null) {
    const currentShape = shape || this.getRotatedShape();
    
    for (let y = 0; y < currentShape.length; y++) {
      for (let x = 0; x < currentShape[y].length; x++) {
        if (currentShape[y][x]) {
          const boardX = this.x + x;
          const boardY = this.y + y;
          
          // Check boundaries
          if (boardX < 0 || boardX >= TETRIS_CONFIG.board.width || 
              boardY >= TETRIS_CONFIG.board.height) {
            return false;
          }
          
          // Check collision with placed pieces (skip hidden rows)
          if (boardY >= 0 && board.grid[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  // Move piece if possible
  move(dx, dy, board) {
    this.x += dx;
    this.y += dy;
    
    if (!this.isValidPosition(board)) {
      this.x -= dx;
      this.y -= dy;
      return false;
    }
    
    return true;
  }

  // Get wall kick offsets for SRS (Super Rotation System)
  getWallKicks(fromRotation, toRotation) {
    // Standard wall kick data for most pieces
    const standardKicks = {
      '0->1': [{x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}],
      '1->2': [{x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}],
      '2->3': [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}],
      '3->0': [{x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}],
    };

    // I-piece has special wall kick data
    const iPieceKicks = {
      '0->1': [{x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: -1}, {x: 1, y: 2}],
      '1->2': [{x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: 2}, {x: 2, y: -1}],
      '2->3': [{x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: 1}, {x: -1, y: -2}],
      '3->0': [{x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: -2}, {x: -2, y: 1}],
    };

    const kicks = this.type === 'I' ? iPieceKicks : standardKicks;
    const key = `${fromRotation}->${toRotation}`;
    
    return kicks[key] || [{x: 0, y: 0}];
  }

  // Get all filled cells for rendering
  getFilledCells() {
    const cells = [];
    const shape = this.getRotatedShape();
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          cells.push({
            x: this.x + x,
            y: this.y + y,
            color: this.color
          });
        }
      }
    }
    
    return cells;
  }

  // Create a ghost piece (projection)
  createGhost(board) {
    const ghost = new Tetromino(this.type, this.x, this.y);
    ghost.rotation = this.rotation;
    
    // Drop ghost piece to the bottom
    while (ghost.move(0, 1, board)) {
      // Keep dropping until it can't move down
    }
    
    return ghost;
  }
}

// ===== GAME BOARD CLASS =====
class GameBoard {
  constructor() {
    this.width = TETRIS_CONFIG.board.width;
    this.height = TETRIS_CONFIG.board.height;
    this.grid = this.createEmptyGrid();
    this.completedLines = [];
  }

  createEmptyGrid() {
    return Array(this.height).fill().map(() => Array(this.width).fill(0));
  }

  // Place a piece permanently on the board
  placePiece(piece) {
    const cells = piece.getFilledCells();
    
    for (const cell of cells) {
      if (cell.y >= 0 && cell.y < this.height && 
          cell.x >= 0 && cell.x < this.width) {
        this.grid[cell.y][cell.x] = cell.color;
      }
    }
  }

  // Check for completed lines
  findCompletedLines() {
    const completedLines = [];
    
    for (let y = 0; y < this.height; y++) {
      if (this.grid[y].every(cell => cell !== 0)) {
        completedLines.push(y);
      }
    }
    
    return completedLines;
  }

  // Clear completed lines and drop remaining blocks
  clearLines(lines) {
    // Sort lines from bottom to top to avoid index issues
    lines.sort((a, b) => b - a);
    
    for (const lineIndex of lines) {
      // Remove the completed line
      this.grid.splice(lineIndex, 1);
      // Add new empty line at the top
      this.grid.unshift(Array(this.width).fill(0));
    }
    
    return lines.length;
  }

  // Check if the game is over (pieces reach the top)
  isGameOver() {
    // Check if any cells in the spawn area (top 2 rows) are occupied
    for (let y = 0; y < TETRIS_CONFIG.board.hiddenRows; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Clear the entire board
  clear() {
    this.grid = this.createEmptyGrid();
  }
}

// ===== AUDIO MANAGER CLASS =====
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = TETRIS_CONFIG.audio.enabled;
    this.volume = TETRIS_CONFIG.audio.volume;
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  // Generate retro beep sound
  playBeep(frequency, duration = 0.1, volume = this.volume) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'square'; // Retro square wave sound

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Specific game sounds
  playMove() { this.playBeep(TETRIS_CONFIG.audio.frequencies.move, 0.05); }
  playRotate() { this.playBeep(TETRIS_CONFIG.audio.frequencies.rotate, 0.08); }
  playDrop() { this.playBeep(TETRIS_CONFIG.audio.frequencies.drop, 0.15); }
  playLineClear() { this.playBeep(TETRIS_CONFIG.audio.frequencies.line, 0.3); }
  playTetris() { 
    // Special Tetris sound (4 lines) - ascending beeps
    this.playBeep(440, 0.1);
    setTimeout(() => this.playBeep(554, 0.1), 100);
    setTimeout(() => this.playBeep(659, 0.1), 200);
    setTimeout(() => this.playBeep(880, 0.2), 300);
  }
  playLevelUp() { this.playBeep(TETRIS_CONFIG.audio.frequencies.levelUp, 0.4); }
  playGameOver() { this.playBeep(TETRIS_CONFIG.audio.frequencies.gameOver, 1.0); }
}

// ===== TETRIS GAME ENGINE CLASS =====
class TetrisGame {
  constructor() {
    // Core game components
    this.board = new GameBoard();
    this.audioManager = new AudioManager();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.level = TETRIS_CONFIG.game.startLevel;
    this.lines = 0;
    this.lives = TETRIS_CONFIG.game.startLives;
    
    // Piece management
    this.currentPiece = null;
    this.nextPiece = null;
    this.heldPiece = null;
    this.canHold = true;
    this.pieceBag = [];
    
    // Timing and controls
    this.lastDropTime = 0;
    this.dropInterval = TETRIS_CONFIG.game.gravity[this.level];
    this.lockDelayStart = 0;
    this.softDropping = false;
    this.keys = {};
    this.lastKeyTime = {};
    
    // Canvas setup
    this.canvas = null;
    this.ctx = null;
    this.nextCanvas = null;
    this.nextCtx = null;
    
    // Performance tracking
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fps = 60;
    
    this.initialize();
  }

  async initialize() {
    // Initialize Universal Game Systems
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.init();
    }
    if (typeof window.globalTournamentManager !== 'undefined') {
      window.globalTournamentManager.init();
    }
    if (typeof window.globalAchievementSystem !== 'undefined') {
      window.globalAchievementSystem.init();
    }
    
    await this.setupCanvas();
    this.setupEventListeners();
    this.generateNextPiece();
    this.gameLoop();
    
    // Auto-run TDD audit in development
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      console.log('🔍 Running development audit...');
      window.runAudit = this.runAuditTasks.bind(this);
      setTimeout(() => this.runAuditTasks(), 1000);
    }
  }

  async setupCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.nextCanvas = document.getElementById('nextCanvas');
    
    if (!this.canvas || !this.nextCanvas) {
      throw new Error('Canvas elements not found. Check HTML structure.');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.nextCtx = this.nextCanvas.getContext('2d');
    
    // Set canvas dimensions
    this.canvas.width = TETRIS_CONFIG.canvas.width;
    this.canvas.height = TETRIS_CONFIG.canvas.height;
    this.nextCanvas.width = TETRIS_CONFIG.canvas.nextSize;
    this.nextCanvas.height = TETRIS_CONFIG.canvas.nextSize;
    
    // Enable crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
    this.nextCtx.imageSmoothingEnabled = false;
  }

  setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // UI controls
    document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('restartBtn')?.addEventListener('click', () => this.restart());
    
    // Touch controls for mobile
    this.setupTouchControls();
    
    // Prevent context menu on long touch
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      
      if (this.gameState !== 'playing') return;
      
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchDuration = performance.now() - touchStartTime;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 30;
      
      // Long press = hard drop
      if (touchDuration > 500) {
        this.hardDrop();
        return;
      }
      
      // Swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.movePiece(1, 0); // Right
        } else {
          this.movePiece(-1, 0); // Left
        }
      } else if (deltaY > minSwipeDistance) {
        // Swipe down - soft drop
        this.softDropping = true;
        setTimeout(() => { this.softDropping = false; }, 100);
      } else if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        // Tap - rotate
        this.rotatePiece();
      }
    }, { passive: false });
  }

  // ===== PIECE GENERATION SYSTEM =====
  
  // 7-bag randomizer (authentic Tetris piece generation)
  generatePieceBag() {
    const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Shuffle using Fisher-Yates algorithm
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    return pieces;
  }

  generateNextPiece() {
    if (this.pieceBag.length === 0) {
      this.pieceBag = this.generatePieceBag();
    }
    
    const pieceType = this.pieceBag.pop();
    return new Tetromino(pieceType);
  }

  spawnNewPiece() {
    this.currentPiece = this.nextPiece || this.generateNextPiece();
    this.nextPiece = this.generateNextPiece();
    this.canHold = true;
    this.lockDelayStart = 0;
    
    // Check for game over
    if (!this.currentPiece.isValidPosition(this.board)) {
      this.gameOver();
      return false;
    }
    
    return true;
  }

  // ===== GAME MECHANICS =====
  
  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    this.handleContinuousInput();
    this.updateGravity(deltaTime);
    this.updateLockDelay();
  }

  handleContinuousInput() {
    const now = performance.now();
    const repeatRate = 50;   // ms between repeats
    
    // Continuous horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      if (!this.lastKeyTime.left || now - this.lastKeyTime.left > repeatRate) {
        this.movePiece(-1, 0);
        this.lastKeyTime.left = now;
      }
    }
    
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      if (!this.lastKeyTime.right || now - this.lastKeyTime.right > repeatRate) {
        this.movePiece(1, 0);
        this.lastKeyTime.right = now;
      }
    }
    
    // Continuous soft drop
    if (this.softDropping || this.keys['ArrowDown'] || this.keys['KeyS']) {
      if (!this.lastKeyTime.down || now - this.lastKeyTime.down > TETRIS_CONFIG.game.softDropSpeed) {
        if (this.movePiece(0, 1)) {
          this.score += TETRIS_CONFIG.scoring.softDrop;
        }
        this.lastKeyTime.down = now;
      }
    }
  }

  updateGravity(deltaTime) {
    this.lastDropTime += deltaTime;
    
    if (this.lastDropTime >= this.dropInterval) {
      if (!this.movePiece(0, 1)) {
        // Piece can't move down, start lock delay
        if (this.lockDelayStart === 0) {
          this.lockDelayStart = performance.now();
        }
      }
      this.lastDropTime = 0;
    }
  }

  updateLockDelay() {
    if (this.lockDelayStart > 0) {
      const lockElapsed = performance.now() - this.lockDelayStart;
      
      if (lockElapsed >= TETRIS_CONFIG.game.lockDelay) {
        this.lockPiece();
      }
    }
  }

  movePiece(dx, dy) {
    if (!this.currentPiece) return false;
    
    const moved = this.currentPiece.move(dx, dy, this.board);
    
    if (moved && dx !== 0) {
      this.audioManager.playMove();
      // Reset lock delay if piece moved horizontally
      this.lockDelayStart = 0;
    }
    
    return moved;
  }

  rotatePiece() {
    if (!this.currentPiece) return false;
    
    const rotated = this.currentPiece.rotate(this.board);
    
    if (rotated) {
      this.audioManager.playRotate();
      // Reset lock delay if piece rotated
      this.lockDelayStart = 0;
    }
    
    return rotated;
  }

  hardDrop() {
    if (!this.currentPiece) return;
    
    let dropDistance = 0;
    
    // Drop piece to bottom
    while (this.currentPiece.move(0, 1, this.board)) {
      dropDistance++;
    }
    
    // Award hard drop points
    this.score += dropDistance * TETRIS_CONFIG.scoring.hardDrop;
    
    // Lock piece immediately
    this.lockPiece();
  }

  lockPiece() {
    if (!this.currentPiece) return;
    
    // Place piece on board
    this.board.placePiece(this.currentPiece);
    this.audioManager.playDrop();
    
    // Check for line clears
    const completedLines = this.board.findCompletedLines();
    
    if (completedLines.length > 0) {
      this.clearLines(completedLines);
    }
    
    // Spawn next piece
    this.spawnNewPiece();
  }

  clearLines(lines) {
    const lineCount = lines.length;
    
    // Calculate score based on lines cleared
    let lineScore = 0;
    switch (lineCount) {
      case 1: lineScore = TETRIS_CONFIG.scoring.single; break;
      case 2: lineScore = TETRIS_CONFIG.scoring.double; break;
      case 3: lineScore = TETRIS_CONFIG.scoring.triple; break;
      case 4: lineScore = TETRIS_CONFIG.scoring.tetris; break;
    }
    
    this.score += lineScore * this.level;
    this.lines += lineCount;
    
    // Play appropriate sound
    if (lineCount === 4) {
      this.audioManager.playTetris();
    } else {
      this.audioManager.playLineClear();
    }
    
    // Clear the lines
    this.board.clearLines(lines);
    
    // Check for level up
    const newLevel = Math.floor(this.lines / TETRIS_CONFIG.game.linesPerLevel) + 1;
    if (newLevel > this.level && newLevel <= TETRIS_CONFIG.game.maxLevel) {
      this.level = newLevel;
      this.dropInterval = TETRIS_CONFIG.game.gravity[this.level];
      this.audioManager.playLevelUp();
    }
    
    this.updateUI();
  }

  // ===== INPUT HANDLING =====
  
  handleKeyDown(e) {
    this.keys[e.code] = true;
    
    // Handle single-press actions
    if (this.gameState === 'playing') {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.rotatePiece();
          break;
        case 'Space':
          e.preventDefault();
          this.hardDrop();
          break;
        case 'KeyC':
          this.holdPiece();
          break;
      }
    }
    
    // Global controls
    switch (e.code) {
      case 'KeyP':
      case 'Escape':
        this.togglePause();
        break;
      case 'KeyR':
        this.restart();
        break;
      case 'Enter':
        if (this.gameState === 'menu') {
          this.startGame();
        }
        break;
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
    
    // Reset key timing for smooth repeats
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        delete this.lastKeyTime.left;
        break;
      case 'ArrowRight':
      case 'KeyD':
        delete this.lastKeyTime.right;
        break;
      case 'ArrowDown':
      case 'KeyS':
        delete this.lastKeyTime.down;
        this.softDropping = false;
        break;
    }
  }

  holdPiece() {
    if (!this.canHold || !this.currentPiece) return;
    
    if (this.heldPiece) {
      // Swap current and held pieces
      const temp = this.heldPiece;
      this.heldPiece = new Tetromino(this.currentPiece.type);
      this.currentPiece = temp;
      this.currentPiece.x = 3;
      this.currentPiece.y = 0;
      this.currentPiece.rotation = 0;
    } else {
      // Hold current piece and spawn next
      this.heldPiece = new Tetromino(this.currentPiece.type);
      this.spawnNewPiece();
    }
    
    this.canHold = false;
    this.lockDelayStart = 0;
  }

  // ===== GAME STATE MANAGEMENT =====
  
  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.level = TETRIS_CONFIG.game.startLevel;
    this.lines = 0;
    this.board.clear();
    this.spawnNewPiece();
    this.updateUI();
    
    // Universal Systems Integration - Game Start
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.playGameStart();
    }
    
    document.body.className = 'game-playing';
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      document.body.className = 'game-paused';
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      document.body.className = 'game-playing';
    }
  }

  restart() {
    this.gameState = 'menu';
    this.currentPiece = null;
    this.nextPiece = null;
    this.heldPiece = null;
    this.pieceBag = [];
    this.generateNextPiece();
    document.body.className = '';
  }

  gameOver() {
    this.gameState = 'gameOver';
    this.audioManager.playGameOver();
    
    // Universal Systems Integration - Game Over
    if (typeof window.globalAudioManager !== 'undefined') {
      window.globalAudioManager.playGameOver();
    }
    
    if (typeof window.globalTournamentManager !== 'undefined') {
      window.globalTournamentManager.submitScore('tetris', this.score, this.level, {
        level: this.level,
        lines: this.lines,
        timestamp: Date.now()
      });
    }
    
    if (typeof window.globalAchievementSystem !== 'undefined') {
      window.globalAchievementSystem.updatePlayerProgress('tetris', this.score, this.level, {
        level: this.level,
        lines: this.lines,
        timestamp: Date.now()
      });
    }
    
    document.body.className = 'game-over';
    
    // Save high score
    const highScore = localStorage.getItem('tetris-high-score') || 0;
    if (this.score > highScore) {
      localStorage.setItem('tetris-high-score', this.score);
    }
  }

  // ===== RENDERING SYSTEM =====
  
  render() {
    this.clearCanvas();
    
    if (this.gameState === 'menu') {
      this.renderMenu();
    } else {
      this.renderBoard();
      this.renderCurrentPiece();
      this.renderGhost();
      this.renderNextPiece();
      
      if (this.gameState === 'paused') {
        this.renderPauseOverlay();
      } else if (this.gameState === 'gameOver') {
        this.renderGameOverOverlay();
      }
    }
  }

  clearCanvas() {
    this.ctx.fillStyle = TETRIS_CONFIG.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.nextCtx.fillStyle = TETRIS_CONFIG.colors.background;
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
  }

  renderBoard() {
    // Render placed pieces
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        const cell = this.board.grid[y][x];
        if (cell) {
          this.renderCell(x, y, cell, this.ctx);
        }
      }
    }
    
    // Render grid lines
    this.renderGrid();
  }

  renderGrid() {
    const cellSize = TETRIS_CONFIG.board.cellSize;
    this.ctx.strokeStyle = TETRIS_CONFIG.colors.grid;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;
    
    // Vertical lines
    for (let x = 0; x <= this.board.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellSize, 0);
      this.ctx.lineTo(x * cellSize, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.board.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellSize);
      this.ctx.lineTo(this.canvas.width, y * cellSize);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1;
  }

  renderCurrentPiece() {
    if (!this.currentPiece) return;
    
    const cells = this.currentPiece.getFilledCells();
    for (const cell of cells) {
      if (cell.y >= 0) { // Don't render pieces above the board
        this.renderCell(cell.x, cell.y, cell.color, this.ctx);
      }
    }
  }

  renderGhost() {
    if (!this.currentPiece) return;
    
    const ghost = this.currentPiece.createGhost(this.board);
    const cells = ghost.getFilledCells();
    
    this.ctx.globalAlpha = 0.3;
    for (const cell of cells) {
      if (cell.y >= 0) {
        this.renderCell(cell.x, cell.y, TETRIS_CONFIG.colors.ghost, this.ctx);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  renderNextPiece() {
    if (!this.nextPiece) return;
    
    const shape = this.nextPiece.getRotatedShape();
    const cellSize = 20; // Smaller cells for next piece display
    const offsetX = (this.nextCanvas.width - shape[0].length * cellSize) / 2;
    const offsetY = (this.nextCanvas.height - shape.length * cellSize) / 2;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const drawX = offsetX + x * cellSize;
          const drawY = offsetY + y * cellSize;
          
          this.nextCtx.fillStyle = this.nextPiece.color;
          this.nextCtx.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
          
          // Add glow effect
          this.nextCtx.shadowColor = this.nextPiece.color;
          this.nextCtx.shadowBlur = 10;
          this.nextCtx.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
          this.nextCtx.shadowBlur = 0;
        }
      }
    }
  }

  renderCell(x, y, color, context) {
    const cellSize = TETRIS_CONFIG.board.cellSize;
    const drawX = x * cellSize;
    const drawY = y * cellSize;
    
    // Main cell color
    context.fillStyle = color;
    context.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
    
    // Neon glow effect
    context.shadowColor = color;
    context.shadowBlur = 5;
    context.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
    context.shadowBlur = 0;
    
    // Highlight effect
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(drawX, drawY, cellSize - 1, 2);
    context.fillRect(drawX, drawY, 2, cellSize - 1);
  }

  renderMenu() {
    this.ctx.fillStyle = TETRIS_CONFIG.colors.I;
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🧩 TETRIS GG', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = TETRIS_CONFIG.colors.T;
    this.ctx.fillText('Presiona ENTER para jugar', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  renderPauseOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = TETRIS_CONFIG.colors.O;
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSA', this.canvas.width / 2, this.canvas.height / 2);
  }

  renderGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = TETRIS_CONFIG.colors.Z;
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = TETRIS_CONFIG.colors.T;
    this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  // ===== UI UPDATES =====
  
  updateUI() {
    document.getElementById('scoreValue').textContent = this.score.toLocaleString();
    document.getElementById('levelValue').textContent = this.level;
    document.getElementById('linesValue').textContent = this.lines;
  }

  // ===== GAME LOOP =====
  
  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    this.update(deltaTime);
    this.render();
    
    // FPS calculation
    this.frameCount++;
    if (this.frameCount >= 60) {
      this.fps = 1000 / deltaTime;
      this.frameCount = 0;
    }
    
    this.lastFrameTime = currentTime;
    requestAnimationFrame(() => this.gameLoop());
  }

  // ===== TDD AUDIT SYSTEM =====
  
  runAuditTasks() {
    const results = [];
    
    // Structure & Architecture Tests
    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'MIT License Header', pass: hasLicense, critical: true });
    
    const validStates = ['menu', 'playing', 'paused', 'gameOver'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), critical: true });
    
    // Performance Tests
    const frameRateOK = this.fps >= 50;
    results.push({ name: 'Frame Rate 50fps+', pass: frameRateOK, critical: true });
    
    // Tetris-Specific Tests
    const hasBoard = this.board && this.board.width === 10 && this.board.height === 20;
    results.push({ name: 'Standard Board Size', pass: hasBoard, critical: true });
    
    const hasPieces = this.currentPiece !== null || this.nextPiece !== null;
    results.push({ name: 'Piece Generation', pass: hasPieces, critical: true });
    
    const hasAudio = this.audioManager && typeof this.audioManager.playMove === 'function';
    results.push({ name: 'Audio System', pass: hasAudio, critical: false });
    
    // UI/UX Tests
    const backLink = document.querySelector('a[href*="index.html"]');
    const hasInicioText = backLink && backLink.textContent.includes('INICIO');
    results.push({ name: 'Navigation "INICIO"', pass: hasInicioText, critical: false });
    
    const htmlLang = document.documentElement.lang;
    const isSpanish = htmlLang === 'es';
    results.push({ name: 'Spanish Language', pass: isSpanish, critical: false });
    
    const hasInstructions = document.querySelector('details') && 
      document.body.textContent.includes('¿Cómo jugar?');
    results.push({ name: 'Instructions Section', pass: hasInstructions, critical: false });
    
    // Technical Tests
    const canvas = document.querySelector('canvas');
    const isResponsive = canvas && getComputedStyle(canvas).maxWidth === '100%';
    results.push({ name: 'Responsive Canvas', pass: isResponsive, critical: true });
    
    // Accessibility Tests
    const hasKeyboardNav = document.querySelector('[tabindex]') || document.querySelector('button');
    results.push({ name: 'Keyboard Navigation', pass: hasKeyboardNav, critical: false });
    
    // Game Logic Tests
    const scoringWorks = typeof this.score === 'number' && this.score >= 0;
    results.push({ name: 'Scoring System', pass: scoringWorks, critical: true });
    
    const levelingWorks = this.level >= 1 && this.level <= TETRIS_CONFIG.game.maxLevel;
    results.push({ name: 'Level System', pass: levelingWorks, critical: true });
    
    // Log results
    console.log('🧩 Tetris GG - TDD Audit Results:');
    console.table(results);
    
    const criticalFails = results.filter(r => !r.pass && r.critical);
    const allCriticalPassed = criticalFails.length === 0;
    
    console.log(allCriticalPassed ? '✅ All CRITICAL tests PASSED' : '❌ CRITICAL tests FAILED');
    if (criticalFails.length > 0) {
      console.error('❌ Critical failures:', criticalFails.map(f => f.name));
    }
    
    const passedCount = results.filter(r => r.pass).length;
    const totalCount = results.length;
    console.log(`📊 Overall Score: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);
    
    return { allPassed: results.every(r => r.pass), criticalPassed: allCriticalPassed, results };
  }
}

// ===== GAME INITIALIZATION =====

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.tetrisGame = new TetrisGame();
    console.log('🧩 Tetris GG initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Tetris GG:', error);
  }
});

// Export for module systems (Node.js compatibility)
/* global module:readonly */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { TetrisGame, Tetromino, GameBoard, AudioManager };
}
