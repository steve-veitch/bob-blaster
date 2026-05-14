/**
 * Event System - BPSS v22
 * Random events that occur during gameplay
 */

class EventSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.activeEvents = [];
        this.eventTimer = 0;
        this.eventInterval = 30; // seconds between events
        this.events = {
            meteorShower: {
                name: 'Meteor Shower',
                duration: 10,
                effect: 'Meteors fall from sky dealing damage'
            },
            powerSurge: {
                name: 'Power Surge',
                duration: 15,
                effect: 'All weapons deal double damage'
            },
            monsterFrenzy: {
                name: 'Monster Frenzy',
                duration: 20,
                effect: 'Monsters spawn at 2x rate'
            },
            healingRain: {
                name: 'Healing Rain',
                duration: 12,
                effect: 'Player slowly regenerates health'
            },
            timeWarp: {
                name: 'Time Warp',
                duration: 10,
                effect: 'Everything moves in slow motion'
            },
            lootBonanza: {
                name: 'Loot Bonanza',
                duration: 15,
                effect: 'Power-ups spawn at 3x rate'
            },
            fogOfWar: {
                name: 'Fog of War',
                duration: 20,
                effect: 'Visibility reduced dramatically'
            },
            berserk: {
                name: 'Berserk Mode',
                duration: 10,
                effect: 'Movement speed doubled, take more damage'
            }
        };
        console.log('eventSystem initialized for v22');
    }
    
    init() {
        this.initialized = true;
        console.log('Event system ready');
    }
    
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Update event timer
        this.eventTimer += deltaTime;
        
        // Trigger random event
        if (this.eventTimer >= this.eventInterval) {
            this.triggerRandomEvent();
            this.eventTimer = 0;
            // Randomize next interval
            this.eventInterval = 25 + Math.random() * 20;
        }
        
        // Update active events
        for (let i = this.activeEvents.length - 1; i >= 0; i--) {
            const event = this.activeEvents[i];
            event.timeRemaining -= deltaTime;
            
            // Update event effects
            this.updateEventEffect(event, deltaTime);
            
            // Remove expired events
            if (event.timeRemaining <= 0) {
                this.endEvent(event);
                this.activeEvents.splice(i, 1);
            }
        }
    }
    
    triggerRandomEvent() {
        const eventKeys = Object.keys(this.events);
        const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        const eventData = this.events[randomKey];
        
        const event = {
            type: randomKey,
            name: eventData.name,
            effect: eventData.effect,
            duration: eventData.duration,
            timeRemaining: eventData.duration,
            startTime: Date.now()
        };
        
        this.activeEvents.push(event);
        this.startEvent(event);
        this.showEventNotification(event);
        
        console.log(`Event triggered: ${event.name}`);
    }
    
    startEvent(event) {
        switch(event.type) {
            case 'meteorShower':
                this.startMeteorShower(event);
                break;
            case 'fogOfWar':
                this.startFogOfWar(event);
                break;
            // Other events are handled in updateEventEffect
        }
    }
    
    updateEventEffect(event, deltaTime) {
        switch(event.type) {
            case 'meteorShower':
                this.updateMeteorShower(event, deltaTime);
                break;
            case 'healingRain':
                this.updateHealingRain(event, deltaTime);
                break;
        }
    }
    
    endEvent(event) {
        switch(event.type) {
            case 'fogOfWar':
                this.endFogOfWar(event);
                break;
            case 'meteorShower':
                this.endMeteorShower(event);
                break;
        }
        
        console.log(`Event ended: ${event.name}`);
    }
    
    startMeteorShower(event) {
        event.meteors = [];
        event.meteorSpawnTimer = 0;
    }
    
    updateMeteorShower(event, deltaTime) {
        event.meteorSpawnTimer += deltaTime;
        
        // Spawn meteors every 0.5 seconds
        if (event.meteorSpawnTimer >= 0.5) {
            event.meteorSpawnTimer = 0;
            this.spawnMeteor(event);
        }
        
        // Update existing meteors
        if (event.meteors) {
            for (let i = event.meteors.length - 1; i >= 0; i--) {
                const meteor = event.meteors[i];
                meteor.position.y -= 30 * deltaTime;
                
                // Remove meteors that hit ground
                if (meteor.position.y < 0) {
                    this.scene.remove(meteor);
                    meteor.geometry.dispose();
                    meteor.material.dispose();
                    event.meteors.splice(i, 1);
                    
                    // Create impact effect
                    this.createMeteorImpact(meteor.position);
                }
            }
        }
    }
    
    spawnMeteor(event) {
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8
        });
        
        const meteor = new THREE.Mesh(geometry, material);
        meteor.position.set(
            (Math.random() - 0.5) * 100,
            50,
            (Math.random() - 0.5) * 100
        );
        
        this.scene.add(meteor);
        event.meteors.push(meteor);
    }
    
    endMeteorShower(event) {
        if (event.meteors) {
            event.meteors.forEach(meteor => {
                this.scene.remove(meteor);
                meteor.geometry.dispose();
                meteor.material.dispose();
            });
        }
    }
    
    createMeteorImpact(position) {
        // Create small explosion effect
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(position);
        explosion.position.y = 0;
        this.scene.add(explosion);
        
        // Animate and remove
        let scale = 0;
        const animate = () => {
            scale += 0.1;
            explosion.scale.set(scale, scale, scale);
            explosion.material.opacity = 0.8 - (scale / 3);
            
            if (scale < 3) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosion);
                explosion.geometry.dispose();
                explosion.material.dispose();
            }
        };
        animate();
    }
    
    updateHealingRain(event, deltaTime) {
        // Healing is handled by playerHealth system
        // This just tracks the event
    }
    
    startFogOfWar(event) {
        // Increase fog density
        if (this.scene.fog) {
            event.originalFogDensity = this.scene.fog.density;
            this.scene.fog.density = 0.01;
        }
    }
    
    endFogOfWar(event) {
        // Restore fog density
        if (this.scene.fog && event.originalFogDensity !== undefined) {
            this.scene.fog.density = event.originalFogDensity;
        }
    }
    
    showEventNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <div class="event-title">⚡ ${event.name} ⚡</div>
            <div class="event-effect">${event.effect}</div>
            <div class="event-duration">${event.duration}s</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 150px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 3px solid #ff6600;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            z-index: 3000;
            animation: eventSlide 0.5s ease-out, eventFadeOut 0.5s ease-in 4.5s forwards;
            box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
            color: white;
            font-family: 'Courier New', monospace;
            min-width: 300px;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    getActiveEvents() {
        return this.activeEvents;
    }
    
    isEventActive(eventType) {
        return this.activeEvents.some(e => e.type === eventType);
    }
    
    getEventModifiers() {
        const modifiers = {
            damageMultiplier: 1,
            spawnRateMultiplier: 1,
            movementSpeedMultiplier: 1,
            powerUpSpawnMultiplier: 1,
            timeScale: 1,
            healing: false
        };
        
        this.activeEvents.forEach(event => {
            switch(event.type) {
                case 'powerSurge':
                    modifiers.damageMultiplier = 2;
                    break;
                case 'monsterFrenzy':
                    modifiers.spawnRateMultiplier = 2;
                    break;
                case 'healingRain':
                    modifiers.healing = true;
                    break;
                case 'timeWarp':
                    modifiers.timeScale = 0.5;
                    break;
                case 'lootBonanza':
                    modifiers.powerUpSpawnMultiplier = 3;
                    break;
                case 'berserk':
                    modifiers.movementSpeedMultiplier = 2;
                    modifiers.damageMultiplier = 0.5; // Take more damage
                    break;
            }
        });
        
        return modifiers;
    }
    
    reset() {
        // End all active events
        this.activeEvents.forEach(event => this.endEvent(event));
        this.activeEvents = [];
        this.eventTimer = 0;
        this.initialized = false;
    }
}

// Made with Bob