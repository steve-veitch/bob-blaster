/**
 * Monster Types System for BPSS v5
 * Adds variety with different monster behaviors and appearances
 */

const MonsterTypes = {
    BASIC: 'basic',           // Standard Business Problem
    FAST: 'fast',             // Quick moving, less health
    TANK: 'tank',             // Slow, high health
    ZIGZAG: 'zigzag',         // Erratic movement pattern
    CHARGER: 'charger'        // Charges at player when close
};

class MonsterFactory {
    static createMonster(type, position, wave) {
        const monsterGroup = new THREE.Group();
        const config = this.getMonsterConfig(type, wave);
        
        // Create monster body based on type
        this.createMonsterBody(monsterGroup, config);
        
        // Set position
        monsterGroup.position.copy(position);
        
        // Add monster data
        monsterGroup.userData.isMonster = true;
        monsterGroup.userData.type = type;
        monsterGroup.userData.health = config.health;
        monsterGroup.userData.maxHealth = config.health;
        monsterGroup.userData.moveSpeed = config.speed;
        monsterGroup.userData.damage = config.damage;
        monsterGroup.userData.scoreValue = config.scoreValue;
        monsterGroup.userData.moveDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        ).normalize();
        monsterGroup.userData.changeDirectionTimer = Math.random() * 3;
        monsterGroup.userData.behaviorTimer = 0;
        monsterGroup.userData.chargeTarget = null;
        
