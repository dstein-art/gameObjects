let crateImg, ballImg;

async function setup() {
  createCanvas(640, 320);
  world.addWalls();

  crateImg = await loadImage('../assets/crate.png');
  ballImg = await loadImage('../assets/ball.png');

  new GameObject(320, 305, 640, 30, { isStatic: true, color: '#8d6e63' });

  for (let i = 0; i < 4; i++) dropCrate(150 + i * 10, 50 - i * 60);
  dropBall(450, 40);
}

function dropCrate(x, y) {
  // box shape + picture
  new GameObject(x, y, 48, 48, { image: crateImg, draggable: true });
}

function dropBall(x, y) {
  // circle shape so it rolls, plus a picture
  new GameObject(x, y, 48, { shape: 'circle', image: ballImg, bounce: 0.8, draggable: true });
}

function draw() {
  background('#d0ebff');
  fill(0);
  noStroke();
  text('Click empty space: left half drops a crate, right half drops a ball. Drag things around.', 10, 20);
}

function mousePressed() {
  if (world.objectsAt(mouseX, mouseY).length > 0) return; // dragging, not dropping
  if (mouseX < width / 2) dropCrate(mouseX, mouseY);
  else dropBall(mouseX, mouseY);
}
