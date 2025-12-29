// client/src/pages/PledgeWithOrg.jsx
// Route: /pledge/:orgCode
// Purpose: validate partner org code, store it, then redirect to dashboard.
// The real pledge UX happens inside the dashboard (OrgPledge component).
// client/src/pages/PledgeWithOrg.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Skeleton, Alert } from "../../components";
import { getOrgByCodePublic } from "../../services/orgService";

const PARTNER_CODE_KEY = "pv_partnerOrgCode";
const PARTNER_ORG_DATA_KEY = "pv_partnerOrgData";

export default function PledgeWithOrg() {
  const { orgCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setLoading(true);
        setError("");

        // 1. Validate orgCode AND get its details
        const org = await getOrgByCodePublic(orgCode);

        if (!active) return;

        // 2. Store the orgCode and org object for dashboard/pledge
        localStorage.setItem(PARTNER_CODE_KEY, org.shortCode || orgCode);
        localStorage.setItem(PARTNER_ORG_DATA_KEY, JSON.stringify(org));

        // 3. Redirect to main dashboard
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error(e);
        if (!active) return;
        setError("This partner link is invalid or not active.");
        setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [orgCode, navigate]);

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}
    >
      <Card>
        {loading && !error ? (
          <div className="pv-col" style={{ gap: 12 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="80%" />
            <Skeleton height={80} />
          </div>
        ) : error ? (
          <Alert type="danger">{error}</Alert>
        ) : null}
      </Card>
    </div>
  );
}
