/* ============================================================
   LUNSAD — game engine
   Screen flow, vertical world camera, quiz loop, boosters,
   streaks, persistence, and tiny WebAudio SFX.
   ============================================================ */

'use strict';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------------- persistence ---------------- */
const PROFILE_KEY = 'lunsad_profile';
const PROFILE_VERSION = 2; // bump when the profile schema changes
/* ---------------- daily streak — play-at-least-one-mission-per-day ---------------- */
function bumpDailyStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (profile.lastPlayDay === today) return;         // already counted today
  profile.streakDays = profile.lastPlayDay === y ? (profile.streakDays || 0) + 1 : 1;
  profile.lastPlayDay = today;
  saveProfile();
}

const profile = loadProfile();

function loadProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: '', avatar: '👨‍🚀', dust: 0, bestAlt: 0 };
    if (p.v !== PROFILE_VERSION) {
      p.v = PROFILE_VERSION;
      p.seenLocal = p.seenLocal ?? false;
      p.streakDays = p.streakDays ?? 0;
      p.lastPlayDay = p.lastPlayDay ?? '';
      p.daily = p.daily ?? { day: '', seed: 0, bestAlt: 0, plays: 0 };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    }
    return p;
  } catch { return { v: PROFILE_VERSION, name: '', avatar: '👨‍🚀', dust: 0, bestAlt: 0, seenLocal: false, streakDays: 0, lastPlayDay: '', daily: { day: '', seed: 0, bestAlt: 0, plays: 0 } }; }
}
function saveProfile() { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }

/* deterministic daily seed — same questions for everyone on the same day */
function dailySeed() {
  const day = new Date().toISOString().slice(0, 10);
  if (profile.daily?.day !== day) {
    let h = 0;
    for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    profile.daily = { day, seed: h, bestAlt: 0, plays: 0 };
    saveProfile();
  }
  return profile.daily.seed;
}

/* ---------------- screens ---------------- */
function show(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

/* ---------------- tiny synth ---------------- */
let audioCtx = null;
function beep(freq, dur, type = 'sine', gain = 0.08, when = 0) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t); osc.stop(t + dur);
  } catch { /* audio unavailable */ }
}
const sfx = {
  click:  () => beep(660, 0.08, 'square', 0.04),
  correct:() => { beep(523, 0.12, 'triangle', 0.09); beep(784, 0.16, 'triangle', 0.09, 0.1); beep(1046, 0.22, 'triangle', 0.08, 0.2); },
  wrong:  () => { beep(220, 0.25, 'sawtooth', 0.08); beep(140, 0.35, 'sawtooth', 0.08, 0.12); },
  thrust: () => { beep(180, 0.5, 'sawtooth', 0.05); beep(320, 0.5, 'sawtooth', 0.04, 0.08); },
  launch: () => { beep(120, 0.9, 'sawtooth', 0.07); beep(240, 0.9, 'triangle', 0.06, 0.15); },
  warp:   () => { beep(880, 0.1, 'square', 0.05); beep(440, 0.18, 'square', 0.05, 0.1); },
  fail:   () => { beep(196, 0.4, 'sawtooth', 0.09); beep(130, 0.6, 'sawtooth', 0.09, 0.25); beep(98, 0.8, 'sawtooth', 0.09, 0.5); },
  radar:  () => { beep(1200, 0.06, 'square', 0.05); beep(1200, 0.06, 'square', 0.05, 0.09); },
  scan:   () => { beep(392, 0.1, 'sine', 0.07); beep(588, 0.14, 'sine', 0.07, 0.1); },
  boostArm:() => { beep(330, 0.1, 'sawtooth', 0.07); beep(660, 0.12, 'sawtooth', 0.07, 0.08); beep(990, 0.16, 'sawtooth', 0.06, 0.16); },
  shieldUp:() => { beep(440, 0.15, 'triangle', 0.08); beep(440, 0.15, 'triangle', 0.08, 0.2); },
  tick:   () => beep(1000, 0.05, 'square', 0.045)
};

/* ============================================================
   WORLD BUILD — zones stacked from galaxy (top) to earth (bottom)
   ============================================================ */
const worldInner = $('#world-inner');

function buildWorld() {
  worldInner.innerHTML = '';
  worldInner.style.height = WORLD_TOP + 'px';
  [...ZONES].reverse().forEach(zone => {
    const el = document.createElement('div');
    el.className = 'zone';
    el.id = 'zone-' + zone.id;
    el.style.height = zone.span + 'px';
    el.style.top = (WORLD_TOP - zone.alt - zone.span) + 'px';
    el.style.background = `linear-gradient(180deg, ${zone.skyTop} 0%, ${zone.skyBottom} 100%)`;
    el.innerHTML = `
      <div class="zone-banner"><b>${zone.icon} ${zone.name}</b><span>${zone.tag}</span></div>
      <div class="tw-stars"></div>
      ${decorationsFor(zone.id)}`;
    worldInner.appendChild(el);
  });
  buildAltimeter();
  seedTwinkles();
}

