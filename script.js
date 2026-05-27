const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const btnLogout = document.getElementById('btn-logout');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  const savedUser = sessionStorage.getItem('userData');
  if (savedUser) {
    showDashboard(JSON.parse(savedUser));
  } else {
    showPage('login');
  }
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`${page}-page`).classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const nik = document.getElementById('nik').value;
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button');
  const msg = document.getElementById('login-message');

  btn.disabled = true;
  btn.textContent = 'Memproses...';
  msg.textContent = '';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'login', nik, password })
    });
    const result = await res.json();

    if (result.status === 'success') {
      sessionStorage.setItem('userData', JSON.stringify(result.data));
      showDashboard(result.data);
    } else {
      msg.textContent = result.message;
    }
  } catch (err) {
    msg.textContent = 'Koneksi ke server gagal.';
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

function handleLogout() {
  sessionStorage.removeItem('userData');
  showPage('login');
  document.getElementById('login-form').reset();
}

async function showDashboard(user) {
  showPage('dashboard');

  document.getElementById('user-name').textContent = user.nama.split(',')[0].split(' ')[0] + ' 👋';

  // Badge Bayar
  const badgeBayar = document.getElementById('status-iuran-badge');
  if (badgeBayar) {
    badgeBayar.textContent = 'Bayar: ' + user.bayar;
    badgeBayar.className = 'status-badge ' + (user.bayar === 'sudah'? 'lunas' : 'belum');
  }

  // Status Validasi
  document.getElementById('user-status-iuran').textContent = 'Status: ' + user.status;

  // TOMBOL DOWNLOAD SERTIFIKAT
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) {
    if (user.status === 'Valid' && user.linkSertifikat) {
      btnDownload.disabled = false;
      btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> Download Sertifikat';
      btnDownload.onclick = () => window.open(user.linkSertifikat, '_blank');
    } else if (user.status === 'Menunggu') {
      btnDownload.disabled = true;
      btnDownload.innerHTML = '<i class="fa-solid fa-clock"></i> Menunggu Validasi Admin';
    } else {
      btnDownload.disabled = true;
      btnDownload.innerHTML = '<i class="fa-solid fa-ban"></i> Sertifikat Belum Tersedia';
    }
  }

  // Menu admin
  if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    loadAdminData();
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }

  loadDashboardStats();
}

async function loadDashboardStats() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getAllAnggota' })
    });
    const result = await res.json();

    if (result.status === 'success') {
      const data = result.data;
      const totalAnggota = data.length;
      const sudahBayar = data.filter(d => d.bayar === 'sudah').length;
      const sudahValid = data.filter(d => d.status === 'Valid').length;
      const menunggu = data.filter(d => d.status === 'Menunggu').length;

      document.getElementById('stat-total').textContent = totalAnggota;
      document.getElementById('stat-aktif').textContent = sudahValid;
      document.getElementById('stat-iuran').textContent = sudahBayar;
      document.getElementById('stat-download').textContent = menunggu;

      // Ganti label biar sesuai
      document.querySelector('#stat-aktif').nextElementSibling.textContent = 'Tervalidasi';
      document.querySelector('#stat-iuran').nextElementSibling.textContent = 'Sudah Bayar';
      document.querySelector('#stat-download').nextElementSibling.textContent = 'Menunggu';
    }
  } catch (err) {
    console.log('Gagal load statistik:', err);
  }
}

async function loadAdminData() {
  // Nanti diisi kalau mau bikin tabel admin
}
