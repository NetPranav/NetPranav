// Seven designs of the same profile. Each returns an array of bands: { id, href, html }.
// Every band is screenshotted separately so it can carry its own link on GitHub.
const fs = require('fs');
const path = require('path');
const C = require('./content');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('en-US');

function ago(iso, now) {
  const m = Math.max(1, Math.round((now - Date.parse(iso)) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function statusParts(x) {
  const d = x.data;
  const out = [];
  if (d.lastPush) out.push(`Last push: ${d.lastPush.name ? esc(d.lastPush.name) : 'a private repo'}, ${ago(d.lastPush.at, x.now)}`);
  out.push(`${d.week7} contributions this week`);
  out.push(esc(C.free.status));
  if (C.statusNote) out.push(esc(C.statusNote));
  return out;
}

function heat(days) {
  const nz = days.filter((n) => n > 0).sort((a, b) => a - b);
  const q = (p) => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))] || 1;
  const t1 = q(0.25), t2 = q(0.5), t3 = q(0.75);
  const lvl = (n) => (n === 0 ? '' : n <= t1 ? 'l1' : n <= t2 ? 'l2' : n <= t3 ? 'l3' : 'l4');
  return `<div class="hm">${days.map((n) => `<i class="${lvl(n)}"></i>`).join('')}</div>`;
}
const dots = (x) => x.projects.map((p) => `<i class="${p.id === x.p.id ? 'on' : ''}"></i>`).join('');
const langLegend = (d) => d.languages.map((l) => `<span><i></i>${esc(l.name)} ${l.pct}%</span>`).join('');
const langBar = (d) => `<div class="bar">${d.languages.map((l) => `<i style="width:${l.pct}%"></i>`).join('')}</div>`;
const langBarPlain = (d, cls) => `<div class="${cls}">${d.languages.map((l) => `<i style="flex:${l.pct}"></i>`).join('')}</div>`;

