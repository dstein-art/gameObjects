// Platformer — Step 3: platforms and jumping

let player;
let platforms;

function setup() {
  createCanvas(800, 500);
  world.gravityY = 1.5;

  // ---- platforms: a group of static boxes ----
  platforms = new GameGroup({ isStatic: true, color: '#5b8c5a', friction: 0 });
  platforms.create(width / 2, height - 20, width, 40); // the floor is a platform too
  platforms.create(350, 360, 200, 20);
  platforms.create(650, 280, 160, 20);

  player = new GameObject(100, 300, 36, 50, {
    color: '#e2574c',
    cornerRadius: 6,
    fixedRotation: true,
    friction: 0,
    label: '•‿•',
    labelColor: 255,
  });
}

function draw() {
  background('#cfe8ff');

  let move = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) move -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) move += 1;
  player.velocityX = move * 6;
  if (move !== 0) player.flipX = move < 0;
}

// keyPressed runs once per key press: right for jumping
function keyPressed() {
  let jumpKey = key === ' ' || keyCode === UP_ARROW || key === 'w' || key === 'W';
  // Only jump when standing on a platform (and not already moving up or down)
  if (jumpKey && player.isTouching(platforms) && abs(player.velocityY) < 1) {
    player.velocityY = -13;
  }
}
