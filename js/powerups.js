/**
 * Power-ups System for BPSS v4
 * Adds collectible power-ups with various effects
 */

const PowerUpTypes = {
    HEALTH: 'health',
    SPEED: 'speed',
    RAPID_FIRE: 'rapidFire',
    SHIELD: 'shield',
    DAMAGE_BOOST: 'damageBoost'
};

class PowerUp {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.mesh = null;
        this.rotationSpeed = 2;
        this.bobSpeed = 2;
        this.bobAmount = 0.5;
        this.initialY = position.y;
        this.time = 0;
        this.collected = false;
        
        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Get color and properties based on type
        const config = this.getConfig();
        
        // Main power-up sphere
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.5,
            metalness: 0.3,
            roughness: 0.4
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        group.add(sphere);
        
        // Outer ring
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.2, 8, 16);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        // Icon symbol (simple geometric shape)
        const iconGeometry = this.getIconGeometry();
        const iconMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.8
        });
        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.scale.set(0.5, 0.5, 0.5);
        group.add(icon);
        
        // Point light for glow effect
        const light = new THREE.PointLight(config.color, 2, 10);
        group.add(light);
        
        group.position.copy(this.position);
        this.mesh = group;
    }

    getConfig() {
        switch(this.type) {
            case PowerUpTypes.HEALTH:
                return { color: 0x00ff00, duration: 0, name: 'Health Pack' };
            case PowerUpTypes.SPEED:
                return { color: 0x00ffff, duration: 10, name: 'Speed Boost' };
            case PowerUpTypes.RAPID_FIRE:
                return { color: 0xffff00, duration: 8, name: 'Rapid Fire' };
            case PowerUpTypes.SHIELD:
                return { color: 0x0088ff, duration: 15, name: 'Shield' };
            case PowerUpTypes.DAMAGE_BOOST:
                return { color: 0xff6600, duration: 12, name: 'Damage Boost' };
            default:
                return { color: 0xffffff, duration: 0, name: 'Unknown' };
        }
    }

    getIconGeometry() {
        switch(this.type) {
            case PowerUpTypes.HEALTH:
                // Plus sign
                const plusShape = new THREE.Shape();
                plusShape.moveTo(-0.5, -0.2);
                plusShape.lineTo(-0.5, 0.2);
                plusShape.lineTo(-0.2, 0.2);
                plusShape.lineTo(-0.2, 0.5);
                plusShape.lineTo(0.2, 0.5);
                plusShape.lineTo(0.2, 0.2);
                plusShape.lineTo(0.5, 0.2);
                plusShape.lineTo(0.5, -0.2);
                plusShape.lineTo(0.2, -0.2);
                plusShape.lineTo(0.2, -0.5);
                plusShape.lineTo(-0.2, -0.5);
                plusShape.lineTo(-0.2, -0.2);
                plusShape.lineTo(-0.5, -0.2);
                return new THREE.ExtrudeGeometry(plusShape, { depth: 0.2, bevelEnabled: false });
            case PowerUpTypes.SPEED:
                return new THREE.ConeGeometry(0.5, 1, 3);
            case PowerUpTypes.RAPID_FIRE:
                return new THREE.BoxGeometry(0.3, 1, 0.3);
            case PowerUpTypes.SHIELD:
                return new THREE.OctahedronGeometry(0.6);
            case PowerUpTypes.DAMAGE_BOOST:
                return new THREE.TetrahedronGeometry(0.7);
            default:
                return new THREE.SphereGeometry(0.5);
        }
    }

    update(delta) {
        if (this.collected) return;
        
        this.time += delta;
        
        // Rotate
        this.mesh.rotation.y += this.rotationSpeed * delta;
        
        // Bob up and down
        this.mesh.position.y = this.initialY + Math.sin(this.time * this.bobSpeed) * this.bobAmount;
        
        // Pulse the ring
        const ring = this.mesh.children[1];
        if (ring) {
            const scale = 1 + Math.sin(this.time * 3) * 0.1;
            ring.scale.set(scale, scale, scale);
        }
    }

    collect() {
        this.collected = true;
    }
}

class PowerUpManager {
    constructor(scene, playerHealth) {
        this.scene = scene;
        this.playerHealth = playerHealth;
        this.powerUps = [];
        this.activePowerUps = new Map(); // type -> {endTime, data}
        this.spawnTimer = 0;
        this.spawnInterval = 10; // Spawn every 10 seconds (reduced from 15)
        this.maxPowerUps = 5; // Increased from 3 to allow more powerups on field
        
        // Power-up effects
        this.speedMultiplier = 1.0;
        this.fireRateMultiplier = 1.0;
        this.damageMultiplier = 1.0;
        this.hasShield = false;
    }

    update(delta, camera) {
        // Update spawn timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval && this.powerUps.length < this.maxPowerUps) {
            this.spawnRandomPowerUp();
            this.spawnTimer = 0;
        }
        
        // Update existing power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(delta);
            
