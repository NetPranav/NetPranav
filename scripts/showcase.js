// Stylized UI mockups for the daily "Today's UI" tile.
// Each drawer paints a 500x264 window body. Colours are the project's own (not the profile theme),
// so the mockup looks the same in light and dark mode, like a real screenshot would.

const W = 500;
const H = 264;
const round = (n) => Math.round(n * 100) / 100;

function makeDrawers(tile, ox, oy) {
  const R = (x, y, w, h, fill, rx = 0, more = '') =>
    tile.body.push(`<rect x="${round(ox + x)}" y="${round(oy + y)}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${more}/>`);
  const C = (cx, cy, r, fill, more = '') =>
    tile.body.push(`<circle cx="${round(ox + cx)}" cy="${round(oy + cy)}" r="${r}" fill="${fill}" ${more}/>`);
  const P = (d, stroke, sw = 1, fill = 'none', more = '') =>
    tile.body.push(`<path transform="translate(${round(ox)} ${round(oy)})" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${more}/>`);
  const T = (x, y, s, o = {}) => tile.text(ox + x, oy + y, s, { size: 10, weight: 600, fill: '#e8e6e1', ...o });
  const M = (x, y, s, o = {}) => T(x, y, s, { font: 'mono', size: 9, weight: 400, fill: '#8b90a0', ...o });
  const stroke = (c) => `stroke="${c}" stroke-width="1"`;
  const check = (x, y, c) => P(`M${x - 3} ${y} l2.4 2.6 l4.2 -5.2`, c, 1.6);
  const diamond = (cx, cy, s, fill) => P(`M${cx} ${cy - s} l${s} ${s} l${-s} ${s} l${-s} ${-s} z`, 'none', 0, fill);
  const poly = (pts, c, sw = 1.5) => P('M' + pts.map(([x, y]) => `${x} ${y}`).join(' L'), c, sw);

  return {
    // ---------------------------------------------------------------- LazyLayout
    lazylayout() {
      const A = '#ff5a1f';
      R(0, 0, W, H, '#0e0e11');
      R(0, 0, 104, 190, '#141418');
      R(104, 0, 1, 190, '#26262d');
      M(12, 18, 'LAYERS', { fill: '#77767c' });
      ['Frame', 'Heading', 'Orb', 'Card', 'Cursor'].forEach((n, i) => {
        const y = 38 + i * 22;
        if (i === 2) {
          R(6, y - 12, 92, 20, '#241d19', 3);
          R(6, y - 12, 2, 20, A);
        }
        R(16, y - 4, 8, 8, i === 2 ? A : '#3a3a42', 2);
        T(30, y + 3, n, { size: 10, weight: 500, fill: i === 2 ? '#fff' : '#a3a1a8' });
      });
      R(105, 0, 275, 190, '#18181d');
      R(125, 16, 235, 150, '#0a0a0c', 4, stroke('#2a2a31'));
      R(143, 34, 118, 10, '#e8e6e1', 2);
      R(143, 52, 74, 6, '#4b4a50', 2);
      [0, 1, 2].forEach((i) => R(143 + i * 68, 116, 60, 36, '#17171b', 4, stroke('#2a2a31')));
      P('M292 62 C 322 22, 336 100, 340 128', A, 1.2, 'none', 'stroke-dasharray="3 4" opacity=".7"');
      diamond(292, 62, 4, '#fff');
      diamond(340, 128, 4, A);
      tile.css.push('@keyframes orb{0%{transform:translate(0,0)}100%{transform:translate(48px,66px)}}.orb{animation:orb 2.4s cubic-bezier(.65,0,.35,1) infinite alternate}');
      tile.body.push(`<circle class="orb" cx="${ox + 292}" cy="${oy + 62}" r="11" fill="${A}"/>`);
      R(380, 0, 120, 190, '#141418');
      R(380, 0, 1, 190, '#26262d');
      M(392, 18, 'MOTION', { fill: '#77767c' });
      [['ease', 'power3.out'], ['time', '0.8s'], ['delay', '0.2s']].forEach(([k, v], i) => {
        M(392, 44 + i * 24, k);
        T(488, 44 + i * 24, v, { size: 10, weight: 500, anchor: 'end' });
      });
      R(392, 134, 96, 28, A, 5);
      T(440, 152, 'Export GSAP', { size: 10, weight: 700, fill: '#111', anchor: 'middle' });
      R(0, 190, W, 74, '#111114');
      R(0, 190, W, 1, '#26262d');
      for (let x = 104; x < W; x += 38) R(x, 192, 1, 6, '#3a3a42');
      M(12, 218, 'Orb.x', { fill: '#a3a1a8' });
      M(12, 240, 'Orb.scale', { fill: '#a3a1a8' });
      R(130, 210, 190, 3, '#2d2d34', 1);
      R(130, 232, 120, 3, '#2d2d34', 1);
      [130, 220, 320].forEach((x) => diamond(x, 212, 4, A));
      [130, 250].forEach((x) => diamond(x, 234, 4, '#e8e6e1'));
      tile.css.push('@keyframes ph{from{transform:translateX(0)}to{transform:translateX(370px)}}.ph{animation:ph 4s linear infinite}');
      tile.body.push(`<rect class="ph" x="${ox + 104}" y="${oy + 192}" width="2" height="70" fill="${A}"/>`);
    },

    // ---------------------------------------------------------------- Cero
    cero() {
      R(0, 0, W, H, '#0b0d12');
      R(0, 0, W, 26, '#12151c');
      M(14, 17, 'cero   ~/projects', { fill: '#8b90a0' });
      M(16, 52, '$', { fill: '#5eead4', size: 11 });
      M(32, 52, 'cero "set up a python project with a venv and pytest"', { fill: '#e8e6e1', size: 11 });
      M(16, 76, '.flow  python-setup.flow  ·  3 steps', { fill: '#6b7080', size: 10 });
      R(16, 88, 468, 104, '#10141b', 6, stroke('#232836'));
      [['create virtual environment', 1], ['install pytest', 1], ['write a sample test', 0]].forEach(([s, done], i) => {
        const y = 114 + i * 28;
        if (done) {
          C(38, y - 3, 8, '#5eead4', 'opacity=".16"');
          check(38, y - 3, '#5eead4');
        } else {
          tile.css.push('@keyframes pulse{0%,100%{opacity:.25}50%{opacity:1}}.pulse{animation:pulse 1.2s ease-in-out infinite}');
          tile.body.push(`<circle class="pulse" cx="${ox + 38}" cy="${oy + y - 3}" r="4" fill="#7aa2f7"/>`);
        }
        T(56, y, s, { size: 12, weight: 500, fill: done ? '#9aa0b0' : '#e8e6e1' });
      });
      tile.css.push('@keyframes blink{50%{opacity:0}}.blink{animation:blink 1s steps(1) infinite}');
      tile.body.push(`<rect class="blink" x="${ox + 16}" y="${oy + 206}" width="7" height="13" fill="#5eead4"/>`);
      R(0, 238, W, 26, '#12151c');
      M(14, 255, 'local model · ollama', { fill: '#6b7080' });
      M(486, 255, 'macOS · Windows · Linux', { fill: '#6b7080', anchor: 'end' });
    },

    // ---------------------------------------------------------------- Seismo
    seismo() {
      R(0, 0, W, H, '#0a0e1a');
      R(0, 0, W, 34, '#0f1424');
      T(16, 22, 'Seismo', { size: 13, weight: 800 });
      M(486, 21, 'watching 4 APIs', { anchor: 'end', fill: '#7d86a6' });
      const rows = [
        ['users', '#34d399', [8, 9, 8, 10, 9, 8, 9]],
        ['payments', '#f87171', [8, 9, 8, 9, 22, 24, 25]],
        ['shipping', '#34d399', [9, 8, 10, 9, 9, 8, 9]],
        ['orders', '#34d399', [9, 10, 9, 8, 10, 9, 8]],
      ];
      rows.forEach(([n, c, pts], i) => {
        const y = 48 + i * 44;
        R(12, y, 300, 36, '#11172a', 6, stroke(c === '#f87171' ? '#7f2a2a' : '#1c2440'));
        C(30, y + 18, 4, c);
        M(44, y + 22, n, { fill: '#cfd3e4', size: 11 });
        poly(pts.map((v, k) => [200 + k * 14, y + 30 - v]), c, 1.4);
        M(304, y + 22, c === '#f87171' ? 'DRIFT' : 'ok', { anchor: 'end', fill: c });
      });
      R(324, 48, 164, 172, '#11172a', 6, stroke('#7f2a2a'));
      M(338, 68, 'SCHEMA DRIFT', { fill: '#f87171' });
      T(338, 92, 'payments.amount', { size: 12, weight: 700 });
      M(338, 108, 'response shape changed', { fill: '#7d86a6' });
      R(338, 122, 136, 1, '#232b49');
      M(338, 140, 'AFFECTS', { fill: '#7d86a6' });
      ['/checkout', '/invoice'].forEach((r, i) => {
        R(338, 150 + i * 28, 136, 22, '#1a2140', 4);
        M(348, 165 + i * 28, r, { fill: '#e8e6e1', size: 10 });
      });
      M(12, 244, 'alert sent · 2 pages affected', { fill: '#7d86a6' });
    },

    // ---------------------------------------------------------------- MockMate
    mockmate() {
      R(0, 0, W, H, '#f6f6f8');
      R(0, 0, 112, H, '#ffffff');
      R(112, 0, 1, H, '#e4e4e8');
      T(16, 24, 'MockMate', { size: 13, weight: 800, fill: '#111' });
      M(16, 52, 'INTERVIEWER', { fill: '#9a9aa4' });
      ['Friendly Mentor', 'Strict FAANG', 'Startup Founder', 'Calm HR'].forEach((n, i) => {
        const y = 66 + i * 26;
        if (i === 1) R(8, y, 96, 22, '#111', 5);
        T(16, y + 15, n, { size: 10, weight: 500, fill: i === 1 ? '#fff' : '#55555c' });
      });
      R(128, 16, 252, 46, '#ffffff', 10, stroke('#e4e4e8'));
      T(142, 36, 'Walk me through a project where', { size: 11, weight: 500, fill: '#111' });
      T(142, 52, 'you used FastAPI in production.', { size: 11, weight: 500, fill: '#111' });
      R(250, 72, 238, 32, '#111', 10);
      R(264, 82, 150, 4, '#ffffff', 2, 'opacity=".85"');
      R(264, 92, 100, 4, '#ffffff', 2, 'opacity=".5"');
      R(128, 114, 360, 110, '#ffffff', 10, stroke('#e4e4e8'));
      M(144, 134, 'INSTANT FEEDBACK', { fill: '#9a9aa4' });
      [['Communication', 0.8], ['Technical depth', 0.62], ['Relevance', 0.9], ['Confidence', 0.5]].forEach(([n, v], i) => {
        const y = 152 + i * 17;
        T(144, y + 3, n, { size: 10, weight: 500, fill: '#55555c' });
        R(270, y - 4, 200, 8, '#ececf0', 4);
        R(270, y - 4, 200 * v, 8, i === 3 ? '#f59e0b' : '#111', 4);
      });
      R(128, 236, 360, 20, '#ffffff', 10, stroke('#e4e4e8'));
      T(142, 250, 'Type or speak your answer', { size: 10, weight: 500, fill: '#9a9aa4' });
      C(474, 246, 5, '#ef4444');
    },

    // ---------------------------------------------------------------- Humanoid-Face-3D
    humanoid() {
      const MESH = '#6ea8d8';
      const F = '#f5c26b';
      const cx = 236, cy = 112, rx = 52, ry = 72;
      R(0, 0, W, H, '#0b0c10');
      R(0, 0, 110, 226, '#101218');
      R(110, 0, 1, 226, '#22252e');
      M(12, 18, 'INPUT', { fill: '#6b7080' });
      R(12, 28, 86, 104, '#1a1d26', 6, stroke('#2a2e3a'));
      P('M55 50 C 33 52, 30 96, 40 108 C 46 118, 64 118, 70 108 C 80 96, 77 52, 55 50 Z', '#3b4152', 1.2, '#232735');
      R(12, 138, 86, 1, '#22252e');
      M(12, 154, '1 to 5 portraits', { fill: '#8b90a0' });
      M(12, 170, 'FLAME fit', { fill: '#8b90a0' });
      M(12, 186, '5,023 vertices', { fill: '#8b90a0' });
      M(12, 202, 'identity kept', { fill: '#8b90a0' });
      // mesh: latitudes
      [-0.62, -0.31, 0, 0.31, 0.62].forEach((t) => {
        const y = cy + t * ry;
        const hw = rx * Math.sqrt(1 - t * t);
        P(`M${round(cx - hw)} ${round(y)} Q ${cx} ${round(y + 9)} ${round(cx + hw)} ${round(y)}`, MESH, 1, 'none', 'opacity=".5"');
      });
      // mesh: meridians and outline
      [1, 0.82, 0.55, 0.26].forEach((k) => tile.body.push(`<ellipse cx="${ox + cx}" cy="${oy + cy}" rx="${round(rx * k)}" ry="${ry}" fill="none" stroke="${MESH}" stroke-width="1" opacity="${k === 1 ? 0.95 : 0.45}"/>`));
      P(`M${cx - 22} ${cy + 66} L${cx - 24} ${cy + 108} M${cx + 22} ${cy + 66} L${cx + 24} ${cy + 108}`, MESH, 1, 'none', 'opacity=".6"');
      // features
      P(`M${cx - 30} ${cy - 12} q10 -8 21 0 q-10 6 -21 0 M${cx + 9} ${cy - 12} q10 -8 21 0 q-10 6 -21 0`, F, 1.5);
      P(`M${cx} ${cy - 6} L${cx - 7} ${cy + 18} L${cx + 7} ${cy + 18}`, F, 1.5);
      P(`M${cx - 15} ${cy + 38} q15 8 30 0`, F, 1.5);
      tile.css.push('@keyframes scan{0%{transform:translateY(0)}100%{transform:translateY(150px)}}.scan{animation:scan 3s ease-in-out infinite alternate}');
      tile.body.push(`<rect class="scan" x="${ox + cx - 62}" y="${oy + cy - ry - 4}" width="124" height="2" fill="#ff5a1f" opacity=".75"/>`);
      M(236, 218, 'LOD0 · 4K displacement', { anchor: 'middle', fill: '#6b7080' });
      // blendshapes
      R(372, 0, 1, 226, '#22252e');
      M(386, 18, 'ARKIT-52', { fill: '#6b7080' });
      [['jawOpen', 0.55], ['mouthSmile', 0.8], ['browInnerUp', 0.3], ['eyeBlink', 0.65], ['cheekPuff', 0.15]].forEach(([n, v], i) => {
        const y = 42 + i * 34;
        M(386, y, n, { fill: '#a3a8b8' });
        R(386, y + 8, 100, 5, '#22252e', 2);
        R(386, y + 8, 100 * v, 5, i === 1 ? '#ff5a1f' : MESH, 2);
      });
      R(0, 226, W, 38, '#101218');
      R(0, 226, W, 1, '#22252e');
      ['photo', 'fit', 'texture', 'PBR', 'blendshapes', 'UE5 FBX'].forEach((n, i) => {
        const x = [14, 80, 134, 214, 262, 384][i];
        C(x, 245, 3, i === 5 ? '#ff5a1f' : '#3b4152');
        M(x + 9, 248, n, { fill: i === 5 ? '#e8e6e1' : '#8b90a0' });
      });
    },

    // ---------------------------------------------------------------- OncoPattern
    onco() {
      const A = '#ff5a1f';
      R(0, 0, W, H, '#0d1014');
      M(14, 20, 'TISSUE PHANTOM', { fill: '#6b7080' });
      R(12, 30, 262, 196, '#ecd9e6', 6);
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 14; j++) {
          if (i === 4 && j === 8) continue;
          const x = 26 + j * 18 + (i % 2) * 9 + rnd() * 4;
          const y = 46 + i * 20 + rnd() * 4;
          C(x, y, 6.5, '#c58cbb');
          C(x + rnd() * 2, y + rnd() * 2, 2.6, '#6b3a66');
        }
      }
      tile.defs.push(`<radialGradient id="heat"><stop offset="0" stop-color="${A}" stop-opacity=".55"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient>`);
      C(176, 126, 46, 'url(#heat)');
      C(176, 126, 9, '#8a2f7c');
      C(179, 124, 4, '#3d0f38');
      tile.body.push(`<circle class="pulse" cx="${ox + 176}" cy="${oy + 126}" r="16" fill="none" stroke="${A}" stroke-width="1.6" stroke-dasharray="4 3"/>`);
      tile.css.push('@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}.pulse{animation:pulse 1.8s ease-in-out infinite}');
      R(186, 90, 74, 16, '#0d1014', 3);
      M(223, 101, 'atypical cell', { anchor: 'middle', fill: '#fff', size: 8 });
      R(290, 30, 198, 196, '#12161c', 8, stroke('#22272f'));
      M(304, 50, 'FINDING', { fill: '#6b7080' });
      T(304, 72, 'Misaligned cell', { size: 13, weight: 800 });
      M(304, 96, 'CALIBRATED CONFIDENCE', { fill: '#6b7080', size: 8 });
      R(304, 104, 170, 7, '#22272f', 3);
      R(304, 104, 120, 7, A, 3);
      M(304, 132, 'EVIDENCE', { fill: '#6b7080', size: 8 });
      [['nuclear size', 1], ['spacing', 1], ['stain variation', 0]].forEach(([n, on], i) => {
        const y = 150 + i * 18;
        C(310, y - 3, 3, on ? '#34d399' : '#4b5060');
        M(320, y, n, { fill: on ? '#cfd3e4' : '#6b7080', size: 9 });
        if (!on) M(474, y, 'discounted', { anchor: 'end', fill: '#6b7080', size: 8 });
      });
      R(304, 198, 170, 20, 'none', 5, stroke('#3a3f4c'));
      M(389, 211, 'abstains if error bound unmet', { anchor: 'middle', fill: '#a3a8b8', size: 8 });
      R(0, 236, W, 28, '#0a0c10');
      M(14, 254, 'Research software · procedural phantoms, not patient data', { fill: '#6b7080' });
    },

    // ---------------------------------------------------------------- Smart Cursor
    smartcursor() {
      const G = '#39ff88';
      const A = '#ff4d4d';
      R(0, 0, W, H, '#0c0d10');
      R(12, 12, 316, 240, '#1a1c22', 8, stroke('#2a2d36'));
      R(12, 12, 316, 22, '#14161b', 8);
      R(12, 26, 316, 8, '#14161b');
      ['File', 'Edit', 'Render', 'View'].forEach((n, i) => T(26 + i * 44, 27, n, { size: 9, weight: 500, fill: '#8b90a0' }));
      // toolbar icons
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        const x = 26 + i * 40;
        R(x, 46, 28, 28, '#252831', 5);
        C(x + 14, 60, 5, i === 2 ? '#7aa2f7' : '#4b5060');
      });
      // sidebar rows
      [0, 1, 2, 3, 4].forEach((i) => R(26, 92 + i * 24, 70 + ((i * 17) % 36), 8, '#2a2d36', 3));
      // canvas + buttons
      R(120, 88, 192, 118, '#101216', 6, stroke('#2a2d36'));
      R(136, 104, 90, 10, '#2f3340', 3);
      R(136, 124, 150, 20, '#1d2027', 4, stroke('#2f3340'));
      R(136, 168, 66, 24, '#2563eb', 5);
      T(169, 184, 'Submit', { size: 9, weight: 700, fill: '#fff', anchor: 'middle' });
      R(210, 168, 60, 24, '#2a2d36', 5);
      T(240, 184, 'Cancel', { size: 9, weight: 600, fill: '#a3a8b8', anchor: 'middle' });
      // detection boxes
      const box = (x, y, w, h, label, hot) => {
        R(x, y, w, h, 'none', 3, `stroke="${hot ? A : G}" stroke-width="${hot ? 1.8 : 1.2}"`);
        R(x, y - 12, Math.max(34, label.length * 5.2 + 8), 11, hot ? A : G, 2);
        M(x + 4, y - 3, label, { fill: '#0c0d10', size: 8 });
      };
      box(24, 44, 32, 32, 'icon', false);
      box(104, 44, 32, 32, 'icon', false);
      box(184, 44, 32, 32, 'icon', false);
      box(134, 122, 154, 24, 'input', false);
      box(134, 166, 70, 28, 'button', true);
      box(208, 166, 64, 28, 'button', false);
      tile.css.push('@keyframes pulse2{0%,100%{opacity:.4}50%{opacity:1}}.pulse2{animation:pulse2 1.4s ease-in-out infinite}');
      tile.body.push(`<g class="pulse2"><path transform="translate(${ox + 169} ${oy + 180})" d="M-9 0H9M0 -9V9" stroke="${A}" stroke-width="2" stroke-linecap="round"/></g>`);
      // right panel
      R(340, 12, 148, 240, '#12151b', 8, stroke('#22272f'));
      M(354, 32, 'LOCATE', { fill: '#6b7080' });
      R(354, 40, 120, 22, '#0c0d10', 5, stroke('#2a2d36'));
      M(362, 55, 'click "Submit"', { fill: '#e8e6e1', size: 9 });
      M(354, 84, 'BOX', { fill: '#6b7080', size: 8 });
      M(354, 98, 'x1  y1  x2  y2', { fill: '#cfd3e4' });
      M(354, 120, 'CLICK AT', { fill: '#6b7080', size: 8 });
      M(354, 134, 'cx  cy', { fill: A });
      R(354, 148, 120, 1, '#22272f');
      M(354, 166, 'ENGINES', { fill: '#6b7080', size: 8 });
      [['Accessibility tree', 1], ['Apple Vision OCR', 1], ['Florence-2 LoRA', 0]].forEach(([n, on], i) => {
        C(360, 182 + i * 18, 3, on ? '#34d399' : '#4b5060');
        M(370, 185 + i * 18, n, { fill: on ? '#cfd3e4' : '#6b7080', size: 8 });
      });
      M(354, 244, 'pixel-accurate clicks', { fill: '#6b7080', size: 8 });
    },

    // ---------------------------------------------------------------- Auto-Navigator
    navigator() {
      const A = '#ff5a1f';
      R(0, 0, W, H, '#0e1116');
      R(12, 12, 300, 240, '#ffffff', 8);
      R(12, 12, 300, 24, '#e9e9ee', 8);
      R(12, 28, 300, 8, '#e9e9ee');
      R(60, 18, 180, 12, '#ffffff', 6);
      M(70, 27, 'app.example.com/login', { fill: '#6b6b74', size: 8 });
      R(32, 54, 120, 10, '#d4d4da', 3);
      T(32, 100, 'Sign in', { size: 14, weight: 800, fill: '#111' });
      R(32, 112, 180, 20, '#f1f1f4', 4, stroke('#dcdce2'));
      R(32, 142, 180, 20, '#f1f1f4', 4, stroke('#dcdce2'));
      R(32, 176, 76, 24, '#2563eb', 5);
      T(70, 192, 'Continue', { size: 10, weight: 700, fill: '#fff', anchor: 'middle' });
      R(26, 170, 88, 36, 'none', 7, `stroke="${A}" stroke-width="1.6" stroke-dasharray="4 3"`);
      tile.css.push('@keyframes cur{0%{transform:translate(120px,-40px)}60%,100%{transform:translate(0,0)}}.cur{animation:cur 2.6s cubic-bezier(.4,0,.2,1) infinite alternate}');
      tile.body.push(`<g class="cur"><path transform="translate(${ox + 84} ${oy + 190})" d="M0 0 L0 15 L4 11 L7 18 L10 17 L7 10 L12 10 Z" fill="#111" stroke="#fff" stroke-width="1.2"/></g>`);
      M(330, 26, 'AGENT', { fill: '#77767c' });
      [['Open login page', 1], ['Fill in details', 1], ['Click "Continue"', 0]].forEach(([s, done], i) => {
        const y = 52 + i * 28;
        if (done) {
          C(338, y - 3, 8, '#34d399', 'opacity=".18"');
          check(338, y - 3, '#34d399');
        } else C(338, y - 3, 4, A);
        T(354, y, s, { size: 10, weight: 500, fill: done ? '#8b90a0' : '#fff' });
      });
      R(324, 146, 164, 82, '#171a21', 8, stroke('#2a2f3a'));
      M(338, 166, 'APPROVE ACTION?', { fill: '#77767c' });
      R(338, 180, 76, 30, A, 6);
      T(376, 199, 'Approve', { size: 10, weight: 700, fill: '#111', anchor: 'middle' });
      R(422, 180, 54, 30, 'none', 6, stroke('#3a3f4c'));
      T(449, 199, 'Skip', { size: 10, weight: 600, fill: '#a3a8b8', anchor: 'middle' });
    },

    // ---------------------------------------------------------------- Magnm Build Planner
    planner() {
      R(0, 0, W, H, '#ffffff');
      T(16, 25, 'magnm', { size: 14, weight: 800, fill: '#111' });
      ['About', 'Website', 'Mobile app', 'Backend'].forEach((n, i) => {
        const x = 150 + i * 84;
        T(x, 25, n, { size: 10, weight: i === 1 ? 700 : 500, fill: i === 1 ? '#111' : '#8a8a92' });
        if (i === 1) R(x, 33, 44, 2, '#111');
      });
      R(0, 40, W, 1, '#ececf0');
      [['Landing pages', 1, ''], ['User login', 1, ''], ['Database', 1, 'auto'], ['Payments', 0, ''], ['Admin panel', 0, '']].forEach(([n, on, tag], i) => {
        const y = 56 + i * 34;
        R(16, y, 296, 28, '#fafafb', 6, stroke('#ececf0'));
        R(28, y + 7, 14, 14, on ? '#111' : '#fff', 3, stroke(on ? '#111' : '#cfcfd6'));
        if (on) check(35, y + 15, '#fff');
        T(54, y + 18, n, { size: 11, weight: 500, fill: '#111' });
        if (tag) {
          R(262, y + 7, 38, 14, '#eef2ff', 7);
          M(281, y + 17, tag, { anchor: 'middle', fill: '#4f46e5', size: 8 });
        }
      });
      R(328, 56, 160, 138, '#f6f6f4', 10);
      M(342, 76, 'YOUR BUILD', { fill: '#8a8a92' });
      [0.7, 0.45, 0.3].forEach((v, i) => R(342, 90 + i * 14, 132 * v, 6, '#111', 3));
      M(342, 150, 'ESTIMATE', { fill: '#8a8a92' });
      R(342, 158, 100, 14, '#111', 3);
      R(328, 204, 160, 32, '#111', 8);
      T(408, 224, 'Download PDF', { size: 11, weight: 700, fill: '#fff', anchor: 'middle' });
    },

    // ---------------------------------------------------------------- SkyRiseFPV
    skyrise() {
      const A = '#ff3d2e';
      R(0, 0, W, H, '#0c0c0d');
      R(0, 0, W, 34, '#111113');
      T(16, 22, 'SKYRISE FPV', { size: 12, weight: 800, ls: 0.08 });
      ['Drones', 'Goggles', 'Parts'].forEach((n, i) => T(260 + i * 56, 22, n, { size: 10, weight: 500, fill: '#9a9aa2' }));
      C(478, 18, 6, 'none', `stroke="#e8e6e1" stroke-width="1.5"`);
      R(12, 44, 476, 64, '#17171a', 8);
      T(28, 74, 'Fly further.', { size: 20, weight: 800, ls: -0.03 });
      R(28, 84, 120, 5, '#3a3a40', 2);
      R(380, 62, 92, 28, A, 6);
      T(426, 80, 'Shop now', { size: 10, weight: 700, fill: '#fff', anchor: 'middle' });
      [0, 1, 2, 3].forEach((i) => {
        const x = 14 + i * 120;
        R(x, 120, 112, 132, '#141417', 8, stroke('#232327'));
        const cx = x + 56;
        const cy = 158;
        P(`M${cx - 26} ${cy - 20} L${cx + 26} ${cy + 20} M${cx + 26} ${cy - 20} L${cx - 26} ${cy + 20}`, '#4a4a52', 2.5);
        [[-26, -20], [26, -20], [-26, 20], [26, 20]].forEach(([dx, dy]) => C(cx + dx, cy + dy, 9, 'none', `stroke="${i === 1 ? A : '#6a6a72'}" stroke-width="1.5"`));
        R(cx - 8, cy - 6, 16, 12, i === 1 ? A : '#6a6a72', 3);
        R(x + 12, 206, 60, 6, '#3a3a40', 3);
        R(x + 12, 220, 36, 6, '#e8e6e1', 3);
        R(x + 12, 232, 88, 14, 'none', 5, stroke('#3a3a40'));
      });
    },

    // ---------------------------------------------------------------- Mahaurja
    mahaurja() {
      const G = '#2dd4bf';
      R(0, 0, W, H, '#081412');
      R(0, 0, W, 34, '#0c1c19');
      T(16, 22, 'MAHAURJA', { size: 12, weight: 800, ls: 0.1 });
      M(106, 21, 'Plant OS', { fill: '#5f8a83' });
      C(444, 17, 3.5, '#34d399');
      M(486, 21, 'online', { anchor: 'end', fill: '#5f8a83' });
      [0.78, 0.55, 0.92, 0.4].forEach((v, i) => {
        const x = 12 + i * 120;
        const cx = x + 56;
        R(x, 46, 112, 88, '#0d1f1c', 8, stroke('#17332e'));
        tile.body.push(`<circle cx="${ox + cx}" cy="${oy + 86}" r="22" fill="none" stroke="#17332e" stroke-width="6"/>`);
        tile.body.push(`<circle cx="${ox + cx}" cy="${oy + 86}" r="22" fill="none" stroke="${v < 0.5 ? '#f59e0b' : G}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${round(v * 138.2)} 138.2" transform="rotate(-90 ${ox + cx} ${oy + 86})"/>`);
        M(cx, 124, `UNIT ${i + 1}`, { anchor: 'middle', fill: '#5f8a83' });
      });
      R(12, 146, 300, 98, '#0d1f1c', 8, stroke('#17332e'));
      M(26, 164, 'OUTPUT', { fill: '#5f8a83' });
      poly([[26, 220], [64, 204], [100, 212], [140, 186], [180, 194], [220, 170], [260, 178], [298, 160]], G, 2);
      R(324, 146, 164, 98, '#0d1f1c', 8, stroke('#17332e'));
      M(338, 164, 'ALERTS', { fill: '#5f8a83' });
      [['#f59e0b', 90], ['#34d399', 70], ['#34d399', 100]].forEach(([c, w], i) => {
        C(342, 184 + i * 20, 3.5, c);
        R(354, 181 + i * 20, w, 5, '#2a4a44', 2);
      });
    },
  };
}

module.exports = { makeDrawers, WINDOW: { w: W, h: H } };
