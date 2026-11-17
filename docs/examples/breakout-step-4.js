// Breakout — Step 4: a wall of bricks

let paddle;
let ball;
let bricks;
let launched = false;

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

  update() {
    if (!launched) {
      this.setPosition(paddle.x, paddle.y - 20);
      this.stop();
      return;
    }
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

  // 5 rows of 10 bricks, one colour per row
  bricks = new GameGroup({ isStatic: true, bounce: 1, friction: 0, stroke: '#222', strokeWeight: 2 });
  let colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      bricks.create(35 + col * 59, 70 + row * 26, 56, 22, { color: colors[row] });
    }
  }

  ball = new Ball(width / 2, height - 60);

  // One rule for the whole group: any brick hit by the ball is destroyed
  bricks.onCollide(ball, (brick) => brick.destroy());
}

function draw() {
  background('#1e1e2e');
  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);

  if (ball.y > height + 30) launched = false;
}

function drawOnTop() {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text('Bricks: ' + bricks.length, 12, 12);
  if (!launched) {
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
