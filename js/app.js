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
const profile = loadProfile();

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: '', avatar: '👨‍🚀', dust: 0, bestAlt: 0 };
  } catch { return { name: '', avatar: '👨‍🚀', dust: 0, bestAlt: 0 }; }
}
function saveProfile() { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }

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
  fail:   () => { beep(196, 0.4, 'sawtooth', 0.09); beep(130, 0.6, 'sawtooth', 0.09, 0.25); beep(98, 0.8, 'sawtooth', 0.09, 0.5); }
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
      ${decorationsFor(zone.id)}`;
    worldInner.appendChild(el);
  });
}

function decorationsFor(id) {
  switch (id) {
    case 'earth':
      return `<div class="deco deco-ground"></div><div class="deco deco-pad"></div>
              <div class="deco deco-sun"></div>
              <div class="deco deco-cloud" style="top:18%;left:12%"></div>
              <div class="deco deco-cloud" style="top:34%;right:10%;transform:scale(0.7)"></div>`;
    case 'clouds':
      return `<div class="deco deco-cloud" style="top:15%;left:8%"></div>
              <div class="deco deco-cloud" style="top:38%;right:6%;transform:scale(1.3)"></div>
              <div class="deco deco-cloud" style="top:62%;left:22%;transform:scale(0.8)"></div>
              <div class="deco deco-cloud" style="top:80%;right:24%"></div>`;
    case 'atmosphere':
      return `<div class="deco deco-cloud" style="top:70%;left:10%;opacity:0.5"></div>
              <div class="deco deco-cloud" style="top:82%;right:12%;opacity:0.4;transform:scale(0.7)"></div>
              ${starField(10)}`;
    case 'stratosphere':
      return `<div class="deco deco-satellite">🎈</div>${starField(26)}`;
    case 'orbit':
      return `<div class="deco deco-satellite">🛰️</div>${starField(46)}`;
    case 'moon':
      return `<div class="deco deco-moon"></div>${starField(56)}`;
    case 'deepspace':
      return `<div class="deco deco-planet"></div>${starField(70)}`;
    case 'galaxy':
      return `<div class="deco deco-galaxy"></div>${starField(90)}`;
    default: return '';
  }
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

function setAltitude(a, snap = false) {
  G.altitude = Math.max(0, Math.min(a, WORLD_TOP - window.innerHeight * 0.5));
  worldInner.classList.toggle('snap', snap);
  worldInner.style.transform = `translateY(${G.altitude}px)`;
  if (snap) requestAnimationFrame(() => worldInner.classList.remove('snap'));
  const zone = zoneAt(G.altitude);
  if (zone !== G.currentZone) {
    G.currentZone = zone;
    $('#hud-zone').textContent = zone.name;
  }
  $('#hud-alt').textContent = fmtAlt(G.altitude);
}

function fmtAlt(a) { return Math.round(a).toLocaleString('en-US') + 'm'; }

/* ---------------- mission setup ---------------- */
function drawQuestions() {
  const by = d => QUESTIONS.filter(q => q.d === d);
  const pick = (arr, n) => arr.sort(() => Math.random() - 0.5).slice(0, n);
  return [...pick(by(1), 3), ...pick(by(2), 4), ...pick(by(3), 3)];
}

function startMission() {
  Object.assign(G, {
    active: true, altitude: 0, energy: TUNING.startEnergy, dust: 0,
    streak: 0, maxStreak: 0, correct: 0, qIndex: 0,
    questions: drawQuestions(),
    boosts: { radar: 2, scan: 2, boost: 1, shield: 1, warp: 1 },
    armed: { boost: false, shield: false },
    answered: false, currentZone: ZONES[0]
  });
  buildWorld();
  show('#screen-game');
  $('#hud-zone').textContent = 'EARTH';
  $('#hud-energy').textContent = '❤️'.repeat(G.energy);
  $('#hud-streak').textContent = '';
  $('#ship').className = 'ship-fly';
  updateBoostBar();
  setAltitude(0, true);
  $('#question-panel').classList.add('hidden');
  $('#fact-toast').classList.add('hidden');

  // launch sequence
  readout('🚀 LUNSAD!', 'good');
  sfx.launch();
  $('#ship').classList.add('thrusting');
  setAltitude(260);
  setTimeout(() => {
    $('#ship').classList.remove('thrusting');
    nextQuestion();
  }, 1900);
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
    b.textContent = text;
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
  G.timer = setInterval(() => {
    G.timeLeft -= 0.1;
    bar.style.width = Math.max(0, (G.timeLeft / TUNING.questionTime) * 100) + '%';
    bar.classList.toggle('low', G.timeLeft <= 8);
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
  $('#hud-energy').textContent = '❤️'.repeat(Math.max(0, G.energy)) + '🖤'.repeat(Math.max(0, TUNING.startEnergy - G.energy));

  let drop = TUNING.wrongDrop;
  let blocked = false;
  if (G.armed.shield) { drop = 0; blocked = true; G.armed.shield = false; }
  $('#ship').classList.toggle('shielded', G.armed.shield);

  sfx.wrong();
  flash('bad');
  readout(timedOut ? '⏱️ TIME\u2019S UP — STALL!' : (blocked ? '🛡️ SHIELD HELD — 0m' : `⚠️ ENGINE FAILURE −${drop.toLocaleString()}m`), 'bad');
  $('#ship').classList.add('shake', 'stalling');
  setAltitude(G.altitude - drop);
  setTimeout(() => $('#ship').classList.remove('shake', 'stalling'), 1200);
  showFact();

  if (G.energy <= 0) {
    G.active = false;
    setTimeout(() => { sfx.fail(); endMission(false); }, 2000);
  }
}

/* ---------------- boosters ---------------- */
function useBoost(kind) {
  if (!G.active || G.answered || G.boosts[kind] <= 0) return;
  const q = G.questions[G.qIndex];
  const btn = $(`.boost-btn[data-boost="${kind}"]`);
  sfx.click();

  switch (kind) {
    case 'radar': {
      const wrongOpts = $$('.q-opt').filter((o, i) => i !== q.c && !o.classList.contains('eliminated'));
      const victim = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
      victim.classList.add('eliminated');
      victim.disabled = true;
      break;
    }
    case 'scan':
      $('#q-hint').textContent = '🛰️ ' + q.hint;
      $('#q-hint').classList.remove('hidden');
      break;
    case 'boost':
      G.armed.boost = true;
      btn.classList.add('armed');
      break;
    case 'shield':
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
  G.boosts[kind]--;
  updateBoostBar();
}

function updateBoostBar() {
  $$('.boost-btn').forEach(btn => {
    const kind = btn.dataset.boost;
    btn.querySelector('.boost-count').textContent = G.boosts[kind] ?? 0;
    btn.disabled = !G.active || G.answered || (G.boosts[kind] ?? 0) <= 0
      || (kind !== 'warp' && (G.armed.boost && kind === 'boost'));
  });
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
  $('#fact-text').textContent = pool[Math.floor(Math.random() * pool.length)];
  $('#fact-toast').classList.remove('hidden');
}

function addDust(n) {
  G.dust += n;
  $('#hud-dust').textContent = '✨ ' + G.dust;
}

/* ---------------- mission end ---------------- */
function endMission(completed) {
  clearInterval(G.timer);
  G.active = false;

  const finalAlt = G.altitude;
  const zone = zoneAt(finalAlt);
  let dustEarned = G.dust;
  if (completed) {
    dustEarned += TUNING.dust.mission;
    if (G.correct === TUNING.roundSize) dustEarned += TUNING.dust.perfect;
  }

  profile.dust += dustEarned;
  profile.bestAlt = Math.max(profile.bestAlt, finalAlt);
  saveProfile();

  $('#results-eyebrow').textContent = completed ? 'MISSION COMPLETE' : '💥 MISSION FAILED';
  $('#results-title').textContent = completed
    ? `${zone.icon} YOU REACHED ${zone.name}`
    : 'YOUR SHIP RAN OUT OF ENERGY';
  const grades = [[10, 'S'], [8, 'A'], [6, 'B'], [4, 'C'], [0, 'D']];
  $('#results-grade').textContent = grades.find(([min]) => G.correct >= min)[1];
  $('#res-alt').textContent = fmtAlt(finalAlt);
  $('#res-correct').textContent = `${G.correct}/${TUNING.roundSize}`;
  $('#res-streak').textContent = '🔥 ×' + G.maxStreak;
  $('#res-dust').textContent = '+' + dustEarned + ' ✨';
  setTimeout(() => show('#screen-results'), completed ? 400 : 600);
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
  show('#screen-hangar');
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
$('#mode-map').onclick = () => { sfx.click(); openMap(); };
$('#btn-map-close').onclick = () => $('#modal-map').classList.add('hidden');
$('#btn-again').onclick = () => { sfx.click(); startMission(); };
$('#btn-hangar').onclick = () => { sfx.click(); goHangar(); };
$('#btn-abandon').onclick = () => { clearInterval(G.timer); G.active = false; goHangar(); };
$$('.boost-btn').forEach(b => b.onclick = () => useBoost(b.dataset.boost));

/* init */
buildWorld();
show('#screen-landing');
