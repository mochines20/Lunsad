/* LUNSAD — Game Data: zones, question bank, location facts */

const ZONES = [
  { id: 'earth', name: 'EARTH', tag: 'LAUNCH SITE', alt: 0, span: 1400,
    skyTop: '#ffb45e', skyBottom: '#5ea8ff', label: 'Earth', icon: '🌍', factPool: 'earth' },
  { id: 'clouds', name: 'CLOUD LEVEL', tag: 'TROPOSPHERE', alt: 1400, span: 1600,
    skyTop: '#7ec3ff', skyBottom: '#bfe6ff', label: 'Clouds', icon: '☁️', factPool: 'clouds' },
  { id: 'atmosphere', name: 'SKY LEVEL', tag: 'UPPER ATMOSPHERE', alt: 3000, span: 1800,
    skyTop: '#3f7fd9', skyBottom: '#8fc4f5', label: 'Atmosphere', icon: '🌤️', factPool: 'atmosphere' },
  { id: 'stratosphere', name: 'STRATOSPHERE', tag: 'JETSTREAM', alt: 4800, span: 2000,
    skyTop: '#1d3f8f', skyBottom: '#4a6fd0', label: 'Stratosphere', icon: '🌌', factPool: 'stratosphere' },
  { id: 'orbit', name: 'ORBIT', tag: 'LOW EARTH ORBIT', alt: 6800, span: 2200,
    skyTop: '#0b1030', skyBottom: '#1d2a66', label: 'Orbit', icon: '🛰️', factPool: 'orbit' },
  { id: 'moon', name: 'THE MOON', tag: 'LUNAR APPROACH', alt: 9000, span: 2400,
    skyTop: '#05060f', skyBottom: '#141a38', label: 'Moon', icon: '🌙', factPool: 'moon' },
  { id: 'deepspace', name: 'DEEP SPACE', tag: 'INTERPLANETARY', alt: 11400, span: 2600,
    skyTop: '#0a0518', skyBottom: '#1a0f33', label: 'Deep Space', icon: '🪐', factPool: 'deepspace' },
  { id: 'galaxy', name: 'THE GALAXY', tag: 'FINAL FRONTIER', alt: 14000, span: 3000,
    skyTop: '#12041f', skyBottom: '#2b0f4d', label: 'Galaxy', icon: '🌠', factPool: 'galaxy' }
];

const WORLD_TOP = ZONES[ZONES.length - 1].alt + ZONES[ZONES.length - 1].span;