/* staggered blinking stars — one cheap layer per zone */
function seedTwinkles() {
  if (!CONFIG.twinkleStars) return;
  $$('.tw-stars').forEach(layer => {
    layer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div');
      s.className = 'tw-star';
      s.style.left = (4 + Math.random() * 88) + '%';
      s.style.top = (6 + Math.random() * 55) + '%';
      const size = Math.random() < 0.3 ? 4 : 3;
      s.style.width = s.style.height = size + 'px';
      s.style.animationDuration = (2.2 + Math.random() * 2.8) + 's';
      s.style.animationDelay = (-Math.random() * 5) + 's';
      layer.appendChild(s);
    }
  });
}

function decorationsFor(id) {
  switch (id) {
    case 'earth':
      return `
        <div class="deco deco-ground"></div>
        ${groundDetail()}
        <div class="deco" style="left:7%;bottom:26%;width:64px">${px(PXART.tree)}</div>
        <div class="deco" style="left:20%;bottom:14%;width:44px">${px(PXART.tree)}</div>
        <div class="deco" style="right:9%;bottom:24%;width:56px">${px(PXART.tree)}</div>
        <div class="deco" style="right:22%;bottom:12%;width:52px">${px(PXART.bush)}</div>
        <div class="deco" style="left:33%;bottom:8%;width:44px">${px(PXART.bush)}</div>
        <div class="deco deco-pad"></div>
        <div class="deco deco-sun" style="top:8%;right:10%;width:110px">${px(PXART.sun)}</div>
        <div class="deco cloud drift" style="top:16%;left:9%;width:170px">${px(PXART.cloud)}</div>
        <div class="deco cloud drift c2" style="top:32%;right:7%;width:120px">${px(PXART.cloud)}</div>`;
    case 'clouds':
      return `
        <div class="deco cloud drift" style="top:10%;left:6%;width:190px">${px(PXART.cloud)}</div>
        <div class="deco cloud drift c2" style="top:34%;right:5%;width:230px">${px(PXART.cloud)}</div>
        <div class="deco cloud drift c3" style="top:58%;left:18%;width:150px">${px(PXART.cloud)}</div>
        <div class="deco cloud drift" style="top:78%;right:20%;width:180px">${px(PXART.cloud)}</div>`;
    case 'atmosphere':
      return `
        <div class="deco cloud drift" style="top:66%;left:8%;width:160px;opacity:0.55">${px(PXART.cloud)}</div>
        <div class="deco cloud drift c2" style="top:80%;right:10%;width:130px;opacity:0.45">${px(PXART.cloud)}</div>
        ${starField(10)}`;
    case 'stratosphere':
      return `
        <div class="deco float-slow" style="top:16%;left:14%;width:64px">${px(PXART.balloon)}</div>
        ${starField(26)}`;
    case 'orbit':
      return `
        <div class="deco float-slow" style="top:20%;left:13%;width:110px">${px(PXART.satellite)}</div>
        <div class="deco float-slow" style="top:58%;right:10%;width:74px;opacity:0.75">${px(PXART.satellite)}</div>
        ${starField(46)}`;
    case 'moon':
      return `
        <div class="deco deco-moon-svg" style="top:14%;left:10%;width:120px">${px(PXART.moon)}</div>
        ${starField(56)}`;
    case 'deepspace':
      return `
        <div class="deco deco-saturn-svg float-slow" style="top:18%;right:6%;width:230px">${px(PXART.saturn)}</div>
        ${starField(70)}`;
    case 'galaxy':
      return `
        <div class="deco deco-galaxy-svg" style="top:12%;left:50%;width:240px;margin-left:-120px">${px(PXART.galaxy)}</div>
        ${starField(90)}`;
    default: return '';
  }
}

function groundDetail() {
  let out = '';
  for (let i = 0; i < 9; i++) {
    const x = 4 + i * 11 + (i % 3) * 2;
    out += `<div class="deco sway" style="left:${x}%;bottom:1.5%;width:${i % 2 ? 22 : 16}px;animation-delay:${(i * 0.7) % 3}s">${px(PXART.grassTuft)}</div>`;
  }
  [[14, 3.5, 26], [46, 2, 20], [78, 4, 24]].forEach(([x, b, w], i) => {
    out += `<div class="deco" style="left:${x}%;bottom:${b}%;width:${w}px;opacity:0.9">${px(PXART.rock)}</div>`;
  });
  return out;
}

