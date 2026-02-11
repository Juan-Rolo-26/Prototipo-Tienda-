import React, { useEffect, useRef, useState } from "react";
import { checkoutOrder, updateCustomerProfile } from "../api";
import { formatPrice } from "../utils/format";

function Checkout({ cart, onClear, customerToken, customerProfile, onCustomerUpdate }) {
  const [form, setForm] = useState({
    customerName: "",
    province: "",
    city: "",
    address1: "",
    address2: "",
    postalCode: "",
    phone: "",
    deliveryMethod: "PICKUP",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(true);
  const [warnings, setWarnings] = useState({});
  const warningTimers = useRef({});

  useEffect(() => {
    if (!customerProfile) {
      setEditingProfile(true);
      return;
    }
    const fullName = [customerProfile.firstName, customerProfile.lastName].filter(Boolean).join(" ");
    setForm((prev) => ({
      ...prev,
      customerName: fullName || prev.customerName,
      province: customerProfile.province || prev.province,
      city: customerProfile.city || prev.city,
      address1: customerProfile.address1 || prev.address1,
      address2: customerProfile.address2 || prev.address2,
      postalCode: customerProfile.postalCode || prev.postalCode,
      phone: customerProfile.phone || prev.phone,
    }));
    setEditingProfile(false);
  }, [customerProfile]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showWarning = (productId) => {
    setWarnings((prev) => ({ ...prev, [productId]: true }));
    if (warningTimers.current[productId]) clearTimeout(warningTimers.current[productId]);
    warningTimers.current[productId] = setTimeout(() => {
      setWarnings((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
      setStatus("El carrito esta vacio.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      if (customerToken && editingProfile) {
        const [firstName, ...rest] = String(form.customerName || "").trim().split(" ");
        const lastName = rest.join(" ");
        const updated = await updateCustomerProfile(customerToken, {
          firstName: firstName || "",
          lastName: lastName || "",
          province: form.province,
          city: form.city,
          address1: form.address1,
          address2: form.address2,
          postalCode: form.postalCode,
          phone: form.phone,
        });
        onCustomerUpdate?.(updated.customer);
      }

      await checkoutOrder(
        {
          ...form,
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        },
        customerToken
      );
      onClear();
      setStatus("Pedido confirmado. Te contactaremos para coordinar.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!customerToken) return;
    setLoading(true);
    setStatus(null);
    try {
      const [firstName, ...rest] = String(form.customerName || "").trim().split(" ");
      const lastName = rest.join(" ");
      const updated = await updateCustomerProfile(customerToken, {
        firstName: firstName || "",
        lastName: lastName || "",
        province: form.province,
        city: form.city,
        address1: form.address1,
        address2: form.address2,
        postalCode: form.postalCode,
        phone: form.phone,
      });
      onCustomerUpdate?.(updated.customer);
      setEditingProfile(false);
      setStatus("Ubicacion actualizada.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Checkout rapido</h2>
        {customerToken && !editingProfile && (
          <div className="profile-banner">
            <span>Datos guardados en tu cuenta.</span>
            <button className="button secondary" type="button" onClick={() => setEditingProfile(true)}>
              Cambiar ubicacion actual
            </button>
          </div>
        )}
        <input
          name="customerName"
          placeholder="Nombre y apellido"
          value={form.customerName}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <input
          name="province"
          placeholder="Provincia"
          value={form.province}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <input
          name="city"
          placeholder="Ciudad"
          value={form.city}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <input
          name="address1"
          placeholder="Direccion (linea 1)"
          value={form.address1}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <input
          name="address2"
          placeholder="Direccion (linea 2)"
          value={form.address2}
          onChange={handleChange}
          disabled={customerToken && !editingProfile}
        />
        <input
          name="postalCode"
          placeholder="Codigo postal"
          value={form.postalCode}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <input
          name="phone"
          placeholder="Telefono"
          value={form.phone}
          onChange={handleChange}
          required
          disabled={customerToken && !editingProfile}
        />
        <select name="deliveryMethod" value={form.deliveryMethod} onChange={handleChange}>
          <option value="PICKUP">Retiro por local</option>
          <option value="HOME_DELIVERY">Envio a domicilio</option>
          <option value="BRANCH_DELIVERY">Envio a sucursal Correo Argentino</option>
        </select>
        {customerToken && editingProfile && (
          <button className="button secondary" type="button" onClick={handleSaveProfile} disabled={loading}>
            Guardar ubicacion
          </button>
        )}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </button>
        {status && <p className="helper">{status}</p>}
      </form>

      <div className="form">
        <h2>Resumen</h2>
        {cart.length === 0 && <p className="helper">No hay productos en el carrito.</p>}
        <div className="table">
          {cart.map((item) => (
            <div className="cart-item" key={item.productId}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <strong>{item.name}</strong>
                <span className="helper">Ancho: {item.width} · Alto: {item.height} · Peso: {item.weight}</span>
                <div className="qty-control cart-qty">
                  <button type="button" onClick={() => item.onQtyChange?.(item.productId, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.stock && item.quantity + 1 > item.stock) {
                        showWarning(item.productId);
                        return;
                      }
                      item.onQtyChange?.(item.productId, item.quantity + 1);
                    }}
                  >
                    +
                  </button>
                </div>
                {warnings[item.productId] && <span className="helper">no hay esa cantidad en el stock</span>}
              </div>
              <strong>{formatPrice(item.price)}</strong>
              <button className="cart-remove" type="button" onClick={() => item.onRemove?.(item.productId)} aria-label="Eliminar">
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="table-row">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
