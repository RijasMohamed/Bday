/* ═══════════════════════════════════════════════════════════════
   SCRIPT.JS — NASEEHFA 25 · A Universe Made For You
═══════════════════════════════════════════════════════════════ */

/* ── Shorthand helpers ─────────────────────────────────────── */
const $ = id => document.getElementById(id);
const C = CONTENT; // from content.js

/* ══════════════════════════════════════════════════════════════
   1. PARTICLE CANVAS
══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], dust = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // seed stars
  for (let i = 0; i < 140; i++) {
    stars.push({
      x: Math.random() * 10000, y: Math.random() * 10000,
      r: .4 + Math.random() * 1.4,
      a: Math.random(), da: .003 + Math.random() * .007,
      speed: .08 + Math.random() * .12,
      px: Math.random() * 10000, py: Math.random() * 10000
    });
  }
  // seed gold dust
  for (let i = 0; i < 40; i++) {
    dust.push({
      x: Math.random(), y: Math.random() + Math.random(),
      size: .8 + Math.random() * 1.6, speed: .0003 + Math.random() * .0005,
      alpha: 0, maxAlpha: .4 + Math.random() * .3
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .008;

    // parallax via mouse tilt
    const mx = (window._mx || 0) * .015, my = (window._my || 0) * .01;

    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      const x = (s.px + mx * 30) % W, y = (s.py + my * 20 + t * s.speed * 20) % H;
      ctx.globalAlpha = s.a * .55;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    dust.forEach(d => {
      d.y -= d.speed;
      if (d.y < -0.05) { d.y = 1.05; d.x = Math.random(); }
      d.alpha = Math.min(d.maxAlpha, d.alpha + .002);
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = '#E8C982';
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('mousemove', e => {
    window._mx = (e.clientX / window.innerWidth - .5) * 2;
    window._my = (e.clientY / window.innerHeight - .5) * 2;
  });
})();

/* ══════════════════════════════════════════════════════════════
   2. INTRO STARS (overlay)
══════════════════════════════════════════════════════════════ */
(function seedIntroStars() {
  const wrap = $('introStars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('span');
    s.className = 'intro-star-item';
    s.textContent = Math.random() > .6 ? '✦' : '·';
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      font-size:${6 + Math.random() * 10}px;
      opacity:${.1 + Math.random() * .4};
      animation-delay:${Math.random() * 4}s;
      animation-duration:${2 + Math.random() * 3}s`;
    wrap.appendChild(s);
  }
})();

/* ══════════════════════════════════════════════════════════════
   3. CINEMATIC INTRO SEQUENCE
══════════════════════════════════════════════════════════════ */
const overlay = $('introOverlay');

function runIntro() {
  const lines = overlay.querySelectorAll('.intro-line');
  const numWrap = overlay.querySelector('.intro-number');
  const delays = [600, 1800, 2800, 4000, 5000];
  lines.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
      if (el === numWrap) numWrap.classList.add('lit');
    }, delays[i]);
  });
}

function dismissIntro() {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  spawnFloaters();
  initRevealObserver();
}
window.dismissBirthdayIntro = dismissIntro;

document.body.style.overflow = 'hidden';
setTimeout(runIntro, 300);

$('enterBtn').addEventListener('click', dismissIntro);
$('skipIntro').addEventListener('click', dismissIntro);

/* ══════════════════════════════════════════════════════════════
   4. HERO FLOATERS (petals & stars)
══════════════════════════════════════════════════════════════ */
function spawnFloaters() {
  const container = $('heroFloaters');
  const types = ['✦', '♡', '✧', '❀', '·', '✿'];
  const colors = ['#E8C982', '#F5B8CE', 'rgba(255,255,255,.7)', '#C6A8FF'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.className = 'float-petal';
    el.textContent = types[Math.floor(Math.random() * types.length)];
    el.style.cssText = `
      left:${Math.random() * 100}%;
      font-size:${8 + Math.random() * 14}px;
      color:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${10 + Math.random() * 15}s;
      animation-delay:${Math.random() * 8}s;
    `;
    container.appendChild(el);
  }
}

/* ══════════════════════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function initRevealObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   6. SOUND SYSTEM (Web Audio API)
══════════════════════════════════════════════════════════════ */
let audioCtx = null, soundOn = false;
window.__birthdaySoundOn = false;
window.__birthdayAudioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playChime(freqs = [523.25, 659.25, 783.99], vol = .032) {
  if (!soundOn) return;
  try {
    const ctx = getAudioCtx();
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      const t = ctx.currentTime + i * .18;
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .03);
      g.gain.exponentialRampToValueAtTime(.0001, t + .45);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + .48);
    });
  } catch { }
}

function speakBirthdayWish() {
  if (!soundOn || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const wish = new SpeechSynthesisUtterance(
    'Happy birthday, Naseehfa! Happy Birthday, Nasee Maadu! Wishing you a beautiful 25th year filled with happiness, love, and wonderful memories.'
  );
  const voices = window.speechSynthesis.getVoices();
  const ladyVoice = voices.find(voice => /female|woman|zira|samantha|susan|karen|victoria|hazel|google uk english female|google us english/i.test(voice.name))
    || voices.find(voice => /^en(-|_)(us|gb|au|in)/i.test(voice.lang));
  if (ladyVoice) wish.voice = ladyVoice;
  wish.rate = 0.88;
  wish.pitch = 1.18;
  wish.volume = 0.9;
  window.speechSynthesis.speak(wish);
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.__birthdayVoicesReady = true;
  });
}

$('musicBtn').addEventListener('click', async () => {
  const btn = $('musicBtn');
  if (!soundOn) {
    try {
      const ctx = getAudioCtx();
      window.__birthdayAudioCtx = ctx;
      await ctx.resume();
      soundOn = true;
      window.__birthdaySoundOn = true;
      btn.setAttribute('aria-pressed', 'true');
      btn.querySelector('.sound-label').textContent = 'Sound On';
      btn.querySelector('.sound-icon').textContent = '♪';
      speakBirthdayWish();
      showToast('Birthday wish playing ♫');
    } catch { showToast('Sound unavailable in this browser'); }
  } else {
    soundOn = false;
    window.__birthdaySoundOn = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    btn.setAttribute('aria-pressed', 'false');
    btn.querySelector('.sound-label').textContent = 'Sound';
    btn.querySelector('.sound-icon').textContent = '♫';
    showToast('Birthday wish off');
  }
});

/* ══════════════════════════════════════════════════════════════
   7. TOAST
══════════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════════════════════
   8. CONFETTI
══════════════════════════════════════════════════════════════ */
function burstConfetti(n = 55) {
  const container = $('confettiContainer');
  const syms = ['✦', '♡', '✧', '❀', '✿', '·', '★'];
  const cols = ['#E8C982', '#F5B8CE', '#C6A8FF', '#FFF7EB', '#FFD0E1'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span');
    el.className = 'confetti-piece';
    el.textContent = syms[Math.floor(Math.random() * syms.length)];
    el.style.cssText = `
      left:${Math.random() * 100}vw;
      color:${cols[Math.floor(Math.random() * cols.length)]};
      font-size:${10 + Math.random() * 16}px;
      animation-duration:${3 + Math.random() * 3}s;
      animation-delay:${Math.random() * .8}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }
}

/* ══════════════════════════════════════════════════════════════
   9. POPULATE CONTENT FROM content.js
══════════════════════════════════════════════════════════════ */
function populateStaticContent() {
  // Hero name
  const hn = $('heroName'); if (hn) hn.textContent = C.heroName;

  // Intro quote
  const iqe = $('introQuoteEn');
  if (iqe) iqe.textContent = C.introQuoteEn;
  const iqt = $('introQuoteTamil');
  if (iqt) iqt.innerHTML = C.introQuoteTamil.replace(/\n/g, '<br>');
  const iqs = $('introSignature');
  if (iqs) iqs.textContent = C.introSignature;

  // Finale
  const fa = $('finaleTitleA'); if (fa) fa.textContent = C.finaleMessage.title;
  const fb = $('finaleTitleB'); if (fb) fb.textContent = C.finaleMessage.name;
  const ft = $('finaleTamil'); if (ft) ft.innerHTML = C.finaleMessage.tamilFinal.replace(/\n/g, '<br>');
  const fn = $('footerNote'); if (fn) fn.textContent = C.finaleMessage.footerNote;

  const flb = $('finaleLetterBody');
  if (flb) {
    flb.innerHTML = C.finaleMessage.letter.map(p => `<p>${p}</p>`).join('');
    const closing = document.createElement('p');
    closing.className = 'finale-closing';
    closing.textContent = C.finaleMessage.closing;
    flb.appendChild(closing);
  }

  // Poems: short Tamil
  buildShortPoems();
  // Poems: long Tamil
  buildLongPoems();
  // Tamil birthday wishes strip
  buildTamilWishes();
}

/* ─ Short Tamil poems ────── */
function buildShortPoems() {
  const grid = $('poemGrid'); if (!grid) return;
  C.tamilPoems.short.forEach((poem, i) => {
    const card = document.createElement('article');
    card.className = 'poem-card reveal-card';
    card.setAttribute('data-reveal', '');
    card.innerHTML = `
      <div class="poem-tag">0${i + 1} · TAMIL VERSE</div>
      <h3 class="tamil">${poem.title}</h3>
      <p class="tamil poem-lines">${poem.lines.join('<br>')}</p>
      <p class="poem-translation">${poem.translation}</p>
      <button class="copy-btn" data-copy="${poem.lines.join(' ')}" type="button">Copy poem ↗</button>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', () => copyText(btn.dataset.copy)));
}

/* ─ Long Tamil poems ───── */
function buildLongPoems() {
  const container = $('longPoemsContainer'); if (!container) return;
  C.tamilPoems.long.forEach((poem, i) => {
    const art = document.createElement('article');
    art.className = 'long-poem-card glass reveal-card';
    art.setAttribute('data-reveal', '');
    const stanzasHtml = poem.stanzas.map(s => `<p class="tamil">${s.join('<br>')}</p>`).join('');
    const fullText = poem.stanzas.map(s => s.join(' ')).join('\n\n');
    art.innerHTML = `
      <div class="poem-tag">LONG TAMIL POEM · ${String(i + 1).padStart(2, '0')}</div>
      <h3 class="tamil">${poem.title}</h3>
      <div class="long-poem-stanzas">${stanzasHtml}</div>
      <p class="lp-translation">${poem.translation}</p>
      <button class="copy-btn" data-copy="${fullText}" type="button">Copy poem ↗</button>
    `;
    container.appendChild(art);
    art.querySelector('.copy-btn').addEventListener('click', () => copyText(fullText));
  });
}

/* ─ English poem ────── */
function buildEnglishPoem() {
  const body = $('enPoemBody'); if (!body) return;
  body.innerHTML = C.englishPoem.stanzas.map(s => `<p>${s.join('<br>')}</p>`).join('');
  const title = $('enPoemTitle'); if (title) title.textContent = C.englishPoem.title;
  const btn = $('copyEnPoem');
  if (btn) {
    const fullText = C.englishPoem.stanzas.map(s => s.join('\n')).join('\n\n');
    btn.dataset.copy = fullText;
    btn.addEventListener('click', () => copyText(fullText));
  }
}

/* ─ Tamil birthday wishes ─ */
function buildTamilWishes() {
  const wrap = $('wishesScroll'); if (!wrap) return;
  C.tamilPoems.birthdayWishes.forEach(w => {
    const el = document.createElement('div');
    el.className = 'wish-item';
    el.textContent = w;
    wrap.appendChild(el);
  });
}

/* ─ Copy helper ──────── */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch { } ta.remove(); }
  showToast('Copied — send it with care ♡');
}

/* ══════════════════════════════════════════════════════════════
   10. SURPRISE DEFINITIONS (10 cards)
══════════════════════════════════════════════════════════════ */
const SURPRISES = [
  // 01
  {
    icon: '🚪', title: 'The Birthday Door', hint: 'Open to begin', kicker: 'SURPRISE 01 · THE BIRTHDAY DOOR',
    build: buildDoor
  },
  // 02
  {
    icon: '💌', title: 'A Letter From Your Best Friend', hint: 'A personal letter for you', kicker: 'SURPRISE 02 · A LETTER',
    build: buildLetter
  },
  // 03
  {
    icon: '✨', title: 'The Reasons You Are Special', hint: 'Tap to reveal each reason', kicker: 'SURPRISE 03 · YOU ARE SPECIAL',
    build: buildReasons
  },
  // 04
  {
    icon: '🌸', title: 'The Memory Garden', hint: 'Friendship moments', kicker: 'SURPRISE 04 · MEMORY GARDEN',
    build: buildMemoryGarden
  },
  // 05
  {
    icon: '😄', title: 'The Smile Award', hint: 'A very official award', kicker: 'SURPRISE 05 · THE SMILE AWARD',
    build: buildSmileAward
  },
  // 06
  {
    icon: '⭐', title: 'The Friendship Constellation', hint: 'Tap each star for a message', kicker: 'SURPRISE 06 · CONSTELLATION',
    build: buildConstellationMini
  },
  // 07
  {
    icon: '🌙', title: 'A Tiny Tamil Poem', hint: 'Four lines, lots of care', kicker: 'SURPRISE 07 · TINY TAMIL POEM',
    build: buildTinyTamilPoem
  },
  // 08
  {
    icon: '💫', title: 'The Long Tamil Poem', hint: 'An original Tamil verse', kicker: 'SURPRISE 08 · LONG TAMIL POEM',
    build: buildLongTamilPoem
  },
  // 09
  {
    icon: '🧠', title: 'The Friendship Quiz', hint: 'Three sweet questions', kicker: 'SURPRISE 09 · QUIZ',
    build: buildQuiz
  },
  // 10
  {
    icon: '🎆', title: 'The Grand Finale', hint: 'The celebration begins!', kicker: 'SURPRISE 10 · GRAND FINALE',
    build: buildGrandFinale
  }
];

const SURPRISE_COUNT = SURPRISES.length;

/* ══════════════════════════════════════════════════════════════
   11. SURPRISE GRID RENDER
══════════════════════════════════════════════════════════════ */
const opened = new Set();
let currentSurprise = -1;

function renderGrid() {
  const grid = $('surpriseGrid'); if (!grid) return;
  grid.innerHTML = '';
  SURPRISES.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'surprise-card' + (opened.has(i) ? ' opened' : '');
    btn.setAttribute('aria-label', `Open surprise ${i + 1}: ${s.title}`);
    btn.dataset.index = i;
    btn.innerHTML = `
      <span class="card-num">SURPRISE ${String(i + 1).padStart(2, '0')}</span>
      <span class="card-icon-wrap">${s.icon}</span>
      <span class="card-title">${s.title}</span>
      <span class="card-hint">${s.hint}</span>
      <span class="card-check" aria-hidden="true">${opened.has(i) ? '✓' : ''}</span>
    `;
    btn.addEventListener('click', () => openSurprise(i));
    grid.appendChild(btn);
  });
}

function updateProgress() {
  const cnt = $('openedCount'); if (cnt) cnt.textContent = opened.size;
  const fill = $('progressFill'); if (fill) fill.style.width = (opened.size / SURPRISE_COUNT * 100) + '%';
  const track = $('progressTrack'); if (track) track.setAttribute('aria-valuenow', opened.size);
  const banner = $('allOpened'); if (banner) banner.hidden = opened.size < SURPRISE_COUNT;
  renderGrid();
}

/* ══════════════════════════════════════════════════════════════
   12. DIALOG LOGIC
══════════════════════════════════════════════════════════════ */
const dialog = $('surpriseDialog');

function openSurprise(i) {
  currentSurprise = ((i % SURPRISE_COUNT) + SURPRISE_COUNT) % SURPRISE_COUNT;
  const s = SURPRISES[currentSurprise];
  opened.add(currentSurprise);

  $('dialogIcon').textContent = s.icon;
  $('dialogKicker').textContent = s.kicker;
  $('dialogTitle').textContent = s.title;

  const body = $('dialogBody');
  body.innerHTML = '';
  s.build(body);

  buildDots();
  updateNav();
  updateProgress();
  playChime();
  burstConfetti(currentSurprise === SURPRISE_COUNT - 1 ? 120 : 18);

  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function buildDots() {
  const wrap = $('dialogDots'); if (!wrap) return;
  wrap.innerHTML = '';
  SURPRISES.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'ddot' + (opened.has(i) ? ' opened' : '') + (i === currentSurprise ? ' active' : '');
    wrap.appendChild(d);
  });
}

function updateNav() {
  const prev = $('prevSurprise'), next = $('nextSurprise');
  if (prev) prev.disabled = false;
  if (next) {
    const isLast = currentSurprise === SURPRISE_COUNT - 1;
    next.textContent = isLast ? 'Replay ↻' : 'Next →';
  }
}

$('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', e => { if (e.key === 'Escape') dialog.close(); });

$('prevSurprise').addEventListener('click', () => openSurprise(currentSurprise - 1));
$('nextSurprise').addEventListener('click', () => {
  const next = currentSurprise === SURPRISE_COUNT - 1 ? 0 : currentSurprise + 1;
  openSurprise(next);
});

/* ══════════════════════════════════════════════════════════════
   13. INDIVIDUAL SURPRISE BUILDERS
══════════════════════════════════════════════════════════════ */

/* 01 – Birthday Door */
function buildDoor(body) {
  body.innerHTML = `
    <div class="experience door-experience">
      <div class="door-wrap" id="dw">
        <div class="door-frame">
          <div class="door-inner">🎂</div>
          <div class="door-panel" id="doorPanel">
            <span class="door-number">①</span>
            <span class="door-handle"></span>
          </div>
        </div>
      </div>
      <p>This is where it all begins. Open the door to start your birthday adventure.</p>
      <button class="door-btn" id="openDoorBtn" type="button">Open the door ✦</button>
      <div class="experience-result" id="doorResult"></div>
    </div>`;
  body.querySelector('#openDoorBtn').addEventListener('click', function () {
    body.querySelector('#dw').classList.add('door-open');
    this.textContent = '✨ Welcome, Naseehfa!';
    this.disabled = true;
    body.querySelector('#doorResult').innerHTML = '<strong>The celebration is now officially open!</strong><br>Twenty surprises are waiting just for you.';
    burstConfetti(50);
    playChime([440, 554, 659, 880]);
  });
}

/* 02 – Letter */
function buildLetter(body) {
  const l = C.letter;
  body.innerHTML = `
    <div class="experience letter-experience">
      <span class="letter-seal">💌</span>
      <p class="letter-salutation">${l.salutation}</p>
      <div class="letter-body">${l.body.map(p => `<p>${p}</p>`).join('')}</div>
      <p class="letter-closing">${l.closing}</p>
      <p class="letter-sig">${l.signature}</p>
    </div>`;
}

/* 03 – Reasons */
function buildReasons(body) {
  let idx = 0;
  const reasons = C.reasons;
  function render() {
    const r = reasons[idx];
    body.innerHTML = `
      <div class="experience reasons-experience">
        <p class="reason-counter">${idx + 1} of ${reasons.length}</p>
        <div class="reason-display">
          <div class="reason-icon">${r.icon}</div>
          <p class="reason-text">"${r.text}"</p>
        </div>
        <div class="reason-nav">
          <button class="reason-btn" id="rnPrev" type="button" ${idx === 0 ? 'disabled' : ''}>← Prev</button>
          <button class="reason-btn" id="rnNext" type="button" ${idx === reasons.length - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      </div>`;
    body.querySelector('#rnPrev')?.addEventListener('click', () => { idx--; render(); });
    body.querySelector('#rnNext')?.addEventListener('click', () => { idx++; render(); });
  }
  render();
}

/* 04 – Memory Garden */
function buildMemoryGarden(body) {
  const mems = C.memories;
  body.innerHTML = `
    <div class="experience">
      <div class="experience-ribbon">MEMORY GARDEN</div>
      <p>These are memory prompts — spaces where our story lives. You know the details better than anyone.</p>
      <div class="memory-cards-wrap">${mems.map(m => `<div class="memory-card">${m}</div>`).join('')}</div>
      <div class="experience-stamp">FRIENDSHIP SAVED ✦</div>
    </div>`;
}

/* 05 – Smile Award */
function buildSmileAward(body) {
  body.innerHTML = `
    <div class="experience award-experience">
      <div class="award-seal-ring"><span class="award-seal-inner">🏆</span></div>
      <div class="award-title">THE OFFICIAL SMILE AWARD</div>
      <div class="award-recipient">Naseehfa</div>
      <div class="award-desc">Awarded for bringing genuine happiness into the lives of those around you — without even trying. Your smile is contagious and your laughter is a gift.</div>
      <div class="mini-list">
        <span>🥇 Best "Are you okay?" check-ins</span>
        <span>🥈 Most likely to make someone's day better without knowing it</span>
        <span>🥉 Lifetime achievement in spreading joy</span>
      </div>
      <p><em>Judges: me. Competition: nobody. Decision: final. ♡</em></p>
    </div>`;
}

/* 06 – Strong Heart */
function buildStrongHeart(body) {
  body.innerHTML = `
    <div class="experience strongheart-experience">
      <div class="heart-icon">💗</div>
      <div class="award-title">THE STRONG HEART AWARD</div>
      <div class="award-recipient">Naseehfa</div>
      <p>This award is for the person who shows up even on difficult days. Who asks about others while carrying her own challenges. Who motivates without making people feel small, and who cares deeply without asking for anything in return.</p>
      <p>Your strength is quiet, consistent, and real. This award is long overdue. ♡</p>
      <div class="experience-stamp">AWARDED WITH SINCERITY ✦</div>
    </div>`;
}

/* 07 – Constellation (mini in dialog) */
function buildConstellationMini(body) {
  body.innerHTML = `<div class="experience"><div class="experience-ribbon">FRIENDSHIP CONSTELLATION</div>
    <p>Tap the stars in the full Constellation section below — each star holds a different friendship message.</p>
    <p class="big-line">✦ Scroll down to "Stars" to explore your constellation.</p>
    <div class="experience-stamp">TAP THE STARS ✦</div></div>`;
}

/* 08 – Tiny Tamil Poem */
function buildTinyTamilPoem(body) {
  const p = C.tamilPoems.short[0];
  const fullText = p.lines.join('\n');
  body.innerHTML = `
    <div class="experience poem-experience">
      <div class="poem-exp-header"><div class="poem-exp-title tamil">${p.title}</div></div>
      <p class="tamil" style="font-size:17px;line-height:2.2;">${p.lines.join('<br>')}</p>
      <p class="poem-translation">${p.translation}</p>
      <button class="experience-action" id="copyPoem8" type="button">Copy poem ↗</button>
    </div>`;
  body.querySelector('#copyPoem8').addEventListener('click', () => copyText(fullText));
}

/* 09 – Long Tamil Poem */
function buildLongTamilPoem(body) {
  const poem = C.tamilPoems.long[0];
  const stanzasHtml = poem.stanzas.map(s => `<p class="tamil">${s.join('<br>')}</p>`).join('');
  const fullText = poem.stanzas.map(s => s.join(' ')).join('\n\n');
  body.innerHTML = `
    <div class="experience poem-experience">
      <div class="poem-exp-header"><div class="poem-exp-title tamil">${poem.title}</div></div>
      <div class="long-poem-stanzas">${stanzasHtml}</div>
      <p class="lp-translation">${poem.translation}</p>
      <button class="experience-action" id="copyPoem9" type="button">Copy poem ↗</button>
    </div>`;
  body.querySelector('#copyPoem9').addEventListener('click', () => copyText(fullText));
}

/* 10 – English Poem */
function buildEnglishPoemDialog(body) {
  const poem = C.englishPoem;
  const stanzasHtml = poem.stanzas.map(s => `<p style="font-family:var(--serif);font-style:italic;font-size:17px;line-height:1.9;margin-bottom:16px;">${s.join('<br>')}</p>`).join('');
  const fullText = poem.stanzas.map(s => s.join('\n')).join('\n\n');
  body.innerHTML = `
    <div class="experience en-poem-experience">
      <div class="experience-ribbon">FOR THE FRIEND WHO STAYS</div>
      <div>${stanzasHtml}</div>
      <button class="experience-action" id="copyPoem10" type="button">Copy poem ↗</button>
    </div>`;
  body.querySelector('#copyPoem10').addEventListener('click', () => copyText(fullText));
}

/* 11 – Quiz */
function buildQuiz(body) {
  const qs = C.quiz;
  let qi = 0, score = 0, answered = false;

  function renderQ() {
    answered = false;
    const q = qs[qi];
    body.innerHTML = `
      <div class="experience quiz-experience">
        <p class="quiz-q-num">QUESTION ${qi + 1} / ${qs.length}</p>
        <p class="quiz-score">Score: ${score} / ${qi}</p>
        <p class="quiz-question">${q.q}</p>
        <div class="quiz-options">${q.options.map((o, i) => `<button class="quiz-opt" data-idx="${i}" type="button">${o}</button>`).join('')}</div>
        <p class="quiz-feedback" id="qfeedback"></p>
        <div class="quiz-nav">
          ${qi > 0 ? '<button class="reason-btn" id="qBack" type="button">← Back</button>' : ''}
          <button class="reason-btn" id="qNext" type="button" ${qi < qs.length - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      </div>`;
    body.querySelectorAll('.quiz-opt').forEach(btn => btn.addEventListener('click', function () {
      if (answered) return; answered = true;
      const chosen = Number(this.dataset.idx);
      const correct = chosen === q.correct;
      if (correct) { score++; this.classList.add('correct'); }
      else { this.classList.add('wrong'); body.querySelectorAll('.quiz-opt')[q.correct].classList.add('correct'); }
      body.querySelector('#qfeedback').textContent = correct ? q.comment : 'Not quite — but close! ♡';
      body.querySelector('#qNext').disabled = false;
    }));
    body.querySelector('#qNext')?.addEventListener('click', () => {
      if (qi < qs.length - 1) { qi++; renderQ(); }
      else {
        body.innerHTML = `<div class="experience"><p class="big-line">You scored ${score} / ${qs.length}! 🎉</p>
          <p>That's ${score === qs.length ? 'a perfect score — incredible! 💯' : 'pretty great — clearly you know Naseehfa well. ♡'}</p>
          <button class="experience-action" id="qReplay" type="button">Play again ↻</button></div>`;
        body.querySelector('#qReplay').addEventListener('click', () => { qi = 0; score = 0; renderQ(); });
        burstConfetti(40);
      }
    });
    body.querySelector('#qBack')?.addEventListener('click', () => { qi--; renderQ(); });
  }
  renderQ();
}

/* 12 – University Awards */
function buildUniAwards(body) {
  const items = C.uniAwards.map(a => `
    <div class="uni-award-item">
      <div class="uni-award-name">${a.award}</div>
      <div class="uni-award-desc">${a.desc}</div>
    </div>`).join('');
  body.innerHTML = `<div class="experience uni-awards-experience">
    <div class="experience-ribbon">UNIVERSITY SURVIVAL AWARDS</div>
    ${items}
    <div class="experience-stamp">CERTIFIED LEGEND ✦</div>
  </div>`;
}

/* 13 – Things I Never Say Enough */
function buildNeverSay(body) {
  const msgs = [
    "Thank you for noticing when something is wrong before I say a word.",
    "Thank you for believing in me when I didn't believe in myself.",
    "Thank you for checking on me — genuinely, consistently, without being asked.",
    "Thank you for motivating me without making me feel like I'm failing.",
    "Thank you for being the kind of friend who sticks around on the ordinary days, not just the exciting ones.",
    "I don't say this enough: you matter, and I'm truly glad you're in my life. ♡"
  ];
  body.innerHTML = `<div class="experience never-say-experience">
    <div class="experience-ribbon">THINGS I NEVER SAY ENOUGH</div>
    ${msgs.map(m => `<div class="never-item">${m}</div>`).join('')}
  </div>`;
}

/* 14 – Wish Jar */
function buildWishJar(body) {
  const wishes = C.wishes;
  let wi = 0;
  function show() {
    body.innerHTML = `
      <div class="experience wishjar-experience">
        <div class="experience-ribbon">A FUTURE WISH JAR</div>
        <div class="jar-wrap" id="jarWrap">
          <div class="jar-body">
            <div class="jar-lid"></div>
            <p class="jar-wish" id="jarWish">${wi > 0 ? wishes[wi - 1] : '✦'}</p>
          </div>
        </div>
        <p class="jar-counter">Wish ${wi} / ${wishes.length} opened</p>
        <button class="experience-action" id="jarBtn" type="button" ${wi >= wishes.length ? 'disabled' : ''}>
          ${wi === 0 ? 'Open the first wish ✦' : wi >= wishes.length ? 'All wishes opened ♡' : 'Open next wish →'}
        </button>
        <div class="experience-result" id="jarResult"></div>
      </div>`;
    body.querySelector('#jarBtn')?.addEventListener('click', () => {
      const jar = body.querySelector('#jarWrap');
      jar.classList.add('jar-open');
      body.querySelector('#jarWish').textContent = wishes[wi];
      body.querySelector('#jarResult').innerHTML = `<strong>${wi + 1}.</strong> ${wishes[wi]}`;
      wi++;
      setTimeout(() => { jar.classList.remove('jar-open'); show(); }, 1200);
    });
  }
  show();
}

/* 15 – Friendship Contract */
function buildContract(body) {
  const clauses = C.promises.map(c => `<div class="contract-clause">${c}</div>`).join('');
  body.innerHTML = `<div class="experience contract-experience">
    <div class="contract-header">
      <div class="contract-title">THE FRIENDSHIP CONTRACT</div>
      <div class="contract-subtitle">Between: Your Best Friend & Naseehfa · Valid: Forever</div>
    </div>
    <div class="contract-clauses">${clauses}</div>
    <div class="contract-seal">*No paperwork. No expiry date. Just care. ♡</div>
  </div>`;
}

/* 16 – Compliment Machine */
function buildComplimentMachine(body) {
  const comps = C.compliments;
  let ci = Math.floor(Math.random() * comps.length);
  function show() {
    body.innerHTML = `
      <div class="experience compliment-experience">
        <div class="experience-ribbon">THE COMPLIMENT MACHINE</div>
        <div class="compliment-star-row">${'<span class="cstar">★</span>'.repeat(5)}</div>
        <div class="compliment-display">
          <p class="compliment-text">"${comps[ci]}"</p>
        </div>
        <button class="experience-action" id="compBtn" type="button">Another compliment ✦</button>
      </div>`;
    body.querySelector('#compBtn').addEventListener('click', () => {
      ci = (ci + 1 + Math.floor(Math.random() * (comps.length - 1))) % comps.length;
      show();
    });
  }
  show();
}

/* 17 – Open-When Letters */
function buildOpenWhen(body) {
  const letters = C.openWhen;
  let activeIdx = -1;
  function render() {
    body.innerHTML = `
      <div class="experience openWhen-experience">
        <div class="experience-ribbon">OPEN-WHEN LETTERS</div>
        <p>Tap an envelope to read what's inside.</p>
        <div class="envelope-grid">
          ${letters.map((l, i) => `
            <button class="envelope-btn${activeIdx === i ? ' ow-open' : ''}" data-idx="${i}" type="button">
              <span class="env-flap"></span>
              <span class="env-icon">${l.icon}</span>
              <span class="env-label">${l.label}</span>
            </button>`).join('')}
        </div>
        ${activeIdx >= 0 ? `<div class="ow-message-wrap">
          <div class="ow-message-label">${letters[activeIdx].label}</div>
          <p class="ow-message-text">${letters[activeIdx].message}</p>
        </div>` : ''}
      </div>`;
    body.querySelectorAll('.envelope-btn').forEach(btn => btn.addEventListener('click', function () {
      const idx = Number(this.dataset.idx);
      activeIdx = activeIdx === idx ? -1 : idx;
      render();
    }));
  }
  render();
}

/* 18 – 25 Wishes */
function buildWishes25(body) {
  const wishes = C.wishes;
  const items = wishes.map((w, i) => `
    <div class="wish25-item" style="animation-delay:${i * .06}s">
      <span class="wish25-num">${String(i + 1).padStart(2, '0')}</span>
      <span>${w}</span>
    </div>`).join('');
  body.innerHTML = `<div class="experience wishes25-experience">
    <div class="experience-ribbon">A UNIVERSE OF 25 WISHES</div>
    <div class="wish25-grid">${items}</div>
    <div class="experience-stamp">ALL 25, JUST FOR YOU ✦</div>
  </div>`;
}

/* 19 – Cake Ceremony */
function buildCakeCeremony(body) {
  body.innerHTML = `
    <div class="experience cake-experience">
      <div class="cake-stage">
        <div class="cake-glow"></div>
        <div class="cake-stand">
          <div class="cake-stand-top"></div>
          <div class="cake-stand-stem"></div>
          <div class="cake-stand-foot"></div>
        </div>
        <div class="cake-plate"></div>
        <div class="cake">
          <div class="luxury-topper">
            <span class="topper-monogram">N</span>
            <small>NASI · 25</small>
          </div>
          <div class="cake-top">
            <span class="cake-number">25</span>
            <span class="cake-candle c1"></span>
            <span class="cake-candle c2"></span>
            <span class="cake-candle c3"></span>
            <span class="cake-flame f1"></span>
            <span class="cake-flame f2"></span>
            <span class="cake-flame f3"></span>
            <span class="gold-leaf leaf-one">✦</span>
            <span class="gold-leaf leaf-two">✦</span>
            <span class="gold-leaf leaf-three">✦</span>
            <span class="pearl pearl-one"></span>
            <span class="pearl pearl-two"></span>
            <span class="pearl pearl-three"></span>
            <span class="pearl pearl-four"></span>
          </div>
          <div class="cake-cream cream-one"></div>
          <div class="cake-layer layer-one"></div>
          <div class="cake-cream cream-two"></div>
          <div class="cake-layer layer-two"></div>
          <div class="cake-cream cream-three"></div>
          <span class="cake-slice"></span>
        </div>
        <span class="cake-knife"><span class="knife-blade"></span><span class="knife-handle"></span></span>
        <div class="slice-plate"></div>
        <div class="cake-plate"></div>
      </div>
      <p class="candle-note">Make a wish while the candles glow ✨</p>
      <p>Close your eyes, make a wish, and blow out the candles!</p>
      <button class="experience-action" id="cutCakeBtn" type="button">🎂 Make your wish &amp; cut the cake</button>
      <div class="clap-track" aria-hidden="true">👏 👏 👏 👏 👏</div>
      <div class="experience-result" id="cakeResult"></div>
    </div>`;
  body.querySelector('#cutCakeBtn').addEventListener('click', function () {
    body.querySelector('.cake-experience').classList.add('cake-cut');
    this.textContent = '✨ Wish made!';
    this.disabled = true;
    $('cakeResult') && ($('cakeResult').innerHTML = '<strong>🕯️ Candles blown out — wish sent to the universe!</strong><br>Happy 25th Birthday, Naseehfa! 🎂');
    body.querySelector('#cakeResult').innerHTML = '<strong>🕯️ Wish made — candles gently blown out!</strong><br>Happy 25th Birthday, Naseehfa! 💗';
    burstConfetti(90);
    playChime([440, 554, 659, 784, 880]);
    showToast('Happy Birthday, Naseehfa! ✨');
  });
}

/* 20 – Grand Finale */
function buildGrandFinale(body) {
  body.innerHTML = `
    <div class="experience finale-experience">
      <div class="finale-exp-fireworks">
        <canvas id="fireworksCanvas"></canvas>
      </div>
      <p class="finale-exp-title">Happy 25th Birthday, Naseehfa! 🎉</p>
      <p class="tamil" style="font-size:15px;line-height:2;">${C.finaleMessage.tamilFinal.replace(/\n/g, '<br>')}</p>
      <p>${C.finaleMessage.letter[0]}</p>
      <button class="experience-action finale-launch-btn" id="launchFW" type="button">🎆 Launch the finale!</button>
      <div class="experience-result" id="fwResult"></div>
    </div>`;

  // Fireworks canvas
  const canvas = body.querySelector('#fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], fwRaf = 0, fwStarted = false;

  function fwResize() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fwResize();

  function fwBurst(x, y, color) {
    for (let n = 0; n < 65; n++) {
      const angle = Math.random() * Math.PI * 2, speed = 1.2 + Math.random() * 3.5;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: 1 + Math.random() * 2 });
    }
  }
  function fwAnimate() {
    const r = canvas.getBoundingClientRect();
    ctx.fillStyle = 'rgba(7,13,42,.18)'; ctx.fillRect(0, 0, r.width, r.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .04; p.life -= .011;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (fwStarted) fwRaf = requestAnimationFrame(fwAnimate);
  }

  body.querySelector('#launchFW').addEventListener('click', function () {
    this.disabled = true; this.textContent = '🎉 Finale launched!';
    fwStarted = true; fwResize(); fwAnimate();
    const r = canvas.getBoundingClientRect();
    const colors = ['#ff719f', '#ffd477', '#82e4ff', '#cf9bff', '#91f0bc', '#E8C982'];
    [.15, .35, .5, .65, .85].forEach((p, i) => setTimeout(() => fwBurst(r.width * p, r.height * (.2 + Math.random() * .4), colors[i % colors.length]), i * 400));
    body.querySelector('#fwResult').innerHTML = '<strong>🎊 Happy 25th Birthday, Naseehfa! ✦</strong><br>This celebration is entirely yours. ♡';
    burstConfetti(150);
    playChime([440, 554, 659, 784, 880, 1047]);
    showToast('Happy 25th Birthday, Naseehfa! 🎉✨');
  });

  // cleanup when dialog closes
  dialog.addEventListener('close', () => { fwStarted = false; cancelAnimationFrame(fwRaf); }, { once: true });
}

/* ══════════════════════════════════════════════════════════════
   14. CONSTELLATION SECTION
══════════════════════════════════════════════════════════════ */
(function initConstellation() {
  const canvas = $('constellationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const msgEl = $('starMessages');

  const FRIENDSHIP_MSGS = [
    "You are someone who notices the things others miss.",
    "The way you support people is one of your greatest gifts.",
    "You make ordinary moments feel meaningful.",
    "Your kindness is quiet, consistent, and real.",
    "You check on people because you genuinely care.",
    "You are the kind of friend everyone hopes to find.",
    "You encourage others without making them feel small.",
    "Your presence makes difficult days easier.",
    "You carry warmth wherever you go.",
    "You are irreplaceable, Naseehfa. ♡",
    "Thank you for being exactly who you are.",
    "The world is a little better because you're in it."
  ];

  let W, H, stars = [];

  function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = rect.width; H = rect.height;
    placeStars();
  }

  function placeStars() {
    stars = FRIENDSHIP_MSGS.map((msg, i) => ({
      x: 0.08 + (i % 4) * 0.27 + Math.random() * .1,
      y: 0.15 + Math.floor(i / 4) * 0.33 + Math.random() * .1,
      r: 5 + Math.random() * 4,
      pulse: Math.random() * Math.PI * 2,
      clicked: false,
      msg
    }));
  }

  let animating = true;
  function draw() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);

    // draw constellation lines
    ctx.strokeStyle = 'rgba(232,201,130,.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < stars.length - 1; i++) {
      const a = stars[i], b = stars[i + 1];
      ctx.beginPath();
      ctx.moveTo(a.x * W, a.y * H);
      ctx.lineTo(b.x * W, b.y * H);
      ctx.stroke();
    }

    // draw stars
    stars.forEach((s, i) => {
      s.pulse += .04;
      const glow = s.clicked ? 16 : 8 + Math.sin(s.pulse) * 3;
      const alpha = s.clicked ? 1 : .55 + Math.sin(s.pulse) * .25;
      const grad = ctx.createRadialGradient(s.x * W, s.y * H, 0, s.x * W, s.y * H, glow * 2);
      grad.addColorStop(0, s.clicked ? 'rgba(232,201,130,.9)' : 'rgba(245,184,206,.8)');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, glow * 2, 0, Math.PI * 2);
      ctx.fill();

      // star core
      ctx.globalAlpha = 1;
      ctx.fillStyle = s.clicked ? '#E8C982' : '#FFF';
      ctx.shadowColor = s.clicked ? '#E8C982' : '#F5B8CE';
      ctx.shadowBlur = glow;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r * (1 + Math.sin(s.pulse) * .15), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // label
      ctx.globalAlpha = .5;
      ctx.fillStyle = '#E8C982';
      ctx.font = '9px "DM Sans"';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1).padStart(2, '0'), s.x * W, s.y * H + s.r + 14);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  function handleTap(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    let hit = false;
    stars.forEach(s => {
      const dx = s.x * W - mx, dy = s.y * H - my;
      if (Math.sqrt(dx * dx + dy * dy) < 24) {
        s.clicked = true;
        msgEl.textContent = s.msg;
        msgEl.style.opacity = '0';
        requestAnimationFrame(() => { msgEl.style.transition = 'opacity .5s'; msgEl.style.opacity = '1'; });
        hit = true;
        burstConfetti(12);
        playChime([659, 880]);
      }
    });
    if (!hit && msgEl.textContent) {
      msgEl.style.opacity = '.4';
    }
  }

  canvas.addEventListener('click', e => handleTap(e.clientX, e.clientY));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; handleTap(t.clientX, t.clientY); }, { passive: false });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   15. START BUTTON (Hero)
══════════════════════════════════════════════════════════════ */
$('startBtn').addEventListener('click', () => {
  document.body.classList.add('birthday-unlocked');
  burstConfetti(120);
  playChime([440, 554, 659, 784, 880]);
  showToast('Birthday magic unlocked for Naseehfa! ✨');
  $('surprises').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => openSurprise(0), 700);
});

/* ══════════════════════════════════════════════════════════════
   16. FINALE CONFETTI BUTTON
══════════════════════════════════════════════════════════════ */
$('confettiBtn').addEventListener('click', () => {
  burstConfetti(120);
  playChime([523, 659, 784, 1047]);
  showToast('Happy 25th Birthday, Naseehfa! 🎉');
});

/* ══════════════════════════════════════════════════════════════
   17. ACTIVE NAV HIGHLIGHT
══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = ['home', 'surprises', 'poems', 'constellation', 'finale'];
  const navItems = document.querySelectorAll('.nav-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navItems.forEach(n => n.classList.toggle('active', n.dataset.section === e.target.id));
      }
    });
  }, { threshold: .35 });
  sections.forEach(id => { const el = $(id); if (el) observer.observe(el); });
})();

/* ══════════════════════════════════════════════════════════════
   18. INIT
══════════════════════════════════════════════════════════════ */
populateStaticContent();
renderGrid();
updateProgress();
