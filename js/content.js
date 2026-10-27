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
    music: 'playing',
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
  tagline: 'Consultant by day; film, photography and music lover 24/7.',
  intro:
    'Hi, I’m Helen. I work on strategy problems with consulting teams, and spend the rest of my time with a camera, some headphones, or a guitar. This page is an archive of both sides.',
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
      role: 'Business Analyst · Full-time',
      text: 'Due diligence, market entry and cost work, hypothesis first. So far: power transformers, an indie K-beauty brand, the global drone market, semiconductor consumables and, right now, head-up displays in cars. A lot of expert calls along the way.',
    },
    {
      group: 'Experience',
      period: '2024 — 2025',
      org: 'Bain & Company, Seoul',
      role: 'Associate Consultant Trainee · Intern',
      text: 'Took apart how about ten bakery products get made, looking for costs to cut and steps to automate, and turned it into a growth story for a Korean food group.',
    },
    {
      group: 'Experience',
      period: '2024',
      org: 'Boston Consulting Group, Seoul',
      role: 'Research Assistant · Intern',
      text: 'Helped plan how a robotics startup would fit into a much larger company, and worked on C-suite pay and governance built on 50+ interviews.',
    },
    {
      group: 'Education & activities',
      period: '2021 — 2026',
      org: 'Yonsei University',
      role: 'Bachelor of Business Administration',
      text: 'GPA 4.21 / 4.30, academic honours in three semesters. I think I did everything a university lets you do, and somehow I still miss it.',
    },
    {
      group: 'Education & activities',
      period: '2023',
      org: 'New York University',
      role: 'Visiting Student',
      text: 'One spring, and it changed the plan. New York is where my love for film, photography and music really grew (the rolls are in [Frames](frames:new-york)). I left wanting to work there one day, and set on working or studying abroad.',
    },
    {
      group: 'Education & activities',
      period: '2023 — 2024',
      org: 'Global Management Track',
      role: 'Strategy club · VP of Public Relations',
      text: '15+ projects across turnarounds, valuations and market entry. Led three teams start to finish and was named Best Team Player. As PR lead, I made the recruiting videos.',
    },
    {
      group: 'Cool stuff',
      period: '2026',
      org: 'Kearney Vibe Coding Contest',
      role: '3rd Place',
      text: 'My first try at building with Claude: a map of the good places to eat near the office, made as a new joiner to share with coworkers. Even the CEO dropped a pin for a favourite spot. This site is the sequel.',
    },
    {
      group: 'Cool stuff',
      period: '2025',
      org: 'SM Entertainment',
      role: 'SM Biz Ent Class',
      text: 'Five weeks I signed up and paid for myself: artist development, making and distributing records, A&R, concert planning, then creative and visuals. The life of a K-pop release, in order.',
    },
  ],
  // the title bar of the laptop window
  projectsTitle: 'Projects at Kearney',
  // Inside the laptop: one brick object per project, with a label and a date.
  // Click one to read a few lines about it. `icon`: transformer · skincare · drone · probecard · hud
  // (drawn in js/bricks.js). `now: true` marks a project that is still running.
  projects: [
    {
      icon: 'transformer',
      label: 'CDD',
      period: 'Apr — May 2026',
      about: 'A Korean power transformer maker',
      text: 'Sales had dipped, and the question was whether they would come back. I built the root-cause tree, pressure-tested the likeliest stories in 15+ customer and market interviews, and landed on a clear view of the recovery and of what the customer and vendor contracts really allow.',
    },
    {
      icon: 'skincare',
      label: 'Go-to-Market',
      period: 'May 2026',
      about: 'An indie K-beauty skincare brand',
      text: 'I came up with the core story: a “third-generation K-beauty” winner. Experts backed it, and so did the data. I vibe-coded a scraper across three platforms to measure how fast each product was piling up reviews, a neat proxy for how fast people were falling for it.',
    },
    {
      icon: 'drone',
      label: 'Market Scan',
      period: 'Jun 2026',
      about: 'A global drone company',
      text: 'The global drone market had no clean map, so I drew one: players sorted by how integrated they are and what they actually sell. Then I tied the target’s assets, expansion path and position into one story of why its lead holds.',
    },
    {
      icon: 'probecard',
      label: 'Market Entry',
      period: 'Aug — Sep 2026',
      about: 'A Korean maker of semiconductor back-end consumables',
      text: 'Where could the technology go next? Quick technical deep dives across chip types, checked against expert calls, with a closer look at image sensors (CIS), the segment that mattered most.',
    },
    {
      icon: 'hud',
      label: 'Cost Analysis',
      period: 'Oct 2026 — Now',
      now: true,
      about: 'Head-up displays in cars',
      text: 'A light read of the HUD technology used in Greater China, then a handful of best-selling cars for each type of HUD, to see what goes into them and where the cost sits.',
    },
  ],
};

