const API_URL = 'GANTI_DENGAN_URL_APPS_SCRIPT_KAMU';

// Splash
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    checkSession();
  }, 1500);
});

// Toggle Password
document.getElementById('toggle-password')?.addEventListener('click', function() {
  const passInput = document.getElementById('password');
  const icon = this.querySelector('i');
  passInput.type = passInput.type === 'password'? 'text' : 'password';
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
});

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  const nik = document.getElementById('nik').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({action: 'login', nik, password})
    });
    const result = await res.json();
    hideLoading();
    
    if(result.status === 'success') {
      localStorage.setItem('pgm_user', JSON.stringify(result.data));
      showToast('Login berhasil!', 'success');
      setTimeout(() => showDashboard(result.data), 500);
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    showToast('Gagal terhubung ke server', 'error');
  }
});

function checkSession() {
  const user = JSON.parse(localStorage.getItem('pgm_user'));
  if(user) showDashboard(user);
  else showPage('login-page');
}

async function showDashboard(user) {
  showPage('dashboard');
  
  // Isi data user
  document.getElementById('user-name').textContent = user.nama.split(',')[0] + ' 👋';
  document.getElementById('user-status-iuran').textContent = user.status + ' ✅';
  
  // Bedakan menu admin vs user
  if(user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
  }
  
  // Tombol Download Sertifikat
  document.getElementById('btn-download').onclick = () => {
    if(user.linkSertifikat) window.open(user.linkSertifikat, '_blank');
    else showToast('Sertifikat belum tersedia', 'error');
  };
  
  document.getElementById('btn-kartu').onclick = () => showToast('Fitur kartu anggota segera hadir', 'info');
  
  // Load data statistik dari sheet
  loadDashboardStats();
}

async function loadDashboardStats() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({action: 'getDashboardData'})
    });
    const result = await res.json();
    if(result.status === 'success') {
      const d = result.data;
      document.getElementById('stat-total').textContent = d.totalAnggota;
      document.getElementById('stat-aktif').textContent = d.anggotaAktif;
      document.getElementById('stat-iuran').textContent = 'Rp ' + d.iuranTerkumpul.toLocaleString('id-ID');
      document.getElementById('stat-download').textContent = d.totalDownload;
    }
  } catch (err) { console.log('Gagal load statistik'); }
}

// Logout
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('pgm_user');
  showToast('Logout berhasil', 'success');
  setTimeout(() => showPage('login-page'), 500);
});

// Helper
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }
