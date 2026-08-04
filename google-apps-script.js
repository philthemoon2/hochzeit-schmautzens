// ============================================
// HOCHZEIT RSVP - Google Apps Script v2
// ============================================
// Google Sheets > Erweiterungen > Apps Script
// Code einfuegen > Speichern > Bereitstellen > Neue Bereitstellung > Web-App
// Ausfuehren als: Ich | Zugriff: Jeder

var ABSAGEN_TAB = 'Absagen';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    // ---- Absagen landen im eigenen Tab ----
    if (data.type === 'absage') {
      return handleAbsage(ss, data);
    }

    var sheet = ss.getSheetByName('Tabellenblatt1') || ss.getActiveSheet();

    // Headers ergaenzen falls Spalte M leer
    if (!sheet.getRange(1, 13).getValue()) {
      var h = ['Person 2 Name','Person 2 Essen','Person 3 Name','Person 3 Essen','Person 4 Name','Person 4 Essen','Person 5 Name','Person 5 Essen','Person 6 Name','Person 6 Essen','Person 7 Name','Person 7 Essen','Person 8 Name','Person 8 Essen','Anzahl Personen'];
      sheet.getRange(1, 13, 1, h.length).setValues([h]);
      sheet.getRange(1, 13, 1, h.length).setFontWeight('bold').setBackground('#f3e8d0');
    }

    // Tage
    var tage = '';
    if (Array.isArray(data.days)) tage = data.days.join(', ');
    else if (data.days) tage = data.days;

    // Zeile bauen: A-L = Standard, M-Z = Person 2-8, AA = Anzahl
    var row = [
      new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}),
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

    // Person 2-8 (Spalten M-Z)
    for (var i = 2; i <= 8; i++) {
      row.push(data['person_' + i + '_name'] || '');
      row.push(data['person_' + i + '_food'] || '');
    }

    // Anzahl Personen (Spalte AA)
    row.push(data.person_count || 1);

    sheet.appendRow(row);

    // Email
    var names = data.name || '';
    for (var j = 2; j <= 8; j++) {
      if (data['person_' + j + '_name']) names += ', ' + data['person_' + j + '_name'];
    }

    var body = 'Neue Hochzeits-RSVP\n';
    body += '========================\n\n';
    body += 'Zusage: ' + (data.attending || '-') + '\n\n';
    body += 'Personen & Essen:\n';
    body += '  1. ' + (data.name || '-') + ' - ' + (data.food || '-') + '\n';
    for (var k = 2; k <= 8; k++) {
      if (data['person_' + k + '_name']) {
        body += '  ' + k + '. ' + data['person_' + k + '_name'] + ' - ' + (data['person_' + k + '_food'] || 'normal') + '\n';
      }
    }
    body += '\nTage: ' + (tage || '-') + '\n';
    body += 'Uebernachtung: ' + (data.stayFrom || '-') + ' bis ' + (data.stayTo || '-') + '\n';
    body += 'Zimmer: ' + (data.room || '-') + '\n';
    if (data.children) body += 'Kinder: ja - ' + (data.childrenDetails || '') + '\n';
    if (data.allergies) body += 'Allergien: ' + data.allergies + '\n';
    if (data.notes) body += 'Anmerkungen: ' + data.notes + '\n';

    MailApp.sendEmail('info@phil-thebeat.com', 'RSVP: ' + names, body);

    return ContentService.createTextOutput(JSON.stringify({result:'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result:'error',error:error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ABSAGEN - eigener Tab "Absagen" im selben Sheet
// ============================================
function handleAbsage(ss, data) {
  var sheet = ss.getSheetByName(ABSAGEN_TAB);

  // Tab anlegen falls noch nicht vorhanden
  if (!sheet) {
    sheet = ss.insertSheet(ABSAGEN_TAB);
  }

  // Header setzen falls Zeile 1 leer
  if (!sheet.getRange(1, 1).getValue()) {
    var header = ['Zeitstempel', 'Name', 'E-Mail', 'Nachricht'];
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold').setBackground('#f3e8d0');
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 240);
    sheet.setColumnWidth(4, 400);
  }

  sheet.appendRow([
    new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}),
    data.name || '',
    data.email || '',
    data.message || ''
  ]);

  var body = 'Neue Hochzeits-ABSAGE\n';
  body += '========================\n\n';
  body += 'Name:    ' + (data.name || '-') + '\n';
  body += 'E-Mail:  ' + (data.email || '-') + '\n';
  if (data.message) body += '\nNachricht:\n' + data.message + '\n';

  MailApp.sendEmail('info@phil-thebeat.com', 'ABSAGE: ' + (data.name || 'ohne Namen'), body);

  return ContentService.createTextOutput(JSON.stringify({result:'success'})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status:'aktiv'})).setMimeType(ContentService.MimeType.JSON);
}
