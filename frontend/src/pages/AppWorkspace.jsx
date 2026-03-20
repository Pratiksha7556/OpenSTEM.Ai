import {
  useState,
  useRef,
  useCallback,
  useEffect,
  lazy,
  Suspense,
} from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { analyzeProblem, analyzeImage } from "../services/api";

const SIMS = {
  // Physics — existing
  pendulum: lazy(() => import("../simulations/PendulumSimulation")),
  projectile: lazy(() => import("../simulations/ProjectileSimulation")),
  wave: lazy(() => import("../simulations/WaveSimulation")),
  circuit: lazy(() => import("../simulations/CircuitSimulation")),
  graph: lazy(() => import("../simulations/FunctionPlot")),
  function_plot: lazy(() => import("../simulations/FunctionPlot")),
  // Physics — new
  gravitation: lazy(() => import("../simulations/GravitationSimulation")),
  electrostatics: lazy(() => import("../simulations/ElectrostaticsSimulation")),
  magnetism: lazy(() => import("../simulations/MagnetismSimulation")),
  optics: lazy(() => import("../simulations/OpticsSimulation")),
  modern_physics: lazy(() => import("../simulations/ModernPhysicsSimulation")),
  thermodynamics: lazy(() => import("../simulations/ThermodynamicsSimulation")),
  // Mathematics
  trigonometry: lazy(() => import("../simulations/TrigonometrySimulation")),
  vectors: lazy(() => import("../simulations/VectorsSimulation")),
  derivative: lazy(() => import("../simulations/FunctionPlotSimulation")),
  integral: lazy(() => import("../simulations/FunctionPlotSimulation")),
  conic_sections: lazy(() => import("../simulations/ConicSectionsSimulation")),
  statistics: lazy(() => import("../simulations/StatisticsSimulation")),
  // Chemistry kinetics
  reaction_kinetics: lazy(
    () => import("../simulations/ReactionKineticsSimulation"),
  ),
  organic_reaction: lazy(
    () => import("../simulations/AtomicStructureSimulation"),
  ),
  complex_numbers: lazy(() => import("../simulations/FunctionPlotSimulation")),
  // Chemistry
  atomic_structure: lazy(
    () => import("../simulations/AtomicStructureSimulation"),
  ),
  equilibrium: lazy(
    () => import("../simulations/ChemicalEquilibriumSimulation"),
  ),
  electrochemistry: lazy(
    () => import("../simulations/ElectrochemistrySimulation"),
  ),
  gas_laws: lazy(() => import("../simulations/ThermodynamicsSimulation")),
  molecular_bonding: lazy(
    () => import("../simulations/AtomicStructureSimulation"),
  ),
};

const TOPIC_META = {
  // Physics
  projectile: { label: "Projectile Motion", icon: "⟳", color: "#00d4ff" },
  pendulum: { label: "Simple Pendulum", icon: "◎", color: "#0ea5e9" },
  wave: { label: "Wave Motion", icon: "≈", color: "#9b59b6" },
  circuit: { label: "Ohm's Law", icon: "⚡", color: "#2ecc71" },
  graph: { label: "Function Plot", icon: "∫", color: "#e74c3c" },
  function_plot: { label: "Function Plot", icon: "∫", color: "#e74c3c" },
  gravitation: { label: "Gravitation", icon: "🌍", color: "#f5a623" },
  electrostatics: { label: "Electrostatics", icon: "⚡", color: "#f59e0b" },
  magnetism: { label: "Magnetism", icon: "🧲", color: "#e91e63" },
  optics: { label: "Optics", icon: "🔬", color: "#00bcd4" },
  modern_physics: { label: "Modern Physics", icon: "⚛", color: "#7c3aed" },
  thermodynamics: { label: "Thermodynamics", icon: "🌡", color: "#ef4444" },
  // Math
  trigonometry: { label: "Trigonometry", icon: "∠", color: "#8b5cf6" },
  vectors: { label: "Vectors", icon: "→", color: "#06b6d4" },
  derivative: { label: "Differentiation", icon: "f'", color: "#f59e0b" },
  integral: { label: "Integration", icon: "∫", color: "#10b981" },
  conic_sections: { label: "Conic Sections", icon: "○", color: "#6366f1" },
  statistics: { label: "Statistics", icon: "σ", color: "#ec4899" },
  // Chemistry
  atomic_structure: { label: "Atomic Structure", icon: "⚛", color: "#7c3aed" },
  equilibrium: { label: "Equilibrium", icon: "⇌", color: "#0ea5e9" },
  electrochemistry: { label: "Electrochemistry", icon: "🔋", color: "#f59e0b" },
  gas_laws: { label: "Gas Laws", icon: "💨", color: "#ef4444" },
  molecular_bonding: { label: "Bonding", icon: "🔗", color: "#10b981" },
  organic_reaction: { label: "Organic Chemistry", icon: "⬡", color: "#84cc16" },
  none: { label: "Conceptual", icon: "💡", color: "#64748b" },
};

const DOMAIN_COLORS = {
  Mechanics: "#00d4ff",
  "Oscillations & Waves": "#9b59b6",
  Gravitation: "#f5a623",
  Thermodynamics: "#e74c3c",
  Electrostatics: "#f59e0b",
  "Current Electricity": "#2ecc71",
  Magnetism: "#e91e63",
  Optics: "#00bcd4",
  "Modern Physics": "#7c3aed",
};

const TABS = ["Simulation", "Step-by-Step", "Formulas", "Explore & Practice"];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const LANGS = [
  {
    key: "english",
    flag: "🇬🇧",
    label: "English",
    code: "en-US",
    color: "#00d4ff",
  },
  { key: "hindi", flag: "🇮🇳", label: "हिंदी", code: "hi-IN", color: "#f5a623" },
  {
    key: "marathi",
    flag: "🇮🇳",
    label: "मराठी",
    code: "mr-IN",
    color: "#9b59b6",
  },
];

