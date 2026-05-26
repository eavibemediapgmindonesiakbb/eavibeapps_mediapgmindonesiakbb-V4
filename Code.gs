const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'login') return handleLogin(data.nik, data.password, sheet);
  if (action === 'getDashboardData') return getDashboardData(sheet);
  if (action === 'getAllAnggota') return getAllAnggota(sheet);
  
  return jsonResponse('error', 'Action tidak dikenal');
}

function handleLogin(nik, password, sheet) {
  const values = sheet.getDataRange().getValues();
  // A:nik, B:Bayar, C:Status, D:Link Sertifikat, E:nama, F:role, G:keterangan, H:Password
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik) {
      // Ambil password dari kolom H. Kalau kosong, pakai 6 digit NIK
      const passSheet = values[i][7];
      const passDefault = nik.slice(-6);
      const passValid = passSheet? passSheet.toString() : passDefault;
      
      if (password!== passValid) {
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

function getDashboardData(sheet) {
  const values = sheet.getDataRange().getValues();
  const data = values.slice(1);
  
  const totalAnggota = data.length;
  const anggotaAktif = data.filter(row => row[2] === 'Aktif' || row[2] === 'LUNAS').length;
  const iuranTerkumpul = data.reduce((sum, row) => sum + (Number(row[1]) || 0), 0);
  
  return jsonResponse('success', 'Data dashboard', {
    totalAnggota,
    anggotaAktif,
    iuranTerkumpul,
    totalDownload: 23
  });
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
