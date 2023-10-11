// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const vel = 5;
const minRad = 10;
const maxRad = 50;
const ballArray = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(220);
  moveBall();
  deleteBall();
  displayBall();
}

function mousePressed() {
  ballArray.push(spawnBall());
}

function spawnBall() {
  let theBall = {
    x : mouseX,
    y : mouseY,
    dx : random(-vel, vel),
    dy : random(-vel, vel),
    r : random(minRad, maxRad),
    r_col : random(255),
    g_col : random(255),
    b_col : random(255),
  };
  return theBall;
}

function moveBall() {
  for(let ball of ballArray) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
}

function displayBall() {
  for(let ball of ballArray) {
    fill(ball.r_col, ball.g_col, ball.b_col);
    circle(ball.x, ball.y, 2*ball.r);
  }
}

function deleteBall() {
  for(let i = 0; i < ballArray.length; i++) {
    let ball = ballArray[i];
    if(Math.abs(width/2 - ball.x) > width/2 + ball.r || Math.abs(height/2 - ball.y) > height/2 + ball.r) {
      ballArray.splice(i, 1);
      i--;
    }
  }
}