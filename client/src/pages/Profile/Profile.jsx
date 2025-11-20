// src/pages/Profile/Profile.jsx (or wherever you keep it)

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  Input,
  Button,
  Alert,
  Select,
  Checkbox,
  Switch,
  Spinner,
} from "../../components";
import VerifyBanner from "../Auth/VerifyBanner";

// If you have a preconfigured API client (axios, fetch wrapper), use that.
// For now, using window.fetch – adjust headers (Authorization) to your app.
async function apiGet(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // adjust if you use tokens instead of cookies
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const error = new Error(errBody.message || "Request failed");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function apiPatch(url, body) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const error = new Error(errBody.message || "Request failed");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export default function Profile() {
  const { user } = useAuth(); // expects user from /api/auth/me
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState(null);

  // Form state
  const [fullName, setFullName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.phoneNumber || "");
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [dob, setDob] = useState(""); // yyyy-mm-dd string
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [locale, setLocale] = useState("en-IN");
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(false);
  const [prefWhatsapp, setPrefWhatsapp] = useState(false);

  const [showDebug, setShowDebug] = useState(
    process.env.NODE_ENV === "development"
  );

  // Load profile on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await apiGet("/api/profile/me");
        if (cancelled) return;

        const p = data.profile || {};
        setProfile(p);

        const nameFull =
          p?.name?.full || p?.name?.first || user.name || fullName || "";
        const primaryPhone = p?.primaryPhone?.number || user.phoneNumber || "";

        setFullName(nameFull);
        setMobile(primaryPhone);
        setGender(p.gender || "PREFER_NOT_TO_SAY");

        if (p.dob) {
          // p.dob may be ISO string or Date; normalize to yyyy-mm-dd
          const d = new Date(p.dob);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            setDob(`${yyyy}-${mm}-${dd}`);
          }
        }

        setTimezone(p?.prefs?.timezone || "Asia/Kolkata");
        setLocale(p?.prefs?.locale || "en-IN");
        setPrefEmail(p?.prefs?.comms?.email ?? true);
        setPrefSms(p?.prefs?.comms?.sms ?? false);
        setPrefWhatsapp(p?.prefs?.comms?.whatsapp ?? false);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          // No profile yet → keep defaults, allow create on save
          setProfile(null);
        } else {
          setError(err.message || "Failed to load profile");
          console.log(err.message);
          
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleSave = async () => {
    if (!user?._id) return;

    setSaving(true);
    setError("");
    setSuccess("");

    // Build profile payload (matches profile.model.js)
    const profilePayload = {
      name: { full: fullName },
      dob: dob || null,
      gender,
      primaryPhone: { number: mobile },
      prefs: {
        timezone,
        locale,
        comms: {
          email: prefEmail,
          sms: prefSms,
          whatsapp: prefWhatsapp,
        },
      },
    };

    // Also patch base User for consistency (name + phoneNumber)
    const userPayload = {
      name: fullName,
      phoneNumber: mobile,
    };

    try {
      const [profileRes] = await Promise.all([
        apiPatch("/api/profile/me", profilePayload),
        apiPatch(`/api/users/${user._id}`, userPayload),
      ]);

      setProfile(profileRes.profile || null);
      setSuccess("Profile saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save profile");
      console.log(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || loading || !user;

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}
    >
      <Card title="Profile">
        <div className="pv-col" style={{ gap: 16 }}>
          

          {/* Verification status */}
          <VerifyBanner />

          {error && (
            <Alert type="danger" title="Error">
              {error}
            </Alert>
          )}
          {success && (
            <Alert type="success" title="Saved">
              {success}
            </Alert>
          )}

          {loading ? (
            <div
              className="pv-row"
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
                gap: 12,
              }}
            >
              <Spinner />
              <span style={{ color: "var(--pv-dim)" }}>Loading profile…</span>
            </div>
          ) : (
            <>
              {/* Basic info */}
              <div
                className="pv-row"
                style={{
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--pv-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {(fullName || user?.name || "U")
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="pv-col" style={{ flex: 1, minWidth: 220 }}>
                  <Input
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                  <Input
                    label="Mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91…"
                    style={{ marginTop: 8 }}
                  />
                </div>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <Input
                    label="Email"
                    value={user?.email || ""}
                    disabled
                    placeholder="Email"
                  />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "var(--pv-dim)",
                    }}
                  >
                    Email is managed from your login account.
                  </div>
                </div>
              </div>

              {/* Personal details */}
              <div
                className="pv-row"
                style={{ gap: 16, flexWrap: "wrap", marginTop: 8 }}
              >
                <div style={{ minWidth: 180, flex: 1 }}>
                  <Input
                    label="Date of birth"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div style={{ minWidth: 180, flex: 1 }}>
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
              </div>

              {/* Preferences */}
              <div
                className="pv-row"
                style={{
                  gap: 16,
                  flexWrap: "wrap",
                  marginTop: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ minWidth: 200, flex: 1 }}>
                  <Select
                    label="Timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </div>
                <div style={{ minWidth: 200, flex: 1 }}>
                  <Select
                    label="Language / Locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    <option value="en-IN">English (India)</option>
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">Hindi (India)</option>
                  </Select>
                </div>
              </div>

              {/* Communication preferences */}
              <div
                className="pv-col"
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--pv-card, #f7f7f9)",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Communication preferences
                </div>
                <div
                  className="pv-row"
                  style={{ gap: 16, flexWrap: "wrap" }}
                >
                  <Checkbox
                    label="Email"
                    checked={prefEmail}
                    onChange={(checked) => setPrefEmail(!!checked)}
                  />
                  <Checkbox
                    label="SMS"
                    checked={prefSms}
                    onChange={(checked) => setPrefSms(!!checked)}
                  />
                  <Checkbox
                    label="WhatsApp"
                    checked={prefWhatsapp}
                    onChange={(checked) => setPrefWhatsapp(!!checked)}
                  />
                </div>
                <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                  We’ll only use these channels for important account updates
                  and financial insights you opt into.
                </div>
              </div>

              {/* Actions */}
              <div
                className="pv-row"
                style={{
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <Switch
                  checked={showDebug}
                  onChange={setShowDebug}
                  label="Show debug JSON"
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    // simple reset to last loaded profile
                    if (!profile) {
                      setFullName(user?.name || "");
                      setMobile(user?.phoneNumber || "");
                      setGender("PREFER_NOT_TO_SAY");
                      setDob("");
                      setTimezone("Asia/Kolkata");
                      setLocale("en-IN");
                      setPrefEmail(true);
                      setPrefSms(false);
                      setPrefWhatsapp(false);
                    } else {
                      const p = profile;
                      const nameFull =
                        p?.name?.full ||
                        p?.name?.first ||
                        user?.name ||
                        "";
                      const primaryPhone =
                        p?.primaryPhone?.number || user?.phoneNumber || "";
                      setFullName(nameFull);
                      setMobile(primaryPhone);
                      setGender(p.gender || "PREFER_NOT_TO_SAY");

                      if (p.dob) {
                        const d = new Date(p.dob);
                        if (!isNaN(d.getTime())) {
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const dd = String(d.getDate()).padStart(2, "0");
                          setDob(`${yyyy}-${mm}-${dd}`);
                        }
                      } else {
                        setDob("");
                      }

                      setTimezone(p?.prefs?.timezone || "Asia/Kolkata");
                      setLocale(p?.prefs?.locale || "en-IN");
                      setPrefEmail(p?.prefs?.comms?.email ?? true);
                      setPrefSms(p?.prefs?.comms?.sms ?? false);
                      setPrefWhatsapp(p?.prefs?.comms?.whatsapp ?? false);
                    }
                    setSuccess("");
                    setError("");
                  }}
                  disabled={isDisabled}
                >
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={isDisabled}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>

              {/* Dev-only raw JSON (user + profile) */}
              {showDebug && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--pv-card, #f5f5f5)",
                    fontFamily: "monospace",
                    fontSize: 13,
                    overflowX: "auto",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 6,
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    Debug JSON (user + profile) – safe to comment out in prod
                  </div>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify({ user, profile }, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
