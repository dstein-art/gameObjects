let sparks;

function setup() {
  createCanvas(640, 320);
  world.gravityY = 0.5;

  // every spark shares these settings
  sparks = new GameGroup({ shape: 'circle', stroke: null, showRotation: false });
  sparks.ignore(sparks); // sparks pass through each other
}

function draw() {
  background(20, 24, 40);
  fill(255);
  noStroke();
  text('Click for fireworks · sparks alive: ' + sparks.length, 10, 20);
}

function mousePressed() {
  let hue = random(360);
  for (let i = 0; i < 40; i++) {
    let spark = sparks.create(mouseX, mouseY, random(4, 9), {
      color: `hsl(${floor(hue + random(-30, 30))}, 90%, 65%)`,
      lifespan: floor(random(40, 90)), // frames until it destroys itself
    });
    let angle = random(TWO_PI);
    let speed = random(2, 8);
    spark.setVelocity(cos(angle) * speed, sin(angle) * speed);
  }
}
