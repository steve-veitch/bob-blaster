# Audio (Runtime Contract)

## Required API surface
The UI and game loop require a global `audioSystem` with:
- enabled (boolean)
- masterVolume, sfxVolume, musicVolume (0..1 floats)
- toggle() -> boolean (returns enabled state)
- setMasterVolume(v)
- setSFXVolume(v)
- setMusicVolume(v)
- playSound(name)
- pauseMusic(), resumeMusic(), stopMusic()

## Persistence
Current runtime does **not** persist audio settings to localStorage.
