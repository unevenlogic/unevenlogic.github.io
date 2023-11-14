// Entities for cave dungeons

const entityFilling = 0.8; // Portion of length of square that entities take
const moveTime = 50; // Amount of time taken between actions
const ironClawMoveTime = 80; // move time for iron claws
const random_possibilities = [-0.5, 0, 0.5]; // Random places for enemies to move
const movementKeys = [87, 65, 83, 68]; // WASD keys
const keyMovement = { // The corresponding displacements to the WASD keys
  87: [0, -1],
  65: [-1, 0],
  83: [0, 1],
  68: [1, 0],
};
const numEnemiesScaling = 0.5; // Number of enemies introduced per round
const numIronClawsScaling = 0.25; // Number of iron claws introduced per round

let numEnemies; // Number of enemies
let numIronClaws; // Number of iron claws

let player; // The player
let enemies = []; // The enemies

/**
 * Generic entity (e.g. players and enemies).
 */
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.newX = x;
    this.newY = y;
    this.prevX = x;
    this.prevY = y;
    this.timer = 0;
    this.turn = false; // Whether the entity can or is moving
    this.onTimer = false; // Whether the entity is moving or resting
    this.moveTime = moveTime; // The waiting time for the entity
    this.colour = "black"; // The colour to render the enemy
    this.minePower = 1; // The mining power of the entity
    this.outcome = ""; // The most recent environment response to movement
  }

  /**
   * Gets the next direction of the entity.
   */
  get_direction() {} // Will be overwritten by children

  /**
   * Triggered when the entity touches an exit.
   */
  go_next() {} // Also will be overwritten by children

  /**
   * Push entity back into previous location.
   */
  force_back() {
    this.x = this.prevX;
    this.y = this.prevY;
  }

  /**
   * Push entity forwards to destination square.
   */
  proceed() {
    this.x = this.newX;
    this.y = this.newY;
    this.prevX = this.newX;
    this.prevY = this.newY;
  }

  /**
   * Determines the current state of the entity.
   */
  update() {
    if(this.turn && !this.onTimer) {
      // Enemy movement to midpoint
      if(this.get_direction()) {
        this.onTimer = true; // Add a timer to stall entity in midpoint
        this.timer = millis();
      }
    }
    else if(this.turn && this.onTimer && millis() - this.timer > this.moveTime) {
      // Completion and outcome of movement
      this.turn = false; // Stops entity from moving
      this.timer = millis(); // to smoothen motion
      this.newX = 2 * this.x - this.prevX;
      this.newY = 2 * this.y - this.prevY;
      if(this.newX < 0 || this.newX >= xSize || this.newY < 0 || this.newY >= ySize) {
        // Hit an edge
        this.force_back();
        this.outcome = "hit_edge";
      }
      else if(grid[this.newY][this.newX] === 2) {
        // Entered an exit
        this.go_next();
        this.outcome = "hit_exit";
      }
      else if(grid[this.newY][this.newX] >= getMiningEffectiveness(this.newY, this.newX) * this.minePower) {
        // Mining a block
        grid[this.newY][this.newX] -= getMiningEffectiveness(this.newY, this.newX) * this.minePower;
        this.force_back();
        this.outcome = "slammed";
      }
      else {
        // Normal movement
        grid[this.newY][this.newX] = 0;
        this.proceed();
        this.outcome = "moved";
      }
    }
    else if(millis() - this.timer > this.moveTime) {
      // Delay before moving again
      this.onTimer = false;
      this.turn = true;
    }
  }

  /**
   * Draws the entity.
   */
  draw() {
    fill(this.colour);
    circle(startX + (this.x+0.5) * squareSize, startY + (this.y+0.5) * squareSize, squareSize * entityFilling);
  }
}

/**
 * Enemy entity; chases the player, moving randomly if hitting a wall.
 */
class Enemy extends Entity {
  constructor(x, y) {
    super(x, y);
    this.colour = "chocolate";
    this.minePower = 0.0001;
    this.weak = true;
  }

  get_direction() {
    if(this.weak && (this.outcome === "slammed" || this.outcome === "hit_edge")) {
      this.x += random(random_possibilities);
      this.y += random(random_possibilities);
      return true;
    }
    else {
      let xDisp = player.x - this.x;
      let yDisp = player.y - this.y;
      let xDist = Math.abs(xDisp);
      let yDist = Math.abs(yDisp);
      let endTurn = false;
      if(xDisp === 0 && yDisp === 0) {
        gameState = "death"; // The enemy is on the player
      }

      if(xDisp !== 0) {
        this.x += xDisp / (2 * xDist);
        endTurn = true;
      }
      if(yDisp !== 0) {
        this.y += yDisp / (2 * yDist);
        endTurn = true;
      }
      return endTurn;
    }
  }
}

/**
 * Slower but more powerful enemy that can mine walls.
 */
class IronClaw extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.minePower = 0.8;
    this.colour = "silver";
    this.weak = false;
    this.moveTime = ironClawMoveTime;
  }
}

/**
 * Player entity.
 */
class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.colour = "green";
    this.minePower = 1;
  }

  get_direction() {
    let endTurn = false;
    for(let k of movementKeys) {
      if (keyIsDown(k)) {
        endTurn = true;
        this.x += keyMovement[k][0] / 2;
        this.y += keyMovement[k][1] / 2;
      }
    }
    return endTurn;
  }

  go_next() {
    gameState = "next";
  }

  get_ancientness() {
    return getAncientness(this.prevY, this.prevX);
  }
}

/**
 * Spawns the player.
 */
function spawnPlayer() {
  player = new Player(4, 4);
  for(let i = 2; i <= 6; i++) {
    for(let j = 2; j <= 6; j++) {
      grid[i][j] = 0;
    }
  }
}

/**
 * Spawns the enemies.
 */
function spawnEnemies() {
  enemies = [];
  for(let n = 0; n < numEnemies; n++) {
    let enemyI = Math.floor(random(ySize/3, ySize));
    let enemyJ = Math.floor(random(xSize/3, xSize));
    for(let i = Math.max(0, enemyI - 1); i <= Math.min(enemyI + 1, ySize - 1); i++) {
      for(let j = Math.max(0, enemyJ - 1); j <= Math.min(enemyJ + 1, xSize - 1); j++) {
        grid[i][j] = 0;
      }
    }
    enemies.push(new Enemy(enemyJ, enemyI));
  }
  for(let n = 0; n < numIronClaws; n++) {
    let enemyI = Math.floor(random(ySize/3, ySize));
    let enemyJ = Math.floor(random(xSize/3, xSize));
    for(let i = Math.max(0, enemyI - 1); i <= Math.min(enemyI + 1, ySize - 1); i++) {
      for(let j = Math.max(0, enemyJ - 1); j <= Math.min(enemyJ + 1, xSize - 1); j++) {
        grid[i][j] = 0;
      }
    }
    enemies.push(new IronClaw(enemyJ, enemyI));
  }
}