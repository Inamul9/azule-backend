/**
 * Three.js Interactive 3D Terrain Route Map
 * Powered by WebGL, OrbitControls, and custom shader glow curves
 */

class Interactive3DMap {
  constructor() {
    this.container = document.getElementById('three-route-container');
    this.canvas = document.getElementById('three-route-canvas');
    if (!this.container || !this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.terrainMesh = null;

    // Core routes configurations with vibrant modern colors
    this.activeRouteName = 'solang'; // 'solang' or 'spiti'
    this.routes = {
      solang: {
        color: 0xff5b7f, // Glowing coral pink (matching Screenshot 2)
        nodes: [
          { name: 'DELHI', pos: new THREE.Vector3(-18, -2, 8), desc: 'Outpost 01  Elev: 216m' },
          { name: 'MANALI (SOYAL)', pos: new THREE.Vector3(5, 2, -2), desc: 'Outpost 02  Elev: 2,050m' },
          { name: 'SOLANG VALLEY', pos: new THREE.Vector3(12, 6, -8), desc: 'Outpost 03  Elev: 2,480m' }
        ]
      },
      spiti: {
        color: 0x00f3ff, // Brilliant Glacial Neon Cyan
        nodes: [
          { name: 'DELHI', pos: new THREE.Vector3(-18, -2, 8), desc: 'Starting Base' },
          { name: 'SHIMLA', pos: new THREE.Vector3(-10, -0.5, 4), desc: 'Day 1: Capital Gateway' },
          { name: 'SARAHAN', pos: new THREE.Vector3(-4, 0.5, 2), desc: 'Day 2: Himalayan Passages' },
          { name: 'KALPA', pos: new THREE.Vector3(1, 1.5, 0), desc: 'Day 3: Kinner Kailash Views' },
          { name: 'TABO', pos: new THREE.Vector3(6, 3, -3), desc: 'Day 4: Ancient Monasteries' },
          { name: 'KAZA (SPITI)', pos: new THREE.Vector3(13, 5, -8), desc: 'Day 5-6: Starry Deserts' },
          { name: 'KIBBER', pos: new THREE.Vector3(15, 6.5, -11), desc: 'Day 6: Highest Village Bridge' },
          { name: 'MANALI', pos: new THREE.Vector3(5, 2, -2), desc: 'Day 7-8: River Valley Loop' },
          { name: 'DELHI RETURN', pos: new THREE.Vector3(-16, -1.8, 7.5), desc: 'Day 9: Beautiful Memories' }
        ]
      },
      family: {
        color: 0xffa500, // Golden Orange
        nodes: [
          { name: 'DELHI', pos: new THREE.Vector3(-18, -2, 8), desc: 'Family Start' },
          { name: 'MANALI HOTEL', pos: new THREE.Vector3(5, 2, -2), desc: 'Comfort Base' },
          { name: 'SOLANG VALLEY', pos: new THREE.Vector3(12, 6, -8), desc: 'Snow Fun' },
          { name: 'ROHTANG PASS', pos: new THREE.Vector3(15, 8, -12), desc: 'High Views' },
          { name: 'DELHI RETURN', pos: new THREE.Vector3(-16, -1.8, 7.5), desc: 'Sweet Memories' }
        ]
      },
      honeymoon: {
        color: 0xff3366, // Romantic Pink
        nodes: [
          { name: 'DELHI PICKUP', pos: new THREE.Vector3(-18, -2, 8), desc: 'Private Premium SUV' },
          { name: 'SECLUDED DOME', pos: new THREE.Vector3(5, 3, -4), desc: 'Love Haven Stay' },
          { name: 'CANDLELIGHT PEAK', pos: new THREE.Vector3(12, 6, -8), desc: 'Romantic Dinner' }
        ]
      }
    };

    this.activeNodes = [];
    this.activeLine = null;
    this.activeDashLine = null;
    this.travelerOrb = null;
    this.travelerLight = null;
    this.travelerTrail = [];
    this.travelerProgress = 0;
    this.travelerSpeed = 0.0015;

    this.init();
  }

  init() {
    // 1. Scene & Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(-20, 18, 30);

    // 3. WebGL Renderer - Alpha set to true to blend perfectly with white background grid
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
    } catch (e) {
      console.warn("WebGL map context failed.", e);
      this.renderer = null;
      return;
    }
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0xffffff, 0); // Completely transparent backdrop

    // 4. Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 60;
    this.controls.enablePan = false;

