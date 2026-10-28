// Shows the unread-message count on any link to messages.html (staff pages). Include after config.js.
(function () {
  var running = false;
  async function refresh() {
    if (running || !window.sb) return; running = true;
    try {
      var s = (await sb.auth.getSession()).data.session; if (!s) return;
      var r = await sb.rpc('chat_unread_total'); if (r.error) return;
      var n = Number(r.data) || 0;
      document.querySelectorAll('a[href="messages.html"]').forEach(function (a) {
        var b = a.querySelector('.gm-chat-badge');
        if (!n) { if (b) b.remove(); return; }
        if (!b) { b = document.createElement('span'); b.className = 'gm-chat-badge';
          b.style.cssText = 'background:#c62828;color:#fff;border-radius:10px;padding:0 6px;font-size:.68rem;font-weight:700;line-height:16px;min-width:16px;text-align:center;margin-left:4px;'; a.appendChild(b); }
        b.textContent = n > 99 ? '99+' : String(n);
      });
    } catch (e) {} finally { running = false; }
  }
  window.gmChatBadgeRefresh = refresh;
  setTimeout(refresh, 600);
  setInterval(function () { if (!document.hidden) refresh(); }, 30000);
})();
