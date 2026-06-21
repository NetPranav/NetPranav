const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = 'NetPranav';

async function fetchStats() {
  if (!GITHUB_TOKEN) {
    console.warn('No PAT_TOKEN provided. Generating mock dashboard for demonstration.');
    return {
      stars: 1240,
      commits: 2350,
      repos: 45,
      followers: 890,
      currentProject: 'Smart Farming AI',
      streak: 42
    };
  }

  const query = `
    query {
      user(login: "${USERNAME}") {
        name
        followers { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazers { totalCount }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
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
    
    if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const user = data.data.user;
    
    const repos = user.repositories.nodes;
    const stars = repos.reduce((acc, repo) => acc + repo.stargazers.totalCount, 0);
    
    return {
      stars: stars,
      commits: user.contributionsCollection.contributionCalendar.totalContributions,
      repos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      currentProject: repos[0] ? repos[0].name : 'Unknown',
      streak: 'N/A' // Requires more complex query, using placeholder or separate action
    };
  } catch (error) {
    console.error('Error fetching from GitHub:', error.message);
    process.exit(1);
  }
}

function generateSVG(stats) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="100%" height="200">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap');
      .bg { fill: #0d1117; stroke: #30363d; stroke-width: 1; rx: 10px; }
      .text { font-family: 'Inter', -apple-system, sans-serif; fill: #c9d1d9; }
      .label { font-size: 14px; fill: #8b949e; }
      .value { font-size: 28px; font-weight: 600; fill: #58a6ff; }
      .divider { stroke: #21262d; stroke-width: 1; }
    </style>
  </defs>

  <rect class="bg" width="798" height="198" x="1" y="1" />
  
  <g transform="translate(40, 50)">
    <!-- Repositories -->
    <g transform="translate(0, 0)">
      <text class="label" y="0">Public Repositories</text>
      <text class="value" y="40">${stats.repos}</text>
    </g>
    <line class="divider" x1="180" y1="-10" x2="180" y2="70" />
    
    <!-- Stars -->
    <g transform="translate(220, 0)">
      <text class="label" y="0">Total Stars</text>
      <text class="value" y="40">${stats.stars}</text>
    </g>
    <line class="divider" x1="360" y1="-10" x2="360" y2="70" />

    <!-- Commits -->
    <g transform="translate(400, 0)">
      <text class="label" y="0">Commits (Year)</text>
      <text class="value" y="40">${stats.commits}</text>
    </g>
    <line class="divider" x1="560" y1="-10" x2="560" y2="70" />

    <!-- Followers -->
    <g transform="translate(600, 0)">
      <text class="label" y="0">Followers</text>
      <text class="value" y="40">${stats.followers}</text>
    </g>
  </g>
  
  <!-- Current Focus -->
  <g transform="translate(40, 150)">
    <circle cx="0" cy="-5" r="5" fill="#2ea043" />
    <text class="text label" x="15" y="0">Currently hacking on <tspan style="fill: #e6edf3; font-weight: 600;">${stats.currentProject}</tspan></text>
  </g>
</svg>`;
}

async function main() {
  console.log('Fetching stats...');
  const stats = await fetchStats();
  console.log('Generating SVG...');
  const svg = generateSVG(stats);
  
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outDir, 'dashboard.svg'), svg.trim());
  console.log('Dashboard generated successfully!');
}

main();
