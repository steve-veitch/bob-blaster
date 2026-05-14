/**
 * Achievement System for BPSS v8
 * Tracks player accomplishments and statistics
 */

const Achievements = {
    FIRST_BLOOD: { id: 'first_blood', name: 'First Blood', desc: 'Defeat your first monster', icon: '🎯' },
    WAVE_5: { id: 'wave_5', name: 'Survivor', desc: 'Reach wave 5', icon: '🌊' },
    WAVE_10: { id: 'wave_10', name: 'Veteran', desc: 'Reach wave 10', icon: '⭐' },
    WAVE_20: { id: 'wave_20', name: 'Legend', desc: 'Reach wave 20', icon: '👑' },
    COMBO_10: { id: 'combo_10', name: 'Combo Master', desc: 'Achieve a 10x combo', icon: '🔥' },
    PERFECT_WAVE: { id: 'perfect_wave', name: 'Flawless', desc: 'Complete a wave without taking damage', icon: '💎' },
    BOSS_SLAYER: { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat your first boss', icon: '⚔️' },
    SHARPSHOOTER: { id: 'sharpshooter', name: 'Sharpshooter', desc: 'Achieve 90% accuracy in a game', icon: '🎯' },
    COLLECTOR: { id: 'collector', name: 'Collector', desc: 'Collect 10 power-ups in one game', icon: '💫' },
    SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', desc: 'Defeat 50 monsters in under 5 minutes', icon: '⚡' },
    TANK_BUSTER: { id: 'tank_buster', name: 'Tank Buster', desc: 'Defeat 10 Tank monsters', icon: '💪' },
    ARSENAL: { id: 'arsenal', name: 'Arsenal', desc: 'Unlock all weapons', icon: '🔫' },
    HIGH_SCORE_10K: { id: 'high_score_10k', name: 'Score Hunter', desc: 'Score 10,000 points', icon: '💯' },
    HIGH_SCORE_50K: { id: 'high_score_50k', name: 'Score Master', desc: 'Score 50,000 points', icon: '🏆' },
    NO_DAMAGE_BOSS: { id: 'no_damage_boss', name: 'Untouchable', desc: 'Defeat a boss without taking damage', icon: '🛡️' }
};

class AchievementSystem {
    constructor() {
        this.unlockedAchievements = new Set();
        this.statistics = {
            totalKills: 0,
            totalDeaths: 0,
            totalScore: 0,
            highestWave: 0,
            highestCombo: 0,
            totalPowerUps: 0,
            bossesDefeated: 0,
            tanksDefeated: 0,
            totalShots: 0,
            totalHits: 0,
            gamesPlayed: 0,
            totalPlayTime: 0,
            weaponsUnlocked: 1,
            perfectWaves: 0
        };
        
        this.sessionStats = {
            kills: 0,
            powerUpsCollected: 0,
            damageTaken: false,
            startTime: 0,
            bossNoDamage: true
        };
        
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('bpss_achievements');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedAchievements = new Set(data.achievements || []);
            this.statistics = { ...this.statistics, ...data.statistics };
        }
    }

    saveProgress() {
        localStorage.setItem('bpss_achievements', JSON.stringify({
            achievements: Array.from(this.unlockedAchievements),
            statistics: this.statistics
        }));
    }

    unlockAchievement(achievementId) {
        if (!this.unlockedAchievements.has(achievementId)) {
            this.unlockedAchievements.add(achievementId);
            this.saveProgress();
            this.showAchievementNotification(achievementId);
            
            // Play achievement sound
            if (typeof audioSystem !== 'undefined') {
                audioSystem.playSound('powerup');
            }
            
            return true;
        }
        return false;
    }

    showAchievementNotification(achievementId) {
        const achievement = Object.values(Achievements).find(a => a.id === achievementId);
        if (!achievement) return;

        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 3px solid #ffd700;
            border-radius: 10px;
            padding: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            z-index: 3000;
            animation: achievementSlide 0.5s ease-out, achievementFadeOut 0.5s ease-in 3.5s forwards;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    checkAchievements(gameState) {
        // First Blood
        if (this.sessionStats.kills === 1) {
            this.unlockAchievement(Achievements.FIRST_BLOOD.id);
        }

        // Wave achievements
        if (gameState.wave >= 5) this.unlockAchievement(Achievements.WAVE_5.id);
        if (gameState.wave >= 10) this.unlockAchievement(Achievements.WAVE_10.id);
        if (gameState.wave >= 20) this.unlockAchievement(Achievements.WAVE_20.id);

        // Combo achievement
        if (gameState.combo >= 10) {
            this.unlockAchievement(Achievements.COMBO_10.id);
        }

        // Score achievements
        if (gameState.score >= 10000) this.unlockAchievement(Achievements.HIGH_SCORE_10K.id);
        if (gameState.score >= 50000) this.unlockAchievement(Achievements.HIGH_SCORE_50K.id);

        // Accuracy achievement
        const accuracy = gameState.shots > 0 ? (gameState.hits / gameState.shots) * 100 : 0;
        if (accuracy >= 90 && gameState.shots >= 50) {
            this.unlockAchievement(Achievements.SHARPSHOOTER.id);
        }

        // Collector achievement
        if (this.sessionStats.powerUpsCollected >= 10) {
            this.unlockAchievement(Achievements.COLLECTOR.id);
        }

        // Perfect wave
        if (!this.sessionStats.damageTaken && gameState.waveComplete) {
            this.statistics.perfectWaves++;
            this.unlockAchievement(Achievements.PERFECT_WAVE.id);
        }
    }

    onKill(monsterType) {
        this.sessionStats.kills++;
        this.statistics.totalKills++;
        
        if (monsterType === 'tank') {
            this.statistics.tanksDefeated++;
            if (this.statistics.tanksDefeated >= 10) {
                this.unlockAchievement(Achievements.TANK_BUSTER.id);
            }
        }
        
        this.saveProgress();
    }

    onBossDefeated(noDamage) {
        this.statistics.bossesDefeated++;
        this.unlockAchievement(Achievements.BOSS_SLAYER.id);
        
        if (noDamage) {
            this.unlockAchievement(Achievements.NO_DAMAGE_BOSS.id);
        }
        
        this.saveProgress();
    }

    onPowerUpCollected() {
        this.sessionStats.powerUpsCollected++;
        this.statistics.totalPowerUps++;
        this.saveProgress();
    }

    onDamageTaken() {
        this.sessionStats.damageTaken = true;
        this.sessionStats.bossNoDamage = false;
    }

    onWeaponUnlocked() {
        this.statistics.weaponsUnlocked++;
        if (this.statistics.weaponsUnlocked >= 5) {
            this.unlockAchievement(Achievements.ARSENAL.id);
        }
        this.saveProgress();
    }

    startSession() {
        this.sessionStats = {
            kills: 0,
            powerUpsCollected: 0,
            damageTaken: false,
            startTime: Date.now(),
            bossNoDamage: true
        };
        this.statistics.gamesPlayed++;
    }

    endSession(finalStats) {
        const playTime = (Date.now() - this.sessionStats.startTime) / 1000;
        this.statistics.totalPlayTime += playTime;
        this.statistics.totalScore += finalStats.score;
        this.statistics.totalShots += finalStats.shots;
        this.statistics.totalHits += finalStats.hits;
        
        if (finalStats.wave > this.statistics.highestWave) {
            this.statistics.highestWave = finalStats.wave;
        }
        
        if (finalStats.combo > this.statistics.highestCombo) {
            this.statistics.highestCombo = finalStats.combo;
        }
        
        // Speed demon check
        if (this.sessionStats.kills >= 50 && playTime < 300) {
            this.unlockAchievement(Achievements.SPEED_DEMON.id);
        }
        
        this.statistics.totalDeaths++;
        this.saveProgress();
    }

    update(delta) {
        // Achievement system is event-driven, no per-frame updates needed
        // This method exists for compatibility with the game loop
    }

    getProgress() {
        const total = Object.keys(Achievements).length;
        const unlocked = this.unlockedAchievements.size;
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    getStatistics() {
        return {
            ...this.statistics,
            averageAccuracy: this.statistics.totalShots > 0 
                ? Math.round((this.statistics.totalHits / this.statistics.totalShots) * 100) 
                : 0,
            averageScore: this.statistics.gamesPlayed > 0
                ? Math.round(this.statistics.totalScore / this.statistics.gamesPlayed)
                : 0,
            killDeathRatio: this.statistics.totalDeaths > 0
                ? (this.statistics.totalKills / this.statistics.totalDeaths).toFixed(2)
                : this.statistics.totalKills,
            playTimeFormatted: this.formatTime(this.statistics.totalPlayTime)
        };
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    displayAchievements() {
        const container = document.getElementById('achievementsList');
        if (!container) return;

        let html = '';
        for (const achievement of Object.values(Achievements)) {
            const unlocked = this.unlockedAchievements.has(achievement.id);
            html += `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon-large">${achievement.icon}</div>
                    <div class="achievement-details">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.desc}</div>
                    </div>
                    ${unlocked ? '<div class="achievement-check">✓</div>' : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    reset() {
        if (confirm('Are you sure you want to reset all achievements and statistics? This cannot be undone!')) {
            this.unlockedAchievements.clear();
            this.statistics = {
                totalKills: 0,
                totalDeaths: 0,
                totalScore: 0,
                highestWave: 0,
                highestCombo: 0,
                totalPowerUps: 0,
                bossesDefeated: 0,
                tanksDefeated: 0,
                totalShots: 0,
                totalHits: 0,
                gamesPlayed: 0,
                totalPlayTime: 0,
                weaponsUnlocked: 1,
                perfectWaves: 0
            };
            this.saveProgress();
        }
    }
}

// Made with Bob