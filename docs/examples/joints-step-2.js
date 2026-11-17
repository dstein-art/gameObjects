// Joints — Step 2: pin the ends to make a bridge

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
  // pin the outside end of the first and last planks to the world
  world.pin(planks.first, planks.first.x - plankW / 2, bridgeY, { offset: { x: -plankW / 2, y: 0 } });
  world.pin(planks.last, planks.last.x + plankW / 2, bridgeY, { offset: { x: plankW / 2, y: 0 } });
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('A rope bridge! Drag the planks.', 10, 20);
}
