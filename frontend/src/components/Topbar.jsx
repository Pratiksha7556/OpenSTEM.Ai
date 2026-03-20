import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

// ── Profile / Settings Modal ──────────────────────────────────
function ProfileModal({ user, onClose }) {
  const { authUser } = useAuth();
  const displayUser = authUser || user;
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(displayUser?.name || "");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history when switching to history tab
  useEffect(() => {
    if (tab !== "history") return;
    const token = localStorage.getItem("simai_token");
    if (!token) return;
    fetch("/api/auth/history?limit=20", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []))
      .catch(() => {});
  }, [tab]);

  async function saveName() {
    const token = localStorage.getItem("simai_token");
    if (!token || !name.trim() || name.trim().length < 2) return;
    try {
      await fetch(`/api/auth/profile?name=${encodeURIComponent(name.trim())}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }

  const TABS = [
    { id: "profile", label: "👤 Profile" },
    { id: "history", label: "📚 History" },
    { id: "settings", label: "⚙ Settings" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,.5)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--t1)",
                  fontFamily: "var(--font)",
                }}
              >
                {displayUser?.name || "Guest"}
              </p>
              <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
                {displayUser?.email || "Not signed in"}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--cyan)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  🔥 {displayUser?.streak || 0} day streak
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--t3)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  ✓ {displayUser?.total_problems || displayUser?.solved || 0}{" "}
                  solved
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#f5a623",
                    fontFamily: "var(--mono)",
                  }}
                >
                  ⚡ {displayUser?.xp || 0} XP
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                color: "var(--t3)",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "9px 9px 0 0",
                  fontSize: 12,
                  fontFamily: "var(--font)",
                  border: "none",
                  cursor: "pointer",
                  background: tab === t.id ? "var(--bg)" : "transparent",
                  color: tab === t.id ? "var(--cyan)" : "var(--t3)",
                  fontWeight: tab === t.id ? 600 : 400,
                  borderBottom:
                    tab === t.id
                      ? "2px solid var(--cyan)"
                      : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div
          style={{ padding: "20px 24px", maxHeight: 340, overflowY: "auto" }}
        >
          {/* Profile tab */}
          {tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--t3)",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Display Name
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 9,
                      color: "var(--t1)",
                      fontSize: 13,
                      fontFamily: "var(--font)",
                      outline: "none",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(0,212,255,.5)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <button
                    onClick={saveName}
                    className="btn btn-primary"
                    style={{
                      padding: "9px 16px",
                      fontSize: 12,
                      borderRadius: 9,
                    }}
                  >
                    {saved ? "✓ Saved" : "Save"}
                  </button>
                </div>
              </div>
              <div
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--t3)",
                    fontFamily: "var(--mono)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginBottom: 10,
                  }}
                >
                  Stats
                </p>
                {[
                  [
                    "Problems Solved",
                    displayUser?.total_problems || displayUser?.solved || 0,
                  ],
                  ["Total XP", displayUser?.xp || 0],
                  ["Day Streak", displayUser?.streak || 0],
                  ["Level", Math.floor((displayUser?.xp || 0) / 100) + 1],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--t3)" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--t1)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History tab */}
          {tab === "history" && (
            <div>
              {history.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "var(--t3)",
                    fontSize: 13,
                  }}
                >
                  No problems solved yet. Start learning!
                </div>
              ) : (
                history.map((h, i) => (
                  <div
                    key={h.id}
                    style={{
                      padding: "10px 0",
                      borderBottom:
                        i < history.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ display: "flex", gap: 6, marginBottom: 3 }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              padding: "1px 7px",
                              borderRadius: 99,
                              fontFamily: "var(--mono)",
                              background: "rgba(0,212,255,.1)",
                              color: "var(--cyan)",
                              border: "1px solid rgba(0,212,255,.2)",
                            }}
                          >
                            {h.subject}
                          </span>
                          {h.domain && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--t3)",
                                fontFamily: "var(--mono)",
                              }}
                            >
                              {h.domain}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--t2)",
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 320,
                          }}
                        >
                          {h.problem}
                        </p>
                        {h.answer && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--green)",
                              marginTop: 2,
                              fontFamily: "var(--mono)",
                            }}
                          >
                            = {h.answer}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--t3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.created_at
                          ? new Date(h.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings tab */}
          {tab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}>
                Preferences
              </p>
              {[
                {
                  label: "Language",
                  value: "English (default)",
                  note: "Voice narration language",
                },
                {
                  label: "Account email",
                  value: displayUser?.email || "—",
                  note: "Cannot be changed",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--t1)",
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--t3)",
                          marginTop: 2,
                        }}
                      >
                        {item.note}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--cyan)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  marginTop: 4,
                  background: "rgba(239,68,68,.06)",
                  border: "1px solid rgba(239,68,68,.2)",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--red)",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  Danger Zone
                </p>
                <p
                  style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10 }}
                >
                  This will permanently delete your account and all history.
                </p>
                <button
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    background: "rgba(239,68,68,.15)",
                    border: "1px solid rgba(239,68,68,.3)",
                    color: "var(--red)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                  }}
                  onClick={async () => {
                    if (!confirm("Delete your account permanently?")) return;
                    const token = localStorage.getItem("simai_token");
                    if (token)
                      await fetch("/api/auth/account", {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────
export default function Topbar({ result }) {
  const {
    user: appUser,
    logout: appLogout,
    toggleTheme,
    theme,
    sidebarOpen,
    toggleSidebar,
    zoom,
    zoomIn,
    zoomOut,
    zoomReset,
  } = useApp();
  const { authUser, clearAuth } = useAuth();

  // Prefer real auth user, fall back to AppContext user
  const user = authUser || appUser;

  const [profileOpen, setProfileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function handleLogout() {
    if (clearAuth) clearAuth();
    if (appLogout) appLogout();
    setProfileOpen(false);
  }

  const initials =
    user?.avatar ||
    (user?.name
      ? user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "G");

  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 py-2.5 z-40"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="btn btn-surface w-8 h-8 !p-0 justify-center rounded-lg"
        >
          <span style={{ fontSize: "15px" }}>{sidebarOpen ? "◧" : "▣"}</span>
        </button>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "17px" }}>⚛</span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontWeight: 800,
              fontSize: "16px",
              color: "var(--t1)",
            }}
          >
            Open<span style={{ color: "var(--cyan)" }}>STEM.Ai</span>
          </span>
        </div>
        {result && (
          <div
            className="hidden md:flex items-center gap-1.5"
            style={{
              fontSize: "12px",
              color: "var(--t3)",
              fontFamily: "var(--mono)",
            }}
          >
            <span>/</span>
            <span style={{ color: "var(--t2)" }}>{result.subject}</span>
            {result.domain && (
              <>
                <span>/</span>
                <span style={{ color: "var(--cyan)" }}>{result.domain}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <button
            onClick={zoomOut}
            style={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "var(--t2)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <button
            onClick={zoomReset}
            style={{
              fontSize: "11px",
              color: "var(--t3)",
              fontFamily: "var(--mono)",
              background: "none",
              border: "none",
              cursor: "pointer",
              minWidth: "38px",
              textAlign: "center",
            }}
          >
            {zoom}%
          </button>
          <button
            onClick={zoomIn}
            style={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "var(--t2)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="btn btn-surface w-8 h-8 !p-0 justify-center rounded-lg"
        >
          <span style={{ fontSize: "14px" }}>
            {theme === "dark" ? "☀" : "🌙"}
          </span>
        </button>

        {/* Profile */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
            style={{
              background: profileOpen ? "var(--surface2)" : "var(--surface)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--cyan-dim)",
                color: "var(--cyan)",
                fontFamily: "var(--font)",
              }}
            >
              {initials}
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontSize: "13px",
                color: "var(--t2)",
                fontFamily: "var(--font)",
                fontWeight: 500,
              }}
            >
              {user?.name?.split(" ")[0] || "Guest"}
            </span>
            <span style={{ fontSize: "10px", color: "var(--t3)" }}>▾</span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-56 rounded-2xl p-2 z-50 fade-in"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              {/* User info summary */}
              <div
                className="px-3 py-3 mb-1"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--t1)",
                  }}
                >
                  {user?.name || "Guest"}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--t3)",
                    marginTop: "2px",
                  }}
                >
                  {user?.email || "Not signed in"}
                </p>
                <div className="flex gap-3 mt-2">
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--cyan)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    🔥 {user?.streak || 0} day streak
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--t3)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ✓ {user?.total_problems || user?.solved || 0} solved
                  </span>
                </div>
              </div>

              {/* Menu items */}
              {[
                {
                  icon: "👤",
                  label: "Profile & History",
                  action: () => {
                    setShowModal(true);
                    setProfileOpen(false);
                  },
                },
                {
                  icon: "⚙",
                  label: "Settings",
                  action: () => {
                    setShowModal(true);
                    setProfileOpen(false);
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-[var(--surface2)]"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--t2)",
                    fontFamily: "var(--font)",
                    width: "100%",
                  }}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  marginTop: "4px",
                  paddingTop: "4px",
                }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-red-500/10"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--red)",
                    fontFamily: "var(--font)",
                    width: "100%",
                  }}
                >
                  <span>→</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && (
        <ProfileModal user={user} onClose={() => setShowModal(false)} />
      )}
    </header>
  );
}
