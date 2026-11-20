// Mochi on the home page.
// A transparent canvas over the page, in p5 instance mode. The page's cards, headings and code
// boxes become invisible platforms, so Mochi can land on them, walk along them and bump into them.
// Mochi wanders for the first 10 seconds, then waits; click it to make it play again for 5 seconds.
// Clicks only reach the canvas while the mouse is over Mochi, so the page works as usual.
(function () {
  'use strict';

  let STORE = 'gameobjects.mochi'; // 'off' when the visitor hid Mochi
  let FIRST_PLAY = 10000; // milliseconds of wandering when the page opens
  let PLAY_AGAIN = 5000; // ... and after each click
  let PLATFORMS = [
    '.hero h1',
    '.hero .btn',
    '.hero .facts',
    '.hero pre',
    'h2',
    '.setup ol',
    '.setup pre',
    '.grid .card',
    '.site-footer',
  ];

  // Not on small screens: Mochi would cover the content
  if (window.innerWidth < 700) return;

  let version = '';
  try {
    version = new URL(document.currentScript.src).searchParams.get('v') || '';
  } catch (e) {}
  let withVersion = (url) => (version ? url + '?v=' + version : url);

  let stored = null;
  try {
    stored = localStorage.getItem(STORE);
  } catch (e) {}
  let reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- the show / hide button ----------
  let button = document.createElement('button');
  button.className = 'mochi-toggle';
  button.type = 'button';
  document.body.appendChild(button);

  let sketch = null; // the p5 instance, once started
  let canvasEl = null;
  let showing = false;

  function setButton() {
    button.textContent = showing ? 'Hide Mochi' : 'Show Mochi';
    button.setAttribute('aria-pressed', showing ? 'true' : 'false');
  }

  button.addEventListener('click', () => {
    showing = !showing;
    try {
      localStorage.setItem(STORE, showing ? 'on' : 'off');
    } catch (e) {}
    if (showing) start();
    else stop();
    setButton();
  });

  // ---------- loading the libraries only when needed ----------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      let s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let loading = null;
  function loadLibraries() {
    if (!loading) {
      loading = (async () => {
        if (typeof p5 === 'undefined') await loadScript('https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js');
        if (typeof Matter === 'undefined') await loadScript('https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js');
        if (typeof GameObject === 'undefined') await loadScript(withVersion('gameobjects.js'));
      })();
    }
    return loading;
  }

  async function start() {
    showing = true;
    setButton();
    if (sketch) {
      canvasEl.style.display = '';
      sketch.wake(FIRST_PLAY);
      sketch.loop();
      return;
    }
    try {
      await loadLibraries();
    } catch (e) {
      button.remove(); // couldn't load: quietly do without Mochi
      return;
    }
    if (!showing) return;
    sketch = new p5(mochiSketch);
  }

  function stop() {
    showing = false;
    if (sketch) {
      sketch.noLoop();
      canvasEl.style.display = 'none';
      canvasEl.style.pointerEvents = 'none';
    }
  }

  // ---------- the sketch ----------
  function mochiSketch(p) {
    let mochi;
    let platforms;
    let edges;
    let playUntil = 0; // Mochi wanders until this time
    let nextIdea = 0; // when Mochi decides what to do next
    let direction = 0;
    let stuckFrames = 0;
    let outOfViewSince = null;
    let lastHeight = 0;

    p.setup = () => {
      let c = p.createCanvas(window.innerWidth, window.innerHeight);
      canvasEl = c.elt;
      canvasEl.className = 'mochi-layer';
      canvasEl.setAttribute('aria-hidden', 'true');
      p._goCreditStart = -1e9; // no "created with" note on the site's own home page

      platforms = new GameGroup({ isStatic: true, visible: false });
      edges = new GameGroup({ isStatic: true, visible: false });
      measure();

      // drop in above the "Get started" button, if it's on screen, or near the top of the view
      let start = { x: window.scrollX + window.innerWidth * 0.4, y: window.scrollY + 90 };
      let button = document.querySelector('.hero .btn.primary');
      if (button) {
        let r = button.getBoundingClientRect();
        if (r.top > 60 && r.bottom < window.innerHeight) {
          start = { x: r.left + window.scrollX + r.width / 2, y: r.top + window.scrollY - 70 };
        }
      }
      mochi = new Mochi(start.x, start.y, 44);
      mochi.say("Hi! I'm Mochi", 2.5);
      p.wake(FIRST_PLAY);

      // clicks reach the canvas only while the mouse is over Mochi
      document.addEventListener('mousemove', (e) => {
        if (!showing || !mochi) return;
        let over = Math.hypot(e.clientX + window.scrollX - mochi.x, e.clientY + window.scrollY - mochi.y) < mochi.width * 0.6;
        canvasEl.style.pointerEvents = over ? 'auto' : 'none';
        canvasEl.style.cursor = over ? 'pointer' : '';
      });
      canvasEl.addEventListener('click', () => poke());

      // the page can change size as images and fonts load
      window.addEventListener('load', measure);
      setInterval(() => {
        if (document.documentElement.scrollHeight !== lastHeight) measure();
      }, 1500);
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      measure();
    };

    // Wander for a while
    p.wake = (ms) => {
      playUntil = p.millis() + ms;
      nextIdea = 0;
    };

    function poke() {
      if (!mochi) return;
      if (!mochi.jump(12)) mochi.velocityY = Math.min(mochi.velocityY, -6);
      mochi.react('happy', 1);
      mochi.say(p.random(['Hi!', 'Wheee!', "Let's play!", 'Hee hee!', 'Boing!', 'Again!']), 1.5);
      direction = p.random([-1, 1]);
      p.wake(PLAY_AGAIN);
    }

    p.draw = () => {
      p.clear();
      // the camera follows the page's scrolling, so the world uses page coordinates
      world.camera.x = window.scrollX + p.width / 2;
      world.camera.y = window.scrollY + p.height / 2;

      let now = p.millis();
      if (now < playUntil) {
        wander(now);
      } else {
        mochi.walk(0);
        mochi.watch('mouse'); // waiting: watch the visitor
      }
      keepInView(now);
    };

    function wander(now) {
      mochi.watch(null); // look where it's going
      if (now > nextIdea) {
        let r = Math.random();
        if (r < 0.5) direction = Math.random() < 0.5 ? -1 : 1;
        else if (r < 0.7) direction = 0; // stop and look around
        else mochi.jump();
        nextIdea = now + 700 + Math.random() * 1500;
      }
      mochi.walk(direction);

      // walked into something? hop over it, or turn around
      if (direction !== 0 && Math.abs(mochi.velocityX) < 0.3 && mochi.isOnGround) stuckFrames++;
      else stuckFrames = 0;
      if (stuckFrames > 8) {
        if (!mochi.jump()) direction = -direction;
        if (Math.random() < 0.4) direction = -direction;
        stuckFrames = 0;
      }
    }

    // If Mochi ends up out of sight (the page scrolled, or it fell), drop it back in from the top
    function keepInView(now) {
      let sx = mochi.x - window.scrollX;
      let sy = mochi.y - window.scrollY;
      let hidden = sx < -60 || sx > p.width + 60 || sy < -60 || sy > p.height + 60;
      if (!hidden) {
        outOfViewSince = null;
        return;
      }
      if (outOfViewSince === null) outOfViewSince = now;
      if (now - outOfViewSince > 1500) {
        mochi.setPosition(window.scrollX + p.width * (0.25 + Math.random() * 0.5), window.scrollY + 90); // just below the top bar
        mochi.stop();
        outOfViewSince = null;
      }
    }

    // Turn the page's cards, headings and code boxes into invisible platforms
    function measure() {
      if (!platforms) return;
      platforms.destroyAll();
      edges.destroyAll();
      let seen = new Set();
      for (let selector of PLATFORMS) {
        for (let el of document.querySelectorAll(selector)) {
          if (seen.has(el) || el.closest('.topbar')) continue;
          seen.add(el);
          let r = boxOf(el);
          if (r.width < 8 || r.height < 4) continue;
          platforms.create(r.left + window.scrollX + r.width / 2, r.top + window.scrollY + r.height / 2, r.width, r.height);
        }
      }
      // the sides and bottom of the page
      let w = document.documentElement.scrollWidth;
      let h = document.documentElement.scrollHeight;
      edges.create(-20, h / 2, 40, h * 2);
      edges.create(w + 20, h / 2, 40, h * 2);
      edges.create(w / 2, h + 20, w + 80, 40);
      lastHeight = h;
    }

    // Headings: just the words, not the whole width of the page
    function boxOf(el) {
      if (/^H[1-6]$/.test(el.tagName)) {
        let range = document.createRange();
        range.selectNodeContents(el);
        let r = range.getBoundingClientRect();
        if (r.width > 0) return r;
      }
      return el.getBoundingClientRect();
    }
  }

  // ---------- start ----------
  let wantsMochi = stored === 'on' || (stored !== 'off' && !reduceMotion);
  setButton();
  if (wantsMochi) start();
})();
