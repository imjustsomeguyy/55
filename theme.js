(function () {
  const STORAGE_KEY = 'hub-theme';

  const THEMES = [
    // --- Dark ---
    {
      id: 'void',
      name: 'Void',
      desc: 'deep dark',
      dot: '#7c6dfa',
      dot2: '#07070d',
      section: 'dark',
    },
    {
      id: 'midnight',
      name: 'Midnight',
      desc: 'dark blue',
      dot: '#38bdf8',
      dot2: '#020818',
      section: 'dark',
    },
    {
      id: 'ember',
      name: 'Ember',
      desc: 'dark warm',
      dot: '#f97316',
      dot2: '#0d0700',
      section: 'dark',
    },
    {
      id: 'forest',
      name: 'Forest',
      desc: 'dark green',
      dot: '#4ade80',
      dot2: '#020d06',
      section: 'dark',
    },
    {
      id: 'rose',
      name: 'Rose',
      desc: 'dark pink',
      dot: '#f472b6',
      dot2: '#0d0208',
      section: 'dark',
    },
    {
      id: 'mocha',
      name: 'Mocha',
      desc: 'warm coffee',
      dot: '#c9a96e',
      dot2: '#100a06',
      section: 'dark',
    },
    {
      id: 'dusk',
      name: 'Dusk',
      desc: 'mauve slate',
      dot: '#a78bfa',
      dot2: '#0e0c14',
      section: 'dark',
    },
    // --- Light ---
    {
      id: 'paper',
      name: 'Paper',
      desc: 'light warm',
      dot: '#7c3aed',
      dot2: '#faf8f4',
      section: 'light',
    },
    {
      id: 'arctic',
      name: 'Arctic',
      desc: 'light blue',
      dot: '#0369a1',
      dot2: '#f0f7ff',
      section: 'light',
    },
    {
      id: 'mint',
      name: 'Mint',
      desc: 'light green',
      dot: '#059669',
      dot2: '#f0faf4',
      section: 'light',
    },
    // --- Animated ---
    {
      id: 'stars',
      name: 'Stars',
      desc: 'animated',
      dot: '#c4b5fd',
      dot2: '#000008',
      section: 'animated',
      badge: 'live',
    },
    {
      id: 'neon',
      name: 'Neon Tokyo',
      desc: 'animated',
      dot: '#f72585',
      dot2: '#06010f',
      section: 'animated',
      badge: 'live',
    },
    {
      id: 'aurora',
      name: 'Aurora',
      desc: 'animated',
      dot: '#67e8f9',
      dot2: '#020510',
      section: 'animated',
      badge: 'live',
    },
    {
      id: 'deepsea',
      name: 'Deep Sea',
      desc: 'animated',
      dot: '#00d4ff',
      dot2: '#000810',
      section: 'animated',
      badge: 'live',
    },
  ];

  // ── Stars canvas ──────────────────────────────────────────
  let starsInitialised = false;

  function initStars() {
    if (starsInitialised) return;
    starsInitialised = true;
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function makeStars(n) {
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.2,
          a: Math.random(),
          speed: Math.random() * 0.004 + 0.001,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let raf;
    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,255,${alpha * s.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    makeStars(160);
    window.addEventListener('resize', () => { resize(); makeStars(160); });
    raf = requestAnimationFrame(draw);
  }

  function stopStars() {
    // canvas hidden by CSS; no need to cancel RAF — negligible when hidden
  }

  // ── Apply theme ───────────────────────────────────────────
  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem(STORAGE_KEY, id);

    if (id === 'stars') {
      initStars();
    }

    // Update active swatch
    document.querySelectorAll('.theme-swatch').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === id);
    });
  }

  // ── Build panel HTML ──────────────────────────────────────
  function buildPanel() {
    const sections = [
      { key: 'dark',     label: 'Dark' },
      { key: 'light',    label: 'Light' },
      { key: 'animated', label: 'Animated' },
    ];

    let html = `
      <div class="theme-panel-overlay" id="themePanelOverlay">
        <div class="theme-panel" role="dialog" aria-modal="true" aria-label="Choose theme">
          <div class="theme-panel-head">
            <span>Themes</span>
            <button class="theme-panel-close" id="themePanelClose" aria-label="Close">&times;</button>
          </div>`;

    for (const sec of sections) {
      const items = THEMES.filter(t => t.section === sec.key);
      if (!items.length) continue;
      html += `<div class="theme-section-label">${sec.label}</div><div class="theme-grid">`;
      for (const t of items) {
        html += `
          <button class="theme-swatch" data-theme="${t.id}" type="button">
            <span class="swatch-dot" style="background:linear-gradient(135deg,${t.dot} 40%,${t.dot2} 100%)"></span>
            <span class="swatch-info">
              <span class="swatch-name">${t.name}</span>
              <span class="swatch-desc">${t.desc}</span>
            </span>
            ${t.badge ? `<span class="swatch-stars-badge">${t.badge}</span>` : ''}
          </button>`;
      }
      html += `</div>`;
    }

    html += `</div></div>`;
    return html;
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    // Inject panel
    document.body.insertAdjacentHTML('beforeend', buildPanel());

    const overlay   = document.getElementById('themePanelOverlay');
    const closeBtn  = document.getElementById('themePanelClose');
    const toggleBtn = document.getElementById('themeToggleBtn');

    function openPanel() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closePanel() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      toggleBtn && toggleBtn.focus();
    }

    toggleBtn && toggleBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closePanel();
    });

    // Swatch clicks
    overlay.addEventListener('click', e => {
      const swatch = e.target.closest('.theme-swatch');
      if (swatch) {
        applyTheme(swatch.dataset.theme);
        closePanel();
      }
    });

    // Restore saved theme
    const saved = localStorage.getItem(STORAGE_KEY) || 'void';
    applyTheme(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
