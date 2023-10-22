// This mainly handles the player, but also handles the camera.

let thruster_strength = 0.0003;
let cannon_cd = 0;

let cam;

class Player extends Body {
  constructor(x, y, z, v_x, v_y, v_z, r, mass) {
    super(x, y, z, v_x, v_y, v_z, 0, mass, "player");
    this.rank = 2;
  }

  /**
   * Renders the body.
   */
  draw() {
    push();
    translate(this.pos);

    // Insert player model here

    //specularMaterial(50);
    //shininess(10);
    //ambientMaterial(this.col);
    //(this.r);
    pop();
  }

  fire_cannons() {
    let eyePos = new p5.Vector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let centrePos = new p5.Vector(cam.centerX, cam.centerY, cam.centerZ);
    let disp = centrePos.copy().sub(eyePos);
    //disp.y = 0;
    disp.setMag(ionball_disp);
    let newPos = this.pos.copy().add(disp);
    disp.setMag(ionball_speed);
    let newVel = this.vel.copy().add(disp);
    bodies.push(new IonBall(newPos.x, newPos.y, newPos.z, newVel.x, newVel.y, newVel.z));
  }

  fire_weapons() {
    if (keyIsDown(32) && millis() - cannon_cd > 500) {
      cannon_cd = millis();
      this.fire_cannons();
    }
  }

  die() {
    //console.log("Inside...")
    super.die();
  }
}

function apply_thrust() {
  if (keyIsDown(16)) {
    let eyePos = new p5.Vector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let centrePos = new p5.Vector(cam.centerX, cam.centerY, cam.centerZ);
    let disp = centrePos.copy().sub(eyePos);
    //disp.y = 0;
    disp.setMag(thruster_strength);
    playerbody.act_force(disp);
    //console.log(disp.mag());
  }
}

function move_camera() {
  cam.pan(-movedX * 0.001);
  cam.tilt(movedY * 0.001);
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