/* d: difficulty 1 (+800) 2 (+1600) 3 (+2400) */
const QUESTIONS = [
  { q: 'What is the largest planet in our solar system?',
    a: ['Jupiter', 'Saturn', 'Neptune', 'Mars'], c: 0, d: 1,
    hint: 'It has a Great Red Spot — a storm bigger than Earth.' },
  { q: 'Which planet is known as the Red Planet?',
    a: ['Mars', 'Venus', 'Mercury', 'Uranus'], c: 0, d: 1,
    hint: 'Its color comes from iron oxide — rust — on its surface.' },
  { q: 'What force keeps the Moon in orbit around Earth?',
    a: ['Gravity', 'Magnetism', 'Friction', 'Inertia'], c: 0, d: 1,
    hint: 'The same force that makes a mango fall from the tree.' },
  { q: 'How long does Earth take to orbit the Sun?',
    a: ['About 365 days', 'About 30 days', 'About 24 hours', 'About 10 years'], c: 0, d: 1,
    hint: 'It defines one year on your calendar.' },
  { q: 'What is the closest star to Earth?',
    a: ['The Sun', 'Proxima Centauri', 'Sirius', 'Betelgeuse'], c: 0, d: 1,
    hint: 'You can see it every morning — weather permitting.' },
  { q: 'Which layer of the atmosphere do we live in?',
    a: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'], c: 0, d: 1,
    hint: 'It is the lowest layer — where weather happens.' },
  { q: 'What is the name of Earth\u2019s only natural satellite?',
    a: ['The Moon', 'Titan', 'Europa', 'Phobos'], c: 0, d: 1,
    hint: 'It controls the tides.' },
  { q: 'Which gas do plants absorb for photosynthesis?',
    a: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'], c: 0, d: 1,
    hint: 'Humans exhale it.' },
  { q: 'What color does the Sun appear from space?',
    a: ['White', 'Yellow', 'Orange', 'Red'], c: 0, d: 1,
    hint: 'Earth\u2019s atmosphere is what tints it.' },
  { q: 'Which planet has the most confirmed moons in recent counts?',
    a: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'], c: 0, d: 2,
    hint: 'Its rings are iconic, and its moon count passed 140.' },
  { q: 'What is the approximate altitude of the ISS above Earth?',
    a: ['About 400 km', 'About 40 km', 'About 4,000 km', 'About 36,000 km'], c: 0, d: 2,
    hint: 'It circles Earth roughly every 90 minutes.' },
  { q: 'The boundary between Earth\u2019s atmosphere and space is called the\u2026',
    a: ['Kármán line', 'Event horizon', 'Tropopause', 'Frost line'], c: 0, d: 2,
    hint: 'It sits at about 100 km altitude.' },
  { q: 'Which was the first artificial satellite ever launched?',
    a: ['Sputnik 1', 'Explorer 1', 'Vostok 1', 'Telstar'], c: 0, d: 2,
    hint: 'The Soviet Union launched it in 1957.' },
  { q: 'What is the hottest planet in the solar system?',
    a: ['Venus', 'Mercury', 'Mars', 'Jupiter'], c: 0, d: 2,
    hint: 'A runaway greenhouse effect — not proximity — wins here.' },
  { q: 'How long does sunlight take to reach Earth?',
    a: ['About 8 minutes', 'About 8 seconds', 'About 8 hours', 'About 8 days'], c: 0, d: 2,
    hint: 'You always see the Sun as it was slightly in the past.' },
  { q: 'Who was the first human to travel into space?',
    a: ['Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard', 'Buzz Aldrin'], c: 0, d: 2,
    hint: 'Vostok 1, April 1961.' },
  { q: 'What is a light-year a measure of?',
    a: ['Distance', 'Time', 'Speed', 'Brightness'], c: 0, d: 2,
    hint: 'Despite the name, it has nothing to do with time.' },
  { q: 'Which moon of Jupiter is a top candidate for alien life?',
    a: ['Europa', 'Io', 'Ganymede', 'Callisto'], c: 0, d: 2,
    hint: 'A subsurface ocean hides beneath its icy crust.' },
  { q: 'What does a rocket push against to move in space?',
    a: ['Its own exhaust', 'The air', 'Solar wind', 'Magnetic fields'], c: 0, d: 2,
    hint: 'Newton\u2019s third law — action and reaction.' },
  { q: 'Which phenomenon causes the apparent retrograde motion of planets?',
    a: ['Earth overtaking them in orbit', 'Their reversed spin', 'Solar wind pressure', 'Gravitational lensing'], c: 0, d: 3,
    hint: 'It is an illusion of relative orbital speeds.' },
  { q: 'What is the approximate escape velocity from Earth?',
    a: ['11.2 km/s', '7.9 km/s', '3.3 km/s', '25.0 km/s'], c: 0, d: 3,
    hint: 'Higher than orbital velocity, about 7.9 km/s.' },
  { q: 'The Chandrasekhar limit (~1.4 solar masses) decides the fate of a\u2026',
    a: ['White dwarf', 'Red giant', 'Neutron star', 'Protostar'], c: 0, d: 3,
    hint: 'Beyond it, electron degeneracy pressure fails.' },
  { q: 'What type of galaxy is the Milky Way?',
    a: ['Barred spiral', 'Elliptical', 'Irregular', 'Lenticular'], c: 0, d: 3,
    hint: 'Its central bar was confirmed by infrared surveys.' },
  { q: 'Which mission first returned samples from an asteroid to Earth?',
    a: ['Hayabusa', 'OSIRIS-REx', 'Stardust', 'Rosetta'], c: 0, d: 3,
    hint: 'JAXA, asteroid Itokawa, 2010.' },
  { q: 'The Great Red Spot on Jupiter is\u2026',
    a: ['A persistent storm', 'A volcanic crater', 'An impact basin', 'A magnetic anomaly'], c: 0, d: 3,
    hint: 'It has been raging for centuries.' },
  { q: 'What is the Roche limit?',
    a: ['Where tidal forces tear a body apart', 'Edge of a black hole\u2019s pull', 'Max stable orbit radius', 'Solar wind termination point'], c: 0, d: 3,
    hint: 'It is why some moons become rings.' },
  { q: 'Which element fuels the Sun\u2019s core fusion right now?',
    a: ['Hydrogen', 'Helium', 'Carbon', 'Oxygen'], c: 0, d: 3,
    hint: 'The lightest element, fused into the second lightest.' },
  { q: 'The Cosmic Microwave Background radiation came from\u2026',
    a: ['The early universe after the Big Bang', 'Dying stars', 'Black hole jets', 'Solar flares'], c: 0, d: 3,
    hint: 'A faint afterglow from ~380,000 years after the beginning.' },
  { q: 'Why do launch sites sit near the equator?',
    a: ['Earth\u2019s rotation gives extra speed', 'The air is thinner', 'Gravity is weaker', 'Weather is always calm'], c: 0, d: 3,
    hint: 'A free ~465 m/s head start toward orbit.' }
];