function starField(n) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100, y = Math.random() * 100, s = Math.random() * 2 + 1;
    out += `<div class="deco deco-star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*3).toFixed(1)}s"></div>`;
  }
  return out;
}

/* ============================================================
   GAME STATE
   ============================================================ */
/* ============================================================
   GAME CONFIG — visual polish toggles (no gameplay effect)
   ============================================================ */
const CONFIG = {
  easterEggs: true,   // alien peek / UFO abduction ambient events
  asteroid: true,     // occasional debris drifting across the top
  twinkleStars: true, // staggered blinking stars in every zone
};

const G = {
  active: false,
  altitude: 0,
  energy: TUNING.startEnergy,
  dust: 0,
  streak: 0,
  maxStreak: 0,
  correct: 0,
  qIndex: 0,
  questions: [],
  boosts: {},
  armed: { boost: false, shield: false },
  answered: false,
  timer: null,
  timeLeft: 0,
  currentZone: ZONES[0]
};

function zoneAt(alt) {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (alt >= ZONES[i].alt) return ZONES[i];
  }
  return ZONES[0];
}

/* ---------------- momentum camera ----------------
   setAltitude only sets a target; a rAF loop eases the camera
   toward it so climbs/falls feel physical, and drives every
   velocity-linked effect (counter, streaks, parallax, tape). */
const cam = { pos: 0, target: 0 };
let lastZone = null;

function setAltitude(a, snap = false) {
  G.altitude = Math.max(0, Math.min(a, WORLD_TOP - window.innerHeight * 0.5));
  cam.target = G.altitude;
  if (snap) cam.pos = cam.target;
}

function cameraLoop() {
  const diff = cam.target - cam.pos;
  cam.pos += diff * 0.085;
  if (Math.abs(diff) < 0.4) cam.pos = cam.target;

  worldInner.style.transform = `translateY(${cam.pos}px)`;
  $('#hud-alt').textContent = fmtAlt(cam.pos);
  $('#alt-marker').style.bottom = `calc(${(cam.pos / WORLD_TOP) * 100}% - 7px)`;

  const stars = $('#para-stars');
  stars.style.transform = `translateY(${cam.pos * 0.32}px)`;
  stars.classList.toggle('on', cam.pos > ZONES[2].alt);

  const lines = $('#speedlines');
  lines.style.opacity = Math.min(0.85, Math.abs(diff) / 900);
  lines.classList.toggle('falling', diff < -1);

  const zone = zoneAt(cam.pos);
  if (zone !== lastZone) {
    lastZone = zone;
    G.currentZone = zone;
    $('#hud-zone').textContent = zone.name;
    if (G.active && cam.pos > 100) zoneBanner(zone);
  }
  updateAltimeterState();
  requestAnimationFrame(cameraLoop);
}

/* ============================================================
   AMBIENT EVENTS — asteroid drift + easter eggs
   Purely decorative; gated behind CONFIG, cleaned up on mission end.
   ============================================================ */
let ambientTimer = null;

function spawnAsteroid() {
  if (!CONFIG.asteroid || !G.active) return;
  const layer = $('#ambient-layer');
  const a = document.createElement('div');
  a.className = 'ambient-asteroid';
  const size = 16 + Math.random() * 14;
  const fromRight = Math.random() < 0.5;
  a.style.top = (6 + Math.random() * 14) + 'vh';
  a.style.width = size + 'px';
  a.innerHTML = px(PXART.rock);
  a.style.animationName = fromRight ? 'astDriftL' : 'astDriftR';
  layer.appendChild(a);
  setTimeout(() => a.remove(), 24000);
}

function spawnEasterEgg() {
  if (!CONFIG.easterEggs || !G.active) return;
  const layer = $('#ambient-layer');
  const type = Math.random() < 0.5 ? 'alien' : 'ufo';
  const wrap = document.createElement('div');
  wrap.className = 'ee ee-' + type;
  if (type === 'alien') {
    wrap.innerHTML = `<div class="ee-alien-svg">${px(PXART.alien)}</div><div class="ee-alien-arm"></div>`;
  } else {
    wrap.innerHTML = `
      <div class="ee-ufo-svg">${px(PXART.ufo)}</div>
      <div class="ee-beam"></div>
      <div class="ee-cow">${px(PXART.cow)}</div>`;
  }
  layer.appendChild(wrap);
  setTimeout(() => wrap.remove(), 9000);
}

