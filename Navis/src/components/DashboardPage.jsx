import { useState, useEffect, useCallback } from "react";
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

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [map, setMap] = useState(null);
  const [routing, setRouting] = useState(null);

  useEffect(() => {
    const isAuth = authService.checkAuth();
    if (isAuth) setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

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

  const calculateRoute = useCallback(() => {
    if (!originAddress || !destinationAddress) {
      alert("Por favor, preencha origem e destino.");
      return;
    }

    const parseCoords = (str) => str.split(",").map(Number);
    const [lat1, lng1] = parseCoords(originAddress);
    const [lat2, lng2] = parseCoords(destinationAddress);

    if (!map) return;

    if (routing) routing.remove();

    const control = L.Routing.control({
      waypoints: [L.latLng(lat1, lng1), L.latLng(lat2, lng2)],
      lineOptions: { styles: [{ color: "#00c3ff", weight: 6 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: (i, wp) =>
        L.marker(wp.latLng, { icon: i === 0 ? originIcon : destinationIcon }),
    }).addTo(map);

    setRouting(control);
  }, [originAddress, destinationAddress, map, routing]);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Mapa */}
        <MapContainer
          center={currentLocation || [-23.5505, -46.6333]}
          zoom={15}
          whenCreated={setMap}
          className="map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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

        {/* Inputs */}
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Ponto de partida"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
            />
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Alertas */}
        <div className="alerts">
          <div className="alert-card obra">
            🚧 Obra na Av. Principal – Iluminação reduzida.
          </div>
          <div className="alert-card evento">
            🎉 Evento no Senac Lapa Tito até 19h
          </div>
        </div>

        {/* Rotas Sugeridas */}
        <div className="routes-card">
          <h3>Rotas Sugeridas</h3>
          <div className="route-item segura">
            <div className="left">
              <p className="title">Rota Segura 🔒</p>
              <span>95% · 27 min · 8,1 km</span>
            </div>
            <p className="tag">Monitorada</p>
          </div>
          <div className="route-item rapida">
            <div className="left">
              <p className="title">Rota Rápida ⚡</p>
              <span>78% · 18 min · 8,3 km</span>
            </div>
            <p className="tag">Iluminação moderada</p>
          </div>
          <div className="route-item alternativa">
            <div className="left">
              <p className="title">Rota Alternativa 🛣️</p>
              <span>88% · 19 min · 8,1 km</span>
            </div>
            <p className="tag">Bem iluminada</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="bottom-bar">
          <button className="icon-btn">🏠</button>
          <button className="icon-btn alerta">🚨</button>
          <button className="icon-btn">⚙️</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
