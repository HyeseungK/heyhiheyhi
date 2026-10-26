// ─────────────────────────────────────────────────────────────
//  Site content — edit this file to update the website.
//  Everything marked [PLACEHOLDER] is sample text to replace.
// ─────────────────────────────────────────────────────────────

export const profile = {
  nameKo: '김혜승',
  name: 'Hyeseung Kim',
  nickname: 'Helen',
  tagline: 'Consultant by day, image-maker and music lover always.', // [PLACEHOLDER]
  intro:
    'Hi, I’m Helen. I work on strategy problems with consulting teams, and spend the rest of my time with a camera, an editing timeline, or a guitar. This page is my business card, an archive of both sides.', // [PLACEHOLDER]
  location: 'Seoul', // [PLACEHOLDER]
  // business card (end of the home screen) + downloadable contact file
  card: {
    title: 'Strategy Consultant', // [PLACEHOLDER]
    org: 'Consulting Firm A', // [PLACEHOLDER]
    email: 'hello@example.com', // [PLACEHOLDER]
    phone: '', // optional, e.g. '+82 10 0000 0000'
    website: 'https://hyeseungk.github.io/heyhiheyhi/',
  },
  links: [
    { label: 'Email', href: 'mailto:hello@example.com' }, // [PLACEHOLDER]
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // [PLACEHOLDER]
    { label: 'Instagram', href: 'https://www.instagram.com/' }, // [PLACEHOLDER]
  ],
};

// Hero words, morphed in order as you scroll.
export const heroWords = [
  { word: '김혜승', caption: 'the name I was given' },
  { word: 'Hyeseung', caption: 'the same name, spelled out' },
  { word: 'Helen', caption: 'the name most people call me' },
  { word: 'Hey Hi', caption: 'a song I love, and how I say hello' },
];

// ── WORK ─────────────────────────────────────────────────────
export const work = {
  lead:
    'I like turning messy questions into clear decisions. Below is the path so far, and inside the laptop are the projects that shaped it.', // [PLACEHOLDER]
  career: [
    // [PLACEHOLDER] newest first
    {
      period: '2024 — Now',
      org: 'Consulting Firm A',
      role: 'Consultant',
      text:
        'Strategy and operations projects across consumer, tech and financial services. I usually own the problem structuring and the final storyline, from the first hypothesis tree to the deck the CEO reads.',
    },
    {
      period: '2022 — 2024',
      org: 'Company B',
      role: 'Business Analyst',
      text:
        'Built the market-sizing and pricing models behind two product launches, and learned how a recommendation lives or dies once it leaves the slide.',
    },
    {
      period: '2018 — 2022',
      org: 'University C',
      role: 'B.A. Business & Media',
      text:
        'Split my time between economics classes and the film club. Ran the school’s music society for two years.',
    },
  ],
  // Each project opens as a small deck on the laptop:
  // Exec summary → Issue tree → Approach → Impact. Keep client names anonymous.
  projects: [
    // [PLACEHOLDER]
    {
      year: '2025',
      client: 'Global consumer brand',
      title: 'Growth strategy for the Korean market',
      tags: ['Strategy', 'Consumer'],
      summary: 'Growth had stalled after three years of double-digit gains. We found that the slowdown came from lapsed repeat buyers, not from new-customer acquisition, and re-focused the plan on retention.',
      issueTree: {
        question: 'How can the brand return to 10%+ growth in Korea?',
        branches: [
          { label: 'Win new customers', items: ['Under-served segments', 'Channel gaps'] },
          { label: 'Keep existing ones', items: ['Repeat-purchase drivers', 'Loyalty economics'] },
          { label: 'Grow basket size', items: ['Pricing & bundles', 'Range extension'] },
        ],
      },
      approach: ['Segmentation from 4,000 survey responses', 'Channel economics by store format', 'Competitor teardown of five rival brands'],
      impact: [
        { value: '3', label: 'growth bets prioritised' },
        { value: '40', label: 'stores in the pilot' },
        { value: '+8%', label: 'repeat rate in pilot stores' },
      ],
    },
    {
      year: '2025',
      client: 'Fintech scale-up',
      title: 'Pricing redesign',
      tags: ['Pricing', 'Fintech'],
      summary: 'A flat fee left value on the table with power users and pushed light users away. A three-tier model fits willingness to pay much better.',
      issueTree: {
        question: 'What pricing model maximises revenue without hurting growth?',
        branches: [
          { label: 'Who values what?', items: ['Usage cohorts', 'Willingness to pay'] },
          { label: 'Which structure?', items: ['Tiers vs. usage-based', 'Free tier limits'] },
          { label: 'How to roll out?', items: ['Migration path', 'Churn risk'] },
        ],
      },
      approach: ['Van Westendorp survey with 1,200 users', 'Cohort analysis of 18 months of usage', 'Interactive pricing simulator for leadership'],
      impact: [
        { value: '+12%', label: 'projected revenue per user' },
        { value: '3', label: 'tiers launched' },
      ],
    },
    {
      year: '2024',
      client: 'Conglomerate',
      title: 'Digital transformation roadmap',
      tags: ['Digital', 'Operations'],
      summary: 'Twenty-plus digital initiatives competed for the same budget. A shared scoring model and governance turned them into one three-year roadmap.',
      issueTree: {
        question: 'Which digital initiatives should the group fund, and in what order?',
        branches: [
          { label: 'Value', items: ['Revenue upside', 'Cost savings'] },
          { label: 'Feasibility', items: ['Data readiness', 'Talent & vendors'] },
          { label: 'Governance', items: ['Decision rights', 'Funding model'] },
        ],
      },
      approach: ['Scoring workshops with 12 business units', 'Value-vs-feasibility matrix', 'Governance design benchmarked on 4 peers'],
      impact: [
        { value: '24→7', label: 'initiatives, prioritised' },
        { value: '3-yr', label: 'roadmap adopted by the board' },
      ],
    },
  ],
};

