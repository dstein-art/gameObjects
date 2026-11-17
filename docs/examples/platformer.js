// GameObjects — Platformer
// Arrow keys / A D to move, Space / W / Up to jump. Collect all the coins!

let player;
let platforms;
let coins;
let score = 0;

let LEVEL_WIDTH = 2400;

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5;

  // ---- platforms: a group of static boxes ----
  platforms = new GameGroup({ isStatic: true, color: '#5b8c5a', friction: 0 });
  platforms.create(LEVEL_WIDTH / 2, height - 20, LEVEL_WIDTH, 40); // floor
  platforms.create(350, 360, 200, 20);
  platforms.create(650, 280, 160, 20);
  platforms.create(950, 200, 200, 20);
  platforms.create(1300, 330, 260, 20);
  platforms.create(1650, 250, 180, 20);
  platforms.create(2000, 170, 220, 20);
  // walls at the ends of the level
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
  for (let p of platforms) {
    if (p.height === 20) coins.create(p.x, p.y - 45, 22);
  }

  // ---- the player ----
  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true, // players shouldn't tip over
    friction: 0,
    label: '•‿•',
    labelColor: 255,
  });

  // When the player touches any coin, collect it
  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    score++;
  });

  // The camera follows the player smoothly
  world.camera.follow(player, 0.1, 0, -60);
}

function draw() {
  background('#cfe8ff');

  // ---- controls ----
  let move = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1; // 65 = A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1; // 68 = D
  player.velocityX = move * 6;
  if (move !== 0) player.flipX = move < 0;

  // keep the camera inside the level
  world.camera.x = constrain(world.camera.x, width / 2, LEVEL_WIDTH - width / 2);
  world.camera.y = min(world.camera.y, height / 2);
}

// drawOnTop() runs after all the game objects are drawn,
// so the score is never hidden behind them
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text('Coins: ' + score, 16, 16);
  if (coins.length === 0) {
    textAlign(CENTER, CENTER);
    textSize(48);
    text('You got them all!', width / 2, height / 2);
  }
}

function keyPressed() {
  let jumpKey = key === ' ' || keyCode === UP_ARROW || key === 'w' || key === 'W';
  // Only jump when standing on a platform
  if (jumpKey && player.isTouching(platforms) && abs(player.velocityY) < 1) {
    player.velocityY = -13;
  }
}
