# Getting Started

GameObjects.js adds **game objects with real physics** to p5.js. You make a box, a ball or a picture, and it falls, bounces, slides, stacks and bumps into other things by itself. You decide what happens when things touch, how the player moves and how the game is scored.
{: .lead }

GameObjects is built on [Matter.js](https://brm.io/matter-js/), a popular physics engine. You don't need to know anything about Matter.js to use it.

[[demo: hello | 320]]

Click the demo above to drop more boxes. That whole sketch is about 20 lines of code.

> **Tip:** you can **edit the code under every demo** on this site. Change a number or a colour, then press the **▶** button (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>) to see what happens. If something goes wrong, the error and its line are shown in red. The other icons under each demo reset the code to the original (**↺**), hide or show the code, copy it, and open the demo in its own tab.

## What you need

- A p5.js sketch. GameObjects works with **p5.js 2.x** (recommended) and 1.x.
- Three extra `<script>` lines in your `index.html`.
- The file `gameobjects.js`.

## Setting up in the p5.js Web Editor

1. **Download `gameobjects.js`** from the GameObjects repository.
2. In the Web Editor, open the sketch files panel (the **›** arrow on the left), click **+**, choose **Upload file** and upload `gameobjects.js`.
3. Open `index.html` and make the `<head>` load the scripts **in this order**:

```html
<!-- 1. p5.js and p5.sound -->
<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js"></script>
<!-- 2. the physics engine -->
<script src="https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js"></script>
<!-- 3. GameObjects -->
<script src="gameobjects.js"></script>
```

Your `sketch.js` is loaded after these, in the `<body>`, as usual.

> **Watch out:** the order matters. p5.js first, then Matter.js, then `gameobjects.js`. If you see *"GameObjects.js needs Matter.js"* in the console, the Matter.js line is missing or comes too late.

## Setting up on your own computer

Make a folder like this:

```text
my-game/
  index.html
  sketch.js
  gameobjects.js
```

Use the same `<script>` lines as above. Open the folder with a local web server, for example the **Live Server** extension in VS Code. Opening `index.html` by double-clicking it won't load images or sounds.

## Your first sketch

```js
function setup() {
  createCanvas(640, 320);

  // 1. A floor. Static objects never move.
  new GameObject(320, 300, 640, 40, { isStatic: true, color: 'seagreen' });

  // 2. A box. It falls!
  new GameObject(320, 50, 50);
}

function draw() {
  background(230);
}
```

Things to notice:

- **`new GameObject(x, y, width, height)`** makes an object. If you leave out the height, you get a square.
- **You don't draw the objects.** GameObjects moves and draws them for you, right after your `draw()` function runs.
- **`x` and `y` are the centre** of the object, not its top-left corner.

## What happens every frame

Each time p5.js runs a frame, this happens:

1. **Before your `draw()`:** every object moves one step. Gravity pulls, things bounce, and collision code runs.
2. **Your `draw()` runs.** Draw the background, read the keyboard, update the score.
3. **After your `draw()`:** GameObjects draws every object on top of what you drew.
4. **Your `drawOnTop()` runs**, if you wrote one. It's optional.

That's why `background()` in your `draw()` doesn't wipe out your objects. They're drawn afterwards.

Text drawn in `draw()` therefore ends up *behind* your objects. For things that must always be visible, like a score, write a function called **`drawOnTop()`**. It runs after all the objects are drawn:

```js
function drawOnTop() {
  text('Score: ' + score, 10, 20);
}
```

There's more on this in [Levels and Score](levels-score.html#drawing-the-score-on-top).

## Units

| Thing | Unit |
|---|---|
| Position, width, height | pixels |
| Velocity, speed | pixels per frame |
| Rotation | degrees (0 = pointing right, increasing clockwise) |
| Time (like `lifespan`) | frames |

Rotation is always in degrees, even if you used `angleMode(RADIANS)`.

## Seeing the physics shapes

Turn on **debug view** to see the shape the physics engine is using for each object:

```js
world.debug = true;
```

`world` is an object that GameObjects creates automatically (a `GameWorld`). It holds all your objects and the physics settings.

Outlines are **green**, turn **red** while touching something, and are **orange** for sensors (more on those in [Collisions and Overlaps](collisions.html)). This is very useful when something isn't colliding the way you expect.

[[demo: debug-view | 320 | keys]]

## Where next?

Work through the sections in order, or jump to what you need:

- **[Game Objects](game-objects.html):** shapes, colours, images and your own kinds of object
- **[Movement](movement.html):** making things move
- **[Groups](groups.html):** handling lots of objects at once
- **[Physics](physics.html):** gravity, bounce, friction, weight and joints
- **[Collisions and Overlaps](collisions.html):** reacting when things touch
- **[Spritesheets and Animations](animation.html):** animated characters
- **[Sounds](sounds.html):** sound effects and music
- **[Player Input and Camera](input-camera.html):** keyboard, mouse and scrolling worlds
- **[Levels and Score](levels-score.html):** turning it all into a real game
- **[Example Games](examples.html):** five complete games to play with and change
