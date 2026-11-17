function setup() {
  createCanvas(640, 320);
  build();
}

function build() {
  world.clear(); // remove everything, then build the scene again
  world.addWalls();
  new GameObject(320, 310, 640, 20, { isStatic: true, color: 90 });
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      new GameObject(420 + col * 32, 285 - row * 32, 30, { color: row % 2 ? '#ffa94d' : '#ffd43b' });
    }
  }
  let ball = new GameObject(60, 200, 40, { shape: 'circle', color: '#495057', density: 0.02 });
  ball.setVelocity(14, -4);
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('S = slow motion · P = pause · R = run it again', 10, 20);
  text('timeScale: ' + world.timeScale + (world.paused ? '   PAUSED' : ''), 10, 38);
}

function keyPressed() {
  if (key === 's' || key === 'S') world.timeScale = world.timeScale === 1 ? 0.2 : 1;
  if (key === 'p' || key === 'P') world.paused = !world.paused;
  if (key === 'r' || key === 'R') build();
}
