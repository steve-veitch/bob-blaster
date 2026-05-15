# Runtime Architecture

## High-level runtime
- Single-page HTML app loads Three.js and a set of game systems, then runs a single render loop (`animate`).

## Initialization order (normative)
1. Instantiate: GameStateManager, ScoreSystem, HighScoreManager, PlayerHealth.
2. Setup Three.js: scene, camera, renderer, lighting, floor, arena walls.
3. Instantiate ParticleSystem.
4. Instantiate PowerUpManager and WaveSystem; instantiate CollisionSystem.
5. Optionally instantiate BossManager and WeaponManager **if their classes exist**.
6. Register input handlers (keyboard/mouse) and UI handlers (menus).
7. Load saved key bindings from localStorage and merge onto defaults.
8. Enter MENU state.

## Frame update order (normative)
When state is PLAYING and pointer lock is active:
1. Movement: apply speed multiplier from power-ups; update velocity; apply horizontal-only movement; clamp Y to ground level (10.0).
2. Update: WaveSystem (monsters), projectiles, ScoreSystem, PlayerHealth, ParticleSystem, PowerUpManager.
3. Update optional systems if present (boss, weapons, environment, events, etc.).
4. Collision damage: monsters within collision distance damage player.
5. Render.

When not PLAYING: ParticleSystem may still update.
