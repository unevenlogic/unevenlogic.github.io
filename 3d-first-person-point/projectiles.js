/* eslint-disable no-undef */
// Projectiles
let ionball_radius = 10;
let ionball_mass = 0.0000001;
let ionball_disp = 200;
let ionball_speed = 5000;
let ionball_life_time = 3000;

let meteor_radius = 10;
let meteor_mass = 0.0000001;
let meteor_disp = 200;
let meteor_speed = 5000;
let meteor_life_time = 3000;

class Projectile extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, col, mass) {
    super(x, y, z, v_x, v_y, v_z, r, mass);
    this.col = col;
    this.rank = 1;
  }
}

class MeteorBall extends Projectile {
  constructor(x, y, z, v_x, v_y, v_z) {
    super(x, y, z, v_x, v_y, v_z, ionball_radius, color("orange"), ionball_mass);
    this.start_time = millis();
    this.name = millis();
    this.life_time = meteor_life_time;
    this.col = color("orange");
    this.dmg = 4;
  }

  check_time() {
    if (millis() - this.start_time > this.life_time) {
      this.die();
    }
  }

  draw() {
    space.push();
    space.translate(this.pos);
    space.emissiveMaterial(this.col);
    space.ambientMaterial(0);
    space.sphere(this.r);
    space.pop();
    this.check_time();
  }
}

class IonBall extends Projectile {
  constructor(x, y, z, v_x, v_y, v_z) {
    super(x, y, z, v_x, v_y, v_z, ionball_radius, color("blue"), ionball_mass);
    this.start_time = millis();
    this.name = millis();
    this.life_time = ionball_life_time;
    this.dmg = 4;
  }

  check_time() {
    if (millis() - this.start_time > this.life_time) {
      this.die();
    }
  }

  draw() {
    space.push();
    space.translate(this.pos);
    space.emissiveMaterial(this.col);
    space.ambientMaterial(0);
    space.sphere(this.r);
    space.pop();
    this.check_time();
  }
}