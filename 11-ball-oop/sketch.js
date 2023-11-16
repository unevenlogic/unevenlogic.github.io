// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

function randomColour() {
  return color(random(255), random(255), random(255));
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.dx = random(-5, 5);
    this.dy = random(-5, 5);
    this.radius = random(15, 30);
    this.color = randomColour();
  }

  collideWalls() {
    if(this.x < 0 + this.radius) {
      this.x = this.radius;
      this.dx *= -1;
    }
    if(this.x > width - this.radius) {
      this.x = width - this.radius;
      this.dx *= -1;
    }
    if(this.y < 0 + this.radius) {
      this.y = 0 + this.radius;
      this.dy *= -1;
    }
    if(this.y > height - this.radius) {
      this.y = height - this.radius;
      this.dy *= -1;
    }
  }

  collideBall(otherBall) {
    let radiiSum = this.radius + otherBall.radius;

  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
    this.collideWalls();
  }

  display() {
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
  }
}

let balls = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  balls.push(new Ball(width/2, height/2));
}

// let n = 1;

// function mousePressed() {
//   for(let i = 0; i < Math.pow(10, n) - Math.pow(10, n-1); i++) {
//     balls.push(new Ball(mouseX, mouseY));
//   }
//   n += 1;
// }

function handleSpawns() {
  // if(mouseIsPressed) {
  //   for(let i = 0; i < 5; i++) {
  //     balls.push(new Ball(mouseX, mouseY));
  //   }
  // }
  while(balls.length < Math.pow(2, millis() / 3000)) {
    balls.push(new Ball(mouseX, mouseY));
  }
}

function displayNum() {
  textAlign(RIGHT, TOP);
  textSize(30);
  fill(0);
  text(balls.length, width, 0);
}

function draw() {
  background(220);
  handleSpawns();
  for(let ball of balls) {
    ball.move();
  }
  for(let ball of balls) {
    ball.display();
  }
  displayNum();
}
