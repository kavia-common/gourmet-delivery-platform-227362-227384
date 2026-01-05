import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

/**
 * PUBLIC_INTERFACE
 */
export function RestaurantMenuPage() {
  /** This is a public function. */
  const { restaurantId } = useParams();
  const rid = Number(restaurantId);

  const { api } = useAuth();
  const { addItem } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.listMenuItems(rid);
        if (mounted) setMenuItems(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load menu");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (Number.isFinite(rid)) load();
    return () => {
      mounted = false;
    };
  }, [api, rid]);

  const available = useMemo(() => menuItems.filter((m) => m.is_available), [menuItems]);

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1 className="title">Menu</h1>
          <p className="subtitle">Add items to cart and checkout when ready.</p>
        </div>
        <div className="row-right">
          <Link to="/cart">
            <Button variant="success">Go to cart</Button>
          </Link>
        </div>
      </div>

      {loading ? <div className="muted">Loading...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="grid grid-3">
        {available.map((m) => (
          <Card key={m.id} className="card-pad">
            <h3 className="card-title">{m.name}</h3>
            <p className="card-text">{m.description || "No description."}</p>
            <div className="card-row">
              <span className="price">${Number(m.price).toFixed(2)}</span>
              <Button onClick={() => addItem(m, 1)}>Add</Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && !error && available.length === 0 ? <div className="muted">No available items.</div> : null}
    </div>
  );
}
