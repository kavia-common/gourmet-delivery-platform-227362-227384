import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

/**
 * PUBLIC_INTERFACE
 */
export function HomePage() {
  /** This is a public function. */
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="title">Order from local favorites</h1>
        <p className="subtitle">
          Browse restaurants, add items to your cart, checkout, and track your order in real time.
        </p>
      </div>

      <div className="grid grid-3">
        <Card>
          <h3 className="card-title">Browse Restaurants</h3>
          <p className="card-text">Find restaurants and explore their menus.</p>
          <Link to="/restaurants">
            <Button>Explore</Button>
          </Link>
        </Card>

        <Card>
          <h3 className="card-title">Your Orders</h3>
          <p className="card-text">View history and order details.</p>
          <Link to={isAuthenticated ? "/orders" : "/login"}>
            <Button variant="success">Go</Button>
          </Link>
        </Card>

        <Card>
          <h3 className="card-title">Dashboards</h3>
          <p className="card-text">Owner and delivery personnel tools.</p>
          <div className="stack">
            <Link to={role === "restaurant" ? "/owner" : "/login"}>
              <Button variant="secondary">Restaurant Owner</Button>
            </Link>
            <Link to={role === "delivery" ? "/delivery" : "/login"}>
              <Button variant="secondary">Delivery</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