// ── VISUAL WORK ──────────────────────────────────────────────
// Images: drop files in assets/photos/film or assets/photos/digital
// and set `src` (e.g. 'assets/photos/film/01.jpg').
// Leave `src` empty to show a placeholder frame.
export const visual = {
  lead: 'Things I filmed, shot, and cut. Film photos on the strip, digital ones on the wall, moving pictures on the screens.', // [PLACEHOLDER]
  videos: [
    // `url` can be a YouTube or Vimeo link.
    { title: 'Short film — “Blue Hour”', year: '2024', role: 'Director, editor', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }, // [PLACEHOLDER]
    { title: 'Live session — Band X', year: '2023', role: 'Camera, edit', url: '' }, // [PLACEHOLDER]
    { title: 'Travel log — Lisbon', year: '2023', role: 'Shot on phone', url: '' }, // [PLACEHOLDER]
  ],
  // Film frames appear on a contact sheet. `stock` drives the film-canister filter,
  // `pick: true` gets a red grease-pencil circle.
  film: [
    // [PLACEHOLDER]
    { src: '', caption: 'Morning, Jeju', camera: 'Pentax MX', stock: 'Portra 400', tone: '#e9d8c4', pick: true },
    { src: '', caption: 'Bus stop', camera: 'Pentax MX', stock: 'Gold 200', tone: '#d7dfe3' },
    { src: '', caption: 'Grandmother’s kitchen', camera: 'Olympus mju II', stock: 'Portra 400', tone: '#efe2cf' },
    { src: '', caption: 'Han River, 6pm', camera: 'Pentax MX', stock: 'Gold 200', tone: '#f0d2c2', pick: true },
    { src: '', caption: 'Rehearsal room', camera: 'Olympus mju II', stock: 'HP5 Plus', tone: '#d9d9d6' },
    { src: '', caption: 'Seaside, Gangneung', camera: 'Pentax MX', stock: 'Portra 400', tone: '#cfe0e6' },
    { src: '', caption: 'Late tram', camera: 'Olympus mju II', stock: 'Cinestill 800T', tone: '#e3d3e0', pick: true },
    { src: '', caption: 'Brooklyn rooftops', camera: 'Pentax MX', stock: 'Gold 200', tone: '#ead9c0' },
    { src: '', caption: 'Shibuya at night', camera: 'Olympus mju II', stock: 'Cinestill 800T', tone: '#dcd4e6' },
    { src: '', caption: 'Market stall', camera: 'Pentax MX', stock: 'HP5 Plus', tone: '#dededa' },
    { src: '', caption: 'Rain, Kyoto', camera: 'Olympus mju II', stock: 'Portra 400', tone: '#d6e1dc' },
    { src: '', caption: 'Last frame', camera: 'Pentax MX', stock: 'Gold 200', tone: '#f2e3c9' },
  ],
  // film canister colours for the filter
  stocks: {
    'Portra 400': '#f2c14e',
    'Gold 200': '#e8a33d',
    'HP5 Plus': '#3b3b3b',
    'Cinestill 800T': '#c94f3d',
  },

  digital: [
    // [PLACEHOLDER] `ratio` is width / height, used for placeholder shape
    { src: '', caption: 'Concrete & sky', ratio: 0.8, tone: '#dde3ea' },
    { src: '', caption: 'Studio portrait', ratio: 1.25, tone: '#ece4dc' },
    { src: '', caption: 'Night market', ratio: 0.75, tone: '#e6dccf' },
    { src: '', caption: 'Window light', ratio: 1, tone: '#e3e6df' },
    { src: '', caption: 'Stage, close up', ratio: 1.5, tone: '#e0dce8' },
    { src: '', caption: 'Rain on glass', ratio: 0.8, tone: '#d9e2e4' },
  ],
};

