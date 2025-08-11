class Particle {
  constructor(x, y, colorHue, isLarge = false, velocityMultiplier = 1, sizeMultiplier = 1) {
    this.pos = createVector(x, y);
    // 记录初始Y位置
    this.initialY = y;
    // 创建从中心向外的随机速度向量
    this.vel = p5.Vector.random2D();
    // 大烟花有更强的爆炸力度，两次爆炸力度相等
    this.vel.mult((isLarge ? random(2, 8) : random(1, 4)) * velocityMultiplier);
    this.acc = createVector(0, 0);
    // 使用传入的色相值创建颜色
    this.color = color(colorHue, 255, 255);
    this.lifespan = 200; // 初始不透明度
    this.maxLifespan = 300; // 记录最大生命周期
    this.startTime = millis(); // 记录创建时间
    // 是否属于大烟花的粒子
    this.isLarge = isLarge;
    // 初始大小，两次爆炸粒子大小相等
    this.initialSize = (isLarge ? 8 : 4) * sizeMultiplier;
    this.currentSize = this.initialSize;
  }
  
  // 应用力
  applyForce(force) {
    this.acc.add(force);
  }
  
  // 更新粒子状态
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // 重置加速度
    
    // 基于时间的淡出效果（5秒后完全消失）
    let elapsed = millis() - this.startTime;
    this.lifespan = this.maxLifespan * (1 - elapsed / 5000);
    
    // 粒子大小随着下落逐渐缩小
    // 根据粒子下落的距离计算缩小比例
    let fallDistance = this.pos.y - this.initialY;
    // 限制fallDistance最小值为0，避免粒子向上飞时变大
    fallDistance = max(0, fallDistance);
    // 粒子下落时逐渐缩小，最小缩小到原来的一半
    let sizeReduction = map(fallDistance, 0, height/2, 1, 0.5);
    this.currentSize = this.initialSize * sizeReduction;
    
    // 确保lifespan不低于0
    if (this.lifespan < 0) {
      this.lifespan = 0;
    }
  }
  
  // 显示粒子
  show() {
    // 使用lifespan作为透明度值
    let displayColor = color(
      hue(this.color),
      saturation(this.color),
      brightness(this.color),
      this.lifespan
    );
    
    stroke(displayColor);
    // 大烟花的粒子更粗
    strokeWeight(this.isLarge ? 4 : 2);
    fill(displayColor);
    // 使用当前大小绘制粒子
    ellipse(this.pos.x, this.pos.y, this.currentSize);
  }
  
  // 判断粒子是否生命周期结束
  done() {
    return this.lifespan <= 0;
  }
}