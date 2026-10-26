// Content for the bento profile. Edit this file, then run `node scripts/generate_bento.js`.
module.exports = {
  username: 'NetPranav',
  repo: 'NetPranav', // the profile README repo
  accent: '#ff5a1f',

  name: ['Pranav', 'Dubey'],
  meta: [
    { label: 'Role', value: 'Systems & AI engineer' },
    { label: 'Based', value: 'Indore, India' },
    { label: 'Method', value: 'First principles' },
    { label: 'Focus', value: 'Agents · Vision · Tools' },
  ],

  // Set repo to 'auto' to show whichever repo you pushed to most recently.
  nowBuilding: {
    repo: 'Cero-Terminal',
    blurb: 'A plain-language terminal for .flow setup files on any OS.',
  },

  projects: [
    { name: 'MockMate', repo: '-MockMate-', blurb: 'AI mock interviews from your resume', lang: 'TS' },
    { name: 'Auto-Navigator', repo: 'Auto-Navigator', blurb: 'Desktop and web computer-use agent', lang: 'PY' },
    { name: 'Humanoid-Face-3D', repo: 'Humanoid-Face-3D', blurb: 'Image to game-ready 3D face and UE5 rig', lang: 'PY' },
  ],

  hackathons: {
    link: 'https://github.com/NetPranav/BGI-Hackathon',
    headline: { big: '2nd', text: 'BGI Hackathon, 1st Runner-up' },
    second: { title: 'Seismo', text: 'HackWave 3.0, PS3' },
  },

  stack: {
    marquee: ['TypeScript', 'Python', 'PyTorch', 'OpenCV', 'Next.js', 'Docker'],
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
