const fps = 20;
const circleSize = 5;
const accelerationFactor = 0.001;
const numClusters = 10;

const minPointsPerCluster = 5;
const maxPointsPerCluster = 50;

const minInitialRadius = 5;
const maxInitialRadius = 50;

const minFade = 0.1;
const maxRadius = 200;

const minSpeed = 0.001;
const maxSpeed = 1;

let clusters = [];

function randint(lower, upper) {
  return floor(random(lower, upper));
}

function randomVecInCanvas() {
  return createVector(random(0, width), random(0, height));
}

class Cluster {
  constructor (center, numPoints, initialRadius, speed) {
    this.center = center;
    this.numPoints = numPoints;
    this.speed = speed;
    this.points = [];

    for (let i = 0; i < numPoints; i++) {
      let p = createVector(
        random(-initialRadius, initialRadius),
        random(-initialRadius, initialRadius));
      this.points.push(p.add(this.center));
    }
  }

  update() {
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      let velVec = p5.Vector.sub(p, this.center).normalize().mult(this.speed);
      p.add(velVec);
    }
    this.speed += accelerationFactor * this.speed;
    this.fade = max(0, 1 - (p5.Vector.dist(this.center, this.points[0]) / maxRadius));
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
    return this.fade < minFade;
  }
}

function newRandomCluster() {
  let center = randomVecInCanvas();
  let numPoints = randint(minPointsPerCluster, maxPointsPerCluster);
  let initialRadius = randint(minInitialRadius, maxInitialRadius);
  let speed = random(minSpeed, maxSpeed);
  return new Cluster(center, numPoints, initialRadius, speed);
}

function setup() {
  p5Canvas = createCanvas(windowWidth, windowHeight);
  p5Canvas.parent("canvas-container");

  p5Canvas.position(0, 0);
  p5Canvas.style('z-index', '-1');
  p5Canvas.style('position', 'fixed');

  background(220);
  frameRate(fps);
  for (let i = 0; i < numClusters; i++) {
    clusters.push(newRandomCluster());
  }
}

function draw() {
  background(220);
  for (let i = 0; i < numClusters; i++) {
    clusters[i].draw();
  }
  for (let i = 0; i < numClusters; i++) {
    clusters[i].update();
  }
  for (let i = 0; i < numClusters; i++) {
    if (clusters[i].shouldDie()) {
      clusters[i] = newRandomCluster();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
