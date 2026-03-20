"""
test_backend_v2.py — Comprehensive backend test
Run: python test_backend_v2.py
"""
import urllib.request, json, sys, time

BASE    = "http://127.0.0.1:8000"
TIMEOUT = 45   # seconds per request


def post(path, data):
    body = json.dumps(data).encode()
    req  = urllib.request.Request(
        BASE + path, data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read())


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=10) as r:
        return json.loads(r.read())


def check(name, fn, expect_sim=None, expect_answer_not=None):
    t0 = time.time()
    try:
        r   = fn()
        dt  = round(time.time()-t0, 1)
        sim = r.get("simulation",{}).get("type","?")
        ans = r.get("final_answer","?")[:60]
        fa  = r.get("final_answer","")

        sim_ok = (expect_sim is None) or (sim == expect_sim)
        ans_ok = (expect_answer_not is None) or (expect_answer_not.lower() not in fa.lower())

        icon = "✅" if (sim_ok and ans_ok) else "⚠️"
        print(f"  {icon} {name} [{dt}s]")
        print(f"      sim={sim}  answer={ans}")
        if expect_sim and not sim_ok:
            print(f"      ⚠ Expected sim={expect_sim}")
        if expect_answer_not and not ans_ok:
            print(f"      ⚠ Answer still contains '{expect_answer_not}'")
        return r
    except Exception as e:
        dt = round(time.time()-t0, 1)
        print(f"  ❌ {name} [{dt}s]: {e}")
        return None


print("\n" + "═"*50)
print("  SimAI Backend Test v2")
print("═"*50 + "\n")

# ── 1. Health ──────────────────────────────────────────────
print("1. Health check")
r = get("/api/ping")
loaded = r.get("modules_loaded", {})
for k, v in loaded.items():
    print(f"  {'✅' if v else '❌'} {k}")

# ── 2. Physics ─────────────────────────────────────────────
print("\n2. Physics")

check("Pendulum period",
    lambda: post("/api/analyze",{"problem":"A simple pendulum of length 1m oscillates. Find its time period. g=9.8 m/s²","subject":"physics"}),
    expect_sim="pendulum", expect_answer_not="see solution")

check("Gravitational force (Earth-Sun)",
    lambda: post("/api/analyze",{"problem":"Calculate the gravitational force between Earth mass 6×10^24 kg and Sun mass 2×10^30 kg separated by 1.5×10^11 m. G=6.674×10^-11","subject":"physics"}),
    expect_sim="gravitation", expect_answer_not="see solution")

check("RL Circuit steady state",
    lambda: post("/api/analyze",{"problem":"In an RL circuit with inductor L and resistor R, switch closed at t=0. Find current through inductor at steady state (t→∞).","subject":"physics"}),
    expect_sim="magnetism")

check("Snell's law refraction",
    lambda: post("/api/analyze",{"problem":"Light travels from glass (n=1.5) to air (n=1). Incident angle 30°. Find refracted angle using Snell's law.","subject":"physics"}),
    expect_sim="optics", expect_answer_not="see solution")

check("Projectile range",
    lambda: post("/api/analyze",{"problem":"A projectile is launched at 45° with velocity 20 m/s. Find horizontal range and maximum height. g=9.8","subject":"physics"}),
    expect_sim="projectile", expect_answer_not="see solution")

# ── 3. Mathematics ─────────────────────────────────────────
print("\n3. Mathematics")

check("Trig ratios sin cos tan",
    lambda: post("/api/analyze",{"problem":"Find sin 30°, cos 60°, tan 45°. Verify the identity sin²θ + cos²θ = 1 for θ=30°","subject":"mathematics"}),
    expect_sim="trigonometry")

check("Dot product and cross product of vectors",
    lambda: post("/api/analyze",{"problem":"Find dot product and cross product of vectors A = 3i + 4j and B = 2i + j. Also find angle between vectors.","subject":"mathematics"}),
    expect_sim="vectors")

check("Differentiation dy/dx",
    lambda: post("/api/analyze",{"problem":"Differentiate f(x) = x³ - 3x² + 5x - 2. Find dy/dx and locate critical points.","subject":"mathematics"}),
    expect_sim="derivative")

check("Definite integral area",
    lambda: post("/api/analyze",{"problem":"Evaluate the definite integral of x² from 0 to 3. Find the area under the curve.","subject":"mathematics"}),
    expect_sim="integral")

check("Parabola conic section",
    lambda: post("/api/analyze",{"problem":"Find the focus, directrix and latus rectum of the parabola y² = 12x.","subject":"mathematics"}),
    expect_sim="conic_sections")

# ── 4. Chemistry ───────────────────────────────────────────
print("\n4. Chemistry")

check("Electron configuration Carbon",
    lambda: post("/api/analyze",{"problem":"Write the electron configuration and shell structure for Carbon (Z=6). How many valence electrons does it have?","subject":"chemistry"}),
    expect_sim="atomic_structure")

check("Chemical equilibrium Kc",
    lambda: post("/api/analyze",{"problem":"For the reaction N2 + 3H2 ⇌ 2NH3, Kc = 4 at 300K. Initial [N2]=1M, [H2]=1M. Find equilibrium concentrations.","subject":"chemistry"}),
    expect_sim="equilibrium", expect_answer_not="see solution")

check("Electrochemical cell EMF",
    lambda: post("/api/analyze",{"problem":"Calculate the standard cell EMF for Zn-Cu electrochemical cell. E°(Cu²⁺/Cu)=+0.34V, E°(Zn²⁺/Zn)=-0.76V","subject":"chemistry"}),
    expect_sim="electrochemistry", expect_answer_not="see solution")

check("First order reaction kinetics",
    lambda: post("/api/analyze",{"problem":"A first order reaction has rate constant k=0.1 s⁻¹. Find half-life and concentration after 10 seconds if initial concentration is 2M.","subject":"chemistry"}),
    expect_sim="reaction_kinetics", expect_answer_not="see solution")

check("Covalent bonding H2O",
    lambda: post("/api/analyze",{"problem":"Explain the covalent bond in H2O. What is the bond angle and geometry? Use VSEPR theory.","subject":"chemistry"}),
    expect_sim="molecular_bonding")

print("\n" + "═"*50)
print("  Test complete!")
print("═"*50)
print("""
Scoring:
  ✅ = correct simulation type AND answer computed
  ⚠️ = ran but wrong sim type or answer missing
  ❌ = error or timeout

If all ✅: open http://localhost:5173 — everything works!
""")