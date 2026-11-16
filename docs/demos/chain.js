function setup() {
  createCanvas(640, 360);
  world.addWalls();

  // ---- a chain hanging from a pin ----
  let previous = null;
  for (let i = 0; i < 8; i++) {
    let link = new GameObject(160, 50 + i * 26, 10, 22, { color: '#868e96', draggable: true });
    if (previous) {
      world.connect(previous, link, {
        offsetA: { x: 0, y: 11 }, // bottom of the previous link
        offsetB: { x: 0, y: -11 }, // top of this link
        length: 2,
        stiffness: 0.9,
      });
    } else {
      world.pin(link, 160, 40, { offset: { x: 0, y: -11 } });
    }
    previous = link;
  }
  let weight = new GameObject(160, 280, 40, { shape: 'circle', color: 'tomato', draggable: true, density: 0.003 });
  world.connect(previous, weight, { offsetA: { x: 0, y: 11 }, length: 22 });

  // ---- a pendulum ----
  let bob = new GameObject(420, 200, 40, { shape: 'circle', color: '#ffd43b', draggable: true });
  world.pin(bob, 340, 40);

  // ---- a spring between two boxes ----
  let a = new GameObject(480, 300, 40, { color: '#74c0fc', draggable: true });
  let b = new GameObject(590, 300, 40, { color: '#74c0fc', draggable: true });
  let spring = world.connect(a, b, { length: 100, stiffness: 0.02, damping: 0.05 });
  spring.stroke = '#1c7ed6';
  spring.strokeWeight = 3;
}

function draw() {
  background(248);
  fill(0);
  noStroke();
  text('A chain, a pendulum and a spring. Drag and fling them!', 10, 20);
}
