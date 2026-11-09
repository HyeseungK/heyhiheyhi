# usage: obj2glb.py scan_dir out.glb  — cut the table and stand off a KIRI/Polycam scan, put it in mm on a y-up frame, write a textured GLB
import sys, json, struct, io, numpy as np
from PIL import Image
D, OUT = sys.argv[1], sys.argv[2]
f = np.load(D + '/frame.npz'); u, w, n, d, mu, ax = f['u'], f['w'], f['n'], f['d'], f['mu'], f['ax']
S = float(sys.argv[3]) if len(sys.argv) > 3 else 809.0; Y0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.105
V, VT, FV, FT = [], [], [], []
for l in open(D + '/3DModel.obj'):
    if l.startswith('v '): V.append(list(map(float, l.split()[1:4])))
    elif l.startswith('vt '): VT.append(list(map(float, l.split()[1:3])))
    elif l.startswith('f '):
        p = [q.split('/') for q in l.split()[1:]]
        for k in range(1, len(p) - 1):
            tri = [p[0], p[k], p[k + 1]]; FV.append([int(a[0]) - 1 for a in tri]); FT.append([int(a[1]) - 1 for a in tri])
V, VT, FV, FT = np.array(V), np.array(VT), np.array(FV), np.array(FT)
h = V @ n + d; R = (np.c_[V @ u, V @ w] - mu) @ ax
P = np.c_[R[:, 0] * S, (h - Y0) * S, R[:, 1] * S]
# the (u, n, w) frame and the PCA axes can each flip handedness; a scan must never come out mirrored
M = np.c_[np.c_[u, w] @ ax[:, 0], n, np.c_[u, w] @ ax[:, 1]]  # columns: model x, y, z in scan coordinates
if np.linalg.det(M) < 0: P[:, 2] *= -1
keep = (P[FV][:, :, 1] > 2).all(1); FV, FT = FV[keep], FT[keep]
# keep the largest connected piece (drops floating table/stand fragments)
par = np.arange(len(V))
def fd(a):
    while par[a] != a: par[a] = par[par[a]]; a = par[a]
    return a
for a, b, c in FV:
    for x, y in ((a, b), (b, c)):
        rx, ry = fd(x), fd(y)
        if rx != ry: par[rx] = ry
roots = np.array([fd(a) for a in FV[:, 0]]); big = np.bincount(roots).argmax(); sel = roots == big; FV, FT = FV[sel], FT[sel]
# fill scan holes: photo scans leave holes where black or shiny surfaces were not caught; real openings are kept via KEEP boxes
MAXP = float(sys.argv[5]) if len(sys.argv) > 5 else 900.0  # mm: loops longer than this are the real open rims
KEEP = [tuple(map(float, b.split(','))) for b in sys.argv[6:]]  # x0,x1,z0,z1 (mm, centred frame) of real openings
from collections import defaultdict
cnt = defaultdict(int); uvof = {}
for fv, ft in zip(FV, FT):
    for k in range(3):
        a_, b_ = fv[k], fv[(k + 1) % 3]; cnt[(min(a_, b_), max(a_, b_))] += 1; uvof[fv[k]] = ft[k]
nxt = defaultdict(list)
for fv in FV:
    for k in range(3):
        a_, b_ = fv[k], fv[(k + 1) % 3]
        if cnt[(min(a_, b_), max(a_, b_))] == 1: nxt[b_].append(a_)  # reversed so the patch faces the same way
seen = set(); loops = []
for st in list(nxt):
    if st in seen: continue
    loop = [st]; seen.add(st); cur = st
    while True:
        cand = [v for v in nxt[cur] if v not in seen]
        if not cand: break
        cur = cand[0]; seen.add(cur); loop.append(cur)
    if len(loop) >= 3: loops.append(loop)
