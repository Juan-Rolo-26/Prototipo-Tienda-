import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function AuthModal({ open, onClose, onGoogleCredential, loading, customerProfile, customerIsAdmin, onLogout }) {
  useEffect(() => {
    if (!open || customerProfile) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        onGoogleCredential(response.credential);
      },
    });

    window.google.accounts.id.renderButton(document.getElementById("google-button"), {
      theme: "outline",
      size: "large",
      width: 280,
      text: "continue_with",
    });
  }, [open, customerProfile, onGoogleCredential]);

  if (!open) return null;

  const email = customerProfile?.email || "";
  const displayName = email ? email.split("@")[0] : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        {customerProfile ? (
          <div className="profile-view">
            <h2>Hola {displayName}</h2>
            <div className="profile-list">
              <div><strong>Email:</strong> {customerProfile.email}</div>
              <div><strong>Nombre:</strong> {customerProfile.firstName || ""}</div>
              <div><strong>Apellido:</strong> {customerProfile.lastName || ""}</div>
              <div><strong>Provincia:</strong> {customerProfile.province || ""}</div>
              <div><strong>Ciudad:</strong> {customerProfile.city || ""}</div>
              <div><strong>Direccion 1:</strong> {customerProfile.address1 || ""}</div>
              <div><strong>Direccion 2:</strong> {customerProfile.address2 || ""}</div>
              <div><strong>Codigo postal:</strong> {customerProfile.postalCode || ""}</div>
              <div><strong>Telefono:</strong> {customerProfile.phone || ""}</div>
            </div>
            {customerIsAdmin && (
              <Link className="button secondary" to="/admin" onClick={onClose}>
                Agregar productos
              </Link>
            )}
            <button className="button" type="button" onClick={onLogout}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <>
            <h2>Inicia sesion o registrate</h2>
            <p className="helper">
              Accede con tu cuenta de Google. Comprar no es obligatorio para iniciar sesion.
            </p>
            <div id="google-button" className="google-button" />
            {loading && <p className="helper">Conectando con Google...</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
