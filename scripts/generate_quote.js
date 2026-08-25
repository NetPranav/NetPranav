const fs = require('fs');
const path = require('path');

const quote = `"Nature builds resilient complexity from simple, elegant rules. Build systems the same way."`;
const chars = quote.split('');
const duration = 16; // 16 seconds loop

let classes = '';
let spans = '';

chars.forEach((c, i) => {
  // Speed of typing: each char appears 0.08s after the previous
  const delay = (i * 0.08).toFixed(2);
  classes += `      .c${i} { animation: type ${duration}s steps(1) ${delay}s infinite; }\n`;
  spans += `<tspan class="type-group c${i}">${c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>`;
});

// Cursor needs to move based on character count.
// Fira Code is approx 8.6px per char at 14.5px font-size.
const sweepWidth = chars.length * 8.6;
const startX = Math.max(20, (850 - sweepWidth) / 2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 60" width="100%" height="60">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:ital,wght@0,400;0,500;1,400&amp;display=swap');
      
      .text {
        font-family: 'Fira Code', monospace;
        font-size: 14.5px;
        fill: #A0AEC0;
        letter-spacing: 0.2px;
      }
      
      .cursor {
        fill: #00F5A0;
        filter: drop-shadow(0 0 4px rgba(0, 245, 160, 0.6));
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
        88% { opacity: 1; }
        88.1% { opacity: 0; }
        100% { opacity: 0; }
      }
      
      .cursor-move {
        animation: cursorSweep ${duration}s linear infinite;
      }
      
      @keyframes cursorSweep {
        0% { transform: translateX(0px); }
        42% { transform: translateX(${sweepWidth}px); } /* time to type */
        88% { transform: translateX(${sweepWidth}px); }
        88.1% { transform: translateX(0px); }
        100% { transform: translateX(0px); }
      }
    </style>
  </defs>
  
  <g transform="translate(${startX}, 35)">
    <text class="text">
      ${spans}
    </text>
    <rect class="cursor cursor-move" x="0" y="-12" width="8" height="15" rx="1" />
  </g>
</svg>`;

const outDir = path.join(__dirname, '..', 'svg');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'quote.svg'), svg.trim());
console.log('Generated svg/quote.svg successfully.');
