import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createOrderTrackingSocket } from "../api/client";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function OrderDetailsPage() {
  /** This is a public function. */
  const { orderId } = useParams();
  const oid = Number(orderId);

  const { api, role } = useAuth();

  const [order, setOrder] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [error, setError] = useState("");
  const [trackingMode, setTrackingMode] = useState("poll+ws");

  const wsRef = useRef(null);

  const allowedTransitions = useMemo(() => {
    const current = String(order?.status || "").toLowerCase();
    if (!current) return [];

    if (role === "restaurant") {
      // As per backend description: restaurants can move to preparing/...
      return ["confirmed", "preparing"].filter((s) => s !== current);
    }
    if (role === "delivery") {
      return ["picked_up", "delivered"].filter((s) => s !== current);
    }
    if (role === "customer") {
      return current === "pending" ? ["cancelled"] : [];
    }
    return [];
  }, [order?.status, role]);

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setError("");
      try {
        const data = await api.getOrder(oid);
        if (mounted) setOrder(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load order");
      }
    }

    if (Number.isFinite(oid)) loadOrder();

    return () => {
      mounted = false;
    };
  }, [api, oid]);

  // Polling (authorised)
  useEffect(() => {
    let timer = null;
    let stopped = false;

    async function poll() {
      if (stopped || !Number.isFinite(oid)) return;
      try {
        const info = await api.getOrderStatus(oid);
        setStatusInfo(info);
      } catch (err) {
        setError(err.message || "Failed to fetch status");
      } finally {
        timer = window.setTimeout(poll, 3000);
      }
    }

    poll();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [api, oid]);

  // WebSocket subscription (unauthenticated demo endpoint per backend)
  useEffect(() => {
    if (!Number.isFinite(oid)) return;

    const ws = createOrderTrackingSocket({ apiBaseUrl: api.baseUrl, orderId: oid });
    wsRef.current = ws;

    ws.onopen = () => setTrackingMode("poll+ws");
    ws.onerror = () => setTrackingMode("poll (ws error)");
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        // Expected: {order_id, status, payment_status} or similar
        setStatusInfo((prev) => ({ ...(prev || {}), ...msg }));
      } catch (e) {
        // ignore
      }
    };

    return () => {
      try {
        ws.close();
      } catch (e) {
        // ignore
      }
    };
  }, [api.baseUrl, oid]);

  async function changeStatus(nextStatus) {
    setError("");
    try {
      const updated = await api.updateOrderStatus(oid, { status: nextStatus, message: `Status set to ${nextStatus}` });
      setOrder(updated);
      // statusInfo will be refreshed by polling/ws
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  }

  const status = statusInfo?.status || order?.status;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="title">Order #{oid}</h1>
        <p className="subtitle">
          Tracking mode: <span className="mono">{trackingMode}</span>
        </p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <Card className="card-pad">
        <div className="card-row">
          <div>
            <div className="muted small">Status</div>
            <div className="mt-8">
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="right">
            <div className="muted small">Payment</div>
            <div className="mt-8 mono">{statusInfo?.payment_status || order?.payment_status || "unknown"}</div>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-2">
          <div>
            <div className="muted small">Delivery address</div>
            <div className="mt-8">{order?.delivery_address || "-"}</div>
          </div>
          <div>
            <div className="muted small">Total</div>
            <div className="mt-8">${Number(order?.total_amount || 0).toFixed(2)}</div>
          </div>
        </div>

        {allowedTransitions.length ? (
          <>
            <div className="divider" />
            <div className="row">
              <div className="muted small">Update status</div>
              <div className="row-right">
                {allowedTransitions.map((s) => (
                  <Button key={s} variant="secondary" onClick={() => changeStatus(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </Card>

      <div className="mt-12" />

      <Card className="card-pad">
        <h3 className="card-title">Items</h3>
        <div className="stack">
          {(order?.items || []).map((it) => (
            <div key={it.id} className="row">
              <span>
                {it.quantity}× {it.name_snapshot}
              </span>
              <span className="row-right mono">${Number(it.price_snapshot).toFixed(2)}</span>
            </div>
          ))}
          {!order?.items?.length ? <div className="muted">No items found.</div> : null}
        </div>
      </Card>
    </div>
  );
}
