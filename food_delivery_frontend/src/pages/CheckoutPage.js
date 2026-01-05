import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

/**
 * PUBLIC_INTERFACE
 */
export function CheckoutPage() {
  /** This is a public function. */
  const { api, isAuthenticated, role } = useAuth();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const restaurantId = useMemo(() => items[0]?.menuItem?.restaurant_id || null, [items]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (role !== "customer") {
      setError("Only customers can checkout.");
      return;
    }
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!restaurantId) {
      setError("Missing restaurant id. Please add items from a restaurant menu page.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder({ restaurant_id: restaurantId, delivery_address: deliveryAddress });
      clear();
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <Card className="card-pad">
        <h1 className="title">Checkout</h1>
        <p className="subtitle">Enter delivery address to place your order.</p>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="label">Delivery address</span>
            <textarea
              className="input"
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              minLength={5}
              maxLength={500}
              required
            />
          </label>

          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? "Placing order..." : "Place order"}
          </Button>

          <div className="muted small">
            Note: Payment intent endpoint exists (/payments/intent) but this UI uses the backend’s mock flow for now.
          </div>
        </form>
      </Card>
    </div>
  );
}
