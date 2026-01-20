// src/pages/Auth/Verify.jsx
import { useEffect, useState } from "react";
import { Card, Button, Alert, Badge } from "../../components";
import OtpPin from "../../components/ui/OtpPin";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailVerifyLink,
} from "../../services/verifyService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ResendTimer({ seconds = 30, onResend }) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    if (t <= 0) return;
    const id = setTimeout(() => setT((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  return (
    <div className="pv-row" style={{ gap: 8 }}>
      <Button
        variant="ghost"
        disabled={t > 0}
        onClick={() => {
          onResend?.();
          setT(seconds);
        }}
      >
        Resend {t > 0 ? `(${t}s)` : ""}
      </Button>
      <Badge>Secure</Badge>
    </div>
  );
}

export default function Verify() {
  const { user, authenticateUser } = useAuth();
  const navigate = useNavigate();

  const [phoneErr, setPhoneErr] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    // if everything already verified, bounce
    if (user.phoneVerified && user.emailVerified)
      navigate("/start", { replace: true });
  }, [user, navigate]);

  const needPhone = !user?.phoneVerified;
  const needEmail = !user?.emailVerified;

  // Kick off first phone OTP automatically
  useEffect(() => {
    if (!needPhone) return;
    (async () => {
      try {
        setSendErr("");
        await sendPhoneOtp();
        toast.success("OTP sent to your phone");
      } catch (e) {
        setSendErr(e.message);
        toast.error(e.message);
      }
    })();
  }, [needPhone]);

  // const handleResendPhone = async () => {
  //   try {
  //     setSendErr("");
  //     await sendPhoneOtp();
  //     toast.success("OTP re-sent");
  //   } catch (e) {
  //     setSendErr(e.message);
  //     toast.error(e.message);
  //   }
  // };
  const handleResendPhone = async () => {
    await toast.promise(sendPhoneOtp(), {
      loading: "Sending OTP...",
      success: "OTP sent successfully 📩",
      error: (err) =>
        err?.response?.data?.message || err?.message || "Failed to send OTP",
    });
  };

  const handleVerifyPhone = async (code) => {
    setPhoneErr("");
    try {
      setSubmitting(true);
      await verifyPhoneOtp(code);
      toast.success("Phone verified");
      const updated = await authenticateUser();

      // ✅ Auto-send email link after phone verification
      if (!updated?.emailVerified) {
        try {
          await sendEmailVerifyLink();
          toast.success("Verification link sent to your email");
        } catch {
          toast.error("Failed to send verification email");
        }
      }
    } catch (e) {
      setPhoneErr(e?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setSubmitting(false);
    }
  };

  // const handleResendEmail = async () => {
  //   try {
  //     await sendEmailVerifyLink();
  //     toast.success("Verification link resent");
  //   } catch (e) {
  //     toast.error(e?.response?.data?.message || "Failed to send link");
  //   }
  // };

  const handleResendEmail = async () => {
    await toast.promise(sendEmailVerifyLink(), {
      loading: "Sending verification email...",
      success: "Verification email sent successfully ✅",
      error: (err) =>
        err?.response?.data?.message || err?.message || "Failed to send email",
    });
  };

  return (
    <div
      className="pv-auth-shell"
      style={{
        minHeight: "70dvh",
        display: "grid",
        placeContent: "center",
        padding: 24,
      }}
    >
      <Card>
        <div className="pv-col" style={{ gap: 16, padding: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            Verify your account
          </div>

          {/* Step A: Phone */}
          {needPhone ? (
            <>
              <div style={{ color: "var(--pv-dim)" }}>
                We sent a 6-digit code to{" "}
                <b
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {user?.phoneNumber}
                </b>
                .
              </div>
              {sendErr && (
                <Alert type="warning" title="Couldn’t send OTP">
                  {sendErr}
                </Alert>
              )}
              {phoneErr && (
                <Alert type="danger" title="Phone verification failed">
                  {phoneErr}
                </Alert>
              )}
              <OtpPin autoFocus disabled={submitting} onComplete={handleVerifyPhone} />
              <ResendTimer onResend={handleResendPhone} />
            </>
          ) : (
            <Alert type="success" title="Phone verified">
              Your phone number is verified.
            </Alert>
          )}

          {/* Step B: Email */}
          {needEmail && !needPhone && (
            <div className="pv-col" style={{ gap: 10, marginTop: 10 }}>
              <div style={{ color: "var(--pv-dim)" }}>
                We’ve emailed a verification link to <b>{user?.email}</b>. Open
                it on this device.
              </div>
              <div className="pv-row">
                <ResendTimer onResend={handleResendEmail} />
                <Button
                  variant="ghost"
                  onClick={() => navigate("/start", { replace: true })}
                >
                  Verify later
                </Button>
              </div>
            </div>
          )}

          {/* Done */}
          {!needPhone && !needEmail && (
            <Button onClick={() => navigate("/start", { replace: true })}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
