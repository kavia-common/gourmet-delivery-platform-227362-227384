import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function OrdersPage() {
  /** This is a public function. */
  const { api } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.listOrders();
        if (mounted) setOrders(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="title">Orders</h1>
        <p className="subtitle">View your order history and details.</p>
      </div>

      {loading ? <div className="muted">Loading...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="stack">
        {orders.map((o) => (
          <Card key={o.id} className="card-pad">
            <div className="card-row">
              <div>
                <div className="card-title">Order #{o.id}</div>
                <div className="muted small">
                  Total: ${Number(o.total_amount).toFixed(2)} · Payment: {o.payment_status}
                </div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-12">
              <Link to={`/orders/${o.id}`}>View details</Link>
            </div>
          </Card>
        ))}
      </div>

      {!loading && !error && orders.length === 0 ? <div className="muted">No orders yet.</div> : null}
    </div>
  );
}
