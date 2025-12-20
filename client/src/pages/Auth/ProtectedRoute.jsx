// client\src\pages\Auth\ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "../../components";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { isLoggedIn, isFetching, initialized } = useAuth();
  const loc = useLocation();

  if (!initialized || isFetching) {
    return (
      <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
        <Spinner size={28} />
      </div>
    );
  }
  // if (!isLoggedIn) {
  //   return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  // }
  const prettyLabel = (path) => {
    if (path.startsWith("/pfc")) return "PFC";
    if (path.startsWith("/ffc")) return "FFC";
    if (path.startsWith("/admin")) return "Admin dashboard";
    if (path.startsWith("/staff")) return "Staff workspace";
    return "this page";
  };

  if (!isLoggedIn) {
    const from = loc.pathname + loc.search;
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from, reason: "LOGIN_REQUIRED", label: prettyLabel(from) }}
      />
    );
  }

  return (
    <>
      {/* {error && <div style={{maxWidth:680, margin:"12px auto"}}><Alert type="warning">{error}</Alert></div>} */}
      <Outlet />
    </>
  );
}
