/* Robert Yang
 * October 2, 2023
 *
 * This is a simplified 2D version of the Pool game.
 *
 * Extra for experts options:
 * - Using the scroll wheel (used for simulation speed)
 * - Classes and class inheretance (used for types of balls)
 * - Linear algebra, specifically self-made projection vectors (used for ball-to-ball collisions)
 * - ! Easter eggs ! (see the end of this comment block)
 *
 * pull_force: how strongly the player ball is attracted to the mouse.
 * default_friction: percentage of velocity a ball retains per frame when moving.
 * radius: radius of normal balls.
 * player_radius: radius of player-controlled balls.
 * rand_magnitude: maximum velocity in the x/y directions at the start of the simulation.
 * spacing: spacing of the normal balls at the start of the game.
 * hole_radius: the radius of the holes.
 * moving_threshold: minimum speed of the balls for the simulation to keep running.
 * width and height: width and height of the canvas.
 * layers: number of layers for the object balls.
 * object_ball_origin_x, object_ball_origin_y: origin of the object balls.
 * player_ball_spawn_x, player_ball_spawn_y: spawn point of the player ball.
 * object_col_cap: maximum colour coefficients for the object balls.
 * state: the state of the game.
 * startWidth: the width of the start box.
 * startHeight: the height of the start box.
 * tutorialMargin: the margin between the edges and edges of the tutorial box.
 * tutorText: an array containing the tutorial text.
 * tutorHeights: an array containing the tutorial heights.
 * speedometer_thinness: the height of the speedometer.
 * scroll_scaling: the ratio between scroll wheel and simulation speed modifications.
 * speed_limit: maximum simulation speed.
 * pool_speed: simulation speed.
 * pool_refresh: greater than 1 if needed to update for the draw function.
 * speedometer_value: used for calculating colour and width of the speedometer.
 * balls: array containing balls.
 * holes: array containing holes.
 * playerballs: array containing player balls. May or may not have 1 element.
 * roboto: font used in this.
 *
 * Note that collisions are only calculated by distances after each frame, so collisions may not
 * occur if the velocities are large relative to radii.
 *
 *
 * There are also two easter eggs, whose effects will not be described. They, however, occur for
 * the following reasons:
 * 
 * player_disagreement: pressing space while holding the start button.
 * unconventional_friction: caused by scrolling up too much and overheating the speedometer. 
 * Scroll all the way down and set the speed to 0 to revert this.
 */

const pull_force = 0.03;
const default_friction = 0.995;
let friction = default_friction; // Not a const for a certain UNCONVENTIONAL reason...
const radius = 20;
const player_radius = 20;
const rand_magnitude = 5;
const spacing = radius * 2.1;
const hole_radius = 40;
const moving_threshold = 0.1;
//let width; let height;

// Variables for creating the balls
let layers;
let object_ball_origin_x;
let object_ball_origin_y;
let player_ball_spawn_x;
let player_ball_spawn_y;
const object_col_cap = 150;

// Shows up at the start of the game
let state = "Start screen";
let startWidth = 150;
let startHeight = 50;
let tutorialMargin = 50;
const tutorText = [
  "Press and release the mouse to determine direction",
  "Use the scroll wheel to determine speed of simulation",
  "(indicated by the bar at the top)",
  "Press Enter to finish evaluating the ball movement",
  "PRESS SPACE TO (RE)START",
  "There are also two hidden easter eggs..."
];
const tutorHeights = [0.2, 0.35, 0.4, 0.5, 0.8, 0.85];

// Variables for determining how fast the animations play
let speedometer_thinness;
const scroll_scaling = -0.001;
const speed_limit = 5.2;
let pool_speed = 2;
let pool_refresh = 0;
let speedometer_value;

// Arrays of objects used
const balls = [];
const holes = [];
const playerballs = [];

// Fonts
let roboto;

// Easter egg state variables
let player_disagreement = false;
let overheating = 0;
let unconventional_friction = false;
let overheating_bar_col = "darkorange";
let unconventional_bar_col = "yellow";
let unconventional_table_col = "brown";
let unconventional_friction_value = 1.001;

// CLASSES: BALLS AND HOLES

