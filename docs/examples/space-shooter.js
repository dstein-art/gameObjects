// GameObjects — Space Shooter
// W / Up = thrust, ship aims at the mouse, click or Space to shoot.
// Shows: lookAt, applyForce, lifespan, ignore(), group-vs-group collisions,
// screen wrap, and an animation made from p5.Graphics frames.

let ship;
let bullets;
let rocks;
let score = 0;
let flameFrames = [];

function setup() {
  createCanvas(800, 600);
  world.gravityY = 0;

  // Build a tiny 3-frame "flame" animation in code (could be loadImage frames too)
  for (let i = 0; i < 3; i++) {
    let g = createGraphics(40, 30);
    g.noStroke();
    g.fill(255, 120 + i * 40, 0);
    g.triangle(40, 15, 0, 15 - 8, 0, 15 + 8);
    g.fill(255, 240, 120);
    g.triangle(30, 15, 0, 15 - 3 - i * 2, 0, 15 + 3 + i * 2);
    flameFrames.push(g);
  }

  ship = new GameObject(width / 2, height / 2, 30, {
    shape: 'triangle',
    color: '#e9ecef',
    stroke: '#4dabf7',
    strokeWeight: 2,
    airFriction: 0.02,
  });

  bullets = new GameGroup({
    shape: 'circle',
    color: '#ffe066',
    stroke: null,
    airFriction: 0,
    lifespan: 60, // bullets disappear after 60 frames
  });
  ship.ignore(bullets); // bullets pass through the ship

  rocks = new GameGroup({
    shape: 'polygon',
    color: '#868e96',
    stroke: '#dee2e6',
    airFriction: 0,
    bounce: 0.8,
  });
  for (let i = 0; i < 6; i++) spawnRock(random(width), random(height), 60);

  // Bullet hits rock: both are destroyed, and big rocks split in two
  bullets.onCollide(rocks, (bullet, rock) => {
    bullet.destroy();
    rock.destroy();
    score += 10;
    if (rock.width > 30) {
      spawnRock(rock.x, rock.y, rock.width * 0.6);
      spawnRock(rock.x, rock.y, rock.width * 0.6);
    }
    if (rocks.length === 0) for (let i = 0; i < 6; i++) spawnRock(random(width), 0, 60);
  });

  ship.onCollide(rocks, () => {
    score = max(0, score - 25);
    ship.color = '#ff6b6b';
  });
  ship.onCollideEnd(rocks, () => (ship.color = '#e9ecef'));

  // flame drawn behind the ship
  ship.flame = new GameObject(0, 0, 40, 30, { isSensor: true, depth: -1 });
  ship.flame.addAnimation('burn', flameFrames, 4);
  ship.flame.ignore(rocks);
  ship.flame.ignore(bullets);
  ship.flame.ignore(ship);
}

function spawnRock(x, y, size) {
  let r = rocks.create(x, y, size, size, { sides: floor(random(5, 9)), rotation: random(360) });
  r.setVelocity(random(-2, 2), random(-2, 2));
  r.rotationSpeed = random(-2, 2);
}

function draw() {
  background('#0b0c10');

  ship.lookAt(mouseX, mouseY);
  let thrusting = keyIsDown(87) || keyIsDown(UP_ARROW); // 87 = W
  if (thrusting) {
    // push the way the ship is facing (ship.angle is its rotation in radians)
    ship.applyForce(Math.cos(ship.angle) * 0.5, Math.sin(ship.angle) * 0.5);
  }

  // keep the flame glued behind the ship
  ship.flame.setPosition(ship.x - Math.cos(ship.angle) * 30, ship.y - Math.sin(ship.angle) * 30);
  ship.flame.rotation = ship.rotation + 180;
  ship.flame.stop();
  ship.flame.visible = thrusting;

  // wrap around the screen edges
  for (let obj of [ship, ...rocks]) wrap(obj);

  fill(255);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 12, 12);
}

function wrap(obj) {
  let m = obj.width / 2;
  if (obj.x < -m) obj.x = width + m;
  if (obj.x > width + m) obj.x = -m;
  if (obj.y < -m) obj.y = height + m;
  if (obj.y > height + m) obj.y = -m;
}

function shoot() {
  let a = ship.angle;
  let b = bullets.create(ship.x + Math.cos(a) * 20, ship.y + Math.sin(a) * 20, 8);
  b.setVelocity(ship.velocityX + Math.cos(a) * 12, ship.velocityY + Math.sin(a) * 12);
}

function mousePressed() {
  shoot();
}

function keyPressed() {
  if (key === ' ') shoot();
}
