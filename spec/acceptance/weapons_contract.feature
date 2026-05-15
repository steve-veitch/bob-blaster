Feature: Weapon system contract required by the main loop

  Scenario: WeaponTypes includes five identifiers
    Given WeaponTypes is defined
    Then it includes standard, shotgun, sniper, machineGun, and rocket

  Scenario: WeaponManager exposes required methods
    Given a WeaponManager exists
    Then it provides unlockWeapon, switchWeapon, getCurrentWeapon, and update

  Scenario: Current weapon exposes required fields/methods
    Given WeaponManager has a current weapon
    Then the weapon exposes config.name, config.color, canFire, fire, and getAmmoDisplay
