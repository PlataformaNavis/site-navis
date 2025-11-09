import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./NavyPage.css";

function NavyPage({ onNavigateToDashboard }) {
  const [data, setData] = useState({
    user: null,
    routes: 0,
    saved: 0,
    usage: [],
    aiLearning: 50,
    preferredTime: ["08:00"],
    routeSecurity: "Alta",
    recentRoutes: [],
    dropdownOpen: false,
  });

  // Carrega dados do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("navis_current_user");
    const storedData = localStorage.getItem("navis_dashboard_data");
    const savedRoutes = JSON.parse(
      localStorage.getItem("saved_routes") || "[]"
    );

    let parsedData = storedData ? JSON.parse(storedData) : {};

    setData({
      user: storedUser ? JSON.parse(storedUser).name : parsedData.user || null,
      routes: parsedData.routes || 0,
      saved: savedRoutes.length,
      usage: parsedData.usage || [],
      aiLearning: parsedData.aiLearning || 50,
      preferredTime: Array.isArray(parsedData.preferredTime)
        ? parsedData.preferredTime
        : [parsedData.preferredTime || "08:00"],
      routeSecurity: parsedData.routeSecurity || "Alta",
      recentRoutes: savedRoutes.length
        ? savedRoutes
        : parsedData.recentRoutes || [],
      dropdownOpen: false,
    });
  }, []);

  // Função para salvar dados
  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem("navis_dashboard_data", JSON.stringify(newData));
    localStorage.setItem("saved_routes", JSON.stringify(newData.recentRoutes));
  };

  // Atualiza aprendizado da IA
  useEffect(() => {
    const totalActions = data.saved + (data.recentRoutes?.length || 0);
    const newAiLearning = Math.min(50 + totalActions * 2, 100);
    if (newAiLearning !== data.aiLearning) {
      saveData({ ...data, aiLearning: newAiLearning });
    }
  }, [data.saved, data.recentRoutes]);

  // Manipuladores de rota
  const handleSelectRoute = (route) => {
    localStorage.setItem("selected_route", JSON.stringify(route));
    if (onNavigateToDashboard) onNavigateToDashboard();
  };

  const handleDeleteRoute = (id) => {
    const updatedRoutes = data.recentRoutes.filter((r) => r.id !== id);
    saveData({
      ...data,
      recentRoutes: updatedRoutes,
      saved: updatedRoutes.length,
    });
  };

  const handleEditRoute = (id) => {
    const newName = prompt("Digite o novo nome da rota:");
    if (newName && newName.trim() !== "") {
      const updatedRoutes = data.recentRoutes.map((r) =>
        r.id === id ? { ...r, name: newName.trim() } : r
      );
      saveData({ ...data, recentRoutes: updatedRoutes });
    }
  };

  // Dados gráficos
  const weeklyUsage = data.usage.length
    ? data.usage
    : [
        { day: "Seg", value: 0 },
        { day: "Ter", value: 0 },
        { day: "Qua", value: 0 },
        { day: "Qui", value: 0 },
        { day: "Sex", value: 0 },
        { day: "Sáb", value: 0 },
        { day: "Dom", value: 0 },
      ];

  const aiData = [{ value: data.aiLearning, fill: "#1325b4" }];
  const securityLevels = [
    "Baixa Segurança",
    "Média Segurança",
    "Alta Segurança",
    "Máxima Segurança",
  ];
  const sortedLevels = [
    data.routeSecurity,
    ...securityLevels.filter((level) => level !== data.routeSecurity),
  ];

  const saudacao = data.user ? (
    <>
      Olá, <strong>{data.user}</strong>! 👋 <br />
      Aqui você acompanha seu progresso, rotas salvas e preferências.
    </>
  ) : (
    <>
      Olá! 👋 <br />
      Aqui você acompanha seu progresso, rotas salvas e preferências.
    </>
  );

  return (
    <div className="container">
      <header className="dashboard-header">
        <div className="navy-speech">
          <img src="/Navy.png" alt="Navy" className="navy-avatar" />
          <div className="navy-bubble">
            <p>{saudacao}</p>
          </div>
        </div>
      </header>

      <main>
        {/* Estatísticas rápidas */}
        <section className="stats-section">
          <div className="card">
            Rotas salvas: <br />
            <br /> {data.saved}
          </div>
          <div className="card">
            Nível de segurança:
            <div className="dropdown">
              <div
                className="dropdown-selected"
                onClick={() =>
                  saveData({ ...data, dropdownOpen: !data.dropdownOpen })
                }
              >
                {data.routeSecurity || "Selecione"}
                <span className={`arrow ${data.dropdownOpen ? "open" : ""}`}>
                  ▼
                </span>
              </div>
              {data.dropdownOpen && (
                <div className="dropdown-options">
                  {sortedLevels.map((level) => (
                    <div
                      key={level}
                      className="dropdown-option"
                      onClick={() =>
                        saveData({
                          ...data,
                          routeSecurity: level,
                          dropdownOpen: false,
                        })
                      }
                    >
                      {level}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preferências */}
        <section className="preferences-section">
          <div className="preferences-container">
            <h3>Horários preferidos</h3>
            {data.preferredTime.map((time, index) => (
              <div key={index} className="time-input-wrapper">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimes = [...data.preferredTime];
                    newTimes[index] = e.target.value;
                    saveData({ ...data, preferredTime: newTimes });
                  }}
                  className="time-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTimes = data.preferredTime.filter(
                      (_, i) => i !== index
                    );
                    saveData({ ...data, preferredTime: newTimes });
                  }}
                  className="btn-delete"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-time"
              onClick={() =>
                saveData({
                  ...data,
                  preferredTime: [...data.preferredTime, "08:00"],
                })
              }
            >
              Adicionar horário
            </button>
          </div>
        </section>

        {/* Gráficos */}
        <section className="charts-section">
          {/* Gráfico uso semanal */}
          <div className="chart-container">
            <h3>Uso semanal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1325b4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {data.usage.length === 0 && (
              <p className="placeholder-chart">Nenhum uso registrado ainda</p>
            )}
          </div>

          {/* Gráfico aprendizado IA */}
          <div className="chart-container">
            <h3>Aprendizado da IA</h3>
            <div className="ai-learning-chart">
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={aiData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="ai-learning-label">
                Nível de aprendizado: <strong>{data.aiLearning}%</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Rotas salvas */}
        <section className="routes-section">
          <h3>Rotas salvas</h3>
          {data.recentRoutes.length > 0 ? (
            <ul className="routes-list">
              {data.recentRoutes.map((route, index) => (
                <li
                  key={route.id || index}
                  className="route-item"
                  onClick={() => handleSelectRoute(route)}
                >
                  <span>
                    <strong>{route.name || "Rota sem nome"}</strong> —{" "}
                    {route.date || "Data não informada"}
                  </span>
                  <div className="route-actions">
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRoute(route.id);
                      }}
                    >
                      <img src="/edit (2).png" alt="" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoute(route.id);
                      }}
                    >
                      <img src="/delete (2).png" alt="" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">Nenhuma rota registrada ainda</p>
          )}
        </section>

        <div className="btn-simulate-container">
          <button className="btn-simulate" onClick={onNavigateToDashboard}>
            Nova rota
          </button>
        </div>
      </main>
    </div>
  );
}

export default NavyPage;
