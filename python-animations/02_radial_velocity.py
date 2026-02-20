"""
Radial Velocity (Doppler Method) — Exoplanet Detection Animation
================================================================
Shows how a planet's gravity makes its star wobble, shifting the
star's spectral lines blue (approaching) or red (receding).

Panels:
  Top-left : Top-down orbital view — star + planet orbiting centre of mass
  Top-right: Stellar spectrum — Na D doublet Doppler-shifting in real time
  Bottom   : Radial velocity curve with measurement scatter

Physics:
  - Star and planet orbit their common centre of mass
  - Radial velocity: v_r(t) = K * sin(2π*t/P + φ)
  - K (semi-amplitude) = 100 m/s  (typical hot Jupiter)
  - Δλ = λ₀ * v_r / c  (Doppler formula)

Usage:
  python 02_radial_velocity.py           # interactive window
  python 02_radial_velocity.py --save    # saves radial_velocity.gif
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
from matplotlib.patches import Circle, FancyArrowPatch
from matplotlib.lines import Line2D
from matplotlib.colors import LinearSegmentedColormap

SAVE = "--save" in sys.argv

# ── Physical parameters ─────────────────────────────────────────────────────
K_AMPLITUDE  = 100.0    # RV semi-amplitude (m/s) — hot Jupiter
ORBITAL_P    = 1.486    # orbital period (days) — KOI-17b
M_STAR       = 1.0      # stellar mass (solar masses)
M_PLANET     = 0.001    # planet/star mass ratio (MJ/MS ≈ 0.001)
# Star wobble is exaggerated in the visual for clarity
WOBBLE_SCALE = 15.0     # visual exaggeration factor

# Orbital radii (normalised)
ORB_R_PLANET = 3.5
ORB_R_STAR   = ORB_R_PLANET * M_PLANET * WOBBLE_SCALE   # exaggerated

FPS       = 30
DURATION  = 10.0
N_FRAMES  = int(FPS * DURATION)
N_ORBITS  = 2.5         # number of complete orbits shown

# Absorption lines to show in spectrum (wavelength in nm)
ABS_LINES = {
    'Hβ':   486.1,
    'Mg I': 518.4,
    'Na D₁': 589.0,
    'Na D₂': 589.6,
    'Hα':   656.3,
}
LAMBDA_MIN, LAMBDA_MAX = 460, 680   # nm range shown
C_LIGHT = 3e8   # speed of light m/s

NOISE_MS = 8.0  # RV measurement noise (m/s)

# ── Color palette ───────────────────────────────────────────────────────────
BG       = '#070b12'
TEXT_COL = '#c9d1d9'
DIM_COL  = '#484f58'
STAR_COL = '#fff8e0'
PLANET_C = '#4a90e2'
RV_COL   = '#58a6ff'
RED_SHIFT = '#ff6b6b'
BLUE_SHIFT = '#6bb8ff'
GRID_COL = '#161b22'
GREEN    = '#3fb950'
ACCENT   = '#f0883e'

# ── Wavelength → RGB (approximate) ──────────────────────────────────────────
def wavelength_to_rgb(wl_nm):
    """Approximate visible wavelength to RGB."""
    if wl_nm < 380: return (0.5, 0, 1.0)
    if wl_nm < 440: t = (wl_nm-380)/60;  return (0.5*(1-t), 0, 1.0)
    if wl_nm < 490: t = (wl_nm-440)/50;  return (0, t, 1.0)
    if wl_nm < 510: t = (wl_nm-490)/20;  return (0, 1.0, 1-t)
    if wl_nm < 580: t = (wl_nm-510)/70;  return (t, 1.0, 0)
    if wl_nm < 645: t = (wl_nm-580)/65;  return (1.0, 1-t, 0)
    if wl_nm < 780: t = (wl_nm-645)/135; return (1.0, 0, 0)
    return (0.4, 0, 0)

# Build spectrum image (static background)
def build_spectrum_bg(width=500, height=60):
    """Create rainbow spectrum background with absorption lines."""
    img = np.zeros((height, width, 3))
    wls = np.linspace(LAMBDA_MIN, LAMBDA_MAX, width)
    for i, wl in enumerate(wls):
        rgb = wavelength_to_rgb(wl)
        # Vignette at edges for aesthetics
        edge_fade = np.clip(min(i, width-i) / (width*0.08), 0, 1)
        img[:, i, :] = [c * edge_fade * 0.85 for c in rgb]
    return img, wls

# ── Pre-compute orbital dynamics ─────────────────────────────────────────────
TIMES  = np.linspace(0, DURATION, N_FRAMES)
PHASES = 2 * np.pi * N_ORBITS * TIMES / DURATION  # orbital phase (radians)

# RV curve (sinusoidal, approaching = negative, receding = positive convention)
VR_TRUE  = K_AMPLITUDE * np.sin(PHASES)  # m/s
rng = np.random.default_rng(99)
VR_MEAS  = VR_TRUE + rng.normal(0, NOISE_MS, N_FRAMES)  # with measurement noise

# Doppler shift: Δλ = λ₀ * v_r / c
def doppler_shift(v_r_ms, lam0_nm):
    return lam0_nm + lam0_nm * v_r_ms / C_LIGHT

# ── Figure layout ────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(15, 8), facecolor=BG)
fig.text(0.5, 0.965, 'Exoplanet Detection: The Radial Velocity (Doppler) Method',
         ha='center', fontsize=17, color='white', fontweight='bold')
fig.text(0.5, 0.935, 'The planet\'s gravity makes the star wobble — shifting its '
         'spectral lines blue or red as measured from Earth',
         ha='center', fontsize=10, color=DIM_COL)

gs = gridspec.GridSpec(2, 2, figure=fig,
                       height_ratios=[1.5, 1.2],
                       width_ratios=[1, 1.1],
                       hspace=0.12, wspace=0.32,
                       left=0.06, right=0.97, top=0.90, bottom=0.09)

ax_orb  = fig.add_subplot(gs[0, 0], facecolor=BG)
ax_spec = fig.add_subplot(gs[0, 1], facecolor=BG)
ax_rv   = fig.add_subplot(gs[1, :], facecolor=BG)

for ax in [ax_orb, ax_spec, ax_rv]:
    ax.set_facecolor(BG)
    for s in ax.spines.values():
        s.set_color('#30363d')

# ── Orbital view ─────────────────────────────────────────────────────────────
ax_orb.set_xlim(-5.5, 5.5)
ax_orb.set_ylim(-5.5, 5.5)
ax_orb.set_aspect('equal')
ax_orb.set_xticks([]); ax_orb.set_yticks([])
ax_orb.set_title('Top-down Orbital View  (star wobble ×15 exaggerated)',
                 color=TEXT_COL, fontsize=9, pad=6)

# Centre of mass marker
ax_orb.plot(0, 0, '+', color='#f0883e', markersize=10, markeredgewidth=1.5, zorder=5)
ax_orb.text(0.15, 0.25, 'CoM', color=ACCENT, fontsize=8)

# Orbit paths
for r, col, lbl in [(ORB_R_PLANET, PLANET_C, ''), (ORB_R_STAR, '#aaaaaa', '')]:
    theta = np.linspace(0, 2*np.pi, 300)
    ax_orb.plot(r*np.cos(theta), r*np.sin(theta),
                color=col, linewidth=0.8, linestyle='--', alpha=0.4, zorder=1)

# Observer direction
ax_orb.annotate('', xy=(0, -5.3), xytext=(0, -3.5),
                arrowprops=dict(arrowstyle='->', color='#8b949e', lw=1.5))
ax_orb.text(0, -5.5, 'Towards Earth', color=TEXT_COL, fontsize=8, ha='center')

# Velocity arrow (on planet, will animate)
planet_orb = Circle((ORB_R_PLANET, 0), 0.35, facecolor=PLANET_C,
                     edgecolor='#88bbff', linewidth=1, zorder=10)
ax_orb.add_patch(planet_orb)

# Star in orbital view (wobbles around CoM)
star_orb = Circle((0, 0), 0.65, facecolor=STAR_COL, zorder=8)
for r in [1.1, 0.9, 0.65]:
    ax_orb.add_patch(Circle((0,0), r, facecolor=STAR_COL,
                             alpha=0.04 if r>0.65 else 1.0, zorder=7))
ax_orb.add_patch(star_orb)

# Radial velocity arrow on star
rv_arrow_ax = ax_orb.annotate('', xy=(0, -1.5), xytext=(0, 0),
                               arrowprops=dict(arrowstyle='->', color=RED_SHIFT, lw=2.5))
rv_label_ax = ax_orb.text(0.3, -1.0, 'v_r', color=RED_SHIFT, fontsize=9,
                            fontfamily='monospace', fontweight='bold')

# ── Spectral panel ────────────────────────────────────────────────────────────
ax_spec.set_xticks([]); ax_spec.set_yticks([])
ax_spec.set_title('Stellar Spectrum  ·  Na D doublet Doppler shift',
                  color=TEXT_COL, fontsize=9, pad=6)

spec_img, wls = build_spectrum_bg(500, 60)
spec_im = ax_spec.imshow(spec_img, extent=[LAMBDA_MIN, LAMBDA_MAX, 0, 1],
                          aspect='auto', origin='lower', zorder=2)

# Reference lines (show rest wavelengths as white dashed)
for name, lam in ABS_LINES.items():
    if LAMBDA_MIN <= lam <= LAMBDA_MAX:
        ax_spec.axvline(lam, color='white', linewidth=0.6,
                        linestyle='--', alpha=0.25, zorder=3)

# Animated absorption lines (thick dark bands that shift)
abs_patches = {}
for name, lam in ABS_LINES.items():
    if LAMBDA_MIN <= lam <= LAMBDA_MAX:
        width = 1.5 if 'Na' in name else 2.5
        patch = ax_spec.axvspan(lam - width/2, lam + width/2,
                                 ymin=0, ymax=1,
                                 color='#000010', alpha=0.92, zorder=5)
        abs_patches[name] = (patch, lam, width)

# Wavelength axis label
ax_spec.set_xlabel('Wavelength (nm)', color=TEXT_COL, fontsize=9)
ax_spec.xaxis.set_visible(True)
ax_spec.set_xlim(LAMBDA_MIN, LAMBDA_MAX)
ax_spec.tick_params(axis='x', colors=TEXT_COL, labelsize=8)

# Na D rest wavelength labels
ax_spec.text(588.5, 0.85, 'Na D  (589 nm)', color='white',
             fontsize=8, alpha=0.7, ha='center', zorder=6)

# Shift amount display
shift_txt = ax_spec.text(0.98, 0.08, 'Δλ = 0.00 pm',
                          transform=ax_spec.transAxes, color=TEXT_COL,
                          fontsize=9, ha='right', fontfamily='monospace')
vr_txt = ax_spec.text(0.02, 0.08, 'v_r = 0 m/s',
                       transform=ax_spec.transAxes, color=TEXT_COL,
                       fontsize=9, ha='left', fontfamily='monospace')
direction_txt = ax_spec.text(0.5, 0.08, '●',
                              transform=ax_spec.transAxes, color=TEXT_COL,
                              fontsize=18, ha='center')

# ── RV panel ─────────────────────────────────────────────────────────────────
ax_rv.set_title('Radial Velocity Curve', color=TEXT_COL, fontsize=10, pad=4)
ax_rv.set_xlabel('Time (days from start of observations)', color=TEXT_COL, fontsize=9)
ax_rv.set_ylabel('Radial Velocity (m/s)', color=TEXT_COL, fontsize=9)
ax_rv.tick_params(colors=TEXT_COL, labelsize=8)
ax_rv.grid(True, color=GRID_COL, linewidth=0.6, alpha=0.9)

T_DAYS = TIMES / DURATION * (N_ORBITS * ORBITAL_P)
ax_rv.set_xlim(0, T_DAYS[-1])
ax_rv.set_ylim(-K_AMPLITUDE * 1.55, K_AMPLITUDE * 1.55)
ax_rv.axhline(0, color='#30363d', linewidth=0.8, linestyle='--', zorder=2)

# Zero-line label
ax_rv.text(0.2, 8, '← receding from Earth', color=DIM_COL, fontsize=8)
ax_rv.text(0.2, -16, '← approaching Earth', color=DIM_COL, fontsize=8)

# Amplitude annotation
ax_rv.annotate('', xy=(T_DAYS[-1]*0.85, K_AMPLITUDE),
               xytext=(T_DAYS[-1]*0.85, 0),
               arrowprops=dict(arrowstyle='<->', color=ACCENT, lw=1.5))
ax_rv.text(T_DAYS[-1]*0.86, K_AMPLITUDE/2,
           f' K = {K_AMPLITUDE:.0f} m/s', color=ACCENT, fontsize=9,
           va='center', fontfamily='monospace')

# Planet mass hint text
ax_rv.text(T_DAYS[-1]*0.5, -K_AMPLITUDE * 1.4,
           f'Period P = {ORBITAL_P} d   |   K = {K_AMPLITUDE} m/s   '
           f'→   Mp sin(i) ≈ {K_AMPLITUDE/28.4:.1f} MJ',
           color=DIM_COL, fontsize=8, ha='center', fontfamily='monospace')

# Pre-draw full theoretical curve (faint)
ax_rv.plot(T_DAYS, VR_TRUE, color=RV_COL, linewidth=1.0, alpha=0.15, zorder=3)

# Measurement points and running line
rv_line,   = ax_rv.plot([], [], color=RV_COL, linewidth=2, zorder=6)
rv_points, = ax_rv.plot([], [], 'o', color=RV_COL, markersize=4,
                         alpha=0.7, zorder=7)
rv_dot,    = ax_rv.plot([], [], 'o', color=ACCENT, markersize=7, zorder=9)
rv_label   = ax_rv.text(0.02, 0.93, 'Approaching  (blueshift)',
                         transform=ax_rv.transAxes, color=BLUE_SHIFT,
                         fontsize=9, fontfamily='monospace')

# ── Animation ────────────────────────────────────────────────────────────────
def init():
    rv_line.set_data([], [])
    rv_points.set_data([], [])
    rv_dot.set_data([], [])
    return rv_line, rv_points, rv_dot

def animate(frame):
    t    = TIMES[frame]
    phi  = PHASES[frame]
    vr   = VR_TRUE[frame]
    t_d  = T_DAYS[frame]

    # ── Orbital positions ──
    p_angle = phi
    planet_orb.center = (ORB_R_PLANET * np.cos(p_angle),
                          ORB_R_PLANET * np.sin(p_angle))
    # Star wobbles around CoM (opposite to planet, tiny but exaggerated)
    s_angle = phi + np.pi
    sx = ORB_R_STAR * np.cos(s_angle)
    sy = ORB_R_STAR * np.sin(s_angle)
    star_orb.center = (sx, sy)

    # Velocity arrow on star (along y = towards/away from observer at bottom)
    # Component towards observer (downward in plot = towards Earth)
    v_y_component = -np.sin(p_angle)  # towards Earth = when planet moves past us
    arrow_len = v_y_component * 2.0
    rv_arrow_ax.set_position((sx, sy))
    rv_arrow_ax.xy = (sx, sy + arrow_len)
    rv_arrow_ax.xytext = (sx, sy)
    col = BLUE_SHIFT if vr < 0 else RED_SHIFT
    rv_arrow_ax.arrowprops['color'] = col
    rv_label_ax.set_position((sx + 0.15, sy + arrow_len * 0.5))
    rv_label_ax.set_color(col)
    rv_label_ax.set_text(f'{vr:+.0f} m/s')

    # ── Spectrum Doppler shift ──
    delta_lam_pm = {}
    for name, (patch, lam0, width) in abs_patches.items():
        new_lam = doppler_shift(vr, lam0)  # shifted wavelength
        dl = (new_lam - lam0) * 1000  # nm → pm
        delta_lam_pm[name] = dl
        # Update patch position (remove and redraw via set_xy)
        verts = patch.get_xy()
        shift = new_lam - lam0
        verts[:, 0] += 0   # we'll use a simpler approach:
        # set x data of the patch
        xy = patch.get_xy()
        mid = (xy[0, 0] + xy[2, 0]) / 2
        w = xy[2, 0] - xy[0, 0]
        new_left = new_lam - lam0 + xy[0, 0] - mid + lam0 - w/2
        patch.set_xy(np.array([
            [new_lam - w/2, 0],
            [new_lam - w/2, 1],
            [new_lam + w/2, 1],
            [new_lam + w/2, 0],
            [new_lam - w/2, 0],
        ]))

    # Shift display
    na_dl = delta_lam_pm.get('Na D₁', 0)
    shift_txt.set_text(f'Δλ(Na D) = {na_dl:+.3f} pm')
    vr_txt.set_text(f'v_r = {vr:+.1f} m/s')
    if abs(vr) < 5:
        direction_txt.set_text('●  at rest')
        direction_txt.set_color(TEXT_COL)
        rv_label.set_text('Near rest velocity')
        rv_label.set_color(TEXT_COL)
    elif vr > 0:
        direction_txt.set_text('● → redshift (receding)')
        direction_txt.set_color(RED_SHIFT)
        rv_label.set_text('Receding from Earth  (redshift)')
        rv_label.set_color(RED_SHIFT)
    else:
        direction_txt.set_text('← blueshift (approaching)')
        direction_txt.set_color(BLUE_SHIFT)
        rv_label.set_text('Approaching Earth  (blueshift)')
        rv_label.set_color(BLUE_SHIFT)

    # ── RV curve ──
    rv_line.set_data(T_DAYS[:frame+1], VR_TRUE[:frame+1])
    rv_points.set_data(T_DAYS[:frame+1:4], VR_MEAS[:frame+1:4])  # sparse points
    rv_dot.set_data([t_d], [vr])

    return (rv_line, rv_points, rv_dot, planet_orb, star_orb,
            shift_txt, vr_txt, direction_txt, rv_label)

ani = animation.FuncAnimation(fig, animate, frames=N_FRAMES,
                               init_func=init, interval=1000/FPS, blit=False)

legend_elements = [
    Line2D([0], [0], color=RV_COL, lw=2, label=f'RV curve  K = {K_AMPLITUDE} m/s'),
    Line2D([0], [0], color=BLUE_SHIFT, lw=0, marker='o', markersize=5,
           label='Blueshift  (star approaching)'),
    Line2D([0], [0], color=RED_SHIFT, lw=0, marker='o', markersize=5,
           label='Redshift  (star receding)'),
]
ax_rv.legend(handles=legend_elements, loc='upper right',
             facecolor=BG, edgecolor='#30363d',
             labelcolor=TEXT_COL, fontsize=8)

plt.tight_layout(rect=[0, 0, 1, 0.93])

if SAVE:
    print("Saving radial_velocity.gif …")
    ani.save('radial_velocity.gif', writer='pillow', fps=FPS, dpi=100)
    print("Saved.")
else:
    plt.show()
