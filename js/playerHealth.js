// Player Health and Damage System

class PlayerHealth {
    constructor() {
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 1.5; // seconds
        this.invulnerabilityTimer = 0;
        this.damageFlashDuration = 0.3;
        this.damageFlashTimer = 0;
    }

    reset() {
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.damageFlashTimer = 0;
        this.updateDisplay();
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.currentHealth <= 0) {
            return false;
        }

        // Check for shield power-up
        if (typeof powerUpManager !== 'undefined' && powerUpManager.shouldBlockDamage()) {
            // Shield blocked the damage
            if (typeof audioSystem !== 'undefined') {
                audioSystem.playSound('powerup');
            }
            return false;
        }

        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityDuration;
        
        // Play damage sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('damage');
        }
        
        this.updateDisplay();
        this.showDamageEffect();
        
        return this.currentHealth <= 0; // Returns true if dead
    }

    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.updateDisplay();
        
        // Play heal/powerup sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('powerup');
        }
    }

    update(delta) {
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
            }
        }

        // Update damage flash
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= delta;
            if (this.damageFlashTimer <= 0) {
                this.hideDamageEffect();
            }
        }
    }

    updateDisplay() {
        const healthBarFill = document.getElementById('healthBarFill');
        const healthValue = document.getElementById('healthValue');
        
        if (healthBarFill) {
            const percentage = (this.currentHealth / this.maxHealth) * 100;
            healthBarFill.style.width = percentage + '%';
            
            // Change color based on health
            if (percentage > 60) {
                healthBarFill.style.background = 'linear-gradient(90deg, #00ff00, #44ff44)';
            } else if (percentage > 30) {
                healthBarFill.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc00)';
            } else {
                healthBarFill.style.background = 'linear-gradient(90deg, #ff0000, #ff6600)';
            }
        }
        
        if (healthValue) {
            healthValue.textContent = Math.ceil(this.currentHealth);
        }
    }

    showDamageEffect() {
        const damageIndicator = document.getElementById('damageIndicator');
        if (damageIndicator) {
            damageIndicator.classList.add('active');
            this.damageFlashTimer = this.damageFlashDuration;
        }
    }

    hideDamageEffect() {
        const damageIndicator = document.getElementById('damageIndicator');
        if (damageIndicator) {
            damageIndicator.classList.remove('active');
        }
    }

    isDead() {
        return this.currentHealth <= 0;
    }

    getHealthPercentage() {
        return (this.currentHealth / this.maxHealth) * 100;
    }
}

// Monster Collision Detection for Damage
class CollisionSystem {
    constructor(camera, playerHealth) {
        this.camera = camera;
        this.playerHealth = playerHealth;
        this.damagePerHit = 10;
        this.collisionDistance = 5; // Distance at which monster damages player
    }

    checkMonsterCollisions(monsters, delta) {
        if (this.playerHealth.isDead()) return true;

        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            const distance = this.camera.position.distanceTo(monster.position);
            
            if (distance < this.collisionDistance) {
                // Monster is touching player
                const isDead = this.playerHealth.takeDamage(this.damagePerHit);
                
                if (isDead) {
                    return true; // Player died
                }
            }
        }
        
        return false;
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerHealth, CollisionSystem };
}

// Made with Bob
