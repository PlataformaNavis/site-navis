import { useState, useEffect } from "react";
import authService from "../services/authService";
import "./UserProfilePage.css";

const UserProfilePage = ({ onAvatarChange }) => {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    emergencyPhone: "",
    sosMessage: "",
    bio: "",
    avatar: null,
  });

  // 🔹 Carrega dados do usuário e imagem salva
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (authService.checkAuth()) {
        const currentUser = authService.getCurrentUser() || {};
        const savedPhoto = localStorage.getItem("navis_user_photo");
        const savedUserData = JSON.parse(
          localStorage.getItem("navis_current_user") || "{}"
        );

        const mergedData = {
          name: savedUserData.name || currentUser.name || "Usuário NAVIS",
          email: savedUserData.email || currentUser.email || "user@navis.com",
          phone: savedUserData.phone || currentUser.phone || "",
          cpf: savedUserData.cpf || currentUser.cpf || "",
          emergencyPhone: savedUserData.emergencyPhone || "",
          sosMessage:
            savedUserData.sosMessage ||
            "Preciso de ajuda! Aqui está minha localização.",
          bio: savedUserData.bio || currentUser.bio || "",
          avatar: savedPhoto || currentUser.avatar || null,
        };

        setUser(currentUser);
        setFormData(mergedData);
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // 🔹 Atualiza inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Upload de imagem
  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const maxMB = 3;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Imagem muito grande. Tente um arquivo menor que ${maxMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setFormData((prev) => ({ ...prev, avatar: base64Image }));
      localStorage.setItem("navis_user_photo", base64Image);

      if (onAvatarChange) onAvatarChange(base64Image);
      setShowAvatarMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Salvar alterações
  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...formData };

    try {
      localStorage.setItem("navis_current_user", JSON.stringify(updatedUser));
      if (formData.avatar) {
        localStorage.setItem("navis_user_photo", formData.avatar);
      }
      if (authService.updateCurrentUser) {
        authService.updateCurrentUser(updatedUser);
      }

      setSuccessMessage("Atualização salva com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando Perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        {/* Cabeçalho com avatar */}
        <section className="profile-header-section">
          <div
            className="profile-avatar"
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          >
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile Avatar" />
            ) : (
              <div className="avatar-placeholder">Upload Foto</div>
            )}
          </div>

          {/* Menu de opções da foto */}
          {showAvatarMenu && (
            <div className="avatar-menu">
              <button
                onClick={() => {
                  setShowAvatarModal(true);
                  setShowAvatarMenu(false);
                }}
              >
                Visualizar foto de perfil
              </button>
              <label htmlFor="avatar-upload">Alterar foto de perfil</label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
          )}

          {/* Modal de visualização */}
          {showAvatarModal && (
            <div
              className="avatar-modal"
              onClick={() => setShowAvatarModal(false)}
            >
              <div
                className="avatar-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={formData.avatar} alt="Foto de perfil ampliada" />
                <button onClick={() => setShowAvatarModal(false)}>
                  Fechar
                </button>
              </div>
            </div>
          )}

          <div className="profile-info">
            <h1 className="profile-name">{formData.name}</h1>
            <p className="profile-email">{formData.email}</p>
          </div>
        </section>

        {/* Tabs */}
        <section className="profile-tabs">
          <div className="tab-navigation">
            <button
              className={`tab-button ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Suas Informações
            </button>
            <button
              className={`tab-button ${
                activeTab === "settings" ? "active" : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Configurações
            </button>
            <button
              className={`tab-button ${
                activeTab === "security" ? "active" : ""
              }`}
              onClick={() => setActiveTab("security")}
            >
              Segurança
            </button>
            <button
              className={`tab-button ${activeTab === "plan" ? "active" : ""}`}
              onClick={() => setActiveTab("plan")}
            >
              Plano Atual
            </button>
          </div>
        </section>

        {/* 🔹 PERFIL */}
        {activeTab === "profile" && (
          <div className="profile-container">
            <section className="profile-content">
              <div className="tab-content">
                <div className="content-header">
                  <h2 className="settings-title">Informações Pessoais</h2>
                  <img src="/info.png" alt="Informações" />
                </div>

                <form
                  className="profile-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="form-grid">
                    {/* Nome completo */}
                    <div className="form-group">
                      <label>Nome completo</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="exemplo@dominio.com"
                        required
                      />
                    </div>

                    {/* Telefone */}
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 11) val = val.slice(0, 11);
                          val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
                          val = val.replace(/(\d{5})(\d{4})$/, "$1-$2");
                          setFormData((prev) => ({ ...prev, phone: val }));
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        required
                      />
                    </div>

                    {/* CPF */}
                    <div className="form-group">
                      <label>CPF</label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 11) val = val.slice(0, 11);
                          val = val.replace(/(\d{3})(\d)/, "$1.$2");
                          val = val.replace(/(\d{3})(\d)/, "$1.$2");
                          val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                          setFormData((prev) => ({ ...prev, cpf: val }));
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>

                    {/* Contato de Emergência */}
                    <div className="form-group">
                      <label>Contato de Emergência</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 11) val = val.slice(0, 11);
                          val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
                          val = val.replace(/(\d{5})(\d{4})$/, "$1-$2");
                          setFormData((prev) => ({
                            ...prev,
                            emergencyPhone: val,
                          }));
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        required
                      />
                    </div>

                    {/* Frase SOS */}
                    <div className="form-group">
                      <label>Frase para SOS</label>
                      <input
                        type="text"
                        name="sosMessage"
                        value={formData.sosMessage}
                        onChange={handleInputChange}
                        placeholder="Preciso de ajuda! Aqui está minha localização."
                        required
                      />
                    </div>
                  </div>

                  {successMessage && (
                    <div className="success-message">{successMessage}</div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleSaveProfile}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => window.location.reload()}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* CONFIGURAÇÕES */}
        {activeTab === "settings" && (
          <div className="profile-container settings-container">
            <h2 className="settings-title">Configurações da Conta</h2>
            <p className="settings-subtitle">
              Gerencie suas preferências e notificações. <br />
              <img src="/maintenance.png" alt="" />
            </p>
            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-text">
                  <h3>Notificações por Email</h3>
                  <p>Receba atualizações sobre sua conta e atividades.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-text">
                  <h3>Visibilidade do Perfil</h3>
                  <p>Torne seu perfil visível para outros usuários.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-text">
                  <h3>Alerta Navegantes</h3>
                  <p>Receber notificações da comunidade Navegantes.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="logout-section">
              <button
                className="logout-button"
                onClick={() => {
                  authService.logout();
                  window.location.href = "/";
                }}
              >
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {/* SEGURANÇA */}
        {activeTab === "security" && (
          <div className="profile-container security-container">
            <section className="security-content">
              <h2 className="settings-title">Configurações da Segurança</h2>
              <p>
                Sua segurança e privacidade são a nossa prioridade. <br />
                <img src="/social-security.png" alt="" />
              </p>
              <div className="security-sections">
                <div className="security-section">
                  <div className="security-item">
                    <div className="setting-text">
                      <h3>Senha</h3>
                      <p>Atualize sua senha para manter sua conta segura.</p>
                    </div>
                    <button className="security-button">Alterar senha</button>
                  </div>
                </div>
                <div className="security-section">
                  <div className="security-item">
                    <div className="setting-text">
                      <h3>Autenticação de dois fatores</h3>
                      <p>Adicione uma camada extra de segurança à sua conta.</p>
                    </div>
                    <button className="security-button">Ativar</button>
                  </div>
                </div>
                <div className="security-section">
                  <div className="security-item">
                    <div className="setting-text">
                      <h3>Remover aplicativos conectados</h3>
                      <p>
                        Remova dispositivos onde sua conta estiver conectada.
                      </p>
                    </div>
                    <button className="security-button-2">Remover</button>
                  </div>
                </div>
                <div className="mensagem-terms">
                  <p className="terms-message">
                    A Navis é um espaço seguro e inclusivo para todas as
                    pessoas.
                    <br />
                    Seus dados são criptografados e nunca compartilhados.
                  </p>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    TERMOS DE PRIVACIDADE
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PLANO ATUAL */}
        {activeTab === "plan" && (
          <div className="profile-container plan-container">
            <section className="plan-content">
              <h2 className="settings-title">
                Plano Atual <br />
                <img src="/roi.png" alt="" />
              </h2>

              <div className="plan-card">
                <h3>
                  Horizon <br />
                  <img className="plan-logo" src="/2.png" alt="" />
                </h3>

                <ul className="plan-benefits">
                  <li>Acesso ao mapa e rotas;</li>
                  <li>
                    Visualização em tempo real de trajetos e pontos de
                    interesse;
                  </li>
                  <li>Rotas ilimitadas salvas;</li>
                  <li>
                    Painel analítico com relatórios semanais e aprendizado do
                    Navy;
                  </li>
                  <li>Sem anúncios;</li>

                  <li>Comunidade Navis (acesso completo)</li>
                </ul>
                <p className="plan-price">R$ 29,90</p>
              </div>

              <div className="plan-footer">
                <button
                  className="upgrade-button-2"
                  onClick={() => alert("Em breve: Planos Navis Pro e Plus!")}
                >
                  Ver outros planos
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
