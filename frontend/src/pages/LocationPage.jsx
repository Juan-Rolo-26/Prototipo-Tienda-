import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateCustomerProfile } from "../api";
import { fetchArgCitiesByProvince, fetchArgProvinces } from "../services/argGeo";

function LocationPage({ customerToken, customerProfile, onCustomerUpdate, onRequireLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    province: customerProfile?.province || "",
    city: customerProfile?.city || "",
    address1: customerProfile?.address1 || "",
    address2: customerProfile?.address2 || "",
    postalCode: customerProfile?.postalCode || "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  React.useEffect(() => {
    let active = true;
    fetchArgProvinces().then((items) => {
      if (active) setProvinces(items);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!form.province) {
      setCities([]);
      return () => {
        active = false;
      };
    }
    fetchArgCitiesByProvince(form.province).then((items) => {
      if (active) setCities(items);
    });
    return () => {
      active = false;
    };
  }, [form.province]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      if (name === "province") {
        return { ...prev, province: value, city: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (!customerToken) {
      onRequireLogin?.();
      navigate("/");
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const updated = await updateCustomerProfile(customerToken, {
        firstName: customerProfile?.firstName || "",
        lastName: customerProfile?.lastName || "",
        province: form.province,
        city: form.city,
        address1: form.address1,
        address2: form.address2,
        postalCode: form.postalCode,
        phone: customerProfile?.phone || "",
      });
      onCustomerUpdate?.(updated.customer);
      navigate("/");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!customerToken) {
    return (
      <section className="form location-form-page">
        <h2>Mi ubicacion</h2>
        <p className="helper">Para agregar ubicacion necesitas iniciar sesion.</p>
        <div className="button-row">
          <button
            className="button"
            type="button"
            onClick={() => {
              onRequireLogin?.();
              navigate("/");
            }}
          >
            Iniciar sesion o registrarme
          </button>
          <button className="button secondary" type="button" onClick={() => navigate("/")}>
            Atras
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="form location-form-page">
      <h2>Mi ubicacion</h2>
      <select name="province" value={form.province} onChange={handleChange} required>
        <option value="">Selecciona una provincia</option>
        {provinces.map((province) => (
          <option key={province} value={province}>
            {province}
          </option>
        ))}
      </select>
      <select
        name="city"
        value={form.city}
        onChange={handleChange}
        required
        disabled={!form.province}
        onFocus={() => {
          if (!form.province) setStatus("Primero tienes que seleccionar una provincia.");
        }}
      >
        <option value="">
          {form.province ? "Selecciona una ciudad" : "Primero selecciona una provincia"}
        </option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <input
        name="address1"
        placeholder="Direccion (linea 1) · Ej: Barrio - country"
        value={form.address1}
        onChange={handleChange}
        required
      />
      <input
        name="address2"
        placeholder="Direccion (linea 2) · Ej: Piso - mzna - lote"
        value={form.address2}
        onChange={handleChange}
      />
      <input name="postalCode" placeholder="Codigo postal" value={form.postalCode} onChange={handleChange} required />

      <div className="button-row">
        <button className="button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar mi ubicacion"}
        </button>
        <button className="button secondary" type="button" onClick={() => navigate("/")}>
          Atras
        </button>
      </div>

      {status && <p className="helper">{status}</p>}
    </section>
  );
}

export default LocationPage;