/** @class Generic pool ball. */
class Ball {
  constructor(x, y, label = "", rcol = 0, gcol = 0, bcol = 0) {
    this.x = x; // x position
    this.y = y; // y position
    this.spawn_x = this.x; // Initial x position
    this.spawn_y = this.y; // Initial y position
    this.v_x = 0; // Velocity in the x-direction
    this.v_y = 0; // Velocity in the y-direction
    
    // The next two variables are needed to prevent inaccurate velocity modifications when multiple balls hit this ball simultaneously
    this.v_x_old = this.v_x; // Starting velocity in the x-direction in the current frame
    this.v_y_old = this.v_y; // Starting velocity in the y-direction in the current frame
    
    this.radius = radius; // Radius of the ball
    this.rcol = rcol; // Red component of the colour of the ball
    this.gcol = gcol; // Green component of the colour of the ball
    this.bcol = bcol; // Blue component of the colour of the ball
    this.label = label; // The label of the ball
    this.alive = true; // Determines whether the ball renders (a.k.a. is alive)
  }

  /**
   * Bounces the ball on the edge of the canvas.
   */
  bounce_edge() {
    if (this.x < this.radius) {
      this.v_x = -this.v_x;
      this.x = this.radius;
    }
    if (this.y < this.radius) {
      this.v_y = -this.v_y;
      this.y = this.radius;
    }
    if (this.x > width - this.radius) {
      this.v_x = -this.v_x;
      this.x = width - this.radius;
    }
    if (this.y > height - this.radius) {
      this.v_y = -this.v_y;
      this.y = height - this.radius;
    }
  }

  /**
   * Bounces two balls.
   */
  bounce_ball(other, again = true) {
    if (!other.alive || !this.alive) {
      return; // Don't collide balls with dead balls
    }
    // Gets the displacement vector
    let u_x = other.x - this.x;
    let u_y = other.y - this.y;
    let distance = u_x * u_x + u_y * u_y;
    if (distance === 0 || distance > (this.radius + other.radius) ** 2) return; // Don't trigger if distance is zero (to prevent division by 0 error) or out of range
    
    // Caluclates the projection of velocity onto the displacement vector
    // The coefficient is the quotient of (the dot product of v and u) and (the dot product of u and u)
    let coeff = (this.v_x_old * u_x + this.v_y_old * u_y) / distance;
    
    // Takes this velocity off the current ball and transfers it to the other one
    this.v_x -= coeff * u_x;
    this.v_y -= coeff * u_y;
    other.v_x += coeff * u_x;
    other.v_y += coeff * u_y;
    
    // The other ball's velocity also matters
    if (again) {
      other.bounce_ball(this, false);
    }
    
    // Prevents the balls from getting stuck to each other and stopping
    if (distance <= (this.radius + other.radius) ** 2) {
      other.x =
        this.x + (u_x * (this.radius + other.radius)) / Math.sqrt(distance);
      other.y =
        this.y + (u_y * (this.radius + other.radius)) / Math.sqrt(distance);
    }
  }

  /**
   * Updates the kinematics of the ball.
   */
  update_ball() {
    this.v_x_old = this.v_x;
    this.v_y_old = this.v_y;
    this.v_x *= friction;
    this.v_y *= friction;
    this.x += this.v_x;
    this.y += this.v_y;
  }
  
  /**
   * Updates and draws the ball if it is alive.
   */
  draw_ball() {
    if (!this.alive) {
      return;
    }
    this.update_ball();
    // Draws the ball
    fill(this.rcol, this.gcol, this.bcol);
    circle(this.x, this.y, 2 * this.radius);
    // Labels the ball
    fill(255);
    text(this.label, this.x, this.y);
  }

  /**
   * Causes the ball to despawn and go to the spawn location.
   */
  destroy() {
    this.x = this.spawn_x;
    this.y = this.spawn_y;
    this.v_x = 0;
    this.v_y = 0;
    this.alive = false;
  }
}

/** @class Object balls that should be struck into holes. */
class ObjectBall extends Ball {
  // Basically a ball with randomized colours.
  constructor(x, y, label) {
    super(
      x,
      y,
      label,
      Math.random() * object_col_cap,
      Math.random() * object_col_cap,
      Math.random() * object_col_cap
    );
  }
}

/** @class Player ball that the player controls. */
class PlayerBall extends Ball {
  constructor(x, y) {
    super(x, y, "", 255, 255, 255);
    this.a_x = 0; // Acceleration of the player ball in the x-direction
    this.a_y = 0; // Acceleration of the player ball in the y-direction
    this.radius = player_radius;
    this.held = false; // Whether the left mouse button was held in the previous frame
    this.movable = false; // Whether the ball can be moved; true when balls are not moving
  }
  
