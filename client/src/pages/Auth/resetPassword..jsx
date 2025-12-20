import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaCheckCircle, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_SERVER_URL;

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false); // spinner for sending OTP
  const [securityCode, setSecurityCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false); // otp verified flag
  const [otpVerifying, setOtpVerifying] = useState(false); // spinner for verifying otp
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false); // spinner for reset password button
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    let value = e.target.value.toLowerCase().trim();

    // Check for duplicates like: test@example.comtest@example.com
    const emailRegex = /^([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\1+$/i;
    const match = value.match(emailRegex);
    if (match) {
      value = match[1]; // Extract the first instance
    }

    setEmail(value);
  };

  const sendOtp = async () => {
    setError("");
    setSuccess("");
    setOtpVerified(false);
    setSecurityCode("");
    if (!email) {
      setError("Email is required.");
      return;
    }

    setOtpSending(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setOtpSending(false);

      if (res.ok) {
        setOtpSent(true);
        setSuccess("OTP sent to your email.");
        toast.success("OTP sent successfully!");
      } else {
        const { message } = await res.json();
        setError(message || "Failed to send OTP.");
        toast.error(message || "Failed to send OTP.");
      }
    } catch (err) {
      setOtpSending(false);
      setError("Error sending OTP.", err);
      toast.error("Error sending OTP.");
    }
  };

  // Verify OTP when user enters 6 digits
  useEffect(() => {
    const verifyOtp = async () => {
      if (securityCode.length !== 6) {
        setOtpVerified(false);
        return;
      }

      setOtpVerifying(true);
      setError("");
      setSuccess("");

      try {
        const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp: securityCode }),
        });

        setOtpVerifying(false);

        if (res.ok) {
          setOtpVerified(true);
          setSuccess("OTP verified.");
          toast.success("OTP verified!");
        } else {
          const { message } = await res.json();
          setOtpVerified(false);
          setError(message || "Invalid OTP.");
          toast.error(message || "Invalid OTP.");
        }
      } catch (err) {
        setOtpVerifying(false);
        setOtpVerified(false);
        setError("Error verifying OTP.");
        toast.error("Error verifying OTP.");
      }
    };

    if (otpSent) {
      verifyOtp();
    }
  }, [securityCode, otpSent, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Please enter a valid OTP before resetting password.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("New password and confirmation are required.");
      return;
    }

  
    setResetLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: securityCode,
          newPassword,
        }),
      });

      setResetLoading(false);

      if (res.ok) {
        setSuccess("Password reset successfully!");
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500); // Navigate after 1.5 seconds to let user see the message
      } else {
        const { message } = await res.json();
        setError(message || "Failed to reset password.");
        toast.error(message || "Failed to reset password.");
      }
    } catch (err) {
      setResetLoading(false);
      setError("Server error while resetting password.");
      toast.error("Server error while resetting password.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        {!otpSent ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={handleEmailChange}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                disabled={otpSending}
              />
            </div>
            <button
              type="button"
              onClick={sendOtp}
              disabled={otpSending}
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {otpSending && <FaSpinner className="spin" />}
              Get OTP
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "10px", position: "relative" }}>
              <label>Enter OTP</label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) =>
                  !otpVerified && setSecurityCode(e.target.value.trim())
                }
                required
                maxLength={6}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                disabled={otpVerified}
              />
              {otpVerifying && (
                <FaSpinner
                  className="spin"
                  style={{ position: "absolute", right: 10, top: 45 }}
                />
              )}
              {otpVerified && (
                <FaCheckCircle
                  color="green"
                  size={20}
                  style={{ position: "absolute", right: 10, top: 40 }}
                  title="OTP Verified"
                />
              )}
            </div>
            <div style={{ marginBottom: "10px", position: "relative" }}>
              <label>New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  paddingRight: "40px",
                }}
                disabled={!otpVerified}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px",
                  cursor: "pointer",
                  color: "#555",
                  fontSize: "18px",
                }}
                title={showPassword ? "Hide PIN" : "Show PIN"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Re-enter New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                disabled={!otpVerified}
              />
            </div>
            <button
              type="submit"
              disabled={resetLoading || !otpVerified}
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {resetLoading && <FaSpinner className="spin" />}
              Reset Password
            </button>
          </>
        )}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
        )}
      </form>

      {/* Spinner animation CSS */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
