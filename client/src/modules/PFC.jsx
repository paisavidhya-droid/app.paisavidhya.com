// client\src\modules\PFC.jsx

import { useState, useMemo } from "react";
import "./piechart.css";
import {
  Card,
  Input,
  Select,
  Button,
  Accordion,
  Alert,
  AmountInput,
} from "../components";
import "../styles/ui.css";
import ModuleHeader from "../components/ui/ModuleHeader";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getMyProfile } from "../services/profileService";
import { useDeviceSize } from "../context/DeviceSizeContext";

const fmt = (n) => (isNaN(n) ? 0 : Number(n));

/* ---------- reusable input row ---------- */
function Row({ label, value, onChange }) {
  return (
    <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
      <label style={{ width: "60%", color: "var(--pv-dim)" }}>{label}</label>
      <AmountInput value={value} onChange={onChange} />
    </div>
  );
}

/* ---------- category group ---------- */
function CategoryGroup({ title, fields, data, setData }) {
  const total = useMemo(
    () => Object.values(data).reduce((a, b) => a + fmt(b), 0),
    [data]
  );

  return (
    <Card title={`${title}  —  ₹${total.toLocaleString()}`}>
      <div className="pv-col" style={{ gap: 6 }}>
        {fields.map((f) => (
          <Row
            key={f.key}
            label={f.label}
            value={data[f.key] || 0}
            onChange={(v) => setData((p) => ({ ...p, [f.key]: v }))}
          />
        ))}
      </div>
    </Card>
  );
}

