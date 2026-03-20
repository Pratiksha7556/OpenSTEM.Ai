from groq import Groq
import json, re, math

GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)
MODEL  = "llama-3.1-8b-instant"


# ─────────────────────────────────────────────────────────────
# Clean LaTeX
# ─────────────────────────────────────────────────────────────
def clean_latex(text: str) -> str:
    if not text: return text
    text = re.sub(r'\$\$([^$]+)\$\$', lambda m: _lp(m.group(1)), text)
    text = re.sub(r'\$([^$]+)\$',     lambda m: _lp(m.group(1)), text)
    text = re.sub(r'\\\[([^\]]+)\\\]',lambda m: _lp(m.group(1)), text)
    text = re.sub(r'\\\(([^\)]+)\\\)',lambda m: _lp(m.group(1)), text)
    return text.strip()

def _lp(s):
    s = s.strip()
    for k, v in {r'\times':'×',r'\cdot':'·',r'\div':'÷',r'\approx':'≈',
                 r'\pm':'±',r'\sqrt':'√',r'\pi':'π',r'\alpha':'α',r'\beta':'β',
                 r'\gamma':'γ',r'\omega':'ω',r'\Omega':'Ω',r'\theta':'θ',
                 r'\lambda':'λ',r'\mu':'μ',r'\rho':'ρ',r'\sigma':'σ',
                 r'\Delta':'Δ',r'\infty':'∞',r'\frac':'',r'\vec':'',
                 r'\hat':'',r'\bar':'',r'\dot':''}.items():
        s = s.replace(k, v)
    s = re.sub(r'\^\{([^}]+)\}', r'^\1', s)
    s = re.sub(r'_\{([^}]+)\}',  r'_\1', s)
    return s.replace('{','').replace('}','').replace('\\','').strip()


