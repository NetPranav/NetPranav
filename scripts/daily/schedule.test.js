const assert = require('assert');
const { DESIGNS, weekPlans, planFor } = require('./schedule');
const projects = ['lazylayout', 'humanoid', 'cero', 'onco', 'smartcursor', 'planner', 'skyrise', 'mahaurja'];
const N = 80;
const weeks = weekPlans(N, projects);
weeks.forEach((wk, w) => {
  assert.deepStrictEqual([...wk.map((d) => d.design)].sort(), [...DESIGNS].sort(), `week ${w}: every design once`);
  const seen = new Set(wk.flatMap((d) => [d.main, d.also]));
  assert.strictEqual(seen.size, projects.length, `week ${w}: all projects covered`);
  assert.strictEqual(new Set(wk.map((d) => d.main)).size, 7, `week ${w}: 7 distinct main projects`);
  wk.forEach((d) => assert.notStrictEqual(d.main, d.also));
  if (w > 0) {
    wk.forEach((d) => assert.notStrictEqual(d.main, weeks[w - 1].find((p) => p.design === d.design).main, `week ${w}: ${d.design} repeats main`));
    assert.notStrictEqual(wk[0].main, weeks[w - 1][6].main, `week ${w}: boundary main repeat`);
    assert.notStrictEqual(wk[0].design, weeks[w - 1][6].design, `week ${w}: boundary design repeat`);
  }
});
// strict window: how many weeks still avoid any (design, main) repeat from the previous 6 weeks
let strict = 0;
weeks.forEach((wk, w) => {
  const recent = weeks.slice(Math.max(0, w - 6), w).flat();
  if (!wk.some((d) => recent.some((p) => p.design === d.design && p.main === d.main))) strict++;
});
// stateless: same date gives same plan
assert.deepStrictEqual(planFor('2026-11-09', projects), planFor('2026-11-09', projects));
assert.strictEqual(planFor('2026-11-02', projects).weekday, 0);
console.log(`ok: ${N} weeks valid; ${strict}/${weeks.length} weeks also avoid repeats from the previous 6 weeks`);
