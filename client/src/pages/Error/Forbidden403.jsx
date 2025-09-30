import { useMemo } from "react";
import { Card, Button, Badge, Tooltip } from "../../components";
import { useNavigate, Link } from "react-router-dom";

function ShieldSVG(props) {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 200 200"
      role="img"
      aria-labelledby="forbidden-illustration"
      {...props}
    >
      <title id="forbidden-illustration">Access denied illustration</title>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopOpacity="0.1" />
          <stop offset="1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#g1)" />
      <g transform="translate(40,30)">
        <path
          d="M60 0l52 20v54c0 29-19 56-52 68C27 130 8 103 8 74V20L60 0z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M60 8l44 17v49c0 26-17 50-44 61C33 124 16 100 16 74V25L60 8z"
          fill="currentColor"
          opacity="0.16"
        />
        <circle cx="60" cy="70" r="34" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.3"/>
        <path d="M38 92L82 48" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * 403 Forbidden Page
 * Props (all optional):
 * - homeHref: string       (default "/")
 * - supportHref: string    (e.g., "mailto:support@paisavidhya.com" or "/contact")
 * - canRetry: boolean      (show retry button)
 * - onRetry: () => void    (custom retry handler; default: navigate(0))
 * - requestId: string      (show request id for support)
 * - reason: string         (short developer-readable reason)
 */
export default function Forbidden403({
  homeHref = "/",
  supportHref = "/contact",
  canRetry = false,
  onRetry,
  requestId,
  reason,
}) {
  const navigate = useNavigate();
  const retry = useMemo(
    () => onRetry || (() => navigate(0)),
    [onRetry, navigate]
  );

  return (
    <div className="pv-container" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <Card>
        <div className="pv-col" style={{ alignItems: "center", textAlign: "center", gap: 14, padding: 8 }}>
          <Badge>403 • Forbidden</Badge>

          <div style={{ color: "var(--pv-dim)" }}>
            You don’t have permission to view this page.
          </div>

          <div style={{ color: "var(--pv-dim)" }}>
            If you think this is a mistake, contact support with your request ID.
          </div>

          <div style={{ margin: "8px 0", color: "var(--pv-fg)" }}>
            <ShieldSVG style={{ color: "var(--pv-fg-muted)" }} />
          </div>

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
            {canRetry && (
              <Button onClick={retry}>Retry</Button>
            )}
            <Link to={homeHref}>
              <Button variant="ghost">Go Home</Button>
            </Link>
            {supportHref && (
              <a href={supportHref} target={supportHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                <Button variant="ghost">Contact Support</Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
