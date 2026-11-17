let ghost;

function setup() {
  createCanvas(640, 300);
  world.gravityY = 0; // nothing falls in this demo

  new GameObject(90, 150, 100, 100, {
    color: 'gold',
    stroke: 'darkorange',
    strokeWeight: 6,
    label: 'stroke',
  });

  new GameObject(230, 150, 100, 100, {
    shape: 'circle',
    color: '#4dabf7',
    stroke: null,
    label: 'no outline',
    labelColor: 'white',
    labelSize: 16,
  });

  ghost = new GameObject(370, 150, 100, 100, {
    color: 'purple',
    label: 'opacity',
    labelColor: 'white',
  });

  // depth decides which one is drawn on top
  new GameObject(510, 130, 90, 90, { color: 'tomato', depth: 1, label: 'depth 1' });
  new GameObject(550, 175, 90, 90, { color: 'seagreen', depth: 0, label: 'depth 0', isSensor: true });
}

function draw() {
  background(250);
  // opacity can change every frame
  ghost.opacity = 128 + sin(frameCount * 3 * PI / 180) * 127;
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Click a shape to give it a random colour with fill()', 10, 20);
}

function mousePressed() {
  for (let obj of world.objects) {
    if (obj.isMouseOver()) obj.fill(random(255), random(255), random(255));
  }
}
