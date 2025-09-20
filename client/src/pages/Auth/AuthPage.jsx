import { useMemo, useState } from "react";
import "../../styles/ui.css";
import {
  Card,
  Button,
  Input,
  Checkbox,
  Tabs,
  Alert,
  Badge,
  PasswordInput,
} from "../../components";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { login, register } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

/* --------------------------- Sign In --------------------------- */
function SignInForm() {
  const navigate = useNavigate();
  const { storeTokenInLS } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  // const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!identifier || !password) {
      setErr("Email/phone and password are required");
      return;
    }

    try {
      setLoading(true);
      // 1) login via axios service
      const id = identifier.trim();
      const payload = id.includes("@")
        ? { email: id.toLowerCase(), password }
        : { phoneNumber: id.replace(/\s+/g, ""), password };

      const { token /*user*/ } = await login(payload);

      // 2) persist token in Redux (your slice writes to localStorage "token")
      storeTokenInLS(token); // AuthBootstrap will hydrate via /me

      toast.success("Welcome back!");
      navigate("/start", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pv-col" style={{ gap: 12 }}>
      {err && (
        <Alert type="danger" title="Sign in failed">
          {err}
        </Alert>
      )}
      <Input
        label="Email or phone"
        type="text"
        placeholder="you@example.com or 9999999999"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoComplete="username"
      />
      <PasswordInput
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <div
        className="pv-row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        {/* <Checkbox
          label="Remember me"
          checked={remember}
          onChange={setRemember}
          disabled
        /> */}

        {/* Keep a static hint instead of a disabled checkbox */}
        <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
          Tip: Sign in with email or phone.
        </div>
        <Badge>Secure</Badge>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <span className="pv-row" style={{ gap: 8, alignItems: "center" }}>
            <ClipLoader size={18} color="white" /> Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

/* --------------------------- Sign Up --------------------------- */
function SignUpForm() {
  const navigate = useNavigate();
  const { storeTokenInLS } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const match = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!name || !email || !password || !phoneNumber) {
      setErr("All fields are required");
      return;
    }
    if (!agree) {
      setErr("Please agree to the terms");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!match) {
      setErr("Passwords don’t match.");
      toast.error("Passwords don’t match.");
      return;
    }
    try {
      setLoading(true);
      // 1) register via axios service
      const body = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: phoneNumber.trim().replace(/\s+/g, ""),
      };

      const { token /*, user*/ } = await register(body);

      // 2) store token → slice persists to localStorage
      storeTokenInLS(token);

      toast.success("Account created!");
      navigate("/verify", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pv-col" style={{ gap: 12 }}>
      {err && (
        <Alert type="danger" title="Sign up failed">
          {err}
        </Alert>
      )}
      <Input
        label="Full name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Mobile"
        placeholder="ex: 9876543210"
        value={phoneNumber}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="tel"
        maxLength={10}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordInput
        label="Confirm password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Checkbox
        label="I agree to the terms & privacy"
        checked={agree}
        onChange={setAgree}
      />
      <Button type="submit" disabled={loading}>
        {loading ? (
          <span className="pv-row" style={{ gap: 8, alignItems: "center" }}>
            <ClipLoader size={18} color="white" /> Creating…
          </span>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}

/* --------------------------- Page Shell --------------------------- */
export default function AuthPage() {
  const [tabIndex] = useState(0);

  const tabs = useMemo(
    () => [
      { label: "Sign in", content: <SignInForm /> },
      { label: "Sign up", content: <SignUpForm /> },
    ],
    []
  );

  return (
    <div
      className="pv-auth-shell"
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "minmax(0,520px)",
        placeContent: "center",
        padding: "24px",
      }}
    >
      <Card>
        <div className="pv-col" style={{ gap: 16 }}>
          <div className="pv-col" style={{ gap: 6, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              Welcome to Paisavidhya
            </div>
            <div style={{ color: "var(--pv-dim)" }}>
              Your Family’s Financial Doctor
            </div>
          </div>
          <Tabs tabs={tabs} defaultIndex={tabIndex} />
          <div
            style={{
              color: "var(--pv-dim)",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            By continuing, you agree to our terms & privacy.
          </div>
        </div>
      </Card>
    </div>
  );
}
