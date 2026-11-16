function setup() {
  createCanvas(640, 320);
  world.debug = true;
  world.addWalls();

  new GameObject(320, 300, 640, 40, { isStatic: true, color: 'seagreen' });

  // a sensor: things pass through it, but it still notices them (orange outline)
  new GameObject(470, 200, 120, 120, { isStatic: true, isSensor: true, color: null, stroke: null });

  for (let i = 0; i < 6; i++) {
    new GameObject(random(80, 560), random(-100, 100), random(25, 50), {
      shape: random(['box', 'circle', 'triangle']),
      draggable: true,
    });
  }
}

function draw() {
  background(230);
  fill(0);
  noStroke();
  text('Press D to turn debug view on and off · drag the shapes', 10, 20);
  text('debug: ' + world.debug, 10, 38);
}

function keyPressed() {
  if (key === 'd' || key === 'D') world.debug = !world.debug;
}
