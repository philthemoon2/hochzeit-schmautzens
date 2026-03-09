// ============================================
// HOCHZEIT RSVP — Google Apps Script
// ============================================
// Diesen Code in Google Sheets > Erweiterungen > Apps Script einfuegen.
// Dann: Bereitstellen > Als Web-App bereitstellen
// - Ausfuehren als: Ich
// - Zugriff: Jeder
// Die URL kopieren und in script.js eintragen.
//
// WICHTIG: Nach Update muss eine NEUE Bereitstellung erstellt werden!
// Bereitstellen > Neue Bereitstellung > Web-App

// EINMALIG AUSFUEHREN: Setzt die Spaltenbezeichnungen in Zeile 1
// Im Apps Script Editor: Funktion "setupHeaders" auswaehlen, dann ► ausfuehren
function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    'Zeitstempel',              // A
    'Name',                     // B  (Person 1)
    'Zusage (ja/nein)',         // C
    'Tage (Freitag/Samstag/Sonntag)', // D
    'Anreise ab',               // E
    'Abreise bis',              // F
    'Zimmer (Einzel/Doppel)',   // G
    'Kinder dabei',             // H
    'Kinder Details',           // I
    'Essen (normal/vegetarisch/vegan/allergien)', // J  (Person 1)
    'Allergien / Unvertraeglichkeiten', // K
    'Anmerkungen',              // L
    'Person 2 Name',            // M
    'Person 2 Essen',           // N
    'Person 3 Name',            // O
    'Person 3 Essen',           // P
    'Person 4 Name',            // Q
    'Person 4 Essen',           // R
    'Person 5 Name',            // S
    'Person 5 Essen',           // T
    'Person 6 Name',            // U
    'Person 6 Essen',           // V
    'Person 7 Name',            // W
    'Person 7 Essen',           // X
    'Person 8 Name',            // Y
    'Person 8 Essen',           // Z
    'Anzahl Personen'           // AA
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3e8d0');
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Auto-Header: Falls Spalte M in Zeile 1 leer ist, neue Headers ergaenzen
    if (!sheet.getRange(1, 13).getValue()) {
      var extraHeaders = [
        'Person 2 Name', 'Person 2 Essen',
        'Person 3 Name', 'Person 3 Essen',
        'Person 4 Name', 'Person 4 Essen',
        'Person 5 Name', 'Person 5 Essen',
        'Person 6 Name', 'Person 6 Essen',
        'Person 7 Name', 'Person 7 Essen',
        'Person 8 Name', 'Person 8 Essen',
        'Anzahl Personen'
      ];
      sheet.getRange(1, 13, 1, extraHeaders.length).setValues([extraHeaders]);
      var range = sheet.getRange(1, 13, 1, extraHeaders.length);
      range.setFontWeight('bold');
      range.setBackground('#f3e8d0');
    }

    // Tage als kommaseparierten String
    var tage = '';
    if (Array.isArray(data.days)) {
      tage = data.days.join(', ');
    } else if (data.days) {
      tage = data.days;
    }

    var zeitstempel = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    var persons = data.persons;

    if (persons && Array.isArray(persons) && persons.length > 0) {
      // Neue Struktur: Alle Personen in einer Zeile
      var row = [
        zeitstempel,
        persons[0].name || '',          // B: Person 1 Name
        data.attending || '',            // C
        tage,                            // D
        data.stayFrom || '',             // E
        data.stayTo || '',               // F
        data.room || '',                 // G
        data.children || '',             // H
        data.childrenDetails || '',      // I
        persons[0].food || 'normal',     // J: Person 1 Essen
        data.allergies || '',            // K
        data.notes || ''                 // L
      ];

      // Personen 2-8 in Extra-Spalten (M-Z)
      for (var i = 1; i < 8; i++) {
        if (i < persons.length) {
          row.push(persons[i].name || '');
          row.push(persons[i].food || 'normal');
        } else {
          row.push('');
          row.push('');
        }
      }

      // Anzahl Personen (AA)
      row.push(persons.length);

      sheet.appendRow(row);
    } else {
      // Fallback: Alte Struktur (einzelner Name) — Rueckwaertskompatibel
      var row = [
        zeitstempel,
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
        data.notes || '',
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Leere Extra-Spalten
        1 // Anzahl Personen
      ];
      sheet.appendRow(row);
    }

    // Email-Benachrichtigung
    var emailTo = 'info@phil-thebeat.com';
    var allNames = '';
    if (persons && Array.isArray(persons)) {
      allNames = persons.map(function(p) { return p.name; }).join(', ');
    } else {
      allNames = data.name || 'Unbekannt';
    }

    var subject = 'Neue RSVP Antwort: ' + allNames;
    var body = 'Neue Hochzeits-RSVP:\n\n';
    body += 'Name(n): ' + allNames + '\n';
    body += 'Zusage: ' + (data.attending || '-') + '\n';
    body += 'Tage: ' + (tage || '-') + '\n';
    body += 'Uebernachtung: ' + (data.stayFrom || '-') + ' bis ' + (data.stayTo || '-') + '\n';
    body += 'Zimmer: ' + (data.room || '-') + '\n';
    body += 'Kinder: ' + (data.children || 'Nein') + ' ' + (data.childrenDetails || '') + '\n';

    if (persons && Array.isArray(persons)) {
      body += '\nEssen pro Person:\n';
      for (var j = 0; j < persons.length; j++) {
        body += '  - ' + persons[j].name + ': ' + (persons[j].food || 'normal') + '\n';
      }
    } else {
      body += 'Essen: ' + (data.food || '-') + '\n';
    }

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
