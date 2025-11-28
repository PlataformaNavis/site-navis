/**
 * Serviço de Autenticação
 * Simula funcionalidades de login baseadas no design do Figma
 */

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
  }

  /**
   * Simula login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Resultado do login
   */
  async login(email, password) {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validação básica
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Email inválido");
    }

    if (password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    // Simula autenticação bem-sucedida
    const user = {
      id: "1",
      email: email,
      name: "Usuário NAVIS",
      avatar: null,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const token = this.generateToken(user);

    this.isAuthenticated = true;
    this.user = user;
    this.token = token;

    // Salva no localStorage
    localStorage.setItem("navis_token", token);
    localStorage.setItem("navis_user", JSON.stringify(user));

    return {
      success: true,
      user,
      token,
      message: "Login realizado com sucesso!",
    };
  }

  /**
   * Simula login social (Google/GitHub)
   * @param {string} provider - Provedor social (google, github)
   * @returns {Promise<Object>} Resultado do login
   */
  async loginSocial(provider) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = {
      id: "1",
      email: `user@${provider}.com`,
      name: `Usuário ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      avatar: `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${provider
        .charAt(0)
        .toUpperCase()}`,
      role: "user",
      provider,
      createdAt: new Date().toISOString(),
    };

    const token = this.generateToken(user);

    this.isAuthenticated = true;
    this.user = user;
    this.token = token;

    localStorage.setItem("navis_token", token);
    localStorage.setItem("navis_user", JSON.stringify(user));

    return {
      success: true,
      user,
      token,
      message: `Login com ${provider} realizado com sucesso!`,
    };
  }

  /**
   * Faz logout do usuário
   */
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;

    localStorage.removeItem("navis_token");
    localStorage.removeItem("navis_user");
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  checkAuth() {
    const token = localStorage.getItem("navis_token");
    const user = localStorage.getItem("navis_user");

    if (token && user) {
      try {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }

    return false;
  }

  /**
   * Obtém dados do usuário atual
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Obtém token atual
   * @returns {string|null}
   */
  getToken() {
    return this.token;
  }

  /**
   * Valida formato de email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Gera token simulado
   * @param {Object} user
   * @returns {string}
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 horas
    };

    // Simula JWT (em produção, use uma biblioteca real)
    return btoa(JSON.stringify(payload));
  }

  /**
   * Verifica se o token é válido
   * @param {string} token
   * @returns {boolean}
   */
  isTokenValid(token) {
    try {
      const payload = JSON.parse(atob(token));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Simula recuperação de senha
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!this.isValidEmail(email)) {
      throw new Error("Email inválido");
    }

    return {
      success: true,
      message: "Instruções de recuperação enviadas para seu email",
    };
  }

  /**
   * Simula registro de usuário
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async register(userData) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { email, password, name } = userData;

    if (!email || !password || !name) {
      throw new Error("Todos os campos são obrigatórios");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Email inválido");
    }

    if (password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    const user = {
      id: Date.now().toString(),
      email,
      name,
      avatar: null,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const token = this.generateToken(user);

    this.isAuthenticated = true;
    this.user = user;
    this.token = token;

    localStorage.setItem("navis_token", token);
    localStorage.setItem("navis_user", JSON.stringify(user));

    return {
      success: true,
      user,
      token,
      message: "Conta criada com sucesso!",
    };
  }
}

export default new AuthService();