function ambientTick() {
  if (document.hidden || !G.active) return;
  if (Math.random() < 0.35) spawnAsteroid();
  else if (Math.random() < 0.22) spawnEasterEgg();
}

function startAmbient() {
  stopAmbient();
  ambientTimer = setInterval(ambientTick, 24000);
  setTimeout(ambientTick, 6000); // first surprise lands early in the flight
}

function stopAmbient() {
  if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
  $('#ambient-layer').innerHTML = '';
}

function zoneBanner(zone) {
  const el = $('#zone-banner-flash');
  $('#zbf-name').textContent = zone.icon + ' ' + zone.name;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

function buildAltimeter() {
  const ticks = $('#alt-ticks');
  ticks.innerHTML = '';
  ZONES.forEach(zone => {
    const t = document.createElement('div');
    t.className = 'alt-tick zone-tick';
    t.id = 'altick-' + zone.id;
    t.style.bottom = (zone.alt / WORLD_TOP) * 100 + '%';
    t.innerHTML = `<em>${zone.label.toUpperCase()}</em>`;
    ticks.appendChild(t);
  });
  if (!$('#alt-rocket')) {
    const r = document.createElement('div');
    r.id = 'alt-rocket';
    r.innerHTML = pxIcon('rocket');
    $('#altimeter').appendChild(r);
  }
}

function updateAltimeterState() {
  const cur = zoneAt(G.altitude);
  ZONES.forEach(z => {
    const el = $('#altick-' + z.id);
    if (el) el.classList.toggle('active', z.id === cur.id);
  });
  const r = $('#alt-rocket');
  if (r) r.style.bottom = `calc(${(G.altitude / WORLD_TOP) * 100}% - 8px)`;
}

function fmtAlt(a) { return Math.round(a).toLocaleString('en-US') + 'm'; }

/* ---------------- mission setup ---------------- */
/* seeded RNG — deterministic question set for the Daily Mission */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function drawQuestions(seed) {
  const rng = seed == null ? Math.random : mulberry32(seed);
  const by = d => QUESTIONS.filter(q => q.d === d);
  const pick = (arr, n) => arr.sort(() => rng() - 0.5).slice(0, n);
  return [...pick(by(1), 3), ...pick(by(2), 4), ...pick(by(3), 3)];
}

function startMission(mode, seed) {
  Object.assign(G, {
    active: true, altitude: 0, energy: TUNING.startEnergy, dust: 0,
    streak: 0, maxStreak: 0, correct: 0, qIndex: 0,
    mode: mode || 'solo',
    questions: drawQuestions(mode === 'daily' ? seed : undefined),
    boosts: { radar: 2, scan: 2, boost: 1, shield: 1, warp: 1 },
    armed: { boost: false, shield: false },
    charged: false,
    answered: false, currentZone: ZONES[0]
  });
  bumpDailyStreak();
  buildWorld();
  show('#screen-game');
  $('#vignette').classList.remove('danger');
  lastZone = ZONES[0];
  renderEnergy();
  $('#hud-dust b').textContent = '0';
  $('#hud-streak').textContent = '';
  $('#ship').className = 'ship-fly';
  updateBoostBar();
  setAltitude(0, true);
  updateAltimeterState();
  startAmbient();
  $('#question-panel').classList.add('hidden');
  $('#fact-toast').classList.add('hidden');

  runCountdown(() => {
    readout('🚀 LIFTOFF', 'good');
    sfx.launch();
    $('#ship').classList.add('thrusting');
    setAltitude(260);
    setTimeout(() => {
      $('#ship').classList.remove('thrusting');
      nextQuestion();
    }, 1900);
  });
}

function runCountdown(done) {
  const cd = $('#countdown');
  cd.classList.remove('hidden');
  const steps = ['3', '2', '1', 'LUNSAD!'];
  steps.forEach((s, i) => {
    setTimeout(() => {
      cd.innerHTML = `<span class="${s === 'LUNSAD!' ? 'go' : ''}">${s}</span>`;
      beep(s === 'LUNSAD!' ? 880 : 440, 0.12, 'square', 0.06);
      if (i === steps.length - 1) {
        setTimeout(() => { cd.classList.add('hidden'); cd.innerHTML = ''; done(); }, 900);
      }
    }, i * 750);
  });
}

function spawnParticles(kind, count) {
  const layer = $('#particle-layer');
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'p ' + kind;
    p.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
    p.style.left = `calc(50% + ${(Math.random() * 44 - 22).toFixed(0)}px)`;
    p.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}

/* ---------------- question flow ---------------- */
function nextQuestion() {
  if (!G.active) return;
  if (G.qIndex >= TUNING.roundSize) return endMission(true);
  G.answered = false;
  const q = G.questions[G.qIndex];
  $('#hud-q').textContent = `Q ${String(G.qIndex + 1).padStart(2, '0')}/${TUNING.roundSize}`;

  const diffEl = $('#q-diff');
  diffEl.className = 'q-diff d' + q.d;
  diffEl.textContent = ['', `EASY · +${TUNING.thrust[1]}m`, `MEDIUM · +${TUNING.thrust[2]}m`, `HARD · +${TUNING.thrust[3]}m`][q.d];

  $('#q-text').textContent = q.q;
  $('#q-hint').classList.add('hidden');
  const opts = $('#q-options');
  opts.innerHTML = '';
  q.a.forEach((text, i) => {
    const b = document.createElement('button');
    b.className = 'q-opt';
    b.innerHTML = `<kbd class="opt-key">${i + 1}</kbd><span>${text}</span>`;
    b.onclick = () => answer(i);
    opts.appendChild(b);
  });
  $('#question-panel').classList.remove('hidden', 'locked');
  updateBoostBar();
  startTimer();
}

function startTimer() {
  clearInterval(G.timer);
  G.timeLeft = TUNING.questionTime;
  const bar = $('#q-timer-bar');
  bar.classList.remove('low');
  bar.style.width = '100%';
  let lastTickSecond = -1;
  G.timer = setInterval(() => {
    G.timeLeft -= 0.1;
    bar.style.width = Math.max(0, (G.timeLeft / TUNING.questionTime) * 100) + '%';
    bar.classList.toggle('low', G.timeLeft <= 8);
    if (G.timeLeft <= 10 && G.timeLeft > 0) { // audible urgency in the final stretch
      const sec = Math.floor(G.timeLeft);
      if (sec !== lastTickSecond) { lastTickSecond = sec; sfx.tick(); }
    }
    if (G.timeLeft <= 0) {
      clearInterval(G.timer);
      answer(-1); // timeout = wrong
    }
  }, 100);
}

function answer(i) {
  if (G.answered || !G.active) return;
  G.answered = true;
  clearInterval(G.timer);
  $('#question-panel').classList.add('locked');
  const q = G.questions[G.qIndex];
  const opts = $$('.q-opt');
  opts.forEach(o => o.disabled = true);

  const correct = i === q.c;
  opts[q.c].classList.add('correct');
  if (correct) onCorrect(q);
  else {
    if (i >= 0) opts[i].classList.add('wrong');
    onWrong(q, i === -1);
  }

  setTimeout(() => {
    $('#fact-toast').classList.add('hidden');
    G.qIndex++;
    nextQuestion();
  }, 3200);
}

function onCorrect(q) {
  const mult = (G.armed.boost ? 2 : 1);
  const streakBonus = 1 + 0.1 * Math.min(G.streak, 5);
  const gain = Math.round(TUNING.thrust[q.d] * mult * streakBonus);
  G.armed.boost = false;
  $$('.boost-btn').forEach(b => b.classList.remove('armed'));

  G.correct++;
  G.streak++;
  G.maxStreak = Math.max(G.maxStreak, G.streak);
  const dustGain = [0, TUNING.dust.easy, TUNING.dust.medium, TUNING.dust.hard][q.d]
    + (G.streak === 3 ? TUNING.dust.streak3 : 0)
    + (G.streak === 5 ? TUNING.dust.streak5 : 0);
  addDust(dustGain);

  sfx.correct(); sfx.thrust();
  flash('good');
  spawnParticles('p-dust', 14);
  readout(`⚡ THRUST +${gain.toLocaleString()}m`, 'good');
  $('#ship').classList.add('thrusting');
  $('#ship').classList.toggle('overdrive', G.streak >= 5);
  setAltitude(G.altitude + gain);
  setTimeout(() => $('#ship').classList.remove('thrusting'), 1300);

  const milestone = TUNING.streakNames[G.streak];
  $('#hud-streak').textContent = G.streak >= 2
    ? `🔥 ×${G.streak}${milestone ? ' ' + milestone : ''}` : '';
  showFact();
}

function onWrong(q, timedOut) {
  G.streak = 0;
  $('#hud-streak').textContent = '';
  $('#ship').classList.remove('overdrive');
  G.energy--;
  renderEnergy();
  $('#vignette').classList.toggle('danger', G.energy === 1);

  let drop = TUNING.wrongDrop;
  let blocked = false;
  if (G.armed.shield) { drop = 0; blocked = true; G.armed.shield = false; }
  $('#ship').classList.toggle('shielded', G.armed.shield);

  sfx.wrong();
  flash('bad');
  spawnParticles('p-smoke', 10);
  $('#question-panel').classList.add('shake-once');
  readout(timedOut ? '⏱️ TIME\u2019S UP — STALL!' : (blocked ? '🛡️ SHIELD HELD — 0m' : `⚠️ ENGINE FAILURE −${drop.toLocaleString()}m`), 'bad');
  $('#ship').classList.add('shake', 'stalling');
  setAltitude(G.altitude - drop);
  setTimeout(() => $('#ship').classList.remove('shake', 'stalling'), 1200);
  showFact();

  if (G.energy <= 0) {
    if (!G.charged) { // emergency recharge — once per mission
      G.charged = true;
      G.energy = 1;
      renderEnergy();
      sfx.shieldUp();
      readout('🔋 EMERGENCY RECHARGE — BACK UP!', 'good');
      $('#hud').classList.add('recharge-flash');
      setTimeout(() => $('#hud').classList.remove('recharge-flash'), 1200);
    } else {
      G.active = false;
      setTimeout(() => { sfx.fail(); endMission(false); }, 2000);
    }
    return;
  }
}

/* ---------------- mid-mission purchases — spend collected stardust ---------------- */
const BUY_COSTS = { radar: 40, scan: 40, boost: 80, shield: 80, warp: 120 };

function canAfford(kind) { return G.dust >= BUY_COSTS[kind]; }

/* ---------------- boosters ---------------- */
function parseDustButton(btn) {
  const kind = btn.dataset.boost;
  const buy = canAfford(kind) ? '' : 'data-icn="lock"';
  return { kind, buy };
}

function useBoost(kind) {
  if (!G.active || G.answered) return;
  const owned = G.boosts[kind] > 0;
  const buying = !owned && canAfford(kind);
  if (!owned && !buying) return;

  const q = G.questions[G.qIndex];
  const btn = $(`.boost-btn[data-boost="${kind}"]`);
  sfx.click();

  if (buying) { G.dust -= BUY_COSTS[kind]; } // pay in collected stardust

  switch (kind) {
    case 'radar': {
      sfx.radar();
      const wrongOpts = $$('.q-opt').filter((o, i) => i !== q.c && !o.classList.contains('eliminated'));
      const victim = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
      victim.classList.add('eliminated');
      victim.disabled = true;
      break;
    }
    case 'scan':
      sfx.scan();
      $('#q-hint').textContent = '🛰️ ' + q.hint;
      $('#q-hint').classList.remove('hidden');
      break;
    case 'boost':
      sfx.boostArm();
      G.armed.boost = true;
      btn.classList.add('armed');
      break;
    case 'shield':
      sfx.shieldUp();
      G.armed.shield = true;
      $('#ship').classList.add('shielded');
      btn.classList.add('armed');
      break;
    case 'warp': {
      G.boosts.warp--;
      sfx.warp();
      readout(`⏭️ WARP −${TUNING.warpCost}m`, 'bad');
      setAltitude(G.altitude - TUNING.warpCost);
      clearInterval(G.timer);
      G.answered = true;
      G.qIndex++;
      updateBoostBar();
      setTimeout(nextQuestion, 900);
      return;
    }
  }
  if (!buying) G.boosts[kind]--; // purchases don't consume the free inventory
  updateBoostBar();
}

function updateBoostBar() {
  $$('.boost-btn').forEach(btn => {
    const kind = btn.dataset.boost;
    const owned = G.boosts[kind] ?? 0;
    const price = BUY_COSTS[kind];
    const affordable = G.active && G.dust >= price;
    btn.querySelector('.boost-count').textContent = owned > 0 ? owned
      : (affordable ? '✨' + price : '0');
    btn.disabled = !G.active || G.answered || (owned <= 0 && !affordable)
      || (kind !== 'warp' && (G.armed.boost && kind === 'boost'));
    btn.classList.toggle('on-sale', owned <= 0 && affordable);
  });
  $('#hud-dust b').textContent = G.dust;
}

/* ---------------- feedback helpers ---------------- */
function readout(text, kind) {
  const el = $('#thrust-readout');
  el.textContent = text;
  el.className = '';
  void el.offsetWidth; // restart animation
  el.classList.add('show', kind);
}

function flash(kind) {
  const el = $('#feedback-flash');
  el.className = '';
  void el.offsetWidth;
  el.classList.add(kind);
}

function showFact() {
  const pool = FACTS[G.currentZone.factPool];
  const text = pool[Math.floor(Math.random() * pool.length)];
  const toast = $('#fact-toast');
  const el = $('#fact-text');
  toast.classList.remove('hidden');
  clearInterval(G.factTimer);
  let i = 0;
  el.textContent = '';
  G.factTimer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i % 8 === 0) beep(1200, 0.015, 'square', 0.012);
    if (i >= text.length) clearInterval(G.factTimer);
  }, 24);
}

