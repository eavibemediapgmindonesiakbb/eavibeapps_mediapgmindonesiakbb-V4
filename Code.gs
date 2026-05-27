const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = e.parameter.nik? e.parameter : JSON.parse(e.postData.contents);

  const nik = data.nik? data.nik.toString().trim() : '';
  const password = data.password? data.password.toString().trim() : '';

  if (!nik ||!password) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: 'NIK dan password wajib diisi'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    // Cek dulu kolom NIK dan Password nggak kosong
    const sheetNIK = row[0]? row[0].toString().trim() : '';
    const sheetPass = row[7]? row[7].toString().trim() : '';

    if (sheetNIK === nik && sheetPass === password) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: {
          nama: row[4] || '',
          status: row[2] || '',
          bayar: row[3] || '',
          linkSertifikat: row[6] || ''
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'error', message: 'NIK atau password salah'
  })).setMimeType(ContentService.MimeType.JSON);
}
