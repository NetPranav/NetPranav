const fs = require('fs');
const path = require('path');
const fontkit = require('fontkit');
const subsetFont = require('subset-font');
const config = require('./bento.config');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const OUT_DIR = path.join(__dirname, '..', 'generated', 'bento');
const README = path.join(__dirname, '..', 'README.md');

// Grid: 6 columns of 140px. Each tile carries its own gutter (GX left/right, GY top/bottom)
// because GitHub lays the images out inline with no gap of its own.
const COLS = 6;
const COL = 140;
const GX = 6;
const GY = 3;
const ROW = { hero: 270, mid: 190, work: 214, stack: 170, contact: 72 };

const THEMES = {
  dark: { card: '#151515', ink: '#f2f0eb', muted: '#a8a59d', line: '#2e2c29' },
  light: { card: '#f4f3ef', ink: '#111111', muted: '#5c5a55', line: '#dcd9d2' },
};
const ON_ACCENT = '#111111';

const FONT_DIR = path.join(__dirname, '..', 'node_modules', '@fontsource');
const FONT_FILES = {
  'sans-500': 'inter-tight/files/inter-tight-latin-500-normal.woff2',
  'sans-600': 'inter-tight/files/inter-tight-latin-600-normal.woff2',
  'sans-700': 'inter-tight/files/inter-tight-latin-700-normal.woff2',
  'sans-800': 'inter-tight/files/inter-tight-latin-800-normal.woff2',
  'mono-400': 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
};
const FAMILY = {
  sans: "BentoSans, 'Inter Tight', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "BentoMono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};
const fonts = {};
function font(key) {
  if (!fonts[key]) {
    const file = path.join(FONT_DIR, FONT_FILES[key]);
    fonts[key] = { buf: fs.readFileSync(file), fk: fontkit.openSync(file) };
  }
  return fonts[key];
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const fontKey = (o) => `${o.font || 'sans'}-${o.weight || (o.font === 'mono' ? 400 : 500)}`;

function measure(str, o) {
  const f = font(fontKey(o)).fk;
  const ls = (o.ls || 0) * o.size * str.length;
  return (f.layout(str).advanceWidth / f.unitsPerEm) * o.size + ls;
}

function ellipsize(str, maxW, o) {
  if (measure(str, o) <= maxW) return str;
  let s = str;
  while (s.length > 1 && measure(s + '…', o) > maxW) s = s.slice(0, -1);
  return s.trimEnd() + '…';
}

function wrap(str, maxW, o, maxLines = Infinity) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, o) <= maxW || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = ellipsize(`${kept[maxLines - 1]} ${lines[maxLines]}`, maxW, o);
    return kept;
  }
  return lines;
}

function fitSize(str, maxW, o, min) {
  let size = o.size;
  while (size > min && measure(str, { ...o, size }) > maxW) size -= 1;
  return size;
}

class Tile {
  constructor(theme, cols, h, title) {
    this.t = theme;
    this.title = title;
    this.w = cols * COL;
    this.h = h;
    this.cw = this.w - GX * 2;
    this.body = [];
    this.defs = [];
    this.css = [];
    this.glyphs = {};
  }

  card(fill = this.t.card, stroke = this.t.line) {
    this.body.push(`<rect x="${GX + 0.5}" y="${GY + 0.5}" width="${this.cw - 1}" height="${this.h - 1}" rx="6" fill="${fill}" stroke="${stroke}"/>`);
  }

  text(x, y, str, o) {
    const key = fontKey(o);
    this.glyphs[key] = (this.glyphs[key] || '') + str;
    const attrs = [
      `x="${round(x)}"`,
      `y="${round(y)}"`,
      `font-family="${FAMILY[o.font || 'sans']}"`,
      `font-weight="${key.split('-')[1]}"`,
      `font-size="${o.size}"`,
      `fill="${o.fill}"`,
    ];
    if (o.ls) attrs.push(`letter-spacing="${round(o.ls * o.size)}"`);
    if (o.anchor) attrs.push(`text-anchor="${o.anchor}"`);
    if (o.opacity) attrs.push(`opacity="${o.opacity}"`);
    this.body.push(`<text ${attrs.join(' ')}>${escapeXml(str)}</text>`);
    return measure(str, o);
  }

  label(x, y, str, fill, opacity) {
    return this.text(x, y, str.toUpperCase(), { font: 'mono', size: 11, ls: 0.06, fill, opacity });
  }

