# Platformer

Run, jump and collect every coin in a level three screens wide. This is the classic game shape that Mario made famous, and most of it takes surprisingly little code.
{: .lead }

**You'll learn:** player settings · walking with the keyboard · jumping only on the ground · platforms in a group · a camera that follows the player · coins as sensors · `drawOnTop()` for the score

## Play the finished game

Arrow keys or **A**/**D** to move, **Space**, **W** or **↑** to jump. Click the game first so it can hear the keyboard.

[[demo: examples/platformer | 800x500 | keys]]

## Step 1: A floor and a player

We start with stronger gravity than normal (`1.5`), which makes jumps feel snappier. The player is a box with three important settings:

- `fixedRotation: true` keeps the player upright. Without it, they'd tip over the first time they bump into something.
- `friction: 0` stops the player sticking to the sides of platforms when pushing against them in mid-air.
- A `label` gives it a face. Later, `flipX` will mirror it.

```js
world.gravityY = 1.5;

player = new GameObject(100, 300, 36, 50, {
  color: '#e2574c',
  cornerRadius: 6,
  fixedRotation: true,
  friction: 0,
  label: '•‿•',
  labelColor: 255,
});
```

[[demo: examples/platformer-step-1 | 800x500]]

## Step 2: Walking

Walking is something you *hold*, so we check the keys every frame in `draw()` with `keyIsDown()`. We work out a direction, `-1`, `0` or `1`, and set only the **sideways** velocity, leaving `velocityY` to gravity:

```js
let move = 0;
if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1; // 65 = A
if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1; // 68 = D
player.velocityX = move * 6;
if (move !== 0) player.flipX = move < 0; // face the way we're going
```

[[demo: examples/platformer-step-2 | 800x500 | keys]]

## Step 3: Platforms and jumping

We make the floor and two floating platforms with a **group**. Their shared settings go in the group's defaults, and the group lets us ask "is the player touching *any* platform?"

```js
platforms = new GameGroup({ isStatic: true, color: '#5b8c5a', friction: 0 });
platforms.create(width / 2, height - 20, width, 40); // the floor is a platform too
platforms.create(350, 360, 200, 20);
platforms.create(650, 280, 160, 20);
```

A jump happens *once* per key press, so it goes in `keyPressed()`. You can only jump while standing on a platform, and not while already moving up or down. That stops double jumps and wall-climbing:

```js
function keyPressed() {
  let jumpKey = key === ' ' || keyCode === UP_ARROW || key === 'w' || key === 'W';
  if (jumpKey && player.isTouching(platforms) && abs(player.velocityY) < 1) {
    player.velocityY = -13;
  }
}
```

[[demo: examples/platformer-step-3 | 800x500 | keys]]

> **Try it:** change `-13` to `-18` for a super jump, or `world.gravityY` to `0.5` for the moon.

## Step 4: A bigger level and a camera

A level can be much wider than the canvas. We make it `LEVEL_WIDTH` (2400) pixels wide, with more platforms and a wall at each end.

The **camera** decides which part of the world we see. `follow()` makes it chase the player smoothly: `0.1` means it closes 10% of the gap each frame. The offset of `-60` makes it look a little above the player.

```js
world.camera.follow(player, 0.1, 0, -60);
```

Then, every frame, we stop the camera showing empty space past the ends of the level, or below the floor:

```js
world.camera.x = constrain(world.camera.x, width / 2, LEVEL_WIDTH - width / 2);
world.camera.y = min(world.camera.y, height / 2);
```

[[demo: examples/platformer-step-4 | 800x500 | keys]]

## Step 5: Coins

Coins should be collected, not bumped into, so they're **sensors**: the player passes through them, but GameObjects still notices the touch. They're also static, so they float in place. A loop puts a coin above every small platform (the 20-pixel-tall ones):

```js
coins = new GameGroup({
  shape: 'circle', isStatic: true, isSensor: true,
  color: 'gold', stroke: '#b8860b', strokeWeight: 3,
});
for (let p of platforms) {
  if (p.height === 20) coins.create(p.x, p.y - 45, 22);
}
```

When the player touches **any** coin, `onCollide` tells us **which** one, so we can destroy it and add to the score:

```js
player.onCollide(coins, (me, coin) => {
  coin.destroy();
  score++;
});
```

The score goes in **`drawOnTop()`**. GameObjects calls it every frame **after** all the game objects are drawn, so the score is always on top. It's in screen space too, so it stays in the corner while the camera moves:

```js
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text('Coins: ' + score, 16, 16);
}
```

[[demo: examples/platformer-step-5 | 800x500 | keys]]

## Step 6: Collecting every coin (the finished game)

When `coins.length` reaches `0`, every coin has been collected. We add a message for that to `drawOnTop()`:

```js
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text('Coins: ' + score, 16, 16);
  if (coins.length === 0) {
    textAlign(CENTER, CENTER);
    textSize(48);
    text('You got them all!', width / 2, height / 2);
  }
}
```

[[demo: examples/platformer | 800x500 | keys]]

## Make it your own

- **Spikes:** a group of static sensor triangles. Touching one sends the player back to the start (see [Levels and Score](levels-score.html#lives-and-losing)).
- **An animated hero:** swap the box for the hero spritesheet with idle, run and jump animations (see [Spritesheets and Animations](animation.html#adding-animations-to-an-object)).
- **Moving platforms:** a static platform whose `x` changes a little every frame carries the player along (see [Movement](movement.html#moving-platforms)).
- **More levels:** design them as text maps (see [Levels and Score](levels-score.html#levels)).
- **Sounds:** a jump sound and a coin ding (see [Sounds](sounds.html)).
