export function timeAgo(isoOrDate) {
  if (!isoOrDate) return "—";

  // Support Date object or string/number
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);

  // If string like "2026-01-19" (no time), force local midnight to avoid TZ weirdness
  if (typeof isoOrDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
    const [y, mo, da] = isoOrDate.split("-").map(Number);
    const local = new Date(y, mo - 1, da, 0, 0, 0);
    if (!Number.isNaN(local.getTime())) {
      return _timeAgoFromMs(Date.now() - local.getTime());
    }
  }

  if (Number.isNaN(d.getTime())) return "—";

  return _timeAgoFromMs(Date.now() - d.getTime());
}

function _timeAgoFromMs(ms) {
  // Handle future times (server clock / timezone drift)
  if (ms < 0) {
    const ahead = Math.abs(ms);
    const s = Math.floor(ahead / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const days = Math.floor(h / 24);

    if (s < 45) return "in a few seconds";
    if (m < 60) return `in ${m}m`;
    if (h < 24) return `in ${h}h`;
    return `in ${days}d`;
  }

  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);

  if (s < 45) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;

  // after a week: show date instead of "32d ago"
  const dt = new Date(Date.now() - ms);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function titleCase(x) {
  return String(x || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
