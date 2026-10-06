/* Scroll choreography with GSAP ScrollTrigger and SplitText. Every scene is skipped under reduced motion. */
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;

  // Without GSAP, drop the hidden start states so nothing stays invisible.
  if (!gsap || !window.ScrollTrigger) { root.classList.remove('motion'); return; }
  if (reduceMotion) return;

  gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
  const ScrollTrigger = window.ScrollTrigger;
  const money = window.BudgetGoMoney;

  document.fonts.ready.then(function () {
    introHero();
    splitHeadings();
    inputsStory();
    sortingScene();
    insightsReel();
    analyticsScene();
    phoneScenes();
    privacyWords();
    closingScene();
    ScrollTrigger.refresh();
  });

  /** Counts an element from zero to its data-count amount. */
  function countUp(el, duration) {
    const raw = el.dataset.count;
    const target = Number(raw);
    const decimals = money.decimalsOf(raw);
    const isMoney = el.textContent.trim().charAt(0) === '$';
    const state = { v: 0 };
    return gsap.to(state, {
      v: target, duration: duration || 1.6, ease: 'power3.out',
      onUpdate: function () { el.textContent = isMoney ? money.formatMoney(state.v, decimals) : Math.round(state.v).toString(); }
    });
  }

  /** Prepares an SVG path to be drawn by animating its dash offset. */
  function primeDraw(path) {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: path.classList.contains('draw--dash') ? '6 7' : length, strokeDashoffset: length });
    return length;
  }

  function introHero() {
    const hero = document.querySelector('.hero');
    const title = hero.querySelector('[data-split]');
    // No mask: a clipping mask cuts the glyphs at this tight leading.
    const split = new window.SplitText(title, { type: 'words' });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: function () { hero.querySelector('.hero__fan').classList.add('is-ready'); } });
    tl.from(split.words, { yPercent: 40, opacity: 0, filter: 'blur(10px)', duration: 1.3, stagger: 0.07 })
      .from(hero.querySelectorAll('[data-reveal]'), { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.25)
      .from('.fan--center', { yPercent: 40, opacity: 0, duration: 1.6 }, 0.2)
      .from('.fan--left', { yPercent: 50, rotate: 0, xPercent: -50, opacity: 0, duration: 1.7 }, 0.35)
      .from('.fan--right', { yPercent: 50, rotate: 0, xPercent: -50, opacity: 0, duration: 1.7 }, 0.35);
    title.dataset.split = 'done';

    // The side phones fan out further as the hero scrolls away.
    gsap.to('.fan--left', { rotate: -14, yPercent: -6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.fan--right', { rotate: 14, yPercent: -6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  function splitHeadings() {
    document.querySelectorAll('[data-split]:not([data-split="done"])').forEach(function (heading) {
      const split = new window.SplitText(heading, { type: 'lines' });
      gsap.from(split.lines, { yPercent: 40, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: heading, start: 'top 85%' } });
    });
    document.querySelectorAll('.section-head .lead, .sort__copy .lead, .modes .lead, .reel-intro .lead').forEach(function (el) {
      gsap.from(el, { y: 24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
  }

  /** Four input methods: pinned and scrubbed on desktop, auto-cycling on small screens. */
  function inputsStory() {
    const section = document.querySelector('.inputs');
    const stage = section.querySelector('.inputs__stage');
    const steps = Array.from(section.querySelectorAll('.step'));
    let current = -1;

    function activate(index) {
      if (index === current) return;
      current = index;
      stage.dataset.active = String(index);
      steps.forEach(function (step, i) { step.classList.toggle('is-active', i === index); });
      const overlay = stage.querySelector('[data-overlay="' + index + '"]');
      gsap.fromTo(overlay.querySelectorAll('.file'), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.3, ease: 'back.out(1.6)' });
    }

    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', function () {
        ScrollTrigger.create({
          trigger: section, start: 'top top', end: '+=260%', pin: true, scrub: true,
          onUpdate: function (self) { activate(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))); }
        });
        activate(0);
    });
    mm.add('(max-width: 900px)', function () {
        let timer = 0;
        let index = 0;
        activate(0);
        const trigger = ScrollTrigger.create({
          trigger: stage, start: 'top 80%', end: 'bottom 20%',
          onToggle: function (self) {
            clearInterval(timer);
            if (self.isActive) timer = setInterval(function () { index = (index + 1) % steps.length; activate(index); }, 3200);
          }
        });
        return function () { clearInterval(timer); trigger.kill(); };
    });
  }

  function sortingScene() {
    const list = document.querySelector('[data-sort-list]');
    const rows = Array.from(list.querySelectorAll('.sort-row'));
    const count = document.querySelector('[data-sort-count]');
    const label = document.querySelector('.sort__label');
    gsap.from(rows, { x: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: list, start: 'top 80%' } });
    ScrollTrigger.create({
      trigger: list, start: 'top 55%', once: true,
      onEnter: function () {
        const ai = document.querySelector('.sort__ai');
        const status = document.querySelector('[data-sort-status]');
        ai.classList.add('is-working');
        rows.forEach(function (row, i) {
          // The scan sweeps first, then the category lands as the light passes.
          gsap.delayedCall(0.3 + i * 0.6, function () { row.classList.add('is-scanning'); });
          gsap.delayedCall(0.65 + i * 0.6, function () {
            row.classList.add('is-sorted');
            if (i === rows.length - 1) { ai.classList.remove('is-working'); ai.classList.add('is-done'); status.textContent = 'Sorted by AI'; }
            gsap.fromTo(row, { scale: 1 }, { scale: 1.03, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
            const left = rows.length - i - 1;
            count.textContent = left === 0 ? '✓' : String(left);
            if (left === 0) label.textContent = 'All sorted';
          });
        });
      }
    });
  }

  /** Horizontal story reel, pinned while the cards slide past on desktop. */
  function insightsReel() {
    const pin = document.querySelector('.insights__pin');
    const track = pin.querySelector('[data-reel]');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', function () {
        // Measure to the last panel's edge: scrollWidth drops the track's trailing padding in some browsers.
        const distance = function () {
          const last = track.lastElementChild;
          return Math.max(0, last.offsetLeft + last.offsetWidth + 64 - window.innerWidth);
        };
        const tween = gsap.to(track, {
          x: function () { return -distance(); }, ease: 'none',
          scrollTrigger: { trigger: pin, start: 'center center', end: function () { return '+=' + distance(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true }
        });
        track.querySelectorAll('.story').forEach(function (card) {
          card.querySelectorAll('.draw').forEach(primeDraw);
          gsap.timeline({ scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%' } })
            .from(card, { rotate: 6, y: 60, opacity: 0.3, duration: 0.8, ease: 'power3.out' })
            .to(card.querySelectorAll('.draw'), { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power2.out' }, 0.2)
            .from(card.querySelectorAll('.story__number'), { yPercent: 30, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0.15)
            .from(card.querySelectorAll('.story__compare .bar'), { scaleX: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, 0.3)
            .from(card.querySelectorAll('.story__bars i'), { scaleY: 0, duration: 0.8, stagger: 0.05, ease: 'back.out(1.6)' }, 0.3);
        });
    });
  }

  function analyticsScene() {
    ScrollTrigger.batch('.widget', {
      start: 'top 85%', once: true,
      onEnter: function (batch) {
        gsap.from(batch, { y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out' });
        batch.forEach(function (widget) {
          widget.classList.add('is-in');
          widget.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, 1.8); });
          widget.querySelectorAll('.draw').forEach(function (path) {
            primeDraw(path);
            gsap.to(path, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', delay: 0.2 });
          });
          widget.querySelectorAll('.area').forEach(function (area) { gsap.from(area, { opacity: 0, duration: 1.4, delay: 0.8 }); });
        });
      }
    });
  }

  /** Real-screen phones rise in with their companion cards; chips stagger in like notifications. */
  function phoneScenes() {
    document.querySelectorAll('.banks, .due').forEach(function (section) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%' } });
      tl.from(section.querySelector('.iphone'), { y: 90, rotate: section.classList.contains('banks') ? -6 : 6, opacity: 0, duration: 1.3, ease: 'expo.out' })
        .from(section.querySelectorAll('.bank-card, .due-row, .banks__points li'), { x: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)' }, 0.35);
      gsap.to(section.querySelector('.iphone'), { yPercent: -6, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /** Brightens the privacy statement word by word, then lifts the four safeguard cards in. */
  function privacyWords() {
    const text = document.querySelector('[data-words]');
    const words = text.textContent.trim().split(/\s+/);
    text.setAttribute('aria-label', text.textContent.trim());
    text.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + ' </span>'; }).join('');
    gsap.to(text.querySelectorAll('.w'), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    gsap.from('.privacy-first__card', { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.privacy-first__cards', start: 'top 80%' } });
  }

  function closingScene() {
    const card = document.querySelector('.closing__card');
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%' } })
      .from(card, { scale: 0.92, borderRadius: 80, duration: 1.4, ease: 'expo.out' })
      .from('.iphone--closing', { yPercent: 40, opacity: 0, duration: 1.5, ease: 'expo.out' }, 0.25)
      .from('.closing__chip', { scale: 0.6, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'back.out(1.8)' }, 0.8);
  }
})();
