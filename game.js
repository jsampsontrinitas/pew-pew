let playerX, playerY;
let bullets = [];
let enemies = [];
let enemySpawnInterval = 120; // every 2 seconds at 60fps
let lastEnemySpawn = 0;
let score = 0;
let gunSound, enemyHitSound;

function preload() {
    soundFormats('mp3', 'wav');
    gunSound = loadSound('https://cdn.jsdelivr.net/gh/freeCodeCamp/cdn@main/build/testable-projects-fcc/audio/BeepSound.wav');
    enemyHitSound = loadSound('https://cdn.jsdelivr.net/gh/freeCodeCamp/cdn@main/build/testable-projects-fcc/audio/BassDrum.wav');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    playerX = width / 2;
    playerY = height - 50;
    textAlign(CENTER, CENTER);
}

function draw() {
    background(30);

    handlePlayer();
    handleBullets();
    handleEnemies();
    handleScore();

    if (frameCount - lastEnemySpawn > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawn = frameCount;
    }
}

function handlePlayer() {
    fill(0, 200, 0);
    rectMode(CENTER);
    rect(playerX, playerY, 50, 50);

    // Simple controls
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) playerX -= 5;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) playerX += 5;

    playerX = constrain(playerX, 25, width - 25);
}

function handleBullets() {
    fill(255, 255, 0);
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 10;
        ellipse(bullets[i].x, bullets[i].y, 8, 8);

        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

function handleEnemies() {
    fill(200, 0, 0);
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += 2;
        rect(enemies[i].x, enemies[i].y, 40, 40);

        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (dist(bullets[j].x, bullets[j].y, enemies[i].x, enemies[i].y) < 20) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                enemyHitSound.play();
                score += 10;
                break;
            }
        }

        // Check collision with player
        if (dist(enemies[i].x, enemies[i].y, playerX, playerY) < 45) {
            textSize(50);
            fill(255);
            text("GAME OVER!", width / 2, height / 2);
            noLoop();
        }

        if (enemies[i] && enemies[i].y > height) enemies.splice(i, 1);
    }
}

function spawnEnemy() {
    enemies.push({ x: random(20, width - 20), y: -20 });
}

function handleScore() {
    fill(255);
    textSize(20);
    text("Score: " + score, width - 80, 30);
}

function keyPressed() {
    if (keyCode === 32) { // Spacebar shoots
        bullets.push({ x: playerX, y: playerY - 25 });
        gunSound.play();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
