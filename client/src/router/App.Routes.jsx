// src/routes/AppRoutes.jsx
import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../pages/Auth/ProtectedRoute";
import RequireRole from "../pages/Auth/RequireRole";
import RoleRedirect from "../pages/Auth/RoleRedirect";
import AppLayout from "../Layout/AppLayout";
import UIComponents from "../pages/UIComponents";
import Logout from "../pages/Auth/Logout";
import Verify from "../pages/Auth/Verify";
import VerifyEmailLink from "../pages/Auth/VerifyEmailLink";
import CallbackForm from "../components/Leads/CallbackForm";
import Placeholder from "../components/ui/Placeholder";
import FFC from "../modules/FFC";
import FFCReport from "../modules/FFCReport";
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
const LeadsOps = lazy(() => import("../pages/Leads/LeadsOps"));
const LeadDetails = lazy(() => import("../pages/Leads/LeadDetails"));
const AdminAudit = lazy(() => import("../pages/Admin/AdminAudit"));
const AdminUsers = lazy(() => import("../pages/Admin/Users"));

// Error pages
const Unauthorized401 = lazy(() => import("../pages/Error/Unauthorized401"));
const Forbidden403 = lazy(() => import("../pages/Error/Forbidden403"));
const NotFound404 = lazy(() => import("../pages/Error/NotFound404"));


const PFC = lazy(() => import("../modules/PFC"));
const PFCReport = lazy(() => import("../modules/PFCReport"));

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
        <Route path="/ui" element={<UIComponents />} />
        <Route path="/verify-email" element={<VerifyEmailLink />} />
        <Route path="/request-callback" element={<CallbackForm />} />
        <Route path="/pfc" element={<PFC />} />
        <Route path="/pfc/report" element={<PFCReport />} />
        <Route path="/ffcc" element={<FFC />} />
        <Route path="/ffc/report" element={<FFCReport />} />

        <Route path="/ffc" element={<Placeholder label="FFC coming soon" />} />
        <Route path="/bfc" element={<Placeholder label="BFC coming soon" />} />

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
            <Route path="audit" element={<AdminAudit />} />
            <Route path="users" element={<AdminUsers />} />
            {/* Future admin pages 
            <Route path="billing" element={<div>Admin Billing (example)</div>} />
            <Route path="integrations" element={<div>Admin Integrations (example)</div>} />*/}
            <Route path="leads" element={<LeadsOps />} />
            <Route path="leads/:id" element={<LeadDetails />} />
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
        {/* Error routes */}
        <Route path="/401" element={<Unauthorized401 />} />
        <Route path="/403" element={<Forbidden403 />} />
        <Route path="/404" element={<NotFound404 />} />
        <Route path="*" element={<NotFound404 />} />
      </Route>
    </Routes>
  );
}
