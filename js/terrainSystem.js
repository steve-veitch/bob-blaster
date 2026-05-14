/**
 * Terrain System - BPSS v21
 * Procedural terrain generation with elevation and varied landscapes
 */

class TerrainSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.terrain = null;
        this.terrainSize = 200;
        this.segments = 50;
        this.maxHeight = 3; // Reduced from 15 to 3 (waist level)
        this.heightMap = [];
        console.log('terrainSystem initialized for v21');
    }
    
    init() {
        this.generateHeightMap();
        this.createTerrain();
        this.initialized = true;
        console.log('Procedural terrain generated');
    }
    
    generateHeightMap() {
        // Generate Perlin-like noise for natural terrain
        const scale = 0.1;
        
        for (let x = 0; x <= this.segments; x++) {
            this.heightMap[x] = [];
            for (let z = 0; z <= this.segments; z++) {
                // Multi-octave noise for natural variation
                let height = 0;
                height += this.noise2D(x * scale, z * scale) * this.maxHeight;
                height += this.noise2D(x * scale * 2, z * scale * 2) * (this.maxHeight * 0.5);
                height += this.noise2D(x * scale * 4, z * scale * 4) * (this.maxHeight * 0.25);
                
                this.heightMap[x][z] = Math.max(0, height);
            }
        }
    }
    
    noise2D(x, z) {
        // Simple pseudo-random noise function
        const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    createTerrain() {
        // Remove old flat floor if it exists
        const oldFloor = this.scene.children.find(obj => obj.geometry && obj.geometry.type === 'PlaneGeometry');
        if (oldFloor) {
            this.scene.remove(oldFloor);
        }
        
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, 
            this.terrainSize, 
            this.segments, 
            this.segments
        );
        
        // Apply height map to vertices
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = Math.floor((i / 3) % (this.segments + 1));
            const z = Math.floor((i / 3) / (this.segments + 1));
            vertices[i + 2] = this.heightMap[x][z]; // Z is height in Three.js
        }
        
        geometry.computeVertexNormals();
        
        // Create terrain material with color variation based on height
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Add color based on height
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 2];
            const normalizedHeight = height / this.maxHeight;
            
            // Color gradient: dark green (low) -> green -> brown (high)
            let r, g, b;
            if (normalizedHeight < 0.3) {
                // Low areas - dark green
                r = 0.2 + normalizedHeight * 0.3;
                g = 0.4 + normalizedHeight * 0.4;
                b = 0.2;
            } else if (normalizedHeight < 0.6) {
                // Mid areas - green/brown
                r = 0.3 + normalizedHeight * 0.3;
                g = 0.5 + normalizedHeight * 0.2;
                b = 0.2;
            } else {
                // High areas - brown/gray
                r = 0.5 + normalizedHeight * 0.2;
                g = 0.4 + normalizedHeight * 0.2;
                b = 0.3 + normalizedHeight * 0.2;
            }
            
            colors.push(r, g, b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create mesh
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.castShadow = false;
        
        this.scene.add(this.terrain);
    }
    
    getHeightAt(x, z) {
        // Get terrain height at world position
        if (!this.initialized) return 0;
        
        // Convert world coordinates to heightmap coordinates
        const halfSize = this.terrainSize / 2;
        const mapX = Math.floor(((x + halfSize) / this.terrainSize) * this.segments);
        const mapZ = Math.floor(((z + halfSize) / this.terrainSize) * this.segments);
        
        // Clamp to valid range
        const clampedX = Math.max(0, Math.min(this.segments, mapX));
        const clampedZ = Math.max(0, Math.min(this.segments, mapZ));
        
        return this.heightMap[clampedX][clampedZ] || 0;
    }
    
    update(deltaTime) {
        // Terrain is static, no updates needed
        if (!this.initialized) return;
    }
    
    reset() {
        if (this.terrain) {
            this.scene.remove(this.terrain);
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
            this.terrain = null;
        }
        this.heightMap = [];
        this.initialized = false;
    }
}

// Made with Bob
