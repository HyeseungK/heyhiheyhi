#!/usr/bin/env python3
"""Build one realistic housing from two raw photo scans (the side that faced up and the side that faced the table).

  python3 -I scan_repair.py OUT.glb A_DIR A_SCALE A_Y0 A_UPSIDE B_DIR B_UPSIDE

A is the reference scan (scale from a card), B the scan of the part turned over; B is scaled and fitted onto A.
- the scanner wraps a light cap over the open side and the table: big light patches are dropped (the part is black)
- B keeps only the faces A could not see (facing down), minus leftovers high up and far from A
- holes you can see through (thin sheets with open space on both sides) are closed with patches that take the rim's texture
"""
import sys, pathlib, numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import scanlib as L, scan_holes as H
from scipy.spatial import cKDTree
out, ad, asc, ay0, aup, bd, bup = sys.argv[1:8]; warm = float(sys.argv[8]) if len(sys.argv) > 8 else -1  # 0.05 keeps light grey metal (heatsink)
A = H.bleed(L.recenter(L.prep(ad, float(asc), aup == '1', float(ay0))))
B = H.bleed(L.recenter(L.prep(bd, 1, bup == '1'))); la, ha = L.bbox(A); lb, hb = L.bbox(B)
B['V'] = B['V'] * (ha - la)[0] / (hb - lb)[0]; L.recenter(B)
s, R, t, med = L.align(A, B); L.apply(B, s, R, t); print('fit', round(float(med), 1), 'mm')
A, ka = H.drop_bright(A, warm=warm); B, kb = H.drop_bright(B, warm=warm); B = H.drop_far_top(H.keep_facing(B), A)
def decimate(v, f, frac=.3):
    import pymeshlab as ml
    ms = ml.MeshSet(); ms.add_mesh(ml.Mesh(v, f)); ms.meshing_decimation_quadric_edge_collapse(targetfacenum=max(200, int(len(f) * frac)), preservenormal=True)
    m = ms.current_mesh(); return m.vertex_matrix(), m.face_matrix()
parts = []
for M in (A, B):
    lo, vox, wall, fill, st = H.find_axis(M)
    if fill.sum():
        from skimage.measure import marching_cubes; from scipy import ndimage as nd
        g = nd.gaussian_filter(nd.binary_dilation(fill).astype(np.float32), .8); v, fc, _, _ = marching_cubes(np.pad(g, 1), .5)
        v, fc = decimate((v - 1) * vox + lo, fc[:, ::-1])
        uvof = np.zeros(len(M['V']), int); uvof[M['FV'].ravel()] = M['FT'].ravel()
        dark = M['FV'][(H.face_rgb(M) @ [.3, .59, .11]) < .25]; used = np.unique(dark)  # patches take the colour of the dark plastic around them
        _, k = cKDTree(M['V'][used]).query(v); M = H.merged(M, v, fc, uvof[used[k]]); print('patched', st[1], 'holes,', len(fc), 'tris')
    parts.append(M)
L.write_glb(parts, out); lo, hi = L.bbox(parts[0]); print('wrote', out, 'size mm', (hi - lo).round(0), 'KB', pathlib.Path(out).stat().st_size // 1024)
