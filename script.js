const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const sunflowerBtn = document.getElementById('sunflowerButton');
const peashooterBtn = document.getElementById('peashooterButton');
const sunCountEl = document.getElementById('sunCount');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartButton');

const ROWS = 5;
const COLS = 9;
const CELL_WIDTH = canvas.width / COLS;
const CELL_HEIGHT = canvas.height / ROWS;

const plants = [];
const peas = [];
const zombies = [];
let lastZombieSpawn = 0;
let spawnInterval = 2000;
let gameOver = false;
let sun = 150;
let score = 0;
let selectedPlant = 'peashooter';

sunflowerBtn.onclick = () => selectedPlant = 'sunflower';
peashooterBtn.onclick = () => selectedPlant = 'peashooter';
restartBtn.onclick = restartGame;

sunCountEl.textContent = sun;
scoreEl.textContent = score;

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    if (!plants.some(p => p.row === row && p.col === col)) {
        const cost = selectedPlant === 'sunflower' ? 50 : 100;
        if (sun >= cost) {
            sun -= cost;
            sunCountEl.textContent = sun;
            plants.push({ row, col, type: selectedPlant, cooldown: 0, health: 5, sunTimer: 5 });
        }
    }
});

function spawnZombie() {
    const row = Math.floor(Math.random() * ROWS);
    const speed = 40 + Math.random() * 10;
    zombies.push({ x: canvas.width, row, health: 5, speed });
    spawnInterval = Math.max(500, spawnInterval * 0.99);
}

function update(delta) {
    const dt = delta / 1000; // convert to seconds

    // plant actions
    plants.forEach(p => {
        p.cooldown -= dt;
        if (p.type === 'sunflower') {
            p.sunTimer -= dt;
            if (p.sunTimer <= 0) {
                sun += 25;
                sunCountEl.textContent = sun;
                p.sunTimer = 5;
            }
        } else if (p.type === 'peashooter' && p.cooldown <= 0) {
            peas.push({ x: p.col * CELL_WIDTH + CELL_WIDTH / 2, row: p.row });
            p.cooldown = 1;
        }
    });

    // update peas
    for (let i = peas.length - 1; i >= 0; i--) {
        const pea = peas[i];
        pea.x += 200 * dt;
        if (pea.x > canvas.width) {
            peas.splice(i, 1);
            continue;
        }
        zombies.forEach(z => {
            if (z.row === pea.row && Math.abs(z.x - pea.x) < 10) {
                z.health -= 1;
                peas.splice(i, 1);
                score += 10;
                scoreEl.textContent = score;
            }
        });
    }

    // update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        z.x -= z.speed * dt;
        if (z.x < 0) {
            gameOver = true;
            statusEl.textContent = 'Game Over!';
        }
        const plant = plants.find(p => p.row === z.row && z.x < (p.col + 1) * CELL_WIDTH - 10);
        if (plant) {
            plant.health -= 10 * dt;
            if (plant.health <= 0) {
                plants.splice(plants.indexOf(plant), 1);
            }
        }
        if (z.health <= 0) {
            zombies.splice(i, 1);
            score += 50;
            scoreEl.textContent = score;
        }
    }

    // spawn zombies
    lastZombieSpawn += delta;
    if (lastZombieSpawn > spawnInterval) {
        spawnZombie();
        lastZombieSpawn = 0;
    }
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    for (let i = 1; i < COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_WIDTH, 0);
        ctx.lineTo(i * CELL_WIDTH, canvas.height);
        ctx.stroke();
    }
    for (let i = 1; i < ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_HEIGHT);
        ctx.lineTo(canvas.width, i * CELL_HEIGHT);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    // draw plants
    ctx.fillStyle = 'green';
    plants.forEach(p => {
        ctx.fillRect(p.col * CELL_WIDTH + 5, p.row * CELL_HEIGHT + 5, CELL_WIDTH - 10, CELL_HEIGHT - 10);
    });
    // draw peas
    ctx.fillStyle = 'yellow';
    peas.forEach(pea => {
        ctx.beginPath();
        ctx.arc(pea.x, pea.row * CELL_HEIGHT + CELL_HEIGHT / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    // draw zombies
    ctx.fillStyle = 'gray';
    zombies.forEach(z => {
        ctx.fillRect(z.x - CELL_WIDTH / 2, z.row * CELL_HEIGHT + 5, CELL_WIDTH - 10, CELL_HEIGHT - 10);
    });
}

let lastTime = performance.now();
function gameLoop(time) {
    const delta = time - lastTime;
    lastTime = time;
    if (!gameOver) {
        update(delta);
        draw();
        requestAnimationFrame(gameLoop);
    }
}
requestAnimationFrame(gameLoop);

function restartGame() {
    plants.length = 0;
    peas.length = 0;
    zombies.length = 0;
    sun = 150;
    score = 0;
    spawnInterval = 2000;
    lastZombieSpawn = 0;
    gameOver = false;
    statusEl.textContent = '';
    sunCountEl.textContent = sun;
    scoreEl.textContent = score;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}
