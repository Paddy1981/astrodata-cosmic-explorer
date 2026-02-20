"""
Gravitational Microlensing — Exoplanet Detection Animation
==========================================================
A foreground star (with a planet) drifts past a background star.
Its gravity acts as a cosmic lens — bending and magnifying the
background star's light, creating a characteristic double-peaked
light curve with a brief planet-induced spike.

Panels:
  Top-left : Sky view — Einstein ring forming as lens passes
  Top-right: Caustic geometry — the critical curves and source path
  Bottom   : Magnification light curve — Paczynski profile + planet spike

Physics:
  - Paczynski (1986) point-lens magnification:
      A(u) = (u² + 2) / (u * sqrt(u² + 4))
  - u(t) = sqrt(u_min² + ((t - t₀)/t_E)²)
  - Planet caustic: binary lens with mass ratio q = 0.001 (MJ/MS)

Usage:
  python 04_microlensing.py           # interactive window
  python 04_microlensing.py --save    # saves microlensing.gif
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
from matplotlib.patches import Circle, FancyArrowPatch
from matplotlib.lines import Line2D

SAVE = "--save" in sys.argv

# ── Microlensing parameters ──────────────────────────────────────────────────
U_MIN    = 0.12    # minimum impact parameter (Einstein radii)  u < 1 → large magnif.
T_0      = 0.0     # time of closest approach (normalised)
T_E      = 1.0     # Einstein ring crossing time (normalised units)
DURATION = 10.0    # animation duration (seconds)
T_START  = -2.5 * T_E
T_END    =  2.5 * T_E

# Planet parameters (binary lens)
Q        = 0.001          # mass ratio M_planet / M_star
ALPHA_P  = -0.4           # planet-star angle from source trajectory (radians)
SEP_P    = 1.3            # planet-star separation in Einstein radii

# Planet anomaly timing (when source crosses planet caustic)
T_PLANET  = 0.6 * T_E    # time of planet anomaly relative to t_0

FPS       = 30
N_FRAMES  = int(FPS * DURATION)

# ── Color palette ───────────────────────────────────────────────────────────
BG       = '#070b12'
TEXT_COL = '#c9d1d9'
DIM_COL  = '#484f58'
LENS_C   = '#ffe480'     # lens star colour (yellow-white)
SOURCE_C = '#88aaff'     # background source star (blue)
PLANET_C = '#f0883e'     # planet colour (orange)
RING_C   = '#58a6ff'     # Einstein ring
CAUST_C  = '#ff6b6b'     # caustic (red)
CRIT_C   = '#aaaaff'     # critical curve (blue-grey)
LC_C     = '#58a6ff'     # light curve colour
SPIKE_C  = '#f0883e'     # planet spike colour
GRID_COL = '#161b22'
GREEN    = '#3fb950'
PURPLE   = '#bc8cff'

# ── Paczynski magnification ──────────────────────────────────────────────────
def magnification(u):
    """Point-source, point-lens magnification."""
    u = np.maximum(u, 0.001)  # avoid singularity
    return (u**2 + 2) / (u * np.sqrt(u**2 + 4))

def impact_param(t):
    """Impact parameter u(t) — source-lens separation in Einstein radii."""
    return np.sqrt(U_MIN**2 + ((t - T_0) / T_E)**2)

# Build light curve over animation time range
TIMES    = np.linspace(0, DURATION, N_FRAMES)
T_PHYS   = T_START + (T_END - T_START) * TIMES / DURATION  # physical time
U_T      = impact_param(T_PHYS)
MAG_PSPL = magnification(U_T)                               # point-source-point-lens

# Add planet anomaly: simple Gaussian bump centred at T_PLANET
# (In reality this comes from binary lens caustic crossing)
T_HALF_WIDTH = 0.08 * T_E
PLANET_BUMP  = 3.2 * np.exp(-0.5 * ((T_PHYS - T_PLANET) / T_HALF_WIDTH)**2)
MAG_TOTAL    = MAG_PSPL + PLANET_BUMP

# Convert magnification to flux change in millimagnitudes for labelling
BASELINE_FLUX = 1.0
FLUX_T = BASELINE_FLUX * MAG_TOTAL / MAG_TOTAL[0]  # normalise to start

# Max magnification info
peak_idx  = np.argmax(MAG_PSPL)
peak_mag  = MAG_PSPL[peak_idx]
spike_idx = np.argmax(PLANET_BUMP)
spike_mag = MAG_TOTAL[spike_idx]

# ── Figure layout ────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(15, 8.5), facecolor=BG)
fig.text(0.5, 0.965, 'Exoplanet Detection: Gravitational Microlensing',
         ha='center', fontsize=17, color='white', fontweight='bold')
fig.text(0.5, 0.935,
         'A foreground star (the lens) drifts past a background star '
         '— gravity bends the light, revealing a planet',
         ha='center', fontsize=10, color=DIM_COL)

gs = gridspec.GridSpec(2, 2, figure=fig,
                       height_ratios=[1.3, 1.2],
                       width_ratios=[1, 1],
                       hspace=0.15, wspace=0.28,
                       left=0.06, right=0.97, top=0.90, bottom=0.09)

ax_sky   = fig.add_subplot(gs[0, 0], facecolor=BG)
ax_geom  = fig.add_subplot(gs[0, 1], facecolor=BG)
ax_lc    = fig.add_subplot(gs[1, :], facecolor=BG)

for ax in [ax_sky, ax_geom, ax_lc]:
    ax.set_facecolor(BG)
    for s in ax.spines.values():
        s.set_color('#30363d')

# ── Sky view panel ───────────────────────────────────────────────────────────
SKY_SIZE = 4.0   # arcseconds
ax_sky.set_xlim(-SKY_SIZE, SKY_SIZE)
ax_sky.set_ylim(-SKY_SIZE, SKY_SIZE)
ax_sky.set_aspect('equal')
ax_sky.set_xticks([]); ax_sky.set_yticks([])
ax_sky.set_title('Sky View  ·  Lensing geometry',
                 color=TEXT_COL, fontsize=10, pad=6)

# Celestial coordinates label
ax_sky.text(-3.8, -3.8, 'Field: 8″ × 8″', color=DIM_COL, fontsize=7.5,
            fontfamily='monospace')

# Background source star (fixed at origin)
for r in [0.35, 0.25, 0.15]:
    ax_sky.add_patch(Circle((0, 0), r, color=SOURCE_C,
                             alpha=0.07 if r > 0.15 else 1.0, zorder=3))
ax_sky.text(0.25, 0.18, 'Source star\n(background)', color=SOURCE_C,
            fontsize=8, zorder=10)

# Lens star (will animate moving from left to right)
lens_star = Circle((-3.5, -U_MIN * 1.5), 0.20, facecolor=LENS_C,
                    edgecolor='#fffaa0', linewidth=0.8, zorder=8)
for r in [0.50, 0.35, 0.20]:
    glow = Circle((-3.5, -U_MIN * 1.5), r, facecolor=LENS_C,
                   alpha=0.03, zorder=7)
    ax_sky.add_patch(glow)
lens_glows = [ax_sky.patches[-i-1] for i in range(2)]
ax_sky.add_patch(lens_star)

# Lens trajectory line (dashed)
TRAJ_Y = -U_MIN * 1.5
ax_sky.axhline(TRAJ_Y, color='#30363d', linewidth=0.8,
               linestyle='--', alpha=0.5, zorder=2)
ax_sky.text(2.8, TRAJ_Y - 0.25, 'Lens path', color=DIM_COL, fontsize=7.5)

# Planet companion to lens (will animate, offset from lens)
planet_sky = Circle((-3.5 + SEP_P * 0.5, TRAJ_Y + 0.3), 0.10,
                     facecolor=PLANET_C, edgecolor='#ffaa44',
                     linewidth=0.8, zorder=9)
ax_sky.add_patch(planet_sky)

# Einstein ring (will animate)
einstein_ring = Circle((0, 0), 0, facecolor='none',
                         edgecolor=RING_C, linewidth=2, linestyle='-',
                         alpha=0, zorder=12)
ax_sky.add_patch(einstein_ring)

# Multiple images (two bright arcs near Einstein radius, will appear/disappear)
img1 = ax_sky.add_patch(Circle((0, 0), 0, facecolor=SOURCE_C,
                                 alpha=0, edgecolor='none', zorder=11))
img2 = ax_sky.add_patch(Circle((0, 0), 0, facecolor=SOURCE_C,
                                 alpha=0, edgecolor='none', zorder=11))

# Magnification label
mag_txt = ax_sky.text(-3.7, 3.4, 'A = 1.00×', color=RING_C,
                       fontsize=10, fontfamily='monospace', fontweight='bold')

# Lens label
lens_lbl = ax_sky.text(-3.3, TRAJ_Y + 0.25, 'Lens\nstar', color=LENS_C, fontsize=7.5)
planet_lbl = ax_sky.text(-3.5, TRAJ_Y + 0.55, '🪐 Planet\ncompanion',
                          color=PLANET_C, fontsize=7.5)

# Angle between lens and source
angle_arc = ax_sky.annotate('', xy=(0, 0), xytext=(-3.5, TRAJ_Y),
                             arrowprops=dict(arrowstyle='-', color='#30363d',
                                             lw=0.8, linestyle='dashed'),
                             annotation_clip=False, alpha=0.4)
distance_txt = ax_sky.text(-1.8, TRAJ_Y/2, '', color=DIM_COL, fontsize=8,
                            ha='center', fontfamily='monospace')

# ── Geometry panel ────────────────────────────────────────────────────────────
ax_geom.set_xlim(-2.5, 2.5)
ax_geom.set_ylim(-2.5, 2.5)
ax_geom.set_aspect('equal')
ax_geom.set_xticks([]); ax_geom.set_yticks([])
ax_geom.set_title('Lens Plane  ·  Critical curve & caustic  (Einstein radii)',
                  color=TEXT_COL, fontsize=10, pad=6)

# Einstein ring (unit circle)
theta_ring = np.linspace(0, 2*np.pi, 300)
ax_geom.plot(np.cos(theta_ring), np.sin(theta_ring),
             color=RING_C, linewidth=1.5, linestyle='-', alpha=0.4, zorder=3,
             label='Einstein ring')
ax_geom.text(0.72, 0.72, 'θ_E', color=RING_C, fontsize=9)

# Lens at origin
ax_geom.add_patch(Circle((0, 0), 0.08, facecolor=LENS_C, zorder=8))
ax_geom.text(0.12, 0.12, 'Lens', color=LENS_C, fontsize=8)

# Planet in lens plane
p_lens_x = SEP_P * np.cos(ALPHA_P)
p_lens_y = SEP_P * np.sin(ALPHA_P)
planet_geom = Circle((p_lens_x, p_lens_y), 0.04, facecolor=PLANET_C, zorder=9)
ax_geom.add_patch(planet_geom)
ax_geom.text(p_lens_x + 0.08, p_lens_y + 0.08, 'Planet', color=PLANET_C, fontsize=8)

# Einstein radii scale bar
ax_geom.plot([-2.2, -1.2], [-2.2, -2.2], color=TEXT_COL, linewidth=2)
ax_geom.text(-1.7, -2.35, '1 θ_E', color=TEXT_COL, fontsize=8, ha='center')

# Source trajectory in caustic geometry
TRAJ_X_GEOM = np.linspace(-2.5, 2.5, 200)
TRAJ_Y_GEOM = np.full(200, -U_MIN)
ax_geom.plot(TRAJ_X_GEOM, TRAJ_Y_GEOM, color=SOURCE_C, linewidth=1,
             linestyle='--', alpha=0.5, zorder=2, label='Source path')

# Source position marker (will animate)
source_geom = ax_geom.plot([], [], 'o', color=SOURCE_C, markersize=7, zorder=10)[0]
source_geom_trail, = ax_geom.plot([], [], '-', color=SOURCE_C,
                                    linewidth=1.5, alpha=0.5, zorder=9)

# Impact parameter annotation
u_ann = ax_geom.annotate(
    '', xy=(0, -U_MIN), xytext=(0, 0),
    arrowprops=dict(arrowstyle='<->', color='#aaaaaa', lw=1))
ax_geom.text(0.1, -U_MIN/2, f'u_min = {U_MIN}', color=TEXT_COL,
             fontsize=8, fontfamily='monospace')

# Planet caustic (approximate: a small diamond/astroid near the planet)
# Caustic near planetary Einstein ring
th_c = np.linspace(0, 2*np.pi, 200)
caust_r = 0.15 * np.sqrt(Q)
cx = p_lens_x + caust_r * np.cos(th_c) * 0.8
cy = p_lens_y + caust_r * np.sin(th_c)
ax_geom.fill(cx, cy, color=CAUST_C, alpha=0.25, zorder=6)
ax_geom.plot(cx, cy, color=CAUST_C, linewidth=1.5, alpha=0.6, zorder=7,
             label='Planet caustic')
ax_geom.text(p_lens_x + 0.08, p_lens_y - 0.25, 'Caustic', color=CAUST_C, fontsize=8)

# Magnification colour bar (text indicator)
geom_mag_txt = ax_geom.text(0.02, 0.96, 'A = 1.00×',
                              transform=ax_geom.transAxes,
                              color=RING_C, fontsize=10,
                              fontfamily='monospace', fontweight='bold')

ax_geom.legend(loc='lower right', facecolor=BG, edgecolor='#30363d',
               labelcolor=TEXT_COL, fontsize=7.5)

# ── Light curve panel ────────────────────────────────────────────────────────
ax_lc.set_title('Microlensing Light Curve', color=TEXT_COL, fontsize=10, pad=4)
ax_lc.set_xlabel('Time  (t − t₀)  /  t_E', color=TEXT_COL, fontsize=9)
ax_lc.set_ylabel('Magnification  A(t)', color=TEXT_COL, fontsize=9)
ax_lc.tick_params(colors=TEXT_COL, labelsize=8)
ax_lc.grid(True, color=GRID_COL, linewidth=0.6, alpha=0.9)

T_NORM = T_PHYS / T_E  # normalised time axis (in units of t_E)
ax_lc.set_xlim(T_NORM[0], T_NORM[-1])
ax_lc.set_ylim(0.85, max(MAG_TOTAL) * 1.12)

# Baseline
ax_lc.axhline(1.0, color='#30363d', linewidth=0.8, linestyle='--', zorder=2)
ax_lc.text(T_NORM[0] + 0.05, 1.02, 'Baseline (unmagnified)', color=DIM_COL, fontsize=8)

# Peak annotation
ax_lc.axvline(T_0 / T_E, color='#30363d', linewidth=0.8, linestyle=':', alpha=0.5)
ax_lc.text(T_0/T_E + 0.05, peak_mag * 0.96,
           f'Peak  A = {peak_mag:.2f}×\n(u_min = {U_MIN})',
           color=LC_C, fontsize=8, fontfamily='monospace')

# Planet spike annotation
spike_t_norm = T_PHYS[spike_idx] / T_E
ax_lc.axvspan(spike_t_norm - 0.12, spike_t_norm + 0.12,
               color=SPIKE_C, alpha=0.08, zorder=1)
ax_lc.text(spike_t_norm + 0.13, spike_mag * 0.97,
           f'Planet spike\nA = {spike_mag:.2f}×',
           color=SPIKE_C, fontsize=8, fontfamily='monospace')

# Pre-draw theoretical curves (faint guide)
ax_lc.plot(T_NORM, MAG_PSPL, color=LC_C, linewidth=0.8, alpha=0.12, zorder=3)
ax_lc.plot(T_NORM, MAG_TOTAL, color=SPIKE_C, linewidth=0.8, alpha=0.10, zorder=3)

# Paczynski model label
ax_lc.text(T_NORM[0] + 0.05, max(MAG_TOTAL) * 1.06,
           'Black: Paczynski (point-lens) model     '
           'Orange: With planet perturbation',
           color=DIM_COL, fontsize=8, fontfamily='monospace')

# Running light curve
lc_pspl,  = ax_lc.plot([], [], color=LC_C, linewidth=2.2, zorder=6, label='PSPL model')
lc_total, = ax_lc.plot([], [], color=SPIKE_C, linewidth=2.0, zorder=7,
                         linestyle='--', label='With planet')
lc_dot,   = ax_lc.plot([], [], 'o', color='white', markersize=6, zorder=9)

ax_lc.legend(loc='upper left', facecolor=BG, edgecolor='#30363d',
             labelcolor=TEXT_COL, fontsize=8)

# ── Animation ────────────────────────────────────────────────────────────────
def init():
    lc_pspl.set_data([], [])
    lc_total.set_data([], [])
    lc_dot.set_data([], [])
    return lc_pspl, lc_total, lc_dot

def animate(frame):
    t     = TIMES[frame]
    t_p   = T_PHYS[frame]
    u_now = U_T[frame]
    mag   = MAG_TOTAL[frame]
    t_norm_now = T_NORM[frame]

    # ── Lens position in sky view ──
    # Lens moves from left to right
    progress = TIMES[frame] / DURATION
    lens_x   = -SKY_SIZE * 0.9 + progress * SKY_SIZE * 1.8
    lens_y   = TRAJ_Y
    lens_star.center = (lens_x, lens_y)
    for i, r in enumerate([0.50, 0.35]):
        lens_glows[i].center = (lens_x, lens_y)

    # Planet position (offset from lens, fixed relative geometry)
    pxs = lens_x + SEP_P * np.cos(ALPHA_P) * 0.5
    pys = lens_y + SEP_P * np.sin(ALPHA_P) * 0.5
    planet_sky.center = (pxs, pys)
    lens_lbl.set_position((lens_x + 0.15, lens_y + 0.25))
    planet_lbl.set_position((pxs + 0.1, pys + 0.12))

    # Update connecting line annotation
    angle_arc.xy = (0, 0)
    angle_arc.xytext = (lens_x, lens_y)
    sep_arcsec = np.sqrt(lens_x**2 + lens_y**2)
    distance_txt.set_position((lens_x/2, lens_y/2 + 0.15))
    distance_txt.set_text(f'd = {sep_arcsec:.2f} θ_E')

    # ── Einstein ring (appears/shrinks based on proximity) ──
    # Einstein ring radius = 1 (in normalised units)
    # Map to sky coordinates: when u < 3, ring is visible
    ring_alpha = max(0, min(0.9, (3.0 - u_now) / 2.0))
    ring_radius = 0.40 * (1.0 + 0.0 / (u_now + 0.01))   # ~fixed angular size
    einstein_ring.set_radius(ring_radius)
    einstein_ring.set_alpha(ring_alpha)

    # Two images on either side of source (for u < 2)
    if u_now < 2.0:
        theta_lens = np.arctan2(lens_y - 0, lens_x - 0)
        img_r = ring_radius * 0.85
        img1.center = ( img_r * np.cos(theta_lens + np.pi),
                         img_r * np.sin(theta_lens + np.pi))
        img1.set_radius(0.06 * (2.0 - u_now) / 2.0)
        img1.set_alpha(ring_alpha * 0.6)
        img2.center = (-img_r * 0.6 * np.cos(theta_lens + np.pi),
                       -img_r * 0.6 * np.sin(theta_lens + np.pi))
        img2.set_radius(0.05 * (2.0 - u_now) / 2.0)
        img2.set_alpha(ring_alpha * 0.4)

    # Magnification display
    mag_txt.set_text(f'A = {mag:.2f}×')
    if mag > 2.0:
        mag_txt.set_color(SPIKE_C)
    elif mag > 1.3:
        mag_txt.set_color(LC_C)
    else:
        mag_txt.set_color(RING_C)

    # ── Source position in geometry panel ──
    src_geom_x = t_p / T_E  # source moves along trajectory
    src_geom_x = np.clip(src_geom_x, -2.4, 2.4)
    source_geom.set_data([src_geom_x], [-U_MIN])
    if frame > 1:
        trail_x = T_PHYS[:frame] / T_E
        trail_x = np.clip(trail_x, -2.4, 2.4)
        source_geom_trail.set_data(trail_x, np.full(frame, -U_MIN))

    # Update geometry magnification label
    geom_mag_txt.set_text(f'A = {mag:.2f}×')
    geom_mag_txt.set_color(SPIKE_C if mag > 2.0 else LC_C if mag > 1.3 else RING_C)

    # ── Light curve ──
    lc_pspl.set_data(T_NORM[:frame+1], MAG_PSPL[:frame+1])
    lc_total.set_data(T_NORM[:frame+1], MAG_TOTAL[:frame+1])
    lc_dot.set_data([t_norm_now], [mag])

    return (lc_pspl, lc_total, lc_dot, lens_star, planet_sky,
            einstein_ring, img1, img2, mag_txt, source_geom)

ani = animation.FuncAnimation(fig, animate, frames=N_FRAMES,
                               init_func=init, interval=1000/FPS, blit=False)

# Info box
fig.text(0.5, 0.04,
         f'Event: u_min = {U_MIN}  ·  Peak A = {peak_mag:.1f}×  '
         f'·  Planet spike A = {spike_mag:.1f}×  ·  q = M_planet/M_star = {Q}',
         ha='center', color=DIM_COL, fontsize=9, fontfamily='monospace')

plt.tight_layout(rect=[0, 0.04, 1, 0.93])

if SAVE:
    print("Saving microlensing.gif …")
    ani.save('microlensing.gif', writer='pillow', fps=FPS, dpi=100)
    print("Saved.")
else:
    plt.show()