// ─── Timeline hook ────────────────────────────────────────────
function useTimeline(script, onHL) {
  const raf = useRef();
  const t0 = useRef();
  const go = useCallback(() => {
    t0.current = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - t0.current) / 1000;
      const cur = [...(script || [])].reverse().find((e) => e.time <= elapsed);
      if (cur?.highlight) onHL?.(cur.highlight);
      raf.current = requestAnimationFrame(tick);
    };
    tick();
  }, [script, onHL]);
  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    onHL?.(null);
  }, [onHL]);
  return { go, stop };
}

// ─── Voice hook ───────────────────────────────────────────────
function useVoice({ narration, script, onStart, onStop, onSub, onHL }) {
  const [lang, setLang] = useState("english");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [avail, setAvail] = useState({
    english: true,
    hindi: false,
    marathi: false,
  });
  const ptimer = useRef();
  const stimer = useRef();
  const tl = useTimeline(script, onHL);
  const startedAt = useRef(0);
  const pausedElapsed = useRef(0);

  useEffect(() => {
    const det = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setAvail({
        english: true,
        hindi: v.some((x) => x.lang.startsWith("hi")),
        marathi: v.some((x) => x.lang.startsWith("mr")),
      });
    };
    det();
    window.speechSynthesis?.addEventListener?.("voiceschanged", det);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", det);
      hardStop();
    };
  }, []);

  const hardStop = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearInterval(ptimer.current);
    clearInterval(stimer.current);
    tl.stop();
    setSpeaking(false);
    setPaused(false);
    setProgress(0);
    pausedElapsed.current = 0;
    onStop?.();
    onSub?.("");
  }, [onStop, onSub, tl]);

  const play = useCallback(
    (l, spd = speed) => {
      hardStop();
      const text = narration?.[l];
      if (!text || !window.speechSynthesis) return;
      setLang(l);
      setSpeaking(true);
      setPaused(false);
      onStart?.();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS.find((x) => x.key === l)?.code || "en-US";
      u.rate = (l === "english" ? 0.86 : 0.8) * spd;
      u.pitch = 1.05;
      const vs = window.speechSynthesis.getVoices();
      const best = vs.find((v) =>
        v.lang.startsWith({ english: "en", hindi: "hi", marathi: "mr" }[l]),
      );
      if (best) u.voice = best;
      const sents = text.match(/[^.!?।]+[.!?।]+/g) || [text];
      const est = (text.length * 58) / spd;
      let si = 0;
      onSub?.(sents[0] || "");
      stimer.current = setInterval(
        () => {
          si = Math.min(si + 1, sents.length - 1);
          onSub?.(sents[si] || "");
        },
        est / Math.max(sents.length, 1),
      );
      startedAt.current = Date.now();
      ptimer.current = setInterval(
        () =>
          setProgress(
            Math.min(((Date.now() - startedAt.current) / est) * 100, 95),
          ),
        200,
      );
      tl.go();
      u.onend = u.onerror = () => {
        clearInterval(ptimer.current);
        clearInterval(stimer.current);
        tl.stop();
        setProgress(100);
        setSpeaking(false);
        setPaused(false);
        pausedElapsed.current = 0;
        onStop?.();
        onSub?.("");
      };
      window.speechSynthesis.speak(u);
    },
    [narration, speed, hardStop, onStart, onStop, onSub, tl],
  );

  const pauseResume = useCallback(() => {
    if (!speaking) return;
    if (!paused) {
      window.speechSynthesis?.pause();
      clearInterval(ptimer.current);
      tl.stop();
      pausedElapsed.current = (Date.now() - startedAt.current) / 1000;
      setPaused(true);
    } else {
      window.speechSynthesis?.resume();
      tl.go();
      ptimer.current = setInterval(
        () => setProgress((p) => Math.min(p + 0.4, 99)),
        200,
      );
      setPaused(false);
    }
  }, [speaking, paused, tl]);

  const changeSpeed = useCallback(
    (s) => {
      setSpeed(s);
      if (speaking) play(lang, s);
    },
    [speaking, lang, play],
  );
  const toggle = useCallback(() => {
    if (!speaking) play(lang);
    else pauseResume();
  }, [speaking, lang, play, pauseResume]);

  return {
    lang,
    setLang,
    speaking,
    paused,
    progress,
    speed,
    avail,
    play,
    hardStop,
    pauseResume,
    toggle,
    changeSpeed,
  };
}

// ─── Mind Map ─────────────────────────────────────────────────
function MindMap({ result }) {
  const concept = result?.concept || "Physics";
  const meta = TOPIC_META[result?.simulation?.type] || { color: "#00d4ff" };
  const [active, setActive] = useState(null);

  const nodes = [
    {
      id: "center",
      label: concept,
      x: 50,
      y: 45,
      type: "center",
      color: meta.color,
      detail: result?.core_concept || "",
    },
    {
      id: "domain",
      label: result?.domain || "Physics",
      x: 20,
      y: 18,
      type: "branch",
      color: "#f5a623",
      detail: `Domain: ${result?.domain || "Physics"}`,
    },
    {
      id: "formula",
      label: "Key Formula",
      x: 80,
      y: 18,
      type: "branch",
      color: "#9b59b6",
      detail:
        (result?.solution_steps || []).find((s) => s.formula || s.f)?.formula ||
        "See step-by-step",
    },
    {
      id: "given",
      label: "Given Data",
      x: 12,
      y: 62,
      type: "branch",
      color: "#2ecc71",
      detail:
        (result?.given || [])
          .map((g) => `${g.symbol || g.s} = ${g.value || g.v}`)
          .join(" · ") || "See problem",
    },
    {
      id: "answer",
      label: "Final Answer",
      x: 82,
      y: 72,
      type: "branch",
      color: "#e74c3c",
      detail: result?.correct_option || result?.final_answer || "—",
    },
    {
      id: "realworld",
      label: "Real World",
      x: 50,
      y: 82,
      type: "branch",
      color: "#00d4ff",
      detail:
        result?.explore_config?.observations?.[0] || "Explore the physics lab",
    },
  ];

  return (
    <div>
      <p
        style={{
          fontSize: 12,
          color: "var(--t3)",
          marginBottom: 10,
          lineHeight: 1.6,
        }}
      >
        Click any node to see details. This map shows how everything in this
        problem connects.
      </p>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          height: 300,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {nodes
            .filter((n) => n.id !== "center")
            .map((n) => (
              <line
                key={n.id}
                x1="50"
                y1="45"
                x2={n.x}
                y2={n.y}
                stroke={n.color}
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
                opacity="0.45"
              />
            ))}
        </svg>
        {nodes.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(active === n.id ? null : n.id)}
            className="absolute flex items-center justify-center text-center transition-all duration-200"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: "translate(-50%,-50%)",
              background: active === n.id ? n.color : `${n.color}18`,
              border: `2px solid ${n.color}`,
              borderRadius: n.type === "center" ? "50%" : "12px",
              width: n.type === "center" ? 78 : 66,
              height: n.type === "center" ? 78 : 40,
              color: active === n.id ? "#000" : n.color,
              fontSize: n.type === "center" ? 11 : 9.5,
              fontWeight: 700,
              fontFamily: "var(--font)",
              cursor: "pointer",
              padding: "3px 5px",
              boxShadow: active === n.id ? `0 0 18px ${n.color}45` : "none",
              zIndex: 2,
              lineHeight: 1.3,
            }}
          >
            {n.label}
          </button>
        ))}
      </div>
      {active &&
        (() => {
          const node = nodes.find((n) => n.id === active);
          return (
            <div
              className="mt-3 p-4 rounded-xl fade-in"
              style={{
                background: `${node.color}0d`,
                border: `1px solid ${node.color}35`,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: node.color,
                  marginBottom: 6,
                }}
              >
                {node.label}
              </p>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
                {node.detail}
              </p>
            </div>
          );
        })()}
    </div>
  );
}

