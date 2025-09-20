
import { useAuth } from "../../hooks/useAuth";
import { Card, Input, Button, Alert } from "../../components";
import { useState } from "react";
import VerifyBanner from "../Auth/VerifyBanner";

export default function Profile(){
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");

  return (
    <div className="pv-container" style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <Card title="Profile">
        <div className="pv-col" style={{ gap:12 }}>
          <Alert type="info">Basic profile only for now. More fields will appear as modules unlock.</Alert>
          <VerifyBanner />
          <Input label="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <Input label="Mobile" value={phone} onChange={e=>setPhone(e.target.value)} />
          <Button disabled>Save (coming soon)</Button>
          {/* Raw JSON output */}
          {user && (
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
              <pre style={{ margin: 0 }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
