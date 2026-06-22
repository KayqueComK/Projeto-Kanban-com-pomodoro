/* ==========================================================================
   Zenith Dashboard - Application Logic (JavaScript)
   ========================================================================== */

// --- STATE MANAGEMENT ---
let tasks = JSON.parse(localStorage.getItem('zenith_tasks')) || [];

// --- POMODORO TIMER CONFIG & STATE ---
const WORK_TIME = 25 * 60; // 25 min in seconds
let timerTimeLeft = WORK_TIME;
let timerInterval = null;
let timerRunning = false;

// --- DOM ELEMENTS ---
const timerDisplay = document.getElementById('timer-display');
const timerCircle = document.getElementById('timer-progress');
const timerPlayPauseBtn = document.getElementById('timer-play-pause');
const timerResetBtn = document.getElementById('timer-reset');
const timerStatusText = document.getElementById('timer-status');

const columns = {
    todo: document.getElementById('cards-todo'),
    progress: document.getElementById('cards-progress'),
    done: document.getElementById('cards-done')
};

const counts = {
    todo: document.getElementById('count-todo'),
    progress: document.getElementById('count-progress'),
    done: document.getElementById('count-done')
};

const statsCompleted = document.getElementById('stats-completed');
const statsEfficiency = document.getElementById('stats-efficiency');

// Task Modal elements
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPriorityInput = document.getElementById('task-priority');
const taskTagInput = document.getElementById('task-tag');

// --- SETUP POMODORO PROGRESS CIRCLE ---
const radius = timerCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
timerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
timerCircle.style.strokeDashoffset = circumference;

function updateTimerProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    timerCircle.style.strokeDashoffset = offset;
}

// --- SYNTH AUDIO (WEB AUDIO API) ---
function playChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Note 1 (C5) - Chiptune triangle wave
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.4);

        // Note 2 (E5, delayed) - Chiptune triangle wave
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(audioCtx.currentTime + 0.12);
        osc2.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
        console.warn("AudioContext not allowed or not supported yet:", e);
    }
}

// --- POMODORO TIMER LOGIC ---
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timerTimeLeft);
    const percent = ((WORK_TIME - timerTimeLeft) / WORK_TIME) * 100;
    updateTimerProgress(percent);
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    timerPlayPauseBtn.innerHTML = '<svg class="pixel-icon" viewBox="0 0 24 24"><path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/></svg>';
    timerStatusText.textContent = "Focando...";

    timerInterval = setInterval(() => {
        timerTimeLeft--;
        updateTimerDisplay();

        if (timerTimeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;
            timerTimeLeft = WORK_TIME;
            updateTimerDisplay();
            timerPlayPauseBtn.innerHTML = '<svg class="pixel-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"/></svg>';
            timerStatusText.textContent = "Sessão concluída!";
            playChime();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    timerPlayPauseBtn.innerHTML = '<svg class="pixel-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"/></svg>';
    timerStatusText.textContent = "Pausado";
}

function resetTimer() {
    pauseTimer();
    timerTimeLeft = WORK_TIME;
    updateTimerDisplay();
    timerStatusText.textContent = "Pronto para focar";
}

timerPlayPauseBtn.addEventListener('click', () => {
    if (timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

timerResetBtn.addEventListener('click', resetTimer);

// --- RENDER PRODUCTIVITY CHART (CANVAS) ---
function drawProductivityChart() {
    const canvas = document.getElementById('productivity-chart');
    if (!canvas) return;
    const container = canvas.parentElement;

    // Ajustar a resolução do Canvas para corresponder ao contêiner pai
    canvas.width = container.clientWidth - 10;
    canvas.height = container.clientHeight - 10;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Generate dates for last 7 days
    const days = [];
    const countsData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        days.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));

        const count = tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === dateString).length;
        countsData.push(count);
    }

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 10);
    ctx.lineTo(width - 15, 10);
    ctx.moveTo(15, height - 25);
    ctx.lineTo(width - 15, height - 25);
    ctx.stroke();

    // Graph bounds and points
    const paddingX = 20;
    const graphWidth = width - paddingX * 2;
    const maxVal = Math.max(...countsData, 3); // Minimum Y scale at 3
    const points = countsData.map((c, idx) => {
        const x = paddingX + (idx * (graphWidth / 6));
        // Chart heights: Y ranges from 15 (max value) to height - 25 (zero value)
        const y = (height - 25) - (c / maxVal) * (height - 40);
        return { x, y, val: c };
    });

    // Fill Stepped Area
    if (points.length > 0) {
        ctx.fillStyle = 'rgba(190, 77, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - 25);
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const nextX = points[i + 1].x;
            const nextY = points[i + 1].y;
            ctx.lineTo(nextX, points[i].y);
            ctx.lineTo(nextX, nextY);
        }
        ctx.lineTo(points[points.length - 1].x, height - 25);
        ctx.closePath();
        ctx.fill();
    }

    // Draw Stepped Line
    ctx.strokeStyle = '#be4dff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const nextX = points[i + 1].x;
        const nextY = points[i + 1].y;
        ctx.lineTo(nextX, points[i].y);
        ctx.lineTo(nextX, nextY);
    }
    ctx.stroke();

    // Draw points & values
    points.forEach(p => {
        // Pixel/Square Dot
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
        ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);

        // Show non-zero values on top of dots
        if (p.val > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px "Share Tech Mono"';
            ctx.textAlign = 'center';
            ctx.fillText(p.val, p.x, p.y - 8);
        }
    });

    // X Axis Labels (Days)
    ctx.fillStyle = '#b2b8d3';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'center';
    points.forEach((p, idx) => {
        ctx.fillText(days[idx].toUpperCase(), p.x, height - 8);
    });
}

