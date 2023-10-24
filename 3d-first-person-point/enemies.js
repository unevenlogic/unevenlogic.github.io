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
    space.push();
    space.translate(this.pos);
 
    // Insert player model here
    //specularMaterial(10);
    //shininess(0);
    space.ambientMaterial(this.col);
    space.sphere(this.r);
 
    //specularMaterial(50);
    //shininess(10);
    //ambientMaterial(this.col);
    //(this.r);
    space.pop();
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

  damage(dmg) {
    this.health -= dmg;
    if(this.health <= 0) {
      this.die();
    }
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
    this.meteor_cd = 0;
    this.health = 20;
  }

  fire_weapons() {
    super.fire_weapons();
    if(millis() - this.meteor_cd > 500) {
      let disp = playerbody.pos.copy().sub(this.pos);
      disp.setMag(meteor_disp);
      let newPos = this.pos.copy().add(disp);
      disp.setMag(meteor_speed);
      let newVel = this.vel.copy().add(disp);
      bodies.push(new MeteorBall(newPos.x, newPos.y, newPos.z, disp.x, disp.y, disp.z));
      this.meteor_cd = millis();
      //console.log("!!")
    }
  }
}