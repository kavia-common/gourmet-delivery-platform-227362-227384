import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

/**
 * PUBLIC_INTERFACE
 */
export function NotFoundPage() {
  /** This is a public function. */
  return (
    <div className="page narrow">
      <Card className="card-pad">
        <h1 className="title">404</h1>
        <p className="subtitle">This page doesn’t exist.</p>
        <Link to="/">Go home</Link>
      </Card>
    </div>
  );
}
