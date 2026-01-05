import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function RestaurantListPage() {
  /** This is a public function. */
  const { api } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.listRestaurants();
        if (mounted) setRestaurants(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load restaurants");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => `${r.name} ${r.slug} ${r.description || ""}`.toLowerCase().includes(q));
  }, [restaurants, query]);

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1 className="title">Restaurants</h1>
          <p className="subtitle">Pick a restaurant to browse its menu.</p>
        </div>
        <div className="row-right">
          <input
            className="input"
            placeholder="Search restaurants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? <div className="muted">Loading...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="grid grid-3">
        {filtered.map((r) => (
          <Card key={r.id} className="card-pad">
            <div className="card-row">
              <h3 className="card-title">{r.name}</h3>
              <span className={r.is_open ? "badge badge-success" : "badge badge-muted"}>
                {r.is_open ? "open" : "closed"}
              </span>
            </div>
            <p className="card-text">{r.description || "No description provided."}</p>
            <Link to={`/restaurants/${r.id}`}>
              <Button>View menu</Button>
            </Link>
          </Card>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 ? <div className="muted">No restaurants found.</div> : null}
    </div>
  );
}
