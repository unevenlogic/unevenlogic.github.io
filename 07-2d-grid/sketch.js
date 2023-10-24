// 2D Array Grid
// Oct. 24, 2023

let squareSize = 50;
const padding = 10;
let startX;
let startY;
const xSize = 20;
const ySize = 10;

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

function generateEmptyGrid() {
  for(let i = 0; i < ySize; i++) {
    grid[i] = new Array(xSize).fill(0);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
  generateEmptyGrid();
}

function randomizeGrid() {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      grid[i][j] = round(random());
    }
  }
}

function displayGrid() {
  for(let i = 0; i < grid.length; i++) {
    let row = grid[i];
    for(let j = 0; j < row.length; j++) {
      fill(255*(1-grid[i][j]));
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
    randomizeGrid();
  }
  if(keyCode === 69) {
    generateEmptyGrid();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  squareSize = min((height - 2*padding) / ySize, (width - 2*padding) / xSize);
  startX = max(padding, width/2 - squareSize * xSize / 2);
  startY = max(padding, height/2 - squareSize * ySize / 2);
}

function draw() {
  background(220);
  displayGrid();
  if(randomSquares && millis() - ms > 100) {
    randomizeGrid();
    ms = millis();
  }
}
