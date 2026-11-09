# usage: frame.py scan_dir y0  — fit the table plane, PCA axes of everything above y0, print extents and a height histogram
import sys, numpy as np
D = sys.argv[1]; V = []
for l in open(D + '/3DModel.obj'):
    if l.startswith('v '): V.append(list(map(float, l.split()[1:4])))
V = np.array(V); rng = np.random.default_rng(0); best = (0, None)
for _ in range(1500):
    i = rng.choice(len(V), 3, replace=False); a, b, c = V[i]; n = np.cross(b - a, c - a); nn = np.linalg.norm(n)
    if nn < 1e-9: continue
    n /= nn; d = -n @ a; hh = V @ n + d; inl = np.abs(hh) < .004
    if np.median(hh) < 0: hh = -hh
    if (hh < -.01).mean() > .02: continue  # the table: nearly everything lies on one side of it
    if inl.sum() > best[0]: best = (inl.sum(), (n, d))
n, d = best[1]; h = V @ n + d
if np.median(h) < 0: n, d, h = -n, -d, -h
y0 = float(sys.argv[2]) if len(sys.argv) > 2 else .006; part = h > y0
u = np.cross(n, [1, 0, 0]); u /= np.linalg.norm(u); w = np.cross(n, u)
q = np.c_[V @ u, V @ w][part]; mu = q.mean(0); ev, evec = np.linalg.eigh(np.cov((q - mu).T)); ax = evec[:, ::-1]
R = (q - mu) @ ax; L = np.ptp(np.percentile(R[:, 0], [.5, 99.5])); Sh = np.ptp(np.percentile(R[:, 1], [.5, 99.5]))
np.savez(D + '/frame.npz', u=u, w=w, n=n, d=d, mu=mu, ax=ax)
hist, e = np.histogram(h[h > .005], bins=30)
print('long', round(L, 4), 'short', round(Sh, 4), 'top', round(np.percentile(h[part], 99.5), 4))
print(' '.join(f'{x:.3f}:{c}' for c, x in zip(hist, e)))
