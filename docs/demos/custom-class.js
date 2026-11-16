// A new kind of game object
class Robot extends GameObject {
  constructor(x, y) {
    super(x, y, 60, 70, { fixedRotation: true, cornerRadius: 10, draggable: true });
    this.data.blink = 0;
  }

  // runs every frame, before physics
  update() {
    if (random() < 0.01) this.data.blink = 8;
    if (this.data.blink > 0) this.data.blink--;
  }

  // draws the robot: (0, 0) is its centre
  drawShape(p) {
    p.fill(140, 160, 190);
    p.stroke(60);
    p.strokeWeight(2);
    p.rect(0, 0, this.width, this.height, 10);
    p.line(0, -this.height / 2, 0, -this.height / 2 - 12); // antenna
    p.fill('tomato');
    p.circle(0, -this.height / 2 - 14, 8);

    // eyes look toward the mouse
    let lookX = constrain((world.mouseX - this.x) / 40, -4, 4);
    let lookY = constrain((world.mouseY - this.y) / 40, -4, 4);
    let eyeH = this.data.blink > 0 ? 2 : 16;
    p.fill(255);
    p.noStroke();
    p.ellipse(-12, -10, 16, eyeH);
    p.ellipse(12, -10, 16, eyeH);
    if (this.data.blink === 0) {
      p.fill(30);
      p.circle(-12 + lookX, -10 + lookY, 6);
      p.circle(12 + lookX, -10 + lookY, 6);
    }
    p.fill(60);
    p.rect(0, 16, 26, 6, 3); // mouth
  }
}

function setup() {
  createCanvas(640, 320);
  world.addWalls();
  new GameObject(320, 305, 640, 30, { isStatic: true, color: 90 });

  for (let i = 0; i < 4; i++) new Robot(120 + i * 130, 100);
}

function draw() {
  background(235);
  fill(0);
  noStroke();
  text('Robots are a class that extends GameObject. Drag them around!', 10, 20);
}
