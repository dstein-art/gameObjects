// Joints — Step 4: a spring

function setup() {
  createCanvas(800, 500);
  world.addWalls();

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
        offsetA: { x: plankW / 2, y: 0 },
        offsetB: { x: -plankW / 2, y: 0 },
        length: 4,
        stiffness: 0.9,
      });
    }
    previous = plank;
  }
  world.pin(planks.first, planks.first.x - plankW / 2, bridgeY, { offset: { x: -plankW / 2, y: 0 } });
  world.pin(planks.last, planks.last.x + plankW / 2, bridgeY, { offset: { x: plankW / 2, y: 0 } });

  let bob = new GameObject(650, 260, 50, { shape: 'circle', color: '#f06595', draggable: true });
  let string = world.pin(bob, 650, 60);
  string.stroke = '#555';

  // ---- a springy pair: low stiffness stretches, damping calms the wobble ----
  let a = new GameObject(560, 400, 40, { color: '#74c0fc', draggable: true });
  let b = new GameObject(660, 400, 40, { color: '#74c0fc', draggable: true });
  let spring = world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });
  spring.stroke = '#1c7ed6';
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Pull one of the blue boxes away from the other and let go.', 10, 20);
}
