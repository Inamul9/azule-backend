// Wait for the DOM and scripts to fully load
document.addEventListener('DOMContentLoaded', () => {
  console.log("🌲 Soil Village Solang Valley website initializing...");

  // Initialize custom mouse glow cursor
  initCursorGlow();

  // Initialize Lenis smooth scroll
  const lenis = initLenis();

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Initialize animations
  initHeroAnimations();
  initScrollAnimations();
  initTiltCards();
  initItineraryTimeline();
  initGalleryLightbox();
  initTestimonialCarousel();
  initBookingForm();
  initDynamicStars();
  initMobileMenu();
  initWildernessReels();
});

/* ==========================================
   1. LENIS SMOOTH SCROLLING
   ========================================== */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.8, // Slightly longer duration for highly luxury cinematic glide
    easing: (t) => 1 - Math.pow(1 - t, 5), // Premium quintic ease-out deceleration
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95, // Highly controlled friction for smoothness
    smoothTouch: false,
    touchMultiplier: 1.8,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Update ScrollTrigger on scroll
  lenis.on('scroll', ScrollTrigger.update);
  
  return lenis;
}

/* ==========================================
   2. CUSTOM CURSOR GLOW
   ========================================== */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  document.addEventListener('mousemove', (e) => {
    gsap.to(glow, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.4,
      ease: 'power3.out'
    });
  });
}

/* ==========================================
   3. HERO ENTRANCE & PARALLAX
   ========================================== */
