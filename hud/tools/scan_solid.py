#!/usr/bin/env python3
"""Clean housing from a repaired scan: carve a voxel block from six directions, close the holes in each direction's depth map,
then smooth and simplify into flat moulded faces.  python3 -I scan_solid.py IN.glb OUT.glb OPEN_SIDE  (OPEN_SIDE: top|bottom, the cavity side)

Depth maps seen from the outside get a wide closing (holes up to ~2R are bridged); the cavity side only a small one,
and it is never carved deeper than the outside skin plus a wall thickness, so holes cannot let it eat through."""
import sys, numpy as np, trimesh
from scipy import ndimage as nd
from skimage.measure import marching_cubes
src, out, open_side = sys.argv[1], sys.argv[2], sys.argv[3]  # e.g. scans/textured/base.glb scans/base.glb top
VOX = 1.5; WALL = 5.0  # mm left between the cavity and the outside skin where the scan saw through
R_OUT = {'top': 60, 'bottom': 60, 'side': 22}; R_IN = 6
m = trimesh.load(src, force='mesh'); p, _ = trimesh.sample.sample_surface(m, 1500000)
lo = p.min(0) - 6 * VOX; ijk = ((p - lo) / VOX).astype(int); sh = ijk.max(0) + 7
wall = np.zeros(sh, bool); wall[tuple(ijk.T)] = True; wall = nd.binary_closing(nd.binary_dilation(wall, iterations=1), iterations=1)
def disk(r):
    r = max(1, int(round(r / VOX))); y, x = np.ogrid[-r:r + 1, -r:r + 1]; return x * x + y * y <= r * r
BIG = 10 ** 6
def depth(ax, sign):
    """index of the first wall voxel met coming from the + (sign=1) or - side of axis ax, as a height (bigger = further toward that side)"""
    w = np.moveaxis(wall, ax, -1); n = w.shape[-1]; hit = w.any(-1)
    d = np.where(hit, (n - 1 - np.argmax(w[..., ::-1], -1)) if sign > 0 else np.argmax(w, -1), 0).astype(float)
    return d if sign > 0 else -d, hit  # stored so that "air" is where coord*sign > value
def closed(d, hit, R):
    fp = nd.binary_fill_holes(nd.binary_closing(hit, disk(R), iterations=1)) | hit
    lowv = d[hit].min() - 5; e = np.where(hit, d, lowv)
    c = nd.grey_closing(e, footprint=disk(R))
    return np.where(fp, c, -BIG), fp  # outside the outline: all air
air = np.zeros(sh, bool); idx = np.indices(sh)
for ax in range(3):
    for sg in (1, -1):
        d, hit = depth(ax, sg)
        cav = ax == 1 and ((sg > 0) == (open_side == 'top'))
        if cav:
            d2, h2 = depth(1, -sg); skin, _ = closed(d2, h2, R_OUT['top']); dc, fp = closed(d, hit, R_IN)
            # cavity floor may not go past the outside skin + WALL
            if sg > 0: dc = np.maximum(dc, np.where(np.abs(skin) < BIG / 2, -skin + WALL / VOX, dc))
            else: dc = np.maximum(dc, np.where(np.abs(skin) < BIG / 2, -skin + WALL / VOX, dc))
        else:
            dc, fp = closed(d, hit, R_OUT['side'] if ax != 1 else R_OUT['top'])
        coord = np.moveaxis(idx[ax], ax, -1) * sg
        air |= np.moveaxis(coord > dc[..., None], -1, ax)
solid = ~air
# rays from the sides graze through holes in a sloped top/bottom plate; keep a WALL-thick plate under the closed outside skin
sg = -1 if open_side == 'top' else 1; d, hit = depth(1, sg); skin, _ = closed(d, hit, R_OUT['top']); inner = nd.binary_erosion(nd.binary_fill_holes(hit), disk(12))  # not near the outline: the side views shape the rim
t = np.where(inner & (np.abs(skin) < BIG / 2), skin * sg, np.nan)[:, None, :]; y = np.arange(sh[1])[None, :, None]
solid |= (np.abs(y - t) <= WALL / VOX) & inner[:, None, :]
solid = nd.binary_opening(solid, iterations=1)
lab, n = nd.label(solid); solid = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
g = nd.gaussian_filter(solid.astype(np.float32), 1.2)
v, f, _, _ = marching_cubes(np.pad(g, 1), .5); v = (v - 1) * VOX + lo
import pymeshlab as ml
ms = ml.MeshSet(); ms.add_mesh(ml.Mesh(v, f[:, ::-1]))
ms.apply_coord_taubin_smoothing(stepsmoothnum=20)
ms.meshing_decimation_quadric_edge_collapse(targetfacenum=14000, planarquadric=True, preservenormal=True, qualitythr=.4)
ms.apply_coord_taubin_smoothing(stepsmoothnum=6)
mm = ms.current_mesh(); t = trimesh.Trimesh(mm.vertex_matrix(), mm.face_matrix(), process=True)
trimesh.repair.fix_normals(t); t.visual = trimesh.visual.ColorVisuals(t)
t.export(out); print(out, 'faces', len(t.faces), 'size mm', t.extents.round(0), 'watertight', t.is_watertight)
