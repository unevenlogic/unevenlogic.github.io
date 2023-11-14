// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

class Dog {
  constructor(name, color, breed, age, size, bark_sound) {
    this.type = "Canis lupus familiaris";
    this.name = name;
    this.color = color;
    this.breed = breed;
    this.age = age;
    this.size = size;
    this.bark_sound = bark_sound;
  }

  bark() {
    console.log(this.bark_sound);
  }
}

class FavouriteDog extends Dog {
  constructor(name) {
    super(name, "black", "poodle", 3, "smaller", "Arf!");
  }
}

let spot = new FavouriteDog("Spot");
let rover = new FavouriteDog("Rover");
rover.color = "white";

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
}
