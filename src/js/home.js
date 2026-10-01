/* Small, progressive enhancements. The page stays readable without JavaScript. */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));

  function closeDropdowns() {
    dropdowns.forEach(function (dropdown) { dropdown.removeAttribute('open'); });
  }

  function closeMenu(restoreFocus) {
    if (!toggle || !nav) return;
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    closeDropdowns();
    if (wasOpen && restoreFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      if (!open) closeDropdowns();
    });
    nav.addEventListener('click', function (event) {
      if (event.target instanceof Element && event.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('click', function (event) {
      if (!(event.target instanceof Node)) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        const openDropdown = dropdowns.find(function (dropdown) { return dropdown.open; });
        if (openDropdown && toggle.getAttribute('aria-expanded') !== 'true') {
          openDropdown.querySelector('summary').focus();
        }
        closeMenu(true);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) closeMenu(false);
    });
  }

  const section = document.getElementById('reviews');
  if (!section) return;
  const reviews = (window.BUDGETGO_REVIEWS || []).filter(function (review) {
    return review && review.quote && review.name;
  });
  const preview = new URLSearchParams(window.location.search).has('preview-reviews');
  const samples = Array.from({ length: 3 }, function (_, i) {
    return {
      quote: 'Sample review ' + (i + 1) + '. Replace this with real feedback before launch.',
      name: 'Sample reviewer', source: 'Preview only', sample: true
    };
  });
  const list = reviews.length ? reviews : preview ? samples : [];
  if (!list.length) return;

  const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const grid = document.createElement('div');
  grid.className = 'container reviews-grid';
  list.forEach(function (review) {
    const card = document.createElement('article');
    card.className = 'review-card';
    if (review.sample) {
      const label = document.createElement('span');
      label.className = 'review-sample';
      label.textContent = 'Sample';
      card.appendChild(label);
    }
    if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
      const stars = document.createElement('p');
      stars.className = 'review-stars';
      stars.setAttribute('aria-label', review.rating + ' out of 5 stars');
      stars.textContent = '★★★★★'.slice(0, review.rating) + '☆☆☆☆☆'.slice(0, 5 - review.rating);
      card.appendChild(stars);
    }
    const quote = document.createElement('blockquote');
    quote.textContent = '“' + review.quote + '”';
    const footer = document.createElement('footer');
    const name = document.createElement('span');
    name.className = 'review-name';
    name.textContent = review.name;
    const meta = document.createElement('span');
    meta.className = 'review-meta';
    const date = review.date ? new Date(review.date + 'T00:00:00') : null;
    meta.textContent = [review.source, date && !isNaN(date) ? dateFormat.format(date) : ''].filter(Boolean).join(' · ');
    footer.append(name, meta);
    card.append(quote, footer);
    grid.appendChild(card);
  });
  section.querySelector('.reviews-rows').appendChild(grid);
  section.hidden = false;
})();
