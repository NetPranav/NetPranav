// Daily profile: pick today's design and projects, render the page in headless Chromium, write README.
//   node scripts/daily/render.js                 render today (UTC)
//   PROFILE_DATE=2026-11-09 node ...             render another date
//   node scripts/daily/render.js --plan 7        print the next 7 days as JSON, render nothing
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');
const config = require('../bento.config');
const C = require('./content');
const { planFor } = require('./schedule');
const { loadData } = require('./data');
const { renderPage } = require('./designs');
const { renderMockup } = require('../generate_bento');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'generated', 'daily');
const README = path.join(ROOT, 'README.md');
const IDS = config.showcase.map((p) => p.id);
const NAMES = { swiss: 'Swiss bento', material3: 'Material 3 Expressive', minimal: 'Minimal editorial', neobrutal: 'Neo-brutalist', aurora: 'Aurora glass', nowplaying: 'Now playing', blueprint: 'Blueprint' };

function dayStr(offset, from) {
  const base = from ? Date.parse(`${from}T00:00:00Z`) : Math.floor(Date.now() / 86400000) * 86400000;
  return new Date(base + offset * 86400000).toISOString().slice(0, 10);
}

async function main() {
  const argv = process.argv.slice(2);
  const planIdx = argv.indexOf('--plan');
  if (planIdx >= 0) {
    const n = Number(argv[planIdx + 1] || 7);
    const rows = Array.from({ length: n }, (_, i) => planFor(dayStr(i, process.env.PROFILE_DATE), IDS));
    console.log(JSON.stringify(rows, null, 1));
    return;
  }

  const plan = planFor(process.env.PROFILE_DATE, IDS);
  const byId = Object.fromEntries(config.showcase.map((p) => [p.id, p]));
  const withUri = async (id) => {
    const e = byId[id];
    const svg = await renderMockup(e);
    return { ...e, status: e.status || (e.url ? 'Open source' : 'Private repo'), uri: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') };
  };
  const [p, s] = [await withUri(plan.main), await withUri(plan.also)];
  const data = await loadData();
  const x = { p, s, data, projects: config.showcase, plan, now: Date.now() };
  const { html } = renderPage(plan.design, x);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const NATIVE = { swiss: 'light', material3: 'light', minimal: 'light', neobrutal: 'light', aurora: 'dark', nowplaying: 'dark', blueprint: 'dark' };
    const flip = '.page{filter:invert(1) hue-rotate(180deg)}.page img{filter:invert(1) hue-rotate(180deg)}';
    fs.mkdirSync(OUT, { recursive: true });
    const files = {};
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: 880, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      if (NATIVE[plan.design] !== scheme) await page.addStyleTag({ content: flip });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const height = await page.evaluate(() => Math.ceil(document.querySelector('.page').getBoundingClientRect().height));
      const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: 880, height } });
      const meta = await sharp(png).metadata();
      const w = meta.width, h = meta.height, r = 36;
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
      const webp = await sharp(png).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).webp({ quality: 86, effort: 5 }).toBuffer();
      files[scheme] = `${plan.date}-${plan.design}-${scheme}.webp`;
      fs.writeFileSync(path.join(OUT, files[scheme]), webp);
      console.log(`${files[scheme]}: ${Math.round(webp.length / 1024)} KB, ${880}x${height} css px`);
      await ctx.close();
    }
    for (const f of fs.readdirSync(OUT)) if (f.endsWith('.webp') && !Object.values(files).includes(f)) fs.unlinkSync(path.join(OUT, f));

    // README is written last, so a failed render never leaves it pointing at a missing file.
    const link = (e) => (e.url ? `[${e.name}](${e.url})` : e.name);
    const alt = `Pranav Dubey's profile in the ${NAMES[plan.design]} design. Today's UI: ${p.name}. Also today: ${s.name}.`;
    const md = `<div align="center">
<a href="${p.url || C.profile}"><picture><source media="(prefers-color-scheme: dark)" srcset="./generated/daily/${files.dark}"><img alt="${alt}" src="./generated/daily/${files.light}" width="100%"></picture></a>
</div>

<div align="center">

**Today** ${link(p)} · **Also today** ${link(s)} · **Design** ${NAMES[plan.design]} · [All repositories](${C.profile}?tab=repositories)

</div>

<details>
<summary>Projects, as text</summary>

${[...C.research.map((q) => ({ name: q.name, url: q.url, blurb: q.line })), ...C.projects.map((q) => ({ name: q.name, url: q.url, blurb: q.blurb }))].map((q) => `- ${q.url ? `[${q.name}](${q.url})` : q.name}: ${q.blurb}`).join('\n')}

</details>
`;
    fs.writeFileSync(README, md);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
