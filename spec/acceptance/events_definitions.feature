Feature: Random event definitions

  Scenario: Events exist with fixed interval
    Given an EventSystem
    Then the event interval is 30 seconds

  Scenario: Event catalog contains expected keys
    Given an EventSystem
    Then the event keys include meteorShower, powerSurge, monsterFrenzy, healingRain, timeWarp, lootBonanza, fogOfWar, berserk
