// SUPER CATCH: catch the stars, avoid the bombs.
// Shows: score, lives, game states, restarting and a saved high score.

let basket, stars, bombs, ground;
let starImg;
let state = 'title';
let score = 0;
let lives = 3;
let best = 0;

async function setup() {
  createCanvas(640, 360);
  world.gravityY = 0.25;
  starImg = await loadImage('../assets/star.png');
  best = getItem('catchBest') || 0;

  // groups are made once; their rules stay even after world.clear()
  stars = new GameGroup({ image: starImg, isSensor: true, airFriction: 0.02 });
  bombs = new GameGroup({ shape: 'circle', color: '#212529', isSensor: true, airFriction: 0.02, label: '!', labelColor: 'tomato' });

  world.paused = true;
}

function startGame() {
  world.clear();
  score = 0;
  lives = 3;

  ground = new GameObject(320, 380, 640, 40, { isStatic: true, isSensor: true });
  basket = new GameObject(320, 330, 90, 22, { isStatic: true, color: '#4dabf7', cornerRadius: 8 });

  basket.onCollide(stars, (me, star) => {
    star.destroy();
    score++;
  });
  basket.onCollide(bombs, (me, bomb) => {
    bomb.destroy();
    loseLife();
  });
  ground.onCollide(stars, (me, star) => {
    star.destroy();
    loseLife(); // missed one!
  });
  ground.onCollide(bombs, (me, bomb) => bomb.destroy());

  world.paused = false;
  state = 'playing';
}

function loseLife() {
  lives--;
  if (lives <= 0) gameOver();
}

function gameOver() {
  state = 'gameover';
  world.paused = true;
  if (score > best) {
    best = score;
    storeItem('catchBest', best);
  }
}

function draw() {
  background('#1b1f3b');

  if (state === 'title') {
    drawCentered('SUPER CATCH', 44, -40);
    drawCentered('Catch the stars, dodge the bombs. Move with the mouse or arrow keys.', 16, 10);
    drawCentered('Click or press any key to start', 18, 50);
    drawCentered('Best: ' + best, 16, 90);
    return;
  }

  if (state === 'playing') {
    // move the basket
    let target = basket.x;
    if (keyIsDown(LEFT_ARROW)) target -= 9;
    else if (keyIsDown(RIGHT_ARROW)) target += 9;
    else if (mouseX > 0 && mouseX < width) target = lerp(basket.x, mouseX, 0.3);
    basket.x = constrain(target, 45, width - 45);

    // drop things, faster as the score goes up
    let rate = max(20, 60 - score);
    if (frameCount % rate === 0) {
      if (random() < 0.75) stars.create(random(30, 610), -20, 32, 32, { rotation: random(360) });
      else bombs.create(random(30, 610), -20, 28);
    }
  }

  world.draw(); // objects first...

  // ...then the score on top
  fill(255);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 12, 10);
  text('Lives: ' + '♥'.repeat(max(lives, 0)), 12, 34);
  textAlign(RIGHT, TOP);
  text('Best: ' + best, width - 12, 10);

  if (state === 'gameover') {
    fill(0, 150);
    rect(0, 0, width, height);
    drawCentered('GAME OVER', 44, -30);
    drawCentered('Score: ' + score + (score >= best && score > 0 ? '  — new best!' : ''), 20, 20);
    drawCentered('Press R or click to play again', 16, 60);
  }
}

function drawCentered(msg, size, dy) {
  fill(255);
  noStroke();
  textSize(size);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, height / 2 + dy);
}

function keyPressed() {
  if (!stars) return; // still loading
  if (state === 'title') startGame();
  else if (state === 'gameover' && (key === 'r' || key === 'R')) startGame();
}

function mousePressed() {
  if (!stars) return;
  if (state === 'title' || state === 'gameover') startGame();
}
