# Managing your Game with Levels and Score

You have objects that move, collide, animate and make noise. This section turns them into a **game**: something with a score, lives, a start and an end, and more than one level.
{: .lead }

## Keeping score

The score is just a variable. Change it when something happens, and draw it every frame:

```js
let score = 0;

function setup() {
  // ...
  player.onCollide(coins, (me, coin) => {
    coin.destroy();
    score += 10;
  });
}
```

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
  text('Score: ' + score, 10, 30);
}
```

`drawOnTop()` is optional: leave it out and nothing changes. It's drawn in **screen space**, so the [camera](input-camera.html#the-camera) doesn't move it, which is just right for a score, lives or a message.

> **Watch out:** spell it exactly `drawOnTop`, with a capital **O** and **T**. If GameObjects finds a function with a similar name, like `drawontop`, it prints a hint in the console.

## Lives and losing

Lives work the same way: a variable, and a check for when they run out.

```js
let lives = 3;

function loseLife() {
  lives--;
  if (lives <= 0) {
    gameOver();
  } else {
    player.setPosition(startX, startY);   // back to the start
    player.stop();
  }
}

// falling off the bottom of the level
if (player.y > height + 100) loseLife();
```

## Game states: title, playing, game over

Most games have **screens**: a title screen, the game itself, a game-over screen. Keep track of which one you're on with a **state** variable, and draw something different for each:

```js
let state = 'title';

function draw() {
  background(30);
  if (state === 'playing') {
    playGame();       // move things, check the rules
  }
}

function drawOnTop() {
  if (state === 'title') {
    text('SUPER CATCH — press any key', 200, 180);
  } else if (state === 'playing') {
    drawScore();
  } else if (state === 'gameover') {
    drawScore();
    text('GAME OVER — press R', 200, 180);
  }
}
```

The game logic goes in `draw()`, and everything the player reads goes in `drawOnTop()`, so messages always appear over the game.

Freeze the physics while you're not playing with **`world.paused`**:

```js
function gameOver() {
  state = 'gameover';
  world.paused = true;
}
```

## Starting again

To restart, you need to **remove everything** and **build it again**. Put all the building code in one function, so you can call it at the start and again later:

```js
function startGame() {
  world.clear();          // destroy every object and joint
  score = 0;
  lives = 3;
  player = new GameObject(320, 300, 40);
  // ... make the rest of the game
  world.paused = false;
  state = 'playing';
}
```

> **Watch out:** `world.clear()` destroys **everything**, including walls from `world.addWalls()`. Make them again inside `startGame()`. Also make your groups **once** in `setup()`. `clear()` empties them, but they keep their settings and collision rules.

## Saving a high score

p5.js can remember things in the browser even after the page is closed, using `storeItem` and `getItem`:

```js
let best = getItem('bestScore') || 0;     // 0 the first time

function gameOver() {
  if (score > best) {
    best = score;
    storeItem('bestScore', best);
  }
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

Loop through every row and every character, and make the right object for each one:

```js
let TILE = 32;

function buildLevel(n) {
  world.clear();
  let map = levels[n];
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

Keep the current level number in a variable. When the player reaches the exit, add one and build the next level:

```js
let level = 0;

function nextLevel() {
  level++;
  if (level >= levels.length) {
    state = 'won';            // no more levels!
  } else {
    buildLevel(level);
  }
}

// in draw():
if (player.isTouching(exit) && coins.length === 0) nextLevel();
```

> **Tip:** change levels **in `draw()`**, not inside an `onCollide` callback. Building a whole level in the middle of the physics step can cause strange results. Checking `isTouching` in `draw()` avoids the problem.

[[demo: tile-levels | 360 | keys]]

## Putting it all together

A complete game usually has these parts:

1. **`setup()`** loads images and sounds, makes the world and groups (with their collision rules), then shows the title screen.
2. **`startGame()`** resets the score and lives, and builds the first level.
3. **`buildLevel(n)`** clears the world and makes everything for level `n`.
4. **`draw()`** checks the **state**, reads the keys, checks the rules (won? lost? next level?), then draws the world and the score.
5. **`keyPressed()`** handles jumping, starting and restarting.

The [example games](examples.html) that come with GameObjects follow this pattern. Open them up, change things and see what happens.

**Have fun making games!**
