// 粒子类
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // 随机速度方向，向外扩散
    const angle = random(TWO_PI);
    const speed = random(1, 5);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.life = 255; // 粒子生命周期
    this.deathRate = 255 / 60; // 1秒内消失(60帧)
  }

  // 更新粒子位置和生命周期
  update() {
    this.pos.add(this.vel);
    this.life -= this.deathRate;
  }

  // 显示粒子
  show() {
    noStroke();
    fill(255, 0, 0, this.life);
    ellipse(this.pos.x, this.pos.y, 5);
  }

  // 检查粒子是否已消失
  isDead() {
    return this.life <= 0;
  }
}

// 粒子数组
let particles = [];
// 记录开始时间
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 记录开始时间
  startTime = millis();
}

function draw() {
  background(0);
  
  // 更新并显示所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    
    // 移除已经消失的粒子
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // 每帧添加新粒子，粒子密度随时间增加
  createHeartParticles();
}

// 创建红心形状的粒子，密度随时间增加
function createHeartParticles() {
  // 计算经过的时间（秒）
  const elapsed = (millis() - startTime) / 1000;
  // 根据时间计算粒子数量，随着时间增加而增加
  // 初始每帧1个粒子，每0.1秒增加1个粒子，上限1000个
  const particleCount = 1 + Math.floor(elapsed / 0.1);
  if (particles.length >= 3000) return; // 限制最大粒子数

  for (let i = 0; i < particleCount; i++) {
    // 使用参数方程生成心形
    const t = random(TWO_PI);
    const x = 16 * pow(sin(t), 3);
    const y = -(13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t));
    
    // 缩放和平移到画布中心
    const scale = 10;
    const posX = width/2 + x * scale;
    const posY = height/2 + y * scale;
    
    particles.push(new Particle(posX, posY));
  }
}

// 窗口大小改变时调整画布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}