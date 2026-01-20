// client/src/services/dashboardSummary.service.js
import { getAdminSummary } from "./adminSummary.service.js";
import { timeAgo, titleCase } from "../utils/timeAgo";

function mapActivity(items = []) {
  return items.slice(0, 8).map((x) => {
    // backend might return already formatted title/time; support both
    const title =
      x.title ||
      `${titleCase(x.action || "Activity")}${x.entity ? ` · ${titleCase(x.entity)}` : ""}${
        x.entityId ? ` (${String(x.entityId).slice(-6)})` : ""
      }`;

    return {
      title,
      time: x.time ? x.time : timeAgo(x.createdAt), // works if backend sends createdAt
      actor: x.actor || (x.userId ? String(x.userId).slice(-6) : "System"),
    };
  });
}

/**
 * Uses backend aggregated endpoint:
 * GET /api/admin/summary
 */
export async function fetchAdminDashboardSummary(filters = {}, { signal } = {}) {
  // axios doesn't use fetch AbortSignal by default unless wired,
  // but keep signature compatible with your hook.
  if (signal?.aborted) throw new Error("aborted");

  const summary = await getAdminSummary(filters);

  return {
    ...summary,
    activity: mapActivity(summary?.activity || []),
  };
}
