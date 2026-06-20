/* ---------- Starfield background ---------- */
(function () {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      d: (Math.random() - 0.5) * 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.a += s.d * 0.02;
      if (s.a < 0.1) s.a = 0.1;
      if (s.a > 0.8) s.a = 0.8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(199, 188, 255, ${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ---------- Theme toggle ---------- */
(function () {
  const btn = document.getElementById('themeToggleBtn');
  const stored = localStorage.getItem('hub-theme');
  if (stored === 'light') document.documentElement.classList.add('light-theme');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    localStorage.setItem(
      'hub-theme',
      document.documentElement.classList.contains('light-theme') ? 'light' : 'dark'
    );
  });
})();

/* ---------- Guides modal ---------- */
(function () {
  const openBtns = document.querySelectorAll('[data-open="guides"]');
  const modal = document.getElementById('guidesModal');
  const closeBtn = document.getElementById('guidesClose');
  if (!modal) return;

  function open() {
    modal.classList.add('open');
  }
  function close() {
    modal.classList.remove('open');
  }

  openBtns.forEach((b) => b.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

/* ---------- Search popup ---------- */
(function () {
  const SEARCH_INDEX = [
    { title: 'Home', url: 'index.html', tag: 'page' },
    { title: 'Apps & Tools', url: 'apps.html', tag: 'page' },
    { title: 'Saving Documents to the Shared Drive', url: 'guide-1.html', tag: 'guide' }
  ];

  const openBtns = document.querySelectorAll('[data-open="search"]');
  const modal = document.getElementById('searchModal');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!modal) return;

  function render(list) {
    results.innerHTML = '';
    if (!list.length) {
      results.innerHTML = '<div class="modal-empty">No matches.</div>';
      return;
    }
    list.forEach((item) => {
      const a = document.createElement('a');
      a.href = item.url;
      a.innerHTML = `<span>${item.title}</span><span class="res-tag">${item.tag}</span>`;
      results.appendChild(a);
    });
  }

  function filter() {
    const q = input.value.trim().toLowerCase();
    const list = q
      ? SEARCH_INDEX.filter((i) => i.title.toLowerCase().includes(q))
      : SEARCH_INDEX;
    render(list);
  }

  function open() {
    modal.classList.add('open');
    render(SEARCH_INDEX);
    input.value = '';
    setTimeout(() => input.focus(), 10);
  }
  function close() {
    modal.classList.remove('open');
  }

  openBtns.forEach((b) => b.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  if (input) input.addEventListener('input', filter);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement !== input) {
      e.preventDefault();
      open();
    }
  });
})();
