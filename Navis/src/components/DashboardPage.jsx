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

//  Recentrar mapa ao mudar coordenadas
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
  const [routeInfo, setRouteInfo] = useState(null);
  const [map, setMap] = useState(null);
  const [routing, setRouting] = useState(null);

  //  Carregar dados do usuário autenticado
  useEffect(() => {
    const isAuth = authService.checkAuth();
    if (isAuth) setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

  //  Obter localização atual do usuário
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

  //  Calcular rota entre origem e destino
  const calculateRoute = useCallback(() => {
    if (!originAddress || !destinationAddress) {
      alert("Por favor, preencha origem e destino.");
      return;
    }

    const parseCoords = (str) => str.split(",").map(Number);
    const [lat1, lng1] = parseCoords(originAddress);
    const [lat2, lng2] = parseCoords(destinationAddress);

    if (!map) return;

    // Remove rota anterior, se existir
    if (routing) routing.remove();

    const control = L.Routing.control({
      waypoints: [L.latLng(lat1, lng1), L.latLng(lat2, lng2)],
      lineOptions: { styles: [{ color: "#8b5cf6", weight: 6 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: (i, wp) =>
        L.marker(wp.latLng, { icon: i === 0 ? originIcon : destinationIcon }),
    }).addTo(map);

    setRouting(control);
    setRouteInfo({ origin: originAddress, destination: destinationAddress });
  }, [originAddress, destinationAddress, map, routing]);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="dashboard-page">
      <div className="route-inputs">
        <h2>Informações da Rota</h2>
        <input
          type="text"
          placeholder="Local de Partida"
          value={originAddress}
          onChange={(e) => setOriginAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destino"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />

        <div className="buttons">
          <button className="btn-primary" onClick={calculateRoute}>
            Calcular Rota
          </button>
          <button className="btn-secondary" onClick={getCurrentPosition}>
            Usar Localização Atual
          </button>
        </div>
      </div>

      <MapContainer
        center={currentLocation || [-23.5505, -46.6333]}
        zoom={13}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={originIcon}
          />
        )}
        {currentLocation && (
          <RecenterMap lat={currentLocation.lat} lng={currentLocation.lng} />
        )}
      </MapContainer>
    </div>
  );
};

export default DashboardPage;
