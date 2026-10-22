// Admins: every "← Dashboard" link/button goes to the ADMIN dashboard instead of the agent one.
// Include after config.js on staff pages. Does nothing for agents or when logged out.
(async function () {
  try {
    var s = (await sb.auth.getSession()).data.session;
    if (!s) return;
    var r = await sb.from('profiles').select('role').eq('id', s.user.id).maybeSingle();
    var role = r.data && r.data.role;
    if (role !== 'admin' && role !== 'owner') return;
    document.querySelectorAll('a[href="dashboard.html"]').forEach(function (a) {
      a.setAttribute('href', 'admin-dashboard.html');
      a.innerHTML = a.innerHTML.replace('Dashboard', 'Admin Dashboard');
    });
    document.querySelectorAll('button[onclick*="\'dashboard.html\'"], button#backBtn').forEach(function (b) {
      b.onclick = function () { window.location.href = 'admin-dashboard.html'; };
      b.innerHTML = b.innerHTML.replace(/Dashboard/, 'Admin Dashboard');
    });
  } catch (e) { /* navigation stays as it was */ }
})();
