/* Small, progressive enhancements. The page stays readable without JavaScript. */
(function () {
  const translate = function (text) { return window.BudgetGoI18n ? window.BudgetGoI18n.t(text) : text; };
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
    toggle.setAttribute('aria-label', translate('Open navigation'));
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    closeDropdowns();
    if (wasOpen && restoreFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', translate(open ? 'Close navigation' : 'Open navigation'));
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

})();
