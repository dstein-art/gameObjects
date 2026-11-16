// Physics Sandbox — Step 2: click to drop a shape

let ground;

function setup() {
  createCanvas(800, 500);

  ground = new GameObject(width / 2, height - 20, width, 40, {
    isStatic: true,
    color: 80,
  });
}

function draw() {
  background(235);

  fill(0);
  noStroke();
  textSize(14);
  text('Click to drop a box', 10, 20);
}

// p5 calls this every time the mouse is clicked
function mousePressed() {
  new GameObject(mouseX, mouseY, 40);
}
