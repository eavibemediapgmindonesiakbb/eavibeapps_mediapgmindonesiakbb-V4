const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'login') return handleLogin(data.nik, data.password, sheet);
    if (data.action === 'getAllAnggota') return getAllAnggota(sheet);
    
    return jsonResponse('error', 'Action tidak dikenal');
  } catch(err) {
    return jsonResponse('error', 'Server error: ' + err.message);
  }
}

function handleLogin(nik, password, sheet) {
  const values = sheet.getDataRange().getValues();
  // 0=nik, 1=Bayar, 2=Status, 3=Link Sertifikat, 4=nama, 5=role, 6=keterangan, 7=Password
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik) {
      const passDiSheet = values[i][7].toString();
      
      if (password!== passDiSheet) {
        return jsonResponse('error', 'Password salah');
      }
      
      if(values[i][2]!== 'Aktif' && values[i][2]!== 'LUNAS') {
        return jsonResponse('error', 'Akun belum aktif');
      }
      
      const userData = {
        nik: values[i][0],
        bayar: values[i][1],
        status: values[i][2],
        linkSertifikat: values[i][3],
        nama: values[i][4],
        role: values[i][5],
        keterangan: values[i][6]
      };
      return jsonResponse('success', 'Login berhasil', userData);
    }
  }
  return jsonResponse('error', 'NIK tidak terdaftar');
}

function getAllAnggota(sheet) {
  const values = sheet.getDataRange().getValues();
  const data = values.slice(1).map(row => ({
    nik: row[0],
    bayar: row[1],
    status: row[2],
    linkSertifikat: row[3],
    nama: row[4],
    role: row[5]
  }));
  return jsonResponse('success', 'Data anggota', data);
}

function jsonResponse(status, message, data = null) {
  const res = {status, message};
  if(data) res.data = data;
  return ContentService.createTextOutput(JSON.stringify(res))
   .setMimeType(ContentService.MimeType.JSON);
}

// PENTING: Tambahin ini buat test GET
function doGet() {
  return ContentService.createTextOutput('API PGM Aktif');
}
