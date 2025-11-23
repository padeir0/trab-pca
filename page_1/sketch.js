const fps = 1;
const circleSize = 20;
const accelerationFactor = 0.001;
const numClusters = 10;

const minPointsPerCluster = 10;
const maxPointsPerCluster = 80;

const minInitialRadius = 60;
const maxInitialRadius = 100;

const minFade = 0.1;
const maxFade = 0.99;
const maxRadius = 200;

const minSpeed = 0;
const maxSpeed = 0;

const centerExclusionZoneRadius = 200;

let clusters = [];

function drawArrow(base, vec, color = 'black') {
  push();
  stroke(color);
  fill(color);

  // Translate to the base point
  translate(base.x, base.y);

  // Draw the main line
  line(0, 0, vec.x, vec.y);

  // Draw the arrowhead
  let arrowSize = 10;
  let angle = vec.heading();
  translate(vec.x, vec.y);
  rotate(angle);
  beginShape();
  vertex(0, 0);
  vertex(-arrowSize, arrowSize / 2);
  vertex(-arrowSize, -arrowSize / 2);
  endShape(CLOSE);

  pop();
}

function randomOrthoPair(maxRadius) {
  let x = random(-maxRadius, maxRadius);
  let y = random(-maxRadius, maxRadius);
  let v1 = createVector(x, y);
  let v2 = createVector(-y, x);
  return {"axis1": v1, "axis2": v2}
}

function pointCloud(center, maxRadius, numPoints) {
  let pair = randomOrthoPair(maxRadius);
  out = [];
  for (let i = 0; i < numPoints; i++) {
    let p = center.copy()
    let a1 = random(-1, 1);
    let a2 = random(-1, 1);
    p.add(p5.Vector.mult(pair.axis1, a1))
     .add(p5.Vector.mult(pair.axis2, a2));
    out.push(p);
  }
  return out;
}

function randint(lower, upper) {
  return floor(random(lower, upper));
}

function isInCenter(p) {
  let windowCenter = createVector(width/2, height/2);
  return p5.Vector.dist(windowCenter, p) < centerExclusionZoneRadius;
}

function randomVecInCanvas() {
  let out = createVector(random(0, width), random(0, height));
  while (isInCenter(out)) {
    out = createVector(random(0, width), random(0, height));
  }
  return out;
}

class Cluster {
  constructor (center, numPoints, initialRadius, speed) {
    this.center = center;
    this.speed = speed;
    this.points = pointCloud(center, initialRadius, numPoints);
  }

  update() {
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      let velVec = p5.Vector.sub(p, this.center).normalize().mult(this.speed);
      p.add(velVec);
    }
    this.speed += accelerationFactor * this.speed;
    this.fade = max(0, 0.7 - (p5.Vector.dist(this.center, this.points[0]) / maxRadius));
  }

  draw() {
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      noStroke();
      fill(128, 0, 0, this.fade*240);
      circle(p.x, p.y, circleSize);
    }
  }

  shouldDie() {
    return this.fade < minFade || this.fade > maxFade;
  }
}

function newRandomCluster() {
  let center = randomVecInCanvas();
  let numPoints = randint(minPointsPerCluster, maxPointsPerCluster);
  let initialRadius = randint(minInitialRadius, maxInitialRadius);
  let speed = random(minSpeed, maxSpeed);
  return new Cluster(center, numPoints, initialRadius, speed);
}

function generateClusters() {
  clusters = [];
  for (let i = 0; i < numClusters; i++) {
    clusters.push(newRandomCluster());
  }
}

function generateAndRedraw() {
  generateClusters();
  redraw();
}

function setup() {
  p5Canvas = createCanvas(windowWidth, windowHeight);
  p5Canvas.parent("canvas-container");

  p5Canvas.position(0, 0);
  p5Canvas.style('z-index', '-1');
  p5Canvas.style('position', 'fixed');

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") generateAndRedraw();
    if (e.key === "ArrowLeft") location.assign("../page_0/index.html");
    if (e.key === "ArrowRight") location.assign("../page_2/index.html");
  });

  frameRate(fps);
  generateClusters();
  noLoop();
}

function draw() {
  background(220);
  for (let i = 0; i < numClusters; i++) {
    clusters[i].update();
  }
  for (let i = 0; i < numClusters; i++) {
    clusters[i].draw();
  }
  for (let i = 0; i < numClusters; i++) {
    if (clusters[i].shouldDie()) {
      clusters[i] = newRandomCluster();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateAndRedraw();
}
