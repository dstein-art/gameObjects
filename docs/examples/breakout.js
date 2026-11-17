// GameObjects — Breakout
// Move the mouse to steer the paddle. Click to launch the ball.
// Shows: zero gravity, extending GameObject with your own class, group collisions.

let paddle;
let ball;
let bricks;
let lives = 3;
let launched = false;

// You can make your own kinds of GameObject by extending the class.
class Ball extends GameObject {
  constructor(x, y) {
    super(x, y, 16, {
      shape: 'circle',
      color: 'white',
      stroke: null,
      bounce: 1, // perfectly bouncy
      friction: 0,
      airFriction: 0,
      fixedRotation: true,
    });
  }

  // update() runs every frame, before physics
  update() {
    if (!launched) {
      this.setPosition(paddle.x, paddle.y - 20);
      this.stop();
      return;
    }
    // keep a steady speed, and never let it go perfectly flat
    if (abs(this.velocityY) < 2) this.velocityY = this.velocityY < 0 ? -2 : 2;
    this.speed = 7;
  }
}

function setup() {
  createCanvas(600, 600);
  world.gravityY = 0; // no gravity in breakout

  let walls = world.addWalls({ bounce: 1, friction: 0 });
  walls.bottom.destroy(); // the bottom is open — that's how you lose a life

  paddle = new GameObject(width / 2, height - 40, 100, 16, {
    isStatic: true,
    color: '#4ecdc4',
    stroke: null,
    cornerRadius: 8,
    bounce: 1,
    friction: 0,
  });

  bricks = new GameGroup({ isStatic: true, bounce: 1, friction: 0, stroke: '#222', strokeWeight: 2 });
  let colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      bricks.create(35 + col * 59, 70 + row * 26, 56, 22, { color: colors[row] });
    }
  }

  ball = new Ball(width / 2, height - 60);

  // Any brick hit by the ball is destroyed
  bricks.onCollide(ball, (brick) => brick.destroy());

  // Steer the ball depending on where it hits the paddle
  ball.onCollide(paddle, (b) => {
    let offset = (b.x - paddle.x) / (paddle.width / 2); // -1 .. 1
    b.setVelocity(offset * 6, -6);
  });
}

function draw() {
  background('#1e1e2e');

  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);

  // fell off the bottom?
  if (ball.y > height + 30) {
    lives--;
    launched = false;
  }

  // game over, or every brick gone? freeze everything
  if (lives <= 0 || bricks.length === 0) world.paused = true;
}

// the score and messages, drawn on top of the game objects
function drawOnTop() {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text('Lives: ' + max(lives, 0) + '   Bricks: ' + bricks.length, 12, 12);

  textAlign(CENTER, CENTER);
  textSize(32);
  if (lives <= 0) {
    text('Game over — reload to play again', width / 2, height / 2);
  } else if (bricks.length === 0) {
    text('You win!', width / 2, height / 2);
  } else if (!launched) {
    textSize(18);
    text('Click to launch', width / 2, height / 2);
  }
}

function mousePressed() {
  if (!launched && lives > 0) {
    launched = true;
    ball.setVelocity(random(-3, 3), -6);
  }
}
