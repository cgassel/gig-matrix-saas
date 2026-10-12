// Shared helpers for the booking privacy rules.
//
// The browser can no longer read pay_amount / commission_pct straight from the
// bookings table (the database hides those columns). Money comes ONLY from the
// get_booking_money() function, which returns it just for bookings the signed-in
// person may see: their own, ones whose agent named them as backup, or anything
// if they are an administrator.
//
// Include after config.js:  <script src="booking-money.js"></script>

// Every non-money booking column. Use this instead of '*' when selecting bookings.
var BK_COLS = 'id,business_id,venue_id,band_id,booking_date,start_time,end_time,sound_lights,status,notes,created_by,created_at';

// Adds pay_amount, commission_pct and money_visible to each booking row.
// Rows the user may not see money for get pay_amount = null, money_visible = false.
async function attachMoney(rows) {
  rows = rows || [];
  var map = {};
  for (var i = 0; i < rows.length; i += 150) {
    var ids = rows.slice(i, i + 150).map(function (r) { return r.id; });
    var res = await sb.rpc('get_booking_money', { p_ids: ids });
    (res.data || []).forEach(function (m) { map[m.id] = m; });
  }
  rows.forEach(function (r) {
    var m = map[r.id];
    r.money_visible  = !!m;
    r.pay_amount     = m ? m.pay_amount : null;
    r.commission_pct = m ? m.commission_pct : null;
  });
  return rows;
}