# ─────────────────────────────────────────────────────────────
# STRICT simulation type detection — checks problem text first
# ─────────────────────────────────────────────────────────────
SIM_RULES = [
    # Magnetism (check BEFORE electricity)
    (['magnetic field','magnetic flux','lorentz','solenoid','toroid','torus',
      'ferromagnet','electromagnet','faraday','lenz','inductance','inductor',
      'rl circuit','lc circuit','coil wrapped','ampere law','biot savart',
      'current loop','galvanometer','motional emf','self induction',
      'mutual induction'], 'magnetism'),

    # Modern Physics
    (['photoelectric','photon','quantum','bohr model','energy level','de broglie',
      'heisenberg','nuclear','radioact','alpha decay','beta decay','gamma ray',
      'fission','fusion','half life','binding energy','mass defect',
      'electron volt','wave particle','hydrogen spectrum','rydberg',
      'compton','x-ray'], 'modern_physics'),

    # Optics
    (['refraction','refractive index','snell','total internal reflection',
      'focal length','concave','convex lens','convex mirror','prism',
      'dispersion','diffraction','interference','young slit',
      'double slit','optical','image formation','magnification',
      'telescope','microscope','mirror formula','lens formula',
      'power of lens'], 'optics'),

    # Electrostatics (no current)
    (['coulomb','electric field','electric potential','capacitor',
      'capacitance','dielectric','gauss','point charge','charge distribution',
      'equipotential','electric flux','permittivity','electrostatic',
      'van de graaff'], 'electrostatics'),

    # Current Electricity
    (['kirchhoff','wheatstone','potentiometer','internal resistance',
      'emf cell','ammeter','voltmeter','power dissipat','electric power',
      'ohm law','series circuit','parallel circuit','junction rule',
      'loop rule'], 'circuit'),

    # Thermodynamics
    (['carnot','isothermal','adiabatic','isobaric','isochoric',
      'ideal gas law','pv diagram','entropy','specific heat',
      'latent heat','thermal conductivity','heat engine','efficiency',
      'thermodynamics','boltzmann','molar heat','degrees of freedom',
      'gas constant','avogadro'], 'thermodynamics'),

    # Gravitation
    (['gravitational force','gravitational field','gravitational potential',
      'orbital velocity','satellite orbit','escape velocity','kepler',
      'planetary motion','universal gravitation','newton law gravitation',
      'geostationary','orbital period'], 'gravitation'),

    # Waves
    (['wave equation','wave propagation','wavelength','standing wave',
      'stationary wave','transverse wave','longitudinal wave',
      'doppler effect','beats','resonance frequency','node','antinode',
      'superposition of waves','wave speed'], 'wave'),

    # Oscillations / SHM
    (['simple harmonic','shm','restoring force','spring constant',
      'hooke law','time period of pendulum','angular frequency oscillation',
      'amplitude oscillat','damping','resonance oscillat',
      'simple pendulum','compound pendulum'], 'pendulum'),

    # Projectile / Mechanics
    (['projectile motion','range of projectile','maximum height projectile',
      'time of flight','horizontal range','trajectory'], 'projectile'),

    # General Mechanics
    (['newton second law','newton first law','newton third law',
      'momentum conservation','impulse','coefficient of friction',
      'circular motion','centripetal','work energy theorem',
      'elastic collision','inelastic collision','torque','angular momentum',
      'moment of inertia'], 'projectile'),

    # ── MATHEMATICS ──
    (['sin ','cos ','tan ','sin(','cos(','tan(','cot ','sec ','cosec',
      'unit circle','trigonometric','trig ratio','sine rule','cosine rule',
      'compound angle','double angle','half angle','identity sin',
      'identity cos'], 'trigonometry'),

    (['dot product','cross product','scalar product','vector product',
      'resultant vector','unit vector','position vector','vector addition',
      'vector subtraction','angle between vector','projection of vector',
      'component of vector'], 'vectors'),

    (['mean','median','mode','standard deviation','variance','statistics',
      'frequency distribution','histogram','normal distribution',
      'probability distribution','ogive','quartile','percentile'], 'statistics'),

    (['parabola','ellipse','hyperbola','conic section','focus directrix',
      'eccentricity','latus rectum','standard equation of','circle equation',
      'general equation of conic'], 'conic_sections'),

    (['differentiate','derivative','d/dx','dy/dx','rate of change',
      'slope of tangent','maxima','minima','increasing function',
      'decreasing function','critical point','chain rule','product rule',
      'quotient rule'], 'derivative'),

    (['integrate','integral','area under curve','definite integral',
      'indefinite integral','antiderivative','by parts','substitution method',
      'riemann sum','fundamental theorem'], 'integral'),

    (['plot f(x)','graph of function','f(x) =','y = x','polynomial',
      'linear function','quadratic function','cubic function',
      'exponential function','logarithmic function'], 'function_plot'),

    # ── CHEMISTRY ──
    (['electron configuration','bohr model of','atomic structure',
      'shell configuration','quantum number','atomic orbital','aufbau',
      'hund rule','pauli exclusion','electronic structure',
      'valence electron','atomic radius','ionization energy',
      'electron affinity'], 'atomic_structure'),

    (['electronegativity','ionic bond','covalent bond','metallic bond',
      'hybridization','vsepr','molecular geometry','bond angle',
      'bond length','bond energy','sigma bond','pi bond',
      'hydrogen bond','van der waals','dipole moment','polarity'], 'molecular_bonding'),

    (['ideal gas','van der waals','boyle law','charles law','gay lussac',
      'combined gas law','dalton law','graham law','kinetic theory',
      'rms speed','mean free path','gas pressure'], 'gas_laws'),

    (['chemical equilibrium','le chatelier','equilibrium constant',
      'kc','kp','ksp','degree of dissociation','reaction quotient',
      'forward reaction','backward reaction','shift in equilibrium',
      'common ion effect'], 'equilibrium'),

    (['electrolysis','electrochemical cell','galvanic cell','voltaic cell',
      'electrolytic cell','faraday law','electrode potential',
      'standard electrode','nernst equation','cell emf','oxidation',
      'reduction','anode','cathode','salt bridge','electrolyte'], 'electrochemistry'),

    (['rate of reaction','order of reaction','rate constant','activation energy',
      'arrhenius equation','half life chemistry','rate law','molecularity',
      'catalyst','collision theory','transition state','rate expression',
      'first order','second order','zero order'], 'reaction_kinetics'),

    (['organic compound','alkane','alkene','alkyne','functional group',
      'iupac name','isomer','addition reaction','substitution reaction',
      'elimination reaction','esterification','saponification',
      'polymer','monomer','benzene','aromatic'], 'organic_reaction'),

    (['periodic table','periodic trend','group','period element',
      'alkali metal','alkaline earth','halogen','noble gas',
      'transition metal','lanthanide','actinide'], 'periodic_trends'),
]


