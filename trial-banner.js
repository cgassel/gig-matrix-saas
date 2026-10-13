// Shows a trial / billing banner at the top of the page. Include after config.js.
(async function () {
  try {
    const { data: s } = await sb.rpc('get_trial_status');
    if (!s || s.status === 'active') return;
    let text, bg;
    if (s.readOnly) { text = 'Your trial has ended. Your data is safe, but the account is read-only until you subscribe.'; bg = '#b3261e'; }
    else if (s.status === 'past_due') { text = 'Your last payment failed. Please update your card to avoid losing access.'; bg = '#c46a00'; }
    else if (s.status === 'trialing' && s.daysLeft != null) {
      text = 'Free trial: ' + s.daysLeft + ' day' + (s.daysLeft === 1 ? '' : 's') + ' left.'; bg = s.daysLeft <= 3 ? '#c46a00' : '#A07018';
    } else return;
    const bar = document.createElement('div');
    bar.style.cssText = 'background:' + bg + ';color:#fff;text-align:center;padding:8px 12px;font:600 .85rem Segoe UI,Arial,sans-serif;';
    bar.textContent = text + ' ';
    if (s.isAdmin) {
      const a = document.createElement('a'); a.href = 'billing.html'; a.textContent = 'Billing →';
      a.style.cssText = 'color:#fff;text-decoration:underline;margin-left:6px;'; bar.appendChild(a);
    }
    document.body.insertBefore(bar, document.body.firstChild);
  } catch (_) {}
})();
