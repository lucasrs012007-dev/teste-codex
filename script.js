const MAP_WIDTH = 1200;
const MAP_HEIGHT = 680;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.35;

const nodeData = {
  root: { label: 'NÓ CENTRAL', step: '01 / 09', title: 'Compreensão', text: 'Antes de criar qualquer resposta, tudo começa aqui: entender a intenção, o contexto e o resultado que realmente importa.', tags: ['identificar objetivo', 'encontrar conexões', 'definir prioridade'] },
  intent: { label: 'CAMADA 01', step: '02 / 09', title: 'Intenção', text: 'Toda pergunta guarda uma necessidade. Encontrar essa necessidade é separar uma resposta qualquer de uma resposta que realmente ajuda.', tags: ['objetivo', 'necessidade', 'resultado'] },
  context: { label: 'CAMADA 02', step: '03 / 09', title: 'Contexto', text: 'O cenário muda a resposta: idioma, dados disponíveis, urgência, limites e preferências apontam a melhor direção.', tags: ['cenário', 'restrições', 'referências'] },
  strategy: { label: 'CAMADA 03', step: '04 / 09', title: 'Estratégia', text: 'Com objetivo e cenário claros, escolhemos o caminho: explicar, criar, comparar, pesquisar ou executar.', tags: ['planejar', 'priorizar', 'resolver'] },
  delivery: { label: 'CAMADA 04', step: '05 / 09', title: 'Entrega', text: 'A ideia ganha forma com organização, clareza e uma próxima ação possível. O conhecimento só é útil quando se move.', tags: ['clareza', 'estrutura', 'ação'] },
  language: { label: 'SATÉLITE', step: '06 / 09', title: 'Linguagem', text: 'Palavras, tom e formato criam a ponte entre uma ideia e quem vai recebê-la.', tags: ['tom', 'idioma', 'formato'] },
  review: { label: 'SATÉLITE', step: '07 / 09', title: 'Revisão', text: 'Uma última volta pelo mapa confirma precisão, segurança, clareza e relevância.', tags: ['verificar', 'ajustar', 'aprender'] },
  sources: { label: 'SATÉLITE', step: '08 / 09', title: 'Fontes', text: 'Quando informação precisa ser atual ou verificável, fontes confiáveis sustentam a resposta.', tags: ['atualidade', 'evidência', 'confiança'] },
  action: { label: 'SATÉLITE', step: '09 / 09', title: 'Próxima ação', text: 'Uma boa entrega deixa claro o que fazer agora — e abre espaço para a próxima pergunta.', tags: ['decidir', 'executar', 'evoluir'] }
};

Object.assign(nodeData.root, { related: ['intent', 'context', 'strategy', 'delivery'] });
Object.assign(nodeData.intent, { related: ['root', 'language'] });
Object.assign(nodeData.context, { related: ['root', 'sources'] });
Object.assign(nodeData.strategy, { related: ['root', 'review'] });
Object.assign(nodeData.delivery, { related: ['root', 'action'] });
Object.assign(nodeData.language, { related: ['intent'] });
Object.assign(nodeData.review, { related: ['strategy'] });
Object.assign(nodeData.sources, { related: ['context'] });
Object.assign(nodeData.action, { related: ['delivery'] });

const canvas = document.querySelector('#canvas');
const graph = document.querySelector('#constellation');
const zoomLevel = document.querySelector('#zoomLevel');
const detail = {
  card: document.querySelector('#detailCard'), label: document.querySelector('#detailLabel'),
  step: document.querySelector('#detailStep'), title: document.querySelector('#detailTitle'),
  text: document.querySelector('#detailText'), list: document.querySelector('#detailList'), related: document.querySelector('#relatedList')
};
const nodeButtons = [...document.querySelectorAll('.node')];
const connectionPaths = [...document.querySelectorAll('[data-connection]')];
let state = { zoom: 1, panX: 0, panY: 0, isDragging: false, pointerOrigin: null };