// ─── Flip Card ────────────────────────────────────────────────
function FlipCard({ front, back, color }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="cursor-pointer"
      style={{ height: 110, perspective: 1000 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="w-full h-full transition-all duration-500 relative"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "none",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            background: `${color}0f`,
            border: `1px solid ${color}28`,
            textAlign: "center",
          }}
        >
          <code
            style={{
              fontSize: 15,
              color,
              fontFamily: "var(--mono)",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {front}
          </code>
          <span
            style={{
              fontSize: 10,
              color: "var(--t3)",
              fontFamily: "var(--mono)",
            }}
          >
            tap to see meaning ↩
          </span>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `${color}20`,
            border: `1px solid ${color}50`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--t1)",
              lineHeight: 1.65,
              fontFamily: "var(--font)",
            }}
          >
            {back}
          </p>
          <span style={{ fontSize: 10, color: "var(--t3)", marginTop: 8 }}>
            ← tap to flip back
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────
function Quiz({ result }) {
  const topic = result?.simulation?.type || "pendulum";
  const meta = TOPIC_META[topic] || { color: "#00d4ff" };
  const domain = result?.domain || "";

  const QUIZZES = {
    pendulum: [
      {
        q: "Double the length of a pendulum — what happens to its period?",
        opts: ["Doubles", "Increases by √2", "Halves", "Stays same"],
        ans: 1,
        exp: "T = 2π√(L/g). Doubling L multiplies T by √2 ≈ 1.41, not 2.",
      },
      {
        q: "On Moon (g = 1.6 m/s²), a 1 m pendulum has period:",
        opts: ["2.0 s", "4.97 s", "1.0 s", "3.14 s"],
        ans: 1,
        exp: "T = 2π√(1/1.6) ≈ 4.97 s vs 2.01 s on Earth.",
      },
      {
        q: "Which does NOT affect the period of a simple pendulum?",
        opts: ["Length", "Mass of bob", "Gravity", "Both length and gravity"],
        ans: 1,
        exp: "Period depends only on L and g. Mass has no effect.",
      },
    ],
    projectile: [
      {
        q: "Maximum range is achieved at which angle?",
        opts: ["30°", "45°", "60°", "90°"],
        ans: 1,
        exp: "R = v²sin(2θ)/g is maximum when 2θ = 90°, i.e. θ = 45°.",
      },
      {
        q: "If initial velocity doubles, range becomes:",
        opts: ["2×", "4×", "√2×", "Same"],
        ans: 1,
        exp: "R ∝ v². Doubling v makes R four times larger.",
      },
    ],
    circuit: [
      {
        q: "If resistance doubles (voltage constant), current:",
        opts: ["Doubles", "Halves", "Stays same", "Quadruples"],
        ans: 1,
        exp: "I = V/R. If R doubles, I halves (Ohm's Law).",
      },
      {
        q: "Power in a resistor equals:",
        opts: ["P=IR", "P=V²/R", "P=V/R²", "P=I/V"],
        ans: 1,
        exp: "P = V²/R = I²R = VI — all equivalent by Ohm's Law.",
      },
    ],
    wave: [
      {
        q: "If frequency doubles at constant speed, wavelength:",
        opts: ["Doubles", "Halves", "Same", "Quadruples"],
        ans: 1,
        exp: "v = fλ. Constant v: doubling f halves λ.",
      },
      {
        q: "Wave speed depends on:",
        opts: ["Frequency", "Amplitude", "Medium properties", "Both f and A"],
        ans: 2,
        exp: "Speed depends on medium (density, elasticity), not on f or amplitude.",
      },
    ],
    graph: [
      {
        q: "Derivative of f(x) = x³ is:",
        opts: ["x²", "3x²", "3x", "x³"],
        ans: 1,
        exp: "Power rule: bring down exponent (3), reduce power by 1 → 3x².",
      },
    ],
  };

  const qs = QUIZZES[topic] || QUIZZES.pendulum;
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = qs[qi];

  const choose = (i) => {
    if (sel !== null) return;
    setSel(i);
    if (i === q.ans) setScore((s) => s + 1);
    setTimeout(() => {
      if (qi < qs.length - 1) {
        setQi(qi + 1);
        setSel(null);
      } else setDone(true);
    }, 2000);
  };

  const reset = () => {
    setQi(0);
    setSel(null);
    setScore(0);
    setDone(false);
  };

  if (done)
    return (
      <div
        className="text-center p-8 rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: 36, marginBottom: 10 }}>
          {score === qs.length ? "🏆" : score >= qs.length / 2 ? "⭐" : "📚"}
        </p>
        <p
          style={{
            fontFamily: "var(--font)",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--t1)",
            marginBottom: 6,
          }}
        >
          {score}/{qs.length} correct
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {score === qs.length
            ? "Perfect! You have mastered this concept."
            : score > 0
              ? "Good effort! Review the explanations and try again."
              : "Keep going — read the concept explanation and try again."}
        </p>
        <button
          onClick={reset}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: "8px 24px" }}
        >
          Try Again ↺
        </button>
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span
          style={{
            fontSize: 12,
            color: "var(--t3)",
            fontFamily: "var(--mono)",
          }}
        >
          Q {qi + 1} of {qs.length}
        </span>
        <span
          style={{
            fontSize: 12,
            color: meta.color,
            fontFamily: "var(--mono)",
            fontWeight: 600,
          }}
        >
          Score: {score}/{qi}
        </span>
      </div>
      <div
        className="p-4 rounded-2xl mb-4"
        style={{
          background: `${meta.color}08`,
          border: `1px solid ${meta.color}20`,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "var(--t1)",
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          {q.q}
        </p>
      </div>
      <div className="space-y-2 mb-3">
        {q.opts.map((opt, i) => {
          let bg = "var(--surface)",
            bc = "var(--border)",
            fc = "var(--t2)";
          if (sel !== null) {
            if (i === q.ans) {
              bg = "rgba(46,204,113,.12)";
              bc = "rgba(46,204,113,.4)";
              fc = "var(--green)";
            } else if (i === sel) {
              bg = "rgba(231,76,60,.10)";
              bc = "rgba(231,76,60,.35)";
              fc = "var(--red)";
            }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: bg,
                border: `1px solid ${bc}`,
                cursor: sel !== null ? "default" : "pointer",
                width: "100%",
              }}
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: `${meta.color}18`,
                  color: meta.color,
                  fontFamily: "var(--mono)",
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span
                style={{ fontSize: 13, color: fc, fontFamily: "var(--font)" }}
              >
                {opt}
              </span>
              {sel !== null && i === q.ans && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--green)",
                    fontSize: 16,
                  }}
                >
                  ✓
                </span>
              )}
              {sel === i && i !== q.ans && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--red)",
                    fontSize: 16,
                  }}
                >
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <div
          className="p-3 rounded-xl fade-in"
          style={{
            background: "rgba(0,212,255,.06)",
            border: "1px solid rgba(0,212,255,.2)",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
            💡 {q.exp}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Explore & Practice Tab (NO Physics Lab) ──────────────────
function ExploreTab({ result }) {
  const [section, setSection] = useState("mindmap");
  const meta = TOPIC_META[result?.simulation?.type] || { color: "#00d4ff" };
  // Only use flip_cards from AI — do NOT add core_concept as extra card (it shows everywhere)
  const cards = (result?.flip_cards || []).filter((c) => c.front && c.back);

  const SECTIONS = [
    {
      id: "mindmap",
      label: "🗺 Mind Map",
      desc: "See how everything connects",
    },
    { id: "cards", label: "🃏 Flip Cards", desc: "Memorize formulas" },
    { id: "quiz", label: "🧩 Practice Quiz", desc: "Test your understanding" },
  ];

  return (
    <div className="space-y-4">
      {/* Section switcher */}
      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all text-center"
            style={{
              background:
                section === s.id ? `${meta.color}18` : "var(--surface)",
              border: `1px solid ${section === s.id ? `${meta.color}45` : "var(--border)"}`,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: section === s.id ? meta.color : "var(--t2)",
                fontFamily: "var(--font)",
              }}
            >
              {s.label}
            </span>
            <span style={{ fontSize: 10, color: "var(--t3)" }}>{s.desc}</span>
          </button>
        ))}
      </div>

      {section === "mindmap" && (
        <div className="fade-in space-y-3">
          <MindMap result={result} />
          {result?.explore_config?.observations?.length > 0 && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--t1)",
                  marginBottom: 8,
                }}
              >
                Key observations:
              </p>
              {result.explore_config.observations.map((obs, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "var(--t3)",
                    lineHeight: 2,
                    borderBottom:
                      i < result.explore_config.observations.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    paddingBottom: 3,
                  }}
                >
                  {obs}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "cards" && (
        <div className="fade-in space-y-3">
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}>
            Tap any card to flip it. Front = formula. Back = what it means in
            plain language.
          </p>
          {cards.length > 0 ? (
            cards.map((c, i) => (
              <FlipCard
                key={i}
                front={c.front}
                back={c.back}
                color={meta.color}
              />
            ))
          ) : (
            <div
              className="p-5 text-center rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--t3)" }}>
                Solve a numerical problem to generate formula cards.
              </p>
            </div>
          )}
        </div>
      )}

      {section === "quiz" && (
        <div className="fade-in">
          <p
            style={{
              fontSize: 12,
              color: "var(--t3)",
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            Similar questions to reinforce the concept. Choose the correct
            answer.
          </p>
          <Quiz result={result} />
        </div>
      )}
    </div>
  );
}

