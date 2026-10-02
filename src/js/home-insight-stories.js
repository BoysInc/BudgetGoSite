(function () {
  'use strict';
  const stories = Array.from(document.querySelectorAll('.insight-story'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Move through the visible story sequence without hiding the other artwork. */
  function nextStory(index) {
    const next = stories[index + 1];
    const target = next || document.getElementById('insight-widgets');
    if (!target) return;
    if (next) {
      next.classList.remove('story-is-closed', 'story-is-paused');
      next.querySelector('[data-story-open]').hidden = true;
      next.querySelector('[data-story-pause]').setAttribute('aria-pressed', 'false');
      next.querySelector('[data-story-pause]').textContent = 'Tap to continue · Hold to pause';
      next.querySelector('[data-story-close]').focus({ preventScroll:true });
    }
    target.scrollIntoView({ behavior:reducedMotion.matches ? 'instant' : 'smooth', block:'center' });
  }

  stories.forEach(function (story, index) {
    const reopen = story.querySelector('[data-story-open]');
    const close = story.querySelector('[data-story-close]');
    const pause = story.querySelector('[data-story-pause]');
    const status = story.querySelector('.story-share-status');
    close.addEventListener('click', function () {
      story.classList.add('story-is-closed', 'story-is-paused');
      reopen.hidden = false;
      reopen.focus();
    });
    reopen.addEventListener('click', function () {
      story.classList.remove('story-is-closed', 'story-is-paused');
      reopen.hidden = true;
      pause.setAttribute('aria-pressed', 'false');
      pause.textContent = 'Tap to continue · Hold to pause';
      close.focus();
    });
    story.querySelector('[data-story-next]').addEventListener('click', function () { nextStory(index); });
    pause.addEventListener('click', function () {
      const paused = pause.getAttribute('aria-pressed') !== 'true';
      pause.setAttribute('aria-pressed', String(paused));
      story.classList.toggle('story-is-paused', paused);
      pause.textContent = paused ? 'Paused · Tap to resume' : 'Tap to continue · Hold to pause';
    });
    const why = story.querySelector('[data-story-why]');
    if (why) {
      why.setAttribute('aria-expanded', 'false');
      why.addEventListener('click', function () {
        const explanation = story.querySelector('.insight-story__explanation');
        explanation.hidden = !explanation.hidden;
        why.setAttribute('aria-expanded', String(!explanation.hidden));
      });
    }
    story.querySelector('[data-story-share]').addEventListener('click', async function () {
      const title = story.querySelector('h4').textContent;
      const url = new URL('#insight-widgets', location.href).href;
      try {
        if (navigator.share) await navigator.share({ title:'BudgetGo', text:title, url:url });
        else { await navigator.clipboard.writeText(url); status.textContent = 'Link copied'; }
      } catch (error) {
        if (error.name !== 'AbortError') status.textContent = 'Unable to share. Copy the page link from your browser.';
      }
    });

    let pointerStart = null;
    story.addEventListener('pointerdown', function (event) {
      if (event.target.closest('button,a') || story.classList.contains('story-is-closed')) return;
      pointerStart = { x:event.clientX, y:event.clientY, time:performance.now() };
      story.classList.add('story-is-paused');
    });
    story.addEventListener('pointerup', function (event) {
      if (!pointerStart) return;
      const tapped = performance.now() - pointerStart.time < 250 && Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y) < 8;
      pointerStart = null;
      if (pause.getAttribute('aria-pressed') !== 'true') story.classList.remove('story-is-paused');
      if (tapped) nextStory(index);
    });
    function releasePointer() {
      pointerStart = null;
      if (pause.getAttribute('aria-pressed') !== 'true' && !story.classList.contains('story-is-closed')) story.classList.remove('story-is-paused');
    }
    story.addEventListener('pointercancel', releasePointer);
    story.addEventListener('pointerleave', releasePointer);
  });
})();