  /**
   * Simulate striking the ball.
   */
  pull() {
    if (!this.alive || !this.movable) {
      return;
    }
    if (mouseIsPressed && this.movable) {
      this.held = true;
      this.a_x = (mouseX - this.x) * pull_force;
      this.a_y = (mouseY - this.y) * pull_force;
      line(this.x, this.y, mouseX, mouseY);
    } else if (this.held) {
      if(player_disagreement) {
        spawn_player_ball(this.x, this.y);
      }
      this.v_x += this.a_x;
      this.v_y += this.a_y;
      this.movable = false;
      this.held = false;
    }
  }
  
  /**
   * Modified destroy function that also resets the acceleration to zero.
   */
  destroy() {
    super.destroy();
    this.a_x = 0;
    this.a_y = 0;
  }
}

/** @class Hole that removes balls in range. */
class Hole {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
  
  /**
   * Scans for balls in its range and destroys them.
   */
  destroy() {
    fill("black");
    circle(this.x, this.y, 2 * this.r);
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i];
      if (dist(ball.x, ball.y, this.x, this.y) < this.r) {
        ball.destroy();
      }
    }
  }
}

// START SCREEN

/**
 * Check if a given location is within the bounds of a rectangle.
 *
 * @param {number} x The x position of the given location.
 * @param {number} y The y position of the given location.
 * @param {number} top The top of the rectangle.
 * @param {number} bottom The bottom of the rectangle.
 * @param {number} left The left-most part of the rectangle.
 * @param {number} right The right-most part of the rectangle.
 * @return {boolean} Whether the location is in the rectangle.
 */
function isInRect(x, y, top, bottom, left, right) {
  return x >= left && x <= right && y >= top && y <= bottom;
}

/**
 * Displays the start screen of the game.
 */
function start_screen() {
  background("white");
  fill("dimgray");
  rect(
    (width - startWidth) / 2,
    (height - startHeight) / 2,
    startWidth,
    startHeight
  );
  fill("white");
  text("Start game", width / 2, height / 2);
}

/**
 * Displays the start screen of the game while the start button is being held.
 */
function start_screen_held() {
  background("darkgreen");
  fill("white");
  rect(
    (width - startWidth) / 2,
    (height - startHeight) / 2,
    startWidth,
    startHeight
  );
  fill("black");
  //text("Start game", width/2, height/2);
}

/**
 * Displays the tutorial screen of the game.
 */
function tutorialScreen() {
  background("darkgreen");
  fill("white");
  rect(
    tutorialMargin,
    tutorialMargin,
    width - 2 * tutorialMargin,
    height - 2 * tutorialMargin
  );
  fill("black");
  for (let i = 0; i < tutorText.length; i++) {
    text(tutorText[i], width / 2, height * tutorHeights[i]);
  }
}

// The next two functions handle mouse clicks that update the state of the game.

function mousePressed() {
  // Changes state to "Start screen held" when first clicked.
  if (
    state === "Start screen" &&
    isInRect(
      mouseX,
      mouseY,
      (height - startHeight) / 2,
      (height + startHeight) / 2,
      (width - startWidth) / 2,
      (width + startWidth) / 2
    )
  ) {
    state = "Start screen held";
  }
}

function mouseReleased() {
  // Changes state to "Tutorial screen" when the button is released.
  if (state === "Start screen held") {
    state = "Tutorial screen";
  }
}

// SPEEDOMETER AND UPDATING

/**
 * Checks whether the balls are moving.
 *
 * @return {boolean} Whether any ball is moving.
 */
function check_moving() {
  for (let ball of balls) {
    if (dist(ball.v_x, ball.v_y, 0, 0) > moving_threshold) {
      return true;
    }
  }
  set_not_moving();
  return false;
}

/**
 * Stops all the balls.
 */
function set_not_moving() {
  for (let ball of balls) {
    ball.v_x = 0;
    ball.v_y = 0;
  }
}

/**
 * Displays the speedometer bar; note that the length of the bar is proportional to the logarithm of the speed.
 */
function draw_speedometer() {
  speedometer_value = log(pool_speed / 3 + 1);
  if (unconventional_friction) {
    fill(unconventional_bar_col);
  } else if (overheating > 0) {
    fill(overheating_bar_col);
    overheating -= 0.1;
  } else {
    fill(speedometer_value * 255, 0, 0, speedometer_value * 255);
  }
  rect(0, 0, width * speedometer_value, speedometer_thinness);
}

