#!/usr/bin/env python3
"""Clean housing solid from a repaired scan (scans/textured/*.glb), true to scale, holding its parts, with straight edges.

  python3 -I tools/scan_solid.py scans/textured/motor.glb scans/motor.glb top tools/scan_held.json lower 0
  (args: IN OUT OPEN_SIDE HELD ID ROT;  HELD = part points dumped from the page)   (OPEN_SIDE: top|bottom, the cavity side; ROT 1 = turned π)

1. carve a voxel block from six directions; each direction's depth map gets its holes closed (wide on the outside,
   narrow on the cavity side, and the cavity may not cut through the outside skin)
2. the parts the page puts inside (HELD.json, dumped from the page) are hollowed out and given a wall where they
   stick out, so nothing pokes through
3. smooth, simplify, then snap: faces are grown into near-flat regions, each region is flattened onto its plane and
   vertices between two or three regions go onto the planes' intersection, which makes the edges straight
The page stretches each axis so the scan's bounds fill the housing box (scan_fit in SCANS); the same mapping is used here.
Prints the bounds the page needs, and how much of the parts the scan outline holds either way round.
"""
import sys, json, numpy as np, trimesh
from scipy import ndimage as nd
from skimage.measure import marching_cubes
VOX, WALL = 1.5, 5.0
R_OUT = {'y': 60, 'side': 22}; R_IN = 6; BIG = 10 ** 6

def disk(r):
    r = max(1, int(round(r / VOX))); y, x = np.ogrid[-r:r + 1, -r:r + 1]; return x * x + y * y <= r * r

def carve(wall, open_side):
    sh = wall.shape; idx = np.indices(sh)
    def depth(ax, sign):
        w = np.moveaxis(wall, ax, -1); n = w.shape[-1]; hit = w.any(-1)
        d = np.where(hit, (n - 1 - np.argmax(w[..., ::-1], -1)) if sign > 0 else np.argmax(w, -1), 0).astype(float)
        return (d if sign > 0 else -d), hit  # air where coord*sign > value
    def closed(d, hit, R):
        fp = nd.binary_fill_holes(nd.binary_closing(hit, disk(R), iterations=1)) | hit
        e = np.where(hit, d, d[hit].min() - 5); c = nd.grey_closing(e, footprint=disk(R))
        return np.where(fp, c, -BIG), fp  # outside the outline: all air
    air = np.zeros(sh, bool); cav_air = np.zeros(sh, bool)
    for ax in range(3):
        for sg in (1, -1):
            d, hit = depth(ax, sg); coord = np.moveaxis(idx[ax], ax, -1) * sg
            if ax == 1 and (sg > 0) == (open_side == 'top'):
                skin, _ = closed(*depth(1, -sg), R_OUT['y']); dc, _ = closed(d, hit, R_IN)
                dc = np.maximum(dc, np.where(np.abs(skin) < BIG / 2, -skin + WALL / VOX, dc))  # never through the outside skin
                cav_air |= np.moveaxis(coord > dc[..., None], -1, ax)
            else:
                dc, _ = closed(d, hit, R_OUT['side'] if ax != 1 else R_OUT['y'])
                air |= np.moveaxis(coord > dc[..., None], -1, ax)
    env = ~air; solid = env & ~cav_air
    # rays from the sides graze through holes in a sloped outer plate: keep a WALL-thick plate under the closed skin
    sg = -1 if open_side == 'top' else 1; d, hit = depth(1, sg); skin, _ = closed(d, hit, R_OUT['y'])
    inner = nd.binary_erosion(nd.binary_fill_holes(hit), disk(12))
    t = np.where(inner & (np.abs(skin) < BIG / 2), skin * sg, np.nan)[:, None, :]; y = np.arange(sh[1])[None, :, None]
    solid |= (np.abs(y - t) <= WALL / VOX) & inner[:, None, :]
    return env, solid

def straighten(t, ang=14, dist=2.5, min_area=250, max_move=6.0):
    """flatten near-planar regions and put the vertices they share on the planes' intersections"""
    n, c, a = t.face_normals, t.triangles_center, t.area_faces; adj = [[] for _ in range(len(t.faces))]
    for i, j in t.face_adjacency: adj[i].append(j); adj[j].append(i)
    reg = -np.ones(len(t.faces), int); planes = []; cosA = np.cos(np.radians(ang))
    for s in np.argsort(-a):
        if reg[s] >= 0: continue
        rid = len(planes); members = [s]; reg[s] = rid; nn = n[s] * a[s]; cc = c[s] * a[s]; A = a[s]; q = [s]
        while q:
            f = q.pop(); nm = nn / np.linalg.norm(nn); p0 = cc / A
            for g in adj[f]:
                if reg[g] < 0 and n[g] @ nm > cosA and abs((c[g] - p0) @ nm) < dist:
                    reg[g] = rid; members.append(g); q.append(g); nn += n[g] * a[g]; cc += c[g] * a[g]; A += a[g]
        nm = nn / np.linalg.norm(nn); planes.append((nm, (cc / A) @ nm, A))
    big = np.array([p[2] >= min_area for p in planes]); V = t.vertices.copy(); moved = 0
    vf = t.vertex_faces
    for v in range(len(V)):
        rs = {reg[f] for f in vf[v] if f >= 0 and big[reg[f]]}
        if not rs: continue
        rs = sorted(rs, key=lambda r: -planes[r][2])[:3]; N = np.array([planes[r][0] for r in rs]); dd = np.array([planes[r][1] for r in rs])
        x = V[v] - np.linalg.pinv(N, rcond=.15) @ (N @ V[v] - dd)
        if np.linalg.norm(x - V[v]) <= max_move: V[v] = x; moved += 1
    print(f'  regions {int(big.sum())} flat of {len(planes)}, vertices snapped {moved}/{len(V)}')
    return trimesh.Trimesh(V, t.faces, process=True)