def _detect_sim(problem: str, domain: str = '', ai_type: str = '') -> str:
    """Strict keyword-based simulation type detection."""
    prob = problem.lower()

    # Layer 1: keyword scan (most reliable)
    for keywords, sim_type in SIM_RULES:
        for kw in keywords:
            if kw in prob:
                return sim_type

    # Layer 2: trust AI type only if it's specific (not generic defaults)
    ai = (ai_type or '').lower().strip()
    specific_types = {
        'gravitation','wave','magnetism','optics','electrostatics',
        'modern_physics','thermodynamics','trigonometry','vectors',
        'statistics','conic_sections','derivative','integral',
        'atomic_structure','molecular_bonding','gas_laws','equilibrium',
        'electrochemistry','reaction_kinetics','organic_reaction',
        'periodic_trends'
    }
    if ai in specific_types:
        return ai

    # Layer 3: domain fallback
    domain_map = {
        'Mechanics':            'projectile',
        'Gravitation':          'gravitation',
        'Oscillations & Waves': 'pendulum',
        'Oscillations':         'pendulum',
        'Waves':                'wave',
        'Thermodynamics':       'thermodynamics',
        'Electrostatics':       'electrostatics',
        'Current Electricity':  'circuit',
        'Magnetism':            'magnetism',
        'Optics':               'optics',
        'Modern Physics':       'modern_physics',
        # Math
        'Algebra':              'function_plot',
        'Calculus':             'derivative',
        'Trigonometry':         'trigonometry',
        'Vectors':              'vectors',
        'Statistics':           'statistics',
        'Coordinate Geometry':  'conic_sections',
        # Chemistry
        'Atomic Structure':     'atomic_structure',
        'Chemical Bonding':     'molecular_bonding',
        'States of Matter':     'gas_laws',
        'Equilibrium':          'equilibrium',
        'Electrochemistry':     'electrochemistry',
        'Kinetics':             'reaction_kinetics',
        'Organic Chemistry':    'organic_reaction',
        'Periodic Table':       'periodic_trends',
    }
    if domain in domain_map:
        return domain_map[domain]

    return 'none'


# ─────────────────────────────────────────────────────────────
# Groq API call with timeout
# ─────────────────────────────────────────────────────────────
def _call(prompt: str, tokens: int = 1800) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=tokens,
        temperature=0.1,
    )
    return re.sub(r"```json|```", "", resp.choices[0].message.content.strip()).strip()


# ─────────────────────────────────────────────────────────────
# COMPACT prompt — faster, less tokens, still gets everything
# ─────────────────────────────────────────────────────────────
COMPACT_SYSTEM = """Expert Class 11-12 teacher. Solve the problem completely. Return ONLY raw JSON, no markdown.

RULES:
- final_answer: actual computed number with units. NEVER "See solution steps"
- formulas[]: always populate with formulas used  
- simulation.type: must match problem physics exactly
- solution_steps: real formula + real numbers substituted + calculated result
- correct_option: exact MCQ option text (or "" for numerical)"""


