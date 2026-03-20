"""
new_sims.py — Complete simulation backend for Physics, Mathematics, Chemistry
Copy to: backend/app/simulation/new_sims.py

Contains:
  PHYSICS:      gravitation, electrostatics, magnetism, optics,
                thermodynamics, modern_physics
  MATHEMATICS:  trigonometry, vectors, statistics, conic_sections,
                derivative, integral, function_plot_math
  CHEMISTRY:    atomic_structure, molecular_bonding, gas_laws,
                equilibrium, electrochemistry, reaction_kinetics,
                periodic_trends, organic_reaction
"""
import math


# ═══════════════════════════════════════════════════════════════
# PHYSICS SIMULATIONS
# ═══════════════════════════════════════════════════════════════

def gravitation_simulation(variables: dict) -> dict:
    G = 6.674e-11
    M = float(variables.get("mass1") or variables.get("mass") or 2e30)
    m = float(variables.get("mass2") or 5.97e24)
    r = float(variables.get("radius") or variables.get("distance") or 1.5e11)
    if r <= 0: r = 1.5e11
    if M <= 0: M = 2e30

    F     = G * M * m / (r ** 2)
    v_orb = math.sqrt(G * M / r)
    T_s   = 2 * math.pi * math.sqrt(r ** 3 / (G * M))
    g_r   = G * M / (r ** 2)

    return {
        "type": "gravitation",
        "G": G, "mass1": M, "mass2": m, "radius_m": r,
        "gravitational_force":       F,
        "gravitational_force_sci":   f"{F:.3e} N",
        "orbital_velocity_mps":      round(v_orb, 2),
        "orbital_period_s":          round(T_s, 2),
        "orbital_period_days":       round(T_s / 86400, 2),
        "orbital_period_years":      round(T_s / (365.25 * 86400), 4),
        "g_at_surface":              round(g_r, 4),
        "escape_velocity_mps":       round(math.sqrt(2 * G * M / r), 2),
    }


def electrostatics_simulation(variables: dict) -> dict:
    k   = 8.99e9   # N·m²/C²
    q1  = float(variables.get("charge1") or variables.get("charge") or 1e-6)
    q2  = float(variables.get("charge2") or 1e-6)
    r   = float(variables.get("radius")  or variables.get("distance") or variables.get("length") or 0.1)
    if r <= 0: r = 0.1

    F  = k * abs(q1) * abs(q2) / (r ** 2)
    E1 = k * abs(q1) / (r ** 2)
    V1 = k * q1 / r
    U  = k * q1 * q2 / r

    return {
        "type": "electrostatics",
        "k": k, "charge1": q1, "charge2": q2, "distance_m": r,
        "force_N":            F,
        "force_sci":          f"{F:.3e} N",
        "electric_field_Vm":  round(E1, 4),
        "potential_V":        round(V1, 4),
        "potential_energy_J": round(U, 8),
        "attraction":         q1 * q2 < 0,
        "force_direction":    "attractive" if q1 * q2 < 0 else "repulsive",
    }


def magnetism_simulation(variables: dict) -> dict:
    q   = float(variables.get("charge") or 1.6e-19)
    v   = float(variables.get("velocity") or 1e6)
    B   = float(variables.get("magnetic_field") or variables.get("B") or 1.0)
    m   = float(variables.get("mass") or 9.11e-31)
    L   = float(variables.get("length") or 1.0)    # for straight wire
    I   = float(variables.get("current") or 1.0)   # for wire in field

    # Lorentz force on charge
    F_charge = abs(q) * v * B
    # Radius of circular motion
    r_circle = (m * v) / (abs(q) * B) if abs(q) * B > 0 else 0
    # Cyclotron frequency
    f_cyclotron = abs(q) * B / (2 * math.pi * m) if m > 0 else 0
    # Force on current-carrying wire: F = BIL
    F_wire = B * I * L

    return {
        "type": "magnetism",
        "charge": q, "velocity_mps": v, "B_field_T": B, "mass_kg": m,
        "lorentz_force_N":       F_charge,
        "lorentz_force_sci":     f"{F_charge:.3e} N",
        "radius_circular_m":     round(r_circle, 6) if r_circle < 1 else round(r_circle, 3),
        "cyclotron_freq_Hz":     round(f_cyclotron, 3),
        "force_on_wire_N":       round(F_wire, 4),
        "time_constant_rl":      round(variables.get("inductance", 0.1) / variables.get("resistance", 10), 4),
        "steady_state_current":  round(variables.get("voltage", 12) / variables.get("resistance", 10), 4) if variables.get("resistance") else None,
    }


