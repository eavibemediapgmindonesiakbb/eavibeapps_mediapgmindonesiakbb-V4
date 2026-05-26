// ID Spreadsheet kamu
const SPREADSHEET_ID = '1ABC...XYZ'; // Ganti dengan ID Spreadsheet
const SHEET_NAME = 'Anggota';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAllAnggota') {
    return getAllAnggota();
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: false,
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = e.parameter;
  
  if (params.action === 'login') {
    return loginUser(params.nik, params.password);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: false,
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function loginUser(nik, password) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNik = String(row[0]); // Kolom A: nik
      const rowNama = row[1]; // Kolom B: nama
      const rowPass = String(row[2]); // Kolom C: password
      const rowRole = row[3]; // Kolom D: role
      const rowStatus = row[4]; // Kolom E: status
      
      if (rowNik === nik) {
        if (rowPass!== password) {
          return jsonResponse({ status: false, message: 'Password salah' });
        }
        
        if (rowStatus.toLowerCase()!== 'aktif') {
          return jsonResponse({ status: false, message: 'Akun belum aktif' });
        }
        
        return jsonResponse({
          status: true,
          role: rowRole,
          nama: rowNama,
          nik: rowNik,
          status_anggota: rowStatus
        });
      }
    }
    
    return jsonResponse({ status: false, message: 'Data tidak ditemukan' });
    
  } catch (error) {
    return jsonResponse({ status: false, message: 'Error: ' + error.toString() });
  }
}

function getAllAnggota() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const anggota = [];
    let aktifCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[4].toLowerCase() === 'aktif') aktifCount++;
      
      anggota.push({
        nik: row[0],
        nama: row[1],
        role: row[3],
        status: row[4]
      });
    }
    
    return jsonResponse({
      status: true,
      total: anggota.length,
      aktif: aktifCount,
      anggota: anggota
    });
    
  } catch (error) {
    return jsonResponse({ status: false, message: error.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
   .setMimeType(ContentService.MimeType.JSON);
}