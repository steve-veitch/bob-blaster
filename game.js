// Business Problem Solver Suite v23 - Main Game File
// Arsenal Unlocked Edition - All weapons available from start
// Fully integrated with all 36 game systems

// Three.js core variables
let scene, camera, renderer;
let clock = new THREE.Clock();

// Core Game Systems
let gameState;
let scoreSystem;
let highScoreManager;
let playerHealth;
let particleSystem;

// Combat Systems
let waveSystem;
let collisionSystem;
let bossManager;
let weaponManager;

// Power-ups & Resources
let powerUpManager;
let resourceManager;
let inventoryManager;
let craftingManager;

// Magic & Spells
let spellManager;
let magicSystem;
let elementalSystem;

// Environment & World
let environmentSystem;
let terrainSystem;
let weatherSystem;
let biomeSystem;
let levelGenerator;

// AI & Tactics
let aiDirector;
let tacticsSystem;
let stealthSystem;
let squadAI;
let companionSystem;

// Quest & NPC
let npcSystem;
let dialogueSystem;
let questSystem;

// Progression & Social
let achievementSystem;
let prestigeSystem;
let challengeSystem;
let endgameSystem;

// Multiplayer & Social
let multiplayerSystem;
let tradingSystem;
let leaderboardSystem;

// Player controls
let controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canShoot: true
};

// Key bindings - configurable
let keyBindings = {
    moveForward: 'KeyW',
    moveBackward: 'KeyS',
    moveLeft: 'KeyD',
    moveRight: 'KeyA',
    shoot: 'Space',
    weapon1: 'Digit1',
    weapon2: 'Digit2',
    weapon3: 'Digit3',
    weapon4: 'Digit4',
    weapon5: 'Digit5'
};

// Player movement
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const baseMoveSpeed = 100.0;
let moveSpeed = baseMoveSpeed;
const baseShootCooldown = 200;
let shootCooldown = baseShootCooldown;

// Camera rotation
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;

// Pointer lock
let isLocked = false;

// Projectiles
let projectiles = [];

// Config menu state
let listeningForKey = null;

// Wave complete countdown
let waveCountdownTimer = 0;
let waveCountdownActive = false;

