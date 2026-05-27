// ============================================
// AURIX WEBSITE — PRODUCTS.JS
// Dynamic product detail pages
// ============================================

const products = {
  'aurix': {
    name: 'Aurix',
    icon: '✨',
    tagline: 'Your personal AI companion. Built to learn, adapt, and grow with you.',
    status: 'In Development',
    statusClass: 'status-beta',
    description: 'Aurix is an AI companion designed to be your study partner, tech buddy, and personal assistant. Built from the ground up by a student who wanted an AI that actually knows them — not a generic chatbot.',
    longDescription: 'What started as a personal project has evolved into a full AI companion platform. Aurix runs on OpenClaw, uses multiple AI models, has a persistent memory system, and integrates with Discord. It\'s not just a chatbot — it\'s a companion that learns your patterns, tracks your goals, and grows with you over time.',
    techStack: ['Python', 'OpenClaw', 'OpenRouter', 'Discord API', 'Firebase', 'Supabase'],
    stats: [
      { label: 'Lines of Code', value: '15,000+' },
      { label: 'AI Models', value: '4+' },
      { label: 'Memory Files', value: '10+' },
      { label: 'Uptime', value: '24/7' }
    ],
    userTypes: [
      { emoji: '🎓', title: 'Students', desc: 'Study companion, backlog tracking, motivation' },
      { emoji: '💻', title: 'Developers', desc: 'Code review, debugging, project management' },
      { emoji: '🎨', title: 'Creators', desc: 'Content ideas, writing, brainstorming' },
      { emoji: '🤖', title: 'AI Enthusiasts', desc: 'Experiment, learn, build with AI' }
    ],
    installSteps: [
      'Clone the repository from GitHub',
      'Install dependencies: pip install -r requirements.txt',
      'Set up your OpenRouter API key in .env',
      'Configure Discord bot token',
      'Run: python server.py',
      'Start chatting on Discord or CLI!'
    ]
  },
  'nexus-prime': {
    name: 'Nexus Prime',
    icon: '🧠',
    tagline: 'A JARVIS-like AI assistant. Fully offline, continuous listening, hotword activation.',
    status: 'Coming Soon',
    statusClass: 'status-building',
    description: 'Nexus Prime is the next evolution — a JARVIS-like AI assistant that runs fully offline on your local machine. Continuous listening, hotword activation, natural emotional voice.',
    longDescription: 'Imagine having your own JARVIS. Nexus Prime aims to deliver exactly that — a fully offline AI assistant with continuous listening, hotword activation ("Hey Nexus"), natural emotional voice synthesis, and deep integration with your daily workflow. No cloud dependency, no privacy concerns.',
    techStack: ['Python', 'Ollama', 'LangChain', 'ChromaDB', 'Whisper', 'TTS', 'Local LLMs'],
    stats: [
      { label: 'Target Latency', value: '<200ms' },
      { label: 'Offline', value: '100%' },
      { label: 'Voice Models', value: '3+' },
      { label: 'Status', value: 'Alpha' }
    ],
    userTypes: [
      { emoji: '🏠', title: 'Smart Home', desc: 'Control devices, automate routines' },
      { emoji: '💼', title: 'Professionals', desc: 'Meeting notes, scheduling, research' },
      { emoji: '🎓', title: 'Students', desc: 'Study help, note-taking, reminders' },
      { emoji: '🔒', title: 'Privacy-First', desc: 'Fully offline, no data leaves your machine' }
    ],
    installSteps: [
      'Requirements: 16GB+ RAM, dedicated GPU recommended',
      'Install Ollama from ollama.ai',
      'Pull required models: ollama pull llama3',
      'Clone Nexus Prime repository',
      'Install dependencies: pip install -r requirements.txt',
      'Configure hotword and voice settings',
      'Run: python nexus_prime.py',
      'Say "Hey Nexus" to activate!'
    ]
  },
  'cyber-nexus': {
    name: 'Cyber Nexus',
    icon: '🔒',
    tagline: 'Cybersecurity toolkit for learning and ethical hacking.',
    status: 'Coming Soon',
    statusClass: 'status-building',
    description: 'A cybersecurity toolkit designed for learning and ethical hacking. Knowledge is the best defense, and Cyber Nexus makes security accessible.',
    longDescription: 'Cyber Nexus is a collection of security tools, tutorials, and labs designed for students and hobbyists who want to learn cybersecurity. From network scanning to vulnerability assessment, it provides a safe environment to learn ethical hacking.',
    techStack: ['Python', 'Linux', 'Wireshark', 'Nmap', 'Metasploit', 'Docker'],
    stats: [
      { label: 'Tools Included', value: '20+' },
      { label: 'Lab Scenarios', value: '50+' },
      { label: 'Difficulty', value: 'Beginner→Advanced' },
      { label: 'Status', value: 'Planning' }
    ],
    userTypes: [
      { emoji: '🎓', title: 'Security Students', desc: 'Learn ethical hacking in safe environments' },
      { emoji: '💻', title: 'Developers', desc: 'Test your apps for vulnerabilities' },
      { emoji: '🏢', title: 'Small Business', desc: 'Basic security auditing tools' },
      { emoji: '🔍', title: 'Researchers', desc: 'Security research and CTF practice' }
    ],
    installSteps: [
      'Install Kali Linux or any Debian-based distro',
      'Clone Cyber Nexus repository',
      'Run setup script: sudo bash setup.sh',
      'Launch the toolkit: python cyber_nexus.py',
      'Choose a module from the menu',
      'Follow the guided tutorials!'
    ]
  },
  'kcet-prep': {
    name: 'KCET Prep App',
    icon: '📚',
    tagline: 'AI-powered question generation and study companion for KCET aspirants.',
    status: 'In Development',
    statusClass: 'status-beta',
    description: 'An AI-powered study companion designed specifically for KCET preparation. Generate practice questions, track progress, and study smarter.',
    longDescription: 'KCET Prep App combines AI-powered question generation with a clean study interface. It generates practice questions based on the KCET syllabus, tracks your performance over time, and helps you focus on weak areas. Built by a KCET aspirant, for KCET aspirants.',
    techStack: ['HTML/CSS/JS', 'Python', 'OpenRouter API', 'JSON', 'Local Storage'],
    stats: [
      { label: 'Subjects', value: '4' },
      { label: 'Question Bank', value: 'Building' },
      { label: 'Tests', value: 'DPP + Mock' },
      { label: 'Platform', value: 'Web App' }
    ],
    userTypes: [
      { emoji: '🎓', title: 'KCET Aspirants', desc: 'Practice questions, mock tests, DPPs' },
      { emoji: '📖', title: 'State Board Students', desc: 'Physics, Chemistry, Maths, Biology' },
      { emoji: '🧠', title: 'Competitive Exam', desc: 'JEE, NEET aligned content' },
      { emoji: '📊', title: 'Self-Learners', desc: 'Track progress, identify weak areas' }
    ],
    installSteps: [
      'Visit the web app URL (coming soon)',
      'Or clone the repository from GitHub',
      'Open index.html in your browser',
      'Set up your OpenRouter API key',
      'Select your subject and start practicing!',
      'Track your progress over time'
    ]
  },
  'spatial-audio': {
    name: 'Spatial Audio Router',
    icon: '🎵',
    tagline: 'Route system audio to multiple output devices simultaneously.',
    status: 'Live',
    statusClass: 'status-live',
    description: 'A Windows application that routes system audio to multiple output devices simultaneously. Features a 3D GUI built with Three.js and an audio engine in Python.',
    longDescription: 'Spatial Audio Router solves a real problem: routing your computer\'s audio to multiple devices at once. Whether you want sound on your headphones AND speakers, or routing different apps to different outputs, this app handles it all with a beautiful 3D interface.',
    techStack: ['Electron', 'Three.js', 'Python', 'Node.js', 'Web Audio API'],
    stats: [
      { label: 'Platforms', value: 'Windows' },
      { label: 'Audio Sources', value: 'Unlimited' },
      { label: 'Output Devices', value: 'Multiple' },
      { label: 'GUI', value: '3D' }
    ],
    userTypes: [
      { emoji: '🎵', title: 'Music Producers', desc: 'Route audio to multiple monitors' },
      { emoji: '🎮', title: 'Gamers', desc: 'Game audio on headphones, chat on speakers' },
      { emoji: '💼', title: 'Professionals', desc: 'Separate audio for meetings and media' },
      { emoji: '🎧', title: 'Audio Enthusiasts', desc: 'Multi-device audio setup' }
    ],
    installSteps: [
      'Download the latest release from GitHub',
      'Run the installer (.exe)',
      'Launch Spatial Audio Router',
      'Select your audio sources and output devices',
      'Enjoy multi-device audio routing!'
    ]
  },
  'nexus-v': {
    name: 'Nexus V',
    icon: '🚀',
    tagline: 'Next-generation AI assistant. The evolution of Nexus Prime.',
    status: 'Coming Soon',
    statusClass: 'status-building',
    description: 'The next generation of AI assistance. Nexus V builds on everything learned from Nexus Prime with advanced capabilities, multi-agent architecture, and deeper integration.',
    longDescription: 'Nexus V represents the future of personal AI. Building on the foundation of Nexus Prime, it introduces multi-agent collaboration, advanced reasoning, proactive assistance, and seamless integration across all your devices and platforms. This is the endgame — an AI that truly understands and anticipates your needs.',
    techStack: ['Python', 'Multi-Agent', 'RAG', 'Vector DB', 'Local LLM', 'Edge AI'],
    stats: [
      { label: 'Agents', value: '10+' },
      { label: 'Reasoning', value: 'Advanced' },
      { label: 'Integration', value: 'Full Stack' },
      { label: 'Status', value: 'Vision' }
    ],
    userTypes: [
      { emoji: '🚀', title: 'Early Adopters', desc: 'Experience the future of AI assistance' },
      { emoji: '💻', title: 'Power Users', desc: 'Complex workflows, automation' },
      { emoji: '🏢', title: 'Teams', desc: 'Multi-agent collaboration' },
      { emoji: '🔬', title: 'Researchers', desc: 'Push the boundaries of AI' }
    ],
    installSteps: [
      'Nexus V is currently in the vision/planning phase',
      'Follow Aurix on Discord for updates',
      'Nexus Prime users will get priority access',
      'Expected release: 2027',
      'Stay tuned for beta sign-ups!'
    ]
  }
};

