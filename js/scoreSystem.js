// Score and Statistics Tracking System

class ScoreSystem {
    constructor() {
        this.score = 0;
        this.kills = 0;
        this.shots = 0;
        this.hits = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 3; // seconds
        this.maxCombo = 0;
        
        // Score values
        this.killPoints = 100;
        this.comboMultiplier = 1.5;
        this.waveBonus = 500;
    }

    reset() {
        this.score = 0;
        this.kills = 0;
        this.shots = 0;
        this.hits = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
    }

    addKill(basePoints = 100) {
        this.kills++;
        this.hits++;
        this.combo++;
        this.comboTimer = this.comboTimeout;
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Calculate points with combo multiplier
        let points = basePoints;
        if (this.combo > 1) {
            points *= Math.pow(this.comboMultiplier, this.combo - 1);
        }
        
        this.score += Math.floor(points);
        this.updateDisplay();
        
        // Show combo if > 1
        if (this.combo > 1) {
            this.showCombo();
        }
    }

    addShot() {
        this.shots++;
    }

    addWaveBonus(waveNumber) {
        const bonus = this.waveBonus * waveNumber;
        this.score += bonus;
        this.updateDisplay();
        return bonus;
    }

    update(delta) {
        if (this.combo > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.hideCombo();
            }
        }
    }

    getAccuracy() {
        if (this.shots === 0) return 0;
        return Math.floor((this.hits / this.shots) * 100);
    }

    updateDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score.toLocaleString();
        }
    }

    showCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        const comboValue = document.getElementById('comboValue');
        
        if (comboDisplay && comboValue) {
            comboValue.textContent = `x${this.combo}`;
            comboDisplay.style.display = 'block';
        }
    }

    hideCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        if (comboDisplay) {
            comboDisplay.style.display = 'none';
        }
    }

    getStats() {
        return {
            score: this.score,
            kills: this.kills,
            accuracy: this.getAccuracy(),
            maxCombo: this.maxCombo,
            shots: this.shots,
            hits: this.hits
        };
    }
}

// High Score Management
class HighScoreManager {
    constructor() {
        this.maxScores = 10;
        this.storageKey = 'bpss_highscores';
        this.scores = this.loadScores();
    }

    loadScores() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    addScore(score, wave, kills, accuracy) {
        const entry = {
            score: score,
            wave: wave,
            kills: kills,
            accuracy: accuracy,
            date: new Date().toISOString()
        };

        this.scores.push(entry);
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, this.maxScores);
        this.saveScores();

        return this.getScoreRank(score);
    }

    getScoreRank(score) {
        const index = this.scores.findIndex(s => s.score === score);
        return index >= 0 ? index + 1 : -1;
    }

    isHighScore(score) {
        if (this.scores.length < this.maxScores) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    clearScores() {
        this.scores = [];
        this.saveScores();
    }

    displayScores() {
        const container = document.getElementById('highScoresList');
        if (!container) return;

        if (this.scores.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No high scores yet. Be the first!</p>';
            return;
        }

        container.innerHTML = this.scores.map((entry, index) => {
            const rank = index + 1;
            const isTop = rank <= 3;
            const date = new Date(entry.date).toLocaleDateString();
            
            return `
                <div class="score-entry ${isTop ? 'top' : ''}">
                    <span class="score-rank">#${rank}</span>
                    <span class="score-value">${entry.score.toLocaleString()}</span>
                    <span class="score-wave">Wave ${entry.wave}</span>
                    <span class="score-date">${date}</span>
                </div>
            `;
        }).join('');
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoreSystem, HighScoreManager };
}

// Made with Bob
