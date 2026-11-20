# Mochi's Snack Hunt

Help Mochi eat every snack on three levels, while dodging spikes, gaps and grumpy Mochis. The hero is **Mochi**, a character that comes built into GameObjects, and the **game manager** looks after the levels, the score and the end of the game.
{: .lead }

**You'll learn:** the built-in Mochi character · levels drawn as text · snacks as sensors · the game manager: `levelStarted()`, `endLevel()`, `restartLevel()` and `endGame()` · lives · enemies that patrol, and `ignore()` · stomping on enemies from above

## Play the finished game

Arrow keys or **A**/**D** to walk, **Space**, **W** or **↑** to jump. Click the game first so it can hear the keyboard, then press any key to start.

[[demo: examples/snack-hunt | 800x480 | keys]]

## Step 1: Mochi on a level

**Mochi** is a `GameObject` with a face. It blinks, looks around, squishes when it lands and has moods. Make one like any other object:

```js
player = new Mochi(x, y, 30);   // 30 pixels across
```

The level is drawn as text, one character for each 32-pixel tile: `#` is ground and `P` is where Mochi starts. We loop through every row and every character, and make the right thing for each one:

```js
for (let row = 0; row < map.length; row++) {
  for (let col = 0; col < map[row].length; col++) {
    let ch = map[row][col];
    let x = col * TILE + TILE / 2;    // the centre of this tile
    let y = row * TILE + TILE / 2;
    if (ch === '#') ground.create(x, y, TILE, TILE);
    if (ch === 'P') player = new Mochi(x, y, 30);
  }
}
```

Mochi already knows how to move. `walk()` takes `-1` (left), `1` (right) or `0` (stop), and turns Mochi to face the way it's going. `jump()` only jumps when Mochi is standing on something, so there's no flying:

```js
function draw() {
  let direction = 0;
  if (keyIsDown(LEFT_ARROW)) direction = -1;
  if (keyIsDown(RIGHT_ARROW)) direction = 1;
  player.walk(direction);
}

function keyPressed() {
  if (key === ' ') player.jump();
}
```

Stand still for a few seconds and Mochi gets sleepy.

[[demo: examples/snack-hunt-step-1 | 800x480 | keys]]

## Step 2: Snacks and a score

Each `o` in the map is a snack: a small circle in a group of **sensors**. Sensors don't push anything, so Mochi walks right through them, but the collision is still reported. When Mochi touches a snack, the snack disappears and the [game manager](levels-score.html#the-game-manager) adds 10 points:

```js
snacks = new GameGroup({ shape: 'circle', isStatic: true, isSensor: true });

player.onCollide(snacks, (me, snack) => {
  snack.destroy();
  gameManager.addScore(10);
  if (random() < 0.3) me.say(random(['Yum!', 'Nom!', 'Tasty!']), 0.8);
});
```

`say()` shows a speech bubble for a moment. The score goes in [`drawOnTop()`](levels-score.html#drawing-the-score-on-top), so it's always drawn over the level.

[[demo: examples/snack-hunt-step-2 | 800x480 | keys]]

## Step 3: Three levels with the game manager

Now `levels` holds three maps. The game manager builds them one at a time: tell it how many there are, and start the game:

```js
gameManager.levels = levels.length;
gameManager.startGame();          // calls levelStarted(1)
```

It calls our `levelStarted()` with the level number. That function clears the world and builds that level's map. Level 1 is `levels[0]`, because arrays start at 0:

```js
function levelStarted(level) {
  world.clear();
  world.addWalls();
  let map = levels[level - 1];
  // ... build it, like in step 1
}
```

When every snack is eaten, Mochi celebrates for a second and we call `gameManager.endLevel()`, which builds the next level. After level 3 it ends the game instead, and `gameManager.won` is `true`.

For the pause, a small `wait()` function remembers what to do and when. `draw()` does it once the time comes, and ignores the keys until then:

```js
function wait(frames, action) {
  waitUntil = frameCount + frames;
  afterWait = action;
}

// in draw():
if (snacks.length === 0) {
  player.walk(0);
  player.say('All done!', 1);
  wait(60, () => gameManager.endLevel());
}
```

The maps already have some other characters in them: `^`, `g` and `|`. For now they're ignored.

[[demo: examples/snack-hunt-step-3 | 800x480 | keys]]

## Step 4: Spikes, gaps and grumpy Mochis

Time for some danger:

- **`^` spikes** are triangles in a group of sensors.
- **Gaps** in the ground: the bottom wall is removed with `walls.bottom.destroy()`, so Mochi can fall out of the level.
- **`g` grumpy Mochis** are Mochis too, with an angry mood and different colors. Their eyes `watch()` the player.

```js
let grumpy = new Mochi(x, y, 30, { mood: 'angry', color: '#d6cdea', stroke: '#a99cc9', walkSpeed: 1.3 });
grumpy.watch(player);
```

**Patrolling.** Each grumpy walks in its own `data.direction` and turns around when it touches a **stopper**, an invisible `|` in the map. The player shouldn't bump into stoppers, so it [`ignore()`s](collisions.html#not-colliding-at-all-ignore) them:

```js
stoppers = new GameGroup({ isStatic: true, visible: false });
grumpies.onCollide(stoppers, (grumpy) => {
  grumpy.data.direction *= -1;
});

player.ignore(stoppers);
```

**Getting hurt.** Touching spikes or a grumpy, or falling off the bottom, costs a life. Mochi makes a hurt face and says "Ouch!". Then, after a short `wait()`, the game manager either **restarts the level** or ends the game:

```js
function hurt() {
  if (afterWait) return;      // already hurt
  lives--;
  player.react('hurt', 2);
  player.say('Ouch!', 2);
  wait(50, () => {
    if (lives > 0) gameManager.restartLevel();
    else gameManager.endGame();
  });
}
```

`restartLevel()` calls `levelStarted()` again with the same level, so the snacks come back. The score goes back to what it was when the level began, so they can't be eaten twice.

**Stomping.** If the player is above the grumpy when they touch, it's a stomp: the grumpy is gone, Mochi bounces, and that's 25 points:

```js
player.onCollide(grumpies, (me, grumpy) => {
  if (me.y < grumpy.y - grumpy.height * 0.35) {
    grumpy.destroy();
    me.velocityY = -8;
    gameManager.addScore(25);
  } else {
    hurt();
  }
});
```

[[demo: examples/snack-hunt-step-4 | 800x480 | keys]]

## Step 5: Title and ending screens (the finished game)

Before the game starts, `gameManager.state` is `'title'`. In `setup()`, instead of starting straight away, we show a big Mochi waiting on a floor. Any key calls `gameManager.startGame()`, and after the game ends, any key starts it again:

```js
function showTitle() {
  world.clear();
  new GameObject(400, 400, 800, 40, { isStatic: true });
  let mochi = new Mochi(400, 340, 72);
  mochi.say('Press any key to start!', 9999);
}

function keyPressed() {
  if (!gameManager.isPlaying) {
    gameManager.startGame();
    return;
  }
  // ... jumping
}
```

When the game ends, `gameEnded(won)` builds the ending scene, a happy Mochi or a hurt one:

```js
function gameEnded(won) {
  world.clear();
  new GameObject(400, 400, 800, 40, { isStatic: true });
  let mochi = new Mochi(400, 340, 72, { mood: won ? 'happy' : 'hurt' });
  mochi.say(won ? "I'm so full! Thank you!" : 'Oh no...', 9999);
}
```

`drawOnTop()` adds the words for each screen: the title, "You win!" or "Game over", and the score with `gameManager.highScore`.

[[demo: examples/snack-hunt | 800x480 | keys]]

## Make it your own

- **More levels:** add a map to `levels`. The game manager counts them for you.
- **Your own Mochi:** change the player's `color` and `stroke`, or its `walkSpeed` and `jumpPower`. For a pink one, try `new Mochi(x, y, 30, { color: '#f7c6d0', stroke: '#e39aac' })`.
- **A friend at the exit:** put a friendly Mochi in each level that `watch()`es the player and `say()`s something when every snack is gone.
- **Moods:** make the player look `'surprised'` with `react()` when a grumpy gets close.
- **A camera:** make the maps wider than the screen and follow Mochi with [`world.camera.follow(player)`](input-camera.html#the-camera).
- **Save the best score:** remember `gameManager.highScore` with `storeItem()` (see [Levels and Score](levels-score.html#saving-a-high-score)).

See the [API reference](api.html#mochi) for everything Mochi can do.
