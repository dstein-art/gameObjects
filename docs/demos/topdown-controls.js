let player;
let dashTimer = 0;

let W = 87, A = 65, S = 83, D = 68;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0;
  world.addWalls();
  player = new GameObject(320, 160, 34, { shape: 'circle', color: '#7950f2', fixedRotation: true });

  for (let i = 0; i < 8; i++) {
    new GameObject(random(40, 600), random(60, 300), random(20, 50), { isStatic: true, color: '#ced4da' });
  }
}

function draw() {
  background('#f8f9fa');

  // held keys: arrows or WASD
  let vx = 0;
  let vy = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(A)) vx -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(D)) vx += 1;
  if (keyIsDown(UP_ARROW) || keyIsDown(W)) vy -= 1;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(S)) vy += 1;

  let len = max(1, sqrt(vx * vx + vy * vy)); // same speed diagonally
  let speed = dashTimer > 0 ? 12 : 4;
  player.setVelocity((vx / len) * speed, (vy / len) * speed);
  if (dashTimer > 0) dashTimer--;
  player.color = dashTimer > 0 ? '#e599f7' : '#7950f2';
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Arrows or WASD to move (held) · SPACE to dash (pressed once)', 10, 20);
}

function keyPressed() {
  if (key === ' ' && dashTimer === 0) dashTimer = 10;
}