function initialView() {
  const compact = window.matchMedia('(max-width: 650px)').matches;
  return { zoom: compact ? 0.7 : 0.88, panX: compact ? -255 : -72, panY: compact ? -55 : -24 };
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function render() {
  graph.style.transform = `translate3d(${state.panX}px, ${state.panY}px, 0) scale(${state.zoom})`;
  zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function resetView() {
  state = { ...state, ...initialView(), isDragging: false, pointerOrigin: null };
  canvas.classList.remove('is-dragging');
  render();
}

function changeZoom(amount, anchor) {
  const nextZoom = clamp(state.zoom + amount, MIN_ZOOM, MAX_ZOOM);
  if (nextZoom === state.zoom) return;
  const rect = canvas.getBoundingClientRect();
  const point = anchor || { x: rect.width / 2, y: rect.height / 2 };
  const mapX = (point.x - state.panX) / state.zoom;
  const mapY = (point.y - state.panY) / state.zoom;
  state.zoom = nextZoom;
  state.panX = point.x - mapX * nextZoom;
  state.panY = point.y - mapY * nextZoom;
  render();
}

function updateDetails(id) {
  const data = nodeData[id];
  if (!data) return;
  nodeButtons.forEach((button) => {
    const selected = button.dataset.node === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  connectionPaths.forEach((path) => {
    const [start, end] = path.dataset.connection.split('-');
    path.classList.toggle('is-related', start === id || end === id);
  });
  detail.card.classList.add('is-updating');
  window.setTimeout(() => {
    detail.label.textContent = data.label;
    detail.step.textContent = data.step;
    detail.title.textContent = data.title;
    detail.text.textContent = data.text;
    detail.list.replaceChildren(...data.tags.map((tag) => {
      const item = document.createElement('span');
      item.textContent = tag;
      return item;
    }));
    detail.related.replaceChildren(...data.related.map((relatedId) => {
      const related = nodeData[relatedId];
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = related.title;
      item.setAttribute('aria-label', `Ver conceito relacionado: ${related.title}`);
      item.addEventListener('click', () => updateDetails(relatedId));
      return item;
    }));
    detail.card.classList.remove('is-updating');
  }, 110);
}

nodeButtons.forEach((button) => button.addEventListener('click', () => updateDetails(button.dataset.node)));
document.querySelector('#zoomIn').addEventListener('click', () => changeZoom(ZOOM_STEP));
document.querySelector('#zoomOut').addEventListener('click', () => changeZoom(-ZOOM_STEP));
document.querySelector('#resetView').addEventListener('click', resetView);

canvas.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.node') || event.button !== 0) return;
  state.isDragging = true;
  state.pointerOrigin = { x: event.clientX - state.panX, y: event.clientY - state.panY };
  canvas.classList.add('is-dragging');
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!state.isDragging || !state.pointerOrigin) return;
  state.panX = event.clientX - state.pointerOrigin.x;
  state.panY = event.clientY - state.pointerOrigin.y;
  render();
});
function stopDragging() { state.isDragging = false; state.pointerOrigin = null; canvas.classList.remove('is-dragging'); }
canvas.addEventListener('pointerup', stopDragging);
canvas.addEventListener('pointercancel', stopDragging);
canvas.addEventListener('lostpointercapture', stopDragging);
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  changeZoom(event.deltaY > 0 ? -0.08 : 0.08, { x: event.clientX - rect.left, y: event.clientY - rect.top });
}, { passive: false });
canvas.addEventListener('keydown', (event) => {
  if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(ZOOM_STEP); }
  if (event.key === '-') { event.preventDefault(); changeZoom(-ZOOM_STEP); }
  if (event.key.toLowerCase() === 'r') resetView();
});

window.addEventListener('resize', () => {
  const visibleWidth = MAP_WIDTH * state.zoom;
  const visibleHeight = MAP_HEIGHT * state.zoom;
  state.panX = Math.min(state.panX, canvas.clientWidth - Math.min(visibleWidth, canvas.clientWidth));
  state.panY = Math.min(state.panY, canvas.clientHeight - Math.min(visibleHeight, canvas.clientHeight));
  render();
});

updateDetails('root');
resetView();
