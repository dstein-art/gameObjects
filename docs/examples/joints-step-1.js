// Joints — Step 1: planks joined end to end

function setup() {
  createCanvas(800, 500);
  world.addWalls();

  // ---- a row of planks, each one connected to the one before ----
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
  // Nothing holds the ends up yet, so the whole chain falls!
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('The planks are joined, but nothing holds them up. Drag them around.', 10, 20);
}
