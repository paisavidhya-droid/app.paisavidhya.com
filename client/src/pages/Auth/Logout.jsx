// src/pages/Auth/Logout.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components";
import toast from "react-hot-toast";
import { FaHome, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
// import axiosInstance from "../../api/axios"; // only if you have a server /logout endpoint

export default function Logout() {
  const { LogoutUser } = useAuth();
  const navigate = useNavigate();
  //   const loc = useLocation();

  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;
    LogoutUser();
    toast.success("Logout successful");
  }, [LogoutUser]);

  //   const goLogin = () =>
  //     navigate("/auth", {
  //       replace: true,
  //       state: { from: loc.state?.from ?? "/" },
  //     });

  return (
    <div style={styles.pageWrapper} aria-live="polite">
      <div style={styles.logoutBox}>
        <FaSignOutAlt size={50} style={styles.icon} />
        <h2 style={styles.heading}>You have been logged out</h2>
        <p style={styles.subtext}>Let's proceed with our tasks!</p>

        <div
          className="pv-row"
          style={{ gap: 10, justifyContent: "center", marginTop: 12 }}
        >
          <Button onClick={() => navigate("/", { replace: true })}>
            Go home <FaHome size={20} />
          </Button>
          <Button onClick={() => navigate("/auth", { replace: true })}>
            Login again <FaSignInAlt size={20} />
          </Button>
        </div>
        <div style={styles.footer}>
          <p>
            Need help?{" "}
            <a href="mailto:contact@paisavidhya.com">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "var(--pv-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  logoutBox: {
    backgroundColor: "var(--pv-surface)",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    color: "var(--pv-text)",
  },
  icon: {
    color: "#d9534f",
    marginBottom: "20px",
    transform: "scaleX(-1)",
  },
  heading: {
    fontSize: "22px",
    color: "var(--pv-text)",
    marginBottom: "10px",
  },
  subtext: {
    fontSize: "16px",
    color: "var(--pv-dim)",
    marginBottom: "25px",
  },
  footer: {
    marginTop: "30px",
    fontSize: "14px",
    color: "var(--pv-dim)",
  },
};
