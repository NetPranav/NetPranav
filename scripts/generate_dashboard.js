const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = 'NetPranav';

async function fetchStats() {
  if (!GITHUB_TOKEN) {
    console.warn('No PAT_TOKEN provided. Fetching public data from REST API...');
    try {
      const userRes = await fetch(`https://api.github.com/users/${USERNAME}`);
      const userData = await userRes.json();
      
      const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=100`);
      const reposData = await reposRes.json();
      
      let currentProject = 'Unknown';
      if (reposData && reposData.length > 0) {
        currentProject = reposData[0].name;
      }
      
      const langCounts = {};
      let totalLangs = 0;
      reposData.forEach(r => {
        if (r.language) {
          langCounts[r.language] = (langCounts[r.language] || 0) + 1;
          totalLangs++;
        }
      });
      
      const topLangs = Object.entries(langCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => ({ name: entry[0], percent: Math.round((entry[1] / totalLangs) * 100) }));

      return {
        repos: userData.public_repos || 0,
        followers: userData.followers || 0,
        currentProject: currentProject,
        latestCommitMessage: 'Active Development',
        topLangs: topLangs.length ? topLangs : [{ name: 'TypeScript', percent: 50 }, { name: 'Python', percent: 30 }, { name: 'C++', percent: 20 }]
      };
    } catch (e) {
      console.error('REST API error', e);
      return { repos: 0, followers: 0, currentProject: 'Unknown', latestCommitMessage: 'No token', topLangs: [{ name: 'Code', percent: 100 }] };
    }
  }

  const query = `
    query {
      user(login: "${USERNAME}") {
        followers { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            primaryLanguage { name }
            defaultBranchRef {
              target {
                ... on Commit {
                  message
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
    
    const data = await response.json();
    const user = data.data.user;
    const repos = user.repositories.nodes;
    
    let currentProject = 'Unknown';
    let latestCommit = 'Initial commit';
    if (repos[0]) {
      currentProject = repos[0].name;
      if (repos[0].defaultBranchRef && repos[0].defaultBranchRef.target) {
        latestCommit = repos[0].defaultBranchRef.target.message;
      }
    }

    const langCounts = {};
    let totalLangs = 0;
    repos.forEach(r => {
      if (r.primaryLanguage) {
        const lang = r.primaryLanguage.name;
        langCounts[lang] = (langCounts[lang] || 0) + 1;
        totalLangs++;
      }
    });
    
    const topLangs = Object.entries(langCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => ({ name: entry[0], percent: Math.round((entry[1] / totalLangs) * 100) }));

    return {
      repos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      currentProject: currentProject,
      latestCommitMessage: latestCommit.split('\n')[0].substring(0, 50),
      topLangs: topLangs.length ? topLangs : [{ name: 'TypeScript', percent: 50 }, { name: 'Python', percent: 30 }, { name: 'C++', percent: 20 }]
    };
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    return { repos: 15, followers: 10, currentProject: 'Unknown', latestCommitMessage: 'Active', topLangs: [{ name: 'Code', percent: 100 }] };
  }
}

function generateSVG(stats) {
  let bars = '';
  stats.topLangs.forEach((lang, i) => {
    const yOffset = i * 36;
    const barWidth = Math.max(lang.percent * 2, 8); // 200px max width for 100%
    bars += `
      <g transform="translate(0, ${yOffset})">
        <text class="lang-name" x="0" y="12">${lang.name}</text>
        <text class="lang-pct" x="220" y="12" text-anchor="end">${lang.percent}%</text>
        <rect class="bar-bg" x="0" y="18" width="220" height="5" rx="2.5" />
        <rect class="bar-fill" x="0" y="18" width="${barWidth}" height="5" rx="2.5" />
      </g>
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 185" width="100%" height="185">
  <defs>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#64FFDA" />
    </linearGradient>

    <linearGradient id="metricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=Fira+Code:wght@500;600&amp;display=swap');
      
      .bg { fill: #060B08; stroke: rgba(16, 185, 129, 0.25); stroke-width: 1; rx: 10px; }
      .header-bar { fill: #0B140F; stroke: rgba(16, 185, 129, 0.2); stroke-width: 1; }
      .header-title { font-family: 'Fira Code', monospace; font-size: 11px; font-weight: 600; fill: #00F5A0; letter-spacing: 2px; text-transform: uppercase; }
      
      .metric-label { font-family: 'Fira Code', monospace; font-size: 11.5px; font-weight: 500; fill: #64748B; text-transform: uppercase; letter-spacing: 1px; }
      .metric-val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 38px; font-weight: 800; fill: url(#metricGrad); }
      
      .status-pill { fill: rgba(16, 185, 129, 0.12); stroke: rgba(16, 185, 129, 0.35); stroke-width: 1; rx: 12px; }
      .status-text { font-family: 'Fira Code', monospace; font-size: 11px; font-weight: 600; fill: #00F5A0; letter-spacing: 1px; }
      .status-dot { fill: #00F5A0; animation: pulseDot 2s ease-in-out infinite alternate; }
      
      .divider { stroke: rgba(16, 185, 129, 0.2); stroke-width: 1; }
      
      .lang-title { font-family: 'Fira Code', monospace; font-size: 11.5px; font-weight: 600; fill: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; }
      .lang-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; fill: #CBD5E1; }
      .lang-pct { font-family: 'Fira Code', monospace; font-size: 11.5px; font-weight: 600; fill: #00F5A0; }
      .bar-bg { fill: #111D16; }
      .bar-fill { fill: url(#barGrad); }

      @keyframes pulseDot {
        0% { opacity: 0.4; }
        100% { opacity: 1; }
      }
    </style>
  </defs>

  <!-- Frame Background -->
  <rect class="bg" width="848" height="183" x="1" y="1" rx="10" />
  
  <!-- Header Bar -->
  <path class="header-bar" d="M 1 11 Q 1 1 11 1 L 839 1 Q 849 1 849 11 L 849 32 L 1 32 Z" />
  <line x1="1" y1="32" x2="849" y2="32" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1" />
  
  <g transform="translate(20, 21)">
    <circle cx="0" cy="-4" r="3.5" class="status-dot" />
    <text class="header-title" x="12" y="0">TELEMETRY_NODE // LIVE METRICS</text>
  </g>

  <!-- Status Pill Header Right -->
  <g transform="translate(710, 10)">
    <rect class="status-pill" width="120" height="22" rx="11" />
    <circle cx="12" cy="11" r="3.5" class="status-dot" />
    <text class="status-text" x="22" y="15">NODE ONLINE</text>
  </g>

  <!-- Main Grid Content -->
  <g transform="translate(35, 65)">
    
    <!-- Repositories -->
    <g transform="translate(0, 0)">
      <text class="metric-label" y="0">Repositories</text>
      <text class="metric-val" y="44">${stats.repos}</text>
      <text class="metric-label" y="70" fill="#10B981">● PUBLIC REPOS</text>
    </g>
    
    <!-- Followers -->
    <g transform="translate(210, 0)">
      <text class="metric-label" y="0">Community</text>
      <text class="metric-val" y="44">${stats.followers}</text>
      <text class="metric-label" y="70" fill="#64FFDA">◆ NETWORK PEERS</text>
    </g>

    <!-- Vertical Grid Divider -->
    <line class="divider" x1="430" y1="-10" x2="430" y2="90" />

    <!-- Top Languages Breakdown -->
    <g transform="translate(485, 0)">
      <text class="lang-title" y="0">Language Distribution</text>
      <g transform="translate(0, 12)">
        ${bars}
      </g>
    </g>
  </g>
</svg>`;
}

async function main() {
  const stats = await fetchStats();
  const svg = generateSVG(stats);
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'dashboard.svg'), svg.trim());
  console.log('Generated generated/dashboard.svg successfully.');
}

main();
