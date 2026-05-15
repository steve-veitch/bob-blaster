# Weapons (Runtime Contract)

## Weapon types
WeaponTypes includes all 5 weapon types:
- **standard** - Bob Blaster (infinite ammo, 100 damage, 200ms fire rate)
- **shotgun** - Problem Spreader (24 ammo, 60 damage × 5 pellets, 800ms fire rate, 0.15 spread)
- **sniper** - Solution Rifle (15 ammo, 300 damage, 1500ms fire rate, high precision)
- **machineGun** - Rapid Resolver (200 ammo, 40 damage, 100ms fire rate, 0.05 spread)
- **rocket** - Crisis Launcher (10 ammo, 250 damage, 2000ms fire rate, 15 unit explosion radius)

## Weapon Damage System
All weapons now have functional damage differences:

### Damage Values
Each projectile carries `userData.damage` which is applied to monster health:
- Standard: 100 damage
- Shotgun: 60 damage per pellet (5 pellets = up to 300 total)
- Sniper: 300 damage (one-shot most enemies)
- Machine Gun: 40 damage (compensated by rapid fire)
- Rocket: 250 direct damage + 125 splash damage (50% to nearby enemies)

### Monster Health System
- Monsters have `userData.health` and `userData.maxHealth`
- Health depletes with each hit based on weapon damage
- Monsters only die when health reaches 0
- Tank monsters can survive multiple hits from weaker weapons

### Rocket Explosion Mechanics
- Rockets have `userData.explosionRadius` of 15 units
- All monsters within radius take 50% splash damage
- Creates enhanced visual effects (larger explosion, brighter light)
- Enables multi-kill potential for crowd control

## Integration with the main loop
The main game loop supports two shooting paths:

### A) Fallback shooting path (if WeaponManager is not available)
- Uses a default Bob-logo projectile
- Projectile speed: 150.0 (units/s multiplier used in velocity vector)
- Base shoot cooldown: 200 ms divided by PowerUpManager fire-rate multiplier
- Default damage: 100

### B) Weapon system path (WeaponManager active - current implementation)
WeaponManager provides:
- `unlockWeapon(type)` - Unlocks weapon for player use
- `switchWeapon(type)` -> boolean - Switches to weapon if unlocked
- `getCurrentWeapon()` -> Weapon - Returns active weapon instance
- `update(delta)` - Updates cooldown timers

Weapon provides:
- `config.name` (string) - Display name
- `config.color` (hex int) - Weapon color code
- `config.damage` (number) - Damage per hit
- `config.explosionRadius` (number) - Splash damage radius (rockets only)
- `canFire()` -> boolean - Checks ammo and cooldown
- `fire(camera, scene, projectiles)` -> array - Creates projectiles with damage/velocity
- `getAmmoDisplay()` -> string - Returns ammo count or '∞'
- `update(delta)` - Updates weapon cooldown

## Projectile Data
Each projectile carries:
- `userData.velocity` - Movement vector
- `userData.damage` - Damage amount to apply
- `userData.weaponType` - Source weapon identifier
- `userData.explosionRadius` - Splash damage radius (0 for non-explosive)

**Status:** The weaponSystem.js is fully implemented with complete damage system integration in game.js.
