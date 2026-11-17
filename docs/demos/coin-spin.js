let coins, pops;
let spinFrames;
let popFrames = [];

async function setup() {
  createCanvas(640, 300);
  world.gravityY = 0;

  // a 6-frame spinning coin from a spritesheet
  let sheet = await loadImage('../assets/coin.png');
  spinFrames = GameObjects.spriteSheet(sheet, 24, 24);

  // a "pop" animation drawn in code: a ring that grows and fades
  for (let i = 0; i < 8; i++) {
    let g = createGraphics(64, 64);
    g.noFill();
    g.stroke(255, 200, 0, 255 - i * 30);
    g.strokeWeight(6 - i * 0.6);
    g.circle(32, 32, 12 + i * 7);
    popFrames.push(g);
  }

  coins = new GameGroup({ isStatic: true, isSensor: true });
  pops = new GameGroup({ isStatic: true, isSensor: true });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      let c = coins.create(80 + col * 68, 80 + row * 80, 36);
      c.addAnimation('spin', spinFrames, 5);
      c.animationFrame = (col + row) % 6; // don't all spin in step
    }
  }
}

function draw() {
  background('#212529');
  if (!coins) return;

  // remove pops that have finished playing
  for (let p of pops) {
    if (p.animationDone) p.destroy();
  }
}

function drawOnTop() {
  if (!coins) return;
  fill(255);
  noStroke();
  text('Click the coins. Coins loop. The pop plays once, then is destroyed.', 10, 20);
  text('pops alive: ' + pops.length, 10, 38);
}

function mousePressed() {
  if (!coins) return;
  for (let c of coins) {
    if (c.isMouseOver()) {
      let pop = pops.create(c.x, c.y, 64);
      pop.addAnimation('pop', popFrames, 3, false); // false = play once
      c.destroy();
    }
  }
}