def process_problem(problem: str, subject: str = 'physics') -> dict:
    problem = clean_latex(problem)

    # Detect simulation type from problem text BEFORE calling AI
    pre_detected_sim = _detect_sim(problem, '', '')

    prompt = f"""{COMPACT_SYSTEM}

Subject: {subject}
Problem: {problem}

Return this JSON:
{{
  "subject": "{subject}",
  "domain": "appropriate domain name",
  "concept": "specific concept name",
  "type": "numerical",
  "given": [{{"symbol":"G","label":"Gravitational constant","value":"6.674×10⁻¹¹ N·m²/kg²"}}],
  "to_find": "what to calculate",
  "core_concept": "2-3 sentence plain explanation of the physics/math/chemistry concept",
  "variables": {{"length":null,"gravity":9.8,"velocity":null,"angle":null,"resistance":null,"voltage":null,"frequency":null,"amplitude":null,"expression":null,"mass1":null,"mass2":null,"radius":null,"atomic_number":null,"n1":null,"n2":null,"temperature":null,"pressure":null,"moles":null,"kc":null,"k":null,"order":null}},
  "simulation": {{"type":"{pre_detected_sim}","description":"what simulation shows","parameters":{{}}}},
  "solution_steps": [
    {{"step":1,"heading":"Write the formula","explanation":"explain why","formula":"F = GMm/r²","substitution":"","calculation":"","result":""}},
    {{"step":2,"heading":"Substitute values","explanation":"plug in numbers","formula":"","substitution":"F = 6.674×10⁻¹¹ × 2×10³⁰ × 6×10²⁴ / (1.5×10¹¹)²","calculation":"F = 3.56×10²² N","result":"F = 3.56×10²² N ✓"}}
  ],
  "formulas": [{{"name":"Newton's Gravitation","f":"F = GMm/r²"}}],
  "final_answer": "3.56×10²² N",
  "correct_option": "",
  "narration_script": [
    {{"time":0,"text":"Watch the simulation. This shows the concept visually.","highlight":null}},
    {{"time":4,"text":"The formula is [formula name]. We substitute the values.","highlight":"formula"}},
    {{"time":10,"text":"The answer is [computed answer].","highlight":"answer"}}
  ],
  "explore_config": {{
    "type": "{pre_detected_sim}",
    "sliders": [{{"id":"mass1","label":"Mass M","unit":"×10³⁰ kg","min":0.1,"max":5,"step":0.1,"default":2,"affects":"Larger M → stronger force"}}],
    "observations": ["observation 1","observation 2"]
  }},
  "flip_cards": [{{"front":"F = GMm/r²","back":"Newton's universal law of gravitation. F∝Mm, F∝1/r²"}}],
  "needs_animation": true
}}"""

    raw = _call(prompt, 1800)
    result = {}
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        try:
            # Try to rescue truncated JSON
            idx = raw.rfind('}')
            result = json.loads(raw[:idx+1])
        except Exception:
            result = _fallback(problem, subject, pre_detected_sim)

    # ALWAYS override simulation type with our reliable detector
    ai_sim  = result.get("simulation", {}).get("type", "")
    domain  = result.get("domain", "")
    correct_sim = _detect_sim(problem, domain, ai_sim)
    if "simulation" not in result:
        result["simulation"] = {}
    result["simulation"]["type"] = correct_sim

    # Fix missing/wrong final_answer
    fa = result.get("final_answer", "")
    if not fa or any(x in fa.lower() for x in
                     ["see solution", "calculated", "see steps", "see solution steps above", ""]):
        result["final_answer"] = _extract_answer(result)

    # Fix missing formulas
    if not result.get("formulas"):
        result["formulas"] = _pull_formulas(result)

    # Generate narrations separately (short prompt = fast)
    result["narration"] = _narrations(problem, result, subject)

    return result


def _extract_answer(result: dict) -> str:
    """Pull actual answer from last solution step with a calculation."""
    for s in reversed(result.get("solution_steps", [])):
        for k in ["result", "calculation", "substitution"]:
            v = (s.get(k) or "").strip()
            if v and len(v) > 2 and any(c.isdigit() for c in v):
                # Get last = sign's right side
                parts = v.split("=")
                cand = parts[-1].strip().rstrip("✓ ").strip()
                if cand and len(cand) > 1:
                    return cand
    return "See solution steps above"


