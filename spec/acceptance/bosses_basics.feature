Feature: Boss rules

  Scenario: Boss interval is 5 waves
    Given boss wave interval is 5
    When the current wave is 5
    Then a boss encounter is eligible

  Scenario: Boss health scales with wave
    Given a boss created at wave 5
    Then boss health is 3500
