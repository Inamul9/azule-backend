/**
 * Three.js Interactive Campfire Sparks & Floating Fireflies Background
 * Premium 3D particle simulation for Soil Village Landing Page
 */

class CampfireParticles {
  constructor() {
    this.canvas = document.getElementById('three-bg-canvas');
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 500;
    
    // Position/velocity arrays
    this.particleGeometry = null;
    this.positions = [];
    this.velocities = [];
    this.sizes = [];
    this.phases = [];
    this.colors = []; // for wave drift oscillation

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.init();
  }

  init() {
    // 1. Create Scene & Camera
    this.scene = new THREE.Scene();
    
    // Perspective camera with wide view
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 25;

    // 2. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,      // Transparent background so EJS CSS shows through
        antialias: true
      });
    } catch (e) {
      console.warn("WebGL background context failed.", e);
      this.renderer = null;
      return;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Create Particles Geometry
    this.particleGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(this.particleCount * 3);
    const sizeArray = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      // Spawn particles near bottom center (simulating campfire origin) or scattered
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 30 - 5; // offset downwards
      const z = (Math.random() - 0.5) * 20;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      // Velocities: upward drift with random horizontal swings
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: Math.random() * 0.05 + 0.03, // upward movement
        z: (Math.random() - 0.5) * 0.04
      });

      // Randomized speeds/frequencies for sine-wave oscillation
      this.phases.push(Math.random() * Math.PI * 2);

      // Spark Sizes
      sizeArray[i] = Math.random() * 0.35 + 0.15;

      // Assign vibrant random colors
      const colorChoices = [
        new THREE.Color(0xc5a880), // Gold
        new THREE.Color(0x00f3ff), // Cyan
        new THREE.Color(0xff3366), // Magenta
        new THREE.Color(0x10b981)  // Emerald
      ];
      const selectedColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      this.colors.push(selectedColor.r, selectedColor.g, selectedColor.b);
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
    
    // 4. Custom Spark Material (Golden Sunset Glint)
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.28,             // Sized up slightly for beautiful visible round glows
      vertexColors: true,
      color: 0xffffff,       // Warm Soil Village Gold
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.createSparkTexture() // Pass texture directly here to trigger correct shader compilation
    });

    // 5. Create Points & Add to Scene
    this.particles = new THREE.Points(this.particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // 6. Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // 7. Start Animation Render Loop
    this.animate();
  }

  // Draw a smooth radial glowing circular sprite to act as spark texture
  createSparkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 220, 160, 1)'); // Intense core
    gradient.addColorStop(0.3, 'rgba(230, 95, 43, 0.8)'); // Warm gold-orange glow
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');          // Alpha fadeout

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  onMouseMove(event) {
    // Standardize mouse coordinates between -1 and 1
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());

    // Interpolate mouse movement for smooth delay tracking
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];

      const velocity = this.velocities[i];
      this.phases[i] += 0.01;

      // 1. Move upwards
      y += velocity.y;

      // 2. Oscillate side-to-side simulating smoke currents
      x += velocity.x + Math.sin(this.phases[i]) * 0.015;
      z += velocity.z + Math.cos(this.phases[i]) * 0.015;

      // 3. React mildly to cursor interaction
      // Horizontal pull of cursor attraction
      const diffX = (this.mouseX * 15) - x;
      const diffY = (this.mouseY * 10) - y;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);

      if (distance < 8) {
        // Subtle drift away from mouse position
        x -= (diffX / distance) * 0.03;
      }

      // 4. Recycle particles that drift out of bounds
      if (y > 18) {
        y = -15; // reset bottom
        x = (Math.random() - 0.5) * 35;
        z = (Math.random() - 0.5) * 20;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    // Flag update so GPU recalculates positions
    this.particles.geometry.attributes.position.needsUpdate = true;

    // Rotate overall particle cloud slightly for ambient 3D depth
    this.particles.rotation.y += 0.0006;

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate particle cloud once Three.js library has loaded successfully
const initThreeBackground = () => {
  if (typeof THREE !== 'undefined') {
    new CampfireParticles();
  } else {
    // Retry if Three.js has not finished script loading
    setTimeout(initThreeBackground, 100);
  }
};

initThreeBackground();