def optics_simulation(variables: dict) -> dict:
    n1  = float(variables.get("n1") or 1.0)
    n2  = float(variables.get("n2") or 1.5)
    inc = float(variables.get("angle") or 30)
    f   = float(variables.get("focal_length") or variables.get("length") or 0.2)
    u   = float(variables.get("object_distance") or -0.4)
    if u > 0: u = -u   # ensure negative for real object

    # Snell's law
    sin_r  = min(1.0, n1 * math.sin(math.radians(inc)) / n2)
    theta_r = math.degrees(math.asin(sin_r))
    # Critical angle (only if n1 > n2)
    crit = round(math.degrees(math.asin(n2/n1)), 2) if n1 > n2 else None
    # Lens formula: 1/v - 1/u = 1/f  → v = fu/(u-f)
    denom = u - f
    v     = (f * u) / denom if denom != 0 else float('inf')
    mag   = -v / u if u != 0 else 0
    power_D = 1.0 / f if f != 0 else 0   # Diopters

    return {
        "type": "optics",
        "n1": n1, "n2": n2,
        "incident_angle_deg":    inc,
        "refracted_angle_deg":   round(theta_r, 3),
        "critical_angle_deg":    crit,
        "focal_length_m":        f,
        "object_distance_m":     u,
        "image_distance_m":      round(v, 4),
        "magnification":         round(mag, 4),
        "power_diopters":        round(power_D, 3),
        "image_type":            "real" if v > 0 else "virtual",
        "image_orientation":     "inverted" if mag < 0 else "erect",
        "refractive_index_ratio": round(n2/n1, 4),
    }


def thermodynamics_simulation(variables: dict) -> dict:
    R    = 8.314       # J/(mol·K)
    n    = float(variables.get("moles")       or 1.0)
    T    = float(variables.get("temperature") or 300.0)
    P    = float(variables.get("pressure")    or 101325.0)
    M_m  = float(variables.get("molar_mass")  or 0.029)    # kg/mol (air default)
    T_h  = float(variables.get("T_hot")       or T)
    T_c  = float(variables.get("T_cold")      or 300.0)
    Cv   = float(variables.get("Cv")          or 12.5)     # J/(mol·K) ideal mono
    Cp   = Cv + R

    V       = n * R * T / P
    U       = (3/2) * n * R * T
    v_rms   = math.sqrt(3 * R * T / M_m) if M_m > 0 else 0
    v_avg   = math.sqrt(8 * R * T / (math.pi * M_m)) if M_m > 0 else 0
    eta_c   = 1 - T_c / T_h if T_h > 0 else 0
    gamma   = Cp / Cv if Cv > 0 else 1.4
    lambda_mfp = (R * T) / (math.sqrt(2) * math.pi * (3.5e-10)**2 * 6.022e23 * P) if P > 0 else 0

    return {
        "type": "thermodynamics",
        "R": R, "n_moles": n, "temperature_K": T, "pressure_Pa": P,
        "volume_m3":            round(V, 6),
        "volume_L":             round(V * 1000, 4),
        "internal_energy_J":    round(U, 2),
        "rms_speed_mps":        round(v_rms, 2),
        "avg_speed_mps":        round(v_avg, 2),
        "carnot_efficiency_pct":round(eta_c * 100, 2),
        "gamma":                round(gamma, 3),
        "mean_free_path_m":     lambda_mfp,
        "mean_free_path_nm":    round(lambda_mfp * 1e9, 2),
        "Cp_JmolK":             round(Cp, 3),
        "Cv_JmolK":             round(Cv, 3),
    }


def modern_physics_simulation(variables: dict) -> dict:
    h    = 6.626e-34   # J·s
    hbar = h / (2 * math.pi)
    c    = 3e8         # m/s
    eV   = 1.6e-19     # J
    me   = 9.11e-31    # kg

    n1   = int(variables.get("n1") or variables.get("n1_level") or 3)
    n2   = int(variables.get("n2") or variables.get("n2_level") or 2)
    Z    = int(variables.get("atomic_number") or 1)
    KE   = float(variables.get("kinetic_energy") or variables.get("energy") or 13.6)

    E = lambda n: -13.6 * Z**2 / (n**2)
    E1, E2 = E(n1), E(n2)
    dE_eV  = abs(E1 - E2)
    dE_J   = dE_eV * eV
    lam    = h * c / dE_J if dE_J > 0 else 0
    freq   = c / lam if lam > 0 else 0

    # De Broglie
    KE_J  = KE * eV
    v_e   = math.sqrt(2 * KE_J / me) if KE_J > 0 else 0
    lam_dB = h / (me * v_e) if v_e > 0 else 0

    # Bohr radius
    a0    = 5.29e-11   # m
    r_n   = a0 * n1**2 / Z

    # Photoelectric: check threshold
    phi   = float(variables.get("work_function") or 2.0)  # eV
    KE_out = max(0, KE - phi)
    lam_thresh = h * c / (phi * eV) if phi > 0 else 0

    return {
        "type": "modern_physics",
        "h": h, "hbar": hbar, "c": c,
        "n_upper": n1, "n_lower": n2, "Z": Z,
        "E_upper_eV":            round(E1, 4),
        "E_lower_eV":            round(E2, 4),
        "delta_E_eV":            round(dE_eV, 4),
        "delta_E_J":             dE_J,
        "photon_wavelength_m":   lam,
        "photon_wavelength_nm":  round(lam * 1e9, 3),
        "photon_frequency_Hz":   round(freq, 3),
        "ionization_E_eV":       round(abs(E(n2)), 4),
        "bohr_radius_n_m":       round(r_n, 12),
        "bohr_radius_n_pm":      round(r_n * 1e12, 4),
        "de_broglie_m":          lam_dB,
        "de_broglie_nm":         round(lam_dB * 1e9, 4),
        "photoelectric_KE_eV":   round(KE_out, 4),
        "threshold_wavelength_nm":round(lam_thresh * 1e9, 2) if lam_thresh else None,
        "series": _spectral_series(n2),
    }


