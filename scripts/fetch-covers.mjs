// Finds the official artwork (and 30-second previews) for every album and song in
// js/content.js and saves them into the repo, so the site never depends on a live
// lookup. Runs in GitHub Actions (.github/workflows/covers.yml); locally:
//
//   node scripts/fetch-covers.mjs
//
// Writes assets/albums/<slug>.jpg, assets/songs/<slug>.jpg and assets/albums/covers.json.
// Items that already have a saved file are skipped; delete the file to look it up again.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { music } = await import(path.join(root, 'js/content.js'));
const manifestPath = path.join(root, 'assets/albums/covers.json');

const norm = (s = '') => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');
const matches = (a, b) => {
  const x = norm(a), y = norm(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = [];
const log = (line) => { report.push(line); console.log(line); };

// polite fetch: per-host spacing, retries on rate limits (HTTP 403/429/503, Deezer quota errors)
const lastCall = {};
const GAP = { 'open.spotify.com': 300, 'itunes.apple.com': 3200, 'api.deezer.com': 250, 'musicbrainz.org': 1100 };
async function getJSON(url) {
  const host = new URL(url).host;
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = (lastCall[host] || 0) + (GAP[host] || 500) - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall[host] = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'helen-site-covers/1.0 (github.com/HyeseungK/heyhiheyhi)', Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data?.error?.code === 4) { await sleep(5000); continue; } // Deezer quota
        return data;
      }
      log(`  ${host} → HTTP ${res.status}`);
      if (![403, 429, 500, 502, 503].includes(res.status)) return null;
    } catch (e) {
      log(`  ${host} → ${e.message}`);
    }
    await sleep(4000 * (attempt + 1));
  }
  return null;
}

function pick(rows, q, artistOf, nameOf) {
  const artists = [q.artist, ...(q.artists || [])];
  const titles = [q.title, ...(q.titles || [])];
  return rows.filter((r) => artists.some((a) => matches(artistOf(r), a))).find((r) => titles.some((t) => matches(nameOf(r), t)));
}

// the public Spotify page carries the release date and, for a track, a link to its album
async function spotifyMeta(link) {
  try {
    const res = await fetch(link.replace(/\/intl-\w+\//, '/'), { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; helen-site-covers/1.0)' } });
    const html = await res.text();
    const get = (name) => new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]+)"`).exec(html)?.[1] || '';
    return { year: get('music:release_date').slice(0, 4), album: get('music:album') };
  } catch (e) {
    return { year: '', album: '' };
  }
}

async function lookup(q, kind) {
  // a pasted Apple Music song link (…?i=<id>) gives the exact track, preview included
  const appleId = /[?&]i=(\d+)/.exec(q.apple || '')?.[1] || /\/song\/[^/]+\/(\d+)/.exec(q.apple || '')?.[1];
  if (appleId) {
    const store = /music\.apple\.com\/(\w\w)\//.exec(q.apple)?.[1] || 'us';
    const r = (await getJSON(`https://itunes.apple.com/lookup?id=${appleId}&country=${store}`))?.results?.[0];
    if (r) return { source: 'itunes', artwork: (r.artworkUrl100 || '').replace(/\/\d+x\d+bb\./, '/600x600bb.'), url: r.trackViewUrl, preview: r.previewUrl || '', name: r.trackName, album: r.collectionName || '', year: (r.releaseDate || '').slice(0, 4) };
  }
  // a pasted Spotify link wins (open.spotify.com/album/… or /track/…)
  if (q.spotify) {
    const d = await getJSON(`https://open.spotify.com/oembed?url=${encodeURIComponent(q.spotify)}`);
    if (d?.thumbnail_url) {
      const meta = await spotifyMeta(q.spotify);
      let album = /\/album\//.test(q.spotify) ? d.title : '';
      if (!album && meta.album) album = (await getJSON(`https://open.spotify.com/oembed?url=${encodeURIComponent(meta.album)}`))?.title || '';
      const sp = { source: 'spotify', artwork: d.thumbnail_url, url: q.spotify, preview: '', name: d.title, album, year: meta.year };
      // Spotify gives no preview: borrow one from iTunes / Deezer for the same song
      if (kind === 'song') {
        const other = await lookup({ ...q, spotify: '' }, kind);
        if (other?.preview) { sp.preview = other.preview; sp.previewUrl = other.url; }
        if (!sp.year && other?.year && !album) sp.year = other.year;
      }
      return sp;
    }
  }
  const artists = [q.artist, ...(q.artists || [])];
  const plain = q.title.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const titles = [...new Set([q.title, plain, ...(q.titles || [])])];
  q = { ...q, titles };
  // iTunes
  const entity = kind === 'album' ? 'album' : 'song';
  const nameOf = (r) => (kind === 'album' ? r.collectionName : r.trackName);
  for (const country of [...new Set([q.country || 'us', 'us'])]) {
    for (const t of titles) {
      const data = await getJSON(`https://itunes.apple.com/search?term=${encodeURIComponent(`${artists[0]} ${t}`)}&entity=${entity}&limit=15&country=${country}`);
      const best = data && pick(data.results || [], q, (r) => r.artistName, nameOf);
      if (best) {
        return {
          source: 'itunes',
          artwork: (best.artworkUrl100 || '').replace(/\/\d+x\d+bb\./, '/600x600bb.'),
          url: kind === 'album' ? best.collectionViewUrl : best.trackViewUrl,
          preview: best.previewUrl || '',
          name: nameOf(best),
          album: best.collectionName || '',
          year: (best.releaseDate || '').slice(0, 4),
        };
      }
    }
  }
  // Deezer
  for (const t of titles) {
    const field = kind === 'album' ? 'album' : 'track';
    const data = await getJSON(`https://api.deezer.com/search/${field}?q=${encodeURIComponent(`artist:"${artists[0]}" ${field}:"${t}"`)}&limit=15`)
      || await getJSON(`https://api.deezer.com/search/${field}?q=${encodeURIComponent(`${artists[0]} ${t}`)}&limit=15`);
    const best = data && pick(data.data || [], q, (r) => r.artist?.name, (r) => r.title);
    if (best) {
      const album = kind === 'album' ? best : best.album || {};
      const full = album.id ? await getJSON(`https://api.deezer.com/album/${album.id}`) : null;
      return { source: 'deezer', artwork: album.cover_xl || album.cover_big || '', url: best.link, preview: best.preview || '', name: best.title, album: album.title || '', year: (full?.release_date || '').slice(0, 4) };
    }
  }
  // MusicBrainz + Cover Art Archive (albums only; covers older and smaller releases)
  if (kind === 'album') {
    for (const a of artists) {
      for (const t of titles) {
        const data = await getJSON(`https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(`releasegroup:"${t}" AND artist:"${a}"`)}&fmt=json&limit=10`);
        const groups = (data?.['release-groups'] || []).filter((g) => matches(g.title, t) && (g['artist-credit'] || []).some((c) => artists.some((x) => matches(c.name || c.artist?.name, x))));
        for (const g of groups) {
          const art = `https://coverartarchive.org/release-group/${g.id}/front-500`;
          const head = await fetch(art, { method: 'HEAD', redirect: 'follow' }).catch(() => null);
          if (head?.ok) return { source: 'coverartarchive', artwork: art, url: `https://musicbrainz.org/release-group/${g.id}`, preview: '', name: g.title };
        }
      }
    }
  }
  return null;
}

