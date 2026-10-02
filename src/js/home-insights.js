/* Finish each entrance once; the final product data remains readable without motion. */
(function () {
  'use strict';
  const amountToggle = document.querySelector('[data-amount-toggle]');
  if (amountToggle) {
    const amounts = Array.from(amountToggle.closest('.feature-ui').querySelectorAll('[data-private-amount]'));
    const originalAmounts = amounts.map(function (amount) { return amount.textContent; });
    amountToggle.addEventListener('click', function () {
      const hidden = amountToggle.getAttribute('aria-pressed') !== 'true';
      amountToggle.setAttribute('aria-pressed', String(hidden));
      amountToggle.setAttribute('aria-label', hidden ? 'Show amounts' : 'Hide amounts');
      amounts.forEach(function (amount, index) { amount.textContent = hidden ? '••••' : originalAmounts[index]; });
    });
  }
  const cards = document.querySelectorAll('[data-insight-motion]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length || !('IntersectionObserver' in window) || motionPreference.matches) return;
  const frames = new Map();


  /** Count to the declared total; preserve the original content for reduced motion. */
  function countNumber(element) {
    const finalText = element.textContent;
    const total = Number(element.dataset.count);
    const prefix = element.dataset.countPrefix || '';
    const decimals = Number(element.dataset.countDecimals || 0);
    const numberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits:decimals, maximumFractionDigits:decimals });
    let previousTime = performance.now();
    let elapsed = 0;
    function tick(now) {
      if (motionPreference.matches) {
        element.textContent = finalText;
        frames.delete(element);
        return;
      }
      if (!element.closest('.story-is-paused') && !document.hidden) elapsed += now - previousTime;
      previousTime = now;
      const progress = Math.min(1, elapsed / 1400);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = prefix + numberFormat.format(total * eased);
      if (progress < 1) frames.set(element, requestAnimationFrame(tick));
      else { element.textContent = finalText; frames.delete(element); }
    }
    frames.set(element, requestAnimationFrame(tick));
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('insight-motion-entered');
      entry.target.querySelectorAll('[data-count]').forEach(countNumber);
      observer.unobserve(entry.target);
    });
  }, { threshold: .2 });
  cards.forEach(function (card) { observer.observe(card); });
  motionPreference.addEventListener('change', function () {
    if (!motionPreference.matches) return;
    observer.disconnect();
    cards.forEach(function (card) { card.classList.remove('insight-motion-entered'); });
    // Pending animation frames restore their original totals on the next frame.
  });
})();
