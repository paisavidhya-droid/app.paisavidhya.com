// client\src\pages\certificates\FinancialSafetyPledge.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Button,
  Badge,
  Alert,
  Modal,
} from "../../components";
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
import * as userService from "../../services/userService";
import { useLocation } from "react-router-dom";
import { getOrgByCodePublic } from "../../services/orgService";

const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN || window.location.origin;

export default function FinancialSafetyPledge({ user }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const [partnerOrgCode, setPartnerOrgCode] = useState(null);
  const [partnerOrg, setPartnerOrg] = useState(null); // { name, shortCode, ... }
  const [partnerOrgLoading, setPartnerOrgLoading] = useState(false);

  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeLoading, setPledgeLoading] = useState(false);
  const [autoPrompted, setAutoPrompted] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const shareCardRef = useRef(null);

  const certId = user?.pledge?.certificateId;

  // ---------- Partner org code handling ----------
  useEffect(() => {
    // 1. Try query param
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("orgCode");

    if (codeFromUrl) {
      setPartnerOrgCode(codeFromUrl);
      localStorage.setItem("pv_partnerOrgCode", codeFromUrl);
    } else {
      // 2. Fallback to whatever we previously saved (e.g., from /pledge/:orgCode)
      const saved = localStorage.getItem("pv_partnerOrgCode");
      if (saved) {
        setPartnerOrgCode(saved);
      }
    }
  }, [location.search]);

  // ---------- Load partner org details (for UX text) ----------
  useEffect(() => {
    let active = true;

    async function loadOrg() {
      if (!partnerOrgCode) {
        setPartnerOrg(null);
        return;
      }

      try {
        setPartnerOrgLoading(true);
        const data = await getOrgByCodePublic(partnerOrgCode);
        if (!active) return;
        setPartnerOrg(data);
      } catch (err) {
        console.error("Failed to load partner org for pledge", err);
        if (active) setPartnerOrg(null); // silently ignore, just don't show association text
      } finally {
        if (active) setPartnerOrgLoading(false);
      }
    }

    loadOrg();
    return () => {
      active = false;
    };
  }, [partnerOrgCode]);

  // ---------- Auto-open pledge modal for new users ----------
  useEffect(() => {
    if (user && !user?.pledge?.taken && !autoPrompted) {
      setShowPledgeModal(true);
      setAutoPrompted(true);
    }
  }, [user, autoPrompted]);

  // ---------- Pledge clauses ----------
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

  const [clauseChecks, setClauseChecks] = useState(() =>
    Array(pledgeClauses.length).fill(false)
  );
  const [agreeAll, setAgreeAll] = useState(false);

  const checkedCount = useMemo(
    () => clauseChecks.filter(Boolean).length,
    [clauseChecks]
  );
  const allClausesChecked = checkedCount === pledgeClauses.length;
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
    if (!checked) setAgreeAll(false);
  };

  // Reset checkbox state when modal opens
  useEffect(() => {
    if (showPledgeModal) {
      setClauseChecks(Array(pledgeClauses.length).fill(false));
      setAgreeAll(false);
    }
  }, [showPledgeModal, pledgeClauses.length]);

  // ---------- Certificate actions ----------
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

  // ---------- Share setup ----------
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

  const handleShareClick = async () => {
    const file = await generateShareImageFile();

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
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Native share error", err);
      }
    } else if (file) {
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

  // ---------- Submit pledge ----------
  const submitPledge = async () => {
    try {
      setPledgeLoading(true);

      const payload = {};
      if (partnerOrgCode) {
        payload.orgCode = partnerOrgCode;
      }

      const res = await userService.takePledge(payload);

      if (res.success) {
        setShowPledgeModal(false);

        await dispatch(authenticateUser());
        toast.success("Your Financial Safety Pledge has been saved.");

        // Once pledged, clear partner org code (optional but keeps things clean)
        if (partnerOrgCode) {
          localStorage.removeItem("pv_partnerOrgCode");
          setPartnerOrgCode(null);
          setPartnerOrg(null);
        }

        const certId = res?.certificateId;

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

  // ---------- UI ----------
  return (
    <>
      {/* Certificate / pledge card on dashboard (right column) */}
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
                    <div style={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {certId}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

      {/* If user has NOT taken pledge yet, you still trigger modal from dashboard's "Take Financial Safety Pledge" button via setShowPledgeModal(true) */}
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

          {/* NEW: show association line when partner org is active */}
          {partnerOrg && (
            <Alert type="info" style={{ marginBottom: 8 }}>
              You are taking this pledge in association with{" "}
              <strong>{partnerOrg.name}</strong>.
            </Alert>
          )}

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
                  background: clauseChecks[idx] ? "#f0fdf4" : "#fff",
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
    </>
  );
}
