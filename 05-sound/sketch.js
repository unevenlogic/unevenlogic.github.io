// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let spaceship;
let cannonfire; let spacelazer;
let music;

const shipScale = 1;
const cannonX = 45 * shipScale;

const bulletWidth = 10 * shipScale;
const bulletHeight = 20 * shipScale;

function preload() {
  spaceship = loadImage("Spaceship_tut.png");
  cannonfire = loadSound("cannon_fire.ogg");
  spacelazer = loadSound("space_laser.wav");
  music = loadSound("battleThemeA.mp3");
  music.setVolume(0.7)
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  rectMode(CENTER);
}

function showCannons() {
  ellipse(mouseX + cannonX, mouseY, bulletWidth, bulletHeight);
  ellipse(mouseX - cannonX, mouseY, bulletWidth, bulletHeight);
}

function draw() {
  background(220);
  image(spaceship, mouseX, mouseY, spaceship.width * shipScale, spaceship.height * shipScale);
  //showCannons();
}

function mousePressed() {
  cannonfire.play();
  spacelazer.play();
  if(!music.isPlaying()) {
    music.loop();
  }
}