        return monsterGroup;
    }

    static getMonsterConfig(type, wave) {
        const baseHealth = 100 + (wave - 1) * 20;
        const baseSpeed = 15 + (wave - 1) * 2;
        
        switch(type) {
            case MonsterTypes.BASIC:
                return {
                    health: baseHealth,
                    speed: baseSpeed,
                    damage: 10,
                    scoreValue: 100,
                    color: 0x2d5016,
                    headColor: 0x1a3d0a,
                    size: 1.0,
                    name: 'Business Problem'
                };
            
            case MonsterTypes.FAST:
                return {
                    health: baseHealth * 0.6,
                    speed: baseSpeed * 1.8,
                    damage: 8,
                    scoreValue: 150,
                    color: 0xff6600,
                    headColor: 0xcc4400,
                    size: 0.8,
                    name: 'Urgent Issue'
                };
            
            case MonsterTypes.TANK:
                return {
                    health: baseHealth * 2.5,
                    speed: baseSpeed * 0.5,
                    damage: 20,
                    scoreValue: 250,
                    color: 0x8b0000,
                    headColor: 0x660000,
                    size: 1.4,
                    name: 'Critical Problem'
                };
            
            case MonsterTypes.ZIGZAG:
                return {
                    health: baseHealth * 0.8,
                    speed: baseSpeed * 1.3,
                    damage: 12,
                    scoreValue: 175,
                    color: 0x9400d3,
                    headColor: 0x6a0dad,
                    size: 0.9,
                    name: 'Erratic Bug'
                };
            
            case MonsterTypes.CHARGER:
                return {
                    health: baseHealth * 1.2,
                    speed: baseSpeed * 0.8,
                    damage: 15,
                    scoreValue: 200,
                    color: 0x0066cc,
                    headColor: 0x004499,
                    size: 1.1,
                    name: 'Deadline Rush'
                };
            
            default:
                return this.getMonsterConfig(MonsterTypes.BASIC, wave);
        }
    }

    static createMonsterBody(group, config) {
        const size = config.size;
        
        // Monster body
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.8
        });
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(4 * size, 6 * size, 3 * size),
            bodyMaterial
        );
        body.position.y = 0;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Monster head
        const headMaterial = new THREE.MeshStandardMaterial({
            color: config.headColor,
            roughness: 0.8
        });
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(3 * size, 3 * size, 2.5 * size),
            headMaterial
        );
        head.position.y = 4.5 * size;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Eyes (glowing red)
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        });

        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * size, 8, 8),
            eyeMaterial
        );
        leftEye.position.set(-0.7 * size, 4.8 * size, 1.3 * size);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * size, 8, 8),
            eyeMaterial
        );
        rightEye.position.set(0.7 * size, 4.8 * size, 1.3 * size);
        group.add(rightEye);

        // Arms
        const armMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(1 * size, 5 * size, 1 * size),
            armMaterial
        );
        leftArm.position.set(-2.5 * size, 0, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(1 * size, 5 * size, 1 * size),
            armMaterial
        );
        rightArm.position.set(2.5 * size, 0, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // T-shirt with text
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6
        });
        const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(4.2 * size, 3 * size, 3.2 * size),
            shirtMaterial
        );
        shirt.position.y = 1 * size;
        shirt.castShadow = true;
        group.add(shirt);

        // Create canvas texture for text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.name.split(' ')[0], canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(config.name.split(' ')[1] || '', canvas.width / 2, canvas.height / 2 + 30);

        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6
        });

        const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(3.5 * size, 2.5 * size),
            textMaterial
        );
        textPlane.position.set(0, 1 * size, 1.65 * size);
        group.add(textPlane);
    }

    static updateMonsterBehavior(monster, delta, playerPosition) {
        const type = monster.userData.type;
        
        switch(type) {
            case MonsterTypes.BASIC:
                this.updateBasicBehavior(monster, delta);
                break;
            case MonsterTypes.FAST:
                this.updateFastBehavior(monster, delta);
                break;
            case MonsterTypes.TANK:
                this.updateTankBehavior(monster, delta);
                break;
            case MonsterTypes.ZIGZAG:
                this.updateZigzagBehavior(monster, delta);
                break;
            case MonsterTypes.CHARGER:
                this.updateChargerBehavior(monster, delta, playerPosition);
                break;
        }
    }

    static updateBasicBehavior(monster, delta) {
        // Standard random movement
        monster.userData.changeDirectionTimer -= delta;
        
        if (monster.userData.changeDirectionTimer <= 0) {
            monster.userData.moveDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            monster.userData.changeDirectionTimer = 2 + Math.random() * 3;
        }
    }

    static updateFastBehavior(monster, delta) {
        // Quick direction changes
        monster.userData.changeDirectionTimer -= delta;
        
        if (monster.userData.changeDirectionTimer <= 0) {
            monster.userData.moveDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            monster.userData.changeDirectionTimer = 0.5 + Math.random() * 1;
        }
    }

    static updateTankBehavior(monster, delta) {
        // Slow, deliberate movement
        monster.userData.changeDirectionTimer -= delta;
        
        if (monster.userData.changeDirectionTimer <= 0) {
            monster.userData.moveDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            monster.userData.changeDirectionTimer = 4 + Math.random() * 4;
        }
    }

    static updateZigzagBehavior(monster, delta) {
        // Zigzag pattern
        monster.userData.behaviorTimer += delta;
        
        if (monster.userData.behaviorTimer > 0.3) {
            // Rotate direction 90 degrees
            const currentDir = monster.userData.moveDirection;
            monster.userData.moveDirection = new THREE.Vector3(
                -currentDir.z,
                0,
                currentDir.x
            ).normalize();
            monster.userData.behaviorTimer = 0;
        }
    }

    static updateChargerBehavior(monster, delta, playerPosition) {
        // Charge at player when within range
        const distanceToPlayer = monster.position.distanceTo(playerPosition);
        
        if (distanceToPlayer < 30 && !monster.userData.chargeTarget) {
            // Start charging
            monster.userData.chargeTarget = playerPosition.clone();
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, monster.position)
                .normalize();
            monster.userData.moveDirection = direction;
            monster.userData.moveSpeed *= 2; // Double speed during charge
        } else if (monster.userData.chargeTarget) {
            // Check if charge is complete
            const distanceToTarget = monster.position.distanceTo(monster.userData.chargeTarget);
            if (distanceToTarget < 5) {
                // End charge
                monster.userData.chargeTarget = null;
                monster.userData.moveSpeed /= 2; // Return to normal speed
                monster.userData.changeDirectionTimer = 0;
            }
        } else {
            // Normal behavior when not charging
            this.updateBasicBehavior(monster, delta);
        }
    }

    static getRandomType(wave) {
        // Determine which types are available based on wave
        const availableTypes = [MonsterTypes.BASIC];
        
        if (wave >= 2) availableTypes.push(MonsterTypes.FAST);
        if (wave >= 3) availableTypes.push(MonsterTypes.ZIGZAG);
        if (wave >= 4) availableTypes.push(MonsterTypes.CHARGER);
        if (wave >= 5) availableTypes.push(MonsterTypes.TANK);
        
        // Weight distribution (more basics, fewer special types)
        const weights = {
            [MonsterTypes.BASIC]: 50,
            [MonsterTypes.FAST]: 20,
            [MonsterTypes.ZIGZAG]: 15,
            [MonsterTypes.CHARGER]: 10,
            [MonsterTypes.TANK]: 5
        };
        
        const totalWeight = availableTypes.reduce((sum, type) => sum + weights[type], 0);
        let random = Math.random() * totalWeight;
        
        for (const type of availableTypes) {
            random -= weights[type];
            if (random <= 0) return type;
        }
        
        return MonsterTypes.BASIC;
    }
}

// Made with Bob