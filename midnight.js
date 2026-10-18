/* ═══════════════════════════════════════════════════════════════
   MIDNIGHT.JS — Live Colombo countdown + fireworks celebration
   Production target: 2026-10-19 00:00:00 Asia/Colombo (UTC+05:30)
═══════════════════════════════════════════════════════════════ */

(function initMidnightEvent() {
  const PRODUCTION_TARGET_ISO = '2026-10-19T00:00:00+05:30';
  const PRODUCTION_TARGET_MS = Date.parse(PRODUCTION_TARGET_ISO);
  const TIMEZONE = 'Asia/Colombo';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNarrow = () => window.matchMedia('(max-width: 640px)').matches;

  const stage = document.getElementById('midnightStage');
  const starCanvas = document.getElementById('midnightStarCanvas');
  const fwCanvas = document.getElementById('midnightFireworks');
  const confettiLayer = document.getElementById('midnightConfetti');
  const burstEl = document.getElementById('midnightBurst');
  const countdownEl = document.getElementById('midnightCountdown');
  const cinematicEl = document.getElementById('midnightCinematic');
  const cinematicNum = document.getElementById('midnightCinematicNum');
  const cinematicHint = document.getElementById('midnightCinematicHint');
  const finalEl = document.getElementById('midnightFinalCount');
  const finalNum = document.getElementById('midnightFinalNum');
  const revealEl = document.getElementById('midnightReveal');
  const cakeEl = document.getElementById('midnightCake');
  const dock = document.getElementById('midnightDock');
  const dockTime = document.getElementById('midnightDockTime');
  const dockLabel = document.getElementById('midnightDockLabel');
  const sparkleField = document.getElementById('midnightSparkles');
  const soundBtn = document.getElementById('midnightSoundBtn');

  if (!stage || !fwCanvas || !starCanvas) return;

  function isDevHost() {
    const host = location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || location.protocol === 'file:';
  }

  /* Dev-only time override. Production always uses 19 Oct 2026 00:00 Colombo. */
  function resolveTargetMs() {
    if (!isDevHost()) return PRODUCTION_TARGET_MS;
    const params = new URLSearchParams(location.search);
    const scenario = params.get('devScenario');
    const offset = params.get('devOffsetMs');
    const now = Date.now();
    const scenarios = {
      fiveMinBefore: 5 * 60 * 1000,
      tenSecBefore: 10 * 1000,
      midnight: 0,
      fiveMinAfter: -5 * 60 * 1000
    };
    if (scenario && Object.prototype.hasOwnProperty.call(scenarios, scenario)) {
      return now + scenarios[scenario];
    }
    if (offset != null && offset !== '') {
      const n = Number(offset);
      if (Number.isFinite(n)) return now + n;
    }
    return PRODUCTION_TARGET_MS;
  }

  const TARGET_MS = resolveTargetMs();
  const devParams = isDevHost() ? new URLSearchParams(location.search) : null;
  const runId = (devParams && (devParams.get('devScenario') || devParams.get('devOffsetMs'))) || 'prod';
  const SESSION_KEY = 'n25-midnight-played-' + runId;
  const TRIGGER_KEY = 'n25-midnight-triggered-' + runId;
  const openedAfterMidnight = Date.now() >= TARGET_MS;

  let tickTimer = 0;
  let midnightTimer = 0;
  let celebrationArmed = false;
  let celebrationStarted = false;
  let cinematicActive = false;
  let starRaf = 0;
  let fwRaf = 0;
  let fireworksRunning = false;
  let lastCinematicSecond = null;
  let lastFinalSecond = null;
  const timeouts = new Set();

  function later(fn, ms) {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
    return id;
  }

  function remainingMs() {
    return TARGET_MS - Date.now();
  }

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function splitRemaining(ms) {
    const safe = Math.max(0, ms);
    const total = Math.floor(safe / 1000);
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
      wholeSeconds: Math.ceil(safe / 1000),
      ms: safe
    };
  }

  function setDigit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const next = pad(value);
    if (el.textContent !== next) {
      el.textContent = next;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  function restoreBodyScroll() {
    document.body.classList.remove('midnight-lock');
    if (!document.getElementById('introOverlay')?.classList.contains('hidden')) return;
    document.body.style.overflow = '';
  }

  function showStage() {
    stage.hidden = false;
    stage.setAttribute('aria-hidden', 'false');
    stage.classList.remove('is-minimized');
    if (typeof window.dismissBirthdayIntro === 'function') window.dismissBirthdayIntro();
    document.body.classList.add('midnight-lock');
    document.body.style.overflow = 'hidden';
    startStars();
    syncSoundButton();
  }

  function minimizeStage() {
    stopFireworks();
    stopStars();
    stage.classList.add('is-minimized');
    document.body.classList.remove('midnight-lock');
    restoreBodyScroll();
    dock.hidden = false;
  }

  function hideCountdownPanels() {
    countdownEl.hidden = true;
    if (cinematicEl) cinematicEl.hidden = true;
    finalEl.hidden = true;
  }

  function syncSoundButton() {
    if (!soundBtn) return;
    const on = !!window.__birthdaySoundOn;
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.textContent = on ? 'Sound on' : 'Sound off';
  }

  function playOptionalTone(kind) {
    if (!window.__birthdaySoundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = window.__birthdayAudioCtx || new Ctx();
      window.__birthdayAudioCtx = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      if (kind === 'tick') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 660 + (lastCinematicSecond || 0) * 8;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.22);
        return;
      }
      const duration = kind === 'burst' ? 0.7 : 0.38;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, kind === 'burst' ? 1.6 : 2.4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'burst' ? 720 : 1900;
      const g = ctx.createGain();
      g.gain.setValueAtTime(kind === 'burst' ? 0.11 : 0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      src.connect(filter); filter.connect(g); g.connect(ctx.destination);
      src.start();
    } catch (_) { /* sound is optional */ }
  }

  /* ── Stars ─────────────────────────────────────────────── */
  const starCtx = starCanvas.getContext('2d');
  let stars = [];
  let starW = 0, starH = 0, starsOn = false;

  function sizeCanvas(canvas, ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, isNarrow() ? 1.25 : 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function seedStars() {
    const count = reduceMotion ? 36 : (isNarrow() ? 64 : 108);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * starW,
      y: Math.random() * starH,
      r: 0.4 + Math.random() * 1.6,
      a: Math.random(),
      da: 0.003 + Math.random() * 0.01,
      drift: 0.015 + Math.random() * 0.07
    }));
  }

  function drawStars() {
    if (!starsOn) return;
    starCtx.clearRect(0, 0, starW, starH);
    const rem = remainingMs();
    const anticipation = cinematicActive
      ? 1.15 + Math.min(0.7, (60000 - Math.max(0, rem)) / 60000)
      : 1;
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.12) s.da *= -1;
      if (!reduceMotion) s.y = (s.y + s.drift * anticipation) % starH;
      starCtx.globalAlpha = s.a * (0.4 + anticipation * 0.28);
      starCtx.fillStyle = s.r > 1.2 ? '#E8C982' : '#fff';
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r * (cinematicActive ? 1.15 : 1), 0, Math.PI * 2);
      starCtx.fill();
    });
    starCtx.globalAlpha = 1;
    starRaf = requestAnimationFrame(drawStars);
  }

  function startStars() {
    if (starsOn) return;
    const size = sizeCanvas(starCanvas, starCtx);
    starW = size.w; starH = size.h;
    seedStars();
    starsOn = true;
    drawStars();
  }

  function stopStars() {
    starsOn = false;
    cancelAnimationFrame(starRaf);
  }

  /* ── Fireworks ─────────────────────────────────────────── */
  const fwCtx = fwCanvas.getContext('2d', { alpha: true });
  let fwW = 0, fwH = 0;
  let rockets = [];
  let particles = [];
  let sparkles = [];
  let launchTimer = 0;
  let showUntil = 0;
  let finaleUntil = 0;

  const PALETTE = ['#E8C982', '#F5B8CE', '#C6A8FF', '#F3E2B8', '#FFFFFF', '#FF9EC8', '#D4AF37'];
  const MAX_PARTICLES = () => (reduceMotion ? 0 : isNarrow() ? 220 : 420);

  function resizeFireworks() {
    const size = sizeCanvas(fwCanvas, fwCtx);
    fwW = size.w; fwH = size.h;
  }

  function launchRocket(forceX, forceY, shape) {
    if (reduceMotion) return;
    const x = forceX != null ? forceX : fwW * (0.1 + Math.random() * 0.8);
    const targetY = forceY != null ? forceY : fwH * (0.1 + Math.random() * 0.46);
    rockets.push({
      x,
      y: fwH + 10,
      vx: (x - fwW / 2) * -0.0038 + (Math.random() - 0.5) * 0.55,
      vy: -(7.4 + Math.random() * 3.6),
      targetY,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: shape || ['sphere', 'ring', 'willow', 'palm', 'double'][Math.floor(Math.random() * 5)],
      trail: []
    });
  }

  function burst(x, y, color, shape) {
    const budget = MAX_PARTICLES() - particles.length;
    if (budget <= 0) return;
    const count = Math.min(budget, shape === 'double' ? 72 : shape === 'ring' ? 36 : shape === 'willow' ? 50 : 52);
    for (let i = 0; i < count; i++) {
      const angle = shape === 'ring'
        ? (i / count) * Math.PI * 2
        : Math.random() * Math.PI * 2;
      const speed = shape === 'willow'
        ? 1.05 + Math.random() * 2.1
        : shape === 'palm'
          ? 2.6 + Math.random() * 2.3
          : 1.5 + Math.random() * 3.2;
      particles.push({
        x, y,
        px: x, py: y,
        vx: Math.cos(angle) * speed * (shape === 'ring' ? 2.35 : 1),
        vy: Math.sin(angle) * speed * (shape === 'ring' ? 2.35 : 1) - (shape === 'palm' ? 1.35 : 0),
        life: 1,
        decay: 0.009 + Math.random() * 0.012,
        color: Math.random() > 0.82 ? PALETTE[Math.floor(Math.random() * PALETTE.length)] : color,
        size: 1 + Math.random() * 2.1,
        gravity: shape === 'willow' ? 0.058 : 0.034
      });
    }
    if (shape === 'double' && budget > 40) {
      burst(x, y, PALETTE[Math.floor(Math.random() * PALETTE.length)], 'sphere');
    }
    playOptionalTone('pop');
  }

  function spawnBannerSparkles() {
    if (reduceMotion || sparkles.length > 24) return;
    const rect = revealEl && !revealEl.hidden ? revealEl.getBoundingClientRect() : null;
    const cx = rect ? rect.left + rect.width / 2 : fwW / 2;
    const cy = rect ? rect.top + rect.height * 0.28 : fwH * 0.32;
    sparkles.push({
      x: cx + (Math.random() - 0.5) * (rect ? rect.width : fwW * 0.5),
      y: cy + (Math.random() - 0.5) * 90,
      life: 1,
      size: 0.8 + Math.random() * 1.6
    });
  }

  function drawFireworks(ts) {
    if (!fireworksRunning) return;
    fwCtx.globalCompositeOperation = 'source-over';
    fwCtx.fillStyle = 'rgba(5, 6, 15, 0.22)';
    fwCtx.fillRect(0, 0, fwW, fwH);
    fwCtx.globalCompositeOperation = 'lighter';

    rockets.forEach(r => {
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.042;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 12) r.trail.shift();
      r.trail.forEach((p, i) => {
        fwCtx.globalAlpha = (i / r.trail.length) * 0.85;
        fwCtx.fillStyle = r.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, 1.35, 0, Math.PI * 2);
        fwCtx.fill();
      });
    });

    rockets = rockets.filter(r => {
      if (r.y <= r.targetY || r.vy >= -0.35) {
        burst(r.x, r.y, r.color, r.shape);
        return false;
      }
      return true;
    });

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.px = p.x; p.py = p.y;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.986;
      p.life -= p.decay;
      fwCtx.strokeStyle = p.color;
      fwCtx.globalAlpha = Math.max(0, p.life * 0.45);
      fwCtx.lineWidth = Math.max(0.4, p.size * 0.55);
      fwCtx.beginPath();
      fwCtx.moveTo(p.px, p.py);
      fwCtx.lineTo(p.x, p.y);
      fwCtx.stroke();
      fwCtx.globalAlpha = Math.max(0, p.life);
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size * Math.max(0.28, p.life), 0, Math.PI * 2);
      fwCtx.fill();
    });

    sparkles = sparkles.filter(s => s.life > 0);
    sparkles.forEach(s => {
      s.life -= 0.02;
      fwCtx.globalAlpha = Math.max(0, s.life);
      fwCtx.fillStyle = '#FFF6D2';
      fwCtx.beginPath();
      fwCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      fwCtx.fill();
    });
    if (!revealEl.hidden && Date.now() < showUntil) spawnBannerSparkles();

    const now = Date.now();
    if (now < showUntil && !reduceMotion) {
      const interval = now < finaleUntil ? 300 : 780;
      if (!launchTimer || ts - launchTimer > interval) {
        launchTimer = ts;
        const volleys = now < finaleUntil ? (isNarrow() ? 2 : 3) : 1;
        for (let i = 0; i < volleys; i++) launchRocket();
      }
    }

    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = 'source-over';
    fwRaf = requestAnimationFrame(drawFireworks);
  }

  function startFireworks(ms, finaleMs) {
    if (reduceMotion) return;
    resizeFireworks();
    showUntil = Date.now() + ms;
    finaleUntil = Date.now() + (finaleMs || 4200);
    if (!fireworksRunning) {
      fireworksRunning = true;
      fwRaf = requestAnimationFrame(drawFireworks);
    }
    const n = isNarrow() ? 4 : 7;
    for (let i = 0; i < n; i++) {
      later(() => launchRocket(fwW * (0.12 + i * 0.12), fwH * (0.16 + (i % 3) * 0.11)), i * 150);
    }
    playOptionalTone('burst');
  }

  function stopFireworks() {
    fireworksRunning = false;
    cancelAnimationFrame(fwRaf);
    rockets = [];
    particles = [];
    sparkles = [];
    if (fwCtx) fwCtx.clearRect(0, 0, fwW || 1, fwH || 1);
  }

  function rainConfetti(waves) {
    if (!confettiLayer) return;
    confettiLayer.innerHTML = '';
    const colors = ['#E8C982', '#F5B8CE', '#C6A8FF', '#F3E2B8', '#fff'];
    const count = reduceMotion ? 16 : (isNarrow() ? 48 : 84);
    for (let w = 0; w < waves; w++) {
      later(() => {
        for (let i = 0; i < count; i++) {
          const bit = document.createElement('i');
          const dx = (-90 + Math.random() * 180) + 'px';
          bit.style.left = Math.random() * 100 + '%';
          bit.style.background = colors[i % colors.length];
          bit.style.setProperty('--dx', dx);
          bit.style.setProperty('--rot', (180 + Math.random() * 540) + 'deg');
          bit.style.animationDuration = (2.6 + Math.random() * 3) + 's';
          bit.style.opacity = 0.88;
          bit.style.width = (4 + Math.random() * 7) + 'px';
          bit.style.height = (7 + Math.random() * 11) + 'px';
          confettiLayer.appendChild(bit);
          later(() => bit.remove(), 6500);
        }
      }, w * 680);
    }
  }

  function seedBannerSparkles() {
    if (!sparkleField) return;
    sparkleField.innerHTML = '';
    const n = reduceMotion ? 6 : 20;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = i % 2 ? '✦' : '✧';
      s.style.left = (6 + Math.random() * 88) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDelay = (Math.random() * 2) + 's';
      sparkleField.appendChild(s);
    }
  }

  function popNumber(el, n) {
    if (!el) return;
    el.textContent = n;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    playOptionalTone('tick');
  }

  function setFinalNumber(n) {
    popNumber(finalNum, n);
  }

  function markBirthdayDock() {
    dock.hidden = false;
    dockLabel.textContent = 'It is her birthday';
    dockTime.textContent = '25 ✦';
  }

  function showSettledCelebration() {
    showStage();
    hideCountdownPanels();
    revealEl.hidden = false;
    revealEl.classList.add('is-shown', 'cake-in');
    seedBannerSparkles();
    markBirthdayDock();
    celebrationStarted = true;
    celebrationArmed = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    sessionStorage.setItem(TRIGGER_KEY, '1');
  }

  function runCelebrationSequence(isReplay, skipOpeningCount) {
    if (celebrationStarted && !isReplay) return;
    celebrationStarted = true;
    celebrationArmed = true;
    cinematicActive = true;
    sessionStorage.setItem(TRIGGER_KEY, '1');

    showStage();
    countdownEl.hidden = true;
    if (cinematicEl) cinematicEl.hidden = true;
    revealEl.hidden = true;
    revealEl.classList.remove('is-shown', 'cake-in');
    finalEl.hidden = skipOpeningCount;
    dock.hidden = true;
    if (cakeEl) cakeEl.classList.remove('is-visible');

    const startShow = () => {
      burstEl.classList.remove('flash');
      void burstEl.offsetWidth;
      burstEl.classList.add('flash');
      playOptionalTone('burst');
      finalEl.hidden = true;
      startFireworks(isReplay ? 9000 : 14000, isReplay ? 2600 : 5000);
      rainConfetti(isReplay ? 2 : 3);
      revealEl.hidden = false;
      seedBannerSparkles();
      requestAnimationFrame(() => revealEl.classList.add('is-shown'));
      later(() => {
        revealEl.classList.add('cake-in');
        if (cakeEl) cakeEl.classList.add('is-visible');
      }, reduceMotion ? 0 : 1600);
      markBirthdayDock();
      sessionStorage.setItem(SESSION_KEY, '1');
    };

    if (isReplay || skipOpeningCount) {
      startShow();
      return;
    }

    if (reduceMotion) {
      finalEl.hidden = false;
      setFinalNumber('1');
      later(startShow, 350);
      return;
    }

    finalEl.hidden = false;
    setFinalNumber('3');
    later(() => setFinalNumber('2'), 1000);
    later(() => setFinalNumber('1'), 2000);
    later(startShow, 2800);
  }

  function startCelebrationOnce(fromUserReplay, skipOpeningCount) {
    if (fromUserReplay) {
      runCelebrationSequence(true, true);
      return;
    }
    if (sessionStorage.getItem(TRIGGER_KEY) === '1' && sessionStorage.getItem(SESSION_KEY) === '1') {
      showSettledCelebration();
      return;
    }
    if (celebrationArmed) return;
    celebrationArmed = true;
    const skipCount = skipOpeningCount || openedAfterMidnight || lastFinalSecond != null;
    runCelebrationSequence(false, skipCount);
  }

  function updateCinematicSecond(rem) {
    const sec = Math.max(1, Math.ceil(rem / 1000));
    stage.classList.add('is-anticipating');
    cinematicActive = true;
    showStage();
    countdownEl.hidden = true;
    dock.hidden = true;

    if (sec <= 3) {
      if (cinematicEl) cinematicEl.hidden = true;
      finalEl.hidden = false;
      if (lastFinalSecond !== sec) {
        lastFinalSecond = sec;
        lastCinematicSecond = sec;
        setFinalNumber(String(sec));
      }
      return;
    }

    finalEl.hidden = true;
    if (cinematicEl) cinematicEl.hidden = false;
    if (cinematicNum && lastCinematicSecond !== sec) {
      lastCinematicSecond = sec;
      popNumber(cinematicNum, String(sec));
      if (cinematicHint) cinematicHint.textContent = sec === 1 ? 'second until midnight' : 'seconds until midnight';
      const intensity = 1 + (60 - sec) / 70;
      cinematicNum.style.setProperty('--pulse', intensity.toFixed(3));
    }
  }

  function updateCountdown() {
    const rem = remainingMs();
    if (rem <= 0) {
      clearTimeout(tickTimer);
      startCelebrationOnce(false, lastFinalSecond != null || openedAfterMidnight);
      return;
    }

    const parts = splitRemaining(rem);
    setDigit('cdDays', parts.days);
    setDigit('cdHours', parts.hours);
    setDigit('cdMinutes', parts.minutes);
    setDigit('cdSeconds', parts.seconds);
    if (dockTime && !celebrationStarted) {
      dockTime.textContent = parts.days > 0
        ? `${parts.days}d ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
        : `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
    }

    if (rem <= 60000) {
      updateCinematicSecond(rem);
    } else {
      cinematicActive = false;
      stage.classList.remove('is-anticipating');
      if (cinematicEl) cinematicEl.hidden = true;
      finalEl.hidden = true;
      countdownEl.hidden = false;
    }

    const wait = rem <= 10000 ? 40 : rem <= 60000 ? 80 : 250;
    tickTimer = setTimeout(updateCountdown, wait);
  }

  function armExactMidnight() {
    clearTimeout(midnightTimer);
    const rem = remainingMs();
    if (rem <= 0) return;
    midnightTimer = setTimeout(() => startCelebrationOnce(false, lastFinalSecond != null), rem);
  }

  function applyModeFromTime() {
    const rem = remainingMs();
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === '1';

    if (rem <= 0) {
      if (alreadyPlayed) showSettledCelebration();
      else startCelebrationOnce(false, true);
      return;
    }

    showStage();
    countdownEl.hidden = false;
    if (cinematicEl) cinematicEl.hidden = true;
    finalEl.hidden = true;
    revealEl.hidden = true;
    dock.hidden = true;
    dockLabel.textContent = 'Until midnight';
    updateCountdown();
    armExactMidnight();
  }

  document.getElementById('midnightExplore')?.addEventListener('click', () => {
    if (remainingMs() <= 60000 && remainingMs() > 0) return;
    minimizeStage();
    if (typeof window.dismissBirthdayIntro === 'function') window.dismissBirthdayIntro();
  });

  document.getElementById('midnightContinue')?.addEventListener('click', () => {
    minimizeStage();
    if (typeof window.dismissBirthdayIntro === 'function') window.dismissBirthdayIntro();
    document.getElementById('surprises')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  document.getElementById('midnightReplay')?.addEventListener('click', () => {
    startCelebrationOnce(true);
  });

  soundBtn?.addEventListener('click', async () => {
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
      musicBtn.click();
      later(syncSoundButton, 50);
      return;
    }
    window.__birthdaySoundOn = !window.__birthdaySoundOn;
    syncSoundButton();
  });

  dock?.addEventListener('click', () => {
    if (remainingMs() <= 0 || celebrationStarted) {
      showStage();
      startCelebrationOnce(true);
      return;
    }
    showStage();
    countdownEl.hidden = remainingMs() <= 60000;
    if (cinematicEl) cinematicEl.hidden = remainingMs() > 60000 || remainingMs() <= 3000;
    dock.hidden = true;
  });

  window.addEventListener('resize', () => {
    if (!stage.hidden && !stage.classList.contains('is-minimized')) {
      const s = sizeCanvas(starCanvas, starCtx);
      starW = s.w; starH = s.h;
      if (fireworksRunning) resizeFireworks();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    clearTimeout(tickTimer);
    armExactMidnight();
    if (remainingMs() > 0 && !celebrationStarted) updateCountdown();
    else if (remainingMs() <= 0 && !celebrationStarted) startCelebrationOnce(false, true);
  });

  window.addEventListener('pagehide', () => {
    stopFireworks();
    stopStars();
    clearTimeout(tickTimer);
    clearTimeout(midnightTimer);
    timeouts.forEach(id => clearTimeout(id));
    timeouts.clear();
  });

  applyModeFromTime();
})();
