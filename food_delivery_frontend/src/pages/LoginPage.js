import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function LoginPage() {
  /** This is a public function. */
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from || "/", [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <Card className="card-pad">
        <h1 className="title">Login</h1>
        <p className="subtitle">Use your email and password to sign in.</p>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="label">Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <Button disabled={submitting} type="submit" className="w-full">
            {submitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="help">
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
