// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const points = [];

let ySize, xSize;

function wrapCoordinates(x, y, r) {
  x += xSize + 3*r;
  x %= xSize + 2*r;
  x -= r;
  y += ySize + 3*r;
  y %= ySize + 2*r;
  y -= r;
  return [x,y];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  xSize = width;
  ySize = height;
}

function mousePressed() {
  points.push(new MovingPoint(mouseX, mouseY));
}

function spawnMorePoints() {
  if(keyIsDown(32)) {
    points.push(new MovingPoint(mouseX, mouseY));
  }
}

function draw() {
  background(220);
  spawnMorePoints();
  for(let p of points) {
    p.update();
  }
  for(let p of points) {
    p.connectTo(points);
  }
  for(let p of points) {
    p.display();
  }
}

class MovingPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.normRadius = 15;
    this.radius = 15;
    this.xTime = random(1000);
    this.yTime = random(1000);
    this.deltaTime = 0.01;
    this.reach = 150;
    // this.close = 0;
    this.speedScaling = 5;
  }

  connectTo(pointsArray) {
    for(let other of pointsArray) {
      if(this !== other && dist(this.x, this.y, other.x, other.y) < this.reach) {
        stroke(this.color);
        line(this.x, this.y, other.x, other.y);
      }
    }
  }

  update() {
    // this.close = dist(this.x, this.y, mouseX, mouseY) < this.reach;
    if(dist(this.x, this.y, mouseX, mouseY) < this.reach) {
      this.radius = 2 * this.normRadius;
    }
    else {
      this.radius = this.normRadius;
    }
    this.xTime += this.deltaTime;
    this.yTime += this.deltaTime;
    this.x += map(noise(this.xTime), 0, 1, -5, 5);
    this.y += map(noise(this.yTime), 0, 1, -5, 5);
    let t = wrapCoordinates(this.x, this.y, this.radius);
    this.x = t[0];
    this.y = t[1];
  }

  display() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, 2*this.radius);
  }
}