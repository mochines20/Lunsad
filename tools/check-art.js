/* LUNSAD — pixel-art linter
   Validates every PXART/PXICON grid: palette chars exist, rows fit the
   declared width, flame split is sane. Zero deps.
   Run: node tools/check-art.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(src + '\n;this.__out={PAL,PXART,PXICON};', ctx);
const { PAL, PXART, PXICON } = ctx.__out;

let errors = 0, warnings = 0;
const fail = msg => { console.error('  ERROR ' + msg); errors++; };
const warn = msg => { console.warn('  warn  ' + msg); warnings++; };

for (const [libName, lib] of [['PXART', PXART], ['PXICON', PXICON]]) {
  for (const [name, art] of Object.entries(lib)) {
    const label = `${libName}.${name}`;
    if (!Array.isArray(art.rows) || !art.rows.length) { fail(`${label}: no rows`); continue; }
    if (!Number.isInteger(art.w) || art.w < 1) { fail(`${label}: bad width ${art.w}`); continue; }
    if (art.flameFrom != null && (art.flameFrom < 0 || art.flameFrom > art.rows.length))
      fail(`${label}: flameFrom ${art.flameFrom} outside 0..${art.rows.length}`);

    const widths = new Set();
    art.rows.forEach((row, y) => {
      widths.add(row.length);
      if (row.length > art.w) fail(`${label}: row ${y} is ${row.length} wide, exceeds viewBox ${art.w}`);
      for (const ch of row)
        if (ch !== '.' && !PAL[ch]) fail(`${label}: row ${y} uses unknown char "${ch}"`);
    });
    if (widths.size > 1)
      warn(`${label}: ragged rows (${[...widths].join('/')}) — silhouette may be asymmetric`);
    else if ([...widths][0] !== art.w && ![...widths][0] === undefined)
      warn(`${label}: uniform width ${[...widths][0]} != declared ${art.w}`);
  }
}

console.log(`\n${errors ? 'FAIL' : 'OK'} — ${Object.keys(PXART).length + Object.keys(PXICON).length} arts checked, ${warnings} warning(s), ${errors} error(s)`);
process.exit(errors ? 1 : 0);
