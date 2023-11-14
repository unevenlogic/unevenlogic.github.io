// Cave Dungeons
// Robert Yang
// Nov. 13, 2023
//
// Use WASD to move; diagonal movement is enabled.
// Your goal is to reach the blue square.
// Mining is enabled (activate by attempting to move into a wall), but
// labyrinth walls are tougher than cave walls.
// There are two types of enemies. Normal ones move as fast as you but can't
// mine walls; iron claws move slower but mine at half your speed.
// Normal enemies are introduced every other level starting from level one.
// Iron claws are introduced every four levels starting from level four.
// The player starts from the tutorial level, and subsequent deaths from
// enemies knock the player back a level (note that players can still touch
// enemies without dying; they just can't stand still).
//
// Extras for experts:
// - Min heap implementation
// - Prim's algorithm implementation
// - Labyrinth generation with the above two
// - Cave terrain generation with celluar automata
// - Putting the two generation types together with ancientness perlin noise
// - Inheritence
// - An enum (kind of?)
//
// Debug keys (enable by setting below to true):
// - Enter: skip a level
// - X: kill the player and jump back a level (won't go below 0)

const DEBUG = false; // Set true to enable debug keys

let squareSize; // Side length of squares
const padding = 10; // Minimum padding between grid and edges of screen
let startX; // Top-right x-position of grid
let startY; // Top-right y-position of grid
const xSize = 60; // Number of squares across
const ySize = 30; // Number of squares down

const fillPortion = 0.4; // Portion of solid rock for cave generation
const richnessPortion = 0.5; // Portion of solid rock used for labyrinths

const respawnDuration = 2000; // Time taken to respawn
let respawnTimer = 0; // Timer used for respawning
let gameState = "default"; // Game state: default, next, death, or respawn
let level = -1; // Game level

// Enum for cell types, specifically the exit
const cellTypes = {
  exit: 2,
};

const start_text = `Use WASD to move; diagonal movement is enabled.
Your goal is to reach the blue square.
Mining is enabled, but labyrinth walls are tougher than cave walls.

The enemies get harder each level; don't let them catch you.

Click OK to start`;

let grid = new Array(ySize); // The grid that is displayed
let nodes = new Array(Math.floor(ySize / 2)); // Labyrinth generation nodes

/**
 * Wraps the coordinates of the grid at the edges.
 * @param {number} a The i-index.
 * @param {number} b The j-index.
 * @returns The wrapped coordinates.
 */
function wrapIndices(a, b) {
  a += ySize;
  a %= ySize;
  b += xSize;
  b %= xSize;
  return [a,b];
}

/**
 * Gets the ancientness of a location.
 * Ancient places were carved into labyrinths by long-lost civilizations, and
 * the walls were hardened before the grid was buried and carved up by erosion
 * and caves.
 * @param {number} i The i-index.
 * @param {number} j The j-index.
 * @returns The ancientness value of a location.
 */
function getAncientness(i, j) {
  return noise(i/10, j/10, level/10);
}

/**
 * Gets the number of 1's within a certain radius around a cell in a grid.
 * @param {Array.<Array.<number>>} grid The grid that is checked.
 * @param {number} i The i-index.
 * @param {number} j The j-index.
 * @param {number} r The radius of checking.
 * @returns The number of 1's within the radius.
 */
function getAliveWithin(grid, i, j, r) {
  let acc = 0;
  for(let iDisp = -r; iDisp <= r; iDisp++) {
    for(let jDisp = -r; jDisp <= r; jDisp++) {
      if(iDisp === 0 && jDisp === 0) {
        continue;
      }
      let a = i + iDisp;
      let b = j + jDisp;
      let newIndices = wrapIndices(a,b);
      a = newIndices[0];
      b = newIndices[1];
      acc += grid[a][b];
    }
  }
  return acc;
}

/**
 * Evaluates a cave celluar automata into a new grid.
 * @param {Array.<Array.<number>>} newGrid An empty grid.
 * @param {Array.<Array.<number>>} grid The grid that is used for evaluation.
 */
