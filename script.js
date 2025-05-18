const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const sunflowerBtn = document.getElementById('sunflowerBtn');
const peashooterBtn = document.getElementById('peashooterBtn');
const restartBtn = document.getElementById('restart');
const sunEl = document.getElementById('sun');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');

const ROWS = 5;
const COLS = 9;
const CELL_WIDTH = canvas.width / COLS;
const CELL_HEIGHT = canvas.height / ROWS;

let selectedType = 'peashooter';
let sun = 50;
let score = 0;

const plants = [];
const peas = [];
const zombies = [];
const INITIAL_ZOMBIE_DELAY = 10000;
let lastZombieSpawn = -INITIAL_ZOMBIE_DELAY;
let zombieSpawnInterval = 15000;
let gameOver = false;
let lastTime = performance.now();

const plantCosts = { sunflower: 50, peashooter: 100 };

function updateSelection() {
    sunflowerBtn.classList.toggle('selected', selectedType === 'sunflower');
    peashooterBtn.classList.toggle('selected', selectedType === 'peashooter');
    const selEl = document.getElementById('selected');
    if (selEl) selEl.textContent = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
}

sunflowerBtn.addEventListener('click', () => {
    selectedType = 'sunflower';
    updateSelection();
});
peashooterBtn.addEventListener('click', () => {
    selectedType = 'peashooter';
    updateSelection();
});
restartBtn.addEventListener('click', restartGame);

// highlight initial selection
updateSelection();

canvas.addEventListener('click', e => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL_WIDTH);
    const row = Math.floor((e.clientY - rect.top) / CELL_HEIGHT);
    if (plants.some(p => p.row === row && p.col === col)) return;
    const cost = plantCosts[selectedType];
    if (sun < cost) return;
    sun -= cost;
    sunEl.textContent = sun;
    const el = document.createElement('div');
    el.classList.add('plant', selectedType);
    el.style.width = (CELL_WIDTH - 10) + 'px';
    el.style.height = (CELL_HEIGHT - 10) + 'px';
    el.style.left = (col * CELL_WIDTH + 5) + 'px';
    el.style.top = (row * CELL_HEIGHT + 5) + 'px';
    overlay.appendChild(el);
    if (selectedType === 'sunflower') {
        plants.push({ row, col, type: 'sunflower', cooldown: 5000, health: 5, el });
    } else {
        plants.push({ row, col, type: 'peashooter', cooldown: 0, health: 5, el });
    }
});

function restartGame() {
    plants.forEach(p => p.el.remove());
    peas.forEach(p => p.el.remove());
    zombies.forEach(z => {
        z.el.remove();
        z.bar.remove();
    });
    plants.length = 0;
    peas.length = 0;
    zombies.length = 0;
    sun = 50;
    score = 0;
    lastZombieSpawn = -INITIAL_ZOMBIE_DELAY;
    zombieSpawnInterval = 15000;
    selectedType = 'peashooter';
    updateSelection();
    sunEl.textContent = sun;
    scoreEl.textContent = score;
    statusEl.textContent = '';
    gameOver = false;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnZombie() {
    const row = Math.floor(Math.random() * ROWS);
    const speed = 40 + Math.random() * 20 + score * 2;
    const el = document.createElement('div');
    el.classList.add('zombie');
    el.style.width = (CELL_WIDTH - 10) + 'px';
    el.style.height = (CELL_HEIGHT - 10) + 'px';
    el.style.left = (canvas.width - CELL_WIDTH / 2) + 'px';
    el.style.top = (row * CELL_HEIGHT + 5) + 'px';
    const bar = document.createElement('div');
    bar.classList.add('health-bar');
    bar.style.width = (CELL_WIDTH - 10) + 'px';
    bar.style.left = (canvas.width - CELL_WIDTH / 2) + 'px';
    bar.style.top = (row * CELL_HEIGHT) + 'px';
    const barInner = document.createElement('div');
    barInner.classList.add('health-bar-inner');
    barInner.style.width = '100%';
    bar.appendChild(barInner);
    overlay.appendChild(bar);
    overlay.appendChild(el);
    zombies.push({ x: canvas.width, row, health: 5, maxHealth: 5, speed, el, bar, barInner });
}

function update(delta) {
    // plants produce sun or shoot
    plants.forEach(p => {
        p.cooldown -= delta;
        if (p.type === 'sunflower') {
            if (p.cooldown <= 0) {
                sun += 25;
                sunEl.textContent = sun;
                p.cooldown = 5000;
            }
        } else if (p.type === 'peashooter') {
            if (p.cooldown <= 0) {
                const peaEl = document.createElement('div');
                peaEl.classList.add('pea');
                peaEl.style.left = (p.col * CELL_WIDTH + CELL_WIDTH / 2 - 5) + 'px';
                peaEl.style.top = (p.row * CELL_HEIGHT + CELL_HEIGHT / 2 - 5) + 'px';
                overlay.appendChild(peaEl);
                peas.push({ x: p.col * CELL_WIDTH + CELL_WIDTH / 2, row: p.row, el: peaEl });
                p.cooldown = 1000;
            }
        }
    });

    // update peas
    for (let i = peas.length - 1; i >= 0; i--) {
        const pea = peas[i];
        pea.x += 200 * (delta / 1000);
        if (pea.x > canvas.width) {
            pea.el.remove();
            peas.splice(i, 1);
            continue;
        }
        pea.el.style.left = (pea.x - 5) + 'px';
        zombies.forEach(z => {
            if (z.row === pea.row && Math.abs(z.x - pea.x) < 10) {
                z.health -= 1;
                pea.el.remove();
                peas.splice(i, 1);
            }
        });
    }

    // update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        z.x -= z.speed * (delta / 1000);
        z.el.style.left = (z.x - CELL_WIDTH / 2) + 'px';
        z.bar.style.left = (z.x - CELL_WIDTH / 2) + 'px';
        z.barInner.style.width = ((z.health / z.maxHealth) * 100) + '%';
        if (z.x < 0) {
            z.el.remove();
            z.bar.remove();
            statusEl.textContent = 'Game Over!';
            gameOver = true;
            return;
        }
        const plant = plants.find(p => p.row === z.row && z.x < (p.col + 1) * CELL_WIDTH - 10);
        if (plant) {
            plant.health -= 20 * (delta / 1000);
            if (plant.health <= 0) {
                plant.el.remove();
                plants.splice(plants.indexOf(plant), 1);
            }
        }
        if (z.health <= 0) {
            z.el.remove();
            z.bar.remove();
            zombies.splice(i, 1);
            score += 1;
            scoreEl.textContent = score;
        }
    }

    // spawn zombies
    lastZombieSpawn += delta;
    if (lastZombieSpawn > zombieSpawnInterval) {
        spawnZombie();
        lastZombieSpawn = 0;
        if (zombieSpawnInterval > 8000) {
            zombieSpawnInterval -= 1000;
        } else if (zombieSpawnInterval > 5000) {
            zombieSpawnInterval -= 500;
        } else if (zombieSpawnInterval > 1500) {
            zombieSpawnInterval -= 100;
        }
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
}

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
