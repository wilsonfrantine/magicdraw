/* ========== ÁUDIO ========== */
const bgAudio   = document.getElementById('bgAudio');
const prepAudio = document.getElementById('prepAudio');
const winAudio  = document.getElementById('winAudio');

/* ========== ELEMENTOS / CONTROLES ========== */
const configSec  = document.getElementById('configSection');
const drawSec    = document.getElementById('drawSection');
const resultsSec = document.getElementById('resultsSection');

const startBtn  = document.getElementById('startBtn');
const drawBtn   = document.getElementById('drawBtn');
const backBtn   = document.getElementById('backBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn  = document.getElementById('resetBtn');

const nomesTA   = document.getElementById('nomes');
const csvInput  = document.getElementById('csvfile');

const noRepeatCB   = document.getElementById('noRepeat');
const nSorteiosIN  = document.getElementById('nSorteios');
const toggleMusic  = document.getElementById('toggleMusic');
const toggleFX     = document.getElementById('toggleEffects');
const showOrderCB  = document.getElementById('showOrder');

const loadingDiv = document.getElementById('loading');
const resultArea = document.getElementById('resultArea');
const numberDisp = document.getElementById('numberDisplay');
const nameDisp   = document.getElementById('nameDisplay');
const fireworks  = document.getElementById('fireworks');
const listUL     = document.getElementById('sorteadosList');

const themeToggle = document.getElementById('themeToggle');

/* ========== ESTADO ========== */
let nomesOrig = [], nomesDisp = [], sorteados = [];
let sortCount = 0;
let confeteTimer = null;           // 〰️ gerador contínuo

/* ========== TEMAS ========== */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
});

/* ========== LOAD CSV PADRÃO ========== */
fetch('assets/nomes_inscritos.csv')
 .then(r => r.text())
 .then(t => {
   nomesTA.value = t.split(/,|\n/).map(s => s.trim()).filter(Boolean).join(', ');
 }).catch(() => {});

/* ========== UPLOAD CSV ========= */
csvInput.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = ev => {
    nomesTA.value = ev.target.result.split(/,|\n/)
                   .map(s => s.trim()).filter(Boolean).join(', ');
  };
  fr.readAsText(f);
});

/* ========== AJUDANTES ========= */
const scrollTo = el => el.scrollIntoView({ behavior: 'smooth' });

const resetVisual = () => {
  numberDisp.textContent = '';
  nameDisp.textContent   = '';
  nameDisp.classList.remove('slide');
  resultArea.classList.add('hidden');
  loadingDiv.classList.add('hidden');
  fireworks.innerHTML = '';
};

/* 💦 cortina contínua de confetes ----------------------- */
function iniciarCortina() {
  pararCortina();
  confeteTimer = setInterval(() => {
    const c = document.createElement('span');
    c.className = 'confete';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = `hsl(${Math.random()*360},90%,60%)`;
    fireworks.appendChild(c);
    c.addEventListener('animationend', () => c.remove());
  }, 120); // ~8 bolinhas/seg
}
function pararCortina() {
  if (confeteTimer) {
    clearInterval(confeteTimer);
    confeteTimer = null;
  }
}
/* ------------------------------------------------------- */

/* ========== INICIAR (vai para tela 2) ========= */
startBtn.addEventListener('click', () => {
  const txt = nomesTA.value.trim();
  if (!txt) { alert('Insira pelo menos um nome!'); return; }

  nomesOrig = txt.split(/,|\n/).map(s => s.trim()).filter(Boolean);
  nomesDisp = [...nomesOrig]; sorteados = []; sortCount = 0;
  listUL.innerHTML = ''; resetVisual();

  if (toggleMusic.checked && bgAudio.paused) {
    bgAudio.volume = 0.4; bgAudio.play().catch(() => {});
  }
  iniciarCortina();             // começa fundo animado
  scrollTo(drawSec);
});

/* ← voltar */
backBtn.addEventListener('click', () => scrollTo(configSec));

/* ========== SORTEAR ========= */
drawBtn.addEventListener('click', () => {
  if (toggleMusic.checked && bgAudio.paused) {
    bgAudio.volume = 0.4; bgAudio.play().catch(() => {});
  }
  if (!nomesDisp.length) { alert('Lista esgotada!'); return; }

  pararCortina();                // pausa durante suspense
  resetVisual();
  
  loadingDiv.classList.remove('hidden');
  if (toggleFX.checked) { prepAudio.currentTime = 0; prepAudio.play().catch(() => {}); }

  setTimeout(() => {
    loadingDiv.classList.add('hidden');
    realizarSorteio();
    iniciarCortina();            // retoma cortina
  }, 4300);
});

/* ---------- lógica ---------- */
function realizarSorteio() {
  const qtd   = +nSorteiosIN.value || 1;
  const noRep = noRepeatCB.checked;

  for (let i = 0; i < qtd && nomesDisp.length; i++) {
    const idx  = Math.floor(Math.random() * nomesDisp.length);
    const nome = nomesDisp[idx];
    exibirResultado(nome, sortCount + 1);
    if (noRep) nomesDisp.splice(idx, 1);
    sorteados.push(nome);
    adicionarNaLista(nome, sortCount + 1);
    sortCount++;
  }
}

function exibirResultado(nome, ordem) {
  numberDisp.textContent = showOrderCB.checked ? ordem : '';
  nameDisp.textContent   = nome;
  nameDisp.classList.add('slide');
  resultArea.classList.remove('hidden');
  //explodirConfetesPontual();
  if (toggleFX.checked) { winAudio.currentTime = 0; winAudio.play().catch(() => {}); }
}
/*
function explodirConfetesPontual() {
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('span');
    c.className = 'confete';
    c.style.left = (i * 18) + 'px';
    c.style.background = `hsl(${i * 22 + 60}, 90%, 60%)`;
    c.style.animationDelay = `${i * 0.05}s`;
    fireworks.appendChild(c);
    c.addEventListener('animationend', () => c.remove());
  }
}
*/
/* ---------- lista / exportar ---------- */
function adicionarNaLista(nome, ordem) {
  const li = document.createElement('li');
  li.textContent = `${ordem}. ${nome}`;
  listUL.appendChild(li);
}
exportBtn.addEventListener('click', () => {
  if (!sorteados.length) return;
  const csv  = sorteados.map((n, i) => `"${i + 1}","${n}"`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'sorteados.csv' });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

/* ---------- zerar ---------- */
resetBtn.addEventListener('click', () => {
  nomesOrig = nomesDisp = []; sorteados = []; sortCount = 0;
  nomesTA.value = ''; listUL.innerHTML = ''; resetVisual();
  pararCortina();
});

/* ---------- tecla Enter ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' &&
      !['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) {
    e.preventDefault(); drawBtn.click();
  }
});
