import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Badge } from "./index"; // adjust path to your components
import { ClipLoader } from "react-spinners";
import { FiRefreshCw } from "react-icons/fi";

export default function MathCaptcha({
  onChange, // (isValid:boolean) => void
  min = 3,
  max = 9,
  className = "",
  style,
  size = "sm", // not used by default Input, but kept if you map sizes
}) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState("+"); // '+' or '-'
  const [answer, setAnswer] = useState("");
  const [valid, setValid] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Optional: “bot tripwire”: require a tiny delay before it can be valid
  const mountedAt = useRef(Date.now());

  const correct = useMemo(() => {
    return op === "+" ? a + b : a - b;
  }, [a, b, op]);

  const gen = () => {
    // Generate numbers ensuring subtraction stays non-negative
    const x = Math.floor(Math.random() * (max - min + 1)) + min;
    const y = Math.floor(Math.random() * (max - min + 1)) + min;

    const shouldSubtract = Math.random() < 0.5;
    if (shouldSubtract) {
      const hi = Math.max(x, y);
      const lo = Math.min(x, y);
      setA(hi);
      setB(lo);
      setOp("-");
    } else {
      setA(x);
      setB(y);
      setOp("+");
    }
    setAnswer("");
    setValid(false);
    mountedAt.current = Date.now();
  };

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ok =
      String(answer).trim() !== "" &&
      Number.isFinite(Number(answer)) &&
      Number(answer) === correct &&
      // tiny delay to avoid instant autofill by (very naive) bots
      Date.now() - mountedAt.current > 400;

    setValid(ok);
    onChange?.(ok);
  }, [answer, correct, onChange]);

  const refresh = async () => {
    setRefreshing(true);
    // small delay so the spinner is visible
    setTimeout(() => {
      gen();
      setRefreshing(false);
    }, 250);
  };

  return (
    <div
      className={`pv-row ${className}`}
      style={{ gap: 8, alignItems: "end", ...style }}
    >
      <div className="pv-col" style={{ gap: 6 }}>
        <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
          Quick human check
        </div>
        <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
          <div
            aria-hidden
            style={{
              padding: "8px 10px",
              border: "1px solid var(--pv-border)",
              borderRadius: 6,
              minWidth: 90,
              textAlign: "center",
              fontWeight: 700,
              background: "var(--pv-surface)",
            }}
          >
            {a} {op} {b} = ?
          </div>
          <Input
            aria-label="Enter the result of the math question"
            placeholder="Answer"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ width: 96 }}
            maxLength={3}
          />
          <Button
            type="button"
            onClick={refresh}
            variant="secondary"
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="pv-row" style={{ gap: 6, alignItems: "center" }}>
                <ClipLoader size={14} /> New
              </span>
            ) : (
              <span className="pv-row" style={{ gap: 6, alignItems: "center" }}>
                <FiRefreshCw size={16} />
                New
              </span>
            )}
          </Button>
        </div>
        {valid && (
          <Badge
            style={{
              width: "110px",
              backgroundColor: "#d1fae5",
              color: "#047857",

              fontSize: "0.87rem",
              borderRadius: "0.375rem",
              fontWeight: "500",
            }}
          >
            {" "}
            ✓ Looks good
          </Badge>
        )}
      </div>
    </div>
  );
}
