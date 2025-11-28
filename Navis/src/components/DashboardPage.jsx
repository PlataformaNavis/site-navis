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

const customFormatter = new L.Routing.Formatter({
  language: "pt",
  units: "metric",
  instructionTemplate: (instruction) => {
    const type = instruction.type;
    const distance = instruction.distance
      ? ` em ${Math.round(instruction.distance)} m`
      : "";
    switch (type) {
      case "Straight":
        return `Siga em frente${distance}`;
      case "SlightRight":
        return `Vire ligeiramente à direita${distance}`;
      case "Right":
        return `Vire à direita${distance}`;
      case "SharpRight":
        return `Vire fortemente à direita${distance}`;
      case "TurnAround":
        return `Dê meia-volta${distance}`;
      case "SharpLeft":
        return `Vire fortemente à esquerda${distance}`;
      case "Left":
        return `Vire à esquerda${distance}`;
      case "SlightLeft":
        return `Vire ligeiramente à esquerda${distance}`;
      case "WaypointReached":
        return "Destino alcançado";
      case "Roundabout":
        return `Entre na rotatória${distance}`;
      case "DestinationReached":
        return "Você chegou ao destino";
      default:
        return instruction.text || "Continue";
    }
  },
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

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
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showViolenceIndex, setShowViolenceIndex] = useState(false);
  const sosTimeout = useRef(null);
  const searchContainerRef = useRef(null);
  const violenceLayerRef = useRef(null);

  // Fecha botões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowActionButtons(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Mapa de zonas de violência predefinidas
  const violenceZones = [
    // 🔴 Áreas com alto risco
    { lat: -23.5412, lng: -46.6386, level: "high", name: "Luz" },
    { lat: -23.5519, lng: -46.6412, level: "high", name: "Cracolândia" },

    // 🟡 Áreas com risco moderado
    { lat: -23.557, lng: -46.6539, level: "moderate", name: "Santa Ifigênia" },
    { lat: -23.5591, lng: -46.634, level: "moderate", name: "Anhangabaú" },

    // 🟢 Áreas com baixo risco
    { lat: -23.55052, lng: -46.633308, level: "low", name: "Centro" },
    { lat: -23.556, lng: -46.626, level: "low", name: "Praça da Sé" },
    { lat: -23.5585, lng: -46.635, level: "low", name: "República" },
  ];

  const getViolenceLevelAtLocation = (lat, lng) => {
    const toRad = (v) => (v * Math.PI) / 180;

    const haversineMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const levelPriority = { high: 3, moderate: 2, low: 1 };
    let result = { level: "low", name: "Área Geral" };
    const dangerRadius = 1000; // 1km

    violenceZones.forEach((zone) => {
      const distance = haversineMeters(lat, lng, zone.lat, zone.lng);
      if (distance <= dangerRadius) {
        if (levelPriority[zone.level] > levelPriority[result.level]) {
          result = zone;
        }
      }
    });

    return result;
  };

  const getColorByViolenceLevel = (level) => {
    const colors = {
      low: "#22c55e", // Verde
      moderate: "#eab308", // Amarelo
      high: "#ef4444", // Vermelho
    };
    return colors[level] || "#cccccc";
  };

  // --- NOVO: desenha todas as zonas cadastradas (global) ---
  const drawViolenceZones = useCallback(() => {
    if (!map) return;

    // remove camada anterior
    if (violenceLayerRef.current) {
      map.removeLayer(violenceLayerRef.current);
      violenceLayerRef.current = null;
    }

    try {
      const layerGroup = L.layerGroup();

      violenceZones.forEach((zone) => {
        const color = getColorByViolenceLevel(zone.level);

        const circle = L.circle([zone.lat, zone.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 1,
          opacity: 0.7,
          radius: 600,
        });

        const levelText =
          zone.level === "low"
            ? "Baixo (Seguro)"
            : zone.level === "moderate"
            ? "Moderado"
            : "Alto (Risco)";

        circle.bindPopup(
          `<div style="font-family: Poppins; font-size: 13px;"><strong>${zone.name}</strong><br/>Nível: <strong>${levelText}</strong></div>`
        );

        layerGroup.addLayer(circle);
      });

      layerGroup.addTo(map);
      violenceLayerRef.current = layerGroup;
      console.log("🛡️ Camada global de violência desenhada");
    } catch (err) {
      console.error("Erro ao desenhar zonas de violência:", err);
    }
  }, [map, violenceZones]);

  // A camada de índice de violência será desenhada como círculos ao longo da rota
  const drawViolenceCircleAlongRoute = useCallback(
    (routingControl) => {
      if (!map || !routingControl) {
        console.warn("Mapa ou rota não disponível");
        return;
      }

      // Remove círculos anteriores
      if (violenceLayerRef.current) {
        map.removeLayer(violenceLayerRef.current);
        violenceLayerRef.current = null;
      }

      try {
        // Tenta obter coordenadas da rota (plugins diferentes expõem em lugares diferentes)
        const routes =
          routingControl.getRoutes?.() || routingControl._routes || [];
        if (!routes || routes.length === 0 || !routes[0].coordinates) {
          console.warn("Não foi possível obter as coordenadas da rota");
          return;
        }

        const coords = routes[0].coordinates;

        // Cria um layerGroup para agrupar os círculos
        const layerGroup = L.layerGroup();

        // Determina passo para não gerar círculos demais (máx ~12 círculos)
        const maxDots = 12;
        const step = Math.max(1, Math.floor(coords.length / maxDots));

        for (let i = 0; i < coords.length; i += step) {
          const pt = coords[i];
          const lat = pt.lat !== undefined ? pt.lat : pt[1];
          const lng = pt.lng !== undefined ? pt.lng : pt[0];
          if (lat == null || lng == null) continue;

          const violenceData = getViolenceLevelAtLocation(lat, lng);
          const color = getColorByViolenceLevel(violenceData.level);

          try {
            console.debug("Violence point:", {
              lat,
              lng,
              level: violenceData.level,
              zone: violenceData.name,
            });
          } catch (e) {
            console.debug("Violence debug error", e);
          }

          const radiusMeters = 500; // círculo parcial ao longo da rota

          const circle = L.circle([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.35,
            weight: 1,
            opacity: 0.7,
            radius: radiusMeters,
          });

          circle.bindPopup(
            `<div style="font-family: Poppins; font-size: 13px;"><strong>Análise de Segurança</strong><br/>Nível: <strong>${
              violenceData.level === "low"
                ? "Baixo (Seguro)"
                : violenceData.level === "moderate"
                ? "Moderado"
                : "Alto (Risco)"
            }</strong><br/>Zona: ${violenceData.name}</div>`
          );

          layerGroup.addLayer(circle);
        }

        layerGroup.addTo(map);
        violenceLayerRef.current = layerGroup;
        console.log(
          "✅ Camada de índice de violência ao longo da rota desenhada!"
        );
      } catch (error) {
        console.error("❌ Erro ao desenhar círculo de violência:", error);
      }
    },
    [map]
  );

  // Desenha a camada de índice de violência a partir de um array de coordenadas
  const drawViolenceAlongCoords = useCallback(
    (coords) => {
      if (!map || !coords || coords.length === 0) return;

      // Remove camada anterior
      if (violenceLayerRef.current) {
        map.removeLayer(violenceLayerRef.current);
        violenceLayerRef.current = null;
      }

      try {
        const layerGroup = L.layerGroup();
        const maxDots = 12;
        const step = Math.max(1, Math.floor(coords.length / maxDots));

        for (let i = 0; i < coords.length; i += step) {
          const pt = coords[i];
          const lat = pt.lat !== undefined ? pt.lat : pt[1];
          const lng = pt.lng !== undefined ? pt.lng : pt[0];
          if (lat == null || lng == null) continue;

          const violenceData = getViolenceLevelAtLocation(lat, lng);
          const color = getColorByViolenceLevel(violenceData.level);
          try {
            console.debug("Violence point:", {
              lat,
              lng,
              level: violenceData.level,
              zone: violenceData.name,
            });
          } catch (e) {
            console.debug("Violence debug error", e);
          }

          const circle = L.circle([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.35,
            weight: 1,
            opacity: 0.7,
            radius: 500,
          });

          const levelText =
            violenceData.level === "low"
              ? "Baixo (Seguro)"
              : violenceData.level === "moderate"
              ? "Moderado"
              : "Alto (Risco)";

          circle.bindPopup(
            `<div style="font-family: Poppins; font-size: 13px;"><strong>Análise de Segurança</strong><br/>Nível: <strong>${levelText}</strong><br/>Zona: ${violenceData.name}</div>`
          );

          layerGroup.addLayer(circle);
        }

        layerGroup.addTo(map);
        violenceLayerRef.current = layerGroup;
        // resumo: contagem por nível
        try {
          const counts = { low: 0, moderate: 0, high: 0 };
          layerGroup.eachLayer((lyr) => {
            const c = lyr.options && lyr.options.fillColor;
            if (c === getColorByViolenceLevel("low")) counts.low += 1;
            else if (c === getColorByViolenceLevel("moderate"))
              counts.moderate += 1;
            else if (c === getColorByViolenceLevel("high")) counts.high += 1;
          });
          console.info("Resumo índice violência (pontos):", counts);
        } catch (e) {
          console.debug("Não foi possível gerar resumo de contagem", e);
        }
        console.log("✅ Camada de índice de violência (coords) desenhada");
      } catch (err) {
        console.error("Erro ao desenhar camada por coords:", err);
      }
    },
    [map]
  );

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
        language: "pt-BR",
        formatter: customFormatter,
        createMarker: (i, wp) =>
          L.marker(wp.latLng, { icon: i === 0 ? originIcon : destinationIcon }),
      }).addTo(map);
      setRouting(control);

      // Quando o roteador calcula rotas, vinculamos um listener para desenhar
      control.on("routesfound", (e) => {
        try {
          const coords =
            e.routes?.[0]?.coordinates || e.routes?.[0]?.coordinates;
          if (showViolenceIndex && coords) drawViolenceAlongCoords(coords);
        } catch (err) {
          console.warn("Erro ao obter coords no evento routesfound:", err);
        }
      });

      // Caso a rota já esteja disponível imediatamente (fallback)
      const existingRoutes = control.getRoutes?.() || control._routes || [];
      const existingCoords = existingRoutes[0]?.coordinates;
      if (showViolenceIndex && existingCoords)
        drawViolenceAlongCoords(existingCoords);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
      alert(`Erro ao calcular rota: ${error.message}`);
    }
  }, [
    originAddress,
    destinationAddress,
    map,
    routing,
    showViolenceIndex,
    drawViolenceAlongCoords,
  ]);

  const handleSaveRoute = useCallback(() => {
    if (!originAddress || !destinationAddress) {
      alert("Preencha origem e destino antes de salvar a rota!");
      return;
    }

    const savedRoutes = JSON.parse(
      localStorage.getItem("saved_routes") || "[]"
    );
    const newRoute = {
      id: Date.now(),
      origin: originAddress,
      destination: destinationAddress,
      date: new Date().toLocaleString("pt-BR"),
    };

    localStorage.setItem(
      "saved_routes",
      JSON.stringify([...savedRoutes, newRoute])
    );

    alert(" Rota salva com sucesso!");
  }, [originAddress, destinationAddress]);

  useEffect(() => {
    // Quando o usuário clica no botão de escudo
    if (showViolenceIndex && map) {
      console.log("Ativando camada de violência...");
      // desenha todas as zonas globais
      drawViolenceZones();

      // se houver rota (routing) tenta desenhar pontos ao longo da rota também
      if (routing) {
        const routes = routing.getRoutes?.() || routing._routes || [];
        const coords = routes[0]?.coordinates;
        if (coords) {
          drawViolenceAlongCoords(coords);
        } else {
          console.log(
            "Coords da rota não disponíveis imediatamente — aguardando evento routesfound..."
          );
        }
      }
    } else if (!showViolenceIndex && violenceLayerRef.current && map) {
      console.log("Desativando camada de violência...");
      map.removeLayer(violenceLayerRef.current);
      violenceLayerRef.current = null;
    }
    // adicionamos drawViolenceZones nas dependências
  }, [
    showViolenceIndex,
    routing,
    map,
    drawViolenceAlongCoords,
    drawViolenceZones,
  ]);

  useEffect(() => {
    const raw = localStorage.getItem("selected_route");
    if (!raw) return;

    try {
      const route = JSON.parse(raw);
      if (!route.origin || !route.destination) return;

      console.log("➡ Rota recebida:", route);

      setOriginAddress(route.origin);
      setDestinationAddress(route.destination);

      const waitForMap = setInterval(() => {
        if (map && mapLoaded) {
          clearInterval(waitForMap);
          console.log("🗺️ Mapa pronto — calculando rota...");
          calculateRoute();
          localStorage.removeItem("selected_route");
        }
      }, 400);
    } catch (err) {
      console.error("Erro ao processar selected_route:", err);
    }
  }, [map, mapLoaded, calculateRoute]);

  // botão sos de 3s
  const handleSosPressStart = () => {
    sosTimeout.current = setTimeout(() => {
      setShowSosButton(false);
      if (onNavigateToSOS) onNavigateToSOS();
    }, 3000);
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
              <RecenterMap
                lat={currentLocation.lat}
                lng={currentLocation.lng}
              />
            </>
          )}
        </MapContainer>

        {/* Pesquisa */}
        <div className="search-container" ref={searchContainerRef}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Ponto de partida"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              onFocus={() => {
                setShowLocationButton(true);
                setShowActionButtons(false);
              }}
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
              onFocus={() => {
                setShowActionButtons(true);
                setShowLocationButton(false);
              }}
            />
          </div>

          {showActionButtons && (
            <div className="button-group">
              <button
                onClick={calculateRoute}
                className="calculate-btn"
                disabled={!mapLoaded}
              >
                Calcular Rota
              </button>

              <button
                onClick={handleSaveRoute}
                className="save-btn"
                disabled={!destinationAddress}
              >
                Salvar Rota
              </button>

              <button
                onClick={clearRoute}
                className="clear-btn"
                disabled={!routing}
              >
                Limpar Rota
              </button>
            </div>
          )}

          {showViolenceIndex && (
            <div className="violence-legend">
              <h4> Índice de Violência</h4>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#22c55e" }}
                ></div>
                <span>Baixo índice (mais seguro)</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#eab308" }}
                ></div>
                <span>Índice moderado</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#ef4444" }}
                ></div>
                <span>Alto índice (maior risco)</span>
              </div>
            </div>
          )}
        </div>

        {/* Barra inferior - SOS */}
        <div className="bottom-bar">
          <button
            className={`icon-btn violence-index ${
              showViolenceIndex ? "active" : ""
            }`}
            onClick={() => setShowViolenceIndex(!showViolenceIndex)}
            title="Alternar Índice de Violência"
          >
            🛡️
          </button>

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