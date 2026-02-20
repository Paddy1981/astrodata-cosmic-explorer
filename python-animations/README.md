# Exoplanet Detection Method Animations

Standalone Python animations illustrating the four main exoplanet detection techniques.
Each script runs as a live matplotlib animation and optionally saves a GIF.

## Animations

| Script | Method | What it shows |
|--------|--------|---------------|
| `01_transit_method.py` | Transit Photometry | Stellar disk view · side view · real-time light curve with ingress/egress and limb darkening |
| `02_radial_velocity.py` | Radial Velocity | Top-down orbital view · Doppler-shifting absorption spectrum · RV sinusoid with planet mass estimate |
| `03_direct_imaging.py` | Direct Imaging | Raw Airy PSF · coronagraph application · IR-revealed planet orbit with contrast curve |
| `04_microlensing.py` | Gravitational Microlensing | Sky source trajectory · Einstein ring · caustic geometry · Paczynski magnification curve with planetary anomaly |

## Requirements

```
pip install -r requirements.txt
```

Python 3.9+ recommended.

## Running

```bash
# Live animation window
python 01_transit_method.py

# Save as GIF (requires Pillow)
python 01_transit_method.py --save
python 02_radial_velocity.py --save
python 03_direct_imaging.py --save
python 04_microlensing.py --save
```

GIFs are written to the same directory as the script (`01_transit_method.gif`, etc.).

## Physics Notes

### Transit Method
- Exact circular-overlap transit flux using arccos lens-intersection formula
- Quadratic limb darkening: `I(μ) = 1 − u₁(1−μ) − u₂(1−μ)²` (u₁=0.40, u₂=0.26, solar-like)
- Models a hot Jupiter with `Rp/R★ ≈ 0.119` (1.42% transit depth)

### Radial Velocity
- Keplerian circular orbit, `K = 100 m/s` semi-amplitude
- Doppler shift: `Δλ/λ = v_r/c`
- Planet minimum mass: `Mp sin(i) ≈ K / 28.4 M_J` (for P=1.486 d, M★=1 M☉)

### Direct Imaging
- Airy PSF for diffraction-limited optics + Gaussian planet PSF
- Star-to-planet contrast: ~10⁹ (optical) vs ~10⁶ (mid-IR)
- Demonstrates why coronagraphs are essential and why IR wavelengths are preferred

### Microlensing
- Paczynski (1986) point-source magnification: `A(u) = (u²+2) / (u·√(u²+4))`
- Planetary anomaly added as Gaussian bump on top of stellar event
- Einstein ring radius shown in sky-plane view; caustic structure shown in lens-plane geometry
