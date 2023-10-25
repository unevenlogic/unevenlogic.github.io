// Game of Life Speedrun
// Oct. 24, 2023

let squareSize = 50;
const padding = 10;
let startX;
let startY;
const xSize = 60;
const ySize = 30;

let clicked = true;
let randomSquares = true;
let continueEvaluation = false;
let time = 0;

let ms = 0;

let run_ms = 0;
let no_dim_runtime = 2000;
let dim_speed = 20;

let start_gol = true;
let start_ms = 0;
const start_speed = 10;

const start_text = `Press Enter to evaluate one step
Press G to continue evaluating
Press the squares to flip their state
Press E to empty the grid
Press R to randomize the grid

Click anywhere to start`;

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

function evaluateNext() {
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

function generateEmptyGrid(grid) {
  for(let i = 0; i < ySize; i++) {
    grid[i] = new Array(xSize).fill(0);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
  generateEmptyGrid(grid);
  background("darkred");
  window.alert(start_text);
}

function randomizeGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      grid[i][j] = round(random());
    }
  }
}

function displayGrid(grid) {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      fill(255*grid[i][j]);
      let xCoord = startX + j * squareSize;
      let yCoord = startY + i * squareSize;
      if(clicked &&
        xCoord <= mouseX && mouseX <= xCoord + squareSize &&
        yCoord <= mouseY && mouseY <= yCoord + squareSize) {
        grid[i][j] = !grid[i][j];
        clicked = false;
      }
      rect(xCoord, yCoord, squareSize, squareSize);
      // if(randomSquares) {
      //   grid[i][j] = round(random());
      // }
    }
  }
  time += 0.05;
}

function mousePressed() {
  //clickRequests.push([mouseX, mouseY]);
  if(start_gol) {
    start_gol = false;
  }
  else {
    clicked = true;
    randomSquares = false;
  }
}

function keyPressed() {
  if(start_gol) {
    start_gol = false;
  }
  else {
    randomSquares = false;
    if(keyCode === 82) {
      randomSquares = false;
      continueEvaluation = false;
      randomizeGrid(grid);
    }
    if(keyCode === 69) {
      randomSquares = false;
      continueEvaluation = false;
      generateEmptyGrid(grid);
    }
    if(keyCode === ENTER) {
      randomSquares = false;
      continueEvaluation = false;
      grid = evaluateNext();
    }
    if(keyCode === 71) {
      randomSquares = false;
      continueEvaluation = true;
      run_ms = millis() + no_dim_runtime;
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
  if(start_gol) {
    background("darkred");
    start_ms = millis();
  }
  else {
    if(randomSquares) {
      background("darkred");
    }
    else if(continueEvaluation) {
      background("darkblue");
    }
    else {
      background("darkgreen");
    }
    displayGrid(grid);
    clicked = false;
    if(randomSquares && millis() - ms > 100) {
      randomizeGrid(grid);
      ms = millis();
    }
    else if(continueEvaluation && millis() - ms > 100) {
      grid = evaluateNext();
      ms = millis();
    }
    if(millis() - start_ms < 255 * start_speed && randomSquares) {
      background(139, 0, 0, 255 + (start_ms - millis()) / start_speed);
    }
  }
}
