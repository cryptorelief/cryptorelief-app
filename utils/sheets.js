const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SPREADHSHEET_ID = '122UN2AV29uuMqVmqKf6mmjuYRKecpuToxPWE78U8lUw';
const SPREADSHEET_RANGE = 'A:Z';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const jwt = new google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, null, process.env.GOOGLE_PRIVATE_KEY, SCOPES)

jwt.authorize((err, response) => {
  console.log('Authorizing Google API Authentication:\n', response);
})

const getSheet = (auth) => {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADHSHEET_ID,
      range: SPREADSHEET_RANGE,
      auth: auth
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        console.log('Name, Major:');
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          console.log(`${row[0]}, ${row[4]}`);
        });
      } else {
        console.log('No data found.');
      }
    });
  }

const updateSheet = (auth, resource) => {
  const sheets = google.sheets('v4');
  sheets.spreadsheets.values.append({
    spreadsheetId: SPREADHSHEET_ID,
    range: SPREADSHEET_RANGE,
    auth: auth,
    valueInputOption: 'USER_ENTERED',
    resource: {
      "range": SPREADSHEET_RANGE,
      "values": resource
    }
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('%d cells updated.', res.updatedCells);
  });
}

const fncSheet = (auth) => {
  const sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({}, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('%d cells updated.', res.updatedCells);
  });
}

module.exports = {
  jwt,
  updateSheet
}