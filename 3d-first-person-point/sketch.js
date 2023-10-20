/* eslint-disable no-undef */
// First Person Point Mass Experiment
// Robert Yang
// October 2023
//
// This is a spinoff of the 3d-n-body project and focuses more on a point mass
// orbiting a larger body. The original project description appears below.
//
// This is a simulation of a given number of gravitational bodies interacting
// in space. It uses the formula for gravity between two objects and applies
// Newton's second law to get the acceleration. This doesn't take into account
// the actual units, so grav_scaling is used instead as a placeholder
// proportionality constant.
//
// Note that calculations for position given acceleration and velocity relies
// on discrete values, and this is not really accurate given the relatively
// large value of delta-t compared to the possible small distances experienced
// sometimes in the simulation. Thus, the bodies can slingshot with an
// unreasonably high velocity when they get too close. 
//
// This issue has been somewhat mitigated in two ways. First, velocity Verlet
// integration is used instead of Euler integration. This makes the simulation
// much more accurate, as the error is now proportional to the square of the
// timestep. In addition, this is a sympletic integrator, which means that
// the energy is (mostly) conserved long-term.
//
// Second, the bodies now merge when they collide. This greatly reduces the rate
// at which bodies approach each other at near-zero distances and slingshot.
// This merging system uses blackbody radiation to simulate stars merging. It
// also relies on several assumptions:
// - The temperature of the body (in Kelvins) is proportional to its mass. This
//   should mostly be true for main-sequence stars, which we assume here.
// - The total volume is conserved upon merging. This is not accurate for stars
//   but was easy enough to simulate.
// - The temperature to colour conversion was based on code from the following
//   website:
//   https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html.
//
// Controls:
// - Input number of bodies at beginning
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

const default_num_bodies = 1; // The default number of bodies
let num_bodies; // The actual number of bodies

const max_pos = 0; // Maximum cardinal displacement magnitude of bodies
const max_vel = 0; // Maximum cardinal velocity magnitude of bodies
const min_radius = 20; // Minimum body radius
const max_radius = 20; // Maximum body radius
const min_mass = 300; // Minimum body mass
const max_mass = 300; // Maximum body mass

// Decreases y-related parameters to make the simulation flatter and closer to
// a real solar system; change this to 1 for unbiased 3D randomness
const y_bias = 0.0001;

// Array of bodies
const bodies = [];

// Camera object
let cam;
let cam_speed = 20; // Default speed of camera
const cam_sprint = 100; // Max speed of camera

// Player
let thruster_strength = 0.0001;

/**
 * The body gravitational object.
 */
class Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    this.r = r;
    this.mass = mass;

    this.pos = createVector(x, y, z);
    this.vel = createVector(v_x, v_y, v_z);
    this.f_net = createVector(0, 0, 0);
    this.accel = createVector(0, 0, 0);
  }

  /**
   * Converts force to change in velocity using Newton's second law.
   * 
   * @param {p5.Vector} f_applied The force
   */
  act_force(f_applied) {
    this.f_net.add(f_applied);
    console.log(f_applied.mag());
  }

  /**
   * Updates the position of the body; part of velocity Verlet integration
   */
  move() {
    this.pos.add(this.vel.copy().add(this.accel.copy().mult(deltaTime / 2000)).mult(deltaTime / 1000));
    this.f_net = createVector(0,0,0);
  }

  /**
   * Updates the velocity of the body; part of velocity Verlet integration
   */
  update() {
    let new_accel = this.f_net.copy().mult(1 / this.mass);
    this.vel.add(this.accel.copy().add(new_accel).mult(deltaTime / 2000));
    this.f_net = createVector(0,0,0);
    this.accel = new_accel;
  }
}

class Planet extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass, col) {
    super(x, y, z, v_x, v_y, v_z, r, mass);
    this.col = col;
  }

  /**
   * Renders the body.
   */
  draw() {
    push();
    translate(this.pos);
    specularMaterial(50);
    shininess(10);
    ambientMaterial(this.col);
    sphere(this.r);
    pop();
  }
}

class Player extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    super(x, y, z, v_x, v_y, v_z, 0, mass);
  }

  /**
   * Renders the body.
   */
  draw() {
    push();
    translate(this.pos);

    //specularMaterial(50);
    //shininess(10);
    //ambientMaterial(this.col);
    //(this.r);
    pop();
  }
}

/**
 * Takes two bodies which are close enough and merges them.
 * @param {Body} body1 The first body to merge
 * @param {Body} body2 The second body to merge
 * @returns {Body} The new body.
 */
