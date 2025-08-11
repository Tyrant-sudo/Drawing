let Moon = function(position){
    this.position = position.copy(); // 确保位置是独立的副本
    this.moonsize = 100;
    this.moonlife = 0;
};

Moon.prototype.run = function(){
    this.display();
    // this.update(); // 如果需要更新位置或大小，取消注释此行
};

Moon.prototype.display = function(){
    fill(255, 255, 100); // 设置月亮颜色为浅黄
    stroke(0); // 设置边框颜色为黑
    beginShape();
    // 确保使用相对于 this.position 的坐标
    vertex(this.position.x, this.position.y - this.moonsize / 2); // 顶部点
    bezierVertex(this.position.x + this.moonsize / 4, this.position.y - this.moonsize / 2, 
                 this.position.x + this.moonsize / 4, this.position.y + this.moonsize / 2, 
                 this.position.x, this.position.y + this.moonsize / 2); // 右边弯曲
    bezierVertex(this.position.x - this.moonsize / 4, this.position.y + this.moonsize / 2,
                 this.position.x - this.moonsize / 4, this.position.y - this.moonsize / 2,
                 this.position.x, this.position.y - this.moonsize / 2); // 左边弯曲
    endShape(CLOSE); // 闭合形状
};


// Moon.prototype.update();