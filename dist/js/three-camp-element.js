/**
 * Three.js Interactive 3D Glamping & Camp Elements Showcase
 * Rendered dynamically in WebGL with ambient lights, orbit controls, and GSAP animations.
 */

class Interactive3DShowcase {
  constructor() {
    this.container = document.getElementById('three-showcase-container');
    this.canvas = document.getElementById('three-showcase-canvas');
    if (!this.container || !this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.activeElement = 'tent'; // 'tent', 'compass', 'campfire'
    this.currentGroup = null; // Container for the active model
    this.lights = {};
    this.animationFrameId = null;

    // Interactive mouse coordinates
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    // Particle variables for campfire
    this.campfireParticles = null;
    this.campfireParticleCount = 45;
    this.campfirePositions = [];
    this.campfireVelocities = [];

    this.init();
  }

  init() {
    // 1. Scene & Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 450;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 5, 12);

    // 3. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
    } catch (e) {
      console.warn("WebGL camp element context failed.", e);
      this.renderer = null;
      return;
    }
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; // Don't go below ground
    this.controls.minDistance = 6;
    this.controls.maxDistance = 20;
    this.controls.enablePan = false;

    // 5. Lights setup
    this.setupLights();

    // 6. Build base floor plane
    this.createFloor();

    // 7. Load Initial Element
    this.loadElement('tent');

    // 8. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Select tabs
    const tabs = document.querySelectorAll('.showcase-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-element-type');
        this.switchElement(type);
      });
    });

    // 9. Start loop
    this.animate();
  }

  setupLights() {
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Soft Directional Light for casting shadows
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.85);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);
    this.lights.dirLight = dirLight;

    // Interior Golden glow light (mainly for tent / campfire)
    const pointLight = new THREE.PointLight(0xffa500, 2, 10);
    pointLight.position.set(0, 1.2, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
    this.lights.pointLight = pointLight;
  }

  createFloor() {
    // Elegant wooden circle deck base for all 3D components
    const deckGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.3, 32);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x111612,
      roughness: 0.8,
      metalness: 0.2,
      bumpScale: 0.05
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = -0.15;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Fine gold rim accent on deck
    const rimGeo = new THREE.CylinderGeometry(4.45, 4.45, 0.08, 32, 1, true);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xc5a880,
      transparent: true,
      opacity: 0.45
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -0.15;
    this.scene.add(rim);
  }

  loadElement(type) {
    if (this.currentGroup) {
      this.scene.remove(this.currentGroup);
      this.currentGroup = null;
    }

    this.activeElement = type;
    this.currentGroup = new THREE.Group();
    this.scene.add(this.currentGroup);

    // Reset Lights
    this.lights.pointLight.intensity = 0;
    this.lights.dirLight.intensity = 0.85;

    // Clear campfire specific structures
    if (this.campfireParticles) {
      this.scene.remove(this.campfireParticles);
      this.campfireParticles = null;
    }

    if (type === 'tent') {
      this.buildTent();
    } else if (type === 'compass') {
      this.buildCompass();
    } else if (type === 'campfire') {
      this.buildCampfire();
    } else if (type === 'heart') {
      this.buildHeart();
    }

    // Spawn Scale Intro Animation
    this.currentGroup.scale.set(0.01, 0.01, 0.01);
    gsap.to(this.currentGroup.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.8,
      ease: 'back.out(1.5)'
    });
  }

  switchElement(type) {
    if (type === this.activeElement) return;

    // Update active tab styling in DOM
    const tabs = document.querySelectorAll('.showcase-tab');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-element-type') === type) {
        tab.classList.add('bg-gold/10', 'border-gold/50', 'text-gold');
        tab.classList.remove('bg-forest-deep/30', 'border-gold/10', 'text-cream/50');
      } else {
        tab.classList.remove('bg-gold/10', 'border-gold/50', 'text-gold');
        tab.classList.add('bg-forest-deep/30', 'border-gold/10', 'text-cream/50');
      }
    });

    // Update HUD display labels
    const hudLabel = document.getElementById('showcase-hud-label');
    const hudStatus = document.getElementById('showcase-hud-status');
    const descP = document.getElementById('showcase-element-desc');

    const eq = window.equipmentSettings || {};

    if (type === 'tent') {
      if (hudLabel) hudLabel.textContent = "GEODESIC RETREAT DOME";
      if (hudStatus) hudStatus.textContent = "THERMAL GRID LOCKED";
      if (descP) descP.textContent = (eq.tent && eq.tent.desc) ? eq.tent.desc : "Inspect our luxurious custom double-insulated Geodesic Dome. Featuring architectural reinforcement frame grids, transparent panoramic bay windows overlooking high pines, and central hearth climate integration.";
    } else if (type === 'compass') {
      if (hudLabel) hudLabel.textContent = "MOUNTAIN NAVIGATION CORE";
      if (hudStatus) hudStatus.textContent = "TRUE NORTH CALIBRATED";
      if (descP) descP.textContent = (eq.compass && eq.compass.desc) ? eq.compass.desc : "A premium high-fidelity solar brass compass system. Seamless fluid rotation and gold dial calibration, aligning perfectly to point true north relative to your mouse hover movements.";
    } else if (type === 'campfire') {
      if (hudLabel) hudLabel.textContent = "WILDERNESS FIRE HEARTH";
      if (hudStatus) hudStatus.textContent = "COMBUSTION OPTIMAL";
      if (descP) descP.textContent = (eq.campfire && eq.campfire.desc) ? eq.campfire.desc : "A high-fidelity campfire particle hearth. Features cross-stacked pine logs inside a natural rock barrier circle, venting real-time flickering lights and warm ember sparkles floating upwards.";
    } else if (type === 'heart') {
      if (hudLabel) hudLabel.textContent = "ROMANTIC STARLIGHT HEART";
      if (hudStatus) hudStatus.textContent = "EMISSION INTENSE";
      if (descP) descP.textContent = (eq.heart && eq.heart.desc) ? eq.heart.desc : "A beautiful rose-gold extruded starlight heart. Designed for our exclusive Honeymoon package, surrounded by an elegant golden wireframe structural cage, orbiting custom diamonds, and cozy rising pink starry sparkles.";
    }

    // Transition animation on scene camera position slightly
    const targetCam = type === 'compass' 
      ? { x: 0, y: 7, z: 9 } 
      : { x: 0, y: 5, z: 12 };
      
    gsap.to(this.camera.position, {
      x: targetCam.x,
      y: targetCam.y,
      z: targetCam.z,
      duration: 1.0,
      ease: 'power3.inOut'
    });

    gsap.to(this.canvas, {
      opacity: 0.1,
      duration: 0.25,
      onComplete: () => {
        this.loadElement(type);
        gsap.to(this.canvas, { opacity: 1, duration: 0.4 });
      }
    });
  }

  /* ==============================================================
     MODEL 1: LUXURY GEODESIC DOME TENT
     ============================================================== */
  buildTent() {
    const tentGroup = this.currentGroup;

    // Inside warm light glow
    this.lights.pointLight.position.set(0, 1.8, 0);
    this.lights.pointLight.intensity = 2.5;

    // 1. Geodesic Dome Cloth Shell (low-poly icosahedron)
    const shellGeo = new THREE.IcosahedronGeometry(2.8, 1);
    
    // Modify vertices slightly to give a realistic flattened tent shape
    const pos = shellGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      // Flatten bottom half to represent flat ground dome
      if (y < 0) {
        pos.setY(i, 0);
      } else {
        // Curve inward slightly at the top
        pos.setY(i, y * 0.9);
      }
    }
    shellGeo.computeVertexNormals();

    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x0c2514, // Velvet deep emerald forest tent color
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.castShadow = true;
    shell.receiveShadow = true;
    tentGroup.add(shell);

    // 2. High-end gold wireframe structural cage
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xc5a880, // Gold structural grid lines
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const cage = new THREE.Mesh(shellGeo.clone(), wireframeMat);
    cage.scale.set(1.01, 1.01, 1.01);
    tentGroup.add(cage);

    // 3. Panoramic front bay window (shiny metallic glass segment)
    const winGeo = new THREE.SphereGeometry(2.85, 8, 8, Math.PI * 0.7, Math.PI * 0.6, 0.4, 0.9);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xffeab3,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const windowMesh = new THREE.Mesh(winGeo, winMat);
    windowMesh.rotation.x = Math.PI / 2.5;
    windowMesh.rotation.y = -Math.PI / 1.5;
    windowMesh.position.set(0, 0.2, 0);
    tentGroup.add(windowMesh);

    // 4. Domed door entry tunnel
    const entryGeo = new THREE.BoxGeometry(1.2, 1.4, 1.5);
    const entryMat = new THREE.MeshStandardMaterial({
      color: 0x111612,
      roughness: 0.8,
      flatShading: true
    });
    const entry = new THREE.Mesh(entryGeo, entryMat);
    entry.position.set(0, 0.6, 2.2);
    entry.rotation.y = 0;
    entry.castShadow = true;
    tentGroup.add(entry);

    // Triangular door opening
    const doorGeo = new THREE.ConeGeometry(0.5, 1.1, 3);
    const doorMat = new THREE.MeshBasicMaterial({
      color: 0xffd180, // Glowing interior warm gold
      transparent: true,
      opacity: 0.95
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.55, 2.96);
    door.rotation.y = Math.PI;
    tentGroup.add(door);

    // 5. Add two small pine tree details flanking the dome
    this.createMiniTree(tentGroup, -3.2, 0, -1.8, 1.5);
    this.createMiniTree(tentGroup, 3.4, 0, -1.2, 1.2);
  }

  /* Helper to draw mini stylized polygonal pine tree */
  createMiniTree(group, x, y, z, scale) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    treeGroup.scale.set(scale, scale, scale);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.6, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leaves layers (cones stacked)
    const leafGeo1 = new THREE.ConeGeometry(0.7, 1.2, 5);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x0b2011, flatShading: true, roughness: 0.9 });
    
    const cone1 = new THREE.Mesh(leafGeo1, leafMat);
    cone1.position.y = 1.0;
    cone1.castShadow = true;
    treeGroup.add(cone1);

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 5), leafMat);
    cone2.position.y = 1.6;
    cone2.castShadow = true;
    treeGroup.add(cone2);

    group.add(treeGroup);
  }

  /* ==============================================================
     MODEL 2: MOUNTAIN NAV COMPASS SYSTEM
     ============================================================== */
  buildCompass() {
    const compassGroup = this.currentGroup;

    // Ambient gold metallic setup
    this.lights.pointLight.intensity = 0.5;
    this.lights.pointLight.color.setHex(0xc5a880);
    this.lights.pointLight.position.set(0, 3, 0);

    // 1. Brass casing cylinder base
    const casingGeo = new THREE.CylinderGeometry(3.0, 3.1, 0.5, 32);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x7a5b30, // Bronze/gold metallic casing
      roughness: 0.18,
      metalness: 0.9,
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.position.y = 0.25;
    casing.castShadow = true;
    compassGroup.add(casing);

    // Inside bevel face
    const dialGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.1, 32);
    const dialMat = new THREE.MeshStandardMaterial({
      color: 0x050806, // Deep velvet obsidian face
      roughness: 0.2
    });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.y = 0.5;
    compassGroup.add(dial);

    // 2. Glowing Golden Dial ticks and rims
    const rimGeo = new THREE.RingGeometry(2.5, 2.65, 32);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xc5a880,
      side: THREE.DoubleSide
    });
    const dialRim = new THREE.Mesh(rimGeo, rimMat);
    dialRim.rotation.x = Math.PI / 2;
    dialRim.position.y = 0.56;
    compassGroup.add(dialRim);

    // Cardinal Points floating nodes
    const coords = [
      { name: 'N', pos: new THREE.Vector3(0, 0.58, -2.1), color: 0xffd700 },
      { name: 'S', pos: new THREE.Vector3(0, 0.58, 2.1), color: 0xc5a880 },
      { name: 'E', pos: new THREE.Vector3(2.1, 0.58, 0), color: 0xc5a880 },
      { name: 'W', pos: new THREE.Vector3(-2.1, 0.58, 0), color: 0xc5a880 }
    ];

    const nodeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    coords.forEach(coord => {
      const nodeMat = new THREE.MeshBasicMaterial({ color: coord.color });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.copy(coord.pos);
      compassGroup.add(node);
    });

    // 3. Double Sided Glowing Needle Pin
    this.compassNeedle = new THREE.Group();
    this.compassNeedle.position.set(0, 0.65, 0);
    compassGroup.add(this.compassNeedle);

    // North Needle pointer (Golden/orange cone pointing North)
    const needleNGeo = new THREE.ConeGeometry(0.3, 2.0, 4);
    needleNGeo.rotateX(Math.PI / 2);
    needleNGeo.translate(0, 0, -1.0); // Offset origin to bottom pivot center
    const needleNMat = new THREE.MeshStandardMaterial({
      color: 0xff5b7f, // Neon vibrant coral
      emissive: 0xff3b30,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const needleN = new THREE.Mesh(needleNGeo, needleNMat);
    this.compassNeedle.add(needleN);

    // South Needle pointer (Ice-cyan cone pointing South)
    const needleSGeo = new THREE.ConeGeometry(0.3, 2.0, 4);
    needleSGeo.rotateX(-Math.PI / 2);
    needleSGeo.translate(0, 0, 1.0); // Offset pivot
    const needleSMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff, // Neon turquoise
      emissive: 0x00a3ff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const needleS = new THREE.Mesh(needleSGeo, needleSMat);
    this.compassNeedle.add(needleS);

    // Center brass screw cap
    const capGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xc5a880, metalness: 0.9, roughness: 0.1 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.1;
    this.compassNeedle.add(cap);
  }

  /* ==============================================================
     MODEL 3: WILDERNESS CAMPFIRE HEARTH
     ============================================================== */
  buildCampfire() {
    const fireGroup = this.currentGroup;

    // Warm Flickering point light configuration
    this.lights.pointLight.position.set(0, 1.1, 0);
    this.lights.pointLight.intensity = 3.8;
    this.lights.pointLight.color.setHex(0xff7700);

    // 1. Natural rocks safety boundary ring
    const rockGeo = new THREE.DodecahedronGeometry(0.4, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x222824, // Coal/grey stone color
      roughness: 0.9,
      flatShading: true
    });

    const stoneCount = 10;
    const stoneRadius = 2.4;
    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2;
      const stone = new THREE.Mesh(rockGeo, rockMat);
      const randSize = Math.random() * 0.3 + 0.85;
      
      stone.position.set(
        Math.sin(angle) * stoneRadius + (Math.random() - 0.5) * 0.2,
        0.18,
        Math.cos(angle) * stoneRadius + (Math.random() - 0.5) * 0.2
      );
      
      stone.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      stone.scale.set(randSize, randSize, randSize);
      stone.castShadow = true;
      stone.receiveShadow = true;
      fireGroup.add(stone);
    }

    // 2. Cross-stacked Firewood Logs (cone pattern)
    const logGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 5);
    logGeo.rotateX(Math.PI / 2); // align cylinders horizontally
    const logMat = new THREE.MeshStandardMaterial({
      color: 0x4a2305, // Rich brown wood bark
      roughness: 0.95,
      flatShading: true
    });

    const logCount = 6;
    for (let i = 0; i < logCount; i++) {
      const angle = (i / logCount) * Math.PI * 2;
      const log = new THREE.Mesh(logGeo, logMat);
      
      // Pivot log tips together into center pyramid campfire hearth style
      log.position.set(Math.sin(angle) * 0.9, 0.45, Math.cos(angle) * 0.9);
      log.rotation.y = -angle;
      log.rotation.x = 0.55; // Lean log inwards toward center
      
      log.castShadow = true;
      fireGroup.add(log);
    }

    // 3. Dynamic Ember particle system rising from hearth center
    this.campfireGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(this.campfireParticleCount * 3);
    
    this.campfirePositions = [];
    this.campfireVelocities = [];

    for (let i = 0; i < this.campfireParticleCount; i++) {
      // Spawn at logs pivot intersection coordinates
      const x = (Math.random() - 0.5) * 0.6;
      const y = Math.random() * 0.5 + 0.4;
      const z = (Math.random() - 0.5) * 0.6;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      this.campfireVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: Math.random() * 0.025 + 0.02, // vertical lift speed
        z: (Math.random() - 0.5) * 0.015
      });
    }

    this.campfireGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Glow orange ember sparkles material
    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0xff6600,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.createFireParticleTexture()
    });

    this.campfireParticles = new THREE.Points(this.campfireGeometry, particleMat);
    this.scene.add(this.campfireParticles);
  }

  // Draw fire spark texture
  createFireParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 230, 200, 1)'); // Intense core
    gradient.addColorStop(0.3, 'rgba(255, 90, 0, 0.85)'); // Hot fire orange
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /* ==============================================================
     MODEL 4: LUXURY ROMANTIC STARLIGHT HEART
     ============================================================== */
  buildHeart() {
    const heartGroup = this.currentGroup;

    // Soft warm pink romantic point light
    this.lights.pointLight.position.set(0, 1.8, 0);
    this.lights.pointLight.intensity = 3.0;
    this.lights.pointLight.color.setHex(0xff3366); // Warm pink romantic light

    // 1. Draw a 3D Heart using THREE.Shape
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    
    // Smooth heart shape drawing
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    // Extrude the 2D shape into 3D
    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    
    // Recenter geometry coordinates
    heartGeo.center();
    // Rotate to orient upright
    heartGeo.rotateZ(Math.PI);
    heartGeo.rotateY(Math.PI);

    // Beautiful glowing rose-gold metallic shell
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      roughness: 0.1,
      metalness: 0.8,
      flatShading: true
    });
    
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.y = 1.6;
    heartMesh.castShadow = true;
    heartMesh.receiveShadow = true;
    heartGroup.add(heartMesh);

    // 2. Wireframe outer heart frame (gives a luxurious 3D grid cage look)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffd700, // Golden cage
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const cage = new THREE.Mesh(heartGeo.clone(), wireframeMat);
    cage.scale.set(1.08, 1.08, 1.08);
    cage.position.y = 1.6;
    heartGroup.add(cage);

    // 3. Floating starlight pink particle embers rising around the heart
    this.campfireGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(this.campfireParticleCount * 3);
    
    this.campfirePositions = [];
    this.campfireVelocities = [];

    for (let i = 0; i < this.campfireParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;
      const x = Math.cos(angle) * radius;
      const y = Math.random() * 1.5 + 0.5;
      const z = Math.sin(angle) * radius;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      this.campfireVelocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: Math.random() * 0.015 + 0.01, // soft lift
        z: (Math.random() - 0.5) * 0.01
      });
    }

    this.campfireGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0xff3366,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.createFireParticleTexture()
    });

    this.campfireParticles = new THREE.Points(this.campfireGeometry, particleMat);
    this.scene.add(this.campfireParticles);

    // 4. Create floating gold diamonds
    this.createMiniGem(heartGroup, -2.2, 1.6, 0.5, 1.0);
    this.createMiniGem(heartGroup, 2.2, 1.4, -0.5, 0.85);
  }

  createMiniGem(group, x, y, z, scale) {
    const gemGeo = new THREE.OctahedronGeometry(0.3);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(x, y, z);
    gem.scale.set(scale, scale, scale);
    gem.castShadow = true;
    group.add(gem);
  }

  onMouseMove(event) {
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 450;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.renderer) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.controls.update();

    // Lerp Mouse coordinate positions
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 1. Core Model Smooth Hover Reactions
    if (this.currentGroup) {
      if (this.activeElement === 'tent') {
        // Slow peaceful ambient rotation
        this.currentGroup.rotation.y += 0.003;
      } else if (this.activeElement === 'compass' && this.compassNeedle) {
        // Compass needle hovers and aligns dynamically to mouse position angle
        const targetAngle = Math.atan2(this.mouseX, this.mouseY);
        this.compassNeedle.rotation.y += (targetAngle - this.compassNeedle.rotation.y) * 0.08;
        
        // Dynamic float hover effect
        this.compassNeedle.position.y = 0.65 + Math.sin(Date.now() * 0.003) * 0.04;
      } else if (this.activeElement === 'campfire') {
        // Flickering Light intensity simulation
        const time = Date.now() * 0.008;
        this.lights.pointLight.intensity = 3.6 + Math.sin(time) * 0.4 + Math.cos(time * 1.5) * 0.2;
        
        // Ambient logs group slow rot
        this.currentGroup.rotation.y += 0.001;
      } else if (this.activeElement === 'heart') {
        // Heart floats up and down and rotates gracefully
        this.currentGroup.rotation.y += 0.006;
        const time = Date.now() * 0.003;
        this.lights.pointLight.intensity = 2.8 + Math.sin(time) * 0.3;
        
        const heartMesh = this.currentGroup.children[0];
        if (heartMesh) {
          heartMesh.position.y = 1.6 + Math.sin(Date.now() * 0.002) * 0.12;
        }

        const gem1 = this.currentGroup.children[2];
        const gem2 = this.currentGroup.children[3];
        if (gem1) {
          gem1.rotation.y += 0.015;
          gem1.position.y = 1.6 + Math.sin(Date.now() * 0.003 + 1) * 0.1;
        }
        if (gem2) {
          gem2.rotation.x += 0.015;
          gem2.position.y = 1.4 + Math.sin(Date.now() * 0.003 + 2) * 0.08;
        }
      }
    }

    // 2. Active Campfire Particle Engine Loop
    if ((this.activeElement === 'campfire' || this.activeElement === 'heart') && this.campfireParticles) {
      const positions = this.campfireParticles.geometry.attributes.position.array;

      for (let i = 0; i < this.campfireParticleCount; i++) {
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];

        const velocity = this.campfireVelocities[i];

        x += velocity.x + Math.sin(Date.now() * 0.004 + i) * 0.008; // slight wind swing
        y += velocity.y;
        z += velocity.z + Math.cos(Date.now() * 0.004 + i) * 0.008;

        // Reset particle on ceiling lift boundary
        if (y > (this.activeElement === 'heart' ? 3.5 : 4.5)) {
          if (this.activeElement === 'heart') {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5;
            x = Math.cos(angle) * radius;
            y = Math.random() * 0.5 + 0.5;
            z = Math.sin(angle) * radius;
          } else {
            x = (Math.random() - 0.5) * 0.6;
            y = Math.random() * 0.5 + 0.4;
            z = (Math.random() - 0.5) * 0.6;
          }
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }

      this.campfireParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate 3D Element Showcase once scripts loaded
const init3DShowcase = () => {
  if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
    window.Soil3DShowcaseInstance = new Interactive3DShowcase();
  } else {
    setTimeout(init3DShowcase, 100);
  }
};

init3DShowcase();

