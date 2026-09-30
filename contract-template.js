// contract-template.js — shared performance-agreement legal template + email
// helpers, used by both create-booking.html and contracts.html so the two
// pages can never drift apart. This is the real DK Agency legal contract,
// with the agency-specific letterhead/signature swapped for {{AGENCY_NAME}}
// so it works correctly for any business using Gig Matrix, not just one.

var DEFAULT_CONTRACT_TEMPLATE = [
  '{{AGENCY_NAME}}',
  '',
  'PERFORMANCE AGREEMENT',
  '',
  'Date Issued: {{ISSUE_DATE}}',
  'Contract #: {{BOOKING_ID}}',
  '',
  'CLIENT:',
  '  Contact:      {{VENUE_CONTACT}}',
  '  Email:        {{VENUE_EMAIL}}',
  '  Phone:        {{VENUE_PHONE}}',
  '',
  'PERFORMER:',
  '  Performer Contact: {{BAND_CONTACT}}',
  '  Phone:        {{BAND_PHONE}}',
  '  Email:        {{BAND_EMAIL}}',
  '',
  'LOCATION OF ENGAGEMENT:',
  '  {{VENUE_NAME}}',
  '',
  'TIME AND DATE OF ENGAGEMENT:',
  '  {{PERFORMANCE_DATE}}  {{START_TIME}}-{{END_TIME}}    Production provided by: {{SOUND_LIGHTS}}',
  '',
  'Special instructions:',
  '  {{SPECIAL_INSTRUCTIONS}}',
  '',
  'COMPENSATION TO PERFORMER:',
  '',
  '  Total performance fee: {{PAY_AMOUNT}}',
  '',
  '  Balance due day of show, payable to: {{BAND_NAME}}',
  '',
  '  Amount of commission paid to {{AGENCY_NAME}} by Performer: {{COMMISSION_AMOUNT}}',
  '',
  '  Deposit amount and timeline: N/A',
  '',
  'SECTION X: Cancellation and Weather',
  '',
  'X.1: General Cancellation Policy (Either Party)',
  '',
  '  - Cancellation of this agreement by either agency/artist or purchaser requires a minimum of 30 days prior written notice to the other party.',
  '',
  '  - If the Purchaser cancels the engagement with less than 30 days notice, the Purchaser shall be responsible for payment of the full contracted fee.',
  '',
  '  - The only exceptions to the notice requirement and full payment penalty are unavoidable, unforeseen events including, but not limited to, national disaster, fire, flood, earthquake, tornado, serious illness of a performing band member, or extremely dangerous weather conditions such as tornadoes, ice storms, or other government-declared states of emergency (Force Majeure events). In such cases, immediate notification (verbal followed quickly by written) is acceptable, and no penalty will apply.',
  '',
  'X.2 Artist Cancellation and Remedies',
  '',
  '  - If the artist cancels the engagement for any reason other than the Force Majeure events listed in X.1.3 with less than 30 days written notice, the Purchaser has the right to immediately cancel all remaining subsequent dates outlined in this agreement without penalty. The Purchaser will also receive a one hundred percent (100%) refund of any and all deposits paid for both the canceled date and any future canceled dates.',
  '',
  '  - In the event of an Artist cancellation, the Agent ({{AGENCY_NAME}}) will use every reasonable effort and all due diligence to find a suitable substitute replacement artist of comparable quality, style, and cost to perform on the contracted date(s), subject to the Purchaser\'s approval.',
  '',
  '  - In the event of cancellation by either party, a rescheduled date may be worked out if both parties mutually agree in writing to the new terms and date.',
  '',
  'X.3 Agency Commission',
  '',
  '  - If either the Purchaser or the Artist cancels the engagement for any reason not explicitly listed as an exception in this contract (i.e. not a Force Majeure event), the canceling party agrees that a ten percent (10%) commission of the total contracted fee shall be immediately due and payable to {{AGENCY_NAME}}.',
  '',
  'X.4 Outdoor Performances and Weather Clause',
  '',
  '  - All outdoor performances require a fifty percent (50%) non-refundable deposit at the time of booking.',
  '',
  '  - The Purchaser is required to provide a covered stage or suitable overhead protection from the elements (including sun, rain, and potential wind/debris) for the Artist, their equipment, and all electrical connections. This is a condition of the performance agreement.',
  '',
  '  - Cancellation due to unsuitable weather conditions for outdoor shows must be communicated by the Purchaser a minimum of twenty four (24) hours in advance of the scheduled performance time, unless both parties mutually agree in writing to extend this deadline.',
  '',
  '  - The Purchaser is responsible for providing an adequate alternative indoor venue or ensuring the protection specified is sufficient in the event of inclement weather. Failure to provide such an alternative does not release the Purchaser from their contractual obligations or the full payment due.',
  '',
  '  - Once the performance has commenced (defined as the Artist playing the first song of their set), the full agreed upon payment is immediately due and payable, regardless of subsequent weather-related interruption.',
  '',
  'SECTION XI: Status of Agent and Hold Harmless',
  '',
  'XI.1 Agency Relationship',
  '',
  '  - Both the Purchaser and the Artist/Band acknowledge and agree that {{AGENCY_NAME}} (hereinafter "Agent") is acting solely as a booking agent in the negotiation and execution of this agreement. The Agent is not the employer, manager, promoter, or producer of the Artist, nor is it responsible for the Artist\'s performance quality, actions, equipment, or compliance with any local, state, or federal laws (including without limitation, insurance, permits, or tax obligations).',
  '',
  'XI.2 Hold Harmless and Indemnification',
  '',
  '  - The Purchaser and the Artist mutually agree to release, indemnify, and hold harmless {{AGENCY_NAME}}, its agents, employees, and affiliates from any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney\'s fees) arising out of or related to this engagement.',
  '',
  '  - This includes but is not limited to any legal action, disputes, injuries, accidents, or contractual disagreements that may arise between either party and any third parties, during, before, or after the scheduled performance date(s).',
  '',
  '  - By signing this agreement, both the Purchaser and the Artist expressly waive any right to initiate legal action against {{AGENCY_NAME}}, for matters pertaining to the performance engagement itself, its execution, or any consequences arising from the relationship between the Purchaser and the Artist.',
  '',
  'SIGNATURES',
  '',
  'Client (Venue) Signature: _______________________________    Date: ________________',
  '',
  'Performer Signature: ____________________________________    Date: ________________'
].join('\n');

