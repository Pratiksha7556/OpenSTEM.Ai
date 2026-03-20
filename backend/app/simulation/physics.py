"""
physics.py — Core physics simulations
Safe version: works even if numpy is not installed
Copy to: backend/app/simulation/physics.py
"""
import math

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


def _linspace(start, stop, n):
    """numpy.linspace fallback."""
    if HAS_NUMPY:
        return list(np.linspace(start, stop, n))
    step = (stop - start) / (n - 1) if n > 1 else 0
    return [start + i * step for i in range(n)]


def projectile_simulation(variables: dict) -> dict:
    v         = float(variables.get("velocity")  or 20)
    angle_deg = float(variables.get("angle")     or 45)
    g         = float(variables.get("gravity")   or 9.8)
    angle     = math.radians(angle_deg)

    vx = v * math.cos(angle)
    vy = v * math.sin(angle)

    total_time = (2 * vy) / g
    max_height = (vy ** 2) / (2 * g)
    range_     = vx * total_time

    points = []
    steps  = 80
    for i in range(steps + 1):
        t  = (total_time / steps) * i
        x  = vx * t
        y  = max(0.0, vy * t - 0.5 * g * t ** 2)
        vt = math.sqrt(vx**2 + (vy - g*t)**2)
        points.append({"x": round(x, 3), "y": round(y, 3),
                        "t": round(t, 3), "v": round(vt, 3)})

    return {
        "type": "projectile",
        "points": points,
        "stats": {
            "max_height":      round(max_height, 2),
            "range":           round(range_, 2),
            "time_of_flight":  round(total_time, 2),
            "initial_velocity":v,
            "angle":           angle_deg,
            "vx":              round(vx, 3),
            "vy_initial":      round(vy, 3),
        }
    }


def pendulum_simulation(variables: dict) -> dict:
    length        = float(variables.get("length")    or 1.0)
    g             = float(variables.get("gravity")   or 9.8)
    amplitude_deg = float(variables.get("amplitude") or 15)
    amplitude     = math.radians(amplitude_deg)

    period = 2 * math.pi * math.sqrt(length / g)
    omega  = math.sqrt(g / length)

    points   = []
    steps    = 120
    duration = 2 * period

    for i in range(steps + 1):
        t     = (duration / steps) * i
        theta = amplitude * math.cos(omega * t)
        x     = length * math.sin(theta)
        y     = -length * math.cos(theta)
        h     = length * (1 - math.cos(theta))
        vel   = math.sqrt(2 * g * h) if h >= 0 else 0
        points.append({
            "x":     round(x, 4),
            "y":     round(y, 4),
            "theta": round(math.degrees(theta), 3),
            "h":     round(h, 4),
            "v":     round(vel, 4),
            "t":     round(t, 3),
        })

    return {
        "type": "pendulum",
        "points": points,
        "stats": {
            "period":            round(period, 3),
            "frequency":         round(1 / period, 3),
            "angular_frequency": round(omega, 3),
            "length":            length,
            "amplitude_degrees": amplitude_deg,
        }
    }


def wave_simulation(variables: dict) -> dict:
    amplitude  = float(variables.get("amplitude")  or 1.0)
    frequency  = float(variables.get("frequency")  or 1.0)
    wave_speed = float(variables.get("velocity")   or 2.0)

    wavelength = wave_speed / frequency
    omega      = 2 * math.pi * frequency
    k          = 2 * math.pi / wavelength

    x_vals  = _linspace(0, 4 * wavelength, 200)
    points  = [{"x": round(x, 4), "y": round(amplitude * math.sin(k * x), 4)}
               for x in x_vals]

    t_vals       = _linspace(0, 4 / frequency, 200)
    time_points  = [{"t": round(t, 4), "y": round(amplitude * math.sin(omega * t), 4)}
                    for t in t_vals]

    return {
        "type": "wave",
        "points":       points,
        "time_points":  time_points,
        "stats": {
            "amplitude":  amplitude,
            "frequency":  frequency,
            "wavelength": round(wavelength, 3),
            "wave_speed": wave_speed,
            "period":     round(1 / frequency, 3),
        }
    }


def circuit_simulation(variables: dict) -> dict:
    voltage    = float(variables.get("voltage")    or 12.0)
    resistance = float(variables.get("resistance") or 100.0)
    if resistance == 0: resistance = 1e-9

    current = voltage / resistance
    power   = voltage * current

    r_values = _linspace(max(1, resistance * 0.1), resistance * 3, 100)
    iv_curve = [{"r": round(r, 2), "i": round(voltage / r, 4),
                 "p": round(voltage * (voltage / r), 4)} for r in r_values]

    return {
        "type": "circuit",
        "iv_curve": iv_curve,
        "stats": {
            "voltage":    voltage,
            "resistance": resistance,
            "current":    round(current, 4),
            "power":      round(power, 4),
            "energy_J":   round(power, 4),
            "ohms_law":   f"I = V/R = {voltage}/{resistance} = {round(current,4)} A",
        }
    }