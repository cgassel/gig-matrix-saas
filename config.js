// ============================================================================
// config.js — fill in YOUR project's values below, then this file is
// included on every page via a <script> tag, same pattern as api.js in
// your other app. It sets up a single shared `sb` object every page uses
// to talk to Supabase.
//
// Where to find these: Supabase dashboard → gear icon (Settings) → API
// ============================================================================

const SUPABASE_URL = 'PASTE_YOUR_PROJECT_URL_HERE';       // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'PASTE_YOUR_ANON_KEY_HERE';      // the long "anon / public" key — safe to expose, this is what RLS is for

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
