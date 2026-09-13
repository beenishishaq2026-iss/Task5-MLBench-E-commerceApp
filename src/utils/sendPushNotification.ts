import { fcmAdmin } from '@/lib/firebase-admin';

export async function sendPushToTokens(tokens: string[], title: string, body: string) {
  if (tokens.length === 0) return;
  await fcmAdmin.sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
}