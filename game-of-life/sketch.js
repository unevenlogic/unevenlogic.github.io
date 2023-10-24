// Game of Life Speedrun
// Oct. 24, 2023

let squareSize = 50;
const padding = 10;
let startX;
let startY;
const xSize = 40;
const ySize = 20;

let clicked = true;
let randomSquares = true;
let time = 0;

let ms = 0;

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
  clicked = true;
  randomSquares = false;
}

function keyPressed() {
  if(keyCode === 82) {
    randomizeGrid(grid);
  }
  if(keyCode === 69) {
    generateEmptyGrid(grid);
  }
  if(keyCode === ENTER) {
    grid = evaluateNext();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
}

function draw() {
  background(50);
  displayGrid(grid);
  clicked = false;
  if(randomSquares && millis() - ms > 100) {
    randomizeGrid(grid);
    ms = millis();
  }
}
