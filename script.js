const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

// Splash screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
  }, 2000);
});

// Toggle password
document.getElementById('toggle-password').addEventListener('click', function() {
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

// Login
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const nik = document.getElementById('nik').value.trim();
  const password = document.getElementById('password').value.trim();
  const btn = document.getElementById('login-button');
  const msg = document.getElementById('login-message');

  if (!nik ||!password) {
    msg.textContent = 'NIK dan password wajib diisi';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
  msg.textContent = '';

  const callbackName = 'cb_' + Date.now();
  const script = document.createElement('script');

  window[callbackName] = function(result) {
    delete window[callbackName];
    document.body.removeChild(script);

    if (result.status === 'success') {
      document.getElementById('login-page').classList.add('hidden');
      document.getElementById('dashboard-user').classList.remove('hidden');

      const user = result.data;
      document.getElementById('user-name').textContent = user.nama.split(',')[0] + ' 👋';
      document.getElementById('profile-nama').textContent = user.nama;
      document.getElementById('profile-nik').textContent = nik;
      document.getElementById('profile-status').textContent = user.status || 'Aktif';
      document.getElementById('profile-bayar').textContent = user.bayar || 'Belum';

      const btnDownload = document.getElementById('btn-download');
      if ((user.status === 'Valid' || user.status === 'Aktif') && user.linkSertifikat) {
        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> Download Sertifikat';
        btnDownload.onclick = () => window.open(user.linkSertifikat, '_blank');
      } else {
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-ban"></i> Menunggu Validasi';
      }
    } else {
      msg.textContent = result.message || 'NIK atau password salah';
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk';
  };

  script.onerror = function() {
    msg.textContent = 'Gagal konek ke server';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk';
    delete window[callbackName];
    document.body.removeChild(script);
  };

  script.src = API_URL + '?callback=' + callbackName + '&nik=' + encodeURIComponent(nik) + '&password=' + encodeURIComponent(password);
  document.body.appendChild(script);
});

// Logout
document.querySelectorAll('.logout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('dashboard-user').classList.add('hidden');
    document.getElementById('dashboard-admin').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('login-message').textContent = '';
  });
});
