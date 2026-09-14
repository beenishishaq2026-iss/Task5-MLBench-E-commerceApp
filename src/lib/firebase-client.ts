"use client";

// Matches the config already used in public/firebase-messaging-sw.js.
const firebaseConfig = {
  apiKey: "AIzaSyDyVCQQlYQflVh7MhFxjRGIVi2D2auC36g",
  projectId: "e-commerce-f063b",
  messagingSenderId: "735539881078",
  appId: "1:735539881078:web:fcd5e44cf59160b3996b57",
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