function addDust(n) {
  G.dust += n;
  $('#hud-dust b').textContent = G.dust;
  updateBoostBar(); // affordability may have changed
  const el = $('#hud-dust');
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

/* ---------------- mission end ---------------- */
function countUp(el, to, fmt, dur = 1100) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

function endMission(completed) {
  clearInterval(G.timer);
  stopAmbient();
  G.active = false;
  $('#vignette').classList.remove('danger');
  $('#speedlines').style.opacity = 0;

  const finalAlt = G.altitude;
  const zone = zoneAt(finalAlt);
  let dustEarned = G.dust;
  if (completed) {
    dustEarned += TUNING.dust.mission;
    if (G.correct === TUNING.roundSize) dustEarned += TUNING.dust.perfect;
  }

  const isRecord = completed && finalAlt > profile.bestAlt;
  profile.dust += dustEarned;
  profile.bestAlt = Math.max(profile.bestAlt, finalAlt);
  saveProfile();

  // record daily attempt (local-only leaderboard for now)
  if (G.mode === 'daily') {
    const day = new Date().toISOString().slice(0, 10);
    profile.lastDaily = { day, altitude: G.altitude, correct: G.correct, at: Date.now() };
    if (completed) profile.daily.bestAlt = Math.max(profile.daily.bestAlt || 0, finalAlt);
    profile.daily.plays = (profile.daily.plays || 0) + 1;
    saveProfile();
  }

  $('#results-eyebrow').textContent = completed ? 'MISSION COMPLETE' : 'MISSION FAILED';
  $('#results-eyebrow').classList.toggle('results-eyebrow-fail', !completed);
  $('#results-title').textContent = completed
    ? `YOU REACHED ${zone.name}`
    : 'YOUR SHIP RAN OUT OF ENERGY';
  $('#results-record').classList.toggle('hidden', !isRecord);
  const grades = [[10, 'S'], [8, 'A'], [6, 'B'], [4, 'C'], [0, 'D']];
  $('#results-grade').textContent = grades.find(([min]) => G.correct >= min)[1];
  $('#res-correct').textContent = `${G.correct}/${TUNING.roundSize}`;
  $('#res-streak').textContent = '×' + G.maxStreak;
  if (G.mode === 'daily') {
    $('#res-streak').textContent += ' 🌅 DAILY SEED';
  }
  setTimeout(() => {
    show('#screen-results');
    countUp($('#res-alt'), finalAlt, v => fmtAlt(v));
    countUp($('#res-dust'), dustEarned, v => '+' + Math.round(v));
    if (isRecord) beep(660, 0.5, 'square', 0.05);
  }, completed ? 400 : 600);
}

/* ============================================================
   NAV / WIRING
   ============================================================ */
function goHangar() {
  $('#hangar-name').textContent = profile.name || 'Pilot';
  $('#hangar-avatar').textContent = profile.avatar;
  $('#hangar-dust').textContent = profile.dust.toLocaleString();
  $('#hangar-best').textContent = fmtAlt(profile.bestAlt);
  $('#hangar-alt-num').textContent = fmtAlt(profile.bestAlt);
  $('#hangar-streak').textContent = profile.streakDays || 0;
  updateDailyCard();
  show('#screen-hangar');
}

function updateDailyCard() {
  let seed;
  try { seed = dailySeed(); }
  catch { $('#daily-sub').textContent = 'seed error — solo only'; $('#mode-daily').onclick = null; return; }
  const sub = $('#daily-sub');
  const btn = $('#mode-daily');
  if (profile.daily?.plays > 0) {
    sub.textContent = `best: ${fmtAlt(profile.daily.bestAlt)} · plays ${profile.daily.plays}`;
  }
  const now = Date.now(), end = new Date().setHours(24, 0, 0, 0);
  const pad = n => String(n).padStart(2, '0');
  btn.title = `Today's seed · resets in ${pad(Math.floor((end - now) / 3.6e6))}:${pad(Math.floor(((end - now) % 3.6e6) / 6e4))}:${pad(Math.floor(((end - now) % 6e4) / 1e3))}`;
}

function openMap() {
  const track = $('#map-track');
  track.innerHTML = '';
  const ref = Math.max(profile.bestAlt, G.active ? G.altitude : 0);
  ZONES.forEach(zone => {
    const reached = ref >= zone.alt;
    const current = zoneAt(ref) === zone;
    const node = document.createElement('div');
    node.className = 'map-node ' + (current ? 'current' : reached ? 'reached' : 'locked');
    node.innerHTML = `<span class="map-icon">${zone.icon}</span>
      <div><b>${zone.name}</b><em>${fmtAlt(zone.alt)} — ${zone.tag}</em></div>`;
    track.appendChild(node);
  });
  $('#modal-map').classList.remove('hidden');
}

$('#btn-launch-start').onclick = () => {
  sfx.click();
  if (profile.name) goHangar();
  else { $('#onboard-via').textContent = 'MISSION CONTROL'; show('#screen-onboard'); }
};

$$('.btn-auth').forEach(b => b.onclick = () => {
  sfx.click();
  $('#onboard-via').textContent = 'VIA ' + b.dataset.auth.toUpperCase();
  show('#screen-onboard');
});

$('#avatar-row').onclick = e => {
  const btn = e.target.closest('.avatar-opt');
  if (!btn) return;
  $$('.avatar-opt').forEach(a => a.classList.remove('selected'));
  btn.classList.add('selected');
  profile.avatar = btn.dataset.avatar;
};

$('#btn-board').onclick = () => {
  const name = $('#pilot-name').value.trim();
  profile.name = name || 'Pilot';
  saveProfile();
  sfx.launch();
  goHangar();
};

$('#btn-play').onclick = () => { sfx.click(); startMission(); };
$('#mode-solo').onclick = () => { sfx.click(); startMission(); };
$('#mode-daily').onclick = () => { sfx.click(); startMission('daily', dailySeed()); };
$('#mode-map').onclick = () => { sfx.click(); openMap(); };
$('#btn-map-close').onclick = () => $('#modal-map').classList.add('hidden');
$('#btn-help-landing').onclick = () => { sfx.click(); $('#modal-help').classList.remove('hidden'); };
$('#btn-help-hangar').onclick = () => { sfx.click(); $('#modal-help').classList.remove('hidden'); };
$('#btn-help-close').onclick = () => { sfx.click(); $('#modal-help').classList.add('hidden'); };
$('#btn-again').onclick = () => { sfx.click(); startMission(); };
$('#btn-hangar').onclick = () => { sfx.click(); goHangar(); };
$('#btn-abandon').onclick = () => { clearInterval(G.timer); stopAmbient(); G.active = false; $('#vignette').classList.remove('danger'); goHangar(); };
$$('.boost-btn').forEach(b => b.onclick = () => useBoost(b.dataset.boost));

/* keyboard controls — arcade style */
document.addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const k = e.key.toLowerCase();
  const screen = ($('.screen.active') || {}).id;

  if (k === 'escape' && !$('#modal-help').classList.contains('hidden')) {
    $('#modal-help').classList.add('hidden'); return;
  }
  if (k === 'escape' && !$('#modal-map').classList.contains('hidden')) {
    $('#modal-map').classList.add('hidden'); return;
  }

  if (screen === 'screen-game') {
    if (['1', '2', '3', '4'].includes(k)) {
      const opts = $$('.q-opt');
      const i = +k - 1;
      if (opts[i] && !opts[i].disabled) { opts[i].classList.add('key-press'); answer(i); }
      return;
    }
    const boostKeys = { r: 'radar', s: 'scan', b: 'boost', h: 'shield', w: 'warp' };
    if (boostKeys[k]) { useBoost(boostKeys[k]); return; }
    if (k === 'escape') { $('#btn-abandon').click(); return; }
  }
  if (k === 'enter' || k === ' ') {
    if (screen === 'screen-landing') { e.preventDefault(); $('#btn-launch-start').click(); }
    else if (screen === 'screen-hangar') { e.preventDefault(); $('#btn-play').click(); }
    else if (screen === 'screen-results') { e.preventDefault(); $('#btn-again').click(); }
  }
});

/* init */
$$('[data-px]').forEach(el => { el.innerHTML = px(PXART[el.dataset.px], el.dataset.cls || ''); });
$$('[data-icn]').forEach(el => { el.innerHTML = pxIcon(el.dataset.icn, 'px-icn'); });

function renderEnergy() {
  $('#hud-energy').innerHTML =
    pxIcon('heart', 'px-icn px-heart').repeat(Math.max(0, G.energy)) +
    pxIcon('heartEmpty', 'px-icn px-heart').repeat(Math.max(0, TUNING.startEnergy - G.energy));
  $('#hud-energy').classList.toggle('low', G.energy <= 1);
}
buildWorld();
requestAnimationFrame(cameraLoop);
show('#screen-landing');
