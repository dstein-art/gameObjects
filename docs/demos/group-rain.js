let drops;
let ground;
let splashes = 0;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0.4;

  ground = new GameObject(320, 310, 640, 20, { isStatic: true, color: '#5c940d' });
  new GameObject(220, 200, 140, 14, { isStatic: true, color: '#868e96', rotation: -12 });
  new GameObject(470, 140, 140, 14, { isStatic: true, color: '#868e96', rotation: 15 });

  // a little air friction, so the drops fall at a steady speed like real rain
  drops = new GameGroup({ shape: 'circle', color: '#4dabf7', stroke: null, showRotation: false, airFriction: 0.02 });

  // one rule for the whole group: any drop that hits the ground disappears
  drops.onCollide(ground, (drop) => {
    drop.destroy();
    splashes++;
  });
}

function draw() {
  background('#e7f5ff');
  if (frameCount % 4 === 0) {
    drops.create(random(width), -10, random(6, 12));
  }
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Drops falling: ' + drops.length + '    Splashes: ' + splashes, 10, 20);
}
