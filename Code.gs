const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

// PENTING: Handle GET buat test koneksi
function doGet() {
  return ContentService.createTextOutput('API PGM Aktif').setMimeType(ContentService.MimeType.TEXT);
}

// Handle POST dari website
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    // Karena CORS, data dikirim sebagai text/plain
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'login') return handleLogin(data.nik, data.password, sheet);
    if (action === 'getAllAnggota') return getAllAnggota(sheet);
    
    return outputJSON({status: 'error', message: 'Action tidak dikenal'});
  } catch(err) {
    return outputJSON({status: 'error', message: 'Server error: ' + err.message});
  }
}

function handleLogin(nik, password, sheet) {
  const values = sheet.getDataRange().getValues();
  // A=0 nik, B=1, C=2, D=3, E=4 nama, F=5 role, G=6, H=7 Password
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik) {
      const passDiSheet = values[i][7].toString().trim();
      
      if (!passDiSheet) {
        return outputJSON({status: 'error', message: 'Password belum diset admin'});
      }
      
      if (password!== passDiSheet) {
        return outputJSON({status: 'error', message: 'Password salah'});
      }
      
      if(values[i][2]!== 'Aktif' && values[i][2]!== 'LUNAS') {
        return outputJSON({status: 'error', message: 'Akun belum aktif'});
      }
      
      const userData = {
        nik: values[i][0],
        bayar: values[i][1],
        status: values[i][2],
        linkSertifikat: values[i][3],
        nama: values[i][4],
        role: values[i][5]
      };
      return outputJSON({status: 'success', message: 'Login berhasil', data: userData});
    }
  }
  return outputJSON({status: 'error', message: 'NIK tidak terdaftar'});
}

function getAllAnggota(sheet) {
  const values = sheet.getDataRange().getValues();
  const data = values.slice(1).map(row => ({
    nik: row[0], bayar: row[1], status: row[2],
    linkSertifikat: row[3], nama: row[4], role: row[5]
  }));
  return outputJSON({status: 'success', data: data});
}

// Helper biar konsisten outputnya
function outputJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
