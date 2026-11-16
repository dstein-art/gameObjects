# Physics

The physics engine makes your game feel solid. Things fall, slide, bounce and push each other around. This section covers the settings that control how heavy, bouncy, slippery and springy things are.
{: .lead }

## The world and gravity

Every sketch gets a ready-made physics world called **`world`**. Gravity pulls down by default (`gravityY` is `1`). Change it in `setup()`, or any time during the game:

```js
world.gravityY = 0;        // no gravity: space or top-down games
world.gravityY = 2;        // heavy gravity
world.gravityY = -1;       // upside down!
world.gravityX = 0.5;      // a sideways wind
world.setGravity(0, 1);    // both at once
```

> **Tip:** you can also make a world with all its settings at once: `world = new GameWorld({ gravityY: 0, debug: true })`. Most games never need to. See the [API reference](api.html#more-than-one-world) for when more than one world is useful.

[[demo: gravity | 320 | keys]]

## Static and moving objects

- **Dynamic** objects (the default) are moved by physics: gravity, bumps, pushes.
- **Static** objects (`isStatic: true`) **never** move by themselves and can't be pushed. Use them for floors, walls and platforms. You can still move them yourself (see [moving platforms](movement.html#moving-platforms)).

```js
let floor = new GameObject(320, 350, 640, 20, { isStatic: true });
crate.isStatic = true;    // freeze a crate in place
crate.isStatic = false;   // ...and let it fall again
```

> **Tip:** **`world.addWalls()`** puts invisible static walls around the edges of the canvas so nothing can escape. It returns a group with `top`, `bottom`, `left` and `right` walls, so you can remove one: `world.addWalls().bottom.destroy()`.

## Bounce

**`bounce`** goes from `0` (lands with a thud) to `1` (bounces forever). The default is `0.2`.

```js
new GameObject(100, 50, 40, { shape: 'circle', bounce: 0.9 });
```

When two objects hit, the bouncier of the two is used.

## Friction

**`friction`** is how much things grip when they slide against each other, from `0` (ice) to `1` (sticky). The default is `0.1`.

When two objects slide against each other, the **less** grippy of the two is used, so an icy box slides even on a sticky ramp.

**`airFriction`** slows an object down all the time, even when it isn't touching anything. Use `0` in space and higher values (like `0.1`) for things moving through water or treacle. The default is `0.01`.

[[demo: bounce-friction | 340]]

## Weight: `density` and `mass`

Heavier objects push lighter ones out of the way, and are harder to move with `applyForce`. Weight comes from **density × size**, so bigger objects are heavier.

```js
new GameObject(100, 50, 40, { density: 0.01 });   // 10× heavier than normal
balloon.density = 0.0002;                         // very light
boulder.mass = 50;                                 // set the total weight directly
```

The default density is `0.001`.

[[demo: seesaw | 320]]

## Stopping things from spinning

Objects tip over and roll when they're bumped. For a player character that usually feels wrong. **`fixedRotation`** keeps an object upright:

```js
player = new GameObject(100, 100, 40, 60, { fixedRotation: true });
```

## Joints: connecting things together

**`world.connect(a, b)`** links two objects together, like a rod or a spring. **`world.pin(obj, x, y)`** nails an object to a point in the world, so it can swing like a pendulum.

```js
// a stiff rod between two objects
world.connect(a, b);

// a springy connection 100 pixels long
world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });

// attach at the ends instead of the middles
world.connect(a, b, { offsetA: { x: 20, y: 0 }, offsetB: { x: -20, y: 0 } });

// a pendulum: pin the ball to a point above it
world.pin(ball, 320, 40);
```

| Option | What it does | Default |
|---|---|---|
| `length` | Distance to keep between them | their current distance |
| `stiffness` | `1` = solid rod, `0.01` = very stretchy | `0.7` (connect), `1` (pin) |
| `damping` | `0` to `1`, how quickly wobbling dies down | `0` |
| `offsetA`, `offsetB` | Attach points, measured from each object's centre | centre |

Both return a **link** you can change or remove later:

```js
let rope = world.connect(a, b);
rope.stroke = 'brown';
rope.strokeWeight = 4;
rope.visible = false;      // invisible connection
rope.destroy();            // cut it!
```

[[demo: chain | 360]]

## Dragging with the mouse

Set **`draggable: true`** and players can grab an object with the mouse and throw it around:

```js
new GameObject(100, 100, 50, { draggable: true });
```

`world.dragging` tells you which object is being dragged (or `null`).

## Slow motion and pausing

```js
world.timeScale = 0.3;   // slow motion
world.timeScale = 1;     // normal
world.paused = true;     // freeze all physics (things are still drawn)
```

[[demo: slow-motion | 320 | keys]]

## Finding things

```js
world.objectsAt(mouseX, mouseY);          // array of objects under a point
world.raycast(x1, y1, x2, y2);            // objects along a line, nearest first
```

`raycast` is useful for lasers, line-of-sight ("can the guard see the player?") and checking for ground below a character.

## Going further with Matter.js

GameObjects uses [Matter.js](https://brm.io/matter-js/) underneath. If you want to use a feature GameObjects doesn't cover, you can reach the Matter.js parts directly:

```js
obj.body          // the Matter.js body of an object
world.engine      // the Matter.js engine
GameObjects.Matter  // the whole Matter.js library
```

## Quick reference

| | |
|---|---|
| `world.gravityX`, `world.gravityY`, `world.setGravity(x, y)` | Gravity |
| `isStatic` | Never moved by physics |
| `bounce` | 0 to 1 |
| `friction`, `airFriction` | Grip, and slowing down over time |
| `density`, `mass` | Weight |
| `fixedRotation` | Never tips or spins |
| `world.connect(a, b, opts)`, `world.pin(obj, x, y, opts)` | Joints |
| `draggable`, `world.dragging` | Mouse dragging |
| `world.timeScale`, `world.paused` | Slow motion and pause |
| `world.addWalls()` | Walls around the canvas |
| `world.objectsAt(x, y)`, `world.raycast(x1, y1, x2, y2)` | Finding things |
