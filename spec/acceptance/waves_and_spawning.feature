Feature: Wave composition and spawning

  Scenario: Wave 1 spawns 7 monsters
    Given a new WaveSystem
    When wave 1 starts
    Then totalMonstersInWave equals 7

  Scenario: Wave N scales monster count
    Given a new WaveSystem
    And current wave is 5
    When the wave starts
    Then totalMonstersInWave equals 7 + floor((5 - 1) * 1.5)

  Scenario: Spawn positions are within the allowed area
    Given a new WaveSystem
    When spawn positions are generated for 20 monsters
    Then each spawn has x between -80 and 80
    And each spawn has z between -80 and 80

  Scenario: Spawn positions respect minimum separation
    Given a new WaveSystem
    When spawn positions are generated for 20 monsters
    Then the distance between any two spawns is at least 20
