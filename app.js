/* ============================================================
   ProjectFlow — Application Logic
   ============================================================ */

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  tasks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

// ── Utilities ─────────────────────────────────────────────────
function generateId() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

function escapeHTML(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Storage Manager ───────────────────────────────────────────
const Storage = {
  _get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  getUsers()    { return this._get('pf_users') || []; },
  saveUsers(u)  { this._set('pf_users', u); },
  getProjects() { return this._get('pf_projects') || []; },
  saveProjects(p) { this._set('pf_projects', p); },
  getTasks()    { return this._get('pf_tasks') || []; },
  saveTasks(t)  { this._set('pf_tasks', t); },

  getSession()  { return this._get('pf_session'); },
  setSession(s) { this._set('pf_session', s); },
  clearSession() { localStorage.removeItem('pf_session'); },
};

// ── Auth Manager ──────────────────────────────────────────────
const Auth = {
  register(fullName, email, password) {
    const users = Storage.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered' };
    const user = { id: generateId(), fullName, email, passwordHash: btoa(password), createdAt: new Date().toISOString() };
    users.push(user);
    Storage.saveUsers(users);
    Storage.setSession({ id: user.id, fullName: user.fullName, email: user.email });
    return { ok: true, user };
  },

  login(email, password) {
    const users = Storage.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) return { ok: false, msg: 'Invalid email or password' };
    if (atob(user.passwordHash) !== password) return { ok: false, msg: 'Invalid email or password' };
    Storage.setSession({ id: user.id, fullName: user.fullName, email: user.email });
    return { ok: true, user };
  },

  logout() { Storage.clearSession(); },
  currentUser() { return Storage.getSession(); },
  isAuthenticated() { return !!Storage.getSession(); },
};

// ── Toast Manager ─────────────────────────────────────────────
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span class="toast__message">${escapeHTML(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 300); }, 3000);
  },
};

// ── Modal Manager ─────────────────────────────────────────────
const Modal = {
  show(title, bodyHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalOverlay').classList.add('active');
  },
  hide() {
    document.getElementById('modalOverlay').classList.remove('active');
  },
};

// ── Router ────────────────────────────────────────────────────
const Router = {
  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },
  navigate(path) { window.location.hash = path; },
  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    if (!Auth.isAuthenticated() && hash !== '/register') {
      if (hash !== '/login') { window.location.hash = '#/login'; return; }
    }
    if (Auth.isAuthenticated() && (hash === '/login' || hash === '/register' || hash === '/')) {
      window.location.hash = '#/dashboard'; return;
    }

    const pageContent = document.getElementById('pageContent');
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const app = document.getElementById('app');

    if (hash === '/login' || hash === '/register') {
      sidebar.style.display = 'none';
      header.style.display = 'none';
      app.classList.add('auth-mode');
      if (hash === '/login') Pages.renderLogin(pageContent);
      else Pages.renderRegister(pageContent);
      return;
    }

    sidebar.style.display = '';
    header.style.display = '';
    app.classList.remove('auth-mode');
    App.updateSidebar(hash);
    App.updateHeader();

    if (hash === '/dashboard') Pages.renderDashboard(pageContent);
    else if (hash === '/projects') Pages.renderProjects(pageContent);
    else if (hash.startsWith('/projects/')) Pages.renderProjectDetail(pageContent, hash.split('/projects/')[1]);
    else if (hash === '/tasks') Pages.renderTasks(pageContent);
    else Pages.renderDashboard(pageContent);
  },
};

