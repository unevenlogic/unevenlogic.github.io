/* eslint-disable no-undef */
// Array of bodies
const bodies = [];

// Handle FPS
let dt = 1000/60;

/**
 * The body gravitational object.
 */
class Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass, name) {
    this.r = r;
    this.mass = mass;

    this.pos = createVector(x, y, z);
    this.vel = createVector(v_x, v_y, v_z);
    this.f_net = createVector(0, 0, 0);
    this.accel = createVector(0, 0, 0);

    this.rank = 0;
    this.name = name;
  }

  /**
   * Converts force to change in velocity using Newton's second law.
   * 
   * @param {p5.Vector} f_applied The force
   */
  act_force(f_applied) {
    this.f_net.add(f_applied);
    //console.log(f_applied.mag());
  }

  /**
   * Updates the position of the body; part of velocity Verlet integration
   */
  move() {
    this.pos.add(this.vel.copy().add(this.accel.copy().mult(dt / 2000)).mult(dt / 1000));
    this.f_net = createVector(0, 0, 0);
  }

  /**
   * Updates the velocity of the body; part of velocity Verlet integration
   */
  update() {
    let new_accel = this.f_net.copy().mult(1 / this.mass);
    this.vel.add(this.accel.copy().add(new_accel).mult(dt / 2000));
    this.f_net = createVector(0, 0, 0);
    this.accel = new_accel;
  }

  damage() {
    //this.col = "red";
  }

  die() {
    bodies.splice(bodies.findIndex(el => el.name === this.name), 1);
  }
}

class Planet extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass, col, name) {
    super(x, y, z, v_x, v_y, v_z, r, mass, name);
    this.col = col;
    this.rank = 3;
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

/**
* Takes two bodies which are close enough and initiates a collision.
*
* @param {Body} body1 The first body to merge
* @param {Body} body2 The second body to merge
*/
function collide(body1, body2) {
  if (body1.rank > body2.rank) {
    body2.die();
    body1.damage();
  }
  else if (body1.rank < body2.rank) {
    body1.die();
    body2.damage();
  }
  else {
    body1.die();
    body2.die();
  }
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

  // Checks if the bodies will collide
  if (dist === 0 || dist < body1.r + body2.r) {
    //bodies.splice(i, 1);
    //bodies.splice(j-1, 1);
    collide(body1, body2);
  }

  // Normalize the vector (not needed due to setMag)
  //disp.normalize();

  // Calculates the gravitational force
  let gforce = grav_scaling * body1.mass * body2.mass / dist ** 2;

  // Applies the force
  disp.setMag(gforce);
  body1.act_force(disp);
  disp.mult(-1);
  body2.act_force(disp);
}

/**
 * Applies gravity to every unordered pair of bodies.
 */
function handle_grav() {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      apply_grav(bodies[i], bodies[j], i, j);
    }
  }
}

/**
 * Sets the new position of each body.
 */
function move_bodies() {
  for (let body of bodies) {
    //console.log("Worked");
    body.move();
  }
}

/**
 * Sets the new velocity of each body.
 */
function update_bodies() {
  for (let body of bodies) {
    body.update();
  }
}

/**
 * Draws each body.
 */
function draw_bodies() {
  for (let body of bodies) {
    body.draw();
  }
}