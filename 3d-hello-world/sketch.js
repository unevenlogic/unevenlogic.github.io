// First Attempts at 3D Rendering
// Robert Yang
// Oct. 8, 2023
//
// This is a basic attempt at simulating gravity. It uses the formula for
// gravity between two objects and applies Newton's second law to get the
// acceleration. This doesn't take into account change in time, the universal
// gravitational constant, or actual units, so accel_scaling is used instead as
// a placeholder proportionality constant.
//
// Note that calculations for position given acceleration and velocit relies on
// discrete calculus, and this is not really accurate given the relatively
// large value of delta-t compared to the possible small distances experienced
// sometimes in the simulation. Thus, the balls can slingshot with an
// unreasonably high velocity when they get too close.
//
// Extra for Experts:
// - Lighting (mostly copied from the p5js tutorial page)
// - Gravity
// - Vectors
// - 3D of course!

const accel_scaling = 5;
//const bigG = 6.6743*10**(-15);

const max_radius = 5;
const max_pos = 50;
const max_vel = 1;
const max_mass = 30;
const min_radius = 3;
const min_mass = 20;

const far_threshold = 1000;
let num_balls;

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

  /**
   * Converts force to change in velocity using Newton's second law and 
   *     accel_scaling.
   * 
   * @param {number} f_x x-component of the force
   * @param {number} f_y y-component of the force
   * @param {number} f_z z-component of the force
   */
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

/**
 * Takes two balls and acts the force of gravity upon them.
 * @param {Ball} ball1 A ball to apply gravity to.
 * @param {Ball} ball2 Another ball to apply gravity to.
 */
function apply_grav(ball1, ball2) {
  // Get the displacement vector
  let d1 = createVector(ball1.x, ball1.y, ball1.z);
  let d2 = createVector(ball2.x, ball2.y, ball2.z);
  let disp = p5.Vector.sub(d2, d1);
  let dist = disp.mag();
  if(dist === 0) return;
  disp.normalize();

  // Calculates the gravitational force
  let gforce = ball1.mass * ball2.mass / dist**2;

  // Applies the force
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

function destroy_far() {
  for(let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    if(Math.sqrt(ball.x**2 + ball.y**2 + ball.z**2) > far_threshold) {
      //ball.hide();
      balls.splice(i, 1);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  camera(200,-40, 200);
  noStroke();
  num_balls = prompt("How many balls?", 3);
  for(let i = 0; i < num_balls; i++) {
    balls.push(new Ball(random(-max_pos, max_pos), random(-max_pos, max_pos), random(-max_pos, max_pos), 
      random(-max_vel, max_vel), random(-max_vel, max_vel), random(-max_vel, max_vel),
      random(min_radius, max_radius), random(min_mass, max_mass)));
  }
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

  // Handle eveything else
  handle_grav();
  draw_balls();
  destroy_far();
}