const FACTS = {
  earth: [
    'Earth isn\u2019t a perfect sphere — it bulges at the equator.',
    'About 71% of Earth\u2019s surface is covered by ocean.',
    'The Philippines sits on the Pacific Ring of Fire.',
    'Earth is the densest planet in the solar system.'
  ],
  clouds: [
    'An average cumulus cloud weighs ~500,000 kg — like 100 elephants.',
    'Clouds form when water vapor condenses onto tiny dust particles.',
    'Lightning strikes Earth about 44 times every second.',
    'The highest clouds glow at around 80 km up.'
  ],
  atmosphere: [
    'The ozone layer absorbs 97–99% of the Sun\u2019s harmful UV light.',
    'Jet streams can push aircraft with 400 km/h of tailwind.',
    'The sky is blue because air scatters short blue wavelengths most.',
    'The atmosphere weighs about 5.5 quadrillion tonnes.'
  ],
  stratosphere: [
    'Felix Baumgartner jumped from 39 km in 2012 and broke the sound barrier.',
    'The stratosphere gets warmer with altitude, thanks to ozone.',
    'Weather balloons regularly reach 35 km up.',
    'Spy planes like the U-2 cruised here, above almost all weather.'
  ],
  orbit: [
    'The ISS orbits Earth about 16 times a day — 16 sunrises daily.',
    'Objects in low orbit travel at roughly 28,000 km/h.',
    'Astronauts in orbit are in constant free fall, not weightless.',
    'Over 10,000 active and dead satellites circle Earth.'
  ],
  moon: [
    'The Moon drifts about 3.8 cm farther from Earth every year.',
    'A day on Venus is longer than its year.',
    'The same side of the Moon always faces Earth — tidal locking.',
    'Moonquakes can last up to half an hour.'
  ],
  deepspace: [
    'Voyager 1 is over 24 billion km away — our farthest messenger.',
    'A teaspoon of neutron star would weigh billions of tonnes.',
    'There are more stars than grains of sand on Earth\u2019s beaches.',
    'Saturn\u2019s rings are mostly ice — some chunks as big as houses.'
  ],
  galaxy: [
    'The Milky Way holds 100–400 billion stars.',
    'Our galaxy and Andromeda will collide in ~4.5 billion years.',
    'A supermassive black hole, Sagittarius A*, sits at our center.',
    'Light takes about 100,000 years to cross the Milky Way.'
  ]
};

