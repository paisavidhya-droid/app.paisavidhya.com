// utils/dateUtils.js


export function normalizeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date)) return value; // Not a valid date, return as-is

    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export function formatDisplayDate(value) {
    if (!value) return "";

    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value; // fallback if not parseable
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }); // e.g., "Aug 15, 2025"
    } catch {
        return value;
    }
}