// ─── Simulation Player ────────────────────────────────────────
function SimPlayer({
  result,
  Sim,
  simData,
  speaking,
  paused,
  onClickScreen,
  subtitle,
  showCC,
  onToggleCC,
  speed,
  onSpeedChange,
  lang,
  avail,
  play,
  highlight,
}) {
  const containerRef = useRef();
  const [fullscreen, setFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const meta = TOPIC_META[result?.simulation?.type] || { color: "#00d4ff" };

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFS = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        background: "#060a0f",
        border: "1px solid var(--border)",
        minHeight: fullscreen ? "100vh" : 400,
      }}
    >
      {/* Clickable simulation area */}
      <div
        style={{
          minHeight: fullscreen ? "calc(100vh - 52px)" : 400,
          cursor: "pointer",
          position: "relative",
        }}
        onClick={onClickScreen}
      >
        {Sim ? (
          <Suspense
            fallback={
              <div
                style={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: `3px solid ${meta.color}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />
              </div>
            }
          >
            <Sim
              data={simData}
              variables={result?.variables || {}}
              voicePlaying={speaking && !paused}
              highlight={highlight}
              onVariableChange={() => {}}
            />
          </Suspense>
        ) : (
          <div
            style={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 14,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 44 }}>
              {result?.simulation?.type === "none" ? "💡" : "🔬"}
            </span>
            <div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--t2)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {result?.simulation?.type === "none"
                  ? "Conceptual Question — No simulation needed"
                  : "Visual simulation loading…"}
              </p>
              {result?.core_concept && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--t3)",
                    lineHeight: 1.7,
                    maxWidth: 500,
                  }}
                >
                  {result.core_concept}
                </p>
              )}
              <p
                style={{
                  fontSize: 12,
                  color: "var(--t3)",
                  marginTop: 10,
                  opacity: 0.6,
                }}
              >
                See Step-by-Step tab for the complete solution
              </p>
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {paused && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,.12)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ fontSize: 30 }}>⏸</span>
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,.7)",
                  fontSize: 13,
                  fontFamily: "var(--font)",
                }}
              >
                Tap to resume
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtitles */}
      {showCC && subtitle && !paused && (
        <div className="absolute bottom-14 left-0 right-0 flex justify-center px-6 pointer-events-none">
          <div
            className="px-5 py-2.5 rounded-xl text-center max-w-2xl"
            style={{
              background: "rgba(0,0,0,.9)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <p
              style={{
                fontSize: 15,
                color: "#fff",
                lineHeight: 1.65,
                fontFamily: "var(--font)",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-2.5"
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,.92))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Play/pause */}
        <button
          onClick={onClickScreen}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {speaking && !paused ? "⏸" : "▶"}
        </button>

        {/* Waveform */}
        {speaking && !paused && (
          <div className="flex gap-0.5 items-end" style={{ height: 16 }}>
            {[4, 8, 13, 8, 4, 10, 6].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 2,
                  background: meta.color,
                  animation: `waveBar ${0.28 + i * 0.07}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* CC */}
        <button
          onClick={onToggleCC}
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            fontSize: 11,
            cursor: "pointer",
            background: showCC ? "rgba(0,212,255,.2)" : "rgba(255,255,255,.08)",
            border: `1px solid ${showCC ? "rgba(0,212,255,.4)" : "rgba(255,255,255,.12)"}`,
            color: showCC ? "#00d4ff" : "rgba(255,255,255,.55)",
          }}
        >
          CC
        </button>

        {/* Speed */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSpeedMenu((s) => !s);
              setShowLangMenu(false);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 11,
              cursor: "pointer",
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
              fontFamily: "var(--mono)",
            }}
          >
            {speed}×
          </button>
          {showSpeedMenu && (
            <div
              className="absolute bottom-9 right-0 rounded-xl overflow-hidden z-50"
              style={{
                background: "#1a1f2a",
                border: "1px solid var(--border)",
                minWidth: 88,
              }}
            >
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSpeedChange(s);
                    setShowSpeedMenu(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 14px",
                    textAlign: "left",
                    background:
                      speed === s ? "rgba(0,212,255,.15)" : "transparent",
                    color: speed === s ? "#00d4ff" : "rgba(255,255,255,.7)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "var(--mono)",
                  }}
                >
                  {s}× {s === 1 ? "(Normal)" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu((l) => !l);
              setShowSpeedMenu(false);
            }}
            className="flex items-center gap-1.5"
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 11,
              cursor: "pointer",
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            <span>{LANGS.find((l) => l.key === lang)?.flag}</span>
            <span>{LANGS.find((l) => l.key === lang)?.label}</span>
            <span style={{ fontSize: 9 }}>▾</span>
          </button>
          {showLangMenu && (
            <div
              className="absolute bottom-9 right-0 rounded-xl overflow-hidden z-50"
              style={{
                background: "#1a1f2a",
                border: "1px solid var(--border)",
                minWidth: 140,
              }}
            >
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => {
                    play(l.key);
                    setShowLangMenu(false);
                  }}
                  disabled={!avail[l.key]}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "9px 14px",
                    textAlign: "left",
                    background: lang === l.key ? `${l.color}18` : "transparent",
                    color: avail[l.key]
                      ? lang === l.key
                        ? l.color
                        : "rgba(255,255,255,.7)"
                      : "rgba(255,255,255,.28)",
                    border: "none",
                    cursor: avail[l.key] ? "pointer" : "not-allowed",
                    fontSize: 12,
                    fontFamily: "var(--font)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {!avail[l.key] && (
                    <span
                      style={{ fontSize: 10, color: "rgba(255,255,255,.28)" }}
                    >
                      N/A
                    </span>
                  )}
                  {lang === l.key && avail[l.key] && (
                    <span style={{ color: l.color }}>●</span>
                  )}
                </button>
              ))}
              {(!avail.hindi || !avail.marathi) && (
                <div
                  style={{
                    padding: "7px 14px",
                    fontSize: 10,
                    color: "rgba(255,255,255,.28)",
                    borderTop: "1px solid rgba(255,255,255,.07)",
                    lineHeight: 1.5,
                  }}
                >
                  Missing? Settings → Speech → Add voices
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFS}
          style={{
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,.55)",
            fontSize: 14,
          }}
        >
          {fullscreen ? "⊡" : "⛶"}
        </button>
      </div>
    </div>
  );
}

