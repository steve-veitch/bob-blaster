/**
 * Weapon System for BPSS v7
 * Multiple weapon types with different behaviors
 */

const WeaponTypes = {
    STANDARD: 'standard',      // Default Bob projectile
    SHOTGUN: 'shotgun',        // Spread shot
    SNIPER: 'sniper',          // High damage, slow fire
    MACHINE_GUN: 'machineGun', // Rapid fire, low damage
    ROCKET: 'rocket'           // Explosive projectiles
};

class Weapon {
    constructor(type) {
        this.type = type;
        this.config = this.getConfig(type);
        this.ammo = this.config.maxAmmo;
        this.cooldownTimer = 0;
    }

    getConfig(type) {
        switch(type) {
            case WeaponTypes.STANDARD:
                return {
                    name: 'Bob Blaster',
                    damage: 100,
                    fireRate: 200,
                    projectileSpeed: 150,
                    projectileCount: 1,
                    spread: 0,
                    maxAmmo: Infinity,
                    color: 0x0f62fe,
                    size: 2
                };
            
            case WeaponTypes.SHOTGUN:
                return {
                    name: 'Problem Spreader',
                    damage: 60,
                    fireRate: 800,
                    projectileSpeed: 120,
                    projectileCount: 5,
                    spread: 0.15,
                    maxAmmo: 24,
                    color: 0xff6600,
                    size: 1.5
                };
            
            case WeaponTypes.SNIPER:
                return {
                    name: 'Solution Rifle',
                    damage: 300,
                    fireRate: 1500,
                    projectileSpeed: 250,
                    projectileCount: 1,
                    spread: 0,
                    maxAmmo: 15,
                    color: 0x00ff00,
                    size: 1
                };
            
            case WeaponTypes.MACHINE_GUN:
                return {
                    name: 'Rapid Resolver',
                    damage: 40,
                    fireRate: 100,
                    projectileSpeed: 180,
                    projectileCount: 1,
                    spread: 0.05,
                    maxAmmo: 200,
                    color: 0xffff00,
                    size: 1.2
                };
            
            case WeaponTypes.ROCKET:
                return {
                    name: 'Crisis Launcher',
                    damage: 250,
                    fireRate: 2000,
                    projectileSpeed: 100,
                    projectileCount: 1,
                    spread: 0,
                    maxAmmo: 10,
                    explosionRadius: 15,
                    color: 0xff0000,
                    size: 3
                };
            
            default:
                return this.getConfig(WeaponTypes.STANDARD);
        }
    }

    canFire() {
        return this.cooldownTimer <= 0 && (this.ammo > 0 || this.ammo === Infinity);
    }

    fire(camera, scene, projectiles) {
        if (!this.canFire()) return [];

        const newProjectiles = [];
        
        for (let i = 0; i < this.config.projectileCount; i++) {
            const projectile = this.createProjectile(camera, i);
            scene.add(projectile);
            projectiles.push(projectile);
            newProjectiles.push(projectile);
        }

        if (this.ammo !== Infinity) {
            this.ammo--;
        }

        this.cooldownTimer = this.config.fireRate;

        // Play weapon-specific sound
        if (typeof audioSystem !== 'undefined') {
            audioSystem.playSound('shoot');
        }

        return newProjectiles;
    }

    createProjectile(camera, index) {
        const projectile = this.createProjectileVisual();
        projectile.position.copy(camera.position);

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        // Apply spread for multi-projectile weapons
        if (this.config.projectileCount > 1) {
            const spreadAngle = this.config.spread * (index - (this.config.projectileCount - 1) / 2);
            const spreadDir = direction.clone();
            spreadDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
            direction.copy(spreadDir);
        } else if (this.config.spread > 0) {
            // Random spread for machine gun
            direction.x += (Math.random() - 0.5) * this.config.spread;
            direction.y += (Math.random() - 0.5) * this.config.spread;
            direction.z += (Math.random() - 0.5) * this.config.spread;
            direction.normalize();
        }

        projectile.userData.velocity = direction.multiplyScalar(this.config.projectileSpeed);
        projectile.userData.damage = this.config.damage;
        projectile.userData.weaponType = this.type;
        projectile.userData.explosionRadius = this.config.explosionRadius || 0;

        return projectile;
    }

    createProjectileVisual() {
        // All weapons now use Bob logo variants with different colors and sizes
        return this.createBobLogo();
    }

