// Platformer — Step 1: a floor and a player

let player;
let ground;

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5; // a bit stronger than normal: snappier jumps

  ground = new GameObject(width / 2, height - 20, width, 40, { isStatic: true, color: '#5b8c5a' });

  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true, // players shouldn't tip over
    friction: 0, // and shouldn't stick to walls
    label: '•‿•',
    labelColor: 255,
  });
}

function draw() {
  background('#cfe8ff');
}
