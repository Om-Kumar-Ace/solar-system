/**
 * SolarSystem - A 3D interactive model of our solar system using Three.js
 * Features:
 * - Accurate scaled representations of planets and their orbits
 * - Realistic textures and lighting
 * - Interactive controls and information panels
 * - Adjustable time scale and viewing modes
 */
class SolarSystem {
    /**
     * Constructor - Initializes the solar system model
     */
    constructor() {
        // Scale factor to make the solar system fit in a reasonable 3D space
        this.scaleFactor = 0.0001;
        
        // Time scale for controlling animation speed
        this.timeScale = 0.5;
        
        // Flag to track if initialization is complete
        this.initialized = false;
        
        // Object to store loaded textures
        this.textures = {};
        
        // Counters for tracking texture loading progress
        this.texturesToLoad = 0;
        this.texturesLoaded = 0;
        
        // Get planetary data with scaled values
        this.planetData = this.getPlanetData();
        
        // Initialize properties and data structures
        this.initProperties();
        
        // Show loading screen while assets load
        this.showLoadingScreen();
        
        // Load all textures then initialize the scene
        this.loadAllTextures().then(() => {
            this.hideLoadingScreen();
            this.initScene();
            this.createCelestialBodies();
            this.setupControls();
            this.setupUI();
            this.animate();
            this.initialized = true;
        });
    }

    /**
     * Shows the loading screen with progress bar
     */
    showLoadingScreen() {
        this.loadingElement = document.getElementById('loading');
        this.loadingElement.style.display = 'flex';
    }

