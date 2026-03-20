import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ initialMode, mode: modeProp }) {
  const isSignup = initialMode === "signup" || modeProp === "signup";
  const [tab, setTab] = useState(isSignup ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AppContext.login(user) → sets user + sets page to 'app'
  const { login: goToApp } = useApp();
  // AuthContext.setUser → saves user to localStorage
  const { setUser: saveAuthUser } = useAuth();

  function validate() {
    if (tab === "signup") {
      if (!name.trim() || name.trim().length < 2)
        return "Enter your full name (min 2 chars)";
    }
    if (!email.trim() || !email.includes("@"))
      return "Enter a valid email address";
    if (!pass || pass.length < 1) return "Enter your password";
    if (tab === "signup") {
      if (pass.length < 8) return "Password needs at least 8 characters";
      if (!/[A-Z]/.test(pass))
        return "Password needs at least 1 uppercase letter";
      if (!/[0-9]/.test(pass)) return "Password needs at least 1 number";
      if (pass !== confirm) return "Passwords do not match";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validErr = validate();
    if (validErr) {
      setError(validErr);
      return;
    }

    setLoading(true);

    const url = tab === "signup" ? "/api/auth/signup" : "/api/auth/login";

    const body =
      tab === "signup"
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: pass,
          }
        : { email: email.trim().toLowerCase(), password: pass };

    try {
      // Direct fetch — no abstraction, no hidden failures
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // Handle non-2xx
      if (!res.ok) {
        const msg = data?.detail || data?.message || `Error ${res.status}`;
        // 409 = email taken → auto-switch to login
        if (res.status === 409) {
          setTab("login");
          setError("This email is already registered. Please log in.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      // ── SUCCESS ──────────────────────────────────────────────
      // 1. Save JWT
      localStorage.setItem("simai_token", data.token);

      // 2. Build AppContext-compatible user object
      const apiUser = data.user || {};
      const initials = (apiUser.name || "U")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const appUser = {
        name: apiUser.name || email,
        email: apiUser.email || email,
        avatar: initials,
        plan: "Student",
        streak: apiUser.streak || 0,
        solved: apiUser.total_problems || 0,
        xp: apiUser.xp || 0,
        id: apiUser.id,
      };

      // 3. Save to AuthContext (localStorage)
      saveAuthUser(appUser);

      // 4. Call AppContext.login → sets user + navigates to page='app'
      goToApp(appUser);

      // done — Router will render <AppWorkspace />
    } catch (networkErr) {
      setError("Cannot reach server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  // Password strength
  const strength = (() => {
    if (!pass || tab !== "signup") return 0;
    return [
      pass.length >= 8,
      /[A-Z]/.test(pass),
      /[0-9]/.test(pass),
      /[^A-Za-z0-9]/.test(pass),
    ].filter(Boolean).length;
  })();
  const sColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#00d4ff"];
  const sLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const inp = (extra = {}) => ({
    width: "100%",
    padding: "11px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--t1)",
    fontSize: 14,
    fontFamily: "var(--font)",
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>⚛</div>
          <div
            style={{
              fontFamily: "var(--font)",
              fontWeight: 900,
              fontSize: 28,
              color: "var(--t1)",
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            Sim<span style={{ color: "var(--cyan)" }}>AI</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)" }}>
            Physics · Mathematics · Chemistry — Class 11 &amp; 12
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 10,
            }}
          >
            {[
              ["⚛", "Physics", "#00d4ff"],
              ["∑", "Maths", "#8b5cf6"],
              ["⚗", "Chemistry", "#10b981"],
            ].map(([i, l, c]) => (
              <span
                key={l}
                style={{
                  fontSize: 11,
                  color: c,
                  padding: "3px 10px",
                  borderRadius: 8,
                  background: `${c}12`,
                  border: `1px solid ${c}22`,
                }}
              >
                {i} {l}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 28,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--border)",
              marginBottom: 22,
              background: "var(--bg)",
            }}
          >
            {["login", "signup"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font)",
                  border: "none",
                  cursor: "pointer",
                  background: tab === t ? "var(--cyan-dim)" : "transparent",
                  color: tab === t ? "var(--cyan)" : "var(--t3)",
                  transition: "all .15s",
                }}
              >
                {t === "login" ? "🔑 Log In" : "🚀 Sign Up"}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {tab === "signup" && (
              <div>
                <div
                  style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}
                >
                  Full Name
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  autoComplete="name"
                  style={inp()}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(0,212,255,.5)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            )}

            <div>
              <div
                style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}
              >
                Email
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                style={inp()}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(0,212,255,.5)")
                }
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <div
                style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}
              >
                Password
              </div>
              <div style={{ position: "relative" }}>
                <input
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder={
                    tab === "signup"
                      ? "Min 8 chars, 1 uppercase, 1 number"
                      : "Your password"
                  }
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  style={inp({ paddingRight: 42 })}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(0,212,255,.5)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    color: "var(--t3)",
                  }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {tab === "signup" && pass.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background:
                            strength >= i ? sColors[strength] : "var(--border)",
                          transition: "background .2s",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: sColors[strength] }}>
                    {sLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {tab === "signup" && (
              <div>
                <div
                  style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}
                >
                  Confirm Password
                </div>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  style={inp({
                    borderColor:
                      confirm.length > 0
                        ? confirm === pass
                          ? "rgba(34,197,94,.5)"
                          : "rgba(239,68,68,.5)"
                        : "var(--border)",
                  })}
                />
                {confirm.length > 0 && confirm !== pass && (
                  <div
                    style={{ fontSize: 11, color: "var(--red)", marginTop: 3 }}
                  >
                    Passwords do not match
                  </div>
                )}
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: "10px 13px",
                  borderRadius: 9,
                  background: "rgba(239,68,68,.09)",
                  border: "1px solid rgba(239,68,68,.3)",
                  fontSize: 13,
                  color: "var(--red)",
                  lineHeight: 1.5,
                }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 0",
                borderRadius: 11,
                border: "none",
                background: loading ? "rgba(0,212,255,.3)" : "var(--cyan)",
                color: "#000",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font)",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid #000",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin .6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  {tab === "login" ? "Logging in…" : "Creating account…"}
                </>
              ) : tab === "login" ? (
                "🔑 Log In"
              ) : (
                "🚀 Create Account"
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13,
              color: "var(--t3)",
            }}
          >
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setTab(tab === "login" ? "signup" : "login");
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--cyan)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              {tab === "login" ? "Sign up free" : "Log in"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            type="button"
            onClick={() => goToApp(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--t3)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--font)",
            }}
          >
            Continue as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
