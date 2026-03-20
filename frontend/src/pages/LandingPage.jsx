import { useApp } from "../context/AppContext";

const SUBJECTS = [
  {
    icon: "⚛",
    label: "Physics",
    color: "#00d4ff",
    topics: [
      "Mechanics",
      "Waves & Optics",
      "Electrostatics",
      "Magnetism",
      "Modern Physics",
    ],
    live: true,
  },
  {
    icon: "∑",
    label: "Mathematics",
    color: "#8b5cf6",
    topics: [
      "Calculus",
      "Trigonometry",
      "Vectors",
      "Statistics",
      "Conic Sections",
    ],
    live: true,
  },
  {
    icon: "⚗",
    label: "Chemistry",
    color: "#10b981",
    topics: [
      "Atomic Structure",
      "Bonding",
      "Equilibrium",
      "Electrochemistry",
      "Kinetics",
    ],
    live: true,
  },
  {
    icon: "🧬",
    label: "Biology",
    color: "#9b59b6",
    topics: [
      "Cell Biology",
      "Genetics",
      "Ecosystems",
      "Evolution",
      "Human Body",
    ],
    live: false,
  },
  {
    icon: "🌍",
    label: "Geography",
    color: "#1abc9c",
    topics: [
      "Plate Tectonics",
      "Climate",
      "Landforms",
      "Weather Systems",
      "Ecosystems",
    ],
    live: false,
  },
];

const STEPS = [
  {
    n: "01",
    icon: "📝",
    color: "#00d4ff",
    title: "Paste Any Problem",
    desc: "Type or photograph any textbook question. Physics, Maths, Chemistry — any chapter, any board.",
  },
  {
    n: "02",
    icon: "🧠",
    color: "#8b5cf6",
    title: "AI Solves It",
    desc: "Identifies the concept, extracts variables, selects the correct formula and builds a complete solution.",
  },
  {
    n: "03",
    icon: "▶",
    color: "#10b981",
    title: "Simulation Plays",
    desc: "A live interactive animation runs — pause, replay, change variables and watch results update instantly.",
  },
  {
    n: "04",
    icon: "🎙",
    color: "#f5a623",
    title: "Teacher Narrates",
    desc: "A voice explains every moment — which law applies, why — in English, Hindi or Marathi.",
  },
];

const FEATURES = [
  {
    icon: "🎬",
    color: "#00d4ff",
    title: "Animation + Voice in Sync",
    desc: "The simulation plays while a teacher voice explains each moment — not a video, a live interactive lesson.",
  },
  {
    icon: "🌐",
    color: "#8b5cf6",
    title: "Three Languages",
    desc: "English, Hindi and Marathi. Switch language mid-lesson. Natural narration, not robotic text-to-speech.",
  },
  {
    icon: "①",
    color: "#10b981",
    title: "Step-by-Step Solution",
    desc: "Every solution broken into clear steps — formula, substitution, calculation, result — expandable one by one.",
  },
  {
    icon: "🎛",
    color: "#f5a623",
    title: "Interactive Variables",
    desc: "Change any value — mass, angle, voltage — and watch the animation and answer update in real time.",
  },
  {
    icon: "📋",
    color: "#e74c3c",
    title: "Formula Reference",
    desc: "All formulas used in the problem collected in one tab with variable values. Quick exam reference.",
  },
  {
    icon: "🧩",
    color: "#00bcd4",
    title: "Practice & Revision",
    desc: "Flip cards to memorise formulas, mind map to see connections, and a quiz to test understanding.",
  },
];

