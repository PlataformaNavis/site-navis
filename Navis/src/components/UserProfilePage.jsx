import { useState, useEffect } from "react";
import authService from "../services/authService";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    bio: "",
    avatar: null, // dataURL
  });

  // Carrega dados do authService + foto salva no localStorage (se houver)
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (authService.checkAuth()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setFormData({
          name: currentUser?.name || "Usuário NAVIS",
          email: currentUser?.email || "user@navis.com",
          phone: currentUser?.phone || "",
          cpf: currentUser?.cpf || "",
          bio: currentUser?.bio || "",
          avatar: currentUser?.avatar || null,
        });
      }

      // Se existir foto do usuário no localStorage (upload anterior), usa como prioridade
      const savedPhoto = localStorage.getItem("navis_user_photo");
      if (savedPhoto) {
        setFormData((prev) => ({ ...prev, avatar: savedPhoto }));
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Salva a imagem como dataURL e armazena no localStorage
  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // opcional: limitar tamanho (ex: 2MB)
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
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf,
      bio: formData.bio,
      avatar: formData.avatar,
    };

    // se authService tiver um método para atualizar localmente:
    if (authService.updateCurrentUser) {
      try {
        authService.updateCurrentUser(updatedUser);
      } catch (err) {
        console.warn("authService.updateCurrentUser não existe ou falhou", err);
      }
    }

    // também armazena em localStorage (redundante mas seguro)
    try {
      localStorage.setItem("navis_current_user", JSON.stringify(updatedUser));
    } catch (err) {
      console.warn("Não foi possível salvar usuário no localStorage", err);
    }

    setSuccessMessage("Atualização salva com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);
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
        <div className="profile-container">
          {/* Header com Avatar */}
          <section className="profile-header-section">
            <div className="profile-avatar">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile Avatar" />
              ) : (
                <div className="avatar-placeholder">Upload Foto</div>
              )}

              {/* input de arquivo */}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                aria-label="Upload da foto de perfil"
              />
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{formData.name}</h1>
              <p className="profile-email">{formData.email}</p>
            </div>
          </section>

          {/* Tabs */}
          <section className="profile-tabs">
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Perfil
              </button>
              <button
                className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Configurações
              </button>
              <button
                className={`tab-button ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                Segurança
              </button>
            </div>
          </section>

          {/* Tab Content */}
          <section className="profile-content">
            {activeTab === "profile" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2 className="h2">Informações Pessoais</h2>
                </div>

                <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid">
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
                  </div>

                  {successMessage && <div className="success-message">{successMessage}</div>}

                  <div className="form-actions">
                    <button type="button" className="cancel-button">
                      Cancelar
                    </button>
                    <button type="button" className="save-button" onClick={handleSaveProfile}>
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* settings / security... (mantém igual ao seu código original) */}
            {activeTab === "settings" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Configurações da Conta</h2>
                  <p className="p">Gerencie suas preferências e notificações.</p>
                </div>

                <div className="settings-sections">
                  <div className="settings-section">
                    <h3 className="h3">Notificações por Email</h3>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p>Receba atualizações sobre sua conta e atividades.</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="h3">Visibilidade do Perfil</h3>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p>Torne seu perfil visível para outros usuários.</p>
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
              </div>
            )}

            {activeTab === "security" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Configurções de segurança</h2>
                  <p className="p">Gerencie a segurança e a privacidade da sua conta.</p>
                </div>
                <div className="security-sections">
                  <div className="security-section">
                    <h3 className="h3">Senha</h3>
                    <div className="security-item">
                      <div className="security-info">
                        <p>Atualize sua senha para manter sua conta segura.</p>
                      </div>
                      <button className="security-button">Alterar senha</button>
                    </div>
                  </div>
                  <div className="security-section">
                    <h3 className="h3">Autênticação de dois fatores</h3>
                    <div className="security-item">
                      <div className="security-info">
                        <p>Adicione uma camada extra de segurança à sua conta.</p>
                      </div>
                      <button className="security-button">Ativar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