function scallop() {
  let d = '';
  const n = 160;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, r = 50 + 5 * Math.cos(a * 10);
    d += (k ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2);
  }
  return `<svg viewBox="-58 -58 116 116" aria-hidden="true"><path d="${d}Z" fill="#4a51c4"/><path d="M-14 8 L14 -8 M2 -9 L14 -8 L12 4" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
}

// ---------------------------------------------------------------- bento skins (swiss, material3, neobrutal, aurora)
function bento(sk, x) {
  const { p, s, data: d } = x;
  const w = (id, href, inner, cls = '') => ({ id, href, html: `<div class="bn bn-${sk} ${cls}">${inner}</div>` });
  const lab = (t) => `<p class="lab">${t}</p>`;
  const hero = `<section class="c hero"><h1>${C.name[0]}<br>${C.name[1]}</h1><div class="orb">${sk === 'm3' ? scallop() : ''}</div><dl class="meta">${C.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
  const status = `<section class="c status"><span class="ping"></span><b>Live</b>${statusParts(x).map((t) => `<span>${t}</span>`).join('')}</section>`;
  const show = `<section class="c show"><figure class="win"><img alt="" src="${p.uri}"></figure><div class="txt">${lab(`Today's UI<b class="dot"></b>`)}<h2>${esc(p.name)}</h2><p class="bl">${esc(p.blurb)}</p><ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><div class="foot"><span class="lab">${esc(p.status)}</span><span class="dots">${dots(x)}</span></div></div></section>`;
  const now = `<section class="c now">${lab('Now building')}<p class="nm">${C.now.name}</p><p class="sm">${esc(C.now.blurb)}</p></section>`;
  const also = `<section class="c alsoc">${lab('Also today')}<div class="mini"><img alt="" src="${s.uri}"><p class="nm" style="font-size:20px">${esc(s.name)}</p><p class="sm">${esc(s.blurb)}</p></div></section>`;
  const free = `<section class="c free">${lab('Freelance')}<p class="nm" style="font-size:22px"><span class="ping"></span>${esc(C.free.status)}</p><p class="sm">${esc(C.free.note)}</p>${lab('Shipped for').replace('<p class="lab">', '<p class="lab" style="margin-top:14px">')}<p class="sm" style="margin:0;font-weight:700;opacity:1">${C.free.clients.join(' / ')}</p></section>`;
  const research = `<section class="c research">${lab('Research')}<div class="rs">${C.research.map((r) => `<article><h3>${esc(r.name)}</h3><p>${esc(r.line)}</p><ul>${r.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></article>`).join('')}</div></section>`;
  const work = `<section class="c work">${lab('Selected work')}<ul class="wk">${C.work.map((k) => `<li><b>${esc(k[0])}</b><span>${esc(k[1])}</span><em>${k[2]}</em></li>`).join('')}</ul></section>`;
  const awards = `<section class="c awards">${lab('Hackathons')}<ul class="aw">${C.awards.map((a) => `<li><b>${a[0]}</b><span>${a[1]}</span></li>`).join('')}</ul></section>`;
  const grid = `<section class="c pgrid">${lab('More projects')}<div class="pg">${C.projects.map((j) => `<div class="pj"><b>${esc(j.name)}</b><span>${esc(j.blurb)}</span><em>${esc(j.tag)}</em></div>`).join('')}</div></section>`;
  const heatc = `<section class="c heat">${lab('Contributions · last 12 months')}${heat(d.days)}<p class="note2">${fmt(d.contributionsYear)} contributions, including private repos.</p></section>`;
  const nums = `<section class="c nums">${lab('This year')}<div class="row"><b>${fmt(d.contributionsYear)}</b><span>contributions</span></div><div class="row"><b>${fmt(d.commitsYear)}</b><span>commits</span></div><div class="row"><b>${d.publicRepos}</b><span>public repos</span></div></section>`;
  const langs = `<section class="c langs">${lab('Languages · public repos, by code size')}${langBar(d)}<div class="lg">${langLegend(d)}</div></section>`;
  const time = `<section class="c time">${lab('Journey · first commits')}<ol class="tl">${C.timeline.map((t) => `<li><time>${t[0]}</time><b>${esc(t[1])}</b><span>${esc(t[2])}</span></li>`).join('')}</ol></section>`;
  const stack = `<section class="c stack">${lab('Stack')}<p class="st">${C.stack.join(' <i>/</i> ')}</p><p class="also">${esc(C.also)}</p></section>`;
  const edu = `<section class="c edu">${lab('Education')}${C.edu.map((e) => `<div class="ed">${e[0]}<span>${e[1]}</span></div>`).join('')}</section>`;
  const contact = `<section class="c contact"><b>Say hello.</b><a href="${C.profile}">GitHub ↗</a></section>`;
  return [
    w('top', C.profile, hero + status),
    w('today', p.url || C.profile, show),
    w('now', C.now.url, now + also + free, 'tri'),
    w('research', C.research[0].url, research),
    w('work', C.profile + '?tab=repositories', work + awards),
    w('projects', C.profile + '?tab=repositories', grid),
    w('stats', C.profile, heatc + nums + langs),
    w('journey', C.profile, time),
    w('stack', C.profile, stack + edu + contact),
  ];
}

// ---------------------------------------------------------------- minimal editorial
function minimal(x) {
  const { p, s, data: d } = x;
  const b = (id, href, inner, cls = '') => ({ id, href, html: `<div class="mf ${cls}">${inner}</div>` });
  return [
    b('top', C.profile, `<div class="top2"><b>${C.name.join(' ')}</b><span>${esc(C.meta[1][1])}</span><span><i class="ping"></i>${esc(C.free.status)}</span></div>
<h1>Building tools for <em>motion</em>, <em>3D faces</em> and agents.</h1>
<p class="lede">${esc(C.meta[0][1])}, working from first principles. ${esc(C.free.note)} Currently building ${C.now.name}.</p>
<div class="st2">${statusParts(x).map((t) => `<span>${t}</span>`).join('')}</div>`, 'first'),
    b('today', p.url || C.profile, `<figure style="margin-top:44px"><div class="fw"><img alt="" src="${p.uri}"></div><figcaption><div><b>${esc(p.name)}</b><small>Today's UI · ${esc(p.status)}</small><div class="pick">${dots(x)}</div></div><p>${esc(p.blurb)}</p></figcaption></figure><p class="alsoln">Also today: <b>${esc(s.name)}</b>, ${esc(s.blurb.charAt(0).toLowerCase() + s.blurb.slice(1))}</p>`),
    b('research', C.research[0].url, `<h3>Research</h3><div class="three">${C.research.map((r) => `<div><h4>${esc(r.name)}</h4><p>${esc(r.line)}</p><ul>${r.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>`),
    b('work', C.profile + '?tab=repositories', `<h3>Selected work</h3><ul class="l">${C.work.map((k) => `<li><b>${esc(k[0])}</b><span>${esc(k[1])}</span><em>${k[2]}</em></li>`).join('')}</ul><h3>Hackathons</h3><ul class="l">${C.awards.map((a) => `<li><b>${a[0]}</b><span>${a[1]}</span><em></em></li>`).join('')}</ul>`),
    b('projects', C.profile + '?tab=repositories', `<h3>More projects</h3><ul class="l">${C.projects.map((j) => `<li><b>${esc(j.name)}</b><span>${esc(j.blurb)}</span><em>${esc(j.tag)}</em></li>`).join('')}</ul>`),
    b('stats', C.profile, `<h3>Contributions · last 12 months</h3>${heat(d.days)}<div class="nm3"><div><b>${fmt(d.contributionsYear)}</b><span>contributions</span></div><div><b>${fmt(d.commitsYear)}</b><span>commits</span></div><div><b>${d.publicRepos}</b><span>public repos</span></div></div>${langBarPlain(d, 'bar')}<div class="lgd">${d.languages.map((l) => `<span>${esc(l.name)} ${l.pct}%</span>`).join('')}<span>public repos, by code size</span></div>`),
    b('journey', C.profile, `<h3>Journey · first commits</h3><ul class="tll">${C.timeline.map((t) => `<li><time>${t[0]}</time><b>${esc(t[1])}</b><span>${esc(t[2])}</span></li>`).join('')}</ul>`),
    b('stack', C.profile, `<div class="two"><div><h3>Stack</h3><p class="stk">${C.stack.join(', ')}</p><p class="also">${esc(C.also)}</p></div><div><h3>Education</h3><ul class="l">${C.edu.map((e) => `<li><b>${e[0]}</b><span></span><em>${e[1]}</em></li>`).join('')}</ul><h3>Shipped for</h3><p class="stk">${C.free.clients.join(', ')}</p></div></div><div class="end"><span>Say hello.</span><a href="${C.profile}">GitHub ↗</a></div>`, 'last'),
  ];
}

// ---------------------------------------------------------------- now playing
function nowplaying(x) {
  const { p, s, data: d, projects } = x;
  const idx = projects.findIndex((q) => q.id === p.id);
  const sec = (t, inner) => `<section><h2>${t}</h2>${inner}</section>`;
  const track = (n, name, blurb, tag, on) => `<div class="tr${on ? ' on' : ''}"><span>${n}</span><div><b>${esc(name)}</b><span class="d">${esc(blurb)}</span></div><em>${esc(tag)}</em></div>`;
  const nav = ['Home', 'Projects', 'Research', 'Journey', 'Stats'].map((t, i) => `<a${i === 0 ? ' class="on"' : ''}>${t}</a>`).join('');
  const side = `<aside><div class="logo">pranav</div>${nav}<div class="lib">Library</div><a>Hackathons</a><a>Freelance</a><a>Stack</a><div class="foot">${esc(C.meta[1][1])}<br>${statusParts(x)[0]}<br><b>${esc(C.free.status)}</b></div></aside>`;
  const html = `<div class="np">${side}<main>
<div class="hero"><div class="top"><div class="cover"><img alt="" src="${p.uri}"></div><div><small>Now playing · Today's UI</small><h1 style="font-size:${Math.max(28, Math.min(52, Math.floor(300 / (p.name.length * 0.7))))}px">${esc(p.name)}</h1><div class="sub">${esc(C.name.join(' '))} · ${esc(C.meta[0][1])}<br>${esc(p.blurb)}</div></div></div>
<div class="ctl"><div class="play">&#9654;</div><div class="chips">${statusParts(x).map((t) => `<span><i></i>${t}</span>`).join('')}</div></div></div>
${sec('Up next', `<div class="q"><img alt="" src="${s.uri}"><div><small>Also today</small><br><b>${esc(s.name)}</b><p>${esc(s.blurb)}</p></div></div>`)}
${sec('Selected work', C.work.map((k, i) => track(i + 1, k[0], k[1], k[2], k[0] === p.name)).join(''))}
${sec('More projects', C.projects.map((j, i) => track(i + 1, j.name, j.blurb, j.tag, j.name === p.name)).join(''))}
${sec('Research', `<div class="alb">${C.research.map((r) => `<article><h3>${esc(r.name)}</h3><p>${esc(r.line)}</p><ul>${r.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></article>`).join('')}</div>`)}
${sec('Hackathon charts', `<div class="chart">${C.awards.map((a) => `<div><span>${esc(a[1])}</span><b>${esc(a[0])}</b></div>`).join('')}</div>`)}
${sec('Contributions, last 12 months', `<div class="two"><div class="box">${heat(d.days)}<div class="note2" style="font-size:11.5px;color:var(--mu);margin-top:8px">Includes private repos.</div></div><div class="box nums"><div class="row"><b>${fmt(d.contributionsYear)}</b><span>contributions</span></div><div class="row"><b>${fmt(d.commitsYear)}</b><span>commits</span></div><div class="row"><b>${d.publicRepos}</b><span>public repos</span></div></div></div>`)}
${sec('Top genres, by code size', `<div class="box">${langBar(d)}<div class="lg">${langLegend(d)}</div></div>`)}
${sec('Discography, first commits', `<div class="disc">${C.timeline.map((t) => `<div><time>${esc(t[0])}</time><b>${esc(t[1])}</b><span>${esc(t[2])}</span></div>`).join('')}</div>`)}
<div class="tour"><b>${esc(C.free.status)}</b><span>${esc(C.free.note)}<br>Shipped for ${C.free.clients.join(', ')}</span></div>
${sec('Stack', `<div class="stackl">${C.stack.join(' · ')}</div><div class="also">${esc(C.also)}<br>${C.edu.map((e) => `${esc(e[0])} (${esc(e[1])})`).join(' · ')}</div>`)}
<div class="pl"><div class="th"><img alt="" src="${p.uri}"></div><div><b>${esc(p.name)}</b> <span style="color:var(--mu)">· ${esc(C.name.join(' '))}</span></div><div class="pr"><i></i></div><span style="color:var(--mu)">${idx + 1} / ${projects.length}</span></div>
</main></div>`;
  return [{ id: 'page', href: p.url || C.profile, html }];
}

// ---------------------------------------------------------------- blueprint
function blueprint(x) {
  const { p, s, data: d, projects } = x;
  const idx = projects.findIndex((q) => q.id === p.id);
  const b = (id, href, inner) => ({ id, href, html: `<div class="bp"><div class="sheet">${inner}</div></div>` });
  const tbl = (head, rows) => `<table><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  return [
    b('top', C.profile, `<div><h1>${C.name[0]} <span>${C.name[1]}</span></h1><div class="sub">${C.meta.map((m) => `<span>${esc(m[1])}</span>`).join('')}</div><div class="stl">${statusParts(x).map((t) => `<span>${t}</span>`).join('')}</div></div>`),
    b('today', p.url || C.profile, `<div class="grid"><div><h3>Fig. A · Today's UI</h3><div class="fig"><div class="dh">500</div><div class="dv"><span>290</span></div><div class="fw"><img alt="" src="${p.uri}"></div><div class="cap"><span><b>${esc(p.name)}</b> · ${esc(p.status)}</span><span>${p.tags.map(esc).join(' / ')}</span></div></div><p style="margin-top:6px;color:var(--dim)">${esc(p.blurb)}</p></div>
<div class="col"><div><h3>Fig. B · Also today</h3><div class="fw" style="border:1px solid var(--ln);line-height:0"><img alt="" style="width:100%;height:auto" src="${s.uri}"></div><p style="margin-top:6px"><b style="color:var(--hl);font-weight:500">${esc(s.name)}</b><br><span style="color:var(--dim)">${esc(s.blurb)}</span></p></div></div></div>`),
    b('now', C.now.url, `<div class="two"><div><h3>Now building</h3><p><b style="color:var(--hl);font-weight:500">${C.now.name}</b><br>${esc(C.now.blurb)}</p></div><div><h3>Freelance</h3><p>${esc(C.free.status)}.<br>${esc(C.free.note)}<br>Shipped for ${C.free.clients.join(', ')}.</p></div></div>`),
    b('research', C.research[0].url, `<h3>Research</h3><div class="three">${C.research.map((r) => `<div><h4>${esc(r.name)}</h4><p style="color:var(--dim);margin-bottom:6px">${esc(r.line)}</p><ul class="pl">${r.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>`),
    b('work', C.profile + '?tab=repositories', `<div class="two"><div><h3>Selected work</h3>${tbl(['Project', 'Note', 'Lang'], C.work.map((k) => [esc(k[0]), esc(k[1]), k[2]]))}</div><div><h3>Revisions · hackathons</h3>${tbl(['Rev', 'Award', 'Event'], C.awards.map((a, i) => ['CBA'[i], a[0], a[1]]))}</div></div>`),
    b('projects', C.profile + '?tab=repositories', `<h3>Bill of projects</h3>${tbl(['Item', 'Description', 'Tag'], C.projects.map((j, i) => [String(i + 1).padStart(2, '0') + ' ' + esc(j.name), esc(j.blurb), esc(j.tag)]))}`),
    b('stats', C.profile, `<h3>Contributions · last 12 months</h3>${heat(d.days)}<div class="two" style="margin-top:14px"><div>${tbl(['Metric', 'Value'], [['Contributions', fmt(d.contributionsYear)], ['Commits', fmt(d.commitsYear)], ['Public repos', d.publicRepos]])}</div><div><p style="color:var(--dim);margin-bottom:6px">Languages · public repos, by code size</p>${langBarPlain(d, 'bar3')}<p>${d.languages.map((l) => `${esc(l.name)} ${l.pct}%`).join(' · ')}</p></div></div>`),
    b('journey', C.profile, `<h3>Revision history · first commits</h3>${tbl(['Date', 'Entry', 'Note'], C.timeline.map((t) => [t[0], esc(t[1]), esc(t[2])]))}`),
    b('stack', C.profile, `<div class="two"><div><h3>Bill of materials</h3>${tbl(['Item', 'Role'], C.stack.map((q, i) => [q, ['Language', 'Language', 'Framework', 'Motion', 'ML', 'Deploy'][i]]))}<p style="color:var(--dim);margin-top:6px">${esc(C.also)}</p></div><div><h3>Education</h3>${tbl(['Item', 'When'], C.edu.map((e) => [e[0], e[1]]))}</div></div>
<div class="tb" style="margin-top:22px"><div><small>Drawn by</small><b>Pranav Dubey</b></div><div><small>Project</small><b>${esc(p.name)}</b></div><div><small>Sheet</small><b>${idx + 1} / ${projects.length}</b></div><div><small>Scale</small><b>1 : 1</b></div></div>`),
  ];
}

const DESIGNS = {
  swiss: (x) => bento('sw', x),
  material3: (x) => bento('m3', x),
  neobrutal: (x) => bento('nb', x),
  aurora: (x) => bento('ag', x),
  minimal,
  nowplaying,
  blueprint,
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=DM+Mono:wght@400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Roboto+Flex:opsz,wght@8..144,400;8..144,600;8..144,800&family=Sora:wght@400;600;700&family=Barlow+Condensed:wght@500;600;700&family=Unbounded:wght@500;700;800&family=DM+Sans:wght@400;500;600;700&display=swap';
const CSS = fs.readFileSync(path.join(__dirname, 'base.css'), 'utf8') + fs.readFileSync(path.join(__dirname, 'extra.css'), 'utf8') + fs.readFileSync(path.join(__dirname, 'np.css'), 'utf8');

function renderPage(design, x) {
  const bands = DESIGNS[design](x);
  const blobs = design === 'aurora'
    ? ['left:-120px;top:-80px;width:480px;height:480px;background:#5b3cff', 'right:-140px;top:900px;width:520px;height:460px;background:#00c2a8', 'left:-100px;top:1900px;width:460px;height:420px;background:#7a3cff', 'right:-120px;top:2800px;width:480px;height:420px;background:#00a8c2'].map((s) => `<i class="blob" style="${s}"></i>`).join('')
    : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=880"><link rel="stylesheet" href="${FONTS}"><style>${CSS}</style></head><body><div class="page pg-${design}">${blobs}${bands.map((b) => `<div class="band" data-band="${b.id}">${b.html}</div>`).join('')}</div></body></html>`;
  return { html, bands: bands.map((b) => ({ id: b.id, href: b.href })) };
}

module.exports = { renderPage, DESIGNS };
