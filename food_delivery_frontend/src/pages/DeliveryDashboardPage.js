import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function DeliveryDashboardPage() {
  /** This is a public function. */
  const { api } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load assigned orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => {
    return orders.filter((o) => ["confirmed", "preparing", "picked_up"].includes(String(o.status).toLowerCase()));
  }, [orders]);

  async function updateStatus(orderId, status) {
    setError("");
    try {
      await api.updateOrderStatus(orderId, { status, message: `Delivery updated to ${status}` });
      await reload();
    } catch (err) {
      setError(err.message || "Failed to update order");
    }
  }

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1 className="title">Delivery dashboard</h1>
          <p className="subtitle">View assigned orders and update delivery status.</p>
        </div>
        <div className="row-right">
          <Button variant="secondary" onClick={reload}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? <div className="muted">Loading...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="stack">
        {active.map((o) => (
          <Card key={o.id} className="card-pad">
            <div className="card-row">
              <div>
                <div className="card-title">Order #{o.id}</div>
                <div className="muted small">Address: {o.delivery_address}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div className="mt-12 row">
              <Link to={`/orders/${o.id}`}>Open details</Link>
              <div className="row-right">
                <Button variant="secondary" onClick={() => updateStatus(o.id, "picked_up")}>
                  Picked up
                </Button>
                <Button variant="success" onClick={() => updateStatus(o.id, "delivered")}>
                  Delivered
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && !error && active.length === 0 ? <div className="muted">No active assigned orders.</div> : null}
    </div>
  );
}
