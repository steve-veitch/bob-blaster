/**
 * Level Generator - BPSS v22
 * Procedural arena generation with multiple layouts and biomes
 */

class LevelGenerator {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.currentArena = null;
        this.arenaLayouts = ['open', 'maze', 'islands', 'corridors', 'arena'];
        this.seed = Date.now();
        console.log('levelGenerator initialized for v22');
    }
    
    init(terrainSystem, environmentSystem, biomeSystem) {
        this.terrainSystem = terrainSystem;
        this.environmentSystem = environmentSystem;
        this.biomeSystem = biomeSystem;
        this.initialized = true;
        console.log('Level generator ready');
    }
    
    generateNewArena(difficulty = 1) {
        if (!this.initialized) return;
        
        // Clear previous arena
        this.clearArena();
        
        // Generate new seed for randomization
        this.seed = Date.now() + Math.random() * 1000;
        
        // Select random layout
        const layout = this.arenaLayouts[Math.floor(this.random() * this.arenaLayouts.length)];
        
        // Select random biome
        const biomes = this.biomeSystem.getBiomeList();
        const biome = biomes[Math.floor(this.random() * biomes.length)];
        
        // Generate arena based on layout
        this.currentArena = {
            layout: layout,
            biome: biome,
            difficulty: difficulty,
            structures: []
        };
        
        console.log(`Generating ${layout} arena in ${biome} biome (difficulty: ${difficulty})`);
        
        // Apply biome
        this.biomeSystem.setBiome(biome);
        
        // Generate layout-specific structures
        switch(layout) {
            case 'open':
                this.generateOpenArena(difficulty);
                break;
            case 'maze':
                this.generateMazeArena(difficulty);
                break;
            case 'islands':
                this.generateIslandsArena(difficulty);
                break;
            case 'corridors':
                this.generateCorridorsArena(difficulty);
                break;
            case 'arena':
                this.generateArenaLayout(difficulty);
                break;
        }
        
        return this.currentArena;
    }
    
    generateOpenArena(difficulty) {
        // Open field with scattered cover
        const coverCount = 10 + Math.floor(difficulty * 2);
        
        for (let i = 0; i < coverCount; i++) {
            const pos = this.getRandomPosition();
            const structure = this.createCoverStructure(pos, 'scattered');
            this.currentArena.structures.push(structure);
        }
    }
    
    generateMazeArena(difficulty) {
        // Grid-based maze with walls
        const gridSize = 8;
        const cellSize = 20;
        const wallHeight = 3;
        
        // Generate maze using recursive backtracking
        const maze = this.generateMaze(gridSize, gridSize);
        
        // Create walls based on maze
        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                const cell = maze[x][z];
                const worldX = (x - gridSize / 2) * cellSize;
                const worldZ = (z - gridSize / 2) * cellSize;
                
                // Create walls for closed sides
                if (!cell.north && z > 0) {
                    this.createWall(worldX, worldZ - cellSize / 2, cellSize, wallHeight, 0);
                }
                if (!cell.east && x < gridSize - 1) {
                    this.createWall(worldX + cellSize / 2, worldZ, cellSize, wallHeight, Math.PI / 2);
                }
            }
        }
    }
    
    generateIslandsArena(difficulty) {
        // Multiple elevated platforms
        const islandCount = 4 + Math.floor(difficulty / 2);
        
        for (let i = 0; i < islandCount; i++) {
            const pos = this.getRandomPosition();
            const radius = 10 + this.random() * 10;
            const height = 2 + this.random() * 2;
            
            this.createIsland(pos.x, pos.z, radius, height);
        }
    }
    
    generateCorridorsArena(difficulty) {
        // Network of corridors with intersections
        const corridorCount = 6 + Math.floor(difficulty);
        
        for (let i = 0; i < corridorCount; i++) {
            const startPos = this.getRandomPosition();
            const angle = this.random() * Math.PI * 2;
            const length = 30 + this.random() * 30;
            
            this.createCorridor(startPos.x, startPos.z, angle, length);
        }
    }
    
    generateArenaLayout(difficulty) {
        // Circular arena with central structure
        const radius = 40;
        const wallCount = 16;
        
        // Create circular outer wall
        for (let i = 0; i < wallCount; i++) {
            const angle = (i / wallCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const rotation = angle + Math.PI / 2;
            
            this.createWall(x, z, 15, 3, rotation);
        }
        
        // Create central platform
        this.createIsland(0, 0, 15, 2);
    }
    
    generateMaze(width, height) {
        // Initialize maze grid
        const maze = [];
        for (let x = 0; x < width; x++) {
            maze[x] = [];
            for (let z = 0; z < height; z++) {
                maze[x][z] = {
                    visited: false,
                    north: false,
                    south: false,
                    east: false,
                    west: false
                };
            }
        }
        
        // Recursive backtracking maze generation
        const stack = [];
        let current = { x: 0, z: 0 };
        maze[0][0].visited = true;
        
        while (true) {
            const neighbors = [];
            const { x, z } = current;
            
            // Check unvisited neighbors
            if (z > 0 && !maze[x][z - 1].visited) neighbors.push({ x, z: z - 1, dir: 'north' });
            if (z < height - 1 && !maze[x][z + 1].visited) neighbors.push({ x, z: z + 1, dir: 'south' });
            if (x > 0 && !maze[x - 1][z].visited) neighbors.push({ x: x - 1, z, dir: 'west' });
            if (x < width - 1 && !maze[x + 1][z].visited) neighbors.push({ x: x + 1, z, dir: 'east' });
            
            if (neighbors.length > 0) {
                // Choose random neighbor
                const next = neighbors[Math.floor(this.random() * neighbors.length)];
                
                // Remove wall between current and next
                maze[current.x][current.z][next.dir] = true;
                const oppositeDir = { north: 'south', south: 'north', east: 'west', west: 'east' };
                maze[next.x][next.z][oppositeDir[next.dir]] = true;
                
                // Mark as visited and move
                maze[next.x][next.z].visited = true;
                stack.push(current);
                current = next;
            } else if (stack.length > 0) {
                // Backtrack
                current = stack.pop();
            } else {
                break;
            }
        }
        
        return maze;
    }
    
    createWall(x, z, width, height, rotation) {
        const geometry = new THREE.BoxGeometry(width, height, 0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const wall = new THREE.Mesh(geometry, material);
        const terrainHeight = this.terrainSystem ? this.terrainSystem.getHeightAt(x, z) : 0;
        wall.position.set(x, terrainHeight + height / 2, z);
        wall.rotation.y = rotation;
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.generated = true;
        
        this.scene.add(wall);
        this.currentArena.structures.push(wall);
    }
    
    createIsland(x, z, radius, height) {
        const geometry = new THREE.CylinderGeometry(radius, radius * 0.8, height, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const island = new THREE.Mesh(geometry, material);
        const terrainHeight = this.terrainSystem ? this.terrainSystem.getHeightAt(x, z) : 0;
        island.position.set(x, terrainHeight + height / 2, z);
        island.castShadow = true;
        island.receiveShadow = true;
        island.userData.generated = true;
        
        this.scene.add(island);
        this.currentArena.structures.push(island);
    }
    
    createCorridor(startX, startZ, angle, length) {
        const segments = Math.floor(length / 10);
        const width = 8;
        const height = 3;
        
        for (let i = 0; i < segments; i++) {
            const x = startX + Math.cos(angle) * i * 10;
            const z = startZ + Math.sin(angle) * i * 10;
            
            // Left wall
            this.createWall(
                x + Math.cos(angle + Math.PI / 2) * width / 2,
                z + Math.sin(angle + Math.PI / 2) * width / 2,
                10, height, angle
            );
            
            // Right wall
            this.createWall(
                x + Math.cos(angle - Math.PI / 2) * width / 2,
                z + Math.sin(angle - Math.PI / 2) * width / 2,
                10, height, angle
            );
        }
    }
    
    createCoverStructure(position, type) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const structure = new THREE.Mesh(geometry, material);
        structure.position.set(position.x, position.y + 1, position.z);
        structure.castShadow = true;
        structure.receiveShadow = true;
        structure.userData.generated = true;
        
        this.scene.add(structure);
        return structure;
    }
    
    getRandomPosition() {
        const range = 70;
        const x = (this.random() - 0.5) * range;
        const z = (this.random() - 0.5) * range;
        const y = this.terrainSystem ? this.terrainSystem.getHeightAt(x, z) : 0;
        
        return { x, y, z };
    }
    
    random() {
        // Seeded random number generator
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    clearArena() {
        if (!this.currentArena) return;
        
        // Remove all generated structures
        this.currentArena.structures.forEach(structure => {
            this.scene.remove(structure);
            if (structure.geometry) structure.geometry.dispose();
            if (structure.material) structure.material.dispose();
        });
        
        // Remove all objects marked as generated
        const generated = this.scene.children.filter(obj => obj.userData.generated);
        generated.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        
        this.currentArena = null;
    }
    
    getArenaInfo() {
        return this.currentArena;
    }
    
    update(deltaTime) {
        // Level generator is mostly static
        if (!this.initialized) return;
    }
    
    reset() {
        this.clearArena();
        this.initialized = false;
    }
}

// Made with Bob
