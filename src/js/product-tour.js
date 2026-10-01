/** Accessible product tabs; all panels remain readable without JavaScript. */
(function () {
  "use strict";

  const featureTabs = {
    "feature-home": "overview",
    "feature-categories": "categories",
    "feature-insights": "insights",
    "feature-recurring": "bills"
  };

  function tabForHash(hash) {
    try {
      return featureTabs[decodeURIComponent(hash.replace(/^#/, ""))];
    } catch (_) {
      return undefined;
    }
  }

  function initTour(root) {
    const tablist = root.querySelector(".tour-tabs");
    if (!tablist) return;

    const panels = new Map(Array.from(root.querySelectorAll("[data-tour-panel]"))
      .map(function (panel) { return [panel.dataset.tourPanel, panel]; }));
    const tabs = Array.from(tablist.querySelectorAll("button[data-tour-tab]"))
      .filter(function (tab) { return panels.has(tab.dataset.tourTab); });
    if (!tabs.length) return;

    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-orientation", "horizontal");
    tabs.forEach(function (tab) {
      const panel = panels.get(tab.dataset.tourTab);
      tab.disabled = false;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
    });

    /** Switching tabs changes content without moving focus into the panel. */
    function activate(key, focusTab) {
      const active = tabs.find(function (tab) { return tab.dataset.tourTab === key; });
      if (!active) return;
      tabs.forEach(function (tab) {
        const selected = tab === active;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels.get(tab.dataset.tourTab).hidden = !selected;
      });
      if (focusTab) active.focus({ preventScroll: true });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab.dataset.tourTab, false);
      });
      tab.addEventListener("keydown", function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next].dataset.tourTab, true);
      });
    });

    // Reveal the anchor destination before the browser performs its native jump.
    document.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.altKey ||
          event.ctrlKey || event.metaKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!link || link.hasAttribute("download") ||
          (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin ||
          destination.pathname !== window.location.pathname ||
          destination.search !== window.location.search) return;
      const key = tabForHash(destination.hash);
      if (key) activate(key, false);
    }, true);

    window.addEventListener("hashchange", function () {
      const key = tabForHash(window.location.hash);
      if (key) activate(key, false);
    });

    root.classList.add("tour-ready");
    activate(tabForHash(window.location.hash) || tabs[0].dataset.tourTab, false);
  }

  function init() {
    document.querySelectorAll(".product-tour").forEach(initTour);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
