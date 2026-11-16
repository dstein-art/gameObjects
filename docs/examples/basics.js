// GameObjects — Basics
// Click to drop shapes. Drag them around. Press D for debug view, C to clear.

let ground;
let shapes;

function setup() {
  createCanvas(800, 500);

  // `world` is ready-made: objects in it are updated and drawn automatically.

  // Invisible walls around the canvas so nothing escapes
  world.addWalls();

  // A static object never moves
  ground = new GameObject(width / 2, height - 20, width, 40, {
    isStatic: true,
    color: 80,
  });

  // A ramp, rotated 15 degrees
  new GameObject(250, 300, 300, 20, { isStatic: true, rotation: 15, color: 120 });

  // A group to keep track of everything we drop
  shapes = new GameGroup({ draggable: true, bounce: 0.4 });
}

function draw() {
  background(235);

  fill(0);
  noStroke();
  textSize(14);
  text('Click to drop a shape · drag to throw · D = debug · C = clear', 10, 20);
  text('Shapes: ' + shapes.length, 10, 40);
}

function mousePressed() {
  // Don't spawn if we clicked on something (we're dragging it instead)
  if (world.objectsAt(mouseX, mouseY).length > 0) return;

  let kind = random(['box', 'circle', 'triangle', 'polygon']);
  let size = random(25, 60);

  // group.create() makes a GameObject that uses the group's defaults
  shapes.create(mouseX, mouseY, size, size, {
    shape: kind,
    sides: floor(random(5, 9)),
    rotation: random(360),
  });
}

function keyPressed() {
  if (key === 'd' || key === 'D') world.debug = !world.debug;
  if (key === 'c' || key === 'C') shapes.destroyAll();
}
