// Cave Dungeons
// Robert Yang
// Nov. 13, 2023

let squareSize = 50;
const padding = 10;
let startX;
let startY;
const xSize = 60;
const ySize = 30;

const fillPortion = 0.4;
const richnessPortion = 0.5;
let age = 0;

const noiseScalar = 0.5;
const terrainRoughness = 0;

let inAncientness = false;
let ancientness = 0;

let gameState = "default";
let respawnTimer = 0;
const respawnDuration = 2000;

const cellTypes = {
  exit: 2,
};

// const start_text = `Press Enter to evaluate one step
// Press Space to toggle auto-evaluation
// Press the squares to flip their state
// Press E to empty the grid
// Press R to randomize the grid

// Click anywhere to start`;

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
          //console.log(grid[a]);
          others += grid[a][b];
          //console.log(others);
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
  // newGrid = evaluateNextGoL();
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      let alive = row[j];
      if(alive) {
        if(age > 3) {
          if(getAliveWithin(grid, i, j, 1) >= 0) {
            newGrid[i][j] = 1;
          }
        }
        else {
          if(getAliveWithin(grid, i, j, 1) >= 3) {
            newGrid[i][j] = 1;
          }
        }
      }
      else {
        if(getAliveWithin(grid, i, j, 1) >= 5) {
          newGrid[i][j] = 1;
        }
      }
    }
  }
  //age += 1;
}

// function evaluateLateCave(newGrid, grid) {
//   // newGrid = evaluateNextGoL();
//   for(let i = 0; i < grid.length; i++) {
//     let row = grid[i];
//     for(let j = 0; j < row.length; j++) {
//       let alive = row[j];
//       if (getAliveWithin(grid, i, j, 1) >= 5) {
//         newGrid[i][j] = 1;
//       }
//       if(getAliveWithin(grid, i, j, 2) <= 2) {
//         newGrid[i][j] = 0;
//       }
//     }
//   }
// }

function evaluateNext(grid) {
  let newGrid = new Array(ySize);
  generateEmptyGrid(newGrid);
  // let newGrid = structuredClone(grid);
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

function roughenTerrain(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      if (grid[i][j] === 0) {
        grid[i][j] = noise(i/3, j/3, 20) * (1 - getAncientness(i, j)**2) * terrainRoughness;
      }
    }
  }
}

// function fillAncients(grid) {
//   for(let i = 0; i < grid.length; i++) {
//     let row = grid[i];
//     for(let j = 0; j < row.length; j++) {
//       if (noise(i/10, j/10) > richnessPortion) {
//         grid[i][j][0] = 1; // ! Altered meaning !
//       }
//       else {
//         grid[i][j][0] = 0;
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
      if(getAncientness(i, j) > richnessPortion) {//&&
        //(getAliveWithin(grid, i, j, 1) >= 8 ||
        //getAliveWithin(grid, i, j, 1) >= 5 && random() > 0.5)) {
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
  // if(node[0] !== 1) {
  //   return arr;
  // }
  // node[0] = 2;
  for(let t of node[1]) {
    let y = i + t[2];
    let x = j + t[1];
    if (nodes[y][x][0] === 1) { 
      arr.push([t[3], [i, j], [y, x]]);
    }
  }
  // console.log(arr);
  return arr;
}

function doPrim(i, j) {
  //nodes[i][j][0] = 2;
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

function getOverlaidGrid(grid, overlay) { // Used mostly for debugging; will not be present in the final version
  let newGrid = structuredClone(overlay);
  for(let i = 0; i < newGrid.length; i++) {
    let row = newGrid[i];
    for(let j = 0; j < row.length; j++) {
      if(row[j] === 1) {
        row[j] = grid[i][j];
      }
    }
  }
  return newGrid;
}

function getMiningEffectiveness(i, j) {
  return (1 - getAncientness(i, j))**4;
}

// Classes

const moveTime = 50;
const ironClawMoveTime = 80;
const entityFilling = 0.8;

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.newX = x;
    this.newY = y;
    this.prevX = x;
    this.prevY = y;
    this.timer = 0;
    this.turn = false;
    this.onTimer = false;
    this.moveTime = moveTime;
    this.colour = "black";
    this.minePower = 1;
    this.outcome = "";
    this.type = "";
  }

  get_direction() {} // Will be overwritten by children

  go_next() {} // Also will be overwritten by children

  force_back() {
    this.x = this.prevX;
    this.y = this.prevY;
  }

  proceed() {
    this.x = this.newX;
    this.y = this.newY;
    this.prevX = this.newX;
    this.prevY = this.newY;
  }

  update() {
    if(this.turn && !this.onTimer) {
      // Enemy movement to midpoint
      if(this.get_direction()) {
        this.onTimer = true; // Add a timer to stall entity in midpoint
        this.timer = millis();
      }
    }
    else if(this.turn && this.onTimer && millis() - this.timer > this.moveTime) {
      // Completion and outcome of movement
      this.turn = false; // Stops entity from moving
      this.timer = millis(); // to smoothen motion
      this.newX = 2 * this.x - this.prevX;
      this.newY = 2 * this.y - this.prevY;
      if(this.newX < 0 || this.newX >= xSize || this.newY < 0 || this.newY >= ySize) {
        // Hit an edge
        this.force_back();
        this.outcome = "hit_edge";
      }
      else if(grid[this.newY][this.newX] === 2) {
        // Entered an exit
        this.go_next();
        this.outcome = "hit_exit";
      }
      else if(grid[this.newY][this.newX] >= getMiningEffectiveness(this.newY, this.newX) * this.minePower) {
        // Mining a block
        grid[this.newY][this.newX] -= getMiningEffectiveness(this.newY, this.newX) * this.minePower;
        this.force_back();
        this.outcome = "slammed";
      }
      else {
        // Normal movement
        grid[this.newY][this.newX] = 0;
        this.proceed();
        this.outcome = "moved";
      }
    }
    else if(millis() - this.timer > this.moveTime) {
      // Delay before moving again
      this.onTimer = false;
      this.turn = true;
    }
  }

  draw() {
    fill(this.colour);
    circle(startX + (this.x+0.5) * squareSize, startY + (this.y+0.5) * squareSize, squareSize * entityFilling);
  }
}

