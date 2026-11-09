"""Scan → clean faceted housing: stacked straight-edged layers (like the moulded steps), holes closed.
usage: shells.py libdir scratch out.json part_dir scale upside_down [max_layers]"""
import sys; sys.path.insert(0, sys.argv[1])
import json, numpy as np, scanlib as L
from scipy import ndimage as nd
from skimage import measure
S, OUT, d, scale, flip = sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), sys.argv[6] == '1'
NL = int(sys.argv[7]) if len(sys.argv) > 7 else 6; Y0 = float(sys.argv[8]) if len(sys.argv) > 8 else None
m = L.recenter(L.prep(S + '/' + d, scale, flip, Y0)); V, FV = m['V'], m['FV']
# dense points: vertices + face centroids + edge midpoints
tri = V[FV]; pts = np.r_[V[np.unique(FV)], tri.mean(1), (tri[:, 0] + tri[:, 1]) / 2, (tri[:, 1] + tri[:, 2]) / 2]
lo = np.percentile(pts, .3, 0); hi = np.percentile(pts, 99.7, 0); pts = pts[((pts >= lo) & (pts <= hi)).all(1)]
G = 3.0  # mm grid
x0, z0 = pts[:, 0].min() - 20, pts[:, 2].min() - 20; nx = int((pts[:, 0].max() + 20 - x0) / G) + 1; nz = int((pts[:, 2].max() + 20 - z0) / G) + 1
ys = np.arange(0, pts[:, 1].max() + 4, 4.0)
def mask(a, b):
    p = pts[(pts[:, 1] >= a) & (pts[:, 1] < b)]; mk = np.zeros((nz, nx), bool)
    mk[((p[:, 2] - z0) / G).astype(int), ((p[:, 0] - x0) / G).astype(int)] = True
    mk = nd.binary_closing(mk, nd.generate_binary_structure(2, 1), iterations=5); mk = nd.binary_fill_holes(mk)
    lab, n = nd.label(mk)
    if n == 0: return mk
    sizes = nd.sum(mk, lab, range(1, n + 1)); return lab == (np.argmax(sizes) + 1)
sl = [mask(a, a + 4) for a in ys[:-1]]; areas = np.array([s.sum() for s in sl])
# group slices into bands of similar outline
bands = [[0]]
for i in range(1, len(sl)):
    a, b = sl[bands[-1][0]], sl[i]; iou = (a & b).sum() / max(1, (a | b).sum())
    if iou > .82 and areas[i] > 30: bands[-1].append(i)
    else: bands.append([i])
bands = [b for b in bands if areas[b].mean() > 60]
i = 1
while i < len(bands):  # thin bands (< 3 slices = 12 mm) join the band below
    if len(bands[i]) < 3: bands[i - 1] += bands.pop(i)
    else: i += 1
while len(bands) > NL:  # merge the two most similar neighbours
    best = None
    for i in range(len(bands) - 1):
        a = np.logical_or.reduce([sl[k] for k in bands[i]]); b = np.logical_or.reduce([sl[k] for k in bands[i + 1]])
        iou = (a & b).sum() / max(1, (a | b).sum())
        if best is None or iou > best[0]: best = (iou, i)
    i = best[1]; bands[i] = bands[i] + bands.pop(i + 1)
if len(bands) < NL:  # too few natural steps: cut evenly so tapers still show as steps
    idx = [i for i in range(len(sl)) if areas[i] > 60]; bands = [list(b) for b in np.array_split(idx, NL) if len(b)]
def poly(mk, tol=5.0):
    c = max(measure.find_contours(np.pad(mk, 1).astype(float), .5), key=len)
    c = measure.approximate_polygon(c, tolerance=tol / G)
    return [[round((p[1] - 1) * G + x0, 1), round((p[0] - 1) * G + z0, 1)] for p in c[:-1]]
layers = []
for bi, b in enumerate(bands):
    mk = np.logical_or.reduce([sl[k] for k in b]); mk = nd.binary_opening(mk, iterations=2)
    inner = nd.binary_erosion(mk, iterations=2)  # 6 mm wall
    layers.append({'y0': round(float(ys[b[0]]), 1), 'y1': round(float(ys[b[-1] + 1]), 1), 'outer': poly(mk), 'inner': poly(inner) if bi > 0 and inner.sum() > 40 else None})
json.dump({'unit': 'mm', 'layers': layers}, open(OUT, 'w'))
print(d, 'layers', [(l['y0'], l['y1'], len(l['outer'])) for l in layers], 'size', (pts.max(0) - pts.min(0)).round(0))
