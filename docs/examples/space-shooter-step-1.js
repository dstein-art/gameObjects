// Space Shooter — Step 1: a ship that faces the mouse

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
}
