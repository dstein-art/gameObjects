# Player Input and Camera

This section is about letting the player take control with the keyboard and mouse, and about using the **camera** so your game world can be bigger than the screen.
{: .lead }

## Keyboard: holding vs. pressing

p5.js gives you two ways to read keys, and games need both:

- **`keyIsDown(code)`** in `draw()` is `true` for **every frame** a key is held. Use it for continuous things like walking, steering and thrust.
- **`keyPressed()`** runs **once** each time a key goes down. Use it for single actions like jumping, shooting and pausing.

```js
function draw() {
  background(220);
  if (keyIsDown(LEFT_ARROW))  player.velocityX = -5;   // walk while held
}

function keyPressed() {
  if (key === ' ') shoot();                            // once per press
}
```

### Key codes

`keyIsDown()` needs a **key code**. The arrow keys have names. For letters, use the capital letter's code. A handy trick is `'W'.charCodeAt(0)`.

| Key | Code |
|---|---|
| ← → ↑ ↓ | `LEFT_ARROW`, `RIGHT_ARROW`, `UP_ARROW`, `DOWN_ARROW` |
| W A S D | `87`, `65`, `83`, `68` |
| Space | `32` |
| Shift, Enter | `SHIFT`, `ENTER` |

In `keyPressed()`, check **`key`** (the character, like `'a'` or `' '`) or **`keyCode`** (the number).

## Top-down controls

For games seen from above, set both parts of the velocity from the keys. Supporting both arrows **and** WASD is friendly:

```js
let W = 87, A = 65, S = 83, D = 68;

function draw() {
  let vx = 0, vy = 0;
  if (keyIsDown(LEFT_ARROW)  || keyIsDown(A)) vx -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(D)) vx += 1;
  if (keyIsDown(UP_ARROW)    || keyIsDown(W)) vy -= 1;
  if (keyIsDown(DOWN_ARROW)  || keyIsDown(S)) vy += 1;
  // the same speed diagonally as straight
  let len = max(1, sqrt(vx * vx + vy * vy));
  player.setVelocity(vx / len * 4, vy / len * 4);
}
```

[[demo: topdown-controls | 320 | keys]]

## Platformer controls

In a platformer, the keys only set the **sideways** speed. Gravity handles up and down. You can only jump when you're standing on something:

```js
function draw() {
  player.velocityX = 0;
  if (keyIsDown(LEFT_ARROW))  player.velocityX = -5;
  if (keyIsDown(RIGHT_ARROW)) player.velocityX = 5;
}

function keyPressed() {
  if (key === ' ' && player.isTouching(platforms)) {
    player.velocityY = -15;   // jump!
  }
}
```

> **Tip:** give the player `fixedRotation: true` so it doesn't tip over, and `friction: 0` so it doesn't stick to the sides of walls.

## Mouse

Use p5's `mouseX` and `mouseY`, and `mousePressed()` for clicks. A few GameObjects extras help:

```js
if (button.isMouseOver()) { /* hovering */ }

function mousePressed() {
  for (let enemy of enemies) {
    if (enemy.isMouseOver()) enemy.destroy();   // click to zap
  }
}

turret.lookAt(world.mouseX, world.mouseY);       // aim at the mouse
crate.draggable = true;                         // grab and throw
```

> **Watch out:** once the camera moves, `mouseX` and `mouseY` are **screen** positions. Use **`world.mouseX`** and **`world.mouseY`** for positions **in the game world**. `isMouseOver()` and dragging already do this for you.

[[demo: mouse-aim | 320]]

## The camera

The camera chooses which part of the world you see. By default it looks at the canvas area, so world positions and screen positions are the same. Move the camera and the world scrolls.

### Following the player

```js
world.camera.follow(player);              // smooth follow
world.camera.follow(player, 1);           // locked tightly on
world.camera.follow(player, 0.05);        // lazy, floaty camera
world.camera.follow(player, 0.1, 0, -80); // look a bit above the player
world.camera.stopFollowing();
```

The second number is the **ease**: how much of the way to the player the camera moves each frame.

### Zoom

```js
world.camera.zoom = 2;      // close up
world.camera.zoom = 0.5;    // zoomed out
```

### Keeping the camera inside your level

Stop the camera showing empty space past the edges of your level by using `constrain` after it follows:

```js
world.camera.x = constrain(world.camera.x, width / 2, LEVEL_WIDTH - width / 2);
world.camera.y = constrain(world.camera.y, height / 2, LEVEL_HEIGHT - height / 2);
```

### Moving it yourself

```js
world.camera.x = 1000;    // look at this spot in the world
world.camera.y = 300;
world.camera.reset();     // back to normal
```

[[demo: camera | 360 | keys]]

## Drawing with the camera: world vs. screen

When the camera moves, there are two kinds of drawing:

- **Screen drawing** stays put on the screen: the score, lives and a "Paused" message. Anything you draw normally is screen drawing. Put it in **`drawOnTop()`** so it also appears over the game objects.
- **World drawing** scrolls with the world: backgrounds, grids, decorations. Put it between **`world.camera.begin()`** and **`world.camera.end()`**.

```js
function draw() {
  background(200);

  world.camera.begin();
  image(mountains, 0, 0);       // scrolls with the world, behind the objects
  world.camera.end();
}

function drawOnTop() {
  text('Score: ' + score, 10, 20);   // stays on screen, on top of the objects
}
```

See [Levels and Score](levels-score.html#drawing-the-score-on-top) for more about `drawOnTop()`.

Converting between the two:

```js
world.camera.screenToWorld(mouseX, mouseY);   // { x, y } in the world
world.camera.worldToScreen(player.x, player.y);
player.isOffscreen();                         // completely out of view?
```

## Quick reference

| | |
|---|---|
| `keyIsDown(code)` | Held down (check in `draw()`) |
| `keyPressed()`, `key`, `keyCode` | Pressed once |
| `obj.isMouseOver()` | Mouse over this object |
| `world.mouseX`, `world.mouseY` | Mouse position in the world |
| `draggable`, `world.dragging` | Drag with the mouse |
| `world.camera.follow(obj, ease, offsetX, offsetY)` | Follow an object |
| `world.camera.x`, `.y`, `.zoom` | Position and zoom |
| `world.camera.begin()` / `.end()` | Draw in world space |
| `world.camera.screenToWorld()`, `.worldToScreen()` | Convert positions |
