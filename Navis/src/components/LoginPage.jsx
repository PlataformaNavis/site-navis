import { useState, useEffect } from "react";
import authService from "../services/authService";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (authService.checkAuth()) {
      setSuccess("Você já está logado!");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLoginMode) {
        const result = await authService.login(
          formData.email,
          formData.password
        );
        setSuccess(result.message || "Login realizado com sucesso!");
        if (onLoginSuccess) onLoginSuccess();
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        const result = await authService.register(formData);
        setSuccess(result.message || "Conta criada com sucesso!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginSocial("google");
      if (onLoginSuccess) onLoginSuccess();

      // redireciona para a página de localização
      window.location.href = "/localizacao";
    } catch (err) {
      setError("Falha ao entrar com o Google.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <img src="/NAVIS.jpg" alt="Navis Logo" />
          </div>
          <p className="login-subtitle">
            {isLoginMode
              ? "Bem-vindo! Faça login para continuar."
              : "Crie sua conta para iniciar seu trajeto como navegante."}
          </p>
        </div>

        {/* Alternador de modo */}
        <div className="mode-switch">
          <button
            className={`mode-btn ${isLoginMode ? "active" : ""}`}
            onClick={() => setIsLoginMode(true)}
          >
            Fazer login
          </button>
          <button
            className={`mode-btn ${!isLoginMode ? "active" : ""}`}
            onClick={() => setIsLoginMode(false)}
          >
            Criar conta
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Senha"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* Ícone do olho */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g style={{ display: showPassword ? "none" : "block" }}>
                    <path
                      d="M10 3C5.5 3 1.73 6.11 1 10.5C1.73 14.89 5.5 18 10 18C14.5 18 18.27 14.89 19 10.5C18.27 6.11 14.5 3 10 3Z"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 13.5C11.3807 13.5 12.5 12.3807 12.5 11C12.5 9.61929 11.3807 8.5 10 8.5C8.61929 8.5 7.5 9.61929 7.5 11C7.5 12.3807 8.61929 13.5 10 13.5Z"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g style={{ display: showPassword ? "block" : "none" }}>
                    <path
                      d="M10 3C5.5 3 1.73 6.11 1 10.5C1.73 14.89 5.5 18 10 18C14.5 18 18.27 14.89 19 10.5C18.27 6.11 14.5 3 10 3Z"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 13.5C11.3807 13.5 12.5 12.3807 12.5 11C12.5 9.61929 11.3807 8.5 10 8.5C8.61929 8.5 7.5 9.61929 7.5 11C7.5 12.3807 8.61929 13.5 10 13.5Z"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1 1L19 19"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirme sua senha"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading
              ? "Processando..."
              : isLoginMode
              ? "Fazer login"
              : "Criar conta"}
          </button>
        </form>

        {/* Social Login */}
        <div className="social-login">
          <button
            className="social-button google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.6 10.2273C19.6 9.51818 19.5364 8.83636 19.4182 8.18182H10V12.05H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273Z"
                fill="#4285F4"
              />
              <path
                d="M10 20C12.7 20 14.9636 19.1045 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z"
                fill="#34A853"
              />
              <path
                d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
                fill="#EA4335"
              />
            </svg>
            Continue com Google
          </button>
        </div>

          {!isLoginMode && (
            <p className="terms-message">
              Ao criar uma conta, você concorda com nossos termos de uso e
              políticas de privacidade. Sua segurança é nossa prioridade.{" "}
              <a
                href="/termos-de-uso"
                target="_blank"
                rel="noopener noreferrer"
              >
                LEIA MAIS DOS NOSSOS TERMOS DE USO AQUI
              </a>
            </p>
          )}

        {/* Mensagens */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
      </div>
    </div>
  );
};

export default LoginPage;