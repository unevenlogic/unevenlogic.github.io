/* eslint-disable no-undef */
// First Attempts at 3D Rendering
// Robert Yang
// Oct. 8, 2023
//
// This is a basic attempt at simulating gravity. It uses the formula for
// gravity between two objects and applies Newton's second law to get the
// acceleration. This doesn't take into account change in time, the universal
// gravitational constant, or actual units, so accel_scaling is used instead as
// a placeholder proportionality constant.

// Note that calculations for position given acceleration and velocit relies on
// discrete values, and this is not really accurate given the relatively
// large value of delta-t compared to the possible small distances experienced
// sometimes in the simulation. Thus, the balls can slingshot with an
// unreasonably high velocity when they get too close.
//
// Extra for Experts:
// - Normal lighting (mostly copied from the p5js tutorial page)
// - Gravity
// - Vectors
// - 3D

const accel_scaling = 1;
const grav_scaling = 5000;
//const bigG = 6.6743*10**(-15);

const max_radius = 10;
const max_pos = 100;
const max_vel = 500;
const max_mass = 3000;
const min_radius = 7;
const min_mass = 2000;

//const force_limit = 150;

const far_threshold = 1000;
let num_balls;

let debug_force_exceeded = false;

const balls = [];

let cam;

class Ball {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    // this.x = x;
    // this.y = y;
    // this.z = z;
    // this.v_x = v_x;
    // this.v_y = v_y;
    // this.v_z = v_z;
    this.r = r;
    this.mass = mass;
    // this.f_x_net = 0;
    // this.f_y_net = 0;
    // this.f_z_net = 0;

    this.pos = createVector(x, y, z);
    this.vel = createVector(v_x, v_y, v_z);
    this.f_net = createVector(0, 0, 0);
    this.accel = createVector(0, 0, 0);
  }

  /**
   * Converts force to change in velocity using Newton's second law and 
   *     accel_scaling.
   * 
   * @param {number} f_x x-component of the force
   * @param {number} f_y y-component of the force
   * @param {number} f_z z-component of the force
   */
  act_force(f_applied) {
    this.f_net.add(f_applied);
  }
  // act_force(f_x, f_y, f_z) {
  //   this.f_x_net += f_x;
  //   this.f_y_net += f_y;
  //   this.f_z_net += f_z;
  // }

  /**
   * Uses velocity Verlet integration to get a more accurate calculation
   */
  move() {
    // console.log(this.f_net);
    // this.vel.add(this.f_net.mult(accel_scaling / this.mass));
    // this.pos.add(this.vel);

    // this.f_net = createVector(0,0,0);

    //this.accel = this.f_net.copy().mult(1 / this.mass);
    console.log(this.accel);
    this.pos.add(this.vel.copy().add(this.accel.copy().mult(deltaTime / 2000)).mult(deltaTime / 1000));
    this.f_net = createVector(0,0,0);
  }

  update() {
    let new_accel = this.f_net.copy().mult(1 / this.mass);
    this.vel.add(this.accel.copy().add(new_accel).mult(deltaTime / 2000));
    this.f_net = createVector(0,0,0);
    this.accel = new_accel;
  }
  // move() {
  //   this.v_x += accel_scaling * f_x / this.mass;
  //   this.v_y += accel_scaling * f_y / this.mass;
  //   this.v_z += accel_scaling * f_z / this.mass;
  //   this.x += this.v_x;
  //   this.y += this.v_y;
  //   this.z += this.v_z;
  // }

  draw() {
    push();
    translate(this.pos);
    sphere(this.r);
    pop();
  }
}

/**
 * Takes two balls which are close enough and merges them.
 * @param {Ball} ball1 The first ball to merge
 * @param {Ball} ball2 The second ball to merge
 * @returns {Ball} The new ball.
 */
function merge(ball1, ball2) {
  let netMass = ball1.mass + ball2.mass;
  ball1.pos.mult(ball1.mass);
  ball2.pos.mult(ball2.mass);
  ball1.vel.mult(ball1.mass);
  ball2.vel.mult(ball2.mass);
  let newPos = ball1.pos.add(ball2.pos).mult(1/netMass);
  let newVel = ball1.vel.add(ball2.vel).mult(1/netMass);
  let newRad = pow(pow(ball1.r, 3) + pow(ball2.r, 3), 1/3);
  let newBall = new Ball(0,0,0,0,0,0,newRad, netMass);
  newBall.pos = newPos;
  newBall.vel = newVel;
  return newBall;
}

/**
 * Takes two balls and acts the force of gravity upon them.
 * @param {Ball} ball1 A ball to apply gravity to.
 * @param {Ball} ball2 Another ball to apply gravity to.
 * @param {Number} i The index of the first ball.
 * @param {Number} j The index of the second ball.
 */
function apply_grav(ball1, ball2, i, j) {
  // Get the displacement vector
  let disp = p5.Vector.sub(ball2.pos, ball1.pos);
  let dist = disp.mag();
  if(dist === 0) {
    return;
  }
  else if(dist < ball1.r + ball2.r) {
    balls.splice(i, 1);
    balls.splice(j-1, 1);
    balls.push(merge(ball1, ball2));
  }
  disp.normalize();

  // Calculates the gravitational force
  let gforce = grav_scaling * ball1.mass * ball2.mass / dist**2;
  // if(gforce > force_limit) {
  //   debug_force_exceeded = true;
  //   gforce = force_limit;
  // }

  // Applies the force
  disp.setMag(gforce);
  ball1.act_force(disp);
  disp.mult(-1);
  ball2.act_force(disp);
}

function handle_grav() {
  for(let i = 0; i < balls.length; i++) {
    for(let j = i + 1; j < balls.length; j++) {
      apply_grav(balls[i], balls[j], i, j);
    }
  }
}

function move_balls() {
  for(let ball of balls) {
    ball.move();
  }
}

function update_balls() {
  for(let ball of balls) {
    ball.update();
  }
}

function draw_balls() {
  for(let ball of balls) {
    ball.draw();
  }
}

function destroy_far() {
  for(let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    if(ball.pos.mag() > far_threshold) {
      //ball.hide();
      balls.splice(i, 1);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  cam = createCamera();
  cam.setPosition(200, -40, 200);
  cam.lookAt(0,0,0);
  noStroke();
  num_balls = prompt("How many balls?", 3);
  for(let i = 0; i < num_balls; i++) {
    balls.push(new Ball(random(-max_pos, max_pos), random(-max_pos, max_pos), random(-max_pos, max_pos), 
      random(-max_vel, max_vel), random(-max_vel, max_vel), random(-max_vel, max_vel),
      random(min_radius, max_radius), random(min_mass, max_mass)));
  }
  // balls.push(new Ball(150, 20, 150, 50, 0, 0, 1, 5));
  // balls.push(new Ball(150, 0, 150, -10, 0, 0, 2, 25));
}

function mousePressed() {
  requestPointerLock();
}

function draw() {
  debug_force_exceeded = false;
  // // Handle lighting
  // ambientLight(20);
  
  // directionalLight(
  //   255,255,255, // color
  //   -1, 1, 0  // direction
  // );

  // directionalLight(
  //   100,100,100, // color
  //   0, -1, -1  // direction
  // );

  // Handle camera
  cam.pan(-movedX * 0.001);
  cam.tilt(movedY * 0.001);

  background(255);

  // Handle eveything else
  // destroy_far();
  // if(debug_force_exceeded) {
  //   //background(255);
  //   background(220);
  // }
  // else {
  //   background(220);
  // }
  normalMaterial();
  //handle_grav();
  move_balls();
  handle_grav();
  update_balls();
  draw_balls();
}