  arrowRight(x, y, stroke) {
    this.body.push(`<g class="nudge" transform="translate(${round(x)} ${round(y)})"><path d="M0 0h11M7-4l4 4-4 4" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  }

  arrowUpRight(x, y, stroke) {
    this.body.push(`<path transform="translate(${round(x)} ${round(y)})" d="M0 9L9 0M2 0h7v7" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  async render() {
    const faces = await Promise.all(
      Object.entries(this.glyphs).map(async ([key, chars]) => {
        const [fam, weight] = key.split('-');
        const sub = await subsetFont(font(key).buf, [...new Set(chars)].join(''), { targetFormat: 'woff2' });
        const name = fam === 'sans' ? 'BentoSans' : 'BentoMono';
        return `@font-face{font-family:${name};font-weight:${weight};src:url(data:font/woff2;base64,${sub.toString('base64')}) format('woff2')}`;
      })
    );
    const H = this.h + GY * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${H}" viewBox="0 0 ${this.w} ${H}" role="img" aria-labelledby="title">
<title id="title">${escapeXml(this.title)}</title>
<style>${faces.join('')}${this.css.join('')}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}
.nudge>path{animation:nudge 2.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
${this.defs.length ? `<defs>${this.defs.join('')}</defs>` : ''}
${this.body.join('\n')}
</svg>
`;
  }
}

const round = (n) => Math.round(n * 100) / 100;
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// ---------- Tiles ----------

function heroTile(t, d) {
  const tile = new Tile(t, 6, ROW.hero, `${config.name.join(' ')}: ${config.meta.map((m) => m.value).join(', ')}`);
  tile.card();
  const x0 = GX + 28;
  const nameStyle = { size: 92, weight: 800, ls: -0.055, fill: t.ink };
  tile.text(x0, 96, config.name[0], nameStyle);
  tile.text(x0, 175, config.name[1], nameStyle);
  tile.body.push(`<circle cx="${GX + tile.cw - 28 - 32}" cy="${GY + 26 + 32}" r="32" fill="${d.accent}"/>`);
  tile.body.push(`<path d="M${x0} 210.5H${GX + tile.cw - 28}" stroke="${t.line}"/>`);
  const colW = (tile.cw - 56 - 48) / 4;
  config.meta.forEach((m, i) => {
    const x = x0 + i * (colW + 16);
    tile.label(x, 234, m.label, t.muted);
    const vs = { size: 14, weight: 600, fill: t.ink };
    tile.text(x, 254, ellipsize(m.value, colW, vs), vs);
  });
  return tile;
}

function nowTile(t, d) {
  const now = d.nowBuilding;
  const tile = new Tile(t, 2, ROW.mid, `Now building: ${now.name}. ${now.blurb}`);
  tile.card(d.accent, d.accent);
  const x0 = GX + 20;
  const maxW = tile.cw - 40;
  const lw = tile.label(x0, 33, 'Now building', ON_ACCENT);
  tile.arrowRight(x0 + lw + 6, 29, ON_ACCENT);
  const ds = { size: 13, weight: 500, fill: ON_ACCENT };
  const lines = wrap(now.blurb, maxW, ds, 3);
  const last = GY + ROW.mid - 23;
  const first = last - 19 * (lines.length - 1);
  lines.forEach((l, i) => tile.text(x0, first + i * 19, l, ds));
  const ts = { size: 26, weight: 800, ls: -0.03, fill: ON_ACCENT };
  ts.size = fitSize(now.name, maxW, ts, 16);
  tile.text(x0, first - 23, ellipsize(now.name, maxW, ts), ts);
  return tile;
}

function reposTile(t, d) {
  const tile = new Tile(t, 1, ROW.mid, `${d.publicRepos} public repositories`);
  tile.card();
  tile.label(GX + 18, 33, 'Repos', t.muted);
  const ns = { size: 64, weight: 800, ls: -0.06, fill: t.ink };
  const num = String(d.publicRepos);
  ns.size = fitSize(num, tile.cw - 36, ns, 32);
  tile.text(GX + 18, GY + ROW.mid - 20, num, ns);
  return tile;
}

const ABBR = { TypeScript: 'TS', JavaScript: 'JS', Python: 'PY', 'C++': 'C++', 'C#': 'C#', Go: 'GO', Rust: 'RS', Java: 'JAVA', HTML: 'HTML', CSS: 'CSS', Shell: 'SH', 'Jupyter Notebook': 'NB', Kotlin: 'KT', Swift: 'SWIFT', Dart: 'DART' };

function langsTile(t, d) {
  const segs = d.languages.slice(0, 3).map((l) => ({ name: l.name, short: ABBR[l.name] || l.name.slice(0, 3).toUpperCase(), pct: l.percent }));
  const other = 100 - segs.reduce((s, l) => s + l.pct, 0);
  if (other > 0) segs.push({ name: 'other', short: '+', pct: other, other: true });
  segs.sort((a, b) => b.pct - a.pct);

  const tile = new Tile(t, 3, ROW.mid, `Language share: ${segs.map((s) => `${s.name} ${s.pct}%`).join(', ')}`);
  tile.card();
  const x0 = GX + 20;
  tile.label(x0, 33, 'Language share', t.muted);

  const fills = [t.ink, d.accent, t.line, t.muted];
  const labelFills = [t.card, ON_ACCENT, t.ink, t.card];
  const heights = [1, 0.62, 0.4, 0.22];
  const gap = 6;
  const avail = tile.cw - 40 - gap * (segs.length - 1);
  const bottom = 150;
  const fullH = 92;
  const total = segs.reduce((s, l) => s + l.pct, 0);
  tile.css.push('@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}.bar{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s cubic-bezier(.2,.8,.2,1) both}');
  let x = x0;
  segs.forEach((s, i) => {
    const w = (s.pct / total) * avail;
    const h = fullH * heights[i];
    tile.body.push(`<rect class="bar" style="animation-delay:${i * 0.08}s" x="${round(x)}" y="${round(bottom - h)}" width="${round(w)}" height="${round(h)}" rx="3" fill="${fills[i]}"/>`);
    const text = s.other ? `+${s.pct}` : `${s.short} ${s.pct}`;
    const ls = { size: 12, weight: 600, fill: labelFills[i] };
    if (h >= 26 && measure(text, ls) + 16 <= w) tile.text(x + 8, bottom - 8, text, ls);
    x += w + gap;
  });
  const cs = { size: 12, weight: 500, fill: t.muted };
  tile.text(x0, 170, ellipsize(`${segs.map((s) => s.name).join(', ')} (%)`, tile.cw - 40, cs), cs);
  return tile;
}

function workTile(t) {
  const tile = new Tile(t, 4, ROW.work, `Selected work: ${config.projects.map((p) => `${p.name}, ${p.blurb}`).join('; ')}`);
  tile.card();
  const x0 = GX + 22;
  const inner = tile.cw - 44;
  tile.label(x0, 31, 'Selected work', t.muted);
  const ns = { size: 17, weight: 700, ls: -0.02, fill: t.ink };
  const nameX = x0 + 40;
  const descX = nameX + Math.max(...config.projects.map((p) => measure(p.name, ns))) + 18;
  const ds = { size: 13, weight: 500, fill: t.muted };
  config.projects.slice(0, 3).forEach((p, i) => {
    const ly = 44 + i * 52;
    tile.body.push(`<path d="M${x0} ${ly + 0.5}H${x0 + inner}" stroke="${t.line}"/>`);
    const by = ly + 31;
    tile.text(x0, by, String(i + 1).padStart(2, '0'), { font: 'mono', size: 12, fill: t.muted });
    tile.text(nameX, by, p.name, ns);
    tile.text(descX, by, ellipsize(p.blurb, x0 + inner - 40 - descX, ds), ds);
    tile.text(x0 + inner, by, p.lang, { font: 'mono', size: 11, fill: t.ink, anchor: 'end' });
  });
  return tile;
}

function hackathonTile(t, d) {
  const hk = config.hackathons;
  const tile = new Tile(t, 2, ROW.work, `Hackathons: ${hk.headline.text}; ${hk.second.title}, ${hk.second.text}`);
  tile.card(t.ink, t.ink);
  const x0 = GX + 20;
  tile.label(x0, 31, 'Hackathons', t.card, 0.75);
  const bottom = GY + ROW.work - 23;
  tile.text(x0, bottom, hk.second.text, { size: 13, weight: 500, fill: t.card, opacity: 0.8 });
  tile.text(x0, bottom - 19, hk.second.title, { size: 17, weight: 700, fill: t.card });
  const hs = { size: 13, weight: 500, fill: t.card };
  const lines = wrap(hk.headline.text, tile.cw - 40, hs, 2);
  const lastHead = bottom - 19 - 31;
  lines.forEach((l, i) => tile.text(x0, lastHead - (lines.length - 1 - i) * 18, l, hs));
  tile.text(x0, lastHead - (lines.length - 1) * 18 - 20, hk.headline.big, { size: 28, weight: 800, ls: -0.04, fill: d.accent });
  return tile;
}

function stackTile(t, d) {
  const st = config.stack;
  const tile = new Tile(t, 4, ROW.stack, `Stack: ${st.marquee.join(', ')}. ${st.also}`);
  tile.card();
  const x0 = GX + 22;
  tile.label(x0, 31, 'Stack', t.muted);

  const cs = { size: 13, weight: 500, fill: t.muted };
  const lines = wrap(st.also, tile.cw - 44, cs, 2);
  const last = GY + ROW.stack - 21;
  const first = last - 18 * (lines.length - 1);
  lines.forEach((l, i) => tile.text(x0, first + i * 18, l, cs));

  const ms = { size: 30, weight: 700, ls: -0.03, fill: t.ink };
  const ss = { ...ms, fill: d.accent };
  const baseline = round((35 + first - 10) / 2 + 11);
  const gap = 26;
  const before = tile.body.length;
  let x = 0;
  for (let rep = 0; rep < 2; rep++) {
    for (const item of st.marquee) {
      x += tile.text(x, baseline, item, ms) + gap;
      x += tile.text(x, baseline, '/', ss) + gap;
    }
  }
  const setWidth = round(x / 2);
  const runs = tile.body.splice(before);
  tile.defs.push(`<clipPath id="card"><rect x="${GX}" y="${GY}" width="${tile.cw}" height="${tile.h}" rx="6"/></clipPath>`);
  tile.css.push(`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-${setWidth}px)}}.marquee{animation:marquee ${round(setWidth / 28)}s linear infinite}`);
  tile.body.push(`<g clip-path="url(#card)"><g transform="translate(${x0} 0)"><g class="marquee">${runs.join('')}</g></g></g>`);
  return tile;
}

function educationTile(t) {
  const tile = new Tile(t, 2, ROW.stack, `Education: ${config.education.map((e) => `${e.title} (${e.note})`).join('; ')}`);
  tile.card();
  const x0 = GX + 20;
  const xr = GX + tile.cw - 20;
  tile.label(x0, 31, 'Education', t.muted);
  const rows = config.education.slice(-2);
  const ts = { size: 15, weight: 700, fill: t.ink };
  rows.forEach((e, i) => {
    const by = 150 - (rows.length - 1 - i) * 34;
    if (i > 0) tile.body.push(`<path d="M${x0} ${by - 22.5}H${xr}" stroke="${t.line}"/>`);
    const nw = tile.text(xr, by, e.note, { font: 'mono', size: 12, fill: t.muted, anchor: 'end' });
    tile.text(x0, by, ellipsize(e.title, xr - x0 - nw - 12, ts), ts);
  });
  return tile;
}

function contactTiles(t) {
  const contacts = config.contacts;
  const linkStyle = { size: 14, weight: 600, fill: t.ink };
  const linkMark = (tile, xEnd, by, label) => {
    const w = measure(label, linkStyle);
    const xs = xEnd - 15 - w;
    tile.text(xs, by, label, linkStyle);
    tile.body.push(`<path d="M${round(xs)} ${by + 4.5}H${round(xs + w)}" stroke="${t.ink}"/>`);
    tile.arrowUpRight(xEnd - 10, by - 10, t.ink);
  };
  const by = GY + ROW.contact / 2 + 6;
  const helloStyle = { size: 20, weight: 800, ls: -0.03, fill: t.ink };

  if (contacts.length === 1) {
    const tile = new Tile(t, 6, ROW.contact, `Say hello on ${contacts[0].label}`);
    tile.card();
    tile.text(GX + 22, by + 1, 'Say hello.', helloStyle);
    linkMark(tile, GX + tile.cw - 22, by, contacts[0].label);
    return [{ name: 'contact', cols: 6, href: contacts[0].url, tile }];
  }

  const hello = new Tile(t, 2, ROW.contact, 'Say hello.');
  hello.card();
  hello.text(GX + 22, by + 1, 'Say hello.', helloStyle);
  const out = [{ name: 'contact', cols: 2, href: `https://github.com/${config.username}`, tile: hello }];
  const cols = 4 / contacts.length;
  contacts.forEach((c, i) => {
    const tile = new Tile(t, cols, ROW.contact, c.label);
    tile.card();
    const w = measure(c.label, linkStyle) + 15;
    linkMark(tile, GX + (tile.cw + w) / 2, by, c.label);
    out.push({ name: `contact-${i + 1}`, cols, href: c.url, tile });
  });
  return out;
}

