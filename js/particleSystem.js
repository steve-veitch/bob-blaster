/**
 * Particle System for BPSS v3
 * Handles explosions, muzzle flashes, and other visual effects
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 500;
        
        // Pre-create particle pool for performance
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = this.createParticle();
            particle.visible = false;
            this.scene.add(particle);
            this.particlePool.push(particle);
        }
    }

    createParticle() {
        const geometry = new THREE.SphereGeometry(0.2, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        return particle;
    }

    getParticle() {
        // Try to get from pool
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].visible) {
                return this.particlePool[i];
            }
        }
        // If pool is full, return null
        return null;
    }

    /**
     * Create an explosion effect at a position
     */
    createExplosion(position, color = 0xff6600, particleCount = 20) {
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            particle.position.copy(position);
            particle.visible = true;
            particle.material.color.setHex(color);
            particle.material.opacity = 1;
            particle.scale.set(1, 1, 1);
            
            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 2.0 + Math.random() * 2.0,
                gravity: -20,
                initialScale: 1 + Math.random() * 0.5
            });
        }
        
        this.particles.push(...particles);
    }

    /**
     * Create a muzzle flash effect
     */
    createMuzzleFlash(position, direction) {
        const particleCount = 8;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            particle.position.copy(position);
            particle.visible = true;
            particle.material.color.setHex(0xffff00);
            particle.material.opacity = 1;
            particle.scale.set(0.5, 0.5, 0.5);
            
            // Velocity in cone around shoot direction
            const spread = 0.3;
            const velocity = direction.clone().multiplyScalar(30);
            velocity.x += (Math.random() - 0.5) * spread * 30;
            velocity.y += (Math.random() - 0.5) * spread * 30;
            velocity.z += (Math.random() - 0.5) * spread * 30;
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 8.0,
                gravity: 0,
                initialScale: 0.5
            });
        }
        
        this.particles.push(...particles);
    }

    /**
     * Create a hit spark effect
     */
    createHitSpark(position, normal) {
        const particleCount = 12;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            particle.position.copy(position);
            particle.visible = true;
            particle.material.color.setHex(0xff0000);
            particle.material.opacity = 1;
            particle.scale.set(0.3, 0.3, 0.3);
            
            // Velocity reflecting off surface
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                Math.random() * 15,
                (Math.random() - 0.5) * 15
            );
            
            if (normal) {
                velocity.add(normal.clone().multiplyScalar(10));
            }
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 5.0,
                gravity: -30,
                initialScale: 0.3
            });
        }
        
        this.particles.push(...particles);
    }

    /**
     * Create a power-up collection effect
     */
    createPowerUpEffect(position, color = 0x00ff00) {
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            particle.position.copy(position);
            particle.visible = true;
            particle.material.color.setHex(color);
            particle.material.opacity = 1;
            particle.scale.set(0.4, 0.4, 0.4);
            
            // Upward spiral velocity
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 10,
                15 + Math.random() * 5,
                Math.sin(angle) * 10
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 3.0,
                gravity: -5,
                initialScale: 0.4
            });
        }
        
        this.particles.push(...particles);
    }

    /**
     * Create a damage indicator effect
     */
    createDamageEffect(position) {
        const particleCount = 10;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            particle.position.copy(position);
            particle.visible = true;
            particle.material.color.setHex(0xff0000);
            particle.material.opacity = 1;
            particle.scale.set(0.5, 0.5, 0.5);
            
            // Outward burst
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 8,
                Math.random() * 5,
                Math.sin(angle) * 8
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 4.0,
                gravity: -10,
                initialScale: 0.5
            });
        }
        
        this.particles.push(...particles);
    }

    /**
     * Create a trail effect (for projectiles)
     */
    createTrail(position, color = 0x0f62fe) {
        const particle = this.getParticle();
        if (!particle) return;
        
        particle.position.copy(position);
        particle.visible = true;
        particle.material.color.setHex(color);
        particle.material.opacity = 0.6;
        particle.scale.set(0.3, 0.3, 0.3);
        
        this.particles.push({
            mesh: particle,
            velocity: new THREE.Vector3(0, 0, 0),
            life: 1.0,
            decay: 6.0,
            gravity: 0,
            initialScale: 0.3
        });
    }

    /**
     * Update all active particles
     */
    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update life
            p.life -= p.decay * delta;
            
            if (p.life <= 0) {
                // Return to pool
                p.mesh.visible = false;
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            p.velocity.y += p.gravity * delta;
            p.mesh.position.add(p.velocity.clone().multiplyScalar(delta));
            
            // Update appearance
            p.mesh.material.opacity = p.life;
            const scale = p.initialScale * p.life;
            p.mesh.scale.set(scale, scale, scale);
            
            // Add some drag
            p.velocity.multiplyScalar(0.98);
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].mesh.visible = false;
        }
        this.particles = [];
    }

    /**
     * Get particle count for debugging
     */
    getActiveCount() {
        return this.particles.length;
    }
}

// Made with Bob