// Initialize game
function init() {
    // Initialize core systems
    gameState = new GameStateManager();
    scoreSystem = new ScoreSystem();
    highScoreManager = new HighScoreManager();
    playerHealth = new PlayerHealth();
    
    // Setup Three.js scene
    setupScene();
    
    // Initialize particle system after scene is created
    particleSystem = new ParticleSystem(scene);
    
    // Initialize combat systems
    powerUpManager = new PowerUpManager(scene, playerHealth);
    bossManager = typeof BossManager !== 'undefined' ? new BossManager(scene) : null;
    weaponManager = typeof WeaponManager !== 'undefined' ? new WeaponManager() : null;
    
    // Unlock all weapons for v23 (players can switch between all weapon types)
    if (weaponManager) {
        weaponManager.unlockWeapon(WeaponTypes.SHOTGUN);
        weaponManager.unlockWeapon(WeaponTypes.SNIPER);
        weaponManager.unlockWeapon(WeaponTypes.MACHINE_GUN);
        weaponManager.unlockWeapon(WeaponTypes.ROCKET);
        updateWeaponDisplay();
        console.log('✓ All weapons unlocked:', weaponManager.unlockedWeapons);
    }
    
    // Initialize resource systems
    resourceManager = typeof ResourceManager !== 'undefined' ? new ResourceManager() : null;
    inventoryManager = typeof InventoryManager !== 'undefined' ? new InventoryManager() : null;
    craftingManager = typeof CraftingManager !== 'undefined' ? new CraftingManager() : null;
    
    // Initialize magic systems
    spellManager = typeof SpellManager !== 'undefined' ? new SpellManager(scene) : null;
    magicSystem = typeof MagicSystem !== 'undefined' ? new MagicSystem() : null;
    elementalSystem = typeof ElementalSystem !== 'undefined' ? new ElementalSystem() : null;
    
    // Initialize environment systems (v21 - fully implemented)
    terrainSystem = typeof TerrainSystem !== 'undefined' ? new TerrainSystem(scene) : null;
    if (terrainSystem) terrainSystem.init();
    
    biomeSystem = typeof BiomeSystem !== 'undefined' ? new BiomeSystem(scene) : null;
    if (biomeSystem) biomeSystem.init(terrainSystem);
    
    environmentSystem = typeof EnvironmentSystem !== 'undefined' ? new EnvironmentSystem(scene) : null;
    if (environmentSystem) environmentSystem.init(terrainSystem);
    
    weatherSystem = typeof WeatherSystem !== 'undefined' ? new WeatherSystem(scene) : null;
    if (weatherSystem) weatherSystem.init();
    
    // Initialize procedural generation systems (v22)
    levelGenerator = typeof LevelGenerator !== 'undefined' ? new LevelGenerator(scene) : null;
    if (levelGenerator) levelGenerator.init(terrainSystem, environmentSystem, biomeSystem);
    
    eventSystem = typeof EventSystem !== 'undefined' ? new EventSystem(scene) : null;
    if (eventSystem) eventSystem.init();
    
    // Initialize AI systems
    aiDirector = typeof AIDirector !== 'undefined' ? new AIDirector() : null;
    tacticsSystem = typeof TacticsSystem !== 'undefined' ? new TacticsSystem() : null;
    stealthSystem = typeof StealthSystem !== 'undefined' ? new StealthSystem() : null;
    squadAI = typeof SquadAI !== 'undefined' ? new SquadAI() : null;
    companionSystem = typeof CompanionSystem !== 'undefined' ? new CompanionSystem(scene) : null;
    
    // Initialize quest & NPC systems
    npcSystem = typeof NPCSystem !== 'undefined' ? new NPCSystem(scene) : null;
    dialogueSystem = typeof DialogueSystem !== 'undefined' ? new DialogueSystem() : null;
    questSystem = typeof QuestSystem !== 'undefined' ? new QuestSystem() : null;
    
    // Initialize progression systems
    achievementSystem = typeof AchievementSystem !== 'undefined' ? new AchievementSystem() : null;
    prestigeSystem = typeof PrestigeSystem !== 'undefined' ? new PrestigeSystem() : null;
    challengeSystem = typeof ChallengeSystem !== 'undefined' ? new ChallengeSystem() : null;
    endgameSystem = typeof EndgameSystem !== 'undefined' ? new EndgameSystem() : null;
    
    // Initialize multiplayer systems
    multiplayerSystem = typeof MultiplayerSystem !== 'undefined' ? new MultiplayerSystem() : null;
    tradingSystem = typeof TradingSystem !== 'undefined' ? new TradingSystem() : null;
    leaderboardSystem = typeof LeaderboardSystem !== 'undefined' ? new LeaderboardSystem() : null;
    
    // Setup controls
    setupControls();
    
    // Setup UI event listeners
    setupUI();
    
    // Load saved settings
    loadKeyBindings();
    
    // Start in menu state
    gameState.setState(GameStates.MENU);
    
    // Log initialized systems
    console.log('BPSS v23 - Arsenal Unlocked Edition');
    console.log('All 5 weapons unlocked from start!');
    console.log('Active systems:', {
        boss: !!bossManager,
        weapons: !!weaponManager,
        resources: !!resourceManager,
        inventory: !!inventoryManager,
        crafting: !!craftingManager,
        spells: !!spellManager,
        magic: !!magicSystem,
        elemental: !!elementalSystem,
        environment: !!environmentSystem,
        terrain: !!terrainSystem,
        weather: !!weatherSystem,
        biomes: !!biomeSystem,
        levelGen: !!levelGenerator,
        aiDirector: !!aiDirector,
        tactics: !!tacticsSystem,
        stealth: !!stealthSystem,
        squad: !!squadAI,
        companions: !!companionSystem,
        npcs: !!npcSystem,
        dialogue: !!dialogueSystem,
        quests: !!questSystem,
        achievements: !!achievementSystem,
        prestige: !!prestigeSystem,
        challenges: !!challengeSystem,
        endgame: !!endgameSystem,
        multiplayer: !!multiplayerSystem,
        trading: !!tradingSystem,
        leaderboard: !!leaderboardSystem
    });
    
    // Start render loop
    animate();
}

function setupScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 0, 750);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create arena walls
    createWalls();
    
    // Initialize wave system
    waveSystem = new WaveSystem(scene);
    
    // Initialize collision system
    collisionSystem = new CollisionSystem(camera, playerHealth);
}

function createWalls() {
    // Create procedural dark wood paneling texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base dark wood color
    const baseColor = '#2a2420';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw horizontal wood planks
    const plankHeight = 64; // Height of each plank
    const numPlanks = Math.ceil(canvas.height / plankHeight);
    
    for (let i = 0; i < numPlanks; i++) {
        const y = i * plankHeight;
        
        // Alternate plank shades for variation
        const shade = i % 2 === 0 ? '#3a3430' : '#2d2824';
        ctx.fillStyle = shade;
        ctx.fillRect(0, y, canvas.width, plankHeight - 2);
        
        // Add wood grain texture
        for (let j = 0; j < 20; j++) {
            const grainY = y + Math.random() * (plankHeight - 2);
            const grainAlpha = 0.1 + Math.random() * 0.15;
            ctx.strokeStyle = `rgba(60, 50, 45, ${grainAlpha})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(0, grainY);
            ctx.lineTo(canvas.width, grainY + (Math.random() - 0.5) * 3);
            ctx.stroke();
        }
        
        // Draw plank separation line
        ctx.strokeStyle = '#1a1816';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y + plankHeight - 1);
        ctx.lineTo(canvas.width, y + plankHeight - 1);
        ctx.stroke();
        
        // Add subtle highlights
        ctx.strokeStyle = 'rgba(80, 70, 60, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + 2);
        ctx.lineTo(canvas.width, y + 2);
        ctx.stroke();
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2); // Repeat texture for better coverage
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.1,
        color: 0xffffff // Use white to show texture colors accurately
    });

    const wallHeight = 20;
    const wallThickness = 2;
    const arenaSize = 100;

    // North wall
    const northWall = new THREE.Mesh(
        new THREE.BoxGeometry(arenaSize * 2, wallHeight, wallThickness),
        wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -arenaSize);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
        new THREE.BoxGeometry(arenaSize * 2, wallHeight, wallThickness),
        wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, arenaSize);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    scene.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize * 2),
        wallMaterial
    );
    eastWall.position.set(arenaSize, wallHeight / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize * 2),
        wallMaterial
    );
    westWall.position.set(-arenaSize, wallHeight / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    scene.add(westWall);
}

function setupControls() {
    // Pointer lock setup
    const element = document.body;

    const pointerlockchange = () => {
        if (document.pointerLockElement === element) {
            isLocked = true;
        } else {
            isLocked = false;
            if (gameState.isPlaying()) {
                pauseGame();
            }
        }
    };

    document.addEventListener('pointerlockchange', pointerlockchange);
    document.addEventListener('mozpointerlockchange', pointerlockchange);
    document.addEventListener('webkitpointerlockchange', pointerlockchange);

    // Event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onWindowResize);
}

function setupUI() {
    // Main menu buttons
    document.getElementById('startBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        startNewGame();
    });
    document.getElementById('configBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        showConfigMenu();
    });
    document.getElementById('highScoresBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        showHighScores();
    });
    document.getElementById('audioBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        showAudioMenu();
    });
    
    // Game over buttons
    document.getElementById('restartBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        startNewGame();
    });
    document.getElementById('mainMenuBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        returnToMenu();
    });
    
    // High scores buttons
    document.getElementById('clearScoresBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        clearHighScores();
    });
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        returnToMenu();
    });
    
    // Pause menu buttons
    document.getElementById('resumeBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        resumeGame();
    });
    document.getElementById('pauseConfigBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        showConfigMenu();
    });
    document.getElementById('quitBtn').addEventListener('click', () => {
        audioSystem.playSound('click');
        returnToMenu();
    });
    
    // Config menu
    setupConfigMenu();
    
    // Audio menu
    setupAudioMenu();
}

function setupConfigMenu() {
    loadKeyBindings();

    document.getElementById('saveControls').addEventListener('click', () => {
        saveKeyBindings();
        if (gameState.currentState === GameStates.PAUSED) {
            gameState.setState(GameStates.PAUSED);
        } else {
            gameState.setState(GameStates.MENU);
        }
    });

    document.getElementById('resetControls').addEventListener('click', () => {
        keyBindings = {
            moveForward: 'KeyW',
            moveBackward: 'KeyS',
            moveLeft: 'KeyD',
            moveRight: 'KeyA',
            shoot: 'Space'
        };
        updateKeyDisplays();
        saveKeyBindings();
    });

    const keyButtons = document.querySelectorAll('.key-button');
    keyButtons.forEach(button => {
        button.addEventListener('click', () => {
            keyButtons.forEach(btn => btn.classList.remove('listening'));
            button.classList.add('listening');
            listeningForKey = button.dataset.action;
            button.textContent = 'Press key or click mouse...';
        });
    });
}

function setupAudioMenu() {
    // Load current audio settings
    updateAudioDisplay();
    
    // Audio toggle
    document.getElementById('audioToggle').addEventListener('click', () => {
        const enabled = audioSystem.toggle();
        document.getElementById('audioToggle').textContent = enabled ? 'ON' : 'OFF';
        audioSystem.playSound('click');
    });
    
    // Master volume
    document.getElementById('masterVolume').addEventListener('input', (e) => {
        const value = e.target.value / 100;
        audioSystem.setMasterVolume(value);
        document.getElementById('masterVolumeValue').textContent = e.target.value + '%';
    });
    
    // SFX volume
    document.getElementById('sfxVolume').addEventListener('input', (e) => {
        const value = e.target.value / 100;
        audioSystem.setSFXVolume(value);
        document.getElementById('sfxVolumeValue').textContent = e.target.value + '%';
    });
    
    // Music volume
    document.getElementById('musicVolume').addEventListener('input', (e) => {
        const value = e.target.value / 100;
        audioSystem.setMusicVolume(value);
        document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
    });
    
    // Test sound
    document.getElementById('testSound').addEventListener('click', () => {
        audioSystem.playSound('shoot');
    });
    
    // Save and close
    document.getElementById('saveAudio').addEventListener('click', () => {
        audioSystem.playSound('click');
        if (gameState.currentState === GameStates.PAUSED) {
            gameState.setState(GameStates.PAUSED);
        } else {
            gameState.setState(GameStates.MENU);
        }
    });
}

function updateAudioDisplay() {
    document.getElementById('audioToggle').textContent = audioSystem.enabled ? 'ON' : 'OFF';
    document.getElementById('masterVolume').value = audioSystem.masterVolume * 100;
    document.getElementById('masterVolumeValue').textContent = Math.round(audioSystem.masterVolume * 100) + '%';
    document.getElementById('sfxVolume').value = audioSystem.sfxVolume * 100;
    document.getElementById('sfxVolumeValue').textContent = Math.round(audioSystem.sfxVolume * 100) + '%';
    document.getElementById('musicVolume').value = audioSystem.musicVolume * 100;
    document.getElementById('musicVolumeValue').textContent = Math.round(audioSystem.musicVolume * 100) + '%';
}

// Key binding functions
function loadKeyBindings() {
    const saved = localStorage.getItem('bpss_keyBindings');
    if (saved) {
        const savedBindings = JSON.parse(saved);
        // Merge saved bindings with defaults to preserve new v23 weapon keys
        keyBindings = {
            ...keyBindings,  // Start with defaults (includes weapon1-5)
            ...savedBindings  // Override with saved values
        };
        updateKeyDisplays();
    }
    console.log('Key bindings loaded:', keyBindings);
}

function saveKeyBindings() {
    localStorage.setItem('bpss_keyBindings', JSON.stringify(keyBindings));
}

function updateKeyDisplays() {
    document.getElementById('key-moveForward').textContent = getKeyName(keyBindings.moveForward);
    document.getElementById('key-moveBackward').textContent = getKeyName(keyBindings.moveBackward);
    document.getElementById('key-moveLeft').textContent = getKeyName(keyBindings.moveLeft);
    document.getElementById('key-moveRight').textContent = getKeyName(keyBindings.moveRight);
    document.getElementById('key-shoot').textContent = getKeyName(keyBindings.shoot);
    document.getElementById('key-weapon1').textContent = getKeyName(keyBindings.weapon1);
    document.getElementById('key-weapon2').textContent = getKeyName(keyBindings.weapon2);
    document.getElementById('key-weapon3').textContent = getKeyName(keyBindings.weapon3);
    document.getElementById('key-weapon4').textContent = getKeyName(keyBindings.weapon4);
    document.getElementById('key-weapon5').textContent = getKeyName(keyBindings.weapon5);
}

function getKeyName(code) {
    if (code === 'Space') return 'SPACE';
    if (code === 'Mouse0') return 'LEFT CLICK';
    if (code === 'Mouse1') return 'MIDDLE CLICK';
    if (code === 'Mouse2') return 'RIGHT CLICK';
    if (code.startsWith('Key')) return code.replace('Key', '');
    if (code.startsWith('Digit')) return code.replace('Digit', '');
    return code;
}

// Game state functions
function startNewGame() {
    // Reset all systems
    scoreSystem.reset();
    playerHealth.reset();
    waveSystem.reset();
    powerUpManager.reset();
    projectiles.forEach(p => scene.remove(p));
    projectiles = [];
    
    // Reset camera position
    camera.position.set(0, 10, 0);
    euler.set(0, 0, 0);
    camera.quaternion.setFromEuler(euler);
    
    // Start first wave
    waveSystem.startWave();
    
    // Enter playing state and request pointer lock
    gameState.setState(GameStates.PLAYING);
    document.body.requestPointerLock();
    
    // Resume music if it was playing
    audioSystem.resumeMusic();
}

function pauseGame() {
    gameState.setState(GameStates.PAUSED);
    audioSystem.pauseMusic();
}

function resumeGame() {
    gameState.setState(GameStates.PLAYING);
    document.body.requestPointerLock();
    audioSystem.resumeMusic();
}

function returnToMenu() {
    // Clean up game
    waveSystem.reset();
    powerUpManager.reset();
    projectiles.forEach(p => scene.remove(p));
    projectiles = [];
    
    gameState.setState(GameStates.MENU);
    audioSystem.stopMusic();
}

function showConfigMenu() {
    // Hide pause menu if it's visible (when accessing from pause menu)
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('configMenu').style.display = 'flex';
}

function showHighScores() {
    highScoreManager.displayScores();
    document.getElementById('highScoresScreen').style.display = 'flex';
}

function showAudioMenu() {
    updateAudioDisplay();
    document.getElementById('audioMenu').style.display = 'flex';
}

function clearHighScores() {
    if (confirm('Are you sure you want to clear all high scores?')) {
        highScoreManager.clearScores();
        highScoreManager.displayScores();
    }
}

function gameOver() {
    gameState.setState(GameStates.GAME_OVER);
    
    const stats = scoreSystem.getStats();
    
    // Update game over screen
    document.getElementById('finalScore').textContent = stats.score.toLocaleString();
    document.getElementById('finalWave').textContent = waveSystem.currentWave;
    document.getElementById('finalKills').textContent = stats.kills;
    document.getElementById('finalAccuracy').textContent = stats.accuracy + '%';
    
    // Save high score
    highScoreManager.addScore(stats.score, waveSystem.currentWave, stats.kills, stats.accuracy);
    
    // Play game over sound
    audioSystem.playSound('gameover');
    audioSystem.stopMusic();
}

function completeWave() {
    const waveData = waveSystem.completeWave();
    const bonus = scoreSystem.addWaveBonus(waveData.wave);
    
    // Update wave complete screen
    document.getElementById('completedWave').textContent = waveData.wave;
    document.getElementById('waveBonus').textContent = '+' + bonus;
    document.getElementById('waveScore').textContent = scoreSystem.score.toLocaleString();
    
    gameState.setState(GameStates.WAVE_COMPLETE);
    
    // Play victory sound
    audioSystem.playSound('victory');
    
    // Start countdown
    waveCountdownTimer = 3;
    waveCountdownActive = true;
    updateWaveCountdown();
}

function updateWaveCountdown() {
    const countdownEl = document.getElementById('waveCountdown');
    if (countdownEl) {
        countdownEl.textContent = Math.ceil(waveCountdownTimer);
    }
}

// Input handlers
function onKeyDown(event) {
    console.log('Key pressed:', event.code); // Debug log
    
    // Config menu key capture
    if (listeningForKey) {
        event.preventDefault();
        keyBindings[listeningForKey] = event.code;
        updateKeyDisplays();
        const button = document.querySelector(`[data-action="${listeningForKey}"]`);
        if (button) button.classList.remove('listening');
        listeningForKey = null;
        return;
    }

    // ESC to pause
    if (event.code === 'Escape' && gameState.isPlaying()) {
        pauseGame();
        return;
    }

    // Weapon switching (works anytime, not just during gameplay)
    console.log('Checking weapon keys...', event.code, keyBindings.weapon1); // Debug
    if (event.code === keyBindings.weapon1) {
        console.log('Weapon 1 key pressed!');
        switchWeapon(WeaponTypes.STANDARD);
        return;
    } else if (event.code === keyBindings.weapon2) {
        console.log('Weapon 2 key pressed!');
        switchWeapon(WeaponTypes.SHOTGUN);
        return;
    } else if (event.code === keyBindings.weapon3) {
        console.log('Weapon 3 key pressed!');
        switchWeapon(WeaponTypes.SNIPER);
        return;
    } else if (event.code === keyBindings.weapon4) {
        console.log('Weapon 4 key pressed!');
        switchWeapon(WeaponTypes.MACHINE_GUN);
        return;
    } else if (event.code === keyBindings.weapon5) {
        console.log('Weapon 5 key pressed!');
        switchWeapon(WeaponTypes.ROCKET);
        return;
    }

    // Game controls (only during gameplay)
    if (!gameState.isPlaying()) return;

    if (event.code === keyBindings.moveForward) {
        controls.moveForward = true;
    } else if (event.code === keyBindings.moveBackward) {
        controls.moveBackward = true;
    } else if (event.code === keyBindings.moveLeft) {
        controls.moveLeft = true;
    } else if (event.code === keyBindings.moveRight) {
        controls.moveRight = true;
    } else if (event.code === keyBindings.shoot) {
        if (isLocked && controls.canShoot) {
            shoot();
        }
    }
}

function onKeyUp(event) {
    if (event.code === keyBindings.moveForward) {
        controls.moveForward = false;
    } else if (event.code === keyBindings.moveBackward) {
        controls.moveBackward = false;
    } else if (event.code === keyBindings.moveLeft) {
        controls.moveLeft = false;
    } else if (event.code === keyBindings.moveRight) {
        controls.moveRight = false;
    }
}

function onMouseDown(event) {
    // Config menu mouse capture
    if (listeningForKey) {
        event.preventDefault();
        keyBindings[listeningForKey] = 'Mouse' + event.button;
        updateKeyDisplays();
        const button = document.querySelector(`[data-action="${listeningForKey}"]`);
        if (button) button.classList.remove('listening');
        listeningForKey = null;
        return;
    }

    // Shooting with mouse
    const mouseCode = 'Mouse' + event.button;
    if (mouseCode === keyBindings.shoot && gameState.isPlaying()) {
        if (isLocked && controls.canShoot) {
            shoot();
        }
    }
}

function onMouseMove(event) {
    if (!isLocked || !gameState.isPlaying()) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    camera.quaternion.setFromEuler(euler);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Weapon switching
function switchWeapon(weaponType) {
    console.log('switchWeapon called with:', weaponType);
    console.log('weaponManager exists:', !!weaponManager);
    console.log('WeaponTypes defined:', typeof WeaponTypes !== 'undefined');
    
    if (weaponManager && weaponManager.switchWeapon(weaponType)) {
        console.log('✓ Switched to weapon:', weaponType);
        audioSystem.playSound('click');
        updateWeaponDisplay();
    } else {
        console.log('✗ Failed to switch to weapon:', weaponType);
        console.log('  - weaponManager:', !!weaponManager);
        console.log('  - Unlocked weapons:', weaponManager?.unlockedWeapons);
    }
}

// Shooting system
function shoot() {
    if (!weaponManager) {
        // Fallback to old system if weaponManager not available
        controls.canShoot = false;
        scoreSystem.addShot();
        
        const fireRateMultiplier = powerUpManager.getFireRateMultiplier();
        shootCooldown = baseShootCooldown / fireRateMultiplier;
        
        audioSystem.playSound('shoot');

        const projectile = createBobLogo();
        projectile.position.copy(camera.position);

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        projectile.userData.velocity = direction.multiplyScalar(150);

        scene.add(projectile);
        projectiles.push(projectile);

        const flash = new THREE.PointLight(0x0f62fe, 2, 10);
        flash.position.copy(camera.position);
        scene.add(flash);
        setTimeout(() => scene.remove(flash), 50);

        setTimeout(() => {
            controls.canShoot = true;
        }, shootCooldown);
        return;
    }

    // Use weapon system
    const weapon = weaponManager.getCurrentWeapon();
    if (!weapon.canFire()) return;

    scoreSystem.addShot();
    
    // Fire weapon (creates projectiles)
    const newProjectiles = weapon.fire(camera, scene, projectiles);
    
    // Muzzle flash with weapon color
    if (newProjectiles.length > 0) {
        const flash = new THREE.PointLight(weapon.config.color, 2, 10);
        flash.position.copy(camera.position);
        scene.add(flash);
        setTimeout(() => scene.remove(flash), 50);
    }
    
    updateWeaponDisplay();
}

// Update weapon display UI
function updateWeaponDisplay() {
    if (!weaponManager) return;
    
    const weapon = weaponManager.getCurrentWeapon();
    const weaponNameEl = document.getElementById('weaponName');
    const weaponAmmoEl = document.getElementById('weaponAmmo');
    
    if (weaponNameEl) {
        weaponNameEl.textContent = weapon.config.name;
    }
    if (weaponAmmoEl) {
        weaponAmmoEl.textContent = weapon.getAmmoDisplay();
    }
}

function createBobLogo() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(128, 128);
    ctx.scale(1.8, 1.8);
    
    // Blue hard hat
    ctx.fillStyle = '#3B82F6';
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -35, 28, Math.PI, 0, false);
    ctx.lineTo(25, -35);
    ctx.lineTo(25, -30);
    ctx.lineTo(-25, -30);
    ctx.lineTo(-25, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Hat brim
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(-30, -30, 60, 5);
    ctx.strokeRect(-30, -30, 60, 5);
    
    // Hat stripe
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(-25, -42, 50, 4);
    
    // White robot head
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-25, -25, 50, 45, 8);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-12, -8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-10, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-22, 22, 44, 35, 6);
    ctx.fill();
    ctx.stroke();
    
    // Code symbol
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(-15, 28, 30, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('</>', 0, 39);
    
    // Arms
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#E5E7EB';
    ctx.beginPath();
    ctx.roundRect(-32, 25, 8, 25, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(24, 25, 8, 25, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 2, 1);
    
    return sprite;
}

function updateProjectiles(delta) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Create trail effect
        if (Math.random() < 0.3) {
            particleSystem.createTrail(projectile.position);
        }
        
        projectile.position.add(
            projectile.userData.velocity.clone().multiplyScalar(delta)
        );

        let hit = false;
        const monsters = waveSystem.monsters;
        
        for (let j = monsters.length - 1; j >= 0; j--) {
            const monster = monsters[j];
            const distance = projectile.position.distanceTo(monster.position);
            
            if (distance < 8) {
                // Use monster's score value if available
                const scoreValue = monster.userData.scoreValue || 100;
                waveSystem.removeMonster(monster);
                scoreSystem.addKill(scoreValue);
                hit = true;
                
                // Play hit sound
                audioSystem.playSound('hit');

                // Explosion light effect
                const explosion = new THREE.PointLight(0xff0000, 3, 20);
                explosion.position.copy(monster.position);
                scene.add(explosion);
                setTimeout(() => scene.remove(explosion), 100);
                
                // Explosion particles
                particleSystem.createExplosion(monster.position, 0xff6600, 25);
                particleSystem.createHitSpark(monster.position);
                
                // Check if wave complete
                if (waveSystem.monstersAlive === 0) {
                    completeWave();
                }
                break;
            }
        }

        if (hit || projectile.position.length() > 200) {
            scene.remove(projectile);
            projectiles.splice(i, 1);
        }
    }
}

// Main game loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (gameState.isPlaying() && isLocked) {
        // Apply speed multiplier from power-ups
        const speedMultiplier = powerUpManager.getSpeedMultiplier();
        moveSpeed = baseMoveSpeed * speedMultiplier;
        
        // Update player movement (horizontal only - no flying!)
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(controls.moveForward) - Number(controls.moveBackward);
        direction.x = Number(controls.moveRight) - Number(controls.moveLeft);
        direction.normalize();

        if (controls.moveForward || controls.moveBackward) {
            velocity.z -= direction.z * moveSpeed * delta;
        }
        if (controls.moveLeft || controls.moveRight) {
            velocity.x -= direction.x * moveSpeed * delta;
        }

        // Get horizontal movement direction (ignore vertical look angle)
        const moveVector = new THREE.Vector3();
        moveVector.x = velocity.x * delta;
        moveVector.z = velocity.z * delta;
        
        // Create a horizontal-only quaternion (only Y-axis rotation)
        const horizontalQuaternion = new THREE.Quaternion();
        horizontalQuaternion.setFromEuler(new THREE.Euler(0, euler.y, 0, 'YXZ'));
        moveVector.applyQuaternion(horizontalQuaternion);
        
        // Apply horizontal movement only
        camera.position.x += moveVector.x;
        camera.position.z += moveVector.z;

        // Keep player at ground level (with gravity effect)
        const groundLevel = 10;
        if (camera.position.y !== groundLevel) {
            camera.position.y = groundLevel;
        }

        // Update core game systems
        waveSystem.updateMonsters(delta, camera.position);
        updateProjectiles(delta);
        scoreSystem.update(delta);
        playerHealth.update(delta);
        particleSystem.update(delta);
        powerUpManager.update(delta, camera);
        
        // Update combat systems
        if (bossManager) bossManager.update(delta, camera.position);
        if (weaponManager) weaponManager.update(delta);
        
        // Update resource systems
        if (resourceManager) resourceManager.update(delta);
        if (inventoryManager) inventoryManager.update(delta);
        if (craftingManager) craftingManager.update(delta);
        
        // Update magic systems
        if (spellManager) spellManager.update(delta);
        if (magicSystem) magicSystem.update(delta);
        if (elementalSystem) elementalSystem.update(delta);
        
        // Update environment systems
        if (environmentSystem) environmentSystem.update(delta);
        if (terrainSystem) terrainSystem.update(delta);
        if (weatherSystem) weatherSystem.update(delta);
        if (biomeSystem) biomeSystem.update(delta);
        
        // Update procedural generation systems (v22)
        if (levelGenerator) levelGenerator.update(delta);
        if (eventSystem) eventSystem.update(delta);
        
        // Update AI systems
        if (aiDirector) aiDirector.update(delta, waveSystem.monsters, camera.position);
        if (tacticsSystem) tacticsSystem.update(delta);
        if (stealthSystem) stealthSystem.update(delta, camera.position);
        if (squadAI) squadAI.update(delta);
        if (companionSystem) companionSystem.update(delta, camera.position);
        
        // Update quest & NPC systems
        if (npcSystem) npcSystem.update(delta);
        if (dialogueSystem) dialogueSystem.update(delta);
        if (questSystem) questSystem.update(delta);
        
        // Update progression systems
        if (achievementSystem) achievementSystem.update(delta);
        if (prestigeSystem) prestigeSystem.update(delta);
        if (challengeSystem) challengeSystem.update(delta);
        if (endgameSystem) endgameSystem.update(delta);
        
        // Update multiplayer systems
        if (multiplayerSystem) multiplayerSystem.update(delta);
        if (tradingSystem) tradingSystem.update(delta);
        
        // Check monster collisions
        const isDead = collisionSystem.checkMonsterCollisions(waveSystem.monsters, delta);
        if (isDead) {
            gameOver();
        }
    } else {
        // Update particles even when not playing (for menu effects)
        particleSystem.update(delta);
    }

    // Wave countdown
    if (waveCountdownActive) {
        waveCountdownTimer -= delta;
        updateWaveCountdown();
        
        if (waveCountdownTimer <= 0) {
            waveCountdownActive = false;
            waveSystem.nextWave();
            gameState.setState(GameStates.PLAYING);
            document.body.requestPointerLock();
        }
    }

    renderer.render(scene, camera);
}

// Start the game
init();

// Made with Bob
