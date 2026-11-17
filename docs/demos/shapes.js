function setup() {
  createCanvas(640, 300);
  world.addWalls();
  new GameObject(320, 285, 640, 30, { isStatic: true, color: 80 });
  makeShapes();
}

function makeShapes() {
  new GameObject(80, 50, 70, 45, { label: 'box' });
  new GameObject(190, 50, 60, 45, { cornerRadius: 12, label: 'rounded' });
  new GameObject(300, 50, 55, { shape: 'circle', label: 'circle' });
  new GameObject(400, 50, 60, { shape: 'triangle' });
  new GameObject(490, 50, 60, { shape: 'polygon', sides: 5, label: '5' });
  new GameObject(580, 50, { vertices: [[0, -30], [28, 22], [-28, 22]], label: 'custom' });
}

function draw() {
  background(235);
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Click to drop another set', 10, 20);
}

function mousePressed() {
  makeShapes();
}
