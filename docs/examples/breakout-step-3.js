// Breakout — Step 3: a Ball class that sits on the paddle and keeps its speed

let paddle;
let ball;
let launched = false;

// You can make your own kinds of GameObject by extending the class.
class Ball extends GameObject {
  constructor(x, y) {
    super(x, y, 16, {
      shape: 'circle',
      color: 'white',
      stroke: null,
      bounce: 1,
      friction: 0,
      airFriction: 0,
      fixedRotation: true,
    });
  }

  // update() runs every frame, before physics
  update() {
    if (!launched) {
      // ride on top of the paddle until launched
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

  ball = new Ball(width / 2, height - 60);
}

function draw() {
  background('#1e1e2e');
  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);

  // fell off the bottom? back onto the paddle
  if (ball.y > height + 30) launched = false;

  if (!launched) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text('Click to launch', width / 2, height / 2);
  }
}

function mousePressed() {
  if (!launched) {
    launched = true;
    ball.setVelocity(random(-3, 3), -6);
  }
}