// ── Pages ─────────────────────────────────────────────────────
const Pages = {
  // ---- Login ----
  renderLogin(el) {
    el.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-card__logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lg)"/><path d="M9 16l4 4 10-10" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg>
            <span class="logo-text" style="font-size:1.5rem">ProjectFlow</span>
          </div>
          <h1 class="auth-card__title">Welcome back</h1>
          <p class="auth-card__subtitle">Sign in to your account to continue</p>
          <form id="loginForm">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" class="form-control" placeholder="demo@example.com" required />
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary">Sign In</button>
          </form>
          <p class="auth-link">Don't have an account? <a href="#/register">Sign up</a></p>
        </div>
      </div>`;
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) { Toast.show('Please fill in all fields', 'error'); return; }
      const res = Auth.login(email, password);
      if (res.ok) { Toast.show('Welcome back!', 'success'); Router.navigate('/dashboard'); }
      else Toast.show(res.msg, 'error');
    });
  },

  // ---- Register ----
  renderRegister(el) {
    el.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-card__logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lg2)"/><path d="M9 16l4 4 10-10" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg>
            <span class="logo-text" style="font-size:1.5rem">ProjectFlow</span>
          </div>
          <h1 class="auth-card__title">Create account</h1>
          <p class="auth-card__subtitle">Start managing your projects today</p>
          <form id="registerForm">
            <div class="form-group">
              <label for="regName">Full Name</label>
              <input type="text" id="regName" class="form-control" placeholder="John Doe" required />
            </div>
            <div class="form-group">
              <label for="regEmail">Email</label>
              <input type="email" id="regEmail" class="form-control" placeholder="john@example.com" required />
            </div>
            <div class="form-group">
              <label for="regPassword">Password</label>
              <input type="password" id="regPassword" class="form-control" placeholder="Min 6 characters" required minlength="6" />
            </div>
            <div class="form-group">
              <label for="regConfirm">Confirm Password</label>
              <input type="password" id="regConfirm" class="form-control" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary">Create Account</button>
          </form>
          <p class="auth-link">Already have an account? <a href="#/login">Sign in</a></p>
        </div>
      </div>`;
    document.getElementById('registerForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pw = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      if (!name || !email || !pw) { Toast.show('Please fill in all fields', 'error'); return; }
      if (pw.length < 6) { Toast.show('Password must be at least 6 characters', 'error'); return; }
      if (pw !== confirm) { Toast.show('Passwords do not match', 'error'); return; }
      const res = Auth.register(name, email, pw);
      if (res.ok) { Toast.show('Account created!', 'success'); Router.navigate('/dashboard'); }
      else Toast.show(res.msg, 'error');
    });
  },

  // ---- Dashboard ----
  renderDashboard(el) {
    const user = Auth.currentUser();
    const projects = Storage.getProjects().filter(p => p.userId === user.id);
    const tasks = Storage.getTasks().filter(t => t.userId === user.id);
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const inProgress = projects.filter(p => p.status === 'IN_PROGRESS').length;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    el.innerHTML = `
      <div class="welcome-banner">
        <div class="welcome-banner__greeting">Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, ${escapeHTML(user.fullName.split(' ')[0])} 👋</div>
        <div class="welcome-banner__date">${dateStr}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-card--indigo">
          <div class="stat-card__icon">${Icons.folder}</div>
          <div class="stat-card__value">${projects.length}</div>
          <div class="stat-card__label">Total Projects</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__icon">${Icons.tasks}</div>
          <div class="stat-card__value">${tasks.length}</div>
          <div class="stat-card__label">Total Tasks</div>
        </div>
        <div class="stat-card stat-card--emerald">
          <div class="stat-card__icon">${Icons.check}</div>
          <div class="stat-card__value">${completed}</div>
          <div class="stat-card__label">Completed</div>
        </div>
        <div class="stat-card stat-card--amber">
          <div class="stat-card__icon">${Icons.clock}</div>
          <div class="stat-card__value">${pending}</div>
          <div class="stat-card__label">Pending</div>
        </div>
        <div class="stat-card stat-card--rose">
          <div class="stat-card__icon">${Icons.activity}</div>
          <div class="stat-card__value">${inProgress}</div>
          <div class="stat-card__label">In Progress</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">Recent Projects</h3>
            <a href="#/projects" class="section-link">View all →</a>
          </div>
          ${projects.length === 0
            ? `<div class="empty-state"><div class="empty-state__icon">${Icons.folder}</div><p class="empty-state__title">No projects yet</p><p class="empty-state__text">Create your first project to get started</p></div>`
            : projects.slice(-5).reverse().map(p => {
                const pTasks = Storage.getTasks().filter(t => t.projectId === p.id);
                const done = pTasks.filter(t => t.status === 'COMPLETED').length;
                const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
                return `<div class="task-item" style="cursor:pointer" data-nav="/projects/${p.id}">
                  <div class="task-item__info">
                    <div class="task-item__name">${escapeHTML(p.name)}</div>
                    <div class="task-item__project-ref">${pTasks.length} tasks · ${pct}% complete</div>
                  </div>
                  <span class="badge badge-${p.status.toLowerCase().replace('_', '-')}">${p.status.replace('_', ' ')}</span>
                </div>`;
              }).join('')
          }
        </div>
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">Recent Tasks</h3>
            <a href="#/tasks" class="section-link">View all →</a>
          </div>
          ${tasks.length === 0
            ? `<div class="empty-state"><div class="empty-state__icon">${Icons.tasks}</div><p class="empty-state__title">No tasks yet</p><p class="empty-state__text">Add tasks to your projects</p></div>`
            : tasks.slice(-5).reverse().map(t => {
                const proj = Storage.getProjects().find(p => p.id === t.projectId);
                return `<div class="task-item">
                  <div class="task-item__checkbox ${t.status === 'COMPLETED' ? 'checked' : ''}" data-task-toggle="${t.id}">${Icons.check}</div>
                  <div class="task-item__info">
                    <div class="task-item__name ${t.status === 'COMPLETED' ? 'completed' : ''}">${escapeHTML(t.name)}</div>
                    <div class="task-item__project-ref">${proj ? escapeHTML(proj.name) : '—'}</div>
                  </div>
                  <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
                </div>`;
              }).join('')
          }
        </div>
      </div>`;

    // Dashboard nav clicks
    el.querySelectorAll('[data-nav]').forEach(item => {
      item.addEventListener('click', () => Router.navigate(item.dataset.nav));
    });
    // Task toggle from dashboard
    el.querySelectorAll('[data-task-toggle]').forEach(cb => {
      cb.addEventListener('click', e => {
        e.stopPropagation();
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === cb.dataset.taskToggle);
        if (task) {
          task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          Storage.saveTasks(tasks);
          Pages.renderDashboard(el);
          Toast.show(task.status === 'COMPLETED' ? 'Task completed!' : 'Task reopened', 'success');
        }
      });
    });
  },

  // ---- Projects List ----
  renderProjects(el, page = 1, search = '', statusFilter = '') {
    const user = Auth.currentUser();
    let projects = Storage.getProjects().filter(p => p.userId === user.id);
    if (search) projects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) projects = projects.filter(p => p.status === statusFilter);
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const perPage = 8;
    const totalPages = Math.ceil(projects.length / perPage) || 1;
    page = Math.min(page, totalPages);
    const paged = projects.slice((page - 1) * perPage, page * perPage);

    el.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">${projects.length} project${projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button class="btn btn-primary" id="newProjectBtn">${Icons.plus} New Project</button>
      </div>
      <div class="filter-bar">
        <div class="header-search" style="flex:1;max-width:320px">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="projectSearch" placeholder="Search projects..." value="${escapeHTML(search)}" />
        </div>
        <select class="filter-select" id="projectStatusFilter">
          <option value="">All Statuses</option>
          <option value="NOT_STARTED" ${statusFilter === 'NOT_STARTED' ? 'selected' : ''}>Not Started</option>
          <option value="IN_PROGRESS" ${statusFilter === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="COMPLETED" ${statusFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      ${paged.length === 0
        ? `<div class="empty-state"><div class="empty-state__icon">${Icons.folder}</div><p class="empty-state__title">No projects found</p><p class="empty-state__text">${search || statusFilter ? 'Try adjusting your filters' : 'Create your first project to get started'}</p>${!search && !statusFilter ? `<button class="btn btn-primary" id="emptyNewProject">${Icons.plus} New Project</button>` : ''}</div>`
        : `<div class="projects-grid">${paged.map(p => {
            const pTasks = Storage.getTasks().filter(t => t.projectId === p.id);
            const done = pTasks.filter(t => t.status === 'COMPLETED').length;
            const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            return `<div class="project-card" data-nav="/projects/${p.id}">
              <div class="project-card__header">
                <h3 class="project-card__name">${escapeHTML(p.name)}</h3>
                <span class="badge badge-${p.status.toLowerCase().replace('_', '-')}">${p.status.replace(/_/g, ' ')}</span>
              </div>
              <p class="project-card__desc">${escapeHTML(truncate(p.description, 100))}</p>
              <div class="progress-bar"><div class="progress-bar__fill ${pct === 100 ? 'progress-bar__fill--success' : ''}" style="width:${pct}%"></div></div>
              <div class="project-card__meta">
                <span class="project-card__meta-item">${Icons.calendar} ${formatDate(p.startDate)} — ${formatDate(p.endDate)}</span>
              </div>
              <div class="project-card__footer">
                <span class="project-card__tasks-count">${pTasks.length} task${pTasks.length !== 1 ? 's' : ''}</span>
                <div class="project-card__actions">
                  <button class="btn-icon edit-btn" data-edit-project="${p.id}" title="Edit">${Icons.edit}</button>
                  <button class="btn-icon delete-btn" data-delete-project="${p.id}" title="Delete">${Icons.trash}</button>
                </div>
              </div>
            </div>`;
          }).join('')}</div>`
      }
      ${totalPages > 1 ? renderPagination(page, totalPages, 'projectPage') : ''}`;

    // Events
    document.getElementById('newProjectBtn')?.addEventListener('click', () => showProjectModal());
    document.getElementById('emptyNewProject')?.addEventListener('click', () => showProjectModal());
    document.getElementById('projectSearch')?.addEventListener('input', debounce(e => {
      Pages.renderProjects(el, 1, e.target.value, document.getElementById('projectStatusFilter')?.value || '');
    }, 300));
    document.getElementById('projectStatusFilter')?.addEventListener('change', e => {
      Pages.renderProjects(el, 1, document.getElementById('projectSearch')?.value || '', e.target.value);
    });
    el.querySelectorAll('[data-nav]').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('[data-edit-project]') || e.target.closest('[data-delete-project]')) return;
        Router.navigate(card.dataset.nav);
      });
    });
    el.querySelectorAll('[data-edit-project]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); showProjectModal(btn.dataset.editProject); });
    });
    el.querySelectorAll('[data-delete-project]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); confirmDeleteProject(btn.dataset.deleteProject); });
    });
    el.querySelectorAll('[data-projectpage]').forEach(btn => {
      btn.addEventListener('click', () => Pages.renderProjects(el, parseInt(btn.dataset.projectpage), search, statusFilter));
    });
  },

  // ---- Project Detail ----
  renderProjectDetail(el, projectId) {
    const project = Storage.getProjects().find(p => p.id === projectId);
    if (!project) { Router.navigate('/projects'); return; }

    const renderTasks = (search = '', statusFilter = '', priorityFilter = '') => {
      let tasks = Storage.getTasks().filter(t => t.projectId === projectId);
      if (search) tasks = tasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter);
      if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const done = Storage.getTasks().filter(t => t.projectId === projectId && t.status === 'COMPLETED').length;
      const total = Storage.getTasks().filter(t => t.projectId === projectId).length;
      const pct = total ? Math.round((done / total) * 100) : 0;

      el.innerHTML = `
        <a href="#/projects" class="back-btn">${Icons.chevronLeft} Back to Projects</a>
        <div class="detail-header">
          <div class="detail-header__info">
            <h1 class="detail-header__title">${escapeHTML(project.name)}</h1>
            <p class="detail-header__desc">${escapeHTML(project.description || 'No description')}</p>
            <div class="detail-header__meta">
              <span class="badge badge-${project.status.toLowerCase().replace('_', '-')}">${project.status.replace(/_/g, ' ')}</span>
              <span class="detail-header__meta-item">${Icons.calendar} ${formatDate(project.startDate)} — ${formatDate(project.endDate)}</span>
              <span class="detail-header__meta-item">${done}/${total} tasks completed (${pct}%)</span>
            </div>
          </div>
          <div class="detail-header__actions">
            <button class="btn btn-secondary" id="editProjectBtn">${Icons.edit} Edit</button>
            <button class="btn btn-danger" id="deleteProjectBtn">${Icons.trash} Delete</button>
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:24px"><div class="progress-bar__fill ${pct === 100 ? 'progress-bar__fill--success' : ''}" style="width:${pct}%"></div></div>

        <div class="section-header">
          <h3 class="section-title">Tasks</h3>
          <button class="btn btn-primary" id="addTaskBtn">${Icons.plus} Add Task</button>
        </div>
        <div class="filter-bar">
          <div class="header-search" style="flex:1;max-width:280px">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="detailTaskSearch" placeholder="Search tasks..." value="${escapeHTML(search)}" />
          </div>
          <select class="filter-select" id="detailTaskStatus">
            <option value="">All Statuses</option>
            <option value="PENDING" ${statusFilter === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="IN_PROGRESS" ${statusFilter === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
            <option value="COMPLETED" ${statusFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
          </select>
          <select class="filter-select" id="detailTaskPriority">
            <option value="">All Priorities</option>
            <option value="LOW" ${priorityFilter === 'LOW' ? 'selected' : ''}>Low</option>
            <option value="MEDIUM" ${priorityFilter === 'MEDIUM' ? 'selected' : ''}>Medium</option>
            <option value="HIGH" ${priorityFilter === 'HIGH' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="tasks-list">
          ${tasks.length === 0
            ? `<div class="empty-state"><div class="empty-state__icon">${Icons.tasks}</div><p class="empty-state__title">No tasks found</p><p class="empty-state__text">${search || statusFilter || priorityFilter ? 'Try adjusting your filters' : 'Add your first task to this project'}</p></div>`
            : tasks.map(t => `
              <div class="task-item">
                <div class="task-item__checkbox ${t.status === 'COMPLETED' ? 'checked' : ''}" data-task-toggle="${t.id}">${Icons.check}</div>
                <div class="task-item__info">
                  <div class="task-item__name ${t.status === 'COMPLETED' ? 'completed' : ''}">${escapeHTML(t.name)}</div>
                  ${t.description ? `<div class="task-item__project-ref">${escapeHTML(truncate(t.description, 60))}</div>` : ''}
                </div>
                <div class="task-item__badges">
                  <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
                  <span class="badge badge-${t.status.toLowerCase().replace('_', '-')}">${t.status.replace(/_/g, ' ')}</span>
                </div>
                <span class="task-item__due">${Icons.calendar} ${formatDate(t.dueDate)}</span>
                <div class="task-item__actions">
                  <button class="btn-icon edit-btn" data-edit-task="${t.id}" title="Edit">${Icons.edit}</button>
                  <button class="btn-icon delete-btn" data-delete-task="${t.id}" title="Delete">${Icons.trash}</button>
                </div>
              </div>`).join('')
          }
        </div>`;

      // Events
      document.getElementById('editProjectBtn')?.addEventListener('click', () => {
        showProjectModal(projectId, () => {
          const updated = Storage.getProjects().find(p => p.id === projectId);
          if (updated) Object.assign(project, updated);
          renderTasks(search, statusFilter, priorityFilter);
        });
      });
      document.getElementById('deleteProjectBtn')?.addEventListener('click', () => confirmDeleteProject(projectId, true));
      document.getElementById('addTaskBtn')?.addEventListener('click', () => showTaskModal(null, projectId, () => renderTasks()));
      document.getElementById('detailTaskSearch')?.addEventListener('input', debounce(e => {
        renderTasks(e.target.value, document.getElementById('detailTaskStatus')?.value, document.getElementById('detailTaskPriority')?.value);
      }, 300));
      document.getElementById('detailTaskStatus')?.addEventListener('change', e => {
        renderTasks(document.getElementById('detailTaskSearch')?.value, e.target.value, document.getElementById('detailTaskPriority')?.value);
      });
      document.getElementById('detailTaskPriority')?.addEventListener('change', e => {
        renderTasks(document.getElementById('detailTaskSearch')?.value, document.getElementById('detailTaskStatus')?.value, e.target.value);
      });
      el.querySelectorAll('[data-task-toggle]').forEach(cb => {
        cb.addEventListener('click', () => {
          const tasks = Storage.getTasks();
          const task = tasks.find(t => t.id === cb.dataset.taskToggle);
          if (task) {
            task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
            Storage.saveTasks(tasks);
            renderTasks(document.getElementById('detailTaskSearch')?.value, document.getElementById('detailTaskStatus')?.value, document.getElementById('detailTaskPriority')?.value);
            Toast.show(task.status === 'COMPLETED' ? 'Task completed!' : 'Task reopened', 'success');
          }
        });
      });
      el.querySelectorAll('[data-edit-task]').forEach(btn => {
        btn.addEventListener('click', () => showTaskModal(btn.dataset.editTask, projectId, () => renderTasks()));
      });
      el.querySelectorAll('[data-delete-task]').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteTask(btn.dataset.deleteTask, () => renderTasks()));
      });
    };

    renderTasks();
  },

  // ---- All Tasks ----
  renderTasks(el, page = 1, search = '', statusFilter = '', priorityFilter = '', projectFilter = '') {
    const user = Auth.currentUser();
    let tasks = Storage.getTasks().filter(t => t.userId === user.id);
    const projects = Storage.getProjects().filter(p => p.userId === user.id);

    if (search) tasks = tasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter);
    if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
    if (projectFilter) tasks = tasks.filter(t => t.projectId === projectFilter);
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const perPage = 10;
    const totalPages = Math.ceil(tasks.length / perPage) || 1;
    page = Math.min(page, totalPages);
    const paged = tasks.slice((page - 1) * perPage, page * perPage);

    el.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div class="filter-bar">
        <div class="header-search" style="flex:1;max-width:280px">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="allTaskSearch" placeholder="Search tasks..." value="${escapeHTML(search)}" />
        </div>
        <select class="filter-select" id="allTaskStatus">
          <option value="">All Statuses</option>
          <option value="PENDING" ${statusFilter === 'PENDING' ? 'selected' : ''}>Pending</option>
          <option value="IN_PROGRESS" ${statusFilter === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="COMPLETED" ${statusFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
        <select class="filter-select" id="allTaskPriority">
          <option value="">All Priorities</option>
          <option value="LOW" ${priorityFilter === 'LOW' ? 'selected' : ''}>Low</option>
          <option value="MEDIUM" ${priorityFilter === 'MEDIUM' ? 'selected' : ''}>Medium</option>
          <option value="HIGH" ${priorityFilter === 'HIGH' ? 'selected' : ''}>High</option>
        </select>
        <select class="filter-select" id="allTaskProject">
          <option value="">All Projects</option>
          ${projects.map(p => `<option value="${p.id}" ${projectFilter === p.id ? 'selected' : ''}>${escapeHTML(p.name)}</option>`).join('')}
        </select>
      </div>
      <div class="tasks-list">
        ${paged.length === 0
          ? `<div class="empty-state"><div class="empty-state__icon">${Icons.tasks}</div><p class="empty-state__title">No tasks found</p><p class="empty-state__text">${search || statusFilter || priorityFilter || projectFilter ? 'Try adjusting your filters' : 'Create tasks inside your projects'}</p></div>`
          : paged.map(t => {
              const proj = projects.find(p => p.id === t.projectId);
              return `<div class="task-item">
                <div class="task-item__checkbox ${t.status === 'COMPLETED' ? 'checked' : ''}" data-task-toggle="${t.id}">${Icons.check}</div>
                <div class="task-item__info">
                  <div class="task-item__name ${t.status === 'COMPLETED' ? 'completed' : ''}">${escapeHTML(t.name)}</div>
                  <div class="task-item__project-ref">${proj ? escapeHTML(proj.name) : '—'}</div>
                </div>
                <div class="task-item__badges">
                  <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
                  <span class="badge badge-${t.status.toLowerCase().replace('_', '-')}">${t.status.replace(/_/g, ' ')}</span>
                </div>
                <span class="task-item__due">${Icons.calendar} ${formatDate(t.dueDate)}</span>
                <div class="task-item__actions">
                  <button class="btn-icon edit-btn" data-edit-task="${t.id}" title="Edit">${Icons.edit}</button>
                  <button class="btn-icon delete-btn" data-delete-task="${t.id}" title="Delete">${Icons.trash}</button>
                </div>
              </div>`;
            }).join('')
        }
      </div>
      ${totalPages > 1 ? renderPagination(page, totalPages, 'taskPage') : ''}`;

    // Events
    const rerender = () => {
      const s = document.getElementById('allTaskSearch')?.value || '';
      const st = document.getElementById('allTaskStatus')?.value || '';
      const pr = document.getElementById('allTaskPriority')?.value || '';
      const pj = document.getElementById('allTaskProject')?.value || '';
      Pages.renderTasks(el, 1, s, st, pr, pj);
    };
    document.getElementById('allTaskSearch')?.addEventListener('input', debounce(rerender, 300));
    document.getElementById('allTaskStatus')?.addEventListener('change', rerender);
    document.getElementById('allTaskPriority')?.addEventListener('change', rerender);
    document.getElementById('allTaskProject')?.addEventListener('change', rerender);

    el.querySelectorAll('[data-task-toggle]').forEach(cb => {
      cb.addEventListener('click', () => {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === cb.dataset.taskToggle);
        if (task) {
          task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          Storage.saveTasks(tasks);
          rerender();
          Toast.show(task.status === 'COMPLETED' ? 'Task completed!' : 'Task reopened', 'success');
        }
      });
    });
    el.querySelectorAll('[data-edit-task]').forEach(btn => {
      btn.addEventListener('click', () => showTaskModal(btn.dataset.editTask, null, rerender));
    });
    el.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', () => confirmDeleteTask(btn.dataset.deleteTask, rerender));
    });
    el.querySelectorAll('[data-taskpage]').forEach(btn => {
      btn.addEventListener('click', () => Pages.renderTasks(el, parseInt(btn.dataset.taskpage), search, statusFilter, priorityFilter, projectFilter));
    });
  },
};

// ── Pagination Helper ─────────────────────────────────────────
function renderPagination(current, total, dataKey) {
  let html = `<div class="pagination">`;
  html += `<button class="pagination__btn" data-${dataKey}="${current - 1}" ${current <= 1 ? 'disabled' : ''}>${Icons.chevronLeft}</button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="pagination__btn ${i === current ? 'active' : ''}" data-${dataKey}="${i}">${i}</button>`;
  }
  html += `<button class="pagination__btn" data-${dataKey}="${current + 1}" ${current >= total ? 'disabled' : ''}>${Icons.chevronRight}</button>`;
  html += `</div>`;
  return html;
}

