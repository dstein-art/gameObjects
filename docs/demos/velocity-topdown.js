let player;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0; // top-down: no gravity
  world.addWalls();

  player = new GameObject(320, 160, 40, {
    shape: 'circle',
    color: 'tomato',
    fixedRotation: true,
  });

  // some crates to push around
  for (let i = 0; i < 6; i++) {
    new GameObject(random(60, 580), random(60, 260), 40, { color: '#c48c50', airFriction: 0.1 });
  }
}

function draw() {
  background('#e9f5db');

  let vx = 0;
  let vy = 0;
  if (keyIsDown(LEFT_ARROW)) vx = -4;
  if (keyIsDown(RIGHT_ARROW)) vx = 4;
  if (keyIsDown(UP_ARROW)) vy = -4;
  if (keyIsDown(DOWN_ARROW)) vy = 4;
  player.setVelocity(vx, vy);

  fill(0);
  noStroke();
  text('Arrow keys to move · push the crates', 10, 20);
  text('velocityX: ' + player.velocityX.toFixed(1) + '   velocityY: ' + player.velocityY.toFixed(1), 10, 38);
}
