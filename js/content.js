// ─────────────────────────────────────────────────────────────
//  Site content — edit this file to update the website.
//  Everything marked [PLACEHOLDER] is sample text to replace.
// ─────────────────────────────────────────────────────────────

// Site-wide settings.
export const site = {
  // 'compact': one-line intro on each tab, more room for the content.
  // 'wordy':   the earlier version with a big title and a lead paragraph.
  layout: 'compact',
  // Accent colour. The first one is the default.
  // What the page-transition screen says on the way to each tab: "Hey Hi, I'm …"
  greeting: {
    lead: 'Hey Hi, I’m',
    home: 'Helen',
    work: 'working',
    visual: 'filming',
    music: 'listening',
  },
  // With more than one entry, a colour dot in the top bar lets visitors switch.
  accents: [
    { name: 'Cobalt', hex: '#2f4cff' },
    { name: 'Red', hex: '#f22b1f' },
    // { name: 'Ink', hex: '#0f0f0f' },
    // { name: 'Film orange', hex: '#ff6a1f' },
    // { name: 'Pink', hex: '#ff4f8b' },
  ],
};

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
    org: 'Kearney',
    email: 'hyeseungkim.kr@gmail.com', // personal
    phone: '', // optional, e.g. '+82 10 0000 0000'
    website: 'https://hyeseungk.github.io/heyhiheyhi/',
    // Optional: a scan of your real card (e.g. 'assets/card.jpg').
    // If set, "Save card" downloads it; otherwise a card image with a QR code is drawn.
    image: '',
  },
  // `display`: how the link reads on the business card (defaults to the URL)
  links: [
    { label: 'Email', href: 'mailto:hyeseungkim.kr@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/helen-kim-kr/', display: 'in/helen-kim-kr' },
    { label: 'Instagram', href: 'https://www.instagram.com/helenrighthere/', display: '@helenrighthere' },
  ],
};

// Hero words, morphed in order as you scroll; the last morph becomes the business card.
export const heroWords = [
  'Hyeseung',
  'Helen',
  'Hey Hi',
];

