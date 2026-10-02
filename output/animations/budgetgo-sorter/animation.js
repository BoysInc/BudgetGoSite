const assetPath = '../../../src/images/animations/budgetgo-sorter/';
const frames = [
  { file: 'frame-01-push.png', duration: 900, alt: 'A lime-green creature pushes a trolley full of messy spending receipts toward a BudgetGo machine.' },
  { file: 'frame-02-load.png', duration: 900, alt: 'The creature loads spending receipts and category cards into the BudgetGo machine.' },
  { file: 'frame-03-sort.png', duration: 1200, alt: 'The creature watches spending records swirl inside the BudgetGo machine.' },
  { file: 'frame-04-reveal.png', duration: 1200, alt: 'The machine reveals neatly grouped Groceries, Bills, Transport, and Dining cards.' },
  { file: 'frame-05-clear.png', duration: 1400, alt: 'The creature pushes a trolley filled with neatly organized spending categories.' },
];
const scene = document.querySelector('#scene');
const play = document.querySelector('#play');
const buttons = [...document.querySelectorAll('[data-frame]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 4;
let playing = false;
let timer;

function render() {
  scene.src = assetPath + frames[current].file;
  scene.alt = frames[current].alt;
  buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
  play.textContent = playing ? 'Pause' : 'Play';
}

function schedule() {
  clearTimeout(timer);
  if (!playing) return;
  timer = setTimeout(() => {
    current = (current + 1) % frames.length;
    render();
    schedule();
  }, frames[current].duration);
}

function setPlaying(value) {
  playing = value;
  render();
  schedule();
}

play.addEventListener('click', () => setPlaying(!playing));
buttons.forEach((button, index) => button.addEventListener('click', () => {
  current = index;
  setPlaying(false);
}));
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    current = 4;
    setPlaying(false);
  }
});

async function initialize() {
  // Decode first so a slow connection cannot interrupt the five-frame loop.
  await Promise.all(frames.map(async ({ file }) => {
    const image = new Image();
    image.src = assetPath + file;
    await image.decode();
  }));
  document.querySelector('.controls').hidden = false;
  current = reducedMotion.matches ? 4 : 0;
  setPlaying(!reducedMotion.matches);
}

initialize().catch(() => { play.textContent = 'Play'; });
