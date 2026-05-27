const API_URL = 'https://script.google.com/macros/s/AKfycbzA2FKI1fAKfAo7-03ejcTIUu6Ht3QzHRsuy-ijmr0XEhb8z6D6bAPxydVQ0uIZIkJ4JA/exec';

document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const nik = document.getElementById('nik').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-button');
  const msg = document.getElementById('login-message');

  btn.textContent = 'Loading...';
  msg.textContent = '';

  // Pake mode no-cors biar nggak nyangkut
  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({ action: 'login', nik: nik, password: password })
  }).then(() => {
    // Karena no-cors nggak bisa baca response, kita fetch lagi pake GET
    return fetch(API_URL + '?nik=' + nik + '&password=' + password);
  }).then(res => res.json())
 .then(result => {
    if (result.status === 'success') {
      document.getElementById('login-page').classList.add('hidden');
      document.getElementById('dashboard-page').classList.remove('hidden');
      document.getElementById('user-name').textContent = result.data.nama + ' 👋';
    } else {
      msg.textContent = result.message || 'NIK atau password salah';
    }
  }).catch(err => {
    msg.textContent = 'Gagal konek ke server';
  }).finally(() => {
    btn.textContent = 'Login';
  });
});

document.getElementById('btn-logout').addEventListener('click', () => {
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('login-form').reset();
});