// ─── Solution Tab ─────────────────────────────────────────────
function SolutionTab({ result, highlight }) {
  const [open, setOpen] = useState(0);
  const meta = TOPIC_META[result?.simulation?.type] || { color: "#00d4ff" };
  useEffect(() => {
    if (highlight === "formula") setOpen(0);
    if (highlight === "answer")
      setOpen((result?.solution_steps?.length || 1) - 1);
  }, [highlight]);
  return (
    <div className="space-y-4">
      {/* Extracted image question */}
      {result?.extracted_question && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "rgba(0,212,255,.06)",
            border: "1px solid rgba(0,212,255,.2)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "var(--cyan)",
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 8,
            }}
          >
            📷 Question from image
          </p>
          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.75 }}>
            {result.extracted_question}
          </p>
        </div>
      )}
      {/* Domain badge */}
      {result?.domain && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: `${DOMAIN_COLORS[result.domain] || "#00d4ff"}12`,
            border: `1px solid ${DOMAIN_COLORS[result.domain] || "#00d4ff"}25`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: DOMAIN_COLORS[result.domain] || "#00d4ff",
              fontFamily: "var(--mono)",
              fontWeight: 600,
              letterSpacing: ".06em",
            }}
          >
            {result.domain}
          </span>
        </div>
      )}
      {result.core_concept && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "rgba(245,166,35,.07)",
            border: "1px solid rgba(245,166,35,.28)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 16 }}>💡</span>
            <span
              style={{
                fontFamily: "var(--font)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--amber)",
              }}
            >
              Core Concept
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.75 }}>
            {result.core_concept}
          </p>
        </div>
      )}
      {result.given?.length > 0 && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "var(--t3)",
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 10,
            }}
          >
            Given
          </p>
          {result.given.map((g, i) => (
            <div
              key={i}
              className="flex items-baseline gap-3 py-2.5"
              style={{
                borderBottom:
                  i < result.given.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <code
                style={{
                  fontSize: 15,
                  color: meta.color,
                  fontFamily: "var(--mono)",
                  fontWeight: 800,
                  minWidth: 48,
                }}
              >
                {g.symbol || g.s}
              </code>
              <span style={{ fontSize: 13, color: "var(--t2)", flex: 1 }}>
                {g.label || g.l}
              </span>
              <code
                style={{
                  fontSize: 13,
                  color: "var(--t1)",
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                }}
              >
                {g.value || g.v}
              </code>
            </div>
          ))}
          {result.to_find && (
            <div
              className="flex gap-2 pt-3 mt-1"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--t3)",
                  fontFamily: "var(--mono)",
                  textTransform: "uppercase",
                  paddingTop: 2,
                  minWidth: 52,
                  letterSpacing: ".06em",
                }}
              >
                Find:
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--t1)",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {result.to_find}
              </span>
            </div>
          )}
        </div>
      )}
      {result.solution_steps?.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              color: "var(--t3)",
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 10,
            }}
          >
            Solution
          </p>
          <div className="space-y-2.5">
            {result.solution_steps.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  border: `1px solid ${open === i ? "rgba(0,212,255,.4)" : "var(--border)"}`,
                  boxShadow:
                    open === i ? "0 0 16px rgba(0,212,255,.1)" : "none",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{
                    background: "var(--surface2)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background:
                        open === i ? "rgba(0,212,255,.15)" : "var(--surface)",
                      color: open === i ? "var(--cyan)" : "var(--t3)",
                      fontFamily: "var(--mono)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {s.step}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font)",
                      fontWeight: 700,
                      fontSize: 14,
                      color: open === i ? "var(--t1)" : "var(--t2)",
                      flex: 1,
                    }}
                  >
                    {s.heading || s.title || s.t}
                  </span>
                  <span style={{ color: "var(--t3)", fontSize: 11 }}>
                    {open === i ? "▼" : "▶"}
                  </span>
                </button>
                {open === i && (
                  <div
                    className="p-4 space-y-3 fade-in"
                    style={{ background: "var(--surface)" }}
                  >
                    {(s.explanation || s.e) && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--t2)",
                          lineHeight: 1.75,
                        }}
                      >
                        {s.explanation || s.e}
                      </p>
                    )}
                    {(s.formula || s.f) && (
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: "rgba(155,89,182,.1)",
                          border: "1px solid rgba(155,89,182,.3)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            color: "#9b59b6",
                            fontFamily: "var(--mono)",
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            marginBottom: 5,
                          }}
                        >
                          Formula
                        </p>
                        <code
                          style={{
                            fontSize: 17,
                            color: "#d7bde2",
                            fontFamily: "var(--mono)",
                            fontWeight: 600,
                          }}
                        >
                          {s.formula || s.f}
                        </code>
                      </div>
                    )}
                    {(s.substitution || s.sub) && (
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: "rgba(0,212,255,.07)",
                          border: "1px solid rgba(0,212,255,.28)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--cyan)",
                            fontFamily: "var(--mono)",
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            marginBottom: 5,
                          }}
                        >
                          Substituting
                        </p>
                        <code
                          style={{
                            fontSize: 15,
                            color: "var(--cyan)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {s.substitution || s.sub}
                        </code>
                      </div>
                    )}
                    {(s.calculation || s.calc) && (
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: "rgba(46,204,113,.08)",
                          border: "1px solid rgba(46,204,113,.28)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--green)",
                            fontFamily: "var(--mono)",
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            marginBottom: 5,
                          }}
                        >
                          Calculation
                        </p>
                        <code
                          style={{
                            fontSize: 15,
                            color: "var(--green)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {s.calculation || s.calc}
                        </code>
                      </div>
                    )}
                    {(s.result || s.res) && (
                      <div className="flex items-center gap-2 pt-1">
                        <span style={{ color: "var(--green)", fontSize: 18 }}>
                          ✓
                        </span>
                        <code
                          style={{
                            fontSize: 14,
                            color: "var(--green)",
                            fontFamily: "var(--mono)",
                            fontWeight: 700,
                          }}
                        >
                          {s.result || s.res}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {(result.final_answer || result.correct_option) && (
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "rgba(46,204,113,.09)",
            border: "2px solid rgba(46,204,113,.38)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 26 }}>✅</span>
            <span
              style={{
                fontFamily: "var(--font)",
                fontWeight: 800,
                fontSize: 17,
                color: "var(--green)",
              }}
            >
              Final Answer
            </span>
          </div>
          {result.correct_option && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "var(--t1)",
                fontFamily: "var(--mono)",
                marginBottom: 4,
              }}
            >
              {result.correct_option}
            </p>
          )}
          {result.final_answer &&
            result.final_answer !== result.correct_option && (
              <p
                style={{
                  fontSize: 17,
                  color: "var(--green)",
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                }}
              >
                = {result.final_answer}
              </p>
            )}
        </div>
      )}
    </div>
  );
}

