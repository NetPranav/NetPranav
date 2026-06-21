const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = 'NetPranav';

const fallbackProjects = [
  { name: 'Smart Farming AI', description: 'AI-driven agriculture optimization platform.', stars: 124, lang: 'Python', color: '#3572A5' },
  { name: 'Logistics Platform', description: 'Real-time routing and tracking system.', stars: 89, lang: 'TypeScript', color: '#3178C6' },
  { name: 'MockMate', description: 'Mock interview assistant using LLMs.', stars: 210, lang: 'TypeScript', color: '#3178C6' },
  { name: 'GSAP Components', description: 'High-performance animation library wrapper.', stars: 156, lang: 'TypeScript', color: '#3178C6' }
];

async function fetchProjects() {
  if (!GITHUB_TOKEN) return fallbackProjects;

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
    if (nodes.length === 0) return fallbackProjects;
    
    return nodes.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description provided.',
      stars: repo.stargazerCount,
      lang: repo.primaryLanguage ? repo.primaryLanguage.name : 'Unknown',
      color: repo.primaryLanguage ? repo.primaryLanguage.color : '#888888'
    }));
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    return fallbackProjects;
  }
}

function generateSVG(projects) {
  const cardWidth = 410;
  const cardHeight = 130;
  const gap = 20;
  
  let cards = '';
  
  projects.forEach((proj, i) => {
    const x = (i % 2) * (cardWidth + gap) + 5;
    const y = Math.floor(i / 2) * (cardHeight + gap) + 5;
    
    cards += `
    <g transform="translate(${x}, ${y})">
      <rect class="card" width="${cardWidth}" height="${cardHeight}" />
      <text class="title" x="25" y="40">${proj.name}</text>
      <text class="desc" x="25" y="70">${proj.description.substring(0, 55)}${proj.description.length > 55 ? '...' : ''}</text>
      
      <g transform="translate(25, 105)">
        <circle cx="5" cy="-4" r="5" fill="${proj.color}" />
        <text class="meta" x="18" y="0">${proj.lang}</text>
        
        <path fill="#888888" d="M8 0.25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" transform="translate(100, -11) scale(0.9)"/>
        <text class="meta" x="120" y="0">${proj.stars}</text>
      </g>
    </g>
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 300" width="100%" height="300">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap');
      .card { fill: #000000; stroke: #333333; stroke-width: 1; rx: 8px; }
      .title { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; fill: #ffffff; }
      .desc { font-family: 'Inter', sans-serif; font-size: 14px; fill: #888888; }
      .meta { font-family: 'Inter', sans-serif; font-size: 13px; fill: #888888; }
    </style>
  </defs>
  ${cards}
</svg>`;
}

async function main() {
  const projects = await fetchProjects();
  const svg = generateSVG(projects);
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'projects.svg'), svg.trim());
}

main();
