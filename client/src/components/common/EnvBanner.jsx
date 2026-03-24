import { Badge } from "../../components";
import { useHealth } from "../../hooks/useHealth";

export default function EnvBanner() {
  const health = useHealth();

  const frontendEnv = import.meta.env.MODE;
  const backendEnv = health.data?.nodeEnv;

  const isProd =
    frontendEnv === "production" || backendEnv === "production";

  return (
    <div
      style={{
        position: "sticky",
        top: 12,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: isProd ? "#fff4f4" : "#fffbe9",
          border: `1px solid ${isProd ? "#f3b3b3" : "#f2d67c"}`,
          borderRadius: 12,
          padding: "8px 12px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <strong
          style={{
            fontSize: 13,
            color: isProd ? "#b42318" : "#9a6700",
            letterSpacing: 0.3,
          }}
        >
          {isProd ? "PRODUCTION" : "DEVELOPMENT"}
        </strong>

        <Badge>FE: {frontendEnv || "-"}</Badge>
        <Badge>BE: {health.loading ? "..." : backendEnv || "-"}</Badge>
      </div>
    </div>
  );
}