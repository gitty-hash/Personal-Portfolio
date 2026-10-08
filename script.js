(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------------------------------------------------------
     Theme toggle (dark default, remembers choice)
     --------------------------------------------------------- */
  const toggle = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    if (metaTheme) metaTheme.setAttribute('content', isLight ? '#F6F8FC' : '#0A0E17');
    document.dispatchEvent(new CustomEvent('themechange'));
  }
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage may be blocked */ }
  });

  /* ---------------------------------------------------------
     Typing effect on the hero title
     The full text is in the HTML (and in aria-label), so
     reduced-motion and no-JS users just see it immediately.
     --------------------------------------------------------- */
  const typingEl = document.getElementById('typing');
  if (typingEl && !reduceMotion.matches) {
    const full = typingEl.textContent;
    typingEl.textContent = '';
    let i = 0;
    const step = () => {
      typingEl.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(step, 55 + Math.random() * 45);
    };
    setTimeout(step, 500);
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* ---------------------------------------------------------
     Portrait tilt (desktop pointer only)
     --------------------------------------------------------- */
  const portrait = document.getElementById('portrait');
  if (portrait && finePointer.matches && !reduceMotion.matches) {
    const hero = document.getElementById('top');
    hero.addEventListener('pointermove', (e) => {
      const r = portrait.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      portrait.style.setProperty('--ry', (dx * 14).toFixed(2) + 'deg');
      portrait.style.setProperty('--rx', (-dy * 14).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => {
      portrait.style.setProperty('--rx', '0deg');
      portrait.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------------------------------------------------------
     Neural-network canvas: drifting nodes, proximity links,
     signal pulses travelling along links, pointer interaction.
     Vanilla canvas, no library.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Contact form: posts to Formspree once a real form ID is set;
     until then it opens the visitor's email app with the message filled in.
     --------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const TO = 'sharaanadm01@gmail.com';
    const say = (msg, kind) => { status.textContent = msg; status.className = 'form__status' + (kind ? ' is-' + kind : ''); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get('_gotcha')) return; // bot filled the hidden field

      // Simple validation with accessible error state
      let firstBad = null;
      ['name', 'email', 'message'].forEach((n) => {
        const el = form.elements[n];
        const ok = el.value.trim() && (n !== 'email' || /^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = el;
      });
      if (firstBad) { say('Please fill in your name, a valid email and a message.', 'error'); firstBad.focus(); return; }

      const name = data.get('name').toString().trim();
      const email = data.get('email').toString().trim();
      const message = data.get('message').toString().trim();

      // Not configured yet: fall back to a mailto link
      if (form.action.includes('YOUR_FORM_ID')) {
        const subject = encodeURIComponent('Portfolio message from ' + name);
        const body = encodeURIComponent(message + '\n\n' + name + '\n' + email);
        window.location.href = 'mailto:' + TO + '?subject=' + subject + '&body=' + body;
        say('Opening your email app. If nothing opens, write to ' + TO + '.', 'ok');
        return;
      }

      submitBtn.disabled = true; say('Sending…');
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('bad status');
        form.reset(); say('Thanks! Your message was sent. I will reply soon.', 'ok');
      } catch (err) {
        say('Something went wrong. Please email ' + TO + ' directly.', 'error');
      } finally { submitBtn.disabled = false; }
    });
  }

  /* ---------------------------------------------------------
     Tech layer: scroll progress, card spotlight, title decode
     --------------------------------------------------------- */
  const progress = document.getElementById('progress');
  if (progress) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const GLYPHS = '01<>/{}[]#$%&*+=';
    const decode = (el) => {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      const start = performance.now(), dur = 650;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const settled = Math.floor(t * text.length);
        el.textContent = [...text].map((c, i) =>
          c === ' ' || i < settled ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
        if (t < 1) requestAnimationFrame(tick); else el.textContent = text;
      };
      requestAnimationFrame(tick);
    };
    const titles = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { decode(e.target); titles.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section__title').forEach((t) => titles.observe(t));
  }

  /* Mobile menu */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('is-open')));
    navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Highlight the nav link for the section in view */
  if ('IntersectionObserver' in window && navLinks) {
    const links = new Map([...navLinks.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const a = links.get(e.target.id);
        if (a) { if (e.isIntersecting) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const hero = canvas.parentElement;
  let w = 0, h = 0, dpr = 1;
  let nodes = [];
  let pulses = [];
  let colors = {};
  let raf = 0;
  let running = false;
  const pointer = { x: -9999, y: -9999, active: false };

  const LINK_DIST = 150;
  const POINTER_DIST = 190;

  function readColors() {
    const s = getComputedStyle(root);
    colors = {
      node: s.getPropertyValue('--canvas-node').trim(),
      line: s.getPropertyValue('--canvas-line').trim(),
      pulse: s.getPropertyValue('--canvas-pulse').trim()
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density scales with area, capped for performance on large screens
    const count = Math.max(28, Math.min(95, Math.round((w * h) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 1.8
    }));
    pulses = [];
    if (!running) draw(); // keeps a static frame correct when motion is off
  }

  function spawnPulse(a, b) {
    pulses.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.012 });
  }

  function update() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

      if (pointer.active) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) {
          const d = Math.sqrt(d2), f = (130 - d) / 130 * 0.6; // gentle push away from cursor
          n.x += (dx / d) * f; n.y += (dy / d) * f;
        }
      }
    }
    // Occasionally fire a signal along a random close pair
    if (pulses.length < 14 && Math.random() < 0.08) {
      const a = nodes[(Math.random() * nodes.length) | 0];
      const b = nodes[(Math.random() * nodes.length) | 0];
      const dx = a.x - b.x, dy = a.y - b.y;
      if (a !== b && dx * dx + dy * dy < LINK_DIST * LINK_DIST) spawnPulse(a, b);
    }
    pulses = pulses.filter((p) => (p.t += p.speed) < 1);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.42;
          ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // Links to pointer
      if (pointer.active) {
        const dx = a.x - pointer.x, dy = a.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < POINTER_DIST) {
          ctx.strokeStyle = `rgba(${colors.node}, ${(1 - d / POINTER_DIST) * 0.7})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
    }

    // Nodes (soft glow + core)
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${colors.node}, 0.14)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.2, 0, 6.2832); ctx.fill();
      ctx.fillStyle = `rgba(${colors.node}, 0.95)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill();
    }

    // Pulses
    for (const p of pulses) {
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
      g.addColorStop(0, `rgba(${colors.pulse}, 0.95)`);
      g.addColorStop(1, `rgba(${colors.pulse}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.2832); ctx.fill();
    }
  }

  function loop() {
    if (!running) return;
    update(); draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduceMotion.matches) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // Pause when the hero is off-screen or the tab is hidden
  let heroVisible = true;
  const sync = () => (heroVisible && !document.hidden ? start() : stop());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; sync(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);

  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  document.addEventListener('themechange', () => { readColors(); if (!running) draw(); });
  reduceMotion.addEventListener('change', () => { reduceMotion.matches ? stop() : sync(); draw(); });

  readColors();
  resize();
  sync();
})();
