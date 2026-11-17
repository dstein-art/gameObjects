# Physics Sandbox

Drop shapes, drag them, throw them and watch them stack. It isn't quite a game, but it's the best way to get a feel for physics, and it's the simplest tutorial here.
{: .lead }

**You'll learn:** static objects · making objects with the mouse · random shapes · groups with defaults · walls · dragging · debug view

## Play the finished sketch

Click empty space to drop a shape, drag shapes to throw them, press **D** for the debug view and **C** to clear.

[[demo: examples/basics | 800x500 | keys]]

## Step 1: A floor and a falling box

Every sketch gets a ready-made physics world called `world`, so all we need is a **floor** and something to fall on it.

The floor is a long, thin box. Making it **static** means gravity and collisions never move it. Notice that `x` and `y` are the **centre** of the object, so the floor's centre is 20 pixels above the bottom of the canvas.

```js
ground = new GameObject(width / 2, height - 20, width, 40, {
  isStatic: true,
  color: 80,
});

new GameObject(width / 2, 50, 50);   // a 50 × 50 box, high up
```

We don't draw anything ourselves. GameObjects moves and draws every object after our `draw()` runs.

[[demo: examples/basics-step-1 | 800x500]]

## Step 2: Click to drop a box

p5 calls `mousePressed()` whenever the mouse is clicked. Making a new GameObject at the mouse position is all it takes:

```js
function mousePressed() {
  new GameObject(mouseX, mouseY, 40);
}
```

We don't need to keep each box in a variable: the world keeps track of it.

The instructions go in **`drawOnTop()`**, an optional function that GameObjects runs after it has drawn every object. Text drawn there is always on top, so a falling box can never cover it:

```js
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Click to drop a box', 10, 20);
}
```

[[demo: examples/basics-step-2 | 800x500]]

## Step 3: Random shapes and a ramp

Let's make it more interesting. `random()` can pick from an array, so each click picks a different **shape**, **size** and starting **rotation**:

```js
let kind = random(['box', 'circle', 'triangle', 'polygon']);
let size = random(25, 60);

new GameObject(mouseX, mouseY, size, size, {
  shape: kind,
  sides: floor(random(5, 9)), // only used by polygons
  rotation: random(360),
});
```

We also add a **ramp**: another static box, rotated 15 degrees. Circles roll down it, boxes slide.

```js
new GameObject(250, 300, 300, 20, { isStatic: true, rotation: 15, color: 120 });
```

[[demo: examples/basics-step-3 | 800x500]]

> **Try it:** change the ramp's `rotation` to `-30`, or give the shapes `bounce: 0.9`.

## Step 4: A group, walls and dragging

Three improvements:

1. **Walls.** Shapes can roll off the edge of the canvas and fall forever. `world.addWalls()` puts invisible walls around the canvas.
2. **A group.** We put every shape in a `GameGroup`, which lets us count them with `shapes.length`. The group also has **defaults**: every shape made with `shapes.create()` is `draggable` and a little bouncy.
3. **Dragging.** Draggable objects can be grabbed with the mouse. But a click now does two things: grab a shape *and* make a new one. `world.objectsAt()` lists the objects under the mouse, so we only make a new shape when the click lands on empty space.

```js
world.addWalls();

shapes = new GameGroup({ draggable: true, bounce: 0.4 });
```

```js
function mousePressed() {
  // Don't spawn if we clicked on something (we're dragging it instead)
  if (world.objectsAt(mouseX, mouseY).length > 0) return;
  ...
  shapes.create(mouseX, mouseY, size, size, { ... });
}
```

[[demo: examples/basics-step-4 | 800x500]]

## Step 5: Keyboard shortcuts (the finished sketch)

Finally, two keys:

- **D** toggles `world.debug`, which draws the physics outline of every object. They turn red while touching something.
- **C** destroys every shape in the group with `shapes.destroyAll()`.

```js
function keyPressed() {
  if (key === 'd' || key === 'D') world.debug = !world.debug;
  if (key === 'c' || key === 'C') shapes.destroyAll();
}
```

[[demo: examples/basics | 800x500 | keys]]

## Make it your own

- **Gravity switch:** make the arrow keys change `world.gravityX` and `world.gravityY` (see [Physics](physics.html#the-world-and-gravity)).
- **Explode:** press **E** to give every shape a random `push()` (see [Movement](movement.html#pushing-push-and-applyforce)).
- **Pictures:** load an image and use it as the `image` option in the group's defaults (see [Game Objects](game-objects.html#images)).
- **Sound:** play a thud when shapes land, louder for faster shapes (see [Sounds](sounds.html#sounds-when-things-happen)).
