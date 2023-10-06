// Ball Object Notation Demo
// Oct. 5, 2023

const mouseScaling = 0.05;
const minRad = 15;
const maxRad = 30;
const maxDirSpeed = 5;

let theBall;

function spawnBall() {
  let theBall = {
    x: random(width),
    y: random(height),
    r: random(minRad, maxRad),
    rcol: random(255),
    gcol: random(255),
    bcol: random(255),
    dx: random(-maxDirSpeed, maxDirSpeed),
    dy: random(-maxDirSpeed, maxDirSpeed),
  };
  return theBall;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  theBall = spawnBall();
}

function betterMod(n, m) {
  let result = n % m;
  if(result < 0) {
    result += m;
  }
  return result;
}

function borderWrap(coord, r, maxSize) {
  return betterMod(coord + r, maxSize + 2*r) - r;
}

function moveBall() {
  theBall.x += theBall.dx;
  theBall.y += theBall.dy;
  theBall.x = borderWrap(theBall.x, theBall.r, windowWidth);
  theBall.y = borderWrap(theBall.y, theBall.r, windowHeight);
  // theBall.dx += (width/2 - theBall.x) * spring_coeff;
  // theBall.dy += (height/2 - theBall.y) * spring_coeff;
}

function displayBall() {
  fill(theBall.rcol, theBall.gcol, theBall.bcol);
  circle(theBall.x, theBall.y, theBall.r * 2);
}

function mouseReleased() {
  theBall.dx = (mouseX - theBall.x) * mouseScaling;
  theBall.dy = (mouseY - theBall.y) * mouseScaling;
}

function showPath() {
  if(mouseIsPressed) {
    fill(0);
    line(theBall.x, theBall.y, mouseX, mouseY);
  }
}

function keyTyped() {
  if (key === " ") {
    theBall = spawnBall();
  }
}

function draw() {
  background(220);
  moveBall();
  showPath();
  displayBall();
}