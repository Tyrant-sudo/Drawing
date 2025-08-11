let systems = [];
let displayText = "Click mouse to add a moon."; // 初始文本
let textUpdated = false; // 用于跟踪是否已更新文本

let moon;
let haveMoon    = false;

let bgGraphics;   // 背景图形缓冲区
let textGraphics; // 文本图形缓冲区


function setup() {
  createCanvas(2560, 1600);

  // 初始化背景图形缓冲区
  bgGraphics = createGraphics(width, height);
  bgGraphics.noStroke();
  drawComplexBackground(bgGraphics); // 假设有一个函数来绘制复杂的背景

  // 初始化文本图形缓冲区
  textGraphics = createGraphics(width, height);
  textGraphics.textSize(32);
  textGraphics.fill(255);
  textGraphics.textAlign(CENTER, CENTER);
  textGraphics.text(displayText, width / 2, height / 2);
}

function draw() {
  // 首先绘制背景
  image(bgGraphics, 0, 0);
  image(textGraphics, 0, 0);

  if (haveMoon){
    moon.run();
  }

  if (systems.length > 0) {
    for (let i = 0; i < systems.length; i++) {
      systems[i].run();
      systems[i].addParticle();
    }
  }
  // 然后绘制文本

}

function mousePressed() {
  if (!textUpdated) {
    textGraphics.clear(); // 清除图形缓冲区中的文本
    displayText = "Click mouse to add a star.";
    
    moon = new Moon(createVector(mouseX, mouseY));  // 正确创建Moon实例

    textGraphics.fill(255); // 设置文本颜色
    textGraphics.text(displayText, width / 2, height / 20); // 更新文本并绘制在图形缓冲区

    textUpdated = true; // 设置状态为已更新
    haveMoon    = true;
  }else{
  let p = new ParticleSystem(createVector(mouseX, mouseY));
  systems.push(p);
  };
}

function drawComplexBackground(p){
  p.background(195, 184, 152);

  let minSpacing = 5; // 最小间隔
  let maxSpacing = 10; // 最大间隔
  let minDotSize = 1;  // 最小方点尺寸
  let maxDotSize = 5; // 最大方点尺寸

  let x = 0;
  while (x < width) {
    let spacing = random(minSpacing, maxSpacing); // 对每列，随机选择间隔
    let dotSize1 = random(minDotSize, maxDotSize); // 对每列，随机选择宽度

    let y = 0;
    while (y < height) {
      let dotSize2 = random(minDotSize, maxDotSize); // 对每行，随机选择高度
      p.fill(166, 159, 131,25.5); // 设置方点颜色和透明度
      p.rect(x, y, dotSize1, dotSize2); // 绘制方点
      y += spacing;
    }
    x += spacing;
  }
}
