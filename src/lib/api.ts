// The frontend and backend are now one Next.js app on one origin, so this
// just needs to resolve to a relative path ("") unless explicitly overridden.
// Used by "use client" components, where the browser resolves a relative
// "/api/..." URL against the current page's origin automatically.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Server Components (e.g. the homepage) call fetch() during server-side
// rendering, where there is no browser to resolve a relative URL against -
// Node's fetch requires an absolute one. Reuses APP_URL (already defined for
// the email verification link) since this app's API is same-origin; falls
// back to localhost:3000 for local dev if APP_URL isn't set.
export const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";