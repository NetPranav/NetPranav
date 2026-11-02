// Everything the daily profile says, in one place. Edit here, not in the designs.
// Private repos have url: null, so they link to the profile instead of a 404.
const P = 'https://github.com/NetPranav';
const r = (n) => `${P}/${n}`;

module.exports = {
  profile: P,
  name: ['Pranav', 'Dubey'],
  meta: [
    ['Role', 'Full-stack & AI engineer'],
    ['Based', 'Indore, India'],
    ['Method', 'First principles'],
    ['Focus', 'Motion tools · 3D vision'],
  ],
  // Optional extra line for the daily status strip. Leave '' to hide.
  statusNote: '',
  free: { status: 'Open for freelance work', note: 'Websites, mobile apps and backends.', clients: ['SkyRiseFPV', 'Mahaurja', 'Magnm'] },
  now: { name: 'LazyLayout', blurb: 'AI-native motion design studio. Edit visually, export clean GSAP and Framer Motion code.', url: r('WebGen') },
  work: [
    ['LazyLayout', 'AI motion design studio', 'TS'],
    ['Humanoid-Face-3D', 'Research: photo to 3D head mesh', 'PY'],
    ['Cero-Terminal', 'Plain-language terminal for .flow files', 'TS'],
  ],
  awards: [
    ['1st Runner-up', 'Agnitia'],
    ['1st Runner-up', 'BGI Hackathon'],
    ['Best Design Award', 'Kriyeta'],
  ],
  research: [
    { name: 'Humanoid-Face-3D', line: 'Photo in, game-ready head out.', url: r('Humanoid-Face-3D'),
      facts: ['FLAME fitting on 5,023 vertices', 'PBR textures and ARKit-52 blendshapes', '4 levels of detail, UE5 FBX export', 'Checked against a ground-truth scan'] },
    { name: 'OncoPattern', line: 'Explainable cancer image analysis.', url: r('Cancer-classification-'),
      facts: ['Finds single atypical cells', 'Explains why, in numbers', 'Abstains when it cannot be sure', 'Phantom data only, not clinical'] },
    { name: 'Smart Cursor', line: 'Pixel-accurate UI grounding.', url: null,
      facts: ['Accessibility tree and Apple Vision OCR', 'Fine-tuned Florence-2 with LoRA', 'Returns a box and a click point', 'Local project'] },
  ],
  // Selected extras. Auto-Navigator, Seismo, MockMate and the auto-solvers are deliberately not here.
  projects: [
    { name: 'TERRA', blurb: 'Solar and wind forecasting with battery dispatch for a 90 MW plant near Indore.', tag: 'Agnitia', url: r('AGNITIA-TERRA06') },
    { name: 'Robot Rumble', blurb: 'Unreal Engine 5 action combat game with Sui blockchain gear NFTs.', tag: 'C++ · UE5', url: r('Game-Development-') },
    { name: 'NewOS', blurb: 'A desktop OS on the Linux kernel that runs Linux, Android and Windows apps.', tag: 'Research', url: null },
    { name: 'Smriti-NER', blurb: 'Dementia care and reminiscence platform for North East India.', tag: 'SIH 2026', url: r('SIH003') },
    { name: 'Bus Tracker', blurb: 'Real-time college bus tracking and fleet intelligence for students.', tag: 'Private', url: null },
    { name: 'LinkedIn AI Studio', blurb: 'Write, preview and auto-publish LinkedIn posts from your phone.', tag: 'AI', url: r('Automatic-Linkedin-Bot-') },
    { name: 'Robocon 2027 Tracker', blurb: '100 work packages across three departments, with approval-based sign-in.', tag: 'Private', url: null },
    { name: 'ProtfoliQ', blurb: 'AI reviewer that audits your GitHub repos and project presentation.', tag: 'AI', url: null },
    { name: 'Magnm Marketing', blurb: 'A team of agents that plans and schedules posts for Magnm.', tag: 'Agents', url: r('Magnm-Marketing') },
    { name: 'Marg', blurb: 'Logistics apps for drivers, warehouses and factories.', tag: 'Logistics', url: r('Marg-Application') },
    { name: 'GSAP Components', blurb: 'An open-source UI component library built on GSAP.', tag: 'Open source', url: r('Gsap-Components') },
    { name: 'Autonomous YouTube', blurb: 'Foundation for an autonomous AI YouTube pipeline.', tag: 'Python', url: r('Auto-Youtbe-App') },
  ],
  // Dates are each project's first commit, not award dates.
  timeline: [
    ['Feb 2025', 'CIFAR-100 CNN', 'Image classifier'],
    ['Nov 2025', 'LazyLayout begins', 'Motion design studio'],
    ['Jan 2026', 'Codespire 3.0', 'GSAP engine project'],
    ['Jun 2026', 'BGI Hackathon', '1st Runner-up'],
    ['Jul 2026', 'Cero Terminal begins', 'Plain-language terminal'],
    ['Sep 2026', 'Humanoid-Face-3D', 'then OncoPattern'],
    ['Oct 2026', 'TERRA', 'Agnitia 1st Runner-up'],
    ['Oct 2026', 'NewOS begins', 'Desktop OS research'],
  ],
  stack: ['TypeScript', 'Python', 'Next.js', 'GSAP', 'PyTorch', 'Docker'],
  also: 'Also C++, Go, Rust, TensorFlow, React, Node.js, Kubernetes, AWS, PostgreSQL, Redis, MongoDB',
  edu: [['CSE, Acropolis', 'Yr 2'], ['Diploma, CSE', '2025']],
};
