// ============================================
// HOCHZEIT RSVP — Google Apps Script
// ============================================
// Diesen Code in Google Sheets > Erweiterungen > Apps Script einfuegen.
// Dann: Bereitstellen > Als Web-App bereitstellen
// - Ausfuehren als: Ich
// - Zugriff: Jeder
// Die URL kopieren und in script.js eintragen.

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Tage als kommaseparierten String
    var tage = '';
    if (Array.isArray(data.days)) {
      tage = data.days.join(', ');
    } else if (data.days) {
      tage = data.days;
    }

    var row = [
      new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
      data.name || '',
      data.attending || '',
      tage,
      data.stayFrom || '',
      data.stayTo || '',
      data.room || '',
      data.children || '',
      data.childrenDetails || '',
      data.food || '',
      data.allergies || '',
      data.notes || ''
    ];

    sheet.appendRow(row);

    // Optional: Email-Benachrichtigung
    var emailTo = 'info@phil-thebeat.com';
    var subject = 'Neue RSVP Antwort: ' + (data.name || 'Unbekannt');
    var body = 'Neue Hochzeits-RSVP:\n\n';
    body += 'Name: ' + (data.name || '-') + '\n';
    body += 'Zusage: ' + (data.attending || '-') + '\n';
    body += 'Tage: ' + (tage || '-') + '\n';
    body += 'Uebernachtung: ' + (data.stayFrom || '-') + ' bis ' + (data.stayTo || '-') + '\n';
    body += 'Zimmer: ' + (data.room || '-') + '\n';
    body += 'Kinder: ' + (data.children || 'Nein') + ' ' + (data.childrenDetails || '') + '\n';
    body += 'Essen: ' + (data.food || '-') + '\n';
    body += 'Allergien: ' + (data.allergies || '-') + '\n';
    body += 'Anmerkungen: ' + (data.notes || '-') + '\n';

    MailApp.sendEmail(emailTo, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET-Request fuer Test
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'RSVP Script aktiv' }))
    .setMimeType(ContentService.MimeType.JSON);
}