def main():
    src, out, open_side, held, pid, rot = sys.argv[1:7]; rot = int(rot)
    m = trimesh.load(src, force='mesh'); p, _ = trimesh.sample.sample_surface(m, 1500000)
    anchor = (m.bounds[0] + m.bounds[1]) / 2
    lo = p.min(0) - 40; ijk = ((p - lo) / VOX).astype(int); sh = ijk.max(0) + 40
    wall = np.zeros(sh, bool); wall[tuple(ijk.T)] = True; wall = nd.binary_closing(nd.binary_dilation(wall, iterations=1), iterations=1)
    env, solid = carve(wall, open_side)
    h = json.load(open(held))[pid]; bc = (np.array(h['min']) + np.array(h['max'])) / 2
    k_ = (np.array(h['max']) - np.array(h['min'])) * 10 / (m.bounds[1] - m.bounds[0])  # page stretch per axis
    def local(pts, rot): return ((np.array(pts) - bc) * 10 / k_) * ([-1, 1, -1] if rot else 1) + anchor  # page cm → scan mm
    def vox(q): k = np.round((q - lo) / VOX).astype(int); ok = ((k >= 0) & (k < sh)).all(1); return k[ok]
    score = {}
    for r_ in (0, 1):
        ks = [vox(local(pts, r_)) for pts in h["parts"].values()]; score[r_] = np.mean([env[tuple(k.T)].mean() for k in ks if len(k)])
    print(f'{pid}: stretch {k_.round(2)}, parts inside the outline {score[0]:.2f} (as is) / {score[1]:.2f} (turned), using rot {rot}')
    from scipy.spatial import Delaunay
    P = np.zeros(sh, bool)  # each part's convex hull in the scan frame
    for pts in h['parts'].values():
        q = local(pts, rot); a, b = np.clip(np.floor((q.min(0) - 1 - lo) / VOX).astype(int), 0, sh - 1), np.clip(np.ceil((q.max(0) + 1 - lo) / VOX).astype(int), 0, sh - 1)
        g = np.stack(np.meshgrid(*[np.arange(a[i], b[i] + 1) for i in range(3)], indexing='ij'), -1).reshape(-1, 3)
        try: inside = Delaunay(q + np.random.default_rng(0).normal(0, .05, q.shape)).find_simplex(g * VOX + lo) >= 0
        except Exception: inside = np.ones(len(g), bool)
        P[tuple(g[inside].T)] = True
    P = nd.binary_dilation(P, iterations=1)
    out_of = P & ~env; print(f'  part volume outside the scan outline: {out_of.sum() / max(P.sum(), 1):.0%}')
    shell = nd.binary_dilation(P, iterations=int(round(WALL / VOX))) & ~env  # new wall where parts stick out
    solid = (solid | shell) & ~P
    solid = nd.binary_opening(solid, iterations=1); lab, _ = nd.label(solid); solid = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    g = nd.gaussian_filter(solid.astype(np.float32), 1.2); v, f, _, _ = marching_cubes(np.pad(g, 1), .5); v = (v - 1) * VOX + lo
    import pymeshlab as ml
    ms = ml.MeshSet(); ms.add_mesh(ml.Mesh(v, f[:, ::-1])); ms.apply_coord_taubin_smoothing(stepsmoothnum=30)
    ms.meshing_decimation_quadric_edge_collapse(targetfacenum=16000, planarquadric=True, preservenormal=True, qualitythr=.4)
    mm = ms.current_mesh(); t = trimesh.Trimesh(mm.vertex_matrix(), mm.face_matrix(), process=True)
    t = straighten(t); t = straighten(t, ang=10, dist=1.5)  # stronger smoothing shrinks the walls back onto the parts
    trimesh.repair.fix_normals(t); t.export(out)
    print(f'  {out}: faces {len(t.faces)}, size mm {t.extents.round(0)}, scan bounds mm {np.round(m.bounds, 1).tolist()}')

if __name__ == '__main__': main()
