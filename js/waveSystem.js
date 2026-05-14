// Wave and Monster Spawning System

class WaveSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 1;
        this.monstersPerWave = 7;
        this.monstersAlive = 0;
        this.monstersKilled = 0;
        this.totalMonstersInWave = 0;
        this.waveActive = false;
        this.monsters = [];
        
        // Wave difficulty scaling
        this.baseMonsterSpeed = 15;
        this.speedIncreasePerWave = 2;
        this.healthIncreasePerWave = 20;
        
        // Endless mode (v22)
        this.endlessMode = true; // Always endless in v22
        this.difficultyMultiplier = 1.0;
    }
    
    getDifficultyMultiplier() {
        // Exponential difficulty scaling for endless mode
        if (this.endlessMode) {
            return 1.0 + (this.currentWave - 1) * 0.15;
        }
        return 1.0;
    }

    startWave() {
        this.waveActive = true;
        this.monstersKilled = 0;
        this.totalMonstersInWave = this.monstersPerWave + Math.floor((this.currentWave - 1) * 1.5);
        this.spawnMonsters();
        this.updateDisplay();
    }

    spawnMonsters() {
        const positions = this.generateSpawnPositions(this.totalMonstersInWave);
        
        positions.forEach(pos => {
            // Use MonsterFactory to create varied monsters
            const monsterType = MonsterFactory.getRandomType(this.currentWave);
            const position = new THREE.Vector3(pos.x, 8, pos.z);
            const monster = MonsterFactory.createMonster(monsterType, position, this.currentWave);
            
            this.scene.add(monster);
            this.monsters.push(monster);
            this.monstersAlive++;
        });
    }

    generateSpawnPositions(count) {
        const positions = [];
        const minDistance = 20; // Minimum distance between spawns
        const maxAttempts = 100;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let validPosition = false;
            let pos;
            
            while (!validPosition && attempts < maxAttempts) {
                pos = {
                    x: (Math.random() - 0.5) * 160, // -80 to 80
                    z: (Math.random() - 0.5) * 160
                };
                
                // Check distance from other positions
                validPosition = true;
                for (const existingPos of positions) {
                    const dx = pos.x - existingPos.x;
                    const dz = pos.z - existingPos.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                positions.push(pos);
            }
        }
        
        return positions;
    }

    // Removed - now using MonsterFactory

    updateMonsters(delta, playerPosition) {
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            
            // Use MonsterFactory for type-specific behavior
            MonsterFactory.updateMonsterBehavior(monster, delta, playerPosition);
            
            // Move the monster
            const movement = monster.userData.moveDirection.clone()
                .multiplyScalar(monster.userData.moveSpeed * delta);
            monster.position.add(movement);
            
            // Keep within bounds
            const margin = 10;
            const maxX = 90;
            const maxZ = 90;
            
            if (monster.position.x > maxX - margin || monster.position.x < -maxX + margin) {
                monster.userData.moveDirection.x *= -1;
                monster.position.x = Math.max(-maxX + margin, Math.min(maxX - margin, monster.position.x));
            }
            
            if (monster.position.z > maxZ - margin || monster.position.z < -maxZ + margin) {
                monster.userData.moveDirection.z *= -1;
                monster.position.z = Math.max(-maxZ + margin, Math.min(maxZ - margin, monster.position.z));
            }
        }
    }

    removeMonster(monster) {
        const index = this.monsters.indexOf(monster);
        if (index > -1) {
            this.monsters.splice(index, 1);
            this.scene.remove(monster);
            this.monstersAlive--;
            this.monstersKilled++;
            this.updateDisplay();
            
            // Check if wave is complete
            if (this.monstersAlive === 0 && this.waveActive) {
                this.completeWave();
            }
        }
    }

    completeWave() {
        this.waveActive = false;
        return {
            wave: this.currentWave,
            monstersKilled: this.monstersKilled
        };
    }

    nextWave() {
        this.currentWave++;
        this.startWave();
    }

    updateDisplay() {
        const waveDisplay = document.getElementById('waveDisplay');
        const monstersDisplay = document.getElementById('monstersDisplay');
        
        if (waveDisplay) {
            waveDisplay.textContent = this.currentWave;
        }
        
        if (monstersDisplay) {
            monstersDisplay.textContent = `${this.monstersKilled}/${this.totalMonstersInWave}`;
        }
    }

    reset() {
        // Remove all monsters
        this.monsters.forEach(monster => {
            this.scene.remove(monster);
        });
        this.monsters = [];
        this.currentWave = 1;
        this.monstersAlive = 0;
        this.monstersKilled = 0;
        this.waveActive = false;
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WaveSystem };
}

// Made with Bob
