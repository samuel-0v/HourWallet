const API = {
  register: (data) => fetch('/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
  login: (data) => fetch('/auth/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
  addTime: (data) => fetch('/time-entries/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
  listTime: (userId) => fetch('/time-entries/'+userId).then(r=>r.json()),
  ping: ()=>fetch('/ping').then(r=>r.json())
}

const content = document.getElementById('content');
const title = document.getElementById('page-title');

function clear(){content.innerHTML=''}

function showLogin(){
  title.textContent='Login'
  clear();
  const card = document.createElement('div');card.className='card form'
  card.innerHTML=`
    <h2>Entrar</h2>
    <label>Usuário</label><input id="login-user" />
    <label>Senha</label><input id="login-pass" type="password" />
    <div class="row"><button class="btn" id="do-login">Entrar</button><button class="btn secondary" id="go-register">Registrar</button></div>
    <div id="login-msg" class="muted"></div>
  `
  content.appendChild(card)
  document.getElementById('do-login').onclick=async ()=>{
    const u=document.getElementById('login-user').value
    const p=document.getElementById('login-pass').value
    try{const res=await API.login({username:u,password:p}); if(res.token){localStorage.setItem('hw_token',res.token); localStorage.setItem('hw_user',JSON.stringify(res.user)); showDashboard()} else {document.getElementById('login-msg').textContent='Erro: '+(res.message||JSON.stringify(res))}}
    catch(e){document.getElementById('login-msg').textContent='Erro de rede'}
  }
  document.getElementById('go-register').onclick=showRegister
}

function showRegister(){
  title.textContent='Registrar'
  clear();
  const card = document.createElement('div');card.className='card form'
  card.innerHTML=`
    <h2>Registrar conta</h2>
    <label>Usuário</label><input id="reg-user" />
    <label>Senha</label><input id="reg-pass" type="password" />
    <div class="row"><button class="btn" id="do-reg">Criar</button><button class="btn secondary" id="go-login">Voltar</button></div>
    <div id="reg-msg" class="muted"></div>
  `
  content.appendChild(card)
  document.getElementById('do-reg').onclick=async ()=>{
    const u=document.getElementById('reg-user').value
    const p=document.getElementById('reg-pass').value
    try{const res=await API.register({username:u,password:p}); if(res.id){document.getElementById('reg-msg').textContent='Conta criada'; setTimeout(showLogin,800)} else {document.getElementById('reg-msg').textContent='Erro: '+JSON.stringify(res)}}catch(e){document.getElementById('reg-msg').textContent='Erro de rede'}
  }
  document.getElementById('go-login').onclick=showLogin
}

async function showDashboard(){
  title.textContent='Painel'
  clear();
  const user = JSON.parse(localStorage.getItem('hw_user')||'null');
  if(!user){showLogin();return}

  const headerCard=document.createElement('div');headerCard.className='card'
  headerCard.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><div class="muted">Olá</div><div class="balance">${user.username}</div></div><div class="center"><div class="chip success">Saldo positivo</div></div></div>`
  content.appendChild(headerCard)

  const addCard=document.createElement('div');addCard.className='card form';
  addCard.innerHTML=`
    <h3>Adicionar entrada de horas</h3>
    <label>Data (YYYY-MM-DD)</label><input id="te-date" value="${new Date().toISOString().slice(0,10)}" />
    <label>Horas</label><input id="te-hours" type="number" step="0.25" />
    <label>Valor (opcional)</label><input id="te-amount" type="number" step="0.01" />
    <label>Descrição</label><input id="te-desc" />
    <div class="row"><button class="btn" id="do-add">Adicionar</button><button class="btn secondary" id="refresh-list">Atualizar</button></div>
    <div id="te-msg" class="muted"></div>
  `
  content.appendChild(addCard)

  const listCard=document.createElement('div');listCard.className='card';listCard.innerHTML=`<h3>Entradas</h3><div id="list-area"></div>`
  content.appendChild(listCard)

  document.getElementById('do-add').onclick=async ()=>{
    const date=document.getElementById('te-date').value
    const hours=Number(document.getElementById('te-hours').value)
    const amount=Number(document.getElementById('te-amount').value)||0
    const desc=document.getElementById('te-desc').value
    try{await API.addTime({userId:user.id,date,hours,amount,description:desc}); document.getElementById('te-msg').textContent='Registrado'; loadList();}catch(e){document.getElementById('te-msg').textContent='Erro'}
  }
  document.getElementById('refresh-list').onclick=()=>loadList()

  async function loadList(){
    const area=document.getElementById('list-area'); area.innerHTML='Carregando...'
    try{const rows=await API.listTime(user.id); if(Array.isArray(rows)){
      if(rows.length===0) area.innerHTML='<div class="muted">Nenhuma entrada encontrada</div>';
      else {const t=document.createElement('table');t.className='table'; t.innerHTML=`<thead><tr><th>Data</th><th>Horas</th><th>Valor</th><th>Descrição</th></tr></thead>`; const body=document.createElement('tbody'); rows.forEach(r=>{const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.date}</td><td>${r.hours}</td><td>${r.amount}</td><td>${r.description||''}</td>`; body.appendChild(tr)}); t.appendChild(body); area.innerHTML=''; area.appendChild(t)} } else area.innerHTML='Erro: '+JSON.stringify(rows)}catch(e){area.innerHTML='Erro de rede'}
  }
  loadList();
}

document.getElementById('nav-login').onclick=showLogin
document.getElementById('nav-register').onclick=showRegister
document.getElementById('nav-dashboard').onclick=showDashboard

// default
(async ()=>{try{await API.ping(); showLogin()}catch(e){document.getElementById('content').innerHTML='<div class="card center">Servidor inacessível</div>'}})()
