# State Machine & UI Contract

## States
- menu
- playing
- paused
- gameOver
- waveComplete

## Screen mapping (DOM element IDs)
On **every** state change:
1. All screens are hidden.
2. The appropriate screen is shown.

Mapping:
- menu → `mainMenu`
- playing → `gameHUD`
- paused → `pauseMenu` + keep `gameHUD` visible
- gameOver → `gameOverScreen`
- waveComplete → `waveCompleteScreen` + keep `gameHUD` visible
