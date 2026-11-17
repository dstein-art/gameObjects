// Breakout — Step 2: a bouncing ball

let paddle;
let ball;

function setup() {
  createCanvas(600, 600);
  world.gravityY = 0;

  let walls = world.addWalls({ bounce: 1, friction: 0 });
  walls.bottom.destroy();

  paddle = new GameObject(width / 2, height - 40, 100, 16, {
    isStatic: true,
    color: '#4ecdc4',
    stroke: null,
    cornerRadius: 8,
    bounce: 1,
    friction: 0,
  });

  ball = new GameObject(width / 2, height - 60, 16, {
    shape: 'circle',
    color: 'white',
    stroke: null,
    bounce: 1, // perfectly bouncy
    friction: 0, // no grip on the walls
    airFriction: 0, // never slows down
    fixedRotation: true,
  });
}

function draw() {
  background('#1e1e2e');
  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);
}

function drawOnTop() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  if (ball.y > height + 30) text('Missed! Press ▶ above the code (or reload) to try again', width / 2, height / 2);
}

function mousePressed() {
  // launch the ball up and a little sideways
  ball.setVelocity(random(-3, 3), -6);
}
