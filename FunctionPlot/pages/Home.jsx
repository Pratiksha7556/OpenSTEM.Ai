import { useState } from "react";
import { Atom, Loader2 } from "lucide-react";
import ProblemInput from "../components/ProblemInput";
import SimulationViewer from "../components/SimulationViewer";
import ResultPanel from "../components/ResultPanel";
import { analyzeProblem, analyzeImage } from "../services/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async ({ type, value }) => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (type === "text") data = await analyzeProblem(value);
      else data = await analyzeImage(value);
      setResult(data);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          "Something went wrong. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = async (topic, newVars) => {
    if (!result) return;
    setLoading(true);
    try {
      // Re-use same problem text but update variables directly via simulate endpoint
      const updated = await analyzeProblem(
        result._original_problem || buildPrompt(topic, newVars),
      );
      setResult((prev) => ({
        ...prev,
        variables: { ...prev.variables, ...newVars },
        simulation: updated.simulation,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buildPrompt = (topic, vars) => {
    const entries = Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    return `Simulate ${topic.replace(/_/g, " ")} with ${entries}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Atom size={16} className="text-accent" />
          </div>
          <span className="font-display text-sm text-slate-200 tracking-wide">
            SimAI
          </span>
          <span className="text-xs text-muted hidden sm:block">
            / AI Simulation Platform
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse2" />
          <span className="text-xs text-muted">Gemini Flash</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-7xl mx-auto w-full">
        {/* Left Panel */}
        <div className="w-full lg:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-border p-6 space-y-6">
          <div>
            <h1 className="font-display text-lg text-slate-100 mb-1">
              Problem Input
            </h1>
            <p className="text-xs text-muted">
              Paste a textbook problem and watch it come alive.
            </p>
          </div>
          <ProblemInput onAnalyze={handleAnalyze} loading={loading} />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {result && <ResultPanel result={result} />}
        </div>

        {/* Right Panel - Simulation */}
        <div className="flex-1 p-6 space-y-4">
          {loading && !result && (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm">Analyzing problem with AI…</p>
            </div>
          )}

          {!loading && !result && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
                <Atom size={28} className="text-accent/50" />
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">
                  Ready to simulate
                </p>
                <p className="text-xs text-muted max-w-xs">
                  Enter a textbook problem on the left and the AI will generate
                  an interactive simulation for you.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm text-slate-200">
                  {result.topic
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </h2>
                {loading && (
                  <Loader2 size={14} className="animate-spin text-accent" />
                )}
              </div>
              <SimulationViewer
                result={result}
                onVariableChange={handleVariableChange}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
