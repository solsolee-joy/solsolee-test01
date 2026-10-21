// 동숲 팩 결에 맞춘 손그림 아이콘. 96x96, 칠한 색보다 진한 같은 계열 선
export const PAL = {
  cream: ['#f7ecdb', '#c38b5c'], orange: ['#f2b26c', '#c0662a'], gold: ['#f5b54c', '#cf7424'],
  pink: ['#f4c2b2', '#d0584a'], red: ['#e0503f', '#a8301e'], brown: ['#cf9a86', '#8a4632'],
  green: ['#a3a652', '#6f6a1e'], blue: ['#a7c6df', '#5a86ad'], wood: ['#c98a5c', '#8a4a26'],
  rose: ['#ef9aac', '#c03a62'],
};
const s = (c, d, extra = '') => `<path class="${c}" d="${d}" ${extra}/>`;
const ln = (c, d) => `<path class="l-${c}" d="${d}"/>`;
export const ICONS = {
  calendar:
    s('cream', 'M14 30a10 10 0 0 1 10-10h48a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z') +
    s('red', 'M14 30a10 10 0 0 1 10-10h48a10 10 0 0 1 10 10v8H14z') +
    s('brown', 'M30 12a4 4 0 0 1 8 0v14a4 4 0 0 1-8 0zM58 12a4 4 0 0 1 8 0v14a4 4 0 0 1-8 0z') +
    `<circle class="d-cream" cx="30" cy="52" r="3.5"/><circle class="d-cream" cx="48" cy="52" r="3.5"/><circle class="d-cream" cx="30" cy="68" r="3.5"/><circle class="d-cream" cx="48" cy="68" r="3.5"/>` +
    s('red', 'M66 72c-8-5-11-9-11-13a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 4-3 8-11 13z'),
  coins:
    s('gold', 'M16 70v8c0 6 14 10 32 10s32-4 32-10v-8') +
    s('gold', 'M16 70c0-6 14-10 32-10s32 4 32 10-14 10-32 10-32-4-32-10z') +
    s('gold', 'M16 54v8c0 6 14 10 32 10s32-4 32-10v-8') +
    s('gold', 'M16 54c0-6 14-10 32-10s32 4 32 10-14 10-32 10-32-4-32-10z') +
    s('gold', 'M16 38v8c0 6 14 10 32 10s32-4 32-10v-8') +
    s('gold', 'M16 38c0-6 14-10 32-10s32 4 32 10-14 10-32 10-32-4-32-10z') +
    s('cream', 'm48 9 4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3-9.3-4.9-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z'),
  clock:
    s('gold', 'M10 26a14 14 0 0 1 22-12zM86 26a14 14 0 0 0-22-12z') +
    ln('brown', 'M28 80l-7 9M68 80l7 9') +
    `<circle class="red" cx="48" cy="52" r="34"/><circle class="cream" cx="48" cy="52" r="24"/>` +
    ln('brown', 'M48 36v16l11 8') + `<circle class="d-brown" cx="48" cy="52" r="3.5"/>`,
  tram:
    ln('brown', 'M48 4v12M34 6l14 10 14-10') +
    s('gold', 'M16 32a14 14 0 0 1 14-14h36a14 14 0 0 1 14 14v38a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10z') +
    s('blue', 'M25 32a4 4 0 0 1 4-4h38a4 4 0 0 1 4 4v14H25z') + ln('blue', 'M48 28v18') +
    s('red', 'M16 58h64v8H16z') +
    `<circle class="cream" cx="28" cy="72" r="4"/><circle class="cream" cx="68" cy="72" r="4"/>` +
    ln('brown', 'M28 82l-6 10M68 82l6 10M22 92h52'),
  plant:
    s('green', 'M48 56C30 56 18 46 16 28c18 0 30 10 32 28z') +
    s('green', 'M48 56c0-22 12-38 32-40 0 22-12 38-32 40z') +
    s('green', 'M48 50c-6-10-6-24 0-36 6 12 6 26 0 36z') +
    s('orange', 'M18 56h60l-7 30a6 6 0 0 1-6 4H31a6 6 0 0 1-6-4z') +
    s('orange', 'M14 52h68v10H14z'),
  pill:
    `<g transform="rotate(-40 48 48)">` +
    s('cream', 'M48 26v44H32a22 22 0 0 1 0-44z') + s('red', 'M48 26h16a22 22 0 0 1 0 44H48z') +
    `</g><path class="hl" d="M55 33c5-3 10-3 13 0"/>`,
  receipt:
    s('cream', 'M20 10h56v78l-9-7-9 7-10-7-10 7-9-7-9 7z') +
    ln('cream', 'M32 28h32M32 42h32M32 56h18') +
    `<circle class="gold" cx="62" cy="62" r="8"/>`,
  umbrella:
    ln('brown', 'M48 48v32a8 8 0 0 1-16 0') +
    s('rose', 'M8 48a40 38 0 0 1 80 0c-5-5-12-5-16 0-4-5-12-5-16 0-4-5-12-5-16 0-4-5-12-5-16 0-4-5-11-5-16 0z') +
    ln('rose', 'M48 12c-8 8-12 22-12 36M48 12c8 8 12 22 12 36') +
    `<circle class="rose" cx="48" cy="9" r="4"/>`,
  radio:
    ln('brown', 'M30 28 66 8') + `<circle class="d-brown" cx="66" cy="8" r="4"/>` +
    s('wood', 'M8 38a12 12 0 0 1 12-12h56a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H20a12 12 0 0 1-12-12z') +
    `<circle class="cream" cx="34" cy="55" r="16"/>` + ln('cream', 'M24 50h20M22 56h24M24 62h20') +
    `<circle class="gold" cx="68" cy="46" r="7"/><circle class="red" cx="68" cy="66" r="5"/>`,
  clip:
    s('cream', 'M18 12h44l16 16v60H18z') + s('cream', 'M62 12v16h16') +
    ln('cream', 'M30 62h36M30 74h24') +
    s('red', 'M40 50V18a8 8 0 0 1 16 0v30a14 14 0 0 1-28 0V26', 'style="fill:none"'),
  arrows:
    s('blue', 'M10 26h50V14l24 20-24 20V42H10z') +
    s('orange', 'M86 70H36V58L12 78l24 20V86h50z', 'transform="translate(0 -8)"'),
  house:
    s('wood', 'M64 22h12v26H64z') +
    s('cream', 'M18 46h60v40H18z') +
    s('red', 'M6 50 48 14l42 36z') +
    s('brown', 'M40 86V66a8 8 0 0 1 16 0v20z') +
    s('blue', 'M62 58h10v10H62z') + `<circle class="gold" cx="48" cy="38" r="5"/>`,
  camera:
    s('brown', 'M30 26l6-12h24l6 12z') +
    s('wood', 'M8 36a10 10 0 0 1 10-10h60a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H18a10 10 0 0 1-10-10z') +
    s('cream', 'M8 42h80v14H8z') +
    `<circle class="blue" cx="48" cy="54" r="17"/><circle class="cream" cx="48" cy="54" r="8"/><circle class="red" cx="76" cy="34" r="4"/>`,
};
export const css = Object.entries(PAL).map(([k, [f, l]]) =>
  `.${k}{fill:${f};stroke:${l}} .l-${k}{fill:none;stroke:${l}} .d-${k}{fill:${l};stroke:none}`).join('\n');
