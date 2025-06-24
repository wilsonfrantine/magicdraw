let nomesOriginais = [];
let nomesDisponiveis = [];
let sorteados = [];
let sortCount = 0;
let nSorteios = 1;

// Importação de nomes via CSV
document.getElementById('csvfile').addEventListener('change', function(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const nomes = text.split(/,|\n/).map(s => s.trim()).filter(Boolean);
    document.getElementById('nomes').value = nomes.join(', ');
  };
  reader.readAsText(file);
});

function sortear() {
  if (sortCount === 0) {
    // Prepara lista ao iniciar sorteio
    let entrada = document.getElementById('nomes').value;
    nomesOriginais = entrada.split(/,|\n/).map(s => s.trim()).filter(Boolean);
    nomesDisponiveis = [...nomesOriginais];
    sorteados = [];
    document.getElementById('sorteadosLista').innerHTML = '';
    sortCount = 0;
  }

  nSorteios = parseInt(document.getElementById('nSorteios').value) || 1;
  const noRepeat = document.getElementById('noRepeat').checked;

  if (nomesDisponiveis.length === 0) {
    showResult('Fim!', 'Lista esgotada!', 0);
    return;
  }

  for (let i = 0; i < nSorteios && nomesDisponiveis.length > 0; i++) {
    let idx = Math.floor(Math.random() * nomesDisponiveis.length);
    let nome = nomesDisponiveis[idx];

    showResult(sortCount + 1, nome, sortCount + 1);

    if (noRepeat) {
      nomesDisponiveis.splice(idx, 1);
    }
    sorteados.push(nome);
    addSorteadoToList(nome, sortCount + 1);

    sortCount++;
  }
}

function showResult(numero, nome, ordem) {
  document.getElementById('numeroSorteado').textContent = numero;
  document.getElementById('nomeSorteado').textContent = nome;

  // animação confetes
  const animFogos = document.getElementById('animacaoFogos');
  animFogos.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    let confete = document.createElement('div');
    confete.className = 'confete';
    confete.style.left = (10 + i*17) + "px";
    confete.style.top = "0px";
    confete.style.background = `hsl(${30*i+80}, 92%, 62%)`;
    confete.style.animation = `confeteDrop 1s ${i*0.07}s cubic-bezier(.68,-0.6,.32,1.6)`;
    animFogos.appendChild(confete);
  }
}

function addSorteadoToList(nome, ordem) {
  const ul = document.getElementById('sorteadosLista');
  let li = document.createElement('li');
  li.textContent = `${ordem}. ${nome}`;
  ul.appendChild(li);
}

function exportarCSV() {
  if (sorteados.length === 0) return;
  let csv = sorteados.map((n, i) => `"${i+1}","${n}"`).join('\n');
  let blob = new Blob([csv], { type: 'text/csv' });
  let url = URL.createObjectURL(blob);

  let a = document.createElement('a');
  a.href = url;
  a.download = 'sorteados.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Reset ao alterar nomes, quantidade ou opção de repetição
['nomes','nSorteios','noRepeat'].forEach(id =>
  document.getElementById(id).addEventListener('input', resetSorteio)
);

function resetSorteio() {
  sortCount = 0;
  document.getElementById('numeroSorteado').textContent = '';
  document.getElementById('nomeSorteado').textContent = '';
  document.getElementById('animacaoFogos').innerHTML = '';
  document.getElementById('sorteadosLista').innerHTML = '';
  sorteados = [];
}

// Botão minimizar painel de configuração
const configPanel = document.getElementById('configuracoes');
const toggleBtn = document.getElementById('toggleConfigBtn');
toggleBtn.addEventListener('click', function() {
  configPanel.classList.toggle('minimizado');
  if (configPanel.classList.contains('minimizado')) {
    toggleBtn.textContent = '+';
    configPanel.style.pointerEvents = 'auto'; // mantém botão clicável
    configPanel.style.opacity = 0.8;
  } else {
    toggleBtn.textContent = '−';
    configPanel.style.pointerEvents = '';
    configPanel.style.opacity = '';
  }
});

// Botão zerar sorteio
document.getElementById('resetBtn').addEventListener('click', function() {
  nomesOriginais = [];
  nomesDisponiveis = [];
  sorteados = [];
  sortCount = 0;
  document.getElementById('numeroSorteado').textContent = '';
  document.getElementById('nomeSorteado').textContent = '';
  document.getElementById('animacaoFogos').innerHTML = '';
  document.getElementById('sorteadosLista').innerHTML = '';
  document.getElementById('nomes').value = '';
});
