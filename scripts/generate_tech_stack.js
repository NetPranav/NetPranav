const fs = require('fs');
const path = require('path');
const icons = require('simple-icons');

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const stackRows = [
  [
    { name: 'TypeScript', key: 'siTypescript' },
    { name: 'Python', key: 'siPython' },
    { name: 'C++', key: 'siCplusplus' },
    { name: 'Go', key: 'siGo' },
    { name: 'Node.js', key: 'siNodedotjs' },
    { name: 'Rust', key: 'siRust' },
  ],
  [
    { name: 'PyTorch', key: 'siPytorch' },
    { name: 'TensorFlow', key: 'siTensorflow' },
    { name: 'OpenCV', key: 'siOpencv' },
    { name: 'PostgreSQL', key: 'siPostgresql' },
    { name: 'MongoDB', key: 'siMongodb' },
    { name: 'Redis', key: 'siRedis' },
  ],
  [
    { name: 'Docker', key: 'siDocker' },
    { name: 'Kubernetes', key: 'siKubernetes' },
    { name: 'AWS', key: 'siAmazonwebservices' },
    { name: 'Next.js', key: 'siNextdotjs' },
    { name: 'React', key: 'siReact' },
    { name: 'Git', key: 'siGit' },
  ]
];

function generateSVG() {
  const width = 850;
  const cardWidth = 130;
  const cardHeight = 38;
  const gapX = 12;
  const gapY = 12;
  const startX = 6;
  let startY = 38;
  let cardsSvg = '';

  stackRows.forEach((row, rowIdx) => {
    const y = startY + rowIdx * (cardHeight + gapY);
    row.forEach((item, colIdx) => {
      const x = startX + colIdx * (cardWidth + gapX);
      const icon = icons[item.key] || icons.siGithub;

      cardsSvg += `
        <g transform="translate(${x}, ${y})">
          <rect class="pill" width="${cardWidth}" height="${cardHeight}" rx="6" />
          <g transform="translate(12, 10) scale(0.75)">
            <path d="${icon.path}" fill="#64FFDA" />
          </g>
          <text class="pill-text" x="38" y="24">${escapeXml(item.name)}</text>
        </g>
      `;
    });
  });

  const totalHeight = startY + stackRows.length * (cardHeight + gapY) + 6;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}">
  <defs>
    <style><![CDATA[
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600&family=Fira+Code:wght@500;600&display=swap');
      
      .bg { fill: transparent; }
      
      .header-title {
        font-family: 'Fira Code', monospace;
        font-size: 11px;
        font-weight: 600;
        fill: #00F5A0;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      
      .pill {
        fill: #08100C;
        stroke: rgba(16, 185, 129, 0.18);
        stroke-width: 1;
      }
      
      .pill-text {
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 600;
        fill: #E2E8F0;
        letter-spacing: 0.2px;
      }
    ]]></style>
  </defs>

  <rect class="bg" width="${width}" height="${totalHeight}" />
  
  <!-- Header -->
  <g transform="translate(10, 20)">
    <circle cx="4" cy="-4" r="3.5" fill="#00F5A0" />
    <text class="header-title" x="16" y="0">ECOSYSTEM_STACK // CORE TOOLCHAIN &amp; TECHNOLOGIES</text>
  </g>
  
  ${cardsSvg}
</svg>
`;
}

const outDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tech-stack.svg'), generateSVG().trim());
console.log('Generated generated/tech-stack.svg successfully.');
