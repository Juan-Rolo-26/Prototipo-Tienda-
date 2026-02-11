import React, { useEffect, useState } from "react";
import { loginAdminWithGoogle } from "../api";

function AdminLogin({ onLogin }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          setLoading(true);
          setError(null);
          const data = await loginAdminWithGoogle(response.credential);
          onLogin(data.token);
        } catch (err) {
          setError("Este Gmail no tiene acceso admin.");
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(document.getElementById("google-admin-button"), {
      theme: "outline",
      size: "large",
      width: 280,
      text: "continue_with",
    });
  }, [onLogin]);

  return (
    <div className="form">
      <h2>Login Admin</h2>
      <p className="helper">Acceso solo para emails autorizados.</p>
      <div id="google-admin-button" className="google-button" />
      {loading && <p className="helper">Conectando...</p>}
      {error && <p className="helper">{error}</p>}
    </div>
  );
}

export default AdminLogin;
