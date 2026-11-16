let chasers = [];

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0;
  world.addWalls();

  let speeds = [1, 2, 3, 4];
  let colors = ['#b2f2bb', '#69db7c', '#37b24d', '#2b8a3e'];
  for (let i = 0; i < speeds.length; i++) {
    let c = new GameObject(80 + i * 150, 260, 36, {
      shape: 'circle',
      color: colors[i],
      label: speeds[i],
      showRotation: false,
    });
    c.data.speed = speeds[i];
    chasers.push(c);
  }
}

function draw() {
  background(250);
  for (let c of chasers) {
    c.moveToward(mouseX, mouseY, c.data.speed);
  }
  fill(0);
  noStroke();
  text('Move the mouse. Each chaser has a different speed.', 10, 20);
}
