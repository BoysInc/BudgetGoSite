/*
 * Page localization. Text is looked up by its English markup, so the HTML stays
 * the single readable source and untranslated strings simply stay English.
 * The dictionary scripts are written in synchronously so translation lands
 * before the deferred motion scripts split headings into words.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'budgetgo-language';
  const LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'zh', name: '中文', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'bn', name: 'বাংলা', dir: 'ltr' },
    { code: 'pt', name: 'Português', dir: 'ltr' },
    { code: 'ru', name: 'Русский', dir: 'ltr' },
    { code: 'ur', name: 'اردو', dir: 'rtl' },
    { code: 'lt', name: 'Lietuvių', dir: 'ltr' }
  ];
  const ATTRIBUTES = ['alt', 'aria-label', 'title', 'placeholder'];
  // Elements whose whole content is text plus these inline tags are one phrase.
  const INLINE = new Set(['A', 'EM', 'STRONG', 'B', 'I', 'BR', 'CODE', 'SPAN', 'SMALL']);

  function find(code) {
    return LANGUAGES.find(function (lang) { return lang.code === code; });
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  }

  function store(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (error) { /* private mode: the choice just won't persist */ }
  }

  /** Stored choice first, then the visitor's browser language, then English. */
  function pickLanguage() {
    const stored = readStored();
    if (stored && find(stored)) return stored;
    const preferred = (navigator.languages || [navigator.language || 'en']);
    for (let i = 0; i < preferred.length; i += 1) {
      const base = String(preferred[i]).toLowerCase().split('-')[0];
      if (find(base)) return base;
    }
    return 'en';
  }

  /** Collapses whitespace so source indentation never changes a lookup key. */
  function normalize(markup) {
    return markup.replace(/\s+/g, ' ').trim();
  }

  function hasOwnText(element) {
    return Array.from(element.childNodes).some(function (node) {
      return node.nodeType === Node.TEXT_NODE && /\p{L}/u.test(node.nodeValue);
    });
  }

  function isPhrase(element) {
    if (!/\p{L}/u.test(element.textContent)) return false;
    // A container of icon-bearing links is not one phrase; its links are.
    if (element.querySelector('svg') && !hasOwnText(element)) return false;
    return Array.from(element.querySelectorAll('*')).every(function (child) {
      return INLINE.has(child.tagName) || child.closest('svg');
    });
  }

  /** Button icons are decoration: they stay out of the key and are put back after translating. */
  function markupOf(element) {
    if (!element.querySelector('svg')) return normalize(element.innerHTML);
    const clone = element.cloneNode(true);
    clone.querySelectorAll('svg').forEach(function (icon) { icon.remove(); });
    return normalize(clone.innerHTML);
  }

  function replaceMarkup(element, markup) {
    const icons = Array.from(element.children).filter(function (child) { return child.matches('svg'); });
    element.innerHTML = markup;
    icons.forEach(function (icon) { element.append(icon); });
  }

  /** Visits the outermost phrase elements; decorative reels are skipped. */
  function phrases(root) {
    const found = [];
    (function walk(node) {
      Array.from(node.children).forEach(function (child) {
        if (child.closest('svg, script, style, [data-no-i18n]')) return;
        if (isPhrase(child)) found.push(child);
        else walk(child);
      });
    })(root);
    return found;
  }

  let activeDictionary = {};

  /** Translates a string set from script (labels, status messages); unknown text passes through. */
  function t(text) {
    return activeDictionary[text] || text;
  }

  /** Translates leftover text nodes one by one, for copy mixed in with icons or inline numbers. */
  function translateTextNodes(dictionary, done) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, svg, [data-no-i18n]')) return;
      for (let el = parent; el; el = el.parentElement) if (done.has(el)) return;
      const key = normalize(node.nodeValue);
      const translated = key && dictionary[key];
      if (translated) node.nodeValue = node.nodeValue.match(/^\s*/)[0] + translated + node.nodeValue.match(/\s*$/)[0];
    });
  }

  function apply(dictionary, lang) {
    activeDictionary = dictionary;
    const done = new WeakSet();
    phrases(document.body).forEach(function (element) {
      const translated = dictionary[markupOf(element)];
      if (translated) {
        replaceMarkup(element, translated);
        done.add(element);
      }
    });
    translateTextNodes(dictionary, done);
    document.querySelectorAll(ATTRIBUTES.map(function (name) { return '[' + name + ']'; }).join(',')).forEach(function (element) {
      ATTRIBUTES.forEach(function (name) {
        const translated = dictionary[normalize(element.getAttribute(name) || '')];
        if (translated) element.setAttribute(name, translated);
      });
    });
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(function (meta) {
      const translated = dictionary[normalize(meta.content)];
      if (translated) meta.content = translated;
    });
    const title = dictionary[normalize(document.title)];
    if (title) document.title = title;
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  }

  function buildSwitcher(current, dictionary) {
    const host = document.querySelector('.footer-bottom');
    if (!host) return;
    const label = document.createElement('label');
    label.className = 'lang-switch';
    const text = document.createElement('span');
    text.className = 'lang-switch__label';
    text.textContent = (dictionary && dictionary.Language) || 'Language';
    const select = document.createElement('select');
    LANGUAGES.forEach(function (lang) {
      const option = new Option(lang.name, lang.code, false, lang.code === current);
      option.lang = lang.code;
      select.add(option);
    });
    select.addEventListener('change', function () {
      store(select.value);
      location.reload();
    });
    label.append(text, select);
    host.append(label);
  }

  const current = pickLanguage();
  const lang = find(current);

  window.BudgetGoI18n = {
    languages: LANGUAGES,
    /** Called by each dictionary script as it loads. */
    register: function (dictionary) {
      apply(dictionary, lang);
      buildSwitcher(current, dictionary);
    },
    t: t,
    phrases: phrases,
    markupOf: markupOf
  };

  if (current === 'en') {
    buildSwitcher('en', null);
  } else {
    document.write('<script src="src/data/i18n/' + current + '.js"><\/script>');
  }
})();
