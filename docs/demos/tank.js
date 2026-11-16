let tank;

class Tank extends GameObject {
  constructor(x, y) {
    super(x, y, 60, 40, { color: '#5c940d', cornerRadius: 6, airFriction: 0.2 });
  }
  drawShape(p) {
    p.fill(this.color);
    p.stroke(40);
    p.rect(0, 0, this.width, this.height, 6);
    p.fill('#82c91e');
    p.circle(0, 0, 26);
    p.strokeWeight(6);
    p.line(0, 0, 38, 0); // the barrel points the way the tank faces (rotation 0 = right)
  }
}

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0;
  world.addWalls();
  tank = new Tank(320, 160);
  for (let i = 0; i < 5; i++) {
    new GameObject(random(60, 580), random(60, 260), 30, { shape: 'circle', color: '#adb5bd', airFriction: 0.05 });
  }
}

function draw() {
  background('#f4f1de');

  if (keyIsDown(LEFT_ARROW)) tank.rotation -= 3;
  if (keyIsDown(RIGHT_ARROW)) tank.rotation += 3;
  if (keyIsDown(UP_ARROW)) tank.moveForward(3);
  if (keyIsDown(DOWN_ARROW)) tank.moveForward(-2);
  if (mouseIsPressed) tank.lookAt(mouseX, mouseY);
  tank.rotationSpeed = 0; // don't keep spinning after bumps

  fill(0);
  noStroke();
  text('Left/right to turn · up/down to drive · hold the mouse button to face the mouse', 10, 20);
  text('rotation: ' + round(tank.rotation) + '°', 10, 38);
}
