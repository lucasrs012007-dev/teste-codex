const nodes = {
  root: { label: 'NÓ CENTRAL', title: 'Compreensão', text: 'Antes de criar qualquer resposta, tudo começa aqui: entender a intenção, o contexto e o resultado que realmente importa.', tags: ['identificar objetivo', 'encontrar conexões', 'definir prioridade'] },
  intent: { label: 'CAMADA 01', title: 'Intenção', text: 'Toda pergunta guarda uma necessidade. Encontrar essa necessidade é separar uma resposta qualquer de uma resposta que realmente ajuda.', tags: ['objetivo', 'necessidade', 'resultado'] },
  context: { label: 'CAMADA 02', title: 'Contexto', text: 'O cenário muda a resposta: idioma, dados disponíveis, urgência, limites e preferências apontam a melhor direção.', tags: ['cenário', 'restrições', 'referências'] },
  strategy: { label: 'CAMADA 03', title: 'Estratégia', text: 'Com objetivo e cenário claros, escolhemos o caminho: explicar, criar, comparar, pesquisar ou executar.', tags: ['planejar', 'priorizar', 'resolver'] },
  delivery: { label: 'CAMADA 04', title: 'Entrega', text: 'A ideia ganha forma com organização, clareza e uma próxima ação possível. O conhecimento só é útil quando se move.', tags: ['clareza', 'estrutura', 'ação'] },
  language: { label: 'SATÉLITE', title: 'Linguagem', text: 'Palavras, tom e formato criam a ponte entre uma ideia e quem vai recebê-la.', tags: ['tom', 'idioma', 'formato'] },
  review: { label: 'SATÉLITE', title: 'Revisão', text: 'Uma última volta pelo mapa confirma precisão, segurança, clareza e relevância.', tags: ['verificar', 'ajustar', 'aprender'] },
  sources: { label: 'SATÉLITE', title: 'Fontes', text: 'Quando informação precisa ser atual ou verificável, fontes confiáveis sustentam a resposta.', tags: ['atualidade', 'evidência', 'confiança'] },
  action: { label: 'SATÉLITE', title: 'Próxima ação', text: 'Uma boa entrega deixa claro o que fazer agora — e abre espaço para a próxima pergunta.', tags: ['decidir', 'executar', 'evoluir'] }
};
const detail = { label: document.querySelector('#detailLabel'), title: document.querySelector('#detailTitle'), text: document.querySelector('#detailText'), list: document.querySelector('#detailList'), card: document.querySelector('#detailCard') };
document.querySelectorAll('.node').forEach(button => button.addEventListener('click', () => {
  const data = nodes[button.dataset.node];
  document.querySelectorAll('.node').forEach(node => node.classList.remove('selected'));
  button.classList.add('selected');
  detail.card.style.opacity = '0'; detail.card.style.transform = 'translateY(5px)';
  setTimeout(() => { detail.label.textContent = data.label; detail.title.textContent = data.title; detail.text.textContent = data.text; detail.list.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join(''); detail.card.style.opacity = '1'; detail.card.style.transform = 'translateY(0)'; }, 160);
}));
const canvas = document.querySelector('#canvas'), graph = document.querySelector('#constellation'), output = document.querySelector('#zoomLevel');
let zoom = innerWidth < 700 ? .72 : 1, panX = innerWidth < 700 ? -208 : -20, panY = innerWidth < 700 ? -89 : -65, dragging = false, origin;
function render(){ graph.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`; output.textContent = `${Math.round(zoom * 100)}%`; }
function adjust(amount){ zoom = Math.max(.55, Math.min(1.35, zoom + amount)); render(); }
document.querySelector('#zoomIn').onclick = () => adjust(.1); document.querySelector('#zoomOut').onclick = () => adjust(-.1);
document.querySelector('#resetView').onclick = () => { zoom = innerWidth < 700 ? .72 : 1; panX = innerWidth < 700 ? -208 : -20; panY = innerWidth < 700 ? -89 : -65; render(); };
canvas.addEventListener('pointerdown', event => { if(event.target.closest('.node')) return; dragging = true; origin = { x:event.clientX-panX, y:event.clientY-panY }; canvas.classList.add('dragging'); canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', event => { if(!dragging) return; panX = event.clientX-origin.x; panY = event.clientY-origin.y; render(); });
canvas.addEventListener('pointerup', () => { dragging=false; canvas.classList.remove('dragging'); });
canvas.addEventListener('wheel', event => { event.preventDefault(); adjust(event.deltaY > 0 ? -.08 : .08); }, {passive:false});
render();
