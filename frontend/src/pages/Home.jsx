import { useState, useCallback } from "react";
import ProblemInput from "../components/ProblemInput";
import SimulationViewer from "../components/SimulationViewer";
import ResultPanel from "../components/ResultPanel";
import SolutionPanel from "../components/SolutionPanel";
import { analyzeProblem, analyzeImage, reSimulate } from "../services/api";

const TOPIC_ICONS = {
  projectile_motion: "⟳",
  pendulum: "◎",
  wave: "≈",
  circuit: "⚡",
  function_plot: "f",
};
const TOPIC_LABELS = {
  projectile_motion: "Projectile Motion",
  pendulum: "Simple Pendulum",
  wave: "Wave Motion",
  circuit: "Ohm's Law / Circuit",
  function_plot: "Function Plot",
};

function StatusPill({ status, topic }) {
  const configs = {
    idle: { dot: "#4a6278", text: "Ready", color: "var(--text-3)" },
    loading: {
      dot: "#22d3ee",
      text: "AI Analyzing…",
      color: "#22d3ee",
      animate: true,
    },
    done: {
      dot: "#4ade80",
      text: `${TOPIC_ICONS[topic] || "◈"} ${TOPIC_LABELS[topic] || topic}`,
      color: "#4ade80",
    },
    error: { dot: "#f87171", text: "Error", color: "#f87171" },
  };
  const cfg = configs[status] || configs.idle;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.animate ? "animate-ping" : ""}`}
        style={{ background: cfg.dot, display: "inline-block" }}
      />
      <span
        style={{
          fontSize: "11px",
          color: cfg.color,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {cfg.text}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-12 px-4">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.15)",
          }}
        >
          ⚛
        </div>
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400"
          style={{ animation: "pulse-ring 2s infinite" }}
        />
      </div>
      <div className="text-center max-w-sm">
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text-1)",
            marginBottom: "8px",
          }}
        >
          SimAI Learning Platform
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            lineHeight: "1.7",
          }}
        >
          Enter any physics or math problem. Get an interactive simulation,
          step-by-step solution, and voice explanation in English, Hindi &
          Marathi.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {[
          { icon: "◈", label: "Interactive Simulation", color: "#22d3ee" },
          { icon: "①", label: "Step-by-Step Solution", color: "#f59e0b" },
          { icon: "⚖", label: "Laws & Principles", color: "#a78bfa" },
          { icon: "🔊", label: "Voice in 3 Languages", color: "#4ade80" },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "16px", color: f.color }}>{f.icon}</span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-3)",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation");

  const handleAnalyze = useCallback(async ({ type, value }) => {
    setStatus("loading");
    setError("");
    setActiveTab("simulation");
    try {
      const data =
        type === "image"
          ? await analyzeImage(value)
          : await analyzeProblem(value);
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }, []);

  const handleVariableChange = useCallback(
    async (topic, newVars) => {
      if (!result) return;
      setSimLoading(true);
      try {
        const data = await reSimulate(topic, newVars);
        setResult((prev) => ({
          ...prev,
          variables: { ...prev.variables, ...newVars },
          simulation: data.simulation,
          solution: data.solution || prev.solution,
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setSimLoading(false);
      }
    },
    [result],
  );

  return (
    <div className="min-h-screen flex flex-col grid-bg">
      {/* ── Header ──────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center justify-between px-5 py-3 z-50"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(8,11,15,0.92)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            ⚛
          </div>
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "var(--text-1)",
              }}
            >
              SimAI
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "var(--text-3)",
              }}
            >
              / Physics & Math Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={status} topic={result?.topic} />
          {simLoading && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span
                style={{
                  fontSize: "10px",
                  color: "#f59e0b",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Updating
              </span>
            </div>
          )}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.15)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span
              style={{
                fontSize: "10px",
                color: "#4ade80",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Groq · Free
            </span>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col lg:flex-row overflow-hidden"
        style={{ height: "calc(100vh - 57px)" }}
      >
        {/* Left Sidebar */}
        <aside
          className="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto"
          style={{
            borderRight: "1px solid var(--border)",
            background: "var(--bg-2)",
          }}
        >
          <div
            className="p-5 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                color: "var(--text-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Problem Input
            </p>
            <ProblemInput
              onAnalyze={handleAnalyze}
              loading={status === "loading"}
            />
          </div>

          {error && (
            <div
              className="mx-4 mt-4 p-3 rounded-xl"
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#f87171",
                  fontFamily: "'IBM Plex Mono', monospace",
                  lineHeight: "1.5",
                }}
              >
                ⚠ {error}
              </p>
            </div>
          )}

          {result && (
            <div className="p-5 flex-1">
              <ResultPanel result={result} />
            </div>
          )}
        </aside>

        {/* Main — tabbed panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!result ? (
            <EmptyState />
          ) : (
            <SolutionPanel
              result={result}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {/* Simulation tab content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "18px" }}>
                    {TOPIC_ICONS[result.topic]}
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "var(--text-1)",
                    }}
                  >
                    {TOPIC_LABELS[result.topic] || result.topic}
                  </h2>
                </div>
                <SimulationViewer
                  result={result}
                  onVariableChange={handleVariableChange}
                />
              </div>
            </SolutionPanel>
          )}
        </main>
      </div>
    </div>
  );
}
