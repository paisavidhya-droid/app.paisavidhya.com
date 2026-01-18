// server\utils\notify.js
import PushToken from "../models/PushToken.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function notifyUsers(userIds, message) {
  const tokens = await PushToken.find({ userId: { $in: userIds } })
    .select("token")
    .lean();

  const expoTokens = tokens.map((t) => t.token).filter(Boolean);
  if (!expoTokens.length) return { ok: true, sent: 0 };

  // Expo allows batching; keep it simple
  const payloads = expoTokens.map((to) => ({
    to,
    title: message.title,
    body: message.body,
    data: message.data || {},
    sound: "default",
    channelId: "default",
  }));

  const r = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloads),
  });

  const json = await r.json().catch(() => ({}));

  // cleanup invalid tokens
  const errors = json?.data?.filter((d) => d?.status === "error") || [];
  const dead = errors
    .filter((e) => e?.details?.error === "DeviceNotRegistered")
    .map((e) => e?.details?.expoPushToken)
    .filter(Boolean);

  if (dead.length) {
    await PushToken.deleteMany({ token: { $in: dead } });
  }

  return { ok: r.ok, sent: expoTokens.length, response: json, removed: dead.length };
}