function initHeroAnimations() {
  // Hero section timeline
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.fromTo('.hero-logo-img', 
    { scale: 0.7, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 1.5 }
  );

  tl.fromTo('.hero-subtitle', 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1 }, 
    '-=1.0'
  );

  tl.fromTo('.hero-title-main', 
    { y: 40, opacity: 0, scale: 0.95 }, 
    { y: 0, opacity: 1, scale: 1, duration: 1.2 }, 
    '-=0.8'
  );

  tl.fromTo('.hero-badge-tag', 
    { scale: 0.8, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 0.8 }, 
    '-=0.8'
  );

  tl.fromTo('.hero-info-p', 
    { y: 20, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8 }, 
    '-=0.6'
  );

  tl.fromTo('.hero-ctas a', 
    { y: 25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, 
    '-=0.5'
  );

  tl.fromTo('.navbar-brand, .nav-desktop-item, .nav-book-btn', 
    { y: -30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 
    '-=1.2'
  );

  // Cinematic scroll zoom effect on hero background
  gsap.to('.hero-bg-zoom', {
    scale: 1.12,
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Mountain & Fog parallax movement
  gsap.to('.hero-fog-1', {
    xPercent: 12,
    yPercent: -5,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.hero-fog-2', {
    xPercent: -15,
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
  
  // Parallax text shift
  gsap.to('.hero-text-container', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

/* ==========================================
   4. SCROLL TRIGGER ANIMATIONS (FADES & REVEALS)
   ========================================== */
function initScrollAnimations() {
  // Sticky glass navbar background blur on scroll
  ScrollTrigger.create({
    start: 'top -50px',
    onEnter: () => {
      document.querySelector('header').classList.add('glass-panel', 'shadow-lg');
      document.querySelector('header').classList.remove('bg-transparent');
    },
    onLeaveBack: () => {
      document.querySelector('header').classList.remove('glass-panel', 'shadow-lg');
      document.querySelector('header').classList.add('bg-transparent');
    }
  });

  // Section Headers Reveal
  const sectionHeaders = document.querySelectorAll('.section-header-reveal');
  sectionHeaders.forEach(header => {
    gsap.fromTo(header, 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // General staggered fade-in animations
  const staggerContainers = document.querySelectorAll('.stagger-reveal-container');
  staggerContainers.forEach(container => {
    const items = container.querySelectorAll('.stagger-reveal-item');
    if (items.length === 0) return;
    gsap.fromTo(items, 
      { y: 50, opacity: 0, rotationY: 10, scale: 0.9 },
      { 
        y: 0, 
        opacity: 1, 
        rotationY: 0,
        scale: 1,
        duration: 1.0, 
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Polaroid picture collage stagger reveal
  if (document.querySelector('.polaroid-reveal')) {
    gsap.fromTo('.polaroid-reveal', 
      { scale: 0.85, opacity: 0, y: 50 },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.polaroid-collage-section',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
  }
}

/* ==========================================
   5. 3D CARD TILT EFFECT (GSAP powered)
   ========================================== */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      
      // Calculate rotation based on cursor coordinate from center of the card
      const dx = (x - w/2) / (w/2);
      const dy = (y - h/2) / (h/2);
      
      const maxRotX = 12; // max rotation degrees
      const maxRotY = 12;

      gsap.to(card, {
        rotateX: -dy * maxRotX,
        rotateY: dx * maxRotY,
        scale: 1.02,
        boxShadow: '0 15px 40px rgba(13, 40, 24, 0.4)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Inner reflections/icon translation for 3D depth
      const inner = card.querySelector('.tilt-inner');
      if (inner) {
        gsap.to(inner, {
          x: dx * 8,
          y: dy * 8,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0 8px 32px 0 rgba(13, 40, 24, 0.37)',
        duration: 0.6,
        ease: 'power2.out'
      });
      
      const inner = card.querySelector('.tilt-inner');
      if (inner) {
        gsap.to(inner, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });
  });
}

/* ==========================================
   6. CAMPING ITINERARY TIMELINE
   ========================================== */
function initItineraryTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const dot = item.querySelector('.timeline-dot');
    const content = item.querySelector('.timeline-content');
    
    if (!dot || !content) return;

    // Animate Timeline Dot
    gsap.fromTo(dot, 
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );

    // Animate Content Slide In
    gsap.fromTo(content, 
      { 
        x: isEven ? -60 : 60, 
        opacity: 0 
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Food List Stagger Animation
  gsap.fromTo('.food-item',
    { x: -30, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.food-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

/* ==========================================
   7. MASONRY GALLERY & LIGHTBOX
   ========================================== */
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightbox = document.getElementById('close-lightbox');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || galleryItems.length === 0) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.dataset.title || 'Camping Experience';
      const category = item.dataset.category || 'Solang Valley, Manali';
      
      lightboxImg.src = img.src;
      lightboxCaption.innerHTML = `<span class="text-gold font-bold block text-lg font-cinzel">${title}</span><span class="text-sm font-light text-cream/70">${category}</span>`;
      
      lightbox.classList.add('active');
      
      // Animate Lightbox Image Scale Up
      gsap.fromTo(lightboxImg, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
      
      // Animate Caption
      gsap.fromTo(lightboxCaption,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power3.out' }
      );
    });
  });

  function closeLightboxModal() {
    gsap.to(lightboxImg, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => {
        lightbox.classList.remove('active');
      }
    });
  }

  closeLightbox.addEventListener('click', closeLightboxModal);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) {
      closeLightboxModal();
    }
  });

  // Close lightbox on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightboxModal();
    }
  });
}

/* ==========================================
   8. TESTIMONIALS SLIDING CAROUSEL
   ========================================== */
function initTestimonialCarousel() {
  const container = document.querySelector('.testimonial-cards-container');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  const dots = document.querySelectorAll('.testimonial-dot');

  if (!container || cards.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer;
  const slideDuration = 0.8;
  const autoplayDelay = 6000;

  function showSlide(index) {
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    
    currentIndex = index;

    // Slide container to display active card
    gsap.to(container, {
      xPercent: -currentIndex * 100,
      duration: slideDuration,
      ease: 'power3.out'
    });

    // Update dots styling
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('bg-gold', 'w-6');
        dot.classList.remove('bg-cream/20', 'w-2.5');
      } else {
        dot.classList.remove('bg-gold', 'w-6');
        dot.classList.add('bg-cream/20', 'w-2.5');
      }
    });

    // Restart autoplay
    resetAutoplay();
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, autoplayDelay);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showSlide(idx));
  });

  // Start the autoplay loop
  startAutoplay();
}

/* ==========================================
   9. BOOKING FORM HANDLER & API FETCH
   ========================================== */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('booking-submit-btn');
  const statusContainer = document.getElementById('booking-status');
  const successPanel = document.getElementById('booking-success-panel');

  if (!form) return;

  let successWebGLInstance = null;

  // Render low-poly WebGL tent inside success badge
  function runSuccessWebGL() {
    const canvas = document.getElementById('success-webgl-canvas');
    if (!canvas) return null;

    // Set dimensions based on parent container
    const width = 128;
    const height = 128;
    canvas.width = width;
    canvas.height = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.3, 2.8);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Cone geometry with 4 radial segments looks exactly like a traditional camping ridge tent
    const geometry = new THREE.ConeGeometry(0.65, 0.9, 4, 1, true);
    geometry.rotateY(Math.PI / 4); // Turn peak forward nicely

    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd4af37, // premium gold
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    const tent = new THREE.LineSegments(wireframe, lineMaterial);
    tent.position.y = 0.3;
    scene.add(tent);

    // Orbiting particles array
    const pCount = 12;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pSpeeds = [];

    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.2;
      pPositions[i * 3] = Math.cos(angle) * r;
      pPositions[i * 3 + 1] = Math.random() * 0.6;
      pPositions[i * 3 + 2] = Math.sin(angle) * r;
      pSpeeds.push({
        orbitSpeed: 0.01 + Math.random() * 0.015,
        swaySpeed: 0.002 + Math.random() * 0.003,
        amp: 0.1 + Math.random() * 0.1,
        yOffset: Math.random() * Math.PI
      });
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeometry, pMaterial);
    scene.add(sparks);

    let frameId;
    function renderLoop() {
      frameId = requestAnimationFrame(renderLoop);
      
      // Spin tent
      tent.rotation.y += 0.015;
      
      // Update particles
      const arr = sparks.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        const xIdx = i * 3;
        const yIdx = i * 3 + 1;
        const zIdx = i * 3 + 2;

        const x = arr[xIdx];
        const z = arr[zIdx];
        const s = pSpeeds[i];

        // Orbit circle math
        arr[xIdx] = x * Math.cos(s.orbitSpeed) - z * Math.sin(s.orbitSpeed);
        arr[zIdx] = x * Math.sin(s.orbitSpeed) + z * Math.cos(s.orbitSpeed);
        
        // Vertical sway
        arr[yIdx] = 0.25 + Math.sin(Date.now() * s.swaySpeed + s.yOffset) * s.amp;
      }
      sparks.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    renderLoop();

    return {
      destroy: () => {
        cancelAnimationFrame(frameId);
        geometry.dispose();
        wireframe.dispose();
        lineMaterial.dispose();
        pGeometry.dispose();
        pMaterial.dispose();
        renderer.dispose();
      }
    };
  }

  // Bind Form Submit Action
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable button and initiate loader animation
    submitBtn.disabled = true;
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-forest-deep inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      REGISTERING RESERVATION...
    `;

    if (statusContainer) {
      statusContainer.classList.add('hidden');
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://manali-backend.onrender.com/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errMsg = 'Booking request failed';
        try {
          const errJson = await response.json();
          errMsg = errJson.message || errMsg;
        } catch (e) {
          errMsg = `Server error (${response.status})`;
        }
        throw new Error(errMsg);
      }

      const result = await response.json();

      if (result.success) {
        // Clear standard error classes if visible
        if (statusContainer) statusContainer.classList.add('hidden');

        // Populate details card elements
        document.getElementById('success-val-name').textContent = data.name;
        
        let pkgText = "Solang Valley Ridge Camp (1N/2D)";
        if (data.package === 'spiti') {
          pkgText = "Spiti Valley Jeep Traverse (8N/9D)";
        } else if (data.package === 'honeymoon') {
          pkgText = "Luxury Geodesic Dome Honeymoon Getaway (3N/4D - 50% OFF)";
        }
        document.getElementById('success-val-package').textContent = pkgText;
        
        document.getElementById('success-val-date').textContent = data.date;
        document.getElementById('success-val-travelers').textContent = `${data.travelers} ${parseInt(data.travelers) === 1 ? 'Adventurer' : 'Adventurers'}`;
        document.getElementById('success-val-id').textContent = result.bookingId;

        // Construct WhatsApp message template and redirect
        const whatsappNumber = "919650640715";
        const messageText = `*NEW RESERVATION REQUEST - SOIL VILLAGE*
