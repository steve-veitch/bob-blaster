# Weapons (Runtime Contract)

## Weapon types
WeaponTypes must include:
- standard
- shotgun
- sniper
- machineGun
- rocket

## Integration with the main loop
The main game loop supports two shooting paths:

### A) Fallback shooting path (if WeaponManager is not available)
- Uses a default Bob-logo projectile.
- Projectile speed: 150.0 (units/s multiplier used in velocity vector)
- Base shoot cooldown: 200 ms divided by PowerUpManager fire-rate multiplier.

### B) Weapon system path (if WeaponManager exists and is functional)
WeaponManager must provide:
- unlockWeapon(type)
- switchWeapon(type) -> boolean
- getCurrentWeapon() -> Weapon
- update(delta)

Weapon must provide:
- config.name (string)
- config.color (hex int)
- canFire() -> boolean
- fire(camera, scene, projectiles) -> list of created projectiles
- getAmmoDisplay() -> string

**Note:** The provided weaponSystem.js is incomplete; therefore this doc specifies the required contract.
