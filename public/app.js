// ─── Token helpers ─────────────────────────────────────────────────────────
function getAccessToken()  { return localStorage.getItem('hw_access_token'); }
function getRefreshToken() { return localStorage.getItem('hw_refresh_token'); }
function getUser()         { return JSON.parse(localStorage.getItem('hw_user') || 'null'); }

function storeSession(data) {
  localStorage.setItem('hw_access_token',  data.access_token);
  localStorage.setItem('hw_refresh_token', data.refresh_token);
  localStorage.setItem('hw_user',          JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem('hw_access_token');
  localStorage.removeItem('hw_refresh_token');
  localStorage.removeItem('hw_user');
}

/** Faz fetch com Authorization; se receber 401 tenta renovar o access_token uma vez. */
async function authFetch(url, options = {}) {
  options.headers = { ...(options.headers || {}), 'Authorization': `Bearer ${getAccessToken()}` };
  let res = await fetch(url, options);

  if (res.status === 401) {
    const rt = getRefreshToken();
    if (!rt) { clearSession(); showLogin(); throw new Error('Sessão expirada'); }

    const refresh = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!refresh.ok) { clearSession(); showLogin(); throw new Error('Sessão expirada'); }
    const { access_token } = await refresh.json();
    localStorage.setItem('hw_access_token', access_token);

    options.headers['Authorization'] = `Bearer ${access_token}`;
    res = await fetch(url, options);
  }
  return res.json();
}

// ─── API ────────────────────────────────────────────────────────────────────
const API = {
  register:  (d) => fetch('/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
  login:     (d) => fetch('/auth/login',    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),

  addWork:  (d) => authFetch('/work-entries/',        { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) }),
  listWork: (userId) => authFetch(`/work-entries/${userId}`),
  delWork:  (id, userId) => authFetch(`/work-entries/${id}/${userId}`, { method: 'DELETE' }),
  getSaldo: (userId) => authFetch(`/users/saldo/${userId}`),

  ping: () => fetch('/ping').then(r => r.json()),
};

// ─── UI helpers ─────────────────────────────────────────────────────────────
const content = document.getElementById('content');
const title   = document.getElementById('page-title');

function clear() { content.innerHTML = ''; }

function updateNav() {
  const loggedIn = !!getAccessToken();
  document.getElementById('nav-dashboard').style.display = loggedIn ? '' : 'none';
  document.getElementById('nav-logout').style.display    = loggedIn ? '' : 'none';
  document.getElementById('nav-login').style.display     = loggedIn ? 'none' : '';
  document.getElementById('nav-register').style.display  = loggedIn ? 'none' : '';
}

// ─── Login ──────────────────────────────────────────────────────────────────
function showLogin() {
  title.textContent = 'Login';
  clear(); updateNav();
  const card = document.createElement('div');
  card.className = 'card form';
  card.innerHTML = `
    <h2>Entrar na sua conta</h2>
    <label>Usuário</label><input id="login-user" autocomplete="username"/>
    <label>Senha</label><input id="login-pass" type="password" autocomplete="current-password"/>
    <div class="row">
      <button class="btn" id="do-login">Entrar</button>
      <button class="btn secondary" id="go-register">Criar conta</button>
    </div>
    <div id="login-msg" class="muted"></div>`;
  content.appendChild(card);

  document.getElementById('do-login').onclick = async () => {
    const msg = document.getElementById('login-msg');
    msg.style.color = ''; msg.textContent = '';
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    if (!u || !p) { msg.textContent = 'Preencha usuário e senha.'; return; }
    try {
      const res = await API.login({ username: u, password: p });
      if (res.access_token) { storeSession(res); updateNav(); showDashboard(); }
      else { msg.textContent = 'Erro: ' + (res.message || JSON.stringify(res)); }
    } catch { msg.textContent = 'Erro de rede.'; }
  };

  document.getElementById('go-register').onclick = showRegister;
  document.getElementById('login-pass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('do-login').click();
  });
}