---------------------------------------
*Booking ID:* ${result.bookingId}
*Name:* ${data.name}
*Phone:* ${data.phone}
*Email:* ${data.email}
*Date:* ${data.date}
*Travelers:* ${data.travelers}
*Package:* ${pkgText}
*Message:* ${data.message || 'None'}
---------------------------------------
Please confirm my reservation. Thank you!`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');

        // Reset the form fields
        form.reset();

        // GSAP transition: Fade out form and slide in the holographic success card!
        gsap.to(form, {
          opacity: 0,
          y: -20,
          scale: 0.96,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: () => {
            form.classList.add('hidden');
            successPanel.classList.remove('hidden');
            
            // Trigger 3D canvas
            if (successWebGLInstance) successWebGLInstance.destroy();
            successWebGLInstance = runSuccessWebGL();

            gsap.fromTo(successPanel,
              { opacity: 0, y: 20, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
            );
          }
        });

      } else {
        // Show validation error card inside status container
        if (statusContainer) {
          statusContainer.className = "mt-4 p-4 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-sans glass-panel shadow-lg";
          statusContainer.innerHTML = "<div class='flex items-start'><span class='mr-2.5 text-base'>Error:</span><div><p class='font-cinzel text-red-400 font-bold tracking-wider uppercase mb-0.5'>Booking Failed</p><p class='text-cream/80'>" + result.message + "</p></div></div>";
          statusContainer.classList.remove('hidden');
          gsap.fromTo(statusContainer, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
      }
    } catch (err) {
      console.error(' Wilderness Reservation server error:', err);
      if (statusContainer) {
        statusContainer.className = "mt-4 p-4 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-sans glass-panel shadow-lg";
        statusContainer.innerHTML = "<div class='flex items-start'><span class='mr-2.5 text-base'>Error:</span><div><p class='font-cinzel text-red-400 font-bold tracking-wider uppercase mb-0.5'>Booking Failed</p><p class='text-cream/80'>" + (err.message || "Wilderness database connection failed. Please check internet connection and retry.") + "</p></div></div>";
        statusContainer.classList.remove('hidden');
        gsap.fromTo(statusContainer, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
    } finally {
      // Restore button status
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });

  // Print pass listener
  const printBtn = document.getElementById('success-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Reset booking screen listener
  const resetBtn = document.getElementById('success-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (successWebGLInstance) {
        successWebGLInstance.destroy();
        successWebGLInstance = null;
      }

      gsap.to(successPanel, {
        opacity: 0,
        scale: 0.96,
        y: 20,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          successPanel.classList.add('hidden');
          form.classList.remove('hidden');
          gsap.fromTo(form,
            { opacity: 0, y: -20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
          );
        }
      });
    });
  }
}

/* ==========================================
   10. AMBIENT STARLIGHT GENERATOR
   ========================================== */
function initDynamicStars() {
  const containers = document.querySelectorAll('.stars-container');
  
  containers.forEach(container => {
    const starCount = 35;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random coordinates
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const size = Math.random() * 2 + 1; // 1px to 3px
      
      // Random timings
      const delay = Math.random() * 4;
      const duration = Math.random() * 3 + 2; // 2s to 5s
      
      star.style.left = `${posX}%`;
      star.style.top = `${posY}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Custom animation styling
      star.style.animationDelay = `${delay}s`;
      star.style.animationDuration = `${duration}s`;
      
      // Vary color slightly (white to glowing gold)
      if (Math.random() > 0.7) {
        star.style.backgroundColor = '#ffd700';
        star.style.boxShadow = '0 0 4px #ffd700';
      } else {
        star.style.boxShadow = '0 0 3px #ffffff';
      }

      container.appendChild(star);
    }
  });
}