function evaluateCave(newGrid, grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      let alive = row[j];
      if(alive) {
        if(getAliveWithin(grid, i, j, 1) >= 3) {
          newGrid[i][j] = 1;
        }
      }
      else {
        if(getAliveWithin(grid, i, j, 1) >= 5) {
          newGrid[i][j] = 1;
        }
      }
    }
  }
}

/**
 * Returns a grid that has been evaluated by evaluateCave.
 * @param {Array.<Array.<number>>} grid The grid to evaluate.
 * @returns The new grid.
 */
function evaluateNext(grid) {
  let newGrid = new Array(ySize);
  generateEmptyGrid(newGrid);
  evaluateCave(newGrid, grid);
  return newGrid;
}

/**
 * Converts an empty array to a uniform 2d array.
 * @param {Array} grid The grid to fill.
 * @param {number} x The number of cells per row.
 * @param {number} toFill The number to fill the cells with.
 */
function generateEmptyGrid(grid, x = xSize, toFill = 0) {
  for(let i = 0; i < ySize; i++) {
    grid[i] = new Array(x).fill(toFill);
  }
}

/**
 * Randomizes the grid while setting the "ancient" parts of it black.
 * @param {Array.<Array.<number>>} grid The grid to randomize.
 */
function randomizeGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      grid[i][j] = random() < fillPortion;
      if (getAncientness(i, j) > richnessPortion) {
        grid[i][j] = 1;
      }
    }
  }
}

const dirs = [[0,-1], [1,0], [0,1], [-1,0]]; // N, E, S, W

function insertNodes(grid, nodes) {
  // Identify nodes
  for(let i = 0; i < grid.length; i+=2) {
    let row = grid[i];
    for(let j = 0; j < row.length; j+=2) {
      if(getAncientness(i, j) > richnessPortion) {
        nodes[i/2][j/2] = [1, []];
        grid[i][j] = 0;
      }
    }
  }

  // Fill in edge weights
  for(let i = 0; i < nodes.length; i++) {
    let row = nodes[i];
    for(let j = 0; j < row.length; j++) {
      if(nodes[i][j][0] === 0) {
        continue;
      }
      let thisNode = nodes[i][j];
      for(let dir of dirs) {
        let y = i + dir[1];
        let x = j + dir[0];
        if(x < 0 || x >= row.length || y < 0 
          || y >= nodes.length || nodes[y][x][0] === 0) {
          continue;
        }
        thisNode[1].push([0, dir[0], dir[1], random()]);
      }
    }
  }
}

/**
 * Gets the directions of adjacent unvisited nodes.
 * @param {number} i The i-index.
 * @param {number} j The j-index.
 * @returns The directions that can be taken from a visited node.
 */
function getValidEdges(i, j) {
  let arr = [];
  let node = nodes[i][j];
  for(let t of node[1]) {
    let y = i + t[2];
    let x = j + t[1];
    if (nodes[y][x][0] === 1) { 
      arr.push([t[3], [i, j], [y, x]]);
    }
  }
  return arr;
}

/**
 * Runs Prim's algorithm and generates a local maze.
 * @param {number} i The i-index.
 * @param {number} j The j-index.
 */
function doPrim(i, j) {
  let pq = new Heap(getValidEdges(i, j), (a, b) => a[0] - b[0]);
  nodes[i][j][0] = 2;
  while(pq.heap.length > 1) {
    // Get the node with the smallest edge weight
    let edge = pq.pop();
    let i0 = edge[1][0];
    let j0 = edge[1][1];
    let i1 = edge[2][0];
    let j1 = edge[2][1];
    let y = i1 - i0;
    let x = j1 - j0;

    newNode = nodes[i1][j1];
    prevNode = nodes[i0][j0];

    if(newNode[0] !== 1) { // Already visited
      continue;
    }
    newNode[0] = 2;

    // Knock down walls in nodes
    prevNode[1].find((a) => a[1] === x && a[2] === y)[0] = 1;
    newNode[1].find((a) => a[1] === -x && a[2] === -y)[0] = 1;
    grid[2*i0+y][2*j0+x] = 0;

    // Pushes unvisited adjacent nodes into the heap
    for(t of getValidEdges(i1, j1)) {
      pq.push(t);
    }
  }
}

