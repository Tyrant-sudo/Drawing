// 烟花数组
let fireworks = [];
let gravity;
let lastSmallFireworkTime = 0;
let lastLargeFireworkTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  gravity = createVector(0, 0.1); // 减小重力影响，使下落更慢
  stroke(255);
  strokeWeight(4);
  background(0);
}

function draw() {
  background(0, 25); // 轻微的背景残留，帮助视觉效果
  
  // 每秒随机生成一个小烟花
  if (millis() - lastSmallFireworkTime > 1000) {
    let smallFirework = new Firework(random(width), random(height/2)); // 在上半部分随机位置生成
    smallFirework.explode();
    fireworks.push(smallFirework);
    lastSmallFireworkTime = millis();
  }
  
  // 每秒在鼠标位置生成一个大烟花
  if (millis() - lastLargeFireworkTime > 1000 && (mouseX !== 0 || mouseY !== 0)) {
    let largeFirework = new Firework(mouseX, mouseY, true); // true表示是大烟花
    largeFirework.explode();
    fireworks.push(largeFirework);
    lastLargeFireworkTime = millis();
  }
  
  // 更新和显示所有烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    
    // 如果烟花已经爆炸并且火花都消失了，则移除它
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function touchStarted() {
  // 在触摸位置直接创建已爆炸的烟花
  let fw = new Firework(touchX, touchY);
  fw.explode(); // 立即爆炸
  fireworks.push(fw);
  return false; // 防止浏览器默认行为
}

function mousePressed() {
  // 在鼠标点击位置直接创建已爆炸的烟花
  let fw = new Firework(mouseX, mouseY);
  fw.explode(); // 立即爆炸
  fireworks.push(fw);
  return false; // 防止浏览器默认行为
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}