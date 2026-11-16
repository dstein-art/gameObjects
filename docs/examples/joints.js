// GameObjects — Joints & Dragging
// Drag anything with the mouse. Shows world.connect(), world.pin() and draggable.

function setup() {
  createCanvas(800, 500);
  world.addWalls();

  // ---- a rope bridge: planks connected end to end, pinned at both sides ----
  let planks = new GameGroup({ color: '#a0522d', draggable: true });
  let count = 12;
  let plankW = 36;
  let startX = 140;
  let bridgeY = 300;
  let previous = null;
  for (let i = 0; i < count; i++) {
    let plank = planks.create(startX + i * (plankW + 4), bridgeY, plankW, 12);
    if (previous) {
      world.connect(previous, plank, {
        offsetA: { x: plankW / 2, y: 0 }, // right end of the previous plank
        offsetB: { x: -plankW / 2, y: 0 }, // left end of this plank
        length: 4,
        stiffness: 0.9,
      });
    }
    previous = plank;
  }
  world.pin(planks.first, planks.first.x - plankW / 2, bridgeY, { offset: { x: -plankW / 2, y: 0 } });
  world.pin(planks.last, planks.last.x + plankW / 2, bridgeY, { offset: { x: plankW / 2, y: 0 } });

  // ---- a pendulum ----
  let bob = new GameObject(650, 260, 50, { shape: 'circle', color: '#f06595', draggable: true });
  let string = world.pin(bob, 650, 60);
  string.stroke = '#555';

  // ---- a springy pair ----
  let a = new GameObject(560, 400, 40, { color: '#74c0fc', draggable: true });
  let b = new GameObject(660, 400, 40, { color: '#74c0fc', draggable: true });
  let spring = world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });
  spring.stroke = '#1c7ed6';

  // ---- some loose things to drop on the bridge ----
  for (let i = 0; i < 6; i++) {
    new GameObject(random(200, 550), random(40, 150), random(20, 40), {
      shape: random(['box', 'circle']),
      draggable: true,
    });
  }
}

function draw() {
  background(245);
  fill(0);
  noStroke();
  textSize(14);
  text('Drag anything!', 10, 20);
  if (world.dragging) text('Dragging an object', 10, 40);
}
