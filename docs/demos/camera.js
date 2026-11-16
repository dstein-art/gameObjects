let player;
let WORLD_W = 2000;
let WORLD_H = 1400;

function setup() {
  createCanvas(640, 360);
  world.gravityY = 0;
  world.addWalls({ x: 0, y: 0, width: WORLD_W, height: WORLD_H });

  // scatter things around the big world
  for (let i = 0; i < 60; i++) {
    new GameObject(random(WORLD_W), random(WORLD_H), random(30, 90), {
      shape: random(['box', 'circle', 'polygon']),
      isStatic: true,
      color: color(random(150, 230), random(150, 230), random(150, 230)),
      stroke: null,
    });
  }

  player = new GameObject(WORLD_W / 2, WORLD_H / 2, 30, { shape: 'circle', color: 'tomato', fixedRotation: true });
  world.camera.follow(player, 0.08);
}

function draw() {
  background('#f1f3f5');

  // move
  let vx = 0;
  let vy = 0;
  if (keyIsDown(LEFT_ARROW)) vx = -6;
  if (keyIsDown(RIGHT_ARROW)) vx = 6;
  if (keyIsDown(UP_ARROW)) vy = -6;
  if (keyIsDown(DOWN_ARROW)) vy = 6;
  player.setVelocity(vx, vy);

  // zoom with + and -
  if (keyIsDown(187) || keyIsDown(61)) world.camera.zoom = min(world.camera.zoom * 1.02, 3);
  if (keyIsDown(189) || keyIsDown(173)) world.camera.zoom = max(world.camera.zoom / 1.02, 0.3);

  // WORLD drawing: a grid that scrolls with the world
  world.camera.begin();
  stroke(220);
  strokeWeight(1);
  for (let x = 0; x <= WORLD_W; x += 100) line(x, 0, x, WORLD_H);
  for (let y = 0; y <= WORLD_H; y += 100) line(0, y, WORLD_W, y);
  noFill();
  stroke(120);
  strokeWeight(4);
  rect(0, 0, WORLD_W, WORLD_H);
  world.camera.end();

  world.draw(); // draw the objects now, so the HUD goes on top

  // SCREEN drawing: stays put
  fill(0, 150);
  noStroke();
  rect(0, 0, width, 44);
  fill(255);
  text('Arrows to move · + / - to zoom', 10, 18);
  text(
    'player at (' + round(player.x) + ', ' + round(player.y) + ')   zoom ' + world.camera.zoom.toFixed(2) +
      '   mouse in world (' + round(world.mouseX) + ', ' + round(world.mouseY) + ')',
    10,
    36
  );

  // a mini-map in the corner
  let s = 0.06;
  push();
  translate(width - WORLD_W * s - 10, height - WORLD_H * s - 10);
  fill(255, 200);
  stroke(0);
  rect(0, 0, WORLD_W * s, WORLD_H * s);
  fill('tomato');
  noStroke();
  circle(player.x * s, player.y * s, 6);
  pop();
}
