/**
 * Boss System for BPSS v6
 * Epic boss battles every 5 waves
 */

class Boss {
    constructor(wave, scene) {
        this.wave = wave;
        this.scene = scene;
        this.mesh = null;
        this.health = 1000 + (wave * 500);
        this.maxHealth = this.health;
        this.phase = 1;
        this.attackTimer = 0;
        this.attackCooldown = 3;
        this.moveSpeed = 8;
        this.isActive = false;
        this.defeated = false;
        
        this.createBoss();
    }

    createBoss() {
        const group = new THREE.Group();
        const size = 3; // 3x larger than normal monsters
        
        // Boss body - imposing dark color
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a0000,
            roughness: 0.6,
            metalness: 0.4,
            emissive: 0x330000,
            emissiveIntensity: 0.3
        });
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(4 * size, 6 * size, 3 * size),
            bodyMaterial
        );
        body.position.y = 0;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Boss head - menacing
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x0d0000,
            roughness: 0.6,
            metalness: 0.4,
            emissive: 0x220000,
            emissiveIntensity: 0.4
        });
        
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(3 * size, 3 * size, 2.5 * size),
            headMaterial
        );
        head.position.y = 4.5 * size;
        head.castShadow = true;
        group.add(head);

        // Glowing eyes - intense red
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1.5
        });

        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.5 * size, 16, 16),
            eyeMaterial
        );
        leftEye.position.set(-0.7 * size, 4.8 * size, 1.3 * size);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.5 * size, 16, 16),
            eyeMaterial
        );
        rightEye.position.set(0.7 * size, 4.8 * size, 1.3 * size);
        group.add(rightEye);

        // Massive arms
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a0000,
            roughness: 0.6,
            metalness: 0.4
        });

        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(1.5 * size, 6 * size, 1.5 * size),
            armMaterial
        );
        leftArm.position.set(-3 * size, 0, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(1.5 * size, 6 * size, 1.5 * size),
            armMaterial
        );
        rightArm.position.set(3 * size, 0, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // Boss shirt with title
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.4,
            emissive: 0x330000,
            emissiveIntensity: 0.2
        });
        
        const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(4.2 * size, 3 * size, 3.2 * size),
            shirtMaterial
        );
        shirt.position.y = 1 * size;
        shirt.castShadow = true;
        group.add(shirt);

        // Boss title text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MEGA', canvas.width / 2, canvas.height / 2 - 35);
        ctx.fillText('PROBLEM', canvas.width / 2, canvas.height / 2 + 35);

        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.4,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
        });

        const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(3.5 * size, 2.5 * size),
            textMaterial
        );
        textPlane.position.set(0, 1 * size, 1.65 * size);
        group.add(textPlane);

        // Ominous point light
        const bossLight = new THREE.PointLight(0xff0000, 5, 50);
        bossLight.position.set(0, 10 * size, 0);
        group.add(bossLight);

        // Position boss in center
        group.position.set(0, 24, 0);
        
        // Boss data
        group.userData.isBoss = true;
        group.userData.health = this.health;
        group.userData.maxHealth = this.maxHealth;
        group.userData.damage = 25;
        group.userData.scoreValue = 5000;
        
        this.mesh = group;
    }

    spawn() {
        this.scene.add(this.mesh);
        this.isActive = true;
        
        // Play boss music/sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('victory'); // Reuse for dramatic effect
        }
    }

    update(delta, playerPosition) {
        if (!this.isActive || this.defeated) return;
        
        // Update phase based on health
        const healthPercent = (this.health / this.maxHealth) * 100;
        if (healthPercent < 30 && this.phase < 3) {
            this.phase = 3;
            this.attackCooldown = 1.5;
            this.moveSpeed = 12;
        } else if (healthPercent < 60 && this.phase < 2) {
            this.phase = 2;
            this.attackCooldown = 2;
            this.moveSpeed = 10;
        }
        
        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.mesh.position)
            .normalize();
        
        const movement = direction.multiplyScalar(this.moveSpeed * delta);
        this.mesh.position.add(movement);
        
        // Keep boss above ground
        if (this.mesh.position.y < 24) {
            this.mesh.position.y = 24;
        }
        
        // Rotate to face player
        this.mesh.lookAt(playerPosition);
        this.mesh.rotation.x = 0;
        this.mesh.rotation.z = 0;
        
        // Attack timer
        this.attackTimer += delta;
        
        // Menacing animation
        this.mesh.position.y = 24 + Math.sin(Date.now() * 0.001) * 2;
        this.mesh.rotation.y += delta * 0.5;
    }

    takeDamage(amount) {
        if (this.defeated) return false;
        
        this.health -= amount;
        
        // Visual feedback
        if (this.mesh) {
            const flash = new THREE.PointLight(0xffff00, 10, 30);
            flash.position.copy(this.mesh.position);
            this.scene.add(flash);
            setTimeout(() => this.scene.remove(flash), 100);
        }
        
        if (this.health <= 0) {
            this.defeat();
            return true;
        }
        
        return false;
    }

    defeat() {
        this.defeated = true;
        this.isActive = false;
        
        // Epic explosion
        if (typeof particleSystem !== 'undefined') {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    particleSystem.createExplosion(
                        this.mesh.position.clone().add(
                            new THREE.Vector3(
                                (Math.random() - 0.5) * 10,
                                (Math.random() - 0.5) * 10,
                                (Math.random() - 0.5) * 10
                            )
                        ),
                        0xff0000,
                        50
                    );
                }, i * 200);
            }
        }
        
        // Remove boss
        setTimeout(() => {
            this.scene.remove(this.mesh);
        }, 1000);
        
        // Play victory sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('victory');
        }
    }

    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        this.isActive = false;
    }
}

class BossManager {
    constructor(scene) {
        this.scene = scene;
        this.currentBoss = null;
        this.bossWaveInterval = 5; // Boss every 5 waves
    }

    shouldSpawnBoss(wave) {
        return wave % this.bossWaveInterval === 0;
    }

    spawnBoss(wave) {
        if (this.currentBoss) {
            this.currentBoss.remove();
        }
        
        this.currentBoss = new Boss(wave, this.scene);
        this.currentBoss.spawn();
        
        return this.currentBoss;
    }

    update(delta, playerPosition) {
        if (this.currentBoss && this.currentBoss.isActive) {
            this.currentBoss.update(delta, playerPosition);
        }
    }

    checkProjectileCollision(projectile) {
        if (!this.currentBoss || !this.currentBoss.isActive) return false;
        
        const distance = projectile.position.distanceTo(this.currentBoss.mesh.position);
        if (distance < 15) {
            const defeated = this.currentBoss.takeDamage(50);
            return { hit: true, defeated: defeated, boss: this.currentBoss };
        }
        
        return { hit: false };
    }

    checkPlayerCollision(playerPosition) {
        if (!this.currentBoss || !this.currentBoss.isActive) return false;
        
        const distance = playerPosition.distanceTo(this.currentBoss.mesh.position);
        if (distance < 12) {
            return this.currentBoss.mesh.userData.damage;
        }
        
        return 0;
    }

    reset() {
        if (this.currentBoss) {
            this.currentBoss.remove();
            this.currentBoss = null;
        }
    }

    hasBoss() {
        return this.currentBoss && this.currentBoss.isActive;
    }
}

// Made with Bob