// ── Project Modal ─────────────────────────────────────────────
function showProjectModal(editId, onDone) {
  const existing = editId ? Storage.getProjects().find(p => p.id === editId) : null;
  const title = existing ? 'Edit Project' : 'New Project';

  Modal.show(title, `
    <form id="projectForm">
      <div class="form-group">
        <label for="pName">Project Name *</label>
        <input type="text" id="pName" class="form-control" placeholder="My Awesome Project" value="${existing ? escapeHTML(existing.name) : ''}" required />
      </div>
      <div class="form-group">
        <label for="pDesc">Description</label>
        <textarea id="pDesc" class="form-control" placeholder="Brief description...">${existing ? escapeHTML(existing.description || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label for="pStatus">Status</label>
        <select id="pStatus" class="form-control">
          <option value="NOT_STARTED" ${existing?.status === 'NOT_STARTED' ? 'selected' : ''}>Not Started</option>
          <option value="IN_PROGRESS" ${existing?.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="COMPLETED" ${existing?.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="pStart">Start Date</label>
          <input type="date" id="pStart" class="form-control" value="${existing?.startDate || ''}" />
        </div>
        <div class="form-group">
          <label for="pEnd">End Date</label>
          <input type="date" id="pEnd" class="form-control" value="${existing?.endDate || ''}" />
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="cancelProjectBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Save Changes' : 'Create Project'}</button>
      </div>
    </form>
  `);

  document.getElementById('cancelProjectBtn').addEventListener('click', () => Modal.hide());
  document.getElementById('projectForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('pName').value.trim();
    if (!name) { Toast.show('Project name is required', 'error'); return; }
    const data = {
      name,
      description: document.getElementById('pDesc').value.trim(),
      status: document.getElementById('pStatus').value,
      startDate: document.getElementById('pStart').value,
      endDate: document.getElementById('pEnd').value,
    };

    const projects = Storage.getProjects();
    if (existing) {
      const idx = projects.findIndex(p => p.id === editId);
      projects[idx] = { ...projects[idx], ...data };
      Storage.saveProjects(projects);
      Toast.show('Project updated!', 'success');
    } else {
      const user = Auth.currentUser();
      projects.push({ id: generateId(), ...data, createdAt: new Date().toISOString(), userId: user.id });
      Storage.saveProjects(projects);
      Toast.show('Project created!', 'success');
    }
    Modal.hide();
    if (onDone) onDone();
    else Router.resolve();
  });
}

