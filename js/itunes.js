// Official artwork and 30-second previews, looked up in the visitor's browser
// (no keys, nothing to download by hand). Sources, in order:
//   1. a Spotify link you paste (`spotify`) — exact cover via Spotify's oEmbed
//   2. iTunes Search API
//   3. Deezer API
// Answers are cached in localStorage for a week so each lookup happens once.

const CACHE_KEY = 'covers-v2';
const WEEK = 7 * 24 * 3600 * 1000;

let cache = {};
try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (e) { cache = {}; }
const save = () => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* storage full or blocked */ } };

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = `itunes_${Math.random().toString(36).slice(2)}`;
    const s = document.createElement('script');
    const timer = setTimeout(() => done(new Error('timeout')), 9000);
    function done(err, data) {
      clearTimeout(timer);
      delete window[cb];
      s.remove();
      err ? reject(err) : resolve(data);
    }
    window[cb] = (data) => done(null, data);
    s.onerror = () => done(new Error('network'));
    s.src = `${url}&callback=${cb}`;
    document.head.appendChild(s);
  });
}

// lower-case, keep letters/digits of any script, drop the rest
const norm = (s = '') => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');
const matches = (a, b) => {
  const x = norm(a), y = norm(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

// q: { artist, title, artists?: [...alt names], titles?: [...alt titles], country?, spotify? }
// kind: 'album' | 'song'
async function find(q, kind) {
  const key = `${kind}|${q.artist}|${q.title}|${q.spotify || ''}`;
  const hit = cache[key];
  if (hit && Date.now() - hit.t < WEEK) return hit.v;

  let reached = false;
  let result = null;
  for (const source of [fromSpotify, fromITunes, fromDeezer]) {
    try {
      const r = await source(q, kind);
      if (r === undefined) continue; // source not applicable
      reached = true;
      if (r) { result = r; break; }
    } catch (e) {
      /* network error: try the next source */
    }
  }
  if (reached) { // don't remember a miss caused by the network being down
    cache[key] = { t: Date.now(), v: result };
    save();
  }
  return result;
}

const pick = (rows, q, artistOf, nameOf) => {
  const artists = [q.artist, ...(q.artists || [])];
  const titles = [q.title, ...(q.titles || [])];
  return rows.filter((r) => artists.some((a) => matches(artistOf(r), a))).find((r) => titles.some((t) => matches(nameOf(r), t)));
};

// 1. Spotify: only when a link is given (open.spotify.com/album/… or /track/…)
async function fromSpotify(q) {
  if (!q.spotify) return undefined;
  const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(q.spotify)}`);
  if (!res.ok) throw new Error('spotify');
  const d = await res.json();
  return d.thumbnail_url ? { artwork: d.thumbnail_url, url: q.spotify, preview: '', name: d.title, album: /\/album\//.test(q.spotify) ? d.title : '', year: '' } : null;
}

// 2. iTunes
async function fromITunes(q, kind) {
  const artists = [q.artist, ...(q.artists || [])];
  const titles = [q.title, ...(q.titles || [])];
  const countries = [...new Set([q.country, 'us', 'kr', 'jp'].filter(Boolean))];
  const entity = kind === 'album' ? 'album' : 'song';
  const nameOf = (r) => (kind === 'album' ? r.collectionName : r.trackName);
  let reached = false;
  for (const country of countries) {
    for (const t of titles) {
      let data;
      try {
        data = await jsonp(`https://itunes.apple.com/search?term=${encodeURIComponent(`${artists[0]} ${t}`)}&entity=${entity}&limit=15&country=${country}`);
      } catch (e) {
        continue;
      }
      reached = true;
      const best = pick(data?.results || [], q, (r) => r.artistName, nameOf);
      if (best) {
        return {
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
  if (!reached) throw new Error('itunes unreachable');
  return null;
}

// 3. Deezer (good for Korean and Japanese releases too)
async function fromDeezer(q, kind) {
  const artists = [q.artist, ...(q.artists || [])];
  const titles = [q.title, ...(q.titles || [])];
  const path = kind === 'album' ? 'album' : 'track';
  for (const t of titles) {
    const data = await jsonp(`https://api.deezer.com/search/${path}?q=${encodeURIComponent(`${artists[0]} ${t}`)}&limit=15&output=jsonp`);
    const best = pick(data?.data || [], q, (r) => r.artist?.name, (r) => r.title);
    if (best) {
      const album = kind === 'album' ? best : best.album || {};
      return { artwork: album.cover_xl || album.cover_big || album.cover_medium || '', url: best.link, preview: best.preview || '', name: best.title, album: album.title || '', year: '' };
    }
  }
  return null;
}

export const findAlbum = (q) => find(q, 'album');
export const findSong = (q) => find(q, 'song');