def _spectral_series(n_lower: int) -> str:
    return {1:"Lyman (UV)",2:"Balmer (visible)",3:"Paschen (IR)",
            4:"Brackett (IR)",5:"Pfund (IR)"}.get(n_lower,"Unknown")


# ═══════════════════════════════════════════════════════════════
# MATHEMATICS SIMULATIONS
# ═══════════════════════════════════════════════════════════════

def trigonometry_simulation(variables: dict) -> dict:
    angle_deg = float(variables.get("angle") or variables.get("theta") or 30)
    angle_rad = math.radians(angle_deg)

    sin_v  = math.sin(angle_rad)
    cos_v  = math.cos(angle_rad)
    tan_v  = math.tan(angle_rad)
    cosec  = 1/sin_v   if abs(sin_v)  > 1e-10 else None
    sec_v  = 1/cos_v   if abs(cos_v)  > 1e-10 else None
    cot_v  = cos_v/sin_v if abs(sin_v) > 1e-10 else None

    # Verify identity
    identity = round(sin_v**2 + cos_v**2, 10)

    # Related angles
    related = {
        "complement_deg":    90 - angle_deg,
        "supplement_deg":    180 - angle_deg,
        "sin_complement":    round(cos_v, 6),    # sin(90-θ) = cos(θ)
        "cos_complement":    round(sin_v, 6),    # cos(90-θ) = sin(θ)
        "sin_double":        round(2*sin_v*cos_v, 6),   # sin(2θ)
        "cos_double":        round(cos_v**2 - sin_v**2, 6),  # cos(2θ)
    }

    return {
        "type": "trigonometry",
        "angle_deg":   angle_deg,
        "angle_rad":   round(angle_rad, 6),
        "sin":         round(sin_v,  6),
        "cos":         round(cos_v,  6),
        "tan":         round(tan_v,  6) if abs(tan_v) < 1e10 else None,
        "cosec":       round(cosec, 6)  if cosec  else None,
        "sec":         round(sec_v, 6)  if sec_v  else None,
        "cot":         round(cot_v, 6)  if cot_v  else None,
        "identity_check":  identity,   # should be 1.0
        "quadrant":    _quadrant(angle_deg),
        "related": related,
    }


def _quadrant(deg: float) -> str:
    d = deg % 360
    if d < 90:   return "I (all +)"
    if d < 180:  return "II (sin +)"
    if d < 270:  return "III (tan +)"
    return "IV (cos +)"


def vectors_simulation(variables: dict) -> dict:
    ax = float(variables.get("ax") or variables.get("a_x") or 3)
    ay = float(variables.get("ay") or variables.get("a_y") or 4)
    az = float(variables.get("az") or variables.get("a_z") or 0)
    bx = float(variables.get("bx") or variables.get("b_x") or 1)
    by = float(variables.get("by") or variables.get("b_y") or 2)
    bz = float(variables.get("bz") or variables.get("b_z") or 0)

    # Magnitudes
    magA = math.sqrt(ax**2 + ay**2 + az**2)
    magB = math.sqrt(bx**2 + by**2 + bz**2)

    # Dot product
    dot = ax*bx + ay*by + az*bz

    # Cross product
    cx = ay*bz - az*by
    cy = az*bx - ax*bz
    cz = ax*by - ay*bx
    magC = math.sqrt(cx**2 + cy**2 + cz**2)

    # Angle between vectors
    cos_theta = dot / (magA * magB) if magA * magB > 0 else 0
    theta = math.degrees(math.acos(max(-1, min(1, cos_theta))))

    # Unit vectors
    ua = [ax/magA, ay/magA, az/magA] if magA > 0 else [0,0,0]
    ub = [bx/magB, by/magB, bz/magB] if magB > 0 else [0,0,0]

    # Projection of A on B
    proj_A_on_B = dot / magB if magB > 0 else 0

    # Resultant
    rx, ry, rz = ax+bx, ay+by, az+bz
    magR = math.sqrt(rx**2 + ry**2 + rz**2)

    return {
        "type": "vectors",
        "A": [ax, ay, az], "B": [bx, by, bz],
        "magnitude_A":       round(magA, 4),
        "magnitude_B":       round(magB, 4),
        "magnitude_R":       round(magR, 4),
        "dot_product":       round(dot, 4),
        "cross_product":     [round(cx,4), round(cy,4), round(cz,4)],
        "cross_magnitude":   round(magC, 4),
        "angle_deg":         round(theta, 4),
        "unit_A":            [round(x,4) for x in ua],
        "unit_B":            [round(x,4) for x in ub],
        "projection_A_on_B": round(proj_A_on_B, 4),
        "resultant":         [round(rx,4), round(ry,4), round(rz,4)],
        "parallel":          abs(magC) < 1e-10,
        "perpendicular":     abs(dot) < 1e-10,
    }


