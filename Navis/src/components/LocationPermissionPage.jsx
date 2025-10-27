import { useState, useEffect } from "react";
import authService from "../services/authService";
import "./LocationPermissionPage.css";

const LocationPermissionPage = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (authService.checkAuth()) {
        setUser(authService.getCurrentUser());
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // Limpar o rastreamento quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleAllowLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.");
      setIsGettingLocation(false);

      const mockLocation = {
        latitude: "-23.550500",
        longitude: "-46.633300",
        accuracy: "N/A",
        city: "São Paulo",
        country: "Brasil",
        timestamp: new Date().toLocaleString("pt-BR"),
      };
      setLocationData(mockLocation);
      setPermissionStatus("granted");
      setIsTracking(false);
      return;
    }

    // Primeiro, pegar a posição atual
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Localização obtida:", position);

        const loc = {
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(2),
          city: "São Paulo", // Você pode integrar com uma API de geocoding reverso
          country: "Brasil",
          timestamp: new Date().toLocaleString("pt-BR"),
        };

        setLocationData(loc);
        setPermissionStatus("granted");
        setIsGettingLocation(false);
        setIsTracking(true);
        setError(null);

        // Agora iniciar o rastreamento contínuo
        const id = navigator.geolocation.watchPosition(
          (position) => {
            console.log("Localização atualizada:", position);

            const updatedLoc = {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
              accuracy: position.coords.accuracy.toFixed(2),
              city: "São Paulo",
              country: "Brasil",
              timestamp: new Date().toLocaleString("pt-BR"),
            };

            setLocationData(updatedLoc);
          },
          (err) => {
            console.error("Erro no rastreamento:", err);
            // Manter a última localização conhecida
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        setWatchId(id);
      },
      (err) => {
        console.error("Erro ao obter localização:", err);

        let errorMessage = "Erro ao obter localização. ";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage +=
              "Permissão negada. Por favor, permita o acesso à localização nas configurações do navegador.";
            setPermissionStatus("denied");
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage += "Localização indisponível.";
            break;
          case err.TIMEOUT:
            errorMessage += "Tempo esgotado ao buscar localização.";
            break;
          default:
            errorMessage += "Erro desconhecido.";
        }

        setError(errorMessage);
        setIsGettingLocation(false);

        // Usar localização padrão
        const mockLocation = {
          latitude: "-23.550500",
          longitude: "-46.633300",
          accuracy: "N/A",
          city: "São Paulo",
          country: "Brasil",
          timestamp: new Date().toLocaleString("pt-BR"),
        };
        setLocationData(mockLocation);
        setPermissionStatus("granted");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDenyLocation = () => {
    setPermissionStatus("denied");
    if (onPermissionDenied) onPermissionDenied();
  };

  const handleSkipLocation = () => {
    setPermissionStatus("skipped");
    if (onPermissionGranted) onPermissionGranted();
  };

  const handleContinue = () => {
    // Parar o rastreamento ao continuar
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    }
    if (onPermissionGranted) onPermissionGranted();
  };

  if (isLoading) {
    return (
      <div className="location-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-page">
      <main className="location-main">
        <div className="location-container">
          {permissionStatus === "pending" && (
            <div className="permission-card">
              <div className="location-icon">
                {" "}
                <img src="/place (3).png" alt="" />
              </div>
              <h2 className="permission-title">Compartilhar Localização</h2>
              <p className="permission-description">
                Permita que o NAVIS acesse sua localização em tempo real para
                melhorar a experiência e fornecer informações relevantes
                baseadas na sua posição.
              </p>
              <div className="permission-actions">
                <button
                  className="permission-button allow"
                  onClick={handleAllowLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <>Obtendo localização...</>
                  ) : (
                    <>
                      <img
                        src="/checked.png"
                        alt="Permitir"
                        style={{ width: "32px" }}
                      />
                      Permitir
                    </>
                  )}
                </button>
                <button
                  className="permission-button deny"
                  onClick={handleDenyLocation}
                  disabled={isGettingLocation}
                >
                  <img src="/close.png" alt="" /> Negar
                </button>
              </div>
              <button
                className="skip-button"
                onClick={handleSkipLocation}
                disabled={isGettingLocation}
              >
                Pular por enquanto
              </button>

              {isGettingLocation && (
                <div className="getting-location">
                  <div className="small-spinner"></div>
                  <p>Buscando sua localização...</p>
                </div>
              )}
            </div>
          )}

          {permissionStatus === "granted" && (
            <div className="status-card success">
              <div className="success-icon">
                {" "}
                <img src="/checked.png" alt="" />
              </div>
              <h2 className="status-title">Compartilhamento bem-sucedido!</h2>
              <p className="success-message">
                Sua localização está sendo compartilhada em tempo real.
              </p>

              {locationData ? (
                <div className="location-info">
                  <div className="location-item">
                    <strong>Latitude:</strong>
                    <span className="location-value">
                      {locationData.latitude}°
                    </span>
                  </div>
                  <div className="location-item">
                    <strong>Longitude:</strong>
                    <span className="location-value">
                      {locationData.longitude}°
                    </span>
                  </div>
                  <div className="location-item">
                    <strong>Precisão:</strong>
                    <span className="location-value">
                      {locationData.accuracy}m
                    </span>
                  </div>
                  <div className="location-item">
                    <strong>Cidade:</strong>
                    <span className="location-value">{locationData.city}</span>
                  </div>
                  <div className="location-item">
                    <strong>País:</strong>
                    <span className="location-value">
                      {locationData.country}
                    </span>
                  </div>
                  <div className="location-item timestamp">
                    <strong>Última atualização:</strong>
                    <span className="location-value">
                      {locationData.timestamp}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="loading-location">
                  <div className="small-spinner"></div>
                  <p>Carregando informações de localização...</p>
                </div>
              )}

              <button
                className="continue-button"
                onClick={handleContinue}
                disabled={!locationData}
              >
                Continuar
              </button>
            </div>
          )}

          {permissionStatus === "denied" && (
            <div className="status-card error">
              <div className="error-icon">✗</div>
              <h2 className="status-title">Localização negada</h2>
              <button className="continue-button" onClick={handleContinue}>
                Continuar
              </button>
            </div>
          )}

          {permissionStatus === "skipped" && (
            <button className="continue-button" onClick={handleContinue}>
              Continuar
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default LocationPermissionPage;
