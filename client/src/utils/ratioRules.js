// src/utils/ratioRules.js

// --- robust DOB parser for HTML <input type="date"> (yyyy-mm-dd) ---
const parseDOB = (dobStr) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dobStr || "");
  if (!m) return null;
  const [_, y, mo, d] = m.map(Number);
  return new Date(y, mo - 1, d); // local date, no timezone surprises
};

export const isValidDOB = (dobStr) => !!parseDOB(dobStr);

// --- normalize bucket targets to 100% (keeps proportions, 1 decimal) ---
const normalizeTargets = (t) => {
  const sum =
    t.essentials +
    t.savingsInvestments +
    t.emergencyHealth +
    t.entertainmentLux +
    t.learning +
    t.charity;

  if (!sum || Math.abs(sum - 100) < 0.01) return t;

  const k = 100 / sum;
  const scale = (x) => Math.round(x * k * 10) / 10;

  return {
    ...t,
    essentials:          scale(t.essentials),
    savingsInvestments:  scale(t.savingsInvestments),
    emergencyHealth:     scale(t.emergencyHealth),
    entertainmentLux:    scale(t.entertainmentLux),
    learning:            scale(t.learning),
    charity:             scale(t.charity),
    _originalTotal: Math.round(sum * 10) / 10, // optional: for a small note in UI
  };
};

export const classifyAgeGroup = (dobStr) => {
  const dob = parseDOB(dobStr);
  if (!dob) return "25–35"; // fallback
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  if (age < 25) return "Below 25";
  if (age <= 35) return "25–35";
  if (age <= 45) return "35–45";
  if (age <= 55) return "45–55";
  return "55+";
};

/**
 * Returns normalized target % by umbrella buckets:
 * essentials, savingsInvestments, emergencyHealth, entertainmentLux, learning, charity
 */
export const getTargetsForAgeGroup = (ageGroup) => {
  switch (ageGroup) {
    case "Below 25":
      return normalizeTargets({
        essentials: 30,
        savingsInvestments: 30,
        emergencyHealth: 0,
        entertainmentLux: 30,
        learning: 10,
        charity: 0,
        ruleLabel: "30/30/30/10 (Students/Early Job)",
        keyFocus: "Build saving habit, start SIPs, invest in skills. Avoid debt.",
      });

    case "25–35":
      return normalizeTargets({
        essentials: 50,
        savingsInvestments: 20,  // core savings/investments
        emergencyHealth: 10,     // explicitly called out for visibility
        entertainmentLux: 22,    // mid of 20–25
        learning: 7,             // 5–10
        charity: 3,              // 0–5
        ruleLabel: "50/30/20 (+Emergency & Lifestyle tune)",
        keyFocus: "Control lifestyle inflation, start insurance, build emergency fund.",
      });

    case "35–45":
      return normalizeTargets({
        essentials: 40,
        savingsInvestments: 25,
        emergencyHealth: 10,
        entertainmentLux: 15,
        learning: 10,
        charity: 5,
        ruleLabel: "Paisavidhya Golden Ratio 40/25/10/15/10 (+5 charity)",
        keyFocus: "Balance family goals, adequate insurance, and measured leisure.",
      });

    case "45–55":
      return normalizeTargets({
        essentials: 60,
        savingsInvestments: 20,  // 10% savings + 10% investments
        emergencyHealth: 10,
        entertainmentLux: 7,     // 5–10
        learning: 7,             // 5–10
        charity: 5,
        ruleLabel: "60/10/10/10/10 (Mid-Career Stability, normalized)",
        keyFocus: "Prioritize retirement, reduce luxuries, secure health coverage.",
      });

    case "55+":
    default:
      return normalizeTargets({
        essentials: 65,          // mid of 60–70
        savingsInvestments: 20,
        emergencyHealth: 10,
        entertainmentLux: 6,     // 5–8
        learning: 3,             // 2–5
        charity: 3,              // 2–5
        ruleLabel: "70/20/10 (Pre-Retirement/Retired, normalized)",
        keyFocus: "Preserve capital, minimize risk, focus on health & peace.",
      });
  }
};
