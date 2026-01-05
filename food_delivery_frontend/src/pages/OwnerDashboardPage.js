import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function OwnerDashboardPage() {
  /** This is a public function. */
  const { api } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [newRestaurant, setNewRestaurant] = useState({ name: "", slug: "", description: "" });
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 9.99, is_available: true });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMyRestaurants();
      setRestaurants(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    } catch (err) {
      setError(err.message || "Failed to load your restaurants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRestaurant(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const created = await api.createRestaurant(newRestaurant);
      setInfo(`Created restaurant: ${created.name}`);
      setNewRestaurant({ name: "", slug: "", description: "" });
      await reload();
    } catch (err) {
      setError(err.message || "Failed to create restaurant");
    }
  }

  async function createMenuItem(e) {
    e.preventDefault();
    if (!selectedId) {
      setError("Select a restaurant first.");
      return;
    }
    setError("");
    setInfo("");
    try {
      const created = await api.createMenuItem(selectedId, {
        name: newItem.name,
        description: newItem.description || null,
        price: Number(newItem.price),
        is_available: Boolean(newItem.is_available)
      });
      setInfo(`Created menu item: ${created.name}`);
      setNewItem({ name: "", description: "", price: 9.99, is_available: true });
    } catch (err) {
      setError(err.message || "Failed to create menu item");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="title">Owner dashboard</h1>
        <p className="subtitle">Manage restaurants and menu items.</p>
      </div>

      {loading ? <div className="muted">Loading...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {info ? <div className="alert alert-success">{info}</div> : null}

      <div className="grid grid-2">
        <Card className="card-pad">
          <h3 className="card-title">Your restaurants</h3>

          <div className="field">
            <span className="label">Select restaurant</span>
            <select
              className="input"
              value={selectedId || ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              <option value="" disabled>
                Select...
              </option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.slug})
                </option>
              ))}
            </select>
          </div>

          {!restaurants.length ? <div className="muted small">No restaurants yet.</div> : null}
        </Card>

        <Card className="card-pad">
          <h3 className="card-title">Create restaurant</h3>
          <form onSubmit={createRestaurant} className="form">
            <label className="field">
              <span className="label">Name</span>
              <input
                className="input"
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span className="label">Slug</span>
              <input
                className="input"
                value={newRestaurant.slug}
                onChange={(e) => setNewRestaurant((p) => ({ ...p, slug: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span className="label">Description</span>
              <input
                className="input"
                value={newRestaurant.description}
                onChange={(e) => setNewRestaurant((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
            <Button type="submit">Create</Button>
          </form>
        </Card>

        <Card className="card-pad">
          <h3 className="card-title">Create menu item</h3>
          <form onSubmit={createMenuItem} className="form">
            <label className="field">
              <span className="label">Name</span>
              <input
                className="input"
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span className="label">Description</span>
              <input
                className="input"
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">Price</span>
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                required
              />
            </label>

            <Button type="submit" variant="success">
              Add item
            </Button>

            <div className="muted small">
              Note: full menu management (edit/delete/toggle availability) can be added as next step.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
