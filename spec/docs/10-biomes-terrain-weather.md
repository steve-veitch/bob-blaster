# Biomes, Terrain & Weather

## Biomes (data-driven)
Biome configuration includes:
- skyColor, fogColor, fogDensity
- ambientLight, directionalLight
- terrainColors: low/mid/high RGB

See schemas/biomes.schema.json.

## Terrain (provided config only)
Terrain system exposes configuration such as:
- terrainSize
- segments
- maxHeight

Advanced generation behaviour is not present in the provided file set.

## Weather (provided state only)
Weather system exposes state fields:
- currentWeather
- weatherDuration, weatherTimer
- transitionTime

Particle effects and fog transitions are not implemented in the provided file set.