cx0 = (P[:, 0].min() + P[:, 0].max()) / 2; cz0 = (P[:, 2].min() + P[:, 2].max()) / 2
P = list(P); VT = list(VT); addV, addT = [], []; nfill = 0
for loop in loops:
    pts = np.array([P[v] for v in loop]); per = np.linalg.norm(np.roll(pts, -1, 0) - pts, axis=1).sum(); c = pts.mean(0)
    if per > MAXP or any(b[0] <= c[0] - cx0 <= b[1] and b[2] <= c[2] - cz0 <= b[3] for b in KEEP): continue
    P.append(c); VT.append(np.mean([VT[uvof[v]] for v in loop], 0)); ci = len(P) - 1; ti = len(VT) - 1; nfill += 1
    for k in range(len(loop)):
        a_, b_ = loop[k], loop[(k + 1) % len(loop)]; addV.append([a_, b_, ci]); addT.append([uvof[a_], uvof[b_], ti])
P = np.array(P); VT = np.array(VT)
if addV: FV = np.r_[FV, np.array(addV)]; FT = np.r_[FT, np.array(addT)]
print('holes filled', nfill, 'of', len(loops), 'loops; longest kept', round(max((np.linalg.norm(np.roll(np.array([P[v] for v in l]), -1, 0) - np.array([P[v] for v in l]), axis=1).sum() for l in loops), default=0)))
# unweld into (vertex, uv) pairs
pairs = np.stack([FV.ravel(), FT.ravel()], 1); uniq, inv = np.unique(pairs, axis=0, return_inverse=True)
pos = P[uniq[:, 0]].astype(np.float32); uv = VT[uniq[:, 1]].astype(np.float32); uv[:, 1] = 1 - uv[:, 1]
c = (pos.min(0) + pos.max(0)) / 2; c[1] = pos[:, 1].min(); pos -= c
idx = inv.reshape(-1).astype(np.uint32)
im = Image.open(D + '/3DModel.jpg').convert('RGB'); im.thumbnail((2048, 2048)); jb = io.BytesIO(); im.save(jb, 'JPEG', quality=82); jpg = jb.getvalue()
def pad(b, ch=b'\0'): return b + ch * ((4 - len(b) % 4) % 4)
bp, bu, bi = pos.tobytes(), uv.tobytes(), idx.tobytes()
blob = pad(bp) + pad(bu) + pad(bi) + pad(jpg); o1 = len(pad(bp)); o2 = o1 + len(pad(bu)); o3 = o2 + len(pad(bi))
gl = {'asset': {'version': '2.0', 'generator': 'obj2glb (heyhiheyhi hud)'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
  'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'TEXCOORD_0': 1}, 'indices': 2, 'material': 0}]}],
  'materials': [{'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': .85}, 'doubleSided': True}],
  'textures': [{'source': 0, 'sampler': 0}], 'samplers': [{'magFilter': 9729, 'minFilter': 9987}], 'images': [{'bufferView': 3, 'mimeType': 'image/jpeg'}],
  'buffers': [{'byteLength': len(blob)}],
  'bufferViews': [{'buffer': 0, 'byteOffset': 0, 'byteLength': len(bp), 'target': 34962}, {'buffer': 0, 'byteOffset': o1, 'byteLength': len(bu), 'target': 34962},
                  {'buffer': 0, 'byteOffset': o2, 'byteLength': len(bi), 'target': 34963}, {'buffer': 0, 'byteOffset': o3, 'byteLength': len(jpg)}],
  'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(pos), 'type': 'VEC3', 'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()},
                {'bufferView': 1, 'componentType': 5126, 'count': len(uv), 'type': 'VEC2'}, {'bufferView': 2, 'componentType': 5125, 'count': len(idx), 'type': 'SCALAR'}]}
js = pad(json.dumps(gl).encode(), b' ')
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + blob
open(OUT, 'wb').write(out)
print('tris', len(idx) // 3, 'verts', len(pos), 'size mm', (pos.max(0) - pos.min(0)).round(0), 'KB', len(out) // 1024)
