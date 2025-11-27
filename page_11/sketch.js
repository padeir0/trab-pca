const fps = 20;
const circleSize = 20;
const numClusters = 2;

const minPointsPerCluster = 10;
const maxPointsPerCluster = 20;

const minInitialRadius = 30;
const maxInitialRadius = 50;

const noiseDeviation = 20;

const maxRadius = maxInitialRadius;

const centerExclusionZoneRadius = 500;
const maxDistanceToCenter = centerExclusionZoneRadius + 50;

let clusters = [];

function dashedLine(x1, y1, x2, y2, dash = 10, gap = 5) {
  let d = dist(x1, y1, x2, y2);
  let dx = (x2 - x1) / d;
  let dy = (y2 - y1) / d;

  for (let i = 0; i < d; i += dash + gap) {
    let sx = x1 + dx * i;
    let sy = y1 + dy * i;
    let ex = x1 + dx * min(i + dash, d);
    let ey = y1 + dy * min(i + dash, d);
    line(sx, sy, ex, ey);
  }
}

function star(p, r) {
  let x = p.x;
  let y = p.y;
  const npoints = 8;
  const radius1 = r/2;
  const radius2 = radius1 / 2;
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function generateScalars(centers, deviation, numPoints) {
  let out = [];

  for (let i = 0; i < centers.length; i++) {
    let c = centers[i];
    for (let j = 0; j < numPoints; j++) {
      let a = randomGaussian(c, deviation);
      out.push(a);
    }
  }

  return out;
}

function linearCloud(center, dir, scalars, noise = false) {
  let out = [];
  for (let i = 0; i < scalars.length; i++) {
    let coef = scalars[i];
    let offset = p5.Vector.mult(dir, coef);
    let p = p5.Vector.add(center, offset);

    if (noise) {
      let noise = randomGaussian(0, noiseDeviation);
      p.y += noise;
    }

    out.push(p);
  }
  return out;
}

function randint(lower, upper) {
  return floor(random(lower, upper));
}

class Cluster {
  constructor (points) {
    this.points = points;
    this.centroid = this.findCentroid();
    this.fade = max(0.1, 1 - (this.deviation() / maxRadius));
  }

  deviation() {
    let out = 0;
    for (let i = 0; i < this.points.length; i++) {
      out += p5.Vector.dist(this.centroid, this.points[i]);
    }
    return out/this.points.length;
  }

  findCentroid() {
    let out = createVector(0, 0);
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      out.add(p);
    }
    out.mult(1.0 / this.points.length);
    return out;
  }

  draw() {
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      noStroke();
      fill(128, 0, 0, this.fade*192);
      circle(p.x, p.y, circleSize);
    }
    fill(0, 0, 128);
    star(this.centroid, circleSize);
    fill(128, 0, 0, this.fade*192);
  }
}

function generateClusters() {
  clusters = [];

  let left = createVector(width/3, 2*height/3);
  let right = createVector(2*width/3, 2*height/3);
  let numPoints = randint(minPointsPerCluster, maxPointsPerCluster);

  let scalars = generateScalars([-80, 0, 80], random(7, 15), numPoints);
  console.log(scalars);

  let randomDir = createVector(random(-1, 1), random(-1, 1)).normalize();
  let points1 = linearCloud(left, randomDir, scalars, true);
  clusters.push(new Cluster(points1));

  let dir = p5.Vector.sub(right, left).normalize();
  let points2 = linearCloud(right, dir, scalars, false);
  clusters.push(new Cluster(points2));
}

function reset() {
  generateClusters();
  redraw();
}

function setup() {
  p5Canvas = createCanvas(windowWidth, windowHeight);
  p5Canvas.parent("canvas-container");

  p5Canvas.position(0, 0);
  p5Canvas.style('z-index', '-1');
  p5Canvas.style('position', 'fixed');

  frameRate(fps);

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") reset();
    if (e.key === "ArrowLeft") location.assign("../page_9/index.html");
    if (e.key === "ArrowRight") location.assign("../page_11/index.html");
    if (e.key.toLowerCase() === "h") {
      const overlay = document.getElementById("help-overlay");
      overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
    }
  });

  document.getElementById("help-close").addEventListener("click", () => {
    document.getElementById("help-overlay").style.display = "none";
  });

  noLoop();
  reset();
}

function draw() {
  background(220);
  for (let i = 0; i < numClusters; i++) {
    clusters[i].draw();
  }

  stroke(1);
  dashedLine(width/2, height/2, width/2, 4*height/5);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
}
