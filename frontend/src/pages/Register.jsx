import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import AuthShell from "./AuthShell";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.username !== form.username.toLowerCase() || form.username.length < 4) {
      setError("Username must be lowercase and at least 4 characters long");
      return;
    }
    setBusy(true);
    try {
      await authApi.register(form);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle="We sent you a verification email. Verify your account, then log in.">
        <Link to="/login" className="btn primary block">
          Go to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="form">
        <Alert>{error}</Alert>
        <label>
          Full name <span className="muted">(optional)</span>
          <input value={form.fullName} onChange={set("fullName")} />
        </label>
        <label>
          Username
          <input required minLength={4} value={form.username} onChange={set("username")} placeholder="lowercase, 4+ chars" />
        </label>
        <label>
          Email
          <input type="email" required value={form.email} onChange={set("email")} />
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={set("password")} />
        </label>
        <button className="btn primary" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
