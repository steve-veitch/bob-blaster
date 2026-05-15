# BPSS / Bob Blaster v23 — Spec Pack (Code-Truth)

**Purpose:** These specifications and contracts are derived from the *current runtime behaviour* of the provided code ("code-first truth").

## Scope
This spec pack is intended to let a developer recreate the game without reading the original implementation, by using:
- **Human-readable behaviour specs** (docs)
- **Machine-readable schemas** (JSON Schema)
- **Acceptance tests** (Gherkin)

## Canonical sources
When documents (README/CHANGELOG) and code disagree, **the code wins**.

## What this pack covers
### Fully specified (implemented in provided code)
- Game state machine + UI screen mapping
- Controls & key rebinding + persistence (localStorage)
- Core loop invariants (pointer lock, movement clamped to ground)
- Scoring (combo, accuracy, wave bonus) + high score persistence
- Health, invulnerability, collision damage
- Waves: monster count scaling, spawn positions, endless difficulty multiplier
- Event definitions (names, durations, effects) and event interval
- Biome configuration data
- Boss interval and base scaling formula

### Fully Implemented Systems
- **Weapon system** (WeaponManager/Weapon with all 5 weapon types)
  - Complete damage system with per-weapon values
  - Monster health system with damage accumulation
  - Rocket explosion radius with splash damage
  - Weapon-specific visuals and behaviors
  - Ammo management and cooldown systems

### Contract-only (incomplete or stub in provided files)
- Audio system API surface (playSound/toggle/volume/music)
- Terrain/level generator/particles/weather advanced behaviour (only state/config in provided files)

See **docs/99-known-gaps-and-decisions.md**.
