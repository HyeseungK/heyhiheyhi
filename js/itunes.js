// Official artwork and 30-second previews from the iTunes Search API.
// It runs in the visitor's browser (JSONP, no key needed); answers are cached in
// localStorage for a week so each lookup happens once.

const CACHE_KEY = 'itunes-v1';
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

// q: { artist, title, artists?: [...alt names], titles?: [...alt titles], country? }
// kind: 'album' | 'song'
async function find(q, kind) {
  const key = `${kind}|${q.artist}|${q.title}`;
  const hit = cache[key];
  if (hit && Date.now() - hit.t < WEEK) return hit.v;

  const artists = [q.artist, ...(q.artists || [])];
  const titles = [q.title, ...(q.titles || [])];
  const countries = [...new Set([q.country, 'us', 'kr', 'jp'].filter(Boolean))];
  const entity = kind === 'album' ? 'album' : 'song';
  let result = null;
  let reached = false;

  search: for (const country of countries) {
    for (const t of titles) {
      const term = encodeURIComponent(`${artists[0]} ${t}`);
      let data;
      try {
        data = await jsonp(`https://itunes.apple.com/search?term=${term}&entity=${entity}&limit=15&country=${country}`);
      } catch (e) {
        continue;
      }
      reached = true;
      const rows = data?.results || [];
      const byArtist = rows.filter((r) => artists.some((a) => matches(r.artistName, a)));
      const name = (r) => (kind === 'album' ? r.collectionName : r.trackName);
      const best = byArtist.find((r) => titles.some((tt) => matches(name(r), tt)));
      if (best) {
        result = {
          artwork: (best.artworkUrl100 || '').replace(/\/\d+x\d+bb\./, '/600x600bb.'),
          url: kind === 'album' ? best.collectionViewUrl : best.trackViewUrl,
          preview: best.previewUrl || '',
          name: name(best),
        };
        break search;
      }
    }
  }
  if (reached) { // don't remember a miss caused by the network being down
    cache[key] = { t: Date.now(), v: result };
    save();
  }
  return result;
}

export const findAlbum = (q) => find(q, 'album');
export const findSong = (q) => find(q, 'song');
