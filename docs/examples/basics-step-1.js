// Physics Sandbox — Step 1: a floor and a falling box

let ground;

function setup() {
  createCanvas(800, 500);

  // There's a ready-made world called `world`, with gravity pulling down.
  // Objects we make go into it, and are moved and drawn automatically.

  // The floor: a static object never moves
  ground = new GameObject(width / 2, height - 20, width, 40, {
    isStatic: true,
    color: 80,
  });

  // Something to fall onto it
  new GameObject(width / 2, 50, 50);
}

function draw() {
  background(235);
}
