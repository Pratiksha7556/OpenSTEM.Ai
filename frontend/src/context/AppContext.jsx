import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

const DEMO_USER = {
  name: "Arjun Sharma",
  email: "arjun@simai.edu",
  avatar: "AS",
  plan: "Student",
  solved: 24,
  streak: 7,
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState("landing");

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  const login = useCallback((userData) => {
    setUser(userData || DEMO_USER);
    setPage("app");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPage("landing");
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 10, 150)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 10, 70)), []);
  const zoomReset = useCallback(() => setZoom(100), []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        login,
        logout,
        sidebarOpen,
        toggleSidebar,
        zoom,
        zoomIn,
        zoomOut,
        zoomReset,
        page,
        setPage,
        DEMO_USER,
      }}
    >
      <div className={theme} style={{ fontSize: `${zoom}%` }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

export default AppContext;
