const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

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
  btn.textContent = 'Memproses...';
  msg.textContent = '';

  // Pake JSONP trick biar lolos CORS
  const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
  const script = document.createElement('script');

  window[callbackName] = function(result) {
    delete window[callbackName];
    document.body.removeChild(script);

    if (result.status === 'success') {
      document.getElementById('login-page').classList.add('hidden');
      document.getElementById('dashboard-page').classList.remove('hidden');

      const user = result.data;
      document.getElementById('user-name').textContent = user.nama.split(',')[0] + ' 👋';

      const badgeBayar = document.getElementById('status-iuran-badge');
      badgeBayar.textContent = 'Bayar: ' + (user.bayar || 'Belum');
      badgeBayar.className = 'status-badge ' + (user.bayar === 'sudah'? 'lunas' : 'belum');

      document.getElementById('user-status-iuran').textContent = 'Status: ' + (user.status || '-');

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
    btn.textContent = 'Login';
  };

  script.src = API_URL + '?callback=' + callbackName + '&nik=' + encodeURIComponent(nik) + '&password=' + encodeURIComponent(password);
  script.onerror = function() {
    msg.textContent = 'Gagal konek ke server';
    btn.disabled = false;
    btn.textContent = 'Login';
    delete window[callbackName];
    document.body.removeChild(script);
  };

  document.body.appendChild(script);
});

document.getElementById('btn-logout').addEventListener('click', () => {
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('login-form').reset();
  document.getElementById('login-message').textContent = '';
});