export default function LandingPage() {
  const { setPage, toggleTheme, theme } = useApp();

  const navBtn = (onClick, label, primary) => (
    <button
      onClick={onClick}
      className={primary ? "btn btn-primary" : "btn btn-surface"}
      style={{ fontSize: 13, padding: "7px 16px", borderRadius: 9 }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: 54,
          borderBottom: "1px solid var(--border)",
          background: "rgba(7,11,16,.96)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              background: "var(--cyan-dim)",
              border: "1px solid rgba(0,212,255,.3)",
            }}
          >
            ⚛
          </div>
          <span
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              fontSize: 17,
              color: "var(--t1)",
              letterSpacing: "-0.02em",
            }}
          >
            OpenSTEM<span style={{ color: "var(--cyan)" }}>.Ai</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggleTheme}
            className="btn btn-surface"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          {navBtn(() => setPage("login"), "Sign In", false)}
          {navBtn(() => setPage("signup"), "Get Started →", true)}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,212,255,.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(0,212,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,.018) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 860,
            margin: "0 auto",
            padding: "76px 24px 68px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 99,
              marginBottom: 26,
              fontSize: 11,
              color: "var(--cyan)",
              fontFamily: "var(--mono)",
              background: "var(--cyan-dim)",
              border: "1px solid rgba(0,212,255,.2)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--cyan)",
                animation: "pulse 2s infinite",
                display: "inline-block",
              }}
            />
            Physics · Mathematics · Chemistry — Class 11 &amp; 12
          </div>

          <h1
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              lineHeight: 1.09,
              fontSize: "clamp(32px, 5.2vw, 60px)",
              color: "var(--t1)",
              letterSpacing: "-0.03em",
              marginBottom: 18,
            }}
          >
            Every problem explained.
            <br />
            <span style={{ color: "var(--cyan)" }}>Visually. Instantly.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(14px, 1.6vw, 16px)",
              color: "var(--t2)",
              lineHeight: 1.8,
              maxWidth: 500,
              margin: "0 auto 32px",
            }}
          >
            Paste any textbook question. OpenSTEM.Ai solves it, animates it, and
            narrates the solution in your language — formula by formula.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              marginBottom: 60,
            }}
          >
            <button
              onClick={() => setPage("signup")}
              className="btn btn-primary"
              style={{ padding: "12px 28px", fontSize: 14, borderRadius: 11 }}
            >
              Start Free — No signup needed →
            </button>
            <button
              onClick={() => setPage("login")}
              className="btn btn-surface"
              style={{ padding: "12px 20px", fontSize: 14, borderRadius: 11 }}
            >
              Sign In
            </button>
          </div>

          {/* App mockup */}
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              boxShadow: "0 28px 72px rgba(0,0,0,.5)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg2)",
              }}
            >
              {["#e74c3c", "#f5a623", "#2ecc71"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  margin: "0 8px",
                  padding: "3px 10px",
                  borderRadius: 7,
                  textAlign: "center",
                  background: "var(--surface2)",
                  fontSize: 10,
                  color: "var(--t3)",
                  fontFamily: "var(--mono)",
                }}
              >
                openstem.ai
              </div>
            </div>
            <div style={{ display: "flex", height: 170 }}>
              <div
                style={{
                  flex: 1,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                  {["Simulation", "Step-by-Step", "Formulas", "Explore"].map(
                    (t, i) => (
                      <div
                        key={t}
                        style={{
                          padding: "3px 9px",
                          borderRadius: 7,
                          fontSize: 10,
                          fontFamily: "var(--mono)",
                          cursor: "default",
                          background:
                            i === 0 ? "var(--cyan-dim)" : "transparent",
                          border: `1px solid ${i === 0 ? "rgba(0,212,255,.3)" : "transparent"}`,
                          color: i === 0 ? "var(--cyan)" : "var(--t3)",
                        }}
                      >
                        {t}
                      </div>
                    ),
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      display: "inline-block",
                      animation: "float 3s ease-in-out infinite",
                    }}
                  >
                    ⚛
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 148,
                  padding: 11,
                  borderLeft: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: 9,
                    borderRadius: 10,
                    background: "rgba(0,212,255,.05)",
                    border: "1px solid rgba(0,212,255,.14)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ fontSize: 11 }}>🎙</span>
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-end",
                        height: 12,
                      }}
                    >
                      {[3, 7, 11, 5, 9, 7, 3].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 2,
                            height: h,
                            background: "var(--cyan)",
                            borderRadius: 2,
                            animation: `waveBar ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {[1, 0.7, 0.85, 0.5].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 4,
                        borderRadius: 3,
                        marginBottom: 4,
                        width: `${w * 100}%`,
                        background: "rgba(0,212,255,.16)",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["EN", "HI", "MR"].map((l, i) => (
                    <div
                      key={l}
                      style={{
                        flex: 1,
                        padding: "5px 0",
                        borderRadius: 7,
                        textAlign: "center",
                        fontSize: 10,
                        fontFamily: "var(--mono)",
                        cursor: "default",
                        background:
                          i === 0 ? "var(--cyan-dim)" : "var(--surface2)",
                        border: `1px solid ${i === 0 ? "rgba(0,212,255,.3)" : "var(--border)"}`,
                        color: i === 0 ? "var(--cyan)" : "var(--t3)",
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{ maxWidth: 920, margin: "0 auto", padding: "68px 24px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h2
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: "-0.02em",
              color: "var(--t1)",
              marginBottom: 8,
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--t3)",
              maxWidth: 380,
              margin: "0 auto",
            }}
          >
            From a textbook question to a full animated lesson in under 15
            seconds.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(196px, 1fr))",
            gap: 14,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "22px 18px",
                borderRadius: 14,
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  marginBottom: 14,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}20`,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: s.color,
                  letterSpacing: ".08em",
                  marginBottom: 5,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--t1)",
                  marginBottom: 7,
                }}
              >
                {s.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.65 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subjects ── */}
      <section
        style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 68px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              fontSize: 26,
              color: "var(--t1)",
              marginBottom: 7,
              letterSpacing: "-0.02em",
            }}
          >
            Subjects covered
          </h2>
          <p style={{ fontSize: 12, color: "var(--t3)" }}>
            ✅ Live: Physics · Mathematics · Chemistry &nbsp;·&nbsp; 🔜 Coming:
            Biology · Geography
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 11,
          }}
        >
          {SUBJECTS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "18px",
                borderRadius: 14,
                position: "relative",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                {s.live ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                      color: "var(--green)",
                      background: "rgba(46,204,113,.1)",
                      border: "1px solid rgba(46,204,113,.2)",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--green)",
                        animation: "pulse 2s infinite",
                        display: "inline-block",
                      }}
                    />
                    Live
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                      color: "var(--amber)",
                      background: "rgba(245,166,35,.1)",
                      border: "1px solid rgba(245,166,35,.2)",
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    background: `${s.color}12`,
                    border: `1px solid ${s.color}20`,
                  }}
                >
                  {s.icon}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--t1)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {s.topics.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 7,
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                      color: s.color,
                      background: `${s.color}0a`,
                      border: `1px solid ${s.color}18`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 68px" }}
      >
        <h2
          style={{
            textAlign: "center",
            fontFamily: "var(--font)",
            fontWeight: 900,
            fontSize: 26,
            color: "var(--t1)",
            marginBottom: 32,
            letterSpacing: "-0.02em",
          }}
        >
          Everything included
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 11,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "20px 18px",
                borderRadius: 14,
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  marginBottom: 12,
                  background: `${f.color}12`,
                  border: `1px solid ${f.color}20`,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--t1)",
                  marginBottom: 7,
                }}
              >
                {f.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: 580,
          margin: "0 auto",
          padding: "0 24px 72px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "44px 36px",
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(0,212,255,.05) 0%, rgba(139,92,246,.05) 100%)",
            border: "1px solid rgba(0,212,255,.16)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              fontSize: 26,
              color: "var(--t1)",
              marginBottom: 10,
              letterSpacing: "-0.02em",
            }}
          >
            Stop re-reading.
            <br />
            Start understanding.
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--t2)",
              marginBottom: 24,
              lineHeight: 1.75,
            }}
          >
            Paste any problem. Watch it animate. Hear it explained.
          </p>
          <button
            onClick={() => setPage("signup")}
            className="btn btn-primary"
            style={{ padding: "12px 32px", fontSize: 14, borderRadius: 11 }}
          >
            Start Learning Free →
          </button>
          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 10 }}>
            Free for students · No credit card · Works on mobile
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "18px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--t3)",
        }}
      >
        © 2025 OpenSTEM.Ai · Built for students across India ·
        <span style={{ color: "var(--cyan)", marginLeft: 6 }}>
          Made with ❤ in India
        </span>
      </footer>
    </div>
  );
}
