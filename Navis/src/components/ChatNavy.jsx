import { useState, useEffect, useRef } from "react";
import "./ChatNavy.css";

export default function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userPhoto, setUserPhoto] = useState("/user.png"); // foto padrão

  // 👇 referência para a área de mensagens
  const messagesEndRef = useRef(null);

  // 🔹 Respostas prontas
  const helpResponses = {
    1: `Problemas de login ou senha
    
Se você não consegue acessar sua conta:
- Verifique se o e-mail está digitado corretamente.
- Clique em “Esqueci minha senha” para redefinir o acesso.
- Veja se o e-mail de recuperação chegou na caixa de spam.
- Se não recebeu o e-mail, entre em contato com suporte@navis.com
🔹 Dica: evite usar navegadores desatualizados, pois podem causar erros de autenticação.`,

    2: `Dificuldade para navegar na plataforma

Está perdido? Tudo bem! 😅
- Use o menu lateral esquerdo para acessar as principais áreas: Home, Localização, Navegantes, Navy e Perfil.
🔹 Dica: o botão de ajuda (este chat!) pode ser usado em qualquer página.`,

    3: `Erros ao enviar formulários

Se algo não está sendo enviado corretamente:
- Verifique se todos os campos obrigatórios estão preenchidos.
- Confira o formato dos dados (ex.: CPF, telefone, e-mail).
- Atualize a página e tente novamente.
- Caso o problema persista, envie um print para suporte@navis.com
🔹 Dica: evite caracteres especiais (%, &, #, etc.) em campos de texto.`,

    4: `Problemas de exibição

Se a tela parecer desconfigurada:
- Atualize a página (Ctrl + R).
- Use navegadores modernos (Chrome, Edge, Firefox).
- Tente limpar o cache do navegador.
🔹 Dica: se estiver no celular, use o modo horizontal ou atualize o app.`,

    5: `Dificuldades ao atualizar perfil ou foto

Caso sua foto ou informações não apareçam:
- Verifique se o formato da imagem é .jpg ou .png.
- Atualize a página após salvar as alterações.
- Se não carregar, tente novamente com uma imagem menor (menos de 2MB).
🔹 Dica: as mudanças podem demorar alguns segundos para sincronizar.`,

    6: `Dúvidas sobre segurança e privacidade

Sua segurança é prioridade. 🔐
- Seus dados são protegidos e criptografados.
- Nunca compartilhe sua senha com terceiros.
- A Navis nunca solicita informações pessoais por e-mail.
🔹 Dica: altere sua senha a cada 3 meses para manter sua conta segura.`,

    7: `Feedback e sugestões de melhoria

Quer sugerir algo novo? ✨
- A Navis adora ouvir seus usuários!
- Envie suas ideias ou sugestões para feedback@navis.com
- Cada mensagem ajuda a deixar a plataforma ainda melhor.
🔹 Dica: melhorias frequentes são baseadas no que vocês pedem!`,

    8: `Outras dúvidas ou suporte direto

Não encontrou o que procurava?
- Você pode nos contatar pelo e-mail suporte@navis.com
- Atendimento disponível de segunda a sexta, das 9h às 18h.
🔹 Dica: descreva seu problema com detalhes (print + data/hora) para receber ajuda mais rápida.`,
  };

  // 🔹 Mensagem inicial
  const initialBotMessage = `Olá! 👋 Sou o Navy, seu assistente virtual da Navis.
Escolha uma das opções abaixo digitando o número correspondente:

1️⃣ Problemas com login ou senha

2️⃣ Dificuldade para navegar na plataforma

3️⃣ Erros ao enviar o formulário

4️⃣ Problemas de exibição

5️⃣ Dificuldades ao atualizar perfil ou foto

6️⃣ Dúvidas sobre segurança e privacidade

7️⃣ Feedback e sugestões de melhoria

8️⃣ Outras dúvidas ou suporte direto
`;

  useEffect(() => {
    setMessages([{ sender: "bot", text: initialBotMessage }]);

    const savedPhoto = localStorage.getItem("navis_user_photo");
    if (savedPhoto) setUserPhoto(savedPhoto);
  }, []);

  // sempre rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    if (isOpen) {
      // Se o chat estiver aberto e for fechado → limpa histórico
      setMessages([]);
    } else {
      // Se o chat for aberto novamente → mostra mensagem inicial
      setMessages([{ sender: "bot", text: initialBotMessage }]);
    }

    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const choice = input.trim();
      const botReply = helpResponses[choice]
        ? helpResponses[choice]
        : "Desculpe, não entendi. Por favor digite um número de 1 a 8.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);
  };

  return (
    <div className="helpchat-container">
      {isOpen && (
        <div className="helpchat-window">
          <div className="helpchat-header">Help chat Navy</div>

          <div className="helpchat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <img src="/Navy.png" alt="Navy" className="message-avatar" />
                )}

                <div
                  className={`message ${msg.sender}`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <img src={userPhoto} alt="Você" className="message-avatar" />
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className="helpchat-input">
            <input
              type="text"
              placeholder="Digite o número da opção..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Enviar</button>
          </div>
        </div>
      )}

      <button className="helpchat-button" onClick={toggleChat}>
        <img src="/Navy.png" alt="Abrir chat" />
      </button>
    </div>
  );
}
