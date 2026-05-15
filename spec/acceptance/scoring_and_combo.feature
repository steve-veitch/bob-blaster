Feature: Scoring, combo multiplier, and wave bonus

  Scenario: First kill grants base points
    Given a new ScoreSystem
    When the player records a kill worth 100 points
    Then total score is 100
    And kills is 1

  Scenario: Combo increases points via multiplier
    Given a new ScoreSystem
    When the player records 2 kills worth 100 points each within 3.0 seconds
    Then combo is 2
    And total score is greater than 200

  Scenario: Wave bonus is 500 per wave number
    Given a new ScoreSystem
    When the player completes wave 3
    Then a wave bonus of 1500 is awarded
