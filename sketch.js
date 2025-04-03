let my = {};
let starfield = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noFill();
  strokeWeight(2);

  // Create full screen button
  my.fullScreenBtn = createButton("Full Screen");
  my.fullScreenBtn.mousePressed(full_screen_action);
  my.fullScreenBtn.style("font-size:32px");

  // Initialize background star particles
  for (let i = 0; i < 800; i++) {
    let x = random(-2000, 2000);
    let y = random(-2000, 2000);
    let z = random(-2000, 2000);
    starfield.push(createVector(x, y, z));
  }

  // Set up microphone input and FFT (sound analysis)
  my.mic = new p5.AudioIn();
  my.mic.start();

  my.fft = new p5.FFT();
  my.fft.setInput(my.mic);
}

function draw() {
  background(0);
  let t = frameCount;

  // Analyze audio input, get mid-frequency energy
  let spectrum = my.fft.analyze();
  let energy = my.fft.getEnergy("mid");

  // Rotate scene based on mouse position
  rotateX(map(mouseY, 0, height, -90, 90));
  rotateY(map(mouseX, 0, width, -180, 180));

  // Draw background starfield first (before lighting)
  updateStarfield(t);
  drawStarfield(t);

  // Lighting for center planet and galaxy rings
  ambientLight(20);
  pointLight(255, 255, 255, 0, 0, 300);

  // Central planet (reflective material)
  push();
  rotateY(t * 0.2);
  ambientMaterial(80);
  specularMaterial(200, 200, 255);
  shininess(100);
  sphere(120);
  pop();

  // Original galaxy swirl effect (spiral arms)
  drawOriginalSwirl(t);

  // Multiple orbiting galaxy rings, colors react to sound
  for (let j = 0; j < 5; j++) {
    drawGalaxyRing(t, j, energy);
  }
}

// Move stars forward (simulate space travel)
function updateStarfield(t) {
  for (let star of starfield) {
    star.z += 10;
    if (star.z > 2000) {
      star.x = random(-2000, 2000);
      star.y = random(-2000, 2000);
      star.z = random(-2000, -1000);
    }
  }
}

// Draw background stars using points (not affected by lighting)
function drawStarfield(t) {
  push();
  noLights();
  strokeWeight(1);
  for (let star of starfield) {
    push();
    let brightness =
      map(star.z, -2000, 2000, 255, 50) +
      30 * sin(t * 0.1 + star.x * 0.001 + star.y * 0.001);
    brightness = constrain(brightness, 50, 255);
    stroke(brightness);
    translate(star.x, star.y, star.z);
    point(0, 0, 0);
    pop();
  }
  pop();
}

// Original galaxy swirl structure (around the planet)
function drawOriginalSwirl(t) {
  push();
  rotateZ(t * 0.3);
  strokeWeight(1.5);
  for (let i = 0; i < 80; i++) {
    let angle = i * 10 + t * 0.5;
    let radius = 180 + sin(i + t * 0.02) * 20;

    let x = radius * cos(angle);
    let y = radius * sin(angle);
    let z = sin(i * 5 + t) * 50;

    stroke(
      100 + 100 * sin(i * 0.1 + t * 0.02),
      100 + 100 * sin(i * 0.1 + t * 0.03),
      255
    );

    push();
    translate(x, y, z);
    sphere(3);
    pop();
  }
  pop();
}

// Colorful orbiting galaxy rings (color responds to audio energy)
function drawGalaxyRing(t, ringIndex, energy) {
  push();
  rotateZ(t * 0.3 + ringIndex * 30); // Rotate each ring differently
  strokeWeight(1.2);
  let ringOffset = ringIndex * 15;
  let colorShift = energy * 0.01; // Use audio energy to shift color

  for (let i = 0; i < 80; i++) {
    let angle = i * 10 + t * 0.5 + ringOffset;
    let radius = 220 + ringIndex * 40 + sin(i + t * 0.02 + ringIndex) * 20;

    let x = radius * cos(angle);
    let y = radius * sin(angle);
    let z = sin(i * 5 + t + ringIndex * 20) * 50;

    // Use sin/cos functions to generate colorful values
    stroke(
      127 + 127 * sin(i * 0.15 + t * 0.01 + ringIndex * 3 + colorShift),
      127 + 127 * cos(i * 0.1 + t * 0.015 + ringIndex * 1.5 + colorShift),
      127 + 127 * sin(i * 0.2 + t * 0.02 + ringIndex * 2 + colorShift)
    );

    push();
    translate(x, y, z);
    sphere(3);
    pop();
  }
  pop();
}

// Handle full screen toggle
function full_screen_action() {
  my.fullScreenBtn.remove();
  fullscreen(1);
  setTimeout(() => resizeCanvas(windowWidth, windowHeight), 1000);
}

// Resize canvas when window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
