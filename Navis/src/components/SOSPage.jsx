import React, { useState, useRef } from "react";
import "./SOSPage.css";

function SOSPage() {
  const [sosStatus, setSosStatus] = useState("ready");
  const pressTimer = useRef(null);

  // Navegação para Home
  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  // Voltar para a primeira aba dentro do mesmo componente
  const goBackToReady = () => {
    setSosStatus("ready");
  };

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setSosStatus("sent");
    }, 2000);
  };

  const handlePressEnd = () => clearTimeout(pressTimer.current);

  const handleCancelSOS = () => {
    setSosStatus("canceled");
    setTimeout(() => setSosStatus("ready"), 3000);
  };

  return (
    <div className={`sos-page ${sosStatus}`}>
      {/* Cabeçalho */}
      <header className="sos-header">
        <div className="sos-logo">
          <img src="/location (3).png" alt="" /> Navis SOS
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="sos-content">
        {/* Primeira aba: ready */}
        {sosStatus === "ready" && (
          <div className="sos-state">
            <div className="sos-warning-box">
              <p>
                Ao manter o botão de emergência pressionado, sua localização e
                um recado de SOS serão enviados ao seu contato de emergência
                cadastrado.
              </p>
              <p>
                Utilize este recurso apenas em situações de risco. A Navis
                respeita sua privacidade e envia os dados exclusivamente para
                sua proteção.
              </p>
            </div>

            <div className="sos-button-container">
              <p className="hold-text">Segure para enviar um SOS</p>
              <button
                className="sos-button"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
              >
                <img src="/alarm (1).png" alt="SOS" className="sos-icon" />
              </button>
            </div>

            {/* Botão Voltar para Home */}
            <div className="navigation-buttons">
              <button onClick={goToDashboard}>Voltar para Home</button>
            </div>
          </div>
        )}

        {/* Segunda aba: sent */}
        {sosStatus === "sent" && (
          <div className="sos-state">
            <div className="sos-message success">
              <h3>SOS enviado com sucesso!</h3>
              <p>
                <br />
                Sua localização e mensagem de ajuda foram enviados ao seu
                contato de emergência. Fique em segurança enquanto a ajuda
                chega.
              </p>
            </div>

            <div className="sos-cancel-box">
              <p>
                Se foi por engano, clique no botão abaixo para cancelar o envio
                de ajuda.
              </p>
              <button className="sos-cancel-btn" onClick={handleCancelSOS}>
                Cancelar SOS
              </button>
            </div>

            {/* Botão voltar para a primeira aba */}
            <div className="navigation-buttons">
              <button onClick={goBackToReady}>
                Voltar para a página anterior
              </button>
            </div>
          </div>
        )}

        {/* Aba cancelada */}
        {sosStatus === "canceled" && (
          <div className="sos-state">
            <div className="sos-message canceled">
              <h3 className="h3">SOS cancelado</h3>
              <p>
                Seu pedido de ajuda foi cancelado com sucesso. <br /> <br />
                Lembre-se: o botão de emergência é um recurso criado para
                proteger você em momentos de risco real. Use-o sempre que sentir
                que sua segurança está em perigo — nós estaremos prontos para
                agir e garantir que você receba o suporte necessário. <br /> <br />
                Cuide-se e mantenha-se em segurança. 💙
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SOSPage;
