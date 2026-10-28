// Simple messaging for band and venue portals: message your own booking agent(s), nothing else.
// Usage: gmPortalChat.init({ token: portalToken, mount: element, onUnread: function (n) {} })
//        gmPortalChat.open()  when the Messages tab is shown, gmPortalChat.close() when it is hidden.
window.gmPortalChat = (function () {
  var cfg = null, agents = [], cur = null, timer = null, active = false, busy = false, lastSig = '';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function link(t) { return t.replace(/(https?:\/\/[^\s<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>'; }); }
  function css() {
    if (document.getElementById('gm-pc-css')) return;
    var s = document.createElement('style'); s.id = 'gm-pc-css';
    s.textContent = '.pc-wrap{background:#fff;border:1.5px solid #d4c4a0;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;height:min(70vh,560px);}' +
      '.pc-head{padding:12px 16px;background:#faf8f4;border-bottom:1.5px solid #d4c4a0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}' +
      '.pc-head b{font-size:.95rem;} .pc-chip{border:1.5px solid #d4c4a0;background:#f2ede4;color:#A07018;border-radius:16px;padding:5px 12px;font:600 .82rem "Segoe UI",Arial,sans-serif;cursor:pointer;}' +
      '.pc-chip.on{background:#A07018;color:#fff;border-color:#A07018;} .pc-chip i{font-style:normal;background:#c62828;color:#fff;border-radius:9px;padding:0 6px;font-size:.7rem;margin-left:5px;}' +
      '.pc-msgs{flex:1;overflow-y:auto;padding:14px 16px;background:#fff;} .pc-m{max-width:80%;margin:6px 0;padding:8px 12px;border-radius:12px;font-size:.92rem;line-height:1.4;white-space:pre-wrap;word-wrap:break-word;}' +
      '.pc-m.in{background:#f2ede4;border-top-left-radius:3px;} .pc-m.out{background:#A07018;color:#fff;margin-left:auto;border-top-right-radius:3px;} .pc-m.out a{color:#fff;}' +
      '.pc-m a{color:#A07018;} .pc-m small{display:block;font-size:.7rem;opacity:.7;margin-top:3px;} .pc-m.del{opacity:.6;font-style:italic;}' +
      '.pc-comp{display:flex;gap:8px;padding:10px 12px;border-top:1.5px solid #d4c4a0;background:#faf8f4;align-items:flex-end;}' +
      '.pc-comp textarea{flex:1;resize:none;border:1.5px solid #d4c4a0;border-radius:8px;padding:9px 11px;font:inherit;font-size:.92rem;min-height:40px;max-height:110px;}' +
      '.pc-comp button{background:#A07018;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer;font-family:inherit;} .pc-comp button:disabled{opacity:.5;}' +
      '.pc-empty{color:#6b5e48;text-align:center;margin:auto;padding:24px;font-size:.9rem;} .pc-err{color:#c62828;font-size:.82rem;padding:0 14px 8px;}';
    document.head.appendChild(s);
  }
  async function loadAgents() {
    var r = await sb.rpc('portal_chat_agents', { p_token: cfg.token });
    if (r.error) throw new Error(r.error.message);
    agents = r.data || [];
    if (!cur || !agents.some(function (a) { return a.agent_id === cur; })) {
      var firstUnread = agents.find(function (a) { return a.unread > 0; });
      cur = (firstUnread || agents[0] || {}).agent_id || null;
    }
    var total = agents.reduce(function (n, a) { return n + (a.unread || 0); }, 0);
    if (cfg.onUnread) cfg.onUnread(active && cur ? agents.filter(function (a) { return a.agent_id !== cur; }).reduce(function (n, a) { return n + (a.unread || 0); }, 0) : total);
  }
  function drawShell() {
    if (!agents.length) { cfg.mount.innerHTML = '<div class="pc-wrap"><div class="pc-empty">You don\'t have a booking agent to message yet. Once one is assigned to you, you can message them here.</div></div>'; return false; }
    var chips = agents.length > 1 ? agents.map(function (a) { return '<button class="pc-chip' + (a.agent_id === cur ? ' on' : '') + '" data-a="' + a.agent_id + '">' + esc(a.name) + (a.unread && a.agent_id !== cur ? '<i>' + a.unread + '</i>' : '') + '</button>'; }).join('') : '';
    var name = (agents.find(function (a) { return a.agent_id === cur; }) || {}).name || '';
    var head = '<div class="pc-head"><b>' + (agents.length > 1 ? 'Message:' : 'Message ' + esc(name)) + '</b>' + chips + '</div>';
    if (!cfg.mount.querySelector('.pc-wrap')) {
      cfg.mount.innerHTML = '<div class="pc-wrap"><div id="pcHead"></div><div class="pc-msgs" id="pcMsgs"></div><div class="pc-err" id="pcErr"></div>' +
        '<div class="pc-comp"><textarea id="pcBox" rows="1" maxlength="2000" placeholder="Write a message…"></textarea><button id="pcSend">Send</button></div></div>';
      cfg.mount.querySelector('#pcSend').onclick = send;
      var box = cfg.mount.querySelector('#pcBox');
      box.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      cfg.mount.querySelector('#pcHead').addEventListener('click', function (e) { var b = e.target.closest('.pc-chip'); if (b) { cur = b.dataset.a; lastSig = ''; refresh(true); } });
    }
    cfg.mount.querySelector('#pcHead').innerHTML = head; return true;
  }
  async function refresh(force) {
    if (busy || !cfg) return; busy = true;
    try {
      await loadAgents(); if (!drawShell() || !cur) return;
      var r = await sb.rpc('portal_chat_messages', { p_token: cfg.token, p_agent: cur, p_mark_read: active });
      if (r.error) throw new Error(r.error.message);
      var rows = r.data || [], sig = cur + '|' + rows.length + '|' + (rows.length ? rows[rows.length - 1].id : '');
      var box = cfg.mount.querySelector('#pcMsgs');
      if (sig !== lastSig || force) {
        var near = box.scrollHeight - box.scrollTop - box.clientHeight < 120 || lastSig === '';
        box.innerHTML = rows.length ? rows.map(function (m) {
          var d = new Date(m.created_at);
          return '<div class="pc-m ' + (m.mine ? 'out' : 'in') + (m.deleted ? ' del' : '') + '">' + (m.deleted ? 'This message was deleted' : link(esc(m.body))) +
            '<small>' + (m.mine ? '' : esc(m.sender_name) + ' · ') + esc(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })) + '</small></div>';
        }).join('') : '<div class="pc-empty">No messages yet. Write the first one below.</div>';
        if (near) box.scrollTop = box.scrollHeight; lastSig = sig;
      }
      cfg.mount.querySelector('#pcErr').textContent = '';
    } catch (e) { var er = cfg.mount.querySelector('#pcErr'); if (er) er.textContent = e.message; }
    finally { busy = false; }
  }
  async function send() {
    var box = cfg.mount.querySelector('#pcBox'), btn = cfg.mount.querySelector('#pcSend'), t = box.value.trim();
    if (!t || !cur) return; btn.disabled = true;
    var r = await sb.rpc('portal_chat_send', { p_token: cfg.token, p_agent: cur, p_body: t });
    btn.disabled = false;
    if (r.error) { cfg.mount.querySelector('#pcErr').textContent = r.error.message; return; }
    box.value = ''; lastSig = ''; await refresh(true); box.focus();
  }
  function tick() { if (document.hidden) return; refresh(false); }
  return {
    init: function (c) { cfg = c; css(); refresh(true); clearInterval(timer); timer = setInterval(function () { if (!document.hidden) { if (active) refresh(false); else loadAgents().catch(function () {}); } }, active ? 6000 : 6000); },
    open: function () { active = true; lastSig = ''; refresh(true); },
    close: function () { active = false; }
  };
})();
