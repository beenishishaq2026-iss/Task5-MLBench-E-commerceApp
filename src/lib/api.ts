export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function resolveServerBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SERVER_API_URL = resolveServerBase();