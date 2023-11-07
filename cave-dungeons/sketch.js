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

// let clicked = true;
// let randomSquares = true;
// let continueEvaluation = false;
// let time = 0;

// let ms = 0;

// let run_ms = 0;
// let no_dim_runtime = 3000;
// let dim_speed = 10;
// const dim_limit = 130;
// const dark_col = 139;

// let start_gol = true;
// let start_ms = 0;
// const start_speed = 10;

// const eval_speed = 50;

//let movedX; let movedY;

// const start_text = `Press Enter to evaluate one step
// Press Space to toggle auto-evaluation
// Press the squares to flip their state
// Press E to empty the grid
// Press R to randomize the grid

// Click anywhere to start`;

//const clickRequests = [];

// let grid = [
//   [1,0,0,1],
//   [0,0,1,1],
//   [1,1,0,1],
//   [0,1,1,1]];

let grid = new Array(ySize);
//let ancients = new Array(ySize);
let nodes = new Array(Math.floor(ySize / 2));

function wrapIndices(a, b) {
  a += ySize;
  a %= ySize;
  b += xSize;
  b %= xSize;
  return [a,b];
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
      if (noise(i/10, j/10) > richnessPortion) {
        grid[i][j] = 1;
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
      if(noise(i/10, j/10) > richnessPortion) {//&&
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

class Heap {
  constructor() {
    this.heap = [];
  }
}

function doPrim(i, j) {
  nodes[i][j][0] = 2;

}

function generatePerfectMaze() {
  //
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

// Classes

const moveTime = 50;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.timer = 0;
    this.turn = true;
    this.onTimer = false;
  }

  update() {
    if(this.turn && keyIsPressed) {
      let endTurn = true;
      let xDisp = 0;
      let yDisp = 0;
      switch(key) {
      case "w":
        this.y -= 0.5;
        break;
      case "s":
        this.y += 0.5;
        break;
      case "a":
        this.x -= 0.5;
        break;
      case "d":
        this.x += 0.5;
        break;
      default:
        endTurn = false;
      }
      //console.log(key);
      if(endTurn) {
        this.turn = false;
        this.onTimer = true;
        this.timer = millis();
      }
    }
    if(this.onTimer && millis() - this.timer > moveTime) {
      let newX = 2 * this.x - this.prevX;
      let newY = 2 * this.y - this.prevY;
      if(newX < 0 || newX >= xSize || newY < 0 || newY >= ySize) {
        this.x = this.prevX;
        this.y = this.prevY;
        this.onTimer = false;
        return;
      }
      if(grid[newY][newX] === 1) {
        grid[newY][newX] = 0;
        this.x = this.prevX;
        this.y = this.prevY;
        this.onTimer = false;
        this.timer = millis();
        return;
      }
      this.x = newX;
      this.y = newY;
      this.prevX = newX;
      this.prevY = newY;
      this.onTimer = false;
      this.timer = millis();
    }
    else if(millis() - this.timer > moveTime) {
      this.turn = true;
    }
  }

  draw() {
    fill("green");
    circle(startX + (this.x+0.5) * squareSize, startY + (this.y+0.5) * squareSize, 10);
  }
}

let player;

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(0, 50);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
  generateEmptyGrid(grid);
  //generateEmptyGrid(ancients);
  generateEmptyGrid(nodes, Math.floor(xSize / 2), [0]);
  randomizeGrid(grid);
  //fillAncients(nodes);
  for(let i = 0; i < 3; i++) {
    grid = evaluateNext(grid);
  }
  //grid = getOverlaidGrid(grid, ancients);
  insertNodes(grid, nodes);
  // background("darkred");
  //window.alert(start_text);

  player = new Player(0, 0);
}

function displayGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      fill(255*(1-grid[i][j]));
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

// function mousePressed() {
//   //clickRequests.push([mouseX, mouseY]);
//   if(start_gol) {
//     start_gol = false;
//   }
//   else {
//     clicked = true;
//     randomSquares = false;
//   }
// }

function keyPressed() {
  // if(start_gol) {
  //   start_gol = false;
  // }
  // else {
  //   randomSquares = false;
  //   if(keyCode === 82) {
  //     randomSquares = false;
  //     continueEvaluation = false;
  //     randomizeGrid(grid);
  //   }
  //   if(keyCode === 69) {
  //     randomSquares = false;
  //     continueEvaluation = false;
  //     generateEmptyGrid(grid);
  //   }
  //   if(keyCode === ENTER) {
  //     randomSquares = false;
  //     continueEvaluation = false;
  //     grid = evaluateNext();
  //   }
  //   if(keyCode === 32) {
  //     randomSquares = false;
  //     continueEvaluation = !continueEvaluation;
  //     resetRunMs();
  //   }
  // }
  if(keyCode === ENTER) {
    grid = evaluateNext(grid);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
}

// function resetRunMs() {
//   run_ms = millis() + no_dim_runtime;
// }

function draw() {
  // if(start_gol) {
  //   background("darkred");
  //   start_ms = millis();
  // }
  background("darkblue");
  // if(randomSquares && millis() - ms > eval_speed) {
  //   randomizeGrid(grid);
  //   ms = millis();
  // }
  // else if(continueEvaluation && millis() - ms > eval_speed) {
  //   grid = evaluateNext();
  //   ms = millis();
  // }
  displayGrid(grid);
  player.update();
  player.draw();
  // clicked = false;
  // if(millis() - start_ms < 255 * start_speed && randomSquares) {
  //   background(dark_col, 0, 0, 255 + (start_ms - millis()) / start_speed);
  // }
}
