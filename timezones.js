// Shared time-zone helpers (venue/band forms and the band portal).
var GM_TIMEZONES = [
  ['America/New_York', 'Eastern (New York)'], ['America/Chicago', 'Central (Chicago)'],
  ['America/Denver', 'Mountain (Denver)'], ['America/Phoenix', 'Mountain, no DST (Phoenix)'],
  ['America/Los_Angeles', 'Pacific (Los Angeles)'], ['America/Anchorage', 'Alaska'],
  ['Pacific/Honolulu', 'Hawaii'], ['America/Toronto', 'Eastern (Toronto)'],
  ['America/Vancouver', 'Pacific (Vancouver)'], ['Europe/London', 'UK (London)'],
  ['Europe/Paris', 'Central Europe (Paris)'], ['Australia/Sydney', 'Sydney']
];

// Fills a <select> with "Company default (X)" + the list. `current` keeps an unlisted zone selectable.
function gmFillTzSelect(sel, companyTz, current) {
  var label = 'Company default';
  GM_TIMEZONES.forEach(function (z) { if (z[0] === companyTz) label += ' (' + z[1] + ')'; });
  var h = '<option value="">' + label + '</option>';
  var known = false;
  GM_TIMEZONES.forEach(function (z) { if (z[0] === current) known = true; h += '<option value="' + z[0] + '">' + z[1] + '</option>'; });
  if (current && !known) h += '<option value="' + current + '">' + current + '</option>';
  sel.innerHTML = h;
  sel.value = current || '';
}

// "YYYY-MM-DD" + "HH:MM" as local time in tz -> UTC milliseconds
function gmZonedMs(dateStr, hhmm, tz) {
  var d = dateStr.split('-').map(Number), t = String(hhmm).split(':').map(Number);
  var guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1] || 0);
  function off(ms) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
  }
  var ms = guess - off(guess);
  return guess - off(ms);
}
function gmFormatTime(ms, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(ms));
}
function gmFormatDay(ms, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(ms));
}
function gmTzAbbr(ms, tz) {
  var p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date(ms));
  for (var i = 0; i < p.length; i++) if (p[i].type === 'timeZoneName') return p[i].value;
  return tz;
}
