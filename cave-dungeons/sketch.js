// Cave Dungeons
// Robert Yang
// Nov. 13, 2023

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

let grid = new Array(ySize);
let nodes = new Array(Math.floor(ySize / 2));

function wrapIndices(a, b) {
  a += ySize;
  a %= ySize;
  b += xSize;
  b %= xSize;
  return [a,b];
}

function getAncientness(i, j) {
  return noise(i/10, j/10, level/10);
}

function evaluateNextGoL() {
  let newGrid = new Array(ySize);
  generateEmptyGrid(newGrid);
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      let alive = row[j];
      let others = 0;
      for(let iDisp of [-1,0,1]) {
        for(let jDisp of [-1,0,1]) {
          if(iDisp === 0 && jDisp === 0) {
            continue;
          }
          let a = i + iDisp;
          let b = j + jDisp;
          let newIndices = wrapIndices(a,b);
          a = newIndices[0];
          b = newIndices[1];
          others += grid[a][b];
        }
      }
      if(alive) {
        newGrid[i][j] = 2 <= others & others <= 3;
      }
      else {
        newGrid[i][j] = !!(others === 3);
      }
    }
  }
  return newGrid;
}

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

function evaluateNext(grid) {
  let newGrid = new Array(ySize);
  generateEmptyGrid(newGrid);
  evaluateCave(newGrid, grid);
  return newGrid;
}

function generateEmptyGrid(grid, x = xSize, toFill = 0) {
  for(let i = 0; i < ySize; i++) {
    grid[i] = new Array(x).fill(toFill);
  }
}

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

// function roughenTerrain(grid) {
//   for(let i = 0; i < grid.length; i++) {
//     let row = grid[i];
//     for(let j = 0; j < row.length; j++) {
//       if (grid[i][j] === 0) {
//         grid[i][j] = noise(i/3, j/3, 20) * (1 - getAncientness(i, j)**2) * terrainRoughness;
//       }
//     }
//   }
// }


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
        if(x < 0 || x >= row.length || y < 0 || y >= nodes.length || nodes[y][x][0] === 0) {
          continue;
        }
        let otherNode = nodes[y][x];
        nodes[i][j][1].push([0, dir[0], dir[1], random()]);
      }
    }
  }
}

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

function doPrim(i, j) {
  let pq = new Heap(getValidEdges(i, j), (a, b) => a[0] - b[0]);
  nodes[i][j][0] = 2;
  while(pq.heap.length > 1) {
    let edge = pq.pop();
    let i0 = edge[1][0];
    let j0 = edge[1][1];
    let i1 = edge[2][0];
    let j1 = edge[2][1];
    let y = i1 - i0;
    let x = j1 - j0;

    newNode = nodes[i1][j1];
    prevNode = nodes[i0][j0];

    if(newNode[0] !== 1) {
      continue;
    }
    newNode[0] = 2;

    // Knock down walls in nodes
    prevNode[1].find((a) => a[1] === x && a[2] === y)[0] = 1;
    newNode[1].find((a) => a[1] === -x && a[2] === -y)[0] = 1;
    grid[2*i0+y][2*j0+x] = 0;

    for(t of getValidEdges(i1, j1)) {
      pq.push(t);
    }
  }
}

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

function getMiningEffectiveness(i, j) {
  return (1 - getAncientness(i, j))**4;
}

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

function generateLevel() {
  level++;
  numEnemies = Math.floor((level + 1) * numEnemiesScaling);
  numIronClaws = Math.floor(level * numIronClawsScaling);
  generateEmptyGrid(grid);
  generateEmptyGrid(nodes, Math.floor(xSize / 2), [0]);
  randomizeGrid(grid);
  for(let i = 0; i < 3; i++) {
    grid = evaluateNext(grid);
  }
  insertNodes(grid, nodes);
  generatePerfectMaze();
  spawnPlayer();
  spawnEnemy();
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
  if(keyCode === ENTER) {
    generateLevel();
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
    background(100, 0, 0, 100);
    fill("white");
    textAlign(CENTER, CENTER);
    text("YOU DIED", width/2, height/2)
    respawnTimer = millis();
    gameState = "respawning";
  }
  else if(gameState === "respawning") {
    background(100, 0, 0, 5);
    text("YOU DIED", width/2, height/2)
    if(millis() - respawnTimer >= respawnDuration) {
      level = 0;
      generateLevel();
      gameState = "default";
    }
  }
  else {
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
      generateLevel();
      gameState = "default";
    }
  }
}
