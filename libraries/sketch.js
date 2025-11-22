// Memory Garden — procedural + parametric story
// Interact: click to plant, hover to reveal fragments, 1/2/3 switch memory themes,
// slider controls growth speed, End to finish (ending changes by flowers planted).

let scene = 'garden';        // 'garden' | 'endingA' | 'endingB'
let flowers = [];
let growthSlider, btnEnd, btnRestart;
let currentTheme = 'mixed';  // 'sight' | 'sound' | 'smell' | 'mixed'
let plantedCount = 0;
let revealedCount = 0;
let lastHoverText = "";
let lastHoverTime = 0;

const fragments = {
  sight: [
    "Neon glow,refracting off puddles",
    "A  clear window displaying a beautiful city",
    "Distant cities portraid under the orange skyline",
    "Paper cranes resting on a window sill",
    "Keys shining like stars"
  ],
  sound: [
    "Subway roaring underfoot",
    "Distant sirens quickly getting louder",
    "A kettle murmuring softly",
    "Shoes squeaking",
    "Coins making their presence known"
  ],
  smell: [
    "Fresh rain and grass, leaving the environment earthy",
    "Pungent citrus aroma wafting from the juice",
    "Laundry freshening up the stairwell",
    "Buttery popcorn smell, cutting through the air",
    "Thick Tires, recently burned"
  ]
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');
  noStroke();

  // Start with a few procedural blooms
  for (let i = 0; i < 8; i++) {
    flowers.push(new Flower(random(width), random(height*0.25, height*0.9)));
  }

  // Parametric control: growth speed
  growthSlider = createSlider(0.2, 3.0, 1.0, 0.01);
  growthSlider.position(20, 20);
  growthSlider.style('width', '220px');
  growthSlider.elt.title = "Growth speed";

  // Buttons
  btnEnd = makeBtn("End", 20, 60, () => {
    scene = (plantedCount >= 12 || revealedCount >= 12) ? 'endingB' : 'endingA';
    toggleButtons();
  });
  btnRestart = makeBtn("Restart", 90, 60, () => {
    scene = 'garden';
    flowers = [];
    plantedCount = 0;
    revealedCount = 0;
    lastHoverText = "";
    for (let i = 0; i < 8; i++) flowers.push(new Flower(random(width), random(height*0.25, height*0.9)));
    toggleButtons();
  });
  toggleButtons();
}

function makeBtn(label, x, y, handler) {
  let b = createButton(label);
  b.position(x, y);
  b.mousePressed(handler);
  b.style('padding','6px 12px');
  b.style('border','none');
  b.style('border-radius','12px');
  b.style('background','#222');
  b.style('color','#eee');
  b.style('cursor','pointer');
  b.style('box-shadow','0 2px 8px rgba(0,0,0,0.25)');
  return b;
}

function draw() {
  // background gradient + slow noise drift
  let t = frameCount * 0.002;
  for (let y = 0; y < height; y += 2) {
    let n = noise(y * 0.003, t);
    let base = map(n, 0, 1, 8, 28);
    stroke(base + 10, base + 12, base + 14);
    line(0, y, width, y);
  }
  noStroke();

  // twinkling dust
  for (let i = 0; i < 120; i++) {
    let x = (i*79 + frameCount*0.15) % width;
    let y = noise(i*0.07, frameCount*0.01) * height;
    fill(230, 230, 230, 120);
    rect(x, y, 1, 1);
  }

  if (scene === 'garden') {
    let speed = growthSlider.value();

    // grow and draw flowers
    for (let f of flowers) {
      f.update(speed);
      f.draw();
    }

    // hover reveal
    let hovered = getHoveredFlower();
    if (hovered) {
      if (millis() - lastHoverTime > 400) {
        lastHoverText = getFragment();
        lastHoverTime = millis();
        revealedCount++;
      }
      drawFragmentBubble(lastHoverText, mouseX, mouseY);
    }

    drawHUD();
  } else {
    drawEnding();
  }
}