// ─── Formulas Tab ─────────────────────────────────────────────
function FormulasTab({ result }) {
  const meta = TOPIC_META[result?.simulation?.type] || { color: "#00d4ff" };
  // Use formulas[] array if available, fall back to extracting from solution_steps
  const formulasList = result?.formulas || [];
  const stepFormulas = (result?.solution_steps || []).filter(
    (s) => s.formula || s.f,
  );
  const allFormulas =
    formulasList.length > 0
      ? formulasList
      : stepFormulas.map((s) => ({
          name: s.heading || s.title || `Step ${s.step}`,
          f: s.formula || s.f,
        }));

  return (
    <div className="space-y-4">
      <p
        style={{
          fontSize: 10,
          color: "var(--t3)",
          fontFamily: "var(--mono)",
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 6,
        }}
      >
        Formulas in this problem
      </p>
      {allFormulas.length > 0 ? (
        allFormulas.map((f, i) => (
          <div key={i}>
            <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 6 }}>
              {f.name || f.n || `Formula ${i + 1}`}
            </p>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(155,89,182,.08)",
                border: "1px solid rgba(155,89,182,.25)",
              }}
            >
              <code
                style={{
                  fontSize: 18,
                  color: "#d7bde2",
                  fontFamily: "var(--mono)",
                  fontWeight: 600,
                }}
              >
                {f.f || f.formula}
              </code>
            </div>
          </div>
        ))
      ) : (
        <div
          className="p-5 rounded-xl text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 8 }}>
            No formulas extracted yet.
          </p>
          <p style={{ fontSize: 12, color: "var(--t3)", opacity: 0.7 }}>
            Check the Step-by-Step tab for formulas in context.
          </p>
        </div>
      )}
      {result.given?.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              color: "var(--t3)",
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 8,
            }}
          >
            Values used
          </p>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {result.given.map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    i < result.given.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  background: "var(--surface)",
                }}
              >
                <code
                  style={{
                    fontSize: 14,
                    color: meta.color,
                    fontFamily: "var(--mono)",
                    fontWeight: 800,
                    minWidth: 44,
                  }}
                >
                  {g.symbol || g.s}
                </code>
                <span style={{ fontSize: 13, color: "var(--t2)", flex: 1 }}>
                  {g.label || g.l}
                </span>
                <code
                  style={{
                    fontSize: 13,
                    color: "var(--t1)",
                    fontFamily: "var(--mono)",
                    fontWeight: 700,
                  }}
                >
                  {g.value || g.v}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Problem Input ────────────────────────────────────────────
