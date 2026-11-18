/*!
 * GameObjects.js v0.1.0
 * Physics-powered game objects for p5.js, built on Matter.js.
 * by David Stein — MIT License
 *
 * Requires (load these BEFORE gameobjects.js):
 *   - p5.js  (1.x or 2.x)
 *   - Matter.js 0.20+  https://brm.io/matter-js/
 *
 * A ready-made world called `world` is created when this file loads, so
 * sketches can start making GameObjects straight away.
 *
 * Optional: if the sketch has a drawOnTop() function, it runs every frame
 * after all the game objects are drawn (for a score, messages, a HUD).
 *
 * Core classes:
 *   GameWorld   — the physics world (gravity, camera, walls, joints, drawing)
 *   GameObject  — a single physical thing you can see and move
 *   GameGroup   — a collection of GameObjects you can manage together
 */
(function (global) {
  'use strict';

  if (typeof global.Matter === 'undefined') {
    throw new Error(
      'GameObjects.js needs Matter.js. Add this line BEFORE gameobjects.js in your index.html:\n' +
        '<script src="https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js"></script>'
    );
  }

  let M = global.Matter;
  let { Engine, Bodies, Body, Composite, Events, Query, Constraint, Vector } = M;

  let DEG = 180 / Math.PI;
  let STEP_MS = 1000 / 60; // fixed physics step: one step per frame at 60fps
  let FORCE_SCALE = 0.001; // makes applyForce() numbers friendly (1 instead of 0.001)

  // ---------------------------------------------------------------------------
  // Shared library state
  // ---------------------------------------------------------------------------
  let lib = {
    p: null, // the p5 instance we draw with
    world: null, // the current GameWorld
    manager: null, // the GameManager (score, levels, game start and end)
    version: '0.1.0',
  };

  function getP5() {
    if (lib.p) return lib.p;
    if (global.p5 && global.p5.instance) return global.p5.instance;
    return null;
  }

  function currentWorld() {
    if (!lib.world) new GameWorld(); // makes itself current
    return lib.world;
  }

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof GameObject);
  }

  // A fresh copy of plain objects and arrays, at any depth, so each group member
  // gets its own data. Anything else (images, sounds, other game objects,
  // functions) stays shared, as you'd expect.
  function copyData(v) {
    if (Array.isArray(v)) return v.map(copyData);
    if (v !== null && typeof v === 'object') {
      let proto = Object.getPrototypeOf(v);
      if (proto === Object.prototype || proto === null) {
        let out = {};
        for (let k of Object.keys(v)) out[k] = copyData(v[k]);
        return out;
      }
    }
    return v;
  }

  // A class that extends GameObject and declares a property with a built-in
  // name (class Car extends GameObject { speed = 5 }) gets a plain property that
  // hides the real one, so car.speed = 10 does nothing. JavaScript can't stop
  // that, so the first time each such class is updated we look for it and warn.
  let checkedClasses = new WeakSet();
  function checkSubclass(obj) {
    let cls = obj.constructor;
    if (cls === GameObject || checkedClasses.has(cls)) return;
    checkedClasses.add(cls);
    let builtIn = Object.getOwnPropertyDescriptors(GameObject.prototype);
    for (let name of Object.getOwnPropertyNames(obj)) {
      let d = builtIn[name];
      if (!d || name === 'constructor') continue;
      let isProperty = d.get || d.set;
      let isMethod = typeof d.value === 'function' && typeof obj[name] !== 'function';
      if (!isProperty && !isMethod) continue;
      let what = isProperty ? 'property' : 'method';
      console.warn(
        `GameObjects: class ${cls.name || '(your class)'} has its own "${name}", which hides GameObject's ` +
          `built-in ${name} ${what}, so changing it won't do anything. ` +
          `Give yours a different name (for example my${name[0].toUpperCase() + name.slice(1)}), ` +
          `or set the built-in one in the constructor after super(): this.${name} = ...`
      );
    }
  }

  // Apply a color value (string, number, array or p5.Color) with fill()/stroke()
  function applyColor(p, fnName, value) {
    if (value === null || value === undefined || value === false) {
      fnName === 'fill' ? p.noFill() : p.noStroke();
    } else if (Array.isArray(value)) {
      p[fnName](...value);
    } else {
      p[fnName](value);
    }
  }

  // ---------------------------------------------------------------------------
  // Collision-filter bits (used by .ignore())
  // Bit 0 is the default category everyone belongs to. Each group/object that
  // takes part in an ignore() rule gets its own bit, allocated on demand.
  // When it has no ignore() rules left (unignore(), or the object is destroyed)
  // the bit goes back on a free list, so only 30 can be in use AT THE SAME TIME.
  // ---------------------------------------------------------------------------
  let nextBit = 1;
  let freeBits = [];
  function allocBit() {
    if (freeBits.length) return freeBits.pop();
    if (nextBit > 30) {
      throw new Error(
        'GameObjects: too many ignore() rules at once. Up to 30 objects or groups can use ignore() ' +
          'at the same time. Tip: put the objects in a GameGroup and call ignore() on the group, ' +
          'for example ship.ignore(bullets) instead of bullet.ignore(ship) for every bullet.'
      );
    }
    return 1 << nextBit++;
  }
  function releaseBit(entity) {
    // free the bit once nothing ignores this object/group and it ignores nothing
    if (entity._bit && entity._ignores.size === 0) {
      freeBits.push(entity._bit);
      entity._bit = 0;
    }
  }

  // ===========================================================================
  // GameObject
  // ===========================================================================
  class GameObject {
    /**
     * new GameObject(x, y)                       → 40×40 box
     * new GameObject(x, y, size)                 → size×size box
     * new GameObject(x, y, width, height)
     * new GameObject(x, y, width, height, options)
     * new GameObject(x, y, size, options)
     * new GameObject(options)                    → options.x, options.y, ...
     *
     * options.shape: 'box' (default), 'circle', 'polygon', 'triangle'
     *   circle  → width is the diameter
     *   polygon → use options.sides (default 6); width is the diameter
     *   custom  → options.vertices = [[x, y], [x, y], ...] (relative to the centre)
     */
    constructor(x, y, width, height, options) {
      // ---- sort out the flexible argument list ----
      if (isPlainObject(x)) {
        options = x;
        x = options.x;
        y = options.y;
        width = options.width;
        height = options.height;
      } else if (isPlainObject(width)) {
        options = width;
        width = options.width;
        height = options.height;
      } else if (isPlainObject(height)) {
        options = height;
        height = options.height;
      }
      options = Object.assign({}, options || {});

      let world = options.world || currentWorld();
      let p = getP5();
      x = x ?? (p ? p.width / 2 : 0);
      y = y ?? (p ? p.height / 2 : 0);
      width = width ?? 40;
      height = height ?? width;

      this.world = world;
      this.shape = options.shape || (options.vertices ? 'custom' : 'box');
      if (this.shape === 'rect' || this.shape === 'rectangle') this.shape = 'box';
      this._w = width;
      this._h = this.shape === 'circle' || this.shape === 'polygon' || this.shape === 'triangle' ? width : height;

      // ---- build the Matter.js body ----
      let bodyOpts = {
        restitution: options.bounce ?? 0.2,
        friction: options.friction ?? 0, // no grip unless you ask for it
        frictionAir: options.airFriction ?? 0, // nothing slows down unless you ask for it
        isStatic: !!options.isStatic,
        isSensor: !!options.isSensor,
        angle: (options.rotation ?? 0) / DEG,
      };
      if (options.density !== undefined) bodyOpts.density = options.density;
      if (options.cornerRadius && this.shape === 'box') {
        bodyOpts.chamfer = { radius: options.cornerRadius };
      }
      this.cornerRadius = options.cornerRadius || 0;

      let body;
      if (this.shape === 'circle') {
        body = Bodies.circle(x, y, width / 2, bodyOpts);
      } else if (this.shape === 'polygon') {
        body = Bodies.polygon(x, y, options.sides || 6, width / 2, bodyOpts);
      } else if (this.shape === 'triangle') {
        // an equilateral triangle with one point facing right (rotation 0)
        let r = width / 2;
        let tri = [0, 1, 2].map((i) => ({
          x: Math.cos((i * 2 * Math.PI) / 3) * r,
          y: Math.sin((i * 2 * Math.PI) / 3) * r,
        }));
        body = Bodies.fromVertices(x, y, [tri], bodyOpts);
        Body.setPosition(body, { x, y });
      } else if (this.shape === 'custom') {
        let verts = (options.vertices || []).map((v) => (Array.isArray(v) ? { x: v[0], y: v[1] } : v));
        body = Bodies.fromVertices(x, y, [verts], bodyOpts);
        // fromVertices moves the centre to the centroid; put it back where asked
        Body.setPosition(body, { x, y });
        this._w = body.bounds.max.x - body.bounds.min.x;
        this._h = body.bounds.max.y - body.bounds.min.y;
      } else {
        body = Bodies.rectangle(x, y, width, height, bodyOpts);
      }
      body.gameObject = this;
      this.body = body;
      if (options.mass !== undefined) Body.setMass(body, options.mass);
      this._inertia = body.inertia;

      // ---- appearance ----
      // (null means "none", so only fall back to a default when the option is missing)
      this.color = pick(options, 'color', randomPastel()); // the fill color
      this.stroke = pick(options, 'stroke', 0); // the outline color
      this.strokeWeight = options.strokeWeight ?? 1;
      this.image = options.image || null;
      this.imageOffsetX = options.imageOffsetX || 0;
      this.imageOffsetY = options.imageOffsetY || 0;
      this.label = options.label ?? null;
      this.labelColor = pick(options, 'labelColor', 0);
      this.labelSize = options.labelSize ?? 14;
      this.visible = options.visible ?? true;
      this.flipX = !!options.flipX;
      this.flipY = !!options.flipY;
      this.depth = options.depth ?? 0;
      this.opacity = options.opacity ?? 255;
      this.showRotation = options.showRotation ?? true; // circles draw a line so you can see them roll

      // ---- animation ----
      this._animations = {};
      this._anim = null; // { name, frames, frameDelay, loop, index, counter, playing }

      // ---- game logic ----
      this.name = options.name ?? '';
      this.lifespan = options.lifespan ?? Infinity; // frames until auto-destroy
      this.draggable = !!options.draggable;
      this.destroyed = false;
      this.data = options.data || {}; // free space for your own stuff (score, hp, ...)

      this._groups = new Set();
      this._touching = new Set();
      this._handlers = [];
      this._bit = 0;
      this._ignores = new Set();

      if (options.fixedRotation) this.fixedRotation = true;

      world._addObject(this);
      if (options.group) {
        let gs = Array.isArray(options.group) ? options.group : [options.group];
        gs.forEach((g) => g.add(this));
      }
    }

    // ---------------- position & rotation ----------------
    get x() { return this.body.position.x; }
    set x(v) { this._place(v, this.body.position.y); }
    get y() { return this.body.position.y; }
    set y(v) { this._place(this.body.position.x, v); }

    /** Move instantly to (x, y). Keeps velocity. */
    setPosition(x, y) {
      this._place(x, y);
      return this;
    }

    // Static objects moved by small steps (moving platforms) get a velocity for
    // one physics step, so things standing on them are carried along.
    // Big jumps are treated as teleports.
    _place(x, y) {
      let b = this.body;
      let slide = b.isStatic && Math.hypot(x - b.position.x, y - b.position.y) < 50;
      Body.setPosition(b, { x, y }, slide);
      if (slide) this.world._movedStatics.add(this);
    }

    _turn(rad) {
      let b = this.body;
      let slide = b.isStatic && Math.abs(rad - b.angle) < 0.5;
      Body.setAngle(b, rad, slide);
      if (slide) this.world._movedStatics.add(this);
    }

    /** Rotation in DEGREES (0 = pointing right, clockwise is positive). */
    get rotation() { return this.body.angle * DEG; }
    set rotation(deg) { this._turn(deg / DEG); }

    /** Rotation in RADIANS. */
    get angle() { return this.body.angle; }
    set angle(rad) { this._turn(rad); }

    /** Spin speed in degrees per frame. */
    get rotationSpeed() { return Body.getAngularVelocity(this.body) * DEG; }
    set rotationSpeed(degPerFrame) { Body.setAngularVelocity(this.body, degPerFrame / DEG); }

    /** Turn to face a point (or another GameObject). */
    lookAt(x, y) {
      if (x instanceof GameObject) ({ x, y } = x);
      this.rotation = Math.atan2(y - this.y, x - this.x) * DEG;
      Body.setAngularVelocity(this.body, 0);
      return this;
    }

    // ---------------- size ----------------
    get width() { return this._w; }
    set width(v) { this.setSize(v, this.shape === 'box' || this.shape === 'custom' ? this._h : v); }
    get height() { return this._h; }
    set height(v) { this.setSize(this.shape === 'box' || this.shape === 'custom' ? this._w : v, v); }

    setSize(w, h = w) {
      if (w <= 0 || h <= 0) return this;
      let sx = w / this._w;
      let sy = h / this._h;
      if (sx === 1 && sy === 1) return this;
      let a = this.body.angle;
      Body.setAngle(this.body, 0); // scale in local space, then rotate back
      Body.scale(this.body, sx, sy);
      Body.setAngle(this.body, a);
      this._w = w;
      this._h = h;
      if (isFinite(this.body.inertia)) this._inertia = this.body.inertia;
      if (this._fixedRotation) Body.setInertia(this.body, Infinity);
      return this;
    }

    // ---------------- movement ----------------
    get velocityX() { return this.body.velocity.x; }
    set velocityX(v) { Body.setVelocity(this.body, { x: v, y: this.body.velocity.y }); }
    get velocityY() { return this.body.velocity.y; }
    set velocityY(v) { Body.setVelocity(this.body, { x: this.body.velocity.x, y: v }); }

    /** Set velocity in pixels per frame. */
    setVelocity(vx, vy) {
      Body.setVelocity(this.body, { x: vx, y: vy });
      return this;
    }

    /** Current speed in pixels per frame. */
    get speed() { return Body.getSpeed(this.body); }
    set speed(s) {
      let dir = this.direction / DEG;
      this.setVelocity(Math.cos(dir) * s, Math.sin(dir) * s);
    }

    /** Direction of travel in degrees. */
    get direction() { return Math.atan2(this.velocityY, this.velocityX) * DEG; }
    set direction(deg) {
      let s = this.speed;
      this.setVelocity(Math.cos(deg / DEG) * s, Math.sin(deg / DEG) * s);
    }

    /** Add to the current velocity (an instant nudge, ignores mass). */
    push(vx, vy) {
      this.setVelocity(this.velocityX + vx, this.velocityY + vy);
      return this;
    }

    /** Apply a physical force at the centre (heavier objects move less). */
    applyForce(fx, fy) {
      Body.applyForce(this.body, this.body.position, { x: fx * FORCE_SCALE, y: fy * FORCE_SCALE });
      return this;
    }

    /** Set velocity so it heads toward a point at the given speed. */
    moveToward(x, y, speed = 3) {
      if (x instanceof GameObject) {
        speed = y ?? speed;
        ({ x, y } = x);
      }
      let dx = x - this.x;
      let dy = y - this.y;
      let d = Math.hypot(dx, dy);
      if (d < speed) {
        this.setVelocity(dx, dy); // close enough: arrive
      } else {
        this.setVelocity((dx / d) * speed, (dy / d) * speed);
      }
      return this;
    }

    /** Move in the direction it is facing (its rotation). */
    moveForward(speed = 3) {
      this.setVelocity(Math.cos(this.angle) * speed, Math.sin(this.angle) * speed);
      return this;
    }

    stop() {
      Body.setVelocity(this.body, { x: 0, y: 0 });
      Body.setAngularVelocity(this.body, 0);
      return this;
    }

    distanceTo(x, y) {
      if (x instanceof GameObject) ({ x, y } = x);
      return Math.hypot(x - this.x, y - this.y);
    }

    // ---------------- physical properties ----------------
    get bounce() { return this.body.restitution; }
    set bounce(v) { this.body.restitution = v; }
    get friction() { return this.body.friction; }
    set friction(v) { this.body.friction = v; }
    get airFriction() { return this.body.frictionAir; }
    set airFriction(v) { this.body.frictionAir = v; }
    get density() { return this.body.density; }
    set density(v) { this._changeMass(() => Body.setDensity(this.body, v)); }
    get mass() { return this.body.mass; }
    set mass(v) { this._changeMass(() => Body.setMass(this.body, v)); }

    // Change the mass and keep the saved inertia (how hard it is to spin) right.
    // While fixedRotation is on the body's inertia is Infinity, so instead of
    // copying that we scale the saved inertia: for the same shape, inertia
    // grows in step with mass.
    _changeMass(change) {
      let oldMass = this.body.mass;
      change();
      if (isFinite(this.body.inertia)) {
        this._inertia = this.body.inertia;
      } else if (isFinite(oldMass) && oldMass > 0 && isFinite(this.body.mass)) {
        this._inertia *= this.body.mass / oldMass;
      }
    }

    /** Static objects never move (floors, walls, platforms). */
    get isStatic() { return this.body.isStatic; }
    set isStatic(v) {
      Body.setStatic(this.body, !!v);
      if (!v && this._fixedRotation) Body.setInertia(this.body, Infinity);
    }

    /** Sensors detect touches but nothing bounces off them (coins, goals, triggers). */
    get isSensor() { return this.body.isSensor; }
    set isSensor(v) { this.body.isSensor = !!v; }

    /** When true the object never spins (great for players). */
    get fixedRotation() { return !!this._fixedRotation; }
    set fixedRotation(v) {
      this._fixedRotation = !!v;
      if (v) {
        Body.setAngularVelocity(this.body, 0);
        Body.setInertia(this.body, Infinity);
      } else {
        Body.setInertia(this.body, this._inertia);
      }
    }

    /**
     * Set the fill color, with the same arguments as p5's fill():
     *   obj.fill('red')   obj.fill(255, 0, 0)   obj.fill(0, 128)   obj.fill(null)
     * The same as setting obj.color.
     */
    fill(...args) {
      if (args.length === 0) return this;
      this.color = args.length === 1 ? args[0] : args;
      return this;
    }

    // ---------------- collisions ----------------
    /**
     * Run fn(thisObject, otherObject) when this object starts touching target.
     * target can be a GameObject, a GameGroup, or left out (= anything).
     */
    onCollide(target, fn) { return this._on('start', target, fn); }
    /** Run fn(thisObject, otherObject) when this object stops touching target. */
    onCollideEnd(target, fn) { return this._on('end', target, fn); }
    /** Run fn(thisObject, otherObject) every frame while touching target. */
    whileTouching(target, fn) { return this._on('active', target, fn); }

    _on(type, target, fn) {
      if (typeof target === 'function') {
        fn = target;
        target = null;
      }
      this._handlers.push({ type, target, fn });
      return this;
    }

    /** true if touching target right now (GameObject, GameGroup, or anything if left out). */
    isTouching(target) {
      if (!target) return this._touching.size > 0;
      if (target instanceof GameObject) return this._touching.has(target);
      if (target instanceof GameGroup) {
        for (let o of this._touching) if (target.has(o)) return true;
      }
      return false;
    }

    /** Array of every GameObject this one is touching right now. */
    getTouching() {
      return [...this._touching];
    }

    /** Pass straight through target (a GameObject or GameGroup) — no collisions between them. */
    ignore(target) {
      linkIgnore(this, target);
      return this;
    }

    /** Collide with target again after ignore(). */
    unignore(target) {
      unlinkIgnore(this, target);
      return this;
    }

    // ---------------- mouse ----------------
    /** true if the mouse is over this object (works with the camera). */
    isMouseOver() {
      let m = this.world.mouse;
      return Query.point([this.body], m).length > 0;
    }

    /** true while this object is being dragged with the mouse. */
    get isDragging() {
      return this.world._drag !== null && this.world._drag.obj === this;
    }

    // ---------------- groups ----------------
    get groups() { return [...this._groups]; }
    isIn(group) { return this._groups.has(group); }

    // ---------------- screen helpers ----------------
    /** true if the object is completely outside the visible area. */
    isOffscreen(margin = 0) {
      let b = this.body.bounds;
      let v = this.world.camera.viewBounds();
      return (
        b.max.x < v.left - margin ||
        b.min.x > v.right + margin ||
        b.max.y < v.top - margin ||
        b.min.y > v.bottom + margin
      );
    }

    // ---------------- images & animation ----------------
    /**
     * Add a named animation: frames is an array of p5.Images.
     * frameDelay = how many frames each picture is shown for.
     */
    addAnimation(name, frames, frameDelay = 6, loop = true) {
      this._animations[name] = { frames, frameDelay, loop };
      if (!this._anim) this.playAnimation(name);
      return this;
    }

    playAnimation(name, restart = false) {
      let a = this._animations[name];
      if (!a) {
        console.warn(`GameObjects: no animation called "${name}"`);
        return this;
      }
      if (this._anim && this._anim.name === name && !restart) {
        this._anim.playing = true;
        return this;
      }
      this._anim = { name, ...a, index: 0, counter: 0, playing: true };
      return this;
    }

    pauseAnimation() {
      if (this._anim) this._anim.playing = false;
      return this;
    }

    get animation() { return this._anim ? this._anim.name : null; }
    get animationFrame() { return this._anim ? this._anim.index : 0; }
    set animationFrame(i) { if (this._anim) this._anim.index = i % this._anim.frames.length; }
    get animationDone() {
      let a = this._anim;
      return !!a && !a.loop && a.index === a.frames.length - 1 && !a.playing;
    }

    _stepAnimation() {
      let a = this._anim;
      if (!a || !a.playing || a.frames.length < 2) return;
      if (++a.counter >= a.frameDelay) {
        a.counter = 0;
        if (a.index < a.frames.length - 1) a.index++;
        else if (a.loop) a.index = 0;
        else a.playing = false;
      }
    }

    // ---------------- per-frame hooks (override these in a subclass) ----------------
    /** Called once per frame before physics. Override for custom behaviour. */
    update() {}

    /**
     * Draws the object in local space: (0, 0) is the centre and the canvas is
     * already rotated. Override to give your object a custom look.
     */
    drawShape(p) {
      let img = this._anim ? this._anim.frames[this._anim.index] : this.image;
      if (img) {
        p.imageMode(p.CENTER);
        if (this.opacity < 255) p.tint(255, this.opacity);
        p.image(img, this.imageOffsetX, this.imageOffsetY, this._w, this._h);
      } else {
        applyColor(p, 'fill', this.color);
        applyColor(p, 'stroke', this.stroke);
        if (this.stroke !== null && this.stroke !== undefined) p.strokeWeight(this.strokeWeight);
        if (this.opacity < 255 && this.color !== null && this.color !== undefined) {
          let c = p.color(...(Array.isArray(this.color) ? this.color : [this.color]));
          c.setAlpha(this.opacity);
          p.fill(c);
        }
        if (this.shape === 'circle') {
          p.ellipseMode(p.CENTER);
          p.circle(0, 0, this._w);
          // a line so you can see it roll
          if (!this._fixedRotation && !this.body.isStatic && this.showRotation) p.line(0, 0, this._w / 2, 0);
        } else if (this.shape === 'box') {
          p.rectMode(p.CENTER);
          p.rect(0, 0, this._w, this._h, this.cornerRadius);
        } else {
          this._drawLocalVertices(p);
        }
      }
      if (this.label !== null && this.label !== undefined && this.label !== '') {
        p.noStroke();
        applyColor(p, 'fill', this.labelColor);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(this.labelSize);
        p.text(String(this.label), 0, 0);
      }
    }

    _drawLocalVertices(p) {
      let b = this.body;
      let parts = b.parts.length > 1 ? b.parts.slice(1) : [b];
      let c = Math.cos(-b.angle);
      let s = Math.sin(-b.angle);
      for (let part of parts) {
        p.beginShape();
        for (let v of part.vertices) {
          let dx = v.x - b.position.x;
          let dy = v.y - b.position.y;
          p.vertex(dx * c - dy * s, dx * s + dy * c);
        }
        p.endShape(p.CLOSE);
      }
    }

    /** Draw this object now. Normally the world does this for you. */
    draw(p = getP5()) {
      if (!this.visible || this.destroyed || !p) return;
      let a = this.body.angle;
      let c = Math.cos(a);
      let s = Math.sin(a);
      p.push();
      // applyMatrix ignores angleMode(), so DEGREES/RADIANS sketches both work
      p.applyMatrix(c, s, -s, c, this.x, this.y);
      if (this.flipX || this.flipY) p.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
      p.rectMode(p.CENTER);
      p.ellipseMode(p.CENTER);
      p.imageMode(p.CENTER);
      this.drawShape(p);
      p.pop();
    }

    // ---------------- removal ----------------
    /** Remove from the world and from every group. */
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.world._removeObject(this);
    }
  }

  function pick(options, key, fallback) {
    return options[key] !== undefined ? options[key] : fallback;
  }

  function randomPastel() {
    let h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 75%)`;
  }

  // ---------------------------------------------------------------------------
  // ignore() helpers — shared by GameObject and GameGroup
  // ---------------------------------------------------------------------------
  function ensureBit(entity) {
    if (!entity._bit) entity._bit = allocBit();
    return entity._bit;
  }

  function membersOf(entity) {
    return entity instanceof GameGroup ? entity.toArray() : [entity];
  }

  function linkIgnore(a, b) {
    if (!(b instanceof GameObject || b instanceof GameGroup)) {
      throw new Error('GameObjects: ignore() needs a GameObject or a GameGroup');
    }
    ensureBit(a);
    ensureBit(b);
    a._ignores.add(b);
    b._ignores.add(a);
    membersOf(a).forEach(refreshFilter);
    membersOf(b).forEach(refreshFilter);
  }

  function unlinkIgnore(a, b) {
    a._ignores.delete(b);
    b._ignores.delete(a);
    releaseBit(a);
    releaseBit(b);
    membersOf(a).forEach(refreshFilter);
    membersOf(b).forEach(refreshFilter);
  }

  function refreshFilter(obj) {
    // Objects with no ignore() rules stay in the default category (bit 0).
    // Objects that do get only their own bits, so the shared default bit
    // can't sneak them past the mask check.
    let category = obj._bit;
    let ignored = 0;
    for (let e of obj._ignores) ignored |= e._bit;
    for (let g of obj._groups) {
      category |= g._bit;
      for (let e of g._ignores) ignored |= e._bit;
    }
    obj.body.collisionFilter.category = category || 1;
    obj.body.collisionFilter.mask = 0x7fffffff & ~ignored;
  }

  // ===========================================================================
  // GameGroup
  // ===========================================================================
  class GameGroup {
    /**
     * new GameGroup()
     * new GameGroup({ color: 'gold', isSensor: true })  → defaults for group.create()
     */
    constructor(defaults = {}) {
      this._items = [];
      this._handlers = [];
      this._bit = 0;
      this._ignores = new Set();
      this.defaults = defaults;
      this.name = defaults.name || '';
    }

    get length() { return this._items.length; }
    get size() { return this._items.length; }
    get(i) { return this._items[i]; }
    get first() { return this._items[0]; }
    get last() { return this._items[this._items.length - 1]; }
    has(obj) { return obj instanceof GameObject && obj._groups.has(this); }
    toArray() { return this._items.slice(); }
    [Symbol.iterator]() { return this._items.slice()[Symbol.iterator](); }
    forEach(fn) { this._items.slice().forEach(fn); return this; }
    filter(fn) { return this._items.filter(fn); }
    map(fn) { return this._items.map(fn); }
    find(fn) { return this._items.find(fn); }
    some(fn) { return this._items.some(fn); }
    every(fn) { return this._items.every(fn); }
    random() { return this._items[Math.floor(Math.random() * this._items.length)]; }

    /** Make a new GameObject in this group, using the group's defaults. */
    create(x, y, width, height, options) {
      if (isPlainObject(width)) {
        options = width;
        width = undefined;
      } else if (isPlainObject(height)) {
        options = height;
        height = undefined;
      }
      // The group's own name (and any group setting) stays with the group: members
      // don't inherit them from the defaults. A name or group passed in here is kept.
      let defaults = Object.assign({}, this.defaults);
      delete defaults.group;
      delete defaults.name;
      if (defaults.data !== undefined) defaults.data = copyData(defaults.data); // each member gets its own data
      let opts = Object.assign(defaults, options || {});
      let obj = new GameObject(x, y, width ?? opts.width, height ?? opts.height, opts);
      this.add(obj);
      return obj;
    }

    /** Add one or more GameObjects (or arrays of them). */
    add(...objs) {
      for (let o of objs.flat()) {
        if (!(o instanceof GameObject) || o.destroyed || o._groups.has(this)) continue;
        o._groups.add(this);
        this._items.push(o);
        if (this._bit || this._ignores.size) refreshFilter(o);
      }
      return this;
    }

    /** Take an object out of this group (it stays in the world). */
    remove(obj) {
      let i = this._items.indexOf(obj);
      if (i === -1) return this;
      this._items.splice(i, 1);
      obj._groups.delete(this);
      if (!obj.destroyed) refreshFilter(obj);
      return this;
    }

    /** Destroy every object in this group. */
    destroyAll() {
      this._items.slice().forEach((o) => o.destroy());
      return this;
    }

    /** Set properties on every member: group.set({ color: 'red', bounce: 1 }) */
    set(props) {
      this._items.forEach((o) => Object.assign(o, props));
      return this;
    }

    /** Closest member to a point or GameObject. */
    closestTo(x, y) {
      let best = null;
      let bestD = Infinity;
      for (let o of this._items) {
        let d = o.distanceTo(x, y);
        if (d < bestD && o !== x) {
          bestD = d;
          best = o;
        }
      }
      return best;
    }

    // ---- collisions for the whole group: fn(member, other) ----
    onCollide(target, fn) { return GameObject.prototype._on.call(this, 'start', target, fn); }
    onCollideEnd(target, fn) { return GameObject.prototype._on.call(this, 'end', target, fn); }
    whileTouching(target, fn) { return GameObject.prototype._on.call(this, 'active', target, fn); }

    /** true if any member is touching target. */
    isTouching(target) {
      return this._items.some((o) => o.isTouching(target));
    }

    ignore(target) { linkIgnore(this, target); return this; }
    unignore(target) { unlinkIgnore(this, target); return this; }

    /** Draw every member now (sorted by depth). */
    draw(p = getP5()) {
      this._items
        .slice()
        .sort((a, b) => a.depth - b.depth)
        .forEach((o) => o.draw(p));
      return this;
    }
  }

  // ===========================================================================
  // Camera
  // ===========================================================================
  class GameCamera {
    constructor(world) {
      this.world = world;
      this._x = null; // null = centre of the canvas
      this._y = null;
      this.zoom = 1;
      this._target = null;
      this._ease = 1;
      this._offX = 0;
      this._offY = 0;
    }

    get x() { return this._x ?? (getP5() ? getP5().width / 2 : 0); }
    set x(v) { this._x = v; }
    get y() { return this._y ?? (getP5() ? getP5().height / 2 : 0); }
    set y(v) { this._y = v; }

    /** Keep a GameObject in view. ease: 1 = locked on, 0.1 = smooth follow. */
    follow(obj, ease = 0.1, offsetX = 0, offsetY = 0) {
      this._target = obj;
      this._ease = ease;
      this._offX = offsetX;
      this._offY = offsetY;
      return this;
    }

    stopFollowing() {
      this._target = null;
      return this;
    }

    reset() {
      this._x = this._y = null;
      this.zoom = 1;
      this._target = null;
      return this;
    }

    _update() {
      let t = this._target;
      if (!t) return;
      if (t.destroyed) {
        this._target = null;
        return;
      }
      this.x += (t.x + this._offX - this.x) * this._ease;
      this.y += (t.y + this._offY - this.y) * this._ease;
    }

    /** Convert screen (canvas) coordinates to world coordinates. */
    screenToWorld(sx, sy) {
      let p = getP5();
      let w = p ? p.width : 0;
      let h = p ? p.height : 0;
      return { x: (sx - w / 2) / this.zoom + this.x, y: (sy - h / 2) / this.zoom + this.y };
    }

    /** Convert world coordinates to screen (canvas) coordinates. */
    worldToScreen(wx, wy) {
      let p = getP5();
      let w = p ? p.width : 0;
      let h = p ? p.height : 0;
      return { x: (wx - this.x) * this.zoom + w / 2, y: (wy - this.y) * this.zoom + h / 2 };
    }

    viewBounds() {
      let tl = this.screenToWorld(0, 0);
      let p = getP5();
      let br = this.screenToWorld(p ? p.width : 0, p ? p.height : 0);
      return { left: tl.x, top: tl.y, right: br.x, bottom: br.y };
    }

    /** Start drawing in world space (use for your own drawings that should scroll). */
    begin(p = getP5()) {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.scale(this.zoom);
      p.translate(-this.x, -this.y);
    }

    /** Back to screen space (for a HUD / score). */
    end(p = getP5()) {
      p.pop();
    }
  }

  // ===========================================================================
  // Link (joints between objects)
  // ===========================================================================
  class GameLink {
    constructor(world, constraint, a, b) {
      this.world = world;
      this.constraint = constraint;
      this.a = a;
      this.b = b;
      this.visible = true;
      this.stroke = 80;
      this.strokeWeight = 2;
      this.destroyed = false;
    }

    get length() { return this.constraint.length; }
    set length(v) { this.constraint.length = v; }
    get stiffness() { return this.constraint.stiffness; }
    set stiffness(v) { this.constraint.stiffness = v; }

    _ends() {
      let c = this.constraint;
      let pa = c.bodyA ? Vector.add(c.bodyA.position, c.pointA) : c.pointA;
      let pb = c.bodyB ? Vector.add(c.bodyB.position, c.pointB) : c.pointB;
      return [pa, pb];
    }

    draw(p = getP5()) {
      if (!this.visible || this.destroyed) return;
      let [pa, pb] = this._ends();
      p.push();
      applyColor(p, 'stroke', this.stroke);
      p.strokeWeight(this.strokeWeight);
      p.line(pa.x, pa.y, pb.x, pb.y);
      p.pop();
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      Composite.remove(this.world.engine.world, this.constraint);
      this.world._links.delete(this);
    }
  }

  // ===========================================================================
  // GameWorld
  // ===========================================================================
  class GameWorld {
    /**
     * new GameWorld()                       → normal downward gravity
     * new GameWorld({ gravityY: 0 })        → space / top-down game
     * new GameWorld({ gravityX: 0, gravityY: 1, debug: true })
     */
    constructor(options = {}) {
      this.engine = Engine.create();
      this.engine.gravity.x = options.gravityX ?? 0;
      this.engine.gravity.y = options.gravityY ?? 1;
      this.objects = new GameGroup({ name: 'all' });
      this.camera = new GameCamera(this);
      this.autoUpdate = options.autoUpdate ?? true;
      this.autoDraw = options.autoDraw ?? true;
      this.debug = !!options.debug;
      this.paused = false;
      this.timeScale = options.timeScale ?? 1;
      this.background = options.background ?? null; // e.g. 220 → world clears the canvas for you

      this._links = new Set();
      this._movedStatics = new Set();
      this._drag = null;
      this._wasPressed = false;
      this._stepping = false;
      this._pendingRemove = [];
      this._updatedFrame = -1;
      this._drawnFrame = -1;
      this.frame = 0;

      Events.on(this.engine, 'collisionStart', (e) => this._handleCollisions(e, 'start'));
      Events.on(this.engine, 'collisionActive', (e) => this._handleCollisions(e, 'active'));
      Events.on(this.engine, 'collisionEnd', (e) => this._handleCollisions(e, 'end'));

      lib.world = this;
    }

    /** Make this the world new GameObjects are created in. */
    makeCurrent() {
      lib.world = this;
      return this;
    }

    get gravityX() { return this.engine.gravity.x; }
    set gravityX(v) { this.engine.gravity.x = v; }
    get gravityY() { return this.engine.gravity.y; }
    set gravityY(v) { this.engine.gravity.y = v; }
    setGravity(x, y) {
      this.engine.gravity.x = x;
      this.engine.gravity.y = y;
      return this;
    }

    /** Mouse position in world coordinates (same as mouseX/mouseY when the camera hasn't moved). */
    get mouse() {
      let p = getP5();
      if (!p) return { x: 0, y: 0 };
      return this.camera.screenToWorld(p.mouseX, p.mouseY);
    }
    get mouseX() { return this.mouse.x; }
    get mouseY() { return this.mouse.y; }

    // ---------------- object bookkeeping ----------------
    _addObject(obj) {
      Composite.add(this.engine.world, obj.body);
      this.objects.add(obj);
    }

    _removeObject(obj) {
      if (this._stepping) {
        this._pendingRemove.push(obj);
        obj.visible = false;
        return;
      }
      this._reallyRemove(obj);
    }

    _reallyRemove(obj) {
      Composite.remove(this.engine.world, obj.body);
      for (let g of [...obj._groups]) g.remove(obj);
      for (let other of obj._touching) other._touching.delete(obj);
      obj._touching.clear();
      for (let e of [...obj._ignores]) unlinkIgnore(obj, e);
      for (let link of [...this._links]) {
        if (link.a === obj || link.b === obj) link.destroy();
      }
      if (this._drag && this._drag.obj === obj) this._endDrag();
      if (this.camera._target === obj) this.camera._target = null;
    }

    /** Destroy every object and link in the world. */
    clear() {
      this.objects.destroyAll();
      [...this._links].forEach((l) => l.destroy());
      return this;
    }

    /** All objects under a point. */
    objectsAt(x, y) {
      return Query.point(this._bodies(), { x, y }).map((b) => b.gameObject);
    }

    /** All objects crossed by a line from (x1, y1) to (x2, y2). */
    raycast(x1, y1, x2, y2, width = 1) {
      let a = { x: x1, y: y1 };
      let b = { x: x2, y: y2 };
      return this.objects
        .filter((o) => Query.ray([o.body], a, b, width).length > 0)
        .sort((p, q) => p.distanceTo(x1, y1) - q.distanceTo(x1, y1));
    }

    _bodies() {
      return this.objects.toArray().map((o) => o.body);
    }

    /**
     * Put static walls around the canvas (or a given area) so things can't escape.
     * Returns a GameGroup with the walls: { top, bottom, left, right } are also set on it.
     */
    addWalls(options = {}) {
      let p = getP5();
      let t = options.thickness ?? 100;
      let x = options.x ?? 0;
      let y = options.y ?? 0;
      let w = options.width ?? (p ? p.width : 400);
      let h = options.height ?? (p ? p.height : 400);
      let style = {
        isStatic: true,
        color: pick(options, 'color', null),
        stroke: pick(options, 'stroke', null),
        bounce: options.bounce ?? 0.2,
        friction: options.friction ?? 0,
        world: this,
      };
      let walls = new GameGroup({ name: 'walls' });
      walls.top = new GameObject(x + w / 2, y - t / 2, w + t * 2, t, style);
      walls.bottom = new GameObject(x + w / 2, y + h + t / 2, w + t * 2, t, style);
      walls.left = new GameObject(x - t / 2, y + h / 2, t, h + t * 2, style);
      walls.right = new GameObject(x + w + t / 2, y + h / 2, t, h + t * 2, style);
      walls.add(walls.top, walls.bottom, walls.left, walls.right);
      if (options.top === false) walls.top.destroy();
      return walls;
    }

    // ---------------- joints ----------------
    /**
     * Join two objects together.
     * options.length    distance kept between them (default: current distance)
     * options.stiffness 1 = solid rod, 0.01 = very springy (default 0.7)
     * options.damping   0..1, reduces wobble
     * options.offsetA / offsetB  {x, y} attach points relative to each centre
     */
    connect(a, b, options = {}) {
      let c = Constraint.create({
        bodyA: a.body,
        bodyB: b.body,
        pointA: options.offsetA || { x: 0, y: 0 },
        pointB: options.offsetB || { x: 0, y: 0 },
        length: options.length,
        stiffness: options.stiffness ?? 0.7,
        damping: options.damping ?? 0,
      });
      Composite.add(this.engine.world, c);
      let link = new GameLink(this, c, a, b);
      this._links.add(link);
      return link;
    }

    /** Pin an object to a fixed point in the world (like a nail or a pendulum hinge). */
    pin(obj, x = obj.x, y = obj.y, options = {}) {
      let c = Constraint.create({
        pointA: { x, y },
        bodyB: obj.body,
        pointB: options.offset || { x: 0, y: 0 },
        length: options.length,
        stiffness: options.stiffness ?? 1,
        damping: options.damping ?? 0,
      });
      Composite.add(this.engine.world, c);
      let link = new GameLink(this, c, null, obj);
      this._links.add(link);
      return link;
    }

    get links() { return [...this._links]; }

    // ---------------- collisions ----------------
    _handleCollisions(event, type) {
      for (let pair of event.pairs) {
        let a = pair.bodyA.parent.gameObject;
        let b = pair.bodyB.parent.gameObject;
        if (!a || !b || a === b) continue;
        if (type === 'start') {
          a._touching.add(b);
          b._touching.add(a);
        } else if (type === 'end') {
          a._touching.delete(b);
          b._touching.delete(a);
        }
        this._dispatch(a, b, type);
        this._dispatch(b, a, type);
      }
    }

    _dispatch(self, other, type) {
      if (self.destroyed || other.destroyed) return;
      let run = (handlers) => {
        for (let h of handlers) {
          if (h.type !== type) continue;
          let t = h.target;
          if (t === null || t === undefined || t === other || (t instanceof GameGroup && t.has(other))) {
            h.fn(self, other);
          }
        }
      };
      run(self._handlers);
      for (let g of [...self._groups]) run(g._handlers);
    }

    // ---------------- mouse dragging ----------------
    _updateDrag() {
      let p = getP5();
      if (!p) return;
      let pressed = !!p.mouseIsPressed;
      let m = this.mouse;
      if (pressed && !this._wasPressed) {
        let hits = this.objectsAt(m.x, m.y).filter((o) => o.draggable);
        if (hits.length) {
          hits.sort((a, b) => b.depth - a.depth);
          this._startDrag(hits[0], m);
        }
      } else if (!pressed && this._wasPressed) {
        this._endDrag();
      }
      this._wasPressed = pressed;

      if (this._drag) {
        let d = this._drag;
        if (d.constraint) {
          d.constraint.pointA = { x: m.x, y: m.y };
        } else {
          d.obj.setPosition(m.x - d.dx, m.y - d.dy);
        }
      }
    }

    _startDrag(obj, m) {
      if (obj.isStatic) {
        this._drag = { obj, dx: m.x - obj.x, dy: m.y - obj.y, constraint: null };
        return;
      }
      let c = Constraint.create({
        pointA: { x: m.x, y: m.y },
        bodyB: obj.body,
        pointB: { x: m.x - obj.x, y: m.y - obj.y },
        length: 0,
        stiffness: 0.2,
        damping: 0.1,
      });
      Composite.add(this.engine.world, c);
      this._drag = { obj, constraint: c };
    }

    _endDrag() {
      if (!this._drag) return;
      if (this._drag.constraint) Composite.remove(this.engine.world, this._drag.constraint);
      this._drag = null;
    }

    /** The object being dragged right now (or null). */
    get dragging() {
      return this._drag ? this._drag.obj : null;
    }

    // ---------------- the game loop ----------------
    /**
     * Advance the game one frame: runs each object's update(), physics,
     * collisions, animations and lifespans. Called automatically before draw()
     * unless you call it yourself.
     */
    update() {
      let p = getP5();
      let fc = p ? p.frameCount : this.frame + 1;
      if (this._inAutoHook !== true) {
        // the sketch is calling update() itself → stop doing it automatically
        this.autoUpdate = false;
      }
      if (fc === this._updatedFrame) return this;
      this._updatedFrame = fc;

      this._updateDrag();
      if (this.paused) return this;

      this.frame++;
      for (let o of this.objects) {
        if (o.destroyed) continue;
        checkSubclass(o);
        o.update();
      }

      this._stepping = true;
      try {
        Engine.update(this.engine, STEP_MS * this.timeScale);
      } finally {
        this._stepping = false;
      }
      // moving platforms only carry things for the step after they moved
      for (let o of this._movedStatics) {
        let b = o.body;
        b.velocity.x = b.velocity.y = 0;
        b.angularVelocity = 0;
        b.positionPrev.x = b.position.x;
        b.positionPrev.y = b.position.y;
        b.anglePrev = b.angle;
      }
      this._movedStatics.clear();
      this._flushRemovals();
      // startGame()/endLevel()/endGame() called inside a collision callback wait until here
      if (lib.manager) lib.manager._runQueued();

      for (let o of this.objects) {
        if (o.destroyed) continue;
        o._stepAnimation();
        if (o.lifespan !== Infinity && --o.lifespan <= 0) o.destroy();
      }
      this._flushRemovals();
      this.camera._update();
      return this;
    }

    _flushRemovals() {
      let list = this._pendingRemove;
      this._pendingRemove = [];
      list.forEach((o) => this._reallyRemove(o));
    }

    /**
     * Draw every object (sorted by depth) through the camera. Called
     * automatically after your draw() unless you call it yourself.
     */
    draw(p = getP5()) {
      if (!p) return this;
      let fc = p.frameCount;
      if (this._inAutoHook !== true) this._drawnFrame = fc; // manual draw this frame → skip auto

      p.push();
      if (this.background !== null && this.background !== undefined) {
        Array.isArray(this.background) ? p.background(...this.background) : p.background(this.background);
      }
      this.camera.begin(p);
      for (let link of this._links) link.draw(p);
      this.objects.draw(p);
      if (this.debug) this._drawDebug(p);
      this.camera.end(p);
      p.pop();
      return this;
    }

    _drawDebug(p) {
      p.push();
      p.noFill();
      p.strokeWeight(1 / this.camera.zoom);
      for (let o of this.objects) {
        let b = o.body;
        p.stroke(o.isSensor ? 'orange' : o.isTouching() ? 'red' : 'lime');
        let parts = b.parts.length > 1 ? b.parts.slice(1) : [b];
        for (let part of parts) {
          p.beginShape();
          for (let v of part.vertices) p.vertex(v.x, v.y);
          p.endShape(p.CLOSE);
        }
        p.stroke('magenta');
        p.line(b.position.x - 4, b.position.y, b.position.x + 4, b.position.y);
        p.line(b.position.x, b.position.y - 4, b.position.x, b.position.y + 4);
      }
      p.pop();
    }
  }

  // ===========================================================================
  // Extra helpers
  // ===========================================================================

  /**
   * Cut a sprite sheet image into an array of frames (for addAnimation).
   * spriteSheet(img, frameWidth, frameHeight)          → all frames, left→right, top→bottom
   * spriteSheet(img, frameWidth, frameHeight, count)   → just the first count frames
   */
  function spriteSheet(img, frameWidth, frameHeight = frameWidth, count = Infinity, startIndex = 0) {
    let cols = Math.floor(img.width / frameWidth);
    let rows = Math.floor(img.height / frameHeight);
    let frames = [];
    for (let i = startIndex; i < cols * rows && frames.length < count; i++) {
      let cx = (i % cols) * frameWidth;
      let cy = Math.floor(i / cols) * frameHeight;
      frames.push(img.get(cx, cy, frameWidth, frameHeight));
    }
    return frames;
  }

  // ===========================================================================
  // GameManager — score, levels, and the start and end of the game
  // ===========================================================================
  // One is made automatically as `gameManager`. It keeps the score and level and
  // calls these functions in your sketch, if you write them:
  //   gameStarted()        after gameManager.startGame()
  //   levelStarted(level)  when a level begins (level 1 straight after gameStarted)
  //   levelEnded(level)    after gameManager.endLevel(), before the next level starts
  //   gameEnded(won)       after gameManager.endGame(), or after the last level
  let CALLBACKS = ['gameStarted', 'gameEnded', 'levelStarted', 'levelEnded'];

  class GameManager {
    constructor() {
      this.state = 'title'; // 'title' (not started yet), 'playing' or 'over'
      this.level = 0; // 1 for the first level, 0 before the game starts
      this.levels = Infinity; // how many levels there are: finishing the last one wins
      this.won = false; // true when the game ended because the last level was finished
      this.highScore = 0; // the best score since the page loaded
      this._score = 0;
      this._queue = [];
      lib.manager = this;
    }

    get score() {
      return this._score;
    }
    set score(v) {
      this._score = v;
      if (v > this.highScore) this.highScore = v;
    }

    /** Add points to the score (use a negative number to take some away). */
    addScore(points = 1) {
      this.score = this._score + points;
      return this;
    }

    get isPlaying() {
      return this.state === 'playing';
    }
    get isOver() {
      return this.state === 'over';
    }

    /** Start (or restart) the game: score 0, level 1. Calls gameStarted() then levelStarted(1). */
    startGame() {
      return this._later('startGame', () => {
        this.state = 'playing';
        this.won = false;
        this._score = 0;
        this.level = 1;
        callBack('gameStarted');
        callBack('levelStarted', this.level);
      });
    }

    /** Finish the current level. Calls levelEnded(level), then starts the next one (or ends the game after the last). */
    endLevel() {
      return this._later('endLevel', () => {
        if (this.state !== 'playing') return;
        let finished = this.level;
        callBack('levelEnded', finished);
        if (this.state !== 'playing' || this.level !== finished) return; // levelEnded() ended or changed the game
        if (finished >= this.levels) {
          this._finish(true);
        } else {
          this.level = finished + 1;
          callBack('levelStarted', this.level);
        }
      });
    }

    /** End the game now (the player lost, or quit). Calls gameEnded(false). */
    endGame() {
      return this._later('endGame', () => {
        if (this.state === 'playing') this._finish(false);
      });
    }

    _finish(won) {
      this.state = 'over';
      this.won = won;
      callBack('gameEnded', won);
    }

    // Collision callbacks run in the middle of a physics step, where building or
    // clearing a level isn't safe. Calls made then wait until the step is over.
    // The same call made twice in one step (two coins collected at once, say)
    // only counts once, so a level is never skipped.
    _later(kind, action) {
      let w = lib.world;
      if (w && w._stepping) {
        if (!this._queue.some((q) => q.kind === kind)) this._queue.push({ kind, action });
      } else {
        action();
      }
      return this;
    }

    _runQueued() {
      while (this._queue.length) this._queue.shift().action();
    }
  }

  // Find one of the sketch's callbacks: a global function (global mode) or p.name (instance mode)
  function findCallback(name) {
    let p = getP5();
    if (p && typeof p[name] === 'function' && !(name in P5Proto())) return p[name].bind(p);
    if (typeof global[name] === 'function') return global[name];
    return null;
  }
  function P5Proto() {
    return (global.p5 && global.p5.prototype) || {};
  }
  function callBack(name, ...args) {
    checkCallbackSpelling(getP5());
    let fn = findCallback(name);
    if (fn) fn(...args);
  }

  // A callback with the wrong capitals (gamestarted, LevelEnded...) would never run,
  // so point it out once, the first time the game manager looks for its callbacks.
  let checkedCallbackSpelling = false;
  function checkCallbackSpelling(p) {
    if (checkedCallbackSpelling) return;
    checkedCallbackSpelling = true;
    let names = new Set([...Object.keys(global), ...Object.keys(p || {})]);
    for (let right of CALLBACKS) {
      if (findCallback(right)) continue;
      for (let name of names) {
        if (name === right || name.toLowerCase() !== right.toLowerCase()) continue;
        let value;
        try {
          value = global[name] !== undefined ? global[name] : p[name];
        } catch (e) {
          continue;
        }
        if (typeof value === 'function') {
          console.warn(
            `GameObjects: found a function called "${name}()". Did you mean ${right}()? ` +
              `The game manager only calls it if it's spelled exactly ${right}.`
          );
        }
      }
    }
  }

  // ===========================================================================
  // Hook into the p5 draw loop (supports p5 1.x and 2.x)
  // ===========================================================================
  function onInit() {
    lib.p = this;
  }

  function onPreDraw() {
    lib.p = this;
    let w = lib.world;
    if (w && w.autoUpdate) {
      w._inAutoHook = true;
      try {
        w.update();
      } finally {
        w._inAutoHook = false;
      }
    }
  }

  function onPostDraw() {
    let w = lib.world;

    // 1. draw the game objects (unless the sketch already did, or turned it off)
    if (w && w.autoDraw && w._drawnFrame !== this.frameCount) {
      w._inAutoHook = true;
      try {
        this.push();
        this.resetMatrix();
        w.draw(this);
        this.pop();
      } finally {
        w._inAutoHook = false;
      }
    }

    // 2. then the sketch's optional drawOnTop(), on top of everything,
    //    in screen space (the camera doesn't move it)
    let onTop = findDrawOnTop(this);
    if (onTop) {
      this.push();
      this.resetMatrix();
      try {
        onTop.call(this);
      } finally {
        this.pop();
      }
    }

    // 3. a small credit in the top right for the first few seconds
    drawCredit(this);
  }

  // "created with GameObjects.org" in the top right, shown for 5 seconds, fading out in the last one
  let CREDIT_TEXT = 'created with GameObjects.org';
  let CREDIT_TIME = 5000; // milliseconds
  let CREDIT_FADE = 1000;
  function drawCredit(p) {
    if (p._goCreditStart === undefined) p._goCreditStart = p.millis();
    let age = p.millis() - p._goCreditStart;
    if (age >= CREDIT_TIME) return;
    let alpha = Math.min(1, (CREDIT_TIME - age) / CREDIT_FADE);
    p.push();
    p.resetMatrix();
    p.textFont('sans-serif');
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    p.textStyle(p.NORMAL);
    let w = p.textWidth(CREDIT_TEXT) + 16;
    p.noStroke();
    p.rectMode(p.CORNER);
    p.fill(0, 215 * alpha);
    let x = p.width - w - 6; // the top right corner
    p.rect(x, 6, w, 22, 6);
    p.fill(255, 255 * alpha);
    p.text(CREDIT_TEXT, x + 8, 17);
    p.pop();
  }

  // drawOnTop() can be a global function (global mode) or p.drawOnTop (instance mode)
  let checkedSpelling = false;
  function findDrawOnTop(p) {
    let fn = typeof p.drawOnTop === 'function' ? p.drawOnTop : null;
    if (!fn && typeof global.drawOnTop === 'function') fn = global.drawOnTop;
    if (!fn && !checkedSpelling) warnAboutSpelling(p);
    checkedSpelling = true;
    return fn;
  }

  // A misspelled drawOnTop would silently never run, so point it out once.
  function warnAboutSpelling(p) {
    let near = /^(drawontop|draw_on_top|drawontops|postdraw|drawafter|drawlast)$/;
    let names = new Set([...Object.keys(global), ...Object.keys(p)]);
    for (let name of names) {
      if (name !== 'drawOnTop' && near.test(name.toLowerCase())) {
        let value;
        try {
          value = global[name] !== undefined ? global[name] : p[name];
        } catch (e) {
          continue;
        }
        if (typeof value === 'function') {
          console.warn(
            `GameObjects: found a function called "${name}()". Did you mean drawOnTop()? ` +
              `Name it drawOnTop() (capital O and T) and it will run after all the objects are drawn.`
          );
          return;
        }
      }
    }
  }

  let P5 = global.p5;
  if (P5) {
    if (typeof P5.registerAddon === 'function') {
      // p5.js 2.x
      P5.registerAddon(function (p5, fn, lifecycles) {
        lifecycles.presetup = onInit;
        lifecycles.predraw = onPreDraw;
        lifecycles.postdraw = onPostDraw;
      });
    } else if (P5.prototype && typeof P5.prototype.registerMethod === 'function') {
      // p5.js 1.x
      P5.prototype.registerMethod('init', onInit);
      P5.prototype.registerMethod('pre', onPreDraw);
      P5.prototype.registerMethod('post', onPostDraw);
    }
  } else {
    console.warn('GameObjects.js: load p5.js before gameobjects.js');
  }

  // ===========================================================================
  // Exports
  // ===========================================================================
  lib.GameWorld = GameWorld;
  lib.GameObject = GameObject;
  lib.GameGroup = GameGroup;
  lib.GameCamera = GameCamera;
  lib.GameLink = GameLink;
  lib.GameManager = GameManager;
  lib.spriteSheet = spriteSheet;
  lib.Matter = M;
  Object.defineProperty(lib, 'currentWorld', { get: currentWorld });

  global.GameObjects = lib;
  global.GameWorld = GameWorld;
  global.GameObject = GameObject;
  global.GameGroup = GameGroup;
  global.GameManager = GameManager;

  // ---------------------------------------------------------------------------
  // A ready-made world. Sketches can use `world` straight away without making
  // one: `world.gravityY = 0`, `world.camera.follow(player)`, ...
  // `world` always means the current world, so `new GameWorld({...})` (or
  // `world = new GameWorld({...})`) still works and replaces it.
  // A sketch that declares its own `let world` simply uses its own variable.
  // ---------------------------------------------------------------------------
  new GameWorld(); // becomes the current world
  if (!Object.prototype.hasOwnProperty.call(global, 'world')) {
    Object.defineProperty(global, 'world', {
      configurable: true, // lets sketches still declare their own `let world`
      enumerable: false,
      get() {
        return lib.world;
      },
      set(w) {
        if (w instanceof GameWorld) {
          w.makeCurrent();
        } else {
          // someone is using `world` for something else: let them
          Object.defineProperty(global, 'world', { value: w, writable: true, configurable: true });
        }
      },
    });
  }

  // A ready-made game manager, the same way: `gameManager.startGame()`, `gameManager.score`...
  new GameManager();
  if (!Object.prototype.hasOwnProperty.call(global, 'gameManager')) {
    Object.defineProperty(global, 'gameManager', {
      configurable: true,
      enumerable: false,
      get() {
        return lib.manager;
      },
      set(m) {
        if (m instanceof GameManager) {
          lib.manager = m;
        } else {
          Object.defineProperty(global, 'gameManager', { value: m, writable: true, configurable: true });
        }
      },
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
})(typeof window !== 'undefined' ? window : globalThis);