// ── VISUAL WORK ──────────────────────────────────────────────
// Images: drop files in assets/photos/film or assets/photos/digital
// and set `src` (e.g. 'assets/photos/film/01.jpg').
// Leave `src` empty to show a placeholder frame.
export const visual = {
  lead: 'Film in New York City, shoots and days in Seoul, a trip through Europe, nights out in Busan, the road in Mongolia, a short film in Suncheon. Pick up a pile.',
  // a taped note next to the title: the clubs where the visual side started (`instagram`: handle, no @)
  clubNote: {
    text: 'Always been a visuals person.',
    clubs: [
      { name: 'Yonyoung', what: 'Yonsei’s photography club', years: '2022 — 2023', instagram: '' }, // [PLACEHOLDER] handle
      { name: 'Prometheus', what: 'Yonsei’s film club', years: '2025', instagram: '' }, // [PLACEHOLDER] handle
    ],
  },
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
          // plays under the photos, like the Suncheon film
          videos: [
            { title: 'Now on the cover', role: 'One of these frames became the artwork for Heedo’s release. Have a listen.', url: 'https://www.youtube.com/watch?v=sx7W70uH2VE' },
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
  // Every card is a person. Their favourite works hang off the card: `works` (images) and
  // `videos` (films that play in place). Filter chips, in this order. A card's `type` is one
  // of these, or a list of them (e.g. ['Photographer', 'Director']) to show under both.
  museTypes: [
    { type: 'Photographer', label: 'Photographers' },
    { type: 'Director', label: 'Directors' },
    { type: 'Artist', label: 'Artists' },
  ],
  muses: [
    {
      type: 'Photographer',
      title: '박현경 Park Hyunkyung', // [CHECK] romanisation
      credit: 'Photographer · KiiiKiii’s first two albums',
      works: [], // e.g. ['assets/muses/park-hyunkyung-1.jpg', '...']
      why: 'Picked by KiiiKiii’s creative director Haewon Jung (@byheyone), and a Joel Meyerowitz fan. Flipping through the KiiiKiii photo books on the way to work makes for the best kind of morning. I want to capture people like that: entirely themselves, only cheekier and more sparkling.',
      url: 'https://m.singleskorea.com/culture/2026/02/720835',
      instagram: 'hiozoik',
      tone: '#e6dccf',
    },
    {
      type: 'Photographer',
      title: 'Szilveszter Makó',
      credit: 'Photographer · Hollywood’s current favourite',
      works: [],
      why: 'A classic, analog mood all of its own, dreamy without ever being obvious. Fantastical techniques that never feel like a trick. I found the work in an issue of Numéro I bought for Cho Gi-seok’s photos (@chogiseok), “bought the dip” in 2023, and it has only gone up since. Called it.',
      url: '',
      instagram: 'szilvesztermako',
      tone: '#d7dfe3',
    },
    {
      type: 'Photographer',
      title: 'Saul Leiter',
      credit: 'Photographer, New York · 1923 — 2013',
      works: ['assets/muses/saul-leiter.jpg'],
      why: 'I saw his show in 2021. How could anyone not fall in love? Colour film at its most charming. Black and white is beautiful, but he kept shooting colour long before anyone took it seriously. I want to look at a city the way he did.',
      url: 'https://www.saulleiterfoundation.org',
      instagram: '',
      tone: '#d9cdb8',
    },
    {
      type: 'Photographer',
      title: '윤송이 Yoon Songi', // [CHECK] romanisation
      credit: 'Photographer, Seoul',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: 'songgge',
      tone: '#e9dfe0',
    },
    {
      type: 'Photographer',
      title: 'Annie Chung',
      credit: 'Photographer · lifeimages film · worked with KiiiKiii',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '', // [PLACEHOLDER] handle
      tone: '#e4dfd6',
    },
    {
      type: ['Photographer', 'Director'],
      title: '이혜인 Lee Hyein', // [CHECK] romanisation
      credit: 'Photographer · music video director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '2eehyein',
      tone: '#dfe3dc',
    },
    {
      type: 'Photographer',
      title: 'Richard Avedon',
      credit: 'Photographer · In the American West',
      works: [],
      why: '', // [PLACEHOLDER] In the American West is the one
      url: '',
      instagram: '',
      tone: '#e8e8e6',
    },
    {
      type: 'Photographer',
      title: 'Josef Koudelka',
      credit: 'Photographer · Magnum',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '',
      tone: '#d6d6d4',
    },
    {
      type: 'Director',
      title: 'Denis Villeneuve',
      credit: 'Film director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '',
      tone: '#d9d2c4',
    },
    {
      type: 'Director',
      title: 'Wim Wenders',
      credit: 'Film director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '',
      tone: '#d3dbe0',
    },
    {
      type: 'Director',
      title: 'Rimayoon',
      credit: 'Music video director · Legend Film',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      // each one gets its own ▶ button on the back of the card
      videos: [
        { title: 'Jeon Somi — EXTRA', url: 'https://www.youtube.com/watch?v=zq5mr3ePY1I' },
        { title: 'Hearts2Hearts — The Chase', url: 'https://www.youtube.com/watch?v=kxUA2wwYiME' },
      ],
      instagram: '', // [PLACEHOLDER] handle
      tone: '#2a2a2a',
    },
    {
      type: 'Director',
      title: '송민규 Song Mingyu', // [CHECK] romanisation
      credit: 'Music video director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      videos: [{ title: 'FILM KAI', url: 'https://www.youtube.com/watch?v=VjjKbrFJoxY' }],
      instagram: '', // [PLACEHOLDER] handle
      tone: '#262626',
    },
    {
      type: 'Director',
      title: '노상윤 Roh Sangyun', // [CHECK] romanisation
      credit: 'Music video director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '', // [PLACEHOLDER] handle
      tone: '#dcd4e6',
    },
    {
      type: 'Director',
      title: '신희원 Shin Heewon', // [CHECK] romanisation
      credit: 'Music video director',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '', // [PLACEHOLDER] handle
      tone: '#e3d3e0',
    },
    {
      type: 'Artist',
      title: '고태호 Ko Taeho', // [CHECK] romanisation
      credit: 'Webtoon artist · 당신의 과녁',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '', // [PLACEHOLDER] handle
      tone: '#e2dccf',
    },
    {
      type: 'Artist',
      title: '조은영 Cho Eunyoung', // [CHECK] romanisation
      credit: 'Webtoon artist · 저궤도인간',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '', // [PLACEHOLDER] handle
      tone: '#d5dde6',
    },
    {
      type: 'Artist',
      title: 'Karel Martens',
      credit: 'Graphic designer, the Netherlands',
      works: [],
      why: '', // [PLACEHOLDER]
      url: '',
      instagram: '',
      tone: '#e7e1d2',
    },
    {
      type: 'Artist',
      title: 'Gawx',
      credit: 'Video artist · YouTube',
      works: [],
      why: 'Every trip comes out nostalgic, in exactly the colours I love, and the music is always the right pick.',
      url: 'https://www.youtube.com/@Gawx2',
      instagram: '',
      tone: '#e6d9c8',
    },
  ],
};

// ── MUSIC ────────────────────────────────────────────────────
// Covers: put images in assets/albums and set `cover`.
export const music = {
  lead: 'Albums I keep coming back to, the songs I play on repeat, and the bands I’ve sung in.',
  // 10 records, 5 per ledge. Covers are found automatically (iTunes, then Deezer) from
  // the artist + title; `itunes` holds extra search hints. If a cover comes out wrong,
  // paste the album's Spotify link into `spotify` (Share → Copy link) and that one is used.
  albums: [
    {
      title: 'Call Me Baby',
      artist: 'EXO',
      year: '2015',
      color: '#d9d4cc', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['엑소'], titles: ['EXODUS', 'The 2nd Album EXODUS'], country: 'kr' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: '恋人へ (For Lovers)',
      artist: 'Lamp',
      year: '2004',
      color: '#e8dccb', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { titles: ['恋人へ', 'Koibito e'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'When the Pawn...',
      artist: 'Fiona Apple',
      year: '1999',
      color: '#c94f3d', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { titles: ['When the Pawn'] },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: '여정 (旅程)',
      artist: 'Casker',
      year: '2012',
      color: '#7a8b6f', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['캐스커'], titles: ['여정', '旅程'], country: 'kr' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'CAPRISONGS',
      artist: 'FKA twigs',
      year: '2022',
      color: '#e3d3e0', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Ego Death',
      artist: 'The Internet',
      year: '2015',
      color: '#2f4cff', // used until the official cover loads
      spotify: 'https://open.spotify.com/album/69g3CtOVg98TPOwqmI2K7Q', // the orange cover
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Wet Land',
      artist: 'Hiroshi Yoshimura',
      year: '1993',
      color: '#cfe0e6', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['吉村弘'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Aja',
      artist: 'Steely Dan',
      year: '1977',
      color: '#111111', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: {  },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'Love Trip',
      artist: 'Takako Mamiya',
      year: '1982',
      color: '#f0d2c2', // used until the official cover loads
      spotify: '', // optional: https://open.spotify.com/album/…
      itunes: { artists: ['間宮貴子'], country: 'jp' },
      why: '', // [PLACEHOLDER] one line on why
      tracks: [], // favourite tracks, coming later: { name: '...', why: '...' }
    },
    {
      title: 'WhyKiiiKiii',
      artist: 'KiiiKiii',
      year: '2026',
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
    label: 'On repeat',
    note: 'Pick a side', // the small line next to the title
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
  // Newest first. `stars`: 1–5, punched into the stub. `memo`: the back of the ticket, keep it short.
  tickets: [
    { type: 'Festival', name: 'Incheon Pentaport Rock Festival', lineup: 'Massive Attack · Jang Pil-soon · HYUKOH', date: '2026.08.01', venue: 'Songdo Moonlight Festival Park', city: 'Incheon', color: '#e2492f', stars: 3, memo: 'Massive Attack: no festival mood, but maybe that is what rock is, protest through music. Jang Pil-soon was lovely. Still sad I missed The Jesus and Mary Chain.' },
    { type: 'Festival', name: 'DMZ Peace Train Music Festival', lineup: 'Effie · Sailor Honeymoon · Nourished by Time · The Volunteers', date: '2026.06.13', venue: 'Goseokjeong', city: 'Cheorwon', color: '#3d6b48', stars: 5, memo: 'A whole day with strangers from the festival app, better for it. Effie at night was unreal. Ramen at dawn, a fountain in the middle of it all. Born for this one.' },
    { type: 'Festival', name: 'Busan International Rock Festival', lineup: 'The Smashing Pumpkins · MIKA · Porter Robinson', date: '2025.09.27 — 28', venue: 'Samnak Ecological Park', city: 'Busan', color: '#1f3a5f', stars: 5, memo: 'Rain turned it to mud and we danced anyway. MIKA right in front of me, pure energy. Everyone dancing to Tokyo Ska Paradise Orchestra: perfect.' },
    { type: 'Concert', name: 'Yaeji — With A Hammer Asia Tour', lineup: 'Live in Seoul', date: '2025.08.25', venue: 'Bluesquare SOL Travel Hall', city: 'Seoul', color: '#cdb4db', stars: 2, memo: 'Not quite what I hoped. The staging fell flat, or maybe it was just my seat at the back.' },
    { type: 'Festival', name: 'Asian Pop Festival', lineup: 'Lamp · Y2K92 · Yogee New Waves · mindfreakk', date: '2025.06.22', venue: 'Paradise City', city: 'Incheon', color: '#f2c14e', stars: 5, memo: 'Lamp, back in Korea after almost ten years. My favourite album, live, right there.' },
    { type: 'Concert', name: 'Coldplay — Music of the Spheres World Tour', lineup: 'Live in Korea', date: '2025.04.25', venue: 'Goyang Stadium', city: 'Goyang', color: '#2f4cff', stars: 4, memo: 'The new songs aren’t for me, the old ones are. Grown men singing Yellow at the piano got me. Obvious love songs, and I took them anyway.' },
    { type: 'Concert', name: 'Olivia Rodrigo — GUTS World Tour', lineup: 'Live in Seoul', date: '2024.09.21', venue: 'Jamsil Indoor Stadium', city: 'Seoul', color: '#7d4bb3', stars: 4, memo: 'A pop star, impossibly pretty. Went with friends and danced the whole way through.' },
    { type: 'Festival', name: 'Incheon Pentaport Rock Festival', lineup: 'The Strokes · Silica Gel · 250', date: '2023.08.05', venue: 'Songdo Moonlight Festival Park', city: 'Incheon', color: '#111111', stars: 4, memo: 'Here for The Strokes. Julian came on tipsy, sang one song three times, no Ode to the Mets. Silica Gel’s Desert Eagle was huge; raved to 250 at midnight.' },
    { type: 'Concert', name: 'Hiatus Kaiyote', lineup: 'Live in Brooklyn', date: '2023.04.29', venue: 'Brooklyn Steel', city: 'New York', color: '#d9643a', stars: 3, memo: 'One of my most New York nights. Brooklyn at its truest, in a crowd of wonderful weirdos.' },
    { type: 'Concert', name: 'Billy Joel', lineup: 'Live at The Garden', date: '2023.03.26', venue: 'Madison Square Garden', city: 'New York', color: '#b0413e', stars: 5, memo: 'Exchange semester, slow to settle in. Then the song I needed: “But I’m taking a Greyhound on the Hudson River Line.” New York finally felt real.' },
  ],
  stage: {
    intro: 'In college I was a band nomad: science, then business, then engineering. Only one of those is my major. I sang in all three.',
    soundcloud: '', // optional: a SoundCloud link shows a button at the bottom
    // Newest first. `next`: an upcoming show, highlighted. `instagram`: the band's handle, without @.
    performances: [
      { title: 'Hwalchun', sub: 'Based in the College of Engineering', date: '2025 — Now', role: 'Vocals · two concerts and the Yonsei festival stage', next: '2026.11.21, the third performance', instagram: 'hwalchun' },
      { title: 'Odo', sub: 'Based in the School of Business, Class 5', date: '2023 — 2025', role: 'Vocals · two concerts', instagram: 'band_odoyonsei' },
      { title: 'Puruni', sub: 'Based in the Colleges of Science and Life Sciences', date: '2021 — 2022', role: 'Vocals and guitar · one busking set, one concert', instagram: 'ys_puruni' },
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
    { value: '~5.4k', label: 'lines of code, none typed by me' },
    { value: '100+', label: 'commits' },
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