// ── WORK ─────────────────────────────────────────────────────
export const work = {
  lead:
    'I like turning messy questions into clear decisions. Below is the path so far, and inside the laptop are the projects that shaped it.', // [PLACEHOLDER]
  // Grouped on the page by `group`, in the order they first appear. Newest first.
  career: [
    {
      group: 'Experience',
      period: '2024 — Now', // [PLACEHOLDER]
      org: 'Kearney',
      role: 'Business Analyst', // [PLACEHOLDER] your title
      text: '[PLACEHOLDER] My first full-time role: strategy and operations projects, from the first hypothesis tree to the final storyline.',
    },
    {
      group: 'Experience',
      period: '2023', // [PLACEHOLDER]
      org: 'Company A',
      role: 'Intern, Strategy', // [PLACEHOLDER]
      text: '[PLACEHOLDER] What I did and what I learned, in one or two sentences.',
    },
    {
      group: 'Experience',
      period: '2022', // [PLACEHOLDER]
      org: 'Company B',
      role: 'Intern', // [PLACEHOLDER]
      text: '[PLACEHOLDER]',
    },
    {
      group: 'Education & activities',
      period: '2019 — 2024', // [PLACEHOLDER]
      org: 'University name',
      role: 'B.A. Major', // [PLACEHOLDER]
      text: '[PLACEHOLDER] One line about what you studied.',
    },
    {
      group: 'Education & activities',
      period: '2021 — 2022', // [PLACEHOLDER]
      org: 'Strategy society name',
      role: 'Member', // [PLACEHOLDER] 학회
      text: '[PLACEHOLDER] Case competitions and consulting projects for real clients.',
    },
    {
      group: 'Education & activities',
      period: '2019 — 2023', // [PLACEHOLDER]
      org: 'Film · Photo · MIDI clubs',
      role: 'Member', // [PLACEHOLDER]
      text: '[PLACEHOLDER] Short films, darkroom nights and late-night music production: where the creative side of this site started.',
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
    {
      year: '2025',
      client: 'Industry, anonymised',
      title: 'Project title 4',
      tags: ['Tag'],
      summary: '[PLACEHOLDER] The answer in two sentences.',
      issueTree: {
        question: '[PLACEHOLDER] The key question?',
        branches: [
          { label: 'Branch 1', items: ['Sub-question', 'Sub-question'] },
          { label: 'Branch 2', items: ['Sub-question', 'Sub-question'] },
        ],
      },
      approach: ['[PLACEHOLDER] Step one', 'Step two', 'Step three'],
      impact: [
        { value: '00', label: 'what it measured' },
        { value: '00%', label: 'what it measured' },
      ],
    },
    {
      year: '2025',
      client: 'Industry, anonymised',
      title: 'Project title 5',
      tags: ['Tag'],
      summary: '[PLACEHOLDER] The answer in two sentences.',
      issueTree: {
        question: '[PLACEHOLDER] The key question?',
        branches: [
          { label: 'Branch 1', items: ['Sub-question', 'Sub-question'] },
          { label: 'Branch 2', items: ['Sub-question', 'Sub-question'] },
        ],
      },
      approach: ['[PLACEHOLDER] Step one', 'Step two', 'Step three'],
      impact: [
        { value: '00', label: 'what it measured' },
        { value: '00%', label: 'what it measured' },
      ],
    },
  ],
};

// ── VISUAL WORK ──────────────────────────────────────────────
// Images: drop files in assets/photos/film or assets/photos/digital
// and set `src` (e.g. 'assets/photos/film/01.jpg').
// Leave `src` empty to show a placeholder frame.
export const visual = {
  lead: 'Spin the globe and pick a place: film in New York, fashion film in Euljiro, digital on the road.', // [PLACEHOLDER]
  // Places on the globe. Click a pin and its photos spill out.
  // Photos: put files in assets/photos/<id>/ and set `src`, e.g. 'assets/photos/new-york/01.jpg'.
  // `ratio` (width / height) is only used for empty placeholders: 1.5 landscape, 0.667 portrait.
  // Add a place by copying a block; lat / lon are its coordinates.
  // `notes`: scanned scraps of my travel diary, mixed in with the photos.
  //   Put scans in assets/diary/ and set `src`. Without a scan, `text` is shown in a handwriting font.
  places: [
    {
      id: 'new-york',
      name: 'New York',
      lat: 40.71, lon: -74.0,
      kind: '35mm film',
      year: '2023',
      photos: [
        { src: 'assets/photos/new-york/01.jpg', caption: 'Still life, lighter', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/02.jpg', caption: 'Sunday sign', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/03.jpg', caption: 'Middle Village, Queens', ratio: 1.5 },
        { src: 'assets/photos/new-york/04.jpg', caption: '42 St, the dance', ratio: 1.5 },
        { src: 'assets/photos/new-york/05.jpg', caption: '42 St, the band', ratio: 1.5 },
        { src: 'assets/photos/new-york/06.jpg', caption: 'Diner window', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/07.jpg', caption: 'Chinatown, afternoon bench', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/08.jpg', caption: 'Billboard, golden hour', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/09.jpg', caption: 'Mott & Bayard', ratio: 1.5 },
        { src: 'assets/photos/new-york/10.jpg', caption: 'Reading in the blossoms', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/11.jpg', caption: 'Dusk, the gang', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/12.jpg', caption: 'Spring, Washington Square', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/13.jpg', caption: 'Denim on the fence', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/14.jpg', caption: 'Through the fence, the court', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/new-york/15.jpg', caption: 'Sideline', ratio: 1.5 }, // [CAPTION?]
      ],
      notes: [], // e.g. [{ src: 'assets/diary/new-york-1.jpg', date: '2023.05.02' }]
    },
    {
      id: 'seoul',
      name: 'Seoul · Euljiro',
      lat: 37.566, lon: 126.99,
      kind: 'Fashion film',
      year: '2024', // [PLACEHOLDER]
      photos: [
        { src: '', caption: 'Look 01', ratio: 0.667, tone: '#d9d9d6' },
        { src: '', caption: 'Look 02', ratio: 0.667, tone: '#dededa' },
        { src: '', caption: 'Printing alley', ratio: 1.5, tone: '#e3e6df' },
        { src: '', caption: 'Look 03', ratio: 0.667, tone: '#d6dcef' },
        { src: '', caption: 'Neon, 11pm', ratio: 1.5, tone: '#e0dce8' },
        { src: '', caption: 'Look 04', ratio: 0.667, tone: '#ece4dc' },
        { src: '', caption: 'Stairwell', ratio: 0.667, tone: '#d9e2e4' },
      ],
      notes: [], // e.g. [{ src: 'assets/diary/new-york-1.jpg', date: '2023.05.02' }]
    },
    {
      id: 'lisbon',
      name: 'Lisbon',
      lat: 38.72, lon: -9.14,
      kind: 'Digital',
      year: '2023', // [PLACEHOLDER]
      photos: [
        { src: '', caption: 'Lisbon tram', ratio: 1.5, tone: '#cfe0e6' },
        { src: '', caption: 'Hotel window', ratio: 0.8, tone: '#e3e6df' },
      ],
      notes: [], // e.g. [{ src: 'assets/diary/new-york-1.jpg', date: '2023.05.02' }]
    },
    {
      id: 'kyoto',
      name: 'Kyoto',
      lat: 35.01, lon: 135.77,
      kind: 'Digital',
      year: '2022', // [PLACEHOLDER]
      photos: [
        { src: '', caption: 'Kyoto rain', ratio: 0.8, tone: '#d6e1dc' },
        { src: '', caption: 'Shibuya crossing', ratio: 1.25, tone: '#dcd4e6' },
      ],
      notes: [],
    },
    {
      id: 'jeju',
      name: 'Jeju',
      lat: 33.5, lon: 126.53,
      kind: 'Digital',
      year: '2021', // [PLACEHOLDER]
      photos: [
        { src: '', caption: 'Jeju coast', ratio: 1.5, tone: '#dde3ea' },
        { src: '', caption: 'Desert road', ratio: 1.5, tone: '#f0e1c8' },
        { src: '', caption: 'Harbour', ratio: 1.25, tone: '#d9e2e4' },
      ],
      notes: [],
    },
  ],
  // Inspiration (section title on the Frames tab): the work and people I keep coming back to. One card = one thing I love,
  // whether it is a person, an album concept or a single music video.
  // `type` drives the filter. `image` / `works`: put files in assets/muses/ (credit the source!).
  // `url`: the original (artist site, YouTube…). Videos with a YouTube / Vimeo url play in place.
  // `instagram`: the artist's handle without @ (living artists only). Leave '' to hide it.
  musesNote: 'frames I keep coming back to',
  // Filter chips, in this order. Each card's `type` must be one of these.
  museTypes: [
    { type: 'Photographer', label: 'Photographers' },
    { type: 'Director', label: 'Directors' },
    { type: 'Video', label: 'Videos' },
    { type: 'Other artwork', label: 'Other Artwork' },
  ],
  muses: [
    {
      type: 'Photographer',
      title: '박영숙 Park Young-sook',
      credit: 'Photographer, Seoul',
      works: [], // e.g. ['assets/muses/park-young-sook-1.jpg', '...']
      why: '[PLACEHOLDER] Why her work stays with me.',
      url: '',
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#e6dccf',
    },
    {
      type: 'Photographer',
      title: 'Sylvester Mako', // [PLACEHOLDER] check the spelling
      credit: 'Photographer',
      works: [],
      why: '[PLACEHOLDER] Why this work stays with me.',
      url: '',
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#d7dfe3',
    },
    {
      type: 'Other artwork',
      title: 'Album name', // [PLACEHOLDER]
      credit: 'Artist · art direction by Studio',
      image: '',
      why: '[PLACEHOLDER] The colour, the styling, the whole world of it.',
      url: '',
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#e3d3e0',
    },
    {
      type: 'Video',
      title: 'Song title', // [PLACEHOLDER]
      credit: 'dir. Director name',
      image: '',
      why: '[PLACEHOLDER] The one shot I can’t forget.',
      url: '', // YouTube or Vimeo link
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#1d1d1d',
    },
    {
      type: 'Director',
      title: 'Director name', // [PLACEHOLDER]
      credit: 'Film / music video director',
      works: [],
      why: '[PLACEHOLDER]',
      url: '',
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#dcd4e6',
    },
    {
      type: 'Video',
      title: 'Another video', // [PLACEHOLDER]
      credit: 'dir. Director name',
      image: '',
      why: '[PLACEHOLDER]',
      url: '',
      instagram: '', // [PLACEHOLDER] e.g. 'handle'
      tone: '#2a2a2a',
    },
  ],
  // Moving pictures, below the globe. `url` can be a YouTube or Vimeo link.
  videos: [
    {
      title: 'Suncheon is Silent',
      year: '2025', // [PLACEHOLDER]
      role: 'Shot on a camcorder · music made in Ableton · edited in Movavi', // camcorder model to come
      url: 'https://youtu.be/a2JeC39Gv_U',
    },
    { title: 'Euljiro lookbook', year: '2024', role: 'Camera, edit', url: '' }, // [PLACEHOLDER]
    { title: 'Travel log — Lisbon', year: '2023', role: 'Shot on phone', url: '' }, // [PLACEHOLDER]
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
