function setup() {
  createCanvas(640, 320);

  // GameObjects gives you a world called `world`, with gravity pulling down.

  // A floor. Static objects never move.
  new GameObject(320, 300, 640, 40, { isStatic: true, color: 'seagreen' });

  // A box. It falls!
  new GameObject(320, 50, 50);
}

function draw() {
  background(230);
  fill(0);
  noStroke();
  text('Click to drop a box', 10, 20);
}

function mousePressed() {
  new GameObject(mouseX, mouseY, random(20, 60), { rotation: random(360) });
}
