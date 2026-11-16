let rocks;
let player;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0;

  rocks = new GameGroup({ shape: 'polygon', sides: 6, color: '#adb5bd', isStatic: true });
  for (let i = 0; i < 12; i++) {
    rocks.create(random(40, 600), random(60, 290), random(24, 44), { rotation: random(360) });
  }

  // the player follows the mouse and passes through rocks
  player = new GameObject(320, 160, 24, { shape: 'circle', color: 'tomato', isSensor: true });
}

function draw() {
  background(250);
  player.setPosition(mouseX, mouseY);

  // reset every rock, then highlight the closest one
  rocks.set({ color: '#adb5bd' });
  let nearest = rocks.closestTo(player);
  if (nearest) {
    nearest.color = 'gold';
    stroke('tomato');
    line(player.x, player.y, nearest.x, nearest.y);
  }

  noStroke();
  fill(0);
  text('Move the mouse: the closest rock lights up. Click a rock to destroy it.', 10, 20);
}

function mousePressed() {
  for (let rock of rocks) {
    if (rock.isMouseOver()) rock.destroy();
  }
}
