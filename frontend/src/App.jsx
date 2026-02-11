import React, { useMemo, useRef, useState } from "react";
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ProductDetail from "./pages/ProductDetail";
import logo from "./assets/logo.png";
import AuthModal from "./components/AuthModal";
import { fetchAdminStatus, fetchCustomer, loginWithGoogle } from "./api";

function App() {
  const [cart, setCart] = useState([]);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken"));
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem("customerToken"));
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerIsAdmin, setCustomerIsAdmin] = useState(() => localStorage.getItem("customerIsAdmin") === "true");
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authToast, setAuthToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const cartIconRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    setAuthOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!customerToken) {
      setCustomerProfile(null);
      return;
    }
    fetchCustomer(customerToken)
      .then((data) => setCustomerProfile(data.customer))
      .catch(() => {
        localStorage.removeItem("customerToken");
        setCustomerToken(null);
      });
    fetchAdminStatus(customerToken)
      .then((data) => {
        setCustomerIsAdmin(Boolean(data.isAdmin));
        localStorage.setItem("customerIsAdmin", data.isAdmin ? "true" : "false");
      })
      .catch(() => {
        setCustomerIsAdmin(false);
        localStorage.setItem("customerIsAdmin", "false");
      });
  }, [customerToken]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const animateToCart = (product, event) => {
    if (!cartIconRef.current || !event) return;
    const cartRect = cartIconRef.current.getBoundingClientRect();
    const img = document.createElement("img");
    img.src = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${product.image}`;
    img.className = "cart-fly";
    const startX = event.clientX;
    const startY = event.clientY;
    img.style.left = `${startX}px`;
    img.style.top = `${startY}px`;
    document.body.appendChild(img);

    requestAnimationFrame(() => {
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;
      img.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.1)`;
      img.style.opacity = "0.6";
    });

    img.addEventListener(
      "transitionend",
      () => {
        img.remove();
      },
      { once: true }
    );

    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  };

  const addToCart = (product, quantity, event) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: safeQty } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: safeQty,
          image: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${product.image}`,
          width: product.width,
          height: product.height,
          weight: product.weight,
          stock: product.stock,
        },
      ];
    });
    animateToCart(product, event);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const handleLogin = (token) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  const handleCustomerLogin = async (credential) => {
    try {
      setAuthLoading(true);
      const data = await loginWithGoogle(credential);
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerIsAdmin", data.isAdmin ? "true" : "false");
      setCustomerToken(data.token);
      setCustomerProfile(data.customer);
      setCustomerIsAdmin(Boolean(data.isAdmin));
      setAuthToast(data.isNew ? "Registro exitoso" : "Inicio de sesion exitoso");
      setTimeout(() => setAuthToast(null), 2500);
      setAuthOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerIsAdmin");
    setCustomerToken(null);
    setCustomerProfile(null);
    setCustomerIsAdmin(false);
  };

  return (
    <div className="container">
      <header className="header">
        <nav className="nav-left">
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
            Tienda
          </NavLink>
        </nav>

        <Link className="logo-center" to="/" aria-label="Volver a tienda">
          <img className="logo-img" src={logo} alt="Bazar Velazquez" />
        </Link>

        <nav className="nav-right">
          <div className="search-wrap">
            <button
              className={`nav-icon ${searchOpen ? "active" : ""}`}
              type="button"
              aria-label="Buscar"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input
              className={`search-input ${searchOpen ? "open" : ""}`}
              type="search"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus={searchOpen}
              aria-hidden={!searchOpen}
            />
          </div>
          <NavLink
            ref={cartIconRef}
            className={({ isActive }) => `nav-icon ${isActive ? "active" : ""} ${cartPulse ? "pulse" : ""}`}
            to="/checkout"
            aria-label="Carrito"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 6h14l-2 9H8L6 3H3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.6" fill="currentColor" />
              <circle cx="18" cy="20" r="1.6" fill="currentColor" />
            </svg>
            <span className="nav-badge">{cartCount}</span>
          </NavLink>
          <button className="nav-icon" type="button" aria-label="Usuario" onClick={() => setAuthOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 20c1.6-3 4.3-4.5 8-4.5s6.4 1.5 8 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={<Home onAdd={addToCart} searchQuery={searchQuery} cart={cart} isAdmin={customerIsAdmin} />}
        />
        <Route path="/producto/:id" element={<ProductDetail onAdd={addToCart} />} />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart.map((item) => ({
                ...item,
                onRemove: removeFromCart,
                onQtyChange: updateCartQuantity,
              }))}
              onClear={clearCart}
              customerToken={customerToken}
              customerProfile={customerProfile}
              onCustomerUpdate={setCustomerProfile}
            />
          }
        />
        <Route
          path="/admin"
          element={
            adminToken ? (
              <AdminPanel token={adminToken} onLogout={handleLogout} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />
      </Routes>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onGoogleCredential={handleCustomerLogin}
        loading={authLoading}
        customerProfile={customerProfile}
        customerIsAdmin={customerIsAdmin}
        onLogout={handleCustomerLogout}
      />
      {authToast && <div className="toast">{authToast}</div>}
    </div>
  );
}

export default App;