const SUBJECTS = [
  { key: "physics", label: "Physics", icon: "⚛", color: "#00d4ff" },
  { key: "mathematics", label: "Mathematics", icon: "∑", color: "#8b5cf6" },
  { key: "chemistry", label: "Chemistry", icon: "⚗", color: "#10b981" },
];

function ProblemInput({ onAnalyze, loading, subject, onSubjectChange }) {
  const [text, setText] = useState("");
  const fileRef = useRef();
  const subj = SUBJECTS.find((s) => s.key === subject) || SUBJECTS[0];
  const placeholders = {
    physics:
      "Paste any physics problem — MCQ, numerical, conceptual (Ctrl+Enter)",
    mathematics:
      "Paste any math problem — calculus, trigonometry, vectors, algebra (Ctrl+Enter)",
    chemistry:
      "Paste any chemistry problem — atomic structure, equilibrium, electrochemistry (Ctrl+Enter)",
  };
  const submit = () => {
    if (text.trim() && !loading)
      onAnalyze({ type: "text", value: text.trim(), subject });
  };
  return (
    <div
      className="p-3 shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Subject selector */}
      <div className="flex gap-1.5 mb-3">
        {SUBJECTS.map((s) => (
          <button
            key={s.key}
            onClick={() => onSubjectChange(s.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: subject === s.key ? `${s.color}18` : "var(--surface)",
              border: `1px solid ${subject === s.key ? `${s.color}40` : "var(--border)"}`,
              color: subject === s.key ? s.color : "var(--t3)",
              fontSize: 12,
              fontFamily: "var(--font)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14 }}>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 items-start">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
          }}
          placeholder={placeholders[subject]}
          rows={2}
          style={{
            flex: 1,
            resize: "none",
            padding: "10px 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--t1)",
            fontSize: 13,
            fontFamily: "var(--font)",
            lineHeight: 1.65,
            outline: "none",
            caretColor: subj.color,
            transition: "border-color .2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = `${subj.color}80`)}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={submit}
            disabled={!text.trim() || loading}
            className="btn btn-primary"
            style={{
              padding: "9px 20px",
              fontSize: 13,
              background: subj.color,
              opacity: !text.trim() || loading ? 0.4 : 1,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid #000",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin .6s linear infinite",
                  }}
                />{" "}
                Solving
              </>
            ) : (
              "▶ Solve"
            )}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn btn-surface"
            style={{ padding: "7px 12px", fontSize: 12 }}
          >
            📷 Image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAnalyze({ type: "image", value: f, subject });
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AppWorkspace() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [showCC, setShowCC] = useState(true);
  const [highlight, setHighlight] = useState(null);
  const [subject, setSubject] = useState("physics");

  const voice = useVoice({
    narration: result?.narration,
    script: result?.narration_script,
    onStart: () => {},
    onStop: () => setHighlight(null),
    onSub: setSubtitle,
    onHL: setHighlight,
  });

  const handleScreenClick = useCallback(() => {
    if (!voice.speaking) voice.play(voice.lang);
    else voice.pauseResume();
  }, [voice]);

  const handleAnalyze = useCallback(async ({ type, value, subject: subj }) => {
    const usedSubject = subj || subject;
    setStatus("loading");
    setError("");
    setResult(null);
    setHighlight(null);
    setSubtitle("");
    setActiveTab(0);
    voice.hardStop?.();
    try {
      const data =
        type === "image"
          ? await analyzeImage(value, usedSubject)
          : await analyzeProblem(value, usedSubject);
      setResult(data);
      setStatus("done");
      // Save to history + update streak (silent, non-blocking)
      const token = localStorage.getItem("simai_token");
      if (token) {
        fetch("/api/auth/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: usedSubject,
            domain: data.domain || "",
            concept: data.concept || "",
            problem: (type === "image" ? data.extracted_question : value) || "",
            answer: data.final_answer || data.correct_option || "",
            sim_type: data.simulation?.type || "",
          }),
        }).catch(() => {});
      }
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }, []);

  const simType = result?.simulation?.type;
  // 'none' means no simulation for this concept — show conceptual card
  const Sim =
    simType && simType !== "none" && SIMS[simType] ? SIMS[simType] : null;
  const simData = result?.simulation_data;
  const meta = simType
    ? TOPIC_META[simType] || { color: "#00d4ff", label: "Physics", icon: "⚛" }
    : { color: "#00d4ff", label: "Physics", icon: "⚛" };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)" }}>
      <Topbar result={result} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ProblemInput
            onAnalyze={handleAnalyze}
            loading={status === "loading"}
            subject={subject}
            onSubjectChange={setSubject}
          />

          {error && (
            <div
              className="mx-4 mt-3 p-3 rounded-xl"
              style={{
                background: "rgba(231,76,60,.08)",
                border: "1px solid rgba(231,76,60,.25)",
                color: "var(--red)",
                fontSize: 13,
                fontFamily: "var(--mono)",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {status === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--cyan)",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
              <p style={{ fontSize: 14, color: "var(--t3)" }}>
                Analyzing problem · building simulation · generating narration…
              </p>
            </div>
          )}

          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
              <span
                style={{
                  fontSize: 56,
                  display: "block",
                  animation: "float 4s ease-in-out infinite",
                }}
              >
                ⚛
              </span>
              <div className="text-center max-w-sm">
                <p
                  style={{
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--t1)",
                    marginBottom: 10,
                  }}
                >
                  PCM Teaching Engine
                </p>
                <p
                  style={{ fontSize: 14, color: "var(--t3)", lineHeight: 1.7 }}
                >
                  Physics · Mathematics · Chemistry — Class 11 & 12
                  <br />
                  Paste any problem. Get simulation + solution + voice in 3
                  languages.
                </p>
              </div>
            </div>
          )}

          {result && status === "done" && (
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT: tabs + content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tab bar */}
                <div
                  className="flex items-center gap-1 px-4 py-2 shrink-0 overflow-x-auto"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg2)",
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl mr-2 shrink-0"
                    style={{
                      background: `${meta.color}12`,
                      border: `1px solid ${meta.color}25`,
                    }}
                  >
                    <span style={{ color: meta.color }}>{meta.icon}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: meta.color,
                        fontFamily: "var(--mono)",
                        fontWeight: 600,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {TABS.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(i)}
                      className="flex items-center px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0"
                      style={{
                        background:
                          activeTab === i ? "var(--cyan-dim)" : "transparent",
                        border: `1px solid ${activeTab === i ? "rgba(0,212,255,.35)" : "transparent"}`,
                        color: activeTab === i ? "var(--cyan)" : "var(--t3)",
                        fontSize: 12,
                        fontFamily: "var(--font)",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-5">
                  {/* SIMULATION TAB */}
                  {activeTab === 0 && (
                    <div className="fade-in space-y-4">
                      {/* Show extracted image question if from image upload */}
                      {result.extracted_question && (
                        <div
                          className="p-4 rounded-2xl"
                          style={{
                            background: "rgba(0,212,255,.06)",
                            border: "1px solid rgba(0,212,255,.2)",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              color: "var(--cyan)",
                              fontFamily: "var(--mono)",
                              textTransform: "uppercase",
                              letterSpacing: ".1em",
                              marginBottom: 8,
                            }}
                          >
                            📷 Question from image
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--t2)",
                              lineHeight: 1.75,
                            }}
                          >
                            {result.extracted_question}
                          </p>
                        </div>
                      )}

                      <SimPlayer
                        result={result}
                        Sim={Sim}
                        simData={simData}
                        speaking={voice.speaking}
                        paused={voice.paused}
                        onClickScreen={handleScreenClick}
                        subtitle={subtitle}
                        showCC={showCC}
                        onToggleCC={() => setShowCC((s) => !s)}
                        speed={voice.speed}
                        onSpeedChange={voice.changeSpeed}
                        lang={voice.lang}
                        avail={voice.avail}
                        play={voice.play}
                        highlight={highlight}
                      />
                      {/* Answer strip — only shows when actual answer is available */}
                      {(result.correct_option || result.final_answer) &&
                        (() => {
                          const ans =
                            result.correct_option || result.final_answer || "";
                          const bad = [
                            "see solution",
                            "see steps",
                            "calculated",
                            "see solution steps",
                            "above",
                          ].some((x) => ans.toLowerCase().includes(x));
                          if (bad) return null;
                          return (
                            <div
                              className="flex items-center gap-3 p-4 rounded-2xl"
                              style={{
                                background: "rgba(46,204,113,.08)",
                                border: "1px solid rgba(46,204,113,.28)",
                              }}
                            >
                              <span style={{ fontSize: 24 }}>✅</span>
                              <div>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "var(--green)",
                                    fontFamily: "var(--mono)",
                                    textTransform: "uppercase",
                                    letterSpacing: ".07em",
                                    marginBottom: 3,
                                  }}
                                >
                                  Answer
                                </p>
                                <p
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 900,
                                    color: "var(--t1)",
                                    fontFamily: "var(--mono)",
                                  }}
                                >
                                  {ans}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="fade-in">
                      <SolutionTab result={result} highlight={highlight} />
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div className="fade-in">
                      <FormulasTab result={result} />
                    </div>
                  )}
                  {activeTab === 3 && (
                    <div className="fade-in">
                      <ExploreTab result={result} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
