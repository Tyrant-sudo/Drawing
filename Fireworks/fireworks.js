// Fireworks Animation - p5.js version
// Based on the description in readme.md

let particleSystems = [];
let firstClickFrame = -1; // Record the frame of first mouse click
let savedData = []; // Store data for analysis
let ws; // WebSocket connection
let imageCounter = 0; // Counter for saved images

function setup() {
  createCanvas(3200, 1600);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Connect to WebSocket server
  ws = new WebSocket('ws://localhost:8081');
  
  ws.onopen = function() {
    console.log('Connected to WebSocket server');
  };
  
  ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'saved') {
      console.log(`Server saved image: ${data.filename}`);
    }
  };
  
  ws.onerror = function(error) {
    console.log('WebSocket error:', error);
  };
  
  ws.onclose = function() {
    console.log('WebSocket connection closed');
  };
}

function draw() {
  // Dark background to simulate night sky
  background(240, 10, 10);
  
  // Update and display all particle systems
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    particleSystems[i].run();
    if (particleSystems[i].isDead()) {
      particleSystems.splice(i, 1);
    }
  }
  
  // Save every 3rd frame for the first 3000 frames after first click
  if (firstClickFrame > 0 && frameCount - firstClickFrame < 3000) {
    // Save every 3rd frame
    if ((frameCount - firstClickFrame) % 3 === 0) {
      // Send frame to server for saving
      saveFrameToServer();
    }
  }
}

function saveFrameToServer() {
  // Convert canvas to base64 image data
  const imageData = canvas.toDataURL('image/png');
  
  // Create filename
  const filename = `fireworks_${String(imageCounter).padStart(4, '0')}.png`;
  imageCounter++;
  
  // Send to server via WebSocket
  if (ws.readyState === WebSocket.OPEN) {
    try {
      const message = {
        type: 'saveImage',
        image: imageData,
        filename: filename
      };
      const messageStr = JSON.stringify(message);
      console.log('Sending message:', messageStr.substring(0, 100) + '...');
      ws.send(messageStr);
    } catch (e) {
      console.error('Error sending message:', e);
    }
  } else {
    console.log('WebSocket not open, state:', ws.readyState);
  }
}

function mousePressed() {
  // Record first click frame
  if (firstClickFrame === -1) {
    firstClickFrame = frameCount;
  }
  
  // Create the initial firework trail when mouse is clicked
  particleSystems.push(new ParticleSystem(mouseX, mouseY));
}

// Particle class for individual particles
class Particle {
  constructor(x, y, c, s, vx, vy, lifespan) {
    this.position = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(vx || random(-1, 1), vy || random(-1, 1));
    this.lifespan = lifespan || 100;
    this.col = c;
    this.size = s || random(2, 6);
    this.mass = 1;
    // Store previous positions for trail effect
    this.previousPositions = [];
    this.maxTrailLength = 40; // Increase trail length for longer trails
    // For white dot flashing effect
    this.whiteDotTimer = 0;
    this.showWhiteDot = false;
  }
  
  run() {
    this.update();
    this.display();
  }
  
