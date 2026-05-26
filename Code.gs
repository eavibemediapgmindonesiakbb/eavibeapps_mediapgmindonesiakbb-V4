const SHEET_ID = '1ECSoiHywcQ5RNauOxQFSX4yGuBivh2xLPMSpARDCkKw';
const SHEET_NAME = 'data sertifikat';

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'login') return handleLogin(data.nik, data.password, sheet);
  if (data.action === 'getDashboardData') return getDashboardData(sheet);
  
  return jsonResponse('error', 'Action tidak dikenal');
}

function handleLogin(nik, password, sheet) {
  const values = sheet.getDataRange().getValues();
  // Kolom: 0=nik, 1=Bayar, 2=Status, 3=Link Sertifikat, 4=nama, 5=role, 6=keterangan, 7=Password
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() === nik) {
      // Ambil password: kalau kolom H kosong, pakai 6 digit terakhir NIK
      const passSheet = values[i][7];
      const passDefault = nik.slice(-6);
      const passValid = passSheet? passSheet.toString() : passDefault;
      
      if (password!== passValid) {
        return jsonResponse('error', 'Password salah');
      }
      
      if(values[i][2]!== 'Aktif' && values[i][2]!== 'LUNAS') {
        return jsonResponse('error', 'Akun belum aktif / belum bayar iuran');
      }
      
      const userData = {
        nik: values[i][0],
        nama: values[i][4],
        role: values[i][5],
        status: values[i][2],
        bayar: values[i][1],
        linkSertifikat: values[i][3],
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
    totalDownload: 23 // ini bisa diisi dari data lain nanti
  });
}

function jsonResponse(status, message, data = null) {
  const res = {status, message};
  if(data) res.data = data;
  return ContentService.createTextOutput(JSON.stringify(res))
 .setMimeType(ContentService.MimeType.JSON);
}
/* ===================================
   DASHBOARD PGM - TIDAK BENTROK LOGIN
   =================================== */

