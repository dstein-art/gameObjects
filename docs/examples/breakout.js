// GameObjects — Breakout
// Move the mouse to steer the paddle. Click to start, and click to launch the ball.
// Shows: zero gravity, extending GameObject with your own class, group collisions,
// and the game manager: score, three levels, and the start and end of the game.

let paddle;
let ball;
let bricks;
let lives = 3;
let launched = false;
let ballSpeed = 7;

// Each level is a map of bricks: a digit is a brick (its color), a dot is a gap.
let levels = [
  [
    '0000000000',
    '1111111111',
    '2222222222',
  ],
  [
    '0.0.0.0.0.',
    '.1.1.1.1.1',
    '2222222222',
    '3.3.3.3.3.',
  ],
  [
    '0000000000',
    '1........1',
    '2.222222.2',
    '3.3....3.3',
    '4444444444',
  ],
];
let colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7'];

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
    this.speed = ballSpeed;
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
  ball = new Ball(width / 2, height - 60);

  // Any brick hit by the ball is destroyed, and is worth 10 points
  bricks.onCollide(ball, (brick) => {
    brick.destroy();
    gameManager.addScore(10);
  });

  // Steer the ball depending on where it hits the paddle
  ball.onCollide(paddle, (b) => {
    let offset = (b.x - paddle.x) / (paddle.width / 2); // -1 .. 1
    b.setVelocity(offset * 6, -6);
  });

  gameManager.levels = levels.length; // finishing the last level wins the game
}

// gameManager.startGame() calls this, then levelStarted(1)
function gameStarted() {
  lives = 3;
  world.paused = false;
}

// The game manager calls this at the start of every level: 1, 2, 3
function levelStarted(level) {
  bricks.destroyAll();
  let map = levels[level - 1];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      if (ch === '.') continue;
      bricks.create(35 + col * 59, 70 + row * 26, 56, 22, { color: colors[int(ch)] });
    }
  }
  ballSpeed = 6 + level; // a little faster every level
  launched = false;
}

// gameManager.endGame() calls this, or finishing the last level (won is true)
function gameEnded(won) {
  world.paused = true;
}

function draw() {
  background('#1e1e2e');

  paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);

  if (gameManager.isPlaying) {
    // fell off the bottom?
    if (ball.y > height + 30) {
      lives--;
      launched = false;
      if (lives <= 0) gameManager.endGame();
    }

    // every brick gone? on to the next level
    if (bricks.length === 0) gameManager.endLevel();
  }
}

// the score and messages, drawn on top of the game objects
function drawOnTop() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  if (gameManager.state === 'title') {
    textSize(48);
    text('BREAKOUT', width / 2, height / 2 - 40);
    textSize(18);
    text('Move the mouse to steer. Click to start.', width / 2, height / 2 + 20);
    return;
  }

  textSize(16);
  textAlign(LEFT, TOP);
  text('Score: ' + gameManager.score, 12, 12);
  text('Level ' + gameManager.level + ' of ' + gameManager.levels, 12, 34);
  textAlign(RIGHT, TOP);
  text('Lives: ' + max(lives, 0), width - 12, 12);

  textAlign(CENTER, CENTER);
  if (gameManager.isOver) {
    textSize(36);
    text(gameManager.won ? 'You win!' : 'Game over', width / 2, height / 2 - 20);
    textSize(18);
    text('Score: ' + gameManager.score + '   Best: ' + gameManager.highScore, width / 2, height / 2 + 20);
    text('Click to play again', width / 2, height / 2 + 50);
  } else if (!launched) {
    textSize(22);
    text('Level ' + gameManager.level, width / 2, height / 2);
    textSize(16);
    text('Click to launch', width / 2, height / 2 + 30);
  }
}

function mousePressed() {
  if (!gameManager.isPlaying) {
    gameManager.startGame(); // from the title screen, or after the game ends
  } else if (!launched) {
    launched = true;
    ball.setVelocity(random(-3, 3), -6);
  }
}