    /**
     * Hides the loading screen with a fade-out animation
     */
    hideLoadingScreen() {
        const loadingElement = document.getElementById('loading');
        gsap.to(loadingElement, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loadingElement.style.display = 'none';
            }
        });
    }

    /**
     * Updates the loading progress bar and text
     */
    updateLoadingProgress() {
        this.texturesLoaded++;
        const percent = Math.floor((this.texturesLoaded / this.texturesToLoad) * 100);
        document.getElementById('loading-text').textContent = `Loading textures... ${percent}%`;
        document.getElementById('progress-fill').style.width = `${percent}%`;
    }

    /**
     * Returns an array of planet data with scaled values
     * @returns {Array} Array of planet objects with properties
     */
    getPlanetData() {
        return [
            // Sun data
            {
                name: "Sun",
                radius: 696340 * this.scaleFactor,
                distance: 0, // Sun is at center
                rotationPeriod: 27 * 24, // 27 days in hours
                texture: 'sun',
                textureUrl: 'textures/sun.jpeg',
                emissive: 0xffff00, // Yellow glow
                emissiveIntensity: 1,
                info: "The Sun contains 99.86% of the mass in the Solar System. It's a nearly perfect sphere of hot plasma."
            },
            // Mercury data
            {
                name: "Mercury",
                radius: 243900.7 * this.scaleFactor,
                distance: 57.9 * this.scaleFactor * 100000, // Scaled distance from Sun
                orbitalPeriod: 88, // Earth days
                rotationPeriod: 58.6, // Earth days
                texture: 'mercury',
                textureUrl: 'textures/mercury.jpg',
                info: "Mercury is the smallest planet and has the most extreme temperature variations (-173°C to 427°C)."
            },
            // Venus data
            {
                name: "Venus",
                radius: 605100.8 * this.scaleFactor,
                distance: 108.2 * this.scaleFactor * 100000,
                orbitalPeriod: 224.7,
                rotationPeriod: 243, // Retrograde rotation
                texture: 'venus',
                textureUrl: 'textures/venus.jpg',
                info: "Venus rotates backwards and has a day longer than its year. Surface temperature is about 462°C."
            },
            // Earth data (with moon)
            {
                name: "Earth",
                radius: 637100 * this.scaleFactor,
                distance: 149.6 * this.scaleFactor * 100000,
                orbitalPeriod: 365.25,
                rotationPeriod: 0.997, // 23.93 hours
                texture: 'earth',
                textureUrl: 'textures/earth.jpg',
                normalMapUrl: 'textures/earth_normal.jpg', // For surface details
                hasMoon: true,
                moonRadius: 173700 * this.scaleFactor,
                moonTextureUrl: 'textures/moon.jpg',
                info: "Earth is the only known planet with liquid water on its surface and the only one known to support life."
            },
            // Mars data
            {
                name: "Mars",
                radius: 338900.5 * this.scaleFactor,
                distance: 227.9 * this.scaleFactor * 100000,
                orbitalPeriod: 687,
                rotationPeriod: 1.026, // Slightly longer than Earth day
                texture: 'mars',
                textureUrl: 'textures/mars.jpeg',
                info: "Mars has the largest volcano in the solar system, Olympus Mons, which is about 3 times taller than Mount Everest."
            },
            // Jupiter data (with 4 major moons)
            {
                name: "Jupiter",
                radius: 6991100 * this.scaleFactor,
                distance: 778.5 * this.scaleFactor * 100000,
                orbitalPeriod: 4333,
                rotationPeriod: 0.414, // Fastest rotation
                texture: 'jupiter',
                textureUrl: 'textures/jupiter.jpg',
                hasMoons: true,
                moons: [
                    { name: "Io", radius: 182100 * this.scaleFactor, distance: 421.6 * this.scaleFactor * 10000,
                      textureUrl: 'textures/io.jpeg' },
                    { name: "Europa", radius: 156000 * this.scaleFactor, distance: 670.9 * this.scaleFactor * 10000,
                      textureUrl: 'textures/europa.jpg' },
                    { name: "Ganymede", radius: 263400 * this.scaleFactor, distance: 1070 * this.scaleFactor * 10000,
                      textureUrl: 'textures/ganymede.jpeg' },
                    { name: "Callisto", radius: 241000 * this.scaleFactor, distance: 1882 * this.scaleFactor * 10000,
                      textureUrl: 'textures/callisto.jpg' }
                ],
                info: "Jupiter is the largest planet in our solar system. Its Great Red Spot is a giant storm bigger than Earth."
            },
            // Saturn data (with rings and moon Titan)
            {
                name: "Saturn",
                radius: 5823200 * this.scaleFactor,
                distance: 1433 * this.scaleFactor * 100000,
                orbitalPeriod: 10759,
                rotationPeriod: 0.444,
                texture: 'saturn',
                textureUrl: 'textures/saturn.jpg',
                hasRings: true,
                hasMoons: true,
                moons: [
                    { name: "Titan", radius: 257500 * 1.4 * this.scaleFactor, distance: 1221 * this.scaleFactor * 10000,
                      textureUrl: 'textures/titan.jpg' }
                ],
                info: "Saturn's rings are made mostly of ice particles with a smaller amount of rocky debris and dust."
            },
            // Uranus data
            {
                name: "Uranus",
                radius: 2536200 * this.scaleFactor,
                distance: 2872 * this.scaleFactor * 100000,
                orbitalPeriod: 30687,
                rotationPeriod: 0.718,
                 hasRings: true,
                texture: 'uranus',
                textureUrl: 'textures/uranus.jpg',
                info: "Uranus rotates on its side with an axial tilt of 98 degrees, essentially orbiting the Sun on its side."
            },
            // Neptune data (with moon Triton)
            {
                name: "Neptune",
                radius: 2462200 * this.scaleFactor,
                distance: 4495 * this.scaleFactor * 100000,
                orbitalPeriod: 60190,
                rotationPeriod: 0.671,
                texture: 'neptune',
                textureUrl: 'textures/neptune.jpg',
                hasMoons: true,
                moons: [
                    { name: "Triton", radius: 135300 *1.4 * this.scaleFactor, distance: 354.8 * this.scaleFactor * 10000,
                      textureUrl: 'textures/triton.jpg' }
                ],
                info: "Neptune has the strongest winds in the solar system, reaching speeds of 2,100 km/h."
            }
        ];
    }

    /**
     * Initializes class properties and data structures
     */
    initProperties() {
        this.planets = []; // Array to store planet meshes
        this.moons = []; // Array to store moon meshes
        this.orbits = []; // Array to store orbit paths
        this.animationPaused = false; // Animation state flag
        this.darkMode = true; // UI theme flag
        this.selectedObject = null; // Currently selected planet/moon
        this.controls = null; // OrbitControls instance
        this.orbitHelpers = []; // Helper objects for moon orbits
    }

    /**
     * Loads all textures for planets and moons
     * @returns {Promise} Resolves when all textures are loaded
     */
    async loadAllTextures() {
        const textureLoader = new THREE.TextureLoader();
        const texturePromises = [];
        
        // Count total textures to load for progress tracking
        this.texturesToLoad = this.planetData.length;
        this.planetData.forEach(planet => {
            if (planet.hasMoon) this.texturesToLoad++;
            if (planet.hasMoons) this.texturesToLoad += planet.moons.length;
            if (planet.normalMapUrl) this.texturesToLoad++;
        });
        
        /**
         * Creates a fallback texture when image loading fails
         * @param {number} color - Hex color value
         * @returns {THREE.Texture} Generated canvas texture
         */
        const createFallbackTexture = (color) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024 * 1000;
            canvas.height = 1024 * 1000;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
            gradient.addColorStop(0, `rgb(${(color >> 16) & 0xff}, ${(color >> 8) & 0xff}, ${color & 0xff})`);
            gradient.addColorStop(1, `rgb(${((color >> 16) & 0xff)/2}, ${((color >> 8) & 0xff)/2}, ${(color & 0xff)/2})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 1024);
            return new THREE.CanvasTexture(canvas);
        };
        
        // Load textures for each planet
        for (const planet of this.planetData) {
            // Main planet texture
            texturePromises.push(new Promise(resolve => {
                textureLoader.load(
                    planet.textureUrl,
                    texture => {
                        this.textures[planet.texture] = texture;
                        this.updateLoadingProgress();
                        resolve();
                    },
                    undefined,
                    () => { // On error callback
                        this.textures[planet.texture] = createFallbackTexture(planet.emissive || 0xaaaaaa);
                        this.updateLoadingProgress();
                        resolve();
                    }
                );
            }));
            
            // Normal map if available
            if (planet.normalMapUrl) {
                texturePromises.push(new Promise(resolve => {
                    textureLoader.load(
                        planet.normalMapUrl,
                        texture => {
                            this.textures[`${planet.texture}_normal`] = texture;
                            this.updateLoadingProgress();
                            resolve();
                        },
                        undefined,
                        () => {
                            this.updateLoadingProgress();
                            resolve();
                        }
                    );
                }));
            }
            
            // Moon texture if planet has a moon
            if (planet.hasMoon && planet.moonTextureUrl) {
                texturePromises.push(new Promise(resolve => {
                    textureLoader.load(
                        planet.moonTextureUrl,
                        texture => {
                            this.textures[`${planet.texture}_moon`] = texture;
                            this.updateLoadingProgress();
                            resolve();
                        },
                        undefined,
                        () => {
                            this.textures[`${planet.texture}_moon`] = createFallbackTexture(0xaaaaaa);
                            this.updateLoadingProgress();
                            resolve();
                        }
                    );
                }));
            }
            
            // Moons textures for planets with multiple moons
            if (planet.hasMoons) {
                for (const moon of planet.moons) {
                    texturePromises.push(new Promise(resolve => {
                        textureLoader.load(
                            moon.textureUrl,
                            texture => {
                                this.textures[`${moon.name.toLowerCase()}`] = texture;
                                this.updateLoadingProgress();
                                resolve();
                            },
                            undefined,
                            () => {
                                this.textures[`${moon.name.toLowerCase()}`] = createFallbackTexture(0xaaaaaa);
                                this.updateLoadingProgress();
                                resolve();
                            }
                        );
                    }));
                }
            }
        }
        
        // Wait for all textures to load
        await Promise.all(texturePromises);
    }

    /**
     * Initializes the Three.js scene, camera, and renderer
     */
    initScene() {
        // Create scene with black background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Set up perspective camera
        this.camera = new THREE.PerspectiveCamera(
            60, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            1, // Near clipping plane
            1000000 // Far clipping plane
        );
        this.camera.position.set(0, 30, 100); // Initial camera position
        
        // Create WebGL renderer with antialiasing
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to DOM
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        // Set up lighting
        this.setupLighting();
        
        // Initialize orbit controls for camera navigation
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000000;
        this.controls.target.set(0, 0, 0);
        
        // Create starfield background
        this.createStarfield();
        
        // Set up window resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    /**
     * Sets up lighting for the scene
     */
    setupLighting() {
        // Main sun light source
        this.sunLight = new THREE.PointLight(0xffffff, 3, 2000000, 2);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);
        
        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(0, 1, 1);
        this.scene.add(fillLight);
        
        // Ambient light for overall illumination
        this.scene.add(new THREE.AmbientLight(0x333333));
        
        // Far light to ensure distant objects are visible
        const farLight = new THREE.PointLight(0xffffff, 0.5, 1000000);
        farLight.position.set(0, 0, 0);
        this.scene.add(farLight);
    }

    /**
     * Creates a starfield background for the scene
     */
    createStarfield() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        // Generate random star positions
        const vertices = [];
        for (let i = 0; i < 10000; i++) {
            vertices.push(
                (Math.random() - 0.5) * 200000,
                (Math.random() - 0.5) * 200000,
                (Math.random() - 0.5) * 200000
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    /**
     * Creates all planets and celestial bodies from planet data
     */
    createCelestialBodies() {
        this.planetData.forEach(planetData => {
            this.createPlanet(planetData);
        });
    }

    /**
     * Creates a planet mesh and adds it to the scene
     * @param {Object} planetData - Data object containing planet properties
     */
    createPlanet(planetData) {
        // Create sphere geometry for the planet
        const geometry = new THREE.SphereGeometry(
            planetData.radius, 
            64, // Width segments
            64 // Height segments
        );
        
        // Configure material properties
        const materialProps = {
            map: this.textures[planetData.texture],
            emissive: planetData.emissive || 0x000000,
            emissiveIntensity: planetData.emissiveIntensity || 0,
            shininess: 10
        };
        
        // Add normal map if available
        if (this.textures[`${planetData.texture}_normal`]) {
            materialProps.normalMap = this.textures[`${planetData.texture}_normal`];
            materialProps.normalScale = new THREE.Vector2(0.5, 0.5);
        }
        
        // Create material and mesh
        const material = new THREE.MeshPhongMaterial(materialProps);
        const planet = new THREE.Mesh(geometry, material);
        planet.name = planetData.name;
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Store orbital and rotation data in userData
        planet.userData = {
            info: planetData.info,
            orbitalSpeed: (2 * Math.PI) / (planetData.orbitalPeriod || 1) * this.timeScale,
            rotationSpeed: (2 * Math.PI) / (planetData.rotationPeriod || 1) * this.timeScale,
            orbitAngle: 0,
            originalDistance: planetData.distance
        };
        
        // Position planet and create orbit path if not the Sun
        if (planetData.distance > 0) {
            planet.position.x = planetData.distance;
            this.createOrbit(planetData.distance, planetData.name);
        }
        
        // Add to scene and planets array
        this.scene.add(planet);
        this.planets.push(planet);
        
        // Create moon if planet has one
        if (planetData.hasMoon) {
            this.createMoon(
                planet, 
                planetData.moonRadius, 
                planetData.radius * 5, // Moon distance from planet
                planetData.texture + '_moon',
                `${planetData.name} Moon`
            );
        }
        
        // Create moons if planet has multiple
        if (planetData.hasMoons) {
            planetData.moons.forEach(moonData => {
                this.createMoon(
                    planet,
                    moonData.radius,
                    moonData.distance,
                    moonData.name.toLowerCase(),
                    moonData.name
                );
            });
        }
        
        // Create rings for planets with rings (e.g., Saturn)
        if (planetData.hasRings) {
            this.createRings(planet, planetData.radius);
        }
    }

    /**
     * Creates a moon mesh and adds it to the scene
     * @param {THREE.Mesh} parentPlanet - The planet this moon orbits
     * @param {number} radius - Moon radius
     * @param {number} moonDistance - Distance from parent planet
     * @param {string} textureKey - Key for moon texture
     * @param {string} name - Moon name
     */
    createMoon(parentPlanet, radius, moonDistance, textureKey, name) {
        // Create moon geometry and material
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            map: this.textures[textureKey] || null,
            color: 0xaaaaaa // Fallback color
        });
        
        // Create moon mesh
        const moon = new THREE.Mesh(geometry, material);
        moon.name = name;
        
        // Position moon relative to parent planet
        moon.position.x = parentPlanet.position.x + moonDistance;
        
        // Store orbital and rotation data
        moon.userData = {
            parentPlanet: parentPlanet,
            orbitDistance: moonDistance,
            orbitalSpeed: (2 * Math.PI) / 27.3 * this.timeScale, // ~27.3 day lunar cycle
            rotationSpeed: (2 * Math.PI) / 27.3 * this.timeScale,
            orbitAngle: Math.random() * Math.PI * 2 // Random starting position
        };
        
        // Add to scene and moons array
        this.scene.add(moon);
        this.moons.push(moon);
        
        // Create orbit path for moon
        this.createOrbit(moonDistance, name, parentPlanet);
    }

    /**
     * Creates rings for a planet (e.g., Saturn)
     * @param {THREE.Mesh} planet - Planet to add rings to
     * @param {number} radius - Planet radius for ring sizing
     */
    createRings(planet, radius) {
        // Ring dimensions
        const innerRadius = radius * 1.5;
        const outerRadius = radius * 2.5;
        
        // Create ring geometry
        const ringGeometry = new THREE.RingGeometry(
            innerRadius,
            outerRadius,
            64 // Segments
        );
        
        // Create gradient texture for rings
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(210, 180, 140, 0.8)'); // Sandy color
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)'); // Bright center
        gradient.addColorStop(1, 'rgba(210, 180, 140, 0.8)'); // Sandy color
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create texture from canvas
        const ringTexture = new THREE.CanvasTexture(canvas);
        
        // Create ring material
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            emissive: 0xaaaaaa,
            emissiveIntensity: 0.2
        });
        
        // Create ring mesh and position it
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Rotate to be horizontal
        planet.add(ring); // Add as child of planet
    }

    /**
     * Creates an orbit path for a celestial body
     * @param {number} radius - Orbit radius
     * @param {string} name - Name of the body
     * @param {THREE.Object3D} [parent=null] - Parent object if this is a moon orbit
     */
    createOrbit(radius, name, parent = null) {
        const points = [];
        const segments = 128; // Number of segments in the orbit path
        
        // Calculate points along the orbit path
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                radius * Math.cos(theta),
                0,
                radius * Math.sin(theta)
            ));
        }
        
        // Create geometry and material for orbit path
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        
        // Create orbit line
        const orbit = new THREE.Line(geometry, material);
        orbit.name = `${name} Orbit`;
        
        // Position relative to parent if this is a moon orbit
        if (parent) {
            orbit.position.copy(parent.position);
            orbit.userData = { parent: parent };
            this.orbitHelpers.push(orbit);
        }
        
        // Add to scene and orbits array
        this.scene.add(orbit);
        this.orbits.push(orbit);
    }

    /**
     * Sets up mouse interaction controls
     */
    setupControls() {
        // Initialize raycaster for mouse picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add click handler for planet selection
        window.addEventListener('click', (event) => {
            if (!this.initialized) return;
            
            // Convert mouse coordinates to normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Check for intersections with planets/moons
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                [...this.planets, ...this.moons],
                true
            );
            
            // Handle selection if there's an intersection
            if (intersects.length > 0) {
                this.selectPlanet(intersects[0].object);
            } else {
                // Deselect if clicking empty space
                document.getElementById('info-panel').style.display = 'none';
                if (this.selectedObject) {
                    this.selectedObject.material.emissive.setHex(0x000000);
                    this.selectedObject = null;
                }
            }
        });
    }

    /**
     * Sets up UI event listeners
     */
    setupUI() {
        // Pause/Resume button
        document.getElementById('pause-resume').addEventListener('click', () => {
            this.animationPaused = !this.animationPaused;
            document.getElementById('pause-resume').textContent = 
                this.animationPaused ? '▶ Resume' : '⏸ Pause';
        });
        
        // Reset view button
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetCamera();
        });
        
        // Dark/Light mode toggle
        document.getElementById('toggle-dark').addEventListener('click', () => {
            this.darkMode = !this.darkMode;
            document.body.style.backgroundColor = this.darkMode ? '#000' : '#f0f0f0';
            document.getElementById('toggle-dark').textContent = 
                this.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
            this.scene.background = new THREE.Color(this.darkMode ? 0x00000 : 0xf0f0f0);
            
            // Adjust orbit visibility based on mode
            this.orbits.forEach(orbit => {
                orbit.material.opacity = this.darkMode ? 0.3 : 0.1;
            });
        });
        
        // Speed controls
        document.getElementById('speed-up').addEventListener('click', () => {
            this.timeScale *= 1.5;
            this.updateOrbitalSpeeds();
        });
        
        document.getElementById('slow-down').addEventListener('click', () => {
            this.timeScale /= 1.5;
            this.updateOrbitalSpeeds();
        });
    }

    /**
     * Updates orbital speeds when time scale changes
     */
    updateOrbitalSpeeds() {
        // Update planet orbital and rotation speeds
        this.planets.forEach(planet => {
            if (planet.userData.orbitalSpeed) {
                planet.userData.orbitalSpeed = (2 * Math.PI) / (planet.userData.orbitalPeriod || 1) * this.timeScale;
            }
            if (planet.userData.rotationSpeed) {
                planet.userData.rotationSpeed = (2 * Math.PI) / (planet.userData.rotationPeriod || 1) * this.timeScale;
            }
        });
        
        // Update moon orbital and rotation speeds
        this.moons.forEach(moon => {
            moon.userData.orbitalSpeed = (2 * Math.PI) / 27.3 * this.timeScale;
            moon.userData.rotationSpeed = (2 * Math.PI) / 27.3 * this.timeScale;
        });
    }

    /**
     * Selects a planet/moon and shows its information
     * @param {THREE.Object3D} planet - The planet/moon to select
     */
    selectPlanet(planet) {
        // Deselect current selection
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        
        // Highlight new selection
        planet.material.emissive.setHex(0x333333);
        this.selectedObject = planet;
        
        // Update info panel
        document.getElementById('planet-name').textContent = planet.name;
        document.getElementById('info-content').textContent = planet.userData.info || 
            `${planet.name} - No additional information available`;
        document.getElementById('info-panel').style.display = 'block';
        
        // Focus camera on selected object
        this.focusOnPlanet(planet);
    }

    /**
     * Animates the camera to focus on a selected planet
     * @param {THREE.Object3D} planet - The planet to focus on
     */
    focusOnPlanet(planet) {
        const targetPosition = planet.position.clone();
        const distance = planet.geometry.parameters.radius * 8; // Camera distance based on planet size
        
        // Calculate camera position (slightly above and behind planet)
        const cameraPosition = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + distance * 0.3,
            targetPosition.z + distance
        );
        
        // Animate camera position
        gsap.to(this.camera.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => this.controls.update()
        });
        
        // Animate camera target
        gsap.to(this.controls.target, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }

    /**
     * Resets camera to default position
     */
    resetCamera() {
        // Reset camera position and target
        this.camera.position.set(0, 30, 100);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Clear selection
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
            this.selectedObject = null;
        }
        
        // Hide info panel
        document.getElementById('info-panel').style.display = 'none';
    }

    /**
     * Handles window resize events
     */
    onWindowResize() {
        // Update camera and renderer dimensions
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Only update positions if animation isn't paused
        if (!this.animationPaused) {
            // Update planet positions and rotations
            this.planets.forEach(planet => {
                if (planet.userData.orbitalSpeed) {
                    // Calculate new position based on orbital angle
                    planet.position.x = planet.userData.originalDistance * Math.cos(planet.userData.orbitAngle);
                    planet.position.z = planet.userData.originalDistance * Math.sin(planet.userData.orbitAngle);
                    planet.userData.orbitAngle += planet.userData.orbitalSpeed * 0.01;
                }
                
                // Rotate planet
                planet.rotation.y += planet.userData.rotationSpeed * 0.01;
            });
            
            // Update moon positions and rotations
            this.moons.forEach(moon => {
                const parent = moon.userData.parentPlanet;
                
                // Calculate new position relative to parent planet
                moon.position.x = parent.position.x + moon.userData.orbitDistance * Math.cos(moon.userData.orbitAngle);
                moon.position.z = parent.position.z + moon.userData.orbitDistance * Math.sin(moon.userData.orbitAngle);
                moon.userData.orbitAngle += moon.userData.orbitalSpeed * 0.01;
                
                // Rotate moon
                moon.rotation.y += moon.userData.rotationSpeed * 0.01;
            });
            
            // Update moon orbit positions to follow their parent planets
            this.orbitHelpers.forEach(orbit => {
                const parent = orbit.userData.parent;
                if (parent) {
                    orbit.position.copy(parent.position);
                }
            });
        }
        
        // Update controls and render scene
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize SolarSystem when window loads
window.addEventListener('load', () => {
    new SolarSystem();
});