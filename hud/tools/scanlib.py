"""Turn KIRI / Polycam photo scans (OBJ + JPG) into clean, scaled parts and merge two scans of one part (inside + outside)."""
import json, struct, io, numpy as np
from PIL import Image
from scipy.spatial import cKDTree

def load(d):
    V, VT, FV, FT = [], [], [], []
    for l in open(d + '/3DModel.obj'):
        if l.startswith('v '): V.append(list(map(float, l.split()[1:4])))
        elif l.startswith('vt '): VT.append(list(map(float, l.split()[1:3])))
        elif l.startswith('f '):
            p = [q.split('/') for q in l.split()[1:]]
            for k in range(1, len(p) - 1):
                t = [p[0], p[k], p[k + 1]]; FV.append([int(a[0]) - 1 for a in t]); FT.append([int(a[1]) - 1 for a in t])
    im = Image.open(d + '/3DModel.jpg').convert('RGB'); im.thumbnail((2048, 2048)); b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    return dict(V=np.array(V), VT=np.array(VT), FV=np.array(FV), FT=np.array(FT), jpg=b.getvalue())

def table_plane(V, it=1500):
    rng = np.random.default_rng(0); best = (0, None)
    for _ in range(it):
        a, b, c = V[rng.choice(len(V), 3, replace=False)]; n = np.cross(b - a, c - a); nn = np.linalg.norm(n)
        if nn < 1e-9: continue
        n = n / nn; d = -n @ a; h = V @ n + d
        if np.median(h) < 0: n, d, h = -n, -d, -h
        if (h < -.01).mean() > .02: continue  # the table: almost nothing lies below it
        k = (np.abs(h) < .004).sum()
        if k > best[0]: best = (k, (n, d))
    return best[1]

def part_start(h, xz):
    """lowest height where the scan is as wide as the part (the stand under it is narrow)"""
    hs = np.linspace(.004, np.percentile(h, 99), 60); spans = []
    for a, b in zip(hs[:-1], hs[1:]):
        m = (h > a) & (h <= b); spans.append(np.ptp(np.percentile(xz[m], [2, 98], 0), 0).max() if m.sum() > 30 else 0)
    spans = np.array(spans); k = np.argmax(spans > .45 * spans.max()); return hs[k]

def components_keep_largest(FV, nv):
    par = np.arange(nv)
    def f(a):
        r = a
        while par[r] != r: r = par[r]
        while par[a] != r: par[a], a = r, par[a]
        return r
    for a, b, c in FV:
        for x, y in ((a, b), (b, c)):
            rx, ry = f(x), f(y)
            if rx != ry: par[rx] = ry
    roots = np.array([f(a) for a in FV[:, 0]]); return roots == np.bincount(roots).argmax()

def prep(d, scale=None, upside_down=False, y0=None):
    m = load(d); V = m['V']; n, dd = table_plane(V); h = V @ n + dd
    u = np.cross(n, [1, 0, 0]); u /= np.linalg.norm(u); w = np.cross(n, u); xz = np.c_[V @ u, V @ w]
    y0 = part_start(h, xz) if y0 is None else y0
    keep = (h[m['FV']] > y0 + .002).all(1); FV, FT = m['FV'][keep], m['FT'][keep]
    sel = components_keep_largest(FV, len(V)); FV, FT = FV[sel], FT[sel]
    used = np.unique(FV); q = xz[used]; mu = q.mean(0); ev, evec = np.linalg.eigh(np.cov((q - mu).T)); ax = evec[:, ::-1]
    R = (xz - mu) @ ax; P = np.c_[R[:, 0], h - y0, R[:, 1]]
    M = np.c_[np.c_[u, w] @ ax[:, 0], n, np.c_[u, w] @ ax[:, 1]]
    if np.linalg.det(M) < 0: P[:, 2] *= -1  # never mirrored
    if upside_down: P[:, 1] *= -1; P[:, 2] *= -1  # turn over (rotate π about x)
    s = 1.0 if scale is None else scale; P = P * s
    m.update(V=P, FV=FV, FT=FT); return m

def bbox(m):
    p = m['V'][np.unique(m['FV'])]; return np.percentile(p, .5, 0), np.percentile(p, 99.5, 0)

def recenter(m):
    lo, hi = bbox(m); c = (lo + hi) / 2; c[1] = lo[1]; m['V'] = m['V'] - c; return m

