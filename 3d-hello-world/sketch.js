// First Attempts at 3D Rendering
// Robert Yang
// Oct. 8, 2023
//
// This is a basic attempt at simulating three bodies. Discrete calculus breaks down at tiny distances, so it isn't really accurate as of now...
//
// Extra for Experts:
// - Lighting (mostly copied from the p5js tutorial page)
// - Gravity
// - Vectors
// - 3D of course!

const accel_scaling = 5;
//const bigG = 6.6743*10**(-15);

const ball_radius = 3;

const balls = [];

class Ball {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.v_x = v_x;
    this.v_y = v_y;
    this.v_z = v_z;
    this.r = r;
    this.mass = mass;
  }

  act_force(f_x, f_y, f_z) {
    this.v_x += accel_scaling * f_x / this.mass;
    this.v_y += accel_scaling * f_y / this.mass;
    this.v_z += accel_scaling * f_z / this.mass;
  }

  draw() {
    this.x += this.v_x;
    this.y += this.v_y;
    this.z += this.v_z;
    push();
    translate(this.x, this.y, this.z);
    sphere(this.r);
    pop();
  }
}

function apply_grav(ball1, ball2) {
  let d1 = createVector(ball1.x, ball1.y, ball1.z);
  let d2 = createVector(ball2.x, ball2.y, ball2.z);
  let disp = p5.Vector.sub(d2, d1);
  let dist = disp.mag();
  if(dist === 0) return;
  disp.normalize();
  let gforce = ball1.mass * ball2.mass / dist**2; // Ignoring big G
  disp.setMag(gforce);
  ball1.act_force(disp.x, disp.y, disp.z);
  ball2.act_force(-disp.x, -disp.y, -disp.z);
}

function handle_grav() {
  for(let i = 0; i < balls.length; i++) {
    for(let j = i + 1; j < balls.length; j++) {
      apply_grav(balls[i], balls[j]);
    }
  }
}

function draw_balls() {
  for(let ball of balls) {
    ball.draw();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  camera(200,-40, 200);
  noStroke();
  balls.push(new Ball(0, 10, 0, 3, 0, 0, ball_radius, 5));
  balls.push(new Ball(0, -10, 0, -1, 0, 0, ball_radius, 15));
  balls.push(new Ball(0, 0, 5, 0, 0, 3, ball_radius, 10));
}

function draw() {
  background(220);

  // Handle lighting
  ambientLight(20);
  
  directionalLight(
    255,255,255, // color
    -1, 1, 0  // direction
  );

  directionalLight(
    100,100,100, // color
    0, -1, -1  // direction
  );
  handle_grav();
  draw_balls();
}
