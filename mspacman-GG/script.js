/* © GG, MIT License */
/**
 * Ms. Pac-Man GG - Advanced Retro Arcade Game
 * Complete implementation with ES6+, Canvas HTML5, multiple mazes, and enhanced AI
 * 
 * Key Features:
 * - 4 Unique Mazes (Pink, Cyan, Yellow, Green themes)
 * - Moving Fruit System with physics
 * - Enhanced Ghost AI with unpredictability
 * - Progressive difficulty and maze rotation
 * - Full TDD audit compliance
 */

// ===========================================
// GAME CONFIGURATION
// ===========================================

const GAME_CONFIG = {
  maze: {
    width: 19,    // Classic maze width
    height: 21,   // Classic maze height  
    cellSize: 20, // Pixels per cell
  },
  canvas: {
    width: 380,   // 19 * 20 pixels
    height: 420,  // 21 * 20 pixels
  },
  game: {
    fps: 60,
    speed: {
      pacman: 1,        // Grid-aligned movement
      ghost: 1,         // Grid-aligned movement
      movingFruit: 0.5, // Slower than ghosts
    },
    scoring: {
      pellet: 10,
      powerPellet: 50,
      ghost: 200,
      fruit: 100,
      ghostMultiplier: 2,
    },
    lives: 3,
    powerPelletDuration: 600, // 10 seconds at 60fps
    timing: {
      scatter: 420,   // 7 seconds
      chase: 1200,    // 20 seconds
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
    // Base Ms. Pac-Man theme (magenta)
    maze: '#FF00FF',      
    pellet: '#FFFF00',    
    powerPellet: '#FFFF00',
    mspacman: '#FF69B4',  // Hot pink for Ms. Pac-Man
    ghosts: {
      blinky: '#FF0000',  // Red
      pinky: '#FFB8FF',   // Pink
      inky: '#00FFFF',    // Cyan
      clyde: '#FFB852',   // Orange
    },
    vulnerable: '#0000FF',
    background: '#000000',
    ui: '#FF00FF',
    
    // Maze-specific themes
    mazes: {
      1: { primary: '#FF00FF', secondary: '#FF69B4' }, // Pink
      2: { primary: '#00FFFF', secondary: '#40E0D0' }, // Cyan
      3: { primary: '#FFFF00', secondary: '#FFD700' }, // Yellow
      4: { primary: '#00FF00', secondary: '#32CD32' }, // Green
    }
  }
};

// ===========================================
// MS. PAC-MAN MAZES
// ===========================================

const MS_PACMAN_MAZES = {
  // Maze 1 - Pink Theme (Beginner)
  1: [
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
  ],
  
  // Maze 2 - Cyan Theme (Intermediate) - FIXED: Removed isolated sections
  2: [
    "XXXXXXXXXXXXXXXXXXX",
    "X.......X.X.......X",
    "X.XXXXX.X.X.XXXXX.X",
    "XO....X.....X....OX",
    "XXXX.XX.XXX.XX.XXXX",
    "X.....................X",
    "X.XX.XXXXXXX.XX...X",
    "X.X..X.....X..X...X",
    "X.X.XX.XXX.XX.X...X",
    "X.......X.........X",
    "XXXXXXX.X.XXXXXXX.X",
    "X.......X.........X",
    "X.X.XX.XXX.XX.X...X",
    "X.X..X.....X..X...X",
    "X.XX.XXXXXXX.XX...X",
    "X.....................X",
    "XXXX.XX.XXX.XX.XXXX",
    "XO....X..P..X....OX",
    "X.XXXXX.X.X.XXXXX.X",
    "X.......X.X.......X",
    "XXXXXXXXXXXXXXXXXXX"
  ],
  
  // Maze 3 - Yellow Theme (Advanced)
  3: [
    "XXXXXXXXXXXXXXXXXXX",
    "X.X.....X.....X.X.X",
    "X...XXX.X.XXX...X.X",
    "XXX.X.X.X.X.X.XXX.X",
    "XO..X.......X..O..X",
    "X.XXX.XXXXX.XXX.X.X",
    "X.....X...X.....X.X",
    "XXXXX.X.X.X.XXXXX.X",
    "X.....X.X.X.....X.X",
    "X.XXXXX.X.XXXXX.X.X",
    "X.......P.......X.X",
    "X.XXXXX.X.XXXXX.X.X",
    "X.....X.X.X.....X.X",
    "XXXXX.X.X.X.XXXXX.X",
    "X.....X...X.....X.X",
    "X.XXX.XXXXX.XXX.X.X",
    "XO..X.......X..O..X",
    "XXX.X.X.X.X.X.XXX.X",
    "X...XXX.X.XXX...X.X",
    "X.X.....X.....X.X.X",
    "XXXXXXXXXXXXXXXXXXX"
  ],
  
  // Maze 4 - Green Theme (Expert)
  4: [
    "XXXXXXXXXXXXXXXXXXX",
    "X..X..X.X.X..X..X.X",
    "X.....X.X.X.....X.X",
    "XXXXX.X.X.X.XXXXX.X",
    "XO..X.......X..O..X",
    "X.X.XXXXXXXXX.X.X.X",
    "X.X...........X.X.X",
    "X.XXXXX.X.XXXXX.X.X",
    "X.......X.......X.X",
    "XXXXXXX.X.XXXXXXX.X",
    "X.......P.......X.X",
    "XXXXXXX.X.XXXXXXX.X",
    "X.......X.......X.X",
    "X.XXXXX.X.XXXXX.X.X",
    "X.X...........X.X.X",
    "X.X.XXXXXXXXX.X.X.X",
    "XO..X.......X..O..X",
    "XXXXX.X.X.X.XXXXX.X",
    "X.....X.X.X.....X.X",
    "X..X..X.X.X..X..X.X",
    "XXXXXXXXXXXXXXXXXXX"
  ]
};

const CELL_SIZE = GAME_CONFIG.maze.cellSize;

// ===========================================
// UTILITY CLASSES
// ===========================================

/**
 * Vector2D - Grid-aligned position and direction utility
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

  toGridIndex() {
    return {
      col: Math.floor(this.x / CELL_SIZE),
      row: Math.floor(this.y / CELL_SIZE)
    };
  }

  static fromGrid(col, row) {
    return new Vector2D(
      col * CELL_SIZE + CELL_SIZE / 2,
      row * CELL_SIZE + CELL_SIZE / 2
    );
  }

  snapToGrid() {
    const gridCol = Math.round(this.x / CELL_SIZE);
    const gridRow = Math.round(this.y / CELL_SIZE);
    return Vector2D.fromGrid(gridCol, gridRow);
  }
}

// ===========================================
// MAZE MANAGER
// ===========================================

/**
 * MazeManager - Handles multiple mazes and pellet management
 */
class MazeManager {
  constructor() {
    this.currentMazeNumber = 1;
    this.maze = MS_PACMAN_MAZES[this.currentMazeNumber];
    this.height = this.maze.length;
    this.width = this.maze[0].length;
    this.cellSize = GAME_CONFIG.maze.cellSize;
    this.pellets = new Set();
    this.powerPellets = new Set();
    this.initializePellets();
  }

  initializePellets() {
    this.pellets.clear();
    this.powerPellets.clear();
    
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

  advanceToNextMaze() {
    this.currentMazeNumber = (this.currentMazeNumber % 4) + 1;
    this.maze = MS_PACMAN_MAZES[this.currentMazeNumber];
    this.initializePellets();
    console.log(`🏠 Advanced to maze ${this.currentMazeNumber}`);
    return this.currentMazeNumber;
  }

  getCurrentMazeTheme() {
    return GAME_CONFIG.colors.mazes[this.currentMazeNumber];
  }

  getCell(col, row) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return 'X';
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

  getCenterTile() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.maze[row][col] === 'P') {
          return { x: col, y: row };
        }
      }
    }
    return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
  }

  handleTeleport(position) {
    const grid = position.toGridIndex();
    
    if (grid.col < 0) {
      return Vector2D.fromGrid(this.width - 1, grid.row);
    }
    
    if (grid.col >= this.width) {
      return Vector2D.fromGrid(0, grid.row);
    }
    
    return position;
  }

  consumePellet(position) {
    const grid = position.toGridIndex();
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
    const theme = this.getCurrentMazeTheme();
    
    // Render maze walls with current theme
    ctx.fillStyle = theme.primary;
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

    // Render normal pellets
    ctx.fillStyle = GAME_CONFIG.colors.pellet;
    this.pellets.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      const x = col * this.cellSize + this.cellSize / 2;
      const y = row * this.cellSize + this.cellSize / 2;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render power pellets (flashing)
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

// ===========================================
// MS. PAC-MAN PLAYER
// ===========================================

/**
 * MsPacManPlayer - Ms. Pac-Man with bow and pink styling
 */
class MsPacManPlayer {
  constructor(startCol, startRow) {
    this.position = Vector2D.fromGrid(startCol, startRow);
    this.gridPosition = { col: startCol, row: startRow };
    this.direction = new Vector2D(0, 0);
    this.nextDirection = new Vector2D(0, 0);
    this.moving = false;
    this.moveTimer = 0;
    this.moveSpeed = 8; // Frames per move
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
    this.updateAnimation();
    
    if (!this.moving) {
      this.handleStaticMovement(maze);
    } else {
      this.handleActiveMovement(maze);
    }
  }

  updateAnimation() {
    this.animationFrame++;
    if (this.animationFrame % 8 === 0) {
      this.mouthOpen = !this.mouthOpen;
    }
  }

  handleStaticMovement(maze) {
    this.tryNextDirection(maze);
    this.tryContinueCurrentDirection(maze);
  }

  tryNextDirection(maze) {
    if (!this.nextDirection.equals(new Vector2D(0, 0))) {
      const nextPosition = this.calculateNextPosition(this.nextDirection);
      
      if (maze.isWalkable(nextPosition.col, nextPosition.row)) {
        this.direction = this.nextDirection.clone();
        this.nextDirection = new Vector2D(0, 0);
        this.startMoving();
      }
    }
  }

  tryContinueCurrentDirection(maze) {
    if (!this.direction.equals(new Vector2D(0, 0))) {
      const nextPosition = this.calculateNextPosition(this.direction);
      
      if (maze.isWalkable(nextPosition.col, nextPosition.row)) {
        this.startMoving();
      } else {
        this.direction = new Vector2D(0, 0);
      }
    }
  }

  calculateNextPosition(direction) {
    let nextCol = this.gridPosition.col;
    let nextRow = this.gridPosition.row;
    
    if (direction.x > 0) nextCol += 1;
    else if (direction.x < 0) nextCol -= 1;
    
    if (direction.y > 0) nextRow += 1;
    else if (direction.y < 0) nextRow -= 1;
    
    return { col: nextCol, row: nextRow };
  }

  handleActiveMovement(maze) {
    this.moveTimer++;
    
    if (this.moveTimer >= this.moveSpeed) {
      this.completeMovement(maze);
    } else {
      this.interpolateMovement();
    }
  }

  completeMovement(maze) {
    this.updateGridPosition();
    this.handleTeleportation(maze);
    this.finalizeMoveStep();
  }

  updateGridPosition() {
    if (this.direction.x > 0) this.gridPosition.col += 1;
    else if (this.direction.x < 0) this.gridPosition.col -= 1;
    
    if (this.direction.y > 0) this.gridPosition.row += 1;
    else if (this.direction.y < 0) this.gridPosition.row -= 1;
  }

  handleTeleportation(maze) {
    if (this.gridPosition.col < 0) {
      this.gridPosition.col = maze.width - 1;
    } else if (this.gridPosition.col >= maze.width) {
      this.gridPosition.col = 0;
    }
  }

  finalizeMoveStep() {
    this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
    this.moving = false;
    this.moveTimer = 0;
  }

  interpolateMovement() {
    const progress = this.moveTimer / this.moveSpeed;
    const currentGridPos = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
    const targetPosition = this.calculateNextPosition(this.direction);
    const targetGridPos = Vector2D.fromGrid(targetPosition.col, targetPosition.row);
    
    this.position.x = currentGridPos.x + (targetGridPos.x - currentGridPos.x) * progress;
    this.position.y = currentGridPos.y + (targetGridPos.y - currentGridPos.y) * progress;
  }

  startMoving() {
    this.moving = true;
    this.moveTimer = 0;
  }

  setDirection(direction) {
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

    ctx.fillStyle = GAME_CONFIG.colors.mspacman;
    ctx.beginPath();

    if (this.mouthOpen) {
      let startAngle = 0;
      let endAngle = Math.PI * 2;

      // Mouth direction
      if (this.direction.x > 0) { // Right
        startAngle = Math.PI / 6;
        endAngle = -Math.PI / 6;
      } else if (this.direction.x < 0) { // Left
        startAngle = Math.PI + Math.PI / 6;
        endAngle = Math.PI - Math.PI / 6;
      } else if (this.direction.y > 0) { // Down
        startAngle = Math.PI / 2 + Math.PI / 6;
        endAngle = Math.PI / 2 - Math.PI / 6;
      } else if (this.direction.y < 0) { // Up
        startAngle = -Math.PI / 2 + Math.PI / 6;
        endAngle = -Math.PI / 2 - Math.PI / 6;
      }

      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.fill();

    // Render Ms. Pac-Man's bow
    this.renderBow(ctx, x, y, radius);
  }

  renderBow(ctx, x, y, radius) {
    // Bow position (top-right of head)
    const bowX = x + radius * 0.6;
    const bowY = y - radius * 0.8;
    
    ctx.fillStyle = '#FF1493'; // Deep pink bow
    ctx.beginPath();
    
    // Left wing of bow
    ctx.ellipse(bowX - 4, bowY, 3, 5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing of bow
    ctx.beginPath();
    ctx.ellipse(bowX + 4, bowY, 3, 5, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Center knot
    ctx.beginPath();
    ctx.arc(bowX, bowY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===========================================
// MOVING FRUIT SYSTEM
// ===========================================

/**
 * MovingFruit - Bouncing fruit system unique to Ms. Pac-Man
 */
class MovingFruit {
  constructor(maze) {
    this.maze = maze;
    this.active = false;
    this.position = null;
    this.direction = new Vector2D(1, 0); // Start moving right
    this.speed = GAME_CONFIG.game.speed.movingFruit;
    this.gridPosition = { col: 0, row: 0 };
    this.fruitType = 'cherry';
    this.points = 100;
    this.spawnTimer = 0;
    this.lifetime = 900; // 15 seconds at 60fps
    this.spawnDelay = 1200; // 20 seconds between spawns
    this.moveTimer = 0;
    this.moveSpeed = 20; // Slower movement than ghosts
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
        return;
      }

      // Move the fruit
      this.moveTimer++;
      if (this.moveTimer >= this.moveSpeed) {
        this.moveFruit();
        this.moveTimer = 0;
      }
    }
  }

  spawnFruit() {
    // Check if maze exists and is properly initialized
    if (!this.maze?.maze) {
      console.warn('🍎 Cannot spawn fruit: maze not available');
      return;
    }
    
    // Find valid spawn positions (empty spaces where Ms. Pac-Man can move)
    const validPositions = [];
    const mazeData = this.maze.maze;
    
    try {
      for (let row = 0; row < mazeData.length; row++) {
        for (let col = 0; col < mazeData[row].length; col++) {
          // Check for walkable spaces: '.', 'O', and ' ' (empty spaces)
          const cell = mazeData[row][col];
          if (cell === '.' || cell === 'O' || cell === ' ') {
            validPositions.push({ col, row });
          }
        }
      }
    } catch (error) {
      console.warn('🍎 Error scanning maze for fruit spawn:', error);
      return;
    }
    
    // Choose random valid position
    if (validPositions.length > 0) {
      this.gridPosition = validPositions[Math.floor(Math.random() * validPositions.length)];
      this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
      this.active = true;
      this.lifetime = 900;
      this.direction = this.getRandomDirection();
      this.fruitType = this.getRandomFruit();
      console.log(`🍎 Moving fruit spawned: ${this.fruitType} (${this.points} points) at (${this.gridPosition.col}, ${this.gridPosition.row})`);
    }
  }

  moveFruit() {
    const nextCol = this.gridPosition.col + this.direction.x;
    const nextRow = this.gridPosition.row + this.direction.y;

    // Check for wall collision and bounce
    if (!this.maze.isWalkable(nextCol, nextRow)) {
      this.bounceOffWall();
    } else {
      // Move to next position
      this.gridPosition.col = nextCol;
      this.gridPosition.row = nextRow;
      
      // Handle teleportation through tunnels
      if (this.gridPosition.col < 0) {
        this.gridPosition.col = this.maze.width - 1;
      } else if (this.gridPosition.col >= this.maze.width) {
        this.gridPosition.col = 0;
      }
      
      this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
    }
  }

  bounceOffWall() {
    // Simple bouncing logic - reverse direction and add some randomness
    const directions = [
      new Vector2D(0, -1), // up
      new Vector2D(1, 0),  // right
      new Vector2D(0, 1),  // down
      new Vector2D(-1, 0)  // left
    ];

    // Find valid directions
    const validDirections = directions.filter(dir => {
      const newCol = this.gridPosition.col + dir.x;
      const newRow = this.gridPosition.row + dir.y;
      return this.maze.isWalkable(newCol, newRow);
    });

    if (validDirections.length > 0) {
      // Choose random valid direction
      this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
    } else {
      // If stuck, despawn and respawn later
      this.despawn();
    }
  }

  getRandomDirection() {
    const directions = [
      new Vector2D(0, -1), new Vector2D(1, 0),
      new Vector2D(0, 1), new Vector2D(-1, 0)
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  despawn() {
    this.active = false;
    this.position = null;
    this.spawnTimer = 0;
  }

  getRandomFruit() {
    const fruits = ['cherry', 'strawberry', 'orange', 'apple', 'melon', 'galaxian', 'bell', 'key'];
    const values = [100, 200, 500, 700, 1000, 2000, 3000, 5000];
    const index = Math.floor(Math.random() * fruits.length);
    this.points = values[index];
    return fruits[index];
  }

  checkCollision(pacmanPosition) {
    if (!this.active || !this.position) return null;
    
    const pacmanGrid = pacmanPosition.toGridIndex();
    const distance = Math.abs(pacmanGrid.col - this.gridPosition.col) + 
                    Math.abs(pacmanGrid.row - this.gridPosition.row);
    
    if (distance < 1) {
      const points = this.points;
      const fruitType = this.fruitType;
      this.despawn();
      return { type: 'fruit', points, fruitType };
    }
    
    return null;
  }

  render(ctx) {
    if (!this.active || !this.position) return;
    
    const x = this.position.x;
    const y = this.position.y;
    
    // Flash when lifetime is low
    const shouldRender = this.lifetime > 180 || Math.floor(this.lifetime / 15) % 2 === 0;
    
    if (shouldRender) {
      ctx.fillStyle = this.getFruitColor();
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Fruit icon
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.getFruitIcon(), x, y + 4);
      ctx.textAlign = 'left';
    }
  }

  getFruitColor() {
    const colors = {
      cherry: '#FF0000', strawberry: '#FF69B4', orange: '#FFA500',
      apple: '#00FF00', melon: '#FFFF00', galaxian: '#00FFFF',
      bell: '#FFD700', key: '#FF00FF'
    };
    return colors[this.fruitType] || '#FFFF00';
  }

  getFruitIcon() {
    const icons = {
      cherry: '🍒', strawberry: '🍓', orange: '🍊', apple: '🍎',
      melon: '🍈', galaxian: '👾', bell: '🔔', key: '🔑'
    };
    return icons[this.fruitType] || '🍎';
  }
}

// ===========================================
// ENHANCED GHOST AI
// ===========================================

/**
 * EnhancedGhostAI - Ms. Pac-Man ghosts with unpredictability
 */
class EnhancedGhostAI {
  constructor(name, startCol, startRow, color) {
    this.name = name;
    this.position = Vector2D.fromGrid(startCol, startRow);
    this.gridPosition = { col: startCol, row: startRow };
    this.direction = new Vector2D(0, -1);
    this.moving = false;
    this.moveTimer = 0;
    this.moveSpeed = 12; // Slightly slower than Pac-Man for balance
    this.color = color;
    this.mode = 'SCATTER';
    this.modeTimer = 0;
    this.scatterDuration = GAME_CONFIG.game.timing.scatter;
    this.chaseDuration = GAME_CONFIG.game.timing.chase;
    this.vulnerable = false;
    this.vulnerableTimer = 0;
    this.eaten = false;
    this.inHouse = true;
    this.spawnDelay = this.getSpawnDelay();
    console.log(`🏠 Ms. Pac-Man Ghost ${this.name} initialized with spawn delay: ${this.spawnDelay}ms`);
    this.homePosition = { col: 9, row: 9 }; // Common home position inside the house
    this.frameCount = 0;
    this.gameStartTime = null;
    
    // Ms. Pac-Man specific: unpredictability factor
    this.unpredictabilityFactor = 0.2; // 20% chance of random decisions
  }

  getSpawnDelay() {
    const delays = { 'blinky': 0, 'pinky': 4000, 'inky': 8000, 'clyde': 12000 };
    return delays[this.name] || 0;
  }

  update(pacman, ghosts, maze, deltaTime, gameStartTime) {
    this.frameCount++;
    this.initializeGameTime(gameStartTime);
    
    // Check house status first
    if (this.inHouse) {
      if (this.handleHouseLogic(gameStartTime)) {
        return; // Stay in house, skip rest of update
      }
      // If handleHouseLogic returns false, ghost was just released - continue with movement
    }

    this.updateState(deltaTime);
    this.updateVulnerability(deltaTime);

    // Movement logic - all released ghosts should move
    if (!this.moving) {
      this.initiateMovement(pacman, ghosts, maze);
    } else {
      this.continueMovement(maze);
    }
  }

  initializeGameTime(gameStartTime) {
    if (!this.gameStartTime && gameStartTime) {
      this.gameStartTime = gameStartTime;
    }
  }

  handleHouseLogic(gameStartTime) {
    const elapsedTime = gameStartTime ? (Date.now() - gameStartTime) : 0;
    
    // Special case: if spawn delay is 0, release immediately regardless of elapsed time
    if (this.spawnDelay === 0 || elapsedTime >= this.spawnDelay) {
      this.releaseFromHouse();
      return false; // Continue with normal update
    } else {
      // Debug: Log release status for all ghosts every second
      if (this.frameCount % 60 === 0) {
        console.log(`👻 Ms.Pac ${this.name}: ${elapsedTime}ms/${this.spawnDelay}ms (${this.spawnDelay - elapsedTime}ms remaining)`);
      }
      return true; // Stay in house, skip rest of update
    }
  }

  releaseFromHouse() {
    this.inHouse = false;
    this.mode = 'SCATTER';
    this.modeTimer = 0;
    console.log(`🚪 ${this.name} RELEASED from house`);
  }

  initiateMovement(pacman, ghosts, maze) {
    const target = this.selectTarget(pacman, ghosts, maze);
    const bestDirection = this.findBestDirection(target, maze);
    
    if (bestDirection) {
      this.direction = bestDirection;
      this.startMoving();
    }
  }

  selectTarget(pacman, ghosts, maze) {
    // Add unpredictability - sometimes make random decisions
    if (Math.random() < this.unpredictabilityFactor && this.mode !== 'EATEN') {
      return this.getRandomTarget(maze);
    }
    return this.getTarget(pacman, ghosts, maze);
  }

  continueMovement(maze) {
    this.moveTimer++;
    
    if (this.moveTimer >= this.moveSpeed) {
      this.completeMovement(maze);
    } else {
      this.interpolateMovement();
    }
  }

  completeMovement(maze) {
    this.updateGridPosition();
    this.handleTeleportation(maze);
    this.finalizeMovement();
    this.checkHomeReached();
  }

  updateGridPosition() {
    this.gridPosition.col += this.direction.x;
    this.gridPosition.row += this.direction.y;
  }

  handleTeleportation(maze) {
    if (this.gridPosition.col < 0) {
      this.gridPosition.col = maze.width - 1;
    } else if (this.gridPosition.col >= maze.width) {
      this.gridPosition.col = 0;
    }
  }

  finalizeMovement() {
    this.position = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
    this.moving = false;
    this.moveTimer = 0;
  }

  checkHomeReached() {
    if (this.eaten) {
      const distance = this.getDistance(this.gridPosition, this.homePosition);
      // Debug log for eaten ghosts approaching home
      if (this.frameCount % 60 === 0) {
        console.log(`🏠 ${this.name} (EATEN) distance to home: ${distance.toFixed(2)} - at (${this.gridPosition.col}, ${this.gridPosition.row}) targeting (${this.homePosition.col}, ${this.homePosition.row})`);
      }
      
      // Use a more lenient distance check for respawn
      if (distance < 1.5) {
        console.log(`🔄 ${this.name} reached home, respawning!`);
        this.respawn();
      }
    }
  }

  interpolateMovement() {
    const progress = this.moveTimer / this.moveSpeed;
    const currentGridPos = Vector2D.fromGrid(this.gridPosition.col, this.gridPosition.row);
    const targetCol = this.gridPosition.col + this.direction.x;
    const targetRow = this.gridPosition.row + this.direction.y;
    const targetGridPos = Vector2D.fromGrid(targetCol, targetRow);
    
    this.position.x = currentGridPos.x + (targetGridPos.x - currentGridPos.x) * progress;
    this.position.y = currentGridPos.y + (targetGridPos.y - currentGridPos.y) * progress;
  }

  getRandomTarget(maze) {
    // Pick a random walkable position for unpredictable behavior
    const walkablePositions = [];
    
    for (let row = 0; row < maze.height; row++) {
      for (let col = 0; col < maze.width; col++) {
        if (maze.isWalkable(col, row)) {
          walkablePositions.push({ col, row });
        }
      }
    }
    
    if (walkablePositions.length > 0) {
      return walkablePositions[Math.floor(Math.random() * walkablePositions.length)];
    }
    
    return this.gridPosition;
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

    this.modeTimer += deltaTime;
    
    if (this.mode === 'SCATTER' && this.modeTimer >= this.scatterDuration) {
      this.mode = 'CHASE';
      this.modeTimer = 0;
    } else if (this.mode === 'CHASE' && this.modeTimer >= this.chaseDuration) {
      this.mode = 'SCATTER';
      this.modeTimer = 0;
    }
  }

  updateVulnerability(deltaTime) {
    if (this.vulnerable) {
      this.vulnerableTimer -= deltaTime;
      
      if (this.vulnerableTimer <= 0) {
        this.vulnerable = false;
        this.mode = 'CHASE';
        this.modeTimer = 0;
      }
    }
  }

  makeVulnerable() {
    if (!this.eaten && !this.inHouse) {
      this.vulnerable = true;
      this.mode = 'FLEE';
      this.vulnerableTimer = GAME_CONFIG.game.powerPelletDuration * (1000 / 60);
      this.direction = new Vector2D(-this.direction.x, -this.direction.y);
    }
  }

  getEaten() {
    this.eaten = true;
    this.vulnerable = false;
    this.mode = 'EATEN';
  }

  respawn() {
    this.position = Vector2D.fromGrid(this.homePosition.col, this.homePosition.row);
    this.gridPosition = { col: this.homePosition.col, row: this.homePosition.row };
    this.eaten = false;
    this.vulnerable = false;
    this.mode = 'SCATTER';
    this.modeTimer = 0;
    this.inHouse = true;
  }

  startMoving() {
    this.moving = true;
    this.moveTimer = 0;
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
    const corners = {
      'blinky': { col: 18, row: 0 },
      'pinky': { col: 0, row: 0 },
      'inky': { col: 18, row: 20 },
      'clyde': { col: 0, row: 20 }
    };
    return corners[this.name] || { col: 9, row: 9 };
  }

  getChaseTarget(pacmanPos, pacmanDir, ghosts) {
    switch (this.name) {
      case 'blinky':
        return this.getBlinkyTarget(pacmanPos);
      case 'pinky':
        return this.getPinkyTarget(pacmanPos, pacmanDir);
      case 'inky':
        return this.getInkyTarget(pacmanPos, pacmanDir, ghosts);
      case 'clyde':
        return this.getClydeTarget(pacmanPos);
      default:
        return pacmanPos;
    }
  }

  getBlinkyTarget(pacmanPos) {
    return pacmanPos;
  }

  getPinkyTarget(pacmanPos, pacmanDir) {
    const direction = this.getDirectionMultipliers(pacmanDir, 4);
    return { 
      col: pacmanPos.col + direction.x, 
      row: pacmanPos.row + direction.y 
    };
  }

  getInkyTarget(pacmanPos, pacmanDir, ghosts) {
    const blinky = ghosts.find(g => g.name === 'blinky');
    if (!blinky) return pacmanPos;

    const direction = this.getDirectionMultipliers(pacmanDir, 2);
    const pivotCol = pacmanPos.col + direction.x;
    const pivotRow = pacmanPos.row + direction.y;
    const blinkyGrid = blinky.gridPosition;
    
    return {
      col: pivotCol + (pivotCol - blinkyGrid.col),
      row: pivotRow + (pivotRow - blinkyGrid.row)
    };
  }

  getClydeTarget(pacmanPos) {
    const distance = this.calculateDistance(pacmanPos, this.gridPosition);
    return distance > 8 ? pacmanPos : this.getScatterTarget();
  }

  getDirectionMultipliers(direction, multiplier) {
    let x = 0, y = 0;
    
    if (direction.x > 0) x = multiplier;
    else if (direction.x < 0) x = -multiplier;
    
    if (direction.y > 0) y = multiplier;
    else if (direction.y < 0) y = -multiplier;
    
    return { x, y };
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.col - pos2.col, 2) + 
      Math.pow(pos1.row - pos2.row, 2)
    );
  }

  getFleeTarget(pacmanPos, maze) {
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

      const isReverse = directionInfo.dir.x === -this.direction.x && 
                       directionInfo.dir.y === -this.direction.y;
      
      // No retroceder (excepto cuando es vulnerable o eaten)
      if (!this.vulnerable && !this.eaten && isReverse && (this.direction.x !== 0 || this.direction.y !== 0)) {
        continue;
      }

      // EATEN ghosts can move through walls to reach home
      const canMove = this.eaten || maze.isWalkable(newCol, newRow);

      if (canMove) {
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
    const distance = this.getDistance(this.gridPosition, pacman.getGridPosition());
    return distance < 1;
  }

  render(ctx) {
    const x = this.position.x;
    const y = this.position.y;
    const size = GAME_CONFIG.maze.cellSize;

    let color = this.color;
    if (this.vulnerable) {
      const flash = this.vulnerableTimer < 180 && Math.floor(this.vulnerableTimer / 15) % 2 === 0;
      color = flash ? '#FFFFFF' : GAME_CONFIG.colors.vulnerable;
    }
    
    if (this.eaten) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.arc(x + size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = color;
    
    // Ghost body
    ctx.beginPath();
    ctx.arc(x, y, size / 2, Math.PI, 0);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x + size / 2 - size / 4, y + size / 2 - size / 4);
    ctx.lineTo(x, y + size / 2);
    ctx.lineTo(x - size / 4, y + size / 2 - size / 4);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - size / 4, y - size / 8, size / 6, 0, Math.PI * 2);
    ctx.arc(x + size / 4, y - size / 8, size / 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - size / 4, y - size / 8, size / 12, 0, Math.PI * 2);
    ctx.arc(x + size / 4, y - size / 8, size / 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===========================================
// AUDIO MANAGER
// ===========================================

/**
 * MsPacManAudioManager - Audio with Ms. Pac-Man specific sounds
 */
class MsPacManAudioManager {
  constructor() {
    this.webAudioSupported = false;
    this.context = null;
    this.sounds = new Map();
    this.masterVolume = 0.5;
    this.fallbackAudio = new Map();
    this.isInitialized = false;
    
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.context = new AudioContext();
        this.webAudioSupported = true;
        console.log('Ms. Pac-Man Audio: Web Audio API enabled');
      }
    } catch (error) {
      console.warn('Ms. Pac-Man Audio initialization failed:', error.message);
      console.log('Ms. Pac-Man Audio: Using HTML5 fallback');
      this.webAudioSupported = false;
      this.handleAudioFallback(error);
    }

    if (!this.webAudioSupported) {
      this.createFallbackAudio();
    }
  }

  handleAudioFallback(error) {
    if (error.name === 'NotAllowedError') {
      console.info('Ms. Pac-Man Audio requires user interaction - will initialize on first user action');
    } else {
      console.warn('Ms. Pac-Man Audio defaulting to HTML5 Audio due to:', error.name);
    }
  }

  createFallbackAudio() {
    const audioFiles = {
      'pellet': this.createBeepAudio(880, 0.1),      // Higher pitch than Pac-Man
      'powerPellet': this.createBeepAudio(220, 0.3),
      'eatGhost': this.createBeepAudio(440, 0.5),
      'death': this.createBeepAudio(130, 1.0),
      'fruit': this.createBeepAudio(720, 0.4),       // Ms. Pac-Man specific
      'extraLife': this.createBeepAudio(1100, 0.8),
    };

    Object.entries(audioFiles).forEach(([name, audioElement]) => {
      this.fallbackAudio.set(name, audioElement);
    });
  }

  createBeepAudio(frequency, duration) {
    const audio = new Audio();
    try {
      const sampleRate = 44100;
      const samples = Math.floor(sampleRate * duration);
      const wave = new Float32Array(samples);
      
      for (let i = 0; i < samples; i++) {
        wave[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      }
      
      const dataUri = this.createWavDataUri(wave, sampleRate);
      audio.src = dataUri;
      audio.preload = 'auto';
      audio.volume = this.masterVolume;
    } catch (e) {
      console.log('Error creating audio:', e);
    }
    
    return audio;
  }

  createWavDataUri(samples, sampleRate) {
    const length = samples.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
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
    
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async loadSound(name, frequency, type = 'sine', duration = 0.1) {
    if (this.webAudioSupported) {
      this.sounds.set(name, { frequency, type, duration });
    }
  }

  async initialize() {
    await this.loadSound('pellet', 880, 'square', 0.1);
    await this.loadSound('powerPellet', 220, 'sawtooth', 0.3);
    await this.loadSound('eatGhost', 440, 'triangle', 0.5);
    await this.loadSound('death', 130, 'sawtooth', 1.0);
    await this.loadSound('fruit', 720, 'sine', 0.4);
    await this.loadSound('extraLife', 1100, 'sine', 0.8);
    
    this.isInitialized = true;
    console.log('Ms. Pac-Man Audio initialized');
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
        const audioClone = audio.cloneNode();
        audioClone.volume = volume * this.masterVolume;
        audioClone.currentTime = 0;
        audioClone.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (e) {
      console.log('Error playing fallback audio:', e);
    }
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// ===========================================
// INPUT MANAGER
// ===========================================

/**
 * MsPacManInputManager - Input handling for Ms. Pac-Man
 */
class MsPacManInputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.touchStartPos = null;
    this.swipeThreshold = 50;
    this.lastDirection = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Touch events for mobile
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
    if (this.lastDirection) {
      const direction = this.lastDirection;
      this.lastDirection = null;
      return this.getDirectionVector(direction);
    }

    for (const key of this.keys) {
      if (GAME_CONFIG.controls.keyboard.up.includes(key)) {
        return new Vector2D(0, -1);
      }
      if (GAME_CONFIG.controls.keyboard.down.includes(key)) {
        return new Vector2D(0, 1);
      }
      if (GAME_CONFIG.controls.keyboard.left.includes(key)) {
        return new Vector2D(-1, 0);
      }
      if (GAME_CONFIG.controls.keyboard.right.includes(key)) {
        return new Vector2D(1, 0);
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
    return Array.from(this.keys).some(key => 
      GAME_CONFIG.controls.keyboard.start.includes(key)
    );
  }

  isRestartPressed() {
    return Array.from(this.keys).some(key => 
      GAME_CONFIG.controls.keyboard.restart.includes(key)
    );
  }
}

// ===========================================
// GAME UI
// ===========================================

/**
 * MsPacManUI - User interface with Ms. Pac-Man styling
 */
class MsPacManUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(gameState) {
    const { score, lives, mazeNumber, gameOver, paused, highScore } = gameState;
    const uiY = GAME_CONFIG.maze.height * GAME_CONFIG.maze.cellSize + 20;

    this.ctx.fillStyle = GAME_CONFIG.colors.ui;
    this.ctx.font = '16px monospace';

    // Score
    this.ctx.fillText(`SCORE: ${score.toLocaleString()}`, 10, uiY);
    
    // High Score
    this.ctx.fillText(`HIGH: ${highScore.toLocaleString()}`, 180, uiY);
    
    // Maze number instead of level
    this.ctx.fillText(`MAZE: ${mazeNumber}`, 320, uiY);

    // Lives with Ms. Pac-Man icons
    this.ctx.fillText(`LIVES: `, 10, uiY + 25);
    for (let i = 0; i < lives; i++) {
      this.renderMsPacManLifeIcon(70 + i * 25, uiY + 15);
    }

    // State messages
    if (gameOver) {
      this.renderCenteredMessage('GAME OVER', 'Press R to restart');
    } else if (paused) {
      this.renderCenteredMessage('PAUSED', 'Press SPACE to continue');
    }
  }

  renderMsPacManLifeIcon(x, y) {
    const ctx = this.ctx;
    const radius = 8;
    
    // Ms. Pac-Man body
    ctx.fillStyle = GAME_CONFIG.colors.mspacman;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI / 6, -Math.PI / 6);
    ctx.lineTo(x, y);
    ctx.fill();
    
    // Bow
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(x + 6, y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  renderCenteredMessage(title, subtitle) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    ctx.fillStyle = GAME_CONFIG.colors.ui;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, centerY - 20);

    // Subtitle
    ctx.font = '16px monospace';
    ctx.fillText(subtitle, centerX, centerY + 20);
    
    ctx.textAlign = 'left';
  }
}

// ===========================================
// MAIN GAME ENGINE
// ===========================================

/**
 * MsPacManGameEngine - Complete game engine for Ms. Pac-Man
 */
class MsPacManGameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('gameOverlay');
    this.input = new MsPacManInputManager(this.canvas);
    this.audio = new MsPacManAudioManager();
    this.ui = new MsPacManUI(this.canvas);
    
    this.gameState = 'MENU';
    this.paused = false;
    this.gameOver = false;
    this.score = 0;
    this.mazeNumber = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.highScore = localStorage.getItem('mspacmanHighScore') || 0;
    
    this.maze = null;
    this.mspacman = null;
    this.ghosts = [];
    this.movingFruit = null;
    
    this.lastFrameTime = 0;
    this.frameCounter = 0;
    this.pauseDebounce = false;
    this.gameStartTime = null;
    this.ghostEatenCount = 0;

    this.initialize();
  }

  async initialize() {
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
    
    await this.audio.initialize();
    this.resetGame();
    
    // TDD Audit setup
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('🔍 Ms. Pac-Man: Running development audit...');
      window.runAudit = this.runAuditTasks.bind(this);
      setTimeout(() => this.runAuditTasks(), 2000);
    }

    this.gameLoop();
  }

  resetGame() {
    this.maze = new MazeManager();
    this.movingFruit = new MovingFruit(this.maze);
    this.createEntities();
    this.score = 0;
    this.mazeNumber = 1;
    this.lives = GAME_CONFIG.game.lives;
    this.gameState = 'MENU';
    this.gameOver = false;
    this.paused = false;
    this.gameStartTime = null;
    this.lastFrameTime = performance.now();
    this.ghostEatenCount = 0;
    this.updateUI();
  }

  createEntities() {
    const startPos = this.maze.getCenterTile();
    this.mspacman = new MsPacManPlayer(startPos.x, startPos.y);

    this.ghosts = [
      new EnhancedGhostAI('blinky', 9, 7, GAME_CONFIG.colors.ghosts.blinky),
      new EnhancedGhostAI('pinky', 9, 9, GAME_CONFIG.colors.ghosts.pinky),
      new EnhancedGhostAI('inky', 8, 9, GAME_CONFIG.colors.ghosts.inky),
      new EnhancedGhostAI('clyde', 10, 9, GAME_CONFIG.colors.ghosts.clyde)
    ];

    console.log('👻 Ms. Pac-Man ghosts created with enhanced AI');
  }

  startGame() {
    console.log('=== MS. PAC-MAN STARTED ===');
    this.gameState = 'PLAYING';
    this.gameStartTime = Date.now();
    this.overlay.style.display = 'none';
  }

  gameLoop() {
    const now = performance.now();
    this.frameCounter++;

    if (this.gameState === 'MENU') {
      if (this.input.isStartPressed()) {
        this.startGame();
      }
      this.renderMenu();
    } else if (this.gameState === 'GAME_OVER') {
      if (this.input.isRestartPressed() || this.input.isStartPressed()) {
        this.resetGame();
        return;
      }
      this.render();
    } else {
      if (this.input.isPausePressed() && !this.pauseDebounce) {
        this.togglePause();
        this.pauseDebounce = true;
        setTimeout(() => this.pauseDebounce = false, 200);
      }

      this.update();
      this.render();
    }

    this.lastFrameTime = now;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    if (this.paused || this.gameOver) return;

    const direction = this.input.getDirection();
    if (direction) {
      this.mspacman.setDirection(direction);
    }

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.mspacman.update(this.maze);
    this.movingFruit.update();
    
    this.ghosts.forEach(ghost => {
      ghost.update(this.mspacman, this.ghosts, this.maze, deltaTime, this.gameStartTime);
    });

    this.checkCollisions();
    this.checkWinCondition();
    this.updateUI();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.maze.render(this.ctx);
    this.movingFruit.render(this.ctx);
    this.mspacman.render(this.ctx);
    
    this.ghosts.forEach(ghost => ghost.render(this.ctx));
    
    this.ui.render({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      mazeNumber: this.mazeNumber,
      gameOver: this.gameOver,
      paused: this.paused,
      gameState: this.gameState
    });
  }

  renderMenu() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.maze.render(this.ctx);
    
    this.overlay.style.display = 'flex';
    document.getElementById('overlayTitle').textContent = 'MS. PAC-MAN GG';
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
    if (this.paused) {
      document.getElementById('overlayTitle').textContent = 'PAUSED';
      document.getElementById('overlayMessage').textContent = 'Press SPACE to Resume';
    }
  }

  checkCollisions() {
    // Pellets
    const consumed = this.maze.consumePellet(this.mspacman.position);
    if (consumed) {
      this.score += consumed.points;
      this.audio.playSound('pellet');
      if (consumed.type === 'powerPellet') {
        this.activatePowerPellet();
      }
    }

    // Moving fruit
    const fruitConsumed = this.movingFruit.checkCollision(this.mspacman.position);
    if (fruitConsumed) {
      this.score += fruitConsumed.points;
      this.audio.playSound('fruit');
      console.log(`🍎 Moving fruit eaten: ${fruitConsumed.fruitType} (+${fruitConsumed.points} points)`);
    }

    // Ghosts
    this.ghosts.forEach(ghost => {
      if (!ghost.eaten && ghost.checkCollisionWithPacman(this.mspacman)) {
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
    this.ghostEatenCount = 0;
    
    this.ghosts.forEach(ghost => {
      if (!ghost.inHouse && !ghost.eaten) {
        ghost.makeVulnerable();
      }
    });
  }

  eatGhost(ghost) {
    this.ghostEatenCount++;
    const points = GAME_CONFIG.game.scoring.ghost * Math.pow(2, this.ghostEatenCount - 1);
    this.score += points;
    
    this.audio.playSound('eatGhost');
    ghost.getEaten();
    
    console.log(`Ghost eaten! Points: ${points}`);
  }

  playerDeath() {
    this.lives--;
    this.audio.playSound('death');
    
    if (this.lives <= 0) {
      this.gameState = 'GAME_OVER';
      this.gameOver = true;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mspacmanHighScore', this.highScore);
      }
      this.overlay.style.display = 'flex';
      document.getElementById('overlayTitle').textContent = 'GAME OVER';
      document.getElementById('overlayMessage').textContent = `Final Score: ${this.score}`;
    } else {
      // Reset positions
      const startPos = this.maze.getCenterTile();
      
      this.mspacman.position = Vector2D.fromGrid(startPos.x, startPos.y);
      this.mspacman.gridPosition = { col: startPos.x, row: startPos.y };
      this.mspacman.direction = new Vector2D(0, 0);
      this.mspacman.nextDirection = new Vector2D(0, 0);
      this.mspacman.moving = false;
      this.mspacman.moveTimer = 0;
      
      // Reset ghosts
      this.ghosts.forEach(ghost => {
        ghost.position = Vector2D.fromGrid(ghost.homePosition.col, ghost.homePosition.row);
        ghost.gridPosition = { col: ghost.homePosition.col, row: ghost.homePosition.row };
        ghost.direction = new Vector2D(0, -1);
        ghost.moving = false;
        ghost.moveTimer = 0;
        ghost.inHouse = true;
        ghost.eaten = false;
        ghost.vulnerable = false;
        ghost.mode = 'SCATTER';
        ghost.modeTimer = 0;
        ghost.gameStartTime = this.gameStartTime;
      });
    }
  }

  checkWinCondition() {
    if (this.maze.getAllPelletsCollected()) {
      this.mazeNumber = this.maze.advanceToNextMaze();
      this.movingFruit = new MovingFruit(this.maze);
      this.createEntities();
      console.log(`🏆 Maze completed! Advanced to maze ${this.mazeNumber}`);
    }
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('highScore').textContent = this.highScore;
    document.getElementById('maze').textContent = this.mazeNumber;
  }

  /**
   * TDD Audit Tasks for Ms. Pac-Man
   */
  runAuditTasks() {
    const results = [];
    
    console.log('--- 🎀 Ms. Pac-Man QA & Audit Report ---');

    // Ms. Pac-Man specific tests
    const hasMsPacMan = this.mspacman instanceof MsPacManPlayer;
    results.push({ name: 'Ms. Pac-Man Player', pass: hasMsPacMan, details: 'Ms. Pac-Man player exists' });

    const hasMovingFruit = this.movingFruit instanceof MovingFruit;
    results.push({ name: 'Moving Fruit System', pass: hasMovingFruit, details: 'Moving fruit system active' });

    const hasEnhancedGhosts = this.ghosts.every(ghost => ghost instanceof EnhancedGhostAI);
    results.push({ name: 'Enhanced Ghost AI', pass: hasEnhancedGhosts, details: 'All ghosts use enhanced AI' });

    const hasMultipleMazes = Object.keys(MS_PACMAN_MAZES).length === 4;
    results.push({ name: 'Multiple Mazes', pass: hasMultipleMazes, details: '4 mazes available' });

    const currentMaze = this.maze && this.maze.currentMazeNumber;
    const validMazeNumber = currentMaze >= 1 && currentMaze <= 4;
    results.push({ name: 'Valid Maze Number', pass: validMazeNumber, details: `Current maze: ${currentMaze}` });

    // Base game tests
    const playerCount = this.mspacman ? 1 : 0;
    results.push({ name: 'Player Count', pass: playerCount === 1, details: `Found ${playerCount} player` });

    const ghostCount = this.ghosts.length;
    results.push({ name: 'Ghost Count', pass: ghostCount === 4, details: `Found ${ghostCount} ghosts` });

    const validStates = ['MENU', 'PLAYING', 'PAUSED', 'GAME_OVER'];
    results.push({ name: 'Valid Game State', pass: validStates.includes(this.gameState), details: `State: ${this.gameState}` });

    const backLink = document.querySelector('a[href*="../index.html"]');
    results.push({ name: 'Back Navigation', pass: !!backLink, details: 'Link to ../index.html exists' });

    const hasLicense = document.head.innerHTML.includes('© GG, MIT License');
    results.push({ name: 'License Header', pass: hasLicense, details: 'MIT license in HTML' });

    const canvasSizeCorrect = this.canvas.width === 380 && this.canvas.height === 420;
    results.push({ name: 'Canvas Dimensions', pass: canvasSizeCorrect, details: `${this.canvas.width}×${this.canvas.height}` });

    const audioInitialized = this.audio && this.audio.isInitialized;
    results.push({ name: 'Audio System', pass: audioInitialized, details: 'Audio manager initialized' });

    console.table(results.map(r => ({ 'Check': r.name, 'Status': r.pass ? '✅ PASS' : '❌ FAIL', 'Details': r.details })));
    
    const allPassed = results.every(r => r.pass);
    console.log(`--- Ms. Pac-Man Audit Result: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'} ---`);

    return allPassed;
  }
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize Ms. Pac-Man game
document.addEventListener('DOMContentLoaded', () => {
  const game = new MsPacManGameEngine();
  window.game = game; // Expose for debugging
  console.log('🎀 Ms. Pac-Man GG initialized');
});
