/* Pointer, header and toggle behavior. Scroll choreography lives in motion.js. */
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Motion start states in CSS only apply once we know animation will run.
  if (!reduceMotion) root.classList.add('motion');

  const header = document.querySelector('.site-header');
  function updateHeader() { header && header.classList.toggle('is-scrolled', window.scrollY > 24); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (reduceMotion || !finePointer) return;
  bindHeroPointer();
  bindMagnetic();

  /** Tilts the hero phones with the pointer. */
  function bindHeroPointer() {
    const stage = document.querySelector('[data-tilt]');
    const hero = document.querySelector('.hero');
    if (!stage || !hero) return;
    const phone = stage.querySelector('.hero__fan');
    let frame = 0;
    hero.addEventListener('pointermove', function (event) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        phone.style.transform = 'translateX(-50%) rotateY(' + x * 10 + 'deg) rotateX(' + (-y * 6) + 'deg)';
      });
    });
    hero.addEventListener('pointerleave', function () {
      phone.style.transform = '';
    });
  }

  /** Pulls primary buttons slightly toward the pointer. */
  function bindMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.28 + 'px)';
      });
      button.addEventListener('pointerleave', function () { button.style.transform = ''; });
    });
  }
})();
