// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

class Walker {
  constructor(x, y, speed, color, size) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.color = color;
    this.size = size;
  }

  move() {
    let theChoice = random() * 2 * Math.PI; //noise(millis() / 100) * 2 * Math.PI;
    this.x += Math.cos(theChoice) * this.speed;
    this.y += Math.sin(theChoice) * this.speed;
  }

  display() {
    noFill();
    stroke(this.color);
    circle(this.x, this.y, this.size);
  }
}

class Jogger extends Walker {
  constructor(x, y, color) {
    super(x, y, 5, color, 3);
  }
}

const joggers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function getRandomColor() {
  return color(random(255), random(255), random(255));
}

function mousePressed() {
  joggers.push(new Jogger(mouseX, mouseY, getRandomColor()));
}

function draw() {
  //background(220);
  joggers.forEach((j) => {j.move()});
  joggers.forEach((j) => {j.display()});
}
