import { useMemo } from "react";
import { Card, Button, Badge, Tooltip } from "../../components";
import { useNavigate, Link } from "react-router-dom";

function LockSVG(props) {
  return (
    <svg width="140" height="140" viewBox="0 0 200 200" role="img" aria-labelledby="unauth-illustration" {...props}>
      <title id="unauth-illustration">Unauthorized illustration</title>
      <defs>
        <linearGradient id="g401" x1="0" x2="1">
          <stop offset="0" stopOpacity="0.1" />
          <stop offset="1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#g401)" />
      <g transform="translate(60,45)" stroke="currentColor">
        <rect x="16" y="48" width="84" height="58" rx="10" fill="none" strokeWidth="8" opacity="0.35"/>
        <path d="M36,48v-10a24,24 0 0 1 48,0v10" fill="none" strokeWidth="8" opacity="0.35"/>
        <circle cx="58" cy="78" r="6" fill="currentColor"/>
        <path d="M58 84v16" strokeWidth="6" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

/**
 * 401 Unauthorized
 * Props:
 * - homeHref?: string (default "/")
 * - loginHref?: string (default "/login")
 * - canRetry?: boolean
 * - onRetry?: () => void
 * - requestId?: string
 * - reason?: string
 */
export default function Unauthorized401({
  homeHref = "/",
  loginHref = "/auth",
  canRetry = false,
  onRetry,
  requestId,
  reason,
}) {
  const navigate = useNavigate();
  const retry = useMemo(() => onRetry || (() => navigate(0)), [onRetry, navigate]);

  return (
    <div className="pv-container" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <Card>
        <div className="pv-col" style={{ alignItems: "center", textAlign: "center", gap: 14, padding: 8 }}>
          <Badge>401 • Unauthorized</Badge>
          <div style={{ color: "var(--pv-dim)" }}>
            You need to sign in to access this page.
          </div>

          <LockSVG style={{ color: "var(--pv-fg-muted)" }} />

          {requestId && (
            <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
              <span className="pv-dim">Request ID:</span>
              <code className="pv-code" style={{ fontSize: 12 }}>{requestId}</code>
              {reason && (
                <Tooltip content={reason}>
                  <span className="pv-dim" aria-label="More details" title={reason}>ℹ️</span>
                </Tooltip>
              )}
            </div>
          )}

          <div className="pv-row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {canRetry && <Button onClick={retry}>Retry</Button>}
            <Link to={loginHref}><Button>Sign In</Button></Link>
            <Link to={homeHref}><Button variant="ghost">Go Home</Button></Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
