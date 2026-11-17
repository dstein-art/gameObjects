# Breakout

The classic: a paddle, a bouncing ball and a wall of bricks. Along the way you'll write your first class that **extends GameObject**.
{: .lead }

**You'll learn:** zero gravity · perfectly bouncy objects · controlling a static object with the mouse · making your own class with `update()` · group collisions · lives and winning

## Play the finished game

Move the mouse to steer the paddle and click to launch the ball. Break all the bricks!

[[demo: examples/breakout | 600x600]]

## Step 1: No gravity, walls and a paddle

Breakout has no gravity: the ball should fly in straight lines. We turn gravity off with `world.gravityY = 0`. `world` is an object that GameObjects creates automatically, holding all the objects and the physics settings.

The walls make the ball bounce, so they're perfectly bouncy (`bounce: 1`) with no friction. The bottom wall is removed: that's where you lose the ball.

```js
world.gravityY = 0; // no gravity in breakout

let walls = world.addWalls({ bounce: 1, friction: 0 });
walls.bottom.destroy();
```

The paddle is **static**, so the ball can't push it around, but we can move it ourselves. `constrain()` keeps it on the screen:

```js
paddle.x = constrain(mouseX, paddle.width / 2, width - paddle.width / 2);
```

[[demo: examples/breakout-step-1 | 600x600]]

## Step 2: A bouncing ball

The ball needs three settings to bounce forever without losing speed:

- `bounce: 1` keeps all its speed when it hits something.
- `friction: 0` stops it gripping and spinning when it hits a wall at an angle.
- `airFriction: 0` stops it slowing down as it moves.

```js
ball = new GameObject(width / 2, height - 60, 16, {
  shape: 'circle',
  color: 'white',
  stroke: null,
  bounce: 1,
  friction: 0,
  airFriction: 0,
  fixedRotation: true,
});
```

Clicking launches it, up and a little to one side:

```js
function mousePressed() {
  ball.setVelocity(random(-3, 3), -6);
}
```

The "Missed!" message is drawn in `drawOnTop()`, which GameObjects runs after it draws the ball, paddle and bricks, so messages are always on top:

```js
function drawOnTop() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  if (ball.y > height + 30) text('Missed! Press ▶ above the code (or reload) to try again', width / 2, height / 2);
}
```

[[demo: examples/breakout-step-2 | 600x600]]

Two problems: the ball sits in the middle of nowhere before it's launched, and once it's gone, it's gone. Over time it can also speed up or slow down a little, or get stuck bouncing almost flat.

## Step 3: A Ball class

When an object needs its own **behaviour**, make a class that `extends GameObject`. The class gets everything a GameObject has, and its `update()` method runs every frame, just before the physics step.

Our `Ball`:

- **before launch**, sits on top of the paddle (`setPosition`) and doesn't move (`stop()`);
- **after launch**, never travels too flat and always moves at `speed` 7.

```js
class Ball extends GameObject {
  constructor(x, y) {
    super(x, y, 16, { shape: 'circle', color: 'white', /* ... */ });
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
```

A `launched` variable tracks whether the ball is in play. When the ball falls off the bottom, it goes back to `false`, and the ball returns to the paddle.

[[demo: examples/breakout-step-3 | 600x600]]

## Step 4: A wall of bricks

Two nested loops make 5 rows of 10 bricks, with one color per row. The bricks share their settings through the group's defaults.

```js
bricks = new GameGroup({ isStatic: true, bounce: 1, friction: 0, stroke: '#222', strokeWeight: 2 });
let colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7'];
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 10; col++) {
    bricks.create(35 + col * 59, 70 + row * 26, 56, 22, { color: colors[row] });
  }
}
```

Now the most important line in the game. **One rule for the whole group**: any brick the ball hits is destroyed. The callback is given the brick that was hit.

```js
bricks.onCollide(ball, (brick) => brick.destroy());
```

The ball still bounces off the brick before it disappears, because destroying happens safely after the collision.

[[demo: examples/breakout-step-4 | 600x600]]

## Step 5: Steering with the paddle

In real Breakout, where the ball hits the paddle decides where it goes: the left end sends it left, the right end sends it right. When the ball hits the paddle, we work out how far from the centre it landed, as a number from -1 to 1, and set a new velocity:

```js
ball.onCollide(paddle, (b) => {
  let offset = (b.x - paddle.x) / (paddle.width / 2); // -1 .. 1
  b.setVelocity(offset * 6, -6);
});
```

[[demo: examples/breakout-step-5 | 600x600]]

## Step 6: Lives, winning and losing (the finished game)

The finishing touches:

- A `lives` counter that goes down each time the ball falls off the bottom.
- **Game over** when lives run out, and **You win!** when `bricks.length` is `0`. Either way, `world.paused = true` freezes everything.
- Clicking only launches while you still have lives.

The rules go in `draw()`, and the messages go in `drawOnTop()`:

```js
function draw() {
  ...
  if (ball.y > height + 30) {
    lives--;
    launched = false;
  }
  if (lives <= 0 || bricks.length === 0) world.paused = true;
}

function drawOnTop() {
  ...
  if (lives <= 0) {
    text('Game over — reload to play again', width / 2, height / 2);
  } else if (bricks.length === 0) {
    text('You win!', width / 2, height / 2);
  }
}
```

[[demo: examples/breakout | 600x600]]

## Make it your own

- **Tough bricks:** give the top row `data.hits = 2`, and only destroy a brick when its hits run out (change its color each hit).
- **Power-ups:** sometimes drop a sensor from a destroyed brick. Catching it with the paddle makes the paddle wider with `paddle.width = 150`.
- **Sound:** a blip for the paddle and a crunch for bricks (see [Sounds](sounds.html)).
- **Restart:** press **R** to rebuild the bricks and reset lives, instead of reloading (see [Levels and Score](levels-score.html#starting-again)).
