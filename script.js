/* ========== ÁUDIO ========== */
const bgAudio   = document.getElementById('bgAudio');
const prepAudio = document.getElementById('prepAudio');
const winAudio  = document.getElementById('winAudio');
const musicToggle   = document.getElementById('musicToggle');
const effectsToggle = document.getElementById('effectsToggle');

/* ========== ELEMENTOS / CONTROLES ========== */
const fullscreenToggle = document.getElementById('fullscreenToggle');
const drawToggle = document.getElementById('drawToggle');
const configToggle = document.getElementById('configBtn');
const resultsToggle = document.getElementById('resultsToggle');
const menuToggle = document.getElementById('menuToggle');
const configSec  = document.getElementById('configSection');
const drawSec    = document.getElementById('drawSection');
const homeSec  = document.getElementById('homeSection');
const resultsSecToggle = document.getElementById('resultsToggle');
const resultsSec = document.getElementById('resultsSection');
const menuContent = document.getElementById('menuContent');

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

const updateIcons = () => {
  musicToggle.innerHTML   = musicEnabled   ? '<img src="/assets/music_on.png">'     : '<img src="/assets/music_off.png">';
  effectsToggle.innerHTML = effectsEnabled ? '<img src="/assets/effects_on.png">'   : '<img src="/assets/effects_off.png">';
  fullscreenToggle.innerHTML = document.fullscreenElement
    ? '<img src="/assets/fullscreen_off.png">'
    : '<img src="/assets/fullscreen.png">';
};



/* ========== ESTADO ========== */
let nomesOrig = [], nomesDisp = [], sorteados = [];
let sortCount = 0;
let confeteTimer = null;           
let musicEnabled   = toggleMusic.checked;
let effectsEnabled = toggleFX.checked;

/* ========== TEMAS ========== */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
  //themeToggle.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
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

/* ========== HELPERS ========= */
const scrollTo = el => el.scrollIntoView({ behavior: 'smooth' });

const resetVisual = () => {
  numberDisp.textContent = '';
  nameDisp.textContent   = '';
  nameDisp.classList.remove('slide');
  resultArea.classList.add('hidden');
  loadingDiv.classList.add('hidden');
  fireworks.innerHTML = '';
};

/* -------- ANIMAÇÕES --------- */
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

function animateName(text) {
  nameDisplay.innerHTML = '';

  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${i * 0.05}s`;
    nameDisplay.appendChild(span);
  });
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
    bgAudio.volume = 0.1; bgAudio.play().catch(() => {});
  }
  iniciarCortina(); 
  scrollTo(drawSec);

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Erro ao entrar em fullscreen:', err);
    });
  }
  start();
});

backBtn.addEventListener('click', () => {  scrollTo(homeSec); });

/* ========== SORTEAR ========= */
drawBtn.addEventListener('click', () => {
  start();
});
function start() {
  if (toggleMusic.checked && bgAudio.paused) {
    bgAudio.volume = 0.1; bgAudio.play().catch(() => {});
  }
  if (!nomesDisp.length) { alert('Lista Esgotada ou Vazia! Carregue novos nomes ou reinicie a lista'); return; }

  pararCortina();
  resetVisual();
  
  loadingDiv.classList.remove('hidden');
  if (toggleFX.checked) { prepAudio.currentTime = 0; prepAudio.play().catch(() => {}); }

  setTimeout(() => {
    loadingDiv.classList.add('hidden');
    realizarSorteio();
    iniciarCortina();
  }, 4600);
}

function formatNomeAnimado(str) {
  const palavras = str.trim().split(/\s+/);
  return palavras.map((palavra, i) => {
    if (palavra.length <= 3) {
      return i === 0
        ? palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        : palavra.toLowerCase();
    }
    return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
  }).join('  ');
}


/* ---------- lógica ---------- */
function realizarSorteio() {
  const qtd   = +nSorteiosIN.value || 1;
  const noRep = noRepeatCB.checked;

  for (let i = 0; i < qtd && nomesDisp.length; i++) {
    const idx  = Math.floor(Math.random() * nomesDisp.length);
    const nome = formatNomeAnimado(nomesDisp[idx]);
    exibirResultado(nome, sortCount + 1);
    if (noRep) nomesDisp.splice(idx, 1);
    sorteados.push(nome);
    adicionarNaLista(nome, sortCount + 1);
    sortCount++;
  }
}

function exibirResultado(nome, ordem) {
  numberDisp.textContent = showOrderCB.checked ? ordem : '';
  animateName(nome);
  resultArea.classList.remove('hidden');
  //explodirConfetesPontual();
  if (toggleFX.checked) { winAudio.currentTime = 0; winAudio.play().catch(() => {}); }
}

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
let inactivityTimer = null;
const INACTIVITY_LIMIT = 2 * 60 * 1000;

function resetInactivityTimer() {
  if (document.documentElement.scrollTop < window.innerHeight / 2) return;
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    scrollTo(homeSec);
    bgAudio.pause();
    pararCortina();
  }, INACTIVITY_LIMIT);
}

['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt =>
  document.addEventListener(evt, resetInactivityTimer)
);

/* ---------- CONTROLE DE AUDIO ---------- */

musicToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  toggleMusic.checked = musicEnabled;
  updateIcons();
  musicToggle.classList.toggle('off', !musicEnabled);

  if (musicEnabled) {
    bgAudio.volume = 0.1;
    bgAudio.play().catch(() => {});
  } else {
    bgAudio.pause();
  }
});

effectsToggle.addEventListener('click', () => {
  effectsEnabled = !effectsEnabled;
  toggleFX.checked = effectsEnabled;
  updateIcons();
  if (effectsEnabled) {
    prepAudio.volume = 0.7;
    winAudio.volume = 0.7;
  } else {
    prepAudio.volume = 0;
    winAudio.volume = 0;
  }
});

menuToggle.addEventListener('click', () => {
  menuContent.classList.toggle('collapsed');
  menuToggle.classList.toggle('collapsed');
})

drawToggle.addEventListener('click', () => {
  if (!drawSec.classList.contains('hidden')) {
    scrollTo(drawSec);
  } else {
    resetVisual();
    pararCortina();
  }
});
resultsToggle.addEventListener('click', () => {
  if (!resultsSec.classList.contains('hidden')) {
    scrollTo(resultsSec);
  } else {
    resetVisual();
    pararCortina();
  }
});
configToggle.addEventListener('click', () => {
  if (!configSec.classList.contains('hidden')) {
    scrollTo(configSec);
  } else {
    resetVisual();
    pararCortina();
  }
});  

fullscreenToggle.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Erro ao entrar em fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen().catch(err => {
      console.warn(`Erro ao sair do fullscreen: ${err.message}`);
    });
  }
});

document.addEventListener('fullscreenchange', updateIcons);

