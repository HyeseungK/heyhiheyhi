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
    // { name: 'Red', hex: '#f22b1f' },
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
    'I like turning messy questions into clear decisions: start with a hypothesis, then go and ask the people who know. Below is the path so far, and inside the laptop are the industries I’ve been living in.',
  // Grouped on the page by `group`, in the order they first appear. Newest first.
  career: [
    {
      group: 'Experience',
      period: '2026 — Now',
      org: 'Kearney, Seoul',
      role: 'Business Analyst',
      text: 'Due diligence and market entry, hypothesis first. So far: semiconductor consumables, power transformers, an indie K-beauty brand and the global drone market, with a lot of expert calls along the way.',
    },
    {
      group: 'Experience',
      period: '2024 — 2025',
      org: 'Bain & Company, Seoul',
      role: 'Associate Consultant Trainee',
      text: 'Took apart how about ten bakery products get made, looking for costs to cut and steps to automate, and turned it into a growth story for a Korean food group.',
    },
    {
      group: 'Experience',
      period: '2024',
      org: 'Boston Consulting Group, Seoul',
      role: 'Research Assistant',
      text: 'Helped plan how a robotics startup would fit into a much larger company, and worked on C-suite pay and governance built on 50+ interviews.',
    },
    {
      group: 'Education & activities',
      period: '2021 — 2026',
      org: 'Yonsei University',
      role: 'Bachelor of Business Administration',
      text: 'GPA 4.21 / 4.30, academic honours in three semesters.',
    },
    {
      group: 'Education & activities',
      period: '2023',
      org: 'New York University',
      role: 'Visiting Student',
      text: 'A spring in New York: supply chains and accounting by day, the film rolls you’ll find in Frames by night.',
    },
    {
      group: 'Education & activities',
      period: '2023 — 2024',
      org: 'Global Management Track',
      role: 'Strategy club · VP of Public Relations',
      text: '15+ projects across turnarounds, valuations and market entry. Led three teams start to finish and was named Best Team Player. As PR lead, I made the recruiting videos.',
    },
    {
      group: 'Education & activities',
      period: 'Yonsei',
      org: 'Prometheus · Yonyoung',
      role: 'Film and photography clubs',
      text: 'Where the creative side of this site started.',
    },
    {
      group: 'Also',
      period: '2026',
      org: 'Kearney Vibe Coding Contest',
      role: 'Winner',
      text: 'Built and shipped web apps by talking to Claude. This site is the sequel.',
    },
  ],
  // Inside the laptop: one brick object and a short label per project, nothing more.
  // `icon`: transformer · skincare · probecard · drone · hud (drawn in js/bricks.js).
  // `label`: the hint shown under the object. `about`: read aloud to screen readers only.
  projects: [
    { icon: 'transformer', label: 'Due Diligence', about: 'Power transformer manufacturer' },
    { icon: 'skincare', label: 'Investment Thesis', about: 'Indie K-beauty skincare brand' },
    { icon: 'probecard', label: 'Market Entry', about: 'Semiconductor back-end consumables' },
    { icon: 'drone', label: 'Market Mapping', about: 'Global drone market' },
    { icon: 'hud', label: 'Growth Strategy', about: 'Automotive head-up displays' }, // [PLACEHOLDER] label
  ],
};

