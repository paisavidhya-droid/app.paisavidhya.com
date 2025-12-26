import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  FaCheckCircle,
  FaCopy,
  FaLink,
  FaRegFilePdf,
  FaShareAlt,
} from "react-icons/fa";
import PledgeShareCard from "../../components/PledgeShareCard";
import { toPng } from "html-to-image";
import { getMyProfile } from "../../services/profileService";
const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN || window.location.origin;

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
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // --- Load real profile for completion % ---
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        const data = await getMyProfile();
        if (!active) return;
        setProfile(data || null);
      } catch (err) {
        console.error("Profile load error on dashboard", err);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);
  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    // Define "important fields" that count towards completion
    const fields = [
      profile?.name?.first,
      profile?.name?.last,
      profile?.dob,
      profile?.gender,

      profile?.primaryPhone?.number || user?.phoneNumber,

      profile?.kyc?.pan,
      profile?.kyc?.residencyStatus,
      profile?.kyc?.annualIncomeSlab,
      profile?.kyc?.occupation,

      profile?.address?.line1,
      profile?.address?.city,
      profile?.address?.state,
      profile?.address?.pincode,

      profile?.bank?.accountHolderName,
      profile?.bank?.accountNumber,
      profile?.bank?.ifsc,

      profile?.nominee?.name,
      profile?.nominee?.relation,
      profile?.nominee?.dob,
    ];

    const total = fields.length;
    const filled = fields.filter(
      (v) => v !== null && v !== undefined && String(v).trim() !== ""
    ).length;

    if (total === 0) return 0;
    return Math.min(100, Math.round((filled / total) * 100));
  }, [profile, user?.phoneNumber]);

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

  const [autoPrompted, setAutoPrompted] = useState(false);

  useEffect(() => {
    if (user && !user?.pledge?.taken && !autoPrompted) {
      setShowPledgeModal(true);
      setAutoPrompted(true);
    }
  }, [user, autoPrompted]);

  // --- Pledge clauses (single source of truth for modal) ---
  const pledgeClauses = useMemo(
    () => [
      `I will stay away from “get-rich-quick” traps and misleading schemes.`,
      `I will avoid high-interest loans, instant loan apps, and unnecessary EMIs.`,
      `I will understand interest, fees, tenure, penalties, and total repayment before I commit.`,
      `I will protect my digital financial security (no OTP/PIN/password sharing or screen-sharing access).`,
      `I will verify legitimacy before I pay or invest, using trusted sources and documentation.`,
      `I will protect my personal data (PAN/Aadhaar/bank details) and share it only when necessary via secure channels.`,
      `I will build strong money habits and encourage financial safety in my community.`,
    ],
    []
  );

  // Track per-clause agreement
  const [clauseChecks, setClauseChecks] = useState(() =>
    Array(pledgeClauses.length).fill(false)
  );

  // Final “I agree” checkbox
  const [agreeAll, setAgreeAll] = useState(false);

  // Derived counts
  const checkedCount = useMemo(
    () => clauseChecks.filter(Boolean).length,
    [clauseChecks]
  );

  const allClausesChecked = checkedCount === pledgeClauses.length;

  // Gate submit (must satisfy both)
  const canSubmitPledge = allClausesChecked && agreeAll && !pledgeLoading;

  const toggleClause = (idx) => {
    setClauseChecks((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const setAllClauses = (checked) => {
    setClauseChecks(Array(pledgeClauses.length).fill(checked));
    if (!checked) setAgreeAll(false); // if user unselects all, reset final agree
  };

  // When opening the modal, reset checks (optional but recommended)
  useEffect(() => {
    if (showPledgeModal) {
      setClauseChecks(Array(pledgeClauses.length).fill(false));
      setAgreeAll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPledgeModal]);

  const viewCertificate = () => {
    const certId = user?.pledge?.certificateId;
    if (!certId) {
      toast.error("Certificate ID not found. Please verify pledge again.");
      return;
    }

    const API_BASE = import.meta.env.VITE_API_SERVER_URL || "";
    const pdfUrl = `${API_BASE}/api/certificates/${encodeURIComponent(
      certId
    )}/pdf`;

    window.open(pdfUrl, "_blank", "noreferrer");
  };

  const [showShareModal, setShowShareModal] = useState(false);

  const certId = user?.pledge?.certificateId;

  const shareCardRef = useRef(null);

  // --------- SHARE CONFIG ---------
  const pledgeLink = `https://paisavidhya.com/financial-safety-pledge`;
  const verifyLink = certId
    ? `${APP_ORIGIN}/verify/${encodeURIComponent(certId)}`
    : null;

  const shareMessage =
    `I’ve taken the “Financial Discipline & Safety Pledge” with PAISAVIDHYA ` +
    `to stay away from loan traps, scams and risky schemes and to follow smart money habits.\n\n` +
    `✅ Take your pledge here: ${pledgeLink}` +
    (verifyLink
      ? `\n\n🔎 You can verify my certificate here: ${verifyLink}`
      : "");

  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(shareMessage);
  const xUrl =
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareMessage);

  const generateShareImageFile = async () => {
    if (!shareCardRef.current) return null;
    try {
      const dataUrl = await toPng(shareCardRef.current, { cacheBust: true });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "paisavidhya-pledge.png", {
        type: "image/png",
      });
      return file;
    } catch (err) {
      console.error("Failed to generate share image", err);
      return null;
    }
  };

  // const handleShareClick = async () => {
  //   // 1. Try native share (best UX on phone + modern desktop)
  //   if (typeof navigator !== "undefined" && navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: "Financial Safety Pledge with PAISAVIDHYA",
  //         text: shareMessage,
  //         // url: shareUrl,
  //       });
  //       return; // done, no modal
  //     } catch (err) {
  //       if (err?.name === "AbortError") return; // user cancelled, no fallback
  //       console.error("Native share error", err);
  //       // continue to fallback modal below
  //     }
  //   }

  //   // 2. Fallback: open modal with links & copy text
  //   setShowShareModal(true);
  // };

  const handleShareClick = async () => {
    // 0. Try to generate the share image (card)
    const file = await generateShareImageFile();

    // 1. Best case: native share with image support (Web Share API v2)
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      file &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title: "Financial Safety Pledge with PAISAVIDHYA",
          text: shareMessage,
          files: [file],
        });
        return; // shared successfully
      } catch (err) {
        if (err?.name === "AbortError") return; // user cancelled, don't fallback
        console.error("Native share error", err);
        // we'll go to fallback below
      }
    } else if (file) {
      // 2. Fallback if we can't pass it into navigator.share: download image once
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paisavidhya-pledge.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Pledge image downloaded. Attach it when you share.");
    }

    // 3. Final fallback: open existing modal with links + caption
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

        const certId = res?.certificateId; // NEW

        // Beautiful success popup
        const result = await Swal.fire({
          title: "Pledge Completed 🎉",
          html: `
    <p style="margin-bottom:8px;">
      Thank you, <b>${user?.name || "Investor"}</b>, for taking the
      <b>Financial Discipline & Safety Pledge</b>.
    </p>

    ${
      certId
        ? `<p style="margin:10px 0; font-size:14px;">
             <b>Certificate ID:</b> <span style="font-family:monospace">${certId}</span>
           </p>
           <p style="font-size:13px; color:#6b7280;">
             Verify anytime using this ID on Paisavidhya.
           </p>`
        : `<p style="font-size:13px; color:#6b7280;">
             Certificate ID is not available yet. Please try View Certificate once.
           </p>`
    }
  `,
          icon: "success",
          showCancelButton: true,
          showDenyButton: true,
          showConfirmButton: true,
          confirmButtonText: "View Certificate",
          denyButtonText: "Share with Friends",
          cancelButtonText: "Close",
        });

        if (result.isConfirmed) {
          await viewCertificate();
        } else if (result.isDenied) {
          await handleShareClick();
          // if (certId) {
          //   window.open(verifyUrl, "_blank"); // NEW
          // } else {
          //   await handleShareClick();
          // }
        }
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

  const copyCertId = async () => {
    if (!certId) return;
    try {
      await navigator.clipboard.writeText(certId);
      toast.success("Certificate ID copied");
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  };

  const copyVerifyLink = async () => {
    if (!certId) return;
    const link = `${APP_ORIGIN}/verify/${encodeURIComponent(certId)}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Verify link copied");
    } catch {
      toast.error("Copy failed.");
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
            <Button as={Link} to="/pfc" className="pv-btn">
              Start your financial Checkup
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
      {/* <Row>
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
      </Row> */}

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
            </div>
          </Card>

          {Array.isArray(summary?.customerTips) &&
            summary.customerTips.length > 0 && (
              <Card title="Next steps">
                <div className="pv-col" style={{ gap: 8 }}>
                  {!user?.pledge?.taken && (
                    <Alert type="warning">
                      Take the pledge to unlock your certificate and
                      verification link.
                    </Alert>
                  )}

                  {summary.customerTips.map((t, i) => (
                    <Alert key={i} type={t.type || "info"}>
                      {t.message}
                    </Alert>
                  ))}
                </div>
              </Card>
            )}

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

        <Col style={{ flex: "1 1 360px" }}>
          {user?.pledge?.taken && (
            <Card title="Financial Safety Pledge">
              <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
                {certId && (
                  <div
                    style={{
                      padding: 10,
                      border: "1px solid var(--pv-border)",
                      borderRadius: 8,
                      background: "var(--pv-bg)",
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                          Certificate ID
                        </div>
                        <div
                          style={{ fontFamily: "monospace", fontWeight: 700 }}
                        >
                          {certId}
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Button variant="ghost" onClick={copyCertId}>
                          <FaCopy /> Copy ID
                        </Button>
                        <Button variant="ghost" onClick={copyVerifyLink}>
                          <FaLink />
                          Copy Verify Link
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={viewCertificate} variant="ghost">
                  <FaRegFilePdf size={16} />
                  View Certificate
                </Button>

                {user?.pledge?.certificateId && (
                  <Button
                    variant="ghost"
                    as="a"
                    // href={`${APP_ORIGIN}/verify/${user.pledge.certificateId}`}
                    href={`${APP_ORIGIN}/verify/${encodeURIComponent(
                      user.pledge.certificateId
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaCheckCircle size={16} />
                    Verify Certificate
                  </Button>
                )}

                <Button variant="ghost" onClick={handleShareClick}>
                  <FaShareAlt />
                  Share My Pledge
                </Button>
              </div>
            </Card>
          )}
          {/* <Card title="Profile completion">
            <Stat
              label="Profile completion"
              value={`${summary?.profileCompletion ?? 0}%`}
              hint={<Progress value={summary?.profileCompletion ?? 0} />}
            />
          </Card> */}
          <Card title="Profile completion">
            <Stat
              value={
                profileLoading ? "Calculating..." : `${profileCompletion}%`
              }
              hint={<Progress value={profileLoading ? 0 : profileCompletion} />}
            />
            {!profileLoading && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--pv-dim)",
                  marginTop: 6,
                  padding: "0 14px 8px",
                }}
              >
                Complete your KYC, address, bank and nominee details in{" "}
                <Link
                  to="/profile"
                  style={{
                    color: "var(--pv-primary)",
                    textDecoration: "underline",
                  }}
                >
                  My Profile
                </Link>{" "}
                to reach 100%.
              </div>
            )}
          </Card>

          {/* <Card title="Overview">
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
          </Card> */}
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
            <Button onClick={submitPledge} disabled={!canSubmitPledge}>
              {pledgeLoading
                ? "Saving..."
                : allClausesChecked
                ? "Complete My Pledge"
                : `Agree to all (${checkedCount}/${pledgeClauses.length})`}
            </Button>
          </>
        }
      >
        <div className="pledge-text">
          <p style={{ fontSize: 14, color: "var(--pv-dim)" }}>
            By accepting this pledge, you commit to safer, disciplined money
            habits.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              margin: "10px 0 8px",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
              {checkedCount}/{pledgeClauses.length} agreed
            </div>

            <Button
              variant="ghost"
              onClick={() => setAllClauses(!allClausesChecked)}
              disabled={pledgeLoading}
            >
              {allClausesChecked ? "Unselect all" : "Select all"}
            </Button>
          </div>

          <div className="pv-col" style={{ gap: 10 }}>
            {pledgeClauses.map((text, idx) => (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 10,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  background: clauseChecks[idx] ? "#f0fdf4" : "#fff", // light success tint
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={clauseChecks[idx]}
                  onChange={() => toggleClause(idx)}
                  disabled={pledgeLoading}
                  style={{ marginTop: 4 }}
                />
                <span style={{ fontSize: 14, lineHeight: 1.35 }}>{text}</span>
              </label>
            ))}

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: agreeAll ? "#eff6ff" : "#fff",
                cursor: allClausesChecked ? "pointer" : "not-allowed",
                opacity: allClausesChecked ? 1 : 0.6,
                marginTop: 6,
              }}
            >
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={() => setAgreeAll((v) => !v)}
                disabled={!allClausesChecked || pledgeLoading}
                style={{ marginTop: 4 }}
              />
              <span style={{ fontSize: 14, lineHeight: 1.35 }}>
                I confirm that I have read and agree to all of the above.
                <div
                  style={{ fontSize: 12, color: "var(--pv-dim)", marginTop: 4 }}
                >
                  Note: This pledge is educational and does not replace
                  professional financial, legal, or tax advice.
                </div>
              </span>
            </label>
            {!allClausesChecked && (
              <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                Please agree to all pledge points to continue.
              </div>
            )}
          </div>
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
      {/* Hidden share card for image generation */}
      <div
        style={{
          position: "fixed",
          inset: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {user?.pledge?.taken && (
          <PledgeShareCard ref={shareCardRef} user={user} certId={certId} />
        )}
      </div>
    </div>
  );
}
