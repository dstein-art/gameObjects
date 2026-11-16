let bugs;

function setup() {
  createCanvas(640, 340);
  world.gravityY = 0;
  world.addWalls();

  // every bug made by this group gets these settings
  bugs = new GameGroup({
    shape: 'circle',
    color: '#82c91e',
    stroke: '#2b8a3e',
    strokeWeight: 2,
    showRotation: false,
  });

  for (let i = 0; i < 15; i++) {
    bugs.create(random(40, 600), random(60, 300), random(16, 30));
  }
}

function draw() {
  background('#fff9db');

  // every bug chases the mouse
  for (let bug of bugs) {
    bug.moveToward(mouseX, mouseY, 2.5);
  }

  fill(0);
  noStroke();
  text('Bugs: ' + bugs.length, 10, 20);
  text('Move the mouse · click to add a bug · C = new colour · X = destroy one at random', 10, 38);
}

function mousePressed() {
  bugs.create(mouseX, mouseY, random(16, 30));
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    bugs.set({ color: color(random(255), random(255), random(255)) });
  }
  if ((key === 'x' || key === 'X') && bugs.length > 0) {
    bugs.random().destroy();
  }
}
