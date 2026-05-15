Feature: High score persistence

  Scenario: Adding a score stores it and keeps top 10
    Given localStorage is empty for "bpss_highscores"
    When a score entry is added
    Then localStorage "bpss_highscores" contains the entry
    And no more than 10 entries are stored
    And entries are sorted by descending score
