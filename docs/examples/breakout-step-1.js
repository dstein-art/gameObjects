// Breakout — Step 1: no gravity, walls and a paddle

let paddle;

function setup() {
  createCanvas(600, 600);
  world.gravityY = 0; // no gravity in breakout

  // walls on three sides; the bottom is open
  let walls = world.addWalls({ bounce: 1, friction: 0 });
  walls.bottom.destroy();

  paddle = new GameObject(width / 2, height - 40, 100, 16, {
    isStatic: true, // we move it ourselves, physics never does
    color: '#4ecdc4',
    stroke: null,
    cornerRadius: 8,
    bounce: 1,
    friction: 0,
  });
}

function draw() {
  background('#1e1e2e');

  // the paddle follows the mouse, but stays on the screen
  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);
}
