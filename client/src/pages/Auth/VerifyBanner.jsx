// src/components/VerifyBanner.jsx
import { Alert, Button } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { sendEmailVerifyLink } from "../../services/verifyService";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerifyBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  if (!user || user.emailVerified) return null;

  const resend = async () => {
    try { setSending(true); await sendEmailVerifyLink(); toast.success("Link sent"); }
    catch { toast.error("Failed to send"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: "12px auto" }}>
      <Alert type="warning" title="Verify your email">
        Please verify your email to secure your account.
        <div className="pv-row" style={{ marginTop: 8 }}>
          <Button size="sm" onClick={resend} disabled={sending}>Resend link</Button>
          <Button size="sm" variant="ghost" as="a" href="/verify">Verify now</Button>
        </div>
      </Alert>
    </div>
  );
}

// src/components/VerifyBanner.jsx
// import { Alert, Button } from "../../components";
// import { useAuth } from "../../hooks/useAuth";
// import { sendEmailVerifyLink } from "../../services/verifyService";
// import { useState } from "react";
// import toast from "react-hot-toast";

// export default function VerifyBanner() {
//   const { user } = useAuth();
//   const [sending, setSending] = useState(false);
//   const [dismissed, setDismissed] = useState(false);

//   if (!user || user.emailVerified || dismissed) return null;

//   const resend = async () => {
//     try {
//       setSending(true);
//       await sendEmailVerifyLink();
//       toast.success("Link sent");
//     } catch {
//       toast.error("Failed to send");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         maxWidth: 900,
//         margin: "12px auto",
//         position: "relative",
//       }}
//     >
//       <Alert type="warning" title="Verify your email">
//         Please verify your email to secure your account.
//         <div className="pv-row" style={{ marginTop: 8 }}>
//           <Button size="sm" onClick={resend} disabled={sending}>
//             Resend link
//           </Button>
//           <Button size="sm" variant="ghost" as="a" href="/verify">
//             Verify now
//           </Button>
//         </div>
//       </Alert>

//       {/* Dismiss/close button */}
//       <button
//         onClick={() => setDismissed(true)}
//         style={{
//           position: "absolute",
//           top: 6,
//           right: 6,
//           background: "transparent",
//           border: "none",
//           fontSize: "18px",
//           cursor: "pointer",
//           color: "var(--pv-dim)",
//         }}
//         aria-label="Dismiss"
//       >
//         ×
//       </button>
//     </div>
//   );
// }
