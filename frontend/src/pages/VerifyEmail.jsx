import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import AuthShell from "./AuthShell";

export default function VerifyEmail() {
  const { verificationToken } = useParams();
  const [state, setState] = useState({ status: "loading", message: "" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    authApi
      .verifyEmail(verificationToken)
      .then(() => setState({ status: "ok", message: "Your email has been verified." }))
      .catch((err) => setState({ status: "error", message: getErrorMessage(err) }));
  }, [verificationToken]);

  return (
    <AuthShell title="Email verification" footer={<Link to="/">Continue to Project Camp</Link>}>
      {state.status === "loading" ? (
        <p className="muted">Verifying…</p>
      ) : (
        <Alert type={state.status === "ok" ? "success" : "error"}>{state.message}</Alert>
      )}
    </AuthShell>
  );
}
