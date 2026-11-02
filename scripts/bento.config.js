// Content for the bento profile. Edit this file, then run `node scripts/generate_bento.js`.
module.exports = {
  username: 'NetPranav',
  repo: 'NetPranav', // the profile README repo
  accent: '#ff5a1f',

  name: ['Pranav', 'Dubey'],
  meta: [
    { label: 'Role', value: 'Full-stack & AI engineer' },
    { label: 'Based', value: 'Indore, India' },
    { label: 'Method', value: 'First principles' },
    { label: 'Focus', value: 'Motion tools · 3D vision' },
  ],

  // Your flagship. Set repo to 'auto' to show whichever public repo you pushed to most recently.
  // url: null means the repo is private, so the tile links to your profile instead.
  nowBuilding: {
    repo: 'LazyLayout',
    blurb: 'AI-native motion design studio. Edit visually, export clean GSAP and Framer Motion code.',
    url: 'https://github.com/NetPranav/WebGen', // public repo, named WebGen
  },

  freelance: {
    status: 'Open for freelance work',
    note: 'Websites, mobile apps and backends.',
    clients: ['SkyRiseFPV', 'Mahaurja', 'Magnm'],
  },

  // Selected work list (top 3 shown).
  projects: [
    { name: 'LazyLayout', blurb: 'AI motion design studio', lang: 'TS' },
    { name: 'Humanoid-Face-3D', blurb: 'Research: photo to 3D head mesh', lang: 'PY' },
    { name: 'Cero-Terminal', blurb: 'Plain-language terminal for .flow files', lang: 'TS' },
  ],

  // "Today's UI" rotation. One project per day, in this order, picked from the date.
  // id must match a drawer in scripts/showcase.js. url: null = private, links to your profile.
  showcase: [
    { id: 'lazylayout', name: 'LazyLayout', blurb: 'Visual editor for interactive motion. Exports clean GSAP, Framer Motion, SVG and CSS.', tags: ['Next.js 16', 'React 19', 'GSAP'], url: 'https://github.com/NetPranav/WebGen' },
    { id: 'humanoid', name: 'Humanoid-Face-3D', blurb: 'Research pipeline that turns 1 to 5 portraits into a production-ready 3D head mesh with PBR textures, ARKit-52 blendshapes and a UE5 rig.', tags: ['Research', 'FLAME', 'PyTorch'], url: 'https://github.com/NetPranav/Humanoid-Face-3D' },
    { id: 'cero', name: 'Cero Terminal', blurb: 'A terminal that takes plain-language requests and runs .flow setup files on any OS.', tags: ['TypeScript', '.flow', 'Local AI'], url: 'https://github.com/NetPranav/Cero-Terminal' },
    { id: 'onco', name: 'OncoPattern', blurb: 'Explainable cancer image analysis. Finds atypical cells, explains why, and abstains when unsure.', tags: ['Research', 'Explainable AI', 'Python'], url: 'https://github.com/NetPranav/Cancer-classification-' },
    { id: 'smartcursor', name: 'Smart Cursor', blurb: 'Finds the exact UI element to click in any app, so an agent can drive the mouse. Accessibility tree and Apple Vision OCR, with a fine-tuned Florence-2 model.', tags: ['Research', 'Computer vision', 'Python'], url: null, status: 'Local project' },
    { id: 'planner', name: 'Magnm Build Planner', blurb: 'Clients tick the features they need and watch the price update live. Exports a PDF.', tags: ['HTML', 'CSS', 'JavaScript'], url: 'https://github.com/NetPranav/Magnm-Pitch' },
    { id: 'skyrise', name: 'SkyRiseFPV', blurb: 'Production e-commerce store for an FPV drone shop.', tags: ['Client work', 'E-commerce', 'Django'], url: null },
    { id: 'mahaurja', name: 'Mahaurja', blurb: 'Plant operating system: a live dashboard and API for running a plant.', tags: ['Client work', 'Next.js', 'Fastify'], url: null },
  ],

  // Newest first. link is where the whole tile points.
  hackathons: {
    link: 'https://github.com/NetPranav/AGNITIA-TERRA06',
    awards: [
      { award: '1st Runner-up', event: 'Agnitia' },
      { award: '1st Runner-up', event: 'BGI Hackathon' },
      { award: 'Best Design Award', event: 'Kriyeta' },
    ],
  },

  stack: {
    marquee: ['TypeScript', 'Python', 'Next.js', 'GSAP', 'PyTorch', 'Docker'],
    also: 'Also C++, Go, Rust, TensorFlow, React, Node.js, Kubernetes, AWS, PostgreSQL, Redis, MongoDB',
  },

  education: [
    { title: 'CSE, Acropolis', note: 'Yr 2' },
    { title: 'Diploma, CSE', note: '2025' },
  ],

  // Add more, e.g. { label: 'LinkedIn', url: 'https://linkedin.com/in/...' },
  //                { label: 'Email', url: 'mailto:you@example.com' }
  contacts: [
    { label: 'GitHub', url: 'https://github.com/NetPranav' },
  ],
};
