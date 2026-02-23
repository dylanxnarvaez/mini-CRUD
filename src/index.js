let tasks = [];
  let currentFilter = 'all';
  let nextId = 1;

  // ── CREATE ──
  function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) { shake(input); return; }

    const task = {
      id: nextId++,
      text,
      done: false,
      createdAt: new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'short' })
    };
    tasks.unshift(task);
    input.value = '';
    render();
    showToast('Tarea añadida ✓');
  }

  // ── READ / RENDER ──
  function render() {
    const list = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');

    const filtered = tasks.filter(t => {
      if (currentFilter === 'pending') return !t.done;
      if (currentFilter === 'done')    return  t.done;
      return true;
    });

    list.innerHTML = '';

    if (filtered.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      filtered.forEach(task => list.appendChild(createTaskEl(task)));
    }

    // counter
    const total = tasks.length;
    const done  = tasks.filter(t => t.done).length;
    document.getElementById('task-counter').textContent =
      `${done}/${total} completada${total !== 1 ? 's' : ''}`;
  }

  function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;
    li.innerHTML = `
      <div class="task-check ${task.done ? 'checked' : ''}" onclick="toggleDone(${task.id})"></div>
      <span class="task-text" id="text-${task.id}">${escHtml(task.text)}</span>
      <span class="task-date">${task.createdAt}</span>
      <div class="task-actions">
        <button class="action-btn edit-btn" onclick="startEdit(${task.id})">editar</button>
        <button class="action-btn del-btn"  onclick="deleteTask(${task.id})">×</button>
      </div>`;
    return li;
  }

  // ── UPDATE — toggle ──
  function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    t.done = !t.done;
    render();
    showToast(t.done ? 'Tarea completada 🎉' : 'Tarea reabierta');
  }

  // ── UPDATE — edit ──
  function startEdit(id) {
    const el = document.getElementById(`text-${id}`);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    el.contentEditable = 'true';
    el.classList.add('editing');
    el.focus();

    // move cursor to end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    // swap button
    const editBtn = el.closest('.task-item').querySelector('.edit-btn');
    editBtn.textContent = 'guardar';
    editBtn.classList.replace('edit-btn', 'save-btn');
    editBtn.onclick = () => saveEdit(id);

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); saveEdit(id); }
      if (e.key === 'Escape') { cancelEdit(id, task.text); }
    });
  }

  function saveEdit(id) {
    const el = document.getElementById(`text-${id}`);
    const newText = el.innerText.trim();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!newText) { cancelEdit(id, task.text); return; }
    task.text = newText;
    render();
    showToast('Tarea actualizada ✎');
  }

  function cancelEdit(id, original) {
    const el = document.getElementById(`text-${id}`);
    if (el) { el.innerText = original; el.contentEditable = 'false'; el.classList.remove('editing'); }
    render();
  }

  // ── DELETE ──
  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    render();
    showToast('Tarea eliminada');
  }

  // ── FILTER ──
  function setFilter(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  }

  // ── HELPERS ──
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function shake(el) {
    el.style.borderColor = '#ff4d4d';
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(0)' }
    ], { duration: 250 });
    setTimeout(() => el.style.borderColor = '', 600);
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── ENTER key en input ──
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // ── Init con tareas de ejemplo ──
  ['Revisar portfolio de GitHub', 'Preparar CV actualizado', 'Buscar empresas en LinkedIn'].forEach(text => {
    tasks.push({ id: nextId++, text, done: false, createdAt: new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'short' }) });
  });
  render();