// ── Task Modal ────────────────────────────────────────────────
function showTaskModal(editId, defaultProjectId, onDone) {
  const existing = editId ? Storage.getTasks().find(t => t.id === editId) : null;
  const user = Auth.currentUser();
  const projects = Storage.getProjects().filter(p => p.userId === user.id);
  const title = existing ? 'Edit Task' : 'New Task';
  const selectedProject = existing ? existing.projectId : (defaultProjectId || '');

  Modal.show(title, `
    <form id="taskForm">
      <div class="form-group">
        <label for="tName">Task Name *</label>
        <input type="text" id="tName" class="form-control" placeholder="Design landing page" value="${existing ? escapeHTML(existing.name) : ''}" required />
      </div>
      <div class="form-group">
        <label for="tDesc">Description</label>
        <textarea id="tDesc" class="form-control" placeholder="Task details...">${existing ? escapeHTML(existing.description || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label for="tProject">Project *</label>
        <select id="tProject" class="form-control" required>
          <option value="">Select project</option>
          ${projects.map(p => `<option value="${p.id}" ${selectedProject === p.id ? 'selected' : ''}>${escapeHTML(p.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="tPriority">Priority</label>
          <select id="tPriority" class="form-control">
            <option value="LOW" ${existing?.priority === 'LOW' ? 'selected' : ''}>Low</option>
            <option value="MEDIUM" ${!existing || existing?.priority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
            <option value="HIGH" ${existing?.priority === 'HIGH' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="form-group">
          <label for="tStatus">Status</label>
          <select id="tStatus" class="form-control">
            <option value="PENDING" ${!existing || existing?.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="IN_PROGRESS" ${existing?.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
            <option value="COMPLETED" ${existing?.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="tDue">Due Date</label>
        <input type="date" id="tDue" class="form-control" value="${existing?.dueDate || ''}" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="cancelTaskBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Save Changes' : 'Create Task'}</button>
      </div>
    </form>
  `);

  document.getElementById('cancelTaskBtn').addEventListener('click', () => Modal.hide());
  document.getElementById('taskForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('tName').value.trim();
    const projectId = document.getElementById('tProject').value;
    if (!name) { Toast.show('Task name is required', 'error'); return; }
    if (!projectId) { Toast.show('Please select a project', 'error'); return; }

    const data = {
      name,
      description: document.getElementById('tDesc').value.trim(),
      projectId,
      priority: document.getElementById('tPriority').value,
      status: document.getElementById('tStatus').value,
      dueDate: document.getElementById('tDue').value,
    };

    const tasks = Storage.getTasks();
    if (existing) {
      const idx = tasks.findIndex(t => t.id === editId);
      tasks[idx] = { ...tasks[idx], ...data };
      Storage.saveTasks(tasks);
      Toast.show('Task updated!', 'success');
    } else {
      tasks.push({ id: generateId(), ...data, createdAt: new Date().toISOString(), userId: user.id });
      Storage.saveTasks(tasks);
      Toast.show('Task created!', 'success');
    }
    Modal.hide();
    if (onDone) onDone(); else Router.resolve();
  });
}

// ── Delete Confirmations ──────────────────────────────────────
function confirmDeleteProject(id, goBack) {
  const project = Storage.getProjects().find(p => p.id === id);
  if (!project) return;
  Modal.show('Delete Project', `
    <p class="confirm-text">Are you sure you want to delete <strong>${escapeHTML(project.name)}</strong>? All tasks in this project will also be deleted. This action cannot be undone.</p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelDelete">Cancel</button>
      <button class="btn btn-danger" id="confirmDelete">${Icons.trash} Delete</button>
    </div>
  `);
  document.getElementById('cancelDelete').addEventListener('click', () => Modal.hide());
  document.getElementById('confirmDelete').addEventListener('click', () => {
    let projects = Storage.getProjects().filter(p => p.id !== id);
    let tasks = Storage.getTasks().filter(t => t.projectId !== id);
    Storage.saveProjects(projects);
    Storage.saveTasks(tasks);
    Modal.hide();
    Toast.show('Project deleted', 'success');
    if (goBack) Router.navigate('/projects');
    else Router.resolve();
  });
}

function confirmDeleteTask(id, onDone) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  Modal.show('Delete Task', `
    <p class="confirm-text">Are you sure you want to delete <strong>${escapeHTML(task.name)}</strong>? This action cannot be undone.</p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelDelete">Cancel</button>
      <button class="btn btn-danger" id="confirmDelete">${Icons.trash} Delete</button>
    </div>
  `);
  document.getElementById('cancelDelete').addEventListener('click', () => Modal.hide());
  document.getElementById('confirmDelete').addEventListener('click', () => {
    let tasks = Storage.getTasks().filter(t => t.id !== id);
    Storage.saveTasks(tasks);
    Modal.hide();
    Toast.show('Task deleted', 'success');
    if (onDone) onDone(); else Router.resolve();
  });
}

// ── Main App ──────────────────────────────────────────────────
const App = {
  init() {
    this.seedDemoData();
    this.setupEvents();
    Router.init();
  },

  setupEvents() {
    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => Modal.hide());
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modalOverlay')) Modal.hide();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      Auth.logout();
      Router.navigate('/login');
      Toast.show('Logged out successfully', 'info');
    });

    // Hamburger
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarOverlay').classList.toggle('active');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('active');
    });

    // Sidebar nav — close on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
      });
    });

    // Global search
    document.getElementById('globalSearch').addEventListener('input', debounce(e => {
      const q = e.target.value.trim();
      if (!q) { Router.resolve(); return; }
      const hash = window.location.hash.slice(1);
      if (hash === '/projects' || hash === '/dashboard') {
        Pages.renderProjects(document.getElementById('pageContent'), 1, q);
      } else if (hash === '/tasks') {
        Pages.renderTasks(document.getElementById('pageContent'), 1, q);
      }
    }, 300));
  },

  updateSidebar(hash) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const page = item.dataset.page;
      if (page === 'dashboard' && hash === '/dashboard') item.classList.add('active');
      else if (page === 'projects' && hash.startsWith('/projects')) item.classList.add('active');
      else if (page === 'tasks' && hash === '/tasks') item.classList.add('active');
      else item.classList.remove('active');
    });

    const user = Auth.currentUser();
    if (user) {
      document.getElementById('userAvatar').textContent = user.fullName.charAt(0).toUpperCase();
      document.getElementById('userName').textContent = user.fullName;
      document.getElementById('userEmail').textContent = user.email;
    }
  },

  updateHeader() {
    const user = Auth.currentUser();
    if (user) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      document.getElementById('headerGreeting').textContent = `${greeting}, ${user.fullName.split(' ')[0]}`;
    }
  },

  seedDemoData() {
    if (Storage.getUsers().length > 0) return;

    const userId = generateId();
    Storage.saveUsers([{
      id: userId, fullName: 'Demo User', email: 'demo@example.com',
      passwordHash: btoa('demo123'), createdAt: new Date().toISOString(),
    }]);

    const p1 = generateId(), p2 = generateId(), p3 = generateId(), p4 = generateId();
    Storage.saveProjects([
      { id: p1, name: 'E-Commerce Redesign', description: 'Complete overhaul of the online store with modern UI, improved checkout flow, and mobile-first design.', status: 'IN_PROGRESS', startDate: '2026-06-01', endDate: '2026-08-30', createdAt: '2026-06-01T10:00:00Z', userId },
      { id: p2, name: 'Mobile App MVP', description: 'Build the first version of our cross-platform mobile application with core features.', status: 'NOT_STARTED', startDate: '2026-07-01', endDate: '2026-10-15', createdAt: '2026-06-05T10:00:00Z', userId },
      { id: p3, name: 'API Infrastructure', description: 'Migrate REST APIs to GraphQL and set up rate limiting, caching, and monitoring.', status: 'IN_PROGRESS', startDate: '2026-05-15', endDate: '2026-07-30', createdAt: '2026-05-15T10:00:00Z', userId },
      { id: p4, name: 'Marketing Dashboard', description: 'Analytics dashboard for tracking campaign performance, ROI metrics, and audience insights.', status: 'COMPLETED', startDate: '2026-03-01', endDate: '2026-05-31', createdAt: '2026-03-01T10:00:00Z', userId },
    ]);

    Storage.saveTasks([
      { id: generateId(), name: 'Design homepage wireframes', description: 'Create low-fidelity wireframes for the new homepage layout', priority: 'HIGH', status: 'COMPLETED', dueDate: '2026-06-10', createdAt: '2026-06-02T10:00:00Z', projectId: p1, userId },
      { id: generateId(), name: 'Implement product grid', description: 'Build responsive product listing grid with filtering', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2026-06-25', createdAt: '2026-06-03T10:00:00Z', projectId: p1, userId },
      { id: generateId(), name: 'Set up payment gateway', description: 'Integrate Stripe for secure payments', priority: 'HIGH', status: 'PENDING', dueDate: '2026-07-10', createdAt: '2026-06-04T10:00:00Z', projectId: p1, userId },
      { id: generateId(), name: 'User authentication flow', description: 'Implement sign up, login, password reset', priority: 'HIGH', status: 'PENDING', dueDate: '2026-07-15', createdAt: '2026-06-06T10:00:00Z', projectId: p2, userId },
      { id: generateId(), name: 'Push notification service', description: 'Set up Firebase Cloud Messaging for push notifications', priority: 'LOW', status: 'PENDING', dueDate: '2026-08-01', createdAt: '2026-06-07T10:00:00Z', projectId: p2, userId },
      { id: generateId(), name: 'GraphQL schema design', description: 'Define types, queries, and mutations for the API', priority: 'HIGH', status: 'COMPLETED', dueDate: '2026-06-01', createdAt: '2026-05-16T10:00:00Z', projectId: p3, userId },
      { id: generateId(), name: 'Implement rate limiting', description: 'Add Redis-based rate limiting to all API endpoints', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2026-06-20', createdAt: '2026-05-20T10:00:00Z', projectId: p3, userId },
      { id: generateId(), name: 'Set up monitoring', description: 'Deploy Grafana + Prometheus for API observability', priority: 'LOW', status: 'PENDING', dueDate: '2026-07-15', createdAt: '2026-05-25T10:00:00Z', projectId: p3, userId },
      { id: generateId(), name: 'Campaign ROI calculator', description: 'Build interactive ROI calculation widget', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '2026-04-15', createdAt: '2026-03-10T10:00:00Z', projectId: p4, userId },
      { id: generateId(), name: 'Export data as PDF', description: 'Generate and download reports as PDF documents', priority: 'LOW', status: 'COMPLETED', dueDate: '2026-05-01', createdAt: '2026-03-20T10:00:00Z', projectId: p4, userId },
    ]);
  },
};

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
