let ball, pad;
let starts = 0;
let ends = 0;
let touchingFrames = 0;

function setup() {
  createCanvas(640, 320);
  world.addWalls();

  pad = new GameObject(320, 300, 300, 24, { isStatic: true, color: '#adb5bd', label: 'pad' });
  ball = new GameObject(320, 60, 44, { shape: 'circle', color: 'gold', bounce: 0.7, draggable: true });

  // once, when they start touching
  ball.onCollide(pad, () => {
    starts++;
    pad.color = 'tomato';
  });

  // once, when they stop touching
  ball.onCollideEnd(pad, () => {
    ends++;
    pad.color = '#adb5bd';
  });

  // every frame while touching
  ball.whileTouching(pad, () => {
    touchingFrames++;
  });
}

function draw() {
  background(245);
  fill(0);
  noStroke();
  text('Drag the ball and drop it on the pad', 10, 20);
  text('onCollide: ' + starts, 10, 50);
  text('onCollideEnd: ' + ends, 10, 68);
  text('whileTouching frames: ' + touchingFrames, 10, 86);
  text('isTouching(pad): ' + ball.isTouching(pad), 10, 104);
}
