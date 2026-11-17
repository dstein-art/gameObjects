// Physics Sandbox — Step 3: random shapes, sizes and a ramp

let ground;

function setup() {
  createCanvas(800, 500);

  ground = new GameObject(width / 2, height - 20, width, 40, {
    isStatic: true,
    color: 80,
  });

  // A ramp, rotated 15 degrees
  new GameObject(250, 300, 300, 20, { isStatic: true, rotation: 15, color: 120 });
}

function draw() {
  background(235);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Click to drop a shape', 10, 20);
}

function mousePressed() {
  let kind = random(['box', 'circle', 'triangle', 'polygon']);
  let size = random(25, 60);

  new GameObject(mouseX, mouseY, size, size, {
    shape: kind,
    sides: floor(random(5, 9)), // only used by polygons
    rotation: random(360),
  });
}
