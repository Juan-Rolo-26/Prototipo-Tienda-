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
