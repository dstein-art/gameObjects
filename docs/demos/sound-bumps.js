let balls;
let bumpSound;

async function setup() {
  createCanvas(640, 320);
  world.addWalls();
  new GameObject(320, 310, 640, 20, { isStatic: true, color: 90 });

  bumpSound = await loadSound('../assets/bump.wav');

  balls = new GameGroup({ shape: 'circle', bounce: 0.7, draggable: true });

  // every time a ball hits anything...
  balls.onCollide((ball) => {
    let volume = constrain(ball.speed / 10, 0, 1); // hard hit = loud
    if (volume < 0.05) return; // ignore tiny touches
    bumpSound.amp(volume);
    bumpSound.rate(map(ball.width, 10, 80, 1.8, 0.6)); // big = low pitch
    bumpSound.play();
  });

  for (let i = 0; i < 5; i++) balls.create(random(60, 580), random(40, 150), random(15, 70));
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('Click to turn on sound. Drag and throw the balls. Big balls sound lower, hard hits are louder.', 10, 20);
}

function mousePressed() {
  userStartAudio();
}
