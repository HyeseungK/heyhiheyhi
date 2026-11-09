# hole repair for photo scans of black plastic housings (used by scan_repair.py)
# find wall holes in a prepped scan: voxel closing, keep only thin added sheets (holes), not deep fills (gaps between ribs)
import sys, numpy as np
import scanlib as L
sys.path.insert(0, '/home/user/heyhiheyhi/hud/tools'); import scanlib as L
from scipy import ndimage as nd
from scipy.spatial import cKDTree
def surf_pts(m, step=.5):
    V, F = m['V'], m['FV']; a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    ar = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2; k = np.maximum(1, (ar / step**2 * 2).astype(int))
    rng = np.random.default_rng(0); idx = np.repeat(np.arange(len(F)), k); r1, r2 = rng.random(len(idx)), rng.random(len(idx))
    s = np.sqrt(r1); return a[idx] * (1 - s)[:, None] + b[idx] * (s * (1 - r2))[:, None] + c[idx] * (s * r2)[:, None]
def find(m, vox=1.0, r=7, tmax=3.5):
    p = surf_pts(m); lo = p.min(0) - (r + 3) * vox; ijk = ((p - lo) / vox).astype(int); sh = ijk.max(0) + r + 4
    wall = np.zeros(sh, bool); wall[tuple(ijk.T)] = True; wall = nd.binary_dilation(wall, iterations=1)
    ball = nd.iterate_structure(nd.generate_binary_structure(3, 1), r)
    cl = nd.binary_closing(wall, ball); add = cl & ~wall
    lab, n = nd.label(add); thick = nd.distance_transform_edt(add)
    mx = nd.maximum(thick, lab, np.arange(1, n + 1)); sz = nd.sum(add, lab, np.arange(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = (mx * vox <= tmax / 2 + .5) & (sz > 20)
    return lo, vox, wall, add & keep[lab], (n, int(keep.sum()))
def patch(m, lo, vox, fill, grow=1):
    """surface of the fill sheets, uv taken from the nearest scan vertex so the patch picks up the rim colour"""
    from skimage.measure import marching_cubes
    f = nd.binary_dilation(fill, iterations=grow) if grow else fill
    g = nd.gaussian_filter(f.astype(np.float32), .8)
    v, fc, _, _ = marching_cubes(np.pad(g, 1), .5); v = (v - 1) * vox + lo
    uvof = np.zeros(len(m['V']), int); uvof[m['FV'].ravel()] = m['FT'].ravel()
    used = np.unique(m['FV']); _, k = cKDTree(m['V'][used]).query(v)
    return v, fc[:, ::-1], uvof[used[k]]
def merged(m, v, fc, vt_idx):
    n0, t0 = len(m['V']), len(m['VT'])
    VT = np.r_[m['VT'], m['VT'][vt_idx]]
    return dict(m, V=np.r_[m['V'], v], VT=VT, FV=np.r_[m['FV'], fc + n0], FT=np.r_[m['FT'], fc + t0])
def face_rgb(m):
    import io; from PIL import Image
    im = np.asarray(Image.open(io.BytesIO(m['jpg'])).convert('RGB'), np.float32) / 255; H_, W_ = im.shape[:2]
    uv = m['VT'][m['FT']].mean(1); x = np.clip((uv[:, 0] * W_).astype(int), 0, W_ - 1); y = np.clip(((1 - uv[:, 1]) * H_).astype(int), 0, H_ - 1)
    return im[y, x]
def drop_bright(m, lum=.38, min_area=400, warm=.05):
    """remove the table/cap the scanner wrapped over the open side: big connected light patches (the part is black plastic)"""
    c = face_rgb(m); L_ = c @ [.3, .59, .11]; br = (L_ > lum) & (c[:, 0] - c[:, 2] > warm)  # beige table/cap, not grey metal
    V, F = m['V'], m['FV']; ar = np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1) / 2
    idx = np.where(br)[0]; par = {i: i for i in idx}
    def fd(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    from collections import defaultdict; byv = defaultdict(list)
    for i in idx:
        for v in F[i]: byv[v].append(i)
    for fs in byv.values():
        for j in fs[1:]:
            a, b = fd(fs[0]), fd(j)
            if a != b: par[a] = b
    area = defaultdict(float)
    for i in idx: area[fd(i)] += ar[i]
    kill = np.zeros(len(F), bool); kill[[i for i in idx if area[fd(i)] > min_area]] = True
    keep = ~kill; sel = L.components_keep_largest(F[keep], len(V)) if keep.any() else keep[keep]
    m = dict(m, FV=F[keep][sel], FT=m['FT'][keep][sel]); return m, kill.sum()
def normals(m):
    V, F = m['V'], m['FV']; n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]); return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)
def outward_sign(m):
    """+1 if faces point out (bottom faces point down)"""
    n = normals(m); y = m['V'][m['FV']].mean(1)[:, 1]; lo = y < np.percentile(y, 8); return 1 if n[lo, 1].mean() < 0 else -1
def keep_facing(m, ny_max=.3):
    n = normals(m) * outward_sign(m); k = n[:, 1] < ny_max; return dict(m, FV=m['FV'][k], FT=m['FT'][k])
def drop_far_top(B, A, d=6., frac=.5):
    """outside scan: faces high up and far from the inside scan are the cap the scanner wrapped over the opening"""
    c = B['V'][B['FV']].mean(1); dist, _ = cKDTree(L.sample(A, 200000)).query(c); y = c[:, 1]; H_ = L.bbox(A)[1][1]
    k = ~((dist > d) & (y > frac * H_)); m = dict(B, FV=B['FV'][k], FT=B['FT'][k])
    return drop_small(m)
