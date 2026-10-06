import { useState } from "react";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authApi.changePassword(form);
      setForm({ oldPassword: "", newPassword: "" });
      setMsg({ type: "success", text: "Password changed successfully" });
    } catch (err) {
      setMsg({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="grid-2">
      <section className="card">
        <h2>Profile</h2>
        <div className="profile">
          <img src={user?.avatar?.url || "https://placehold.co/200x200"} alt="" className="avatar lg" />
          <div>
            <div className="strong">{user?.fullname || user?.username}</div>
            <div className="muted">@{user?.username}</div>
            <div className="muted">{user?.email}</div>
            <span className={`badge ${user?.isEmailVerified ? "done" : "todo"}`}>
              {user?.isEmailVerified ? "Email verified" : "Email not verified"}
            </span>
          </div>
        </div>
      </section>
      <section className="card">
        <h2>Change password</h2>
        <form onSubmit={submit} className="form">
          <Alert type={msg.type}>{msg.text}</Alert>
          <label>
            Current password
            <input
              type="password"
              required
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </label>
          <button className="btn primary">Update password</button>
        </form>
      </section>
    </div>
  );
}
