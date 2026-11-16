let sounds = {};
let pads;
let started = false;

async function setup() {
  createCanvas(640, 300);
  world.gravityY = 0;

  sounds.jump = await loadSound('../assets/jump.wav');
  sounds.coin = await loadSound('../assets/coin.wav');
  sounds.bump = await loadSound('../assets/bump.wav');
  sounds.explode = await loadSound('../assets/explode.wav');

  // one pad per sound: click it or press its key
  pads = new GameGroup({ isStatic: true, cornerRadius: 14, labelSize: 18, stroke: null });
  let names = ['jump', 'coin', 'bump', 'explode'];
  let colors = ['#74c0fc', '#ffd43b', '#ff8787', '#b197fc'];
  for (let i = 0; i < names.length; i++) {
    let pad = pads.create(95 + i * 150, 170, 130, 110, { color: colors[i], label: (i + 1) + '  ' + names[i] });
    pad.data.sound = names[i];
  }
}

function draw() {
  background(250);
  fill(0);
  noStroke();
  textSize(14);
  if (!started) text('Click (or press a key) to turn sound on', 10, 20);
  else text('Click a pad, or press 1 2 3 4 · hold SHIFT for a higher pitch', 10, 20);
  if (pads) {
    for (let pad of pads) pad.setSize(lerp(pad.width, 130, 0.2), lerp(pad.height, 110, 0.2));
  }
}

function playPad(pad) {
  let s = sounds[pad.data.sound];
  s.rate(keyIsDown(SHIFT) ? 1.6 : 1);
  s.play();
  pad.setSize(150, 125); // a little bounce
}

function mousePressed() {
  userStartAudio();
  started = true;
  if (!pads) return;
  for (let pad of pads) if (pad.isMouseOver()) playPad(pad);
}

function keyPressed() {
  userStartAudio();
  started = true;
  let n = int(key);
  if (pads && n >= 1 && n <= 4) playPad(pads.get(n - 1));
}
