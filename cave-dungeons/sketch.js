// Cave Dungeons
// Robert Yang
// Nov. 13, 2023

let squareSize = 50;
const padding = 10;
let startX;
let startY;
const xSize = 60;
const ySize = 30;

const fillPortion = 0.20;
let age = 0;

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

function generateEmptyGrid(grid) {
  for(let i = 0; i < ySize; i++) {
    grid[i] = new Array(xSize).fill(0);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(0, 50);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
  generateEmptyGrid(grid);
  randomizeGrid(grid);
  // background("darkred");
  //window.alert(start_text);
}

function randomizeGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      grid[i][j] = random()*noise(i/20, j/20) < fillPortion;
    }
  }
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
  // clicked = false;
  // if(millis() - start_ms < 255 * start_speed && randomSquares) {
  //   background(dark_col, 0, 0, 255 + (start_ms - millis()) / start_speed);
  // }
}
