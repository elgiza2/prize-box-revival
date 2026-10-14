// Shared Supabase public config with hardcoded fallbacks so the app works on
// hosts (Vercel, custom domains) where VITE_* env vars are not configured.
// These are publishable/anon values — safe to ship in the client bundle.

export const SUPABASE_PROJECT_ID =
  (import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined) ||
  "iqosbhbbyzqozfgpthyj";

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  "sb_publishable_dIkkOTDxGdsv9GnRK_nWzQ_BBUGd-03";
