/* Independent, dependency-free 12-second spending story. */
(() => {
  'use strict';

  function initializeMotion(root) {
    if (root.dataset.motionReady === 'true') return;
    const rows = Array.from(root.querySelectorAll('[data-motion-row]'));
    const total = root.querySelector('[data-motion-total]');
    const status = root.querySelector('[data-motion-status]');
    const control = root.querySelector('[data-motion-control]');
    const controlLabel = root.querySelector('[data-motion-control-label]');
    if (rows.length !== 3 || !total || !status || !control || !controlLabel) return;
    root.dataset.motionReady = 'true';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const duration = 12000;
    const amounts = [640, 4815, 1200];
    const entranceTimes = [350, 1650, 2950];
    const categoryTimes = [1000, 2300, 3600];
    // Let the completed view read clearly before the first sequence.
    let elapsed = 8000;
    let previousTime = null;
    let frame = null;
    let inView = true;
    let userPaused = false;
    let previousTotal = '';
    let previousStatus = '';

    const clamp = value => Math.min(1, Math.max(0, value));
    const easeOut = value => 1 - Math.pow(1 - clamp(value), 3);
    const progress = (time, start, length) => clamp((time - start) / length);
    const setVariable = (element, name, value) => element.style.setProperty(name, value);

    function setTotal(cents) {
      const text = `€${(cents / 100).toFixed(2)}`;
      if (text !== previousTotal) {
        total.textContent = text;
        previousTotal = text;
      }
    }

    function setStatus(text) {
      if (text !== previousStatus) {
        status.textContent = text;
        previousStatus = text;
      }
    }

    function render(time) {
      const complete = time >= 6800;
      const resetFade = time > 11400 ? 1 - progress(time, 11400, 600) : 1;
      setVariable(root, '--motion-scene-opacity', resetFade.toFixed(3));
      rows.forEach((row, index) => {
        const entrance = easeOut(progress(time, entranceTimes[index], 650));
        const category = easeOut(progress(time, categoryTimes[index], 500));
        const active = time >= entranceTimes[index] && time < categoryTimes[index] + 500;
        setVariable(row, '--row-visibility', entrance.toFixed(3));
        setVariable(row, '--row-x', `${((1 - entrance) * -22).toFixed(2)}px`);
        setVariable(row, '--category-visibility', category.toFixed(3));
        setVariable(row, '--category-scale', (0.9 + category * 0.1).toFixed(3));
        setVariable(row, '--row-active', active ? '1' : '0');
      });

      const summaryProgress = easeOut(progress(time, 4600, 1700));
      const cents = Math.round(amounts.reduce((sum, amount) => sum + amount, 0) * summaryProgress);
      setTotal(cents);
      setVariable(root, '--motion-fill', summaryProgress.toFixed(4));
      const flowing = time >= 4100 && time < 5400;
      setVariable(root, '--flow-opacity', flowing ? '1' : '0');
      setVariable(root, '--flow-position', `${(-40 + progress(time, 4100, 1300) * 240).toFixed(1)}px`);
      setVariable(root, '--spark-rotation', `${(progress(time, 4100, 1300) * 90).toFixed(1)}deg`);
      setStatus(complete ? 'Every little thing, in its place.' : time >= 4100 ? 'Making sense of your spending…' : time >= 1000 ? 'A category for every transaction.' : 'Life happens. It all adds up.');
    }

    function renderComplete() {
      render(8000);
    }

    function canRun() {
      return !userPaused && !reducedMotion.matches && inView && !document.hidden;
    }

    function updateControl() {
      const paused = userPaused || reducedMotion.matches;
      root.dataset.paused = String(paused);
      control.hidden = reducedMotion.matches;
      control.setAttribute('aria-label', paused ? 'Play spending animation' : 'Pause spending animation');
      controlLabel.textContent = paused ? 'Play' : 'Pause';
    }

    function tick(timestamp) {
      frame = null;
      if (!canRun()) {
        previousTime = null;
        return;
      }
      if (previousTime !== null) elapsed = (elapsed + Math.min(timestamp - previousTime, 100)) % duration;
      previousTime = timestamp;
      render(elapsed);
      frame = window.requestAnimationFrame(tick);
    }

    function synchronize() {
      updateControl();
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      // Keep the timeline on its completed hold when the motion preference changes.
      // Returning to animation must not jump back into an interrupted entrance or fade.
      if (reducedMotion.matches) {
        elapsed = 8000;
        renderComplete();
      }
      if (canRun()) frame = window.requestAnimationFrame(tick);
    }

    control.addEventListener('click', () => {
      userPaused = !userPaused;
      synchronize();
    });
    document.addEventListener('visibilitychange', synchronize);
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', synchronize);
    } else if (typeof reducedMotion.addListener === 'function') {
      reducedMotion.addListener(synchronize);
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        synchronize();
      }, { threshold: 0.1 });
      observer.observe(root);
    }
    renderComplete();
    synchronize();
  }

  function initialize() {
    document.querySelectorAll('[data-money-motion]').forEach(initializeMotion);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
