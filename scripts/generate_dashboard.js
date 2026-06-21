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
      
      const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=1`);
      const reposData = await reposRes.json();
      
      let currentProject = 'Unknown';
      if (reposData && reposData.length > 0) {
        currentProject = reposData[0].name;
      }
      
      return {
        stars: 'N/A', // Cannot get total stars easily without token/multiple calls
        commits: 'N/A', // Cannot get contributions without token
        repos: userData.public_repos || 0,
        followers: userData.followers || 0,
        currentProject: currentProject,
        latestCommitMessage: 'See profile for latest updates'
      };
    } catch (e) {
      console.error('REST API error', e);
      return { stars: 0, commits: 0, repos: 0, followers: 0, currentProject: 'Unknown', latestCommitMessage: 'No token' };
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
            stargazers { totalCount }
            defaultBranchRef {
              target {
                ... on Commit {
                  message
                }
              }
            }
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
    
    if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
    
    const data = await response.json();
    const user = data.data.user;
    
    const repos = user.repositories.nodes;
    const stars = repos.reduce((acc, repo) => acc + repo.stargazers.totalCount, 0);
    
    let latestCommit = 'Initial commit';
    if (repos[0] && repos[0].defaultBranchRef && repos[0].defaultBranchRef.target) {
        latestCommit = repos[0].defaultBranchRef.target.message;
    }
    
    return {
      stars: stars,
      commits: user.contributionsCollection.contributionCalendar.totalContributions,
      repos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      currentProject: repos[0] ? repos[0].name : 'Unknown',
      latestCommitMessage: latestCommit.split('\n')[0].substring(0, 50)
    };
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    process.exit(1);
  }
}

function generateSVG(stats) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 220" width="100%" height="220">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap');
      .bg { fill: #000000; stroke: #333333; stroke-width: 1; rx: 8px; }
      .text { font-family: 'Inter', -apple-system, sans-serif; fill: #ededed; }
      .label { font-size: 13px; font-weight: 500; fill: #888888; text-transform: uppercase; letter-spacing: 1px; }
      .value { font-size: 36px; font-weight: 600; fill: #ffffff; }
      .divider { stroke: #333333; stroke-width: 1; }
      .status-dot { fill: #ffffff; }
      .subtext { font-size: 13px; fill: #888888; }
      .highlight { fill: #ffffff; font-weight: 600; }
    </style>
  </defs>

  <rect class="bg" width="848" height="218" x="1" y="1" />
  
  <g transform="translate(40, 50)">
    <!-- Repositories -->
    <g transform="translate(0, 0)">
      <text class="label" y="0">Repositories</text>
      <text class="value" y="45">${stats.repos}</text>
    </g>
    <line class="divider" x1="190" y1="-10" x2="190" y2="70" />
    
    <!-- Stars -->
    <g transform="translate(230, 0)">
      <text class="label" y="0">Total Stars</text>
      <text class="value" y="45">${stats.stars}</text>
    </g>
    <line class="divider" x1="420" y1="-10" x2="420" y2="70" />

    <!-- Commits -->
    <g transform="translate(460, 0)">
      <text class="label" y="0">Commits (YTD)</text>
      <text class="value" y="45">${stats.commits}</text>
    </g>
    <line class="divider" x1="650" y1="-10" x2="650" y2="70" />

    <!-- Followers -->
    <g transform="translate(690, 0)">
      <text class="label" y="0">Followers</text>
      <text class="value" y="45">${stats.followers}</text>
    </g>
  </g>
  
  <line class="divider" x1="0" y1="150" x2="850" y2="150" />
  
  <!-- Current Focus Footer -->
  <g transform="translate(40, 185)">
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
