let slider, lift;

function setup() {
  createCanvas(640, 320);
  world.addWalls();
  new GameObject(320, 310, 640, 20, { isStatic: true, color: 90 });

  // static platforms that we move ourselves
  slider = new GameObject(320, 140, 160, 16, { isStatic: true, color: '#f08c00', friction: 0.8 });
  lift = new GameObject(560, 190, 100, 16, { isStatic: true, color: '#1c7ed6', friction: 0.8 });

  // passengers
  new GameObject(320, 100, 40, { color: 'tomato', friction: 0.8, draggable: true });
  new GameObject(560, 150, 30, { color: 'gold', friction: 0.8, draggable: true });
}

function draw() {
  background(240);

  // move the platforms a little every frame
  slider.x = 320 + sin(frameCount * 0.02) * 180;
  lift.y = 190 + sin(frameCount * 0.015) * 90;
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Static platforms moved with x and y carry what stands on them. Drag boxes onto them.', 10, 20);
}
