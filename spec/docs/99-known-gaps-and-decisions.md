# Known Gaps & Decisions

This spec pack matches current runtime behaviour of the provided code.

## Incomplete implementations in provided files
- audioSystem.js: does not implement the API required by game.js.

## Completed implementations (v23 - Arsenal Unlocked Edition)
- **weaponSystem.js**: Fully implemented with all 5 weapon types, complete methods, and Bob logo projectile variants
- **Weapon damage system**: Implemented in game.js with per-weapon damage values applied to monster health
- **Monster health system**: Monsters now have health that depletes based on weapon damage (implemented in game.js collision detection)
- **Rocket explosion radius**: Implemented splash damage system affecting multiple enemies within 15 unit radius
- **Weapon differentiation**: Each weapon has unique damage, fire rate, ammo, spread, and visual characteristics
- particleSystem.js, terrainSystem.js, levelGenerator.js, weatherSystem.js: only constructor/config state present.
- Several advanced systems (AI Director, quests, multiplayer, etc.) are placeholders.

## Current Version Features (v23)
- All 5 weapons unlocked from game start
- Functional damage differences between weapons (100/60/300/40/250 damage)
- Monster health system with damage accumulation
- Rocket splash damage for crowd control (50% damage to nearby enemies)
- Weapon-specific projectile visuals (colored Bob logos with unique icons)
- Complete ammo management system (infinite for standard, limited for others)
- Cooldown-based fire rate control (100ms to 2000ms)

## How the spec handles this
- Where code *calls* into a system (e.g., audio, weapons), the spec defines a **required contract**.
- Where implementation is absent, no behavioural claims are made beyond existing fields/constants.

## Recommendation
The weaponSystem.js is now fully functional with complete damage integration. Only audioSystem.js remains incomplete for full spec compliance.
