import { Link } from "react-router-dom";
import "../../styles/ui.css";
import {
  Card,
  Badge,
  Tabs,
  Accordion,
  Alert,
  Tooltip,
  Button,
} from "../../components";
import { FaArrowRight } from "react-icons/fa";

function Section({ title, children, style }) {
  return (
    <section className="pv-col" style={{ gap: 14, margin: "28px 0", ...style }}>
      <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const tabs = [
    {
      label: "PFC",
      content: (
        <>
          <p style={{ color: "var(--pv-dim)" }}>
            <b>Personal Financial Checkup</b> — income, expenses, emergency
            buffer, insurance & goals.
          </p>
          <Button as={Link} to="/pfc" className="pv-btn ">
            Launch PFC <FaArrowRight />
          </Button>
        </>
      ),
    },
    {
      label: "FFC",
      content: (
        <>
          <p style={{ color: "var(--pv-dim)" }}>
            <b>Family Financial Checkup</b> — total household finances, risks &
            protections across members.
          </p>
          <Button
            as={Link}
            to="/ffc"
            className="pv-btn ghost"
            style={{ justifyContent: "center" }}
          >
            FFC (Coming Soon)
          </Button>
        </>
      ),
    },
    {
      label: "BFC",
      content: (
        <>
          <p style={{ color: "var(--pv-dim)" }}>
            <b>Business Financial Checkup</b> — cash cycle, liabilities,
            planning, runway & forecasting.
          </p>
          <Button
            as={Link}
            to="/bfc"
            className="pv-btn ghost"
            style={{ justifyContent: "center" }}
          >
            BFC (Coming Soon)
          </Button>
        </>
      ),
    },
  ];

  const faqs = [
    {
      title: "Is Paisavidhya a paid service?",
      content:
        "Core checkup is free for now. Advisory & implementations may be paid.",
    },
    {
      title: "Do you store my documents?",
      content:
        "Only with consent. KYC/MF data is stored securely with strict access controls.",
    },
    {
      title: "How do I start?",
      content:
        "Create an account and book a checkup. A staff advisor will guide you.",
    },
  ];

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 16px" }}
    >
      {/* HERO */}
      <Card>
        <div
          className="pv-row"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div className="pv-col" style={{ gap: 10, minWidth: 280, flex: 1 }}>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>
              Your Family’s Financial Doctor
            </div>
            <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.2 }}>
              Get a clear, friendly wealth check for your money
            </h1>
            <div style={{ color: "var(--pv-dim)" }}>
              PFC / FFC / BFC — easy assessments, practical actions, and human
              guidance.
            </div>
            <div className="pv-row" style={{ gap: 8, marginTop: 8 }}>
              <Link to="/auth" className="pv-btn">
                Get started
              </Link>
              <Link to="/auth" className="pv-btn ghost">
                Sign in
              </Link>
              <Tooltip content="Secure, encrypted, consent-first">
                <Badge>Privacy-first</Badge>
              </Tooltip>
            </div>
          </div>
          <div
            className="pv-col pv-card"
            style={{ padding: 16, minWidth: 280 }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Modules</div>
            <Tabs tabs={tabs} defaultIndex={0} />
          </div>
        </div>
      </Card>

      {/* BENEFITS */}
      <Section title="Why Paisavidhya?">
        <div className="pv-row" style={{ gap: 16, flexWrap: "wrap" }}>
          {[
            { h: "Clarity", p: "Know exactly where you stand, today." },
            { h: "Actionable", p: "Simple steps you can take this week." },
            { h: "Human", p: "Talk to an advisor when you need." },
            { h: "Secure", p: "Bank-grade security & consent-first." },
          ].map((b, i) => (
            <div
              key={i}
              className="pv-card"
              style={{ padding: 16, flex: "1 1 220px" }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{b.h}</div>
              <div style={{ color: "var(--pv-dim)" }}>{b.p}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA STRIP */}
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
            <div style={{ fontWeight: 800 }}>Start your free checkup</div>
            <div style={{ color: "var(--pv-dim)" }}>
              Takes 5–10 minutes. No credit card needed.
            </div>
          </div>
          <div className="pv-row" style={{ gap: 8 }}>
            <Link to="/auth" className="pv-btn">
              Create account
            </Link>
            <Link to="/auth" className="pv-btn ghost">
              I already have an account
            </Link>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Section title="Frequently asked questions">
        <Accordion items={faqs} />
        <Alert type="info" style={{ marginTop: 10 }}>
          More questions? <Link to="/auth">Sign in</Link> and message us from
          your dashboard.
        </Alert>
      </Section>
    </div>
  );
}
