Feature: Audio system contract required by UI and game loop

  Scenario: AudioSystem supports UI interactions
    Given audioSystem exists
    Then it supports toggle, setMasterVolume, setSFXVolume, and setMusicVolume

  Scenario: AudioSystem supports core gameplay sound events
    Given audioSystem exists
    Then it supports playSound for click, shoot, hit, damage, powerup, victory, and gameover
