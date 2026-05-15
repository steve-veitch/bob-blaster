Feature: Game state transitions and UI screens

  Scenario: Game starts in menu
    Given the game has initialized
    Then the current state is "menu"
    And the screen "mainMenu" is visible
    And the screen "gameHUD" is hidden

  Scenario: Starting a new game enters playing and requests pointer lock
    Given the current state is "menu"
    When the player clicks "startBtn"
    Then the current state is "playing"
    And pointer lock is requested on the document body

  Scenario: Escape pauses gameplay
    Given the current state is "playing"
    When the player presses "Escape"
    Then the current state is "paused"
    And the screen "pauseMenu" is visible
    And the screen "gameHUD" is visible
