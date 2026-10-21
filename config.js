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

// The login lives in sessionStorage, not localStorage: it ends when the tab or browser is closed,
// and it is never shared with another tab. (Staff must log in again in a new tab.)
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true }
});

// ── Session safety ──────────────────────────────────────────────────────────
// 1) Browser Back/Forward can restore an old page from memory (even after Sign Out).
//    When that happens, reload it so it re-checks the login and bounces to login.html.
window.addEventListener('pageshow', function (e) { if (e.persisted) window.location.reload(); });

// 2) Auto sign-out after IDLE_MINUTES with no clicks, typing or scrolling.
//    Only acts when someone is actually logged in (staff or a venue/band portal).
var IDLE_MINUTES = 30;
(function () {
  var last = Date.now();
  ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { last = Date.now(); }, { passive: true });
  });
  setInterval(async function () {
    if (Date.now() - last < IDLE_MINUTES * 60 * 1000) return;
    var portal = null;
    try { portal = sessionStorage.getItem('gm_portal_token'); } catch (e) {}
    var staff = null;
    try { staff = (await sb.auth.getSession()).data.session; } catch (e) {}
    if (!portal && !staff) { last = Date.now(); return; }
    try { await sb.auth.signOut(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    window.location.href = 'login.html?timeout=1';
  }, 30000);
})();
