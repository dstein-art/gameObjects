function setup() {
  createCanvas(640, 340);
  reset();
}

function reset() {
  world.clear();
  new GameObject(320, 330, 640, 20, { isStatic: true, color: 90, bounce: 0 });
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

  // right side: a ramp, and boxes with different friction
  new GameObject(480, 220, 300, 12, { isStatic: true, rotation: 18, color: 120, friction: 0.5 });
  let frictions = [0, 0.05, 0.2, 0.6];
  for (let i = 0; i < frictions.length; i++) {
    new GameObject(360 + i * 52, 120 + i * 18, 34, {
      friction: frictions[i],
      label: frictions[i],
      color: '#74c0fc',
      rotation: 18,
    });
  }
}

function draw() {
  background(245);
  fill(0);
  noStroke();
  text('bounce', 120, 20);
  text('friction on a ramp', 430, 20);
  text('click to run again', 10, 38);
}

function mousePressed() {
  reset();
}
