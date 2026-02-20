"""
Transit Photometry — Exoplanet Detection Animation
===================================================
Simulates a planet transiting its host star with real-time light curve.

Panels:
  Top-left : Stellar disk view  — planet silhouette crossing the star face
  Top-right: System side view   — edge-on orbit geometry
  Bottom   : Real-time Kepler-style light curve with annotations

Physics:
  - Exact circular-overlap transit depth (geometric)
  - Quadratic limb darkening: I(mu) = 1 - u1*(1-mu) - u2*(1-mu)^2
  - Photon noise ~ Gaussian(0, 150 ppm)

Usage:
  python 01_transit_method.py           # interactive window
  python 01_transit_method.py --save    # saves transit_method.gif
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
from matplotlib.patches import Circle, FancyArrowPatch
from matplotlib.lines import Line2D

SAVE = "--save" in sys.argv

# ── Physical parameters ─────────────────────────────────────────────────────
R_STAR   = 1.0          # stellar radius (normalised)
R_PLANET = 0.13         # planet/star radius ratio  (Rp/Rs)
IMPACT   = 0.10         # impact parameter (b = 0 → central transit)
ORB_R    = 4.5          # orbital radius in stellar radii (for side view)
U1, U2   = 0.40, 0.26  # quadratic limb darkening coefficients (solar-type)

# Animation timing
FPS       = 30
DURATION  = 9.0         # seconds
N_FRAMES  = int(FPS * DURATION)
NOISE_PPM = 180         # photon noise level in parts per million

# Transit timing (in animation seconds)
T_CONTACT1 = 1.8   # planet first touches stellar limb
T_CONTACT2 = 2.5   # planet fully on stellar disk
T_CONTACT3 = 6.5   # planet starts leaving
T_CONTACT4 = 7.2   # planet fully off disk

# ── Color palette ───────────────────────────────────────────────────────────
BG         = '#070b12'
STAR_COL   = '#fff8e0'
PLANET_COL = '#2d5fa6'
LC_COL     = '#58a6ff'
TEXT_COL   = '#c9d1d9'
DIM_COL    = '#484f58'
ACCENT     = '#f0883e'
GREEN      = '#3fb950'
PURPLE     = '#bc8cff'
GRID_COL   = '#161b22'

# ── Helper: circular segment overlap (exact geometry) ───────────────────────
def circle_overlap(d, r1, r2):
    """Area of intersection of two circles with radii r1, r2 separated by d."""
    if d >= r1 + r2:
        return 0.0
    if d + r2 <= r1:
        return np.pi * r2 * r2
    if d + r1 <= r2:
        return np.pi * r1 * r1
    cos_a = np.clip((r1**2 + d**2 - r2**2) / (2*r1*d + 1e-14), -1, 1)
    cos_b = np.clip((r2**2 + d**2 - r1**2) / (2*r2*d + 1e-14), -1, 1)
    a = np.arccos(cos_a)
    b = np.arccos(cos_b)
    return r1**2*(a - np.sin(a)*np.cos(a)) + r2**2*(b - np.sin(b)*np.cos(b))

def transit_flux(px, py):
    """Flux fraction during transit with limb darkening (numerical integration)."""
    d = np.sqrt(px**2 + py**2)
    overlap = circle_overlap(d, R_STAR, R_PLANET)
    if overlap == 0:
        return 1.0
    # Weight blocked area by local intensity at planet centre position
    r_centre = min(d, R_STAR - 1e-6) / R_STAR
    mu = np.sqrt(max(0.0, 1.0 - r_centre**2))
    local_I = 1.0 - U1*(1.0 - mu) - U2*(1.0 - mu)**2
    # Normalisation (disk-integrated intensity)
    I_total = 1.0 - U1/3.0 - U2/6.0
    flux_drop = overlap / (np.pi * R_STAR**2) * local_I / I_total
    return max(0.0, 1.0 - flux_drop)

# ── Pre-compute planet trajectory and flux ───────────────────────────────────
TIMES = np.linspace(0, DURATION, N_FRAMES)

# Planet moves linearly from left to right across/past the stellar disk
X_START = -(R_STAR + R_PLANET + 0.8)
X_END   =  (R_STAR + R_PLANET + 0.8)

rng = np.random.default_rng(42)
NOISE = rng.normal(0, NOISE_PPM * 1e-6, N_FRAMES)

PX = X_START + (X_END - X_START) * TIMES / DURATION
PY = np.full(N_FRAMES, IMPACT)
FLUXES = np.array([transit_flux(px, py) for px, py in zip(PX, PY)]) + NOISE

DEPTH = R_PLANET**2  # theoretical depth (no LD)

# ── Figure layout ────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(15, 8), facecolor=BG)
fig.text(0.5, 0.965, 'Exoplanet Detection: The Transit Method',
         ha='center', fontsize=17, color='white', fontweight='bold',
         fontfamily='DejaVu Sans')
fig.text(0.5, 0.935, 'A planet crossing its star blocks a tiny fraction of light — '
         'creating a measurable dip in brightness',
         ha='center', fontsize=10, color=DIM_COL)

gs = gridspec.GridSpec(2, 2, figure=fig,
                       height_ratios=[1.6, 1.2],
                       width_ratios=[1, 1],
                       hspace=0.10, wspace=0.30,
                       left=0.06, right=0.97, top=0.90, bottom=0.09)

ax_disk = fig.add_subplot(gs[0, 0], facecolor=BG)  # stellar disk view
ax_sys  = fig.add_subplot(gs[0, 1], facecolor=BG)  # system side view
ax_lc   = fig.add_subplot(gs[1, :], facecolor=BG)  # light curve (full width)

for ax in [ax_disk, ax_sys, ax_lc]:
    ax.set_facecolor(BG)
    for s in ax.spines.values():
        s.set_color('#30363d')

# ── Stellar disk panel ───────────────────────────────────────────────────────
ax_disk.set_xlim(-1.8, 1.8)
ax_disk.set_ylim(-1.8, 1.8)
ax_disk.set_aspect('equal')
ax_disk.set_xticks([]); ax_disk.set_yticks([])
ax_disk.set_title('Stellar Disk  (Observer View)', color=TEXT_COL, fontsize=10, pad=6)

# Limb-darkened star using nested filled circles
N_LD = 50
for i in range(N_LD, 0, -1):
    r = R_STAR * i / N_LD
    mu = np.sqrt(1.0 - (r/R_STAR)**2)
    brightness = 1.0 - U1*(1-mu) - U2*(1-mu)**2
    brightness = max(0.05, brightness)
    color_val = brightness * 0.98
    c = Circle((0, 0), r, color=(min(1, color_val+0.02),
                                  min(1, color_val*0.96),
                                  min(1, color_val*0.78)),
               zorder=2+i)
    ax_disk.add_patch(c)

# Star edge glow
star_edge = Circle((0, 0), R_STAR, fill=False,
                   edgecolor='#ffd060', linewidth=1.5, alpha=0.4, zorder=60)
ax_disk.add_patch(star_edge)

# Planet silhouette (will animate)
planet_disk = Circle((X_START, IMPACT), R_PLANET,
                      facecolor='#030610', edgecolor='#4477aa',
                      linewidth=1.2, zorder=100)
ax_disk.add_patch(planet_disk)

# Size labels
ax_disk.text(-1.65, -1.65,
             f'R★ = {R_STAR:.1f} R☉\nRp/R★ = {R_PLANET:.2f}',
             color=DIM_COL, fontsize=8, va='bottom', fontfamily='monospace')

# Phase label
phase_text = ax_disk.text(0, 1.65, 'Pre-transit baseline',
                           ha='center', color=TEXT_COL, fontsize=9,
                           fontfamily='monospace')

# ── System side-view panel ───────────────────────────────────────────────────
ax_sys.set_xlim(-6.5, 6.5)
ax_sys.set_ylim(-3.5, 3.5)
ax_sys.set_aspect('equal')
ax_sys.set_xticks([]); ax_sys.set_yticks([])
ax_sys.set_title('System (Side View — Edge-on)', color=TEXT_COL, fontsize=10, pad=6)

# Orbit path (ellipse, slight tilt for 3D look)
theta = np.linspace(0, 2*np.pi, 300)
ox = ORB_R * np.cos(theta)
oy = ORB_R * 0.18 * np.sin(theta)
ax_sys.plot(ox, oy, color='#21262d', linewidth=1, linestyle='--', zorder=1)

# Observer direction arrow
ax_sys.annotate('', xy=(6.5, 0), xytext=(4.2, 0),
                arrowprops=dict(arrowstyle='->', color='#8b949e', lw=1.5))
ax_sys.text(6.55, 0, '  Earth', color=TEXT_COL, fontsize=8, va='center')

# Star (system view)
for r in [1.2, 1.0, 0.7, 0.5]:
    ax_sys.add_patch(Circle((0,0), r, color=STAR_COL,
                            alpha=0.06 if r > 0.7 else 1.0, zorder=3))
ax_sys.add_patch(Circle((0, 0), 0.7, color=STAR_COL, zorder=4))

# Stellar radius arrow
ax_sys.annotate('', xy=(0.7, 0), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color='#ffd060', lw=1))
ax_sys.text(0.35, 0.15, 'R★', color='#ffd060', fontsize=8, ha='center')

# Light rays (shown during transit)
rays_x = np.linspace(1.5, 6.0, 5)
rays = [ax_sys.plot([rx, rx+0.01], [0, 0], color='#ffd060', linewidth=0.8, alpha=0.3, zorder=2)[0]
        for rx in rays_x]

# Planet (system view, will animate)
planet_sys = Circle((ORB_R, 0), 0.28, facecolor=PLANET_COL, edgecolor='#88bbff',
                    linewidth=0.8, zorder=10)
ax_sys.add_patch(planet_sys)

# ── Light curve panel ────────────────────────────────────────────────────────
ax_lc.set_title('Real-time Kepler-style Light Curve', color=TEXT_COL, fontsize=10, pad=4)
ax_lc.set_xlabel('Time (hours from observation start)', color=TEXT_COL, fontsize=9)
ax_lc.set_ylabel('Normalised Flux', color=TEXT_COL, fontsize=9)
ax_lc.tick_params(colors=TEXT_COL, labelsize=8)
ax_lc.grid(True, color=GRID_COL, linewidth=0.6, alpha=0.9)

# X axis in hours (0–24)
T_HOURS = np.linspace(0, 24, N_FRAMES)
ax_lc.set_xlim(0, 24)
ax_lc.set_ylim(0.978, 1.0045)

# Baseline reference line
ax_lc.axhline(1.0, color='#30363d', linewidth=0.8, linestyle='--', zorder=2)
ax_lc.text(0.5, 1.0015, 'Baseline (F = 1.000)', color=DIM_COL, fontsize=7.5,
           fontfamily='monospace')

# Contact phase vertical lines (initially invisible)
contact_times_h = [T_CONTACT1, T_CONTACT2, T_CONTACT3, T_CONTACT4]
contact_times_h = [t / DURATION * 24 for t in contact_times_h]
contact_labels  = ['1st contact', '2nd contact', '3rd contact', '4th contact']
contact_lines   = []
for t_h, lbl in zip(contact_times_h, contact_labels):
    ln = ax_lc.axvline(t_h, color=PURPLE, linewidth=0.8, linestyle=':', alpha=0)
    contact_lines.append(ln)

# Depth annotation (initially invisible)
mid_h = np.mean(contact_times_h[1:3])
depth_ann = ax_lc.annotate(
    '', xy=(mid_h, 1.0 - DEPTH), xytext=(mid_h, 1.0),
    arrowprops=dict(arrowstyle='<->', color=ACCENT, lw=1.5))
depth_txt = ax_lc.text(mid_h + 0.5, 1.0 - DEPTH/2,
                        f'ΔF = {DEPTH*100:.2f}%\n= (Rp/R★)²',
                        color=ACCENT, fontsize=8, va='center',
                        fontfamily='monospace')
depth_ann.set_visible(False)
depth_txt.set_visible(False)

# Planet size annotation (initially invisible)
size_txt = ax_lc.text(23, 0.98,
                      f'Rp = R★ × √(ΔF) = {R_PLANET:.2f} R★',
                      color=GREEN, fontsize=8, ha='right', va='bottom',
                      fontfamily='monospace')
size_txt.set_visible(False)

# Rolling point + line
lc_line,  = ax_lc.plot([], [], color=LC_COL, linewidth=2.0, zorder=8)
lc_point, = ax_lc.plot([], [], 'o', color=ACCENT, markersize=5, zorder=9)

# Status label
status_txt = ax_lc.text(0.02, 0.94, 'Observing…', transform=ax_lc.transAxes,
                         color=TEXT_COL, fontsize=9, fontfamily='monospace')

# ── Animation ────────────────────────────────────────────────────────────────
def init():
    lc_line.set_data([], [])
    lc_point.set_data([], [])
    return (lc_line, lc_point, planet_disk, planet_sys, phase_text,
            depth_ann, depth_txt, size_txt, status_txt)

def animate(frame):
    t = TIMES[frame]
    px, py = PX[frame], PY[frame]
    flux   = FLUXES[frame]
    t_h    = T_HOURS[frame]

    # ── Stellar disk ──
    planet_disk.center = (px, py)
    # Fade planet in/out at limb
    on_disk = abs(px) < R_STAR + R_PLANET + 0.05
    planet_disk.set_visible(on_disk)

    # ── System view (planet orbits slowly) ──
    sys_angle = -np.pi/2 + (t / DURATION) * 2 * np.pi * 0.65
    sx = ORB_R * np.cos(sys_angle)
    sy = ORB_R * 0.18 * np.sin(sys_angle)
    planet_sys.center = (sx, sy)
    # Show rays only when planet in front of star (roughly)
    in_front = np.cos(sys_angle) > 0.0
    for ray in rays:
        ray.set_alpha(0.4 if in_front else 0.1)

    # ── Light curve ──
    lc_line.set_data(T_HOURS[:frame+1], FLUXES[:frame+1])
    lc_point.set_data([t_h], [flux])

    # ── Phase annotation ──
    if t < T_CONTACT1:
        phase_text.set_text('Pre-transit  ·  Baseline flux')
        phase_text.set_color(TEXT_COL)
        status_txt.set_text('Observing baseline…')
        status_txt.set_color(TEXT_COL)
    elif t < T_CONTACT2:
        phase_text.set_text('Ingress  ·  Planet entering disk')
        phase_text.set_color(PURPLE)
        status_txt.set_text('Ingress detected  ↓')
        status_txt.set_color(PURPLE)
        contact_lines[0].set_alpha(0.7)
    elif t < T_CONTACT3:
        pct = (1 - flux) * 100
        phase_text.set_text(f'Full transit  ·  ΔF = {pct:.2f}%  ·  Rp ≈ {R_PLANET:.2f} R★')
        phase_text.set_color(LC_COL)
        status_txt.set_text(f'Transit in progress  —  ΔF = {pct:.3f}%')
        status_txt.set_color(LC_COL)
        contact_lines[1].set_alpha(0.7)
        if frame > N_FRAMES * 0.48:
            depth_ann.set_visible(True)
            depth_txt.set_visible(True)
    elif t < T_CONTACT4:
        phase_text.set_text('Egress  ·  Planet leaving disk')
        phase_text.set_color(PURPLE)
        status_txt.set_text('Egress  ↑')
        status_txt.set_color(PURPLE)
        contact_lines[2].set_alpha(0.7)
    else:
        phase_text.set_text('Post-transit  ·  Baseline restored')
        phase_text.set_color(GREEN)
        status_txt.set_text('Transit complete!  Planet confirmed candidate.')
        status_txt.set_color(GREEN)
        contact_lines[3].set_alpha(0.7)
        size_txt.set_visible(True)

    return (lc_line, lc_point, planet_disk, planet_sys, phase_text,
            depth_ann, depth_txt, size_txt, status_txt)

ani = animation.FuncAnimation(fig, animate, frames=N_FRAMES,
                               init_func=init, interval=1000/FPS, blit=False)

# ── Legend ───────────────────────────────────────────────────────────────────
legend_elements = [
    Line2D([0], [0], color=LC_COL, lw=2, label='Stellar flux'),
    Line2D([0], [0], color=PURPLE, lw=1, linestyle=':', label='Contact points'),
    Line2D([0], [0], color=ACCENT, lw=1.5, label='Transit depth ΔF = (Rp/R★)²'),
]
ax_lc.legend(handles=legend_elements, loc='lower right',
             facecolor=BG, edgecolor='#30363d',
             labelcolor=TEXT_COL, fontsize=8)

plt.tight_layout(rect=[0, 0, 1, 0.93])

if SAVE:
    print("Saving transit_method.gif …")
    ani.save('transit_method.gif', writer='pillow', fps=FPS, dpi=100)
    print("Saved.")
else:
    plt.show()
