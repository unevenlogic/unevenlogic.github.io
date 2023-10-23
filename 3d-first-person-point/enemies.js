/* eslint-disable no-undef */
// Ejectors
const ejector_radius = 10;
const ejector_mass = 0.00001;

class Enemy extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass, name) {
    super(x, y, z, v_x, v_y, v_z, r, mass, name);
    this.rank = 2;
  }

  /**
   * Renders the body.
   */
  draw() {
    push();
    translate(this.pos);
 
    // Insert player model here
    //specularMaterial(10);
    //shininess(0);
    ambientMaterial(this.col);
    sphere(this.r);
 
    //specularMaterial(50);
    //shininess(10);
    //ambientMaterial(this.col);
    //(this.r);
    pop();
  }

  /*fire_cannons() {
    let eyePos = new p5.Vector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let centrePos = new p5.Vector(cam.centerX, cam.centerY, cam.centerZ);
    let disp = centrePos.copy().sub(eyePos);
    //disp.y = 0;
    disp.setMag(ionball_disp);
    let newPos = this.pos.copy().add(disp);
    disp.setMag(ionball_speed);
    let newVel = this.vel.copy().add(disp);
    bodies.push(new IonBall(newPos.x, newPos.y, newPos.z, newVel.x, newVel.y, newVel.z));
  }*/

  fire_weapons() {
    //   if (keyIsDown(32) && millis() - cannon_cd > 500) {
    //     cannon_cd = millis();
    //     this.fire_cannons();
    //   }
  }

  die() {
    //console.log("Inside...")
    super.die();
  }
}

class Ejector extends Enemy {
  constructor(x, y, z, v_x, v_y, v_z) {
    super(x, y, z, v_x, v_y, v_z, ejector_radius, ejector_mass, "Ejector".concat(random()));
    this.col = color(139, 0, 0);
  }
}