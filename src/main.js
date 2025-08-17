import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class AnniversaryCard {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.loader = new GLTFLoader();
    this.controls = null;
    this.table = null;
    this.cake = null;
    this.noteCard = null;
    this.hearts = [];
    this.sparkles = [];
    this.clock = new THREE.Clock();
    
    this.init();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    document.getElementById('app').appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.set(5, 4, 8);
    this.camera.lookAt(0, 0, 0);

    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 15;
    this.controls.enablePan = true;

    // Setup scene
    this.setupLighting();
    this.createBackground();
    this.loadModels();
    this.createParticles();
    this.createUI();
    
    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Warm point light for romantic atmosphere
    const pointLight = new THREE.PointLight(0xffaaaa, 0.8, 20);
    pointLight.position.set(-3, 5, 3);
    this.scene.add(pointLight);

    // Cool accent light
    const accentLight = new THREE.PointLight(0xaaaaff, 0.5, 15);
    accentLight.position.set(5, 3, -3);
    this.scene.add(accentLight);
  }

  createBackground() {
    // Create gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#ff9a9e');
    gradient.addColorStop(0.5, '#fecfef');
    gradient.addColorStop(1, '#fecfef');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    this.scene.background = texture;
  }

  loadModels() {
    // Load table model (fallback to basic geometry if no model)
    this.createTable();
    
    // Load cake model (fallback to basic geometry if no model)
    this.createCake();
    
    // Create note card
    this.createNoteCard();
  }

  createTable() {
    // Try to load GLTF model first, fallback to basic geometry
    this.loader.load(
      './src/models/antique_table.glb', // Update path as needed
      (gltf) => {
        this.table = gltf.scene;
        this.table.scale.set(.35, .35, .35);
        this.table.position.set(0, -6.8, 0);
        this.table.castShadow = true;
        this.table.receiveShadow = true;
        this.scene.add(this.table);
      },
      (progress) => console.log('Table loading progress:', progress),
      (error) => {
        console.log('Table model not found, using fallback geometry');
        this.createFallbackTable();
      }
    );
  }

  createFallbackTable() {
    // Create simple table using basic geometry
    const tableGroup = new THREE.Group();
    
    // Table top
    const topGeometry = new THREE.BoxGeometry(4, 0.2, 4);
    const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const tableTop = new THREE.Mesh(topGeometry, woodMaterial);
    tableTop.position.y = 1;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);
    
    // Table legs
    const legGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const legPositions = [
      [-1.8, 0, -1.8],
      [1.8, 0, -1.8],
      [-1.8, 0, 1.8],
      [1.8, 0, 1.8]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, woodMaterial);
      leg.position.set(...pos);
      leg.castShadow = true;
      tableGroup.add(leg);
    });
    
    this.table = tableGroup;
    this.scene.add(this.table);
  }

  createCake() {
    this.loader.load(
      './src/models/cake.glb', // Update path as needed
      (gltf) => {
        this.cake = gltf.scene;
        this.cake.scale.set(.06, .06, .06);
        this.cake.position.set(0.5, 0, 0);
        this.cake.castShadow = true;
        this.scene.add(this.cake);
        this.addCakeText();
      },
      (progress) => console.log('Cake loading progress:', progress),
      (error) => {
        console.log('Cake model not found, using fallback geometry');
        this.createFallbackCake();
      }
    );
  }

  createFallbackCake() {
    const cakeGroup = new THREE.Group();
    
    // Base layer
    const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
    const cakeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const baseLayer = new THREE.Mesh(baseGeometry, cakeMaterial);
    baseLayer.position.y = 1.5;
    baseLayer.castShadow = true;
    cakeGroup.add(baseLayer);
    
    // Top layer
    const topGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32);
    const topLayer = new THREE.Mesh(topGeometry, cakeMaterial);
    topLayer.position.y = 1.95;
    topLayer.castShadow = true;
    cakeGroup.add(topLayer);
    
    // Frosting details
    const frostingMaterial = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
    for(let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const frostingGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
      frosting.position.x = Math.cos(angle) * 0.8;
      frosting.position.z = Math.sin(angle) * 0.8;
      frosting.position.y = 1.75;
      cakeGroup.add(frosting);
    }
    
    // Candles
    const candleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const candleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const candle1 = new THREE.Mesh(candleGeometry, candleMaterial);
    candle1.position.set(-0.2, 2.3, 0);
    cakeGroup.add(candle1);
    
    const candle2 = new THREE.Mesh(candleGeometry, candleMaterial);
    candle2.position.set(0.2, 2.3, 0);
    cakeGroup.add(candle2);
    
    // Flames
    const flameGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    
    const flame1 = new THREE.Mesh(flameGeometry, flameMaterial);
    flame1.position.set(-0.2, 2.5, 0);
    cakeGroup.add(flame1);
    
    const flame2 = new THREE.Mesh(flameGeometry, flameMaterial);
    flame2.position.set(0.2, 2.5, 0);
    cakeGroup.add(flame2);
    
    this.cake = cakeGroup;
    this.scene.add(this.cake);
    this.addCakeText();
  }

  addCakeText() {
    // Create 3D text for "2 Years"
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Style the text
    ctx.fillStyle = '#a80014';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text with shadow
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
     // Draw first line centered
    ctx.fillText('2 Years Together!', 256, 90);
    
    // Draw second line centered on next line
    ctx.fillText('I LOVE YOU ❤️❤️', 256, 166);
    
    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    
    // Create plane for text
    const textGeometry = new THREE.PlaneGeometry(2, 1);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0.25, 2.8, 0);
    
    // Rotate to lay flat on XZ plane (horizontal)
    textMesh.rotation.x = -Math.PI / 2;
    textMesh.rotation.z = 0.5;
    
    this.scene.add(textMesh);
  }

  createNoteCard() {
    // Create note card
    const cardGroup = new THREE.Group();
    
    // Card base
    const cardGeometry = new THREE.PlaneGeometry(2, 1.5);
    const cardMaterial = new THREE.MeshLambertMaterial({ color: 0xfffacd, side: THREE.DoubleSide });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
    card.position.set(2.5, 1.05, 2.5);
    card.castShadow = true;
    card.receiveShadow = true;
    cardGroup.add(card);
    
    // Add text to card
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 550);
    
    ctx.fillStyle = '#000000';
    ctx.font = '26px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const message = [
      '                 My Sweet Michii, My Path,',
      '',
      '       Two years ago, you came into my life and',
      '       made everything better.I know I haven’t',
      '       always given you the attention you deserve,',
      '       and I’m sorry for that. I promise to do better,',
      '             to show you how much you mean to me every day.',
      '',
      '       Here’s to you, my Michii, to the vast and world',
      '       that gave us life and keeps us guessing.',
      '       Endless affection, my Michii. Forever yours,',
      '',
      'Sairam                                                        ',
      '',
      'Happy 2nd Anniversary!                            ',
      '',
      'With all my love ❤️                                  '
    ];
    
    message.forEach((line, index) => {
      ctx.fillText(line, 256, 20 + (index * 26));
    });
    
    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture });
    const textPlane = new THREE.Mesh(cardGeometry, textMaterial);
    textPlane.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
    textPlane.position.set(2.5, 1.05, 2.5);
    
    cardGroup.add(textPlane);
    this.noteCard = cardGroup;
    this.scene.add(this.noteCard);
  }

  createParticles() {
    // Create floating hearts
    for(let i = 0; i < 100; i++) {
      const heartGeometry = this.createHeartGeometry();
      const heartMaterial = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff69b4 : 0xff1493 });
      const heart = new THREE.Mesh(heartGeometry, heartMaterial);
      
      heart.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 10,
        (Math.random() - 0.5) * 20
      );
      
      heart.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.01,
          (Math.random() - 0.5) * 0.02
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
      
      this.hearts.push(heart);
      this.scene.add(heart);
    }
    
    // Create sparkle particles
    const sparkleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    for(let i = 0; i < 50; i++) {
      const sparkleMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.8) 
      });
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      
      sparkle.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 8,
        (Math.random() - 0.5) * 15
      );
      
      sparkle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          Math.random() * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        life: Math.random() * 100
      };
      
      this.sparkles.push(sparkle);
      this.scene.add(sparkle);
    }
  }

  createHeartGeometry() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
    heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.5, x, y + 10);
    heartShape.bezierCurveTo(x + 4, y + 7.5, x + 6, y + 5.5, x + 6, y + 3.5);
    heartShape.bezierCurveTo(x + 6, y + 3.5, x + 6, y, x, y);
    heartShape.bezierCurveTo(x + 4, y, x + 5, y + 5, x + 5, y + 5);
    
    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.5,
      bevelThickness: 0.5
    });
    
    geometry.scale(0.02, 0.02, 0.02);
    return geometry;
  }

  createUI() {
    // Add styled UI overlay
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      z-index: 1000;
      text-align: center;
      pointer-events: none;
    `;
    
    const title = document.createElement('h1');
    title.textContent = '💕 Happy 2nd Anniversary! 💕';
    title.style.cssText = `
      color: #ff1493;
      font-family: 'Arial', sans-serif;
      font-size: clamp(1.5rem, 5vw, 3rem);
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      margin: 0;
      animation: pulse 2s ease-in-out infinite;
    `;
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Two wonderful years of love and memories';
    subtitle.style.cssText = `
      color: #ff69b4;
      font-family: 'Arial', sans-serif;
      font-size: clamp(0.8rem, 3vw, 1.5rem);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      margin: 10px 0;
    `;
    
    uiContainer.appendChild(title);
    uiContainer.appendChild(subtitle);
    document.body.appendChild(uiContainer);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: linear-gradient(135deg, #ff9a9e, #fecfef);
        font-family: Arial, sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Animate hearts
    this.hearts.forEach(heart => {
      heart.position.add(heart.userData.velocity);
      heart.rotation.z += heart.userData.rotationSpeed;
      
      // Reset position if too far
      if (heart.position.y > 12) {
        heart.position.y = -2;
      }
      if (Math.abs(heart.position.x) > 12) {
        heart.position.x *= -0.8;
      }
      if (Math.abs(heart.position.z) > 12) {
        heart.position.z *= -0.8;
      }
    });
    
    // Animate sparkles
    this.sparkles.forEach(sparkle => {
      sparkle.position.add(sparkle.userData.velocity);
      sparkle.userData.life -= 1;
      
      // Fade out
      sparkle.material.opacity = sparkle.userData.life / 100;
      
      // Reset sparkle
      if (sparkle.userData.life <= 0) {
        sparkle.position.set(
          (Math.random() - 0.5) * 15,
          Math.random() * 8,
          (Math.random() - 0.5) * 15
        );
        sparkle.userData.life = 100;
        sparkle.material.opacity = 1;
      }
    });
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the anniversary card
new AnniversaryCard();