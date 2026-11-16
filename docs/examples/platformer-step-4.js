// Platformer — Step 4: a bigger level and a camera

let player;
let platforms;

let LEVEL_WIDTH = 2400; // three screens wide

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5;

  platforms = new GameGroup({ isStatic: true, color: '#5b8c5a', friction: 0 });
  platforms.create(LEVEL_WIDTH / 2, height - 20, LEVEL_WIDTH, 40); // floor
  platforms.create(350, 360, 200, 20);
  platforms.create(650, 280, 160, 20);
  platforms.create(950, 200, 200, 20);
  platforms.create(1300, 330, 260, 20);
  platforms.create(1650, 250, 180, 20);
  platforms.create(2000, 170, 220, 20);
  // walls at the ends of the level
  platforms.create(-20, height / 2, 40, height * 2);
  platforms.create(LEVEL_WIDTH + 20, height / 2, 40, height * 2);

  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true,
    friction: 0,
    label: '•‿•',
    labelColor: 255,
  });

  // The camera follows the player smoothly, looking a little above them
  world.camera.follow(player, 0.1, 0, -60);
}

function draw() {
  background('#cfe8ff');

  let move = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1;
  player.velocityX = move * 6;
  if (move !== 0) player.flipX = move < 0;

  // keep the camera inside the level
  world.camera.x = constrain(world.camera.x, width / 2, LEVEL_WIDTH - width / 2);
  world.camera.y = min(world.camera.y, height / 2);
}

function keyPressed() {
  let jumpKey = key === ' ' || keyCode === UP_ARROW || key === 'w' || key === 'W';
  if (jumpKey && player.isTouching(platforms) && abs(player.velocityY) < 1) {
    player.velocityY = -13;
  }
}
