function setup() {
  createCanvas(640, 320);
  world.addWalls({ color: null });
  for (let i = 0; i < 20; i++) {
    new GameObject(random(40, 600), random(40, 280), random(18, 40), {
      shape: random(['box', 'circle']),
      bounce: 0.4,
    });
  }
}

function draw() {
  background(240);

  // arrow keys point gravity in a direction
  if (keyIsDown(LEFT_ARROW)) world.setGravity(-1, 0);
  if (keyIsDown(RIGHT_ARROW)) world.setGravity(1, 0);
  if (keyIsDown(UP_ARROW)) world.setGravity(0, -1);
  if (keyIsDown(DOWN_ARROW)) world.setGravity(0, 1);

  // an arrow showing the gravity
  push();
  translate(width - 50, 50);
  stroke(200, 0, 0);
  strokeWeight(4);
  line(0, 0, world.gravityX * 30, world.gravityY * 30);
  pop();
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Arrow keys change the direction of gravity · space = no gravity', 10, 20);
  text('gravityX: ' + world.gravityX + '   gravityY: ' + world.gravityY, 10, 38);
}

function keyPressed() {
  if (key === ' ') world.setGravity(0, 0);
}
