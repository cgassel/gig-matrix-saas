// Reliability scorecards for bands and venues. Staff only (admins and booking agents).
// Include after config.js on bands.html and venues.html.
//   gmScorecard.loadGrades('band'|'venue')  -> Promise; fills gmScorecard.grades
//   gmScorecard.label(type, id)             -> text for the Scorecard button, e.g. "Scorecard · A"
//   gmScorecard.open(type, id, name, cb)    -> opens the scorecard window; cb() runs when something changed
var gmScorecard = (function () {
  var grades = { band: {}, venue: {} };
  var cur = null, onChange = null, built = false;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function dstr(ds) { var p = String(ds).slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function gradeColor(g) { return { A: '#2e7d32', B: '#7a9a1a', C: '#c8960c', D: '#d2691e', F: '#b71c1c' }[g] || '#A07018'; }

  async function loadGrades(type) {
    grades[type] = {};
    try {
      var r = await sb.rpc('list_scorecard_grades', { p_type: type });
      (r.data || []).forEach(function (x) { grades[type][x.subject_id] = { grade: x.grade, count: x.active_count }; });
    } catch (e) { /* not staff, or not set up yet */ }
  }
  function label(type, id) {
    var g = grades[type][id];
    return 'Scorecard \u00b7 ' + (g ? g.grade : 'A');
  }

  function build() {
    if (built) return; built = true;
    var st = document.createElement('style');
    st.textContent =
      '#gmScOv{display:none;position:fixed;inset:0;background:rgba(20,14,4,.6);z-index:900;align-items:flex-start;justify-content:center;padding:24px 14px;overflow-y:auto;}' +
      '#gmScOv.show{display:flex;}' +
      '#gmScBox{background:#faf8f4;border-radius:14px;max-width:640px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.25);font-family:"Segoe UI",Arial,sans-serif;color:#1a1408;}' +
      '.gmsc-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #d4c4a0;}' +
      '.gmsc-h h2{margin:0;font-size:1.1rem;} .gmsc-x{background:none;border:none;font-size:1.4rem;cursor:pointer;color:#6b5e48;}' +
      '.gmsc-b{padding:16px 20px 20px;} .gmsc-top{display:flex;gap:16px;align-items:center;margin-bottom:14px;}' +
      '.gmsc-g{width:72px;height:72px;line-height:72px;border-radius:50%;text-align:center;color:#fff;font-size:2.3rem;font-weight:800;flex:0 0 auto;}' +
      '.gmsc-sec{border:1px solid #d4c4a0;border-radius:10px;padding:12px 14px;margin-bottom:12px;background:#fff;}' +
      '.gmsc-sec h3{margin:0 0 8px;font-size:.78rem;text-transform:uppercase;letter-spacing:.6px;color:#A07018;}' +
      '.gmsc-sec label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b5e48;margin:8px 0 3px;}' +
      '.gmsc-sec input,.gmsc-sec select,.gmsc-sec textarea{width:100%;padding:8px 10px;border:1.5px solid #d4c4a0;border-radius:7px;font:inherit;font-size:.88rem;box-sizing:border-box;}' +
      '.gmsc-btn{padding:9px 16px;border:none;border-radius:8px;background:#A07018;color:#fff;font-weight:700;cursor:pointer;font-size:.86rem;margin-top:10px;}' +
      '.gmsc-btn.alt{background:#f0ebe0;color:#6b5e48;} .gmsc-btn:disabled{opacity:.5;cursor:not-allowed;}' +
      '.gmsc-pt{padding:9px 0;border-bottom:1px solid #eee;font-size:.86rem;} .gmsc-pt:last-child{border-bottom:none;}' +
      '.gmsc-tag{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:8px;margin-left:6px;text-transform:uppercase;}' +
      '.gmsc-msg{padding:9px 12px;border-radius:7px;margin-bottom:10px;font-size:.84rem;display:none;} .gmsc-msg.ok{background:#e8f5e9;color:#2e7d32;display:block;} .gmsc-msg.err{background:#ffebee;color:#c62828;display:block;}' +
      '.gmsc-del{background:none;border:none;color:#b71c1c;cursor:pointer;font-size:.74rem;text-decoration:underline;padding:0;margin-left:8px;}';
    document.head.appendChild(st);
    var ov = document.createElement('div');
    ov.id = 'gmScOv';
    ov.innerHTML = '<div id="gmScBox"><div class="gmsc-h"><h2 id="gmScTitle">Scorecard</h2><button class="gmsc-x" onclick="gmScorecard.close()">&times;</button></div><div class="gmsc-b" id="gmScBody"></div></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
  }

  function say(type, text) {
    var m = document.getElementById('gmScMsg'); if (!m) return;
    m.className = 'gmsc-msg ' + type; m.textContent = text;
  }

  async function open(type, id, name, cb) {
    build();
    cur = { type: type, id: id, name: name }; onChange = cb || null;
    document.getElementById('gmScTitle').textContent = '\uD83D\uDCCA Scorecard \u2014 ' + name;
    document.getElementById('gmScBody').innerHTML = '<p style="color:#6b5e48;">Loading\u2026</p>';
    document.getElementById('gmScOv').classList.add('show');
    await render();
  }
  function close() { var o = document.getElementById('gmScOv'); if (o) o.classList.remove('show'); }

  async function render() {
    var r = await sb.rpc('get_scorecard', { p_type: cur.type, p_id: cur.id });
    var body = document.getElementById('gmScBody');
    if (r.error) { body.innerHTML = '<div class="gmsc-msg err">' + esc(r.error.message) + '</div>'; return; }
    var c = r.data;
    grades[cur.type][cur.id] = { grade: c.grade, count: c.activeCount };

    var bk = await sb.from('bookings').select('id, booking_date, venues(name), bands(name)')
      .eq(cur.type === 'band' ? 'band_id' : 'venue_id', cur.id).order('booking_date', { ascending: false }).limit(40);
    var bkOpts = '<option value="">Not linked to a booking</option>' + (bk.data || []).map(function (b) {
      var other = cur.type === 'band' ? (b.venues && b.venues.name) : (b.bands && b.bands.name);
      return '<option value="' + b.id + '">' + esc(dstr(b.booking_date) + (other ? ' \u2014 ' + other : '')) + '</option>';
    }).join('');
    var typeOpts = (cur.type === 'band' ? ['Cancelled', 'Other'] : ['Cancelled', 'Weather', 'Other'])
      .map(function (t) { return '<option>' + t + '</option>'; }).join('');
    var today = new Date(); var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);

    var pts = (c.points || []).map(function (p) {
      var tag = p.status === 'active' ? '<span class="gmsc-tag" style="background:#fdecea;color:#b71c1c;">Active</span>'
        : p.status === 'dropped' ? '<span class="gmsc-tag" style="background:#e8f5e9;color:#2e7d32;">Dropped off ' + esc(dstr(p.droppedOn)) + '</span>'
        : '<span class="gmsc-tag" style="background:#eee;color:#555;">Deleted</span>';
      var del = (c.canRemove && p.status !== 'removed') ? '<button class="gmsc-del" onclick="gmScorecard.remove(\'' + p.id + '\')">Delete</button>' : '';
      return '<div class="gmsc-pt"' + (p.status === 'removed' ? ' style="opacity:.55"' : '') + '><b>' + esc(dstr(p.incidentDate)) + '</b> \u00b7 ' + esc(p.reasonType) + tag + del +
        '<div style="color:#444;margin-top:2px;">' + esc(p.description) + '</div>' +
        '<div style="font-size:.72rem;color:#888;margin-top:2px;">Added by ' + esc(p.addedBy || 'unknown') + (p.bookingLabel ? ' \u00b7 Booking: ' + esc(p.bookingLabel) : '') +
        (p.status === 'removed' ? ' \u00b7 Deleted by ' + esc(p.removedBy || 'admin') + ': ' + esc(p.removedReason || '') : '') + '</div></div>';
    }).join('') || '<p style="color:#888;font-style:italic;margin:0;">No points on record.</p>';

    var last = c.lastSent ? 'Last sent ' + esc(dstr(c.lastSent.sentAt)) + ' to ' + esc(c.lastSent.sentTo) + ' (grade ' + esc(c.lastSent.grade) + ')' : 'Not sent yet';
    body.innerHTML =
      '<div id="gmScMsg" class="gmsc-msg"></div>' +
      '<div class="gmsc-top"><div class="gmsc-g" style="background:' + gradeColor(c.grade) + '">' + esc(c.grade) + '</div><div>' +
      '<div style="font-size:1.05rem;font-weight:700;">' + c.activeCount + ' active point' + (c.activeCount === 1 ? '' : 's') + '</div>' +
      '<div style="font-size:.8rem;color:#6b5e48;">0\u20132 = A \u00b7 3 = B \u00b7 4 = C \u00b7 5 = D \u00b7 6+ = F</div>' +
      (c.nextDrop ? '<div style="font-size:.8rem;color:#2e7d32;">Next point drops off ' + esc(dstr(c.nextDrop)) + ' if there are no new cancellations</div>' : '') +
      '<div style="font-size:.72rem;color:#999;margin-top:2px;">Visible only to administrators and booking agents</div></div></div>' +

      '<div class="gmsc-sec"><h3>Add a point</h3>' +
      '<label>Date it happened</label><input type="date" id="gmScDate" value="' + iso + '" max="' + iso + '">' +
      '<label>Type</label><select id="gmScType">' + typeOpts + '</select>' +
      '<label>Booking (optional)</label><select id="gmScBooking">' + bkOpts + '</select>' +
      '<label>Description (required)</label><textarea id="gmScDesc" rows="3" placeholder="What happened? e.g. Cancelled 2 days before the show, no replacement offered."></textarea>' +
      '<button class="gmsc-btn" id="gmScAddBtn" onclick="gmScorecard.add()">Add point</button></div>' +

      '<div class="gmsc-sec"><h3>Send this scorecard to ' + esc(cur.name) + '</h3>' +
      '<div style="font-size:.8rem;color:#6b5e48;margin-bottom:6px;">' + last + '</div>' +
      '<label style="display:flex;gap:8px;align-items:center;text-transform:none;font-weight:600;"><input type="checkbox" id="gmScNotes" checked style="width:auto;margin:0;"> Include the description of each point</label>' +
      '<label>Personal message (optional)</label><textarea id="gmScNote" rows="2" placeholder="Add a short note to go with it"></textarea>' +
      '<button class="gmsc-btn alt" id="gmScSendBtn" onclick="gmScorecard.send()">Email scorecard</button></div>' +

      '<div class="gmsc-sec"><h3>History</h3>' + pts + '</div>';
  }

  async function add() {
    var desc = document.getElementById('gmScDesc').value.trim();
    if (desc.length < 3) { say('err', 'Please write a description.'); return; }
    var btn = document.getElementById('gmScAddBtn'); btn.disabled = true;
    var r = await sb.rpc('add_scorecard_point', {
      p_type: cur.type, p_id: cur.id, p_incident_date: document.getElementById('gmScDate').value,
      p_reason_type: document.getElementById('gmScType').value, p_description: desc,
      p_booking_id: document.getElementById('gmScBooking').value || null });
    if (r.error) { btn.disabled = false; say('err', r.error.message); return; }
    await render(); say('ok', 'Point added.');
    if (onChange) onChange();
  }

  async function remove(pointId) {
    var why = prompt('Why is this point being deleted? (required)');
    if (why === null) return;
    if (why.trim().length < 3) { alert('Please give a reason.'); return; }
    var r = await sb.rpc('remove_scorecard_point', { p_point_id: pointId, p_reason: why });
    if (r.error) { say('err', r.error.message); return; }
    await render(); say('ok', 'Point deleted. It stays in the history for administrators.');
    if (onChange) onChange();
  }

  async function send() {
    if (!confirm('Email this scorecard to ' + cur.name + '?')) return;
    var btn = document.getElementById('gmScSendBtn'); btn.disabled = true; btn.textContent = 'Sending\u2026';
    try {
      var r = await sb.functions.invoke('send-scorecard', { body: {
        subjectType: cur.type, subjectId: cur.id,
        includeNotes: document.getElementById('gmScNotes').checked,
        message: document.getElementById('gmScNote').value } });
      if (r.error) {
        var msg = r.error.message;
        try { var j = await r.error.context.json(); if (j && j.error) msg = j.error; } catch (e) {}
        throw new Error(msg);
      }
      if (r.data && r.data.error) throw new Error(r.data.error);
      await render(); say('ok', 'Scorecard emailed to ' + (r.data && r.data.sentTo || cur.name) + '.');
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Email scorecard'; say('err', 'Could not send: ' + (e.message || e));
    }
  }

  return { grades: grades, loadGrades: loadGrades, label: label, open: open, close: close, add: add, remove: remove, send: send };
})();
