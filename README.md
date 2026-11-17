# GameObjects.js

**Physics-powered game objects for p5.js**, built on [Matter.js](https://brm.io/matter-js/), the most widely used 2D physics engine for JavaScript.

GameObjects lets you make things that fall, bounce, collide, roll and stack, and manage lots of them at once with groups. It's designed for students learning to make games in p5.js: a small set of readable names, sensible defaults, and nothing to set up beyond one line.

Works with **p5.js 1.x and 2.x**, in global or instance mode.

```js
let player;

function setup() {
  createCanvas(800, 400);
  new GameObject(400, 390, 800, 20, { isStatic: true }); // a floor
  player = new GameObject(100, 100, 40);                  // a 40×40 box that falls onto it
}

function draw() {
  background(220);
  if (keyIsDown(RIGHT_ARROW)) player.velocityX = 5;
  // objects update and draw themselves after draw()
}
```

There's no world to set up: GameObjects gives every sketch a ready-made physics world called `world` (`world.gravityY = 0`, `world.camera.follow(player)`, …).

**📖 Learn:** open [`index.html`](index.html), the home page for the step-by-step guide, five example games with build-it-yourself tutorials, and the API reference. Every demo runs live, and you can edit its code right on the page.

**📚 API reference:** [`API.md`](API.md) lists every class, property and method (also on the site as `docs/api.html`).

---

## Setup

Load the scripts **in this order** in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js"></script>
<script src="gameObjects.js"></script>
<script src="sketch.js"></script>
```

The help site and example games load p5.js, p5.sound and Matter.js (MIT licensed) from jsDelivr, so they need an internet connection. p5.sound is optional; GameObjects doesn't need it.

**p5.js Web Editor:** upload `gameObjects.js` to your sketch and add the Matter.js line and the `gameObjects.js` line to `index.html`, after p5.

---

## How it works

Every frame:

1. **Before your `draw()`:** each object's `update()` runs, then the physics engine moves everything one step and fires collision callbacks.
2. **Your `draw()`** runs. Read positions, handle keys, draw backgrounds.
3. **After your `draw()`:** the world draws every object (sorted by `depth`) through the camera.
4. **Then your `drawOnTop()`**, if you wrote one. It's optional, and it's the place for the score, messages and anything else that must be drawn *on top* of the objects. It's in screen space, so the camera doesn't move it.

```js
function drawOnTop() {
  text('Score: ' + score, 10, 20);
}
```

Units are **pixels**, **pixels per frame** and **degrees**. `rotation` uses degrees whatever `angleMode()` is set to.

---

## API

The full reference is in **[API.md](API.md)**. In brief:

| | |
|---|---|
| `world` | The ready-made physics world: gravity, camera, walls, joints, pausing, debug view |
| `new GameObject(x, y, w, h, options)` | One physical thing: a box, circle, polygon or picture that moves and collides |
| `new GameGroup(defaults)` | A collection of objects to make, loop through and collide as one |
| `onCollide` / `isTouching` / `ignore` | Reacting to touches, on objects and on groups |
| `world.camera` | Follow, zoom and scroll |
| `GameObjects.spriteSheet()` | Cut sprite sheets into animation frames |

---

## Examples and help site

Everything to read and play with starts at **[`index.html`](index.html)** in the root of the project. Open it through a local web server (VS Code Live Server, or `npx serve .`), not by double-clicking it.

```text
index.html            home page: links to every section and example game
gameObjects.js        the library
API.md                the API reference (also built into docs/api.html)
docs/
  getting-started.html … levels-score.html   the 10 help sections
  examples.html       the example games
  example-*.html      one page per game: play it, then build it step by step
  api.html            the API reference, built from API.md
  examples/           the example games' sketch files, and each tutorial step
  demos/              the demo sketches used in the help sections
  src/                the help pages, written in Markdown
  build.py            turns docs/src/*.md into the HTML pages
```

### Example games

| | Shows |
|---|---|
| **Physics Sandbox** (5 steps) | Shapes, static objects, walls, groups, dragging, debug view |
| **Joints Playground** (5 steps) | `connect()`, `pin()`, springs, a rope bridge, dragging |
| **Breakout** (6 steps) | Zero gravity, `extends GameObject`, group collisions, pausing |
| **Platformer** (6 steps) | Keyboard control, jumping with `isTouching`, sensor coins, camera follow, HUD on top |
| **Space Shooter** (7 steps) | `lookAt`, `applyForce`, `lifespan`, `ignore()`, splitting rocks, animation from `p5.Graphics` |

Each game has its own page with a step-by-step tutorial, and each is a single file in `docs/examples/`. To use one in the p5.js Web Editor, copy it into `sketch.js` (or use the copy icon on its page) and set up `index.html` as shown in [Setup](#setup).

### Editing the help site

The pages are written in Markdown in `docs/src/` (the API page comes from `API.md`). After editing them, rebuild the HTML with:

```bash
pip install markdown
python3 docs/build.py
```

Every demo's code is editable right on the page, using [CodeMirror 5](https://codemirror.net/5/) (MIT) loaded from jsDelivr. Readers change it, press ▶ or Ctrl/⌘+Enter, and errors are shown with their line highlighted. Add a demo to a page with a line like:

```text
[[demo: my-sketch | 360 | keys]]                      docs/demos/my-sketch.js, 360px tall, with a keyboard hint
[[demo: examples/platformer | 800x500 | keys]]        an example game with its canvas size (scaled to fit)
```

### Publishing with GitHub Pages

Set Pages to deploy from the repository **root**. The home page is then `https://<you>.github.io/<repo>/`.

## Advanced: going straight to Matter.js

Every object exposes its Matter.js body as `obj.body` and the world exposes `world.engine`. `GameObjects.Matter` is the Matter.js library itself. Anything Matter.js can do, you can do here.

## License

MIT © David Stein