// Spotify's oEmbed has no release date: try to fill album / year from iTunes, then Deezer
async function albumInfo(artist, album) {
  const it = await getJSON(`https://itunes.apple.com/search?term=${encodeURIComponent(`${artist} ${album}`)}&entity=album&limit=10`);
  const a = (it?.results || []).find((r) => matches(r.artistName, artist) && matches(r.collectionName, album));
  if (a?.releaseDate) return a.releaseDate.slice(0, 4);
  const dz = await getJSON(`https://api.deezer.com/search/album?q=${encodeURIComponent(`${artist} ${album}`)}&limit=10`);
  const d = (dz?.data || []).find((r) => matches(r.artist?.name, artist) && matches(r.title, album));
  const full = d ? await getJSON(`https://api.deezer.com/album/${d.id}`) : null;
  return (full?.release_date || '').slice(0, 4);
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}

let manifest = {};
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (e) { /* first run */ }

const jobs = [
  ...music.albums.map((a) => ({ kind: 'album', a, dir: 'assets/albums' })),
  ...(music.mixtape?.songs || []).map((a) => ({ kind: 'song', a, dir: 'assets/songs' })),
  // favourite tracks inside each album: looked up as songs, for their 30-second previews
  ...music.albums.flatMap((al) => (al.tracks || []).map((t) => ({
    kind: 'song', dir: 'assets/songs',
    a: { artist: al.artist, title: t.name, spotify: t.spotify || '', apple: t.apple || '', itunes: { ...(al.itunes || {}), titles: t.titles || [] } },
  }))),
];
let found = 0, missing = [];
for (const { kind, a, dir } of jobs) {
  const key = `${kind}|${a.artist}|${a.title}`;
  const rel = `${dir}/${slug(`${a.artist}-${a.title}`)}.jpg`;
  const have = manifest[key] && 'album' in manifest[key] && (manifest[key].spotify || '') === (a.spotify || '') && (manifest[key].apple || '') === (a.apple || '') && (await fs.stat(path.join(root, manifest[key].artwork)).catch(() => null));
  if (have || a.cover) { found++; continue; }
  const r = await lookup({ artist: a.artist, title: a.title, spotify: a.spotify, apple: a.apple, ...(a.itunes || {}) }, kind);
  if (!r?.artwork) { missing.push(`${a.artist} — ${a.title}`); log(`✗ ${kind} ${a.artist} — ${a.title}`); continue; }
  try {
    await download(r.artwork, path.join(root, rel));
    if (r.album && !r.year) r.year = await albumInfo(a.artist, r.album);
    manifest[key] = { artwork: rel, url: r.url, preview: r.preview, previewUrl: r.previewUrl || '', name: r.name, album: r.album || '', year: r.year || '', source: r.source, spotify: a.spotify || '', apple: a.apple || '' };
    found++;
    log(`✓ ${kind} ${a.artist} — ${a.title}  (${r.source}: ${r.name}${r.album ? ` · ${r.album}` : ''}${r.year ? `, ${r.year}` : ''})`);
  } catch (e) {
    missing.push(`${a.artist} — ${a.title} (download failed)`);
  }
}
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
log(`\n${found}/${jobs.length} found.`);
if (missing.length) log(`Not found:\n  ${missing.join('\n  ')}`);
await fs.writeFile(path.join(root, 'assets/albums/covers-report.txt'), `${new Date().toISOString()}\n${report.join('\n')}\n`);
