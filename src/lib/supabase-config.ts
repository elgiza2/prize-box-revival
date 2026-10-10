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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxb3NiaGJieXpxb3pmZ3B0aHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzgyNTMsImV4cCI6MjEwNDE1NDI1M30.7oNaInWRGvZXfnwc_zGTghRDuGuV84Rhj4Fi_zx48uA";
