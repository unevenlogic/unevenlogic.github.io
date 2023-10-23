/* eslint-disable no-undef */
// Projectiles
let ionball_radius = 3;
let ionball_mass = 0.0000001;
let ionball_disp = 5;
let ionball_speed = 1000;
let ionball_life_time = 2000;

let meteor_radius = 4;
let meteor_mass = 0.0000001;
let meteor_disp = 5;
let meteor_speed = 1000;
let meteor_life_time = 2000;

class Projectile extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, col, mass) {
    super(x, y, z, v_x, v_y, v_z, r, mass);
    this.col = col;
    this.rank = 1;
  }
}

class MeteorBall extends Body {
  constructor(x, y, z, v_x, v_y, v_z) {
    super(x, y, z, v_x, v_y, v_z, ionball_radius, color("orange"), ionball_mass);
    this.start_time = millis();
    this.name = millis();
    this.life_time = meteor_life_time;
  }
}

class IonBall extends Projectile {
  constructor(x, y, z, v_x, v_y, v_z) {
    super(x, y, z, v_x, v_y, v_z, ionball_radius, color("blue"), ionball_mass);
    this.start_time = millis();
    this.name = millis();
    this.life_time = ionball_life_time;
  }

  check_time() {
    if (millis() - this.start_time > this.life_time) {
      this.die();
    }
  }

  draw() {
    push();
    translate(this.pos);
    emissiveMaterial(this.col);
    ambientMaterial(0);
    sphere(this.r);
    pop();
    this.check_time();
  }
}