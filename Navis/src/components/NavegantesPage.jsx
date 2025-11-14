import React, { useState, useEffect } from "react";
import "./NavegantesPage.css";

const CHAR_LIMIT = 2000;

const NavegantesPage = () => {
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const [user, setUser] = useState({
    name: "Usuário Navis",
    avatar: "/user-avatar.png",
  });

  const [toast, setToast] = useState({ visible: false, message: "" });

  // Estado do popup de boas-vindas
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  //  Exibir a mensagem ao entrar na área Navegantes
  useEffect(() => {
    setWelcomeVisible(true);

    const timer = setTimeout(() => {
      setWelcomeVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // Carrega usuário
  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("navis_current_user") || "{}"
    );
    const avatar = localStorage.getItem("navis_user_photo");

    setUser({
      name: savedUser.name || "Usuário Navis",
      avatar: avatar || savedUser.avatar || "/user-avatar.png",
    });
  }, []);

  // Carrega posts
  useEffect(() => {
    const saved = localStorage.getItem("navegantes_posts");
    if (!saved) {
      setPostsLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved).map((p) => ({
        ...p,
        likedBy: p.likedBy || [],
        comments: p.comments || [],
        pinned: p.pinned || false,
      }));

      parsed.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setPosts(parsed);
    } catch (err) {
      console.error("Erro ao parsear posts:", err);
    }

    setPostsLoaded(true);
  }, []);

  useEffect(() => {
    if (!postsLoaded) return;
    localStorage.setItem("navegantes_posts", JSON.stringify(posts));
  }, [posts, postsLoaded]);

  const showToast = (message, ms = 2000) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), ms);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: user.name,
      avatar: user.avatar,
      content: newPost.trim(),
      likedBy: [],
      comments: [],
      owner: user.name,
      pinned: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => {
      const next = [post, ...prev];
      next.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      return next;
    });

    setNewPost("");
    showToast("Publicado com sucesso!");
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likedBy?.includes(user.name);
        const likedBy = liked
          ? p.likedBy.filter((n) => n !== user.name)
          : [...(p.likedBy || []), user.name];

        !liked && showToast("💙 Você curtiu!");

        return { ...p, likedBy };
      })
    );
  };

  const handleDeletePost = (postId, owner) => {
    if (owner !== user.name) return alert("⚠ Só o autor pode excluir!");

    if (window.confirm("Deseja excluir este post?")) {
      const element = document.querySelector(`[data-id="${postId}"]`);
      if (element) element.classList.add("removing");

      setTimeout(() => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast("🗑️ Post excluído");
      }, 300);
    }
  };

  const handleTogglePin = (postId) => {
    setPosts((prev) => {
      const isPinned = prev.find((p) => p.id === postId)?.pinned;
      const next = prev.map((p) =>
        p.id === postId ? { ...p, pinned: !isPinned } : { ...p, pinned: false }
      );
      next.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      showToast(isPinned ? "📌 Desafixado" : "📌 Fixado!");
      return next;
    });
  };

  const handleAddComment = (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;

    const comment = {
      id: Date.now(),
      author: user.name,
      avatar: user.avatar,
      text,
      owner: user.name,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), comment] }
          : p
      )
    );

    setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    showToast("💬 Comentário enviado!");
  };

  const handleDeleteComment = (postId, commentId, owner) => {
    if (owner !== user.name) return alert("⚠ Só o autor pode excluir!");

    if (window.confirm("Apagar comentário?")) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
            : p
        )
      );
      showToast("🗑️ Comentário apagado");
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="navegantes-container">
      {welcomeVisible && (
        <div className="navy-message fade-in">
          <img src="/Navy.png" alt="Navy" className="navy-message-avatar" />
          <p className="navy-message-text">
            Olá! 👋 Conheça à Navegantes, a comunidade da Navis. <br /> Aqui,
            você pode compartilhar locais onde não se sentiu seguro,
            compartilhar experiências e colaborar para que outras pessoas também
            se cuidem. Juntos, construímos trajetos mais seguros, tranquilos e
            conscientes.
          </p>
        </div>
      )}

      {toast.visible && (
        <div className="toast-notification">{toast.message}</div>
      )}

      <form className="post-form" onSubmit={handlePostSubmit}>
        <div className="author-preview">
          <img src={user.avatar} alt="avatar" className="avatar-preview" />
          <div className="author-preview-text">
            <strong>{user.name}</strong>
          </div>
        </div>

        <textarea
          value={newPost}
          maxLength={CHAR_LIMIT}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={`O que há de novo, ${user.name.split(" ")[0]}?`}
        />

        <div className="post-form-bottom">
          <span className="char-count">
            {newPost.length}/{CHAR_LIMIT}
          </span>
          <button type="submit" className="post-btn">
            Publicar
          </button>
        </div>
      </form>

      <div className="posts-list">
        {posts.length === 0 && (
          <p className="no-posts">Nenhuma publicação ainda...</p>
        )}

        {posts.map((post) => (
          <div
            key={post.id}
            data-id={post.id}
            className={`post-card fade-in ${post.pinned ? "pinned" : ""}`}
          >
            <div className="post-header">
              <img src={post.avatar} className="avatar" />

              <div className="post-meta">
                <a href="/perfil" className="author-link">
                  <strong className="author">{post.author}</strong>
                </a>
                <span className="time">{formatTime(post.createdAt)}</span>
              </div>

              {post.owner === user.name && (
                <div className="post-controls">
                  <button
                    className="pin-btn"
                    onClick={() => handleTogglePin(post.id)}
                  >
                    {post.pinned ? "📌" : "📍"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePost(post.id, post.owner)}
                  >
                    <img src="/delete (1).png" alt="" />
                  </button>
                </div>
              )}
            </div>

            <p className="post-content">{post.content}</p>

            <div className="post-actions">
              <button
                className={`like-btn ${
                  post.likedBy?.includes(user.name) ? "liked" : ""
                }`}
                onClick={() => handleLike(post.id)}
              >
                {post.likedBy?.includes(user.name) ? "💙" : "🤍"}{" "}
                {post.likedBy?.length}
              </button>

              <span className="comment-count">💬 {post.comments?.length}</span>
            </div>

            <div className="comments-section">
              {post.comments?.map((c) => (
                <div key={c.id} className="comment bounce-in-new">
                  <div className="comment-header">
                    <img src={c.avatar} className="avatar-small" />
                    <strong className="comment-author">{c.author}</strong>
                    <small className="comment-time">
                      {formatTime(c.createdAt)}
                    </small>

                    {c.owner === user.name && (
                      <button
                        className="delete-comment-btn"
                        onClick={() =>
                          handleDeleteComment(post.id, c.id, c.owner)
                        }
                      >
                        ❌
                      </button>
                    )}
                  </div>
                  <p>{c.text}</p>
                </div>
              ))}

              <div className="comment-box">
                <input
                  value={commentTexts[post.id] || ""}
                  onChange={(e) =>
                    setCommentTexts({
                      ...commentTexts,
                      [post.id]: e.target.value,
                    })
                  }
                  placeholder="💬 Escreva um comentário..."
                />
                <button
                  className="send-btn"
                  onClick={() => handleAddComment(post.id)}
                >
                  <strong>➤</strong>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavegantesPage;