// ---------- Data ----------

async function gh(url) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'bento-profile' };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${url}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`);
  return res.json();
}

async function fetchData() {
  const user = await gh(`/users/${config.username}`);
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await gh(`/users/${config.username}/repos?per_page=100&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const own = repos.filter((r) => !r.fork);
  const counts = {};
  own.forEach((r) => r.language && (counts[r.language] = (counts[r.language] || 0) + 1));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const languages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => ({ name, percent: Math.round((n / total) * 100) }));

  let latest = null;
  const candidate = own.find((r) => r.name !== config.repo && r.description);
  if (candidate) latest = { name: candidate.name, blurb: candidate.description.trim(), url: candidate.html_url };

  return { publicRepos: user.public_repos, languages, latest };
}

async function loadData() {
  const cacheFile = path.join(OUT_DIR, 'data.json');
  try {
    const data = await fetchData();
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2) + '\n');
    return data;
  } catch (e) {
    console.warn(`Live fetch failed (${e.message}); using cached data.`);
    if (fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    return { publicRepos: 0, languages: [{ name: 'TypeScript', percent: 100 }], latest: null };
  }
}

// ---------- README ----------

const pct = (cols) => String(round((cols / COLS) * 99.9));

function picture(name, cols, alt, href) {
  const src = `./generated/bento/${name}`;
  return `<a href="${href}"><picture><source media="(prefers-color-scheme: dark)" srcset="${src}-dark.svg"><img alt="${escapeXml(alt)}" src="${src}-light.svg" width="${pct(cols)}%"></picture></a>`;
}

