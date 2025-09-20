// src/pages/Auth/VerifyEmailLink.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { Card, Alert, Button, Spinner } from "../../components";
import toast from "react-hot-toast";

export default function VerifyEmailLink() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading|ok|fail

  useEffect(() => {
    const token = search.get("token");
    if (!token) {
      setStatus("fail");
      return;
    }
    (async () => {
      try {
        await axiosInstance.post("/api/auth/verify-email", { token });
        setStatus("ok");
        toast.success("Email verified!");
      } catch {
        setStatus("fail");
      } finally {
        const clean = window.location.pathname;
        window.history.replaceState({}, "", clean);
      }
    })();
  }, [search]);

  return (
    <div
      className="pv-auth-shell"
      style={{
        minHeight: "70dvh",
        display: "grid",
        placeContent: "center",
        padding: 24,
      }}
    >
      <Card>
        {status === "loading" && (
          <div className="pv-row" style={{ gap: 8, padding: 20 }}>
            <Spinner /> Verifying…
          </div>
        )}
        {status == "ok" && (
          <div className="pv-col" style={{ gap: 16, padding: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              All set!
            </div>
            <Alert type="success" title="Phone verified">
              Your phone number is verified.
            </Alert>
            <Alert type="success" title="Email verified">
              {" "}
              Your Email is verified.
            </Alert>
            <Button onClick={() => navigate("/start", { replace: true })}>
              Continue
            </Button>
          </div>
        )}
        {status === "fail" && (
          <div
            className="pv-col"
            style={{ gap: 12, padding: 20, textAlign: "center" }}
          >
            <Alert type="danger" title="Verification failed">
              Link is invalid or expired.
            </Alert>
            <Button onClick={() => navigate("/verify")}>Try again</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