// --- UPDATE STATS PANELS ---
function updateStats() {
    const completedCount = tasks.filter(t => t.status === 'done').length;
    statsCompleted.textContent = completedCount;

    const totalCount = tasks.length;
    const efficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    statsEfficiency.textContent = `${efficiency}%`;
}

// --- PERSIST STATE ---
function saveTasks() {
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    updateStats();
    drawProductivityChart();
}

// --- RENDERING KANBAN CARDS ---
function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.id = task.id;

    // Add active dragging style
    card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    // Setup Priority badge template
    const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };
    const priorityClass = `priority-${task.priority}`;
    const priorityText = priorityLabels[task.priority];

    card.innerHTML = `
        <div class="task-card-header">
            <h4 class="task-title">${escapeHTML(task.title)}</h4>
            <div class="task-actions">
                <button class="btn-card-action edit-btn" title="Editar"><svg class="pixel-icon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                <button class="btn-card-action delete-btn" title="Excluir"><svg class="pixel-icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
            </div>
        </div>
        ${task.desc ? `<p class="task-desc">${escapeHTML(task.desc)}</p>` : ''}
        <div class="task-card-footer">
            <span class="priority-badge ${priorityClass}">${priorityText}</span>
            ${task.tag ? `<span class="task-tag">${escapeHTML(task.tag)}</span>` : ''}
        </div>
    `;

    // Card Action Event Listeners
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(task);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    return card;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function renderBoard() {
    // Clear all containers
    columns.todo.innerHTML = '';
    columns.progress.innerHTML = '';
    columns.done.innerHTML = '';

    const countData = { todo: 0, progress: 0, done: 0 };

    // Render and append card elements
    tasks.forEach(task => {
        const card = createTaskCardElement(task);
        if (columns[task.status]) {
            columns[task.status].appendChild(card);
            countData[task.status]++;
        }
    });

    // Update counter badges
    counts.todo.textContent = countData.todo;
    counts.progress.textContent = countData.progress;
    counts.done.textContent = countData.done;
}

// --- DRAG & DROP LOGIC ---
Object.keys(columns).forEach(status => {
    const container = columns[status];

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', () => {
        container.classList.remove('drag-over');
        const activeCard = document.querySelector('.dragging');
        if (!activeCard) return;

        const taskId = activeCard.dataset.id;
        const task = tasks.find(t => t.id === taskId);

        if (task && task.status !== status) {
            // Update status and timestamp if moved to done
            task.status = status;
            if (status === 'done') {
                task.completedAt = new Date().toISOString();
                playChime(); // Play sound when completing a task!
            } else {
                task.completedAt = null;
            }
            saveTasks();
            renderBoard();
        }
    });
});

// --- TASK ACTIONS ---
function addOrUpdateTask(e) {
    e.preventDefault();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();
    const priority = taskPriorityInput.value;
    const tag = taskTagInput.value.trim();

    if (!title) return;

    if (id) {
        // Edit Mode
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.title = title;
            task.desc = desc;
            task.priority = priority;
            task.tag = tag;
        }
    } else {
        // New Mode
        const newTask = {
            id: generateUUID(),
            title,
            desc,
            status: 'todo',
            priority,
            tag,
            completedAt: null
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderBoard();
    closeModal();
}

function deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderBoard();
    }
}

function generateUUID() {
    return 'task-' + Math.random().toString(36).substr(2, 9);
}

// --- MODAL CONTROLLERS ---
function openModal(task = null) {
    taskModal.classList.add('active');

    if (task) {
        modalTitle.textContent = "Editar Tarefa";
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescInput.value = task.desc;
        taskPriorityInput.value = task.priority;
        taskTagInput.value = task.tag;
    } else {
        modalTitle.textContent = "Nova Tarefa";
        taskForm.reset();
        taskIdInput.value = '';
    }
    taskTitleInput.focus();
}

function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
}

addTaskBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelTaskBtn.addEventListener('click', closeModal);
taskForm.addEventListener('submit', addOrUpdateTask);

// Close modal when clicking outside content area
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeModal();
    }
});

// --- INITIALIZE APPLICATION ---
function init() {
    // Add default mock task if list is empty
    if (tasks.length === 0) {
        tasks = [
            {
                id: 'task-welcome-1',
                title: 'Boas-vindas ao Zenith!',
                desc: 'Experimente arrastar este cartão para a coluna "Em Andamento".',
                status: 'todo',
                priority: 'low',
                tag: 'Boas-Vindas',
                completedAt: null
            },
            {
                id: 'task-welcome-2',
                title: 'Estudar UX do Dashboard',
                desc: 'Pesquisar tendências de Glassmorphism e gradientes.',
                status: 'progress',
                priority: 'medium',
                tag: 'Design',
                completedAt: null
            },
            {
                id: 'task-welcome-3',
                title: 'Criar estrutura inicial HTML/CSS',
                desc: 'Definir cores, fontes e layout base de duas colunas.',
                status: 'done',
                priority: 'high',
                tag: 'Dev',
                completedAt: new Date().toISOString()
            }
        ];
        saveTasks();
    }

    updateTimerDisplay();
    updateStats();
    renderBoard();
    drawProductivityChart();
}

// Handle window resizing to redraw canvas chart correctly
window.addEventListener('resize', () => {
    drawProductivityChart();
});

document.addEventListener('DOMContentLoaded', init);
