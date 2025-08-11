// 心形中心位置
let heartCenterX = 0;
let heartCenterY = 0;

// 粒子类
class Particle {
  constructor(x, y, targetX, targetY) {
    this.pos = createVector(x, y);
    this.target = createVector(targetX, targetY);
    // 计算朝向目标的初始速度
    this.vel = p5.Vector.sub(this.target, this.pos);
    this.vel.normalize();
    this.vel.mult(random(1, 3)); // 随机速度
    this.life = 1500; // 粒子生命周期
    this.deathRate = 255 / 60; // 1秒内消失(60帧)
    // 随机粒子大小 (2 to 8 pixels)
    this.size = random(2, 8);
    // 随机初始透明度 (100 to 255)
    this.initialAlpha = random(100, 255);
    // 初始颜色为紫色
    this.color = color(128, 0, 128); // 紫色
  }

  // 更新粒子位置和生命周期
  update() {
    // 计算粒子到目标的距离
    let distance = this.pos.dist(this.target);
    
    // 增强心形边缘的吸引力
    // 距离越远，吸引力越强，但不超过最大限制
    let attractionStrength = map(distance, 0, 300, 0.2, 0.3);
    attractionStrength = constrain(attractionStrength, 0.2, 0.3);
    
    // 逐渐调整方向朝向目标
    let desired = p5.Vector.sub(this.target, this.pos);
    desired.normalize();
    desired.mult(attractionStrength); // 使用变化的吸引力强度
    
    this.vel.add(desired);
    this.vel.limit(2); // 稍微提高速度限制以适应增强的吸引力
    this.pos.add(this.vel);
    this.life -= this.deathRate;
    
    // 根据距离改变颜色，接近目标时变为红色
    let redValue = map(distance, 0, 300, 255, 128); // 从紫色(128)到红色(255)
    let greenValue = map(distance, 0, 300, 0, 0);
    let blueValue = map(distance, 0, 300, 0, 128); // 从紫色(128)到红色(0)
    this.color = color(redValue, greenValue, blueValue);
  }

  // 显示粒子
  show() {
    noStroke();
    // 根据当前生命周期计算透明度
    let alpha = map(this.life, 0, 255, 0, this.initialAlpha);
    fill(red(this.color), green(this.color), blue(this.color), alpha);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  // 检查粒子是否已消失
  isDead() {
    return this.life <= 0;
  }
}

// 粒子数组
let particles = [];
// 椭圆参数
let ellipseA = 350; // 长轴半径
let ellipseB = 60;  // 短轴半径
let ellipseRotation = 0;
let particlesPerFrame = 2;
// 椭圆漂移参数
let driftOffset = 0;
let driftAmplitude = 30; // 漂移幅度
let driftSpeed = 0.02;    // 漂移速度

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化心形中心位置为屏幕中心
  heartCenterX = width / 2;
  heartCenterY = height / 2;
}

function draw() {
  background(0);
  
  // 更新漂移偏移量
  driftOffset += driftSpeed;
  
  // 绘制旋转的椭圆
  drawRotatingEllipse();
  
  // 更新并显示所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    
    // 移除已经消失的粒子
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // 每帧添加新粒子
  createParticlesFromEllipse();
}

// 鼠标点击事件：设置心形中心位置
function mouseClicked() {
  heartCenterX = mouseX;
  heartCenterY = mouseY;
}

// 绘制旋转的椭圆
function drawRotatingEllipse() {
  push();
  // 使用sin函数计算横向漂移
  let driftX = width/2 + sin(driftOffset) * driftAmplitude;
  translate(driftX, height - 100); // 椭圆位置在底部中央，但会横向漂移
  rotate(ellipseRotation);
  
  // 绘制椭圆（不填充，仅描边）
  // stroke(255, 100);
  // noFill();
  // ellipse(0, 0, ellipseA * 2, ellipseB * 2);
  
  ellipseRotation += 0.02; // 旋转速度
  pop();
}

