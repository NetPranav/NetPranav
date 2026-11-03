// Stateless daily schedule. Anchored to a fixed Monday (UTC) and walked forward week by week with a seeded RNG,
// so any date maps to the same plan on every machine.
//
// Rules, enforced by rejection sampling:
//  - each week uses all 7 designs exactly once (random order)
//  - each week features 7 different projects as the main one, plus a smaller "also today" project each day,
//    so all 8 projects appear within every week
//  - a design never gets the same main project two weeks in a row (and avoids repeats from the last 6 weeks when possible)
//  - the main project never repeats on consecutive days, including across the week boundary

const DESIGNS = ['swiss', 'material3', 'minimal', 'neobrutal', 'aurora', 'nowplaying', 'blueprint'];
const ANCHOR = Date.UTC(2026, 10, 2); // Monday 2 Nov 2026
const DAY = 86400000;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildWeek(w, projects, history, prevLastMain, prevLastDesign) {
  for (let attempt = 0; attempt < 4000; attempt++) {
    const r = rng(w * 7919 + attempt * 104729 + 1);
    const designs = shuffle(DESIGNS, r);
    const order = shuffle(projects, r);
    const days = designs.map((design, i) => ({
      design,
      main: order[i],
      also: order[(i + 1) % projects.length],
    }));
    if (prevLastDesign === days[0].design) continue;
    if (prevLastMain === days[0].main) continue;
    const prev = history[history.length - 1];
    if (prev && days.some((d) => prev.find((p) => p.design === d.design).main === d.main)) continue;
    // Strict mode: avoid any pair used in the last 6 weeks. Relax if the search runs long.
    if (attempt < 2500) {
      const recent = history.slice(-6).flat();
      if (days.some((d) => recent.some((p) => p.design === d.design && p.main === d.main))) continue;
    }
    return days;
  }
  throw new Error(`No valid schedule found for week ${w}`);
}

function weekPlans(upTo, projects) {
  const weeks = [];
  let lastMain = null;
  let lastDesign = null;
  for (let w = 0; w <= upTo; w++) {
    const days = buildWeek(w, projects, weeks, lastMain, lastDesign);
    weeks.push(days);
    lastMain = days[6].main;
    lastDesign = days[6].design;
  }
  return weeks;
}

function planFor(dateStr, projects) {
  const t = dateStr ? Date.parse(`${dateStr}T00:00:00Z`) : Math.floor(Date.now() / DAY) * DAY;
  const dayIndex = Math.max(0, Math.round((t - ANCHOR) / DAY));
  const w = Math.floor(dayIndex / 7);
  const d = dayIndex % 7;
  const weeks = weekPlans(w, projects);
  const date = new Date(ANCHOR + dayIndex * DAY).toISOString().slice(0, 10);
  return { date, week: w, weekday: d, ...weeks[w][d] };
}

module.exports = { DESIGNS, ANCHOR, weekPlans, planFor };
