# Game Objects

A **GameObject** is one thing in your game: the player, a coin, a wall, a bullet, a crate. Each one has a shape the physics engine uses, a look, and properties you can change while the game runs.
{: .lead }

## Making a game object

There are a few ways to write it. Use whichever reads best:

```js
new GameObject(x, y);                          // a 40×40 box
new GameObject(x, y, size);                    // a square
new GameObject(x, y, width, height);           // a rectangle
new GameObject(x, y, width, height, options);  // with options
new GameObject(x, y, size, options);           // square with options
```

Usually you'll want to keep the object in a variable so you can use it later:

```js
let player;

function setup() {
  createCanvas(640, 360);
  player = new GameObject(100, 100, 40, 60, { color: 'tomato' });
}
```

**Options** is an object with any settings you want, in any order. Anything you leave out gets a sensible default. You can also change every option later, for example `player.color = 'gold'`.

> **Tip:** Remember that `x` and `y` are the **centre** of the object, not its top-left corner.

## Shapes

Set the `shape` option to choose the physics shape:

| `shape` | What you get |
|---|---|
| `'box'` | A rectangle (the default). Add `cornerRadius: 8` for rounded corners. |
| `'circle'` | A circle. The width is the **diameter**. |
| `'triangle'` | An equal-sided triangle with a point facing right. |
| `'polygon'` | A regular polygon. Set `sides` (default 6). The width is the diameter. |
| your own | Leave out `shape` and give `vertices`, a list of points around the centre. |

```js
new GameObject(80, 50, 60, 40);                                // box
new GameObject(180, 50, 50, { shape: 'circle' });
new GameObject(280, 50, 50, { shape: 'triangle' });
new GameObject(380, 50, 50, { shape: 'polygon', sides: 5 });
new GameObject(480, 50, {
  vertices: [[0, -30], [25, 20], [-25, 20]],                   // points around the centre
});
```

[[demo: shapes | 300]]

> **Watch out:** custom shapes made from `vertices` should be **convex**, meaning no dents or inward corners, like a star has. Dented shapes need an extra library, so build them from several simple objects instead.

## How it looks

| Option | What it does | Default |
|---|---|---|
| `color` | The inside color, like p5's `fill()`. Any p5 color: `'red'`, `'#ff8800'`, `[255, 0, 0]`. `null` for none. | random pastel |
| `stroke` | The outline color, like p5's `stroke()`. `null` for no outline. | black |
| `strokeWeight` | Outline thickness | `1` |
| `opacity` | `0` (invisible) to `255` (solid) | `255` |
| `label` | Text drawn in the middle of the object | none |
| `labelColor`, `labelSize` | Color and size of the label | black, `14` |
| `visible` | `false` hides it (it still collides!) | `true` |
| `depth` | Drawing order. Higher numbers are drawn on top. | `0` |
| `flipX`, `flipY` | Mirror the object (handy for images facing left/right) | `false` |
| `showRotation` | Circles draw a line so you can see them roll | `true` |

You can change the colors at any time. `fill()` works just like p5's `fill()`, so any color p5 understands works here too:

```js
player.color = 'gold';       // set the color directly...
player.fill(255, 200, 0);    // ...or the p5 way
player.fill(0, 0, 255, 128); // with transparency
player.stroke = 'navy';      // outline color
player.stroke = null;        // no outline
player.strokeWeight = 4;
```

