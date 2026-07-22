// /frontend/src/constants/admin.js

// Emails that get the internal/admin experience (Dashboard + Insights nav,
// no Scan, no floating Assistant) instead of the consumer-facing app.
// Move this to a backend-driven "role" claim later if the admin list grows
// beyond a couple of people — hardcoding emails here means anyone editing
// this file can grant admin access, which is fine for now but not a real
// permission system.
export const ADMIN_EMAILS = ["krishbhensdadia21@gmail.com"];

export function isAdminUser(user) {
  return !!user && ADMIN_EMAILS.includes(user.email);
}