class SolarSystem {
    constructor() {
        this.scaleFactor = 0.0001;
        this.timeScale = 0.5;
        this.initialized = false;
        this.textures = {};
        this.texturesToLoad = 0;
        this.texturesLoaded = 0;
        this.planetData = this.getPlanetData();
        this.initProperties();
        this.showLoadingScreen();
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

    showLoadingScreen() {
        this.loadingElement = document.getElementById('loading');
        this.loadingElement.style.display = 'flex';
    }

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

    updateLoadingProgress() {
        this.texturesLoaded++;
        const percent = Math.floor((this.texturesLoaded / this.texturesToLoad) * 100);
        document.getElementById('loading-text').textContent = `Loading textures... ${percent}%`;
        document.getElementById('progress-fill').style.width = `${percent}%`;
    }

    getPlanetData() {
        return [
            {
                name: "Sun",
                radius: 696340 * this.scaleFactor,
                distance: 0,
                rotationPeriod: 27 * 24,
                texture: 'sun',
                textureUrl: 'textures/sun.jpeg',
                emissive: 0xffff00,
                emissiveIntensity: 1,
                info: "The Sun contains 99.86% of the mass in the Solar System. It's a nearly perfect sphere of hot plasma."
            },
            {
                name: "Mercury",
                radius: 243900.7 * this.scaleFactor,
                distance: 57.9 * this.scaleFactor * 100000,
                orbitalPeriod: 88,
                rotationPeriod: 58.6,
                texture: 'mercury',
                textureUrl: 'textures/mercury.jpg',
                info: "Mercury is the smallest planet and has the most extreme temperature variations (-173°C to 427°C)."
            },
            {
                name: "Venus",
                radius: 605100.8 * this.scaleFactor,
                distance: 108.2 * this.scaleFactor * 100000,
                orbitalPeriod: 224.7,
                rotationPeriod: 243,
                texture: 'venus',
                textureUrl: 'textures/venus.jpg',
                info: "Venus rotates backwards and has a day longer than its year. Surface temperature is about 462°C."
            },
            {
                name: "Earth",
                radius: 637100 * this.scaleFactor,
                distance: 149.6 * this.scaleFactor * 100000,
                orbitalPeriod: 365.25,
                rotationPeriod: 0.997,
                texture: 'earth',
                textureUrl: 'textures/earth.jpg',
                normalMapUrl: 'textures/earth_normal.jpg',
                hasMoon: true,
                moonRadius: 173700 * this.scaleFactor,
                moonTextureUrl: 'textures/moon.jpg',
                info: "Earth is the only known planet with liquid water on its surface and the only one known to support life."
            },
            {
                name: "Mars",
                radius: 338900.5 * this.scaleFactor,
                distance: 227.9 * this.scaleFactor * 100000,
                orbitalPeriod: 687,
                rotationPeriod: 1.026,
                texture: 'mars',
                textureUrl: 'textures/mars.jpeg',
                info: "Mars has the largest volcano in the solar system, Olympus Mons, which is about 3 times taller than Mount Everest."
            },
            {
                name: "Jupiter",
                radius: 6991100 * this.scaleFactor,
                distance: 778.5 * this.scaleFactor * 100000,
                orbitalPeriod: 4333,
                rotationPeriod: 0.414,
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
            {
                name: "Uranus",
                radius: 2536200 * this.scaleFactor,
                distance: 2872 * this.scaleFactor * 100000,
                orbitalPeriod: 30687,
                rotationPeriod: 0.718,
                texture: 'uranus',
                textureUrl: 'textures/uranus.jpg',
                info: "Uranus rotates on its side with an axial tilt of 98 degrees, essentially orbiting the Sun on its side."
            },
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

    initProperties() {
        this.planets = [];
        this.moons = [];
        this.orbits = [];
        this.animationPaused = false;
        this.darkMode = true;
        this.selectedObject = null;
        this.controls = null;
        this.orbitHelpers = [];
    }

    async loadAllTextures() {
        const textureLoader = new THREE.TextureLoader();
        const texturePromises = [];
        
        this.texturesToLoad = this.planetData.length;
        this.planetData.forEach(planet => {
            if (planet.hasMoon) this.texturesToLoad++;
            if (planet.hasMoons) this.texturesToLoad += planet.moons.length;
            if (planet.normalMapUrl) this.texturesToLoad++;
        });
        
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
        
        for (const planet of this.planetData) {
            texturePromises.push(new Promise(resolve => {
                textureLoader.load(
                    planet.textureUrl,
                    texture => {
                        this.textures[planet.texture] = texture;
                        this.updateLoadingProgress();
                        resolve();
                    },
                    undefined,
                    () => {
                        this.textures[planet.texture] = createFallbackTexture(planet.emissive || 0xaaaaaa);
                        this.updateLoadingProgress();
                        resolve();
                    }
                );
            }));
            
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
        
        await Promise.all(texturePromises);
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            1, 
            1000000
        );
        this.camera.position.set(0, 30, 100);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        this.setupLighting();
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000000;
        this.controls.target.set(0, 0, 0);
        
        this.createStarfield();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupLighting() {
        this.sunLight = new THREE.PointLight(0xffffff, 3, 2000000, 2);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(0, 1, 1);
        this.scene.add(fillLight);
        
        this.scene.add(new THREE.AmbientLight(0x333333));
        
        const farLight = new THREE.PointLight(0xffffff, 0.5, 1000000);
        farLight.position.set(0, 0, 0);
        this.scene.add(farLight);
    }

    createStarfield() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
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

    createCelestialBodies() {
        this.planetData.forEach(planetData => {
            this.createPlanet(planetData);
        });
    }

    createPlanet(planetData) {
        const geometry = new THREE.SphereGeometry(
            planetData.radius, 
            64, 
            64
        );
        
        const materialProps = {
            map: this.textures[planetData.texture],
            emissive: planetData.emissive || 0x000000,
            emissiveIntensity: planetData.emissiveIntensity || 0,
            shininess: 10
        };
        
        if (this.textures[`${planetData.texture}_normal`]) {
            materialProps.normalMap = this.textures[`${planetData.texture}_normal`];
            materialProps.normalScale = new THREE.Vector2(0.5, 0.5);
        }
        
        const material = new THREE.MeshPhongMaterial(materialProps);
        
        const planet = new THREE.Mesh(geometry, material);
        planet.name = planetData.name;
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        planet.userData = {
            info: planetData.info,
            orbitalSpeed: (2 * Math.PI) / (planetData.orbitalPeriod || 1) * this.timeScale,
            rotationSpeed: (2 * Math.PI) / (planetData.rotationPeriod || 1) * this.timeScale,
            orbitAngle: 0,
            originalDistance: planetData.distance
        };
        
        if (planetData.distance > 0) {
            planet.position.x = planetData.distance;
            this.createOrbit(planetData.distance, planetData.name);
        }
        
        this.scene.add(planet);
        this.planets.push(planet);
        
        if (planetData.hasMoon) {
            this.createMoon(
                planet, 
                planetData.moonRadius, 
                planetData.radius * 5,
                planetData.texture + '_moon',
                `${planetData.name} Moon`
            );
        }
        
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
        
        if (planetData.hasRings) {
            this.createRings(planet, planetData.radius);
        }
    }

    createMoon(parentPlanet, radius, moonDistance, textureKey, name) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            map: this.textures[textureKey] || null,
            color: 0xaaaaaa
        });
        
        const moon = new THREE.Mesh(geometry, material);
        moon.name = name;
        
        moon.position.x = parentPlanet.position.x + moonDistance;
        
        moon.userData = {
            parentPlanet: parentPlanet,
            orbitDistance: moonDistance,
            orbitalSpeed: (2 * Math.PI) / 27.3 * this.timeScale,
            rotationSpeed: (2 * Math.PI) / 27.3 * this.timeScale,
            orbitAngle: Math.random() * Math.PI * 2
        };
        
        this.scene.add(moon);
        this.moons.push(moon);
        
        this.createOrbit(moonDistance, name, parentPlanet);
    }

    createRings(planet, radius) {
        const innerRadius = radius * 1.5;
        const outerRadius = radius * 2.5;
        const ringGeometry = new THREE.RingGeometry(
            innerRadius,
            outerRadius,
            64
        );
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(210, 180, 140, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(210, 180, 140, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const ringTexture = new THREE.CanvasTexture(canvas);
        
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            emissive: 0xaaaaaa,
            emissiveIntensity: 0.2
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    createOrbit(radius, name, parent = null) {
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                radius * Math.cos(theta),
                0,
                radius * Math.sin(theta)
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.name = `${name} Orbit`;
        
        if (parent) {
            orbit.position.copy(parent.position);
            orbit.userData = { parent: parent };
            this.orbitHelpers.push(orbit);
        }
        
        this.scene.add(orbit);
        this.orbits.push(orbit);
    }

    setupControls() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        window.addEventListener('click', (event) => {
            if (!this.initialized) return;
            
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                [...this.planets, ...this.moons],
                true
            );
            
            if (intersects.length > 0) {
                this.selectPlanet(intersects[0].object);
            } else {
                document.getElementById('info-panel').style.display = 'none';
                if (this.selectedObject) {
                    this.selectedObject.material.emissive.setHex(0x000000);
                    this.selectedObject = null;
                }
            }
        });
    }

    setupUI() {
        document.getElementById('pause-resume').addEventListener('click', () => {
            this.animationPaused = !this.animationPaused;
            document.getElementById('pause-resume').textContent = 
                this.animationPaused ? '▶ Resume' : '⏸ Pause';
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetCamera();
        });
        
        document.getElementById('toggle-dark').addEventListener('click', () => {
            this.darkMode = !this.darkMode;
            document.body.style.backgroundColor = this.darkMode ? '#000' : '#f0f0f0';
            document.getElementById('toggle-dark').textContent = 
                this.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
            this.scene.background = new THREE.Color(this.darkMode ? 0x00000 : 0xf0f0f0);
            
            this.orbits.forEach(orbit => {
                orbit.material.opacity = this.darkMode ? 0.3 : 0.1;
            });
        });
        
        document.getElementById('speed-up').addEventListener('click', () => {
            this.timeScale *= 1.5;
            this.updateOrbitalSpeeds();
        });
        
        document.getElementById('slow-down').addEventListener('click', () => {
            this.timeScale /= 1.5;
            this.updateOrbitalSpeeds();
        });
    }

    updateOrbitalSpeeds() {
        this.planets.forEach(planet => {
            if (planet.userData.orbitalSpeed) {
                planet.userData.orbitalSpeed = (2 * Math.PI) / (planet.userData.orbitalPeriod || 1) * this.timeScale;
            }
            if (planet.userData.rotationSpeed) {
                planet.userData.rotationSpeed = (2 * Math.PI) / (planet.userData.rotationPeriod || 1) * this.timeScale;
            }
        });
        
        this.moons.forEach(moon => {
            moon.userData.orbitalSpeed = (2 * Math.PI) / 27.3 * this.timeScale;
            moon.userData.rotationSpeed = (2 * Math.PI) / 27.3 * this.timeScale;
        });
    }

    selectPlanet(planet) {
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        
        planet.material.emissive.setHex(0x333333);
        this.selectedObject = planet;
        
        document.getElementById('planet-name').textContent = planet.name;
        document.getElementById('info-content').textContent = planet.userData.info || 
            `${planet.name} - No additional information available`;
        document.getElementById('info-panel').style.display = 'block';
        
        this.focusOnPlanet(planet);
    }

    focusOnPlanet(planet) {
        const targetPosition = planet.position.clone();
        const distance = planet.geometry.parameters.radius * 8;
        
        const cameraPosition = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + distance * 0.3,
            targetPosition.z + distance
        );
        
        gsap.to(this.camera.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => this.controls.update()
        });
        
        gsap.to(this.controls.target, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }

    resetCamera() {
        this.camera.position.set(0, 30, 100);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
            this.selectedObject = null;
        }
        
        document.getElementById('info-panel').style.display = 'none';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.animationPaused) {
            this.planets.forEach(planet => {
                if (planet.userData.orbitalSpeed) {
                    planet.position.x = planet.userData.originalDistance * Math.cos(planet.userData.orbitAngle);
                    planet.position.z = planet.userData.originalDistance * Math.sin(planet.userData.orbitAngle);
                    planet.userData.orbitAngle += planet.userData.orbitalSpeed * 0.01;
                }
                
                planet.rotation.y += planet.userData.rotationSpeed * 0.01;
            });
            
            this.moons.forEach(moon => {
                const parent = moon.userData.parentPlanet;
                
                moon.position.x = parent.position.x + moon.userData.orbitDistance * Math.cos(moon.userData.orbitAngle);
                moon.position.z = parent.position.z + moon.userData.orbitDistance * Math.sin(moon.userData.orbitAngle);
                moon.userData.orbitAngle += moon.userData.orbitalSpeed * 0.01;
                
                moon.rotation.y += moon.userData.rotationSpeed * 0.01;
            });
            
            this.orbitHelpers.forEach(orbit => {
                const parent = orbit.userData.parent;
                if (parent) {
                    orbit.position.copy(parent.position);
                }
            });
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new SolarSystem();
});