# Health, Damage & Collision

## Player health
- Max health: 100
- Taking damage:
  - If invulnerable or already dead: no effect
  - Otherwise subtract damage, clamp at 0
  - Set invulnerability for 1.5 seconds
  - Trigger damage indicator for 0.3 seconds

## Collision damage
- Collision distance: 5.0
- Damage per collision tick: 10
- If player reaches 0 HP → game over.

## Shield interaction
- If PowerUpManager reports `shouldBlockDamage()` then damage is blocked (one hit).
