// Venue notes (load-in, parking, food & drink) and contact log — one shared widget used on the
// Venue Map, the Venue Directory and Create Booking. Staff only. Include after config.js.
//   gmVenueNotes.mount(containerEl, venueId, { readOnly: false, onContactChange: function(lastDate){} })
var gmVenueNotes = (function () {
  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var st = document.createElement('style');
    st.textContent =
      '.gvn{font-family:"Segoe UI",Arial,sans-serif;color:#1a1408;}' +
      '.gvn h4{margin:0 0 8px;font-size:.74rem;text-transform:uppercase;letter-spacing:.6px;color:#A07018;}' +
      '.gvn .gvn-sec{margin-top:12px;padding-top:12px;border-top:1.5px solid #d4c4a0;} .gvn .gvn-sec:first-child{margin-top:0;padding-top:0;border-top:none;}' +
      '.gvn label{display:block;font-size:.66rem;font-weight:700;text-transform:uppercase;color:#6b5e48;margin:8px 0 3px;}' +
      '.gvn textarea,.gvn input,.gvn select{width:100%;padding:7px 9px;border:1.5px solid #d4c4a0;border-radius:7px;font:inherit;font-size:.84rem;background:#fff;box-sizing:border-box;}' +
      '.gvn textarea{min-height:54px;resize:vertical;}' +
      '.gvn .gvn-row{display:flex;gap:8px;} .gvn .gvn-row>*{flex:1;min-width:0;}' +
      '.gvn .gvn-btn{width:100%;margin-top:8px;padding:8px;border:none;border-radius:7px;background:#A07018;color:#fff;font-weight:700;font-size:.82rem;cursor:pointer;} .gvn .gvn-btn:disabled{opacity:.5;}' +
      '.gvn .gvn-msg{font-size:.76rem;min-height:15px;margin-top:5px;text-align:center;color:#2e7d5c;} .gvn .gvn-msg.err{color:#8B2000;}' +
      '.gvn .gvn-meta{font-size:.7rem;color:#6b5e48;}' +
      '.gvn .gvn-last{background:#faf8f4;border:1px solid #d4c4a0;border-radius:7px;padding:8px 10px;font-size:.84rem;font-weight:700;margin-bottom:4px;}' +
      '.gvn .gvn-hist{padding:7px 0;border-bottom:1px solid #eadfc8;font-size:.82rem;} .gvn .gvn-hist:last-child{border-bottom:none;}' +
      '.gvn .gvn-del{background:none;border:none;color:#8B2000;font-size:.7rem;cursor:pointer;text-decoration:underline;padding:0;margin-left:6px;}' +
      '.gvn .gvn-ro{background:#faf8f4;border:1px solid #d4c4a0;border-radius:7px;padding:7px 10px;margin-bottom:6px;font-size:.84rem;white-space:pre-wrap;} .gvn .gvn-ro b{display:block;font-size:.66rem;text-transform:uppercase;color:#6b5e48;margin-bottom:2px;}' +
      '.gvn .gvn-none{color:#999;font-style:italic;}';
    document.head.appendChild(st);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function nice(ds) { var p = String(ds).slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function ago(ds) {
    var p = String(ds).slice(0, 10).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]), n = new Date(); n.setHours(0, 0, 0, 0);
    var days = Math.round((n - d) / 86400000);
    return nice(ds) + (days <= 0 ? ' (today)' : ' (' + days + ' day' + (days === 1 ? '' : 's') + ' ago)');
  }

  function mount(el, venueId, opts) {
    css(); opts = opts || {};
    var ro = !!opts.readOnly, gone = false;
    el.className = (el.className ? el.className + ' ' : '') + 'gvn';
    el.innerHTML = '<div class="gvn-meta">Loading venue notes&hellip;</div>';
    var tok = {}; el._gvnTok = tok;

    function q(sel) { return el.querySelector(sel); }
    function msg(sel, text, err) { var m = q(sel); if (m) { m.textContent = text || ''; m.className = 'gvn-msg' + (err ? ' err' : ''); } }

    async function load() {
      var res = await Promise.all([
        sb.from('venue_notes').select('load_in, parking, food_drink, updated_at').eq('venue_id', venueId).maybeSingle(),
        sb.rpc('venue_contact_history', { p_venue_id: venueId })
      ]);
      if (el._gvnTok !== tok || !el.isConnected) return;
      render(res[0].data || {}, res[1].data || [], res[1].error);
    }

    function render(n, hist, herr) {
      var last = hist.length ? hist[0].contacted_on : null;
      if (opts.onContactChange) opts.onContactChange(last);
      if (ro) {
        var any = n.load_in || n.parking || n.food_drink;
        var h = '<div class="gvn-sec"><h4>&#128221; Venue notes</h4>' +
          (any ? '' : '<div class="gvn-none">No load-in, parking or food &amp; drink notes saved for this venue.</div>') +
          (n.load_in ? '<div class="gvn-ro"><b>Load-in</b>' + esc(n.load_in) + '</div>' : '') +
          (n.parking ? '<div class="gvn-ro"><b>Parking</b>' + esc(n.parking) + '</div>' : '') +
          (n.food_drink ? '<div class="gvn-ro"><b>Food &amp; drink</b>' + esc(n.food_drink) + '</div>' : '') +
          '<div class="gvn-last">Last contacted: ' + (last ? esc(ago(last)) : 'never') + '</div>' +
          hist.slice(0, 3).map(function (r) {
            return '<div class="gvn-hist"><b>' + esc(nice(r.contacted_on)) + '</b> &middot; ' + esc(r.method) + (r.note ? '<div>' + esc(r.note) + '</div>' : '') + '<div class="gvn-meta">by ' + esc(r.by_name) + '</div></div>';
          }).join('') +
          '<div class="gvn-meta" style="margin-top:6px;"><a href="venues.html?edit=' + encodeURIComponent(venueId) + '" style="color:#A07018;font-weight:700;">Edit notes in the Venue Directory</a></div></div>';
        el.innerHTML = h; return;
      }
      el.innerHTML =
        '<div class="gvn-sec"><h4>&#128221; Venue notes</h4>' +
        '<label>Load-in</label><textarea data-f="load_in" placeholder="Where to load in, door or dock, times, elevators, stage access&hellip;">' + esc(n.load_in) + '</textarea>' +
        '<label>Parking</label><textarea data-f="parking" placeholder="Where bands park, permits, distance from the door&hellip;">' + esc(n.parking) + '</textarea>' +
        '<label>Food &amp; drink</label><textarea data-f="food_drink" placeholder="Band meal, drink tickets or discounts, who to ask&hellip;">' + esc(n.food_drink) + '</textarea>' +
        '<button type="button" class="gvn-btn" data-act="save">Save notes</button><div class="gvn-msg" data-m="notes"></div>' +
        '<div class="gvn-meta" style="text-align:center;">' + (n.updated_at ? 'Last saved ' + esc(new Date(n.updated_at).toLocaleString()) : 'No notes saved yet') + '</div></div>' +
        '<div class="gvn-sec"><h4>&#128222; Contact log</h4>' +
        '<div class="gvn-last">Last contacted: ' + (last ? esc(ago(last)) : 'never') + '</div>' +
        '<div class="gvn-row"><div><label>Date</label><input type="date" data-f="cdate" value="' + today() + '" max="' + today() + '"></div>' +
        '<div><label>How</label><select data-f="cmethod"><option>Call</option><option>Email</option><option>Text</option><option>In person</option><option>Other</option></select></div></div>' +
        '<label>What was said</label><textarea data-f="cnote" placeholder="e.g. Spoke with the manager, wants live music Fridays starting in March."></textarea>' +
        '<button type="button" class="gvn-btn" data-act="log">Log contact</button><div class="gvn-msg" data-m="contact"></div>' +
        '<div data-hist>' + (herr ? '<div class="gvn-meta">Could not load history: ' + esc(herr.message) + '</div>'
          : !hist.length ? '<div class="gvn-meta" style="margin-top:8px;">No contact logged yet.</div>'
          : '<div style="margin-top:8px;">' + hist.map(function (r) {
              return '<div class="gvn-hist"><b>' + esc(nice(r.contacted_on)) + '</b> &middot; ' + esc(r.method) +
                '<button type="button" class="gvn-del" data-del="' + r.id + '">delete</button>' + (r.note ? '<div>' + esc(r.note) + '</div>' : '') +
                '<div class="gvn-meta">by ' + esc(r.by_name) + '</div></div>';
            }).join('') + '</div>') + '</div></div>';

      q('[data-act="save"]').onclick = async function () {
        var b = this; b.disabled = true; msg('[data-m="notes"]', 'Saving…');
        var r = await sb.rpc('save_venue_notes', { p_venue_id: venueId, p_load_in: q('[data-f="load_in"]').value,
          p_parking: q('[data-f="parking"]').value, p_food_drink: q('[data-f="food_drink"]').value });
        b.disabled = false;
        if (r.error) { msg('[data-m="notes"]', r.error.message, true); return; }
        msg('[data-m="notes"]', 'Notes saved');
      };
      q('[data-act="log"]').onclick = async function () {
        var b = this; b.disabled = true; msg('[data-m="contact"]', 'Saving…');
        var r = await sb.rpc('add_venue_contact', { p_venue_id: venueId, p_date: q('[data-f="cdate"]').value,
          p_method: q('[data-f="cmethod"]').value, p_note: q('[data-f="cnote"]').value });
        b.disabled = false;
        if (r.error) { msg('[data-m="contact"]', r.error.message, true); return; }
        await load(); msg('[data-m="contact"]', 'Contact logged');
      };
      Array.prototype.forEach.call(el.querySelectorAll('[data-del]'), function (btn) {
        btn.onclick = async function () {
          if (!confirm('Delete this contact entry?')) return;
          var r = await sb.rpc('delete_venue_contact', { p_id: btn.getAttribute('data-del') });
          if (r.error) { msg('[data-m="contact"]', r.error.message, true); return; }
          await load();
        };
      });
    }
    load();
    return { reload: load };
  }
  return { mount: mount };
})();
