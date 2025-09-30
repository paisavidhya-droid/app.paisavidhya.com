
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/ui.css";
import { Card, Button, Input, Badge, Tooltip } from "../../components";
// import { useAuth } from "../../context/auth";

function Bubbles() {
  // lightweight background accents (no libs)
  return (
    <svg
      width="100%" height="100%" viewBox="0 0 600 400"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <circle cx="520" cy="60" r="80" fill="url(#g1)" />
      <circle cx="100" cy="320" r="110" fill="url(#g1)" />
      <circle cx="300" cy="160" r="60" fill="url(#g1)" />
    </svg>
  );
}

const NotFound404 = () => {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();


  const goHome = () => navigate("/");
  const goBack = () => (window.history.length > 1 ? navigate(-1) : goHome());
  // const goDashboard = () => navigate("/dashboard");

  return (
    <div
      className="pv-container"
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        position: "relative",
        color: "var(--pv-fg)"
      }}
    >
      <Bubbles />
      <Card>
        <div className="pv-col" style={{ gap: 18, minWidth: 280, maxWidth: 720, position: "relative" }}>
          {/* Header */}
          <div className="pv-col" style={{ textAlign: "center", gap: 8 }}>
            <div style={{ fontSize: 64, lineHeight: 1, fontWeight: 900, letterSpacing: 1 }}>
              4<span style={{ opacity: 0.5 }}>0</span>4
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Oops, page not found</div>
            <div style={{ color: "var(--pv-dim)" }}>
              We couldn’t find <code style={{ background: "var(--pv-bg-muted)", padding: "2px 6px", borderRadius: 6 }}>{loc.pathname}</code>.  
              It might have been moved, renamed, or it never existed.
            </div>
          </div>

          {/* Smart suggestions */}
          <div
            className="pv-row"
            style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Tooltip content="Go to the homepage">
              <Button onClick={goHome}>Go Home</Button>
            </Tooltip>

            {/* {user && (
              <Tooltip content="Open your dashboard">
                <Button variant="ghost" onClick={goDashboard}>Dashboard</Button>
              </Tooltip>
            )} */}

            <Tooltip content="Return to the previous page">
              <Button variant="ghost" onClick={goBack}>Go Back</Button>
            </Tooltip>
          </div>

         

          {/* Helpful footer note */}
          <div
            className="pv-row"
            style={{ justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}
          >
            <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
              Need help? Reach us from your dashboard or the contact page.
            </div>
            <Badge>Privacy-first</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default NotFound404;

{/* // import { Link } from "react-router-dom";
import "./Error.css";

// import { FaSignInAlt } from "react-icons/fa";

export const Error = () => {
  return (
    <>
      <section id="error-page">
        <div className="err-content">
          <h2>404</h2>
          <h4>Sorry! Page not found</h4>
          <p style={{ margin: "20px" }}>
            Oops! It seems like the page you were trying to access doesn't
            exist. If you believe there is an issue, feel free to report it, and
            we'll look into it
          </p>
        </div>
        <Link to="/" className="combined-btn">
          Back to Login
          <div className="btn-icon">
            <FaSignInAlt />
          </div>
        </Link>
        <span style={{marginTop:'8px', fontSize:'20px'}}>or</span>
        
         <div className="lgt-footer" style={{marginTop:'0'}}> 
        <p> Report  <a href="https://wa.me/99999999">Contact support</a> on Whats App
          </p></div> 
      </section>
    </>
  );
};*/}