def statistics_simulation(variables: dict) -> dict:
    raw   = variables.get("data") or variables.get("values") or [2,4,4,4,5,5,7,9]
    if isinstance(raw, str):
        try: data = [float(x.strip()) for x in raw.split(',')]
        except: data = [2,4,4,4,5,5,7,9]
    else:
        data = [float(x) for x in raw]

    n    = len(data)
    s    = sorted(data)
    mean = sum(data) / n

    # Median
    median = (s[n//2-1]+s[n//2])/2 if n%2==0 else s[n//2]

    # Mode
    freq = {}
    for x in data: freq[x] = freq.get(x,0)+1
    mode_val = max(freq, key=freq.get)

    # Variance and std
    variance = sum((x-mean)**2 for x in data) / n
    std      = math.sqrt(variance)

    # Sample variance
    s_var    = sum((x-mean)**2 for x in data)/(n-1) if n>1 else 0
    s_std    = math.sqrt(s_var)

    # IQR
    q1 = s[n//4]
    q3 = s[3*n//4]
    iqr = q3 - q1

    # Skewness (Pearson)
    skew = 3*(mean-median)/std if std > 0 else 0

    return {
        "type": "statistics",
        "n":              n,
        "data_sorted":    s,
        "mean":           round(mean,  4),
        "median":         round(median,4),
        "mode":           mode_val,
        "variance":       round(variance, 4),
        "std_dev":        round(std,  4),
        "sample_variance":round(s_var,4),
        "sample_std":     round(s_std,4),
        "min":            s[0],
        "max":            s[-1],
        "range":          round(s[-1]-s[0], 4),
        "Q1":             q1, "Q3": q3, "IQR": round(iqr,4),
        "skewness":       round(skew, 4),
        "sum":            round(sum(data),4),
    }


def conic_sections_simulation(variables: dict) -> dict:
    ctype = (variables.get("conic_type") or "parabola").lower()
    a = float(variables.get("a") or 2)
    b = float(variables.get("b") or 1.5)
    h = float(variables.get("h") or 0)   # center x
    k = float(variables.get("k") or 0)   # center y

    result = {"type": "conic_sections", "conic_type": ctype, "a": a, "b": b}

    if ctype == "parabola":
        # y² = 4ax
        result.update({
            "equation": f"y² = {4*a}x",
            "vertex": [h, k],
            "focus": [h+a, k],
            "directrix": f"x = {h-a}",
            "latus_rectum_length": 4*a,
            "axis": "horizontal",
        })
    elif ctype == "ellipse":
        # x²/a² + y²/b² = 1
        if a >= b:
            c = math.sqrt(a**2 - b**2)
            e = c/a
            result.update({
                "equation": f"x²/{a}² + y²/{b}² = 1",
                "semi_major": a, "semi_minor": b,
                "foci": [[h+c,k],[h-c,k]],
                "eccentricity": round(e,4),
                "latus_rectum": round(2*b**2/a,4),
                "area": round(math.pi*a*b,4),
                "perimeter_approx": round(math.pi*(3*(a+b)-math.sqrt((3*a+b)*(a+3*b))),4),
            })
        else:
            c = math.sqrt(b**2 - a**2)
            e = c/b
            result.update({
                "equation": f"x²/{a}² + y²/{b}² = 1",
                "semi_major": b, "semi_minor": a,
                "foci": [[h,k+c],[h,k-c]],
                "eccentricity": round(e,4),
            })
    elif ctype == "hyperbola":
        # x²/a² - y²/b² = 1
        c = math.sqrt(a**2 + b**2)
        result.update({
            "equation": f"x²/{a}² − y²/{b}² = 1",
            "foci": [[h+c,k],[h-c,k]],
            "eccentricity": round(c/a, 4),
            "asymptotes": [f"y = ±({b}/{a})x"],
            "latus_rectum": round(2*b**2/a, 4),
        })
    else:   # circle
        result.update({
            "equation": f"(x−{h})² + (y−{k})² = {a}²",
            "center": [h, k], "radius": a,
            "area": round(math.pi*a**2, 4),
            "circumference": round(2*math.pi*a, 4),
        })
    return result


def derivative_simulation(variables: dict) -> dict:
    """Numerical derivative evaluation at a point."""
    expr = variables.get("expression") or "x**2"
    x0   = float(variables.get("x0") or variables.get("x") or 2)
    h    = 1e-5

    def f(x):
        import math as _m
        try:
            return eval(expr, {"x":x,"sin":_m.sin,"cos":_m.cos,"tan":_m.tan,
                               "exp":_m.exp,"log":_m.log,"sqrt":_m.sqrt,"pi":_m.pi,"e":_m.e})
        except: return float('nan')

    fx0 = f(x0)
    d1  = (f(x0+h) - f(x0-h)) / (2*h)            # first derivative
    d2  = (f(x0+h) - 2*fx0 + f(x0-h)) / (h**2)   # second derivative
    # Tangent line: y = d1*(x-x0) + fx0
    return {
        "type": "derivative",
        "expression": expr, "x0": x0,
        "f_x0":       round(fx0, 6),
        "first_deriv":round(d1,  6),
        "second_deriv":round(d2, 6),
        "tangent_slope": round(d1, 6),
        "tangent_intercept": round(fx0 - d1*x0, 6),
        "tangent_eq": f"y = {round(d1,4)}·(x − {x0}) + {round(fx0,4)}",
        "critical_point": abs(d1) < 1e-3,
        "concavity": "concave up" if d2 > 0 else "concave down",
    }


def integral_simulation(variables: dict) -> dict:
    """Numerical definite integral using Simpson's rule."""
    expr = variables.get("expression") or "x**2"
    a    = float(variables.get("a") or variables.get("lower") or 0)
    b    = float(variables.get("b") or variables.get("upper") or 3)
    n    = 1000   # intervals (must be even)

    def f(x):
        import math as _m
        try:
            return eval(expr, {"x":x,"sin":_m.sin,"cos":_m.cos,"tan":_m.tan,
                               "exp":_m.exp,"log":_m.log,"sqrt":_m.sqrt,"pi":_m.pi,"e":_m.e})
        except: return 0.0

    # Simpson's 1/3 rule
    h  = (b - a) / n
    total = f(a) + f(b)
    for i in range(1, n):
        total += (4 if i%2==1 else 2) * f(a + i*h)
    integral = total * h / 3

    # Average value
    avg = integral / (b-a) if b != a else 0

    return {
        "type": "integral",
        "expression": expr, "lower": a, "upper": b,
        "definite_integral": round(integral, 6),
        "average_value":     round(avg, 6),
        "interval_length":   round(b-a, 4),
        "n_intervals":       n,
        "method":            "Simpson's 1/3 rule",
    }


# ═══════════════════════════════════════════════════════════════
# CHEMISTRY SIMULATIONS
# ═══════════════════════════════════════════════════════════════

def atomic_structure_simulation(variables: dict) -> dict:
    Z    = int(variables.get("atomic_number") or variables.get("Z") or 6)
    A    = int(variables.get("mass_number")   or Z*2)

    # Electron configuration
    # Fill shells: K(2) L(8) M(18) N(32) ...
    shell_capacity = [2, 8, 18, 32, 50]
    shells = []
    remaining = Z
    for cap in shell_capacity:
        if remaining <= 0: break
        shells.append(min(remaining, cap))
        remaining -= cap

    # Subshell notation (simplified for Z≤36)
    def get_config(Z):
        configs = {
            1:"1s¹",2:"1s²",3:"1s²2s¹",4:"1s²2s²",
            5:"1s²2s²2p¹",6:"1s²2s²2p²",7:"1s²2s²2p³",
            8:"1s²2s²2p⁴",9:"1s²2s²2p⁵",10:"1s²2s²2p⁶",
            11:"1s²2s²2p⁶3s¹",12:"1s²2s²2p⁶3s²",
            13:"1s²2s²2p⁶3s²3p¹",14:"1s²2s²2p⁶3s²3p²",
            15:"1s²2s²2p⁶3s²3p³",16:"1s²2s²2p⁶3s²3p⁴",
            17:"1s²2s²2p⁶3s²3p⁵",18:"1s²2s²2p⁶3s²3p⁶",
            19:"[Ar]4s¹",20:"[Ar]4s²",
            26:"[Ar]3d⁶4s²",29:"[Ar]3d¹⁰4s¹",
        }
        return configs.get(Z, f"Z={Z} (see periodic table)")

    valence = shells[-1] if shells else 0
    period  = len(shells)

    # Ionization energy trend (approximate, eV)
    IE1_approx = 13.6 * Z**2 / (period**2) * 0.5   # rough estimate

    # Atomic radius trend (pm, approximate)
    r_approx = 53 * period**2 / Z   # pm

    return {
        "type": "atomic_structure",
        "atomic_number":    Z,
        "mass_number":      A,
        "protons":          Z,
        "electrons":        Z,
        "neutrons":         A - Z,
        "shell_configuration": shells,
        "electron_config":  get_config(Z),
        "valence_electrons":valence,
        "period":           period,
        "shells_count":     len(shells),
        "noble_gas":        valence in (0, 8) or Z == 2,
        "metal_like":       valence <= 3 and period > 1,
        "IE1_eV_approx":    round(IE1_approx, 2),
        "atomic_radius_pm_approx": round(r_approx, 0),
    }


def molecular_bonding_simulation(variables: dict) -> dict:
    mol  = (variables.get("molecule") or "H2O").upper()
    # Electronegativity values (Pauling scale)
    EN = {"H":2.2,"C":2.55,"N":3.04,"O":3.44,"F":3.98,
          "CL":3.16,"BR":2.96,"I":2.66,"S":2.58,"P":2.19,
          "NA":0.93,"K":0.82,"CA":1.0,"MG":1.31,"AL":1.61}
    # Simple bond data
    bonds = {
        "H2O":  {"bonds":2,"lone_pairs":2,"geometry":"bent","angle":"104.5°","polarity":"polar","type":"covalent"},
        "CO2":  {"bonds":4,"lone_pairs":4,"geometry":"linear","angle":"180°","polarity":"non-polar","type":"covalent"},
        "NH3":  {"bonds":3,"lone_pairs":1,"geometry":"trigonal pyramidal","angle":"107°","polarity":"polar","type":"covalent"},
        "CH4":  {"bonds":4,"lone_pairs":0,"geometry":"tetrahedral","angle":"109.5°","polarity":"non-polar","type":"covalent"},
        "NaCl": {"bonds":1,"lone_pairs":0,"geometry":"ionic","angle":"N/A","polarity":"ionic","type":"ionic"},
        "HF":   {"bonds":1,"lone_pairs":3,"geometry":"linear","angle":"N/A","polarity":"polar","type":"covalent"},
        "BF3":  {"bonds":3,"lone_pairs":0,"geometry":"trigonal planar","angle":"120°","polarity":"non-polar","type":"covalent"},
        "PCl5": {"bonds":5,"lone_pairs":0,"geometry":"trigonal bipyramidal","angle":"90°,120°","polarity":"non-polar","type":"covalent"},
        "SF6":  {"bonds":6,"lone_pairs":0,"geometry":"octahedral","angle":"90°","polarity":"non-polar","type":"covalent"},
    }
    info = bonds.get(mol, {"bonds":"?","lone_pairs":"?","geometry":"unknown","angle":"?","polarity":"?","type":"covalent"})
    info["molecule"] = mol
    info["type_label"] = "molecular_bonding"
    info["VSEPR_rule"] = "Lone pairs cause greater repulsion than bonding pairs"
    info["hybridization"] = {
        "H2O":"sp³","NH3":"sp³","CH4":"sp³","CO2":"sp",
        "BF3":"sp²","PCl5":"sp³d","SF6":"sp³d²"
    }.get(mol,"sp³")
    return info


def gas_laws_simulation(variables: dict) -> dict:
    """Ideal gas + van der Waals calculations."""
    R   = 8.314
    n   = float(variables.get("moles") or 1)
    T   = float(variables.get("temperature") or 300)
    P   = float(variables.get("pressure")    or 101325)
    V   = float(variables.get("volume")      or n*R*T/P)
    # van der Waals constants (default: N2-like)
    a   = float(variables.get("a_vdw") or 1.39)   # L²·atm/mol²
    b   = float(variables.get("b_vdw") or 0.0391)  # L/mol

    P_ideal = n * R * T / V
    V_L     = V * 1000

    # van der Waals (approximate P for given V,T,n)
    V_mol = V_L / n   # L/mol
    P_atm = 101325
    P_vdw_atm = (R * T / (V_mol/1000 - b/1000) - a * (n/V_L)**2 * 1e-6) if V_mol > b else None

    return {
        "type": "gas_laws",
        "n_moles": n, "T_K": T, "P_Pa": P, "V_m3": V,
        "V_L":        round(V_L, 4),
        "P_atm":      round(P/101325, 4),
        "P_ideal_Pa": round(P_ideal, 2),
        "density_kgm3": round(n * 0.028 / V, 4),  # approx for N2
        "PV_product":  round(P*V, 4),
        "nRT":         round(n*R*T, 4),
        "boyles_law":  "PV = const (T constant)",
        "charles_law": "V/T = const (P constant)",
        "ideal_gas_eq":"PV = nRT",
        "van_der_waals":"(P + an²/V²)(V − nb) = nRT",
        "a_vdw": a, "b_vdw": b,
    }


def equilibrium_simulation(variables: dict) -> dict:
    Kc    = float(variables.get("kc") or variables.get("Kc") or 4.0)
    C0    = float(variables.get("initial_conc") or 1.0)   # mol/L
    T     = float(variables.get("temperature") or 298)    # K
    dH    = float(variables.get("delta_H") or -40000)     # J/mol (exothermic)
    R     = 8.314

    # For aA ⇌ bB  with Kc
    # At equilibrium: [B]/[A] = Kc → fraction product = Kc/(1+Kc)
    frac_prod = Kc / (1 + Kc)
    eq_A      = C0 * (1 - frac_prod)
    eq_B      = C0 * frac_prod

    # Qc < Kc: forward reaction; Qc > Kc: reverse
    Q0 = 0   # initially no products

    # Le Chatelier: effect of temperature on Kc
    # ln(K2/K1) = -ΔH/R * (1/T2 - 1/T1)
    T2   = T + 50
    K2   = Kc * math.exp(-dH/R * (1/T2 - 1/T))
    K3   = Kc * math.exp(-dH/R * (1/T2 - 1/T) * (-1))  # lower T

    # Degree of dissociation
    alpha = frac_prod

    return {
        "type": "equilibrium",
        "Kc": Kc, "C0_molL": C0, "T_K": T,
        "equilibrium_A_molL":    round(eq_A, 4),
        "equilibrium_B_molL":    round(eq_B, 4),
        "degree_of_reaction":    round(alpha, 4),
        "fraction_product_pct":  round(frac_prod*100, 2),
        "Q_initial":             0,
        "Q_direction":           "forward (Qc < Kc)",
        "delta_H_Jmol":          dH,
        "reaction_type":         "exothermic" if dH < 0 else "endothermic",
        "Kc_at_T_plus50K":       round(K2, 4),
        "le_chatelier_T_increase": "Kc decreases" if dH < 0 else "Kc increases",
        "le_chatelier_P_increase": "Equilibrium shifts to side with fewer moles",
        "le_chatelier_conc_add_A": "Equilibrium shifts forward",
    }


def electrochemistry_simulation(variables: dict) -> dict:
    n_e   = float(variables.get("electrons")    or 2)    # moles of electrons
    E_cell= float(variables.get("emf")          or variables.get("voltage") or 1.1)
    conc  = float(variables.get("concentration") or 1.0)
    T     = float(variables.get("temperature")  or 298)
    I     = float(variables.get("current")      or 1.0)    # A
    t     = float(variables.get("time")         or 3600)   # s
    M_dep = float(variables.get("molar_mass")   or 64)     # g/mol (Cu default)

    F = 96485   # C/mol
    R = 8.314

    # Standard electrode potentials (Cu-Zn cell)
    E_cathode = float(variables.get("E_cathode") or 0.34)   # Cu²⁺/Cu
    E_anode   = float(variables.get("E_anode")   or -0.76)  # Zn²⁺/Zn
    E_std     = E_cathode - E_anode

    # Nernst equation: E = E° - (RT/nF)ln(Q)
    Q         = conc   # simplified
    E_nernst  = E_std - (R*T/(n_e*F)) * math.log(Q) if Q > 0 else E_std

    # Electrolysis: Faraday's laws
    Q_charge  = I * t                              # Coulombs
    m_dep     = Q_charge * M_dep / (n_e * F)      # grams deposited
    V_gas     = Q_charge / (n_e * F) * 22.4       # L at STP

    # ΔG = -nFE
    delta_G   = -n_e * F * E_cell

    return {
        "type": "electrochemistry",
        "F": F, "n_electrons": n_e, "T_K": T,
        "E_cathode_V":       E_cathode,
        "E_anode_V":         E_anode,
        "E_cell_std_V":      round(E_std, 4),
        "E_nernst_V":        round(E_nernst, 4),
        "delta_G_J":         round(delta_G, 2),
        "delta_G_kJ":        round(delta_G/1000, 4),
        "spontaneous":       delta_G < 0,
        "faraday_Q_C":       round(Q_charge, 2),
        "mass_deposited_g":  round(m_dep, 4),
        "volume_gas_L":      round(V_gas, 4),
        "current_A":         I,
        "time_s":            t,
        "cell_type":         "Galvanic (spontaneous)" if delta_G < 0 else "Electrolytic",
    }


def reaction_kinetics_simulation(variables: dict) -> dict:
    k     = float(variables.get("rate_constant") or variables.get("k") or 0.1)
    order = int(variables.get("order")   or 1)
    C0    = float(variables.get("C0")    or variables.get("initial_conc") or 1.0)
    Ea    = float(variables.get("Ea")    or variables.get("activation_energy") or 50000)  # J/mol
    T     = float(variables.get("temperature") or 300)
    A_arr = float(variables.get("A")     or 1e13)   # Arrhenius pre-exponential
    R     = 8.314

    # k from Arrhenius
    k_arr = A_arr * math.exp(-Ea / (R*T))

    # Half-life
    if order == 0:   t_half = C0 / (2*k)
    elif order == 1: t_half = math.log(2) / k
    elif order == 2: t_half = 1 / (k * C0)
    else:            t_half = 0

    # Concentration at t=1, 2, 5 × t_half
    def conc_at_t(t_val):
        if order == 0: return max(0, C0 - k*t_val)
        if order == 1: return C0 * math.exp(-k*t_val)
        if order == 2: return C0 / (1 + k*C0*t_val)
        return C0

    # Temperature effect (doubling rule: rate doubles per 10K)
    k_at_T10 = k_arr * math.exp(-Ea/R * (1/(T+10) - 1/T))

    return {
        "type": "reaction_kinetics",
        "rate_constant_k":    k,
        "order":              order,
        "C0_molL":            C0,
        "Ea_Jmol":            Ea,
        "Ea_kJmol":           round(Ea/1000, 2),
        "T_K":                T,
        "k_arrhenius":        k_arr,
        "k_arrhenius_sci":    f"{k_arr:.3e}",
        "half_life_s":        round(t_half, 4),
        "C_at_1t_half":       round(C0/2, 4),
        "C_at_2t_half":       round(C0/4, 4),
        "C_at_5t_half":       round(C0/32, 6),
        "rate_law":           f"Rate = k[A]{'⁰' if order==0 else '¹' if order==1 else '²'}",
        "integrated_law":     {0:f"[A]=[A]₀−kt",1:f"[A]=[A]₀e^(−kt)",2:f"1/[A]=1/[A]₀+kt"}.get(order,""),
        "k_at_T_plus10K":     round(k_at_T10, 6),
        "Q10_ratio":          round(k_at_T10/k_arr, 3) if k_arr > 0 else None,
        "activation_energy_unit": "J/mol",
    }


def periodic_trends_simulation(variables: dict) -> dict:
    Z = int(variables.get("atomic_number") or 11)  # Na default

    # Approximate trends (from literature data)
    # Ionization energy (eV) — rough periodic trend
    # IE increases across period, decreases down group
    IE_approx = {
        1:13.6,2:24.6,3:5.4,4:9.3,5:8.3,6:11.3,7:14.5,8:13.6,9:17.4,10:21.6,
        11:5.1,12:7.6,13:6.0,14:8.2,15:10.5,16:10.4,17:13.0,18:15.8,
        19:4.3,20:6.1
    }
    # Atomic radius (pm)
    r_approx = {
        1:53,2:31,3:167,4:112,5:87,6:77,7:75,8:73,9:64,10:38,
        11:186,12:160,13:143,14:117,15:110,16:104,17:99,18:71,
        19:231,20:197
    }
    # Electronegativity (Pauling)
    EN = {
        1:2.2,3:0.98,4:1.57,5:2.04,6:2.55,7:3.04,8:3.44,9:3.98,
        11:0.93,12:1.31,13:1.61,14:1.90,15:2.19,16:2.58,17:3.16,
        19:0.82,20:1.0
    }
    period_n = len([x for x in [2,8,8,18,18] if Z > sum([2,8,8,18,18][:([2,8,8,18,18].index(x) if x in [2,8,8,18,18] else 0)])])
    period_n = 1 if Z<=2 else 2 if Z<=10 else 3 if Z<=18 else 4 if Z<=36 else 5

    return {
        "type": "periodic_trends",
        "atomic_number":        Z,
        "period":               period_n,
        "IE1_eV":               IE_approx.get(Z, round(13.6*((Z%8 or 8)/8)**2, 2)),
        "atomic_radius_pm":     r_approx.get(Z, round(250/Z*10, 0)),
        "electronegativity":    EN.get(Z, round(0.5+Z*0.1, 2)),
        "trend_IE_across_period":    "increases (effective nuclear charge increases)",
        "trend_IE_down_group":       "decreases (electrons farther from nucleus)",
        "trend_radius_across_period":"decreases (higher Zeff pulls electrons closer)",
        "trend_radius_down_group":   "increases (new shells added)",
        "trend_EN_across_period":    "increases",
        "trend_EN_down_group":       "decreases",
    }


def organic_reaction_simulation(variables: dict) -> dict:
    """Basic organic reaction information."""
    rxn_type = (variables.get("reaction_type") or "addition").lower()

    reactions = {
        "addition": {
            "example":   "CH₂=CH₂ + Br₂ → CH₂Br-CH₂Br",
            "reagents":  "Alkene + electrophile (Br₂, HX, H₂O)",
            "mechanism": "Electrophilic addition",
            "conditions":"Room temperature, no catalyst",
            "markovnikov":"H adds to C with more H (for HX addition)",
        },
        "substitution": {
            "example":   "CH₄ + Cl₂ → CH₃Cl + HCl",
            "reagents":  "Alkane + halogen",
            "mechanism": "Free radical substitution",
            "conditions":"UV light or high temperature",
            "steps":     "Initiation → Propagation → Termination",
        },
        "elimination": {
            "example":   "CH₃CH₂Br + KOH → CH₂=CH₂ + KBr + H₂O",
            "reagents":  "Haloalkane + strong base (KOH/alc)",
            "mechanism": "E2 or E1 elimination",
            "conditions":"Alcoholic KOH, heat",
            "zaitsev":   "Major product has more substituted double bond",
        },
        "esterification": {
            "example":   "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O",
            "reagents":  "Carboxylic acid + alcohol",
            "mechanism": "Nucleophilic acyl substitution",
            "conditions":"Conc. H₂SO₄, heat (Fischer esterification)",
            "reversible": True,
        },
    }

    info = reactions.get(rxn_type, reactions["addition"])
    info["reaction_type"] = rxn_type
    info["type"] = "organic_reaction"
    info["homologous_series"] = {
        "alkane":  "CₙH₂ₙ₊₂ — saturated, single bonds",
        "alkene":  "CₙH₂ₙ — unsaturated, C=C double bond",
        "alkyne":  "CₙH₂ₙ₋₂ — unsaturated, C≡C triple bond",
        "alcohol": "CₙH₂ₙ₊₁OH — −OH functional group",
        "aldehyde":"CₙH₂ₙO — −CHO functional group",
        "ketone":  "CₙH₂ₙO — C=O in chain",
        "acid":    "CₙH₂ₙO₂ — −COOH functional group",
    }
    return info