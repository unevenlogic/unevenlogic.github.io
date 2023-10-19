/* eslint-disable no-undef */
// 3D n-body Arrays Project
// Robert Yang
// Oct. 19, 2023
//
// This is a simulation of a given number of gravitational bodies interacting
// in space. It uses the formula for gravity between two objects and applies
// Newton's second law to ge tthe acceleration. This doesn't take into account
// the actual units, so grav_scaling is used instead as a placeholder
// proportionality constant.
//
// Note that calculations for position given acceleration and velocity relies
// on discrete values, and this is not really accurate given the relatively
// large value of delta-t compared to the possible small distances experienced
// sometimes in the simulation. Thus, the balls can slingshot with an
// unreasonably high velocity when they get too close. 
//
// This issue has been somewhat mitigated in two ways. First, velocity Verlet
// integration is used instead of Euler integration. This makes the simulation
// much more accurate, as the error is now proportional to the square of the
// timestep. In addition, this is a sympletic integrator, which means that
// the energy is (mostly) conserved long-term.
//
// Second, the balls now merge when they collide. This greatly reduces the rate
// at which balls approach each other at near-zero distances and slingshot.
// This merging system uses blackbody radiation to simulate stars merging. It
// also relies on several assumptions:
// - The temperature of the ball (in Kelvins) is proportional to its mass. This
//   should mostly be true for main-sequence stars, which we assume here.
// - The total volume is conserved upon merging. This is not accurate for stars
//   but was easy enough to simulate.
// - The temperature to colour conversion was based on code from the following
//   website:
//   https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html.
//
// Controls:
// - Input number of balls at beginning
// - Press mouse to hide cursor (esc to show)
// - Scroll up/down to increase/decrease speed
// - WASD for horizontal movement, space/shift for vertical (like Minecraft)
//
// Extra for Experts:
// - 3D via WEBGL
// - Vectors
// - Gravity
// - Black body radiation ambient lighting
// - Mouse locking and scrolling for speed control
// - WASD for movement

const grav_scaling = 5000; // Gravity force scaling versus mass
const mass_temp_scaling = 0.15; // Black body temperature scaling versus mass

const default_num_balls = 500; // The default number of balls
let num_balls; // The actual number of balls

const max_pos = 500; // Maximum cardinal displacement magnitude of balls
const max_vel = 1000; // Maximum cardinal velocity magnitude of balls
const min_radius = 3; // Minimum ball radius
const max_radius = 6; // Maximum ball radius
const min_mass = 200; // Minimum ball mass
const max_mass = 300; // Maximum ball mass

// Decreases y-related parameters to make the simulation flatter and closer to
// a real solar system; change this to 1 for unbiased 3D randomness
const y_bias = 0.0001;

// Array of balls
const balls = [];

// Camera object
let cam;
let cam_speed = 20; // Default speed of camera
const cam_sprint = 100; // Max speed of camera

/**
 * The ball gravitational object.
 */
class Ball {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    this.r = r;
    this.mass = mass;

    this.pos = createVector(x, y, z);
    this.vel = createVector(v_x, v_y, v_z);
    this.f_net = createVector(0, 0, 0);
    this.accel = createVector(0, 0, 0);

    // Uses blackbody radiation to get the colour; see blackbody.js
    this.col = getColour(this.mass * mass_temp_scaling);
  }

  /**
   * Converts force to change in velocity using Newton's second law.
   * 
   * @param {p5.Vector} f_applied The force
   */
  act_force(f_applied) {
    this.f_net.add(f_applied);
  }

  /**
   * Updates the position of the ball; part of velocity Verlet integration
   */
  move() {
    this.pos.add(this.vel.copy().add(this.accel.copy().mult(deltaTime / 2000)).mult(deltaTime / 1000));
    this.f_net = createVector(0,0,0);
  }

  /**
   * Updates the velocity of the ball; part of velocity Verlet integration
   */
  update() {
    let new_accel = this.f_net.copy().mult(1 / this.mass);
    this.vel.add(this.accel.copy().add(new_accel).mult(deltaTime / 2000));
    this.f_net = createVector(0,0,0);
    this.accel = new_accel;
  }

  /**
   * Renders the ball.
   */
  draw() {
    push();
    translate(this.pos);
    ambientMaterial(this.col);
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
  let netMass = ball1.mass + ball2.mass; // Combined mass

  // Multiplies positions and velocities by masses in preparation for centre of
  // mass and momentum calculations
  ball1.pos.mult(ball1.mass);
  ball2.pos.mult(ball2.mass);
  ball1.vel.mult(ball1.mass);
  ball2.vel.mult(ball2.mass);

  // Centre of mass
  let newPos = ball1.pos.add(ball2.pos).mult(1/netMass);

  // Conservation of momentum
  let newVel = ball1.vel.add(ball2.vel).mult(1/netMass);

  // Conservation of volume (not realistic)
  let newRad = pow(pow(ball1.r, 3) + pow(ball2.r, 3), 1/3);

  // Creates the new ball with the updated parameters
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

  // Checks if the balls need to be merged
  if(dist === 0 || dist < ball1.r + ball2.r) {
    balls.splice(i, 1);
    balls.splice(j-1, 1);
    balls.push(merge(ball1, ball2));
  }

  // Normalize the vector (not needed due to setMag)
  //disp.normalize();

  // Calculates the gravitational force
  let gforce = grav_scaling * ball1.mass * ball2.mass / dist**2;

  // Applies the force
  disp.setMag(gforce);
  ball1.act_force(disp);
  disp.mult(-1);
  ball2.act_force(disp);
}

