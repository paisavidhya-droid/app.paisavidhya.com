import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, Button, Alert, Skeleton } from "../../components";
import { verifyCertificate as verifyCertificateApi } from "../../services/certificateService";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const json = await verifyCertificateApi(certificateId);
        if (!alive) return;
        setData(json.certificate);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [certificateId]);

  const API_BASE = import.meta.env.VITE_API_SERVER_URL; // http://localhost:5000 in dev

  const pdfUrl = `${API_BASE}/api/certificates/${encodeURIComponent(
    certificateId
  )}/pdf`;

  const downloadPdf = async () => {
    try {
      const res = await fetch(pdfUrl, {
        // credentials: "include", // only if your backend uses cookies auth (not needed for public route)
      });

      if (!res.ok) throw new Error("Failed to download PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Unable to download PDF");
    }
  };

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}
    >
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
              Certificate Verification
            </div>
            <h1 style={{ margin: "6px 0 0", fontSize: 24 }}>
              Paisavidhya Verification Portal
            </h1>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--pv-dim)" }}>
              Certificate ID: <b>{certificateId}</b>
            </div>
          </div>
          <div>
            <Badge>Public</Badge>
          </div>
        </div>
      </Card>

      {loading && (
        <div style={{ marginTop: 14 }}>
          <Skeleton height={120} />
        </div>
      )}

      {err && (
        <div style={{ marginTop: 14 }}>
          <Alert type="error">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Not verified</div>
            <div>{err}</div>
          </Alert>
        </div>
      )}

      {data && (
        <div style={{ marginTop: 14 }}>
          <Card
            title={
              data.status === "active"
                ? "✅ Certificate Verified"
                : "⚠️ Certificate Not Active"
            }
          >
            <div className="pv-col" style={{ gap: 10 }}>
              <div>
                <b>Name:</b> {data.name}
              </div>
              <div>
                <b>Pledge:</b> {data.pledgeTitle}
              </div>
              <div>
                <b>Issued on:</b>{" "}
                {new Date(data.issuedAt).toLocaleDateString("en-IN")}
              </div>
              <div>
                <b>Status:</b> <Badge>{data.status}</Badge>
              </div>
              <div style={{ color: "var(--pv-dim)", fontSize: 13 }}>
                Issued by: <b>{data.issuedBy}</b>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                <Button as="a" href={pdfUrl} target="_blank" rel="noreferrer">
                  View Certificate PDF
                </Button>
                <Button onClick={downloadPdf} variant="ghost">
                  Download PDF
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <Alert type="info">
              Tip: Always verify certificates via this page. QR codes will
              always point here.
            </Alert>
          </Card>
        </div>
      )}
    </div>
  );
}
