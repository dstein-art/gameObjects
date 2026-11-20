// Mochi's Snack Hunt — step 2: snacks and a score
// Arrow keys or A / D to walk, Space, W or Up to jump.

let TILE = 32;
let player;
let ground, snacks;

// # ground   o snack   P where Mochi starts
let map = [
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
];
let snackColors = ['#ffb3c6', '#ffd6a5', '#caffbf', '#bdb2ff', '#fdffb6'];

function setup() {
  createCanvas(800, 480);
  world.addWalls();

  ground = new GameGroup({ isStatic: true, color: '#c9b79c', stroke: '#b09d80' });
  // snacks are sensors: Mochi passes through them, but we still hear about the touch
  snacks = new GameGroup({ shape: 'circle', isStatic: true, isSensor: true, stroke: '#00000030' });

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2;
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'o') snacks.create(x, y, 16, { color: random(snackColors) });
      if (ch === 'P') player = new Mochi(x, y, 30);
    }
  }

  // snacks: 10 points each
  player.onCollide(snacks, (me, snack) => {
    snack.destroy();
    gameManager.addScore(10);
    if (random() < 0.3) me.say(random(['Yum!', 'Nom!', 'Tasty!']), 0.8);
  });
}

function draw() {
  background('#fff8ef');

  let direction = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) direction = -1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) direction = 1;
  player.walk(direction);
}

function drawOnTop() {
  fill(70);
  noStroke();
  textSize(15);
  textAlign(LEFT, TOP);
  text('Score: ' + gameManager.score, 12, 8);
  textAlign(RIGHT, TOP);
  text('Snacks left: ' + snacks.length, width - 12, 8);
}

function keyPressed() {
  if (key === ' ' || key === 'w' || key === 'W' || keyCode === UP_ARROW) player.jump();
}
