let redBalls, blueBalls, redShelves, blueShelves;

function setup() {
  createCanvas(640, 320);
  world.addWalls();
  new GameObject(320, 310, 640, 20, { isStatic: true, color: 90 });

  redShelves = new GameGroup({ isStatic: true, color: '#ff8787' });
  blueShelves = new GameGroup({ isStatic: true, color: '#74c0fc' });
  redBalls = new GameGroup({ shape: 'circle', color: '#e03131', showRotation: false });
  blueBalls = new GameGroup({ shape: 'circle', color: '#1971c2', showRotation: false });

  redShelves.create(200, 150, 300, 14, { rotation: 8 });
  blueShelves.create(440, 220, 300, 14, { rotation: -8 });

  // red balls fall through blue shelves, and blue balls through red ones
  redBalls.ignore(blueShelves);
  blueBalls.ignore(redShelves);
}

function draw() {
  background(248);
  if (frameCount % 20 === 0) {
    let x = random(60, 580);
    if (random() < 0.5) redBalls.create(x, -10, 18);
    else blueBalls.create(x, -10, 18);
  }
  // tidy up so it doesn't fill forever
  for (let b of world.objects) if (b.y > 280 && !b.isStatic && random() < 0.01) b.destroy();

  fill(0);
  noStroke();
  text('Red balls ignore blue shelves. Blue balls ignore red shelves.', 10, 20);
}