// ── MUSIC ────────────────────────────────────────────────────
// Covers: put images in assets/albums and set `cover`.
export const music = {
  lead: 'Albums I keep coming back to. Pull one off the shelf to see what is inside. The guitar knows where I’ve played.', // [PLACEHOLDER]
  albums: [
    {
      title: 'Hey Hi',
      artist: 'Artist name',
      year: '2020',
      cover: '',
      color: '#2f4cff',
      why: 'The song this site is named after. It sounds exactly like saying hello to someone you missed.',
      tracks: [
        { name: 'Hey Hi', why: 'The first eight bars are the warmest greeting I know.' },
        { name: 'Track 2', why: '[PLACEHOLDER] Why this track matters to me.' },
      ],
    },
    {
      title: 'Album Two',
      artist: 'Artist B',
      year: '2016',
      cover: '',
      color: '#111111',
      why: '[PLACEHOLDER] The album I played on repeat during my first job.',
      tracks: [
        { name: 'Opening track', why: 'That bass line.' },
        { name: 'Closer', why: 'Best last song on any record.' },
      ],
    },
    {
      title: 'Album Three',
      artist: 'Artist C',
      year: '1999',
      cover: '',
      color: '#e8dccb',
      why: '[PLACEHOLDER] Found it in my dad’s CD shelf.',
      tracks: [{ name: 'Side A, 3', why: 'Sounds like a summer afternoon.' }],
    },
    {
      title: 'Album Four',
      artist: 'Artist D',
      year: '2012',
      cover: '',
      color: '#c94f3d',
      why: '[PLACEHOLDER]',
      tracks: [{ name: 'Single', why: 'Learned it on guitar first.' }],
    },
    {
      title: 'Album Five',
      artist: 'Artist E',
      year: '2008',
      cover: '',
      color: '#7a8b6f',
      why: '[PLACEHOLDER]',
      tracks: [{ name: 'Track 5', why: 'Late-night bus soundtrack.' }],
    },
    {
      title: 'Album Six',
      artist: 'Artist F',
      year: '2021',
      cover: '',
      color: '#d9c8a9',
      why: '[PLACEHOLDER]',
      tracks: [{ name: 'Track 1', why: '' }],
    },
    {
      title: 'Album Seven',
      artist: 'Artist G',
      year: '1994',
      cover: '',
      color: '#3b3f5c',
      why: '[PLACEHOLDER]',
      tracks: [{ name: 'Track 9', why: '' }],
    },
    {
      title: 'Album Eight',
      artist: 'Artist H',
      year: '2018',
      cover: '',
      color: '#f2f0ea',
      why: '[PLACEHOLDER]',
      tracks: [{ name: 'Track 4', why: '' }],
    },
  ],
  // Ticket book: festivals and concerts. Click a ticket to tear the stub and read the back.
  tickets: [
    // [PLACEHOLDER]
    { type: 'Festival', name: 'Pentaport Rock Festival', lineup: 'Day 2', date: '2024.08.03', venue: 'Songdo Moonlight Park', city: 'Incheon', color: '#2f4cff', memo: 'Rain all afternoon, then the headliner played under clear sky.' },
    { type: 'Concert', name: 'Artist B — World Tour', lineup: 'Live in Seoul', date: '2023.11.18', venue: 'KSPO Dome', city: 'Seoul', seat: 'Floor B · 12', color: '#111111', memo: 'Cried at the encore. Went with my sister.' },
    { type: 'Festival', name: 'Fuji Rock', lineup: 'Friday', date: '2023.07.28', venue: 'Naeba Ski Resort', city: 'Niigata', color: '#7a8b6f', memo: 'Mountain air, mud boots, and the best set of my life.' },
    { type: 'Concert', name: 'Artist C', lineup: 'Club show', date: '2022.05.12', venue: 'Rolling Hall', city: 'Seoul', seat: 'Standing', color: '#c94f3d', memo: 'Two hundred people and a band I had loved for ten years.' },
    { type: 'Concert', name: 'Artist D', lineup: 'Live at the Garden', date: '2024.10.02', venue: 'Madison Square Garden', city: 'New York', seat: 'Sec 112 · Row 8', color: '#e8dccb', memo: 'My first concert in New York.' },
  ],
  stage: {
    intro: 'Bands, open mics and recordings. Click a line to go there.', // [PLACEHOLDER]
    soundcloud: 'https://soundcloud.com/', // [PLACEHOLDER]
    performances: [
      // [PLACEHOLDER]
      { title: 'Campus band — Spring concert', date: '2021', role: 'Guitar, vocals', url: 'https://www.youtube.com/' },
      { title: 'Open mic, Hongdae', date: '2023', role: 'Acoustic set', url: '' },
      { title: 'Cover — “Hey Hi”', date: '2024', role: 'Home recording', url: 'https://soundcloud.com/' },
    ],
  },
};
