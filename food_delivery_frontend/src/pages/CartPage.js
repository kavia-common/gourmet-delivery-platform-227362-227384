import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

/**
 * PUBLIC_INTERFACE
 */
export function CartPage() {
  /** This is a public function. */
  const { isAuthenticated, role } = useAuth();
  const { items, subtotal, setQuantity, clear, refreshFromBackend } = useCart();
  const navigate = useNavigate();

  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function sync() {
      setSyncError("");
      try {
        await refreshFromBackend();
      } catch (e) {
        if (mounted) setSyncError(e.message || "Failed to sync cart");
      }
    }
    sync();
    return () => {
      mounted = false;
    };
  }, [refreshFromBackend]);

  const restaurantId = useMemo(() => {
    // We can only infer restaurant_id if menu items have it. If not present, checkout will require choosing from menu first.
    const first = items[0]?.menuItem;
    return first?.restaurant_id || null;
  }, [items]);

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1 className="title">Your cart</h1>
          <p className="subtitle">Review items before checkout.</p>
        </div>
        <div className="row-right">
          <Button variant="secondary" onClick={clear} disabled={!items.length}>
            Clear
          </Button>
          <Link to="/checkout">
            <Button variant="success" disabled={!items.length}>
              Checkout
            </Button>
          </Link>
        </div>
      </div>

      {syncError ? <div className="alert alert-danger">{syncError}</div> : null}

      {!isAuthenticated ? (
        <div className="alert alert-info">
          You can build a cart without logging in. Login to checkout.
          <div className="mt-12">
            <Button onClick={() => navigate("/login")} className="mr-8">
              Login
            </Button>
            <Link to="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        </div>
      ) : role !== "customer" ? (
        <div className="alert alert-info">Only customers can checkout. You are logged in as: {role}.</div>
      ) : null}

      <div className="stack">
        {items.map((it) => (
          <Card key={it.menuItem.id} className="card-pad">
            <div className="cart-row">
              <div className="cart-left">
                <div className="card-title">{it.menuItem.name || `Item #${it.menuItem.id}`}</div>
                <div className="muted small">
                  ${Number(it.menuItem.price || 0).toFixed(2)} each {restaurantId ? "" : "(restaurant unknown)"}
                </div>
              </div>
              <div className="cart-right">
                <input
                  className="qty"
                  type="number"
                  min={1}
                  max={50}
                  value={it.quantity}
                  onChange={(e) => setQuantity(it.menuItem.id, Number(e.target.value))}
                />
                <div className="price">${(Number(it.menuItem.price || 0) * it.quantity).toFixed(2)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!items.length ? <div className="muted">Your cart is empty.</div> : null}

      <div className="totals">
        <div className="totals-row">
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div className="muted small">
          Delivery fee and totals are calculated by the backend during checkout.
        </div>
      </div>
    </div>
  );
}
