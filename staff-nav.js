// Shared navigation button row for staff pages (admins and agents).
// Include after config.js. Puts one row of buttons right under the top bar; the current page is highlighted.
(async function () {
  try {
    var s = (await sb.auth.getSession()).data.session;
    if (!s) return;
    var r = await sb.from('profiles').select('role').eq('id', s.user.id).maybeSingle();
    var role = r.data && r.data.role;
    if (!role) return;
    var isAdmin = role === 'admin' || role === 'owner';

    var path = location.pathname.split('/').pop() || 'index.html';
    var mine = /[?&]mine=1/.test(location.search);
    var items = [
      { href: isAdmin ? 'admin-dashboard.html' : 'dashboard.html', icon: '🏠', label: isAdmin ? 'Admin Dashboard' : 'Dashboard', key: 'dash' },
      { href: 'create-booking.html', icon: '➕', label: 'Create Booking', key: 'create-booking.html' },
      { href: 'bands.html', icon: '🎸', label: 'Band Directory', key: 'bands.html' },
      { href: 'venues.html', icon: '🏛', label: 'Venue Directory', key: 'venues.html' },
      { href: 'venue-map.html', icon: '🗺', label: 'Venue Map', key: 'venue-map.html' },
      { href: 'bookings.html', icon: '📆', label: 'All Bookings', key: 'bookings.html' },
      { href: 'bookings.html?mine=1', icon: '📅', label: 'My Bookings', key: 'mine' },
      { href: 'contracts.html', icon: '📋', label: 'Contracts', key: 'contracts.html' },
      { href: 'advertising.html', icon: '📣', label: 'Advertising', key: 'advertising.html' }
    ];

    var style = document.createElement('style');
    style.textContent =
      '.gm-staffnav{display:flex;justify-content:safe center;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:10px 16px;background:#f2ede4;border-bottom:1px solid #d4c4a0;}' +
      '.gm-staffnav a{flex:0 0 132px;width:132px;box-sizing:border-box;justify-content:center;display:flex;align-items:center;gap:6px;padding:8px 8px;border-radius:9px;border:1.5px solid #d4c4a0;background:#faf8f4;color:#A07018;font:600 0.78rem "Segoe UI",Arial,sans-serif;text-decoration:none;white-space:nowrap;}' +
      '.gm-staffnav a:hover{background:#A07018;color:#fff;border-color:#A07018;}' +
      '.gm-staffnav a.on{background:#A07018;color:#fff;border-color:#A07018;}';
    document.head.appendChild(style);

    var bar = document.createElement('nav');
    bar.className = 'gm-staffnav';
    bar.setAttribute('aria-label', 'Main navigation');
    bar.innerHTML = items.map(function (it) {
      var on = (it.key === 'mine') ? (path === 'bookings.html' && mine)
             : (it.key === 'dash') ? (path === (isAdmin ? 'admin-dashboard.html' : 'dashboard.html'))
             : (it.key === 'bookings.html') ? (path === 'bookings.html' && !mine)
             : path === it.key;
      return '<a href="' + it.href + '"' + (on ? ' class="on"' : '') + '><span>' + it.icon + '</span>' + it.label + '</a>';
    }).join('');

    var top = document.querySelector('.topbar');
    if (top && top.parentNode) top.parentNode.insertBefore(bar, top.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
  } catch (e) { /* page works without it */ }
})();
