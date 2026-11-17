# Joints Playground

Joints hold objects together. In this tutorial you'll build a wobbly rope bridge, a swinging pendulum and a bouncy spring, then drop things on them and drag them around.
{: .lead }

**You'll learn:** `world.connect()` · `world.pin()` · attach points (offsets) · stiffness and damping · building things in a loop

## Play the finished sketch

Drag anything with the mouse. Try bouncing a box on the bridge, or flinging the spring.

[[demo: examples/joints | 800x500]]

## Step 1: Planks joined end to end

A rope bridge is just a row of planks, each joined to the next. We make them in a `for` loop, keeping track of the `previous` plank so each new plank can be joined to it.

`world.connect(a, b, options)` joins two objects. (`world` is an object that GameObjects creates automatically, holding all the objects and the physics.) By default it joins their centres, but a bridge needs the **ends** joined. `offsetA` and `offsetB` move the attach points, measured from each object's centre:

```js
world.connect(previous, plank, {
  offsetA: { x: plankW / 2, y: 0 },   // right end of the previous plank
  offsetB: { x: -plankW / 2, y: 0 },  // left end of this plank
  length: 4,                          // keep a small gap
  stiffness: 0.9,                     // nearly rigid, a tiny bit of give
});
```

Nothing holds the chain up yet, so it falls to the floor in a heap. Drag a plank to see how they're linked.

The instructions at the top are drawn in `drawOnTop()`, which runs after the planks are drawn, so they stay readable.

[[demo: examples/joints-step-1 | 800x500]]

## Step 2: Pin the ends

`world.pin(obj, x, y, options)` nails an object to a fixed point in the world. Pinning the outside end of the first and last plank turns the chain into a bridge. The group's `first` and `last` properties give us those planks.

```js
world.pin(planks.first, planks.first.x - plankW / 2, bridgeY, { offset: { x: -plankW / 2, y: 0 } });
world.pin(planks.last, planks.last.x + plankW / 2, bridgeY, { offset: { x: plankW / 2, y: 0 } });
```

[[demo: examples/joints-step-2 | 800x500]]

> **Try it:** change `stiffness` in step 1's `connect` to `0.2` for a stretchy bridge, or make `count` bigger for a longer, saggier one.

## Step 3: A pendulum

A pendulum is a ball pinned to a point above it. The pin keeps the distance the same, so the ball swings in an arc. `pin()` returns a **link**, and links are drawn as lines, so we give this one a grey colour.

```js
let bob = new GameObject(650, 260, 50, { shape: 'circle', color: '#f06595', draggable: true });
let string = world.pin(bob, 650, 60);
string.stroke = '#555';
```

[[demo: examples/joints-step-3 | 800x500]]

## Step 4: A spring

A **low stiffness** makes a connection stretchy, like a spring. **Damping** makes the bouncing die down instead of going on forever. We also set the `length` the spring wants to be.

```js
let a = new GameObject(560, 400, 40, { color: '#74c0fc', draggable: true });
let b = new GameObject(660, 400, 40, { color: '#74c0fc', draggable: true });
let spring = world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });
spring.stroke = '#1c7ed6';
```

[[demo: examples/joints-step-4 | 800x500]]

> **Try it:** set `damping` to `0` and watch the spring bounce much longer.

## Step 5: Things to play with (the finished sketch)

Last, we drop a few random boxes and balls onto the bridge, and show a message while something is being dragged. `world.dragging` is the object under the mouse, or `null`.

```js
for (let i = 0; i < 6; i++) {
  new GameObject(random(200, 550), random(40, 150), random(20, 40), {
    shape: random(['box', 'circle']),
    draggable: true,
  });
}
```

```js
function drawOnTop() {
  fill(0);
  noStroke();
  textSize(14);
  text('Drag anything!', 10, 20);
  if (world.dragging) text('Dragging an object', 10, 40);
}
```

[[demo: examples/joints | 800x500]]

## Make it your own

- **Cut the rope:** press a key to `destroy()` a link in the middle of the bridge. Keep the links in an array as you make them.
- **A chain:** pin the first link of a vertical chain and hang a heavy ball on the end (see [Physics](physics.html#joints-connecting-things-together)).
- **A car:** connect two circles (wheels) to a box (the body) with stiff joints, and push it with the arrow keys.
- **A wrecking ball:** a heavy pendulum (`density: 0.01`) and a tower of boxes to knock down.
