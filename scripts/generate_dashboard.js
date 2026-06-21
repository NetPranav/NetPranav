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
        latestCommitMessage: 'See profile for latest updates',
        topLangs: topLangs.length ? topLangs : [{ name: 'Code', percent: 100 }]
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
      topLangs: topLangs.length ? topLangs : [{ name: 'Code', percent: 100 }]
    };
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    process.exit(1);
  }
}

function generateSVG(stats) {
  let bars = '';
  stats.topLangs.forEach((lang, i) => {
    const yOffset = i * 35;
    const barWidth = Math.max(lang.percent * 2, 5); // 200px max width for 100%
    bars += `
      <text class="subtext" x="0" y="${yOffset + 12}">${lang.name}</text>
      <text class="subtext highlight" x="110" y="${yOffset + 12}">${lang.percent}%</text>
      <rect class="bar-bg" x="0" y="${yOffset + 18}" width="200" height="4" rx="2" />
      <rect class="bar-fill" x="0" y="${yOffset + 18}" width="${barWidth}" height="4" rx="2" />
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 220" width="100%" height="220">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap');
      .bg { fill: transparent; stroke: rgba(255,255,255,0.15); stroke-width: 1; rx: 8px; }
      .text { font-family: 'Inter', -apple-system, sans-serif; fill: #ededed; }
      .label { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; fill: #888888; text-transform: uppercase; letter-spacing: 1px; }
      .value { font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 600; fill: #ffffff; }
      .divider { stroke: rgba(255,255,255,0.15); stroke-width: 1; }
      .status-dot { fill: #ffffff; }
      .subtext { font-family: 'Inter', sans-serif; font-size: 13px; fill: #888888; }
      .highlight { fill: #ffffff; font-weight: 600; }
      .bar-bg { fill: #333333; }
      .bar-fill { fill: #ffffff; }
    </style>
  </defs>

  <rect class="bg" width="848" height="218" x="1" y="1" />
  
  <g transform="translate(40, 45)">
    
    <!-- Left Column: Primary Stats -->
    <g transform="translate(0, 0)">
      <text class="label" y="0">Repositories</text>
      <text class="value" y="45">${stats.repos}</text>
    </g>
    
    <g transform="translate(200, 0)">
      <text class="label" y="0">Followers</text>
      <text class="value" y="45">${stats.followers}</text>
    </g>

    <!-- Vertical Divider -->
    <line class="divider" x1="425" y1="-10" x2="425" y2="80" />

    <!-- Right Column: Language Chart -->
    <g transform="translate(470, 0)">
      <text class="label" y="0">Top Languages</text>
      <g transform="translate(0, 15)">
        ${bars}
      </g>
    </g>
  </g>
  
  <line class="divider" x1="0" y1="160" x2="850" y2="160" />
  
  <!-- Current Focus Footer -->
  <g transform="translate(40, 190)">
    <circle cx="0" cy="-4" r="4" class="status-dot" />
    <text class="text subtext" x="15" y="0">Currently engineering <tspan class="highlight">${stats.currentProject}</tspan></text>
    <text class="text subtext" x="460" y="0">Latest Commit: <tspan class="highlight">${stats.latestCommitMessage}</tspan></text>
  </g>
</svg>`;
}

async function main() {
  const stats = await fetchStats();
  const svg = generateSVG(stats);
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'dashboard.svg'), svg.trim());
}

main();
