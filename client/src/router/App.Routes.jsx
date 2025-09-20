// src/routes/AppRoutes.jsx
import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Error } from "../pages/Error/Error";
// import { ROLES } from "../auth/AuthContext";
import ProtectedRoute from "../pages/Auth/ProtectedRoute";
import RequireRole from "../pages/Auth/RequireRole";
import RoleRedirect from "../pages/Auth/RoleRedirect";
import AppLayout from "../Layout/AppLayout";
import UIComponents from "../pages/UIComponents";
import Logout from "../pages/Auth/Logout";
import Verify from "../pages/Auth/Verify";
import VerifyEmailLink from "../pages/Auth/VerifyEmailLink";
// import RequireRole from "../auth/RequireRole";

// Lazy-load pages (keeps bundles small)
const Home = lazy(() => import("../pages/Home/Home"));
const AuthPage = lazy(() => import("../pages/Auth/AuthPage"));
const AdminDashboard = lazy(() => import("../pages/Dashboards/AdminDashboard"));
const StaffDashboard = lazy(() => import("../pages/Dashboards/StaffDashboard"));
const CustomerDashboard = lazy(() =>
  import("../pages/Dashboards/CustomerDashboard")
);
const Profile = lazy(() => import("../pages/Profile/Profile"));
// const Leads = lazy(()=>import("../pages/Leads"));
const Forbidden = lazy(() => import("../pages/Forbidden/Forbidden"));
// const NotFound = lazy(()=>import("../pages/NotFound"));

// Single source of roles (or import from a constants file)
const ROLES = { ADMIN: "admin", STAFF: "staff", CUSTOMER: "customer" };

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/ui" element={<UIComponents />} />
        <Route path="/verify-email" element={<VerifyEmailLink />} />

        {/* Authenticated area */}
        {/* Protected (any logged-in) */}
        <Route element={<ProtectedRoute />}>
          {/* Role-based landing after login */}
          <Route path="/start" element={<RoleRedirect />} />

          <Route path="/verify" element={<Verify />} />

          {/* CUSTOMER area: /dashboard */}
          <Route
            path="/dashboard"
            element={
              <RequireRole roles={[ROLES.CUSTOMER, ROLES.STAFF, ROLES.ADMIN]} />
            }
          >
            <Route index element={<CustomerDashboard />} />
            {/* Example nested:
                  <Route path="leads" element={<Leads />} /> */}
          </Route>

          {/* Staff workspace */}
          <Route
            path="/staff"
            element={<RequireRole roles={[ROLES.STAFF, ROLES.ADMIN]} />}
          >
            <Route index element={<StaffDashboard />} />
            {/* <Route path="leads" element={<StaffLeads />} /> */}
          </Route>

          {/* Admin workspace*/}
          <Route path="/admin" element={<RequireRole roles={[ROLES.ADMIN]} />}>
            <Route index element={<AdminDashboard />} />
            {/* <Route path="users" element={<AdminUsers />} /> */}
          </Route>

          {/* Common authenticated */}
          <Route path="/profile" element={<Profile />} />

          {/* Leads (staff+admin) 
          <Route
            path="/leads"
            element={
              <RequireRole allow={[ROLES.STAFF, ROLES.ADMIN]}>
                <Leads/>
              </RequireRole>
            }
          />*/}
        </Route>

        {/* Default redirects / 404 */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}