// ── Load Product Detail ──
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = products[productId];
  const container = document.getElementById('productContent');

  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');

  if (!product || !container) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px;">
        <h2>Product not found</h2>
        <a href="${user ? 'dashboard.html' : '../index.html'}" class="btn btn-primary" style="margin-top:20px;">
          ${user ? '← Back to Dashboard' : '← Back to Home'}
        </a>
      </div>`;
    return;
  }

  // Back link: Dashboard if logged in, Products section if not
  const backHref = user ? 'dashboard.html' : '../index.html#products';
  const backText = user ? '← Back to Dashboard' : '← Back to Products';

  container.innerHTML = `
    <a href="${backHref}" class="back-link" id="backLink">${backText}</a>

    <div class="product-hero">
      <div class="product-icon-large">${product.icon}</div>
      <h1>${product.name}</h1>
      <p class="product-tagline">${product.tagline}</p>
      <span class="product-status ${product.statusClass}">${product.status}</span>
    </div>

    <div class="product-stats">
      ${product.stats.map(s => `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>

    <div class="product-section">
      <h3>About</h3>
      <p>${product.description}</p>
      <p>${product.longDescription}</p>
    </div>

    <div class="product-section">
      <h3>Tech Stack</h3>
      <div class="tech-tags">
        ${product.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    </div>

    <div class="product-section">
      <h3>Who Is This For?</h3>
      <div class="user-types">
        ${product.userTypes.map(u => `<div class="user-type-card"><div class="emoji">${u.emoji}</div><h4>${u.title}</h4><p>${u.desc}</p></div>`).join('')}
      </div>
    </div>

    <div class="product-section">
      <h3>Installation Guide</h3>
      <ol class="install-steps">
        ${product.installSteps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    ${!user ? `<div class="product-cta">
      <p>Want to explore more? <a href="login.html" class="btn btn-primary">Sign In</a> <a href="../index.html" class="btn btn-outline">Browse Products</a></p>
    </div>` : ''}
  `;
});
