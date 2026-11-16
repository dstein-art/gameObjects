// Space Shooter — Step 5: blasting rocks and keeping score

let ship;
let bullets;
let rocks;
let score = 0;

function setup() {
  createCanvas(800, 600);
  world.gravityY = 0; // space: no gravity

  ship = new GameObject(width / 2, height / 2, 30, {
    shape: 'triangle', // points right when rotation is 0
    color: '#e9ecef',
    stroke: '#4dabf7',
    strokeWeight: 2,
    airFriction: 0.02, // drifts, but slowly comes to a stop
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
}

function spawnRock(x, y, size) {
  let r = rocks.create(x, y, size, size, { sides: floor(random(5, 9)), rotation: random(360) });
  r.setVelocity(random(-2, 2), random(-2, 2));
  r.rotationSpeed = random(-2, 2);
}

function draw() {
  background('#0b0c10');

  ship.lookAt(mouseX, mouseY); // always face the mouse

  let thrusting = keyIsDown(87) || keyIsDown(UP_ARROW); // 87 = W
  if (thrusting) {
    // push the way the ship is facing (ship.angle is its rotation in radians)
    ship.applyForce(Math.cos(ship.angle) * 0.5, Math.sin(ship.angle) * 0.5);
  }

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
