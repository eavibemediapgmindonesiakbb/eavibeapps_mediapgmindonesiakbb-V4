const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doGet(e) {
  const callback = e.parameter.callback;
  const nik = e.parameter.nik? e.parameter.nik.toString().trim() : '';
  const password = e.parameter.password? e.parameter.password.toString().trim() : '';

  let result;

  if (!nik ||!password) {
    result = { status: 'error', message: 'NIK dan password wajib diisi' };
  } else {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    let found = false;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const sheetNIK = row[0]? row[0].toString().trim() : '';
      const sheetPass = row[7]? row[7].toString().trim() : '';

      if (sheetNIK === nik && sheetPass === password) {
        result = {
          status: 'success',
          data: {
            nama: row[4] || '',
            status: row[2] || '',
            bayar: row[3] || '',
            linkSertifikat: row[6] || ''
          }
        };
        found = true;
        break;
      }
    }

    if (!found) {
      result = { status: 'error', message: 'NIK atau password salah' };
    }
  }

  const output = JSON.stringify(result);

  if (callback) {
    return ContentService.createTextOutput(callback + '(' + output + ')')
     .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(output)
     .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}
