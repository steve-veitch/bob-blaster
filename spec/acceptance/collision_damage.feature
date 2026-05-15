Feature: Monster collision damage

  Scenario: Monster within collision distance damages player
    Given the player is alive
    And a monster is within distance 5.0 of the camera
    When collision checks run
    Then the player takes 10 damage
