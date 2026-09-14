"use client";

// Matches the config already used in public/firebase-messaging-sw.js.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Requests browser notification permission, registers the service worker,
// grabs an FCM token, and returns it. Returns null if the user declines or
// the browser doesn't support push. Set NEXT_PUBLIC_FIREBASE_VAPID_KEY in
// env for getToken() to succeed — without it Firebase will throw, which is
// caught by the caller.
export async function requestPushToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const { initializeApp, getApps } = await import("firebase/app");
  const { getMessaging, getToken } = await import("firebase/messaging");

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return token || null;
}