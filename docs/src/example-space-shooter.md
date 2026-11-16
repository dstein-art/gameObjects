# Space Shooter

Steer a spaceship with the mouse, fire the engine and blast asteroids that split into smaller ones. This is the biggest tutorial, and it brings together groups, forces, lifespans, collisions and animation.
{: .lead }

**You'll learn:** zero gravity · `lookAt()` · `applyForce()` and drifting · wrapping around the screen · bullets with a `lifespan` · `ignore()` · group-against-group collisions · an animation drawn in code

## Play the finished game

The ship points at the mouse. Hold **W** or **↑** to thrust, and click or press **Space** to shoot. Click the game first so it can hear the keyboard.

[[demo: examples/space-shooter | 800x600 | keys]]

## Step 1: A ship that faces the mouse

In space there's no gravity, so we set `world.gravityY = 0`. The ship is a **triangle**, which points right when its rotation is 0. That's the direction it will fly and shoot.

Every frame, `lookAt()` turns the ship to face the mouse:

```js
world.gravityY = 0; // space: no gravity

ship = new GameObject(width / 2, height / 2, 30, {
  shape: 'triangle',
  color: '#e9ecef',
  stroke: '#4dabf7',
  strokeWeight: 2,
  airFriction: 0.02, // drifts, but slowly comes to a stop
});
```

```js
ship.lookAt(mouseX, mouseY);
```

[[demo: examples/space-shooter-step-1 | 800x600]]

## Step 2: Thrust and wrapping around the screen

Spaceships don't stop instantly: they **drift**. Instead of setting the velocity, we **push** the ship with `applyForce()` while the thrust key is held. The push points the way the ship is facing. `ship.angle` is its rotation in radians, so `cos` and `sin` turn it into an x and y direction:

```js
let thrusting = keyIsDown(87) || keyIsDown(UP_ARROW); // 87 = W
if (thrusting) {
  ship.applyForce(Math.cos(ship.angle) * 0.5, Math.sin(ship.angle) * 0.5);
}
```

When the ship flies off one edge, it should come back on the other. A `wrap()` function checks each edge and **teleports** the object to the opposite side:

```js
function wrap(obj) {
  let m = obj.width / 2;
  if (obj.x < -m) obj.x = width + m;
  if (obj.x > width + m) obj.x = -m;
  if (obj.y < -m) obj.y = height + m;
  if (obj.y > height + m) obj.y = -m;
}
```

[[demo: examples/space-shooter-step-2 | 800x600 | keys]]

> **Try it:** change the ship's `airFriction` to `0` for real outer-space drifting, or `0.1` for flying through syrup.

## Step 3: Shooting

Bullets are a group. Two defaults matter here:

- `lifespan: 60` makes each bullet destroy itself after 60 frames (one second), so old bullets don't pile up.
- `airFriction: 0` stops bullets slowing down.

Bullets start just in front of the ship's nose and fly the way it faces, **plus** the ship's own velocity, so they don't lag behind a fast-moving ship. We also make the ship and its bullets ignore each other, or you'd shoot yourself!

```js
bullets = new GameGroup({
  shape: 'circle', color: '#ffe066', stroke: null,
  airFriction: 0,
  lifespan: 60,
});
ship.ignore(bullets);
```

```js
function shoot() {
  let a = ship.angle;
  let b = bullets.create(ship.x + Math.cos(a) * 20, ship.y + Math.sin(a) * 20, 8);
  b.setVelocity(ship.velocityX + Math.cos(a) * 12, ship.velocityY + Math.sin(a) * 12);
}
```

[[demo: examples/space-shooter-step-3 | 800x600 | keys]]

## Step 4: Rocks

Rocks are a group of **polygons**. A `spawnRock()` function makes one rock with a random number of sides, a random drift and a random spin. Having a function means we can make rocks anywhere, at any size, which we'll need when they split.

```js
function spawnRock(x, y, size) {
  let r = rocks.create(x, y, size, size, { sides: floor(random(5, 9)), rotation: random(360) });
  r.setVelocity(random(-2, 2), random(-2, 2));
  r.rotationSpeed = random(-2, 2);
}
```

Rocks wrap around the screen too. Spreading the group into an array with the ship lets one loop handle everything:

```js
for (let obj of [ship, ...rocks]) wrap(obj);
```

[[demo: examples/space-shooter-step-4 | 800x600 | keys]]

## Step 5: Blasting rocks

This is where groups really pay off. **One rule** covers every bullet hitting every rock. The callback gets the bullet and the rock involved. Both are destroyed, you score points, and **big** rocks split into two smaller ones, at 60% of the size, where the old rock was. When the last rock is gone, a new wave arrives.

```js
bullets.onCollide(rocks, (bullet, rock) => {
  bullet.destroy();
  rock.destroy();
  score += 10;
  if (rock.width > 30) {
    spawnRock(rock.x, rock.y, rock.width * 0.6);
    spawnRock(rock.x, rock.y, rock.width * 0.6);
  }
  if (rocks.length === 0) for (let i = 0; i < 6; i++) spawnRock(random(width), 0, 60);
});
```

[[demo: examples/space-shooter-step-5 | 800x600 | keys]]

## Step 6: Getting hit

When a rock hits the ship, you lose points and the ship turns red. `onCollideEnd` turns it back once they stop touching:

```js
ship.onCollide(rocks, () => {
  score = max(0, score - 25);
  ship.color = '#ff6b6b';
});
ship.onCollideEnd(rocks, () => (ship.color = '#e9ecef'));
```

[[demo: examples/space-shooter-step-6 | 800x600 | keys]]

## Step 7: A rocket flame (the finished game)

The finishing touch is a flickering flame behind the ship while thrusting. It's an **animation** whose three frames are drawn in code with `createGraphics()`, so no image files are needed:

```js
for (let i = 0; i < 3; i++) {
  let g = createGraphics(40, 30);
  g.noStroke();
  g.fill(255, 120 + i * 40, 0);
  g.triangle(40, 15, 0, 15 - 8, 0, 15 + 8);
  g.fill(255, 240, 120);
  g.triangle(30, 15, 0, 15 - 3 - i * 2, 0, 15 + 3 + i * 2);
  flameFrames.push(g);
}
```

The flame is its own object, a sensor drawn behind the ship (`depth: -1`) that ignores everything. Every frame we glue it behind the ship and only show it while thrusting:

```js
ship.flame = new GameObject(0, 0, 40, 30, { isSensor: true, depth: -1 });
ship.flame.addAnimation('burn', flameFrames, 4);
```

```js
ship.flame.setPosition(ship.x - Math.cos(ship.angle) * 30, ship.y - Math.sin(ship.angle) * 30);
ship.flame.rotation = ship.rotation + 180;
ship.flame.visible = thrusting;
```

[[demo: examples/space-shooter | 800x600 | keys]]

## Make it your own

- **Lives:** lose a life when a rock hits you, and end the game when they're gone (see [Levels and Score](levels-score.html#lives-and-losing)).
- **A bigger universe:** remove the wrapping, make the world larger and follow the ship with the camera (see [Player Input and Camera](input-camera.html#the-camera)).
- **Sounds:** a laser for shooting, an explosion for rocks (see [Sounds](sounds.html)).
- **Power-ups:** a rare sensor star that gives you triple shot for ten seconds.
- **Explosions:** a burst of short-lived sparks when a rock breaks (see the fireworks demo in [Game Objects](game-objects.html#removing-objects)).
