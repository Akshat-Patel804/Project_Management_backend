import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import AuthShell from "./AuthShell";

export default function ResetPassword() {
  const { resetToken } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    try {
      await authApi.resetPassword(resetToken, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell title="Choose a new password" footer={<Link to="/login">Back to login</Link>}>
      {done ? (
        <Alert type="success">Password reset. You can now log in.</Alert>
      ) : (
        <form onSubmit={submit} className="form">
          <Alert>{error}</Alert>
          <label>
            New password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            Confirm password
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <button className="btn primary">Reset password</button>
        </form>
      )}
    </AuthShell>
  );
}