/**
 * Runs Prim's algorithm from each unvisited node.
 */
function generatePerfectMaze() {
  for(let i = 0; i < nodes.length; i++) {
    let row = nodes[i];
    for(let j = 0; j < row.length; j++) {
      if(nodes[i][j][0] === 1) {
        doPrim(i, j);
      }
    }
  }
}

/**
 * Gets the noise-determined ancientness value.
 * @param {number} i The i-index.
 * @param {number} j The j-index.
 * @returns The ancientness value.
 */
function getMiningEffectiveness(i, j) {
  return (1 - getAncientness(i, j))**4;
}

/**
 * Spawns the exit cell.
 */
function spawnExit() {
  let exitI = ySize - 5;
  let exitJ = xSize - 5;
  for(let i = exitI - 2; i <= exitI + 2; i++) {
    for(let j = exitJ - 2; j <= exitJ + 2; j++) {
      grid[i][j] = 0;
    }
  }
  grid[exitI][exitJ] = cellTypes.exit;
}

/**
 * Generates a new level.
 */
function generateLevel() {
  // Handle level and number of enemies
  level++;
  numEnemies = Math.floor((level + 1) * numEnemiesScaling);
  numIronClaws = Math.floor(level * numIronClawsScaling);

  // Generate caves
  generateEmptyGrid(grid);
  generateEmptyGrid(nodes, Math.floor(xSize / 2), [0]);
  randomizeGrid(grid);
  for(let i = 0; i < 3; i++) {
    grid = evaluateNext(grid);
  }

  // Generate maze
  insertNodes(grid, nodes);
  generatePerfectMaze();

  // Spawn everything
  spawnPlayer();
  spawnEnemies();
  spawnExit();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(0, 50);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
  generateLevel();
  textSize(60);
  window.alert(start_text);
}

/**
 * Displays a grid.
 * @param {Array.<Array.<number>>} grid The grid to display.
 */
function displayGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      let cell_type = grid[i][j];
      if(0 <= cell_type && cell_type <= 1) {
        fill(255*(1-grid[i][j]));
      }
      else if(cell_type === cellTypes.exit) {
        fill("blue");
      }
      let xCoord = startX + j * squareSize;
      let yCoord = startY + i * squareSize;
      rect(xCoord, yCoord, squareSize, squareSize);
    }
  }
}

function keyPressed() {
  if(DEBUG) {
    if(keyCode === ENTER) {
      generateLevel();
    }
    else if(key === "x") {
      gameState = "death";
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
}

function draw() {
  if(gameState === "death") {
    // The player has died
    background(100, 0, 0, 100);
    fill("white");
    textAlign(CENTER, CENTER);
    text("YOU DIED", width/2, height/2)
    respawnTimer = millis();
    gameState = "respawning";
  }
  else if(gameState === "respawning") {
    // The player is shown the death screen while the background fades to red
    background(100, 0, 0, 5);
    text("YOU DIED", width/2, height/2)
    if(millis() - respawnTimer >= respawnDuration) {
      level -= 2;
      if(level < -1) {
        level = -1;
      }
      generateLevel();
      gameState = "default";
    }
  }
  else {
    // The game proceeds as normal
    background(player.get_ancientness()*150, 50, 50);
    displayGrid(grid);
    player.update();
    player.draw();
    for(let enemy of enemies) {
      enemy.update();
      enemy.draw();
    }
    textAlign(RIGHT, TOP);
    fill("skyblue");
    text("Level ".concat(level), width - 2*padding, 2*padding);
    if(gameState === "next") {
      // Enter the next level
      generateLevel();
      gameState = "default";
    }
  }
}
