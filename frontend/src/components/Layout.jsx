import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [healthy, setHealthy] = useState(null);

  useEffect(() => {
    authApi
      .healthcheck()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          ⛺ Project Camp
        </Link>
        <nav>
          <NavLink to="/" end>
            Projects
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="topbar-right">
          <span className={`health ${healthy === null ? "" : healthy ? "ok" : "down"}`} title="API health">
            ● API {healthy === null ? "…" : healthy ? "online" : "offline"}
          </span>
          <span className="muted">@{user?.username}</span>
          <button className="btn ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      {user && user.isEmailVerified === false && <VerifyBanner />}
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

function VerifyBanner() {
  const [msg, setMsg] = useState("");
  const resend = async () => {
    try {
      await authApi.resendVerification();
      setMsg("Verification email sent.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not send email");
    }
  };
  return (
    <div className="banner">
      Your email is not verified.{" "}
      <button className="link" onClick={resend}>
        Resend verification email
      </button>
      {msg && <span> — {msg}</span>}
    </div>
  );
}