  update() {
    // Add current position to trail history
    this.previousPositions.push(this.position.copy());
    
    // Limit trail length
    if (this.previousPositions.length > this.maxTrailLength) {
      this.previousPositions.shift();
    }
    
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    // Apply frictional resistance, 速度越大受到2次方速度的空气阻力,方向相反
    this.acceleration.add(p5.Vector.mult(this.velocity, -0.0001 * this.velocity.magSq()));
    // this.velocity.limit(5); // 限制最大速度
    this.applyForce(this.acceleration);
    // Apply gravity
    this.applyForce(createVector(0, 0.01));
    
    this.lifespan -= 1.0;
    
    // Update white dot timer
    if (this.showWhiteDot) {
      this.whiteDotTimer++;
      if (this.whiteDotTimer > 180) { // 3 seconds at 60 FPS
        this.showWhiteDot = false;
        this.whiteDotTimer = 0;
      }
    }
    
    // Chance to show white dot when particle is white-gold and fading
    if (!this.showWhiteDot && 
        this.col.levels[0] == 60 && // White-gold color
        this.lifespan < 30 && // Particle is fading
        this.previousPositions.length < 5 && // Low trail density
        random() < 0.005) { // Low probability
      this.showWhiteDot = true;
      this.whiteDotTimer = 0;
    }
  }
  
  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }
  
  display() {
    noStroke();
    
    // Draw white dot flashing effect
    if (this.showWhiteDot) {
      fill(0, 0, 100, 100); // Bright white
      ellipse(this.position.x, this.position.y, this.size * 2, this.size * 2);
    }
    
    // Draw trail if there are previous positions
    if (this.previousPositions.length > 1) {
      // Draw trail segments from head to tail (newest to oldest)
      for (let i = 0; i < this.previousPositions.length - 1; i++) {
        let pos1 = this.previousPositions[i];
        let pos2 = this.previousPositions[i + 1];
        
        // Calculate trail properties based on position (head = newest position, tail = oldest position)
        let trailPosition = i / (this.previousPositions.length - 2); // 0 at head, 1 at tail
        
        // For the very end of the trail, make it appear as dotted points
        if (trailPosition > 0.7 || trailPosition < 0.3) {
          // Only draw 40% of the segments at the tail end to create dotted effect
          if (random() > 0.4) continue;
        }
        
        let trailAlpha = this.lifespan * (0.1 + trailPosition * 0.9); // Head is more opaque, tail is more transparent
        let trailWidth = this.size * (0.1 + trailPosition * 0.9); // Head is thicker, tail is thinner
        
        // Draw trail segment
        // Ensure trail color matches particle color
        stroke(hue(this.col), saturation(this.col), brightness(this.col), trailAlpha);
        strokeWeight(trailWidth);
        strokeCap(ROUND); // Create rounded ends for water droplet effect
        line(pos1.x, pos1.y, pos2.x, pos2.y);
      }
    }
    
    // Draw main particle (the head of the water droplet)
    noStroke();
    fill(this.col, this.lifespan);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }
  
  isDead() {
    return (this.lifespan < 0);
  }
}

// ParticleSystem class to manage groups of particles
class ParticleSystem {
  constructor(x, y) {
    this.origin = createVector(x, height);
    this.particles = [];
    this.state = 0; // 0: rising, 1: exploding, 2: fading
    this.timer = 0;
    this.maxTimer = 300; // About 3 seconds for rising
    this.trailColor = color(280, 80, 90); // Purple-gold
    this.explosionColor = color(60, 20, 100); // Bright white-gold
  }
  
  run() {
    switch(this.state) {
      case 0: // Rising firework
        this.rise();
        break;
      case 1: // Explosion
        this.explode();
        break;
      case 2: // Fading particles
        this.fade();
        break;
    }
    
    // Update and display particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].run();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  rise() {
    // Create trail particles
    if (frameCount % 1 == 0) {
      // Gradually sparse golden trail particles
      let trailLifespan = map(this.timer, 0, this.maxTimer, 100, 50);

      // 改为紫金色
      let trailParticleColor = color(280, 70, 70, trailLifespan);
      this.particles.push(new Particle(
        this.origin.x + random(-3, 3), 
        this.origin.y, 
        trailParticleColor
      ));
    }
    
    // Move origin up in a snake-like pattern
    this.origin.y -= 3;
    this.origin.x += sin(this.timer * 0.3) * 1.5;
    
    this.timer++;
    
    // Transition to explosion state
    if (this.timer >= this.maxTimer) {
      this.state = 1;
      this.timer = 0;
      this.maxTimer = 1300; // About 10 seconds for explosion
    }
  }
  
