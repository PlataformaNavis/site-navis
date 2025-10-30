import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import UserProfilePage from "./components/UserProfilePage";
import LocationPermissionPage from "./components/LocationPermissionPage";
import NavyPage from "./components/NavyPage";
import HelpChat from "./components/ChatNavy";
import authService from "./services/authService";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const locationPermission = localStorage.getItem("navis_location_permission");
        if (locationPermission) {
          setCurrentPage("dashboard");
        } else {
          setCurrentPage("location");
        }
      } else {
        setCurrentPage("login");
      }
    };

    checkAuth();
  }, []);

  const handleResetApp = () => {
    localStorage.clear();
    setCurrentPage("login");
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onLoginSuccess={() => setCurrentPage("location")} />;
      case "location":
        return (
          <LocationPermissionPage
            onPermissionGranted={() => setCurrentPage("dashboard")}
            onPermissionDenied={() => setCurrentPage("dashboard")}
            onNavigateToDashboard={() => setCurrentPage("dashboard")}
          />
        );
      case "dashboard":
        return (
          <DashboardPage onNavigateToProfile={() => setCurrentPage("profile")} />
        );
      case "profile":
        return (
          <UserProfilePage onNavigateToDashboard={() => setCurrentPage("dashboard")} />
        );
      case "Navy":
        return <NavyPage />;
      default:
        return <LoginPage onLoginSuccess={() => setCurrentPage("location")} />;
    }
  };

  return (
    <>
      {currentPage !== "login" && (
        <nav className="app-navigation">
          <div className="voltal">
            <button
              onClick={() => setCurrentPage("login")}
              className="back-button"
            >
              <img src="/left-arrow (1).png" alt="" /> Login
            </button>
          </div>

          {/* Botão hamburguer */}
          <button
            className="hamburger-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
            <button onClick={() => setCurrentPage("location")} className="nav-button">
              <img src="/location.png" alt="" /> Localização
            </button>

            <button onClick={() => setCurrentPage("dashboard")} className="nav-button">
              <img src="/home.png" alt="" /> Home
            </button>

            <button onClick={() => setCurrentPage("community")} className="nav-button">
              <img src="/arrow.png" alt="" /> Navegantes
            </button>

            <button onClick={() => setCurrentPage("Navy")} className="nav-button">
              <img src="/Navy.png" alt="" /> Navy
            </button>

            <button onClick={() => setCurrentPage("profile")} className="nav-button">
              <img src="/user.png" alt="" /> Perfil
            </button>
          </div>
        </nav>
      )}

      {renderPage()}

      {/* Chatbot */}
      {isAuthenticated && currentPage !== "login" && <HelpChat />}
    </>
  );
}

export default App;
