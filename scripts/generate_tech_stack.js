const fs = require('fs');
const path = require('path');
const icons = require('simple-icons');

const categories = [
  {
    title: 'LANGUAGES & RUNTIMES',
    items: [
      { name: 'TypeScript', key: 'siTypescript' },
      { name: 'Python', key: 'siPython' },
      { name: 'C++', key: 'siCplusplus' },
      { name: 'Go', key: 'siGo' },
      { name: 'Node.js', key: 'siNodedotjs' },
      { name: 'Rust', key: 'siRust' },
    ]
  },
  {
    title: 'AI, VISION & DATA',
    items: [
      { name: 'PyTorch', key: 'siPytorch' },
      { name: 'TensorFlow', key: 'siTensorflow' },
      { name: 'OpenCV', key: 'siOpencv' },
      { name: 'PostgreSQL', key: 'siPostgresql' },
      { name: 'MongoDB', key: 'siMongodb' },
      { name: 'Redis', key: 'siRedis' },
    ]
  },
  {
    title: 'SYSTEMS & CLOUD INFRASTRUCTURE',
    items: [
      { name: 'Docker', key: 'siDocker' },
      { name: 'Kubernetes', key: 'siKubernetes' },
      { name: 'AWS', key: 'siAmazonwebservices' },
      { name: 'Next.js', key: 'siNextdotjs' },
      { name: 'React', key: 'siReact' },
      { name: 'Git', key: 'siGit' },
    ]
  }
];

function generateSVG() {
  const width = 850;
  const cardWidth = 128;
  const cardHeight = 40;
  const gapX = 14;
  let currentY = 15;
  let sectionsSvg = '';

  categories.forEach((cat) => {
    sectionsSvg += `
      <!-- Category Header -->
      <g transform="translate(10, ${currentY + 16})">
        <circle cx="4" cy="-4" r="3.5" fill="#00F5A0" />
        <text class="category-title" x="16" y="0">${cat.title}</text>
      </g>
    `;
    currentY += 32;

    let itemsSvg = '';
    cat.items.forEach((item, i) => {
      const x = 10 + i * (cardWidth + gapX);
      const y = currentY;
      const icon = icons[item.key] || icons.siGithub;

      itemsSvg += `
        <g transform="translate(${x}, ${y})">
          <rect class="card-bg" width="${cardWidth}" height="${cardHeight}" rx="6" />
          <g transform="translate(12, 11) scale(0.75)">
            <path d="${icon.path}" fill="#64FFDA" />
          </g>
          <text class="card-text" x="38" y="24">${item.name}</text>
        </g>
      `;
    });

    sectionsSvg += itemsSvg;
    currentY += cardHeight + 22;
  });

  const totalHeight = currentY + 10;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&amp;family=Fira+Code:wght@500&amp;display=swap');
      
      .bg { fill: transparent; }
      
      .category-title {
        font-family: 'Fira Code', monospace;
        font-size: 11.5px;
        font-weight: 600;
        fill: #00F5A0;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      
      .card-bg {
        fill: #08100C;
        stroke: rgba(16, 185, 129, 0.22);
        stroke-width: 1;
        transition: all 0.3s ease;
      }
      
      .card-text {
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 12.5px;
        font-weight: 600;
        fill: #E2E8F0;
        letter-spacing: 0.2px;
      }
    </style>
  </defs>

  <rect class="bg" width="${width}" height="${totalHeight}" />
  
  ${sectionsSvg}
</svg>
`;
}

const outDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tech-stack.svg'), generateSVG().trim());
console.log('Generated generated/tech-stack.svg successfully.');
