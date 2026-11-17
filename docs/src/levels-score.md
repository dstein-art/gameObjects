# Managing your Game with Levels and Score

You have objects that move, collide, animate and make noise. This section turns them into a **game**: something with a score, a start and an end, and more than one level.
{: .lead }

## The game manager

GameObjects gives every sketch a **`gameManager`**. It keeps the **score** and the **level**, and it knows whether the game has started, is being played, or is over. There's nothing to set up: just use it.

You move the game along with three calls:

```js
gameManager.startGame();   // start (or restart): score 0, level 1
gameManager.endLevel();    // this level is done: go on to the next one
gameManager.endGame();     // game over
```

And the game manager calls **your** functions when those things happen, if you write them:

```js
function gameStarted() {
  // the game is starting: reset lives, make the player...
}

function levelStarted(level) {
  // level 1, 2, 3... is starting: build it
}

function levelEnded(level) {
  // a level was finished
}

function gameEnded(won) {
  // the game is over. won is true if the last level was finished
}
```

All four are optional. Write the ones you need and leave the rest out.

When you call `startGame()`, the game manager calls `gameStarted()` and then `levelStarted(1)`. When you call `endLevel()`, it calls `levelEnded()` for the level you just finished, then `levelStarted()` for the next one.

> **Watch out:** spell them exactly: `gameStarted`, `gameEnded`, `levelStarted`, `levelEnded`. If GameObjects finds a function with different capitals, like `gamestarted`, it prints a hint in the console.

## Keeping score

The score lives in the game manager. Add points when something happens:

```js
player.onCollide(coins, (me, coin) => {
  coin.destroy();
  gameManager.addScore(10);
});
```

You can also set it directly, like `gameManager.score = 0` or `gameManager.score += 10`. `startGame()` sets it back to `0`.

The game manager also keeps **`gameManager.highScore`**, the best score so far, which stays when the game restarts.

### Drawing the score on top

GameObjects draws your objects **after** `draw()` finishes. So anything you draw in `draw()`, like the score, ends up **behind** the objects, and a platform or a coin can cover it.

For text that should always be on top, write a function called **`drawOnTop()`**. GameObjects calls it every frame, **after** all the objects are drawn:

```js
function draw() {
  background(220);
  // move things, check the rules...
}

function drawOnTop() {
  fill(0);
  textSize(20);
  text('Score: ' + gameManager.score, 10, 30);
  text('Level: ' + gameManager.level, 10, 55);
}
```

`drawOnTop()` is optional: leave it out and nothing changes. It's drawn in **screen space**, so the [camera](input-camera.html#the-camera) doesn't move it, which is just right for a score, lives or a message.

> **Watch out:** spell it exactly `drawOnTop`, with a capital **O** and **T**. If GameObjects finds a function with a similar name, like `drawontop`, it prints a hint in the console.

## Title, playing and game over

Most games have **screens**: a title screen, the game itself, a game-over screen. The game manager knows which one you're on:

| `gameManager.state` | Means |
|---|---|
| `'title'` | `startGame()` hasn't been called yet |
| `'playing'` | The game is on |
| `'over'` | `endGame()` was called, or the last level was finished |

`gameManager.isPlaying` and `gameManager.isOver` are short ways to ask. Draw something different for each screen, and start the game when the player presses a key:

```js
function draw() {
  background(30);
  if (gameManager.isPlaying) {
    // move things, check the rules
  }
}

function drawOnTop() {
  if (gameManager.state === 'title') {
    text('SUPER CATCH — press any key', 200, 180);
  } else if (gameManager.isPlaying) {
    text('Score: ' + gameManager.score, 10, 30);
  } else if (gameManager.isOver) {
    text('GAME OVER — press any key', 200, 180);
  }
}

function keyPressed() {
  if (!gameManager.isPlaying) gameManager.startGame();
}
```

The game logic goes in `draw()`, and everything the player reads goes in `drawOnTop()`, so messages always appear over the game.

## Lives and losing

Lives are your own variable. Reset them in `gameStarted()`, and end the game when they run out:

```js
let lives = 3;

function gameStarted() {
  lives = 3;
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    gameManager.endGame();
  } else {
    player.setPosition(startX, startY);   // back to the start
    player.stop();
  }
}
```

