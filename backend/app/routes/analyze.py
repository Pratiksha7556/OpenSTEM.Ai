"""
analyze.py — Main API routes for SimAI
Handles: physics, mathematics, chemistry
Copy to: backend/app/routes/analyze.py
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


# ── Safe imports — never crash server on missing module ────────
def _safe_import(module_path: str, func_name: str):
    """Import a function safely, return None if import fails."""
    try:
        import importlib
        mod = importlib.import_module(module_path)
        return getattr(mod, func_name, None)
    except Exception as e:
        print(f"[import warning] {module_path}.{func_name}: {e}")
        return None


# Core engine
process_problem = _safe_import("app.services.physics_engine_service", "process_problem")
process_image   = _safe_import("app.services.physics_engine_service", "process_image")

if not process_problem:
    def process_problem(problem: str, subject: str = "physics") -> dict:
        return {
            "subject": subject, "domain": "Unknown", "concept": problem[:60],
            "type": "conceptual", "given": [], "to_find": problem,
            "core_concept": "Backend engine not loaded. Check physics_engine_service.py",
            "variables": {}, "simulation": {"type": "none"},
            "solution_steps": [{"step":1,"heading":"Error","explanation":"Engine not loaded","formula":"","substitution":"","calculation":"","result":""}],
            "formulas": [], "final_answer": "Engine error", "correct_option": "",
            "narration": {"english":"Backend error.","hindi":"Backend error.","marathi":"Backend error."},
            "narration_script": [], "explore_config": {"type":"none","sliders":[],"observations":[]},
            "flip_cards": [], "needs_animation": False,
        }

    def process_image(image_bytes, mime_type, subject="physics"):
        return process_problem("Image could not be processed - engine not loaded", subject)


# Physics simulations
projectile_simulation = _safe_import("app.simulation.physics", "projectile_simulation")
pendulum_simulation   = _safe_import("app.simulation.physics", "pendulum_simulation")
wave_simulation       = _safe_import("app.simulation.physics", "wave_simulation")
circuit_simulation    = _safe_import("app.simulation.physics", "circuit_simulation")
function_plot         = _safe_import("app.simulation.math_sim", "function_plot")

# New simulations from new_sims.py
gravitation_simulation    = _safe_import("app.simulation.new_sims", "gravitation_simulation")
electrostatics_simulation = _safe_import("app.simulation.new_sims", "electrostatics_simulation")
magnetism_simulation      = _safe_import("app.simulation.new_sims", "magnetism_simulation")
optics_simulation         = _safe_import("app.simulation.new_sims", "optics_simulation")
thermodynamics_simulation = _safe_import("app.simulation.new_sims", "thermodynamics_simulation")
modern_physics_simulation = _safe_import("app.simulation.new_sims", "modern_physics_simulation")
# Math
trigonometry_simulation   = _safe_import("app.simulation.new_sims", "trigonometry_simulation")
vectors_simulation        = _safe_import("app.simulation.new_sims", "vectors_simulation")
statistics_simulation     = _safe_import("app.simulation.new_sims", "statistics_simulation")
conic_sections_simulation = _safe_import("app.simulation.new_sims", "conic_sections_simulation")
derivative_simulation     = _safe_import("app.simulation.new_sims", "derivative_simulation")
integral_simulation       = _safe_import("app.simulation.new_sims", "integral_simulation")
# Chemistry
atomic_structure_sim      = _safe_import("app.simulation.new_sims", "atomic_structure_simulation")
molecular_bonding_sim     = _safe_import("app.simulation.new_sims", "molecular_bonding_simulation")
gas_laws_sim              = _safe_import("app.simulation.new_sims", "gas_laws_simulation")
equilibrium_sim           = _safe_import("app.simulation.new_sims", "equilibrium_simulation")
electrochemistry_sim      = _safe_import("app.simulation.new_sims", "electrochemistry_simulation")
reaction_kinetics_sim     = _safe_import("app.simulation.new_sims", "reaction_kinetics_simulation")
periodic_trends_sim       = _safe_import("app.simulation.new_sims", "periodic_trends_simulation")
organic_reaction_sim      = _safe_import("app.simulation.new_sims", "organic_reaction_simulation")


# ── Complete routing map ───────────────────────────────────────
SIM_FN = {
    # Physics
    "pendulum":           pendulum_simulation,
    "oscillation":        pendulum_simulation,
    "shm":                pendulum_simulation,
    "spring":             pendulum_simulation,
    "projectile":         projectile_simulation,
    "projectile_motion":  projectile_simulation,
    "mechanics":          projectile_simulation,
    "trajectory":         projectile_simulation,
    "wave":               wave_simulation,
    "waves":              wave_simulation,
    "sound":              wave_simulation,
    "circuit":            circuit_simulation,
    "current_electricity":circuit_simulation,
    "ohms_law":           circuit_simulation,
    "resistance":         circuit_simulation,
    "graph":              function_plot,
    "function_plot":      function_plot,
    "gravitation":        gravitation_simulation,
    "gravity":            gravitation_simulation,
    "orbit":              gravitation_simulation,
    "electrostatics":     electrostatics_simulation,
    "electric_field":     electrostatics_simulation,
    "coulomb":            electrostatics_simulation,
    "magnetism":          magnetism_simulation,
    "magnetic":           magnetism_simulation,
    "lorentz":            magnetism_simulation,
    "electromagnetic":    magnetism_simulation,
    "optics":             optics_simulation,
    "refraction":         optics_simulation,
    "reflection":         optics_simulation,
    "lens":               optics_simulation,
    "mirror":             optics_simulation,
    "thermodynamics":     thermodynamics_simulation,
    "pv_diagram":         thermodynamics_simulation,
    "ideal_gas":          thermodynamics_simulation,
    "modern_physics":     modern_physics_simulation,
    "photoelectric":      modern_physics_simulation,
    "bohr":               modern_physics_simulation,
    "energy_levels":      modern_physics_simulation,
    "atomic":             modern_physics_simulation,
    "quantum":            modern_physics_simulation,
    # Mathematics
    "trigonometry":       trigonometry_simulation,
    "vectors":            vectors_simulation,
    "statistics":         statistics_simulation,
    "conic_sections":     conic_sections_simulation,
    "derivative":         derivative_simulation,
    "integral":           integral_simulation,
    "function_plot_math": function_plot,
    "complex_numbers":    function_plot,
    # Chemistry
    "atomic_structure":   atomic_structure_sim,
    "molecular_bonding":  molecular_bonding_sim,
    "gas_laws":           gas_laws_sim,
    "equilibrium":        equilibrium_sim,
    "electrochemistry":   electrochemistry_sim,
    "reaction_kinetics":  reaction_kinetics_sim,
    "periodic_trends":    periodic_trends_sim,
    "organic_reaction":   organic_reaction_sim,
    # No simulation
    "none":               None,
}


def _extract_vars(result: dict) -> dict:
    """Extract variables from AI result for simulation."""
    p  = result.get("simulation", {}).get("parameters", {})
    v  = result.get("variables", {})
    gm = {}

    for g in result.get("given", []):
        sym = (g.get("symbol") or g.get("s") or "").strip().lower()
        raw = (g.get("value")  or g.get("v") or "").strip()
        try:
            clean = raw
            for unit in [" kg"," m"," s"," N"," V"," Ω"," Hz"," J"," K"," Pa",
                         " rad/s"," m/s"," eV"," C"," mol"," L"," atm"," nm",
                         " pm"," kJ"," kPa"," dm³"]:
                clean = clean.replace(unit, "")
            clean = (clean.replace("×","*").replace("×","*")
                .replace("⁻¹¹","e-11").replace("⁻¹⁰","e-10").replace("⁻⁹","e-9")
                .replace("⁻⁸","e-8").replace("⁻⁷","e-7").replace("⁻⁶","e-6")
                .replace("⁻⁵","e-5").replace("⁻⁴","e-4").replace("⁻³","e-3")
                .replace("⁻²","e-2").replace("⁻¹","e-1")
                .replace("²⁴","e24").replace("³⁰","e30").replace("²⁰","e20")
                .replace("¹¹","e11").replace("¹⁰","e10")
                .strip())
            gm[sym] = float(eval(clean))
        except Exception:
            pass

    return {
        # Physics
        "length":           p.get("length")           or v.get("length")           or gm.get("l")   or 1.0,
        "amplitude":        p.get("amplitude_deg")    or v.get("amplitude")        or gm.get("a")   or 20,
        "frequency":        p.get("frequency")        or v.get("frequency")        or gm.get("f"),
        "velocity":         p.get("velocity")         or v.get("velocity")         or gm.get("v")   or gm.get("u"),
        "angle":            p.get("angle")            or v.get("angle")            or gm.get("θ"),
        "gravity":          p.get("gravity")          or v.get("gravity")          or 9.8,
        "resistance":       p.get("resistance")       or v.get("resistance")       or gm.get("r"),
        "voltage":          p.get("voltage")          or v.get("voltage"),
        "expression":       v.get("expression"),
        # Gravitation / E&M
        "mass1":            p.get("mass1")            or v.get("mass1")            or gm.get("m")   or gm.get("ms"),
        "mass2":            p.get("mass2")            or v.get("mass2")            or gm.get("me"),
        "mass":             v.get("mass")             or gm.get("m"),
        "radius":           p.get("radius")           or v.get("radius")           or gm.get("r")   or gm.get("d"),
        "distance":         p.get("distance")         or v.get("distance")         or gm.get("d"),
        "charge1":          p.get("charge1")          or v.get("charge1")          or gm.get("q1")  or gm.get("q"),
        "charge2":          p.get("charge2")          or v.get("charge2")          or gm.get("q2"),
        "charge":           v.get("charge")           or gm.get("q"),
        "magnetic_field":   p.get("magnetic_field")   or v.get("magnetic_field")   or gm.get("b"),
        "current":          p.get("current")          or v.get("current")          or gm.get("i"),
        "inductance":       p.get("inductance")       or v.get("inductance")       or gm.get("l_h"),
        # Optics
        "n1":               p.get("n1")               or v.get("n1"),
        "n2":               p.get("n2")               or v.get("n2"),
        "focal_length":     p.get("focal_length")     or v.get("focal_length"),
        "object_distance":  p.get("object_distance")  or v.get("object_distance"),
        # Thermo / Modern
        "temperature":      p.get("temperature")      or v.get("temperature")      or gm.get("t"),
        "pressure":         p.get("pressure")         or v.get("pressure")         or gm.get("p"),
        "moles":            p.get("moles")            or v.get("moles")            or gm.get("n"),
        "molar_mass":       v.get("molar_mass"),
        "T_hot":            v.get("T_hot"),
        "T_cold":           v.get("T_cold"),
        "atomic_number":    p.get("atomic_number")    or v.get("atomic_number")    or gm.get("z"),
        "n1_level":         p.get("n1")               or v.get("n1"),
        "n2_level":         p.get("n2")               or v.get("n2"),
        "kinetic_energy":   v.get("kinetic_energy"),
        "work_function":    v.get("work_function"),
        # Chemistry
        "kc":               v.get("kc")               or v.get("Kc"),
        "initial_conc":     v.get("initial_conc")     or v.get("C0"),
        "rate_constant":    v.get("k")                or v.get("rate_constant"),
        "order":            v.get("order"),
        "activation_energy":v.get("Ea")              or v.get("activation_energy") or gm.get("ea"),
        "emf":              v.get("emf")              or gm.get("e"),
        "molecule":         v.get("molecule"),
        "reaction_type":    v.get("reaction_type"),
        "conic_type":       v.get("conic_type"),
        # Math
        "a":                v.get("a")                or gm.get("a"),
        "b":                v.get("b")                or gm.get("b"),
        "x0":               v.get("x0"),
        "lower":            v.get("lower")            or v.get("a"),
        "upper":            v.get("upper")            or v.get("b"),
        "data":             v.get("data"),
        "ax":               v.get("ax"),  "ay": v.get("ay"),
        "bx":               v.get("bx"),  "by": v.get("by"),
    }


def _run_sim(result: dict) -> dict | None:
    sim_type = result.get("simulation", {}).get("type", "none")
    if sim_type == "none" or not sim_type:
        return None
    fn = SIM_FN.get(sim_type)
    if fn is None:
        return None
    try:
        return fn(_extract_vars(result))
    except Exception as e:
        print(f"[sim_data error] {sim_type}: {e}")
        return None


# ── Request/Response models ────────────────────────────────────
class ProblemRequest(BaseModel):
    problem: str
    subject: str = "physics"   # physics | mathematics | chemistry


# ── Routes ────────────────────────────────────────────────────
@router.post("/analyze")
def analyze(data: ProblemRequest):
    try:
        result = process_problem(data.problem, data.subject)
        result["simulation_data"] = _run_sim(result)
        return {"success": True, **result}
    except Exception as e:
        import traceback
        print(f"[analyze error] {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image")
async def analyze_image_route(
    file: UploadFile = File(...),
    subject: str = Query(default="physics")
):
    try:
        contents = await file.read()
        result   = process_image(contents, file.content_type, subject)
        result["simulation_data"] = _run_sim(result)
        return {"success": True, **result}
    except Exception as e:
        import traceback
        print(f"[analyze-image error] {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ping")
def ping():
    """Health check — also shows which modules loaded."""
    loaded = {k: (v is not None) for k,v in {
        "physics_engine": process_problem,
        "projectile_sim": projectile_simulation,
        "pendulum_sim":   pendulum_simulation,
        "wave_sim":       wave_simulation,
        "circuit_sim":    circuit_simulation,
        "new_sims":       gravitation_simulation,
        "chemistry_sims": equilibrium_sim,
        "math_sims":      trigonometry_simulation,
    }.items()}
    return {"status": "ok", "modules_loaded": loaded}