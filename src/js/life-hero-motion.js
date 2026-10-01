/* Everyday cutout photos share a continuous rounded-rectangle orbit.
 * CSS supplies the stage geometry and static fallback. JavaScript owns the SVG
 * path, photo centers, and local rotation. Both motions use one paused clock.
 */
(() => {
  'use strict';

  function initialize(root) {
    if (root.dataset.heroMotionReady === 'true') return;
    const stage = root.querySelector('.life-hero-stage');
    const path = root.querySelector('[data-orbit-path]');
    const svg = root.querySelector('[data-orbit-svg]');
    const elements = Array.from(root.querySelectorAll('[data-hero-object]'));
    if (!stage || !path || !svg || !elements.length) return;
    root.dataset.heroMotionReady = 'true';

    const toggle = root.querySelector('[data-orbit-toggle]');
    const priceCard = root.querySelector('[data-hero-price]');
    const priceLabel = priceCard && priceCard.querySelector('[data-price-label-output]');
    const priceValue = priceCard && priceCard.querySelector('[data-price-value-output]');
    const priceCategory = priceCard && priceCard.querySelector('[data-price-category-output]');
    const priceInitials = priceCard && priceCard.querySelector('[data-price-initials-output]');
    const pricesEnabled = Boolean(priceCard && priceLabel && priceValue);
    const copy = root.querySelector('.life-hero-copy');
    const header = document.querySelector('.site-header');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = window.matchMedia('(max-width: 900px)');
    const wrap = value => ((value % 1) + 1) % 1;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const objects = elements.map((element, index) => {
      const value = element.getAttribute('data-orbit-phase');
      const spinDuration = Number(element.getAttribute('data-spin-duration'));
      return {
        element,
        trigger: pricesEnabled ? element.querySelector('[data-price-trigger]') : null,
        visual: pricesEnabled ? element.querySelector('.life-orbit-visual') : null,
        spinDuration: Number.isFinite(spinDuration) && spinDuration >= 10 ? spinDuration * 1000 : 36000,
        spinDirection: element.getAttribute('data-spin-direction') === '-1' ? -1 : 1,
        phase: value !== null && value.trim() !== '' && Number.isFinite(Number(value))
          ? wrap(Number(value)) : index / elements.length
      };
    });

    let geometry = null;
    let phase = 0;
    let activeTimeMs = 0;
    let frame = null;
    let previousTime = null;
    let inView = true;
    let userPaused = false;
    let activePrice = null;
    let pricePinned = false;
    let hoveredObject = null;
    let focusedObject = null;
    let cardHovered = false;
    let closeTimer = null;

    function measure() {
      const { width, height } = stage.getBoundingClientRect();
      if (width <= 0 || height <= 0) {
        geometry = null;
        return;
      }
      const style = window.getComputedStyle(stage);
      function setting(name, fallback) {
        const value = Number.parseFloat(style.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
      }
      // Match CSS's height-responsive object sizes on desktop. The compact
      // mobile band uses its own fixed geometry and opts out with reference 0.
      const referenceHeight = setting('--orbit-reference-height', 0);
      const orbitScale = referenceHeight > 0 ? Math.min(1, height / referenceHeight) : 1;
      const inset = clamp(setting('--orbit-inset', 90) * orbitScale, 0, width / 2);
      const band = setting('--orbit-band-height', 0);
      const availableHeight = band > 0 ? Math.min(band, height) : height;
      const left = inset;
      const right = width - inset;
      const top = clamp(setting('--orbit-top', 100) * orbitScale, 0, availableHeight);
      const bottom = clamp(availableHeight - setting('--orbit-bottom', 100) * orbitScale, top, availableHeight);
      const radius = clamp(setting('--orbit-radius', 180) * orbitScale, 0, Math.min(right - left, bottom - top) / 2);
      const horizontal = right - left - radius * 2;
      const vertical = bottom - top - radius * 2;
      const corner = Math.PI * radius / 2;
      const perimeter = 2 * (horizontal + vertical) + 4 * corner;
      if (perimeter <= 0) {
        geometry = null;
        return;
      }
      geometry = { left, right, top, bottom, radius, horizontal, vertical, corner, perimeter, bandHeight: availableHeight };
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      path.setAttribute('d', [
        `M ${left + radius} ${top}`,
        `H ${right - radius}`,
        `A ${radius} ${radius} 0 0 1 ${right} ${top + radius}`,
        `V ${bottom - radius}`,
        `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
        `H ${left + radius}`,
        `A ${radius} ${radius} 0 0 1 ${left} ${bottom - radius}`,
        `V ${top + radius}`,
        `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
        'Z'
      ].join(' '));
    }

    function pointAt(progress) {
      const { left, right, top, bottom, radius, horizontal, vertical, corner, perimeter } = geometry;
      let distance = wrap(progress) * perimeter;
      if (distance < horizontal) return { x: left + radius + distance, y: top };
      distance -= horizontal;
      if (distance < corner) return arc(right - radius, top + radius, -Math.PI / 2, distance);
      distance -= corner;
      if (distance < vertical) return { x: right, y: top + radius + distance };
      distance -= vertical;
      if (distance < corner) return arc(right - radius, bottom - radius, 0, distance);
      distance -= corner;
      if (distance < horizontal) return { x: right - radius - distance, y: bottom };
      distance -= horizontal;
      if (distance < corner) return arc(left + radius, bottom - radius, Math.PI / 2, distance);
      distance -= corner;
      if (distance < vertical) return { x: left, y: bottom - radius - distance };
      distance -= vertical;
      return arc(left + radius, top + radius, Math.PI, distance);

      function arc(x, y, start, length) {
        const angle = start + (radius > 0 ? length / radius : 0);
        return { x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle) };
      }
    }

    function render() {
      if (!geometry) return;
      objects.forEach(({ element, phase: initialPhase, spinDuration, spinDirection }) => {
        const position = initialPhase + (reducedMotion.matches ? 0 : phase);
        const point = pointAt(position);
        const turn = reducedMotion.matches ? 0 : Math.sin(position * Math.PI * 2) * 3;
        // The self-spin clock is independent of orbit laps and responsive speed.
        const spinPhase = reducedMotion.matches ? 0 : wrap(activeTimeMs / spinDuration);
        const spin = spinPhase * 360 * spinDirection;
        const tiltX = reducedMotion.matches ? 0 : Math.sin(spinPhase * Math.PI * 2) * 6;
        const tiltY = reducedMotion.matches ? 0 : Math.sin(spinPhase * Math.PI * 2 + initialPhase * Math.PI * 2) * 12;
        element.style.setProperty('--orbit-x', `${point.x.toFixed(3)}px`);
        element.style.setProperty('--orbit-y', `${point.y.toFixed(3)}px`);
        element.style.setProperty('--orbit-turn', `${turn.toFixed(3)}deg`);
        element.style.setProperty('--object-spin', `${spin.toFixed(3)}deg`);
        element.style.setProperty('--object-tilt-x', `${tiltX.toFixed(3)}deg`);
        element.style.setProperty('--object-tilt-y', `${tiltY.toFixed(3)}deg`);
      });
      if (stage.dataset.orbitReady !== 'true') stage.dataset.orbitReady = 'true';
    }

    function cancelPriceClose() {
      if (closeTimer !== null) window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    function closePrice() {
      cancelPriceClose();
      if (!activePrice) return;
      activePrice.trigger.setAttribute('aria-expanded', 'false');
      activePrice.trigger.removeAttribute('aria-describedby');
      delete activePrice.element.dataset.priceActive;
      activePrice = null;
      pricePinned = false;
      cardHovered = false;
      priceCard.hidden = true;
      window.removeEventListener('scroll', closePrice);
      // Focus stays on the trigger. Only a new input event can reopen its price.
      synchronize();
    }

    function schedulePriceClose() {
      cancelPriceClose();
      if (!activePrice || pricePinned || cardHovered || hoveredObject === activePrice || focusedObject === activePrice) return;
      closeTimer = window.setTimeout(() => {
        closeTimer = null;
        if (!pricePinned && !cardHovered && hoveredObject !== activePrice && focusedObject !== activePrice) closePrice();
      }, 180);
    }

    function positionPrice() {
      if (!activePrice || !geometry) return false;
      // These layout reads happen only when opening or refreshing the card;
      // the shared animation clock is stopped while the card is visible.
      const stageRect = stage.getBoundingClientRect();
      const visualRect = (activePrice.visual || activePrice.element).getBoundingClientRect();
      const cardRect = priceCard.getBoundingClientRect();
      const copyRect = copy && copy.getBoundingClientRect();
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      const padding = 8;
      const gap = 12;
      const minX = Math.max(padding, padding - stageRect.left);
      const maxX = Math.min(stageRect.width, window.innerWidth - stageRect.left) - padding - cardRect.width;
      const minY = Math.max(padding, headerBottom + padding - stageRect.top);
      const maxY = Math.min(stageRect.height, geometry.bandHeight, window.innerHeight - stageRect.top) - padding - cardRect.height;
      if (maxX < minX || maxY < minY) return false;
      const anchor = {
        left: visualRect.left - stageRect.left,
        right: visualRect.right - stageRect.left,
        top: visualRect.top - stageRect.top,
        bottom: visualRect.bottom - stageRect.top
      };
      const centerX = (anchor.left + anchor.right) / 2;
      const centerY = (anchor.top + anchor.bottom) / 2;
      const candidates = [
        { x: anchor.right + gap, y: centerY - cardRect.height / 2 },
        { x: anchor.left - gap - cardRect.width, y: centerY - cardRect.height / 2 },
        { x: centerX - cardRect.width / 2, y: anchor.top - gap - cardRect.height },
        { x: centerX - cardRect.width / 2, y: anchor.bottom + gap }
      ];
      const copyBounds = copyRect && {
        left: copyRect.left - stageRect.left - padding,
        right: copyRect.right - stageRect.left + padding,
        top: copyRect.top - stageRect.top - padding,
        bottom: copyRect.bottom - stageRect.top + padding
      };
      function overlap(point, bounds) {
        if (!bounds) return 0;
        return Math.max(0, Math.min(point.x + cardRect.width, bounds.right) - Math.max(point.x, bounds.left))
          * Math.max(0, Math.min(point.y + cardRect.height, bounds.bottom) - Math.max(point.y, bounds.top));
      }
      let chosen = candidates.find(point => point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
        && overlap(point, copyBounds) === 0 && overlap(point, anchor) === 0);
      if (!chosen) {
        // Clamping can create overlaps. Re-score after clamping, with copy
        // clearance first; the corners also provide room on narrow screens.
        const alternatives = candidates.map(point => ({ x: clamp(point.x, minX, maxX), y: clamp(point.y, minY, maxY) }));
        alternatives.push({ x: minX, y: minY }, { x: maxX, y: minY }, { x: minX, y: maxY }, { x: maxX, y: maxY });
        const score = point => overlap(point, copyBounds) * 1000 + overlap(point, anchor) * 10
          + Math.hypot(point.x + cardRect.width / 2 - centerX, point.y + cardRect.height / 2 - centerY);
        chosen = alternatives.reduce((best, point) => score(point) < score(best) ? point : best);
      }
      priceCard.style.setProperty('--price-x', `${chosen.x.toFixed(3)}px`);
      priceCard.style.setProperty('--price-y', `${chosen.y.toFixed(3)}px`);
      return true;
    }

    function openPrice(object) {
      if (!object.trigger || !geometry) return;
      cancelPriceClose();
      if (activePrice !== object) {
        if (activePrice) {
          activePrice.trigger.setAttribute('aria-expanded', 'false');
          activePrice.trigger.removeAttribute('aria-describedby');
          delete activePrice.element.dataset.priceActive;
        }
        activePrice = object;
        pricePinned = false;
        cardHovered = false;
      }
      priceLabel.textContent = object.element.getAttribute('data-price-label') || '';
      priceValue.textContent = object.element.getAttribute('data-price-value') || '';
      if (priceCategory) priceCategory.textContent = object.element.getAttribute('data-price-category') || '';
      if (priceInitials) {
        priceInitials.textContent = object.element.getAttribute('data-price-initials') || '';
        priceInitials.style.setProperty('--merchant-color', object.element.getAttribute('data-price-color') || '#8b5cf6');
      }
      priceCard.hidden = false;
      object.trigger.setAttribute('aria-expanded', 'true');
      object.trigger.setAttribute('aria-describedby', priceCard.id);
      object.element.dataset.priceActive = 'true';
      synchronize();
      if (!positionPrice()) {
        closePrice();
        return;
      }
      window.addEventListener('scroll', closePrice, { passive: true });
    }

    function initializePrices() {
      if (!pricesEnabled) return;
      objects.forEach(object => {
        if (!object.trigger) return;
        object.trigger.disabled = false;
        object.trigger.addEventListener('pointerenter', event => {
          if (event.pointerType === 'touch') return;
          hoveredObject = object;
          openPrice(object);
        });
        object.trigger.addEventListener('pointerleave', event => {
          if (event.pointerType === 'touch') return;
          if (hoveredObject === object) hoveredObject = null;
          schedulePriceClose();
        });
        object.trigger.addEventListener('focus', () => {
          focusedObject = object;
          openPrice(object);
        });
        object.trigger.addEventListener('blur', () => {
          if (focusedObject === object) focusedObject = null;
          schedulePriceClose();
        });
        object.trigger.addEventListener('click', () => {
          if (activePrice === object && pricePinned) closePrice();
          else {
            openPrice(object);
            pricePinned = activePrice === object;
          }
        });
      });
      priceCard.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch' || !activePrice) return;
        cardHovered = true;
        cancelPriceClose();
      });
      priceCard.addEventListener('pointerleave', event => {
        if (event.pointerType === 'touch') return;
        cardHovered = false;
        schedulePriceClose();
      });
      function dismissOutside(event) {
        if (activePrice && !activePrice.trigger.contains(event.target) && !priceCard.contains(event.target)) closePrice();
      }
      document.addEventListener('pointerdown', dismissOutside);
      document.addEventListener('click', dismissOutside);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && activePrice) {
          event.preventDefault();
          closePrice();
        }
      });
    }

    function shouldRun() {
      return geometry !== null && inView && !document.hidden && !reducedMotion.matches && !userPaused && activePrice === null;
    }

    function tick(timestamp) {
      frame = null;
      if (!shouldRun()) {
        previousTime = null;
        return;
      }
      if (previousTime !== null) {
        const delta = clamp(timestamp - previousTime, 0, 100);
        phase = wrap(phase + delta / (smallScreen.matches ? 70000 : 96000));
        activeTimeMs += delta;
      }
      previousTime = timestamp;
      render();
      frame = window.requestAnimationFrame(tick);
    }

    function synchronize() {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      if (toggle) {
        toggle.hidden = reducedMotion.matches || geometry === null;
        toggle.dataset.paused = String(userPaused);
        toggle.setAttribute('aria-pressed', String(userPaused));
        const label = userPaused ? 'Resume animation' : 'Pause animation';
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('title', label);
      }
      if (shouldRun()) frame = window.requestAnimationFrame(tick);
    }

    function refresh() {
      measure();
      render();
      if (activePrice && !positionPrice()) closePrice();
      synchronize();
    }

    function preferenceChanged() {
      if (reducedMotion.matches) {
        phase = 0;
        activeTimeMs = 0;
      }
      refresh();
    }

    function watchPreference(query) {
      if (query.addEventListener) query.addEventListener('change', preferenceChanged);
      else query.addListener(preferenceChanged);
    }

    if (toggle) toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      synchronize();
    });
    watchPreference(reducedMotion);
    watchPreference(smallScreen);
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', synchronize);
    if ('ResizeObserver' in window) new ResizeObserver(refresh).observe(stage);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        synchronize();
      });
      observer.observe(stage);
    }
    refresh();
    initializePrices();
  }

  function start() {
    document.querySelectorAll('[data-life-hero]').forEach(initialize);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