  explode() {
    // Small purple explosion at the beginning
    if (this.timer == 0) {
      // Create a small purple explosion with fewer particles
      for (let i = 0; i < 200; i++) {
        let angle = random(TWO_PI);
        let speed = random(0.5, 2);
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        // Purple color for initial explosion
        let purple = color(280, 80, 90);
        this.particles.push(new Particle(
          this.origin.x,
          this.origin.y,
          purple,
          random(1, 3),
          vx,
          vy,
          random(100, 300)
        ));
      }
    }
    
    // Main explosion - bright white-gold particles in all directions
    if (this.timer == 200) { // Start main explosion after 200 frames (2 seconds)
      for (let i = 0; i < 1000; i++) {
        // Random angle and speed for explosion particles
        let angle = random(TWO_PI);
        let speed = random(2, 5);
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        this.particles.push(new Particle(
          this.origin.x,
          this.origin.y,
          this.explosionColor,
          random(1, 4), // Vary size for visual interest
          vx,
          vy,
          random(1000, 4000) // Random lifespan for explosion particles
        )); 
      }
    }
    
    // Create explosion particles，随机2-6帧一次小爆炸
    else if (this.timer % 40 == 0 && this.timer < 600 && this.timer > 160) {
      for (let i = 0; i < 200; i++) {
        // Random angle and speed for explosion particles
        let angle = random(TWO_PI);
        let speed = random(2, 5);
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        this.particles.push(new Particle(
          this.origin.x,
          this.origin.y,
          this.explosionColor,
          random(1, 4), // Vary size for visual interest
          vx,
          vy,
          random(1000, 4000) // Random lifespan for explosion particles
        ));
      }
    }
    
    // After 2 seconds (150 frames, accounting for the 30 frame delay), add red-gold micro particles
    if (this.timer % 10 == 0 && this.timer > 350 && this.timer < 500) {
      let positionOffsetx = random(-300, 300);
      let positionOffsety = random(-300, 100);
      let new_x = this.origin.x + positionOffsetx; // Slightly offset origin for visual effect
      let new_y = this.origin.y + positionOffsety; // Slightly offset origin for visual effect
      for (let i = 0; i < 100; i++) {
        let angle = random(TWO_PI);
        let speed = random(0.5, 2);
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        
        // Red-gold color
        let redGold = color(20, 90, 95);
        this.particles.push(new Particle(
          new_x,
          new_y,
          redGold,
          random(1, 2),
          vx * 0.5,
          vy * 0.5,
          random(300, 500) // Random lifespan for red-gold particles
        ));
      }
    }
    
    // Color transitions during explosion phase
    if (this.timer > 450) {
      // Gradually change colors of existing particles
      let fadeProgress = map(this.timer, 150, this.maxTimer, 0, 1);
      
      // Apply color changes to particles
      for (let p of this.particles) {
        // Skip recently added red-gold particles
        if (p.size > 2) continue;
        
        // Change white-gold to gold
        if (p.col.levels[0] == 60) { // Check if it's white-gold (hue=60)
          // Gradually change to gold (hue=60, saturation=100, brightness=90)
          let newSat = lerp(20, 100, fadeProgress);
          let newBri = lerp(100, 90, fadeProgress);
          p.col = color(60, newSat, newBri);
        }
        // Change red-gold to red
        else if (p.col.levels[0] == 20) { // Check if it's red-gold (hue=20)
          // Gradually change to red (hue=0, saturation=100, brightness=90)
          let newHue = lerp(20, 0, fadeProgress);
          let newSat = lerp(90, 100, fadeProgress);
          let newBri = lerp(95, 90, fadeProgress);
          p.col = color(newHue, newSat, newBri);
        }
      }
    }
    
    this.timer++;
    
    // Transition to fading state
    if (this.timer >= this.maxTimer) {
      this.state = 2;
      this.timer = 0;
      this.maxTimer = 180; // About 3 seconds for fading
    }
  }
  
  fade() {
    // Apply gravity to all particles and fade them out
    this.timer++;
    
    // After most particles have faded, create glowing white-gold dots at particle heads
    if (this.timer > 120) { // Last 1 second
      for (let p of this.particles) {
        // Check if particle is near end of life and hasn't been converted yet
        if (p.lifespan < 50 && p.lifespan > 0 && !p.isConverted) {
          // 30% chance to create a glowing dot
          if (random(1) < 0.3) {
            // Mark particle as converted to prevent multiple conversions
            p.isConverted = true;
            // Change to white-gold color
            p.col = color(60, 20, 100); // White-gold
            p.lifespan = 300; // 5 seconds at 60 FPS
            p.glowTimer = 0; // Initialize glow timer
            p.maxGlowTimer = 300; // 5 seconds
          }
        }
        
        // Handle glowing dots
        if (p.isConverted) {
          p.glowTimer++;
          // Gradually decrease brightness
          let brightness = map(p.glowTimer, 0, p.maxGlowTimer, 100, 0);
          p.col = color(60, 20, brightness);
          
          // Add some flickering effect
          if (random(1) < 0.1) {
            let flicker = random(-10, 10);
            p.col = color(60, 20, max(0, min(100, brightness + flicker)));
          }
        }
      }
    }
    
    // Gradually reduce particle size and brightness
    for (let p of this.particles) {
      // Only reduce size for non-converted particles
      if (!p.isConverted) {
        p.size = max(0.1, p.size - 0.01);
      }
      p.lifespan = max(0, p.lifespan - 0.1);
    }
  }
  
  isDead() {
    return (this.state == 2 && this.particles.length == 0);
  }
}