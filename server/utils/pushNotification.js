import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendPushToTokens(tokens, message) {
  const validTokens = (tokens || []).filter((t) => Expo.isExpoPushToken(t));
  if (!validTokens.length) return { ok: true, sent: 0 };

  const messages = validTokens.map((to) => ({
    to,
    sound: "default",
    channelId: "leads", // android channel
    ...message,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return { ok: true, sent: validTokens.length, tickets };
}
