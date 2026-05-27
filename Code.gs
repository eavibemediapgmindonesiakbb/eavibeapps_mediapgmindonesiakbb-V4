const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doPost(e) {
  return handleLogin(e);
}

function doGet(e) {
  return handleLogin(e);
}

function handleLogin(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const params = e.parameter;
  const data = e.postData? JSON.parse(e.postData.contents) : params;

  const nik = data.nik;
  const password = data.password;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik.toString()) {
      if (values[i][7] && values[i][7].toString() === password) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          data: {
            nama: values[i][4],
            status: values[i][2],
            bayar: values[i][3],
            linkSertifikat: values[i][6]
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error', message: 'NIK atau password salah'
  })).setMimeType(ContentService.MimeType.JSON);
}