function writeReadme(rows) {
  const body = rows.map((row) => row.map((c) => picture(c.name, c.cols, c.alt, c.href)).join('')).join('<br>\n');
  fs.writeFileSync(README, `<div align="center">\n${body}\n</div>\n`);
}

// ---------- Main ----------

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const data = await loadData();
  const profile = `https://github.com/${config.username}`;
  const repoUrl = (name) => `${profile}/${name}`;

  const nb = config.nowBuilding;
  const nowBuilding =
    nb.repo === 'auto' && data.latest
      ? { name: data.latest.name, blurb: data.latest.blurb, url: data.latest.url }
      : { name: nb.repo, blurb: nb.blurb, url: repoUrl(nb.repo) };
  const d = { ...data, nowBuilding, accent: config.accent };

  const layout = (t) => [
    [{ name: 'hero', cols: 6, href: profile, tile: heroTile(t, d) }],
    [
      { name: 'now', cols: 2, href: nowBuilding.url, tile: nowTile(t, d) },
      { name: 'repos', cols: 1, href: `${profile}?tab=repositories`, tile: reposTile(t, d) },
      { name: 'languages', cols: 3, href: `${profile}?tab=repositories`, tile: langsTile(t, d) },
    ],
    [
      { name: 'work', cols: 4, href: `${profile}?tab=repositories`, tile: workTile(t, d) },
      { name: 'hackathons', cols: 2, href: config.hackathons.link, tile: hackathonTile(t, d) },
    ],
    [
      { name: 'stack', cols: 4, href: profile, tile: stackTile(t, d) },
      { name: 'education', cols: 2, href: profile, tile: educationTile(t, d) },
    ],
    contactTiles(t),
  ];

  let rows;
  for (const [mode, theme] of Object.entries(THEMES)) {
    rows = layout(theme);
    for (const cell of rows.flat()) {
      fs.writeFileSync(path.join(OUT_DIR, `${cell.name}-${mode}.svg`), await cell.tile.render());
      cell.alt = cell.tile.title;
    }
  }
  writeReadme(rows);
  console.log(`Bento tiles written to ${path.relative(process.cwd(), OUT_DIR)} (${data.publicRepos} repos).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