// 从旋转椭圆创建粒子
function createParticlesFromEllipse() {
  // 计算当前椭圆中心的漂移位置
  let driftX = width/2 + sin(driftOffset) * driftAmplitude;
  
  // 原有粒子生成逻辑
  for (let i = 0; i < particlesPerFrame; i++) {
    // 在椭圆轨道上随机位置生成粒子
    let angle = random(TWO_PI);
    let x = driftX + cos(angle + ellipseRotation) * ellipseA;
    let y = (height - 100) + sin(angle + ellipseRotation) * ellipseB;
    
    // 70% 的粒子生成在心形轮廓上，30% 在心形内部
    let targetX, targetY;
    if (random() < 0.7) {
      // 在心形轮廓上生成目标点
      const theta = random(TWO_PI);
      const heartX = 16 * pow(sin(theta), 3);
      const heartY = -(13 * cos(theta) - 5 * cos(2*theta) - 2 * cos(3*theta) - cos(4*theta));
      // 缩小并上移心形 (scale从10减到6，y坐标上移50像素)
      const scale = 6;
      targetX = heartCenterX + heartX * scale;
      targetY = heartCenterY - 100 + heartY * scale;
    } else {
      // 在心形内部生成目标点
      // 使用拒绝采样方法确保心形内部均匀分布
      let attempts = 0;
      const maxAttempts = 100;
      
      do {
        // 在心形包围盒内随机选择点
        const u = random(-1, 1);
        const v = random(-1, 1);
        
        // 心形方程（隐式形式）: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        // 将参数方程转换为隐式形式进行判断
        const scaledX = u * 20;
        const scaledY = v * 20;
        
        // 检查点是否在心形内部
        const eq = pow(scaledX*scaledX + scaledY*scaledY - 1, 3) - scaledX*scaledX * scaledY*scaledY*scaledY;
        
        if (eq <= 0) {
          // 点在心形内部
          // 缩小并上移心形 (scale从10减到6，y坐标上移50像素)
          targetX = heartCenterX + scaledX * 6;
          targetY = heartCenterY - 50 + scaledY * 6;
          break;
        }
        
        attempts++;
      } while (attempts < maxAttempts);
      
      // 如果超过最大尝试次数，使用参数方程作为备选
      if (attempts >= maxAttempts) {
        const theta = random(TWO_PI);
        const r = random(0, 1) * 15;
        const heartX = 16 * pow(sin(theta), 3);
        const heartY = -(13 * cos(theta) - 5 * cos(2*theta) - 2 * cos(3*theta) - cos(4*theta));
        // 缩小并上移心形 (scale从10减到6，y坐标上移50像素)
        targetX = heartCenterX + heartX * r * 0.6;
        targetY = heartCenterY - 50 + heartY * r * 0.6;
      }
    }
    
    particles.push(new Particle(x, y, targetX, targetY));
  }
  
  // 额外生成短寿命粒子（仅在椭圆上）
  for (let i = 0; i < particlesPerFrame * 3; i++) {
    // 在椭圆轨道上随机位置生成粒子
    let angle = random(TWO_PI);
    let x = driftX + cos(angle + ellipseRotation) * ellipseA;
    let y = (height - 100) + sin(angle + ellipseRotation) * ellipseB;
    
    // 创建短寿命粒子，目标点设为椭圆中心附近
    let targetX = driftX + random(-20, 20);
    let targetY = (height - 500) + random(-20, 20);
    
    // 创建粒子并手动设置较短的生命周期
    let shortLifeParticle = new Particle(x, y, targetX, targetY);
    shortLifeParticle.life = 500; // 设置较短的生命周期
    shortLifeParticle.deathRate = 100 / 30; // 0.5秒内消失(30帧)
    particles.push(shortLifeParticle);
  }
}

// 窗口大小改变时调整画布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 更新心形中心位置为屏幕中心
  heartCenterX = width / 2;
  heartCenterY = height / 2;
}