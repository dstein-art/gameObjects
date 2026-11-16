let plank;

function setup() {
  createCanvas(640, 320);
  world.addWalls();
  new GameObject(320, 310, 640, 20, { isStatic: true, color: 90 });

  // a plank pinned in the middle, on a triangle stand
  new GameObject(320, 268, 60, { shape: 'triangle', rotation: -90, isStatic: true, isSensor: true, color: 120 });
  plank = new GameObject(320, 240, 420, 14, { color: '#c48c50' });
  world.pin(plank, 320, 240).visible = false;

  // the same size, very different weights
  new GameObject(170, 120, 50, { density: 0.001, color: '#74c0fc', label: 'light', draggable: true });
  new GameObject(470, 40, 50, { density: 0.006, color: '#495057', label: 'heavy', labelColor: 255, draggable: true });
}

function draw() {
  background(245);
  fill(0);
  noStroke();
  text('Same size, different density. Drag the boxes around the seesaw.', 10, 20);
}
