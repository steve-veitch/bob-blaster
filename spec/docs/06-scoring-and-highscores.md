# Scoring, Combo & High Scores

## Kill scoring
- Base kill points default: 100
- Combo multiplier: **1.5** applied exponentially for combo > 1
  - points = basePoints * (comboMultiplier)^(combo-1)
- Combo timeout: **3.0 seconds**

## Wave bonus
- Bonus = **500 × waveNumber**

## Accuracy
- accuracy = floor((hits / shots) * 100)

## High scores
- Persist top 10 entries in localStorage key `bpss_highscores`
- Entries sorted by descending score
- Each entry includes ISO date.
