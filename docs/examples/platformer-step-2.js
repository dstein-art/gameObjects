// Platformer — Step 2: walking left and right

let player;
let ground;

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5;

  ground = new GameObject(width / 2, height - 20, width, 40, { isStatic: true, color: '#5b8c5a' });

  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true,
    friction: 0,
    label: '•‿•',
    labelColor: 255,
  });
}

function draw() {
  background('#cfe8ff');

  // ---- controls ----
  let move = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1; // 65 = A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1; // 68 = D
  player.velocityX = move * 6; // only sideways: gravity looks after up and down
  if (move !== 0) player.flipX = move < 0; // face the way we're going
}
