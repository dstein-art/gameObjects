let light, heavy;

function setup() {
  createCanvas(640, 300);
  world.addWalls();
  new GameObject(320, 285, 640, 30, { isStatic: true, color: 90 });

  light = new GameObject(200, 240, 50, { color: '#74c0fc', label: 'light', density: 0.001 });
  heavy = new GameObject(440, 240, 50, { color: '#495057', label: 'heavy', labelColor: 255, density: 0.01 });
}

function draw() {
  background(240);

  if (keyIsDown(70)) {
    // 70 = F key: a steady force every frame
    light.applyForce(0, -5);
    heavy.applyForce(0, -5);
  }
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('P = push(0, -12) on both     F = hold to applyForce(0, -5) on both', 10, 20);
  text('push ignores weight. applyForce moves the heavy box less.', 10, 38);
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    light.push(0, -12);
    heavy.push(0, -12);
  }
}
