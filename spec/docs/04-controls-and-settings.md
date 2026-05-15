# Controls, Rebinding & Persistence

## Default bindings
- Move: W/S/A/D (by key codes KeyW/KeyS/KeyA/KeyD)
- Shoot: Space (code: Space)
- Weapons: 1–5 (codes: Digit1..Digit5)
- Pause: Escape

## Rebinding
- Config UI captures the next keydown OR mouse button (Mouse0/Mouse1/Mouse2).
- Captured value stored as the binding code.

## Persistence (localStorage)
- Key: `bpss_keyBindings`
- Value: JSON object (see schemas/keybindings.schema.json)

## Merge rule (normative)
On load, **merge saved bindings over defaults** to preserve newly introduced bindings (e.g., weapon1–weapon5).
