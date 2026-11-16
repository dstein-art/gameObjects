# Sounds

Sound makes a game feel alive. A blip when you jump, a ding for a coin and a thud when something lands all make the game feel more responsive. GameObjects doesn't need anything special for sound. You use the **p5.sound** library and play sounds from your collision and input code.
{: .lead }

## Adding p5.sound

Make sure your `index.html` loads p5.sound **after** p5.js:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js"></script>
```

> **Watch out:** p5.sound 0.4 is made for **p5.js 2.x**. If your sketch uses p5.js 1.x, use the older p5.sound that came with it, and load sounds in `preload()` instead of with `await`.

## Loading sounds

Load sounds in **`async setup()`** using **`await`**, just like images:

```js
let jumpSound, coinSound;

async function setup() {
  createCanvas(640, 360);
  jumpSound = await loadSound('jump.wav');
  coinSound = await loadSound('coin.mp3');
  // ... make your world and objects
}
```

Upload your sound files to your sketch (or put them in your sketch folder). The most reliable formats are **.mp3**, **.wav** and **.ogg**.

## Browsers need a click first

Web browsers don't let a page make noise until the player has **clicked or pressed a key**. This stops websites from blasting sound at you. It's normal to start a game with "Click to start":

```js
function mousePressed() {
  userStartAudio();   // allow sound from now on
}
```

Playing a sound in response to a click or key press also unlocks audio by itself.

## Playing sounds

```js
coinSound.play();          // play once
music.loop();              // play over and over
music.stop();              // stop
music.isPlaying();         // true or false

coinSound.amp(0.5);        // volume: 0 = silent, 1 = full
jumpSound.rate(1.5);       // speed and pitch: 2 = double speed, higher pitch
```

[[demo: sound-board | 300 | keys]]

## Sounds when things happen

Put `play()` inside your [collision callbacks](collisions.html) and input code:

```js
player.onCollide(coins, (me, coin) => {
  coin.destroy();
  coinSound.play();
});

function keyPressed() {
  if (key === ' ' && player.isTouching(ground)) {
    player.velocityY = -15;
    jumpSound.play();
  }
}
```

**Make bumps sound different.** Use the object's `speed` to set the volume, so hard hits are loud and gentle taps are quiet. Use its size to set the pitch, so big things sound low:

```js
balls.onCollide((ball) => {
  bumpSound.amp(constrain(ball.speed / 10, 0, 1));
  bumpSound.rate(map(ball.width, 10, 80, 1.8, 0.6));
  bumpSound.play();
});
```

[[demo: sound-bumps | 320]]

> **Tip:** use `onCollide` for sounds, not `whileTouching`. `whileTouching` runs every frame, so the sound would restart 60 times a second.

## Background music

Start music once, when the game begins, with `loop()`. Keep it quieter than your sound effects:

```js
function startGame() {
  music.amp(0.3);
  if (!music.isPlaying()) music.loop();
}
```

[[demo: music-game | 340 | keys]]

## Finding sounds

- **Make your own** retro sound effects with free tools like [jsfxr](https://sfxr.me) (download as .wav).
- **Free sound libraries:** [Freesound.org](https://freesound.org), [OpenGameArt.org](https://opengameart.org), [Kenney.nl](https://kenney.nl/assets/category:Audio). Check each sound's license and credit the creator if it asks.
- **Keep files small.** Short effects load faster. Trim silence from the start of a sound so it plays the instant something happens.

## Quick reference

| | |
|---|---|
| `await loadSound('file.mp3')` | Load a sound (in `async setup()`) |
| `userStartAudio()` | Unlock sound after a click |
| `play()`, `loop()`, `stop()`, `pause()` | Playback |
| `isPlaying()` | Is it playing? |
| `amp(volume)` | Volume, 0 to 1 |
| `rate(speed)` | Speed and pitch, 1 = normal |
