# GameObjects.js API Reference

Every class, property and method in GameObjects.js. For a step-by-step introduction with live demos, see the [guide](docs/getting-started.html).

**Version 0.1.0** · Requires p5.js (1.x or 2.x) and Matter.js 0.20+

## Contents

- [Loading the library](#loading-the-library)
- [Units and conventions](#units-and-conventions)
- [The frame loop](#the-frame-loop)
- [drawOnTop()](#drawontop)
- [GameObject](#gameobject)
    - [Creating a game object](#creating-a-game-object)
    - [Shapes](#shapes)
    - [Object options](#object-options)
    - [Position and size](#position-and-size)
    - [Movement](#movement)
    - [Physical properties](#physical-properties)
    - [Appearance](#appearance)
    - [Collisions](#collisions)
    - [Mouse](#mouse)
    - [Animation](#animation)
    - [Groups and removal](#groups-and-removal)
    - [Extending GameObject](#extending-gameobject)
- [GameGroup](#gamegroup)
    - [Creating a group](#creating-a-group)
    - [Group members](#group-members)
    - [Looping and searching](#looping-and-searching)
    - [Changing and removing](#changing-and-removing)
    - [Group collisions](#group-collisions)
- [GameWorld](#gameworld)
    - [World options](#world-options)
    - [World properties](#world-properties)
    - [World methods](#world-methods)
    - [More than one world](#more-than-one-world)
    - [Walls](#walls)
    - [Joints](#joints)
- [GameCamera](#gamecamera)
- [GameLink](#gamelink)
- [The GameObjects namespace](#the-gameobjects-namespace)
- [Collision targets and callbacks](#collision-targets-and-callbacks)
- [Input: mouse and keys](#input-mouse-and-keys)
    - [Keyboard](#keyboard)
    - [Key codes](#key-codes)
    - [Mouse (p5.js)](#mouse-p5js)
    - [GameObjects mouse extras](#gameobjects-mouse-extras)
- [Color names](#color-names)

---

## Loading the library

Load the scripts in this order in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/dstein-art/gameObjects@v0.1/gameobjects.min.js"></script>
<script src="sketch.js"></script>
```

p5.sound is optional: GameObjects doesn't need it.

GameObjects adds these globals: **`world`** (a [GameWorld](#gameworld) created automatically), `GameWorld`, `GameObject`, `GameGroup` and the `GameObjects` namespace. It works in p5.js global mode and instance mode. If Matter.js isn't loaded first, it throws an error explaining how to fix it.

## Units and conventions

| Quantity | Unit |
|---|---|
| Position, width, height | pixels; `x` and `y` are the **centre** of an object |
| Velocity, speed | pixels per frame |
| `rotation`, `direction`, `rotationSpeed` | degrees (0 = pointing right, positive = clockwise) |
| `angle` | radians |
| `lifespan`, `frameDelay` | frames |
| Colors | anything p5's `fill()` accepts: a [color name](#color-names) like `'red'`, `'#ff8800'`, `[255, 0, 0]`, `[255, 0, 0, 128]`, a `p5.Color`, or `null` for none |

Rotation is always in degrees, whatever `angleMode()` is set to. Most methods that change an object return the object, so calls can be chained: `ball.setPosition(100, 50).setVelocity(3, 0)`.

## The frame loop

Each frame, while a world is current:

1. **Before `draw()`**, the world's `update()` runs: mouse dragging, each object's `update()`, one physics step (collision callbacks run here), then animations, lifespans and the camera.
2. **Your `draw()`** runs.
3. **After `draw()`**, the world's `draw()` draws every link and object (sorted by `depth`) through the camera.
4. **Then your `drawOnTop()`** runs, if the sketch has one (see [drawOnTop()](#drawontop)).

For the first 5 seconds a sketch runs, a small "created with GameObjects.org" note is shown in the top right, over everything, then it fades away.

If your sketch calls `world.update()` or `world.draw()` itself, the automatic step is skipped for that frame. Calling `update()` yourself switches `autoUpdate` off. Physics runs at a fixed step of 1/60 s per frame, so the game runs in slow motion if the frame rate drops.

## drawOnTop()

An optional function your sketch can define, like `setup()` and `draw()`. If it exists, GameObjects calls it every frame **after** all the game objects are drawn, so whatever it draws is on top: a score, lives, messages, a title or game-over screen.

```js
function draw() {
  background(220);
  // game logic: input, rules...
}

function drawOnTop() {
  fill(0);
  textSize(20);
  text('Score: ' + score, 10, 30);
}
```

- **Optional.** If it isn't defined, nothing changes.
- **Screen space.** It's drawn with the transform reset, so the camera doesn't move or zoom it. Use `world.camera.begin()` / `world.camera.end()` inside it to draw something in world coordinates.
- **Isolated.** Its drawing settings (`fill`, `textAlign`, `translate`, ...) are wrapped in `push()` / `pop()`, so they don't affect the next frame.
- **Always runs.** It runs even when `world.paused` is `true` or `world.autoDraw` is `false`.
- **Instance mode:** set `p.drawOnTop = () => { ... }`.
- **Spelling:** if `drawOnTop` isn't defined but a function with a similar name is (for example `drawontop` or `postdraw`), a hint is printed in the console once.

---

## GameObject

One physical thing in the game.

### Creating a game object

```js
new GameObject(x, y)                          // a 40 × 40 box
new GameObject(x, y, size)                    // a square
new GameObject(x, y, width, height)
new GameObject(x, y, width, height, options)
new GameObject(x, y, size, options)
new GameObject(options)                       // options.x, options.y, options.width, options.height
```

If `x` and `y` are missing, the object is placed at the centre of the canvas. The new object is added to the current world (or `options.world`) and to `world.objects`.

### Shapes

Set with the `shape` option. Once made, `obj.shape` is read only.

| `shape` | Size | Notes |
|---|---|---|
| `'box'` (default) | `width` × `height` | `cornerRadius` rounds the corners. `'rect'` and `'rectangle'` also work. |
| `'circle'` | `width` is the diameter | Draws a line from the centre so you can see it roll (`showRotation`) |
| `'triangle'` | `width` is the diameter | Equal sides, one point facing right at rotation 0 |
| `'polygon'` | `width` is the diameter | `sides` sets the number of sides (default `6`) |
| `'custom'` | from the points | Give `vertices: [[x, y], ...]` around the centre. They should make a convex shape. |

### Object options

Every option can also be read and changed later as a property, unless it's marked otherwise.

| Option | Default | Description |
|---|---|---|
| `shape` | `'box'` | See [Shapes](#shapes) (only when creating) |
| `sides` | `6` | Sides of a `'polygon'` (only when creating) |
| `vertices` | | Points of a custom shape (only when creating) |
| `cornerRadius` | `0` | Rounded corners for boxes (set only when creating) |
| `isStatic` | `false` | Never moved by physics |
| `isSensor` | `false` | Detects touches but doesn't collide |
| `bounce` | `0.2` | `0` to `1` |
| `friction` | `0.1` | `0` (ice) to `1` (sticky) |
| `airFriction` | `0.01` | Slows the object down all the time |
| `density` | `0.001` | Weight per area |
| `mass` | from density | Total weight |
| `rotation` | `0` | Starting angle in degrees |
| `fixedRotation` | `false` | Never spins |
| `color` | random pastel | The fill color (what p5's `fill()` sets), or `null` for none. Can also be set with the [`fill()`](#appearance) method. Any p5 color works, including the 148 [color names](#color-names). |
| `stroke` | `0` (black) | The outline color (what p5's `stroke()` sets), or `null` for none |
| `strokeWeight` | `1` | Outline thickness |
| `opacity` | `255` | `0` to `255` |
| `image` | `null` | A `p5.Image` or `p5.Graphics`, stretched to the object's size |
| `imageOffsetX`, `imageOffsetY` | `0` | Move the picture inside the object |
| `label` | `null` | Text drawn at the centre |
| `labelColor`, `labelSize` | `0`, `14` | |
| `visible` | `true` | `false` hides it (it still collides) |
| `depth` | `0` | Higher numbers are drawn on top |
| `flipX`, `flipY` | `false` | Mirror the drawing |
| `showRotation` | `true` | Line on circles showing rotation |
| `draggable` | `false` | Can be dragged with the mouse |
| `lifespan` | `Infinity` | Frames until the object destroys itself |
| `name` | `''` | For your own use |
| `data` | `{}` | For your own information: `obj.data.health = 3` |
| `group` | | A GameGroup (or array of groups) to join (only when creating) |
| `world` | the current world | The world to add the object to (only when creating) |

### Position and size

| Member | Description |
|---|---|
| `x`, `y` | Centre position. Setting it teleports the object. |
| `setPosition(x, y)` | Teleport. Keeps the velocity. |
| `rotation` | Angle in degrees |
| `angle` | Angle in radians |
| `lookAt(x, y)`, `lookAt(obj)` | Turn to face a point or object, and stop spinning |
| `width`, `height` | Size. Setting either resizes the physics shape. For circles, triangles and polygons, both change together. |
| `setSize(width, height)` | Resize. `height` defaults to `width`. |
| `distanceTo(x, y)`, `distanceTo(obj)` | Distance from the centre, in pixels |
| `isOffscreen(margin)` | `true` when the object is completely outside the camera's view, plus `margin` pixels (default `0`) |

**Moving static objects:** setting `x`, `y`, `rotation` or calling `setPosition()` on a static object in steps smaller than 50 px (or 0.5 radians) each frame counts as sliding, so things standing on it are carried along. Bigger jumps are teleports.

### Movement

| Member | Description |
|---|---|
| `velocityX`, `velocityY` | Velocity in pixels per frame |
| `setVelocity(vx, vy)` | Set both parts |
| `speed` | Pixels per frame. Setting it keeps the direction. |
| `direction` | Direction of travel in degrees. Setting it keeps the speed. |
| `rotationSpeed` | Spin in degrees per frame |
| `push(vx, vy)` | Add to the velocity. Ignores weight. |
| `applyForce(fx, fy)` | Push from the centre. Heavier objects move less. Values around `0.1`–`5` suit objects of normal size. |
| `moveToward(x, y, speed)`, `moveToward(obj, speed)` | Point the velocity at a target. `speed` defaults to `3`. Slows down to arrive exactly. |
| `moveForward(speed)` | Move the way the object is facing (its `rotation`). `speed` defaults to `3`. |
| `stop()` | Zero velocity and spin |

### Physical properties

| Property | Description |
|---|---|
| `isStatic` | Never moved by physics. Can be switched on and off. |
| `isSensor` | Overlaps instead of colliding, but still reports touches |
| `bounce` | `0` to `1`. Two touching objects use the higher bounce. |
| `friction` | `0` to `1`. Two touching objects use the lower friction. |
| `airFriction` | Slowing down over time |
| `density` | Changing it updates the mass |
| `mass` | Total weight |
| `fixedRotation` | Never spins |
| `body` | The Matter.js body, for advanced use |
| `world` | The GameWorld the object belongs to (read only) |

### Appearance

| Property | Description |
|---|---|
| `color` | The fill color, or `null` for none |
| `fill(...)` | Set `color` using the same arguments as p5's `fill()`: `obj.fill('red')`, `obj.fill(255, 0, 0)`, `obj.fill(0, 128)`, `obj.fill(null)`. Returns the object. |
| `stroke`, `strokeWeight` | The outline color (or `null` for none) and its thickness |
| `opacity` | `0` (invisible) to `255` (solid) |
| `image` | A picture instead of a shape |
| `imageOffsetX`, `imageOffsetY` | Move the picture inside the object |
| `label`, `labelColor`, `labelSize` | Text at the centre |
| `visible` | Hide or show |
| `depth` | Drawing order |
| `flipX`, `flipY` | Mirror |
| `showRotation` | Line on circles |
| `draw()` | Draw the object now. The world normally does this. |

### Collisions

See [Collision targets and callbacks](#collision-targets-and-callbacks) for what `target` can be.

| Method | Returns | Description |
|---|---|---|
| `onCollide(target, fn)` | object | Run `fn(thisObject, other)` once, when touching starts |
| `onCollideEnd(target, fn)` | object | Run `fn(thisObject, other)` once, when touching stops |
| `whileTouching(target, fn)` | object | Run `fn(thisObject, other)` every frame while touching |
| `isTouching(target)` | boolean | Touching right now? |
| `getTouching()` | array | Everything touching this object |
| `ignore(target)` | object | Pass through `target` without colliding or reporting touches. Up to 30 objects or groups can have `ignore()` rules at the same time; destroying an object or calling `unignore()` frees its place. Prefer ignoring a whole group. |
| `unignore(target)` | object | Collide with `target` again |

### Mouse

| Member | Description |
|---|---|
| `isMouseOver()` | `true` if the mouse is over the object's shape (uses world coordinates) |
| `draggable` | Can be grabbed and thrown. Static objects are moved directly. |
| `isDragging` | `true` while the object is being dragged (read only) |

### Animation

| Member | Description |
|---|---|
| `addAnimation(name, frames, frameDelay, loop)` | Add an animation. `frames` is an array of `p5.Image` or `p5.Graphics`. `frameDelay` (default `6`) is how many frames each picture is shown. `loop` defaults to `true`. The first animation added starts playing. |
| `playAnimation(name, restart)` | Switch animation. If it's already playing it carries on, unless `restart` is `true`. |
| `pauseAnimation()` | Freeze on the current frame |
| `animation` | Name of the current animation, or `null` (read only) |
| `animationFrame` | Index of the current picture. Can be set. |
| `animationDone` | `true` when a non-looping animation has finished (read only) |

A playing animation is drawn instead of `image` and the shape. Use [`GameObjects.spriteSheet()`](#the-gameobjects-namespace) to cut frames out of a sheet.

### Groups and removal

| Member | Description |
|---|---|
| `groups` | Array of the groups the object is in (read only) |
| `isIn(group)` | Is the object in this group? |
| `destroy()` | Remove from the world, every group, joints, the camera and the mouse. Safe inside collision callbacks. |
| `destroyed` | `true` once destroyed |
| `lifespan` | Frames left before it destroys itself (`Infinity` = never) |
| `name`, `data` | Your own information |

### Extending GameObject

Make your own kinds of object with `class ... extends GameObject` and override these two methods:

| Method | Description |
|---|---|
| `update()` | Runs once every frame, just before the physics step. Empty by default. |
| `drawShape(p)` | Draws the object. `(0, 0)` is the object's centre, the drawing is already rotated and flipped, and `rectMode`, `ellipseMode` and `imageMode` are `CENTER`. `p` is the p5 instance: use `p.fill()`, `p.rect()` and so on. |

```js
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y, 30, { fixedRotation: true });
    this.data.health = 3;
  }
  update() {
    this.moveToward(player, 2);
  }
  drawShape(p) {
    p.fill('purple');
    p.circle(0, 0, this.width);
  }
}
```

---

## GameGroup

A collection of game objects. An object can be in any number of groups.

### Creating a group

```js
let coins = new GameGroup();
let coins = new GameGroup({ shape: 'circle', isSensor: true, isStatic: true, color: 'gold' });
```

The optional object holds **defaults** for objects made with `create()`. Its `name` (if given) becomes the group's `name`.

| Property | Description |
|---|---|
| `defaults` | The defaults used by `create()`. Can be changed. |
| `name` | For your own use |

### Group members

| Member | Returns | Description |
|---|---|---|
| `create(x, y, width, height, options)` | GameObject | Make a new object with the group's defaults (overridden by `options`) and add it to the group. Takes the same arguments as `new GameObject()`. Members don't inherit the group's `name`, but a `name` in `options` is used. |
| `add(...objects)` | group | Add objects or arrays of objects. Destroyed objects and existing members are skipped. |
| `remove(obj)` | group | Take an object out of the group. It stays in the world. |
| `has(obj)` | boolean | Is the object in this group? |
| `length`, `size` | number | Number of objects |
| `get(i)` | GameObject | Object at position `i` |
| `first`, `last` | GameObject | First and last object |
| `random()` | GameObject | A random member |

### Looping and searching

Groups can be looped over with `for (let obj of group)`. It's safe to destroy objects while looping.

| Method | Returns | Description |
|---|---|---|
| `forEach(fn)` | group | Run `fn(obj, index)` for each member |
| `filter(fn)`, `map(fn)` | array | Like the array methods |
| `find(fn)` | GameObject | First member where `fn(obj)` is true |
| `some(fn)`, `every(fn)` | boolean | Like the array methods |
| `toArray()` | array | A copy of the members as a plain array |
| `closestTo(x, y)`, `closestTo(obj)` | GameObject | The nearest member (an object is never closest to itself) |

### Changing and removing

| Method | Returns | Description |
|---|---|---|
| `set(properties)` | group | Assign properties to every member: `group.set({ color: 'red', bounce: 1 })` |
| `destroyAll()` | group | Destroy every member |
| `draw()` | group | Draw the members now, sorted by `depth` |

### Group collisions

The same as for a single object, but they apply to **every** member, including ones added later. In callbacks, the first argument is the member involved.

| Method | Returns | Description |
|---|---|---|
| `onCollide(target, fn)` | group | `fn(member, other)` once, when touching starts |
| `onCollideEnd(target, fn)` | group | `fn(member, other)` once, when touching stops |
| `whileTouching(target, fn)` | group | `fn(member, other)` every frame while touching |
| `isTouching(target)` | boolean | Is any member touching `target`? |
| `ignore(target)` | group | Members pass through `target`. `group.ignore(group)` makes members ignore each other. |
| `unignore(target)` | group | Collide again |

`ignore()` can be used by up to 30 different groups and objects. Ignores add up: an object in a group that ignores walls won't hit walls, even if it's in other groups too.

---

## GameWorld

The physics world: gravity, every object, the camera, joints and drawing.

**You don't need to make one.** GameObjects creates a world when it loads and makes it available as the global **`world`**. Change its settings in `setup()`:

```js
function setup() {
  createCanvas(640, 360);
  world.gravityY = 0;      // a top-down game
  world.debug = true;
  new GameObject(100, 100, 40);
}
```

You can still make a world yourself, for example to pass options all at once. Making a world makes it the **current** world, the one new objects go into and the one `world` refers to:

```js
world = new GameWorld({ gravityY: 0, debug: true });
```

If your sketch declares its own `let world`, your variable is used instead of the built-in one, and the old style keeps working: `let world;` then `world = new GameWorld();` in `setup()`.

### World options

| Option | Default | Description |
|---|---|---|
| `gravityX` | `0` | Sideways gravity |
| `gravityY` | `1` | Downward gravity. Use `0` for space or top-down games. |
| `debug` | `false` | Draw physics outlines (see `debug` below) |
| `autoUpdate` | `true` | Update automatically before `draw()` |
| `autoDraw` | `true` | Draw automatically after `draw()`. Turn it off to call `world.draw()` yourself at a different moment. For text on top, use [`drawOnTop()`](#drawontop) instead. |
| `timeScale` | `1` | Speed of time: `0.5` is slow motion |
| `background` | `null` | If set, the world clears the canvas with this color before drawing |

### World properties

| Property | Type | Description |
|---|---|---|
| `gravityX`, `gravityY` | number | Gravity. Read or change any time. |
| `objects` | GameGroup | Every object in the world |
| `camera` | GameCamera | The camera (see [GameCamera](#gamecamera)) |
| `paused` | boolean | `true` freezes physics, animations and lifespans. Objects are still drawn. |
| `timeScale` | number | `1` is normal, `0.3` slow motion, `2` fast |
| `debug` | boolean | Draws every physics outline: green normally, red while touching, orange for sensors, with a magenta cross at each centre |
| `background` | color or `null` | Clears the canvas before the world draws |
| `autoUpdate`, `autoDraw` | boolean | Automatic update and draw (see [The frame loop](#the-frame-loop)) |
| `mouseX`, `mouseY` | number | Mouse position in **world** coordinates (read only). Differs from p5's `mouseX` once the camera moves. |
| `mouse` | `{ x, y }` | Both of the above at once (read only) |
| `dragging` | GameObject or `null` | The object being dragged with the mouse (read only) |
| `links` | array of GameLink | Every joint in the world (read only) |
| `frame` | number | How many physics steps have run (read only) |
| `engine` | Matter.Engine | The Matter.js engine, for advanced use |

### World methods

| Method | Returns | Description |
|---|---|---|
| `setGravity(x, y)` | world | Set both parts of gravity |
| `update()` | world | Run one frame: dragging, `update()` on each object, physics, collisions, animations, lifespans, camera. Called automatically. |
| `draw()` | world | Draw all links and objects through the camera. Called automatically. |
| `addWalls(options)` | GameGroup | Static walls around the canvas. See [Walls](#walls). |
| `connect(a, b, options)` | GameLink | Join two objects. See [Joints](#joints). |
| `pin(obj, x, y, options)` | GameLink | Pin an object to a point in the world. See [Joints](#joints). |
| `objectsAt(x, y)` | array | Objects under a point (world coordinates) |
| `raycast(x1, y1, x2, y2, width)` | array | Objects crossed by a line, nearest to `(x1, y1)` first. `width` defaults to `1`. |
| `clear()` | world | Destroy every object and link. Groups keep their settings and collision rules. |
| `makeCurrent()` | world | Make this the current world: new objects go into it, it runs automatically, and the global `world` refers to it |

### More than one world

Most games need only one world. Use `world.clear()` to restart or change levels. A second world is useful when you want two separate physics scenes, such as a title screen with its own falling letters while a paused game waits underneath.

- Only the **current** world (the newest, or the one you called `makeCurrent()` on) updates and draws by itself. Run any other world with `otherWorld.update()` and `otherWorld.draw()`.
- New objects go into the current world, or the world given in their `world` option. Objects can't move between worlds.
- The limit of 30 groups/objects using `ignore()` is shared by all worlds.

### Walls

`world.addWalls(options)` makes four static walls around the canvas (or around any rectangle you give it) and returns them as a GameGroup. The group also has `top`, `bottom`, `left` and `right` properties.

| Option | Default | Description |
|---|---|---|
| `x`, `y`, `width`, `height` | the canvas | The area to wall in |
| `thickness` | `100` | Wall thickness. The walls sit just outside the area. |
| `color`, `stroke` | `null` | Invisible by default |
| `bounce`, `friction` | `0.2`, `0.1` | |
| `top` | `true` | `false` leaves the top open |

```js
let walls = world.addWalls();
walls.bottom.destroy();                                    // an open bottom, like Breakout
world.addWalls({ x: 0, y: 0, width: 2000, height: 1400 }); // a big level
```

### Joints

`world.connect(a, b, options)` joins two GameObjects. `world.pin(obj, x, y, options)` joins one object to a fixed point in the world (`x` and `y` default to the object's position). Both return a [GameLink](#gamelink).

| Option | `connect` default | `pin` default | Description |
|---|---|---|---|
| `length` | current distance | current distance | Distance to keep |
| `stiffness` | `0.7` | `1` | `1` = solid rod, `0.01` = very stretchy |
| `damping` | `0` | `0` | `0` to `1`. Higher values stop the wobbling sooner. |
| `offsetA`, `offsetB` | `{x: 0, y: 0}` | | `connect`: attach points on `a` and `b`, from their centres |
| `offset` | | `{x: 0, y: 0}` | `pin`: attach point on the object, from its centre |

```js
world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });  // a spring
world.pin(ball, 320, 40);                                             // a pendulum
```

---

## GameCamera

Every world has one, as `world.camera`. It chooses which part of the world is shown. By default it shows the canvas area, so world and screen coordinates match.

| Member | Description |
|---|---|
| `x`, `y` | The world point at the centre of the screen. Defaults to the centre of the canvas. |
| `zoom` | `1` is normal, `2` is twice as close |
| `follow(obj, ease, offsetX, offsetY)` | Follow an object each frame. `ease` (default `0.1`) is how much of the gap closes per frame: `1` locks on. Offsets shift the view. Stops automatically if the object is destroyed. |
| `stopFollowing()` | Stop following |
| `reset()` | Back to the canvas centre, zoom `1`, not following |
| `screenToWorld(x, y)` | Convert a screen point to `{ x, y }` in the world |
| `worldToScreen(x, y)` | Convert a world point to `{ x, y }` on the screen |
| `viewBounds()` | `{ left, top, right, bottom }` of the visible area, in world coordinates |
| `begin()`, `end()` | Draw your own things in world space between these two calls |

---

## GameLink

A joint made by `world.connect()` or `world.pin()`.

| Member | Description |
|---|---|
| `a`, `b` | The two objects (`a` is `null` for a pin) |
| `length` | Distance to keep. Can be changed. |
| `stiffness` | `0` to `1`. Can be changed. |
| `visible` | Draw the link as a line (default `true`) |
| `stroke`, `strokeWeight` | Line style (default `80`, `2`) |
| `destroy()` | Remove the joint. Joints are also removed when either object is destroyed. |
| `destroyed` | `true` once removed |
| `constraint` | The Matter.js constraint, for advanced use |

---

## The GameObjects namespace

| Member | Description |
|---|---|
| `GameObjects.spriteSheet(image, frameWidth, frameHeight, count, start)` | Cut a sprite sheet into an array of frames, reading left to right, top to bottom. `frameHeight` defaults to `frameWidth`. `count` (default: all) and `start` (default `0`) choose a run of frames. |
| `GameObjects.world` | The current world (the same as the global `world`) |
| `GameObjects.currentWorld` | The current world |
| `GameObjects.Matter` | The Matter.js library |
| `GameObjects.version` | `'0.1.0'` |
| `GameObjects.GameWorld`, `.GameObject`, `.GameGroup`, `.GameCamera`, `.GameLink` | The classes |

```js
let sheet = await loadImage('hero.png');
let run = GameObjects.spriteSheet(sheet, 48, 48, 4, 4);   // frames 4, 5, 6, 7
```

---

## Collision targets and callbacks

The collision methods (`onCollide`, `onCollideEnd`, `whileTouching`, `isTouching`, `ignore`) take a **target**:

| Target | Meaning |
|---|---|
| a GameObject | just that object |
| a GameGroup | any member of the group, including members added later |
| left out | anything at all (not for `ignore`) |

```js
player.onCollide(coins, (me, coin) => coin.destroy());   // any coin
ball.onCollide((me, other) => bumpSound.play());         // anything
```

Callbacks are given `(self, other)`. For groups, `self` is the member involved.

- **Timing:** callbacks run during the physics step, before your `draw()`.
- **Destroying:** objects destroyed inside a callback are removed safely after the step.
- **Sensors** (`isSensor: true`) trigger callbacks and `isTouching()` but don't collide.
- **Ignored** pairs never trigger them.
- **Changing levels:** do it from `draw()` (for example after checking `isTouching()`), not from inside a callback.

---

## Input: mouse and keys

GameObjects uses p5.js's own keyboard and mouse tools, and adds a few extras for game objects and the camera. This section lists both. For a walkthrough with demos, see [Player Input and Camera](https://www.gameobjects.org/docs/input-camera.html).

### Keyboard

These come from p5.js.

| Name | Description |
|---|---|
| `keyIsDown(code)` | `true` for **every frame** the key is held. Check it in `draw()` for walking, steering and thrust. |
| `keyPressed()` | Write this function and p5 runs it **once** each time a key goes down. Use it for jumping, shooting and pausing. |
| `keyReleased()` | Runs once each time a key comes up |
| `key` | The last key pressed, as a character: `'a'`, `'A'`, `' '` |
| `keyCode` | The last key pressed, as a number |
| `keyIsPressed` | `true` while any key is held |

```js
function draw() {
  if (keyIsDown(LEFT_ARROW)) player.velocityX = -5;   // held
  if (keyIsDown(RIGHT_ARROW)) player.velocityX = 5;
}

function keyPressed() {
  if (key === ' ') player.velocityY = -12;            // once per press
  if (keyCode === ESCAPE) world.paused = !world.paused;
}
```

### Key codes

`keyIsDown()` and `keyCode` use numbers. p5 names the common ones:

| Key | Code |
|---|---|
| Arrow keys | `LEFT_ARROW`, `RIGHT_ARROW`, `UP_ARROW`, `DOWN_ARROW` |
| Enter, Escape, Backspace, Delete, Tab | `ENTER`, `ESCAPE`, `BACKSPACE`, `DELETE`, `TAB` |
| Shift, Control, Option/Alt | `SHIFT`, `CONTROL`, `OPTION` (`ALT` in p5 2.x) |
| Space bar | `32` |
| Letters | The capital letter's code: `65` (A) to `90` (Z), or `'W'.charCodeAt(0)` |
| Number keys | `48` (0) to `57` (9) |

### Mouse (p5.js)

These come from p5.js. `mouseX` and `mouseY` are **screen** positions: once the camera moves, use the GameObjects versions below.

| Name | Description |
|---|---|
| `mouseX`, `mouseY` | The mouse position on the canvas (screen coordinates) |
| `mouseIsPressed` | `true` while a mouse button is held |
| `mouseButton` | Which button: `LEFT`, `RIGHT` or `CENTER` |
| `mousePressed()` | Runs once when a button goes down |
| `mouseReleased()` | Runs once when a button comes up |
| `mouseClicked()` | Runs once after a full click (down and up) |
| `mouseDragged()` | Runs every time the mouse moves with a button held |
| `mouseWheel(event)` | Runs when the wheel scrolls. `event.delta` is positive for scrolling down. |

### GameObjects mouse extras

| Name | Description |
|---|---|
| `world.mouseX`, `world.mouseY` | The mouse position in the **game world**, which takes the camera's position and zoom into account |
| `world.mouse` | Both at once, as `{ x, y }` |
| `obj.isMouseOver()` | `true` if the mouse is over the object's shape |
| `draggable` | An object option: when `true`, the player can grab the object and throw it |
| `obj.isDragging` | `true` while the object is being dragged |
| `world.dragging` | The object being dragged, or `null` |
| `world.objectsAt(x, y)` | Every object under a point. Use `world.mouseX`, `world.mouseY` for the mouse. |
| `world.camera.screenToWorld(x, y)` | Convert any screen point, like a touch, to a world point |

```js
function mousePressed() {
  for (let enemy of enemies) {
    if (enemy.isMouseOver()) enemy.destroy();     // click to zap
  }
}

function draw() {
  turret.lookAt(world.mouseX, world.mouseY);      // aim at the mouse, even with the camera moving
}
```

---

## Color names

Any color p5 understands works for `color`, `stroke`, `labelColor` and `fill()`: a name, a hex code like `'#ff8800'`, or numbers like `[255, 136, 0]`. These are the **148 color names**. Put the name in quotes:

```js
let player = new GameObject(200, 100, 40, 60, { color: 'tomato', stroke: 'navy' });
player.fill('seagreen');
```

Names are all lowercase with no spaces. Every name with `gray` in it can also be spelled `grey`, so `'darkgrey'` works too. On the website, click a color to copy its name.

| Family | Names |
|---|---|
| Reds | `indianred` `lightcoral` `salmon` `darksalmon` `crimson` `red` `firebrick` `darkred` |
| Pinks | `pink` `lightpink` `hotpink` `deeppink` `mediumvioletred` `palevioletred` |
| Oranges | `lightsalmon` `coral` `tomato` `orangered` `darkorange` `orange` |
| Yellows | `gold` `yellow` `lightyellow` `lemonchiffon` `lightgoldenrodyellow` `papayawhip` `moccasin` `peachpuff` `palegoldenrod` `khaki` `darkkhaki` |
| Greens | `greenyellow` `chartreuse` `lawngreen` `lime` `limegreen` `palegreen` `lightgreen` `mediumspringgreen` `springgreen` `mediumseagreen` `seagreen` `forestgreen` `green` `darkgreen` `yellowgreen` `olivedrab` `olive` `darkolivegreen` `mediumaquamarine` `darkseagreen` `lightseagreen` `darkcyan` `teal` |
| Blues and cyans | `aqua` `cyan` `lightcyan` `paleturquoise` `aquamarine` `turquoise` `mediumturquoise` `darkturquoise` `cadetblue` `steelblue` `lightsteelblue` `powderblue` `lightblue` `skyblue` `lightskyblue` `deepskyblue` `dodgerblue` `cornflowerblue` `royalblue` `blue` `mediumblue` `darkblue` `navy` `midnightblue` |
| Purples | `lavender` `thistle` `plum` `violet` `orchid` `fuchsia` `magenta` `mediumorchid` `mediumpurple` `rebeccapurple` `blueviolet` `darkviolet` `darkorchid` `darkmagenta` `purple` `indigo` `slateblue` `darkslateblue` `mediumslateblue` |
| Browns | `cornsilk` `blanchedalmond` `bisque` `navajowhite` `wheat` `burlywood` `tan` `rosybrown` `sandybrown` `goldenrod` `darkgoldenrod` `peru` `chocolate` `saddlebrown` `sienna` `brown` `maroon` |
| Whites | `white` `snow` `honeydew` `mintcream` `azure` `aliceblue` `ghostwhite` `whitesmoke` `seashell` `beige` `oldlace` `floralwhite` `ivory` `antiquewhite` `linen` `lavenderblush` `mistyrose` |
| Greys and black | `gainsboro` `lightgray` `silver` `darkgray` `gray` `dimgray` `lightslategray` `slategray` `darkslategray` `black` |
