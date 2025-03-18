// game.js

// === Global Game Variables ===
let playerPositionX;
let playerPositionY;
let bullets = [];
let enemies = [];
let powerUps = [];
let particles = [];
let stars = [];
let framesSinceLastEnemy = 0;
let framesBetweenEnemySpawn = 90;
let score = 0;
let comboCounter = 0;
let comboTimer = 0;
let screenShakeIntensity = 0;
let powerUpActive = false;
let powerUpTimer = 0;
let audioContext;

// === Button-mashing prevention ===
let canShoot = true;
let shootCooldownFrames = 15;
let framesSinceLastShot = 0;

// === Game state ===
let gameState;

// **setup() initializes the epic battle environment**
function setup() {
    createCanvas(windowWidth, windowHeight);
    resetGame();
    gameState = "playing";
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Initialize starfield
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            speed: random(1, 3)
        });
    }
}

// **resetGame() resets all game variables to initial values**
function resetGame() {
    playerPositionX = width / 2;
    playerPositionY = height - 50;
    bullets = [];
    enemies = [];
    powerUps = [];
    particles = [];
    framesSinceLastEnemy = 0;
    framesBetweenEnemySpawn = 90;
    score = 0;
    comboCounter = 0;
    comboTimer = 0;
    screenShakeIntensity = 0;
    powerUpActive = false;
    powerUpTimer = 0;
    canShoot = true;
    framesSinceLastShot = 0;
}

// **draw() drives the game loop with separated logic and rendering**
function draw() {
    if (gameState === "playing") {
        // Logic updates
        updatePlayer();
        updateBullets();
        updateEnemies();
        updatePowerUps();
        updateParticles();
        handleEnemySpawning();
        updateShootCooldown();
        updateComboTimer();

        // Rendering
        background(comboCounter >= 5 ? color(random(50, 100), 0, 0) : 30);
        handleScreenShake();
        drawStars();
        drawEnemies();
        drawPowerUps();
        drawParticles();
        drawBullets();
        drawPlayer();
        showScoreAndCombo();
    } else if (gameState === "gameOver") {
        drawGameOver();
    }
}

// **drawGameOver() displays the game over screen**
function drawGameOver() {
    background(0);
    fill(255);
    textSize(60);
    text("💀 GAME OVER 💀", width / 2, height / 2 - 50);
    textSize(30);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    textSize(20);
    text("Press R to Restart", width / 2, height / 2 + 60);
}

// **updatePlayer() handles player movement**
function updatePlayer() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        playerPositionX -= 7;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        playerPositionX += 7;
    }
    playerPositionX = constrain(playerPositionX, 25, width - 25);
}

// **drawPlayer() renders the player**
function drawPlayer() {
    fill(powerUpActive ? color(0, 0, 255) : color(0, 200, 0));
    rect(playerPositionX, playerPositionY, 50, 50);
}

// **updateBullets() moves bullets upward**
function updateBullets() {
    for (let bullet of bullets) {
        bullet.y -= 15;
    }
    bullets = bullets.filter(bullet => bullet.y > 0 && !bullet.hit);
}

// **drawBullets() renders bullets as laser shots**
function drawBullets() {
    fill(255, 255, 0);
    for (let bullet of bullets) {
        rect(bullet.x, bullet.y, 4, 20);
    }
}

// **updateEnemies() manages enemy movement and collisions**
function updateEnemies() {
    for (let enemy of enemies) {
        if (enemy.type === 2) {
            enemy.x = enemy.startX + sin(enemy.y / 50) * 100;
        }
        enemy.y += enemy.speed;
    }
    checkBulletEnemyCollisions();
    checkEnemyPlayerCollisions();
    enemies = enemies.filter(enemy => enemy.y < height && !enemy.hit);
}

// **drawEnemies() renders enemies with their unique colors**
function drawEnemies() {
    for (let enemy of enemies) {
        fill(enemy.color);
        rect(enemy.x, enemy.y, enemy.size, enemy.size);
    }
}

// **checkBulletEnemyCollisions() handles hits with epic effects**
function checkBulletEnemyCollisions() {
    for (let enemy of enemies) {
        for (let bullet of bullets) {
            if (dist(enemy.x, enemy.y, bullet.x, bullet.y) < enemy.size / 2 + 4) {
                enemy.hit = true;
                bullet.hit = true;
                score += enemy.baseScore * (comboCounter + 1);
                comboCounter += 1;
                comboTimer = 120;
                triggerEpicEnemyHitEffect();
                createParticles(enemy.x, enemy.y);
                if (random() < 0.1) {
                    createPowerUp(enemy.x, enemy.y);
                }
            }
        }
    }
}

// **triggerEpicEnemyHitEffect() amplifies intensity on hits**
function triggerEpicEnemyHitEffect() {
    screenShakeIntensity = 5 + comboCounter * 2;
    playEnemyHitSound();
}

// **checkEnemyPlayerCollisions() checks for player-enemy collisions**
function checkEnemyPlayerCollisions() {
    for (let enemy of enemies) {
        if (dist(enemy.x, enemy.y, playerPositionX, playerPositionY) < 25 + enemy.size / 2) {
            gameState = "gameOver";
        }
    }
}