// ─── Register ───────────────────────────────────────────────────────────────
function showRegister() {
  title.textContent = 'Registrar';
  clear(); updateNav();
  const card = document.createElement('div');
  card.className = 'card form';
  card.innerHTML = `
    <h2>Criar conta</h2>
    <label>Usuário</label><input id="reg-user" autocomplete="username"/>
    <label>Senha</label><input id="reg-pass" type="password" autocomplete="new-password"/>
    <div class="row">
      <button class="btn" id="do-reg">Criar</button>
      <button class="btn secondary" id="go-login">Voltar</button>
    </div>
    <div id="reg-msg" class="muted"></div>`;
  content.appendChild(card);

  document.getElementById('do-reg').onclick = async () => {
    const msg = document.getElementById('reg-msg');
    msg.style.color = ''; msg.textContent = '';
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    if (!u || !p) { msg.textContent = 'Preencha todos os campos.'; return; }
    try {
      const res = await API.register({ username: u, password: p });
      if (res.id) {
        msg.style.color = 'var(--success)';
        msg.textContent = 'Conta criada com sucesso!';
        setTimeout(showLogin, 800);
      } else {
        msg.textContent = 'Erro: ' + (res.message || JSON.stringify(res));
      }
    } catch { msg.textContent = 'Erro de rede.'; }
  };

  document.getElementById('go-login').onclick = showLogin;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
async function showDashboard() {
  title.textContent = 'Painel';
  clear(); updateNav();
  const user = getUser();
  if (!user) { showLogin(); return; }

  // Saldo card
  const saldoCard = document.createElement('div');
  saldoCard.className = 'card';
  saldoCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
      <div>
        <div class="muted">Bem-vindo</div>
        <div class="balance">${user.username}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">Função: <strong>${user.role}</strong></div>
      </div>
      <div id="saldo-info" style="text-align:right"><div class="muted">Carregando saldo…</div></div>
    </div>`;
  content.appendChild(saldoCard);

  // Formulário
  const addCard = document.createElement('div');
  addCard.className = 'card form';
  addCard.innerHTML = `
    <h3>Registrar horas trabalhadas</h3>
    <label>Data</label><input id="te-date" type="date" value="${new Date().toISOString().slice(0, 10)}"/>
    <label>Horas</label><input id="te-hours" type="number" step="0.25" min="0.25" placeholder="Ex: 8"/>
    <label>Valor recebido (R$)</label><input id="te-amount" type="number" step="0.01" min="0" placeholder="Opcional"/>
    <label>Descrição</label><input id="te-desc" placeholder="Opcional"/>
    <div class="row">
      <button class="btn" id="do-add">Adicionar</button>
      <button class="btn secondary" id="refresh-list">Atualizar</button>
    </div>
    <div id="te-msg" class="muted"></div>`;
  content.appendChild(addCard);

  // Converter valor recebido para horas ao digitar
  const convCard = document.createElement('div');
  convCard.className = 'card form';
  convCard.innerHTML = `
    <h3>Converter valor para horas</h3>
    <label>Valor (R$)</label><input id="conv-amount" type="number" step="0.01" min="0" placeholder="Ex: 100"/>
    <div style="margin-top:8px">
      <button class="btn" id="do-convert">Converter</button>
      <span id="conv-result" class="muted" style="margin-left:12px"></span>
    </div>`;
  content.appendChild(convCard);

  document.getElementById('do-convert').onclick = () => {
    const amount = Number(document.getElementById('conv-amount').value);
    const resultEl = document.getElementById('conv-result');
    if (!amount || amount <= 0) { resultEl.textContent = 'Digite um valor válido.'; return; }
    const averageRate = Number(document.getElementById('saldo-info').querySelector('div:nth-child(4)').textContent.replace('R$ ', ''));
    if (!averageRate || averageRate <= 0) { resultEl.textContent = 'Valor médio por hora inválido.'; return; }
    const hours = amount / averageRate;
    resultEl.textContent = `Equivale a ${hours.toFixed(2)} horas.`;
  }

  // Lista
  const listCard = document.createElement('div');
  listCard.className = 'card';
  listCard.innerHTML = `<h3>Horas registradas</h3><div id="list-area"><div class="muted">Carregando…</div></div>`;
  content.appendChild(listCard);

  async function loadSaldo() {
    try {
      const s = await API.getSaldo(user.id);
      const info = document.getElementById('saldo-info');
      if (!info) return;
      const positive = Number(s.totalHours) >= 0;
      info.innerHTML = `
        <div class="muted" style="font-size:12px">Total de horas</div>
        <div style="font-size:22px;font-weight:700">${Number(s.totalHours || 0).toFixed(2)} h</div>
        <div class="muted" style="font-size:12px;margin-top:6px">Valor médio por hora</div>
        <div style="font-size:18px;font-weight:600">R$ ${Number(s.averageHourlyRate || 0).toFixed(2)}</div>
        <div style="margin-top:8px"><span class="chip ${positive ? 'success' : 'error'}">${positive ? '✓ Saldo positivo' : '⚠ Saldo negativo'}</span></div>`;
    } catch {}
  }

  async function loadList() {
    const area = document.getElementById('list-area');
    area.innerHTML = '<div class="muted">Carregando…</div>';
    try {
      const rows = await API.listWork(user.id);
      if (!Array.isArray(rows)) { area.innerHTML = '<div class="muted">Erro ao carregar entradas.</div>'; return; }
      if (rows.length === 0)    { area.innerHTML = '<div class="muted">Nenhuma entrada encontrada.</div>'; return; }

      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = `<thead><tr><th>Data</th><th>Horas</th><th>Valor (R$)</th><th>Descrição</th><th></th></tr></thead>`;
      const tbody = document.createElement('tbody');
      rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.date}</td>
          <td>${r.hours}</td>
          <td>${Number(r.amount).toFixed(2)}</td>
          <td>${r.description || ''}</td>
          <td><button class="btn" style="background:var(--error);padding:4px 10px;font-size:12px" data-id="${r.id}">✕</button></td>`;
        tr.querySelector('button').onclick = async () => {
          await API.delWork(r.id, user.id);
          loadList(); loadSaldo();
        };
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      area.innerHTML = '';
      area.appendChild(table);
    } catch (e) { area.innerHTML = '<div class="muted">Erro de rede.</div>'; }
  }

  document.getElementById('do-add').onclick = async () => {
    const msg = document.getElementById('te-msg');
    msg.style.color = ''; msg.textContent = '';
    const date        = document.getElementById('te-date').value;
    const hours       = Number(document.getElementById('te-hours').value);
    const amount      = Number(document.getElementById('te-amount').value) || 0;
    const description = document.getElementById('te-desc').value;
    if (!date || !hours) { msg.textContent = 'Data e horas são obrigatórios.'; return; }
    try {
      const res = await API.addWork({ userId: user.id, date, hours, amount, description });
      if (res.id) {
        msg.style.color = 'var(--success)';
        msg.textContent = 'Entrada registrada!';
        document.getElementById('te-hours').value = '';
        document.getElementById('te-amount').value = '';
        document.getElementById('te-desc').value = '';
        loadList(); loadSaldo();
      } else {
        msg.style.color = 'var(--error)';
        msg.textContent = 'Erro: ' + (res.message || JSON.stringify(res));
      }
    } catch (e) { msg.textContent = e.message || 'Erro'; }
  };

  document.getElementById('refresh-list').onclick = () => { loadList(); loadSaldo(); };

  loadList(); loadSaldo();
}

// ─── Bootstrap ──────────────────────────────────────────────────────────────
// Botão logout inserido dinamicamente na sidebar
const logoutBtn = document.createElement('button');
logoutBtn.id = 'nav-logout'; logoutBtn.className = 'nav-btn';
logoutBtn.textContent = 'Sair';
logoutBtn.style.marginTop = 'auto';
logoutBtn.onclick = () => { clearSession(); updateNav(); showLogin(); };
document.querySelector('.sidebar nav').appendChild(logoutBtn);

document.getElementById('nav-login').onclick     = showLogin;
document.getElementById('nav-register').onclick  = showRegister;
document.getElementById('nav-dashboard').onclick = showDashboard;

(async () => {
  try { await API.ping(); } catch {
    content.innerHTML = '<div class="card center" style="color:var(--error)">Servidor inacessível.</div>';
    return;
  }
  if (getAccessToken()) showDashboard();
  else showLogin();
})();