def _pull_formulas(result: dict) -> list:
    seen, out = set(), []
    for s in result.get("solution_steps", []):
        f = (s.get("formula") or s.get("f") or "").strip()
        if f and f not in seen:
            seen.add(f)
            out.append({"name": s.get("heading") or f"Step {s.get('step','')}", "f": f})
    return out


def _narrations(problem: str, result: dict, subject: str = 'physics') -> dict:
    steps = " ".join(
        f"{s.get('formula','')} {s.get('substitution','')} {s.get('calculation','')}".strip()
        for s in result.get("solution_steps", [])
    )
    final   = result.get("correct_option") or result.get("final_answer", "")
    concept = result.get("core_concept", "")

    def gen(p, t=350):
        try:
            return _call(p, t).strip('"\'').strip()
        except Exception:
            return ""

    eng = gen(f"""Physics teacher narrating to student watching animation. 4-5 sentences only.
Mention: concept, formula, numbers, answer.
Problem: {problem[:150]}. Concept: {concept[:100]}. Answer: {final}
Write ONLY the narration (no JSON):""")

    hindi = gen(f"""भौतिकी शिक्षक, 4-5 वाक्य, सूत्र और उत्तर बोलें।
प्रश्न: {problem[:100]}. उत्तर: {final}
केवल नरेशन:""", 350)

    marathi = gen(f"""भौतिकशास्त्र शिक्षक, ४-५ वाक्ये, सूत्र आणि उत्तर सांगा.
प्रश्न: {problem[:100]}. उत्तर: {final}
फक्त नरेशन:""", 350)

    def safe(t, fb): return t if t and len(t.strip()) > 20 else fb
    return {
        "english": safe(eng,    f"{concept[:80]}. The answer is {final}."),
        "hindi":   safe(hindi,  f"इस समस्या में {concept[:60]}. उत्तर है {final}."),
        "marathi": safe(marathi,f"या प्रश्नात {concept[:60]}. उत्तर आहे {final}."),
    }


def _fallback(problem: str, subject: str = 'physics', sim_type: str = 'none') -> dict:
    return {
        "subject": subject, "domain": subject.title(), "concept": "Problem",
        "type": "numerical", "given": [], "to_find": problem,
        "core_concept": "Apply the relevant formula to solve this problem.",
        "variables": {"length":1,"amplitude_deg":20,"gravity":9.8,"frequency":None,
                      "velocity":None,"angle":None,"resistance":None,"voltage":None,
                      "expression":None},
        "simulation": {"type": sim_type, "description": "Simulation", "parameters": {}},
        "solution_steps": [{"step":1,"heading":"Solve","explanation":problem,
                            "formula":"","substitution":"","calculation":"","result":""}],
        "formulas": [], "final_answer": "See solution steps", "correct_option": "",
        "narration_script": [{"time":0,"text":"Let us solve this problem step by step.","highlight":None}],
        "explore_config": {"type": sim_type, "sliders": [], "observations": []},
        "flip_cards": [], "needs_animation": sim_type != 'none',
    }


# ─────────────────────────────────────────────────────────────
# Image processing
# ─────────────────────────────────────────────────────────────
def process_image(image_bytes: bytes, mime_type: str, subject: str = 'physics') -> dict:
    import base64
    img = base64.standard_b64encode(image_bytes).decode("utf-8")
    try:
        resp = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role":"user","content":[
                {"type":"image_url","image_url":{"url":f"data:{mime_type};base64,{img}"}},
                {"type":"text","text":"""Extract the complete question from this image.
Include all numbers, units, and MCQ options (label a,b,c,d,e).
Write numbers clearly: 6 × 10^24 kg (not LaTeX).
Return ONLY JSON: {"extracted_text": "complete question here"}"""}
            ]}], max_tokens=600,
        )
        raw = re.sub(r"```json|```","",resp.choices[0].message.content.strip()).strip()
        parsed    = json.loads(raw)
        extracted = clean_latex(parsed.get("extracted_text",""))
        if extracted:
            result = process_problem(extracted, subject)
            result["extracted_question"] = extracted
            return result
    except Exception as e:
        print(f"Image error: {e}")
    return _fallback("Could not read image", subject)