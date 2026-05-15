# Known Gaps & Decisions

This spec pack matches current runtime behaviour of the provided code.

## Incomplete implementations in provided files
- weaponSystem.js: Weapon/WeaponManager bodies are incomplete.
- audioSystem.js: does not implement the API required by game.js.
- particleSystem.js, terrainSystem.js, levelGenerator.js, weatherSystem.js: only constructor/config state present.
- Several advanced systems (AI Director, quests, multiplayer, etc.) are placeholders.

## How the spec handles this
- Where code *calls* into a system (e.g., audio, weapons), the spec defines a **required contract**.
- Where implementation is absent, no behavioural claims are made beyond existing fields/constants.

## Recommendation
If you want the spec pack to be executable (tests green), provide the complete implementations for weaponSystem.js and audioSystem.js.
