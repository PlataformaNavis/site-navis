import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import UserProfilePage from "./components/UserProfilePage";
import LocationPermissionPage from "./components/LocationPermissionPage";
import authService from "./services/authService";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            onNavigateToDashboard={() => setCurrentPage("dashboard")} // NOVA PROP!
          />
        );
      case "dashboard":
        return (
          <DashboardPage
            onNavigateToProfile={() => setCurrentPage("profile")} // NOVA PROP!
          />
        );
      case "profile":
        return (
          <UserProfilePage
            onNavigateToDashboard={() => setCurrentPage("dashboard")} // NOVA PROP!
          />
        );
      default:
        return <LoginPage onLoginSuccess={() => setCurrentPage("location")} />;
    }
  };

  return (
    <>
      {/* Navegação de Debug */}
      {currentPage !== "login" && (
        <nav className="app-navigation">
          <div className="voltal">
            <button
              onClick={() => setCurrentPage("login")}
              className="back-button"
            >
              <img src="/left-arrow (1).png" alt="" />Login
            </button>
          </div>

          <div className="nav-buttons">
            <button
              onClick={() => setCurrentPage("location")}
              className="nav-button"
            >
              <img src="/location.png" alt="" /> Localização
            </button>

            <button
              onClick={() => setCurrentPage("dashboard")}
              className="nav-button"
            >
              <img src="/home.png" alt="" /> Home
            </button>
            
            <button
              onClick={() => setCurrentPage("community")}
              className="nav-button"
            >
              <img src="/arrow.png" alt="" /> Navegantes
            </button>

            <button
              onClick={() => setCurrentPage("profile")}
              className="nav-button"
            >
              <img src="/user.png" alt="" /> Perfil
            </button>
          </div>
        </nav>
      )}

      {renderPage()}
    </>
  );
}

export default App;
