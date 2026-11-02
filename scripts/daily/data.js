// Live GitHub data for the profile. Needs PAT_TOKEN (or GITHUB_TOKEN); falls back to the last cached copy.
const fs = require('fs');
const path = require('path');
const USER = 'NetPranav';
// Repos that hold imported third-party code would swamp the language chart.
const SKIP_LANG = new Set(['Matrix-Operating-System', 'vscodium', 'NetPranav']);
const TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const CACHE = path.join(__dirname, '..', '..', 'generated', 'daily', 'data.json');

async function graphql(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'daily-profile' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL ${res.status} ${JSON.stringify(json.errors || '')}`);
  return json.data;
}
async function rest(url) {
  const res = await fetch(`https://api.github.com${url}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'daily-profile' } });
  if (!res.ok) throw new Error(`REST ${res.status} ${url}`);
  return res.json();
}

async function fetchLive() {
  if (!TOKEN) throw new Error('no token');
  const d = await graphql(`{ user(login:"${USER}") {
    followers{totalCount}
    pub: repositories(privacy:PUBLIC, ownerAffiliations:OWNER){totalCount}
    recent: repositories(first:30, ownerAffiliations:OWNER, orderBy:{field:PUSHED_AT,direction:DESC}){ nodes{name isPrivate isFork pushedAt stargazerCount} }
    contributionsCollection{ totalCommitContributions contributionCalendar{ totalContributions weeks{contributionDays{date contributionCount}} } }
  } }`);
  const u = d.user;
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const last = u.recent.nodes.find((r) => !r.isFork && r.name !== USER);
  const publicRepos = u.recent.nodes.filter((r) => !r.isPrivate && !r.isFork);
  // languages by code size across public, non-fork repos
  const names = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await rest(`/users/${USER}/repos?per_page=100&page=${page}`);
    names.push(...batch.filter((r) => !r.fork && !SKIP_LANG.has(r.name)).map((r) => r.name));
    if (batch.length < 100) break;
  }
  const bytes = {};
  for (const n of names) {
    try {
      const l = await rest(`/repos/${USER}/${n}/languages`);
      for (const [k, v] of Object.entries(l)) bytes[k] = (bytes[k] || 0) + v;
    } catch (e) { /* skip */ }
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(bytes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, v]) => ({ name, pct: Math.round((v / total) * 100) }));
  const stars = publicRepos.reduce((a, r) => a + r.stargazerCount, 0);
  return {
    fetchedAt: new Date().toISOString(),
    followers: u.followers.totalCount,
    publicRepos: u.pub.totalCount,
    commitsYear: u.contributionsCollection.totalCommitContributions,
    contributionsYear: u.contributionsCollection.contributionCalendar.totalContributions,
    week7: days.slice(-7).reduce((a, x) => a + x.contributionCount, 0),
    days: days.map((x) => x.contributionCount),
    lastPush: last ? { name: last.isPrivate ? null : last.name, at: last.pushedAt } : null,
    languages,
    stars,
  };
}

async function loadData() {
  try {
    const data = await fetchLive();
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(data, null, 1) + '\n');
    return data;
  } catch (e) {
    console.warn(`Live data failed (${e.message}); using cache.`);
    if (fs.existsSync(CACHE)) return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    return { fetchedAt: null, followers: 0, publicRepos: 42, commitsYear: 0, contributionsYear: 0, week7: 0, days: [], lastPush: null, languages: [], stars: 0 };
  }
}
module.exports = { loadData };
