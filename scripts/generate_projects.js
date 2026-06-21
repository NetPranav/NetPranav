const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.PAT_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = 'NetPranav';

// Provide fallback projects if no token is available or if we want to explicitly list "Currently Building" projects.
const fallbackProjects = [
  { name: 'Smart Farming AI', description: 'AI-driven agriculture optimization platform.', stars: 124, lang: 'Python', url: '#' },
  { name: 'Logistics Platform', description: 'Real-time routing and tracking system.', stars: 89, lang: 'TypeScript', url: '#' },
  { name: 'MockMate', description: 'Mock interview assistant using LLMs.', stars: 210, lang: 'Next.js', url: '#' },
  { name: 'GSAP Components', description: 'High-performance animation library wrapper.', stars: 156, lang: 'React', url: '#' }
];

async function fetchProjects() {
  if (!GITHUB_TOKEN) {
    console.warn('No PAT_TOKEN provided. Generating mock projects for demonstration.');
    return fallbackProjects;
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
              primaryLanguage {
                name
                color
              }
              url
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
    
    if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const nodes = data.data.user.pinnedItems.nodes;
    
    if (nodes.length === 0) return fallbackProjects;
    
    return nodes.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description provided.',
      stars: repo.stargazerCount,
      lang: repo.primaryLanguage ? repo.primaryLanguage.name : 'Unknown',
      color: repo.primaryLanguage ? repo.primaryLanguage.color : '#8b949e',
      url: repo.url
    }));
  } catch (error) {
    console.error('Error fetching from GitHub:', error.message);
    return fallbackProjects;
  }
}

function generateSVG(projects) {
  // Create a 2x2 grid of cards
  const cardWidth = 380;
  const cardHeight = 120;
  const gap = 20;
  
  let cards = '';
  
  projects.forEach((proj, i) => {
    const x = (i % 2) * (cardWidth + gap) + 10;
    const y = Math.floor(i / 2) * (cardHeight + gap) + 10;
    
    // Fallback color if missing
    const langColor = proj.color || '#3178C6';
    
    cards += `
    <g transform="translate(${x}, ${y})">
      <rect class="card" width="${cardWidth}" height="${cardHeight}" />
      <text class="title" x="20" y="35">${proj.name}</text>
      <text class="desc" x="20" y="65">${proj.description.substring(0, 50)}${proj.description.length > 50 ? '...' : ''}</text>
      
      <!-- Footer -->
      <g transform="translate(20, 100)">
        <circle cx="5" cy="-4" r="5" fill="${langColor}" />
        <text class="meta" x="15" y="0">${proj.lang}</text>
        
        <path fill="#8b949e" d="M8 0.25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" transform="translate(100, -11) scale(0.9)"/>
        <text class="meta" x="120" y="0">${proj.stars}</text>
      </g>
    </g>
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="300">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap');
      .card { fill: #0d1117; stroke: #30363d; stroke-width: 1; rx: 8px; }
      .title { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; fill: #58a6ff; }
      .desc { font-family: 'Inter', sans-serif; font-size: 13px; fill: #8b949e; }
      .meta { font-family: 'Inter', sans-serif; font-size: 12px; fill: #8b949e; }
    </style>
  </defs>
  ${cards}
</svg>`;
}

async function main() {
  console.log('Fetching projects...');
  const projects = await fetchProjects();
  console.log('Generating Projects SVG...');
  const svg = generateSVG(projects);
  
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outDir, 'projects.svg'), svg.trim());
  console.log('Projects SVG generated successfully!');
}

main();
