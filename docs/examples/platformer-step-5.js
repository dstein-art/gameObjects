// Platformer — Step 5: coins to collect

let player;
let platforms;
let coins;
let score = 0;

let LEVEL_WIDTH = 2400;

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5;

  platforms = new GameGroup({ isStatic: true, color: '#5b8c5a', friction: 0 });
  platforms.create(LEVEL_WIDTH / 2, height - 20, LEVEL_WIDTH, 40);
  platforms.create(350, 360, 200, 20);
  platforms.create(650, 280, 160, 20);
  platforms.create(950, 200, 200, 20);
  platforms.create(1300, 330, 260, 20);
  platforms.create(1650, 250, 180, 20);
  platforms.create(2000, 170, 220, 20);
  platforms.create(-20, height / 2, 40, height * 2);
  platforms.create(LEVEL_WIDTH + 20, height / 2, 40, height * 2);

  // ---- coins: sensors, so the player passes through them ----
  coins = new GameGroup({
    shape: 'circle',
    isStatic: true,
    isSensor: true,
    color: 'gold',
    stroke: '#b8860b',
    strokeWeight: 3,
  });
  // one coin above every small platform (they're 20 pixels tall)
  for (let p of platforms) {
    if (p.height === 20) coins.create(p.x, p.y - 45, 22);
  }

  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true,
    friction: 0,
    label: '•‿•',
    labelColor: 255,
  });

  // When the player touches any coin, collect it
  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    score++;
  });

  world.camera.follow(player, 0.1, 0, -60);
}

function draw() {
  background('#cfe8ff');

  let move = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1;
  player.velocityX = move * 6;
  if (move !== 0) player.flipX = move < 0;

  world.camera.x = constrain(world.camera.x, width / 2, LEVEL_WIDTH - width / 2);
  world.camera.y = min(world.camera.y, height / 2);

  // the score (drawn before the objects, so they can cover it up!)
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text('Coins: ' + score, 16, 16);
}

function keyPressed() {
  let jumpKey = key === ' ' || keyCode === UP_ARROW || key === 'w' || key === 'W';
  if (jumpKey && player.isTouching(platforms) && abs(player.velocityY) < 1) {
    player.velocityY = -13;
  }
}
