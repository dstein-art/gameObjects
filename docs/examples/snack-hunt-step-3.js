// Mochi's Snack Hunt — step 3: three levels with the game manager
// Arrow keys or A / D to walk, Space, W or Up to jump. Eat every snack to finish a level.
// (The maps already show spikes ^, grumpies g and stoppers |. We add those in step 4.)

let TILE = 32;
let player;
let ground, snacks;
let waitUntil = 0; // a short pause before something happens
let afterWait = null;

// # ground   o snack   ^ spikes   g grumpy Mochi   | a grumpy turns around here   P start
let levels = [
  [
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '          o   o          ',
    '        #########        ',
    '                         ',
    '   o  o            o  o  ',
    '  ######        ######   ',
    '                         ',
    '                         ',
    ' P    o    o    o    o   ',
    '#########################',
    '#########################',
  ],
  [
    '                         ',
    '                         ',
    '                         ',
    '   o o o         o o o   ',
    '  #######       #######  ',
    '                         ',
    '          o o o          ',
    '         #######         ',
    '                         ',
    '  o                   o  ',
    ' ###    |  g    |    ### ',
    '        #########        ',
    ' P                       ',
    '####^^^###########^^^####',
    '#########################',
  ],
  [
    '                         ',
    '  o                   o  ',
    ' ###      o o o      ### ',
    '         #######         ',
    '                         ',
    '  |  g  |       |  g  |  ',
    '  #######       #######  ',
    '                         ',
    '           o o           ',
    '      ^^  #####  ^^      ',
    '     ####       ####     ',
    '                         ',
    ' P   o     |g   |   o    ',
    '######   ##########  ####',
    '######   ##########  ####',
  ],
];
let snackColors = ['#ffb3c6', '#ffd6a5', '#caffbf', '#bdb2ff', '#fdffb6'];

function setup() {
  createCanvas(800, 480);

  // groups are made once; their settings and rules last through world.clear()
  ground = new GameGroup({ isStatic: true, color: '#c9b79c', stroke: '#b09d80' });
  snacks = new GameGroup({ shape: 'circle', isStatic: true, isSensor: true, stroke: '#00000030' });

  gameManager.levels = levels.length; // finishing the last level wins the game
  gameManager.startGame(); // calls levelStarted(1)
}

// The game manager calls this for level 1, then 2, then 3
function levelStarted(level) {
  world.clear();
  afterWait = null;
  world.addWalls();

  let map = levels[level - 1]; // level 1 is levels[0]
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2;
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'o') snacks.create(x, y, 16, { color: random(snackColors) });
      if (ch === 'P') makePlayer(x, y);
    }
  }
  player.say('Level ' + level + '!', 1.5);
}

function makePlayer(x, y) {
  player = new Mochi(x, y, 30);
  player.onCollide(snacks, (me, snack) => {
    snack.destroy();
    gameManager.addScore(10);
    if (random() < 0.3) me.say(random(['Yum!', 'Nom!', 'Tasty!']), 0.8);
  });
}

function wait(frames, action) {
  waitUntil = frameCount + frames;
  afterWait = action;
}

function draw() {
  background('#fff8ef');
  if (!gameManager.isPlaying) return;

  // a short pause is running: wait for it to finish
  if (afterWait) {
    if (frameCount >= waitUntil) {
      let action = afterWait;
      afterWait = null;
      action();
    }
    return;
  }

  let direction = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) direction = -1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) direction = 1;
  player.walk(direction);

  // every snack eaten? celebrate for a second, then on to the next level
  if (snacks.length === 0) {
    player.walk(0);
    player.say('All done!', 1);
    wait(60, () => gameManager.endLevel());
  }
}

function drawOnTop() {
  fill(70);
  noStroke();
  textSize(15);
  textAlign(LEFT, TOP);
  text('Level ' + gameManager.level + ' of ' + gameManager.levels + '    Score: ' + gameManager.score, 12, 8);
  textAlign(RIGHT, TOP);
  text('Snacks left: ' + snacks.length, width - 12, 8);

  if (gameManager.won) {
    textAlign(CENTER, CENTER);
    textSize(46);
    text('You win!', width / 2, 130);
  }
}

function keyPressed() {
  if (key === ' ' || key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    if (gameManager.isPlaying && !afterWait) player.jump();
  }
}
