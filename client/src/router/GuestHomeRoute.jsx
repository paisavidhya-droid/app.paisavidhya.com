// src/routes/GuestHomeRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Home from "../pages/Home/Home";

export default function GuestHomeRoute() {
  const { isLoggedIn, initialized, isFetching } = useAuth();

  // prevent flicker while auth bootstraps
  if (!initialized || isFetching) return null;

  if (isLoggedIn) {
    return <Navigate to="/start" replace />;
  }

  return <Home />;
}
