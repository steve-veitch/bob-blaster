# Waves, Spawning & Difficulty

## Wave composition
- Base monsters per wave: **7**
- Total monsters in wave:
  - `total = monstersPerWave + floor((wave - 1) * 1.5)`

## Endless difficulty multiplier
- Endless mode is enabled.
- Multiplier: `1.0 + (wave - 1) * 0.15`

## Spawn positions
- Spawn region: x,z ∈ [-80, 80]
- Spawn height: y = 8
- Minimum distance between spawns: 20 units
- Up to 100 attempts per spawn point

## Monster movement bounds (WaveSystem)
- Soft bounds with reflection near edges:
  - maxX/maxZ = 90
  - margin = 10
  - When outside margin, invert moveDirection component and clamp position.

## HUD updates
- `waveDisplay` shows current wave number.
- `monstersDisplay` shows `killed/total`.