    createBobLogo() {
        // Get weapon-specific colors and scale
        const weaponColors = this.getWeaponColors();
        const scale = this.config.size;
        
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(128, 128);
        ctx.scale(1.8, 1.8);
        
        // Hard hat with weapon-specific color
        ctx.fillStyle = weaponColors.hat;
        ctx.strokeStyle = weaponColors.hatStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -35, 28, Math.PI, 0, false);
        ctx.lineTo(25, -35);
        ctx.lineTo(25, -30);
        ctx.lineTo(-25, -30);
        ctx.lineTo(-25, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Hat brim
        ctx.fillStyle = weaponColors.hatBrim;
        ctx.fillRect(-30, -30, 60, 5);
        ctx.strokeRect(-30, -30, 60, 5);
        
        // Hat stripe
        ctx.fillStyle = weaponColors.hatStroke;
        ctx.fillRect(-25, -42, 50, 4);
        
        // Robot head
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-25, -25, 50, 45, 8);
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-12, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-10, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Body
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-22, 22, 44, 35, 6);
        ctx.fill();
        ctx.stroke();
        
        // Weapon symbol on body
        ctx.fillStyle = weaponColors.symbol;
        ctx.fillRect(-15, 28, 30, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(weaponColors.icon, 0, 39);
        
        ctx.restore();
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(scale, scale, 1);
        
        return sprite;
    }
    
    getWeaponColors() {
        switch(this.type) {
            case WeaponTypes.STANDARD:
                return {
                    hat: '#3B82F6',        // Blue
                    hatStroke: '#1E40AF',
                    hatBrim: '#60A5FA',
                    symbol: '#3B82F6',
                    icon: '</>'
                };
            case WeaponTypes.SHOTGUN:
                return {
                    hat: '#FF6600',        // Orange
                    hatStroke: '#CC5200',
                    hatBrim: '#FF8833',
                    symbol: '#FF6600',
                    icon: '⚡'
                };
            case WeaponTypes.SNIPER:
                return {
                    hat: '#00FF00',        // Green
                    hatStroke: '#00CC00',
                    hatBrim: '#33FF33',
                    symbol: '#00FF00',
                    icon: '◎'
                };
            case WeaponTypes.MACHINE_GUN:
                return {
                    hat: '#FFFF00',        // Yellow
                    hatStroke: '#CCCC00',
                    hatBrim: '#FFFF33',
                    symbol: '#FFFF00',
                    icon: '≡'
                };
            case WeaponTypes.ROCKET:
                return {
                    hat: '#FF0000',        // Red
                    hatStroke: '#CC0000',
                    hatBrim: '#FF3333',
                    symbol: '#FF0000',
                    icon: '★'
                };
            default:
                return this.getWeaponColors.call({type: WeaponTypes.STANDARD});
        }
    }

    update(delta) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= delta * 1000;
        }
    }

    reload() {
        this.ammo = this.config.maxAmmo;
    }

    getAmmoDisplay() {
        if (this.ammo === Infinity) {
            return '∞';
        }
        return `${this.ammo}/${this.config.maxAmmo}`;
    }
}

class WeaponManager {
    constructor() {
        this.weapons = {};
        this.currentWeapon = null;
        this.unlockedWeapons = [WeaponTypes.STANDARD];
        
        // Initialize all weapons
        Object.values(WeaponTypes).forEach(type => {
            this.weapons[type] = new Weapon(type);
        });
        
        this.currentWeapon = this.weapons[WeaponTypes.STANDARD];
    }

    switchWeapon(type) {
        if (this.unlockedWeapons.includes(type)) {
            this.currentWeapon = this.weapons[type];
            return true;
        }
        return false;
    }

    unlockWeapon(type) {
        if (!this.unlockedWeapons.includes(type)) {
            this.unlockedWeapons.push(type);
        }
    }

    getCurrentWeapon() {
        return this.currentWeapon;
    }

    update(delta) {
        this.currentWeapon.update(delta);
    }

    reset() {
        // In v23, keep all weapons unlocked (don't reset unlockedWeapons)
        // Just reset to standard weapon and reload all ammo
        this.currentWeapon = this.weapons[WeaponTypes.STANDARD];
        Object.values(this.weapons).forEach(weapon => weapon.reload());
    }
}

// Made with Bob