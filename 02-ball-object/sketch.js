// Ball Object Notation Demo
// Oct. 5, 2023

const spring_coeff = 0.01;

let theBall = {
  x: 100,
  y: 100,
  r: 25,
  rcol: 255,
  gcol: 0,
  bcol: 0,
  dx: 4,
  dy: 3,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  moveBall();
  displayBall();
}

function moveBall() {
  theBall.x += theBall.dx;
  theBall.y += theBall.dy;
  theBall.x = (theBall.x + theBall.r) % (windowWidth + theBall.r * 2) - theBall.r;
  theBall.y = (theBall.y + theBall.r) % (windowHeight + theBall.r * 2) - theBall.r;
  // theBall.dx += (width/2 - theBall.x) * spring_coeff;
  // theBall.dy += (height/2 - theBall.y) * spring_coeff;
}

function displayBall() {
  fill(theBall.rcol, theBall.gcol, theBall.bcol);
  circle(theBall.x, theBall.y, theBall.r * 2);
}