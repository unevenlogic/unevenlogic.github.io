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

// Upcoming controls:
// - l = laser
// - m = mine
// - t = turret (rapid fire)
// - c = cannons
// - Shift = hold thrusters (scroll to adjust) (implemented)
// - Space = fire weapon (implemented)


const grav_scaling = 5000; // Gravity force scaling versus mass
const mass_temp_scaling = 0.15; // Black body temperature scaling versus mass

//let hud;
let space;

// Camera object

// let cam_speed = 20; // Default speed of camera
// const cam_sprint = 100; // Max speed of camera

function setup() {
  // Create canvas
  //createCanvas(windowWidth, windowHeight);
  //graphics = createCanvas(windowWidth, windowHeight, WEBGL);
  //hud = createCanvas(windowWidth, windowHeight);

  createCanvas(windowWidth, windowHeight);
  space = createGraphics(windowWidth, windowHeight, WEBGL);
  space.noStroke();

  let test = new Projectile(1, 1, 1, 1, 1, 1);

  // Create camera
  cam = space.createCamera();
  cam.setPosition(0, 0, 80);
  cam.lookAt(0, 0, 0);

  // Create bodies
  //num_bodies = default_num_bodies; // prompt("How many bodies?", default_num_bodies);
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
  bodies.push(new Planet(0, 0, 0,
    0, 0, 0,
    200, 3000,
    color(5, 10, 58),
    "Earth"));
  playerbody = new Player(0, 0, 350, 200, 0, 0);
  bodies.push(playerbody);
  let ejector = new Ejector(0, 0, -350, -200, 0, 0);
  bodies.push(ejector);
}

function mousePressed() {
  requestPointerLock(); // Hides the cursor
}

function mouseWheel(event) {
  // cam_speed -= event.delta / 100; // Change speed
  // if (cam_speed > cam_sprint) {
  //   cam_speed = cam_sprint; // Speed limit
  // }
  // else if (cam_speed < 0) {
  //   cam_speed = 0; // Nonnegative speed
  // }
}

function apply_lighting() {
  space.background(20);
  space.directionalLight(50, 50, 50, 0, 0, -1);
  space.ambientLight(50);
}

function draw() {
  // Handle lighting
  apply_lighting();

  // Handle camera
  move_camera();

  // Handle the player
  // Handle bodies
  for(let body of bodies) {
   //console.log(body.name);
   body.fire_weapons();
  }

  move_bodies();
  apply_thrust();
  handle_grav();
  update_bodies();
  draw_bodies();

  image(space, 0, 0);

  draw_crosshairs();
}