// Shows a trial / read-only banner at the top of the page. Include after config.js.
(async function () {
  try {
    const { data } = await sb.rpc('get_trial_status');
    if (!data || data.status === 'active' || (data.status === 'trialing' && data.daysLeft == null)) return;
    let text, bg;
    if (data.readOnly) {
      text = 'Your trial has ended. Your data is safe, but the account is read-only until you subscribe.'; bg = '#b3261e';
    } else if (data.status === 'trialing') {
      const d = data.daysLeft;
      text = 'Free trial: ' + d + ' day' + (d === 1 ? '' : 's') + ' left.'; bg = d <= 3 ? '#c46a00' : '#A07018';
    } else return;
    const bar = document.createElement('div');
    bar.style.cssText = 'background:' + bg + ';color:#fff;text-align:center;padding:8px 12px;font:600 .85rem Segoe UI,Arial,sans-serif;';
    bar.textContent = text;
    document.body.insertBefore(bar, document.body.firstChild);
  } catch (_) {}
})();
