Feature: Endless mode difficulty multiplier

  Scenario: Endless mode multiplier is 1.0 at wave 1
    Given endless mode is enabled
    And current wave is 1
    When difficulty multiplier is requested
    Then the multiplier equals 1.0

  Scenario: Endless mode increases by 15% per wave
    Given endless mode is enabled
    And current wave is 5
    When difficulty multiplier is requested
    Then the multiplier equals 1.0 + (5 - 1) * 0.15