def drop_small(m, min_frac=.01):
    F = m['FV']; par = np.arange(len(m['V']))
    def fd(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    for a, b, c in F:
        for x, y in ((a, b), (b, c)):
            rx, ry = fd(x), fd(y)
            if rx != ry: par[rx] = ry
    r = np.array([fd(a) for a in F[:, 0]]); cnt = np.bincount(r); k = cnt[r] >= min_frac * len(F)
    return dict(m, FV=F[k], FT=m['FT'][k])
def find_through(m, vox=1.0, r=20, free=18, reach=40):
    """closing fills, kept only where you can see through: free space on both sides of the fill sheet (holes),
    not a floor close behind it (channels between ribs)"""
    p = surf_pts(m); lo = p.min(0) - (r + reach + 3) * vox; ijk = ((p - lo) / vox).astype(int); sh = ijk.max(0) + r + reach + 4
    wall = np.zeros(sh, bool); wall[tuple(ijk.T)] = True; wall = nd.binary_dilation(wall, iterations=1)
    d_out = nd.distance_transform_edt(~wall); dil = d_out <= r; cl = nd.distance_transform_edt(dil) > r
    add = cl & ~wall; lab, n = nd.label(add); objs = nd.find_objects(lab); keep = np.zeros(n + 1, bool); rng = np.random.default_rng(0)
    for i, sl in enumerate(objs, 1):
        q = np.argwhere(lab[sl] == i) + [s.start for s in sl]
        if len(q) < 15: continue
        mu = q.mean(0); ev, evec = np.linalg.eigh(np.cov((q - mu).T)); nrm = evec[:, 0]
        s = q[rng.choice(len(q), min(150, len(q)), replace=False)]; ok = 0
        for sg in (1, -1):
            steps = np.arange(1, reach + 1)[:, None, None] * nrm * sg; pts = np.rint(s[None] + steps).astype(int)
            pts = np.clip(pts, 0, np.array(sh) - 1); hit = wall[tuple(pts.reshape(-1, 3).T)].reshape(reach, len(s)) & ~add[tuple(pts.reshape(-1, 3).T)].reshape(reach, len(s))
            first = np.where(hit.any(0), hit.argmax(0), reach); ok += np.median(first) >= free
        keep[i] = ok == 2
    return lo, vox, wall, add & keep[lab], (n, int(keep.sum()))
def _axis_runs(add, wall, ax, thin, free):
    a = np.moveaxis(add, ax, -1); w = np.moveaxis(wall, ax, -1); n = a.shape[-1]; idx = np.broadcast_to(np.arange(n), a.shape)
    def prev(mask):  # index of the last True at or before i (-10**6 if none)
        return np.maximum.accumulate(np.where(mask, idx, -10**6), axis=-1)
    def nxt(mask):
        return (n - 1) - prev(mask[..., ::-1])[..., ::-1]
    na = ~a; ap, an = prev(na), nxt(na)  # last non-fill voxel before / first after
    wp, wn = prev(w), nxt(w)
    apc, anc = np.clip(ap, 0, n - 1), np.clip(an, 0, n - 1)
    airp = ~np.take_along_axis(w, apc, -1) & (ap >= 0); airn = ~np.take_along_axis(w, anc, -1) & (an < n)
    fp = ap - np.take_along_axis(np.where(wp < 0, -10**6, wp), apc, -1); fn = np.take_along_axis(np.where(wn >= n, 10**6, wn), anc, -1) - an
    ok = a & (an - ap - 1 <= thin) & airp & airn & (fp >= free) & (fn >= free)
    return np.moveaxis(ok, -1, ax)
def find_axis(m, vox=1.0, r=14, thin=10, free=15):
    """closing fills that sit in a thin sheet with open space on both sides along some axis: see-through holes"""
    p = surf_pts(m); lo = p.min(0) - (r + free + 3) * vox; ijk = ((p - lo) / vox).astype(int); sh = ijk.max(0) + r + free + 4
    wall = np.zeros(sh, bool); wall[tuple(ijk.T)] = True; wall = nd.binary_dilation(wall, iterations=1)
    dil = nd.distance_transform_edt(~wall) <= r; add = (nd.distance_transform_edt(dil) > r) & ~wall
    ok = _axis_runs(add, wall, 0, thin, free) | _axis_runs(add, wall, 1, thin, free) | _axis_runs(add, wall, 2, thin, free)
    ok = nd.binary_dilation(ok, iterations=2, mask=add)
    lab, n = nd.label(ok); sz = nd.sum(ok, lab, np.arange(1, n + 1)); k = np.r_[False, sz > 30]
    return lo, vox, wall, ok & k[lab], (n, int(k.sum()))

def bleed(m):
    """paint the empty space of the texture atlas with the nearest island colour, so seams don't show the atlas background"""
    import io; from PIL import Image, ImageDraw
    im = Image.open(io.BytesIO(m['jpg'])).convert('RGB'); im.thumbnail((1600, 1600)); W_, H_ = im.size; mask = Image.new('L', (W_, H_), 0); d = ImageDraw.Draw(mask)
    for t in m['VT'][m['FT']]: d.polygon([(u * W_, (1 - v) * H_) for u, v in t], fill=255)
    k = nd.binary_erosion(np.asarray(mask) > 0, iterations=2); a = np.asarray(im)
    _, (iy, ix) = nd.distance_transform_edt(~k, return_indices=True); b = io.BytesIO(); Image.fromarray(a[iy, ix]).save(b, 'JPEG', quality=78)
    return dict(m, jpg=b.getvalue())
