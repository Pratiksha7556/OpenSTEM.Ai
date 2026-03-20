from groq import Groq
import json, re, math

GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)
MODEL  = "llama-3.1-8b-instant"


def _call(prompt: str, max_tokens: int = 2000) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.1,
    )
    return re.sub(r"```json|```", "", resp.choices[0].message.content.strip()).strip()


def analyze_problem(problem: str) -> dict:

    # ── Step 1: Solve completely ──────────────────────────────
    solve_prompt = f"""You are an expert physics/math teacher. Solve this problem COMPLETELY with actual numbers.

Problem: {problem}

IMPORTANT: You MUST calculate the actual numerical answer. Do NOT say "Calculated" or leave blank.

Return ONLY this exact JSON (no markdown):
{{
  "subject": "physics",
  "topic": "pendulum",
  "needs_animation": true,
  "question_type": "mcq",
  "given": [
    {{"symbol": "L", "label": "Pendulum length", "value": "1 m"}},
    {{"symbol": "omega_0", "label": "Angular frequency", "value": "10 rad/s"}},
    {{"symbol": "Omega", "label": "Support frequency", "value": "1 rad/s"}},
    {{"symbol": "a", "label": "Support amplitude", "value": "0.01 m"}}
  ],
  "to_find": "Relative change in angular frequency delta_omega",
  "core_concept": "When a pendulum support oscillates vertically, effective gravity changes periodically, causing a small shift in natural frequency called parametric modulation.",
  "solution_steps": [
    {{
      "step": 1,
      "heading": "Write the formula",
      "explanation": "For a pendulum with vertically oscillating support, the change in angular frequency is:",
      "formula": "Δω = (a × Ω²) / (2 × ω₀ × L)",
      "substitution": "",
      "calculation": "",
      "result": ""
    }},
    {{
      "step": 2,
      "heading": "Substitute values",
      "explanation": "Substituting a = 0.01 m, Ω = 1 rad/s, ω₀ = 10 rad/s, L = 1 m:",
      "formula": "",
      "substitution": "Δω = (0.01 × 1²) / (2 × 10 × 1)",
      "calculation": "Δω = 0.01 / 20 = 5 × 10⁻⁴ rad/s",
      "result": ""
    }},
    {{
      "step": 3,
      "heading": "Compare with options",
      "explanation": "5 × 10⁻⁴ ≈ 10⁻³ (same order of magnitude). So option (1) is correct.",
      "formula": "",
      "substitution": "",
      "calculation": "5 × 10⁻⁴ ≈ 10⁻³ rad/s",
      "result": "Answer: (1) 10⁻³ rad/s ✓"
    }}
  ],
  "final_answer": "5 × 10⁻⁴ rad/s ≈ 10⁻³ rad/s",
  "correct_option": "(1) 10⁻³ rad/s",
  "variables": {{
    "length": 1.0,
    "amplitude": 15,
    "frequency": 1.0,
    "velocity": null,
    "angle": null,
    "gravity": 9.8,
    "resistance": null,
    "voltage": null,
    "expression": null
  }},
  "explore_config": {{
    "type": "pendulum",
    "sliders": [
      {{"id": "length", "label": "Length L", "unit": "m", "min": 0.2, "max": 5.0, "step": 0.1, "default": 1.0, "affects": "Period T increases when L increases"}},
      {{"id": "gravity", "label": "Gravity g", "unit": "m/s²", "min": 0.5, "max": 25.0, "step": 0.1, "default": 9.8, "affects": "Lower g (like Moon) → longer period"}},
      {{"id": "amplitude", "label": "Amplitude", "unit": "°", "min": 2, "max": 60, "step": 1, "default": 20, "affects": "Small amplitude barely changes period"}}
    ],
    "observations": [
      "Increase L → pendulum swings slower (T = 2π√(L/g))",
      "Decrease g → same effect as longer pendulum",
      "Moon gravity (g=1.6 m/s²): period is 2.5× longer than Earth",
      "At high altitude: g decreases slightly → T increases slightly",
      "Amplitude < 30°: barely affects period (small angle approximation)"
    ]
  }}
}}

CRITICAL RULES:
- final_answer MUST be an actual calculated number/expression, NEVER "Calculated"
- solution_steps MUST have real formulas and real number substitutions
- correct_option for MCQ must be the exact option text
- topic must be: projectile_motion, pendulum, wave, circuit, function_plot, or concept_only
- explore_config sliders must match the topic (pendulum→length/gravity, circuit→voltage/resistance, etc.)
- Return ONLY raw JSON"""

    solved = {}
    text = _call(solve_prompt, 2000)
    try:
        solved = json.loads(text)
    except:
        try:
            idx = max(text.rfind("}"), 0)
            solved = json.loads(text[:idx+1])
        except:
            solved = _fallback(problem)

    # Validate final_answer is not empty/placeholder
    fa = solved.get("final_answer", "")
    if not fa or fa.lower() in ["calculated", "see steps", ""]:
        solved["final_answer"] = _compute_fallback_answer(solved)

    # ── Step 2: Generate narration separately ─────────────────
    solved["narration"] = _narration(problem, solved)
    return solved


