const moveTime = 50;
const ironClawMoveTime = 80;
const entityFilling = 0.8;
const random_possibilities = [-0.5, 0, 0.5]; // Random places for the enemy to move
const movementKeys = [87, 65, 83, 68];
const keyMovement = {
  87: [0, -1],
  65: [-1, 0],
  83: [0, 1],
  68: [1, 0],
};
const numEnemiesScaling = 0.5;
const numIronClawsScaling = 0.25;

let numEnemies = 1;
let numIronClaws = 3;

let player;
let enemies = [];


class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.newX = x;
    this.newY = y;
    this.prevX = x;
    this.prevY = y;
    this.timer = 0;
    this.turn = false;
    this.onTimer = false;
    this.moveTime = moveTime;
    this.colour = "black";
    this.minePower = 1;
    this.outcome = "";
    this.type = "";
  }

  get_direction() {} // Will be overwritten by children

  go_next() {} // Also will be overwritten by children

  force_back() {
    this.x = this.prevX;
    this.y = this.prevY;
  }

  proceed() {
    this.x = this.newX;
    this.y = this.newY;
    this.prevX = this.newX;
    this.prevY = this.newY;
  }

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

  draw() {
    fill(this.colour);
    circle(startX + (this.x+0.5) * squareSize, startY + (this.y+0.5) * squareSize, squareSize * entityFilling);
  }
}

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
        gameState = "death";
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

class IronClaw extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.minePower = 0.8;
    this.colour = "silver";
    this.weak = false;
    this.moveTime = ironClawMoveTime;
  }
}

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

function spawnPlayer() {
  player = new Player(4, 4);
  for(let i = 2; i <= 6; i++) {
    for(let j = 2; j <= 6; j++) {
      grid[i][j] = 0;
    }
  }
}

function spawnEnemy() {
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