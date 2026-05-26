// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU
const API_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';

// DOM Elements
const splash = document.getElementById('splash');
const loginPage = document.getElementById('login-page');
const dashboardUser = document.getElementById('dashboard-user');
const dashboardAdmin = document.getElementById('dashboard-admin');
const loginForm = document.getElementById('login-form');
const togglePassword = document.getElementById('toggle-password');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');

// Init App
window.addEventListener('load', () => {
  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.classList.add('hidden');
      checkSession();
    }, 500);
  }, 3000);
});

// Check Session
function checkSession() {
  const session = JSON.parse(localStorage.getItem('pgm_session'));
  if (session && session.status) {
    redirectDashboard(session);
  } else {
    loginPage.classList.remove('hidden');
  }
}

// Toggle Password
togglePassword.addEventListener('click', () => {
  const passInput = document.getElementById('password');
  const icon = togglePassword.querySelector('i');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});

// Login Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nik = document.getElementById('nik').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!nik ||!password) {
    showToast('NIK dan Password wajib diisi', 'error');
    return;
  }

  showLoading(true);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=login&nik=${nik}&password=${password}`
    });
    
    const data = await response.json();
    showLoading(false);
    
    if (data.status) {
      localStorage.setItem('pgm_session', JSON.stringify(data));
      showToast('Login berhasil!', 'success');
      setTimeout(() => redirectDashboard(data), 500);
    } else {
      showToast(data.message || 'Login gagal', 'error');
    }
  } catch (error) {
    showLoading(false);
    showToast('Koneksi error. Coba lagi.', 'error');
    console.error(error);
  }
});

// Redirect Dashboard
function redirectDashboard(data) {
  loginPage.classList.add('hidden');
  if (data.role === 'admin') {
    dashboardAdmin.classList.remove('hidden');
    loadAdminData();
  } else {
    dashboardUser.classList.remove('hidden');
    loadUserData(data);
  }
}

// Load User Data
function loadUserData(data) {
  document.getElementById('user-name').textContent = data.nama + ' 👋';
  document.getElementById('profile-nama').textContent = data.nama;
  document.getElementById('profile-nik').textContent = data.nik;
  document.getElementById('profile-status').textContent = data.status_anggota || 'Aktif';
}

// Load Admin Data
async function loadAdminData() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=getAllAnggota`);
    const data = await response.json();
    showLoading(false);
    
    if (data.status) {
      document.getElementById('total-anggota').textContent = data.total;
      document.getElementById('anggota-aktif').textContent = data.aktif;
      
      const tbody = document.querySelector('#tabel-anggota tbody');
      tbody.innerHTML = '';
      data.anggota.slice(0, 5).forEach(row => {
        tbody.innerHTML += `
          <tr>
            <td>${row.nik}</td>
            <td>${row.nama}</td>
            <td>${row.role}</td>
            <td><span class="badge-active">${row.status}</span></td>
          </tr>
        `;
      });
    }
  } catch (error) {
    showLoading(false);
    showToast('Gagal load data', 'error');
  }
}

// Logout
document.querySelectorAll('.logout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    localStorage.removeItem('pgm_session');
    dashboardUser.classList.add('hidden');
    dashboardAdmin.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.reset();
    showToast('Logout berhasil', 'success');
  });
});

// Toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Loading
function showLoading(show) {
  loading.classList.toggle('hidden',!show);
}

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
// Auto update service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.update());
  });
}