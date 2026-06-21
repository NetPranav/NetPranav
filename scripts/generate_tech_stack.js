const fs = require('fs');
const path = require('path');
const icons = require('simple-icons');

const stack = [
  { name: 'TypeScript', key: 'siTypescript' },
  { name: 'Python', key: 'siPython' },
  { name: 'C++', key: 'siCplusplus' },
  { name: 'Go', key: 'siGo' },
  
  { name: 'React', key: 'siReact' },
  { name: 'Next.js', key: 'siNextdotjs' },
  { name: 'Tailwind', key: 'siTailwindcss' },
  { name: 'Node.js', key: 'siNodedotjs' },
  
  { name: 'Postgres', key: 'siPostgresql' },
  { name: 'MongoDB', key: 'siMongodb' },
  { name: 'Docker', key: 'siDocker' },
  { name: 'AWS', key: 'siAmazonwebservices' },
  
  { name: 'Git', key: 'siGit' },
  { name: 'Vercel', key: 'siVercel' },
  { name: 'PyTorch', key: 'siPytorch' },
  { name: 'TensorFlow', key: 'siTensorflow' }
];

function generateSVG() {
  const width = 850;
  const cols = 4;
  const rows = Math.ceil(stack.length / cols);
  const cardWidth = 200;
  const cardHeight = 45;
  const gapX = 15;
  const gapY = 15;
  const startX = 0;
  const startY = 45;

  let cards = '';
  
  stack.forEach((tech, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);
    
    // Safely get icon or fallback
    const icon = icons[tech.key] || icons.siGithub;
    
    cards += `
    <g transform="translate(${x}, ${y})">
      <rect class="card-bg" width="${cardWidth}" height="${cardHeight}" />
      <g transform="translate(15, 12) scale(0.85)">
        <path d="${icon.path}" fill="#ffffff" />
      </g>
      <text class="card-text" x="48" y="27">[ ${tech.name} ]</text>
    </g>
    `;
  });

  const svgHeight = startY + rows * (cardHeight + gapY);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${svgHeight}" width="100%" height="${svgHeight}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&amp;display=swap');
      
      .bg { fill: transparent; }
      
      .header-text {
        font-family: 'Share Tech Mono', monospace;
        font-size: 16px;
        fill: #888888;
        letter-spacing: 2px;
      }
      
      .card-bg {
        fill: #0a0a0a;
        stroke: #333333;
        stroke-width: 1;
        rx: 0;
      }
      
      .card-text {
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        fill: #dddddd;
        letter-spacing: 1px;
      }
    </style>
  </defs>

  <rect class="bg" width="${width}" height="${svgHeight}" />
  
  <text class="header-text" x="0" y="25">> INITIALIZING_SYSTEM_MODULES...</text>
  
  ${cards}
  
</svg>
`;
}

const outDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tech-stack.svg'), generateSVG().trim());
