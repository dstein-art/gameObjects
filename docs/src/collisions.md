# Collisions and Overlaps

Games are mostly about what happens when things touch: the player grabs a coin, a bullet hits an enemy, a ball breaks a brick. GameObjects gives you two kinds of touching, and several ways to react to them.
{: .lead }

## Collisions vs. overlaps

- A **collision** is when two solid objects bump into each other and **bounce off or block** each other. A ball hitting a wall is a collision.
- An **overlap** is when objects **pass through** each other, but you still want to know about it. The player walking through a coin, or into a "finish line" zone, is an overlap.

You make an object that overlaps instead of collides with **`isSensor: true`**. Everything else on this page works the same for both kinds.

```js
let wall = new GameObject(300, 200, 20, 200, { isStatic: true });                // solid
let coin = new GameObject(400, 200, 20, { shape: 'circle', isSensor: true });     // overlap only
```

## Reacting once: `onCollide`

**`onCollide(target, callback)`** runs your code **once**, at the moment two things start touching. Set it up once, in `setup()`:

```js
function setup() {
  // ...
  player.onCollide(coin, () => {
    coin.destroy();
    score++;
  });
}
```

The **target** can be:

- **one GameObject:** `player.onCollide(door, ...)`
- **a GameGroup:** `player.onCollide(coins, ...)` runs for **any** coin
- **nothing:** `ball.onCollide(() => ...)` runs when it touches **anything**

The callback is given **both** objects: first the one you set it up on, then the one it touched. This is how you know *which* coin was collected:

```js
player.onCollide(coins, (me, coin) => {
  coin.destroy();    // destroy the coin we actually touched
  score += 10;
});
```

Groups have `onCollide` too. Then the first object is the member of the group:

```js
bullets.onCollide(enemies, (bullet, enemy) => {
  bullet.destroy();
  enemy.destroy();
});
```

> **Tip:** it's completely safe to `destroy()` objects inside these callbacks.

## When touching stops: `onCollideEnd`

**`onCollideEnd(target, callback)`** runs once, when two things **stop** touching:

```js
player.onCollideEnd(water, () => {
  player.airFriction = 0.01;    // back to normal after leaving the water
});
```

## Every frame while touching: `whileTouching`

**`whileTouching(target, callback)`** runs **every frame** for as long as they touch. It's good for damage from lava, or for charging up on a pad:

```js
player.whileTouching(lava, (me) => {
  me.data.health -= 1;
});
```

[[demo: collide-events | 320]]

## Checking right now: `isTouching`

Sometimes it's easier to **ask** whether something is touching, inside `draw()`. **`isTouching(target)`** is `true` or `false`, and takes the same kinds of target:

```js
if (player.isTouching(platforms)) {
  // standing on (or next to) a platform, so we're allowed to jump
}

if (player.isTouching(exitDoor) && keys === 3) {
  nextLevel();
}

if (ball.isTouching()) { /* touching anything at all */ }
```

`getTouching()` gives you an array of everything an object is touching right now.

## Overlaps with sensors

Sensors are perfect for:

- **things to collect:** coins, stars, power-ups
- **trigger zones:** the finish line, a checkpoint, a trap that springs when you walk in
- **areas with effects:** water that slows you down, wind that pushes you up

[[demo: overlaps | 340 | keys]]

```js
coins = new GameGroup({ shape: 'circle', isSensor: true, isStatic: true, color: 'gold' });
water = new GameObject(450, 250, 200, 140, { isSensor: true, isStatic: true, color: '#74c0fc80' });

player.onCollide(coins, (me, coin) => coin.destroy());

function draw() {
  // ...
  player.airFriction = player.isTouching(water) ? 0.2 : 0.01;   // slow in water
}
```

> **Watch out:** a sensor that is **not** static will fall straight through the floor, because it doesn't collide with anything. Most sensors should also be `isStatic: true`.

## Not colliding at all: `ignore`

Sometimes two things should pass through each other **without** noticing at all. Your own bullets shouldn't hit your ship, and ghosts float through walls. Use **`ignore`**:

```js
ship.ignore(bullets);          // ship and bullets pass through each other
ghosts.ignore(walls);          // a whole group ignores another group
sparks.ignore(sparks);         // members of a group ignore each other
ship.unignore(bullets);        // collide again
```

> **Tip:** use `ignore()` with groups when you can. Up to 30 objects or groups can have `ignore()` rules at the same time (a destroyed object gives its place back). So `ship.ignore(bullets)` once is better than `bullet.ignore(ship)` for every new bullet.

Ignored objects don't trigger `onCollide` or `isTouching` with each other either.

[[demo: ignore | 320]]

## Recipes

**Take damage only once in a while.** Without a pause, a player standing on spikes loses all their health in one second:

```js
player.onCollide(spikes, (me) => {
  if (me.data.hurtTimer > 0) return;   // still recovering
  me.data.health--;
  me.data.hurtTimer = 60;              // safe for 60 frames
  me.push(0, -8);                      // knock back
});

function draw() {
  if (player.data.hurtTimer > 0) player.data.hurtTimer--;
  player.visible = player.data.hurtTimer % 10 < 5;   // blink while hurt
}
```

**Only jump when standing on something.** See [Player Input](input-camera.html#platformer-controls).

**Stomp on enemies from above:**

```js
player.onCollide(enemies, (me, enemy) => {
  if (me.y < enemy.y - enemy.height / 2) {   // we were above it
    enemy.destroy();
    me.velocityY = -8;                       // bounce off
  } else {
    loseLife();
  }
});
```

## Seeing collisions

Turn on `world.debug = true`. Outlines are **green**, turn **red** while touching something, and are **orange** for sensors.

## Quick reference

| | |
|---|---|
| `isSensor: true` | Overlaps instead of colliding |
| `onCollide(target, fn)` | Once, when touching starts. `fn(self, other)` |
| `onCollideEnd(target, fn)` | Once, when touching stops |
| `whileTouching(target, fn)` | Every frame while touching |
| `isTouching(target)` | `true`/`false` right now |
| `getTouching()` | Array of everything touching it |
| `ignore(target)`, `unignore(target)` | Pass through without noticing |

`target` is a GameObject, a GameGroup, or left out for "anything". All of these work on groups too.
