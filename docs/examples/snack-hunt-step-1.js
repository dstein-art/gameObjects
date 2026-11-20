// Mochi's Snack Hunt — step 1: Mochi on a level
// Arrow keys or A / D to walk, Space, W or Up to jump.

let TILE = 32;
let player;
let ground;

// # ground   P where Mochi starts
let map = [
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '        #########        ',
  '                         ',
  '                         ',
  '  ######        ######   ',
  '                         ',
  '                         ',
  ' P                       ',
  '#########################',
  '#########################',
];

function setup() {
  createCanvas(800, 480);
  world.addWalls();

  ground = new GameGroup({ isStatic: true, color: '#c9b79c', stroke: '#b09d80' });

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2; // the centre of this tile
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'P') player = new Mochi(x, y, 30);
    }
  }
  player.say('Hi! I am Mochi');
}

function draw() {
  background('#fff8ef');

  let direction = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) direction = -1; // 65 is A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) direction = 1; // 68 is D
  player.walk(direction);
}

function keyPressed() {
  if (key === ' ' || key === 'w' || key === 'W' || keyCode === UP_ARROW) player.jump();
}
