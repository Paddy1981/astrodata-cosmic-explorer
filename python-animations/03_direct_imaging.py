"""
Direct Imaging — Exoplanet Detection Animation
==============================================
Visualises the challenge of imaging an exoplanet next to its star,
and how coronagraphs + infrared observation reveal the planet.

Panels:
  Panel 1 (left)  : Raw optical image — star saturates, planet invisible
  Panel 2 (centre): Coronagraph applied — star blocked, planet revealed
  Panel 3 (right) : Contrast curve — planet brightness vs angular separation

Animation stages:
  0–3s  : Raw image with star glare obscuring planet
  3–6s  : Coronagraph mask applied, speckles fading
  6–9s  : Planet detected, measurements overlaid
  9–12s : Orbit trace builds up

Physics:
  - Star is ~10⁹ brighter than planet in optical; ~10⁶ in mid-infrared
  - Planet position traces an elliptical orbit over time
  - Angular separation ~ arcseconds (nearby stars / long-period planets)

Usage:
  python 03_direct_imaging.py           # interactive window
  python 03_direct_imaging.py --save    # saves direct_imaging.gif
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
from matplotlib.patches import Circle, FancyArrowPatch, Ellipse, Wedge
from matplotlib.lines import Line2D
from matplotlib.colors import LogNorm

SAVE = "--save" in sys.argv

# ── Physical parameters ─────────────────────────────────────────────────────
STAR_FLUX     = 1.0e9      # star: 10⁹ (arbitrary units)
PLANET_FLUX   = 1.0        # planet: 1 (in reflected light)
PLANET_FLUX_IR = 1.0e3     # planet in infrared: 10⁶ contrast → 10³ for vis

PLANET_SEP    = 0.55       # angular separation (arcsec) — like beta Pic b
PLANET_SEP_AU = 10.0       # actual separation in AU for labels

ORB_A = 1.6    # orbit semi-major axis in "image units"
ORB_B = 1.1    # orbit semi-minor axis (inclined orbit)
ORB_PA = 30    # position angle of orbit (degrees)

FPS       = 30
DURATION  = 12.0
N_FRAMES  = int(FPS * DURATION)
IMG_SIZE  = 200            # pixels per panel image

# Timing
T_CORONAGRAPH = 3.0   # coronagraph applied at t=3s
T_PLANET_VIS  = 5.5   # planet visible at t=5.5s
T_ORBIT_START = 8.0   # orbit trace starts at t=8s

# ── Color palette ───────────────────────────────────────────────────────────
BG       = '#070b12'
TEXT_COL = '#c9d1d9'
DIM_COL  = '#484f58'
GREEN    = '#3fb950'
ACCENT   = '#f0883e'
BLUE     = '#58a6ff'
PURPLE   = '#bc8cff'
GRID_COL = '#161b22'
PLANET_C = '#e8a030'   # warm orange — infrared planet colour

# ── Build point-spread function (simulated telescope image) ─────────────────
def gaussian_psf(size, sigma, amplitude=1.0, cx=None, cy=None):
    """2D Gaussian PSF."""
    if cx is None: cx = size // 2
    if cy is None: cy = size // 2
    y, x = np.mgrid[0:size, 0:size]
    r2 = (x - cx)**2 + (y - cy)**2
    return amplitude * np.exp(-r2 / (2 * sigma**2))

def airy_psf(size, sigma, amplitude=1.0, cx=None, cy=None):
    """Airy-disk-like PSF (more realistic telescope diffraction)."""
    if cx is None: cx = size // 2
    if cy is None: cy = size // 2
    y, x = np.mgrid[0:size, 0:size]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    r_scaled = r / sigma
    # Approximate Airy function with Gaussian + Bessel-like rings
    core = np.exp(-r_scaled**2 / 2)
    rings = 0.05 * np.exp(-(r_scaled - 3.5)**2 / 0.8) + \
            0.02 * np.exp(-(r_scaled - 6.0)**2 / 0.8)
    return amplitude * (core + rings)

# Planet position on orbit (animated)
def planet_pos(t):
    """Planet position in image coordinates at time t (image units)."""
    angle = 2 * np.pi * t / DURATION * 0.9 + np.pi * 0.3
    pa_rad = np.radians(ORB_PA)
    x_orb = ORB_A * np.cos(angle)
    y_orb = ORB_B * np.sin(angle)
    # Rotate by position angle
    px = x_orb * np.cos(pa_rad) - y_orb * np.sin(pa_rad)
    py = x_orb * np.sin(pa_rad) + y_orb * np.cos(pa_rad)
    return px, py

def pos_to_pixel(px, py, size=IMG_SIZE, scale=60.0):
    """Convert orbital coordinates to pixel coordinates."""
    cx = size // 2 + px * scale
    cy = size // 2 - py * scale  # y flipped (image convention)
    return int(cx), int(cy)

# Pre-compute static PSF images
STAR_PSF_RAW = airy_psf(IMG_SIZE, sigma=12, amplitude=STAR_FLUX)
SPECKLE_NOISE = np.random.default_rng(7).exponential(0.008, (IMG_SIZE, IMG_SIZE)) * STAR_FLUX * 0.001

rng2 = np.random.default_rng(42)

# ── Figure setup ─────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(15, 8), facecolor=BG)
fig.text(0.5, 0.965, 'Exoplanet Detection: Direct Imaging',
         ha='center', fontsize=17, color='white', fontweight='bold')
fig.text(0.5, 0.935,
         'The star is ~10⁹× brighter than its planet in visible light — '
         'a coronagraph blocks the star to reveal the planet',
         ha='center', fontsize=10, color=DIM_COL)

gs = gridspec.GridSpec(1, 3, figure=fig,
                       wspace=0.28,
                       left=0.05, right=0.97, top=0.90, bottom=0.10)

ax_raw  = fig.add_subplot(gs[0, 0], facecolor=BG)
ax_cor  = fig.add_subplot(gs[0, 1], facecolor=BG)
ax_con  = fig.add_subplot(gs[0, 2], facecolor=BG)

for ax in [ax_raw, ax_cor, ax_con]:
    ax.set_facecolor(BG)
    for s in ax.spines.values():
        s.set_color('#30363d')

# ── Raw image panel ───────────────────────────────────────────────────────────
ax_raw.set_xticks([]); ax_raw.set_yticks([])
ax_raw.set_title('① Raw Optical Image  (log scale)',
                 color=TEXT_COL, fontsize=10, pad=6)
ax_raw.text(0.5, -0.03, 'Star glare overwhelms the entire field',
            transform=ax_raw.transAxes, ha='center',
            color=ACCENT, fontsize=8)

# Build raw image (star only, planet invisible)
raw_img_data = STAR_PSF_RAW + SPECKLE_NOISE
im_raw = ax_raw.imshow(raw_img_data, cmap='hot', origin='lower',
                        norm=LogNorm(vmin=1e3, vmax=STAR_FLUX),
                        extent=[-1, 1, -1, 1])

ax_raw.text(-0.92, 0.88, '★', color='white', fontsize=22, alpha=0.95,
            transform=ax_raw.transData)
ax_raw.text(-0.65, 0.80, f'Flux ~ {STAR_FLUX:.0e}',
            color='white', fontsize=8, fontfamily='monospace')
raw_planet_marker, = ax_raw.plot([], [], 'o', color=PLANET_C,
                                   markersize=0, alpha=0)  # invisible initially
ax_raw.text(-0.92, -0.92, '? Planet hidden\n  in star glare',
            color=ACCENT, fontsize=8, alpha=0.7)

# ── Coronagraph image panel ───────────────────────────────────────────────────
ax_cor.set_xticks([]); ax_cor.set_yticks([])
ax_cor.set_title('② Coronagraph + Infrared  (after processing)',
                 color=TEXT_COL, fontsize=10, pad=6)
ax_cor.text(0.5, -0.03, 'Star masked — thermal emission from planet detected',
            transform=ax_cor.transAxes, ha='center',
            color=GREEN, fontsize=8)

# Suppressed star image (residual speckles)
suppressed = np.zeros((IMG_SIZE, IMG_SIZE))
# Low-level residual speckles
speckle_mask = rng2.random((IMG_SIZE, IMG_SIZE))
residual = STAR_PSF_RAW * 1e-5 + rng2.exponential(0.5, (IMG_SIZE, IMG_SIZE))
im_cor = ax_cor.imshow(residual, cmap='inferno', origin='lower',
                        norm=LogNorm(vmin=0.1, vmax=PLANET_FLUX_IR * 1.5),
                        extent=[-1, 1, -1, 1])

# Coronagraph occulting mask circle (will shrink away when applied)
occulter = Circle((0, 0), 0.0, facecolor='#111111',
                   edgecolor='#333333', linewidth=2, zorder=10)
ax_cor.add_patch(occulter)

# Planet blob in coronagraph image (will animate in)
planet_cor_img = ax_cor.imshow(
    np.zeros((IMG_SIZE, IMG_SIZE)), cmap='inferno', origin='lower',
    norm=LogNorm(vmin=0.1, vmax=PLANET_FLUX_IR * 1.5),
    extent=[-1, 1, -1, 1], alpha=0)

planet_cor_label = ax_cor.text(0, 0, '', color=PLANET_C,
                                fontsize=9, ha='center', va='bottom',
                                fontfamily='monospace')
orbit_trace, = ax_cor.plot([], [], '--', color='#60a060', linewidth=1,
                            alpha=0.6, zorder=5)

# Annotations
sep_ann = ax_cor.annotate('', xy=(0, 0), xytext=(0, 0),
                           arrowprops=dict(arrowstyle='->', color=BLUE, lw=1.2))
sep_txt = ax_cor.text(0, 0, '', color=BLUE, fontsize=8, fontfamily='monospace')

# ── Contrast curve panel ───────────────────────────────────────────────────────
ax_con.set_title('③ Contrast Curve  (detection limit)',
                 color=TEXT_COL, fontsize=10, pad=6)
ax_con.set_xlabel('Angular separation (arcsec)', color=TEXT_COL, fontsize=9)
ax_con.set_ylabel('Contrast  (Δ magnitudes)', color=TEXT_COL, fontsize=9)
ax_con.tick_params(colors=TEXT_COL, labelsize=8)
ax_con.grid(True, color=GRID_COL, linewidth=0.6, alpha=0.9)

# Typical JWST/GPI contrast curve
sep_arr = np.linspace(0.1, 2.0, 200)
contrast_optical = 8 - 3.5 * np.log10(sep_arr / 0.1)  # magnitude contrast
contrast_ir      = 12 - 3.0 * np.log10(sep_arr / 0.1)

ax_con.plot(sep_arr, contrast_optical, color=BLUE, linewidth=2,
            label='Optical (SPHERE/GPI)', zorder=5)
ax_con.plot(sep_arr, contrast_ir, color=ACCENT, linewidth=2,
            linestyle='--', label='Mid-IR (JWST MIRI)', zorder=5)

ax_con.axhline(15, color='#30363d', linewidth=0.8, linestyle=':')
ax_con.axhline(20, color='#30363d', linewidth=0.8, linestyle=':')
ax_con.text(1.8, 15.3, 'Hot Jupiter', color=DIM_COL, fontsize=8, ha='right')
ax_con.text(1.8, 20.3, 'Earth-like', color=DIM_COL, fontsize=8, ha='right')

ax_con.set_xlim(0, 2.0)
ax_con.set_ylim(4, 26)
ax_con.invert_yaxis()  # higher contrast (larger Δmag) at top

# Planet marker on contrast curve
planet_contrast = PLANET_SEP  # separation
planet_delta_mag = 15.8        # planet magnitude contrast
planet_con_pt, = ax_con.plot([PLANET_CONTRAST := PLANET_SEP],
                              [planet_delta_mag], '*',
                              color=PLANET_C, markersize=0, zorder=8)
planet_con_label = ax_con.text(PLANET_SEP + 0.05, planet_delta_mag - 0.3,
                                '', color=PLANET_C, fontsize=8,
                                fontfamily='monospace')

ax_con.legend(loc='lower right', facecolor=BG, edgecolor='#30363d',
              labelcolor=TEXT_COL, fontsize=8)

# Status text
status_txt = fig.text(0.5, 0.04,
                       'Stage 1 of 3: Raw observation — star glare obscures planet',
                       ha='center', color=ACCENT, fontsize=10,
                       fontfamily='monospace')

# ── Animation ────────────────────────────────────────────────────────────────
TIMES = np.linspace(0, DURATION, N_FRAMES)
orbit_px_list, orbit_py_list = [], []

def init():
    return (im_raw, im_cor, planet_cor_img, orbit_trace,
            planet_con_pt, planet_con_label)

def animate(frame):
    t = TIMES[frame]
    px, py = planet_pos(t)

    # ── Raw panel: raw image stays mostly static ──
    # Add a slight pulsing glow to emphasize star glare
    glare_mod = 1.0 + 0.03 * np.sin(t * 4)
    im_raw.set_data(raw_img_data * glare_mod)

    # ── Coronagraph panel ──
    stage1 = t < T_CORONAGRAPH       # raw observation
    stage2 = T_CORONAGRAPH <= t < T_PLANET_VIS  # coronagraph applying
    stage3 = t >= T_PLANET_VIS       # planet visible

    if stage1:
        # Occulter not visible yet
        occulter.set_radius(0.0)
        im_cor.set_alpha(0.5)
        planet_cor_img.set_alpha(0)
        planet_cor_label.set_text('')
    elif stage2:
        # Occulter growing in
        progress = (t - T_CORONAGRAPH) / (T_PLANET_VIS - T_CORONAGRAPH)
        occulter.set_radius(0.18 * progress)
        # Speckles fading
        fade = 1.0 - progress * 0.8
        im_cor.set_alpha(fade * 0.5)
        planet_cor_img.set_alpha(0)
    elif stage3:
        occulter.set_radius(0.18)
        im_cor.set_alpha(0.1)

        # Planet PSF in coronagraph view
        reveal_prog = min(1.0, (t - T_PLANET_VIS) / 1.5)
        pcx, pcy = pos_to_pixel(px, py)
        if 10 <= pcx < IMG_SIZE - 10 and 10 <= pcy < IMG_SIZE - 10:
            planet_image = gaussian_psf(IMG_SIZE, sigma=6,
                                         amplitude=PLANET_FLUX_IR * reveal_prog,
                                         cx=pcx, cy=pcy)
            planet_cor_img.set_data(planet_image)
            planet_cor_img.set_alpha(1.0)

            # Label
            pix_to_coord = 2.0 / IMG_SIZE  # -1 to +1 range
            plot_x = (pcx - IMG_SIZE/2) * pix_to_coord
            plot_y = (pcy - IMG_SIZE/2) * pix_to_coord
            planet_cor_label.set_position((plot_x + 0.08, plot_y + 0.08))
            planet_cor_label.set_text(f'🪐 {PLANET_SEP_AU:.0f} AU')
            planet_cor_label.set_color(PLANET_C)
            planet_cor_label.set_alpha(reveal_prog)

            # Separation annotation
            pix_to_coord_x = (pcx/IMG_SIZE)*2 - 1
            pix_to_coord_y = (pcy/IMG_SIZE)*2 - 1
            sep_ann.set_position((0.0, 0.0))
            sep_ann.xy = (pix_to_coord_x, pix_to_coord_y)
            sep_ann.xytext = (0.0, 0.0)
            sep_ann.get_arrowprops()['alpha'] = reveal_prog * 0.7
            sep_txt.set_text(f'{PLANET_SEP}" sep.')
            sep_txt.set_position((pix_to_coord_x/2 + 0.06, pix_to_coord_y/2))
            sep_txt.set_alpha(reveal_prog)

        # Orbit trace
        if t >= T_ORBIT_START:
            orbit_px_list.append(px)
            orbit_py_list.append(py)
            if len(orbit_px_list) > 1:
                ox_pix = np.array(orbit_px_list)
                oy_pix = np.array(orbit_py_list)
                scale_f = 2.0 / (max(ORB_A, ORB_B) * 2.5)
                ox_plot = ox_pix * scale_f
                oy_plot = oy_pix * scale_f
                orbit_trace.set_data(ox_plot, oy_plot)

    # ── Contrast curve: mark planet point ──
    if t >= T_PLANET_VIS:
        reveal_prog = min(1.0, (t - T_PLANET_VIS) / 1.5)
        planet_con_pt.set_markersize(10 * reveal_prog)
        planet_con_label.set_text(f'This\nplanet\n({PLANET_SEP_AU:.0f} AU)')
        planet_con_label.set_alpha(reveal_prog)

    # ── Status text ──
    if stage1:
        status_txt.set_text(
            'Stage 1: Raw optical image — star flux is 10⁹ × planet flux, '
            'completely obscuring it')
        status_txt.set_color(ACCENT)
    elif stage2:
        progress_pct = int((t - T_CORONAGRAPH) / (T_PLANET_VIS - T_CORONAGRAPH) * 100)
        status_txt.set_text(f'Stage 2: Applying coronagraph occulting mask…  '
                             f'Suppressing star speckles  [{progress_pct}%]')
        status_txt.set_color(PURPLE)
    else:
        reveal_pct = int(min(1.0, (t - T_PLANET_VIS) / 1.5) * 100)
        status_txt.set_text(
            f'Stage 3: Planet detected in infrared!  '
            f'Orbital motion visible  [{reveal_pct}%]  —  '
            f'Δmag ≈ {planet_delta_mag:.1f}  ·  Sep = {PLANET_SEP}" ≈ {PLANET_SEP_AU:.0f} AU')
        status_txt.set_color(GREEN)

    return (im_raw, im_cor, planet_cor_img, orbit_trace,
            planet_con_pt, status_txt, occulter)

ani = animation.FuncAnimation(fig, animate, frames=N_FRAMES,
                               init_func=init, interval=1000/FPS, blit=False)

plt.tight_layout(rect=[0, 0.05, 1, 0.93])

if SAVE:
    print("Saving direct_imaging.gif …")
    ani.save('direct_imaging.gif', writer='pillow', fps=FPS, dpi=100)
    print("Saved.")
else:
    plt.show()
