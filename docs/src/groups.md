# Groups of Game Objects

Most games have lots of the same kind of thing: coins, enemies, bullets, bricks, platforms. A **GameGroup** keeps them together, so you can make, check, change and remove them all at once.
{: .lead }

## Making a group

```js
let coins;

function setup() {
  createCanvas(640, 360);
  coins = new GameGroup();
}
```

## Adding objects with `create()`

The easiest way to fill a group is **`group.create()`**. It makes a new GameObject and adds it to the group in one step. It takes the same arguments as `new GameObject()`.

Even better, give the group **defaults** when you make it. Every object it creates gets those settings:

```js
coins = new GameGroup({
  shape: 'circle',
  color: 'gold',
  isStatic: true,
  isSensor: true,
});

coins.create(100, 200, 20);   // a gold, static, sensor circle
coins.create(150, 200, 20);
coins.create(200, 200, 20, { color: 'silver' });   // you can still override
```

You can also add objects you already made:

```js
let boss = new GameObject(300, 100, 80);
enemies.add(boss);
enemies.add(a, b, c);     // several at once
```

## Looping through a group

Use `for...of` to do something to every object in the group:

```js
for (let enemy of enemies) {
  enemy.moveToward(player, 2);
}
```

Or `forEach`, if you prefer:

```js
enemies.forEach((enemy) => enemy.moveToward(player, 2));
```

It's safe to destroy objects while you loop through a group.

[[demo: swarm | 340]]

## Counting and picking

| | |
|---|---|
| `group.length` | How many objects are in the group |
| `group.get(i)` | The object at position `i` |
| `group.first`, `group.last` | The first or last object |
| `group.random()` | A random object |
| `group.has(obj)` | Is this object in the group? |
| `group.closestTo(x, y)`, `group.closestTo(obj)` | The nearest object |
| `group.filter(fn)`, `group.find(fn)` | Arrays and searching, like normal arrays |
| `group.toArray()` | A plain array copy |

```js
if (coins.length === 0) {
  text('You collected every coin!', 20, 40);
}

let target = enemies.closestTo(player);
let lowHealth = enemies.filter((e) => e.data.health < 2);
```

[[demo: closest | 320]]

## Changing everything at once

**`group.set()`** changes properties on every object in the group:

```js
enemies.set({ color: 'blue', bounce: 1 });
```

## Removing objects

- **`group.remove(obj)`** takes an object **out of the group**, but it stays in the game.
- **`obj.destroy()`** removes an object from the game **and** from every group it's in.
- **`group.destroyAll()`** destroys everything in the group.

```js
enemies.remove(friendlySlime);   // it isn't an enemy any more, but still exists
coins.destroyAll();              // wipe all the coins
```

## One object, many groups

An object can be in as many groups as you like. A purple slime might be in `enemies` **and** in `slimes`. When it's destroyed, it leaves all of them.

```js
let slime = enemies.create(200, 100, 40);
slimes.add(slime);
```

## All the objects: `world.objects`

The world keeps a group of **everything**, called `world.objects`:

```js
text('Objects: ' + world.objects.length, 10, 20);
world.objects.set({ color: 'black' });   // a blackout!
```

## Groups and collisions

Groups really shine with collisions. You can ask whether the player is touching **any** platform, or run code whenever **any** bullet hits **any** enemy:

```js
if (player.isTouching(platforms)) { /* we're standing on something */ }

bullets.onCollide(enemies, (bullet, enemy) => {
  bullet.destroy();
  enemy.destroy();
});
```

All of this is covered in [Collisions and Overlaps](collisions.html).

[[demo: group-rain | 320]]

## Quick reference

| | |
|---|---|
| `new GameGroup(defaults)` | Make a group, optionally with default options |
| `create(x, y, w, h, options)` | Make a new object in the group |
| `add(...objects)`, `remove(obj)` | Add or take out (without destroying) |
| `destroyAll()` | Destroy every object in the group |
| `length`, `get(i)`, `first`, `last`, `random()`, `has(obj)` | Counting and picking |
| `for (let o of group)`, `forEach`, `filter`, `find`, `map`, `some`, `every` | Looping |
| `closestTo(x, y)` | Nearest object |
| `set({ ... })` | Change properties on all of them |
| `onCollide`, `onCollideEnd`, `whileTouching`, `isTouching`, `ignore` | Collisions for the whole group |
| `draw()` | Draw just this group (when automatic drawing is off) |
