const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

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
let score = 0;
let elapsed = 0;

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    if (!plants.some(p => p.row === row && p.col === col)) {
        plants.push({ row, col, cooldown: 0, health: 5 });
    }
});

function spawnZombie() {
    const row = Math.floor(Math.random() * ROWS);
    // Speed is now measured in pixels per second instead of per millisecond
    // Start slower and gradually speed up as the game progresses
    const speed = 40 + elapsed / 1000; // increase speed over time
    zombies.push({ x: canvas.width, row, health: 5, speed });
}

function update(delta) {
    statusEl.textContent = `Score: ${score}`;
    elapsed += delta;
    // plants shoot peas
    plants.forEach(p => {
        p.cooldown -= delta;
        if (p.cooldown <= 0) {
            peas.push({ x: p.col * CELL_WIDTH + CELL_WIDTH / 2, row: p.row });
            p.cooldown = 1000; // shoot every second
        }
    });

    // update peas
    for (let i = peas.length - 1; i >= 0; i--) {
        const pea = peas[i];
        pea.x += 0.4 * delta;
        if (pea.x > canvas.width) {
            peas.splice(i, 1);
            continue;
        }
        zombies.forEach(z => {
            if (z.row === pea.row && Math.abs(z.x - pea.x) < 10) {
                z.health -= 1;
                peas.splice(i, 1);
            }
        });
    }

    // update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        // delta is in milliseconds; convert to seconds for speed calculation
        z.x -= z.speed * (delta / 1000);
        if (z.x < 0) {
            gameOver = true;
            statusEl.textContent = `Game Over! Final Score: ${score}`;
            restartBtn.style.display = 'inline-block';
        }
        const plant = plants.find(p => p.row === z.row && z.x < (p.col + 1) * CELL_WIDTH - 10);
        if (plant) {
            plant.health -= 0.02 * delta;
            if (plant.health <= 0) {
                plants.splice(plants.indexOf(plant), 1);
            }
        }
        if (z.health <= 0) {
            zombies.splice(i, 1);
            score += 1;
        }
    }

    // spawn zombies
    lastZombieSpawn += delta;
    if (lastZombieSpawn > spawnInterval) {
        spawnZombie();
        lastZombieSpawn = 0;
        spawnInterval = Math.max(800, spawnInterval - 20); // increase difficulty
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

function initGame() {
    plants.length = 0;
    peas.length = 0;
    zombies.length = 0;
    score = 0;
    elapsed = 0;
    spawnInterval = 2000;
    gameOver = false;
    lastZombieSpawn = 0;
    statusEl.textContent = '';
    restartBtn.style.display = 'none';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener('click', initGame);

initGame();
