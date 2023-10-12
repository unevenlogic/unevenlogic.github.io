// Perlin Noise Ball, 3D version

const ballArray = [];
let time = 0;
const horz_mag_mag = 300;
const vert_max_mag = 200;
//const max_mag = 200;

function spawnBall() {
  let ball = {
    x: random(-100, 100),
    y: random(-100, 100),
    z: random(-100, 100),
    size: random(5, 10),
    color: color(random(255), random(255), random(255), random(100, 255)),
    time_offset: random(1000),
  };
  return ball;  
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  for(let i = 0; i < 1; i++) {
    ballArray.push(spawnBall());
  }
  noStroke();
  // eslint-disable-next-line no-undef
  let cam = createCamera();
  cam.setPosition(200, -40, 200);
  cam.lookAt(0,0,0);
  //debugMode();
}

function moveBall(theBall) {
  theBall.x = noise(time + theBall.time_offset)*2*horz_mag_mag - horz_mag_mag;
  theBall.y = noise(0, time + theBall.time_offset)*2*vert_max_mag - vert_max_mag;
  theBall.z = noise(0, 0, time + theBall.time_offset)*2*horz_mag_mag - horz_mag_mag;
}

function drawBall(theBall) {
  fill(theBall.color);
  push();
  normalMaterial();
  translate(theBall.x, theBall.y, theBall.z);
  sphere(theBall.size);
  //translate(-theBall.x, -theBall.y, -theBall.z);
  pop();
}

function draw() {
  background(255);
  for(let theBall of ballArray) {
    moveBall(theBall);
    drawBall(theBall);
  }
  time += 0.02;
  if (0.01 < time % 0.5 && time % 0.5 < 0.03) {
    ballArray.push(spawnBall());
  }
  if(deltaTime > 0.1) {
    ballArray.splice(0, ballArray.size);
  }
}
