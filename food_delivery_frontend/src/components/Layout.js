import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Button } from "./ui/Button";

function linkClass({ isActive }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * PUBLIC_INTERFACE
 */
export function Layout() {
  /** This is a public function. */
  const { isAuthenticated, role, logout } = useAuth();
  const { items } = useCart();

  const cartCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <Link to="/" className="brand-link">
              Gourmet Delivery
            </Link>
          </div>

          <nav className="nav">
            <NavLink to="/restaurants" className={linkClass}>
              Restaurants
            </NavLink>

            <NavLink to="/cart" className={linkClass}>
              Cart{cartCount ? ` (${cartCount})` : ""}
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>
            )}

            {role === "restaurant" && (
              <NavLink to="/owner" className={linkClass}>
                Owner Dashboard
              </NavLink>
            )}

            {role === "delivery" && (
              <NavLink to="/delivery" className={linkClass}>
                Delivery Dashboard
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <span className="role-pill">{role || "user"}</span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Gourmet Delivery Platform</span>
          <a className="footer-link" href="http://localhost:3001/docs" target="_blank" rel="noreferrer">
            API Docs
          </a>
        </div>
      </footer>
    </div>
  );
}
