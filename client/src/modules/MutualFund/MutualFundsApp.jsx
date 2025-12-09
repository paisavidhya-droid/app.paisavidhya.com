import { useMemo } from "react";
import "./mutualfunds.css";

import { Card, Button, Input, Tabs, Badge, Progress } from "../../components";

function formatINR(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function MutualFundsPage() {
  // ---- Dummy data (replace with API/BSE integration later) ----
  const portfolio = {
    totalInvested: 32596,
    currentValue: 36025,
    gain: 3429,
    gainPct: 10.52,
  };

  const holdings = [
    {
      id: 1,
      name: "Axis Bluechip Fund",
      units: "218.67 units • Avg NAV: ₹42.30",
      sip: "₹1,000/month on 5th",
      invested: 9250,
      current: 9986,
      returnsAmount: 736,
      returnsPct: 7.96,
      nav: 45.67,
    },
    {
      id: 2,
      name: "SBI Small Cap Fund",
      units: "48.52 units • Avg NAV: ₹108.75",
      sip: "₹500/month on 10th",
      invested: 5275,
      current: 5991,
      returnsAmount: 716,
      returnsPct: 13.58,
      nav: 123.45,
    },
    {
      id: 3,
      name: "Parag Parikh Flexi Cap Fund",
      units: "306.75 units • Avg NAV: ₹58.90",
      sip: "₹2,000/month on 11th",
      invested: 18071,
      current: 20048,
      returnsAmount: 1977,
      returnsPct: 10.94,
      nav: 65.34,
    },
  ];

  const activeSips = [
    {
      id: 1,
      name: "Axis Bluechip Fund",
      amount: "₹1,000/month",
      nextSip: "5th of next month",
    },
    {
      id: 2,
      name: "SBI Small Cap Fund",
      amount: "₹500/month",
      nextSip: "10th of next month",
    },
    {
      id: 3,
      name: "Parag Parikh Flexi Cap Fund",
      amount: "₹2,000/month",
      nextSip: "11th of next month",
    },
  ];

  const exploreFunds = [
    {
      id: 1,
      name: "Axis Bluechip Fund",
      category: "Large Cap",
      nav: 45.67,
      oneY: 12.5,
      threeY: 15.2,
      fiveY: 11.8,
      risk: "Medium",
      expense: "1.95%",
      aum: "₹42,856 Cr",
    },
    {
      id: 2,
      name: "SBI Small Cap Fund",
      category: "Small Cap",
      nav: 123.45,
      oneY: 18.7,
      threeY: 22.1,
      fiveY: 16.5,
      risk: "High",
      expense: "1.75%",
      aum: "₹15,234 Cr",
    },
    {
      id: 3,
      name: "HDFC Mid-Cap Opportunities Fund",
      category: "Mid Cap",
      nav: 89.23,
      oneY: 15.3,
      threeY: 18.9,
      fiveY: 14.2,
      risk: "High",
      expense: "1.85%",
      aum: "₹28,967 Cr",
    },
    {
      id: 4,
      name: "Mirae Asset Large Cap Fund",
      category: "Large Cap",
      nav: 76.89,
      oneY: 14.8,
      threeY: 14.6,
      fiveY: 12.3,
      risk: "Medium",
      expense: "1.25%",
      aum: "₹15,456 Cr",
    },
    {
      id: 5,
      name: "Parag Parikh Flexi Cap Fund",
      category: "Flexi Cap",
      nav: 65.34,
      oneY: 16.9,
      threeY: 20.1,
      fiveY: 18.4,
      risk: "Medium",
      expense: "1.20%",
      aum: "₹5,789 Cr",
    },
  ];

  const profile = {
    name: "John Doe",
    initials: "PK",
    email: "john@example.com",
    phone: "+91 98765 43210",
    pan: "ABCDE1234F",
    riskProfile: "Moderate",
    kycStatus: "KYC Verified",
    memberSince: "3+ years",
  };

  const marketSummary = [
    { name: "SENSEX", change: "+1.2%" },
    { name: "NIFTY", change: "+0.8%" },
    { name: "GOLD", change: "-0.3%" },
  ];

  // ---- Tabs content built with your <Tabs> component ----
  const tabsData = useMemo(
    () => [
      {
        label: "Overview",
        content: (
          <OverviewTab
            portfolio={portfolio}
            holdings={holdings}
            marketSummary={marketSummary}
          />
        ),
      },
      {
        label: "Portfolio",
        content: (
          <PortfolioTab
            portfolio={portfolio}
            holdings={holdings}
            activeSips={activeSips}
          />
        ),
      },
      {
        label: "Explore Funds",
        content: <ExploreFundsTab funds={exploreFunds} />,
      },
      {
        label: "Profile",
        content: (
          <ProfileTab
            profile={profile}
            portfolio={portfolio}
            activeSips={activeSips}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="pv-container mf-page">
      {/* Page header – sits inside your existing layout */}
      <div className="mf-header">
        <div>
          <h1 className="mf-title">Mutual Funds</h1>
          <p className="mf-subtitle">
            Track, invest and manage all your BSE StAR MF investments in one
            Paisavidhya dashboard.
          </p>
        </div>
        <div className="mf-header-actions">
          <Button>Start New SIP</Button>
          <Button variant="ghost">One-time Lumpsum</Button>
        </div>
      </div>

      <div className="mf-tabs-card">
        <Tabs tabs={tabsData} defaultIndex={0} />
      </div>
    </div>
  );
}

/* ---------- INDIVIDUAL TAB COMPONENTS ---------- */

function OverviewTab({ portfolio, holdings, marketSummary }) {
  return (
    <div className="mf-tab-layout">
      <div className="mf-grid-2">
        <Card title="Portfolio Overview">
          <div className="mf-kv">
            <span>Total Invested</span>
            <strong>{formatINR(portfolio.totalInvested)}</strong>
          </div>
          <div className="mf-kv">
            <span>Current Value</span>
            <strong>{formatINR(portfolio.currentValue)}</strong>
          </div>
          <div className="mf-kv">
            <span>Total Gain / Loss</span>
            <span className="mf-text-success">
              {formatINR(portfolio.gain)} ({portfolio.gainPct}%)
            </span>
          </div>
          <div className="mf-progress-wrap">
            <Progress value={Math.min(100, portfolio.gainPct)} />
            <span className="mf-progress-label">Growth in last 6 months</span>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="mf-quick-grid">
            <Button className="mf-quick-btn">Invest More</Button>
            <Button className="mf-quick-btn" variant="ghost">
              Withdraw
            </Button>
            <Button className="mf-quick-btn" variant="ghost">
              Analyze Portfolio
            </Button>
            <Button className="mf-quick-btn" variant="ghost">
              Download Report
            </Button>
          </div>
        </Card>
      </div>

      <div className="mf-grid-2 mf-grid-2-bottom">
        <Card title="Top Holdings">
          <div className="mf-holdings-list">
            {holdings.map((h) => (
              <div key={h.id} className="mf-holding-row">
                <div className="mf-holding-main">
                  <div className="mf-holding-dot" />
                  <div>
                    <div className="mf-holding-name">{h.name}</div>
                    <div className="mf-holding-sub">{h.units}</div>
                  </div>
                </div>
                <div className="mf-holding-values">
                  <div className="mf-holding-amount">
                    {formatINR(h.current)}
                  </div>
                  <div className="mf-holding-returns mf-text-success">
                    {formatINR(h.returnsAmount)} ({h.returnsPct.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Market Summary">
          <div className="mf-market-list">
            {marketSummary.map((m) => (
              <div key={m.name} className="mf-market-row">
                <span>{m.name}</span>
                <span
                  className={
                    m.change.startsWith("-")
                      ? "mf-text-danger"
                      : "mf-text-success"
                  }
                >
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PortfolioTab({ portfolio, holdings, activeSips }) {
  return (
    <div className="mf-tab-layout">
      <div className="mf-grid-2">
        <Card title="Portfolio Summary">
          <div className="mf-kv">
            <span>Total Investment</span>
            <strong>{formatINR(portfolio.totalInvested)}</strong>
          </div>
          <div className="mf-kv">
            <span>Current Value</span>
            <strong>{formatINR(portfolio.currentValue)}</strong>
          </div>
          <div className="mf-kv">
            <span>Total Returns</span>
            <span className="mf-text-success">
              {formatINR(portfolio.gain)} ({portfolio.gainPct}%)
            </span>
          </div>
          <div className="mf-profit-banner">
            Profit: {formatINR(portfolio.gain)}
          </div>
        </Card>

        <Card title="Active SIPs">
          <div className="mf-sip-list">
            {activeSips.map((s) => (
              <div key={s.id} className="mf-sip-row">
                <div>
                  <div className="mf-holding-name">{s.name}</div>
                  <div className="mf-sip-amount">{s.amount}</div>
                  <div className="mf-sip-next">
                    Next SIP: <span>{s.nextSip}</span>
                  </div>
                </div>
                <Button variant="ghost" className="mf-sip-manage">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Your Holdings">
        <div className="mf-holdings-grid">
          {holdings.map((h) => (
            <div key={h.id} className="mf-holding-card">
              <div className="mf-holding-name">{h.name}</div>
              <div className="mf-holding-sub">{h.units}</div>
              <div className="mf-holding-sub mf-link">
                SIP: {h.sip}
              </div>

              <div className="mf-holding-details">
                <div>
                  <span>Invested Amount</span>
                  <strong>{formatINR(h.invested)}</strong>
                </div>
                <div>
                  <span>Current Value</span>
                  <strong>{formatINR(h.current)}</strong>
                </div>
                <div>
                  <span>Returns</span>
                  <span className="mf-text-success">
                    {formatINR(h.returnsAmount)} ({h.returnsPct.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span>Current NAV</span>
                  <strong>₹{h.nav}</strong>
                </div>
              </div>

              <div className="mf-holding-actions">
                <Button className="mf-holding-btn">Invest More</Button>
                <Button variant="danger" className="mf-holding-btn">
                  Redeem
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ExploreFundsTab({ funds }) {
  return (
    <div className="mf-tab-layout">
      <Card title="Explore Funds">
        <div className="mf-explore-header">
          <Input placeholder="Search funds by name…" />
          <div className="mf-chip-row">
            <Badge>All</Badge>
            <Badge>Large Cap</Badge>
            <Badge>Mid Cap</Badge>
            <Badge>Small Cap</Badge>
            <Badge>Flexi Cap</Badge>
          </div>
        </div>

        <div className="mf-funds-list">
          {funds.map((f) => (
            <div key={f.id} className="mf-fund-card">
              <div className="mf-fund-header">
                <div>
                  <div className="mf-holding-name">{f.name}</div>
                  <div className="mf-holding-sub">{f.category}</div>
                </div>
                <div className="mf-fund-nav">
                  <div className="mf-fund-nav-value">₹{f.nav}</div>
                  <div className="mf-fund-nav-label">NAV</div>
                </div>
              </div>

              <div className="mf-fund-meta-top">
                <Badge size="sm">
                  {f.risk === "High" ? "High Risk" : "Moderate Risk"}
                </Badge>
                <span className="mf-fund-meta-text">
                  Expense Ratio: {f.expense} • AUM: {f.aum}
                </span>
              </div>

              <div className="mf-fund-returns">
                <div>
                  <span>1Y</span>
                  <span className="mf-text-success">
                    {f.oneY.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span>3Y</span>
                  <span className="mf-text-success">
                    {f.threeY.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span>5Y</span>
                  <span className="mf-text-success">
                    {f.fiveY.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mf-fund-actions">
                <Button className="mf-fund-btn">Start SIP</Button>
                <Button variant="ghost" className="mf-fund-btn">
                  Invest Lumpsum
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProfileTab({ profile, portfolio, activeSips }) {
  return (
    <div className="mf-tab-layout">
      <div className="mf-grid-2">
        <Card title="Investor Profile">
          <div className="mf-profile-header">
            <div className="mf-profile-avatar">{profile.initials}</div>
            <div>
              <div className="mf-profile-name">{profile.name}</div>
              <div className="mf-profile-email">{profile.email}</div>
              <div className="mf-profile-kyc">{profile.kycStatus}</div>
            </div>
          </div>

          <div className="mf-profile-grid">
            <div>
              <span>Total Investments</span>
              <strong>{formatINR(portfolio.totalInvested)}</strong>
            </div>
            <div>
              <span>Active SIPs</span>
              <strong>{activeSips.length}</strong>
            </div>
            <div>
              <span>Risk Profile</span>
              <strong>{profile.riskProfile}</strong>
            </div>
            <div>
              <span>Member Since</span>
              <strong>{profile.memberSince}</strong>
            </div>
          </div>
        </Card>

        <Card title="Contact & KYC">
          <div className="mf-kv">
            <span>Phone</span>
            <strong>{profile.phone}</strong>
          </div>
          <div className="mf-kv">
            <span>PAN</span>
            <strong>{profile.pan}</strong>
          </div>
          <div className="mf-kv">
            <span>KYC Status</span>
            <span className="mf-text-success">{profile.kycStatus}</span>
          </div>
        </Card>
      </div>

      <Card title="Settings & Reports">
        <div className="mf-settings-list">
          <div className="mf-settings-row">
            <span>Bank Accounts</span>
            <span className="mf-settings-link">Manage</span>
          </div>
          <div className="mf-settings-row">
            <span>Download Capital Gains / Tax Report</span>
            <span className="mf-settings-link">Download</span>
          </div>
          <div className="mf-settings-row">
            <span>Nominee & FATCA Details</span>
            <span className="mf-settings-link">View / Edit</span>
          </div>
          <div className="mf-settings-row">
            <span>Security & Login</span>
            <span className="mf-settings-link">Open</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
