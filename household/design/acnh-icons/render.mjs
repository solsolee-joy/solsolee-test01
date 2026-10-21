import { chromium } from 'playwright';
import { ICONS, css } from './icons.mjs';
import fs from 'fs';
const out = process.argv[2];
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 94 94" width="192" height="192">
<defs><filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="2.6" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g"/>
<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.05" result="ga"/>
<feComposite in="d" in2="ga" operator="in" result="dg"/>
<feMerge><feMergeNode in="d"/><feMergeNode in="dg"/></feMerge>
<feComponentTransfer><feFuncA type="table" tableValues="0 1"/></feComponentTransfer>
</filter></defs>
<style>path,circle{stroke-width:7.5;stroke-linecap:round;stroke-linejoin:round} .hl{fill:none;stroke:#fff;opacity:.7;stroke-width:4}
${css}</style><g filter="url(#pencil)">${body}</g></svg>`;
const b = await chromium.launch(); // 로컬에선 npx playwright install chromium 먼저
const p = await b.newPage({ viewport: { width: 192, height: 192 } });
for (const [name, body] of Object.entries(ICONS)) {
  await p.setContent(`<body style="margin:0;background:transparent">${svg(body)}</body>`);
  await p.locator('svg').screenshot({ path: `${out}/${name}.png`, omitBackground: true });
}
await b.close();
