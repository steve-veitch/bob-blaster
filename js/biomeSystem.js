/**
 * Biome System - BPSS v21
 * Multiple biome types with different visuals and characteristics
 */

class BiomeSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.currentBiome = 'forest';
        this.biomes = {
            forest: {
                name: 'Forest',
                skyColor: 0x87ceeb,
                fogColor: 0x87ceeb,
                fogDensity: 0.001,
                ambientLight: 0.6,
                directionalLight: 0.8,
                terrainColors: {
                    low: { r: 0.2, g: 0.5, b: 0.2 },
                    mid: { r: 0.3, g: 0.6, b: 0.2 },
                    high: { r: 0.4, g: 0.5, b: 0.3 }
                }
            },
            desert: {
                name: 'Desert',
                skyColor: 0xffd700,
                fogColor: 0xffd700,
                fogDensity: 0.0005,
                ambientLight: 0.8,
                directionalLight: 1.0,
                terrainColors: {
                    low: { r: 0.9, g: 0.8, b: 0.5 },
                    mid: { r: 0.95, g: 0.85, b: 0.6 },
                    high: { r: 0.85, g: 0.75, b: 0.5 }
                }
            },
            tundra: {
                name: 'Tundra',
                skyColor: 0xb0c4de,
                fogColor: 0xb0c4de,
                fogDensity: 0.002,
                ambientLight: 0.7,
                directionalLight: 0.6,
                terrainColors: {
                    low: { r: 0.8, g: 0.85, b: 0.9 },
                    mid: { r: 0.85, g: 0.9, b: 0.95 },
                    high: { r: 0.9, g: 0.95, b: 1.0 }
                }
            },
            volcanic: {
                name: 'Volcanic',
                skyColor: 0x8b0000,
                fogColor: 0x8b0000,
                fogDensity: 0.003,
                ambientLight: 0.5,
                directionalLight: 0.7,
                terrainColors: {
                    low: { r: 0.3, g: 0.2, b: 0.2 },
                    mid: { r: 0.4, g: 0.2, b: 0.1 },
                    high: { r: 0.5, g: 0.3, b: 0.2 }
                }
            },
            swamp: {
                name: 'Swamp',
                skyColor: 0x556b2f,
                fogColor: 0x556b2f,
                fogDensity: 0.004,
                ambientLight: 0.4,
                directionalLight: 0.5,
                terrainColors: {
                    low: { r: 0.2, g: 0.3, b: 0.2 },
                    mid: { r: 0.3, g: 0.4, b: 0.2 },
                    high: { r: 0.4, g: 0.5, b: 0.3 }
                }
            },
            urban: {
                name: 'Urban',
                skyColor: 0x708090,
                fogColor: 0x708090,
                fogDensity: 0.0015,
                ambientLight: 0.6,
                directionalLight: 0.7,
                terrainColors: {
                    low: { r: 0.3, g: 0.3, b: 0.3 },
                    mid: { r: 0.4, g: 0.4, b: 0.4 },
                    high: { r: 0.5, g: 0.5, b: 0.5 }
                }
            }
        };
        console.log('biomeSystem initialized for v21');
    }
    
    init(terrainSystem) {
        this.terrainSystem = terrainSystem;
        this.initialized = true;
        this.setBiome('forest');
        console.log('Biome system ready');
    }
    
    setBiome(biomeName) {
        if (!this.biomes[biomeName]) {
            console.warn(`Biome ${biomeName} not found, using forest`);
            biomeName = 'forest';
        }
        
        this.currentBiome = biomeName;
        const biome = this.biomes[biomeName];
        
        // Update scene lighting and atmosphere
        this.updateSceneAtmosphere(biome);
        
        // Update terrain colors if terrain exists
        if (this.terrainSystem && this.terrainSystem.terrain) {
            this.updateTerrainColors(biome);
        }
        
        // Add biome-specific decorations
        this.addBiomeDecorations(biomeName);
        
        console.log(`Biome changed to: ${biome.name}`);
    }
    
    updateSceneAtmosphere(biome) {
        // Update sky and fog
        this.scene.background = new THREE.Color(biome.skyColor);
        this.scene.fog = new THREE.FogExp2(biome.fogColor, biome.fogDensity);
        
        // Update lighting
        const ambientLight = this.scene.children.find(obj => obj.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.intensity = biome.ambientLight;
        }
        
        const directionalLight = this.scene.children.find(obj => obj.type === 'DirectionalLight');
        if (directionalLight) {
            directionalLight.intensity = biome.directionalLight;
        }
    }
    
    updateTerrainColors(biome) {
        const terrain = this.terrainSystem.terrain;
        if (!terrain) return;
        
        const geometry = terrain.geometry;
        const vertices = geometry.attributes.position.array;
        const colors = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 2];
            const normalizedHeight = height / this.terrainSystem.maxHeight;
            
            let r, g, b;
            if (normalizedHeight < 0.3) {
                const c = biome.terrainColors.low;
                r = c.r;
                g = c.g;
                b = c.b;
            } else if (normalizedHeight < 0.6) {
                const c = biome.terrainColors.mid;
                r = c.r;
                g = c.g;
                b = c.b;
            } else {
                const c = biome.terrainColors.high;
                r = c.r;
                g = c.g;
                b = c.b;
            }
            
            // Add slight variation
            r += (Math.random() - 0.5) * 0.1;
            g += (Math.random() - 0.5) * 0.1;
            b += (Math.random() - 0.5) * 0.1;
            
            colors.push(r, g, b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.attributes.color.needsUpdate = true;
    }
    
    addBiomeDecorations(biomeName) {
        // Remove old decorations
        this.clearDecorations();
        
        switch(biomeName) {
            case 'forest':
                this.addTrees(20);
                break;
            case 'desert':
                this.addCacti(15);
                this.addRocks(10);
                break;
            case 'tundra':
                this.addIceFormations(12);
                break;
            case 'volcanic':
                this.addLavaRocks(15);
                this.addVolcanicVents(5);
                break;
            case 'swamp':
                this.addDeadTrees(15);
                this.addMushrooms(20);
                break;
            case 'urban':
                this.addBuildings(10);
                this.addStreetLights(15);
                this.addDebris(20);
                break;
        }
    }
    
    addTrees(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Tree trunk - scaled down
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(position.x, position.y + 1.5, position.z);
            trunk.castShadow = true;
            trunk.userData.decoration = true;
            this.scene.add(trunk);
            
            // Tree foliage - scaled down
            const foliageGeometry = new THREE.ConeGeometry(1.5, 2.5, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(position.x, position.y + 3.5, position.z);
            foliage.castShadow = true;
            foliage.userData.decoration = true;
            this.scene.add(foliage);
        }
    }
    
    addCacti(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.CylinderGeometry(0.3, 0.35, 2, 8);
            const material = new THREE.MeshStandardMaterial({ color: 0x2F4F2F });
            const cactus = new THREE.Mesh(geometry, material);
            cactus.position.set(position.x, position.y + 1, position.z);
            cactus.castShadow = true;
            cactus.userData.decoration = true;
            this.scene.add(cactus);
        }
    }
    
    addRocks(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.DodecahedronGeometry(1, 0);
            const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const rock = new THREE.Mesh(geometry, material);
            rock.position.set(position.x, position.y + 0.5, position.z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            rock.userData.decoration = true;
            this.scene.add(rock);
        }
    }
    
    addIceFormations(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.ConeGeometry(0.75, 2, 6);
            const material = new THREE.MeshStandardMaterial({
                color: 0xE0FFFF,
                transparent: true,
                opacity: 0.8,
                roughness: 0.1,
                metalness: 0.5
            });
            const ice = new THREE.Mesh(geometry, material);
            ice.position.set(position.x, position.y + 1, position.z);
            ice.castShadow = true;
            ice.userData.decoration = true;
            this.scene.add(ice);
        }
    }
    
    addLavaRocks(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.DodecahedronGeometry(0.75, 0);
            const material = new THREE.MeshStandardMaterial({
                color: 0x8B0000,
                emissive: 0xFF4500,
                emissiveIntensity: 0.3
            });
            const rock = new THREE.Mesh(geometry, material);
            rock.position.set(position.x, position.y + 0.5, position.z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            rock.userData.decoration = true;
            this.scene.add(rock);
        }
    }
    
    addVolcanicVents(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.CylinderGeometry(1, 1.5, 0.5, 16);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0xFF4500,
                emissive: 0xFF4500,
                emissiveIntensity: 0.8
            });
            const vent = new THREE.Mesh(geometry, material);
            vent.position.set(position.x, position.y + 0.25, position.z);
            vent.userData.decoration = true;
            this.scene.add(vent);
            
            // Add light
            const light = new THREE.PointLight(0xFF4500, 2, 10);
            light.position.copy(vent.position);
            light.position.y += 1;
            light.userData.decoration = true;
            this.scene.add(light);
        }
    }
    
    addDeadTrees(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6);
            const material = new THREE.MeshStandardMaterial({ color: 0x3D3D3D });
            const tree = new THREE.Mesh(geometry, material);
            tree.position.set(position.x, position.y + 1.25, position.z);
            tree.rotation.z = (Math.random() - 0.5) * 0.3;
            tree.castShadow = true;
            tree.userData.decoration = true;
            this.scene.add(tree);
        }
    }
    
    addMushrooms(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Stem - scaled down
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const stemMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5DC });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(position.x, position.y + 0.25, position.z);
            stem.userData.decoration = true;
            this.scene.add(stem);
            
            // Cap - scaled down
            const capGeometry = new THREE.SphereGeometry(0.25, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.set(position.x, position.y + 0.5, position.z);
            cap.userData.decoration = true;
            this.scene.add(cap);
        }
    }
    
    getRandomPosition() {
        const range = 80;
        const x = (Math.random() - 0.5) * range;
        const z = (Math.random() - 0.5) * range;
        const y = this.terrainSystem ? this.terrainSystem.getHeightAt(x, z) : 0;
        
        return { x, y, z };
    }
    
    clearDecorations() {
        const decorations = this.scene.children.filter(obj => obj.userData.decoration);
        decorations.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }
    
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Animate volcanic vents
        if (this.currentBiome === 'volcanic') {
            const vents = this.scene.children.filter(obj => 
                obj.userData.decoration && obj.type === 'PointLight'
            );
            vents.forEach(light => {
                light.intensity = 1.5 + Math.sin(Date.now() * 0.005) * 0.5;
            });
        }
    }
    
    getBiomeList() {
        return Object.keys(this.biomes);
    }
    
    getCurrentBiome() {
        return this.biomes[this.currentBiome];
    }
    
    reset() {
        this.clearDecorations();
        this.currentBiome = 'forest';
        this.initialized = false;
    }
}

