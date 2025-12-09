// src/pages/Profile/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/ui.css";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  Tabs,
} from "../../components";
import ModuleHeader from "../../components/ui/ModuleHeader.jsx";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, saveMyProfile } from "../../services/profileService";

const genderOptions = [
  { value: "", label: "Not specified" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const residencyOptions = [
  { value: "RESIDENT", label: "Resident" },
  { value: "NRI", label: "NRI" },
  { value: "HUF", label: "HUF" },
  { value: "NRO", label: "NRO" },
  { value: "NRE", label: "NRE" },
  { value: "OTHER", label: "Other" },
];

const pepOptions = [
  { value: "NOT_PEP", label: "Not a PEP" },
  { value: "PEP", label: "PEP" },
  { value: "RELATED_TO_PEP", label: "Related to a PEP" },
  { value: "UNKNOWN", label: "Unknown" },
];

const incomeOptions = [
  { value: "", label: "Select range" },
  { value: "<2.5L", label: "Below 2.5L" },
  { value: "2.5L-5L", label: "2.5L – 5L" },
  { value: "5L-10L", label: "5L – 10L" },
  { value: "10L-25L", label: "10L – 25L" },
  { value: ">25L", label: "Above 25L" },
];

function getInitials(name) {
  if (!name) return "PV";
  const parts = String(name).trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "P";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function displayValue(value, fallback = "Not set") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // local editable state – flatten nested objects we care about
  const [form, setForm] = useState({
    name: {
      first: "",
      last: "",
    },
    dob: "",
    gender: "",
    primaryPhone: {
      number: "",
    },
    kyc: {
      pan: "",
      residencyStatus: "RESIDENT",
      annualIncomeSlab: "",
      occupation: "",
      pepStatus: "NOT_PEP",
    },
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    bank: {
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
      branchName: "",
      accountType: "SAVINGS",
    },
    nominee: {
      name: "",
      relation: "",
      dob: "",
      sharePercent: 100,
    },
  });

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        if (!isMounted) return;
        setProfile(data || null);

        if (data) {
          setForm((prev) => ({
            ...prev,
            name: {
              first: data.name?.first || "",
              last: data.name?.last || "",
            },
            dob: data.dob ? data.dob.substring(0, 10) : "",
            gender: data.gender || "",
            primaryPhone: {
              number: data.primaryPhone?.number || user?.phoneNumber || "",
            },
            kyc: {
              pan: data.kyc?.pan || "",
              residencyStatus: data.kyc?.residencyStatus || "RESIDENT",
              annualIncomeSlab: data.kyc?.annualIncomeSlab || "",
              occupation: data.kyc?.occupation || "",
              pepStatus: data.kyc?.pepStatus || "NOT_PEP",
            },
            address: {
              line1: data.address?.line1 || "",
              line2: data.address?.line2 || "",
              city: data.address?.city || "",
              state: data.address?.state || "",
              pincode: data.address?.pincode || "",
              country: data.address?.country || "India",
            },
            bank: {
              accountHolderName: data.bank?.accountHolderName || "",
              accountNumber: data.bank?.accountNumber || "",
              ifsc: data.bank?.ifsc || "",
              bankName: data.bank?.bankName || "",
              branchName: data.bank?.branchName || "",
              accountType: data.bank?.accountType || "SAVINGS",
            },
            nominee: {
              name: data.nominee?.name || "",
              relation: data.nominee?.relation || "",
              dob: data.nominee?.dob ? data.nominee.dob.substring(0, 10) : "",
              sharePercent:
                typeof data.nominee?.sharePercent === "number"
                  ? data.nominee.sharePercent
                  : 100,
            },
          }));
        } else if (user) {
          // if no profile yet, at least set some basics from user
          setForm((prev) => ({
            ...prev,
            name: {
              first: user.name || "",
              last: "",
            },
            primaryPhone: {
              number: user.phoneNumber || "",
            },
          }));
        }
      } catch (e) {
        toast.error(e?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (path) => (e) => {
    const value =
      e?.target?.type === "number"
        ? e.target.value === ""
          ? ""
          : Number(e.target.value)
        : e?.target?.value ?? e;
    setForm((prev) => {
      const clone = structuredClone(prev);
      const keys = path.split(".");
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!obj[k]) obj[k] = {};
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const resetFormFromProfile = () => {
    if (!profile) return;
    setForm({
      name: {
        first: profile.name?.first || "",
        last: profile.name?.last || "",
      },
      dob: profile.dob ? profile.dob.substring(0, 10) : "",
      gender: profile.gender || "",
      primaryPhone: {
        number: profile.primaryPhone?.number || user?.phoneNumber || "",
      },
      kyc: {
        pan: profile.kyc?.pan || "",
        residencyStatus: profile.kyc?.residencyStatus || "RESIDENT",
        annualIncomeSlab: profile.kyc?.annualIncomeSlab || "",
        occupation: profile.kyc?.occupation || "",
        pepStatus: profile.kyc?.pepStatus || "NOT_PEP",
      },
      address: {
        line1: profile.address?.line1 || "",
        line2: profile.address?.line2 || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        pincode: profile.address?.pincode || "",
        country: profile.address?.country || "India",
      },
      bank: {
        accountHolderName: profile.bank?.accountHolderName || "",
        accountNumber: profile.bank?.accountNumber || "",
        ifsc: profile.bank?.ifsc || "",
        bankName: profile.bank?.bankName || "",
        branchName: profile.bank?.branchName || "",
        accountType: profile.bank?.accountType || "SAVINGS",
      },
      nominee: {
        name: profile.nominee?.name || "",
        relation: profile.nominee?.relation || "",
        dob: profile.nominee?.dob
          ? profile.nominee.dob.substring(0, 10)
          : "",
        sharePercent:
          typeof profile.nominee?.sharePercent === "number"
            ? profile.nominee.sharePercent
            : 100,
      },
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!editMode) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        dob: form.dob || null,
        gender: form.gender || "PREFER_NOT_TO_SAY",
        primaryPhone: form.primaryPhone,
        kyc: form.kyc,
        address: form.address,
        bank: form.bank,
        nominee: form.nominee,
      };
      const updated = await saveMyProfile(payload);
      setProfile(updated);
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (e) {
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const kycStatus = profile?.kyc?.kycStatus || "NOT_STARTED";
  const panPresent = !!profile?.kyc?.pan;

  const renderField = (label, value, fallback = "Not set") => (
    <div className="pv-col" style={{ gap: 2 }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", color: "var(--pv-dim)" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "var(--pv-text)" }}>
        {displayValue(value, fallback)}
      </span>
    </div>
  );

  return (
    <div className="pv-page">
      <ModuleHeader
        title="My Profile"
        subtitle="View and update your personal, KYC and bank details securely."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "My Profile" },
        ]}
      />

      <div
        className="pv-row"
        style={{
          alignItems: "flex-start",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Left column */}
        <div style={{ flex: "0 0 280px", maxWidth: 320 }}>
          <Card>
            <div
              className="pv-col"
              style={{ alignItems: "center", textAlign: "center", gap: 12 }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--pv-primary-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "var(--pv-primary)",
                }}
              >
                {initials}
              </div>
              <div className="pv-col" style={{ gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {profile?.name?.full ||
                    [form.name.first, form.name.last].filter(Boolean).join(" ") ||
                    user?.name ||
                    "Investor"}
                </div>
                <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
                  {user?.phoneNumber}
                </div>
              </div>

              <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
                <Badge
                  variant={user?.emailVerified ? "success" : "outline"}
                  label={user?.emailVerified ? "Email verified" : "Email pending"}
                />
                <Badge
                  variant={user?.phoneVerified ? "success" : "outline"}
                  label={user?.phoneVerified ? "Phone verified" : "Phone pending"}
                />
                <Badge
                  variant={kycStatus === "VERIFIED" ? "success" : "outline"}
                  label={
                    kycStatus === "VERIFIED"
                      ? "KYC verified"
                      : panPresent
                      ? "KYC in progress"
                      : "KYC not started"
                  }
                />
              </div>

              {profile?.bse?.ucc && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--pv-dim)",
                  }}
                >
                  BSE UCC:{" "}
                  <span style={{ fontWeight: 600, color: "var(--pv-text)" }}>
                    {profile.bse.ucc}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Investment readiness" style={{ marginTop: 16 }}>
            <div className="pv-col" style={{ gap: 8, fontSize: 13 }}>
              <div className="pv-row" style={{ justifyContent: "space-between" }}>
                <span>PAN linked</span>
                <span style={{ fontWeight: 600 }}>
                  {form.kyc.pan ? "Yes" : "No"}
                </span>
              </div>
              <div className="pv-row" style={{ justifyContent: "space-between" }}>
                <span>Bank details</span>
                <span style={{ fontWeight: 600 }}>
                  {form.bank.accountNumber ? "Added" : "Missing"}
                </span>
              </div>
              <div className="pv-row" style={{ justifyContent: "space-between" }}>
                <span>Nominee</span>
                <span style={{ fontWeight: 600 }}>
                  {form.nominee.name ? "Added" : "Missing"}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Paisavidhya services" style={{ marginTop: 16 }}>
            <div className="pv-col" style={{ gap: 8, fontSize: 13 }}>
              <div className="pv-col" style={{ gap: 4 }}>
                <span style={{ fontWeight: 500 }}>Financial Fitness Check-up (FFC)</span>
                <span style={{ color: "var(--pv-dim)" }}>
                  Understand your overall financial health in minutes.
                </span>
                <Button
                  as={Link}
                  to="/ffc"
                  size="sm"
                  variant="outline"
                  style={{ alignSelf: "flex-start", marginTop: 4 }}
                >
                  Open FFC
                </Button>
              </div>

              <div className="pv-col" style={{ gap: 4, marginTop: 8 }}>
                <span style={{ fontWeight: 500 }}>Personal Financial Check-up (PFC)</span>
                <span style={{ color: "var(--pv-dim)" }}>
                  Deep dive into income, expenses, goals & risk profile.
                </span>
                <Button
                  as={Link}
                  to="/pfc"
                  size="sm"
                  variant="outline"
                  style={{ alignSelf: "flex-start", marginTop: 4 }}
                >
                  Open PFC
                </Button>
              </div>

              <div className="pv-col" style={{ gap: 4, marginTop: 8 }}>
                <span style={{ fontWeight: 500 }}>Mutual Funds dashboard</span>
                <span style={{ color: "var(--pv-dim)" }}>
                  Track SIPs, holdings and returns once BSE integration is live.
                </span>
                <Button
                  as={Link}
                  to="/mutual-funds" // adjust if your route is different
                  size="sm"
                  variant="outline"
                  style={{ alignSelf: "flex-start", marginTop: 4 }}
                >
                  Open Mutual Funds
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <Card
            title="Profile & KYC details"
            actions={
              editMode ? (
                <div className="pv-row" style={{ gap: 8 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetFormFromProfile();
                      setEditMode(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving || loading}
                    style={{ minWidth: 120 }}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  disabled={loading}
                  style={{ minWidth: 120 }}
                >
                  Edit details
                </Button>
              )
            }
          >
            {loading ? (
              <div
                className="pv-row"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                  gap: 12,
                }}
              >
                <Spinner />
                <span>Loading profile…</span>
              </div>
            ) : (
              <Tabs
                defaultIndex={0}
                tabs={[
                  {
                    label: "Personal",
                    content: editMode ? (
                      <div
                        className="pv-grid"
                        style={{
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 16,
                        }}
                      >
                        <Input
                          label="First name"
                          value={form.name.first}
                          onChange={handleChange("name.first")}
                        />
                        <Input
                          label="Last name"
                          value={form.name.last}
                          onChange={handleChange("name.last")}
                        />
                        <Input
                          label="Date of birth"
                          type="date"
                          value={form.dob}
                          onChange={handleChange("dob")}
                        />
                        <Select
                          label="Gender"
                          value={form.gender}
                          onChange={handleChange("gender")}
                          options={genderOptions}
                        />
                        <Input
                          label="Primary phone"
                          value={form.primaryPhone.number}
                          onChange={handleChange("primaryPhone.number")}
                        />
                      </div>
                    ) : (
                      <div
                        className="pv-grid"
                        style={{
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 16,
                        }}
                      >
                        {renderField(
                          "First name",
                          profile?.name?.first || form.name.first
                        )}
                        {renderField(
                          "Last name",
                          profile?.name?.last || form.name.last
                        )}
                        {renderField(
                          "Date of birth",
                          profile?.dob
                            ? profile.dob.substring(0, 10)
                            : form.dob,
                          "Not set"
                        )}
                        {renderField(
                          "Gender",
                          profile?.gender ||
                            form.gender ||
                            "PREFER_NOT_TO_SAY"
                        )}
                        {renderField(
                          "Primary phone",
                          profile?.primaryPhone?.number ||
                            form.primaryPhone.number ||
                            user?.phoneNumber
                        )}
                      </div>
                    ),
                  },
                  {
                    label: "KYC & Address",
                    content: editMode ? (
                      <div className="pv-col" style={{ gap: 16 }}>
                        <div
                          className="pv-grid"
                          style={{
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 16,
                          }}
                        >
                          <Input
                            label="PAN"
                            value={form.kyc.pan}
                            onChange={handleChange("kyc.pan")}
                            placeholder="ABCDE1234F"
                          />
                          <Select
                            label="Residency status"
                            value={form.kyc.residencyStatus}
                            onChange={handleChange("kyc.residencyStatus")}
                            options={residencyOptions}
                          />
                          <Select
                            label="Annual income range"
                            value={form.kyc.annualIncomeSlab}
                            onChange={handleChange("kyc.annualIncomeSlab")}
                            options={incomeOptions}
                          />
                          <Input
                            label="Occupation"
                            value={form.kyc.occupation}
                            onChange={handleChange("kyc.occupation")}
                          />
                          <Select
                            label="PEP status"
                            value={form.kyc.pepStatus}
                            onChange={handleChange("kyc.pepStatus")}
                            options={pepOptions}
                          />
                        </div>

                        <div
                          className="pv-grid"
                          style={{
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 16,
                          }}
                        >
                          <Input
                            label="Address line 1"
                            value={form.address.line1}
                            onChange={handleChange("address.line1")}
                          />
                          <Input
                            label="Address line 2"
                            value={form.address.line2}
                            onChange={handleChange("address.line2")}
                          />
                          <Input
                            label="City"
                            value={form.address.city}
                            onChange={handleChange("address.city")}
                          />
                          <Input
                            label="State"
                            value={form.address.state}
                            onChange={handleChange("address.state")}
                          />
                          <Input
                            label="Pincode"
                            value={form.address.pincode}
                            onChange={handleChange("address.pincode")}
                          />
                          <Input
                            label="Country"
                            value={form.address.country}
                            onChange={handleChange("address.country")}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pv-col" style={{ gap: 16 }}>
                        <div
                          className="pv-grid"
                          style={{
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 16,
                          }}
                        >
                          {renderField("PAN", profile?.kyc?.pan || form.kyc.pan)}
                          {renderField(
                            "Residency status",
                            profile?.kyc?.residencyStatus ||
                              form.kyc.residencyStatus ||
                              "RESIDENT"
                          )}
                          {renderField(
                            "Annual income range",
                            profile?.kyc?.annualIncomeSlab ||
                              form.kyc.annualIncomeSlab
                          )}
                          {renderField(
                            "Occupation",
                            profile?.kyc?.occupation || form.kyc.occupation
                          )}
                          {renderField(
                            "PEP status",
                            profile?.kyc?.pepStatus || form.kyc.pepStatus
                          )}
                        </div>

                        <div
                          className="pv-grid"
                          style={{
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 16,
                          }}
                        >
                          {renderField(
                            "Address line 1",
                            profile?.address?.line1 || form.address.line1
                          )}
                          {renderField(
                            "Address line 2",
                            profile?.address?.line2 || form.address.line2,
                            "-"
                          )}
                          {renderField(
                            "City",
                            profile?.address?.city || form.address.city
                          )}
                          {renderField(
                            "State",
                            profile?.address?.state || form.address.state
                          )}
                          {renderField(
                            "Pincode",
                            profile?.address?.pincode || form.address.pincode
                          )}
                          {renderField(
                            "Country",
                            profile?.address?.country || form.address.country
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Bank & Nominee",
                    content: editMode ? (
                      <div className="pv-col" style={{ gap: 24 }}>
                        <div>
                          <h4 style={{ marginBottom: 12 }}>Bank details</h4>
                          <div
                            className="pv-grid"
                            style={{
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: 16,
                            }}
                          >
                            <Input
                              label="Account holder name"
                              value={form.bank.accountHolderName}
                              onChange={handleChange("bank.accountHolderName")}
                            />
                            <Input
                              label="Account number"
                              value={form.bank.accountNumber}
                              onChange={handleChange("bank.accountNumber")}
                            />
                            <Input
                              label="IFSC"
                              value={form.bank.ifsc}
                              onChange={handleChange("bank.ifsc")}
                              placeholder="HDFC0001234"
                            />
                            <Input
                              label="Bank name"
                              value={form.bank.bankName}
                              onChange={handleChange("bank.bankName")}
                            />
                            <Input
                              label="Branch name"
                              value={form.bank.branchName}
                              onChange={handleChange("bank.branchName")}
                            />
                            <Select
                              label="Account type"
                              value={form.bank.accountType}
                              onChange={handleChange("bank.accountType")}
                              options={[
                                { value: "SAVINGS", label: "Savings" },
                                { value: "CURRENT", label: "Current" },
                                { value: "NRE", label: "NRE" },
                                { value: "NRO", label: "NRO" },
                                { value: "OTHER", label: "Other" },
                              ]}
                            />
                          </div>
                        </div>

                        <div>
                          <h4 style={{ marginBottom: 12 }}>Nominee</h4>
                          <div
                            className="pv-grid"
                            style={{
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: 16,
                            }}
                          >
                            <Input
                              label="Nominee name"
                              value={form.nominee.name}
                              onChange={handleChange("nominee.name")}
                            />
                            <Input
                              label="Relationship"
                              value={form.nominee.relation}
                              onChange={handleChange("nominee.relation")}
                            />
                            <Input
                              label="Nominee DOB"
                              type="date"
                              value={form.nominee.dob}
                              onChange={handleChange("nominee.dob")}
                            />
                            <Input
                              label="Share %"
                              type="number"
                              min={0}
                              max={100}
                              value={form.nominee.sharePercent}
                              onChange={handleChange("nominee.sharePercent")}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pv-col" style={{ gap: 24 }}>
                        <div>
                          <h4 style={{ marginBottom: 12 }}>Bank details</h4>
                          <div
                            className="pv-grid"
                            style={{
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: 16,
                            }}
                          >
                            {renderField(
                              "Account holder name",
                              profile?.bank?.accountHolderName ||
                                form.bank.accountHolderName
                            )}
                            {renderField(
                              "Account number",
                              profile?.bank?.accountNumber ||
                                form.bank.accountNumber
                            )}
                            {renderField(
                              "IFSC",
                              profile?.bank?.ifsc || form.bank.ifsc
                            )}
                            {renderField(
                              "Bank name",
                              profile?.bank?.bankName || form.bank.bankName
                            )}
                            {renderField(
                              "Branch name",
                              profile?.bank?.branchName ||
                                form.bank.branchName
                            )}
                            {renderField(
                              "Account type",
                              profile?.bank?.accountType ||
                                form.bank.accountType ||
                                "SAVINGS"
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 style={{ marginBottom: 12 }}>Nominee</h4>
                          <div
                            className="pv-grid"
                            style={{
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: 16,
                            }}
                          >
                            {renderField(
                              "Nominee name",
                              profile?.nominee?.name || form.nominee.name
                            )}
                            {renderField(
                              "Relationship",
                              profile?.nominee?.relation ||
                                form.nominee.relation
                            )}
                            {renderField(
                              "Nominee DOB",
                              profile?.nominee?.dob
                                ? profile.nominee.dob.substring(0, 10)
                                : form.nominee.dob
                            )}
                            {renderField(
                              "Share %",
                              profile?.nominee?.sharePercent ??
                                form.nominee.sharePercent ??
                                100
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
