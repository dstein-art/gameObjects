# Spritesheets and Animations

An **animation** is a list of pictures shown one after another, like a flip book. GameObjects can play animations on any object, switch between them (standing, running, jumping), and cut them out of a **spritesheet** for you.
{: .lead }

## What's a spritesheet?

A spritesheet is one image holding many animation frames, laid out in a grid of equal-sized boxes. This is the one used in the demos below. Each frame is 48 × 48 pixels:

![The hero spritesheet: 4 columns and 3 rows of 48 by 48 pixel frames](assets/hero.png){: style="width: 384px; image-rendering: auto; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 24px 24px; border: 1px solid #ddd; border-radius: 6px;" }

Frames are numbered **left to right, top to bottom**, starting at **0**:

| Row | Frames | Animation |
|---|---|---|
| 1 | 0, 1 (2 and 3 are empty) | standing still ("idle") |
| 2 | 4, 5, 6, 7 | running |
| 3 | 8, 9 | jumping |

## Cutting up a spritesheet

**`GameObjects.spriteSheet(image, frameWidth, frameHeight, count, start)`** cuts a sheet into an array of frames:

```js
let sheet = await loadImage('hero.png');

let all  = GameObjects.spriteSheet(sheet, 48, 48);        // every frame
let idle = GameObjects.spriteSheet(sheet, 48, 48, 2, 0);  // 2 frames, starting at frame 0
let run  = GameObjects.spriteSheet(sheet, 48, 48, 4, 4);  // 4 frames, starting at frame 4
let jump = GameObjects.spriteSheet(sheet, 48, 48, 2, 8);  // 2 frames, starting at frame 8
```

> **Tip:** in p5.js 2.x, load images inside **`async setup()`** using **`await`**. In p5.js 1.x, use `preload()` instead.

## Adding animations to an object

**`addAnimation(name, frames, frameDelay)`** gives an object an animation. **`frameDelay`** is how many frames of your game each picture stays on screen. Bigger numbers make slower animations. The first animation you add starts playing straight away.

```js
hero = new GameObject(100, 100, 48, 48, { fixedRotation: true });
hero.addAnimation('idle', idle, 20);   // slow breathing
hero.addAnimation('run', run, 6);      // quick steps
hero.addAnimation('jump', jump, 8);
```

Switch animations with **`playAnimation(name)`**. If that animation is already playing it carries on smoothly, so it's safe to call every frame:

```js
if (!hero.isTouching(ground))       hero.playAnimation('jump');
else if (abs(hero.velocityX) > 0.5) hero.playAnimation('run');
else                                hero.playAnimation('idle');
```

**Facing left:** draw your art facing right, then mirror it with `flipX`:

```js
if (hero.velocityX < 0) hero.flipX = true;
if (hero.velocityX > 0) hero.flipX = false;
```

[[demo: hero | 320 | keys]]

## Controlling animations

| | |
|---|---|
| `addAnimation(name, frames, frameDelay, loop)` | Add an animation. `loop` is `true` unless you say `false`. |
| `playAnimation(name)` | Switch to an animation (keeps going if it's already playing) |
| `playAnimation(name, true)` | Switch **and** start again from the first frame |
| `pauseAnimation()` | Freeze on the current frame |
| `animation` | The name of the current animation |
| `animationFrame` | Which frame is showing (you can set it too) |
| `animationDone` | `true` when a non-looping animation has finished |

## Play once: non-looping animations

Explosions, "poof" clouds and attacks should play **once**. Pass `false` as the fourth argument, then check `animationDone`:

```js
let boom = new GameObject(x, y, 64, 64, { isSensor: true, isStatic: true });
boom.addAnimation('boom', explosionFrames, 4, false);   // false = don't loop

// in draw():
if (boom.animationDone) boom.destroy();
```

[[demo: coin-spin | 300]]

## Frames from separate images

Frames don't have to come from a spritesheet. Any array of images works, so separately loaded files are fine:

```js
let walk = [
  await loadImage('walk1.png'),
  await loadImage('walk2.png'),
  await loadImage('walk3.png'),
];
hero.addAnimation('walk', walk, 8);
```

You can even **draw frames in code** with `createGraphics()`. The coin demo above draws its "pop" animation that way.

## Tips for good-looking sprites

- **Size the object to the art.** The picture is stretched to the object's `width` and `height`, so give a 48 × 48 frame a 48 × 48 object, or exactly 2× for chunky pixel art.
- **Pixel art looks blurry?** Call `noSmooth()` in `setup()`.
- **Check the physics shape** with `world.debug = true`. Players usually feel best with `fixedRotation: true`.
- **Free art:** sites like [OpenGameArt.org](https://opengameart.org) and [Kenney.nl](https://kenney.nl/assets) have free spritesheets made for games. Check each one's license.

## Quick reference

| | |
|---|---|
| `GameObjects.spriteSheet(img, w, h, count, start)` | Cut frames out of a sheet |
| `image` option / property | A single still picture |
| `addAnimation(name, frames, frameDelay, loop)` | Add an animation |
| `playAnimation(name, restart)` | Switch animation |
| `pauseAnimation()` | Freeze |
| `animation`, `animationFrame`, `animationDone` | What's playing |
| `flipX`, `flipY` | Mirror |
