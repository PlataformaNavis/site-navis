import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import authService from "../services/authService";
import "./DashboardPage.css";

// Ícones personalizados
const originIcon = new L.DivIcon({
  className: "custom-marker origin-marker",
  html: `<div class="marker-circle origin"></div>`,
  iconSize: [30, 30],
});

const destinationIcon = new L.DivIcon({
  className: "custom-marker destination-marker",
  html: `<div class="marker-circle destination"></div>`,
  iconSize: [30, 30],
});

// Recentraliza mapa
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

// Captura instância do mapa
function MapHandler({ onMapReady }) {
  const mapInstance = useMap();
  useEffect(() => {
    if (mapInstance && onMapReady) onMapReady(mapInstance);
  }, [mapInstance, onMapReady]);
  return null;
}

const DashboardPage = ({ onNavigateToSOS }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [map, setMap] = useState(null);
  const [routing, setRouting] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);
  const [showSosButton, setShowSosButton] = useState(true);

  const sosTimeout = useRef(null); // Ref para controlar timeout do SOS

  useEffect(() => {
    const isAuth = authService.checkAuth();
    if (isAuth) setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (map && !mapLoaded) {
      const checkMapReady = () => {
        if (map._loaded) setMapLoaded(true);
        else setTimeout(checkMapReady, 500);
      };
      checkMapReady();
    }
  }, [map, mapLoaded]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        setCurrentLocation(position);
        setOriginAddress(`${coords.latitude},${coords.longitude}`);
      },
      (err) => alert(`Erro ao obter localização: ${err.message}`)
    );
  }, []);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        throw new Error("Endereço não encontrado");
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error);
      return null;
    }
  };

  const handleMapReady = useCallback((mapInstance) => {
    setMap(mapInstance);
    setMapLoaded(true);
  }, []);

  const clearRoute = useCallback(() => {
    if (routing) {
      routing.remove();
      setRouting(null);
    }
  }, [routing]);

  const calculateRoute = useCallback(async () => {
    if (!originAddress || !destinationAddress) {
      alert("Por favor, preencha origem e destino.");
      return;
    }

    if (!map || typeof map.getSize !== "function") {
      alert("Mapa ainda não carregado. Aguarde e tente novamente.");
      return;
    }

    let originCoords, destCoords;

    try {
      if (
        originAddress.includes(",") &&
        !isNaN(originAddress.split(",")[0].trim())
      ) {
        const [lat, lng] = originAddress.split(",").map(Number);
        originCoords = { lat, lng };
      } else {
        originCoords = await geocodeAddress(originAddress);
      }

      if (
        destinationAddress.includes(",") &&
        !isNaN(destinationAddress.split(",")[0].trim())
      ) {
        const [lat, lng] = destinationAddress.split(",").map(Number);
        destCoords = { lat, lng };
      } else {
        destCoords = await geocodeAddress(destinationAddress);
      }

      if (!originCoords || !destCoords)
        throw new Error("Coordenadas inválidas");

      if (routing) routing.remove();

      const control = L.Routing.control({
        waypoints: [
          L.latLng(originCoords.lat, originCoords.lng),
          L.latLng(destCoords.lat, destCoords.lng),
        ],
        lineOptions: { styles: [{ color: "#00c3ff", weight: 6 }] },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: (i, wp) =>
          L.marker(wp.latLng, { icon: i === 0 ? originIcon : destinationIcon }),
      }).addTo(map);

      setRouting(control);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
      alert(`Erro ao calcular rota: ${error.message}`);
    }
  }, [originAddress, destinationAddress, map, routing]);

  // ==== BOTÃO SOS COM HOLD 3 SEGUNDOS ====
  const handleSosPressStart = () => {
    sosTimeout.current = setTimeout(() => {
      setShowSosButton(false);
      if (onNavigateToSOS) onNavigateToSOS();
    }, 3000); // 3 segundos
  };

  const handleSosPressEnd = () => {
    clearTimeout(sosTimeout.current);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <MapContainer
          center={currentLocation || [-23.5505, -46.6333]}
          zoom={15}
          className="map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapHandler onMapReady={handleMapReady} />
          {currentLocation && (
            <>
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={originIcon}
              />
              <RecenterMap lat={currentLocation.lat} lng={currentLocation.lng} />
            </>
          )}
        </MapContainer>

        {/* Pesquisa */}
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Ponto de partida"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              onFocus={() => setShowLocationButton(true)}
            />

            {showLocationButton && (
              <button
                className="use-location-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={getCurrentPosition}
              >
                📍 Usar sua localização atual
              </button>
            )}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              onFocus={() => setShowLocationButton(false)}
            />
          </div>

          <div className="button-group">
            <button
              onClick={calculateRoute}
              className="calculate-btn"
              disabled={!mapLoaded}
            >
              Calcular Rota
            </button>

            <button onClick={clearRoute} className="clear-btn" disabled={!routing}>
              Limpar Rota
            </button>
          </div>
        </div>

        {/* Barra inferior - SOS */}
        <div className="bottom-bar">
          {showSosButton && (
            <button
              className="icon-btn alerta"
              onMouseDown={handleSosPressStart}
              onMouseUp={handleSosPressEnd}
              onMouseLeave={handleSosPressEnd}
            >
            <img className="button-sos" src="/alarm (1).png" alt="" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;