const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = 'NetPranav';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchProjects() {
  if (!GITHUB_TOKEN) {
    console.warn('No PAT_TOKEN provided. Fetching recent repos from REST API...');
    try {
      const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=4`);
      if (!response.ok) throw new Error(`REST API error ${response.status}`);
      const repos = await response.json();
      
      return repos.map(repo => ({
        name: repo.name,
        description: repo.description || 'Production-grade engineering and systems architecture.',
        stars: repo.stargazers_count,
        lang: repo.language || 'TypeScript',
        color: '#10B981'
      }));
    } catch (e) {
      console.error('REST API failed', e);
      return [];
    }
  }

  const query = `
    query {
      user(login: "${USERNAME}") {
        pinnedItems(first: 4, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              stargazerCount
              primaryLanguage { name color }
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
    const nodes = data.data.user.pinnedItems.nodes;
    
    if (nodes && nodes.length > 0) {
      return nodes.map(repo => ({
        name: repo.name,
        description: repo.description || 'Production-grade engineering and systems architecture.',
        stars: repo.stargazerCount,
        lang: repo.primaryLanguage ? repo.primaryLanguage.name : 'TypeScript',
        color: repo.primaryLanguage ? repo.primaryLanguage.color : '#10B981'
      }));
    }
    
    // Fallback if no pinned items
    const fallbackRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=4`);
    const fallbackRepos = await fallbackRes.json();
    return fallbackRepos.map(repo => ({
      name: repo.name,
      description: repo.description || 'Production-grade engineering and systems architecture.',
      stars: repo.stargazers_count,
      lang: repo.language || 'TypeScript',
      color: '#10B981'
    }));
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    return [];
  }
}

function generateSVG(projects) {
  const cardWidth = 412;
  const cardHeight = 125;
  const gapX = 16;
  const gapY = 16;
  const startX = 5;
  const startY = 40;
  
  let cards = '';
  
  projects.forEach((proj, i) => {
    const x = startX + (i % 2) * (cardWidth + gapX);
    const y = startY + Math.floor(i / 2) * (cardHeight + gapY);
    
    const rawDesc = proj.description || '';
    const safeDesc = rawDesc.substring(0, 62) + (rawDesc.length > 62 ? '...' : '');

    cards += `
    <g transform="translate(${x}, ${y})">
      <!-- Card Container -->
      <rect class="card" width="${cardWidth}" height="${cardHeight}" rx="8" />
      
      <!-- Top Accent Line -->
      <line x1="0" y1="0" x2="35" y2="0" stroke="#00F5A0" stroke-width="2" />

      <!-- Project Title -->
      <text class="title" x="22" y="36">${escapeXml(proj.name)}</text>
      
      <!-- Project Description -->
      <text class="desc" x="22" y="65">${escapeXml(safeDesc)}</text>
      
      <!-- Project Metadata Bar -->
      <g transform="translate(22, 98)">
        <circle cx="5" cy="-4" r="4.5" fill="${escapeXml(proj.color || '#10B981')}" />
        <text class="meta" x="16" y="0">${escapeXml(proj.lang)}</text>
        
        <!-- Star Icon -->
        <g transform="translate(130, -11)">
          <path fill="#F59E0B" d="M8 0.25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" transform="scale(0.85)"/>
          <text class="meta" x="18" y="11">${proj.stars || 0}</text>
        </g>

        <!-- Status Tag -->
        <g transform="translate(290, -12)">
          <rect fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" width="65" height="18" rx="4" />
          <text class="tag-text" x="32" y="12" text-anchor="middle">ACTIVE</text>
        </g>
      </g>
    </g>
    `;
  });

  const totalHeight = startY + Math.ceil(Math.max(projects.length, 1) / 2) * (cardHeight + gapY) + 5;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 ${totalHeight}" width="100%" height="${totalHeight}">
  <defs>
    <style><![CDATA[
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Fira+Code:wght@500;600&display=swap');
      
      .header-title { font-family: 'Fira Code', monospace; font-size: 11.5px; font-weight: 600; fill: #00F5A0; letter-spacing: 2px; text-transform: uppercase; }
      .card { fill: #08100C; stroke: rgba(16, 185, 129, 0.22); stroke-width: 1; }
      .title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; fill: #FFFFFF; letter-spacing: 0.3px; }
      .desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; fill: #94A3B8; }
      .meta { font-family: 'Fira Code', monospace; font-size: 12px; fill: #CBD5E1; }
      .tag-text { font-family: 'Fira Code', monospace; font-size: 9.5px; font-weight: 600; fill: #00F5A0; letter-spacing: 1px; }
    ]]></style>
  </defs>

  <!-- Section Header -->
  <g transform="translate(10, 20)">
    <circle cx="4" cy="-4" r="3.5" fill="#00F5A0" />
    <text class="header-title" x="16" y="0">ECOSYSTEM_DEPLOYMENTS // FEATURED ARCHITECTURES</text>
  </g>

  ${cards}
</svg>`;
}

async function main() {
  const projects = await fetchProjects();
  const svg = generateSVG(projects);
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'projects.svg'), svg.trim());
  console.log('Generated generated/projects.svg successfully.');
}

main();