const random_possibilities = [-0.5, 0, 0.5];

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y);
    this.colour = "chocolate";
    this.minePower = 0.0001;
    this.weak = true;
  }

  get_direction() {
    if(this.weak && (this.outcome === "slammed" || this.outcome === "hit_edge")) {
      this.x += random(random_possibilities);
      this.y += random(random_possibilities);
      return true;
    }
    else {
      let xDisp = player.x - this.x;
      let yDisp = player.y - this.y;
      let xDist = Math.abs(xDisp);
      let yDist = Math.abs(yDisp);
      let endTurn = false;
      if(xDisp === 0 && yDisp === 0) {
        gameState = "death";
      }

      if(xDisp !== 0) {
        this.x += xDisp / (2 * xDist);
        endTurn = true;
      }
      if(yDisp !== 0) {
        this.y += yDisp / (2 * yDist);
        endTurn = true;
      }
      return endTurn;
    }
  }
}

class IronClaw extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.minePower = 0.8;
    this.colour = "silver";
    this.weak = false;
    this.moveTime = ironClawMoveTime;
  }
}

const movementKeys = [87, 65, 83, 68];

const keyMovement = {
  87: [0, -1],
  65: [-1, 0],
  83: [0, 1],
  68: [1, 0],
};

class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.colour = "green";
    this.minePower = 1;
  }

  get_direction() {
    let endTurn = false;
    for(let k of movementKeys) {
      if (keyIsDown(k)) {
        endTurn = true;
        this.x += keyMovement[k][0] / 2;
        this.y += keyMovement[k][1] / 2;
      }
    }
    return endTurn;
  }

  go_next() {
    gameState = "next";
  }

  get_ancientness() {
    return getAncientness(this.prevY, this.prevX);
  }
}

let player;
let enemies = [];
let level = -1;

function spawnPlayer() {
  player = new Player(4, 4);
  for(let i = 2; i <= 6; i++) {
    for(let j = 2; j <= 6; j++) {
      grid[i][j] = 0;
    }
  }
}

let numEnemies = 1;
let numIronClaws = 3;
const numEnemiesScaling = 0.5;
const numIronClawsScaling = 0.25;

function spawnEnemy() {
  enemies = [];
  for(let n = 0; n < numEnemies; n++) {
    let enemyI = Math.floor(random(ySize/3, ySize));
    let enemyJ = Math.floor(random(xSize/3, xSize));
    for(let i = Math.max(0, enemyI - 1); i <= Math.min(enemyI + 1, ySize - 1); i++) {
      for(let j = Math.max(0, enemyJ - 1); j <= Math.min(enemyJ + 1, xSize - 1); j++) {
        grid[i][j] = 0;
      }
    }
    //grid[exitI][exitJ] = cellTypes.exit;
    enemies.push(new Enemy(enemyJ, enemyI));
  }
  for(let n = 0; n < numIronClaws; n++) {
    let enemyI = Math.floor(random(ySize/3, ySize));
    let enemyJ = Math.floor(random(xSize/3, xSize));
    for(let i = Math.max(0, enemyI - 1); i <= Math.min(enemyI + 1, ySize - 1); i++) {
      for(let j = Math.max(0, enemyJ - 1); j <= Math.min(enemyJ + 1, xSize - 1); j++) {
        grid[i][j] = 0;
      }
    }
    //grid[exitI][exitJ] = cellTypes.exit;
    enemies.push(new IronClaw(enemyJ, enemyI));
  }
}

function spawnExit() {
  let exitI = ySize - 5; // 4;
  let exitJ = xSize - 5; // 10;
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
  roughenTerrain(grid);
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
      // if(clicked &&
      //   xCoord <= mouseX && mouseX <= xCoord + squareSize &&
      //   yCoord <= mouseY && mouseY <= yCoord + squareSize) {
      //   grid[i][j] = !grid[i][j];
      //   clicked = false;
      // }
      rect(xCoord, yCoord, squareSize, squareSize);
      // if(randomSquares) {
      //   grid[i][j] = round(random());
      // }
    }
  }
  // time += 0.05;
}

function keyPressed() {
  if(keyCode === ENTER) {
    //grid = evaluateNext(grid);
    generateLevel();
    // gameState = "death";
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
  // clicked = false;
  // if(millis() - start_ms < 255 * start_speed && randomSquares) {
  //   background(dark_col, 0, 0, 255 + (start_ms - millis()) / start_speed);
  // }
}
