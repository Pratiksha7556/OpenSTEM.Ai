import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);

  // Restore token on page load
  useEffect(() => {
    const token = localStorage.getItem("simai_token");
    const saved = localStorage.getItem("simai_user");
    if (token && saved) {
      try {
        setAuthUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function setUser(user) {
    setAuthUser(user);
    if (user) localStorage.setItem("simai_user", JSON.stringify(user));
    else localStorage.removeItem("simai_user");
  }

  function clearAuth() {
    localStorage.removeItem("simai_token");
    localStorage.removeItem("simai_user");
    setAuthUser(null);
  }

  return (
    <Ctx.Provider value={{ authUser, setUser, clearAuth }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
