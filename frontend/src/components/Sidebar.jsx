import { useApp } from "../context/AppContext";

const SUBJECTS = [
  { icon: "⚛", label: "Physics", color: "#00d4ff", live: true },
  { icon: "∑", label: "Mathematics", color: "#f5a623", live: true },
  { icon: "⚡", label: "Electronics", color: "#2ecc71", live: true },
  { icon: "⚗", label: "Chemistry", color: "#9b59b6", live: false },
  { icon: "🧬", label: "Biology", color: "#e74c3c", live: false },
  { icon: "🌍", label: "Geography", color: "#1abc9c", live: false },
];

export default function Sidebar() {
  const { sidebarOpen, user } = useApp();
  if (!sidebarOpen) return null;

  return (
    <aside
      className="shrink-0 flex flex-col slide-in"
      style={{
        width: 240,
        borderRight: "1px solid var(--border)",
        background: "var(--bg2)",
        overflow: "hidden auto",
      }}
    >
      {/* User */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              background: "var(--cyan-dim)",
              color: "var(--cyan)",
              fontFamily: "var(--font)",
            }}
          >
            {user?.avatar || "U"}
          </div>
          <div className="min-w-0">
            <p
              className="truncate"
              style={{ fontWeight: 600, fontSize: "13px", color: "var(--t1)" }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--t3)",
                fontFamily: "var(--mono)",
              }}
            >
              🔥 {user?.streak || 1}d streak
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            fontFamily: "var(--mono)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: "10px",
          }}
        >
          How to use
        </p>
        <div className="space-y-3">
          {[
            {
              n: "1",
              t: "Paste your problem",
              d: "Any subject — type it or upload a photo",
            },
            {
              n: "2",
              t: "Watch the animation",
              d: "A live simulation plays with real measurements shown on screen",
            },
            {
              n: "3",
              t: "Hear the explanation",
              d: "Pick a language — voice narrates what you see, step by step",
            },
            {
              n: "4",
              t: "Read the solution",
              d: "Steps, formulas and the final answer on the right panel",
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{
                  background: "var(--cyan-dim)",
                  border: "1px solid rgba(0,212,255,.25)",
                  color: "var(--cyan)",
                  fontFamily: "var(--mono)",
                }}
              >
                {s.n}
              </span>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--t2)",
                    marginBottom: "1px",
                  }}
                >
                  {s.t}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--t3)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="p-4 flex-1">
        <p
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            fontFamily: "var(--mono)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: "10px",
          }}
        >
          Subjects
        </p>
        <div className="space-y-1.5">
          {SUBJECTS.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: s.live ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--t2)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--mono)",
                  color: s.live ? "var(--green)" : "var(--amber)",
                }}
              >
                {s.live ? "● live" : "○ soon"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice tip */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: "var(--cyan-dim)",
            border: "1px solid rgba(0,212,255,.2)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--cyan)",
              marginBottom: "3px",
            }}
          >
            🎙 Voice auto-syncs
          </p>
          <p style={{ fontSize: "11px", color: "var(--t3)", lineHeight: 1.5 }}>
            The animation pauses when voice stops — so you always see what the
            teacher is describing.
          </p>
        </div>
      </div>
    </aside>
  );
}
