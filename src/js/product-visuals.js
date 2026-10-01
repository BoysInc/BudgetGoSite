/* App-inspired sample charts. All figures remain readable without JavaScript. */
(function () {
  'use strict';
  const demo = document.querySelector('.insights-demo');
  if (!demo || !window.BudgetGoDonut) return;

  const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  const buttons = Array.from(demo.querySelectorAll('[data-spending-category]'));
  const categories = buttons.map(function (button) {
    return {
      id: button.dataset.spendingCategory,
      label: button.dataset.label,
      color: button.dataset.color,
      values: button.dataset.values.split(',').map(Number),
      previous: button.dataset.previous.split(',').map(Number)
    };
  });
  const sum = function (values) { return values.reduce(function (a, b) { return a + b; }, 0); };
  const total = sum(categories.map(function (category) { return sum(category.values); }));
  const all = {
    id: 'all', label: 'All categories', color: '#B69AFF',
    values: [0, 1, 2, 3].map(function (week) { return sum(categories.map(function (c) { return c.values[week]; })); }),
    previous: [0, 1, 2, 3].map(function (week) { return sum(categories.map(function (c) { return c.previous[week]; })); })
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const figure = demo.querySelector('.breakdown-visual');
  const trend = demo.querySelector('.trend-visual');
  const donut = demo.querySelector('.category-donut');
  const reset = demo.querySelector('[data-reset-categories]');
  const status = document.getElementById('spending-selection-status');
  const line = demo.querySelector('.trend-current-line');
  const priorLine = demo.querySelector('.trend-previous-line');
  const area = demo.querySelector('.trend-area');
  let selected = 'all';
  let animationFrame = 0;
  let painted = null;
  let angle = -Math.PI / 2;

  // Match the app: 14%-thick sectors, 2° spacing, and tangent rounded corners.
  donut.replaceChildren();
  categories.forEach(function (category, index) {
    const sweep = sum(category.values) / total * Math.PI * 2;
    const gap = Math.PI / 90;
    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    segment.classList.add('donut-segment');
    segment.dataset.category = category.id;
    segment.setAttribute('fill', category.color);
    segment.setAttribute('d', window.BudgetGoDonut.path({
      cx: 140, cy: 140, outerRadius: 130, thickness: 39.2,
      startAngle: angle + gap / 2, sweepAngle: sweep - gap
    }));
    segment.style.setProperty('--slice-delay', index * 65 + 'ms');
    segment.style.setProperty('--slice-x', Math.cos(angle + sweep / 2) * 4 + 'px');
    segment.style.setProperty('--slice-y', Math.sin(angle + sweep / 2) * 4 + 'px');
    segment.addEventListener('click', function () { selectCategory(category.id, true); });
    donut.appendChild(segment);
    angle += sweep;
  });

  // The example's weekly totals are distributed into transactions for the curve.
  // Different patterns preserve lump-sum bills and occasional travel purchases.
  function dailyValues(category, previous) {
    const weeks = previous ? category.previous : category.values;
    const weights = {
      rent: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      groceries: [2, 0, 1, 0, 2, 0, 1, 0, 1],
      travel: [0, 0, 3, 0, 0, 0, 1, 0, 0],
      utilities: [0, 0, 0, 1, 0, 0, 0, 0, 0],
      other: [1, 3, 1, 2, 0, 2, 1, 0, 2]
    }[category.id];
    return weeks.flatMap(function (amount, week) {
      const profile = weights.slice(0, week === 3 ? 9 : 7);
      const weight = sum(profile);
      return profile.map(function (part) { return amount * part / weight; });
    });
  }

  function cumulative(category, previous) {
    const source = category.id === 'all' ? categories : [category];
    const daily = source.map(function (item) { return dailyValues(item, previous); });
    let running = 0;
    return [0].concat(Array.from({ length: 30 }, function (_, day) {
      running += sum(daily.map(function (values) { return values[day]; }));
      return running;
    }));
  }

  function points(category) {
    const current = cumulative(category, false);
    const previous = cumulative(category, true);
    const ceiling = Math.max(current[30], previous[30], 1);
    return { current: current.map(function (n) { return 160 - n / ceiling * 144; }), previous: previous.map(function (n) { return 160 - n / ceiling * 144; }) };
  }

  function curve(values) {
    let path = 'M8 ' + values[0].toFixed(2);
    for (let i = 1; i < values.length; i++) {
      const x = 8 + i / 30 * 392;
      const priorX = 8 + (i - 1) / 30 * 392;
      path += ' C' + (priorX + 5).toFixed(2) + ' ' + values[i - 1].toFixed(2) + ' ' + (x - 5).toFixed(2) + ' ' + values[i].toFixed(2) + ' ' + x.toFixed(2) + ' ' + values[i].toFixed(2);
    }
    return path;
  }

  function paint(pointsToDraw) {
    const current = curve(pointsToDraw.current);
    line.setAttribute('d', current);
    priorLine.setAttribute('d', curve(pointsToDraw.previous));
    area.setAttribute('d', current + ' L400 178 L8 178 Z');
    painted = pointsToDraw;
  }

  function animateCurve(target) {
    cancelAnimationFrame(animationFrame);
    if (reducedMotion.matches || !painted) { paint(target); return; }
    const from = painted;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / 420);
      const eased = 1 - Math.pow(1 - progress, 3);
      paint({
        current: target.current.map(function (y, i) { return from.current[i] + (y - from.current[i]) * eased; }),
        previous: target.previous.map(function (y, i) { return from.previous[i] + (y - from.previous[i]) * eased; })
      });
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function selectCategory(id, announce) {
    const category = categories.find(function (item) { return item.id === id; }) || all;
    selected = category.id;
    figure.classList.remove('is-visible');
    trend.classList.remove('is-visible');
    const amount = sum(category.values);
    const previous = sum(category.previous);
    const difference = previous - amount;
    const percentage = Math.round(Math.abs(difference) / Math.max(previous, 1) * 100);
    const amountText = money.format(amount / 100);
    buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.spendingCategory === selected)); });
    reset.setAttribute('aria-pressed', String(selected === 'all'));
    donut.querySelectorAll('.donut-segment').forEach(function (segment) {
      segment.classList.toggle('is-muted', selected !== 'all' && segment.dataset.category !== selected);
      segment.classList.toggle('is-selected', segment.dataset.category === selected);
    });
    demo.querySelector('.donut-category-label').textContent = selected === 'all' ? 'Total spent' : category.label;
    demo.querySelector('.donut-amount').textContent = amountText;
    demo.querySelector('.donut-share').textContent = selected === 'all' ? 'Across 5 categories' : (amount / total * 100).toFixed(1) + '% of your spending';
    trend.style.setProperty('--chart-accent', category.color);
    demo.querySelector('.trend-scope').textContent = category.label;
    demo.querySelector('.trend-total').textContent = amountText;
    const change = demo.querySelector('.trend-change');
    change.dataset.direction = difference === 0 ? 'same' : difference > 0 ? 'less' : 'more';
    change.textContent = difference === 0 ? 'No change' : (difference > 0 ? '↘ ' : '↗ ') + percentage + '% ' + (difference > 0 ? 'less' : 'more');
    demo.querySelector('.trend-comparison').textContent = difference === 0 ? 'The same as August' : money.format(Math.abs(difference) / 100) + (difference > 0 ? ' less' : ' more') + ' than August';
    const maximum = Math.max.apply(null, category.values.concat(1));
    demo.querySelectorAll('.week-column').forEach(function (column, week) {
      column.querySelector('.week-amount').textContent = money.format(category.values[week] / 100);
      column.querySelector('.week-fill').style.setProperty('--fill-height', category.values[week] / maximum * 100 + '%');
    });
    const contextIcon = demo.querySelector('.trend-context-icon');
    contextIcon.textContent = selected === 'all' ? '↘' : '';
    if (selected !== 'all') contextIcon.appendChild(buttons.find(function (button) { return button.dataset.spendingCategory === selected; }).querySelector('.category-icon').cloneNode(true));
    demo.querySelector('.trend-context-copy').textContent = selected === 'all' ? 'The little things add up. See the whole picture.' : category.label + ' makes up ' + (amount / total * 100).toFixed(1) + '% of this month’s spending.';
    demo.querySelector('.cumulative-chart').setAttribute('aria-label', category.label + ' cumulative spending: September ' + amountText + '; August ' + money.format(previous / 100) + '.');
    demo.querySelector('.weekly-chart').setAttribute('aria-label', category.label + ' September spending. ' + category.values.map(function (n, i) { return 'Week ' + (i + 1) + ': ' + money.format(n / 100); }).join('. '));
    animateCurve(points(category));
    if (announce) status.textContent = category.label + ': ' + amountText + ' in September. ' + demo.querySelector('.trend-comparison').textContent + '. Spending charts updated.';
  }

  buttons.forEach(function (button) {
    button.disabled = false;
    button.addEventListener('click', function () { selectCategory(button.dataset.spendingCategory === selected ? 'all' : button.dataset.spendingCategory, true); });
  });
  reset.disabled = false;
  reset.addEventListener('click', function () { selectCategory('all', true); });
  document.querySelectorAll('[data-category-shortcut]').forEach(function (link) {
    link.addEventListener('click', function () { selectCategory(link.dataset.categoryShortcut, true); });
  });
  demo.classList.add('charts-ready');
  demo.querySelector('.category-instruction').textContent = 'Tap a category to explore the charts';
  paint(points(all));

  // One entrance per illustration; no idle loops or timers when out of view.
  const animatedElements = [figure, trend, document.querySelector('.hero-categories')].filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (reducedMotion.matches || selected !== 'all') return;
        entry.target.classList.add('is-visible');
        window.setTimeout(function () { entry.target.classList.remove('is-visible'); }, 1200);
      });
    }, { threshold: .18 });
    animatedElements.forEach(function (element) { observer.observe(element); });
  }
  reducedMotion.addEventListener('change', function () {
    if (!reducedMotion.matches) return;
    animatedElements.forEach(function (element) { element.classList.remove('is-visible'); });
    cancelAnimationFrame(animationFrame);
    paint(points(categories.find(function (item) { return item.id === selected; }) || all));
  });
})();
