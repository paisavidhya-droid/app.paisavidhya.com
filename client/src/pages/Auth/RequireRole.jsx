// src/pages/Auth/RequireRole.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RequireRole({ roles }) {
  const { user, isFetching,initialized } = useAuth();

  if (!initialized || isFetching) return <div style={{ padding: 32 }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const userRole = (user.role || "").toString().toLowerCase();
  const allowed = (roles || []).map(r => r.toString().toLowerCase());

  return allowed.includes(userRole)
    ? <Outlet />
    : <Navigate to="/403" replace />;
}
