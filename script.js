// ===================================
// CONFIG
// ===================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

// ===================================
// SPLASH & INIT
// ===================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash')?.classList.add('hidden');
    checkSession();
  }, 1500);
});

// ===================================
// TOGGLE PASSWORD
// ===================================
document.getElementById('toggle-password')?.addEventListener('click', function() {
  const passInput = document.getElementById('password');
  const icon = this.querySelector('i');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
});

// ===================================
// LOGIN
// ===================================
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nik = document.getElementById('nik').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!nik ||!password) {
    showToast('NIK dan Password wajib diisi', 'error');
    return;
  }

  showLoading();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'login', nik, password })
    });

    const result = await res.json();
    hideLoading();

    if (result.status === 'success') {
      localStorage.setItem('pgm_user', JSON.stringify(result.data));
      showToast('Login berhasil!', 'success');
      setTimeout(() => showDashboard(result.data), 500);
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    console.log('Login Error:', err);
    showToast('Gagal terhubung ke server. Cek koneksi', 'error');
  }
});

// ===================================
// CEK SESSION
// ===================================
function checkSession() {
  const user = JSON.parse(localStorage.getItem('pgm_user'));
  if (user && user.nik) {
    showDashboard(user);
  } else {
    showPage('login-page');
  }
}

// ===================================
// SHOW DASHBOARD
// ===================================
async function showDashboard(user) {
  showPage('dashboard');

  // Isi data user
  document.getElementById('user-name').textContent = user.nama.split(',')[0].split(' ')[0] + ' 👋';
  document.getElementById('user-status-iuran').textContent = user.status;

  const badge = document.getElementById('status-iuran-badge');
  if (badge) {
    badge.textContent = user.status;
    badge.className = 'status-badge ' + (user.status === 'LUNAS' || user.status === 'Aktif'? 'lunas' : 'belum');
  }

  // Bedain menu admin vs user
  if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    loadAdminData();
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }

  // Tombol Download Sertifikat/Kartu
  document.getElementById('btn-download')?.addEventListener('click', () => {
    if (user.linkSertifikat) {
      window.open(user.linkSertifikat, '_blank');
    } else {
      showToast('Sertifikat belum tersedia', 'error');
    }
  });

  document.getElementById('btn-kartu')?.addEventListener('click', () => {
    if (user.linkSertifikat) {
      window.open(user.linkSertifikat, '_blank');
    } else {
      showToast('Kartu anggota belum tersedia', 'error');
    }
  });

  // Load statistik
  loadDashboardStats();
}

// ===================================
// LOAD STATISTIK DASHBOARD
// ===================================
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
      const anggotaAktif = data.filter(d => d.status === 'Aktif' || d.status === 'LUNAS').length;
      const iuranTerkumpul = data.reduce((sum, d) => sum + (Number(d.bayar) || 0), 0);

      document.getElementById('stat-total').textContent = totalAnggota;
      document.getElementById('stat-aktif').textContent = anggotaAktif;
      document.getElementById('stat-iuran').textContent = 'Rp ' + iuranTerkumpul.toLocaleString('id-ID');
      document.getElementById('stat-download').textContent = '23';
    }
  } catch (err) {
    console.log('Gagal load statistik:', err);
  }
}

// ===================================
// LOAD DATA ADMIN
// ===================================
async function loadAdminData() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getAllAnggota' })
    });
    const result = await res.json();

    if (result.status === 'success') {
      const tbody = document.querySelector('#tabel-anggota tbody');
      if (!tbody) return;

      tbody.innerHTML = '';
      result.data.slice(-10).reverse().forEach(anggota => {
        tbody.innerHTML += `
          <tr>
            <td>${anggota.nik}</td>
            <td>${anggota.nama}</td>
            <td><span class="badge-${anggota.role}">${anggota.role}</span></td>
            <td>${anggota.status}</td>
          </tr>
        `;
      });
    }
  } catch (err) {
    showToast('Gagal load data admin', 'error');
  }
}

// ===================================
// LOGOUT
// ===================================
document.getElementById('logout')?.addEventListener('click', logout);
document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', logout));

function logout() {
  localStorage.removeItem('pgm_user');
  showToast('Logout berhasil', 'success');
  setTimeout(() => {
    showPage('login-page');
    document.getElementById('login-form')?.reset();
  }, 500);
}

// ===================================
// HELPER FUNCTIONS
// ===================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLoading() {
  document.getElementById('loading')?.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading')?.classList.add('hidden');
}

// ===================================
// NAV BOTTOM - Optional
// ===================================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    if (this.classList.contains('nav-plus')) return;
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    showToast('Fitur segera hadir', 'info');
  });
});
