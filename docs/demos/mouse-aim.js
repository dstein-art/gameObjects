let turret, bullets, targets;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0;

  turret = new GameObject(60, 160, 50, 24, { isStatic: true, color: '#495057', cornerRadius: 6 });

  bullets = new GameGroup({ shape: 'circle', color: '#fab005', stroke: null, lifespan: 90, airFriction: 0 });
  targets = new GameGroup({ shape: 'circle', color: '#ff6b6b', isStatic: true, label: '✕', labelColor: 255 });
  for (let i = 0; i < 6; i++) targets.create(random(300, 600), random(40, 290), 36);

  bullets.ignore(turret);
  bullets.onCollide(targets, (bullet, target) => {
    bullet.destroy();
    target.destroy();
  });

  // a crate you can grab and drag (it gets in the way!)
  new GameObject(230, 160, 50, 120, { color: '#c48c50', draggable: true, airFriction: 0.2 });
}

function draw() {
  background(248);
  turret.lookAt(world.mouseX, world.mouseY); // aim at the mouse

  // hover effect on the targets
  for (let t of targets) t.color = t.isMouseOver() ? '#c92a2a' : '#ff6b6b';

  fill(0);
  noStroke();
  text('Click to shoot at the mouse · drag the crate · targets left: ' + targets.length, 10, 20);
  if (targets.length === 0) text('All done! Press R for more.', 10, 38);
}

function mousePressed() {
  if (world.objectsAt(world.mouseX, world.mouseY).some((o) => o.draggable)) return; // grabbing the crate
  let a = turret.angle;
  let b = bullets.create(turret.x + cos(a) * 30, turret.y + sin(a) * 30, 10);
  b.moveToward(world.mouseX, world.mouseY, 10);
}

function keyPressed() {
  if (key === 'r' || key === 'R') for (let i = 0; i < 6; i++) targets.create(random(300, 600), random(40, 290), 36);
}
