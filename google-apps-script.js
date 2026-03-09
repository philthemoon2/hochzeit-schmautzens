// ============================================
// HOCHZEIT RSVP — Google Apps Script v2
// ============================================
// Google Sheets > Erweiterungen > Apps Script
// Code einfuegen > Speichern > Bereitstellen > Neue Bereitstellung > Web-App
// Ausfuehren als: Ich | Zugriff: Jeder

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

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

    var body = 'Neue RSVP:\n\n';
    body += 'Name(n): ' + names + '\n';
    body += 'Zusage: ' + (data.attending || '-') + '\n';
    body += 'Tage: ' + (tage || '-') + '\n';
    body += 'Zimmer: ' + (data.room || '-') + '\n';
    body += 'Essen: ' + (data.food || '-');
    for (var k = 2; k <= 8; k++) {
      if (data['person_' + k + '_name']) body += ', ' + data['person_' + k + '_name'] + ': ' + (data['person_' + k + '_food'] || 'normal');
    }
    body += '\n';
    if (data.notes) body += 'Anmerkungen: ' + data.notes + '\n';

    MailApp.sendEmail('info@phil-thebeat.com', 'RSVP: ' + names, body);

    return ContentService.createTextOutput(JSON.stringify({result:'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result:'error',error:error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status:'aktiv'})).setMimeType(ContentService.MimeType.JSON);
}