const TUNING = {
  thrust: { 1: 800, 2: 1600, 3: 2400 },
  wrongDrop: 1000,
  warpCost: 300,
  startEnergy: 3,
  questionTime: 30,
  roundSize: 10,
  dust: { easy: 10, medium: 20, hard: 30, streak3: 15, streak5: 30, mission: 100, perfect: 250 },
  streakNames: { 3: 'STREAK', 5: 'BOOST', 7: 'OVERDRIVE', 10: 'LUNSAD' }
};

/* ============================================================
   PIXEL ART — retro asset library
   Each art is a grid of chars; px() renders them as crisp SVG.
   ============================================================ */

const PAL = {
  K: '#182033', W: '#f2f6fc', w: '#b9c6da', R: '#ff4d4d', r: '#c22727',
  D: '#22344f', G: '#8fd4ff', B: '#4a6fa5', b: '#33507a', O: '#ff8c1a',
  Y: '#ffd23f', E: '#3f8fe0', e: '#2a63b8', N: '#5aa843', n: '#3c7a33',
  C: '#ffffff', c: '#c8d4e4', M: '#c9c9c2', m: '#82827b', T: '#e8b06a',
  t: '#a9763a', H: '#8a5a36', U: '#c99a5b', X: '#9fc2ff', S: '#ffd166',
  P: '#c99fff', Q: '#ffe9b0', Z: '#fff6d8'
};

const SHIP_BODY = [
  ".........KK.........",
  "........KRRK........",
  "........KRRK........",
  ".......KWWWWK.......",
  "......KWWWWWWK......",
  ".....KWWWWWWWWK.....",
  "....KWWWWWWWWWWK....",
  "....KWKDDDDDDKWK....",
  "....KWKDGGGGDKWK....",
  "....KWKDGwwGDKWK....",
  "....KWKDDDDDDKWK....",
  "....KWWWKKKKWWWK....",
  ".KBBKWWWWWWWWWWKBBK.",
  ".KBBKWWWWRRWWWWKBBK.",
  ".KBBKWWWRRWWWWKBBK.",
  ".KBBbWWWWRRWWWKbbK.",
  ".KbbKWWWWWRRWWKbbK.",
  ".KbbKWWWWWWWWWKbbK.",
  ".KbbKWWKKKKKWWKbbK.",
  "..KK.KKKKKKKKK.KK.."
];