    // 5. Light setup adjusted for a clean, bright, white-dashboard theme
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(10, 30, 15);
    this.scene.add(dirLight);

    // 6. Build Topographic Mountain Terrain (Clean light-gray wireframe)
    this.createTerrain();

    // 7. Load Initial Route (Solang)
    this.renderRoute('solang');

    // 8. Listeners
    window.addEventListener('resize', () => this.onWindowResize());

    // Register active tab callback listeners globally
    window.addEventListener('packageToggle', (e) => {
      this.switchRoute(e.detail.packageName);
    });

    // 9. Start loop
    this.animate();
  }

  createTerrain() {
    // Creates a highly visual digital mountain layout
    const terrainGeometry = new THREE.PlaneGeometry(60, 40, 60, 40);

    // Displace vertices with mathematical noise functions to simulate mountains
    const pos = terrainGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Multi-layered mountain formulas
      let z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 3;
      z += Math.sin(x * 0.25) * Math.sin(y * 0.2) * 1.5;

      // Steeper mountains in the northeastern background (Manali/Solang area)
      if (x > -5 && y < 5) {
        z += (x + 5) * 0.25 * (5 - y) * 0.2;
      }

      pos.setZ(i, z);
    }

    terrainGeometry.computeVertexNormals();

    // Subtle, high-end warm gold wireframe terrain
    const terrainMaterial = new THREE.MeshBasicMaterial({
      color: 0xc5a880, // Shimmering gold wireframe terrain line color
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      depthWrite: true
    });

    this.terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    this.terrainMesh.rotation.x = -Math.PI / 2; // Flat ground rotation
    this.terrainMesh.position.y = -3;
    this.scene.add(this.terrainMesh);
  }

  renderRoute(routeName) {
    this.activeRouteName = routeName;
    const routeConfig = this.routes[routeName];

    // --- Clear Previous Route Elements ---
    this.clearRouteObjects();

    // --- 1. Draw Winding Curved 3D Line Path ---
    const curvePoints = [];
    routeConfig.nodes.forEach(node => {
      curvePoints.push(node.pos);
    });

    // Generate smooth spline curve
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    // Glowing modern 3D Tube geometry path (coral pink or cyan)
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.18, 6, false);
    const tubeMaterial = new THREE.MeshPhongMaterial({
      color: routeConfig.color,
      emissive: routeConfig.color,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.9,
      shininess: 80
    });
    this.activeLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
    this.scene.add(this.activeLine);

    // Add secondary elegant dashed guide path in slate gray
    const points = curve.getPoints(100);
    const dashGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const dashMaterial = new THREE.LineDashedMaterial({
      color: 0x94a3b8, // Slate gray dash
      dashSize: 1.0,
      gapSize: 1.5,
      transparent: true,
      opacity: 0.45
    });
    this.activeDashLine = new THREE.Line(dashGeometry, dashMaterial);
    this.activeDashLine.computeLineDistances();
    this.activeDashLine.position.y += 0.15;
    this.scene.add(this.activeDashLine);

    // --- 2. Spawn Glowing Destination Spheres (Nodes) ---
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);

    routeConfig.nodes.forEach((node, index) => {
      const isEndNode = (index === routeConfig.nodes.length - 1);
      const isStartNode = (index === 0);

      // Node colors matching Screenshot 2 (Delhi Start is pink/magenta, Solang End is vibrant yellow-gold)
      const nodeColor = isEndNode
        ? 0xffd700
        : (isStartNode ? 0xff3b30 : routeConfig.color);

      // Node Material
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.5,
        specular: 0xffffff,
        shininess: 60
      });

      const sphere = new THREE.Mesh(sphereGeometry, nodeMaterial);
      sphere.position.copy(node.pos);
      sphere.scale.set(0.1, 0.1, 0.1); // Animate scale up on spawn
      this.scene.add(sphere);

      // Create a gorgeous translucent pulsing halo aura (exactly like Screenshot 2)
      const haloGeo = new THREE.SphereGeometry(1.5, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.16
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(node.pos);
      this.scene.add(halo);

      // Save references
      sphere.userData = {
        halo: halo,
        originalScale: isEndNode ? 1.4 : 1.0,
        spawnTime: Math.random() * 100
      };
      this.activeNodes.push(sphere);

      // Scale in animation
      gsap.to(sphere.scale, {
        x: isEndNode ? 1.4 : 1.0,
        y: isEndNode ? 1.4 : 1.0,
        z: isEndNode ? 1.4 : 1.0,
        duration: 0.6,
        delay: index * 0.08,
        ease: 'elastic.out(1, 0.5)'
      });

      // Add HTML DOM label helper trigger bounds
      this.createNodeTooltip(node, nodeColor);
    });

    // --- 3. Create Flying Traveler Orb (White Light) ---
    const orbGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });

    this.travelerOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    this.travelerOrb.position.copy(curvePoints[0]);
    this.scene.add(this.travelerOrb);

    this.travelerLight = new THREE.PointLight(routeConfig.color, 2, 8);
    this.travelerOrb.add(this.travelerLight);

    // Glowing trail comets
    this.travelerTrail = [];
    const trailCount = 5;
    for (let i = 0; i < trailCount; i++) {
      const trailGeo = new THREE.SphereGeometry(0.22 - (i * 0.035), 8, 8);
      const trailMat = new THREE.MeshBasicMaterial({
        color: routeConfig.color,
        transparent: true,
        opacity: 0.6 - (i * 0.1)
      });
      const trailMesh = new THREE.Mesh(trailGeo, trailMat);
      trailMesh.position.copy(curvePoints[0]);
      this.scene.add(trailMesh);
      this.travelerTrail.push(trailMesh);
    }

    this.activeCurve = curve;
    this.travelerProgress = 0;

    // --- 4. Spawn 3D Hearts for Honeymoon Route ---
    this.heartMeshes = [];
    if (routeName === 'honeymoon') {
      const x = 0, y = 0;
      const heartShape = new THREE.Shape();
      heartShape.moveTo(x + 0.5, y + 0.5);
      heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
      heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
      heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
      heartShape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
      heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
      heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

      const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
      const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      heartGeo.center();
      heartGeo.rotateZ(Math.PI);

      const heartMat = new THREE.MeshStandardMaterial({ color: 0xff3366, metalness: 0.5, roughness: 0.2, emissive: 0xff3366, emissiveIntensity: 0.2 });

      for (let i = 0; i < 6; i++) {
        const heartMesh = new THREE.Mesh(heartGeo, heartMat);
        // Position along the path
        const pt = curve.getPointAt((i + 1) / 7);
        heartMesh.position.set(pt.x, pt.y + 1.5, pt.z);
        heartMesh.scale.set(0.3, 0.3, 0.3);
        this.scene.add(heartMesh);
        this.heartMeshes.push({ mesh: heartMesh, floatOffset: Math.random() * Math.PI * 2 });
      }
    }
  }

  clearRouteObjects() {
    if (this.activeLine) {
      this.scene.remove(this.activeLine);
      this.activeLine.geometry.dispose();
      this.activeLine.material.dispose();
      this.activeLine = null;
    }

    if (this.activeDashLine) {
      this.scene.remove(this.activeDashLine);
      this.activeDashLine.geometry.dispose();
      this.activeDashLine.material.dispose();
      this.activeDashLine = null;
    }

    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        if (node.userData && node.userData.halo) {
          this.scene.remove(node.userData.halo);
          node.userData.halo.geometry.dispose();
          node.userData.halo.material.dispose();
        }
        this.scene.remove(node);
        node.geometry.dispose();
        node.material.dispose();
      });
      this.activeNodes = [];
    }

    if (this.heartMeshes && this.heartMeshes.length > 0) {
      this.heartMeshes.forEach(h => {
        this.scene.remove(h.mesh);
        h.mesh.geometry.dispose();
        h.mesh.material.dispose();
      });
      this.heartMeshes = [];
    }

    if (this.travelerOrb) {
      this.scene.remove(this.travelerOrb);
      this.travelerOrb.geometry.dispose();
      this.travelerOrb.material.dispose();
      this.travelerOrb = null;
    }

    if (this.travelerTrail && this.travelerTrail.length > 0) {
      this.travelerTrail.forEach(mesh => {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      this.travelerTrail = [];
    }

    const panel = document.getElementById('three-map-tooltips');
    if (panel) panel.innerHTML = '';
  }

  createNodeTooltip(node, colorHex) {
    const panel = document.getElementById('three-map-tooltips');
    if (!panel) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'absolute transform -translate-x-1/2 -translate-y-full mb-3 pointer-events-none opacity-0 transition-opacity duration-300 z-10 scale-95 origin-bottom';
    tooltip.id = `map-node-${node.name.replace(/\s+/g, '-')}`;

    const hexStr = typeof colorHex === 'string' ? colorHex : `#${colorHex.toString(16).padStart(6, '0')}`;

    // Premium obsidian-gold tooltip styled for dark luxury
    tooltip.innerHTML = `
      <div class="bg-[#050806]/95 px-3.5 py-2 rounded-lg border border-gold/25 text-center shadow-2xl min-w-[130px] backdrop-blur-md">
        <span class="font-sans text-xs font-bold block text-gold tracking-wide">${node.name}</span>
        <span class="text-[9px] font-sans font-medium text-[#f7f4eb]/60 mt-0.5 block">${node.desc}</span>
      </div>
      <!-- Triangle Indicator pointing to node -->
      <div class="w-2.5 h-2.5 bg-[#050806] border-r border-b border-gold/25 mx-auto rotate-45 -mt-1.5 shadow-2xl"></div>
    `;

    panel.appendChild(tooltip);
  }

  switchRoute(packageName) {
    if (packageName === this.activeRouteName) return;

    const targetCamPos = packageName === 'spiti'
      ? { x: -28, y: 22, z: 32 }
      : { x: -20, y: 18, z: 30 };

    gsap.to(this.camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(0, 0, 0);
      }
    });

    gsap.fromTo(this.canvas,
      { opacity: 1 },
      {
        opacity: 0.1,
        duration: 0.3,
        onComplete: () => {
          this.renderRoute(packageName);
          gsap.to(this.canvas, { opacity: 1, duration: 0.5 });
        }
      }
    );
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    if (this.travelerOrb && this.activeCurve) {
      this.travelerProgress += this.travelerSpeed;
      if (this.travelerProgress > 1.0) {
        this.travelerProgress = 0;
      }

      const activePosition = this.activeCurve.getPointAt(this.travelerProgress);
      this.travelerOrb.position.copy(activePosition);

      const time = Date.now() * 0.005;
      if (this.travelerLight) {
        this.travelerLight.intensity = Math.sin(time) * 0.5 + 1.8;
      }

      if (this.travelerTrail && this.travelerTrail.length > 0) {
        for (let i = this.travelerTrail.length - 1; i > 0; i--) {
          this.travelerTrail[i].position.lerp(this.travelerTrail[i - 1].position, 0.28);
        }
        this.travelerTrail[0].position.lerp(this.travelerOrb.position, 0.28);
      }
    }

    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        if (node.userData && node.userData.halo) {
          const time = Date.now() * 0.003 + node.userData.spawnTime;
          const scale = 1.0 + Math.sin(time) * 0.1;
          node.userData.halo.scale.set(scale, scale, scale);
        }
      });
    }

    if (this.heartMeshes && this.heartMeshes.length > 0) {
      const time = Date.now() * 0.002;
      this.heartMeshes.forEach(h => {
        h.mesh.rotation.y += 0.02;
        h.mesh.position.y += Math.sin(time + h.floatOffset) * 0.01;
      });
    }

    this.updateTooltipsProjection();

    this.renderer.render(this.scene, this.camera);
  }

  updateTooltipsProjection() {
    const routeConfig = this.routes[this.activeRouteName];
    if (!routeConfig) return;

    const widthHalf = this.renderer.domElement.clientWidth / 2;
    const heightHalf = this.renderer.domElement.clientHeight / 2;

    routeConfig.nodes.forEach(node => {
      const element = document.getElementById(`map-node-${node.name.replace(/\s+/g, '-')}`);
      if (!element) return;

      const tempV = node.pos.clone();
      tempV.project(this.camera);

      if (tempV.z > 1) {
        element.style.opacity = 0;
        return;
      }

      const x = (tempV.x * widthHalf) + widthHalf;
      const y = -(tempV.y * heightHalf) + heightHalf;

      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      const dist = this.camera.position.distanceTo(node.pos);
      if (dist < 48) {
        element.style.opacity = 1;
        element.style.transform = 'translate(-50%, -100%) scale(1)';
      } else {
        element.style.opacity = 0;
        element.style.transform = 'translate(-50%, -100%) scale(0.9)';
      }
    });
  }
}

// Instantiate Route Map once script loaded
const initInteractive3DMap = () => {
  if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
    window.Soil3DMapInstance = new Interactive3DMap();
  } else {
    setTimeout(initInteractive3DMap, 100);
  }
};

initInteractive3DMap();
