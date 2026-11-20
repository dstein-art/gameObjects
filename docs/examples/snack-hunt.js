// GameObjects — Mochi's Snack Hunt
// Arrow keys or A / D to walk, Space, W or Up to jump.
// Collect every snack to finish the level. Watch out for spikes, gaps and grumpy Mochis
// (you can stomp on them from above).
// Shows: the built-in Mochi character, levels drawn as text, and the game manager:
// score, lives, restarting a level, winning and losing.

let TILE = 32;
let player;
let ground, snacks, spikes, grumpies, stoppers;
let lives = 3;
let waitUntil = 0; // a short pause before something happens (after getting hurt, or finishing a level)
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
  spikes = new GameGroup({ shape: 'triangle', rotation: -90, isStatic: true, isSensor: true, color: '#adb5bd' });
  grumpies = new GameGroup();
  stoppers = new GameGroup({ isStatic: true, visible: false });

  // a grumpy Mochi turns around when it reaches a stopper
  grumpies.onCollide(stoppers, (grumpy) => {
    grumpy.data.direction *= -1;
  });

  gameManager.levels = levels.length;
  showTitle();
}

// The title screen: a Mochi waiting for you
function showTitle() {
  world.clear();
  new GameObject(400, 400, 800, 40, { isStatic: true, color: '#c9b79c', stroke: null });
  let mochi = new Mochi(400, 340, 72);
  mochi.say('Press any key to start!', 9999);
}

// gameManager.startGame() calls this, then levelStarted(1)
function gameStarted() {
  lives = 3;
  world.paused = false;
}

// The game manager calls this for level 1, 2, 3, and again after restartLevel()
function levelStarted(level) {
  world.clear();
  afterWait = null;
  let walls = world.addWalls();
  walls.bottom.destroy(); // the bottom is open: fall off and you lose a life

  let map = levels[level - 1];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2;
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'o') snacks.create(x, y, 16, { color: random(snackColors) });
      if (ch === '^') spikes.create(x, y + 4, TILE);
      if (ch === '|') stoppers.create(x, y, 6, TILE);
      if (ch === 'g') makeGrumpy(x, y);
      if (ch === 'P') makePlayer(x, y);
    }
  }
  for (let grumpy of grumpies) grumpy.watch(player); // they keep an eye on you
  player.say('Level ' + level + '!', 1.5);
}

function makePlayer(x, y) {
  player = new Mochi(x, y, 30);
  player.ignore(stoppers); // only grumpy Mochis turn at the stoppers

  // snacks: 10 points each
  player.onCollide(snacks, (me, snack) => {
    snack.destroy();
    gameManager.addScore(10);
    if (random() < 0.3) me.say(random(['Yum!', 'Nom!', 'Tasty!']), 0.8);
  });

  // spikes hurt
  player.onCollide(spikes, () => hurt());

  // grumpy Mochis: stomp on them from above, or get hurt
  player.onCollide(grumpies, (me, grumpy) => {
    if (me.y < grumpy.y - grumpy.height * 0.35) {
      grumpy.destroy();
      me.velocityY = -8; // bounce off
      gameManager.addScore(25);
      me.say('Boing!', 0.8);
    } else {
      hurt();
    }
  });
}

function makeGrumpy(x, y) {
  let grumpy = new Mochi(x, y, 30, {
    mood: 'angry',
    color: '#d6cdea',
    stroke: '#a99cc9',
    cheeks: false,
    naps: false,
    reactions: false,
    walkSpeed: 1.3,
  });
  grumpy.data.direction = random([-1, 1]);
  grumpies.add(grumpy);
}

// Losing a life: an "ouch" moment, then try the level again (or game over)
function hurt() {
  if (afterWait) return; // already hurt (or the level is finished)
  lives--;
  player.react('hurt', 2);
  player.say('Ouch!', 2);
  player.stop();
  wait(50, () => {
    if (lives > 0) gameManager.restartLevel(); // the snacks come back, and so does the score from this level
    else gameManager.endGame();
  });
}

function wait(frames, action) {
  waitUntil = frameCount + frames;
  afterWait = action;
}

// gameManager.endGame() calls this, or finishing the last level (won is true)
function gameEnded(won) {
  world.clear();
  new GameObject(400, 400, 800, 40, { isStatic: true, color: '#c9b79c', stroke: null });
  let mochi = new Mochi(400, 340, 72, { mood: won ? 'happy' : 'hurt' });
  mochi.say(won ? "I'm so full! Thank you!" : 'Oh no...', 9999);
}

function draw() {
  background('#fff8ef');

  if (gameManager.isPlaying) {
    // a short pause is running: wait for it to finish
    if (afterWait) {
      if (frameCount >= waitUntil) {
        let action = afterWait;
        afterWait = null;
        action();
      }
      return;
    }

    // walking
    let direction = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) direction = -1; // 65 is A
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) direction = 1; // 68 is D
    player.walk(direction);

    // the grumpy Mochis patrol back and forth
    for (let grumpy of grumpies) grumpy.walk(grumpy.data.direction);

    // fell off the bottom?
    if (player.y > height + 40) hurt();

    // every snack eaten? on to the next level
    if (snacks.length === 0) {
      player.walk(0);
      player.say('All done!', 1);
      player.react('happy', 1);
      wait(60, () => gameManager.endLevel());
    }
  }
}

function drawOnTop() {
  fill(70);
  noStroke();
  textAlign(CENTER, CENTER);

  if (gameManager.state === 'title') {
    textSize(46);
    text("Mochi's Snack Hunt", width / 2, 120);
    textSize(17);
    text('Eat every snack. Watch out for spikes, gaps and grumpy Mochis!', width / 2, 175);
    text('Arrow keys or A / D to walk  ·  Space, W or ↑ to jump  ·  stomp on grumpies', width / 2, 205);
    return;
  }

  if (gameManager.isOver) {
    textSize(46);
    text(gameManager.won ? 'You win!' : 'Game over', width / 2, 130);
    textSize(20);
    text('Score: ' + gameManager.score + '     Best: ' + gameManager.highScore, width / 2, 185);
    textSize(16);
    text('Press any key to play again', width / 2, 220);
    return;
  }

  // while playing: one line in each top corner, so the top of the level stays clear
  textSize(15);
  textAlign(LEFT, TOP);
  text('Level ' + gameManager.level + ' of ' + gameManager.levels + '    Score: ' + gameManager.score, 12, 8);
  textAlign(RIGHT, TOP);
  text('Snacks left: ' + snacks.length, width - 70, 8);
  fill('#ff6b81');
  text('♥'.repeat(max(lives, 0)), width - 12, 8);
}

function keyPressed() {
  if (!gameManager.isPlaying) {
    gameManager.startGame();
    return;
  }
  if (key === ' ' || key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    if (!afterWait) player.jump();
  }
}
