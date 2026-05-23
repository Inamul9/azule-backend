/**
 * Soil Village - Cinematic 3D Elements Preloader & Landing Page Intro Manager
 * Powered by Three.js & GSAP
 */

class CinematicPreloader {
  constructor() {
    this.preloader = document.getElementById('preloader');
    this.canvas = document.getElementById('preloader-canvas');
    if (!this.preloader || !this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mountain = null;
    this.core = null;
    this.particles = null;
    this.angles = [];
    this.radii = [];
    this.heightOffsets = [];
    
    this.progress = 0;
    this.targetProgress = 0;
    this.isWindowLoaded = false;

    this.init3D();
    this.startLoadingSimulation();
    this.bindWindowLoad();

    // Absolute fallback: force clear preloader after 8s to guarantee it never gets permanently stuck
    setTimeout(() => {
      if (this.preloader && this.preloader.style.display !== 'none') {
        console.warn("Preloader fallback triggered: forcing dismissal.");
        this.progress = 100;
        this.triggerCinematicEntrance();
      }
    }, 8000);
  }

  // 1. Initialize the beautiful 3D wireframe mountain mesh
  init3D() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    this.camera.position.z = 5.5;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true
      });
      this.renderer.setSize(240, 240);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      console.warn("WebGL preloader context failed. Falling back to CSS.", e);
      this.renderer = null;
      return; // Skip remaining 3D setup
    }

    // A. 3D Low-poly cone mountain peak
    const mountainGeom = new THREE.ConeGeometry(1.6, 2.4, 4, 3);
    const mountainMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,       // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.mountain = new THREE.Mesh(mountainGeom, mountainMat);
    this.mountain.position.y = -0.3;
    this.scene.add(this.mountain);

    // B. Intense glowing golden peak star core
    const coreGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,       // Magenta Core
      transparent: true,
      opacity: 0.9
    });
    this.core = new THREE.Mesh(coreGeom, coreMat);
    this.core.position.set(0, 0.9, 0); // place exactly at the cone peak apex
    this.mountain.add(this.core);

    // B2. Outer geometric wireframe cage
    const cageGeom = new THREE.IcosahedronGeometry(1.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.cage = new THREE.Mesh(cageGeom, cageMat);
    this.cage.position.y = 0.5;
    this.scene.add(this.cage);

    // C. Orbital Ring of golden stardust halo
    const particleGeom = new THREE.BufferGeometry();
    const count = 150; // Increased particles
    const posArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.9 + Math.random() * 0.3;
      const hOffset = (Math.random() - 0.5) * 0.6;

      this.angles.push(angle);
      this.radii.push(r);
      this.heightOffsets.push(hOffset);

      posArray[i * 3] = Math.cos(angle) * r;
      posArray[i * 3 + 1] = hOffset;
      posArray[i * 3 + 2] = Math.sin(angle) * r;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Spark circular texture
    const pMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    this.particles = new THREE.Points(particleGeom, pMaterial);
    this.particles.position.y = -0.3;
    this.scene.add(this.particles);

    // Start 3D animation loop
    this.animate();
  }

  // 2. Render and animate 3D preloader components
  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());

    if (this.mountain && this.particles) {
      // Rotate mountain peak slowly
      this.mountain.rotation.y += 0.007;
      this.mountain.rotation.x = Math.sin(Date.now() * 0.001) * 0.06;

      // Rotate cage
      if (this.cage) {
        this.cage.rotation.y -= 0.005;
        this.cage.rotation.z += 0.002;
      }

      // Orbit particles around the peak in a glowing spiral
      const positions = this.particles.geometry.attributes.position.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        // Orbit speed depends on radius
        this.angles[i] += 0.015 * (1.8 / this.radii[i]);
        
        positions[i * 3] = Math.cos(this.angles[i]) * this.radii[i];
        positions[i * 3 + 1] = this.heightOffsets[i] + Math.sin(this.angles[i] * 2) * 0.12;
        positions[i * 3 + 2] = Math.sin(this.angles[i]) * this.radii[i];
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y -= 0.004;

      // Pulsate the intense apex core star
      const scaleVal = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      this.core.scale.setScalar(scaleVal);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // 3. Increment progress tracker beautifully
  startLoadingSimulation() {
    // Reveal text block titles with slight delay stagger
    setTimeout(() => {
      const title = this.preloader.querySelector('.preloader-title');
      const subtitle = this.preloader.querySelector('.preloader-subtitle');
      const quote = this.preloader.querySelector('.preloader-quote');
      const progressContainer = this.preloader.querySelector('.preloader-progress-container');

      if (title) gsap.to(title, { opacity: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
      if (subtitle) gsap.to(subtitle, { opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.5)', delay: 0.15 });
      if (quote) gsap.to(quote, { opacity: 1, scale: 1, rotation: 0, duration: 1.0, ease: 'back.out(2)', delay: 0.3 });
      if (progressContainer) gsap.to(progressContainer, { opacity: 1, y: 0, duration: 0.6, delay: 0.45 });
    }, 200);

    const updateInterval = setInterval(() => {
      // Accelerate progress if window has already finished loaded
      const step = this.isWindowLoaded ? Math.random() * 12 + 6 : Math.random() * 2 + 1;
      
      this.targetProgress = Math.min(this.targetProgress + step, 100);
      
      // Interpolate progress display smoothly
      this.animateProgressBar();

      if (this.progress >= 100) {
        clearInterval(updateInterval);
        setTimeout(() => this.triggerCinematicEntrance(), 400);
      }
    }, 55);
  }

  // Smooth progress transitions
  animateProgressBar() {
    const diff = this.targetProgress - this.progress;
    if (diff > 0.1) {
      this.progress += diff * 0.25; // dampening multiplier
    } else if (this.targetProgress === 100) {
      this.progress = 100;
    }
    
    const roundedVal = Math.min(Math.floor(this.progress), 100);
    
    // Update DOM nodes
    const percentEl = document.getElementById('preloader-percent');
    const barEl = document.getElementById('preloader-progress-bar');
    
    if (percentEl) percentEl.textContent = roundedVal.toString().padStart(2, '0');
    if (barEl) barEl.style.width = roundedVal + '%';

    // 3D wireframe mesh scales up dynamically with loaded fraction
    if (this.mountain) {
      const meshScale = 0.65 + (roundedVal / 100) * 0.35;
      this.mountain.scale.setScalar(meshScale);
    }
  }

  // 4. Capture actual browser window resource load completion
  bindWindowLoad() {
    window.addEventListener('load', () => {
      this.isWindowLoaded = true;
      // Guarantee mock finishes quickly
      this.targetProgress = 100;
    });

    // Fail-safe check: force load if taking longer than 6 seconds
    setTimeout(() => {
      this.isWindowLoaded = true;
      this.targetProgress = 100;
    }, 6000);
  }

  // 5. Dismiss preloader and launch stunning cinematic entrance sequence
  triggerCinematicEntrance() {
    console.log("🎬 Preloader complete. Triggering cinematic entrance.");

    try {
      // Fast spin & expand preloader 3D mesh
      gsap.to(this.mountain.rotation, { y: "+=12", duration: 1.5, ease: 'power4.inOut' });
      gsap.to(this.mountain.scale, { x: 3, y: 3, z: 3, duration: 1.5, ease: 'power4.inOut' });
      if(this.cage) {
        gsap.to(this.cage.scale, { x: 3, y: 3, z: 3, duration: 1.5, ease: 'power4.inOut' });
        gsap.to(this.cage.material, { opacity: 0, duration: 1, ease: 'power2.inOut' });
      }
      gsap.to([this.mountain.material, this.particles.material], { opacity: 0, duration: 1, ease: 'power2.inOut' });

      // Fade out preloader content elements
      gsap.to(['.preloader-title', '.preloader-subtitle', '.preloader-quote', '.preloader-progress-container'], {
        opacity: 0,
        y: -20,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.in'
      });

      // Dismiss Preloader Overlay with Diagonal Clip Path Sweep (luxury styling)
      gsap.to(this.preloader, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 1.3,
        ease: 'power4.inOut',
        delay: 0.45,
        onComplete: () => {
          this.preloader.style.display = 'none';
          
          // Refresh ScrollTrigger so bounds are perfectly recalculated
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }
      });

    } catch (e) {
      console.error("Error in preloader transition:", e);
      // Fallback: immediately hide the preloader so the user isn't stuck
      this.preloader.style.display = 'none';
    } finally {
      // TRIGGER STAGGERED INTRO SEQUENCES ON MAIN SITE ALWAYS
      this.runHeroIntroTimeline(0.1);
    }
  }

  runHeroIntroTimeline(delayTime) {
    const tl = gsap.timeline({ delay: delayTime });

    // A. Zoom the Solang landscape
    tl.fromTo('.hero-bg-zoom', 
      { scale: 1.22, filter: 'brightness(0.3) blur(4px)' }, 
      { scale: 1, filter: 'brightness(1) blur(0px)', duration: 2.2, ease: 'power3.out' }
    );

    // B. Fade in floating mountains fogs
    tl.fromTo(['.hero-fog-1', '.hero-fog-2'],
      { opacity: 0, y: 70 },
      { opacity: (i) => i === 0 ? 0.35 : 0.22, y: 0, duration: 1.8, ease: 'power2.out' },
      "-=1.8"
    );

    // C. Bounce the mountain circle badge logo
    tl.fromTo('.hero-logo-img',
      { scale: 0.5, opacity: 0, rotation: -35 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.3, ease: 'back.out(1.5)' },
      "-=1.4"
    );

    // D. Slide up Soil Village main visual header
    tl.fromTo('.hero-title-main',
      { y: 55, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out' },
      "-=0.9"
    );

    // E. Stagger explore details, taglines, sub-headers and call-to-action buttons
    tl.fromTo(['.hero-subtitle', '.hero-badge-tag', '.hero-info-p', '.hero-ctas'],
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: 'power3.out' },
      "-=0.7"
    );
  }
}

// Instantiate preloader immediately
document.addEventListener('DOMContentLoaded', () => {
  new CinematicPreloader();
});
