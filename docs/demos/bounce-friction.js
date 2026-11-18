function setup() {
  createCanvas(640, 340);
  reset();
}

function reset() {
  world.clear();
  world.addWalls({ friction: 0.5, bounce: 0 }); // keep everything on screen
  new GameObject(320, 330, 640, 20, { isStatic: true, color: 90, bounce: 0, friction: 0.5 });
  new GameObject(320, 170, 8, 340, { isStatic: true, color: 200 });

  // left side: same balls, different bounce
  let bounces = [0, 0.4, 0.7, 0.95];
  for (let i = 0; i < bounces.length; i++) {
    new GameObject(50 + i * 70, 60, 36, {
      shape: 'circle',
      bounce: bounces[i],
      label: bounces[i],
      color: '#ffd43b',
      showRotation: false,
    });
  }

  // right side: four shelves, and boxes with different friction given the same push.
  // The shelves have full grip, so each box's own friction decides how far it slides.
  let frictions = [0, 0.05, 0.2, 0.6];
  for (let i = 0; i < frictions.length; i++) {
    let y = 90 + i * 62;
    new GameObject(480, y + 22, 300, 10, { isStatic: true, color: 120, friction: 1 });
    let box = new GameObject(350, y, 30, {
      friction: frictions[i],
      label: frictions[i],
      color: '#74c0fc',
      fixedRotation: true, // slide, don't tumble
      bounce: 0, // stop at the wall instead of bouncing back
    });
    box.velocityX = 7; // the same push for every box
  }
}

function draw() {
  background(245);
}

function drawOnTop() {
  fill(0);
  noStroke();
  text('bounce', 120, 20);
  text('friction: the same push, different grip', 380, 20);
  text('click to run again', 10, 38);
}

function mousePressed() {
  reset();
}
