/**
 * Environment System - BPSS v21
 * Destructible cover objects and environmental hazards
 */

class EnvironmentSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.coverObjects = [];
        this.hazards = [];
        this.debrisParticles = [];
        console.log('environmentSystem initialized for v21');
    }
    
    init(terrainSystem) {
        this.terrainSystem = terrainSystem;
        this.createCoverObjects();
        this.createHazards();
        this.initialized = true;
        console.log('Environment objects created');
    }
    
    createCoverObjects() {
        // Create various destructible cover objects
        const coverTypes = [
            { type: 'crate', count: 15, health: 100 },
            { type: 'barrel', count: 10, health: 75 },
            { type: 'wall', count: 8, health: 150 }
        ];
        
        coverTypes.forEach(coverType => {
            for (let i = 0; i < coverType.count; i++) {
                this.createCoverObject(coverType.type, coverType.health);
            }
        });
    }
    
    createCoverObject(type, health) {
        let geometry, material, mesh;
        const position = this.getRandomPosition();
        
        switch(type) {
            case 'crate':
                // Wooden crate - scaled down
                geometry = new THREE.BoxGeometry(2, 2, 2);
                material = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.9,
                    metalness: 0.1
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1, position.z);
                break;
                
            case 'barrel':
                // Metal barrel - scaled down
                geometry = new THREE.CylinderGeometry(0.75, 0.75, 2, 16);
                material = new THREE.MeshStandardMaterial({
                    color: 0x555555,
                    roughness: 0.6,
                    metalness: 0.7
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1, position.z);
                break;
                
            case 'wall':
                // Concrete wall segment - scaled down
                geometry = new THREE.BoxGeometry(4, 3, 0.5);
                material = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    roughness: 0.95,
                    metalness: 0.05
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position.x, position.y + 1.5, position.z);
                mesh.rotation.y = Math.random() * Math.PI;
                break;
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const coverObject = {
            mesh: mesh,
            type: type,
            health: health,
            maxHealth: health,
            destroyed: false
        };
        
        this.coverObjects.push(coverObject);
        this.scene.add(mesh);
    }
    
    createHazards() {
        // Create environmental hazards
        this.createFireHazards(5);
        this.createWaterHazards(3);
    }
    
    createFireHazards(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Fire base
            const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0xFF4500,
                emissive: 0xFF4500,
                emissiveIntensity: 0.8
            });
            const fireMesh = new THREE.Mesh(geometry, material);
            fireMesh.position.set(position.x, position.y + 0.25, position.z);
            
            // Add point light for fire glow
            const fireLight = new THREE.PointLight(0xFF4500, 2, 15);
            fireLight.position.copy(fireMesh.position);
            fireLight.position.y += 2;
            
            const hazard = {
                mesh: fireMesh,
                light: fireLight,
                type: 'fire',
                damage: 10,
                radius: 3,
                active: true
            };
            
            this.hazards.push(hazard);
            this.scene.add(fireMesh);
            this.scene.add(fireLight);
        }
    }
    
    createWaterHazards(count) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition();
            
            // Water puddle
            const geometry = new THREE.CircleGeometry(4, 32);
            const material = new THREE.MeshStandardMaterial({
                color: 0x1E90FF,
                transparent: true,
                opacity: 0.6,
                roughness: 0.1,
                metalness: 0.9
            });
            const waterMesh = new THREE.Mesh(geometry, material);
            waterMesh.rotation.x = -Math.PI / 2;
            waterMesh.position.set(position.x, position.y + 0.1, position.z);
            
            const hazard = {
                mesh: waterMesh,
                type: 'water',
                damage: 5,
                radius: 4,
                active: true,
                slowEffect: 0.5 // Slows movement by 50%
            };
            
            this.hazards.push(hazard);
            this.scene.add(waterMesh);
        }
    }
    
    getRandomPosition() {
        const range = 80;
        const x = (Math.random() - 0.5) * range;
        const z = (Math.random() - 0.5) * range;
        const y = this.terrainSystem ? this.terrainSystem.getHeightAt(x, z) : 0;
        
        return { x, y, z };
    }
    
    damageCover(coverObject, damage) {
        if (coverObject.destroyed) return;
        
        coverObject.health -= damage;
        
        // Visual damage feedback - darken the object
        const damagePercent = coverObject.health / coverObject.maxHealth;
        const color = coverObject.mesh.material.color;
        coverObject.mesh.material.color.multiplyScalar(0.95);
        
        if (coverObject.health <= 0) {
            this.destroyCover(coverObject);
        }
    }
    
    destroyCover(coverObject) {
        coverObject.destroyed = true;
        
        // Create debris particles
        this.createDebris(coverObject.mesh.position, coverObject.type);
        
        // Remove from scene
        this.scene.remove(coverObject.mesh);
        coverObject.mesh.geometry.dispose();
        coverObject.mesh.material.dispose();
    }
    
    createDebris(position, type) {
        const particleCount = 10;
        const color = type === 'barrel' ? 0x555555 : 0x8B4513;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshStandardMaterial({ color: color });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 8 + 2,
                (Math.random() - 0.5) * 10
            );
            particle.angularVelocity = new THREE.Vector3(
                Math.random() * 0.2,
                Math.random() * 0.2,
                Math.random() * 0.2
            );
            particle.lifetime = 2;
            particle.castShadow = true;
            
            this.debrisParticles.push(particle);
            this.scene.add(particle);
        }
    }
    
    checkHazardCollision(position, radius = 1) {
        const hazardsHit = [];
        
        this.hazards.forEach(hazard => {
            if (!hazard.active) return;
            
            const distance = Math.sqrt(
                Math.pow(position.x - hazard.mesh.position.x, 2) +
                Math.pow(position.z - hazard.mesh.position.z, 2)
            );
            
            if (distance < hazard.radius + radius) {
                hazardsHit.push(hazard);
            }
        });
        
        return hazardsHit;
    }
    
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Update fire light flickering
        this.hazards.forEach(hazard => {
            if (hazard.type === 'fire' && hazard.light) {
                hazard.light.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
            }
        });
        
        // Update debris particles
        for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
            const particle = this.debrisParticles[i];
            
            particle.lifetime -= deltaTime;
            
            if (particle.lifetime <= 0) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.debrisParticles.splice(i, 1);
                continue;
            }
            
            // Apply physics
            particle.velocity.y -= 9.8 * deltaTime; // Gravity
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.rotation.x += particle.angularVelocity.x;
            particle.rotation.y += particle.angularVelocity.y;
            particle.rotation.z += particle.angularVelocity.z;
            
            // Fade out
            particle.material.opacity = particle.lifetime / 2;
            particle.material.transparent = true;
        }
    }
    
    reset() {
        // Remove all cover objects
        this.coverObjects.forEach(obj => {
            if (obj.mesh) {
                this.scene.remove(obj.mesh);
                obj.mesh.geometry.dispose();
                obj.mesh.material.dispose();
            }
        });
        
        // Remove all hazards
        this.hazards.forEach(hazard => {
            this.scene.remove(hazard.mesh);
            hazard.mesh.geometry.dispose();
            hazard.mesh.material.dispose();
            if (hazard.light) {
                this.scene.remove(hazard.light);
            }
        });
        
        // Remove debris
        this.debrisParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        this.coverObjects = [];
        this.hazards = [];
        this.debrisParticles = [];
        this.initialized = false;
    }
}

// Made with Bob
