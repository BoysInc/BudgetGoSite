(() => {
  const svgNamespace = 'http://www.w3.org/2000/svg';

  /**
   * Route each source from its nearest edge into the central hub.
   * Bounds stay in stage coordinates so the same layout works at every breakpoint.
   * @param {DOMRect} source Source card bounds.
   * @param {DOMRect} destination BudgetGo hub bounds.
   * @param {DOMRect} stage Diagram bounds.
   * @returns {string} SVG cubic path data.
   */
  function connectionCurve(source, destination, stage) {
    const sourceCenter = { x: source.left + source.width / 2, y: source.top + source.height / 2 };
    const hubCenter = { x: destination.left + destination.width / 2, y: destination.top + destination.height / 2 };
    const dx = hubCenter.x - sourceCenter.x;
    const dy = hubCenter.y - sourceCenter.y;
    const across = Math.abs(dx) > Math.abs(dy);
    const start = across
      ? { x: dx > 0 ? source.right : source.left, y: sourceCenter.y }
      : { x: sourceCenter.x, y: dy > 0 ? source.bottom : source.top };
    const end = across
      ? { x: dx > 0 ? destination.left : destination.right, y: hubCenter.y }
      : { x: hubCenter.x, y: dy > 0 ? destination.top : destination.bottom };
    [start, end].forEach(point => { point.x -= stage.left; point.y -= stage.top; });
    if (across) {
      const middle = (start.x + end.x) / 2;
      return `M${start.x},${start.y} C${middle},${start.y} ${middle},${end.y} ${end.x},${end.y}`;
    }
    const middle = (start.y + end.y) / 2;
    return `M${start.x},${start.y} C${start.x},${middle} ${end.x},${middle} ${end.x},${end.y}`;
  }

  function initialize(root) {
    const stage = root.querySelector('.source-flow');
    const svg = root.querySelector('.source-flow__connections');
    const destination = root.querySelector('[data-flow-destination]');
    const sources = [...root.querySelectorAll('[data-flow-source]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const travelers = document.createElement('div');
    travelers.className = 'source-flow__travelers';
    travelers.setAttribute('aria-hidden', 'true');
    stage.append(travelers);
    const connections = sources.map((source, index) => {
      const group = document.createElementNS(svgNamespace, 'g');
      group.classList.add('source-flow__connection');
      const delay = `${index * 2.4}s`;
      group.style.setProperty('--flow-delay', delay);
      const paths = ['track', 'pulse'].map(kind => {
        const path = document.createElementNS(svgNamespace, 'path');
        path.classList.add(`source-flow__${kind}`);
        path.setAttribute('pathLength', '100');
        group.append(path);
        return path;
      });
      svg.append(group);
      const traveler = document.createElement('span');
      traveler.className = 'source-flow__traveler';
      traveler.style.setProperty('--flow-delay', delay);
      traveler.textContent = source.dataset.flowAmount;
      travelers.append(traveler);
      const highlight = () => group.classList.toggle('is-active', source.matches(':hover, :focus-visible'));
      ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(event => source.addEventListener(event, highlight));
      return { paths, traveler };
    });

    function renderConnections() {
      const stageBounds = stage.getBoundingClientRect();
      const destinationBounds = destination.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${stageBounds.width} ${stageBounds.height}`);
      sources.forEach((source, index) => {
        const curve = connectionCurve(source.getBoundingClientRect(), destinationBounds, stageBounds);
        connections[index].paths.forEach(path => path.setAttribute('d', curve));
        connections[index].traveler.style.offsetPath = `path('${curve}')`;
      });
    }

    const resizeObserver = new ResizeObserver(renderConnections);
    [stage, destination, ...sources].forEach(element => resizeObserver.observe(element));
    renderConnections();

    function updatePlayback() {
      root.toggleAttribute('data-flow-running', visible && !reducedMotion.matches && !document.hidden);
    }

    reducedMotion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);

    // Preserve animation progress when offscreen so source arrivals stay synchronized.
    const revealObserver = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      updatePlayback();
    }, { threshold: .1 });
    revealObserver.observe(stage);
    updatePlayback();
  }

  document.querySelectorAll('[data-source-flow]').forEach(initialize);
})();