/**
 * Applies gravity to every unordered pair of balls.
 */
function handle_grav() {
  for(let i = 0; i < balls.length; i++) {
    for(let j = i + 1; j < balls.length; j++) {
      apply_grav(balls[i], balls[j], i, j);
    }
  }
}

/**
 * Sets the new position of each ball.
 */
function move_balls() {
  for(let ball of balls) {
    ball.move();
  }
}

/**
 * Sets the new velocity of each ball.
 */
function update_balls() {
  for(let ball of balls) {
    ball.update();
  }
}

/**
 * Draws each ball.
 */
function draw_balls() {
  for(let ball of balls) {
    ball.draw();
  }
}

function setup() {
  // Create canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Create camera
  cam = createCamera();
  cam.setPosition(500, -300, 500);
  cam.lookAt(0,0,0);

  // Create balls
  num_balls = prompt("How many balls?", default_num_balls);
  for(let i = 0; i < num_balls; i++) {
    balls.push(new Ball(random(-max_pos, max_pos),
      random(-max_pos * y_bias, max_pos * y_bias),
      random(-max_pos, max_pos),
      random(-max_vel, max_vel),
      random(-max_vel * y_bias, max_vel * y_bias),
      random(-max_vel, max_vel),
      random(min_radius, max_radius),
      random(min_mass, max_mass)));
  }
}

function mousePressed() {
  requestPointerLock(); // Hides the cursor
}

function mouseWheel(event) {
  cam_speed -= event.delta / 100; // Change speed
  if(cam_speed > cam_sprint) {
    cam_speed = cam_sprint; // Speed limit
  }
  else if(cam_speed < 0) {
    cam_speed = 0; // Nonnegative speed
  }
}

function moveCamera() {
  if(keyIsDown(87) || keyIsDown(83) || keyIsDown(65) || keyIsDown(68)) {
    // Gets the orientation vector
    let eyePos = new p5.Vector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let centrePos = new p5.Vector(cam.centerX, cam.centerY, cam.centerZ);
    let disp = centrePos.copy().sub(eyePos);
    disp.y = 0;
    disp.setMag(cam_speed);

    // Handle right/left movement
    let rightDisp = new p5.Vector(-disp.z, disp.y, disp.x);
    let rightMult = keyIsDown(68) - keyIsDown(65);
    rightDisp.mult(rightMult);
    eyePos.add(rightDisp);

    // Handle fowards/backwards movement
    let forwardsMult = keyIsDown(87) - keyIsDown(83);
    disp.mult(forwardsMult);
    eyePos.add(disp);

    // Sets the position
    cam.setPosition(eyePos.x, eyePos.y, eyePos.z);
  }
  if(keyIsDown(32) && !keyIsDown(16)) { // Go up
    cam.setPosition(cam.eyeX, cam.eyeY - cam_speed, cam.eyeZ);
  }
  else if(keyIsDown(16)) { // Go down
    cam.setPosition(cam.eyeX, cam.eyeY + cam_speed, cam.eyeZ);
  }
}

function draw() {
  // Handle lighting
  background(20);
  ambientLight(255);

  // Handle camera
  cam.pan(-movedX * 0.001);
  cam.tilt(movedY * 0.001);
  moveCamera();

  // Handle balls
  move_balls();
  handle_grav();
  update_balls();
  draw_balls();
}