// **createEnemy() spawns varied enemy types**
function createEnemy() {
    let type = floor(random(3));
    let speed, size, enemyColor, baseScore;
    if (type === 0) {
        speed = 3;
        size = 40;
        enemyColor = color(200, 0, 0);
        baseScore = 10;
    } else if (type === 1) {
        speed = 6;
        size = 30;
        enemyColor = color(255, 255, 0);
        baseScore = 20;
    } else {
        speed = 3;
        size = 40;
        enemyColor = color(0, 0, 255);
        baseScore = 15;
    }
    let newEnemy = {
        x: random(20, width - 20),
        y: -20,
        type: type,
        speed: speed,
        size: size,
        color: enemyColor,
        baseScore: baseScore,
        hit: false
    };
    if (type === 2) {
        newEnemy.startX = newEnemy.x;
    }
    enemies.push(newEnemy);
}

// **updatePowerUps() moves and checks power-up collection**
function updatePowerUps() {
    for (let powerUp of powerUps) {
        powerUp.y += 2;
        if (dist(powerUp.x, powerUp.y, playerPositionX, playerPositionY) < 35) {
            activatePowerUp();
            powerUp.hit = true;
        }
    }
    powerUps = powerUps.filter(p => p.y < height && !p.hit);
}

// **drawPowerUps() renders power-ups as yellow squares**
function drawPowerUps() {
    fill(255, 255, 0);
    for (let powerUp of powerUps) {
        rect(powerUp.x, powerUp.y, 20, 20);
    }
}

// **createPowerUp() spawns a power-up at the given position**
function createPowerUp(x, y) {
    powerUps.push({ x: x, y: y, hit: false });
}

// **activatePowerUp() boosts firing rate temporarily**
function activatePowerUp() {
    if (!powerUpActive) {
        powerUpActive = true;
        powerUpTimer = 300;
        shootCooldownFrames = 5;
        playPowerUpSound();
    }
}

// **updateParticles() moves explosion particles**
function updateParticles() {
    for (let particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.lifetime -= 1;
    }
    particles = particles.filter(p => p.lifetime > 0);
}

// **drawParticles() renders explosion effects**
function drawParticles() {
    fill(255, 100, 0, 150);
    noStroke();
    for (let particle of particles) {
        ellipse(particle.x, particle.y, 10, 10);
    }
}

// **createParticles() generates explosion particles on enemy hits**
function createParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 5);
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        particles.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            lifetime: 30
        });
    }
}

// **drawStars() creates a moving starfield background**
function drawStars() {
    stroke(255);
    strokeWeight(2);
    for (let star of stars) {
        point(star.x, star.y);
        star.y += star.speed;
        if (star.y > height) {
            star.y = 0;
            star.x = random(width);
        }
    }
}

// **showScoreAndCombo() displays your epic progress**
function showScoreAndCombo() {
    fill(255);
    textSize(20);
    text("Score: " + score, width - 100, 30);
    if (comboCounter >= 2) {
        textSize(30);
        text("🔥 COMBO x" + comboCounter + " 🔥", width / 2, 50);
    }
}

// **keyPressed() handles input based on game state**
function keyPressed() {
    if (gameState === "playing") {
        if (keyCode === 32 && canShoot) {
            bullets.push({ x: playerPositionX, y: playerPositionY - 25, hit: false });
            playGunSound();
            canShoot = false;
            framesSinceLastShot = 0;
        }
    } else if (gameState === "gameOver") {
        if (key === 'r' || key === 'R') {
            resetGame();
            gameState = "playing";
        }
    }
}

// **updateShootCooldown() enforces firing rate**
function updateShootCooldown() {
    if (!canShoot) {
        framesSinceLastShot += 1;
        if (framesSinceLastShot >= shootCooldownFrames) {
            canShoot = true;
        }
    }
}

// **updateComboTimer() manages combo duration and power-up timer**
function updateComboTimer() {
    if (comboTimer > 0) {
        comboTimer -= 1;
    } else {
        comboCounter = 0;
    }
    if (powerUpActive) {
        powerUpTimer -= 1;
        if (powerUpTimer <= 0) {
            powerUpActive = false;
            shootCooldownFrames = 15;
        }
    }
}

// **playGunSound() plays a sharp shooting sound**
function playGunSound() {
    let osc = audioContext.createOscillator();
    let vol = audioContext.createGain();
    osc.connect(vol);
    vol.connect(audioContext.destination);
    osc.type = 'square';
    osc.frequency.value = 600;
    vol.gain.setValueAtTime(0.5, audioContext.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
}

// **playEnemyHitSound() plays a deep hit sound**
function playEnemyHitSound() {
    let osc = audioContext.createOscillator();
    let vol = audioContext.createGain();
    osc.connect(vol);
    vol.connect(audioContext.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.3);
    vol.gain.setValueAtTime(0.6, audioContext.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
}

// **playPowerUpSound() plays a rising tone for power-ups**
function playPowerUpSound() {
    let osc = audioContext.createOscillator();
    let vol = audioContext.createGain();
    osc.connect(vol);
    vol.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    vol.gain.setValueAtTime(0.5, audioContext.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
}

// **windowResized() keeps the game responsive**
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// **handleEnemySpawning() controls enemy spawn rate**
function handleEnemySpawning() {
    framesSinceLastEnemy += 1;
    if (framesSinceLastEnemy >= framesBetweenEnemySpawn) {
        createEnemy();
        framesSinceLastEnemy = 0;
        framesBetweenEnemySpawn = max(30, framesBetweenEnemySpawn - 1);
    }
}

// **handleScreenShake() applies screen shake effect**
function handleScreenShake() {
    if (screenShakeIntensity > 0) {
        translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity));
        screenShakeIntensity -= 0.5;
    }
}