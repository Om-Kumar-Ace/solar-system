// Main Three.js application
class SolarSystem {
    constructor() {
        // Initialize properties
        this.planets = [];
        this.animationPaused = false;
        this.darkMode = false;
        this.planetData = [
            { name: 'Sun', radius: 10, color: 0xffff00, orbitRadius: 0, speed: 0, rotationSpeed: 0.01 },
            { name: 'Mercury', radius: 0.4, color: 0xa9a9a9, orbitRadius: 15, speed: 0.04, rotationSpeed: 0.004 },
            { name: 'Venus', radius: 0.9, color: 0xe6c229, orbitRadius: 20, speed: 0.015, rotationSpeed: 0.002 },
            { name: 'Earth', radius: 1, color: 0x3498db, orbitRadius: 28, speed: 0.01, rotationSpeed: 0.02 },
            { name: 'Mars', radius: 0.5, color: 0xe67e22, orbitRadius: 35, speed: 0.008, rotationSpeed: 0.018 },
            { name: 'Jupiter', radius: 2.5, color: 0xf1c40f, orbitRadius: 45, speed: 0.002, rotationSpeed: 0.04 },
            { name: 'Saturn', radius: 2, color: 0xf39c12, orbitRadius: 55, speed: 0.0009, rotationSpeed: 0.038, hasRing: true },
            { name: 'Uranus', radius: 1.5, color: 0x1abc9c, orbitRadius: 65, speed: 0.0004, rotationSpeed: 0.03 },
            { name: 'Neptune', radius: 1.4, color: 0x3498db, orbitRadius: 75, speed: 0.0001, rotationSpeed: 0.032 }
        ];

        // Initialize Three.js scene
        this.initScene();
        this.createPlanets();
        this.createStars();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light (sun light)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createPlanets() {
        this.planetData.forEach((data, index) => {
            // Create planet geometry and material
            const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: data.color,
                shininess: 10
            });
            
            // Create planet mesh
            const planet = new THREE.Mesh(geometry, material);
            planet.name = data.name;
            
            // Position planets in orbit (except the Sun)
            if (index !== 0) {
                const angle = Math.random() * Math.PI * 2;
                planet.position.x = data.orbitRadius * Math.cos(angle);
                planet.position.z = data.orbitRadius * Math.sin(angle);
            }
            
            // Add planet to scene and planets array
            this.scene.add(planet);
            this.planets.push({
                mesh: planet,
                angle: index === 0 ? 0 : Math.random() * Math.PI * 2,
                orbitRadius: data.orbitRadius,
                speed: data.speed,
                rotationSpeed: data.rotationSpeed,
                originalSpeed: data.speed
            });
            
            // Create orbit path
            if (index !== 0) {
                const orbitGeometry = new THREE.BufferGeometry();
                const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 });
                
                const points = [];
                const segments = 64;
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    points.push(new THREE.Vector3(
                        data.orbitRadius * Math.cos(theta),
                        0,
                        data.orbitRadius * Math.sin(theta)
                    );
                }
                
                orbitGeometry.setFromPoints(points);
                const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
                this.scene.add(orbit);
            }
            
            // Add rings for Saturn
            if (data.hasRing) {
                const ringGeometry = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2, 32);
                const ringMaterial = new THREE.MeshPhongMaterial({
                    color: 0xdddddd,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                planet.add(ring);
            }
            
            // Create speed control for each planet (except the Sun)
            if (index !== 0) {
                this.createSpeedControl(data.name, index, data.speed);
            }
        });
    }

    createStars() {
        // Create starfield background
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true
        });
        
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createSpeedControl(planetName, index, defaultSpeed) {
        const controlsContainer = document.getElementById('speed-controls');
        const controlDiv = document.createElement('div');
        controlDiv.className = 'speed-control';
        
        const label = document.createElement('label');
        label.textContent = `${planetName} Speed: `;
        label.htmlFor = `speed-${index}`;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.id = `speed-${index}`;
        input.min = '0';
        input.max = '0.1';
        input.step = '0.001';
        input.value = defaultSpeed;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = defaultSpeed.toFixed(3);
        valueDisplay.className = 'speed-value';
        
        input.addEventListener('input', (e) => {
            const newSpeed = parseFloat(e.target.value);
            this.planets[index].speed = newSpeed;
            valueDisplay.textContent = newSpeed.toFixed(3);
        });
        
        controlDiv.appendChild(label);
        controlDiv.appendChild(input);
        controlDiv.appendChild(valueDisplay);
        controlsContainer.appendChild(controlDiv);
    }

    setupControls() {
        // Pause/Resume button
        document.getElementById('pause-resume').addEventListener('click', () => {
            this.animationPaused = !this.animationPaused;
            document.getElementById('pause-resume').textContent = 
                this.animationPaused ? 'Resume' : 'Pause';
        });
        
        // Reset speeds button
        document.getElementById('reset-speeds').addEventListener('click', () => {
            this.planets.forEach((planet, index) => {
                if (index !== 0) { // Skip the Sun
                    planet.speed = planet.originalSpeed;
                    const input = document.getElementById(`speed-${index}`);
                    input.value = planet.originalSpeed;
                    input.dispatchEvent(new Event('input'));
                }
            });
        });
        
        // Dark mode toggle
        document.getElementById('toggle-dark').addEventListener('click', () => {
            this.darkMode = !this.darkMode;
            document.body.classList.toggle('dark-mode', this.darkMode);
            document.getElementById('toggle-dark').textContent = 
                this.darkMode ? 'Light Mode' : 'Dark Mode';
        });
    }

    setupEventListeners() {
        // Raycaster for planet hover detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPlanet = null;
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        document.body.appendChild(this.tooltip);
        
        window.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update the raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects(
                this.planets.map(p => p.mesh).filter(p => p.name !== 'Sun')
            );
            
            if (intersects.length > 0) {
                const planet = intersects[0].object;
                if (this.hoveredPlanet !== planet) {
                    this.hoveredPlanet = planet;
                    this.tooltip.textContent = planet.name;
                    this.tooltip.style.display = 'block';
                }
                this.tooltip.style.left = `${event.clientX + 10}px`;
                this.tooltip.style.top = `${event.clientY + 10}px`;
            } else {
                if (this.hoveredPlanet !== null) {
                    this.hoveredPlanet = null;
                    this.tooltip.style.display = 'none';
                }
            }
        });
    }

    animate() {
        if (!this.animationPaused) {
            // Update planet positions and rotations
            this.planets.forEach((planet, index) => {
                if (index !== 0) { // Skip the Sun
                    // Orbit animation
                    planet.angle += planet.speed;
                    planet.mesh.position.x = planet.orbitRadius * Math.cos(planet.angle);
                    planet.mesh.position.z = planet.orbitRadius * Math.sin(planet.angle);
                    
                    // Rotation animation
                    planet.mesh.rotation.y += planet.rotationSpeed;
                } else {
                    // Sun rotation
                    planet.mesh.rotation.y += planet.rotationSpeed;
                }
            });
            
            // Update orbit controls
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the solar system when the page loads
window.addEventListener('load', () => {
    new SolarSystem();
});