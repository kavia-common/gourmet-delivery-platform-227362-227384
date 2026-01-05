import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 */
export function RegisterPage() {
  /** This is a public function. */
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await register({ email, full_name: fullName, password, role });
      setSuccess("Account created. You can now login.");
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <Card className="card-pad">
        <h1 className="title">Create account</h1>
        <p className="subtitle">Register as a customer, restaurant owner, or delivery personnel.</p>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="label">Full name</span>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="field">
            <span className="label">Password (min 8 chars)</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <label className="field">
            <span className="label">Role</span>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="customer">Customer</option>
              <option value="restaurant">Restaurant owner</option>
              <option value="delivery">Delivery personnel</option>
            </select>
          </label>

          <Button disabled={submitting} type="submit" className="w-full">
            {submitting ? "Creating..." : "Create account"}
          </Button>

          <p className="help">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
