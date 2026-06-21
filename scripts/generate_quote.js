const fs = require('fs');
const path = require('path');

const quote = `"Those who cannot acknowledge themselves, will eventually fail."`;
const chars = quote.split('');
const duration = 15; // 15 seconds loop

let classes = '';
let spans = '';

chars.forEach((c, i) => {
  // Speed of typing: each char appears 0.1s after the previous
  const delay = (i * 0.1).toFixed(1);
  classes += `      .c${i} { animation: type ${duration}s steps(1) ${delay}s infinite; }\n`;
  spans += `<tspan class="type-group c${i}">${c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>`;
});

// Cursor needs to move based on character count.
// Fira Code is approx 9.6px per char at 16px font-size.
const sweepWidth = chars.length * 9.6;
// Center it. Box is 800 wide. 
const startX = (800 - sweepWidth) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 60" width="100%" height="60">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400&amp;display=swap');
      
      .text {
        font-family: 'Fira Code', monospace;
        font-size: 16px;
        fill: #8b949e;
      }
      
      .cursor {
        fill: #58a6ff;
        animation: blink 1s step-end infinite;
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      .type-group {
        opacity: 0;
      }
      
      /* Typing animation sequence */
${classes}      
      @keyframes type {
        0% { opacity: 0; }
        0.1% { opacity: 1; }
        90% { opacity: 1; }
        90.1% { opacity: 0; }
        100% { opacity: 0; }
      }
      
      .cursor-move {
        animation: cursorSweep ${duration}s linear infinite;
      }
      
      @keyframes cursorSweep {
        0% { transform: translateX(0px); }
        35% { transform: translateX(${sweepWidth}px); } /* time to type */
        90% { transform: translateX(${sweepWidth}px); }
        90.1% { transform: translateX(0px); }
        100% { transform: translateX(0px); }
      }
    </style>
  </defs>
  
  <g transform="translate(${startX}, 35)">
    <text class="text">
      ${spans}
    </text>
    <rect class="cursor cursor-move" x="0" y="-12" width="10" height="15" />
  </g>
</svg>`;

const outDir = path.join(__dirname, '..', 'svg');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'quote.svg'), svg.trim());