// Made with Bob

    
    addBuildings(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Building base
            const width = 3 + Math.random() * 2;
            const height = 2 + Math.random() * 2;
            const depth = 3 + Math.random() * 2;
            
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x606060,
                roughness: 0.8,
                metalness: 0.3
            });
            const building = new THREE.Mesh(geometry, material);
            building.position.set(position.x, position.y + height / 2, position.z);
            building.castShadow = true;
            building.receiveShadow = true;
            building.userData.decoration = true;
            this.scene.add(building);
        }
    }
    
    addStreetLights(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Pole
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
            const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(position.x, position.y + 1.5, position.z);
            pole.userData.decoration = true;
            this.scene.add(pole);
            
            // Light
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFAA,
                emissive: 0xFFFFAA,
                emissiveIntensity: 0.8
            });
            const lightBulb = new THREE.Mesh(lightGeometry, lightMaterial);
            lightBulb.position.set(position.x, position.y + 3, position.z);
            lightBulb.userData.decoration = true;
            this.scene.add(lightBulb);
            
            // Point light
            const light = new THREE.PointLight(0xFFFFAA, 1, 10);
            light.position.copy(lightBulb.position);
            light.userData.decoration = true;
            this.scene.add(light);
        }
    }
    
    addDebris(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            const geometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
            const material = new THREE.MeshStandardMaterial({ color: 0x505050 });
            const debris = new THREE.Mesh(geometry, material);
            debris.position.set(position.x, position.y + 0.15, position.z);
            debris.rotation.set(Math.random(), Math.random(), Math.random());
            debris.castShadow = true;
            debris.userData.decoration = true;
            this.scene.add(debris);
        }
    }
