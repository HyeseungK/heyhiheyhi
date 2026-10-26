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
  projects: [
    // [PLACEHOLDER] each one opens on the laptop screen
    {
      year: '2025',
      client: 'Global consumer brand',
      title: 'Growth strategy for the Korean market',
      tags: ['Strategy', 'Consumer'],
      challenge: 'Growth had stalled after three years of double-digit gains, and the team disagreed on why.',
      approach: 'Customer segmentation from 4,000 survey responses, channel economics, and a competitor teardown.',
      impact: 'Three prioritised growth bets, one of which is now in pilot across 40 stores.',
    },
    {
      year: '2025',
      client: 'Fintech scale-up',
      title: 'Pricing redesign',
      tags: ['Pricing', 'Fintech'],
      challenge: 'A flat fee structure was leaving value on the table with power users.',
      approach: 'Willingness-to-pay research, cohort analysis, and a tiered pricing simulator.',
      impact: 'New tiered plans projected to lift revenue per user by about 12%.',
    },
    {
      year: '2024',
      client: 'Conglomerate',
      title: 'Digital transformation roadmap',
      tags: ['Digital', 'Operations'],
      challenge: 'Twenty-plus digital initiatives with no shared priorities.',
      approach: 'Value-versus-feasibility scoring workshops with 12 business units.',
      impact: 'A three-year roadmap and governance model adopted by the board.',
    },
    {
      year: '2024',
      client: 'Retail bank',
      title: 'Branch network optimisation',
      tags: ['Operations', 'FS'],
      challenge: 'Branch footfall fell 30% while costs stayed flat.',
      approach: 'Geospatial demand modelling and a branch format playbook.',
      impact: 'A consolidation plan saving an estimated ₩8bn a year.',
    },
    {
      year: '2023',
      client: 'Entertainment company',
      title: 'Fan platform business case',
      tags: ['Media', 'New business'],
      challenge: 'Should the company build its own fan platform or partner with one?',
      approach: 'Build / partner / buy assessment with a P&L for each scenario.',
      impact: 'A go decision on the partner model, with launch the following year.',
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
  film: [
    // [PLACEHOLDER] 35mm frames
    { src: '', caption: 'Morning, Jeju', camera: 'Pentax MX · Portra 400', tone: '#e9d8c4' },
    { src: '', caption: 'Bus stop', camera: 'Pentax MX · Gold 200', tone: '#d7dfe3' },
    { src: '', caption: 'Grandmother’s kitchen', camera: 'Olympus mju II · Superia', tone: '#efe2cf' },
    { src: '', caption: 'Han River, 6pm', camera: 'Pentax MX · Portra 400', tone: '#f0d2c2' },
    { src: '', caption: 'Rehearsal room', camera: 'Olympus mju II · HP5', tone: '#d9d9d6' },
    { src: '', caption: 'Seaside, Gangneung', camera: 'Pentax MX · Ektar 100', tone: '#cfe0e6' },
    { src: '', caption: 'Late tram', camera: 'Olympus mju II · Cinestill 800T', tone: '#e3d3e0' },
  ],
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
