let hero, ground;

async function setup() {
  createCanvas(640, 320);
  world.gravityY = 1.5;
  world.addWalls();

  // cut the spritesheet into three animations
  let sheet = await loadImage('../assets/hero.png');
  let idle = GameObjects.spriteSheet(sheet, 48, 48, 2, 0); // frames 0-1
  let run = GameObjects.spriteSheet(sheet, 48, 48, 4, 4); // frames 4-7
  let jump = GameObjects.spriteSheet(sheet, 48, 48, 2, 8); // frames 8-9

  ground = new GameGroup({ isStatic: true, color: '#5c940d', friction: 0 });
  ground.create(320, 305, 640, 30);
  ground.create(200, 210, 140, 16);
  ground.create(440, 140, 140, 16);

  hero = new GameObject(80, 200, 48, 48, { fixedRotation: true, friction: 0 });
  hero.addAnimation('idle', idle, 20);
  hero.addAnimation('run', run, 6);
  hero.addAnimation('jump', jump, 8);
}

function draw() {
  background('#d0ebff');
  if (!hero) return; // still loading

  // move
  hero.velocityX = 0;
  if (keyIsDown(LEFT_ARROW)) hero.velocityX = -4;
  if (keyIsDown(RIGHT_ARROW)) hero.velocityX = 4;

  // face the way we're going
  if (hero.velocityX < 0) hero.flipX = true;
  if (hero.velocityX > 0) hero.flipX = false;

  // pick the animation
  if (!hero.isTouching(ground)) hero.playAnimation('jump');
  else if (hero.velocityX !== 0) hero.playAnimation('run');
  else hero.playAnimation('idle');
}

function drawOnTop() {
  if (!hero) return; // still loading
  fill(0);
  noStroke();
  text('Left/right to run · up or space to jump', 10, 20);
  text('animation: ' + hero.animation + '   frame: ' + hero.animationFrame, 10, 38);
}

function keyPressed() {
  if ((keyCode === UP_ARROW || key === ' ') && hero && hero.isTouching(ground)) {
    hero.velocityY = -11;
  }
}