/* HEADER DASHBOARD */
.dash-header {
  background: #059669;
  color: #fff;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.dash-title { display: flex; align-items: center; gap: 10px; }
.dash-title.logo-sm { width: 38px; height: 38px; }
.dash-title h3 { font-size: 16px; font-weight: 600; margin: 0; line-height: 1.2; }
.dash-title p { font-size: 11px; margin: 0; opacity: 0.9; }
.dash-profile { display: flex; align-items: center; gap: 14px; }
.dash-profile.fa-bell { font-size: 20px; position: relative; cursor: pointer; }
.notif-badge {
  position: absolute; top: -6px; right: -8px;
  background: #ef4444; color: white; font-size: 10px;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; }

/* CONTENT DASHBOARD */
.dash-content {
  padding: 16px;
  background: #f9fafb;
  min-height: calc(100vh - 60px);
  padding-bottom: 80px;
}

/* WELCOME CARD - HIJAU MUDA KAYAK GAMBAR */
.welcome-card {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.welcome-text p { color: #065f46; font-size: 14px; margin: 0; }
.welcome-text h2 { font-size: 26px; color: #064e3b; margin: 4px 0 6px; font-weight: 700; }
.welcome-sub { font-size: 13px!important; color: #047857!important; margin-bottom: 12px!important; }
.quote-box {
  background: rgba(255,255,255,0.6);
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #059669;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.quote-box i { color: #059669; font-size: 14px; margin-top: 2px; }
.quote-box p { font-size: 12px!important; color: #064e3b!important; margin: 0!important; font-style: italic; }
.masjid-illus { position: absolute; right: -15px; bottom: -10px; width: 140px; opacity: 0.5; }

/* STATS 4 KOTAK - KAYAK GAMBAR */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 8px;
  font-size: 20px;
}
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.yellow { background: #fef3c7; color: #d97706; }
.stat-icon.purple { background: #ede9fe; color: #7c3aed; }
.stat-card p { font-size: 12px; color: #6b7280; margin: 0 0 4px; }
.stat-card h3 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.stat-card span { font-size: 11px; color: #9ca3af; display: block; margin-top: 2px; }
.stat-card small { font-size: 10px; color: #9ca3af; }

/* MENU GRID 5 ICON */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.menu-item {
  background: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.menu-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.menu-item i { font-size: 22px; color: #059669; }
.menu-item span { font-size: 10px; color: #374151; font-weight: 500; text-align: center; line-height: 1.2; }
.admin-only.hidden { display: none!important; }

/* PENGUMUMAN */
.card-section {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h4 { font-size: 15px; margin: 0; display: flex; align-items: center; gap: 8px; }
.section-header h4 i { color: #059669; }
.section-header a { font-size: 13px; color: #059669; text-decoration: none; font-weight: 600; }
.pengumuman-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}
.pengumuman-item:last-child { border-bottom: none; }
.pg-line { width: 3px; background: #059669; border-radius: 3px; }
.pengumuman-item h5 { font-size: 14px; margin: 0 0 4px; color: #111827; }
.pengumuman-item p { font-size: 12px; color: #6b7280; margin: 0; }
.pg-date { position: absolute; top: 12px; right: 0; font-size: 11px; color: #9ca3af; }

/* STATUS IURAN & KARTU */
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.status-iuran,.kartu-anggota { padding: 14px!important; }
.si-icon,.ka-icon {
  width: 40px; height: 40px;
  background: #d1fae5; color: #059669;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-size: 18px; margin-bottom: 10px;
}
.status-iuran p,.kartu-anggota p { font-size: 12px; color: #6b7280; margin: 0 0 4px; }
.status-iuran h4,.kartu-anggota h4 { font-size: 16px; margin: 0 0 6px; }
.iuran-status { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.status-badge.lunas { background: #d1fae5; color: #065f46; }
.status-badge.belum { background: #fee2e2; color: #991b1b; }
.iuran-detail p { font-size: 11px!important; margin: 0!important; }
.iuran-detail strong { font-size: 13px; color: #111827; }
.si-divider { width: 1px; height: 40px; background: #e5e7eb; }
.btn-yellow {
  width: 100%; background: #fbbf24; color: #78350f; border: none;
  padding: 10px; border-radius: 8px; font-weight: 600; font-size: 13px;
  cursor: pointer; margin-top: 8px;
}

/* DONASI CARD */
.donasi-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.donasi-icon {
  width: 48px; height: 48px;
  background: #f59e0b; color: white;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.donasi-card h4 { font-size: 14px; margin: 0 0 4px; color: #78350f; }
.donasi-card p { font-size: 12px; color: #92400e; margin: 0; }
.btn-donasi {
  background: #f59e0b; color: white; border: none;
  padding: 10px 16px; border-radius: 8px; font-weight: 600;
  font-size: 13px; cursor: pointer; white-space: nowrap; margin-left: auto;
}

/* LOGOUT & NAV BAWAH */
.logout-btn {
  width: 100%; background: #fee2e2; color: #dc2626; border: none;
  padding: 14px; border-radius: 10px; font-weight: 600; font-size: 15px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; border-top: 1px solid #e5e7eb;
  display: grid; grid-template-columns: repeat(5, 1fr);
  padding: 8px 0 12px; z-index: 40;
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-decoration: none; color: #9ca3af; font-size: 11px; position: relative;
}
.nav-item i { font-size: 20px; }
.nav-item.active { color: #059669; }
.nav-plus { margin-top: -20px; }
.nav-plus i {
  background: #059669; color: white; width: 48px; height: 48px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 24px; box-shadow: 0 4px 12px rgba(5,150,105,0.4);
}
.nav-badge {
  position: absolute; top: -2px; right: 18px;
  background: #ef4444; color: white; font-size: 9px;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}

/* BADGE TABLE ADMIN */
.badge-admin { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.badge-user { background: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

/* TOAST & LOADING */
.toast {
  position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
  background: #1f2937; color: white; padding: 12px 20px;
  border-radius: 10px; font-size: 14px; z-index: 999;
  opacity: 0; transition: 0.3s; pointer-events: none;
}
.toast.show { opacity: 1; }
.toast.success { background: #059669; }
.toast.error { background: #dc2626; }
.loading-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center; z-index: 998;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #fff;
  border-top: 4px solid #059669; border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