const PXART = {
  ship: { w: 20, flameFrom: 20, rows: SHIP_BODY.concat([
    ".......KOOOOOK......",
    "......KOYYYYYOK.....",
    ".......KYYYOK.......",
    ".......KOYYOK.......",
    "........KYOK........",
    ".........KK........."
  ])},
  shipSmoke: { w: 20, flameFrom: 20, rows: SHIP_BODY.concat([
    ".CC...KOYYYOK...CC..",
    "CCCC..KOYYYOK..CCCCC",
    "CCCCCc.KOYYOK.cCCCCC",
    "cCCCCCCcKYOKcCCCCCCc",
    ".ccCCCCcKKKKcCCCCcc.",
    "...cccCCCCCCCCccc..."
  ])},
  earth: { w: 24, rows: [
    "........EEEEEEEE........",
    ".....EEEEEEEEEEEEEE.....",
    "...EEEENNEEEEEEECCEEE...",
    "..EEENNNNNEECCWWWCEEEE..",
    ".EENNNNNNNNEEWWWWCEEEE.",
    ".ENNNNNNNNEEEEEEWWEEEE.",
    "EENNNNNNEEEEEEEEEWWEEEEE",
    "EENNNNNEEEEEEEEEEEEEEEEE",
    "EEENNEEEEEEEEWWEEEEEEEEE",
    "EEEEEEEEEEEEWWWWEEEEEEEE",
    "EEEEEECCEEEEWWEEEEENEEEE",
    "EEEEECWWWWEEEEEEENNEEEEE",
    "EEEEECWWWWEEEEEENNNNEEEE",
    "EEEEEECCEEEEEENNNNNNEEEE",
    "EEEEEEEEEEEEENNNNNNEEEEE",
    "EEEEEEEEEEEEENNNNNEEEEEE",
    ".EEEEEEEEEEEEENNNNEEEEE.",
    ".EEEECWWEEEEEEENNNEEEEE.",
    "..EEEWWWWEEEEEEENNEEEE..",
    "...EEWWWWEEEEEEEEEEEEE..",
    ".....EEEEEEEEEEEEEE.....",
    "......EEEEEEEEEEEE......",
    "........EEEEEEEE........"
  ]},
  cloud: { w: 14, rows: [
    ".....CCCCC......",
    "...CCCCCCCCC....",
    "..CCCCCCCCCCCC..",
    ".CCCCCCCCCCCCCC.",
    "cccccccccccccc.."
  ]},
  tree: { w: 10, rows: [
    "...NNNN...",
    "..NNNNNN..",
    ".NNNNNNNN.",
    "NNNNNNNNNN",
    "NnNNNNNNnN",
    ".NNNNNNNN.",
    "..NNNNNN..",
    "....HH....",
    "....HH....",
    "...HHHH..."
  ]},
  bush: { w: 12, rows: [
    "...NNN...NNN.",
    ".NNNNNNNNNNN.",
    "NNNNNNNNNNNNN",
    "nNNNNNNNNNNNn"
  ]},
  sun: { w: 12, rows: [
    "....SSSS....",
    "..SSSSSSSS..",
    ".SSSSSSSSSS.",
    ".SSSSSSSSSS.",
    "SSSSYSSYSSSS",
    "SSSSSSSSSSSS",
    ".SSSSSSSSSS.",
    ".SSSSSSSSSS.",
    "..SSSSSSSS..",
    "....SSSS...."
  ]},
  balloon: { w: 10, rows: [
    "..RRRRRR..",
    ".RRRRRRRR.",
    "RRWRRRRWRR",
    "RRRRRRRRRR",
    "RRWRRRRWRR",
    ".RRRRRRRR.",
    "..RRRRRR..",
    "...RRRR...",
    "....KK....",
    "...K..K...",
    "..UUUUU...",
    "..UUUUU..."
  ]},
  satellite: { w: 16, rows: [
    "......KK........",
    "......KW........",
    "XXXXKKWWKKXXXX..",
    "XxXxKKWSKKXxXx..",
    "XXXXKKWWKKXXXX..",
    "......KK........"
  ]},
  moon: { w: 14, rows: [
    "....MMMMMM....",
    "..MMMMMMMMMM..",
    ".MMMmMMMMMMMM.",
    ".MMmmMMMMmMMM.",
    "MMMMmMMMMmmMMM",
    "MMMMMMMMMmmMMM",
    "MMMmMMMMMMMMMM",
    "MMMmmMMMMmMMMM",
    ".MMMMMMMmMMM..",
    ".MMMMMMMMMMM..",
    "..MMMMMMMMMM..",
    "....MMMMMM...."
  ]},
  saturn: { w: 26, rows: [
    "..........TTTTTT..........",
    "........TTTTTTTTTT........",
    ".......TTtTTTTTTtTT.......",
    "......TTTTTTTTTTTTTT......",
    "..TTTTTTTTTTTTTTTTTTTT....",
    ".TTTTtTTTTTTTTTTtTTTTT..",
    "TTTTTTTTTTTTTTTTTTTTTTTTTT",
    "..TTTTtTTTTTTTTTTtTTTT....",
    "......TTTTTTTTTTTTTT......",
    ".......TTtTTTTTtTT........",
    "........TTTTTTTTTT........",
    "..........TTTTTT.........."
  ]},
  galaxy: { w: 16, rows: [
    ".....P..........",
    "...PPP..P.......",
    "..PPQQPPP..P....",
    ".PPQQQQPPPPP....",
    "..PQQQQQPPP.....",
    "...PQQZQQPP.....",
    "..PPQQZQQPP.P...",
    ".PPPQQQQQPPPP...",
    ".PPPPPQQPP...P..",
    "..P..PPPPP..PP..",
    ".....P..PP......",
    "..........P....."
  ]}
};


