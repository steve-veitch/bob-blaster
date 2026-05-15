Feature: Configurable controls and persistence

  Scenario: Default bindings exist including weapons 1-5
    Given default key bindings are loaded
    Then "weapon1" is "Digit1"
    And "weapon5" is "Digit5"

  Scenario: Saved bindings are merged over defaults
    Given localStorage contains "bpss_keyBindings" with {"moveForward":"ArrowUp"}
    When bindings are loaded
    Then "moveForward" is "ArrowUp"
    And "weapon1" still exists

  Scenario: Shoot can be bound to mouse button
    Given the config menu is open
    When the player binds "shoot" to "Mouse0"
    Then the shoot binding is "Mouse0"
