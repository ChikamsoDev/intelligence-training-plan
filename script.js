const TASKS_KEY = 'sip_tasks_by_date_v1';
const JOURNAL_KEY = 'sip_journal_by_date_v1';

const today = new Date().toISOString().split('T')[0];
const formattedToday = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('new-task');
const clearTasksBtn = document.getElementById('clear-tasks');
const loadCoreRoutineBtn = document.getElementById('load-core-routine');
const todayDate = document.getElementById('today-date');

const journalForm = document.getElementById('journal-form');
const journalEntry = document.getElementById('journal-entry');
const saveStatus = document.getElementById('save-status');
const journalHistory = document.getElementById('journal-history');

todayDate.textContent = formattedToday;

function readStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTodayTasks() {
  const all = readStore(TASKS_KEY);
  return all[today] || [];
}

function setTodayTasks(tasks) {
  const all = readStore(TASKS_KEY);
  all[today] = tasks;
  writeStore(TASKS_KEY, all);
}

function renderTasks() {
  const tasks = getTodayTasks();
  taskList.innerHTML = '';

  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No tasks yet. Add one or load the core routine.';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;

    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      setTodayTasks(tasks);
      renderTasks();
    });

    const label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.label;

    left.append(checkbox, label);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'icon-btn';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const remaining = tasks.filter((t) => t.id !== task.id);
      setTodayTasks(remaining);
      renderTasks();
    });

    li.append(left, removeButton);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = getTodayTasks();
  tasks.push({ id: crypto.randomUUID(), label: text, done: false });
  setTodayTasks(tasks);
  taskInput.value = '';
  renderTasks();
});

loadCoreRoutineBtn.addEventListener('click', () => {
  const core = [
    '20 min hard thinking block',
    '30 min focused build/learning block',
    '10 min daily reflection',
  ];
  const tasks = core.map((label) => ({ id: crypto.randomUUID(), label, done: false }));
  setTodayTasks(tasks);
  renderTasks();
});

clearTasksBtn.addEventListener('click', () => {
  setTodayTasks([]);
  renderTasks();
});

function loadJournalForToday() {
  const all = readStore(JOURNAL_KEY);
  journalEntry.value = all[today] || '';
}

journalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const all = readStore(JOURNAL_KEY);
  all[today] = journalEntry.value.trim();
  writeStore(JOURNAL_KEY, all);
  saveStatus.textContent = 'Saved.';
  renderJournalHistory();
  setTimeout(() => {
    saveStatus.textContent = '';
  }, 1400);
});

function renderJournalHistory() {
  const all = readStore(JOURNAL_KEY);
  const recentDates = Object.keys(all)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 7);

  journalHistory.innerHTML = '';

  if (!recentDates.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No journal entries yet.';
    journalHistory.appendChild(empty);
    return;
  }

  recentDates.forEach((date) => {
    const item = document.createElement('li');
    item.className = 'history-item';

    const heading = document.createElement('h3');
    heading.textContent = new Date(date).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const body = document.createElement('p');
    body.textContent = all[date] || '(empty entry)';

    item.append(heading, body);
    journalHistory.appendChild(item);
  });
}

renderTasks();
loadJournalForToday();
renderJournalHistory();
