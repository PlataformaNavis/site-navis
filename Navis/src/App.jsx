import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import UserProfilePage from "./components/UserProfilePage";
import LocationPermissionPage from "./components/LocationPermissionPage";
import NavyPage from "./components/NavyPage";
import HelpChat from "./components/ChatNavy";
import SOSPage from "./components/SOSPage";
import PlansPage from "./components/PlansPage";
import authService from "./services/authService";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Verifica autenticação
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const locationPermission = localStorage.getItem(
          "navis_location_permission"
        );
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

  // Carrega imagem de perfil salva
  useEffect(() => {
    const savedImage = localStorage.getItem("navis_user_photo");
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const handleResetApp = () => {
    localStorage.clear();
    setCurrentPage("login");
    setIsAuthenticated(false);
    setProfileImage(null);
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
          <DashboardPage
            onNavigateToSOS={() => setCurrentPage("sos")}
            onNavigateToProfile={() => setCurrentPage("profile")}
          />
        );

      case "profile":
        return (
          <UserProfilePage
            onNavigateToDashboard={() => setCurrentPage("dashboard")}
            onProfileImageUpdate={(image) => setProfileImage(image)}
          />
        );

      case "plans":
        return <PlansPage onNavigateBack={() => setCurrentPage("dashboard")} />;

      case "Navy":
        return (
          <NavyPage
            onNavigateToDashboard={() => {
              console.log("➡ Navegando para Dashboard...");
              setCurrentPage("dashboard");
            }}
          />
        );

      case "sos":
        return <SOSPage onNavigateBack={() => setCurrentPage("dashboard")} />;

      default:
        return <LoginPage onLoginSuccess={() => setCurrentPage("location")} />;
    }
  };

  return (
    <Router>
      <>
        {currentPage !== "login" && currentPage !== "sos" && (
          <nav className="app-navigation">
            <div className="voltal">
              <button
                onClick={() => {
                  setCurrentPage("login");
                  setIsMenuOpen(false);
                }}
                className="back-button"
              >
                <img src="/left-arrow (1).png" alt="" /> Login
              </button>
            </div>

            <button
              className="hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>

            <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
              <button
                onClick={() => {
                  setCurrentPage("location");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "location" ? "active" : ""
                }`}
              >
                <img src="/location.png" alt="" /> Localização
              </button>

              <button
                onClick={() => {
                  setCurrentPage("dashboard");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "dashboard" ? "active" : ""
                }`}
              >
                <img src="/home.png" alt="" /> Home
              </button>

              <button
                onClick={() => {
                  setCurrentPage("community");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "community" ? "active" : ""
                }`}
              >
                <img src="/arrow.png" alt="" /> Navegantes
              </button>

              <button
                onClick={() => {
                  setCurrentPage("Navy");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "Navy" ? "active" : ""
                }`}
              >
                <img src="/Navy.png" alt="" /> Navy
              </button>

              <button
                onClick={() => {
                  setCurrentPage("plans");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "plans" ? "active" : ""
                }`}
              >
                <img src="/growth (4).png" alt="Planos" />
                Planos
              </button>

              <button
                onClick={() => {
                  setCurrentPage("profile");
                  setIsMenuOpen(false);
                }}
                className={`nav-button ${
                  currentPage === "profile" ? "active" : ""
                }`}
              >
                <img
                  src={profileImage || "/user.png"}
                  alt="Foto de perfil"
                  className="profile-icon"
                />
                Perfil
              </button>
            </div>
          </nav>
        )}

        {renderPage()}

        {isAuthenticated &&
          currentPage !== "login" &&
          currentPage !== "sos" && <HelpChat />}
      </>
    </Router>
  );
}

export default App;
