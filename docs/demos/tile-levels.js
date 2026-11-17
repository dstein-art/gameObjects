// Levels drawn as text. # = ground, o = coin, P = player start, E = exit, ^ = spikes
let levels = [
  [
    '                    ',
    '                    ',
    '                    ',
    '             o o   E',
    '            ########',
    '                    ',
    '      o o           ',
    '     #####          ',
    '  P        ^^   o   ',
    '####################',
    '####################',
  ],
  [
    '                    ',
    '                    ',
    ' o o            o  E',
    '####           #####',
    '                    ',
    '      o   o         ',
    '    ##########  ### ',
    '                    ',
    'P     ^^^^^^     o  ',
    '####################',
    '####################',
  ],
  [
    '                   E',
    '                ####',
    '                    ',
    '  o o        o      ',
    ' #####      ###     ',
    '                    ',
    '        o           ',
    '       ###      ### ',
    ' P   ^^^   ^^^      ',
    '####################',
    '####################',
  ],
];

let TILE = 32;
let ground, coins, spikes, player, exit;
let startX, startY;

function setup() {
  createCanvas(640, 352);
  world.gravityY = 1.4;

  // groups are made once and keep their settings and rules
  ground = new GameGroup({ isStatic: true, color: '#8d6e63', stroke: '#5d4037', friction: 0 });
  coins = new GameGroup({ shape: 'circle', isStatic: true, isSensor: true, color: 'gold', stroke: '#b8860b', strokeWeight: 2 });
  spikes = new GameGroup({ shape: 'triangle', rotation: -90, isStatic: true, isSensor: true, color: '#adb5bd' });

  gameManager.levels = levels.length; // finishing the last level wins the game
  gameManager.startGame();
}

// The game manager calls this at the start of every level: 1, 2, 3...
function levelStarted(level) {
  buildLevel(levels[level - 1]);
}

function buildLevel(map) {
  world.clear();
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2;
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'o') coins.create(x, y, TILE / 2);
      if (ch === '^') spikes.create(x, y + 4, TILE);
      if (ch === 'E') exit = new GameObject(x, y, TILE, TILE, { isStatic: true, isSensor: true, color: '#69db7c', label: 'EXIT', labelSize: 9 });
      if (ch === 'P') {
        startX = x;
        startY = y;
      }
    }
  }
  player = new GameObject(startX, startY, 22, 28, { color: 'tomato', fixedRotation: true, friction: 0, cornerRadius: 5 });
  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    gameManager.addScore(1);
  });
}

function respawn() {
  player.setPosition(startX, startY);
  player.stop();
}

function draw() {
  background('#e7f5ff');

  if (gameManager.isPlaying) {
    player.velocityX = 0;
    if (keyIsDown(LEFT_ARROW)) player.velocityX = -4;
    if (keyIsDown(RIGHT_ARROW)) player.velocityX = 4;

    // rules (checked here in draw, not inside a callback)
    if (player.isTouching(spikes) || player.y > height + 50) respawn();
    if (player.isTouching(exit) && coins.length === 0) gameManager.endLevel();
    exit.opacity = coins.length === 0 ? 255 : 90; // the exit lights up when it's open
  }
}

// the score and messages, drawn on top of the level
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(15);
  textAlign(LEFT, TOP);
  text('Level ' + gameManager.level + ' of ' + levels.length + '    Coins left: ' + coins.length + '    Score: ' + gameManager.score, 10, 8);
  text('Arrows to move, up/space to jump. Collect every coin to open the exit.', 10, 28);
  if (gameManager.won) {
    textAlign(CENTER, CENTER);
    textSize(36);
    text('You finished every level!', width / 2, height / 2 - 40);
    textSize(16);
    text('Press R to play again', width / 2, height / 2);
  }
}

function keyPressed() {
  if ((key === ' ' || keyCode === UP_ARROW) && player.isTouching(ground)) {
    player.velocityY = -10.5;
  }
  if ((key === 'r' || key === 'R') && gameManager.isOver) gameManager.startGame();
}