/* ---------- pixel UI icons (hearts, dust, boosts, medals) ---------- */
const PXICON = {
  heart: { w: 7, rows: [
    ".RR.RR.",
    "RRRRRRR",
    "RRRRRRR",
    "RRRRRRR",
    ".RRRRR.",
    "..RRR..",
    "...R..."
  ]},
  heartEmpty: { w: 7, rows: [
    ".bb.bb.",
    "b..b..b",
    "b.....b",
    "b.....b",
    ".b...b.",
    "..b.b..",
    "...b..."
  ]},
  dust: { w: 7, rows: [
    "...Y...",
    "...Y...",
    ".Y.YY.Y",
    "..YYY..",
    ".Y.YY.Y",
    "...Y...",
    "...Y..."
  ]},
  radar: { w: 9, rows: [
    "...KKK...",
    "..KGGGK..",
    ".KGKKGKG.",
    ".KGKKK...",
    ".KGKKGKG.",
    "..KGGGK..",
    "...KKK...",
    "....K....",
    "..KKKKK.."
  ]},
  scan: { w: 9, rows: [
    "..KKKKK..",
    ".KXXXXXK.",
    "KXKKKKKXK",
    "KXXKKKXXK",
    "KXKKKKKXK",
    ".KXXXXXK.",
    "..KKKKK..",
    "....K....",
    "...KKK..."
  ]},
  bolt: { w: 9, rows: [
    ".....YY..",
    "....YY...",
    "...YY....",
    "..YYYYY..",
    "....YY...",
    "...YY....",
    "..YY.....",
    ".YY......",
    "YY......."
  ]},
  shield: { w: 9, rows: [
    ".KKKKKKK.",
    "KBBBBBBBK",
    "KBBBBBBBK",
    "KBBBBBBBK",
    ".KBBBBBK.",
    "..KBBBK..",
    "...KBK...",
    "....K...."
  ]},
  warp: { w: 9, rows: [
    ".G...G...",
    "GG.GG.GG.",
    ".G...G...",
    "GG.GG.GG.",
    ".G...G..."
  ]},
  medalS: { w: 9, rows: [
    ".RRR.RRR.",
    ".RRR.RRR.",
    "..KKKKK..",
    ".KYYYYYK.",
    "KYKYYYKYK",
    "KYKKKKKYK",
    "KYKYYYKYK",
    ".KYYYYYK.",
    "..KKKKK.."
  ]},
  rocket: { w: 7, rows: [
    "...R...",
    "..WWW..",
    "..WDW..",
    "..WWW..",
    ".WWWWW.",
    "..KKK..",
    ".OO.OO."
  ]},
  bulb: { w: 7, rows: [
    "..YYY..",
    ".YYYYY.",
    "YYYYYYY",
    ".YYYYY.",
    "..YYY..",
    "..KKK..",
    "...K..."
  ]}
};
PAL.K2 = '#3a4664';

/* render any PXICON art as inline svg (reuses px()) */
function pxIcon(name, cls = '') { return px(PXICON[name], cls); }

/* render pixel art to an inline SVG string; merges horizontal runs */
function px(art, cls = '') {
  const body = [], flame = [];
  art.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const col = PAL[row[x]];
      if (!col) { x++; continue; }
      let run = 1;
      while (x + run < row.length && row[x + run] === row[x]) run++;
      const rect = `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${col}"/>`;
      (art.flameFrom != null && y >= art.flameFrom ? flame : body).push(rect);
      x += run;
    }
  });
  const flameG = flame.length ? `<g class="px-flame">${flame.join('')}</g>` : '';
  return `<svg class="px ${cls}" viewBox="0 0 ${art.w} ${art.rows.length}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${body.join('')}${flameG}</svg>`;
}