Freeze the physics when the game ends with **`world.paused`**, and unfreeze it when a new game starts:

```js
function gameEnded() {
  world.paused = true;
}
```

## Starting again

To restart, you need to **remove everything** and **build it again**. `gameStarted()` is the place for that, so the same code runs for the first game and for every game after it:

```js
function gameStarted() {
  world.clear();          // destroy every object and joint
  lives = 3;
  player = new GameObject(320, 300, 40);
  // ... make the rest of the game
  world.paused = false;
}
```

> **Watch out:** `world.clear()` destroys **everything**, including walls from `world.addWalls()`. Make them again inside `gameStarted()` (or `levelStarted()`). Also make your groups **once** in `setup()`. `clear()` empties them, but they keep their settings and collision rules.

## Saving a high score

`gameManager.highScore` is forgotten when the page is closed. p5.js can remember it in the browser using `storeItem` and `getItem`:

```js
function setup() {
  // ...
  gameManager.highScore = getItem('bestScore') || 0;     // 0 the first time
}

function gameEnded() {
  storeItem('bestScore', gameManager.highScore);
}
```

[[demo: catch-game | 360 | keys]]

## Levels

A **level** is a particular arrangement of platforms, enemies and collectibles. The easiest way to design levels is to **draw them as text**. Each character stands for one tile of the map:

```js
let levels = [
  [
    '                    ',
    '                    ',
    '      o o o         ',
    '     #######     E  ',
    '  P            #####',
    '#######    #########',
  ],
  [
    '  o                E',
    ' ###     o o   #####',
    '       #####        ',
    '  o o              o',
    ' #####   P    ##### ',
    '####################',
  ],
];
```

Here `#` is ground, `o` is a coin, `P` is where the player starts, `E` is the exit and a space is empty. Changing a level is as easy as typing.

### Building a level from the map

The game manager calls `levelStarted()` with the level number: `1` for the first level, `2` for the next, and so on. Arrays start at `0`, so level `1` is `levels[0]`. Loop through every row and every character, and make the right object for each one:

```js
let TILE = 32;

function levelStarted(level) {
  world.clear();
  let map = levels[level - 1];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let ch = map[row][col];
      let x = col * TILE + TILE / 2;    // centre of this tile
      let y = row * TILE + TILE / 2;
      if (ch === '#') ground.create(x, y, TILE, TILE);
      if (ch === 'o') coins.create(x, y, TILE / 2);
      if (ch === 'E') exit = new GameObject(x, y, TILE, TILE, { isStatic: true, isSensor: true });
      if (ch === 'P') player = makePlayer(x, y);
    }
  }
}
```

### Moving to the next level

Tell the game manager how many levels there are, and call **`endLevel()`** when the player reaches the exit. It builds the next level by calling `levelStarted()` again:

```js
function setup() {
  // ...
  gameManager.levels = levels.length;
  gameManager.startGame();
}

// in draw():
if (player.isTouching(exit) && coins.length === 0) gameManager.endLevel();
```

After the **last** level, `endLevel()` ends the game instead: `gameEnded(true)` is called and `gameManager.won` is `true`. Use it to show a "You won!" screen.

> **Tip:** it's safe to call `startGame()`, `endLevel()` and `endGame()` anywhere, even inside an `onCollide` callback. If the physics is in the middle of a step, the game manager waits until the step is over before building the next level.

[[demo: tile-levels | 360 | keys]]

## Putting it all together

A complete game usually has these parts:

1. **`setup()`** loads images and sounds, makes the groups (with their collision rules), and sets `gameManager.levels`.
2. **`gameStarted()`** resets lives and anything else that lasts the whole game.
3. **`levelStarted(level)`** clears the world and builds the level.
4. **`draw()`** reads the keys and checks the rules: call `endLevel()` when a level is done, and `endGame()` when the player loses.
5. **`drawOnTop()`** draws the score and the title, game-over and "you won" screens.
6. **`keyPressed()`** handles jumping, and calls `gameManager.startGame()` to start and restart.

The two demos on this page follow this pattern. For more complete games, open the [example games](examples.html), change things and see what happens.

**Have fun making games!**
