// Space Shooter — Step 2: thrust and wrapping around the screen

let ship;

function setup() {
  createCanvas(800, 600);
  world.gravityY = 0; // space: no gravity

  ship = new GameObject(width / 2, height / 2, 30, {
    shape: 'triangle', // points right when rotation is 0
    color: '#e9ecef',
    stroke: '#4dabf7',
    strokeWeight: 2,
    airFriction: 0.02, // drifts, but slowly comes to a stop
  });
}

function draw() {
  background('#0b0c10');

  ship.lookAt(mouseX, mouseY); // always face the mouse

  let thrusting = keyIsDown(87) || keyIsDown(UP_ARROW); // 87 = W
  if (thrusting) {
    // push the way the ship is facing (ship.angle is its rotation in radians)
    ship.applyForce(Math.cos(ship.angle) * 0.5, Math.sin(ship.angle) * 0.5);
  }

  // fly off one edge, come back on the other
  wrap(ship);
}

function wrap(obj) {
  let m = obj.width / 2;
  if (obj.x < -m) obj.x = width + m;
  if (obj.x > width + m) obj.x = -m;
  if (obj.y < -m) obj.y = height + m;
  if (obj.y > height + m) obj.y = -m;
}