// ── VISUAL WORK ──────────────────────────────────────────────
// Images: drop files in assets/photos/film or assets/photos/digital
// and set `src` (e.g. 'assets/photos/film/01.jpg').
// Leave `src` empty to show a placeholder frame.
export const visual = {
  lead: 'Film in New York City, shoots and days in Seoul, a trip through Europe, nights out in Busan, the road in Mongolia, a short film in Suncheon. Pick up a pile.',
  // Places on the globe. Click a pin and its photos spill out.
  // Photos: put files in assets/photos/<id>/ and set `src`, e.g. 'assets/photos/new-york/01.jpg'.
  // `ratio` (width / height) is only used for empty placeholders: 1.5 landscape, 0.667 portrait.
  // Add a place by copying a block; lat / lon are its coordinates.
  // `cover`: the photo that sits on top of the pile (defaults to the first).
  // Places with no real photo (`src`) or video yet are left off the table.
  // `notes`: scanned scraps of my travel diary, mixed in with the photos.
  //   Put scans in assets/diary/ and set `src`. Without a scan, `text` is shown in a handwriting font.
  places: [
    {
      id: 'new-york',
      cover: 'assets/photos/new-york/01.jpg',
      name: 'New York City',
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
      name: 'Seoul',
      lat: 37.566, lon: 126.99,
      // Seoul is organised by project rather than by neighbourhood.
      projects: [
        {
          title: 'The Closet',
          cover: 'assets/photos/seoul/the-closet/08.jpg',
          kind: 'Fashion shoot · Euljiro',
          year: '2025',
          credit: '', // e.g. 'Photography by Helen · Styling by …'
          photos: [
            { src: 'assets/photos/seoul/the-closet/01.jpg', caption: 'The Closet 01', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/02.jpg', caption: 'The Closet 02', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/03.jpg', caption: 'The Closet 03', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/04.jpg', caption: 'The Closet 04', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/05.jpg', caption: 'The Closet 05', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/06.jpg', caption: 'The Closet 06', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/07.jpg', caption: 'The Closet 07', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/08.jpg', caption: 'The Closet 08', ratio: 0.666 },
            { src: 'assets/photos/seoul/the-closet/09.jpg', caption: 'The Closet 09', ratio: 1.5 },
            { src: 'assets/photos/seoul/the-closet/10.jpg', caption: 'The Closet 10', ratio: 0.666 },
          ],
          notes: [],
        },
        {
          title: 'Heedo’s Album',
          cover: 'assets/photos/seoul/heedos-album/03.jpg',
          kind: '35mm film · portraits',
          year: '2025',
          credit: '',
          photos: [
            { src: 'assets/photos/seoul/heedos-album/01.jpg', caption: 'Heedo 01', ratio: 1.508 },
            { src: 'assets/photos/seoul/heedos-album/02.jpg', caption: 'Heedo 02', ratio: 1.508 },
            { src: 'assets/photos/seoul/heedos-album/03.jpg', caption: 'Heedo 03', ratio: 1.508 },
            { src: 'assets/photos/seoul/heedos-album/04.jpg', caption: 'Heedo 04', ratio: 1.508 },
            { src: 'assets/photos/seoul/heedos-album/05.jpg', caption: 'Heedo 05', ratio: 0.663 },
          ],
          notes: [],
        },
        {
          title: 'My Kind of Woman',
          cover: 'assets/photos/seoul/my-kind-of-woman/07.jpg',
          kind: '35mm film · portraits',
          year: '2023 — 2025',
          credit: '',
          photos: [
            { src: 'assets/photos/seoul/my-kind-of-woman/01.jpg', caption: 'Ok Jiwon 1', year: '2024', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/02.jpg', caption: 'Hyemin 1', year: '2024', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/03.jpg', caption: 'Hyemin & Hyomin', year: '2024', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/04.jpg', caption: 'Hyemin 2', year: '2025', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/05.jpg', caption: 'Hyemin 3', year: '2025', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/06.jpg', caption: 'Ok Jiwon 2', year: '2024', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/07.jpg', caption: 'Michelle 1', year: '2025', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/08.jpg', caption: 'Jieun', year: '2023', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/09.jpg', caption: 'Michelle 2', year: '2023', ratio: 1.508 },
            { src: 'assets/photos/seoul/my-kind-of-woman/10.jpg', caption: 'Freda', year: '2023', ratio: 0.663 },
          ],
          notes: [],
        },
        {
          title: 'Daily Life',
          cover: 'assets/photos/seoul/daily-life/06.jpg',
          kind: '35mm film',
          year: '2023 — Now',
          credit: '',
          photos: [
            { src: 'assets/photos/seoul/daily-life/01.jpg', caption: 'Bukchon, N Tower in the back', ratio: 0.663 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/02.jpg', caption: 'Brick wall, long shadow', ratio: 0.663 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/03.jpg', caption: 'Peace signs, neon', ratio: 1.508 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/04.jpg', caption: 'Flowers after graduation', ratio: 1.508 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/05.jpg', caption: 'Dance shoes in the window', ratio: 1.508 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/06.jpg', caption: 'Bus stop, blur', ratio: 0.663 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/07.jpg', caption: 'Mirror, before going out', ratio: 0.663 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/08.jpg', caption: 'Underground, emart24', ratio: 1.508 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/09.jpg', caption: 'Three on a walk', ratio: 1.508 }, // [CAPTION?]
            { src: 'assets/photos/seoul/daily-life/10.jpg', caption: 'Carnival, night', ratio: 0.663 }, // [CAPTION?]
          ],
          notes: [],
        },
      ],
    },
    {
      id: 'europe',
      name: 'Europe',
      year: '2026',
      kind: 'Digital',
      onePile: true, // London and Barcelona share one pile
      cover: 'assets/photos/europe/london/04.jpg',
      lat: 48.86, lon: 2.35,
      // one trip through Europe: each city is a project
      projects: [
        {
          title: 'London',
          kind: 'Digital',
          year: '2026',
          credit: '',
          photos: [
            { src: 'assets/photos/europe/london/01.jpg', caption: 'St Thomas Street, rain', ratio: 1.333 }, // [CAPTION?]
            { src: 'assets/photos/europe/london/02.jpg', caption: 'Dinner at home', ratio: 0.75 }, // [CAPTION?]
            { src: 'assets/photos/europe/london/03.jpg', caption: 'Coffee in the sun', ratio: 1.333 }, // [CAPTION?]
            { src: 'assets/photos/europe/london/04.jpg', caption: 'Whitehall, blue hour', ratio: 1.333 }, // [CAPTION?]
            { src: 'assets/photos/europe/london/05.jpg', caption: 'Supper, hands up', ratio: 0.75 }, // [CAPTION?]
          ],
          notes: [],
        },
        {
          title: 'Barcelona',
          kind: 'Digital',
          year: '2026',
          credit: '',
          photos: [
            { src: 'assets/photos/europe/barcelona/01.jpg', caption: 'Sagrada Família, looking up', ratio: 0.75 }, // [CAPTION?]
            { src: 'assets/photos/europe/barcelona/02.jpg', caption: 'Hostel friends', ratio: 0.75 }, // [CAPTION?]
            { src: 'assets/photos/europe/barcelona/03.jpg', caption: 'Waiting outside BLESSED', ratio: 1.333 }, // [CAPTION?]
            { src: 'assets/photos/europe/barcelona/04.jpg', caption: 'One on one', ratio: 0.75 }, // [CAPTION?]
          ],
          notes: [],
        },
      ],
    },
    {
      id: 'busan',
      cover: 'assets/photos/busan/04.jpg',
      name: 'Busan',
      lat: 35.18, lon: 129.08,
      kind: 'Nights out',
      year: '2025',
      photos: [
        { src: 'assets/photos/busan/01.jpg', caption: 'Before the set', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/02.jpg', caption: 'Night shift', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/03.jpg', caption: 'Leftover cups', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/04.jpg', caption: 'Crosswalk, after work', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/05.jpg', caption: 'Smoke break', ratio: 0.666 }, // [CAPTION?]
        { src: 'assets/photos/busan/06.jpg', caption: 'Peace, after the set', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/07.jpg', caption: 'Outside Haneum Media', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/08.jpg', caption: 'On the floor', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/busan/09.jpg', caption: 'The DJ', ratio: 1.5 }, // [CAPTION?]
      ],
      notes: [],
    },
    {
      id: 'mongolia',
      name: 'Mongolia',
      lat: 47.92, lon: 106.92,
      kind: 'Digital',
      year: '2025',
      photos: [
        { src: 'assets/photos/mongolia/01.jpg', caption: 'Ger camp, pink dusk', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/mongolia/02.jpg', caption: 'Fire, late night', ratio: 0.666 }, // [CAPTION?]
        { src: 'assets/photos/mongolia/03.jpg', caption: 'Inside the monastery', ratio: 0.666 }, // [CAPTION?]
        { src: 'assets/photos/mongolia/04.jpg', caption: 'Rain, gas stop', ratio: 1.5 }, // [CAPTION?]
        { src: 'assets/photos/mongolia/05.jpg', caption: 'Boat on the lake', ratio: 1.5 }, // [CAPTION?]
      ],
      notes: [],
    },
    {
      id: 'suncheon',
      name: 'Suncheon',
      lat: 34.95, lon: 127.49,
      kind: 'Film · video',
      year: '2025', // [PLACEHOLDER]
      photos: [],
      // films play in place when the pin opens. `url`: YouTube or Vimeo
      videos: [
        {
          title: 'Suncheon is Silent',
          role: 'Shot on a camcorder · music made in Ableton · edited in Movavi', // camcorder model to come
          url: 'https://youtu.be/a2JeC39Gv_U',
        },
      ],
      notes: [],
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
};

// ── MUSIC ────────────────────────────────────────────────────
// Covers: put images in assets/albums and set `cover`.
export const music = {
  lead: 'Albums I keep coming back to, and a CD I burned myself. Pull a record off the rack; the guitar knows where I’ve played.',
  // 10 records, 5 per ledge. Covers are found automatically (iTunes, then Deezer) from
  // the artist + title; `itunes` holds extra search hints. If a cover comes out wrong,
  // paste the album's Spotify link into `spotify` (Share → Copy link) and that one is used.
  albums: [
    {
      title: 'Call Me Baby',
      artist: 'EXO',
      year: '2015', // [CHECK]
      color: '#d9d4cc', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['엑소'], titles: ['EXODUS', 'The 2nd Album EXODUS'], country: 'kr' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: '恋人へ (For Lovers)',
      artist: 'Lamp',
      year: '2004', // [CHECK]
      color: '#e8dccb', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { titles: ['恋人へ', 'Koibito e'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'When the Pawn...',
      artist: 'Fiona Apple',
      year: '1999', // [CHECK]
      color: '#c94f3d', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { titles: ['When the Pawn'] },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: '여정 (旅程)',
      artist: 'Casker',
      year: '2008', // [CHECK]
      color: '#7a8b6f', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['캐스커'], titles: ['여정', '旅程'], country: 'kr' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'CAPRISONGS',
      artist: 'FKA twigs',
      year: '2022', // [CHECK]
      color: '#e3d3e0', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Ego Death',
      artist: 'The Internet',
      year: '2015', // [CHECK]
      color: '#2f4cff', // used until the official cover loads
      spotify: 'https://open.spotify.com/album/69g3CtOVg98TPOwqmI2K7Q', // the orange cover
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Wet Land',
      artist: 'Hiroshi Yoshimura',
      year: '1993', // [CHECK]
      color: '#cfe0e6', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['吉村弘'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Aja',
      artist: 'Steely Dan',
      year: '1977', // [CHECK]
      color: '#111111', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Love Trip',
      artist: 'Takako Mamiya',
      year: '1982', // [CHECK]
      color: '#f0d2c2', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['間宮貴子'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'WhyKiiiKiii',
      artist: 'KiiiKiii',
      year: '2025', // [CHECK]
      color: '#f2f0ea', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['키키'], country: 'kr' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
  ],
  // The burned CD. `side`: 'analog' or 'modern' — names in `sides`.
  // Artwork, previews, album and year are found automatically; add `spotify: 'https://open.spotify.com/…'`
  // to pin a cover, or `album` / `year` to override what was found.
  mixtape: {
    label: 'Favorite Songs',
    note: '2026 · for whoever is listening', // [PLACEHOLDER] the small scribble under the title
    sides: { analog: 'Side A · Analog', modern: 'Side B · Modern' },
    songs: [
      { artist: 'Brian Eno', title: 'By This River', side: 'analog', itunes: { titles: ['By This River'] } },
      { artist: 'Mitski', title: 'First Love / Late Spring', side: 'analog', itunes: {  } },
      { artist: 'The Beatles', title: 'Hey Jude', side: 'analog', spotify: 'https://open.spotify.com/album/7vEJAtP3KgKSpOHVgwm3Eh', itunes: {  } },
      { artist: 'Caetano Veloso', title: 'Pecado', side: 'analog', itunes: { country: 'br' } },
      { artist: 'Milton Nascimento', title: 'Cais', side: 'analog', itunes: { country: 'br' } },
      { artist: 'Masayoshi Takanaka', title: 'Beleza Pula', side: 'analog', spotify: 'https://open.spotify.com/album/0zXeZw0oFC2Db99RqlfHur', itunes: { artists: ['高中正義'], country: 'jp' } },
      { artist: 'Yusef Lateef', title: 'Love Theme from Spartacus', side: 'analog', itunes: { titles: ['Love Theme'] } },
      { artist: 'The Strokes', title: 'Ode to the Mets', side: 'analog', album: 'The New Abnormal', year: '2020', itunes: {  } },
      { artist: 'Billy Joel', title: 'Vienna', side: 'analog', itunes: {  } },
      { artist: 'Cortex', title: 'Poxa', side: 'analog', album: 'Cortex, Vol. 2', year: '1977', itunes: {} },
      { artist: 'Daniel Caesar', title: 'Who Knows', side: 'analog', itunes: {  } },
      { artist: 'Slom', title: '아니라고', side: 'modern', spotify: 'https://open.spotify.com/album/7fovUQYXBmAfq8FGN8eEzm', itunes: { artists: ['슬롬'], country: 'kr' } },
      { artist: 'Four Tet', title: '31 Bloom', side: 'modern', itunes: {  } },
      { artist: 'NMIXX', title: 'Phoenix', side: 'modern', itunes: { artists: ['엔믹스'], country: 'kr' } },
      { artist: 'capsule', title: 'I Wish You', side: 'modern', spotify: 'https://open.spotify.com/track/3cUNYZbxke9SvwvsayCNvx', itunes: { country: 'jp' } },
      { artist: 'Perfume', title: '575', side: 'modern', itunes: { country: 'jp' } },
      { artist: 'House Rulez', title: 'House', side: 'modern', spotify: 'https://open.spotify.com/album/3YgAlfZsB8TBpUxh0mwoJj', itunes: { artists: ['하우스룰즈'], country: 'kr' } },
      { artist: 'Jeebanoff', title: '낯선 사람', side: 'modern', spotify: 'https://open.spotify.com/album/0Z91ePA53qNIvmafwpBDQK', itunes: { artists: ['지바노프'], country: 'kr' } },
      { artist: 'Blood Orange', title: 'Augustine', side: 'modern', itunes: {  } },
    ],
  },
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

// ── HOW THIS WAS MADE ────────────────────────────────────────
// Opens from the link next to Email / LinkedIn / Instagram.
export const colophon = {
  title: 'How This Was Made',
  lead:
    'This site was built over two days of conversation. I described what I wanted, mostly in Korean and half in feelings, and Claude Code wrote, tested and shipped every line. I steered; it built.',
  stats: [
    { value: '2', label: 'days' },
    { value: '~5k', label: 'lines of code, none typed by me' },
    { value: '70+', label: 'commits' },
    { value: '73', label: 'photos from my own rolls' },
  ],
  sections: [
    {
      title: 'The conversation',
      body: [
        'No mockups, no Figma. Just messages like “this guitar looks so dumb”, “more chic”, or “the shelf looks empty”.',
        'Every round went the same way: I sent screenshots and opinions, Claude Code changed the code, opened the site in a headless browser, looked at its own screenshots, fixed what it did not like, and pushed to GitHub.',
        'Some ideas were mine (a business card that flips, a guitar you can throw at the record rack). Some were its suggestions I kept (a loupe on a contact sheet, the ticket book). A few we built and then threw away, like a globe of pins that turned out too sparse.',
      ],
    },
    {
      title: 'The stack',
      items: [
        ['Three.js', 'the particle name on the home screen (a custom shader), the brick guitar, amp and icons'],
        ['GSAP + ScrollTrigger', 'every scroll, flip, fan-out and spin'],
        ['Canvas 2D', 'the pixel and ripple page transitions'],
        ['Web Audio', 'the guitar chord, synthesised string by string (Karplus–Strong)'],
        ['Plain HTML, CSS, JS', 'no framework and no build step; hosted on GitHub Pages'],
      ],
    },
    {
      title: 'The data',
      items: [
        ['iTunes Search · Deezer · Spotify · MusicBrainz', 'official album covers, 30-second previews, album names and years'],
        ['GitHub Actions', 'a small bot that looks the covers up and saves them into the repo whenever the music list changes'],
        ['js/content.js', 'every word, photo and song on the site lives in one file'],
      ],
    },
    {
      title: 'The skills',
      body: [
        'Claude Code loaded design “skills”, short playbooks for specific crafts: threejs-webgl, gsap-scrolltrigger and modern-web-design from freshtechbro/claudedesignskills, plus p5js and algorithmic-art for the generative bits.',
        'Playwright took the test screenshots; Pillow resized my film scans.',
      ],
    },
  ],
  signoff: 'Designed in conversation by Helen. Built by Claude Code.',
};