There are 148 color names to choose from, like `'tomato'`, `'seagreen'` and `'midnightblue'`. See them all in the [color names](api.html#color-names) list.

[[demo: appearance | 300]]

## Images

To make an object look like a picture, load an image and pass it as the `image` option. In p5.js 2.x, load images in an **`async setup()`** with **`await`**:

```js
let crateImg;

async function setup() {
  createCanvas(640, 320);
  crateImg = await loadImage('crate.png');

  new GameObject(320, 100, 48, 48, { image: crateImg });
}
```

The picture is stretched to the object's width and height. The physics shape is still a box underneath, so for round pictures add `shape: 'circle'` to make the object roll properly:

```js
new GameObject(200, 100, 48, { image: ballImg, shape: 'circle', bounce: 0.8 });
```

To use the image at its own size, give the object the image's size:

```js
new GameObject(200, 100, crateImg.width, crateImg.height, { image: crateImg });
```

[[demo: images | 320]]

You can swap the picture any time with `obj.image = otherImage`. To nudge the picture inside its shape (for art that isn't centred in its file), use `imageOffsetX` and `imageOffsetY`. Animated pictures have their own section: [Spritesheets and Animations](animation.html).

> **Tip:** with `world.debug = true` you can see whether the physics shape matches your picture.

## Changing size

```js
box.width = 120;         // physics shape changes too
box.height = 20;
box.setSize(80, 80);
```

For circles, triangles and polygons, setting `width` or `height` changes both.

## Remembering things: `name` and `data`

Every object has a `name` and a `data` object for your own information, like health or points:

```js
let enemy = new GameObject(300, 100, 40, { name: 'slime' });
enemy.data.health = 3;
enemy.data.points = 50;

// later…
enemy.data.health--;
if (enemy.data.health <= 0) enemy.destroy();
```

## Removing objects

- **`obj.destroy()`** removes the object from the world and from every group.
- **`obj.destroyed`** is `true` once it's gone.
- **`lifespan`** is a number of frames after which the object destroys itself. It's perfect for bullets, sparks and explosions.
- **`obj.isOffscreen()`** is `true` when the object is completely off the screen.

```js
// a spark that disappears after one second (60 frames)
new GameObject(x, y, 6, { shape: 'circle', lifespan: 60 });

// clean up things that fell off the bottom
if (rock.isOffscreen(100)) rock.destroy();
```

[[demo: lifespan | 320]]

## Making your own kind of object

When several objects behave the same way, make a **class** that `extends GameObject`. You get everything a GameObject has, plus your own code.

- **`update()`** runs every frame, just before the physics step. Put behaviour here.
- **`drawShape(p)`** draws the object. `(0, 0)` is the object's centre and the drawing is already rotated. Override it to give your object a custom look. Use `p.` in front of p5 functions.

```js
class Robot extends GameObject {
  constructor(x, y) {
    super(x, y, 60, 70, { fixedRotation: true, cornerRadius: 10 });
    this.data.blink = 0;
  }

  update() {
    // blink every now and then
    if (random() < 0.01) this.data.blink = 8;
    if (this.data.blink > 0) this.data.blink--;
  }

  drawShape(p) {
    p.fill(140, 160, 190);
    p.stroke(60);
    p.rect(0, 0, this.width, this.height, 10);   // rectMode is CENTER in here
    p.fill(255);
    let eyeH = this.data.blink > 0 ? 2 : 16;
    p.ellipse(-12, -10, 16, eyeH);
    p.ellipse(12, -10, 16, eyeH);
  }
}
```

[[demo: custom-class | 320]]

> **Tip:** inside `drawShape`, the drawing is already moved to the centre of the object and rotated, and `rectMode` and `ellipseMode` are `CENTER`.

> **Watch out:** don't give your class a property with a built-in name, like `speed = 5` at the top of the class. It hides the real `speed`, so changing it does nothing. Pick another name (`topSpeed`), or set the real one in the constructor after `super()`: `this.speed = 5`. If you forget, GameObjects prints a warning in the console.

GameObjects comes with one ready-made character class: **Mochi**, a soft little blob that blinks, has moods and can walk and jump. Try `new Mochi(200, 100)`, and see the [API reference](api.html#mochi) and [Mochi's Snack Hunt](example-snack-hunt.html).

## Quick reference

| | |
|---|---|
| `x`, `y` | Centre position |
| `width`, `height`, `setSize(w, h)` | Size |
| `rotation` | Angle in degrees |
| `shape` | `'box'`, `'circle'`, `'triangle'`, `'polygon'` or `'custom'` (read only) |
| `color`, `fill(...)`, `stroke`, `strokeWeight`, `opacity` | Colors |
| `image`, `imageOffsetX`, `imageOffsetY` | Picture |
| `label`, `labelColor`, `labelSize` | Text on the object |
| `visible`, `depth`, `flipX`, `flipY` | Drawing |
| `name`, `data` | Your own information |
| `lifespan`, `destroy()`, `destroyed`, `isOffscreen()` | Removing |
| `update()`, `drawShape(p)` | Override these in your own class |