            // Check for collection
            if (!powerUp.collected) {
                // Calculate horizontal distance (ignore Y difference)
                const dx = camera.position.x - powerUp.mesh.position.x;
                const dz = camera.position.z - powerUp.mesh.position.z;
                const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
                
                // Collect if player is within 5 units horizontally
                if (horizontalDistance < 5) {
                    this.collectPowerUp(powerUp);
                }
            }
        }
        
        // Update active power-up timers
        const currentTime = Date.now() / 1000;
        for (const [type, data] of this.activePowerUps.entries()) {
            if (currentTime >= data.endTime) {
                this.deactivatePowerUp(type);
            }
        }
    }

    spawnRandomPowerUp() {
        const types = Object.values(PowerUpTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Random position within arena at player height for better visibility
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 140,
            10, // Changed from 5 to 10 to match player camera height
            (Math.random() - 0.5) * 140
        );
        
        const powerUp = new PowerUp(type, position);
        this.scene.add(powerUp.mesh);
        this.powerUps.push(powerUp);
    }

    collectPowerUp(powerUp) {
        powerUp.collect();
        
        // Play collection sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('powerup');
        }
        
        // Create collection effect
        if (typeof particleSystem !== 'undefined') {
            particleSystem.createPowerUpEffect(powerUp.mesh.position, powerUp.getConfig().color);
        }
        
        // Apply power-up effect
        this.activatePowerUp(powerUp.type);
        
        // Remove from scene
        this.scene.remove(powerUp.mesh);
        const index = this.powerUps.indexOf(powerUp);
        if (index > -1) {
            this.powerUps.splice(index, 1);
        }
        
        // Show notification
        this.showPowerUpNotification(powerUp);
    }

    activatePowerUp(type) {
        const config = new PowerUp(type, new THREE.Vector3()).getConfig();
        const currentTime = Date.now() / 1000;
        
        switch(type) {
            case PowerUpTypes.HEALTH:
                this.playerHealth.heal(50);
                break;
            case PowerUpTypes.SPEED:
                this.speedMultiplier = 1.5;
                this.activePowerUps.set(type, { endTime: currentTime + config.duration });
                break;
            case PowerUpTypes.RAPID_FIRE:
                this.fireRateMultiplier = 2.0;
                this.activePowerUps.set(type, { endTime: currentTime + config.duration });
                break;
            case PowerUpTypes.SHIELD:
                this.hasShield = true;
                this.activePowerUps.set(type, { endTime: currentTime + config.duration });
                break;
            case PowerUpTypes.DAMAGE_BOOST:
                this.damageMultiplier = 2.0;
                this.activePowerUps.set(type, { endTime: currentTime + config.duration });
                break;
        }
        
        this.updatePowerUpDisplay();
    }

    deactivatePowerUp(type) {
        switch(type) {
            case PowerUpTypes.SPEED:
                this.speedMultiplier = 1.0;
                break;
            case PowerUpTypes.RAPID_FIRE:
                this.fireRateMultiplier = 1.0;
                break;
            case PowerUpTypes.SHIELD:
                this.hasShield = false;
                break;
            case PowerUpTypes.DAMAGE_BOOST:
                this.damageMultiplier = 1.0;
                break;
        }
        
        this.activePowerUps.delete(type);
        this.updatePowerUpDisplay();
    }

    showPowerUpNotification(powerUp) {
        const config = powerUp.getConfig();
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.textContent = `${config.name} Collected!`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #${config.color.toString(16).padStart(6, '0')};
            padding: 20px 40px;
            border: 3px solid #${config.color.toString(16).padStart(6, '0')};
            border-radius: 10px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 2000;
            animation: powerupFade 2s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    updatePowerUpDisplay() {
        let displayHTML = '';
        for (const [type, data] of this.activePowerUps.entries()) {
            const config = new PowerUp(type, new THREE.Vector3()).getConfig();
            const timeLeft = Math.ceil(data.endTime - Date.now() / 1000);
            displayHTML += `
                <div class="active-powerup" style="border-color: #${config.color.toString(16).padStart(6, '0')}">
                    <span>${config.name}</span>
                    <span>${timeLeft}s</span>
                </div>
            `;
        }
        
        const container = document.getElementById('activePowerUps');
        if (container) {
            container.innerHTML = displayHTML;
        }
    }

    reset() {
        // Remove all power-ups from scene
        this.powerUps.forEach(powerUp => {
            this.scene.remove(powerUp.mesh);
        });
        this.powerUps = [];
        
        // Clear active effects
        this.activePowerUps.clear();
        this.speedMultiplier = 1.0;
        this.fireRateMultiplier = 1.0;
        this.damageMultiplier = 1.0;
        this.hasShield = false;
        
        this.spawnTimer = 0;
        this.updatePowerUpDisplay();
    }

    getSpeedMultiplier() {
        return this.speedMultiplier;
    }

    getFireRateMultiplier() {
        return this.fireRateMultiplier;
    }

    getDamageMultiplier() {
        return this.damageMultiplier;
    }

    shouldBlockDamage() {
        if (this.hasShield) {
            this.deactivatePowerUp(PowerUpTypes.SHIELD);
            return true;
        }
        return false;
    }
}

// Made with Bob