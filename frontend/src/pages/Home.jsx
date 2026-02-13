import React, { useEffect, useState } from "react";
import { deleteProduct, fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

function Home({ onAdd, searchQuery, cart, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!confirmProduct) return;
    setDeleting(true);
    try {
      await deleteProduct(confirmProduct.id, localStorage.getItem("adminToken"));
      setConfirmProduct(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const normalizedQuery = String(searchQuery || "").trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
    : products;

  return (
    <div>
      <section className="promo-banner" aria-label="Banner principal">
        <div className="promo-copy">
          <h2>Arma tu propio lote a precios mayoristas</h2>
          <p>Selecciona prendas unicas y crea tu propio lote personalizado.</p>
        </div>
        <div className="promo-box-scene" aria-hidden="true">
          <div className="promo-box">
            <div className="promo-lid promo-lid-left" />
            <div className="promo-lid promo-lid-right" />
            <div className="promo-hand">
              <span className="promo-click-ray promo-click-ray-a" />
              <span className="promo-click-ray promo-click-ray-b" />
              <span className="promo-click-ray promo-click-ray-c" />
              <span className="promo-click-ray promo-click-ray-d" />
            </div>
            <div className="promo-clothes">
              <span className="cloth cloth-a" />
              <span className="cloth cloth-b" />
              <span className="cloth cloth-c" />
              <span className="cloth cloth-d" />
              <span className="cloth cloth-e" />
            </div>
            <div className="promo-box-front" />
            <div className="promo-check">
              <span className="promo-check-icon">✓</span>
              <span>Lista para enviar</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero">
        <span className="badge">Mayorista · Productos unicos</span>
        <h1>Tu proveedor textil mas barato y confiable</h1>
        <p>Prendas importadas unicas, ideales para la reventa o el uso personal.</p>
      </section>

      {loading && <p>Cargando productos...</p>}
      {error && <p className="helper">{error}</p>}

      {!loading && filteredProducts.length === 0 && (
        <p className="helper">La tienda esta vacia por ahora. Vuelve en unos dias.</p>
      )}

      <div className="grid">
        {filteredProducts.map((product) => {
          const inCart = cart?.find((item) => item.productId === product.id);
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              inCart={inCart}
              showDelete={Boolean(isAdmin)}
              onDelete={(p) => setConfirmProduct(p)}
            />
          );
        })}
      </div>

      {confirmProduct && (
        <div className="modal-backdrop" onClick={() => setConfirmProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Esta seguro que quiere eliminar el producto?</h3>
            <div className="button-row">
              <button className="button danger" type="button" onClick={() => setConfirmProduct(null)}>
                No
              </button>
              <button className="button success" type="button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Si"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
