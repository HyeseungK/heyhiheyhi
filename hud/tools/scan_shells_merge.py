"""Two scans of one housing (inside + outside, either may be upside down) → one faceted shell.
Each scan is scaled to the BOM size, the second is turned (0° / 180°) to match the first, and their band outlines are united,
so what one scan missed the other fills in. usage: shells2.py libdir scratch out.json LxWxH dirA flipA y0A dirB flipB y0B nlayers"""
import sys; sys.path.insert(0, sys.argv[1])
import json, numpy as np, scanlib as L
from scipy import ndimage as nd
from skimage import measure
S, OUT = sys.argv[2], sys.argv[3]; DIM = np.array(list(map(float, sys.argv[4].split('x'))))
scans = [(sys.argv[5], sys.argv[6] == '1', float(sys.argv[7])), (sys.argv[8], sys.argv[9] == '1', float(sys.argv[10]))]; NL = int(sys.argv[11])
def points(d, flip, y0):
    m = L.recenter(L.prep(S + '/' + d, 1.0, flip, None if y0 < 0 else y0)); V, FV = m['V'], m['FV']; t = V[FV]
    p = np.r_[V[np.unique(FV)], t.mean(1), (t[:, 0] + t[:, 1]) / 2, (t[:, 1] + t[:, 2]) / 2]
    lo, hi = np.percentile(p, .5, 0), np.percentile(p, 99.5, 0); p = p[((p >= lo) & (p <= hi)).all(1)]
    c = (lo + hi) / 2; p = (p - [c[0], lo[1], c[2]]) / (hi - lo) * [DIM[0], DIM[2], DIM[1]]; return p  # mm: x = length, y = height, z = width
P = [points(*s) for s in scans]
G = 3.0; nx, nz = int(DIM[0] / G) + 14, int(DIM[1] / G) + 14; x0, z0 = -DIM[0] / 2 - 21, -DIM[1] / 2 - 21
def mask(p, a, b):
    q = p[(p[:, 1] >= a) & (p[:, 1] < b)]; mk = np.zeros((nz, nx), bool)
    ix, iz = ((q[:, 0] - x0) / G).astype(int), ((q[:, 2] - z0) / G).astype(int); ok = (ix >= 0) & (ix < nx) & (iz >= 0) & (iz < nz); mk[iz[ok], ix[ok]] = True
    mk = nd.binary_closing(mk, iterations=5); mk = nd.binary_fill_holes(mk); lab, n = nd.label(mk)
    return lab == (np.argmax(nd.sum(mk, lab, range(1, n + 1))) + 1) if n else mk
edges = np.linspace(0, DIM[2], NL + 1)
# turn scan B 0° or 180° (about y) to best match scan A over all bands
def score(pb):
    return sum((mask(P[0], a, b) & mask(pb, a, b)).sum() / max(1, (mask(P[0], a, b) | mask(pb, a, b)).sum()) for a, b in zip(edges[:-1], edges[1:]))
cands = [P[1], P[1] * [-1, 1, -1]]; sc = [score(c) for c in cands]; PB = cands[int(np.argmax(sc))]
print('turn B', 'none' if np.argmax(sc) == 0 else '180°', 'match', [round(s / NL, 2) for s in sc])
def poly(mk, tol=5.0):
    c = max(measure.find_contours(np.pad(mk, 1).astype(float), .5), key=len); c = measure.approximate_polygon(c, tolerance=tol / G)
    return [[round((q[1] - 1) * G + x0, 1), round((q[0] - 1) * G + z0, 1)] for q in c[:-1]]
layers = []
for i, (a, b) in enumerate(zip(edges[:-1], edges[1:])):
    mk = mask(P[0], a, b) | mask(PB, a, b); mk = nd.binary_opening(nd.binary_fill_holes(nd.binary_closing(mk, iterations=2)), iterations=2)
    layers.append({'y0': round(a, 1), 'y1': round(b, 1), 'outer': poly(mk), 'inner': poly(nd.binary_erosion(mk, iterations=2))})
json.dump({'unit': 'mm', 'layers': layers}, open(OUT, 'w')); print(OUT.split('/')[-1], [len(l['outer']) for l in layers])
