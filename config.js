// ============================================================================
// config.js — fill in YOUR project's values below, then this file is
// included on every page via a <script> tag, same pattern as api.js in
// your other app. It sets up a single shared `sb` object every page uses
// to talk to Supabase.
//
// Where to find these: Supabase dashboard → gear icon (Settings) → API
// ============================================================================

const SUPABASE_URL = 'https://nqwnemqatlktynssailk.supabase.co';       // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd25lbXFhdGxrdHluc3NhaWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODc4NjksImV4cCI6MjEwMzg2Mzg2OX0.k58zIushSVhVbw_qLgtCXlcNnVt-Dsm8OugirdtaCJw';      // the long "anon / public" key — safe to expose, this is what RLS is for

// Used for turning venue addresses into map coordinates (geocoding) and for
// the map tiles themselves. Get this from your LocationIQ dashboard —
// it's fine to expose in frontend code, LocationIQ's free tier is
// specifically designed to be called directly from the browser.
const LOCATIONIQ_KEY = 'pk.258a033d2b1d1e9411781d2286380fc0';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
