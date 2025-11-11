import React from "react";
import "./PlansPage.css";

const plans = [
  {
    name: "Start",
    image: "/1.png",
    subtitle: "O começo da sua direção.",
    features: [
      "Acesso ao mapa e rotas;",
      "Visualização em tempo real de trajetos e pontos de interesse;",
      "Limite de 3 rotas salvas;",
      "Anúncio (tipo banner);",
      "Comunidade Navis (acesso básico);",
      "Valor: ",
      "Gratuito",
    ],
    button: "Continuar com o Start",
  },
  {
    name: "Horizon",
    image: "/2.png",
    subtitle: "O futuro da sua rota.",
    features: [
      "Recursos do plano Start;",
      "Painel analítico com relatórios de semanais e aprendizado do Navy;",
      "Rotas ilimitadas salvas;",
      "Sem anúncios;",
      "Comunidade Navis (acesso completo);",
      "Valor: ",
      "R$ 24,90",
    ],
    button: "Assinar Plano Horizon",
  },
  {
    name: "Atlas",
    image: "/3.png",
    subtitle: "Mais dados, rumo certo.",
    features: [
      "Recursos do plano Horizon;",
      "Personalização White Label da identidade da empresa;",
      "Criação e gestão de rotas turísticas e pontos de interesse customizados;",
      "Monitoramento de frota e comunicação direta com clientes (notificações, chat);",
      "Valor: ",
      "À combinar",
    ],
    button: "Assinar Plano Atlas",
  },
];

export default function PlansPage() {
  // Função para detectar palavras que devem ter destaque
  const isHighlight = (feature) => {
    const lower = feature.toLowerCase();
    return (
      lower.includes("gratuito") ||
      lower.includes("r$") ||
      lower.includes("à combinar") ||
      lower.includes("a combinar")
    );
  };

  return (
    <div className="plans-page">
      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.name.toLowerCase().replace(" ", "-")}`}
          >
            <img src={plan.image} alt={plan.name} className="plan-image" />
            <h2 className="plan-name">{plan.name}</h2>
            <p className="plan-subtitle">{plan.subtitle}</p>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className={isHighlight(feature) ? "highlight" : ""}
                >
                  {feature}
                </li>
              ))}
            </ul>

            <button className="plan-button">{plan.button}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
