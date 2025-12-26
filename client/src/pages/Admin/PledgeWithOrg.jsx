// src/pages/PledgeWithOrg.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Badge, Skeleton, Alert } from "../components";
import { getOrgByCodePublic } from "../services/orgService";

export default function PledgeWithOrg() {
  const { orgCode } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrgByCodePublic(orgCode);
        if (!cancelled) setOrg(data);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setError("This partner link is invalid or not active.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [orgCode]);

  const handleGenerateCertificate = () => {
    const apiBase = import.meta.env.VITE_API_SERVER_URL;
    const url = `${apiBase}/api/pledge/take?orgCode=${orgCode}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="pv-container"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <Card>
        {loading ? (
          <div className="pv-col" style={{ gap: 12 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="80%" />
            <Skeleton height={140} />
          </div>
        ) : error ? (
          <Alert type="danger">{error}</Alert>
        ) : (
          <>
            <div
              className="pv-row"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div className="pv-row" style={{ gap: 10, alignItems: "center" }}>
                {org.logoUrl && (
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      objectFit: "cover",
                    }}
                  />
                )}
                <div className="pv-col" style={{ gap: 2 }}>
                  <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                    Financial Literacy Pledge
                  </div>
                  <h1 style={{ margin: 0, fontSize: 22 }}>
                    In association with {org.name}
                  </h1>
                  {org.tagline && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--pv-dim)",
                      }}
                    >
                      {org.tagline}
                    </div>
                  )}
                </div>
              </div>
              <Badge>Partner code: {org.shortCode}</Badge>
            </div>

            <div style={{ height: 16 }} />

            <div className="pv-col" style={{ gap: 10 }}>
              <p style={{ color: "var(--pv-dim)" }}>
                This session is conducted by{" "}
                <strong>Paisavidhya</strong> in collaboration with{" "}
                <strong>{org.name}</strong>. By taking this pledge, you commit
                to applying the financial concepts learned today and building
                better money habits.
              </p>

              <ul style={{ paddingLeft: 18, color: "var(--pv-dim)" }}>
                <li>
                  Use your **real name** and email/phone in your profile so the
                  certificate reflects correctly.
                </li>
                <li>
                  Your certificate will carry the line{" "}
                  <strong>“In association with {org.name}”</strong>.
                </li>
              </ul>

              <Button onClick={handleGenerateCertificate}>
                Take Pledge & Download Certificate
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