/* ==========================================
   11. MOBILE HAMBURGER MENU Navigation
   ========================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  const links = drawer?.querySelectorAll('a');

  if (!toggle || !drawer) return;

  function openMenu() {
    drawer.classList.remove('translate-x-full');
    toggle.classList.add('active');
    
    // Stagger links entrance
    gsap.fromTo(links, 
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
    );
    
    // Stop Lenis scroll when mobile menu is open
    // lenis object is out of scope, but can trigger it via document custom event or simple scrolling locks
    document.body.classList.add('overflow-hidden');
  }

  function closeMenu() {
    drawer.classList.add('translate-x-full');
    toggle.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('translate-x-full')) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Close menu when clicking link
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && e.target !== toggle && !drawer.classList.contains('translate-x-full')) {
      closeMenu();
    }
  });
}

/* ==========================================
/* ==========================================
   12. GLOBAL MULTI-PACKAGE SYNCHRONIZATION
   ========================================== */
window.formatTitleWithGradient = function(titleText) {
  if (!titleText) return '';
  const words = titleText.split(' ');
  if (words.length <= 2) {
    return `<span class="bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-warm to-[#ffd700]">${titleText}</span>`;
  }
  const lastTwo = words.slice(-2).join(' ');
  const mainPart = words.slice(0, -2).join(' ');
  return `${mainPart} <span class="bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-warm to-[#ffd700]">${lastTwo}</span>`;
};

