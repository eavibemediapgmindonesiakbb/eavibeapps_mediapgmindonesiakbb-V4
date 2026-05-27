const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nik = document.getElementById('nik').value.trim();
  const password = document.getElementById('password').value.trim();
  const btn = document.getElementById('login-button');
  const msg = document.getElementById('login-message');

  btn.disabled = true;
  btn.textContent = 'Memproses...';
  msg.textContent = '';

  try {
    // Triknya: pake text/plain biar nggak kena preflight CORS
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'login', nik, password }),
      redirect: 'follow'
    });

    const result = await res.json();

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
      if (user.status === 'Valid' || user.status === 'Aktif' && user.linkSertifikat) {
        btnDownload.disabled = false;
        btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> Download Sertifikat';
        btnDownload.onclick = () => window.open(user.linkSertifikat, '_blank');
      } else {
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-ban"></i> Menunggu Validasi';
      }
    } else {
      msg.textContent = result.message;
    }
  } catch (err) {
    msg.textContent = 'Gagal konek ke server. Coba refresh.';
    console.log(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('login-form').reset();
});
