/**
 * Weather System - BPSS v21
 * Dynamic weather with particle effects (rain, snow, fog)
 */

class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.currentWeather = 'clear';
        this.weatherParticles = null;
        this.fog = null;
        this.weatherDuration = 30; // seconds
        this.weatherTimer = 0;
        this.transitionTime = 5; // seconds for weather transitions
        console.log('weatherSystem initialized for v21');
    }
    
    init() {
        this.initialized = true;
        this.changeWeather('clear');
        console.log('Weather system ready');
    }
    
    changeWeather(weatherType) {
        // Clean up old weather
        this.clearWeather();
        
        this.currentWeather = weatherType;
        this.weatherTimer = this.weatherDuration;
        
        switch(weatherType) {
            case 'rain':
                this.createRain();
                this.setFog(0x87ceeb, 0.002);
                break;
            case 'snow':
                this.createSnow();
                this.setFog(0xffffff, 0.003);
                break;
            case 'fog':
                this.setFog(0xcccccc, 0.005);
                break;
            case 'clear':
                this.setFog(0x87ceeb, 0.001);
                break;
        }
        
        console.log(`Weather changed to: ${weatherType}`);
    }
    
    createRain() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        const range = 150;
        const height = 80;
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in a large area
            positions.push(
                (Math.random() - 0.5) * range,
                Math.random() * height,
                (Math.random() - 0.5) * range
            );
            
            // Downward velocity with slight variation
            velocities.push(
                (Math.random() - 0.5) * 2,
                -30 - Math.random() * 10,
                (Math.random() - 0.5) * 2
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x4488ff,
            size: 0.3,
            transparent: true,
            opacity: 0.6
        });
        
        this.weatherParticles = new THREE.Points(geometry, material);
        this.weatherParticles.userData.type = 'rain';
        this.weatherParticles.userData.range = range;
        this.weatherParticles.userData.height = height;
        
        this.scene.add(this.weatherParticles);
    }
    
    createSnow() {
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        const range = 150;
        const height = 80;
        
        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * range,
                Math.random() * height,
                (Math.random() - 0.5) * range
            );
            
            // Slower, more gentle fall with drift
            velocities.push(
                (Math.random() - 0.5) * 3,
                -5 - Math.random() * 3,
                (Math.random() - 0.5) * 3
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            transparent: true,
            opacity: 0.8
        });
        
        this.weatherParticles = new THREE.Points(geometry, material);
        this.weatherParticles.userData.type = 'snow';
        this.weatherParticles.userData.range = range;
        this.weatherParticles.userData.height = height;
        
        this.scene.add(this.weatherParticles);
    }
    
    setFog(color, density) {
        this.scene.fog = new THREE.FogExp2(color, density);
        this.scene.background = new THREE.Color(color);
    }
    
    clearWeather() {
        if (this.weatherParticles) {
            this.scene.remove(this.weatherParticles);
            this.weatherParticles.geometry.dispose();
            this.weatherParticles.material.dispose();
            this.weatherParticles = null;
        }
    }
    
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Update weather timer
        this.weatherTimer -= deltaTime;
        if (this.weatherTimer <= 0) {
            // Randomly change weather
            const weathers = ['clear', 'rain', 'snow', 'fog'];
            const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
            this.changeWeather(newWeather);
        }
        
        // Update particle positions
        if (this.weatherParticles) {
            const positions = this.weatherParticles.geometry.attributes.position.array;
            const velocities = this.weatherParticles.geometry.attributes.velocity.array;
            const type = this.weatherParticles.userData.type;
            const range = this.weatherParticles.userData.range;
            const height = this.weatherParticles.userData.height;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Update position based on velocity
                positions[i] += velocities[i] * deltaTime;
                positions[i + 1] += velocities[i + 1] * deltaTime;
                positions[i + 2] += velocities[i + 2] * deltaTime;
                
                // Reset particles that fall below ground or go out of range
                if (positions[i + 1] < 0) {
                    positions[i] = (Math.random() - 0.5) * range;
                    positions[i + 1] = height;
                    positions[i + 2] = (Math.random() - 0.5) * range;
                }
                
                // Keep particles in range
                if (Math.abs(positions[i]) > range / 2) {
                    positions[i] = (Math.random() - 0.5) * range;
                }
                if (Math.abs(positions[i + 2]) > range / 2) {
                    positions[i + 2] = (Math.random() - 0.5) * range;
                }
                
                // Add wind effect for snow
                if (type === 'snow') {
                    velocities[i] = Math.sin(Date.now() * 0.001 + i) * 2;
                    velocities[i + 2] = Math.cos(Date.now() * 0.001 + i) * 2;
                }
            }
            
            this.weatherParticles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    getWeatherEffects() {
        // Return current weather effects for gameplay
        switch(this.currentWeather) {
            case 'rain':
                return { visibility: 0.7, movementSpeed: 0.9 };
            case 'snow':
                return { visibility: 0.6, movementSpeed: 0.8 };
            case 'fog':
                return { visibility: 0.5, movementSpeed: 1.0 };
            default:
                return { visibility: 1.0, movementSpeed: 1.0 };
        }
    }
    
    reset() {
        this.clearWeather();
        this.currentWeather = 'clear';
        this.weatherTimer = 0;
        this.initialized = false;
    }
}

// Made with Bob
