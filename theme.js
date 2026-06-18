// ── Theme system ──────────────────────────────────────────
(function () {
  const THEMES = [
    { id: 'void',     name: 'Void',     desc: 'deep dark',    dot: ['#07070d','#7c6dfa'],  group: 'dark' },
    { id: 'midnight', name: 'Midnight', desc: 'dark blue',    dot: ['#020818','#38bdf8'],  group: 'dark' },
    { id: 'ember',    name: 'Ember',    desc: 'dark warm',    dot: ['#0d0700','#f97316'],  group: 'dark' },
    { id: 'forest',   name: 'Forest',   desc: 'dark green',   dot: ['#020d06','#4ade80'],  group: 'dark' },
    { id: 'rose',     name: 'Rose',     desc: 'dark pink',    dot: ['#0d0208','#f472b6'],  group: 'dark' },
    { id: 'stars',    name: 'Stars',    desc: 'animated ✦',   dot: ['#000008','#c4b5fd'],  group: 'dark', special: true },
    { id: 'paper',    name: 'Paper',    desc: 'light warm',   dot: ['#faf8f4','#7c3aed'],  group: 'light' },
    { id: 'arctic',   name: 'Arctic',   desc: 'light blue',   dot: ['#f0f7ff','#0369a1'],  group: 'light' },
    { id: 'mint',     name: 'Mint',     desc: 'light green',  dot: ['#f0faf4','#059669'],  group: 'light' },
  ];

  const STORAGE_KEY = 'hub-theme';

  // ── Stars canvas ──────────────────────────────────────
  let starsAnimFrame = null;

  function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 200;
    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.00008 + 0.00002,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      color: Math.random() > 0.85 ? `hsl(${220 + Math.random() * 60},80%,90%)` : '#ffffff',
    }));

    // Occasional shooting star
    let shooters = [];
    function maybeAddShooter() {
      if (Math.random() < 0.004) {
        shooters.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: (Math.random() * 4 + 3) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 3 + 1.5,
          life: 1,
          len: Math.random() * 60 + 40,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width, H = canvas.height;

      // Stars
      stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        s.y -= s.speed;
        if (s.y < 0) { s.y = 1; s.x = Math.random(); }

        const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });

      // Shooting stars
      maybeAddShooter();
      shooters = shooters.filter(s => s.life > 0);
      shooters.forEach(s => {
        ctx.save();
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * s.len / 10, s.y - s.vy * s.len / 10);
        grad.addColorStop(0, `rgba(200,180,255,${s.life * 0.9})`);
        grad.addColorStop(1, 'rgba(200,180,255,0)');
        ctx.globalAlpha = s.life;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.len / 10), s.y - s.vy * (s.len / 10));
        ctx.stroke();
        ctx.restore();
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.018;
      });

      ctx.globalAlpha = 1;
      starsAnimFrame = requestAnimationFrame(draw);
    }

    draw();
  }

  function stopStars() {
    if (starsAnimFrame) { cancelAnimationFrame(starsAnimFrame); starsAnimFrame = null; }
  }

  // ── Apply theme ────────────────────────────────────────
  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id === 'void' ? '' : id);
    localStorage.setItem(STORAGE_KEY, id);

    // Stars
    stopStars();
    if (id === 'stars') {
      setTimeout(initStars, 50);
    }

    // Update active swatch
    document.querySelectorAll('.theme-swatch').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === id);
    });

    // Update button label
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      const t = THEMES.find(t => t.id === id);
      btn.querySelector('.theme-btn-label').textContent = t ? t.name : 'Theme';
    }
  }

  // ── Build picker panel ──────────────────────────────────
  function buildPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'theme-panel-overlay';
    overlay.id = 'themePanelOverlay';

    const darkThemes = THEMES.filter(t => t.group === 'dark');
    const lightThemes = THEMES.filter(t => t.group === 'light');

    function renderSwatches(list) {
      return list.map(t => `
        <button class="theme-swatch" data-theme="${t.id}" title="${t.name}">
          <span class="swatch-dot" style="background:linear-gradient(135deg,${t.dot[0]} 50%,${t.dot[1]} 100%)"></span>
          <span class="swatch-info">
            <span class="swatch-name">${t.name}</span>
            <span class="swatch-desc">${t.desc}</span>
          </span>
          ${t.special ? '<span class="swatch-stars-badge">live</span>' : ''}
        </button>
      `).join('');
    }

    overlay.innerHTML = `
      <div class="theme-panel">
        <div class="theme-panel-head">
          <span>Choose Theme</span>
          <button class="theme-panel-close" id="themePanelClose" aria-label="Close">✕</button>
        </div>
        <div class="theme-section-label">Dark</div>
        <div class="theme-grid">${renderSwatches(darkThemes)}</div>
        <div class="theme-section-label">Light</div>
        <div class="theme-grid">${renderSwatches(lightThemes)}</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Events
    overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
    document.getElementById('themePanelClose').addEventListener('click', closePanel);

    overlay.querySelectorAll('.theme-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        closePanel();
      });
    });
  }

  function openPanel() {
    document.getElementById('themePanelOverlay').classList.add('open');
  }

  function closePanel() {
    document.getElementById('themePanelOverlay').classList.remove('open');
  }

  // ── Init ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildPanel();

    const saved = localStorage.getItem(STORAGE_KEY) || 'void';
    applyTheme(saved);

    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.addEventListener('click', openPanel);

    // Escape key closes panel
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });
  });
})();