function fmtContractTime(t) {
  if (!t) return 'TBD';
  var m = String(t).match(/(\d{1,2}):(\d{2})/);
  if (!m) return t;
  var h = parseInt(m[1]), mn = m[2], ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + mn + ' ' + ap;
}

function fmtContractDate(ds) {
  if (!ds) return 'TBD';
  try { return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
  catch (e) { return ds; }
}

function fmtContractPay(p) {
  var n = parseFloat(p);
  return n ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'As agreed';
}

// data: { agencyName, bandName, venueName, venueContact, venueEmail, venuePhone,
//         bandContact, bandPhone, bandEmail, date, startTime, endTime, payAmount,
//         soundLights, notes, commissionPct, bookingId }
function fillContractTemplate(template, data) {
  var payNum  = parseFloat(data.payAmount) || 0;
  var commNum = parseFloat(data.commissionPct) || 0;
  var commAmt = commNum > 0 ? '$' + (payNum * commNum / 100).toFixed(2) + ' (' + commNum + '%)' : 'Per agreement';
  var issueDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  var agencyName = data.agencyName || 'Gig Matrix';

  return template
    .replace(/{{AGENCY_NAME}}/g,          agencyName)
    .replace(/{{BAND_NAME}}/g,            data.bandName     || '[Band Name]')
    .replace(/{{VENUE_NAME}}/g,           data.venueName    || '[Venue Name]')
    .replace(/{{PERFORMANCE_DATE}}/g,     fmtContractDate(data.date))
    .replace(/{{START_TIME}}/g,           fmtContractTime(data.startTime))
    .replace(/{{END_TIME}}/g,             fmtContractTime(data.endTime))
    .replace(/{{PAY_AMOUNT}}/g,           fmtContractPay(data.payAmount))
    .replace(/{{SOUND_LIGHTS}}/g,         data.soundLights  || 'TBD')
    .replace(/{{BOOKING_ID}}/g,           data.bookingId    || 'TBD')
    .replace(/{{ISSUE_DATE}}/g,           issueDate)
    .replace(/{{VENUE_CONTACT}}/g,        data.venueContact || '[Venue Contact]')
    .replace(/{{VENUE_EMAIL}}/g,          data.venueEmail   || '[Venue Email]')
    .replace(/{{VENUE_PHONE}}/g,          data.venuePhone   || '[Venue Phone]')
    .replace(/{{BAND_CONTACT}}/g,         data.bandContact  || '[Band Contact]')
    .replace(/{{BAND_PHONE}}/g,           data.bandPhone    || '[Band Phone]')
    .replace(/{{BAND_EMAIL}}/g,           data.bandEmail    || '[Band Email]')
    .replace(/{{COMMISSION_AMOUNT}}/g,    commAmt)
    .replace(/{{SPECIAL_INSTRUCTIONS}}/g, data.notes        || 'None');
}

function randomToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

// Sends one email via the send-email Edge Function. Never throws — resolves
// { success:false, error } on failure so callers can show a soft warning
// instead of blocking the booking/contract that already saved successfully.
async function sendAppEmail(sbClient, to, toName, subject, text, html) {
  try {
    var { data, error } = await sbClient.functions.invoke('send-email', {
      body: { to: to, toName: toName, subject: subject, text: text, html: html }
    });
    if (error) return { success: false, error: error.message || String(error) };
    if (data && data.error) return { success: false, error: data.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

function contractSignEmailHtml(opts) {
  var roleLabel = opts.role === 'band' ? 'Performer' : 'Venue / Client';
  var bronzeBg = 'linear-gradient(160deg,#3a2608 0%,#6a4a10 10%,#a07020 20%,#d4a030 30%,#f0c050 42%,#e8b838 50%,#c08820 60%,#906010 70%,#6a4810 82%,#4a3008 90%,#2e1e06 100%)';
  return (
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;padding:20px;">' +
    '<div style="background:' + bronzeBg + ';padding:28px 32px;border-radius:12px 12px 0 0;">' +
    '<div style="color:white;font-size:18px;font-weight:700;">' + esc(opts.agencyName || 'Gig Matrix') + '</div>' +
    '<h1 style="color:white;font-size:22px;font-weight:700;margin:8px 0 0;">Performance Agreement</h1>' +
    '<p style="color:rgba(255,240,200,0.85);font-size:13px;margin:6px 0 0;">Signing as: <strong>' + esc(roleLabel) + '</strong></p>' +
    '</div>' +
    '<div style="background:white;padding:28px 32px;border-radius:0 0 12px 12px;">' +
    '<p style="font-size:15px;color:#333;margin:0 0 16px;">Hi <strong>' + esc(opts.toName) + '</strong>,</p>' +
    '<p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">Please review and sign the Performance Agreement for your engagement at <strong>' + esc(opts.venueName) + '</strong>.</p>' +
    '<div style="background:#f0f4fa;border-radius:10px;padding:18px;margin-bottom:24px;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
    '<tr><td style="padding:8px 0;color:#888;width:35%;">Venue</td><td style="padding:8px 0;color:#333;font-weight:700;">' + esc(opts.venueName) + '</td></tr>' +
    '<tr style="border-top:1px solid #e2e8f0;"><td style="padding:8px 0;color:#888;">Band</td><td style="padding:8px 0;color:#333;font-weight:700;">' + esc(opts.bandName) + '</td></tr>' +
    '<tr style="border-top:1px solid #e2e8f0;"><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;color:#333;font-weight:700;">' + esc(opts.date) + '</td></tr>' +
    '</table></div>' +
    '<div style="text-align:center;margin-bottom:20px;">' +
    '<a href="' + opts.signUrl + '" style="display:inline-block;background:#A07018;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review &amp; Sign Contract</a>' +
    '</div>' +
    '<p style="font-size:12px;color:#aaa;text-align:center;">This link is unique to you. Do not share it.</p>' +
    '</div></div>'
  );
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
