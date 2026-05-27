const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

// WAJIB ADA BIAR URL /exec NGGAK ERROR
function doGet() {
  return ContentService.createTextOutput('eavibeapps_mediapgmindonesiakbb-V4 API Aktif');
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
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
  // 0=nik, 1=Bayar, 2=Status, 3=Link Sertifikat, 4=nama, 5=role, 6=keterangan, 7=Password

  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik.toString()) {
      const passDiSheet = values[i][7]? values[i][7].toString().trim() : '';

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
        role: values[i][5],
        keterangan: values[i][6]
      };
      return outputJSON({status: 'success', message: 'Login berhasil', data: userData});
    }
  }
  return outputJSON({status: 'error', message: 'NIK tidak terdaftar'});
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
  return outputJSON({status: 'success', data: data});
}

function outputJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
 .setMimeType(ContentService.MimeType.JSON);
}
