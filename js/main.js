// Home page behaviour: theme toggle, side-nav highlight, stacking project
// folders, timeline year tabs and copy-to-clipboard.
(function () {
  'use strict';

  const root = document.documentElement;

  // ---------- Light / Dark ----------
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const dark = root.classList.toggle('theme-dark');
      toggle.setAttribute('aria-pressed', String(dark));
    });
  }

  // ---------- Side nav: highlight the section in view ----------
  const sectionIds = ['top', 'projects', 'timeline', 'contact'];
  const navLinks = document.querySelectorAll('[data-nav]');
  let currentSection = null;

  function updateNav() {
    let cur = 'top';
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id;
    }
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = 'contact';
    if (cur === currentSection) return;
    currentSection = cur;
    navLinks.forEach((a) => {
      if (a.dataset.nav === cur) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.dataset.nav;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ---------- Project folders: sticky stack ----------
  // The heading sticks first; each folder then sticks one tab-step (74px)
  // below the previous, so earlier titles stay visible. The whole stack is
  // centred vertically once fully stacked.
  const HEADER_H = 172;   // sticky heading height
  const FIRST_TOP = 188;  // first folder's offset below the stack's top
  const STEP = 74;        // tab step between stacked folders
  const OPEN_GAP = 40;    // gap between folders while open

  const stack = document.querySelector('[data-stack]');
  const folders = stack ? Array.from(stack.querySelectorAll('.proj')) : [];

  function layoutStack() {
    if (!folders.length) return;
    const n = folders.length;
    const cardH = Math.round(folders[n - 1].getBoundingClientRect().height);
    const stackH = FIRST_TOP + (n - 1) * STEP + (cardH || 380);
    const stackOff = Math.max(0, Math.round((window.innerHeight - stackH) / 2));
    const hdrMb = cardH ? cardH + FIRST_TOP + (n - 1) * STEP - HEADER_H : 16;

    stack.style.setProperty('--hdr-top', stackOff + 'px');
    stack.style.setProperty('--hdr-mb', hdrMb + 'px');
    folders.forEach((el, i) => {
      el.style.setProperty('--top', (stackOff + FIRST_TOP + i * STEP) + 'px');
      el.style.setProperty('--mt', i === 0 ? (16 - hdrMb) + 'px' : (OPEN_GAP - (n - i) * STEP) + 'px');
      el.style.setProperty('--mb', ((n - 1 - i) * STEP) + 'px');
    });
  }

  if (stack) {
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layoutStack); };
    window.addEventListener('resize', schedule);
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(schedule);
      folders.forEach((el) => ro.observe(el));
    }
    layoutStack();
  }

  // ---------- Timeline years ----------
  const yearBtns = Array.from(document.querySelectorAll('.year'));
  const panel2017 = document.querySelector('[data-year-panel="2017"]');
  const panelOther = document.querySelector('[data-year-panel="other"]');
  const yearLabel = document.querySelector('[data-year-label]');
  let year = 0;

  function selectYear(i) {
    year = Math.max(0, Math.min(yearBtns.length - 1, i));
    yearBtns.forEach((b, k) => b.setAttribute('aria-selected', String(k === year)));
    const is2017 = year === 0;
    panel2017.hidden = !is2017;
    panelOther.hidden = is2017;
    if (!is2017) yearLabel.textContent = yearBtns[year].textContent.trim();
  }

  if (yearBtns.length && panel2017 && panelOther) {
    yearBtns.forEach((b, i) => b.addEventListener('click', () => selectYear(i)));
    document.querySelector('[data-year-prev]').addEventListener('click', () => selectYear(year - 1));
    document.querySelector('[data-year-next]').addEventListener('click', () => selectYear(year + 1));
  }

  // ---------- Copy email ----------
  const copyBtn = document.querySelector('[data-copy-email]');
  if (copyBtn) {
    let t = 0;
    copyBtn.addEventListener('click', () => {
      try { navigator.clipboard.writeText(copyBtn.dataset.copyEmail); } catch (e) { /* clipboard unavailable */ }
      copyBtn.textContent = 'Copied';
      clearTimeout(t);
      t = setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 1600);
    });
  }
})();
