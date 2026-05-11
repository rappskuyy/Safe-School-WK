/* ============================================
   SafeSchool - script.js
   Vanilla JavaScript (tanpa framework)
   Penjelasan ditulis dengan komentar singkat
   ============================================ */

// ====== 1. LOADING SCREEN ======
window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => loading.style.display = 'none', 500);
  }, 800);
});

// ====== 2. NAVBAR HAMBURGER (mobile) ======
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
// tutup menu saat klik link
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('active'))
);

// ====== 3. DARK MODE ======
const darkBtn = document.getElementById('darkToggle');
darkBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// ====== 4. SCROLL ANIMATION (Fade In) ======
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.15 });
fadeEls.forEach(el => observer.observe(el));

// ====== 5. BACK TO TOP ======
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
});
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ====== 6. STATISTIK COUNTER ANIMATION ======
const counters = document.querySelectorAll('.counter');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      let count = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        count += step;
        if (count >= target) { count = target; clearInterval(timer); }
        el.textContent = count;
      }, 25);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

// ====== 7. MOOD CHECKER ======
const moodPesan = {
  senang: "Senangnya lihat kamu bahagia! Tetap sebar energi positif 🌈",
  biasa:  "Hari biasa juga berharga. Pelan-pelan saja, kamu hebat 💪",
  sedih:  "Sedih itu wajar. Cerita ke guru BK bisa bantu kamu lega 💜",
  marah:  "Tarik napas dalam... Tenang dulu ya, kamu bisa atasi ini 🌿"
};
document.querySelectorAll('.emoji').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('moodText').textContent = moodPesan[btn.dataset.mood];
  });
});

// ====== 8. POPUP ======
function showPopup(text) {
  document.getElementById('popupText').textContent = text;
  document.getElementById('popup').classList.remove('hidden');
}

// ====== 9. PENYIMPANAN DATA (localStorage) ======
// Data disimpan sementara di browser, lalu bisa di-download CSV
let dataLapor = JSON.parse(localStorage.getItem('dataLapor') || '[]');
let dataBK = JSON.parse(localStorage.getItem('dataBK') || '[]');

function simpan() {
  localStorage.setItem('dataLapor', JSON.stringify(dataLapor));
  localStorage.setItem('dataBK', JSON.stringify(dataBK));
}

// ====== 10. RENDER TABEL ======
function renderTabelLapor() {
  const tbody = document.querySelector('#tabelLapor tbody');
  tbody.innerHTML = dataLapor.map((d, i) =>
    `<tr><td>${i+1}</td><td>${d.nama}</td><td>${d.kelas}</td><td>${d.jenis}</td><td>${d.cerita}</td><td>${d.lokasi}</td><td>${d.tanggal}</td></tr>`
  ).join('');
}
function renderTabelBK() {
  const tbody = document.querySelector('#tabelBK tbody');
  tbody.innerHTML = dataBK.map((d, i) =>
    `<tr><td>${i+1}</td><td>${d.nama}</td><td>${d.kelas}</td><td>${d.masalah}</td><td>${d.jadwal}</td></tr>`
  ).join('');
}
renderTabelLapor(); renderTabelBK();

// ====== 11. FORM LAPOR BULLYING ======
document.getElementById('formLapor').addEventListener('submit', e => {
  e.preventDefault();
  // Validasi sederhana
  const nama = document.getElementById('namaLapor').value.trim() || 'Anonim';
  const kelas = document.getElementById('kelasLapor').value.trim();
  const jenis = document.getElementById('jenisLapor').value;
  const cerita = document.getElementById('ceritaLapor').value.trim();
  const lokasi = document.getElementById('lokasiLapor').value.trim();
  if (!kelas || !jenis || !cerita || !lokasi) {
    alert('Mohon lengkapi semua data wajib.');
    return;
  }
  dataLapor.push({
    nama, kelas, jenis,
    cerita: cerita.replace(/[\n,]/g, ' '),
    lokasi,
    tanggal: new Date().toLocaleString('id-ID')
  });
  simpan(); renderTabelLapor();
  e.target.reset();
  showPopup('Laporan berhasil dikirim ✅');
});

// ====== 12. FORM KONSULTASI BK ======
document.getElementById('formBK').addEventListener('submit', e => {
  e.preventDefault();
  const nama = document.getElementById('namaBK').value.trim();
  const kelas = document.getElementById('kelasBK').value.trim();
  const masalah = document.getElementById('masalahBK').value.trim();
  const jadwal = document.getElementById('jadwalBK').value;
  if (!nama || !kelas || !masalah || !jadwal) {
    alert('Mohon lengkapi semua data.');
    return;
  }
  dataBK.push({
    nama, kelas,
    masalah: masalah.replace(/[\n,]/g, ' '),
    jadwal: new Date(jadwal).toLocaleString('id-ID')
  });
  simpan(); renderTabelBK();
  e.target.reset();
  showPopup('Permintaan konsultasi terkirim ✅');
});

// ====== 13. DOWNLOAD CSV / EXCEL ======
// File .csv otomatis bisa dibuka di Microsoft Excel / Google Sheets
function downloadCSV(filename, headers, rows) {
  if (rows.length === 0) { alert('Belum ada data untuk diunduh.'); return; }
  let csv = headers.join(',') + '\n';
  rows.forEach(r => { csv += headers.map(h => `"${r[h] ?? ''}"`).join(',') + '\n'; });
  // BOM agar huruf Indonesia tidak rusak di Excel
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

document.getElementById('downloadLapor').addEventListener('click', () => {
  downloadCSV('laporan_bullying.csv',
    ['nama','kelas','jenis','cerita','lokasi','tanggal'], dataLapor);
});
document.getElementById('downloadBK').addEventListener('click', () => {
  downloadCSV('konsultasi_bk.csv',
    ['nama','kelas','masalah','jadwal'], dataBK);
});
