// Joints — Step 3: a pendulum

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

  // ---- a pendulum: a ball pinned to a point above it ----
  let bob = new GameObject(650, 260, 50, { shape: 'circle', color: '#f06595', draggable: true });
  let string = world.pin(bob, 650, 60);
  string.stroke = '#555';
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Drag the pink ball and let go.', 10, 20);
}