/**
 * Draws a single frame of the game.
 */
function update() {
  if(unconventional_friction) {
    background(unconventional_table_col);
  } else {
    background("darkgreen");
  }
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].bounce_ball(balls[j]);
    }
  }
  for (let hole of holes) {
    hole.destroy();
  }
  for (let ball of balls) {
    ball.bounce_edge();
    ball.draw_ball();
  }
  for(let playerball of playerballs) {
    playerball.pull();
    // (Re)spawns the player and allows them to move if the balls are not moving.
    if (!check_moving()) {
      playerball.alive = true;
      playerball.movable = true;
    }
  }
  draw_speedometer();
}

/**
 * 
 */
function draw_game() {
  pool_refresh += pool_speed;
  for (let i = 0; i < Math.floor(pool_refresh); i++) {
    update();
  }
  pool_refresh %= 1;
}

function keyPressed() {
  if (keyCode === 13) {
    // Enter key: auto-evaluates the scene
    while (check_moving()) {
      update();
    }
  } else if (keyCode === 32) {
    if(state === "Start screen held") {
      // ! Triggers player disagreement easter egg !
      player_disagreement = true;
    }
    // Space key: restarts the game
    state = "Game";
    for (let ball of balls) {
      ball.x = ball.spawn_x;
      ball.y = ball.spawn_y;
      ball.v_x = 0;
      ball.v_y = 0;
      ball.alive = true;
    }
  }
}

/**
 * Uses the mouse wheel to increase/decrease the speed.
 */
function mouseWheel(event) {
  let delta_speed = event.delta * scroll_scaling
  pool_speed += delta_speed;
  if (pool_speed < 0) {
    pool_speed = 0;
    unconventional_friction = false;
    friction = default_friction;
  } else if (pool_speed > speed_limit) {
    pool_speed = speed_limit;
  }
  // ! Handles overheating !
  if (pool_speed === speed_limit && !unconventional_friction) {
    if(overheating < 0) {
      overheating = 0;
    }
    overheating += delta_speed * 20;
    if(overheating > 100) {
      unconventional_friction = true;
      overheating = 0;
      friction = unconventional_friction_value;
    }
  }
  //console.log(pool_speed);
  update();
}

// SETTING UP THE BALLS

/**
 * Creates the player ball.
 */
function spawn_player_ball(x, y) {
  let playerball = new PlayerBall(x, y);
  playerballs.push(playerball);
  balls.push(playerball);
}

/**
 * Creates and numbers trianglular grid of object balls.
 */
function spawn_object_balls() {
  // Aligns the balls in a trianglular grid
  for (let i = 0; i < layers; i++) {
    for (let j = 0; j <= i; j++) {
      balls.push(
        new ObjectBall(
          object_ball_origin_x - (sqrt(3) * spacing * i) / 2,
          object_ball_origin_y - (spacing * i) / 2 + spacing * j,
          (i * (i + 1)) / 2 + j + 1
        )
      );
    }
  }
}

/**
 * Creates the six holes.
 */
function spawn_holes() {
  for (let i of [0, width / 2, width]) {
    for (let j of [0, height]) {
      holes.push(new Hole(i, j, hole_radius));
    }
  }
}

// MAIN FUNCTIONS

function preload() {
  // Load the required font
  roboto = loadFont("assets/Roboto-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  width = windowWidth;
  height = windowHeight;
  layers = prompt("Set number of layers of pool balls", 5);
  

  object_ball_origin_x = width * 2/5;
  object_ball_origin_y = height * 1/2;
  player_ball_spawn_x = width * 3/4;
  player_ball_spawn_y = height * 1/2;
  speedometer_thinness = height / 30;
  
  // Creates all (or most) of the objects used in the game
  spawn_player_ball(player_ball_spawn_x, player_ball_spawn_y);
  spawn_object_balls();
  spawn_holes();

  textAlign(CENTER, CENTER);
  textSize(20);
  textFont(roboto);
}

function draw() {
  if (state === "Start screen") {
    start_screen();
  } else if (state === "Start screen held") {
    start_screen_held();
  } else if (state === "Tutorial screen") {
    tutorialScreen();
  } else if (state === "Game") {
    draw_game();
  }
}