function merge(body1, body2) {
  let netMass = body1.mass + body2.mass; // Combined mass

  // Multiplies positions and velocities by masses in preparation for centre of
  // mass and momentum calculations
  body1.pos.mult(body1.mass);
  body2.pos.mult(body2.mass);
  body1.vel.mult(body1.mass);
  body2.vel.mult(body2.mass);

  // Centre of mass
  let newPos = body1.pos.add(body2.pos).mult(1/netMass);

  // Conservation of momentum
  let newVel = body1.vel.add(body2.vel).mult(1/netMass);

  // Conservation of volume (not realistic)
  let newRad = pow(pow(body1.r, 3) + pow(body2.r, 3), 1/3);

  // Creates the new body with the updated parameters
  let newBody = new Body(0,0,0,0,0,0,newRad, netMass);
  newBody.pos = newPos;
  newBody.vel = newVel;
  return newBody;
}

/**
 * Takes two bodies and acts the force of gravity upon them.
 * @param {Body} body1 A body to apply gravity to.
 * @param {Body} body2 Another body to apply gravity to.
 * @param {Number} i The index of the first body.
 * @param {Number} j The index of the second body.
 */
function apply_grav(body1, body2, i, j) {
  // Get the displacement vector
  let disp = p5.Vector.sub(body2.pos, body1.pos);
  let dist = disp.mag();

  // Checks if the bodies need to be merged
  if(dist === 0 || dist < body1.r + body2.r) {
    bodies.splice(i, 1);
    bodies.splice(j-1, 1);
    bodies.push(merge(body1, body2));
  }

  // Normalize the vector (not needed due to setMag)
  //disp.normalize();

  // Calculates the gravitational force
  let gforce = grav_scaling * body1.mass * body2.mass / dist**2;

  // Applies the force
  disp.setMag(gforce);
  body1.act_force(disp);
  disp.mult(-1);
  body2.act_force(disp);
}

function apply_thrust() {
  if (keyIsDown(32)) {
    let eyePos = new p5.Vector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let centrePos = new p5.Vector(cam.centerX, cam.centerY, cam.centerZ);
    let disp = centrePos.copy().sub(eyePos);
    //disp.y = 0;
    disp.setMag(thruster_strength);
    playerbody.act_force(disp);
    //console.log(disp.mag());
  }
}

/**
 * Applies gravity to every unordered pair of bodies.
 */
function handle_grav() {
  for(let i = 0; i < bodies.length; i++) {
    for(let j = i + 1; j < bodies.length; j++) {
      apply_grav(bodies[i], bodies[j], i, j);
    }
  }
}

/**
 * Sets the new position of each body.
 */
function move_bodies() {
  for(let body of bodies) {
    body.move();
  }
}

/**
 * Sets the new velocity of each body.
 */
function update_bodies() {
  for(let body of bodies) {
    body.update();
  }
}

/**
 * Draws each body.
 */
function draw_bodies() {
  for(let body of bodies) {
    body.draw();
  }
}

function setup() {
  // Create canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Create camera
  cam = createCamera();
  cam.setPosition(0, 0, 80);
  cam.lookAt(0,0,0);

  // Create bodies
  num_bodies = default_num_bodies; // prompt("How many bodies?", default_num_bodies);
  // for(let i = 0; i < num_bodies; i++) {
  //   bodies.push(new Planet(random(-max_pos, max_pos),
  //     random(-max_pos * y_bias, max_pos * y_bias),
  //     random(-max_pos, max_pos),
  //     random(-max_vel, max_vel),
  //     random(-max_vel * y_bias, max_vel * y_bias),
  //     random(-max_vel, max_vel),
  //     random(min_radius, max_radius),
  //     random(min_mass, max_mass)));
  // }

  // Creates Earth
  bodies.push(new Planet(0,0,0,
    0,0,0,
    20, 300,
    color(10, 20, 116)));
  playerbody = new Player(0,0,150,100,0,0,3,0.00001);
  bodies.push(playerbody);
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
  /*if(keyIsDown(87) || keyIsDown(83) || keyIsDown(65) || keyIsDown(68)) {
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
  }*/
  cam.setPosition(playerbody.pos.x, playerbody.pos.y, playerbody.pos.z);
}

function draw() {
  // Handle lighting
  background(20);
  directionalLight(250, 250, 250, 0, 0, -1);
  ambientLight(200);

  // Handle camera
  cam.pan(-movedX * 0.001);
  cam.tilt(movedY * 0.001);
  moveCamera();

  // Handle the player
  
  // Handle bodies
  move_bodies();
  apply_thrust();
  handle_grav();
  update_bodies();
  draw_bodies();
}