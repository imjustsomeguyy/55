/* theme.js — Jay's Method Hub
   Handles: theme panel injection, localStorage persistence,
   animated canvas backgrounds (Stars, Neon Tokyo, Aurora, Deep Sea),
   and a dynamic favicon that matches the active theme's accent colors.
   ----------------------------------------------------------------- */
(function () {
  'use strict';

  /* ── THEME DEFINITIONS ───────────────────────────────────────── */
  const THEMES = [
    { id: 'stars',      name: 'Stars',       swatch: ['#050810','#a78bfa'], animated: true  },
    { id: 'dark',       name: 'Dark',        swatch: ['#0d0f14','#6c8aff'], animated: false },
    { id: 'light',      name: 'Light',       swatch: ['#f5f6fa','#4f6ff8'], animated: false },
    { id: 'ocean',      name: 'Ocean',       swatch: ['#060e1a','#38bdf8'], animated: false },
    { id: 'mint',       name: 'Mint',        swatch: ['#f2faf5','#059669'], animated: false },
    { id: 'sunset',     name: 'Sunset',      swatch: ['#100a0a','#fb923c'], animated: false },
    { id: 'crimson',    name: 'Crimson',     swatch: ['#0e0609','#ef4444'], animated: false },
    { id: 'forest',     name: 'Forest',      swatch: ['#06100a','#4ade80'], animated: false },
    { id: 'volcanic',   name: 'Volcanic',    swatch: ['#0e0800','#eab308'], animated: false },
    { id: 'arctic',     name: 'Arctic',      swatch: ['#f0f7ff','#3b82f6'], animated: false },
    { id: 'sakura',     name: 'Sakura',      swatch: ['#fdf5f8','#ec4899'], animated: false },
    { id: 'void',       name: 'Void',        swatch: ['#000000','#ffffff'], animated: false },
    { id: 'neon-tokyo', name: 'Neon Tokyo',  swatch: ['#04000e','#00ffe6'], animated: true  },
    { id: 'aurora',     name: 'Aurora',      swatch: ['#030a10','#34d399'], animated: true  },
    { id: 'deep-sea',   name: 'Deep Sea',    swatch: ['#000810','#00bfff'], animated: true  },
  ];

  const DEFAULT_THEME = 'stars';
  const LS_KEY = 'hub-theme';

  /* ── STATE ───────────────────────────────────────────────────── */
  let current   = localStorage.getItem(LS_KEY) || DEFAULT_THEME;
  let canvas    = null;
  let ctx       = null;
  let animFrame = null;
  let particles = [];

  /* ── APPLY THEME ─────────────────────────────────────────────── */
  function applyTheme(id) {
    const theme = THEMES.find(t => t.id === id) || THEMES[0];
    current = theme.id;
    localStorage.setItem(LS_KEY, current);
    document.documentElement.setAttribute('data-theme', current);

    /* update panel active states */
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === current);
    });

    /* stop any running animation */
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* start animated canvas if needed */
    if (theme.animated) {
      ensureCanvas();
      resizeCanvas();
      initParticles(current);
      tick();
    }

    updateFavicon();
  }

  /* ── CANVAS SETUP ────────────────────────────────────────────── */
  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'theme-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(current); });
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ── PARTICLE INITIALIZERS ───────────────────────────────────── */
  function initParticles(themeId) {
    particles = [];
    const W = window.innerWidth;
    const H = window.innerHeight;

    if (themeId === 'stars') {
      /* ~260 stars of varied size, speed, twinkle phase */
      for (let i = 0; i < 260; i++) {
        const r = Math.random();
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: r < 0.6 ? 0.6 : r < 0.88 ? 1.1 : 1.8, /* small/mid/large */
          speed: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
          freq:  0.4 + Math.random() * 1.2,
          color: r < 0.7
            ? `rgba(167,139,250,${0.5 + Math.random()*0.5})`
            : r < 0.9
            ? `rgba(129,140,248,${0.4 + Math.random()*0.6})`
            : `rgba(255,255,255,${0.6 + Math.random()*0.4})`,
          drift: (Math.random() - 0.5) * 0.05,
        });
      }
      /* 3 shooting stars stored separately */
      particles.shooters = Array.from({length: 3}, () => newShooter(W, H));

      /* soft drifting nebula clouds, sit behind the stars for depth */
      particles.nebulae = [
        { x: W*0.20, y: H*0.26, r: Math.max(W,H)*0.38, hue: 262, alpha: 0.055, phase: 0,   speed: 0.0016, driftX: 45, driftY: 26 },
        { x: W*0.80, y: H*0.66, r: Math.max(W,H)*0.32, hue: 232, alpha: 0.048, phase: 2.1, speed: 0.0012, driftX: 38, driftY: 32 },
        { x: W*0.52, y: H*0.90, r: Math.max(W,H)*0.30, hue: 300, alpha: 0.035, phase: 4.2, speed: 0.0010, driftX: 52, driftY: 22 },
      ];
    }

    if (themeId === 'neon-tokyo') {
      /* Glowing grid lines + floating orbs */
      for (let i = 0; i < 60; i++) {
        particles.push({
          type: 'orb',
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          hue: Math.random() < 0.6 ? 174 : 310, /* cyan or pink */
          alpha: 0.3 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
        });
      }
      /* scanline animation offset */
      particles.scanlineY = 0;
    }

    if (themeId === 'aurora') {
      /* Flowing aurora bands */
      for (let i = 0; i < 5; i++) {
        particles.push({
          type: 'band',
          y: H * (0.1 + i * 0.12),
          width: W * (1.2 + Math.random() * 0.8),
          height: 80 + Math.random() * 120,
          speed: 0.0003 + Math.random() * 0.0004,
          offset: Math.random() * Math.PI * 2,
          hue: [160, 200, 140, 180, 220][i],
          alpha: 0.06 + Math.random() * 0.08,
        });
      }
      /* Floating particles */
      for (let i = 0; i < 40; i++) {
        particles.push({
          type: 'spark',
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.5 + Math.random() * 1.5,
          vy: -0.1 - Math.random() * 0.2,
          vx: (Math.random() - 0.5) * 0.1,
          alpha: 0.2 + Math.random() * 0.5,
          life: Math.random(),
        });
      }
    }

    if (themeId === 'deep-sea') {
      /* Bioluminescent particles that drift slowly */
      for (let i = 0; i < 80; i++) {
        particles.push({
          type: 'bio',
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.05 - Math.random() * 0.12,
          hue: 190 + Math.random() * 40,
          alpha: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          wobble: 0.002 + Math.random() * 0.004,
        });
      }
      /* Slow caustic rays */
      for (let i = 0; i < 6; i++) {
        particles.push({
          type: 'ray',
          x: Math.random() * W,
          width: 30 + Math.random() * 80,
          speed: 0.0002 + Math.random() * 0.0003,
          offset: Math.random() * Math.PI * 2,
          alpha: 0.02 + Math.random() * 0.04,
        });
      }
    }
  }

  function newShooter(W, H) {
    return {
      x: Math.random() * W * 0.7,
      y: Math.random() * H * 0.4,
      len: 80 + Math.random() * 120,
      vx: 4 + Math.random() * 5,
      vy: 2 + Math.random() * 3,
      alpha: 0,
      alive: true,
      delay: 60 + Math.random() * 300, /* frames before appearing */
    };
  }

  /* ── RENDER LOOP ─────────────────────────────────────────────── */
  let frame = 0;
  function tick() {
    animFrame = requestAnimationFrame(tick);
    if (!ctx) return;
    frame++;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (current === 'stars')      drawStars(W, H);
    if (current === 'neon-tokyo') drawNeonTokyo(W, H);
    if (current === 'aurora')     drawAurora(W, H);
    if (current === 'deep-sea')   drawDeepSea(W, H);
  }

  /* ── STARS RENDERER ─────────────────────────────────────────── */
  function drawStars(W, H) {
    const t = frame * 0.01;

    /* Deep space gradient bg */
    const grad = ctx.createRadialGradient(W*0.3, H*0.2, 0, W*0.5, H*0.5, W*0.8);
    grad.addColorStop(0, 'rgba(35,24,70,0.18)');
    grad.addColorStop(1, 'rgba(5,8,16,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Slow-drifting nebula clouds, sit behind the stars */
    if (particles.nebulae) {
      particles.nebulae.forEach(n => {
        n.phase += n.speed;
        const nx = n.x + Math.sin(n.phase) * n.driftX;
        const ny = n.y + Math.cos(n.phase * 0.8) * n.driftY;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
        ng.addColorStop(0, `hsla(${n.hue},80%,65%,${n.alpha})`);
        ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, W, H);
      });
    }

    /* Stars */
    particles.forEach(p => {
      if (!p.freq) return;
      p.x += p.drift;
      if (p.x > W) p.x = 0;
      if (p.x < 0) p.x = W;

      const blink = 0.5 + 0.5 * Math.sin(t * p.freq + p.phase);
      ctx.globalAlpha = blink * 0.85 + 0.15;
      ctx.shadowBlur  = p.r > 1.5 ? 8 : 3;
      ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    /* Shooting stars */
    if (particles.shooters) {
      particles.shooters.forEach((s, idx) => {
        if (s.delay > 0) { s.delay--; return; }
        if (!s.alive) return;

        s.alpha = Math.min(1, s.alpha + 0.08);
        s.x += s.vx;
        s.y += s.vy;

        const sgrad = ctx.createLinearGradient(s.x - s.vx*8, s.y - s.vy*8, s.x, s.y);
        sgrad.addColorStop(0, 'rgba(167,139,250,0)');
        sgrad.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.9})`);
        ctx.strokeStyle = sgrad;
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = 'rgba(167,139,250,0.8)';
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * (s.len/s.vx), s.y - s.vy * (s.len/s.vx));
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (s.x > W + 50 || s.y > H + 50) {
          particles.shooters[idx] = newShooter(W, H);
        }
      });
    }

    /* Soft vignette so the edges fall away into the dark */
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.35, W/2, H/2, H*0.95);
    vig.addColorStop(0, 'rgba(3,4,12,0)');
    vig.addColorStop(1, 'rgba(3,4,12,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── NEON TOKYO RENDERER ────────────────────────────────────── */
  function drawNeonTokyo(W, H) {
    const t = frame;

    /* Grid */
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 60) {
      const alpha = 0.03 + 0.01 * Math.sin(t * 0.01 + x * 0.01);
      ctx.strokeStyle = `rgba(0,255,230,${alpha})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      const alpha = 0.02 + 0.01 * Math.sin(t * 0.01 + y * 0.01);
      ctx.strokeStyle = `rgba(0,255,230,${alpha})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* Orbs */
    particles.forEach(p => {
      if (p.type !== 'orb') return;
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.03;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const pulse = 0.5 + 0.5 * Math.sin(p.phase);
      const a = p.alpha * pulse;

      ctx.shadowBlur  = 18;
      ctx.shadowColor = p.hue === 174 ? `rgba(0,255,230,${a})` : `rgba(255,0,170,${a})`;
      ctx.fillStyle   = p.hue === 174 ? `rgba(0,255,230,${a})` : `rgba(255,0,170,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    /* Horizontal scan line */
    particles.scanlineY = ((particles.scanlineY || 0) + 1.2) % H;
    const sg = ctx.createLinearGradient(0, particles.scanlineY - 6, 0, particles.scanlineY + 6);
    sg.addColorStop(0,   'rgba(0,255,230,0)');
    sg.addColorStop(0.5, 'rgba(0,255,230,0.06)');
    sg.addColorStop(1,   'rgba(0,255,230,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, particles.scanlineY - 6, W, 12);
  }

  /* ── AURORA RENDERER ────────────────────────────────────────── */
  function drawAurora(W, H) {
    const t = frame * 0.004;

    particles.forEach(p => {
      if (p.type === 'band') {
        const y0 = p.y + Math.sin(t * p.speed * 1000 + p.offset) * 40;
        const grad = ctx.createLinearGradient(0, y0 - p.height, 0, y0 + p.height);
        grad.addColorStop(0,   'transparent');
        grad.addColorStop(0.4, `hsla(${p.hue},70%,60%,${p.alpha})`);
        grad.addColorStop(0.6, `hsla(${p.hue + 20},65%,55%,${p.alpha * 0.8})`);
        grad.addColorStop(1,   'transparent');

        ctx.save();
        ctx.translate(W * 0.5, 0);
        ctx.scale(p.width / W, 1);
        const warp = Math.sin(t * p.speed * 500 + p.offset) * 0.04 + 1;
        ctx.scale(warp, 1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, y0, W * 0.6, p.height, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (p.type === 'spark') {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.004;

        if (p.y < -10 || p.life > 1) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.life = 0;
          p.alpha = 0.2 + Math.random() * 0.5;
        }

        const fade = Math.sin(p.life * Math.PI);
        ctx.globalAlpha = p.alpha * fade;
        ctx.fillStyle   = p.y < H * 0.5 ? '#34d399' : '#818cf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  /* ── DEEP SEA RENDERER ──────────────────────────────────────── */
  function drawDeepSea(W, H) {
    const t = frame;

    /* Caustic light rays from above */
    particles.forEach(p => {
      if (p.type !== 'ray') return;
      const wobble = Math.sin(t * p.speed * 1000 + p.offset) * 40;
      const rayGrad = ctx.createLinearGradient(p.x + wobble, 0, p.x + wobble, H * 0.6);
      rayGrad.addColorStop(0,   `rgba(0,191,255,${p.alpha})`);
      rayGrad.addColorStop(0.6, `rgba(0,128,255,${p.alpha * 0.3})`);
      rayGrad.addColorStop(1,   'rgba(0,128,255,0)');
      ctx.fillStyle = rayGrad;
      ctx.fillRect(p.x + wobble - p.width / 2, 0, p.width, H * 0.6);
    });

    /* Bioluminescent orbs */
    particles.forEach(p => {
      if (p.type !== 'bio') return;
      p.x += p.vx + Math.sin(t * p.wobble + p.phase) * 0.3;
      p.y += p.vy;
      p.phase += 0.02;

      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
        p.alpha = 0.2 + Math.random() * 0.6;
      }

      const pulse = 0.5 + 0.5 * Math.sin(p.phase * 2);
      const a = p.alpha * pulse;

      ctx.shadowBlur  = 14;
      ctx.shadowColor = `hsla(${p.hue},100%,70%,${a})`;
      ctx.fillStyle   = `hsla(${p.hue},100%,70%,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    /* Subtle vignette */
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.9);
    vig.addColorStop(0, 'rgba(0,8,16,0)');
    vig.addColorStop(1, 'rgba(0,8,16,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── DYNAMIC FAVICON ─────────────────────────────────────────────
     A small gradient dot, recolored to the active theme's --accent
     and --accent2 every time the theme changes. Lives at #site-favicon
     in <head> (a static favicon.svg is the fallback before JS runs).
     ------------------------------------------------------------- */
  function mixWithWhite(hex, amt) {
    const c = (hex || '').trim().replace('#', '');
    if (c.length !== 6) return hex;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const lr = Math.round(r + (255 - r) * amt);
    const lg = Math.round(g + (255 - g) * amt);
    const lb = Math.round(b + (255 - b) * amt);
    return `rgb(${lr},${lg},${lb})`;
  }

  function buildFaviconSVG(c1, c2) {
    const hi = mixWithWhite(c1, 0.45);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<defs><radialGradient id="fg" cx="35%" cy="30%" r="75%">' +
      `<stop offset="0%" stop-color="${hi}"/>` +
      `<stop offset="55%" stop-color="${c1}"/>` +
      `<stop offset="100%" stop-color="${c2}"/>` +
      '</radialGradient></defs>' +
      '<circle cx="32" cy="32" r="28" fill="url(#fg)"/>' +
      '<ellipse cx="23" cy="20" rx="8" ry="5" fill="#ffffff" opacity="0.3"/>' +
      '</svg>';
  }

  function updateFavicon() {
    const styles = getComputedStyle(document.documentElement);
    const c1 = styles.getPropertyValue('--accent').trim()  || '#a78bfa';
    const c2 = styles.getPropertyValue('--accent2').trim() || '#818cf8';

    let link = document.getElementById('site-favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'site-favicon';
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = 'data:image/svg+xml,' + encodeURIComponent(buildFaviconSVG(c1, c2));
  }

  /* ── PANEL INJECTION ─────────────────────────────────────────── */
  function buildPanel() {
    if (document.getElementById('theme-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Choose theme');

    const title = document.createElement('div');
    title.id = 'theme-panel-title';
    title.textContent = 'Choose a theme';
    panel.appendChild(title);

    const grid = document.createElement('div');
    grid.id = 'theme-panel-grid';

    THEMES.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'theme-option' + (t.id === current ? ' active' : '');
      btn.dataset.theme = t.id;
      btn.setAttribute('aria-pressed', t.id === current);
      btn.setAttribute('aria-label', `${t.name} theme${t.animated ? ' (animated)' : ''}`);

      /* Swatch */
      const swatch = document.createElement('div');
      swatch.className = 'theme-swatch';
      swatch.style.background = `linear-gradient(135deg, ${t.swatch[0]} 40%, ${t.swatch[1]} 100%)`;

      /* Name row */
      const nameRow = document.createElement('div');
      nameRow.style.cssText = 'display:flex;align-items:center;gap:5px;width:100%';

      const nameEl = document.createElement('span');
      nameEl.className = 'theme-name';
      nameEl.textContent = t.name;
      nameRow.appendChild(nameEl);

      if (t.animated) {
        const badge = document.createElement('span');
        badge.className = 'theme-animated-badge';
        badge.textContent = '✦';
        nameRow.appendChild(badge);
      }

      btn.appendChild(swatch);
      btn.appendChild(nameRow);

      btn.addEventListener('click', () => {
        applyTheme(t.id);
        btn.setAttribute('aria-pressed', 'true');
      });

      grid.appendChild(btn);
    });

    panel.appendChild(grid);
    document.body.appendChild(panel);

    /* Close on outside click */
    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && !e.target.closest('#themeToggleBtn, .theme-toggle-btn')) {
        panel.classList.remove('open');
      }
    });

    /* Escape key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  /* ── WIRE UP TOGGLE BUTTON ───────────────────────────────────── */
  function wireToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = document.getElementById('theme-panel');
      if (panel) panel.classList.toggle('open');
    });
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    buildPanel();
    wireToggle();
    applyTheme(current);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
