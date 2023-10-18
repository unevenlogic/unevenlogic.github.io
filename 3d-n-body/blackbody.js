// Computes colour from a given temmperature

function enforceBounds(col) {
  if(col < 0) {
    col = 0;
  }
  if(col > 255) {
    col = 255;
  }
  return col;
}

function getRed(t) {
  if (t <= 66) {
    return 255;
  }
  let r = t - 60;
  r = 329.698727446 * Math.pow(r, -0.1332047592);
  return enforceBounds(r);
}

function getGreen(t) {
  if(t <= 66) {
    let g = t;
    g = 99.4708025861 * log(g) - 161.1195681661;
    return enforceBounds(g);
  }
  else {
    let g = t - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    return enforceBounds(g);
  }
}

function getBlue(t) {
  if(t >= 66) {
    return 255;
  }
  else {
    let b = t - 10;
    b = 138.5177312231 * log(b) - 305.0447927307;
    return enforceBounds(b);
  }
}

/**
 * Gets the RGB approximation of blackbody radiation of a temperature measured in Kelvins.
 * @param {number} t Temperature in Kelvins
 * @returns The RGB approximation of blackbody radiation at that temperature
 */
function getColour(t) {
  t /= 100;
  return color(getRed(t), getGreen(t), getBlue(t));
}