function drawHUD() {
  fill(190);
  textSize(14);
  text("Growth speed", 250, 24);

  let themeLabel = {
    mixed: "Mixed",
    sight: "Sight [1]",
    sound: "Sound [2]",
    smell: "Smell [3]"
  }[currentTheme];

  fill(220);
  textSize(16);
  text("Theme: " + themeLabel, 20, 100);

  fill(180);
  textSize(14);
  text("Click to plant • Hover to read • 1/2/3 switch theme • End when ready", 20, height - 30);

  fill(200);
  text(`Planted: ${plantedCount}  Revealed: ${revealedCount}`, width - 220, 24);
}

function drawEnding() {
  // dim garden
  fill(0, 180);
  rect(0, 0, width, height);

  fill(240);
  textAlign(CENTER, CENTER);
  textSize(26);
  let title = scene === 'endingB' ? "The garden keeps what you planted." : "Some seeds prefer the next rain.";
  text(title, width/2, height/2 - 40);

  textSize(18);
  let body = scene === 'endingB'
    ? "With enough blooms, the city breathes through leaves.\nYou leave a small light behind for anyone passing."
    : "You carry a pocket of soil and a list of names.\nTomorrow, the stems will remember you.";

  text(body, width/2, height/2 + 10);

  fill(180);
  textSize(14);
  text("Press R or click Restart to plant again", width/2, height/2 + 80);
}

function getHoveredFlower() {
  for (let i = flowers.length - 1; i >= 0; i--) {
    if (flowers[i].isHover(mouseX, mouseY)) return flowers[i];
  }
  return null;
}

function mousePressed() {
  if (scene !== 'garden') return;
  flowers.push(new Flower(mouseX, mouseY));
  plantedCount++;
}

function keyPressed() {
  if (scene === 'garden') {
    if (key === '1') currentTheme = 'sight';
    if (key === '2') currentTheme = 'sound';
    if (key === '3') currentTheme = 'smell';
    if (key === 'm' || key === 'M') currentTheme = 'mixed';
    if (key === 'e' || key === 'E') btnEnd.elt.click();
  } else {
    if (key === 'r' || key === 'R') btnRestart.elt.click();
  }
}

function toggleButtons() {
  if (scene === 'garden') {
    btnEnd.show(); btnRestart.hide();
  } else {
    btnEnd.hide(); btnRestart.show();
  }
}

function getFragment() {
  if (currentTheme === 'mixed') {
    let pool = [].concat(fragments.sight, fragments.sound, fragments.smell);
    return random(pool);
  }
  return random(fragments[currentTheme]);
}

function drawFragmentBubble(txt, x, y) {
  let pad = 10;
  textSize(16);
  let w = textWidth(txt) + pad*2;
  let h = 28;
  let bx = constrain(x + 14, 10, width - w - 10);
  let by = constrain(y - 20, 10, height - h - 10);
  fill(30, 30, 30, 230);
  rect(bx, by, w, h, 10);
  fill(235);
  textAlign(LEFT, CENTER);
  text(txt, bx + pad, by + h/2);
}

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.seed = random(10000);
    this.r = random(6, 10);       // base radius
    this.petals = floor(random(5, 9));
    this.hue = random([180, 210, 260, 300]); // cool palette
    this.scale = 0.2;
  }
  update(speed) {
    // subtle bobbing with noise; scale grows to 1.0
    this.scale = min(1.0, this.scale + 0.002 * speed);
    this.y += map(noise(this.seed + frameCount*0.01), 0, 1, -0.05, 0.05) * speed;
  }
  isHover(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.r * 10 * this.scale;
  }
  draw() {
    push();
    translate(this.x, this.y);

    // stem
    stroke(60, 120, 70);
    strokeWeight(2);
    line(0, 0, 0, 30 * this.scale);
    noStroke();

    // petals (parametric by slider via scale)
    let R = this.r * 6 * this.scale;
    for (let i = 0; i < this.petals; i++) {
      let ang = (TAU / this.petals) * i + noise(this.seed + i)*0.2;
      let px = cos(ang) * R;
      let py = sin(ang) * R;
      fill(this.hue, 120, 200, 160);
      push();
      translate(px, py);
      rotate(ang);
      ellipse(0, 0, this.r * 2.2 * this.scale, this.r * 6 * this.scale);
      pop();
    }

    // center
    fill(250, 230, 120, 220);
    ellipse(0, 0, this.r * 5 * this.scale, this.r * 5 * this.scale);
    pop();
  }
}

function windowResized(){ resizeCanvas(windowWidth, windowHeight); }
