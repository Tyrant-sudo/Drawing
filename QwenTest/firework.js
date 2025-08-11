class Firework {
  constructor(x, y, isLarge = false) {
    // 点击位置
    this.pos = createVector(x, y);
    
    // 是否已经爆炸（直接创建已爆炸的烟花）
    this.exploded = true;
    
    // 火花粒子数组
    this.particles = [];
    
    // 是否是大烟花
    this.isLarge = isLarge;
    
    // 爆炸次数计数器
    this.explosionCount = 0;
    
    // 第二次爆炸的延迟时间
    this.secondExplosionDelay = 500; // 毫秒
    this.firstExplosionTime = 0;
  }
  
  // 应用力（重力）
  applyForce(force) {
    // 火花粒子会应用重力，但烟花本身不需要
  }
  
  // 更新烟花状态
  update() {
    // 检查是否需要进行第二次爆炸
    if (this.explosionCount === 1 && millis() - this.firstExplosionTime > this.secondExplosionDelay) {
      this.explode(true); // 第二次爆炸
    }
    
    // 更新所有火花粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      
      // 如果粒子生命周期结束，则移除
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  // 爆炸产生火花（不超过2种颜色）
  explode(isSecondExplosion = false) {
    // 根据是否是大烟花来决定粒子数量
    const colorGroups = 2; // 统一为2种颜色组
    const particlesPerColor = this.isLarge ? 50 : 25; // 大烟花每组更多粒子
    
    // 两次爆炸使用相同的力度
    const velocityMultiplier = 1; // 保持力度一致
    const sizeMultiplier = 1; // 保持大小一致
    
    // 生成多组不同颜色的火花粒子
    for (let j = 0; j < colorGroups; j++) { // 颜色组数
      // 第二次爆炸使用不同的颜色
      let colorHue = isSecondExplosion ? (random(255) + 128) % 255 : random(255); // 随机色相
      for (let i = 0; i < particlesPerColor; i++) { // 每种颜色的粒子数
        // 创建粒子时传递额外参数
        const p = new Particle(
          this.pos.x, 
          this.pos.y, 
          colorHue, 
          this.isLarge, 
          velocityMultiplier,
          sizeMultiplier
        );
        this.particles.push(p);
      }
    }
    
    // 更新爆炸计数器和时间
    this.explosionCount++;
    if (this.explosionCount === 1) {
      this.firstExplosionTime = millis();
    }
  }
  
  // 显示烟花
  show() {
    // 显示所有火花粒子
    for (let particle of this.particles) {
      particle.show();
    }
  }
  
  // 判断烟花是否已完成（爆炸且所有火花都消失了）
  done() {
    return this.exploded && this.particles.length === 0;
  }
}