window.setGlobalPackage = function(pkg) {
  console.log(`Switching expedition package selection to: ${pkg.toUpperCase()}`);




  // 1. Update Segmented Buttons Styling
  const btns = ['solang', 'spiti', 'honeymoon', 'family'];
  btns.forEach(b => {
    const el = document.getElementById(`btn-pkg-${b}`);
    if (el) {
      if (b === pkg) {
        el.className = "px-6 py-2.5 rounded-full text-xs font-sans font-bold tracking-widest uppercase transition-all duration-300 bg-gold text-[#030704] shadow-lg font-mono";
      } else {
        el.className = "px-6 py-2.5 rounded-full text-xs font-sans font-semibold tracking-widest uppercase transition-all duration-300 text-gold/60 hover:text-gold font-mono";
      }
    }
  });

  // 2. Dispatch event to update interactive 3D WebGL route map
  window.dispatchEvent(new CustomEvent('packageToggle', { detail: { packageName: pkg } }));

  // 3. Swap Map Section Description Details Panel
  btns.forEach(p => {
    const el = document.querySelector(`#panel-details-${p}`);
    if (el) {
      if (p === pkg) {
        el.classList.remove('hidden');
        gsap.fromTo(el, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      } else {
        el.classList.add('hidden');
        el.style.opacity = 0;
      }
    }
  });

  // 3. Update Route Map Header
  const mapTitle = document.getElementById('map-section-title');
  const mapDesc = document.getElementById('map-section-desc');
  if (mapTitle && mapDesc) {
    gsap.to([mapTitle, mapDesc], {
      opacity: 0,
      y: -10,
      duration: 0.25,
      onComplete: () => {
        // Retrieve dynamic values from window.WEBSITE_SETTINGS
        let titleVal = '';
        let descVal = '';
        const pkgData = window.WEBSITE_SETTINGS && window.WEBSITE_SETTINGS.packages && window.WEBSITE_SETTINGS.packages[pkg];
        if (pkgData) {
          titleVal = pkgData.title;
          descVal = pkgData.desc;
        } else {
          // Fallback static defaults
          if (pkg === 'solang') {
            titleVal = 'SOLANG VALLEY BASE PATHWAY';
            descVal = "Immerse yourself in the breathtaking landscapes of the Himalayas. Our itineraries ensure every moment of your mountain escape is filled with beauty and premium comfort.";
          } else if (pkg === 'spiti') {
            titleVal = 'SPITI VALLEY EXPEDITION LOOP';
            descVal = "Embark on a high-altitude road trip. Traverse ancient monasteries, stark landscapes, and rugged terrains in our premium SUVs designed for adventure.";
          } else if (pkg === 'family') {
            titleVal = 'MANALI FAMILY TOUR ROUTE';
            descVal = "Create unforgettable memories with your loved ones. Experience the best attractions, from the snowy slopes of Solang Valley to comfortable hotel stays.";
          } else {
            titleVal = 'HONEYMOON ROMANTIC ESCAPE';
            descVal = "Celebrate your love in the serene luxury of the mountains. Enjoy private geodesic domes, candlelight dinners, and breathtaking sunsets tailored just for you.";
          }
        }

        // Preserve edit pencil buttons if we are in admin mode
        const titlePencil = mapTitle.querySelector('.edit-pencil-btn');
        const descPencil = mapDesc.querySelector('.edit-pencil-btn');

        // Update content with styled title helper
        mapTitle.innerHTML = window.formatTitleWithGradient(titleVal);
        mapDesc.textContent = descVal;

        // Restore pencil buttons
        if (titlePencil) mapTitle.appendChild(titlePencil);
        if (descPencil) mapDesc.appendChild(descPencil);

        // Update data-edit-key dynamically so editing affects the selected package
        mapTitle.setAttribute('data-edit-key', `packages.${pkg}.title`);
        mapDesc.setAttribute('data-edit-key', `packages.${pkg}.desc`);

        gsap.to([mapTitle, mapDesc], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }
    });
  }

  // 4. Swap Chronological Timelines in Itinerary Section
  btns.forEach(t => {
    const el = document.querySelector(`#itinerary-timeline-${t}`);
    if (el) {
      if (t === pkg) {
        el.classList.remove('hidden');
        gsap.fromTo(el,
          { opacity: 0, x: 25 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        );
      } else {
        el.classList.add('hidden');
        el.style.opacity = 0;
      }
    }
  });

  const itSub = document.getElementById('itinerary-section-subtitle');
  if (itSub) {
    gsap.to(itSub, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        if (pkg === 'solang') {
          itSub.textContent = "SOLANG VALLEY RETREAT";
        } else if (pkg === 'spiti') {
          itSub.textContent = "SPITI VALLEY GRAND TRAVERSE";
        } else if (pkg === 'family') {
          itSub.textContent = "MANALI FAMILY TOUR – 3N/4D";
        } else {
          itSub.textContent = "LUXURY HIMALAYAN HONEYMOON SPECIAL";
        }
        gsap.to(itSub, { opacity: 1, duration: 0.3 });
      }
    });
  }

  // 5. Swap Polaroids Photo Collages
  btns.forEach(pol => {
    const el = document.querySelector(`#polaroids-${pol}`);
    if (el) {
      if (pol === pkg) {
        el.classList.remove('hidden');
        gsap.fromTo(el,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
        // Refresh polaroid animations
        gsap.fromTo(el.querySelectorAll('.polaroid'),
          { scale: 0.85, opacity: 0, y: 35 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
        );
      } else {
        el.classList.add('hidden');
        el.style.opacity = 0;
      }
    }
  });

  // 6. Swap Food Menu Lists
  btns.forEach(menu => {
    const el = document.querySelector(`#food-menu-${menu}`);
    if (el) {
      if (menu === pkg) {
        el.classList.remove('hidden');
        gsap.fromTo(el,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
        // Re-stagger food list entries
        gsap.fromTo(el.querySelectorAll('.food-item'),
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
        );
      } else {
        el.classList.add('hidden');
        el.style.opacity = 0;
      }
    }
  });

  // 7. Update Reservation Form pre-selection input
  const formPkgSelect = document.getElementById('form-package');
  if (formPkgSelect) {
    formPkgSelect.value = pkg;
  }

  // Swap Booking notes lists
  btns.forEach(note => {
    const el = document.querySelector(`#booking-notes-${note}`);
    if (el) {
      if (note === pkg) {
        el.classList.remove('hidden');
        gsap.fromTo(el,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      } else {
        el.classList.add('hidden');
        el.style.opacity = 0;
      }
    }
  });
};

/* ==========================================
   13. PREMIUM FLOATING VECTOR HEARTS EFFECT
   ========================================== */
function createFloatingHearts(container) {
  container.innerHTML = '';
  for(let i=0; i<20; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff3366" stroke="#ff3366" opacity="0.85" style="width:100%;height:100%;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    heart.style.position = 'absolute';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.bottom = '-50px';
    const size = (Math.random() * 16 + 10);
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    heart.style.opacity = Math.random() * 0.5 + 0.3;
    heart.style.animation = `floatUp ${Math.random() * 5 + 5}s linear infinite`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(heart);
  }
}

/* ==========================================
   14. WILDERNESS REELS INTERACTIVITY
   ========================================== */
function initWildernessReels() {
  const cards = document.querySelectorAll('#reels .stagger-reveal-item');
  
  // Track YT player instances for desktop
  const ytPlayers = new Map();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Helper to initialize YT.Player on iframe elements
  const initYoutubePlayers = () => {
    cards.forEach(card => {
      const iframe = card.querySelector('iframe');
      if (iframe) {
        if (!iframe.id) {
          iframe.id = 'yt-player-' + Math.random().toString(36).substr(2, 9);
        }
        
        if (ytPlayers.has(card)) return;

        try {
          const player = new YT.Player(iframe.id, {
            events: {
              onReady: (event) => {
                event.target.mute();
                event.target.setVolume(100);
              }
            }
          });
          ytPlayers.set(card, player);
        } catch (err) {
          console.error("Error creating YT.Player:", err);
        }
      }
    });
  };

  // Load YouTube IFrame API
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      initYoutubePlayers();
    };
  } else {
    if (window.YT.Player) {
      initYoutubePlayers();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initYoutubePlayers();
      };
    }
  }

  cards.forEach(card => {
    const video = card.querySelector('video');
    const iframe = card.querySelector('iframe');
    const audioBtn = card.querySelector('.audio-toggle-btn');
    if (!audioBtn) return;

    // Handle HTML5 video
    if (video) {
      // Ensure video has playsinline for iOS
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (!isMobile) {
        video.setAttribute('autoplay', '');
        video.play().catch(() => {});
      } else {
        video.removeAttribute('autoplay');
        video.pause();
      }
      const muteIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>';
      const unmuteIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 unmute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>';

      const handleVideoAudio = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const nowMuted = video.muted;

        if (!nowMuted) {
          // Muting
          video.muted = true;
          audioBtn.innerHTML = muteIconSVG;
        } else {
          // Unmuting — mute all others first
          document.querySelectorAll('#reels video').forEach(v => {
            if (v !== video) {
              v.muted = true;
              const btn = v.closest('.stagger-reveal-item') ? v.closest('.stagger-reveal-item').querySelector('.audio-toggle-btn') : null;
              if (btn) btn.innerHTML = muteIconSVG;
            }
          });

          // Mute all YouTube players
          ytPlayers.forEach((player, otherCard) => {
            try { if (typeof player.mute === 'function') player.mute(); } catch(err) {}
            const btn = otherCard.querySelector('.audio-toggle-btn');
            if (btn) { btn.classList.remove('unmuted'); btn.innerHTML = muteIconSVG; }
          });

          // Mute YouTube iframes via URL
          document.querySelectorAll('#reels iframe').forEach(otherIframe => {
            const otherCard = otherIframe.closest('.stagger-reveal-item');
            const otherBtn = otherCard ? otherCard.querySelector('.audio-toggle-btn') : null;
            if (otherBtn && otherBtn.classList.contains('unmuted')) {
              let src = otherIframe.getAttribute('src') || '';
              if (src.includes('mute=0')) otherIframe.setAttribute('src', src.replace('mute=0', 'mute=1'));
              otherBtn.classList.remove('unmuted');
              otherBtn.innerHTML = muteIconSVG;
            }
          });

          // KEY FIX: unmute + re-play in same gesture to unlock audio on iOS/Android
          video.muted = false;
          video.volume = 1.0;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay blocked — still show unmuted icon so user knows state
            });
          }
          audioBtn.innerHTML = unmuteIconSVG;
        }
      };

      audioBtn.addEventListener('click', handleVideoAudio);

      card.addEventListener('click', (e) => {
        // Don't toggle play/pause if tapping the audio button
        if (e.target.closest('.audio-toggle-btn')) return;
        if (video.paused) {
          if (isMobile && video.muted) {
            // Unmute and play simultaneously for mobile
            handleVideoAudio(e);
          } else {
            video.play().catch(() => {});
          }
        } else {
          video.pause();
        }
      });
    }

    // Handle YouTube iframe
    if (iframe) {
      let touchMoved = false;
      let lastTrigger = 0;

      const toggleYoutubeAudio = (e) => {
        e.stopPropagation();
        
        const isUnmuted = audioBtn.classList.contains('unmuted');
        const player = ytPlayers.get(card);
        const hasAPI = (player && typeof player.unMute === 'function');
        
        if (isUnmuted) {
          // Mute YouTube
          if (hasAPI) {
            try {
              player.mute();
            } catch (err) {
              console.error("Error muting player:", err);
            }
          } else {
            let src = iframe.getAttribute('src') || '';
            if (src.includes('mute=0')) {
              src = src.replace('mute=0', 'mute=1');
            } else if (!src.includes('mute=1')) {
              src += '&mute=1';
            }
            iframe.setAttribute('src', src);
          }
          iframe.classList.add('pointer-events-none');
          audioBtn.classList.remove('unmuted');
          audioBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          `;
        } else {
          // Unmute YouTube
          if (hasAPI) {
            try {
              player.unMute();
              player.setVolume(100);
              player.playVideo();
            } catch (err) {
              console.error("Error unmuting player:", err);
              // Fallback
              let src = iframe.getAttribute('src') || '';
              if (src.includes('mute=1')) {
                src = src.replace('mute=1', 'mute=0');
              } else if (!src.includes('mute=0')) {
                src += '&mute=0';
              }
              iframe.setAttribute('src', src);
            }
          } else {
            let src = iframe.getAttribute('src') || '';
            if (src.includes('mute=1')) {
              src = src.replace('mute=1', 'mute=0');
            } else if (!src.includes('mute=0')) {
              src += '&mute=0';
            }
            iframe.setAttribute('src', src);
          }
          iframe.classList.remove('pointer-events-none');
          audioBtn.classList.add('unmuted');
          
          // Mute all HTML5 videos
          document.querySelectorAll('#reels video').forEach(v => {
            v.muted = true;
            const btn = v.parentElement.querySelector('.audio-toggle-btn');
            if (btn) {
              btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              `;
            }
          });

          // Mute all other YouTube videos
          cards.forEach(otherCard => {
            if (otherCard !== card) {
              const otherBtn = otherCard.querySelector('.audio-toggle-btn');
              if (otherBtn && otherBtn.classList.contains('unmuted')) {
                const otherPlayer = ytPlayers.get(otherCard);
                const otherHasAPI = (otherPlayer && typeof otherPlayer.mute === 'function');
                
                if (otherHasAPI) {
                  try {
                    otherPlayer.mute();
                  } catch (err) {
                    console.error("Error muting other player:", err);
                  }
                } else {
                  const otherIframe = otherCard.querySelector('iframe');
                  if (otherIframe) {
                    let otherSrc = otherIframe.getAttribute('src') || '';
                    if (otherSrc.includes('mute=0')) {
                      otherSrc = otherSrc.replace('mute=0', 'mute=1');
                      otherIframe.setAttribute('src', otherSrc);
                    }
                  }
                }
                const otherIframe = otherCard.querySelector('iframe');
                if (otherIframe) {
                  otherIframe.classList.add('pointer-events-none');
                }
                otherBtn.classList.remove('unmuted');
                otherBtn.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                `;
              }
            }
          });

          audioBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 unmute-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          `;
        }
      };

      const triggerToggle = (e) => {
        const now = Date.now();
        if (now - lastTrigger < 300) return;
        lastTrigger = now;
        toggleYoutubeAudio(e);
      };

      // Add click listener
      audioBtn.addEventListener('click', triggerToggle);
      card.addEventListener('click', triggerToggle);

      // Handle touch events for responsive activation on mobile without double firing
      card.addEventListener('touchstart', () => {
        touchMoved = false;
      }, { passive: true });
      card.addEventListener('touchmove', () => {
        touchMoved = true;
      }, { passive: true });
      card.addEventListener('touchend', (e) => {
        if (!touchMoved) {
          triggerToggle(e);
        }
      });
      
      audioBtn.addEventListener('touchend', triggerToggle);
    }
  });
}
