let player, coins, water, goal;
let score = 0;
let message = '';

function setup() {
  createCanvas(640, 340);
  world.gravityY = 0;
  world.addWalls();

  // a pool of water: a sensor area that slows you down
  water = new GameObject(430, 210, 220, 160, {
    isSensor: true,
    isStatic: true,
    color: [116, 192, 252, 120],
    stroke: null,
    label: 'water',
    depth: -1,
  });

  // the finish zone
  goal = new GameObject(590, 60, 70, 70, {
    isSensor: true,
    isStatic: true,
    color: [105, 219, 124, 150],
    stroke: null,
    label: 'goal',
    depth: -1,
  });

  coins = new GameGroup({ shape: 'circle', isSensor: true, isStatic: true, color: 'gold', stroke: '#b8860b' });
  for (let i = 0; i < 10; i++) coins.create(random(60, 560), random(60, 300), 18);

  // a solid wall in the middle
  new GameObject(230, 200, 20, 200, { isStatic: true, color: 90 });

  player = new GameObject(60, 280, 30, { shape: 'circle', color: 'tomato', fixedRotation: true });

  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    score++;
  });
  player.onCollide(goal, () => (message = coins.length === 0 ? 'You win!' : 'Collect all the coins first!'));
  player.onCollideEnd(goal, () => (message = ''));
}

function draw() {
  background(250);

  let speed = player.isTouching(water) ? 1.5 : 4; // slower in water
  let vx = 0;
  let vy = 0;
  if (keyIsDown(LEFT_ARROW)) vx = -speed;
  if (keyIsDown(RIGHT_ARROW)) vx = speed;
  if (keyIsDown(UP_ARROW)) vy = -speed;
  if (keyIsDown(DOWN_ARROW)) vy = speed;
  player.setVelocity(vx, vy);
}

function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Arrow keys · coins and water are sensors, the grey wall is solid', 10, 20);
  text('Coins: ' + score + '   In water: ' + player.isTouching(water), 10, 38);
  textSize(22);
  text(message, 10, 70);
}