/* ---------- main component ---------- */
export default function PFC() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useDeviceSize();

  /* -------- basic info -------- */
  const [info, setInfo] = useState({
    name: user?.name || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    city: user?.city || "",
    mobile: user?.phoneNumber || "",
  });

  /* -------- income -------- */
  const [income, setIncome] = useState({
    salary: 0,
    freelance: 0,
    interest: 0,
    dividends: 0,
    rent: 0,
  });

  /* -------- expenses -------- */
  const [housing, setHousing] = useState({
    rent: 0,
    maintenance: 0,
    electricity: 0,
    internet: 0,
    gas: 0,
  });
  const [food, setFood] = useState({
    groceries: 0,
    tiffin: 0,
    eatingOut: 0,
    snacks: 0,
  });
  const [transport, setTransport] = useState({
    fuel: 0,
    public: 0,
    cab: 0,
    emi: 0,
    maintenance: 0,
  });
  const [lifestyle, setLifestyle] = useState({
    clothing: 0,
    grooming: 0,
    fitness: 0,
    hobbies: 0,
    subscriptions: 0,
    entertainment: 0,
  });
  const [health, setHealth] = useState({
    insurance: 0,
    medical: 0,
  });
  const [obligations, setObligations] = useState({
    loanEmi: 0,
    ccBill: 0,
    sip: 0,
    rd: 0,
    nps: 0,
  });
  const [leisure, setLeisure] = useState({
    shortTrips: 0,
    vacation: 0,
    adventure: 0,
  });

  // Add Growth (Learning & Self-Growth) and Giving
  const [growth, setGrowth] = useState({
    courses: 0,
    certifications: 0,
    books: 0,
    workshops: 0,
  });
  const [giving, setGiving] = useState({
    charity: 0,
    familySupport: 0,
  });

  useEffect(() => {
    try {
      const cached = JSON.parse(
        localStorage.getItem("pv_pfc_payload") || "null"
      );
      if (!cached) return;

      const { info: cInfo, income: cIncome, expenses: cExp } = cached;

      if (cInfo) setInfo((prev) => ({ ...prev, ...cInfo }));
      if (cIncome) setIncome(cIncome);

      if (cExp) {
        setHousing(cExp.housing || {});
        setFood(cExp.food || {});
        setTransport(cExp.transport || {});
        setLifestyle(cExp.lifestyle || {});
        setHealth(cExp.health || {});
        setObligations(cExp.obligations || {});
        setLeisure(cExp.leisure || {});
        setGrowth(cExp.growth || {});
        setGiving(cExp.giving || {});
      }
    } catch (e) {
      console.error("Failed to hydrate PFC from localStorage", e);
    }
  }, []);

  // ✅ Load profile and map to basic info (read-only)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        if (!profile) return;

        const fullName =
          profile.name?.full ||
          [profile.name?.first, profile.name?.last].filter(Boolean).join(" ");

        const dob = profile.dob ? profile.dob.substring(0, 10) : "";

        let genderLabel = "";
        switch (profile.gender) {
          case "MALE":
            genderLabel = "Male";
            break;
          case "FEMALE":
            genderLabel = "Female";
            break;
          case "OTHER":
            genderLabel = "Other";
            break;
          default:
            genderLabel = "";
        }

        const cityState = [profile.address?.city, profile.address?.state]
          .filter(Boolean)
          .join(", ");

        const mobile = profile.primaryPhone?.number || user?.phoneNumber || "";

        setInfo((prev) => ({
          ...prev,
          name: fullName || prev.name,
          dob: dob || prev.dob,
          gender: genderLabel || prev.gender,
          city: cityState || prev.city,
          mobile: mobile || prev.mobile,
        }));
      } catch (e) {
        console.error("Failed to load profile for PFC", e);
      }
    };

    loadProfile();
  }, [user]);

  /* -------- results -------- */
  const totalIncome = useMemo(
    () => Object.values(income).reduce((a, b) => a + fmt(b), 0),
    [income]
  );

  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const getTotal = (obj) =>
    Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);

  const renderAccTitle = (label, amount) => (expanded) =>
    (
      <div className="acc-title">
        <span>{label}</span>
        {!expanded && amount > 0 && (
          <span className="acc-amt">₹{inr.format(amount)}</span>
        )}
      </div>
    );

  const goToReport = () => {
    // block empty report
    // if (!hasAnyAmount()) {
    //   alert(
    //     ""
    //   );
    //   return;
    // }
    const payload = {
      info,
      income,
      expenses: {
        housing,
        food,
        transport,
        lifestyle,
        health,
        obligations,
        leisure,
        growth,
        giving,
      },
    };
    try {
      localStorage.setItem("pv_pfc_payload", JSON.stringify(payload));
    } catch {}
    navigate("/pfc/report", { state: payload });
  };

  const requiredFields = ["name", "dob", "gender", "city", "mobile"];

  const missingFields = requiredFields.filter((field) => !info[field]);
  const isProfileComplete = missingFields.length === 0;

  return (
    <>
      <ModuleHeader
        title="Personal Financial Checkup (PFC)"
        subtitle="Your money health report"
        actions={<Button onClick={goToReport}>Generate Report</Button>}
      />

      <div
        className="pv-col pv-container"
        style={{ gap: 24, padding: "16px 8px" }}
      >
        {/* ---------- Basic Info (from Profile, read-only) ---------- */}
        <Card title="Personal Details">
          {/* If anything is missing, show a loud warning + CTA */}
          {!isProfileComplete && (
            <Alert type="warning" title="Some details are missing">
              <div className="pv-row">
                <div>
                  Please complete your basic details in your{" "}
                  <strong><Link to="/profile">My Profile</Link></strong> page.
                </div>

                {!isMobile && <Button onClick={() => navigate("/profile")}>
                  Go to My Profile
                </Button>}
              </div>
            </Alert>
          )}
          <div className="pv-row" style={{ flexWrap: "wrap", gap: 12 }}>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={info.name}
              disabled // ⬅️ read-only
              style={{ cursor: "not-allowed" }}
            />
            <Input
              type="date"
              label="Date of Birth"
              value={info.dob}
              disabled // ⬅️ read-only
              style={{ cursor: "not-allowed" }}
            />
            <Input
              label="Gender"
              value={info.gender || "Not set"}
              disabled // ⬅️ read-only
              style={{ cursor: "not-allowed" }}
            />
             
            <Input
              label="City & State"
              value={info.city|| "Not set"}
              disabled // ⬅️ read-only
              style={{ cursor: "not-allowed" }}
            />
            <Input
              label="Mobile No."
              placeholder="10-digit number"
              value={info.mobile}
              disabled // ⬅️ read-only
              style={{ cursor: "not-allowed" }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "var(--pv-dim)",
            }}
          >
            <span style={{ color: "red" }}>*</span>To update these details, go
            to{" "}
            <strong>
              <Link to="/profile">My Profile</Link>
            </strong>{" "}
            page.
          </div>
        </Card>

        <Alert type="info" title="Tip">
          Enter all amounts as <strong>monthly</strong> values for best
          accuracy.
        </Alert>

        {/* ---------- Income ---------- */}
        <Card title="Income Sources (Monthly)">
          <div className="pv-col" style={{ gap: 8 }}>
            {Object.keys(income).map((k) => (
              <Row
                key={k}
                label={k.replace(/^\w/, (c) => c.toUpperCase())}
                value={income[k]}
                onChange={(v) => setIncome((p) => ({ ...p, [k]: v }))}
              />
            ))}
            {totalIncome > 0 && (
              <div className="pv-row" style={{ justifyContent: "flex-end" }}>
                <Alert title={`Income — ₹${totalIncome.toLocaleString()}`} />
              </div>
            )}
          </div>
        </Card>

        {/* ---------- Expenses ---------- */}
        <Accordion
          items={[
            {
              title: renderAccTitle("Housing", getTotal(housing)),
              content: (
                <CategoryGroup
                  title="Housing"
                  fields={[
                    { key: "rent", label: "House Rent / Hostel / PG" },
                    { key: "maintenance", label: "Maintenance / Society" },
                    { key: "electricity", label: "Electricity Bill" },
                    { key: "internet", label: "Internet / Wi-Fi" },
                    { key: "gas", label: "Gas / Cylinder" },
                  ]}
                  data={housing}
                  setData={setHousing}
                />
              ),
            },
            {
              title: renderAccTitle("Food & Groceries", getTotal(food)),
              content: (
                <CategoryGroup
                  title="Food"
                  fields={[
                    { key: "groceries", label: "Groceries / Kitchen" },
                    { key: "tiffin", label: "Tiffin / Mess" },
                    { key: "eatingOut", label: "Eating Out" },
                    { key: "snacks", label: "Snacks / Coffee" },
                  ]}
                  data={food}
                  setData={setFood}
                />
              ),
            },
            {
              title: renderAccTitle("Transport", getTotal(transport)),
              content: (
                <CategoryGroup
                  title="Transport"
                  fields={[
                    { key: "fuel", label: "Fuel" },
                    { key: "public", label: "Public Transport" },
                    { key: "cab", label: "Ola / Uber / Rapido" },
                    { key: "emi", label: "Vehicle EMI" },
                    {
                      key: "maintenance",
                      label: "Vehicle Maintenance / Insurance",
                    },
                  ]}
                  data={transport}
                  setData={setTransport}
                />
              ),
            },
            {
              title: renderAccTitle("Lifestyle", getTotal(lifestyle)),
              content: (
                <CategoryGroup
                  title="Lifestyle"
                  fields={[
                    { key: "clothing", label: "Clothing / Shopping" },
                    { key: "grooming", label: "Grooming / Personal Care" },
                    { key: "fitness", label: "Fitness / Sports" },
                    { key: "hobbies", label: "Hobbies / Music / Books" },
                    { key: "subscriptions", label: "OTT / Subscriptions" },
                    { key: "entertainment", label: "Weekend Entertainment" },
                  ]}
                  data={lifestyle}
                  setData={setLifestyle}
                />
              ),
            },
            {
              title: renderAccTitle("Health & Insurance", getTotal(health)),
              content: (
                <CategoryGroup
                  title="Health"
                  fields={[
                    { key: "insurance", label: "Health Insurance Premium" },
                    { key: "medical", label: "Medicines / Checkups" },
                  ]}
                  data={health}
                  setData={setHealth}
                />
              ),
            },
            {
              title: renderAccTitle(
                "Financial Obligations",
                getTotal(obligations)
              ),
              content: (
                <CategoryGroup
                  title="Financial Obligations"
                  fields={[
                    { key: "loanEmi", label: "Loan EMI" },
                    { key: "ccBill", label: "Credit Card Bill" },
                    { key: "sip", label: "Mutual Fund SIP" },
                    { key: "rd", label: "RD / FD" },
                    { key: "nps", label: "NPS / PPF" },
                  ]}
                  data={obligations}
                  setData={setObligations}
                />
              ),
            },
            {
              title: renderAccTitle("Travel & Leisure", getTotal(leisure)),
              content: (
                <CategoryGroup
                  title="Leisure"
                  fields={[
                    { key: "shortTrips", label: "Weekend Trips" },
                    { key: "vacation", label: "Annual Vacation (avg/month)" },
                    { key: "adventure", label: "Adventure / Sports Trips" },
                  ]}
                  data={leisure}
                  setData={setLeisure}
                />
              ),
            },
            {
              title: renderAccTitle("Learning & Self-Growth", getTotal(growth)),
              content: (
                <CategoryGroup
                  title="Learning & Self-Growth"
                  fields={[
                    { key: "courses", label: "Online Courses" },
                    { key: "certifications", label: "Certifications / Exams" },
                    { key: "books", label: "Books / eBooks" },
                    { key: "workshops", label: "Workshops / Seminars" },
                  ]}
                  data={growth}
                  setData={setGrowth}
                />
              ),
            },
            {
              title: renderAccTitle("Charity / Giving", getTotal(giving)),
              content: (
                <CategoryGroup
                  title="Charity / Giving"
                  fields={[
                    { key: "charity", label: "Charity / Donations" },
                    { key: "familySupport", label: "Family Support" },
                  ]}
                  data={giving}
                  setData={setGiving}
                />
              ),
            },
          ]}
        />

        {/* ---------- Generate Report CTA ---------- */}
        <Card>
          <div className="pv-row" style={{ justifyContent: "flex-end" }}>
            <Button onClick={goToReport}>Generate Report</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
