# Movement

There are several ways to make a game object move. Some are like teleporting, some like steering, and some like pushing. Picking the right one makes your game feel right.
{: .lead }

## Teleporting: `x`, `y` and `setPosition`

Setting the position moves an object **instantly**, without passing through the space in between:

```js
player.x = 100;
player.y = 50;
player.setPosition(100, 50);   // same thing, in one line
```

Use it for respawning, wrapping around the screen, and placing things at the start of a level. Don't use it every frame to move the player around: the physics engine can't stop you going through walls when you teleport.

## Velocity: steady movement

**Velocity** is how many pixels an object moves each frame. Setting velocity is the easiest way to control a player, because physics still works: you'll stop at walls and push things.

```js
player.velocityX = 5;          // 5 pixels per frame to the right
player.velocityY = -10;        // upward (y goes down the screen!)
player.setVelocity(3, -2);     // both at once
player.stop();                 // velocity and spin back to 0
```

A typical top-down control scheme:

```js
function draw() {
  background(220);
  let vx = 0;
  let vy = 0;
  if (keyIsDown(LEFT_ARROW))  vx = -4;
  if (keyIsDown(RIGHT_ARROW)) vx = 4;
  if (keyIsDown(UP_ARROW))    vy = -4;
  if (keyIsDown(DOWN_ARROW))  vy = 4;
  player.setVelocity(vx, vy);
}
```

[[demo: velocity-topdown | 320 | keys]]

> **Tip:** in a platformer, only set **`velocityX`** from the keys and leave `velocityY` alone, so gravity keeps working. See [Player Input](input-camera.html).

## Speed and direction

Sometimes it's easier to think in *how fast* and *which way*:

```js
ball.speed;            // how fast it's going, in pixels per frame
ball.direction;        // which way it's going, in degrees (0 = right, 90 = down)

ball.speed = 8;        // same direction, new speed
ball.direction = -90;  // same speed, now going straight up
```

`speed` is great for keeping a ball at a constant speed in a Breakout game.

## Pushing: `push` and `applyForce`

Both of these **add** to the current movement instead of replacing it.

- **`push(x, y)`** adds straight to the velocity: an instant kick that ignores weight. Good for jumps, dashes and explosions.
- **`applyForce(x, y)`** is a real physical push: **heavy objects move less**. Call it every frame for things like rocket thrust or wind.

```js
player.push(0, -12);           // a jump
rocket.applyForce(0, -0.5);    // a rocket engine, every frame
```

[[demo: push-vs-force | 300 | keys]]

## Heading toward something

**`moveToward(x, y, speed)`** points an object's velocity at a spot. It's perfect for enemies chasing the player, or homing missiles. You can pass another object instead of a point:

```js
enemy.moveToward(player, 2);          // chase the player at speed 2
ghost.moveToward(mouseX, mouseY, 4);  // chase the mouse
```

[[demo: move-toward | 320]]

## Facing and moving forward

**`rotation`** turns an object (in degrees). **`lookAt()`** turns it to face something, and **`moveForward(speed)`** moves it the way it's facing. Together they make tanks, cars and spaceships:

```js
tank.rotation += 3;          // turn right
tank.lookAt(mouseX, mouseY); // or: face the mouse
tank.moveForward(3);         // drive the way it's pointing
tank.rotationSpeed = 2;      // keep spinning, 2 degrees per frame
```

[[demo: tank | 320 | keys]]

> **Tip:** objects that shouldn't tip over or spin when they bump into things, like most players, need `fixedRotation: true`.

## Moving platforms

A **static** object (`isStatic: true`) is never moved by physics, but **you** can move it by setting its position. When you move it a little each frame, GameObjects treats it as sliding, so things standing on it ride along:

```js
platform.x = 320 + sin(frameCount * 0.02) * 150;
```

[[demo: moving-platform | 320]]

## How far away?

```js
player.distanceTo(enemy);        // distance to another object
player.distanceTo(mouseX, mouseY);

if (enemy.distanceTo(player) < 200) {
  enemy.moveToward(player, 3);   // only chase when close
}
```

## Quick reference

| | |
|---|---|
| `x`, `y`, `setPosition(x, y)` | Teleport |
| `velocityX`, `velocityY`, `setVelocity(x, y)` | Pixels per frame |
| `speed`, `direction` | How fast, which way (degrees) |
| `push(x, y)` | Add to velocity (ignores weight) |
| `applyForce(x, y)` | Physical push (heavier moves less) |
| `moveToward(x, y, speed)`, `moveToward(obj, speed)` | Head toward something |
| `rotation`, `rotationSpeed` | Angle and spin, in degrees |
| `lookAt(x, y)`, `lookAt(obj)` | Turn to face something |
| `moveForward(speed)` | Move the way it's facing |
| `stop()` | Stop moving and spinning |
| `distanceTo(x, y)`, `distanceTo(obj)` | Distance in pixels |