def sample(m, k=20000):
    p = m['V'][np.unique(m['FV'])]; i = np.random.default_rng(1).choice(len(p), min(k, len(p)), replace=False); return p[i]

def icp(A, B, iters=40, scale=True):
    """move B onto A: returns s, R, t with A ≈ s R B + t"""
    tree = cKDTree(A); s, Rm, t = 1.0, np.eye(3), np.zeros(3)
    for k in range(iters):
        Bt = s * B @ Rm.T + t; dist, idx = tree.query(Bt); cut = np.percentile(dist, 80); g = dist <= cut
        X, Y = B[g], A[idx[g]]; mx, my = X.mean(0), Y.mean(0); Xc, Yc = X - mx, Y - my
        U, S_, Vt = np.linalg.svd(Yc.T @ Xc); D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(U @ Vt)); Rm = U @ D @ Vt
        s = (S_ * np.diag(D)).sum() / (Xc ** 2).sum() if scale else 1.0; t = my - s * Rm @ mx
    dist, _ = tree.query(s * B @ Rm.T + t); return s, Rm, t, float(np.median(dist))

def align(A_mesh, B_mesh):
    """try the four ways B can lie on A (PCA axes are sign-ambiguous), keep the best ICP"""
    A, B = sample(A_mesh), sample(B_mesh); best = None
    la, ha = bbox(A_mesh); lb, hb = bbox(B_mesh); s0 = np.median((ha - la)[[0, 2]] / (hb - lb)[[0, 2]])
    for R0 in (np.eye(3), np.diag([-1, 1, -1])):
        s, Rm, t, err = icp(A, s0 * B @ R0.T); r = (s * s0, Rm @ R0, t, err)
        if best is None or err < best[3]: best = r
    return best

def apply(m, s, Rm, t): m['V'] = s * m['V'] @ Rm.T + t; return m

def write_glb(meshes, out, emissive=None):
    bufs, views, accs, prims, imgs, texs, mats = [], [], [], [], [], [], []; off = 0
    def add(b, target=None):
        nonlocal off; pad = b + b'\0' * ((4 - len(b) % 4) % 4); bufs.append(pad)
        v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(b)}
        if target: v['target'] = target
        views.append(v); off += len(pad); return len(views) - 1
    for m in meshes:
        pairs = np.stack([m['FV'].ravel(), m['FT'].ravel()], 1); uq, inv = np.unique(pairs, axis=0, return_inverse=True)
        pos = m['V'][uq[:, 0]].astype(np.float32); uv = m['VT'][uq[:, 1]].astype(np.float32); uv[:, 1] = 1 - uv[:, 1]; idx = inv.reshape(-1).astype(np.uint32)
        a0 = len(accs); accs += [{'bufferView': add(pos.tobytes(), 34962), 'componentType': 5126, 'count': len(pos), 'type': 'VEC3', 'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()},
                                 {'bufferView': add(uv.tobytes(), 34962), 'componentType': 5126, 'count': len(uv), 'type': 'VEC2'},
                                 {'bufferView': add(idx.tobytes(), 34963), 'componentType': 5125, 'count': len(idx), 'type': 'SCALAR'}]
        imgs.append({'bufferView': add(m['jpg']), 'mimeType': 'image/jpeg'}); texs.append({'source': len(imgs) - 1, 'sampler': 0})
        mats.append({'pbrMetallicRoughness': {'baseColorTexture': {'index': len(texs) - 1}, 'metallicFactor': 0, 'roughnessFactor': .85}, 'doubleSided': True})
        prims.append({'attributes': {'POSITION': a0, 'TEXCOORD_0': a0 + 1}, 'indices': a0 + 2, 'material': len(mats) - 1})
    blob = b''.join(bufs)
    gl = {'asset': {'version': '2.0', 'generator': 'scanlib (heyhiheyhi hud)'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}], 'meshes': [{'primitives': prims}],
          'materials': mats, 'textures': texs, 'samplers': [{'magFilter': 9729, 'minFilter': 9987}], 'images': imgs, 'buffers': [{'byteLength': len(blob)}], 'bufferViews': views, 'accessors': accs}
    js = json.dumps(gl).encode(); js += b' ' * ((4 - len(js) % 4) % 4)
    open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + blob)
