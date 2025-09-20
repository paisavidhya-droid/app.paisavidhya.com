// src/pages/Auth/RoleRedirect.jsx
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Card, Spinner, Badge } from "../../components";



// src/pages/Auth/RoleRedirect.jsx
// const { user } = useAuth();

// const needsVerification = !user?.phoneVerified || !user?.emailVerified;

// const dest =
//   needsVerification ? "/verify" :
//   role === "admin" ? "/admin" :
//   role === "staff" ? "/staff" :
//   "/dashboard";


export default function RoleRedirect() {
  const { user } = useAuth();            // ProtectedRoute guarantees user exists
  const navigate = useNavigate();

  const { path, label, firstName } = useMemo(() => {
   const role = String(user?.role ?? "").toLowerCase(); 
    const dest =
      role === "admin" ? "/admin" :
      role === "staff" ? "/staff" :
      "/dashboard";
    return {
      path: dest,
      label: role === "admin" ? "Admin dashboard"
            : role === "staff" ? "Staff workspace"
            : "your dashboard",
      firstName: user?.name?.split(" ")[0] || "there",
    };
  }, [user]);

  useEffect(() => {
    if (!user) return; // extra guard
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const t = setTimeout(() => navigate(path, { replace: true }), reduce ? 0 : 650);
    return () => clearTimeout(t);
  }, [user, path, navigate]);

  return (
    <div
      className="pv-auth-shell"
      style={{ minHeight: "70dvh", display: "grid", placeContent: "center", padding: 24 }}
      aria-live="polite"
    >
      <Card>
        <div className="pv-col" style={{ gap: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Welcome to Paisavidhya</div>
          <div style={{ color: "var(--pv-dim)" }}>
            Hi {firstName} — taking you to {label}…
          </div>
          <div className="pv-row" style={{ gap: 8, justifyContent: "center", alignItems: "center", marginTop: 8 }}>
            <Spinner size={18} />
            <Badge>Secure</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
