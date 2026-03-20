import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AppWorkspace from "./pages/AppWorkspace";

function Router() {
  const { page } = useApp();
  if (page === "landing") return <LandingPage />;
  if (page === "login") return <AuthPage initialMode="login" />;
  if (page === "signup") return <AuthPage initialMode="signup" />;
  if (page === "app") return <AppWorkspace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </AuthProvider>
  );
}
