// Terrain Generation
// Oct. 23, 2023

let terrain = [];
let baseHeight = 0;
let heightScaling = 0.9;
let bumpScaling = 0.5;
let elevationScaling = 0.5;

let xOffset = 50000;
let xSpeed = 10;
let terrainSpeed = 15;
let yOffset = 0;
let ySpeed = 10;

let ball;
const friction = 0.5;

function spawnRectangles() {
  let time = 0;
  let erosion = 0;
  let elevation;
  for(let x = 0; x < 100000; x++){
    erosion = noise(time / 20 + 10000);
    elevation = noise(time / 20 + 20000);
    let h = elevation * height * elevationScaling - height * elevationScaling;
    h += noise(time) * height * heightScaling;
    h += noise(time*5 - 10000) * erosion * height * bumpScaling;
    let thisRect = {
      x: x,
      height: h
    };
    terrain.push(thisRect);
    time += 0.001;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  spawnRectangles();
}

function displayRectangles() {
  for(let i = 0; i < width; i++) {
    if(i + xOffset < 0 || i + xOffset >= terrain.length) {
      continue;
    }
    let thisRect = terrain[i + xOffset];
    rect(i, height - thisRect.height - yOffset, 1, thisRect.height + yOffset);
  }
}

function moveScreen() {
  if(keyIsDown(RIGHT_ARROW)) {
    xOffset += xSpeed;
  }
  if(keyIsDown(LEFT_ARROW)) {
    xOffset -= xSpeed;
  }
  if(keyIsDown(UP_ARROW)) {
    yOffset -= ySpeed;
  }
  if(keyIsDown(DOWN_ARROW)) {
    yOffset += ySpeed;
  }
  xOffset += terrainSpeed;
}

function draw() {
  moveScreen();
  background("skyblue");
  fill("darkgreen");
  displayRectangles();
}
