import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Badge,
  Alert,
  Progress,
  Skeleton,
  Tooltip,
  Modal,
} from "../../components";
import { useAuth } from "../../hooks/useAuth";
import * as userService from "../../services/userService";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { authenticateUser } from "../../app/slices/authSlice";

// Local tiny UI helpers (no shared imports)
function Stat({ label, value, hint }) {
  return (
    <div className="pv-card" style={{ padding: 14, flex: "1 1 200px" }}>
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{hint}</div>
      )}
    </div>
  );
}
const Row = ({ children }) => (
  <div className="pv-row" style={{ gap: 16, flexWrap: "wrap" }}>
    {children}
  </div>
);
const Col = ({ children, style }) => (
  <div className="pv-col" style={{ gap: 16, ...(style || {}) }}>
    {children}
  </div>
);

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // --- Dummy data only ---
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      const dummy = {
        leadsToday: 5,
        upcomingAppointments: 2,
        checkupsInProgress: 3,
        profileCompletion: 64,

        pipelineProgress: 70,
        pipelineStatus: "Live",
        pipelineLabel: "Leads → Appointments → Checkups",

        customerTips: [
          {
            type: "info",
            message: "Verify your mobile & email to secure your account.",
          },
          {
            type: "success",
            message: "Emergency fund at 4 months — aim for 6 months.",
          },
          { type: "warning", message: "KYC pending for MF linking." },
        ],
      };
      setSummary(dummy);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);
  // --- end dummy ---

  const pipelineProgress = useMemo(() => {
    if (!summary) return 0;
    if (typeof summary.pipelineProgress === "number") {
      return Math.max(0, Math.min(100, Math.round(summary.pipelineProgress)));
    }
    const total =
      (summary.totalLeads ?? 0) +
      (summary.totalAppointments ?? 0) +
      (summary.totalCheckups ?? 0);
    const done =
      (summary.completedLeads ?? 0) +
      (summary.completedAppointments ?? 0) +
      (summary.completedCheckups ?? 0);
    if (total <= 0) return 0;
    return Math.min(100, Math.round((done / total) * 100));
  }, [summary]);

  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeLoading, setPledgeLoading] = useState(false);

  const viewCertificate = async () => {
    try {
      const data = await userService.downloadCertificate();

      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      console.error("Certificate open error:", err);
      toast.error("Unable to generate certificate. Please try again.");
    }
  };

  const [showShareModal, setShowShareModal] = useState(false);
  


  // --------- SHARE CONFIG ---------
  const shareUrl = "https://paisavidhya.com"; // change to specific pledge page if needed

  const shareMessage =
    `I’ve taken the “Financial Discipline & Safety Pledge” with PAISAVIDHYA ` +
    `to stay away from loan traps, scams and risky schemes and to follow smart money habits. ` +
    `You can take your pledge here: ${shareUrl}`;

  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(shareMessage);
  const xUrl =
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareMessage);

  const handleShareClick = async () => {
    // 1. Try native share (best UX on phone + modern desktop)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Financial Safety Pledge with PAISAVIDHYA",
          text: shareMessage,
          url: shareUrl,
        });
        return; // done, no modal
      } catch (err) {
        if (err?.name === "AbortError") return; // user cancelled, no fallback
        console.error("Native share error", err);
        // continue to fallback modal below
      }
    }

    // 2. Fallback: open modal with links & copy text
    setShowShareModal(true);
  };

  const copyShareMessage = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard not supported");
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Share message copied. Paste it in any app to share!");
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Could not copy text. Please copy manually.");
    }
  };


  const submitPledge = async () => {
    try {
      setPledgeLoading(true);

      const res = await userService.takePledge();

      if (res.success) {
        setShowPledgeModal(false);

        // refresh logged-in user to update UI
        await dispatch(authenticateUser());

        // Optional small toast
        toast.success("Your Financial Safety Pledge has been saved.");

        // Beautiful success popup
        const result = await Swal.fire({
          title: "Pledge Completed 🎉",
          html: `
            <p style="margin-bottom:8px;">
              Thank you, <b>${user?.name || "Investor"}</b>, for taking the
              <b>Financial Discipline & Safety Pledge</b>.
            </p>
            <p style="font-size:14px; color:#6b7280;">
              This is your first step towards a safe, disciplined and
              long-term wealth journey with <b>Paisavidhya</b>.
            </p>
          `,
          icon: "success",
          confirmButtonText: "View My Certificate",
          showCancelButton: true,
          cancelButtonText: "Close",
          buttonsStyling: true,
        });

        // If they click "View My Certificate"
        if (result.isConfirmed) {
          await viewCertificate();
        }
        // else {
        //   // If you want to hard-refresh to get updated user.pledge in UI:
        //   window.location.reload();
        // }
      }
    } catch (err) {
      console.log(err);
      Swal.fire(
        "Error",
        "Error saving your pledge. Please try again.",
        "error"
      );
    } finally {
      setPledgeLoading(false);
    }
  };

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}
    >
      <Card>
        <div
          className="pv-row"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>Welcome</div>
            <h1 style={{ margin: 0, fontSize: 26 }}>
              {user?.name || "User"} <Badge>Customer</Badge>
            </h1>
          </div>
          <div className="pv-row" style={{ gap: 8 }}>
            <Button as={Link} to="/leads" className="pv-btn">
              Book Checkup
            </Button>
            <Button as={Link} to="/profile" variant="ghost">
              Complete profile
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Alert type="error" style={{ marginTop: 12 }}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Row>
        {loading ? (
          <>
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
          </>
        ) : (
          <>
            <Stat label="Leads today" value={summary?.leadsToday ?? 0} />
            <Stat
              label="Upcoming appointments"
              value={summary?.upcomingAppointments ?? 0}
            />
            <Stat
              label="Checkups in progress"
              value={summary?.checkupsInProgress ?? 0}
            />
            <Stat
              label="Profile completion"
              value={`${summary?.profileCompletion ?? 0}%`}
              hint={<Progress value={summary?.profileCompletion ?? 0} />}
            />
          </>
        )}
      </Row>

      <Row>
        <Col style={{ flex: "1 1 520px" }}>
          <Card title="Quick actions">
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Button as={Link} to="/pfc">
                Start PFC
              </Button>
              <Button variant="ghost" as={Link} to="/profile">
                Complete profile
              </Button>
              {!user?.pledge?.taken && (
                <Button onClick={() => setShowPledgeModal(true)}>
                  Take Financial Safety Pledge
                </Button>
              )}

              {user?.pledge?.taken && (
                <>
                  <Button onClick={viewCertificate} variant="ghost">
                    View Certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareClick}
                  >
                    Share My Pledge
                  </Button>
                </>
              )}
            </div>
          </Card>

          {Array.isArray(summary?.customerTips) &&
            summary.customerTips.length > 0 && (
              <Card title="Next steps">
                <div className="pv-col" style={{ gap: 8 }}>
                  {summary.customerTips.map((t, i) => (
                    <Alert key={i} type={t.type || "info"}>
                      {t.message}
                    </Alert>
                  ))}
                </div>
              </Card>
            )}
        </Col>

        <Col style={{ flex: "1 1 360px" }}>
          <Card title="Overview">
            <div className="pv-col" style={{ gap: 10 }}>
              <div
                className="pv-row"
                style={{ justifyContent: "space-between" }}
              >
                <span>PFC pipeline</span>
                <Badge>{summary?.pipelineStatus ?? "—"}</Badge>
              </div>
              <Progress value={loading ? 0 : pipelineProgress} />
              <div
                className="pv-row"
                style={{
                  justifyContent: "space-between",
                  color: "var(--pv-dim)",
                  fontSize: 12,
                }}
              >
                <span>Stage</span>
                <span>{summary?.pipelineLabel ?? "—"}</span>
              </div>
            </div>
          </Card>

          <Card title="Shortcuts">
            <div className="pv-col" style={{ gap: 8 }}>
              <Button as="a" href="/profile" variant="ghost">
                Edit profile
              </Button>
              <Button as="a" href="/calculators/sip" variant="ghost">
                SIP Calculator
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div
          className="pv-row"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontWeight: 800 }}>Your data is protected</div>
            <div style={{ color: "var(--pv-dim)" }}>
              End-to-end TLS. Consent-first access. Logged actions.
            </div>
          </div>
          <Tooltip content="View privacy & terms">
            <Badge>Privacy-first</Badge>
          </Tooltip>
        </div>
      </Card>
      {/* Pledge Modal */}
      <Modal
        isOpen={showPledgeModal}
        onClose={() => setShowPledgeModal(false)}
        title="Financial Discipline & Safety Pledge"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowPledgeModal(false)}
              disabled={pledgeLoading}
            >
              Cancel
            </Button>
            <Button onClick={submitPledge} disabled={pledgeLoading}>
              {pledgeLoading ? "Saving..." : "I Agree, Complete My Pledge"}
            </Button>
          </>
        }
      >
        <div
          className="pledge-text"
          style={{ maxHeight: 300, overflowY: "auto" }}
        >
          <p style={{ fontSize: 14, color: "var(--pv-dim)" }}>
            By accepting this pledge, you are committing to practice safe,
            disciplined money habits with Paisavidhya’s guidance.
          </p>
          <ul>
            <li>
              I will stay away from financial traps and misleading schemes.
            </li>
            <li>
              I will avoid instant loan apps & high-interest credit traps.
            </li>
            <li>I will borrow only when necessary & from legal sources.</li>
            <li>
              I will protect myself from online financial frauds & phishing.
            </li>
            <li>
              I will not allow greed or fear to influence financial decisions.
            </li>
            <li>I will follow smart money habits & maintain discipline.</li>
            <li>I will encourage others to stay financially safe.</li>
          </ul>
        </div>
      </Modal>

       {/* Share Modal */}
       <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share your Financial Safety Pledge"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
            <Button onClick={copyShareMessage}>Copy Message</Button>
          </>
        }
      >
        <div className="pv-col" style={{ gap: 12 }}>
          <p style={{ fontSize: 14, color: "var(--pv-dim)" }}>
            If share options didn’t open automatically, use these links to share
            your pledge:
          </p>

          <div className="pv-col" style={{ gap: 6 }}>
            <Button
              as="a"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
            >
              Share on WhatsApp
            </Button>
            <Button
              as="a"
              href={xUrl}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
            >
              Share on X (Twitter)
            </Button>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--pv-dim)",
              background: "#f9fafb",
              padding: 8,
              borderRadius: 6,
            }}
          >
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Post text:</div>
            <div>{shareMessage}</div>
          </div>

          <div style={{ fontSize: 11, color: "var(--pv-dim)" }}>
            Tip: Download your certificate and attach it as an image when you
            share your pledge.
          </div>
        </div>
      </Modal>
    </div>
  );
}
