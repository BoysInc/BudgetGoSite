/* One quiet entrance per section. Content stays visible without JavaScript. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sections = document.querySelectorAll('.home .tour-section-intro, .home .workflow-copy, .home .essentials-grid, .home .privacy-layout, .home .faq-layout, .home .download-panel');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  sections.forEach(function (section) {
    section.classList.add('motion-reveal');
    observer.observe(section);
  });
})();