def _compute_fallback_answer(solved: dict) -> str:
    """Try to compute a basic answer from the steps."""
    for s in reversed(solved.get("solution_steps", [])):
        calc = s.get("calculation", "") or s.get("result", "")
        if calc and len(calc) > 3:
            return calc
    return "See solution steps above"


def _narration(problem: str, solved: dict) -> dict:
    steps_text = ""
    for s in solved.get("solution_steps", []):
        if s.get("formula"):    steps_text += f"The formula is {s['formula']}. "
        if s.get("substitution"): steps_text += f"Substituting: {s['substitution']}. "
        if s.get("calculation"):  steps_text += f"This gives {s['calculation']}. "
        if s.get("result"):       steps_text += f"{s['result']}. "
    final = solved.get("correct_option") or solved.get("final_answer", "")
    concept = solved.get("core_concept", "")

    eng = _call(f"""You are a physics teacher explaining a solution while a student watches an animation.
Speak naturally in 5-6 sentences. Mention: the concept, the formula by name, the numbers substituted, and state the final answer clearly.
Do NOT say "let us" or "we". Use: "notice that", "the formula tells us", "substituting these values".

Problem: {problem}
Concept: {concept}
Solution: {steps_text}
Answer: {final}

Write ONLY the narration text (no JSON, no quotes, no preamble):""", 400)

    hindi = _call(f"""आप एक भौतिकी शिक्षक हैं जो एनीमेशन देखते हुए हल समझा रहे हैं।
प्राकृतिक हिंदी में 5-6 वाक्य। सूत्र का नाम, संख्याएं, और अंतिम उत्तर स्पष्ट बोलें।

प्रश्न: {problem}
अवधारणा: {concept}
हल: {steps_text}
उत्तर: {final}

केवल नरेशन लिखें (कोई JSON नहीं):""", 500)

    marathi = _call(f"""तुम्ही एक भौतिकशास्त्राचे शिक्षक आहात जे अॅनिमेशन पाहताना उपाय सांगत आहात।
नैसर्गिक मराठीत ५-६ वाक्ये. सूत्राचे नाव, संख्या आणि अंतिम उत्तर स्पष्टपणे सांगा.

प्रश्न: {problem}
संकल्पना: {concept}
उपाय: {steps_text}
उत्तर: {final}

फक्त नरेशन लिहा (JSON नाही):""", 500)

    def clean(t): return t.strip('"\'').strip()
    return {
        "english": clean(eng) if len(clean(eng)) > 20 else f"In this problem, {concept}. {steps_text} The answer is {final}.",
        "hindi":   clean(hindi) if len(clean(hindi)) > 20 else f"इस समस्या में, {concept}. उत्तर है {final}.",
        "marathi": clean(marathi) if len(clean(marathi)) > 20 else f"या प्रश्नात, {concept}. उत्तर आहे {final}.",
    }


def _fallback(problem: str) -> dict:
    return {
        "subject": "physics", "topic": "pendulum", "needs_animation": True,
        "question_type": "numerical",
        "given": [], "to_find": problem,
        "core_concept": "Apply the relevant formula to find the answer.",
        "solution_steps": [{"step":1,"heading":"Read the problem","explanation":problem,"formula":"","substitution":"","calculation":"","result":""}],
        "final_answer": "See solution steps", "correct_option": "",
        "variables": {"length":1,"amplitude":15,"frequency":1,"velocity":None,"angle":None,"gravity":9.8,"resistance":None,"voltage":None,"expression":None},
        "explore_config": {
            "type": "pendulum",
            "sliders": [
                {"id":"length","label":"Length L","unit":"m","min":0.2,"max":5,"step":0.1,"default":1.0,"affects":"Period changes with length"},
                {"id":"gravity","label":"Gravity g","unit":"m/s²","min":0.5,"max":25,"step":0.1,"default":9.8,"affects":"Lower gravity → slower swing"}
            ],
            "observations": ["Change L to see how period changes","Change g to simulate other planets"]
        }
    }


def analyze_image_problem(image_bytes: bytes, mime_type: str) -> dict:
    import base64
    image_data = base64.standard_b64encode(image_bytes).decode("utf-8")
    resp = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role":"user","content":[
            {"type":"image_url","image_url":{"url":f"data:{mime_type};base64,{image_data}"}},
            {"type":"text","text":'Read this image and extract the complete question text including all numbers and options. Return ONLY JSON: {"extracted_text": "complete question here"}'}
        ]}], max_tokens=600,
    )
    text = re.sub(r"```json|```","",resp.choices[0].message.content.strip()).strip()
    try:
        extracted = json.loads(text).get("extracted_text","")
        if extracted: return analyze_problem(extracted)
    except: pass
    return _fallback("Could not read image")