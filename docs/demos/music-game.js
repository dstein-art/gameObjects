let player, ground, coins;
let music, coinSound, jumpSound;
let score = 0;
let playing = false;

async function setup() {
  createCanvas(640, 340);
  world.gravityY = 1.5;
  world.addWalls();

  music = await loadSound('../assets/music.wav');
  coinSound = await loadSound('../assets/coin.wav');
  jumpSound = await loadSound('../assets/jump.wav');

  ground = new GameGroup({ isStatic: true, color: '#5c940d', friction: 0 });
  ground.create(320, 325, 640, 30);
  ground.create(160, 230, 140, 14);
  ground.create(480, 230, 140, 14);
  ground.create(320, 140, 140, 14);

  coins = new GameGroup({ shape: 'circle', isStatic: true, isSensor: true, color: 'gold', stroke: '#b8860b' });
  spawnCoins();

  player = new GameObject(320, 280, 30, 40, { color: 'tomato', fixedRotation: true, friction: 0, cornerRadius: 6 });
  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    coinSound.play();
    score++;
    if (coins.length === 0) spawnCoins();
  });

  world.paused = true; // wait for a click
}

function spawnCoins() {
  for (let g of ground) {
    for (let i = -1; i <= 1; i++) coins.create(g.x + i * 40, g.y - 40, 18);
  }
}

function draw() {
  background('#e3fafc');
  if (!player) return;

  player.velocityX = 0;
  if (keyIsDown(LEFT_ARROW)) player.velocityX = -5;
  if (keyIsDown(RIGHT_ARROW)) player.velocityX = 5;
}

function drawOnTop() {
  if (!player) return;
  fill(0);
  noStroke();
  textSize(16);
  text('Coins: ' + score + '     M = music on/off', 10, 24);
  if (!playing) {
    textAlign(CENTER, CENTER);
    textSize(28);
    text('Click to start', width / 2, height / 2 - 40);
  }
}

function startGame() {
  userStartAudio();
  playing = true;
  world.paused = false;
  music.amp(0.3);
  if (!music.isPlaying()) music.loop();
}

function mousePressed() {
  if (!playing && player) startGame();
}

function keyPressed() {
  if (!player) return;
  if (!playing) startGame();
  if ((key === ' ' || keyCode === UP_ARROW) && player.isTouching(ground)) {
    player.velocityY = -12;
    jumpSound.play();
  }
  if (key === 'm' || key === 'M') {
    music.isPlaying() ? music.stop() : music.loop();
  }
}
