// Game State Management System
// Handles all game states: MENU, PLAYING, PAUSED, GAME_OVER, WAVE_COMPLETE

const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WAVE_COMPLETE: 'waveComplete'
};

class GameStateManager {
    constructor() {
        this.currentState = GameStates.MENU;
        this.previousState = null;
    }

    setState(newState) {
        this.previousState = this.currentState;
        this.currentState = newState;
        this.onStateChange(newState, this.previousState);
    }

    onStateChange(newState, oldState) {
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // Hide all screens
        this.hideAllScreens();
        
        // Show appropriate screen
        switch(newState) {
            case GameStates.MENU:
                this.showMainMenu();
                break;
            case GameStates.PLAYING:
                this.showGameHUD();
                break;
            case GameStates.PAUSED:
                this.showPauseMenu();
                break;
            case GameStates.GAME_OVER:
                this.showGameOver();
                break;
            case GameStates.WAVE_COMPLETE:
                this.showWaveComplete();
                break;
        }
    }

    hideAllScreens() {
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameHUD').style.display = 'none';
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('waveCompleteScreen').style.display = 'none';
        document.getElementById('highScoresScreen').style.display = 'none';
        document.getElementById('configMenu').style.display = 'none';
        document.getElementById('audioMenu').style.display = 'none';
    }

    showMainMenu() {
        document.getElementById('mainMenu').style.display = 'flex';
    }

    showGameHUD() {
        document.getElementById('gameHUD').style.display = 'block';
    }

    showPauseMenu() {
        document.getElementById('pauseMenu').style.display = 'flex';
        document.getElementById('gameHUD').style.display = 'block';
    }

    showGameOver() {
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    showWaveComplete() {
        document.getElementById('waveCompleteScreen').style.display = 'flex';
        document.getElementById('gameHUD').style.display = 'block';
    }

    isPlaying() {
        return this.currentState === GameStates.PLAYING;
    }

    isPaused() {
        return this.currentState === GameStates.PAUSED;
    }

    isGameOver() {
        return this.currentState === GameStates.GAME_OVER;
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameStateManager, GameStates };
}

// Made with Bob
