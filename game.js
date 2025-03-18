// === Global Game Variables ===
let playerPositionX;
let playerPositionY;
let bullets = [];
let enemies = [];
let framesSinceLastEnemy = 0;
let framesBetweenEnemySpawn = 90; // Faster spawns for intensity
let score = 0;
let audioContext;

// === Button-mashing prevention ===
let canShoot = true;
let shootCooldownFrames = 15; // About 0.25 seconds cooldown
let framesSinceLastShot = 0;

// === Combo & Epic effects ===
let comboCounter = 0;
let comboTimer = 0;
let screenShakeIntensity = 0;

// setup() initializes the epic battle environment
function setup() {
    createCanvas(windowWidth, windowHeight);
    playerPositionX = width / 2;
    playerPositionY = height - 50;
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// draw() continuously updates the epic game scene
function draw() {
    // Epic dynamic background flashing for combo intensity!
    background(comboCounter >= 5 ? color(random(50,100),0,0) : 30);

    handleScreenShake(); // EPIC SCREEN SHAKE EFFECT!

    updatePlayerPosition();
    updateBullets();
    updateEnemies();
    showScoreAndCombo();

    handleEnemySpawning();

    updateShootCooldown();
    updateComboTimer();
}

// handleEnemySpawning() adds intensity by spawning enemies faster over time
function handleEnemySpawning() {
    framesSinceLastEnemy = framesSinceLastEnemy + 1;
    if (framesSinceLastEnemy > framesBetweenEnemySpawn) {
        createEnemy();
        framesSinceLastEnemy = 0;

        // Make it gradually tougher!
        if (framesBetweenEnemySpawn > 40) {
            framesBetweenEnemySpawn = framesBetweenEnemySpawn - 1;
        }
    }
}

// handleScreenShake() creates EPIC camera shakes on enemy hits
function handleScreenShake() {
    if (screenShakeIntensity > 0) {
        translate(random(-screenShakeIntensity, screenShakeIntensity), random(-screenShakeIntensity, screenShakeIntensity));
        screenShakeIntensity = screenShakeIntensity - 0.5;
    }
}

// updatePlayerPosition() handles smooth player movement
function updatePlayerPosition() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        playerPositionX = playerPositionX - 7;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        playerPositionX = playerPositionX + 7;
    }
    playerPositionX = constrain(playerPositionX, 25, width - 25);
    fill(0, 200, 0);
    rect(playerPositionX, playerPositionY, 50, 50);
}

// updateBullets() updates bullet positions and visuals
function updateBullets() {
    fill(255, 255, 0);
    for (let bullet of bullets) {
        bullet.y = bullet.y - 15;
        ellipse(bullet.x, bullet.y, 8, 8);
    }
    bullets = bullets.filter(bullet => bullet.y > 0 && !bullet.hit);
}

// updateEnemies() moves enemies, checks collisions, and applies EPIC effects
function updateEnemies() {
    fill(200, 0, 0);
    for (let enemy of enemies) {
        enemy.y = enemy.y + 3;
        rect(enemy.x, enemy.y, 40, 40);
    }

    checkBulletEnemyCollisions();
    checkEnemyPlayerCollisions();

    enemies = enemies.filter(enemy => enemy.y < height && !enemy.hit);
}

// checkBulletEnemyCollisions() triggers EPIC effects and combo meter
function checkBulletEnemyCollisions() {
    for (let enemy of enemies) {
        for (let bullet of bullets) {
            if (dist(enemy.x, enemy.y, bullet.x, bullet.y) < 20) {
                enemy.hit = true;
                bullet.hit = true;
                score = score + (10 + comboCounter * 2); // Combo multiplies score!
                comboCounter = comboCounter + 1;
                comboTimer = 120; // 2 seconds combo window
                triggerEpicEnemyHitEffect();
            }
        }
    }
}

// triggerEpicEnemyHitEffect() adds screen shake and plays intense hit sound
function triggerEpicEnemyHitEffect() {
    screenShakeIntensity = 10; // EPIC screen shake!
    playEnemyHitSound();
}

// checkEnemyPlayerCollisions() ends the epic battle dramatically
function checkEnemyPlayerCollisions() {
    for (let enemy of enemies) {
        if (dist(enemy.x, enemy.y, playerPositionX, playerPositionY) < 45) {
            fill(255);
            textSize(60);
            text("💀 GAME OVER 💀", width / 2, height / 2);
            noLoop();
        }
    }
}

// createEnemy() generates relentless enemy forces
function createEnemy() {
    let newEnemy = { x: random(20, width - 20), y: -20 };
    enemies.push(newEnemy);
}

// showScoreAndCombo() proudly displays your epic achievements
function showScoreAndCombo() {
    fill(255);
    textSize(20);
    text("Score: " + score, width - 100, 30);
    if (comboCounter >= 2) {
        textSize(30);
        text("🔥 COMBO x" + comboCounter + " 🔥", width / 2, 50);
    }
}

// keyPressed() allows shooting only if cooldown allows, preventing mashing
function keyPressed() {
    if (keyCode === 32 && canShoot) {
        bullets.push({ x: playerPositionX, y: playerPositionY - 25 });
        playGunSound();
        canShoot = false;
        framesSinceLastShot = 0;
    }
}

// updateShootCooldown() manages cooldown between player shots
function updateShootCooldown() {
    if (!canShoot) {
        framesSinceLastShot = framesSinceLastShot + 1;
        if (framesSinceLastShot >= shootCooldownFrames) {
            canShoot = true;
        }
    }
}

// updateComboTimer() resets combo if too much time passes
function updateComboTimer() {
    if (comboTimer > 0) {
        comboTimer = comboTimer - 1;
    } else {
        comboCounter = 0;
    }
}

// playGunSound() generates a crisp, epic gunshot sound
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

// playEnemyHitSound() generates a satisfying bass-heavy hit sound
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

// windowResized() keeps the epic battlefield responsive
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
